import { firestoreConfigured, getOrCreateWallet, reserveCredits, finalizeReservation, getBudgetCounters, addBudgetUsage, grantCredits, getProfileLimits, setProfileLimit } from "./worker-firestore.js";

const FIREBASE_PROJECT_ID = "viajes-db538";

const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const MAX_BODY_CHARS = 12 * 1024 * 1024;
const MAX_IMAGE_B64 = 7 * 1024 * 1024;
const MAX_PDF_B64 = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [ "image/jpeg", "image/png", "image/webp", "image/gif" ];
const MAX_CHAT_MESSAGES = 30;
const MAX_CHAT_CONTENT = 8000;
const MAX_CHAT_SYSTEM = 6000;

const AI_TYPES = [ "invoice_ocr", "insurance_analysis", "moderate_image", "optimize_route", "taxie_chat", "compare_shopping" ];

const AI_FEATURES = {
  invoice_ocr: { credits: 1 },
  insurance_analysis: { credits: 2 },
  moderate_image: { credits: 1 },
  optimize_route: { credits: 3 },
  taxie_chat: { credits: 1 },
  compare_shopping: { credits: 2 }
};

const MODEL_PRICING_USD_PER_M = {
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cacheRead: 0.10, cacheWrite: 1.25 },
  "claude-sonnet-5": { input: 2, output: 10, cacheRead: 0.20, cacheWrite: 2.50 }
};
const WEB_SEARCH_USD_PER_REQUEST = 0.01;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = isAllowedOrigin(origin, env);
    if (request.method === "OPTIONS") {
      if (!allowed) return new Response(null, {
        status: 403
      });
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }
    if (origin && !allowed) return json({
      error: "Origin not allowed"
    }, 403);
    const res = await handle(request, env);
    if (allowed) {
      const h = new Headers(res.headers);
      for (const [k, v] of Object.entries(corsHeaders(origin))) h.set(k, v);
      return new Response(res.body, {
        status: res.status,
        headers: h
      });
    }
    return res;
  }
};

async function handle(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try {
    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > MAX_BODY_CHARS) return json({ error: "Payload too large" }, 413);
    const raw = await request.text();
    if (raw.length > MAX_BODY_CHARS) return json({ error: "Payload too large" }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch (e) {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  let user = null;
  if (token) {
    try { user = await verifyFirebaseToken(token); } catch (e) {
      if (AI_TYPES.includes(body.type) || ["ai_status", "ai_grant_credits", "ai_profile_limits_get", "ai_profile_limit_set"].includes(body.type)) return json({ error: "Invalid or expired session" }, 401);
    }
  }

  if (body.type === "ai_status") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIStatus(env, user);
  }
  if (body.type === "ai_grant_credits") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIGrant(body, env, user);
  }

  if (body.type === "ai_profile_limits_get") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIProfileLimitsGet(body, env, user);
  }
  if (body.type === "ai_profile_limit_set") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIProfileLimitSet(body, env, user);
  }

  const isCostRoute = AI_TYPES.includes(body.type);
  if (isCostRoute) {
    if (!user) return json({ error: "Login required" }, 401);
    if (env.COST_LIMITER) {
      const { success } = await env.COST_LIMITER.limit({ key: `uid:${user.uid}` });
      if (!success) return json({ error: "Too many requests, try again in a bit" }, 429);
    }
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) return json({ error: "Anthropic API key not configured" }, 500);

    const feature = body.type;
    const requestId = normalizeRequestId(body.request_id) || crypto.randomUUID();
    const isOwner = !!env.OWNER_UID && user.uid === env.OWNER_UID;
    const credits = Number(AI_FEATURES[feature]?.credits || 1);
    const billingEnabled = env.AI_BILLING_ENABLED === "true";
    const fsReady = firestoreConfigured(env);
    const profileId = normalizeProfileId(body.profile_id);
    const ctx = { env, user, feature, requestId, isOwner, credits, billingEnabled, fsReady, profileId, costUsd: 0, usage: null };

    const safety = await checkSafetyBudgets(ctx);
    if (safety) return safety;

    let reserved = false;
    if (billingEnabled) {
      if (!fsReady) return json({ error: "AI billing is enabled but Firestore service credentials are missing" }, 503);
      try {
        const result = await reserveCredits(env, user, feature, credits, requestId, starterCredits(env), profileId, { skipWallet: isOwner });
        if (result.reused && result.reservation?.state === "captured") return json({ error: "This AI request was already processed", code: "REQUEST_ALREADY_CAPTURED", request_id: requestId }, 409);
        if (result.reused && result.reservation?.state === "released") return json({ error: "This AI request id was already released; retry with a new request id", code: "REQUEST_ALREADY_RELEASED", request_id: requestId }, 409);
        reserved = !!result.reservation;
      } catch (e) {
        if (e.code === "EMAIL_VERIFICATION_REQUIRED") return json({ error: "Verify your email before using free AI credits", code: e.code }, 403);
        if (e.code === "AI_CREDITS_REQUIRED") return json({ error: "AI credits required", code: e.code, balance: e.balance, required: e.required }, 402);
        if (e.code === "PROFILE_AI_BLOCKED") return json({ error: "AI is disabled for this profile", code: e.code, profile_id: e.profileId }, 403);
        if (e.code === "PROFILE_AI_LIMIT_REACHED") return json({ error: "This profile reached its AI credit limit", code: e.code, profile_id: e.profileId, used: e.used, reserved: e.reserved, limit: e.limit, required: e.required }, 402);
        if (e.code === "PROFILE_NOT_FOUND") return json({ error: "Unknown profile", code: e.code }, 400);
        if (e.code === "REQUEST_ID_CONFLICT") return json({ error: "request_id conflict", code: e.code }, 409);
        console.error("reserveCredits failed", e);
        return json({ error: "Could not reserve AI credits" }, 503);
      }
    }

    let response;
    try {
      if (feature === "invoice_ocr") response = await handleInvoice(body, apiKey, ctx);
      else if (feature === "insurance_analysis") response = await handleInsurance(body, apiKey, ctx);
      else if (feature === "moderate_image") response = await handleModerate(body, apiKey, ctx);
      else if (feature === "optimize_route") response = await handleAIChat(body, apiKey, "claude-sonnet-5", 800, .2, ctx);
      else if (feature === "compare_shopping") response = await handleCompareShopping(body, apiKey, ctx);
      else response = await handleAIChat(body, apiKey, "claude-haiku-4-5-20251001", 800, .7, ctx);
    } catch (e) {
      console.error("AI route failed", e);
      response = json({ error: "AI request failed" }, 502);
    }

    if (reserved) {
      try { await finalizeReservation(env, user, requestId, response.ok, ctx.costUsd, ctx.usage); }
      catch (e) { console.error("finalizeReservation failed", e); }
    }
    const headers = new Headers(response.headers);
    headers.set("X-TaxFly-AI-Request-Id", requestId);
    headers.set("X-TaxFly-AI-Credits", isOwner ? "unlimited" : String(credits));
    return new Response(response.body, { status: response.status, headers });
  }

  if (env.GENERAL_LIMITER) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const { success } = await env.GENERAL_LIMITER.limit({ key: `${ip}:${body.type}` });
    if (!success) return json({ error: "Too many requests, try again in a bit" }, 429);
  }
  if (body.type === "verify_recaptcha") return handleRecaptcha(body, env);
  return json({ error: 'Unknown or missing "type"' }, 400);
}

function normalizeRequestId(value) {
  if (typeof value !== "string") return "";
  const v = value.trim();
  return /^[A-Za-z0-9_-]{12,180}$/.test(v) ? v : "";
}
function normalizeProfileId(value) {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (!s || s.length > 180 || !/^[A-Za-z0-9_-]+$/.test(s)) return null;
  return s;
}

function starterCredits(env) {
  const n = Number(env.AI_STARTER_CREDITS || 10);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
}
function dayKeyUTC() { return new Date().toISOString().slice(0, 10).replace(/-/g, ""); }
function weekKeyUTC() {
  const d = new Date();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((t - y0) / 86400000) + 1) / 7);
  return `${t.getUTCFullYear()}W${String(week).padStart(2, "0")}`;
}
function positiveLimit(env, key) {
  const n = Number(env[key]);
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}
async function checkSafetyBudgets(ctx) {
  if (!ctx.fsReady || ctx.env.AI_SAFETY_BUDGETS_ENABLED !== "true") return null;
  try {
    const counters = await getBudgetCounters(ctx.env, ctx.user.uid, dayKeyUTC(), weekKeyUTC());
    const globalLimit = positiveLimit(ctx.env, "GLOBAL_DAILY_USD_LIMIT");
    if (counters.globalDaily >= globalLimit) return json({ error: "AI safety budget reached for today", code: "GLOBAL_AI_BUDGET_REACHED" }, 503);
    if (ctx.isOwner) {
      if (counters.ownerDaily >= positiveLimit(ctx.env, "OWNER_DAILY_USD_LIMIT")) return json({ error: "Owner AI daily safety limit reached", code: "OWNER_DAILY_AI_LIMIT" }, 429);
      if (counters.ownerWeekly >= positiveLimit(ctx.env, "OWNER_WEEKLY_USD_LIMIT")) return json({ error: "Owner AI weekly safety limit reached", code: "OWNER_WEEKLY_AI_LIMIT" }, 429);
    }
  } catch (e) {
    console.error("budget precheck failed", e);
    if (ctx.env.AI_SAFETY_FAIL_CLOSED === "true") return json({ error: "AI safety budget check unavailable", code: "AI_SAFETY_UNAVAILABLE" }, 503);
  }
  return null;
}
async function recordBudgetUsage(ctx, costUsd) {
  if (!ctx.fsReady || ctx.env.AI_SAFETY_BUDGETS_ENABLED !== "true" || !(costUsd > 0)) return;
  try { await addBudgetUsage(ctx.env, ctx.user.uid, costUsd, dayKeyUTC(), weekKeyUTC(), ctx.isOwner); }
  catch (e) { console.error("budget usage write failed", e); }
}
async function handleAIStatus(env, user) {
  const isOwner = !!env.OWNER_UID && user.uid === env.OWNER_UID;
  const base = { owner: isOwner, unlimited: isOwner, billingEnabled: env.AI_BILLING_ENABLED === "true", emailVerified: !!user.emailVerified, starterCredits: starterCredits(env), features: Object.fromEntries(Object.entries(AI_FEATURES).map(([k, v]) => [k, { credits: v.credits }])) };
  if (isOwner) return json({ ...base, availableCredits: null, reservedCredits: 0 });
  if (!firestoreConfigured(env)) return json({ ...base, availableCredits: null, reservedCredits: 0, firestoreConfigured: false });
  try {
    const wallet = await getOrCreateWallet(env, user, starterCredits(env));
    return json({ ...base, availableCredits: Number(wallet.availableCredits || 0), reservedCredits: Number(wallet.reservedCredits || 0), firestoreConfigured: true });
  } catch (e) {
    console.error("AI status wallet failed", e);
    return json({ ...base, availableCredits: null, reservedCredits: 0, firestoreConfigured: true, walletError: true }, 503);
  }
}
async function handleAIGrant(body, env, user) {
  if (!env.OWNER_UID || user.uid !== env.OWNER_UID) return json({ error: "Owner only" }, 403);
  if (!firestoreConfigured(env)) return json({ error: "Firestore service account not configured" }, 503);
  const targetUid = typeof body.uid === "string" ? body.uid.trim() : "";
  const credits = Number(body.credits);
  if (!targetUid || !Number.isInteger(credits) || credits <= 0 || credits > 100000) return json({ error: "Invalid uid or credits" }, 400);
  try {
    const wallet = await grantCredits(env, targetUid, credits, user.uid, typeof body.reason === "string" ? body.reason.slice(0, 100) : "owner_grant");
    return json({ success: true, uid: targetUid, availableCredits: wallet.availableCredits });
  } catch (e) {
    console.error("grant credits failed", e);
    return json({ error: "Could not grant credits" }, 503);
  }
}

async function handleAIProfileLimitsGet(body, env, user) {
  if (!firestoreConfigured(env)) return json({ error: "Firestore service account not configured" }, 503);
  const ids = Array.isArray(body.profile_ids) ? body.profile_ids.map(normalizeProfileId).filter(Boolean).slice(0, 50) : [];
  try {
    const limits = await getProfileLimits(env, user.uid, ids);
    return json({ limits });
  } catch (e) {
    console.error("profile limits get failed", e);
    return json({ error: "Could not read profile AI limits" }, 503);
  }
}

async function handleAIProfileLimitSet(body, env, user) {
  if (!firestoreConfigured(env)) return json({ error: "Firestore service account not configured" }, 503);
  const profileId = normalizeProfileId(body.profile_id);
  const mode = typeof body.mode === "string" ? body.mode.trim() : "";
  const resetUsed = body.reset_used === true;
  if (!profileId || !["unlimited", "limited", "blocked"].includes(mode)) return json({ error: "Invalid profile limit" }, 400);
  try {
    const limit = await setProfileLimit(env, user.uid, profileId, mode, body.limit_credits, resetUsed);
    return json({ success: true, limit });
  } catch (e) {
    if (e.code === "PROFILE_NOT_FOUND") return json({ error: "Unknown profile", code: e.code }, 404);
    if (e.code === "INVALID_PROFILE_LIMIT") return json({ error: "Invalid profile limit", code: e.code }, 400);
    console.error("profile limit set failed", e);
    return json({ error: "Could not save profile AI limit" }, 503);
  }
}


function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  const list = String(env.ALLOWED_ORIGINS || "https://taxfly.github.io").split(",").map(s => s.trim()).filter(Boolean);
  if (list.includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

let _jwks = null;

async function getGoogleKeys() {
  if (_jwks && _jwks.exp > Date.now()) return _jwks.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("Could not fetch Google keys");
  const data = await res.json();
  const maxAge = Number((res.headers.get("Cache-Control") || "").match(/max-age=(\d+)/)?.[1] || 3600);
  const keys = new Map;
  for (const jwk of data.keys || []) {
    const key = await crypto.subtle.importKey("jwk", jwk, {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    }, false, [ "verify" ]);
    keys.set(jwk.kid, key);
  }
  _jwks = {
    keys: keys,
    exp: Date.now() + maxAge * 1e3
  };
  return keys;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyFirebaseToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const dec = new TextDecoder;
  const header = JSON.parse(dec.decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(dec.decode(b64urlToBytes(parts[1])));
  if (header.alg !== "RS256") throw new Error("bad alg");
  let keys = await getGoogleKeys();
  let key = keys.get(header.kid);
  if (!key) {
    _jwks = null;
    keys = await getGoogleKeys();
    key = keys.get(header.kid);
  }
  if (!key) throw new Error("unknown kid");
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlToBytes(parts[2]), (new TextEncoder).encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  const now = Math.floor(Date.now() / 1e3);
  const skew = 60;
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("bad aud");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error("bad iss");
  if (!payload.sub || typeof payload.sub !== "string") throw new Error("no sub");
  if (typeof payload.exp !== "number" || payload.exp < now - skew) throw new Error("expired");
  if (typeof payload.iat !== "number" || payload.iat > now + skew) throw new Error("iat in future");
  if (typeof payload.auth_time !== "number" || payload.auth_time > now + skew) throw new Error("bad auth_time");
  return {
    uid: payload.sub,
    email: payload.email || null,
    emailVerified: payload.email_verified === true,
    claims: payload
  };
}

async function handleAIChat(body, apiKey, model, defaultMaxTokens, defaultTemperature, ctx) {
  const {messages: messages} = body;
  if (!Array.isArray(messages) || !messages.length) {
    return json({
      error: "Missing required field: messages"
    }, 400);
  }
  if (messages.length > MAX_CHAT_MESSAGES) return json({
    error: "Too many messages"
  }, 400);
  let system;
  const chatMessages = [];
  for (const m of messages) {
    if (!m || typeof m.content !== "string") continue;
    const content = m.content.slice(0, MAX_CHAT_CONTENT);
    if (m.role === "system") system = system ? `${system}\n\n${content}` : content; else chatMessages.push({
      role: m.role === "assistant" ? "assistant" : "user",
      content: content
    });
  }
  if (system) system = system.slice(0, MAX_CHAT_SYSTEM);
  if (!chatMessages.length) return json({
    error: "No user/assistant messages provided"
  }, 400);
  const maxTokens = Math.min(Number(body.max_tokens) || defaultMaxTokens, 1500);
  const temperature = typeof body.temperature === "number" && isFinite(body.temperature) ? Math.min(Math.max(body.temperature, 0), 1) : defaultTemperature;
  const claudeRes = await callClaude(apiKey, {
    model: model,
    max_tokens: maxTokens,
    ...temperature !== undefined ? {
      temperature: temperature
    } : {},
    ...system ? {
      system: system
    } : {},
    messages: chatMessages
  }, ctx);
  if (claudeRes.error) return json({
    error: "Upstream API error",
    detail: claudeRes.error
  }, 502);
  return json({
    choices: [ {
      message: {
        role: "assistant",
        content: claudeRes.text
      }
    } ]
  });
}

const DEFAULT_COMP_STORE_LIST = "Amazon (Generalista), Walmart (Generalista), Target (Generalista), Costco (Mayorista), eBay (Marketplace), Best Buy (Electrónica), B&H Photo (Foto / Video), Adorama (Foto / Video), Apple Store (Apple oficial), Newegg (PC / Gaming), Micro Center (PC / Hardware), Nike (Deportivo), Adidas (Deportivo), Nordstrom (Premium), Macy's (Grandes tiendas), Zappos (Calzado), TJ Maxx (Outlet/Descuento), Gap (Ropa casual), Sephora (Cosmética), Ulta Beauty (Cosmética), REI (Outdoor), Home Depot (Hogar / Herram.), IKEA (Muebles / Hogar), GameStop (Videojuegos)";

async function handleCompareShopping(body, apiKey, ctx) {
  const {product: product, storeList: storeList} = body;
  if (!product || typeof product !== "string" || !product.trim()) {
    return json({
      error: "Missing required field: product"
    }, 400);
  }
  const safeProduct = product.trim().slice(0, 200);
  const safeStoreList = typeof storeList === "string" && storeList.trim() ? storeList.trim().slice(0, 1500) : DEFAULT_COMP_STORE_LIST;
  const systemPrompt = `Sos un asistente de compras que ayuda a turistas argentinos que están de viaje en Estados Unidos. Conocés estas tiendas disponibles para comprar: ${safeStoreList}. Tenés acceso a búsqueda web: usala siempre para chequear precios, ofertas y disponibilidad ACTUALES antes de responder, no te bases solo en lo que ya sabías de antes. Tu tono es directo, concreto y útil, en español. Usás viñetas y negritas solo si ayudan. Nunca empezás con "Claro!" ni con relleno.`;
  const userMsg = `El usuario quiere comprar: "${safeProduct}". Buscá en la web información actualizada (precios, ofertas, disponibilidad) y respondé:\n1. **Dónde conviene comprarlo y por qué** (precio habitual, confiabilidad, garantía, si conviene esperar una oferta)\n2. **1-2 alternativas** (opciones más baratas o similares)\n3. **Un tip extra** (promoción, tarjeta, cashback, época del año, etc.)\nBasá tu respuesta en lo que encontraste buscando, no solo en tu conocimiento previo. Formato claro, sin introducción ni relleno.`;
  const claudeRes = await callClaude(apiKey, {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1200,
    temperature: .6,
    system: systemPrompt,
    tools: [ {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: 3
    } ],
    messages: [ {
      role: "user",
      content: userMsg
    } ]
  }, ctx);
  if (claudeRes.error) return json({
    error: "Upstream API error",
    detail: claudeRes.error
  }, 502);
  if (!claudeRes.text) return json({
    error: "Upstream API error",
    detail: "empty response from model"
  }, 502);
  return json({
    choices: [ {
      message: {
        role: "assistant",
        content: claudeRes.text
      }
    } ]
  });
}

async function handleInvoice(body, apiKey, ctx) {
  const {image_base64: image_base64, image_media_type: image_media_type} = body;
  if (!image_base64) return json({
    error: "Missing required field: image_base64"
  }, 400);
  const mediaType = image_media_type || "image/jpeg";
  if (typeof image_base64 !== "string" || image_base64.length > MAX_IMAGE_B64) return json({
    error: "Image too large"
  }, 413);
  if (!ALLOWED_IMAGE_TYPES.includes(mediaType)) return json({
    error: "Unsupported image type"
  }, 400);
  const prompt = `You are reading a photo of a store receipt/ticket (in Spanish, English or Portuguese).\nExtract the data and respond ONLY with a JSON object, nothing else, no markdown, no explanation:\n\n{\n  "store": "store or business name",\n  "total": 0.00,\n  "subtotal": 0.00,\n  "taxes": 0.00,\n  "items": [ { "name": "item name", "price": 0.00 } ]\n}\n\nRules:\n- For "store": use the printed name/text on the receipt if present. If there's no readable name but you can clearly recognize a well-known brand from its logo (shape, colors, typography), use that brand name. If you're not confident (small/unfamiliar local business with an unclear logo), use "Compra" instead of guessing — never invent a store name you're not reasonably sure about.\n- "total", "subtotal" and "taxes" must be numbers (not strings), using dot as decimal separator.\n- If a field is not present on the receipt, use 0 for numbers.\n- List at most 12 items. If items aren't clearly readable, return an empty array.\n- Do not invent data that isn't visible on the receipt.`;
  const claudeRes = await callClaude(apiKey, {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [ {
      role: "user",
      content: [ {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: image_base64
        }
      }, {
        type: "text",
        text: prompt
      } ]
    } ]
  }, ctx);
  if (claudeRes.error) return json({
    error: "Upstream API error",
    detail: claudeRes.error
  }, 502);
  const parsed = tryParseJson(claudeRes.text);
  if (!parsed) return json({
    store: "Compra",
    total: 0,
    subtotal: 0,
    taxes: 0,
    items: []
  });
  return json({
    store: parsed.store || "Compra",
    total: Number(parsed.total) || 0,
    subtotal: Number(parsed.subtotal) || 0,
    taxes: Number(parsed.taxes) || 0,
    items: Array.isArray(parsed.items) ? parsed.items.slice(0, 12).map(it => ({
      name: String(it.name || ""),
      price: Number(it.price) || 0
    })) : []
  });
}

async function handleInsurance(body, apiKey, ctx) {
  const {fileBase64: fileBase64, mediaType: mediaType, docName: docName} = body;
  if (!fileBase64 || !mediaType || !docName) {
    return json({
      error: "Missing required fields: fileBase64, mediaType, docName"
    }, 400);
  }
  if (typeof fileBase64 !== "string" || typeof mediaType !== "string") return json({
    error: "Invalid file"
  }, 400);
  const isImage = ALLOWED_IMAGE_TYPES.includes(mediaType);
  if (!isImage && mediaType !== "application/pdf") return json({
    error: "Unsupported file type"
  }, 400);
  if (fileBase64.length > (isImage ? MAX_IMAGE_B64 : MAX_PDF_B64)) return json({
    error: "File too large"
  }, 413);
  const prompt = `You are analyzing a travel insurance policy document.\nExtract ONLY these two fields from the document:\n1. insurer: The insurance company name (e.g. "Assist Card", "Allianz", "IATI", "Mapfre", "Europ Assistance", "Falabella Seguros", etc.)\n2. phone: The 24/7 emergency phone number for medical emergencies abroad (international format preferred, e.g. "+1-800-XXX-XXXX" or "+54-11-XXXX-XXXX")\n\nDocument name hint: "${docName}"\n\nRespond ONLY with a JSON object, nothing else, no markdown:\n{"insurer": "...", "phone": "..."}\n\nIf you cannot find a field, use null for that field. Do not invent data.`;
  const content = isImage ? [ {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: fileBase64
    }
  }, {
    type: "text",
    text: prompt
  } ] : [ {
    type: "document",
    source: {
      type: "base64",
      media_type: "application/pdf",
      data: fileBase64
    }
  }, {
    type: "text",
    text: prompt
  } ];
  const claudeRes = await callClaude(apiKey, {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [ {
      role: "user",
      content: content
    } ]
  }, ctx);
  if (claudeRes.error) return json({
    error: "Upstream API error",
    detail: claudeRes.error
  }, 502);
  const parsed = tryParseJson(claudeRes.text);
  if (!parsed) return json({
    insurer: null,
    phone: null,
    name: docName
  });
  return json({
    insurer: parsed.insurer || null,
    phone: parsed.phone || null,
    name: docName
  });
}

async function handleRecaptcha(body, env) {
  const {token: token, action: action} = body;
  if (!token) return json({
    success: false,
    error: "Missing token"
  }, 400);
  const secretKey = env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not configured — skipping verification");
    return json({
      success: true,
      score: null,
      warning: "reCAPTCHA not configured"
    });
  }
  try {
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token
      }).toString()
    });
    if (!verifyRes.ok) {
      console.error("Google reCAPTCHA API error:", verifyRes.status);
      return json({
        success: true,
        warning: "Verification service unavailable"
      });
    }
    const data = await verifyRes.json();
    const SCORE_THRESHOLD = .5;
    const isHuman = data.success === true && (data.score === undefined || data.score >= SCORE_THRESHOLD) && (!action || !data.action || data.action === action);
    if (!isHuman) {
      console.warn("reCAPTCHA rejected:", {
        success: data.success,
        score: data.score,
        action: data.action,
        errors: data["error-codes"]
      });
    }
    return json({
      success: isHuman,
      score: data.score ?? null
    });
  } catch (err) {
    console.error("verify-recaptcha handler error:", err);
    return json({
      success: true,
      warning: "Verification failed silently"
    });
  }
}

async function handleModerate(body, apiKey, ctx) {
  const {imageBase64: imageBase64, mediaType: mediaType = "image/jpeg"} = body;
  if (!imageBase64) return json({
    error: "Missing imageBase64"
  }, 400);
  if (typeof imageBase64 !== "string" || imageBase64.length > MAX_IMAGE_B64) return json({
    error: "Image too large"
  }, 413);
  if (!ALLOWED_IMAGE_TYPES.includes(mediaType)) return json({
    error: "Unsupported image type"
  }, 400);
  if (!apiKey) return json({
    error: "Anthropic API key not configured"
  }, 500);
  const prompt = `Analizá esta imagen para un avatar de perfil de usuario. Respondé SOLO con un objeto JSON con esta estructura exacta, sin markdown ni texto adicional:\n{"approved": true|false, "reason": "breve explicación en español"}\n\nRechazá (approved: false) si la imagen contiene:\n- Contenido sexual, desnudez o pornografía (incluyendo genitales)\n- Violencia extrema, gore o imágenes perturbadoras\n- Personajes de ficción con copyright claro (Disney, Marvel, anime famosos, etc.)\n- Logos o marcas registradas como elemento principal\n- Contenido de odio, símbolos nazis o extremistas\n\nAprobá (approved: true) si es una foto de persona real, paisaje, mascota, ilustración genérica, o similar.`;
  const claudeRes = await callClaude(apiKey, {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [ {
      role: "user",
      content: [ {
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: imageBase64
        }
      }, {
        type: "text",
        text: prompt
      } ]
    } ]
  }, ctx);
  if (claudeRes.error) return json({
    error: "Upstream API error",
    detail: claudeRes.error
  }, 502);
  const result = tryParseJson(claudeRes.text);
  if (!result) return json({
    error: "Could not parse moderation result"
  }, 502);
  return json(result);
}

async function callClaude(apiKey, payload, ctx) {
  const started = Date.now();
  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    writeAIAnalytics(ctx, payload.model, null, 0, Date.now() - started, false, "network_error");
    return { error: { message: "network_error" } };
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    writeAIAnalytics(ctx, payload.model, null, 0, Date.now() - started, false, `http_${response.status}`);
    return { error: err };
  }
  const data = await response.json();
  const text = (data.content || []).map(c => c.text || "").join("").trim();
  const usage = normalizeAnthropicUsage(data.usage || {});
  const costUsd = estimateAnthropicCost(payload.model, usage);
  if (ctx) {
    ctx.costUsd = costUsd;
    ctx.usage = usage;
    await recordBudgetUsage(ctx, costUsd);
  }
  writeAIAnalytics(ctx, payload.model, usage, costUsd, Date.now() - started, true, "");
  return { text, usage, costUsd };
}

function normalizeAnthropicUsage(u) {
  return { input_tokens: Number(u.input_tokens || 0), output_tokens: Number(u.output_tokens || 0), cache_read_input_tokens: Number(u.cache_read_input_tokens || 0), cache_creation_input_tokens: Number(u.cache_creation_input_tokens || 0), web_search_requests: Number(u.server_tool_use?.web_search_requests || 0) };
}
function estimateAnthropicCost(model, usage) {
  const p = MODEL_PRICING_USD_PER_M[model];
  if (!p || !usage) return 0;
  const tokenCost = (usage.input_tokens * p.input + usage.output_tokens * p.output + usage.cache_read_input_tokens * p.cacheRead + usage.cache_creation_input_tokens * p.cacheWrite) / 1_000_000;
  return tokenCost + usage.web_search_requests * WEB_SEARCH_USD_PER_REQUEST;
}
function writeAIAnalytics(ctx, model, usage, costUsd, latencyMs, success, errorCode) {
  if (!ctx?.env?.AI_ANALYTICS) return;
  try {
    ctx.env.AI_ANALYTICS.writeDataPoint({
      blobs: [ctx.feature || "unknown", model || "unknown", success ? "success" : "error", errorCode || "", ctx.isOwner ? "owner" : "user"],
      doubles: [Number(usage?.input_tokens || 0), Number(usage?.output_tokens || 0), Number(usage?.cache_read_input_tokens || 0), Number(usage?.cache_creation_input_tokens || 0), Number(usage?.web_search_requests || 0), Number(costUsd || 0), Number(latencyMs || 0)],
      indexes: [ctx.user?.uid || "anonymous"]
    });
  } catch (e) { console.error("Analytics Engine write failed", e); }
}

function tryParseJson(text) {
  if (!text) return null;
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}