import { firestoreConfigured, getOrCreateWallet, reserveCredits, finalizeReservation, getBudgetCounters, addBudgetUsage, grantCredits, getProfileLimits, setProfileLimit, getProfileControls, setProfileControl, verifySecurityPin, setPrimaryProfile, createCreditCheckout, getCheckout, confirmCheckoutPayment, listLedger, getDocument, patchDocument } from "./worker-firestore.js";
import { createStripeCheckoutSession, verifyStripeSignature, createPaypalOrder, capturePaypalOrder, getPaypalOrder, findCompletedCapture, verifyPaypalWebhookSignature } from "./worker-payments.js";

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
    // Mercado Pago llama a esta URL directo desde sus servidores: sin Origin,
    // sin el envelope { type } del resto de la app, autenticado por firma
    // propia (x-signature) en vez de un token de Firebase. Se resuelve antes
    // que cualquier otra cosa, incluyendo CORS.
    const url = new URL(request.url);
    if (url.pathname === "/mp/webhook") return handleMercadoPagoWebhook(request, env, url);
    if (url.pathname === "/stripe/webhook") return handleStripeWebhook(request, env);
    if (url.pathname === "/paypal/webhook") return handlePaypalWebhook(request, env);

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
      if (AI_TYPES.includes(body.type) || ["ai_status", "ai_grant_credits", "ai_credit_checkout_create", "ai_paypal_capture", "ai_ledger_list", "ai_profile_limits_get", "ai_profile_limit_set", "profile_controls_get", "profile_controls_set", "security_pin_verify", "primary_profile_set"].includes(body.type)) return json({ error: "Invalid or expired session" }, 401);
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
  if (body.type === "ai_credit_checkout_create") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleCreditCheckoutCreate(body, env, user);
  }
  if (body.type === "ai_paypal_capture") {
    if (!user) return json({ error: "Login required" }, 401);
    return handlePaypalCapture(body, env, user);
  }
  if (body.type === "ai_ledger_list") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleLedgerList(env, user);
  }

  if (body.type === "ai_profile_limits_get") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIProfileLimitsGet(body, env, user);
  }
  if (body.type === "ai_profile_limit_set") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleAIProfileLimitSet(body, env, user);
  }
  if (body.type === "profile_controls_get") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleProfileControlsGet(body, env, user);
  }
  if (body.type === "security_pin_verify") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleSecurityPinVerify(body, env, user);
  }
  if (body.type === "profile_controls_set") {
    if (!user) return json({ error: "Login required" }, 401);
    return handleProfileControlsSet(body, env, user);
  }
  if (body.type === "primary_profile_set") {
    if (!user) return json({ error: "Login required" }, 401);
    return handlePrimaryProfileSet(body, env, user);
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
  if (body.type === "translate_text") return handleTranslateText(body, env);
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
  const base = {
    owner: isOwner, unlimited: isOwner, billingEnabled: env.AI_BILLING_ENABLED === "true", emailVerified: !!user.emailVerified,
    starterCredits: starterCredits(env), features: Object.fromEntries(Object.entries(AI_FEATURES).map(([k, v]) => [k, { credits: v.credits }])),
    usdPerCredit: Number(env.AI_CREDIT_USD_PER_CREDIT) || null,
    paymentProviders: {
      mercadopago: !!env.MERCADOPAGO_ACCESS_TOKEN && creditPriceArs(env, 1) !== null,
      stripe: !!env.STRIPE_SECRET_KEY,
      paypal: !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET)
    }
  };
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

// --- Compra de créditos vía Mercado Pago ------------------------------------

function creditPriceArs(env, credits) {
  const usdPerCredit = Number(env.AI_CREDIT_USD_PER_CREDIT);
  const arsRate = Number(env.MP_USD_ARS_RATE);
  if (!(usdPerCredit > 0) || !(arsRate > 0)) return null;
  // Redondeado al peso: Mercado Pago Argentina no opera con centavos fraccionarios raros.
  return Math.max(1, Math.round(credits * usdPerCredit * arsRate));
}
function creditPriceUsd(env, credits) {
  const usdPerCredit = Number(env.AI_CREDIT_USD_PER_CREDIT);
  if (!(usdPerCredit > 0)) return null;
  return Math.round(credits * usdPerCredit * 100) / 100;
}

async function handleCreditCheckoutCreate(body, env, user) {
  if (!firestoreConfigured(env)) return json({ error: "Firestore service account not configured" }, 503);
  const provider = ["mercadopago", "stripe", "paypal"].includes(body.provider) ? body.provider : "mercadopago";
  const credits = Math.floor(Number(body.credits));
  if (!Number.isFinite(credits) || credits < 10 || credits > 100000) return json({ error: "Invalid credits amount" }, 400);

  if (env.GENERAL_LIMITER) {
    const { success } = await env.GENERAL_LIMITER.limit({ key: `checkout:${user.uid}` });
    if (!success) return json({ error: "Too many requests, try again in a bit" }, 429);
  }

  const appUrl = String(env.PUBLIC_APP_URL || "https://taxfly.github.io").replace(/\/$/, "");
  const workerUrl = String(env.WORKER_PUBLIC_URL || "").replace(/\/$/, "");
  // index.html (no mis-cosas.html) porque es la página que carga el drawer de
  // Ajustes completo (assets/settings.js), que es quien procesa ?ai_checkout=...
  const returnBase = `${appUrl}/index.html`;

  if (provider === "mercadopago") {
    const token = env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return json({ error: "Payment provider not configured yet" }, 503);
    const priceArs = creditPriceArs(env, credits);
    if (priceArs === null) return json({ error: "Credit pricing not configured yet" }, 503);
    let checkout;
    try { checkout = await createCreditCheckout(env, user.uid, credits, priceArs, { provider: "mercadopago", currency: "ARS" }); }
    catch (e) { console.error("createCreditCheckout failed", e); return json({ error: "Could not start checkout" }, 503); }
    const pref = {
      items: [ { title: `${credits} créditos IA · TaxUSA`, quantity: 1, currency_id: "ARS", unit_price: priceArs } ],
      external_reference: checkout.checkoutId,
      back_urls: {
        success: `${returnBase}?ai_checkout=success&provider=mercadopago`,
        pending: `${returnBase}?ai_checkout=pending&provider=mercadopago`,
        failure: `${returnBase}?ai_checkout=failure&provider=mercadopago`
      },
      auto_return: "approved",
      notification_url: workerUrl ? `${workerUrl}/mp/webhook` : undefined,
      statement_descriptor: "TAXUSA IA"
    };
    let mpRes;
    try {
      mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pref)
      });
    } catch (e) { console.error("Mercado Pago preference request failed", e); return json({ error: "Could not reach payment provider" }, 502); }
    if (!mpRes.ok) { console.error("Mercado Pago preference error", mpRes.status, await mpRes.text().catch(() => "")); return json({ error: "Payment provider rejected the request" }, 502); }
    const pdata = await mpRes.json();
    return json({ checkout_id: checkout.checkoutId, provider, credits, price: priceArs, currency: "ARS", checkout_url: pdata.init_point || pdata.sandbox_init_point });
  }

  // Stripe y PayPal cobran en USD, con el mismo precio por crédito que Mercado Pago.
  const priceUsd = creditPriceUsd(env, credits);
  if (priceUsd === null) return json({ error: "Credit pricing not configured yet" }, 503);

  if (provider === "stripe") {
    if (!env.STRIPE_SECRET_KEY) return json({ error: "Payment provider not configured yet" }, 503);
    let checkout;
    try { checkout = await createCreditCheckout(env, user.uid, credits, priceUsd, { provider: "stripe", currency: "USD" }); }
    catch (e) { console.error("createCreditCheckout failed", e); return json({ error: "Could not start checkout" }, 503); }
    try {
      const { checkoutUrl } = await createStripeCheckoutSession(env, { checkoutId: checkout.checkoutId, email: user.email, credits, amountUsd: priceUsd, returnBase });
      return json({ checkout_id: checkout.checkoutId, provider, credits, price: priceUsd, currency: "USD", checkout_url: checkoutUrl });
    } catch (e) {
      console.error("Stripe checkout session failed", e, e?.detail);
      return json({ error: "Payment provider rejected the request" }, 502);
    }
  }

  // provider === "paypal"
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) return json({ error: "Payment provider not configured yet" }, 503);
  let checkout;
  try { checkout = await createCreditCheckout(env, user.uid, credits, priceUsd, { provider: "paypal", currency: "USD" }); }
  catch (e) { console.error("createCreditCheckout failed", e); return json({ error: "Could not start checkout" }, 503); }
  try {
    const { checkoutUrl, orderId } = await createPaypalOrder(env, { checkoutId: checkout.checkoutId, credits, amountUsd: priceUsd, returnBase });
    return json({ checkout_id: checkout.checkoutId, provider, credits, price: priceUsd, currency: "USD", checkout_url: checkoutUrl, order_id: orderId });
  } catch (e) {
    console.error("PayPal order creation failed", e, e?.detail);
    return json({ error: "Payment provider rejected the request" }, 502);
  }
}

// El comprador puede volver de PayPal antes de que llegue el webhook: esta ruta
// autenticada captura el pago de una (si hace falta) y acredita al toque, usando
// la misma confirmCheckoutPayment idempotente que usa el webhook — así, sin
// importar cuál de los dos procesos gane la carrera, el crédito se otorga una sola vez.
async function handlePaypalCapture(body, env, user) {
  if (!firestoreConfigured(env)) return json({ error: "Firestore service account not configured" }, 503);
  const orderId = String(body.order_id || "").trim();
  const checkoutId = String(body.checkout_id || "").trim();
  if (!orderId || !checkoutId) return json({ error: "Missing order_id or checkout_id" }, 400);
  const checkout = await getCheckout(env, checkoutId).catch(() => null);
  if (!checkout || checkout.uid !== user.uid) return json({ error: "Checkout not found" }, 404);
  if (checkout.status !== "pending") {
    return json({ ok: true, alreadyProcessed: true });
  }
  try {
    let order = await capturePaypalOrder(env, orderId);
    let found = findCompletedCapture(order);
    if (!found) {
      order = await getPaypalOrder(env, orderId);
      found = findCompletedCapture(order);
    }
    if (!found) return json({ error: "Payment not completed yet" }, 409);
    const result = await confirmCheckoutPayment(env, checkoutId, found.capture.id, Number(found.capture.amount?.value || 0));
    if (!result.ok) return json({ error: result.reason || "Could not confirm payment" }, 409);
    return json({ ok: true, availableCredits: result.wallet ? Number(result.wallet.availableCredits || 0) : null });
  } catch (e) {
    console.error("PayPal capture failed", e, e?.detail);
    return json({ error: "Could not confirm PayPal payment" }, 502);
  }
}

function mpSignatureParts(header) {
  const out = {};
  for (const part of String(header || "").split(",")) {
    const [k, v] = part.split("=");
    if (k && v) out[k.trim()] = v.trim();
  }
  return out;
}

async function verifyMpSignature(env, xSignature, xRequestId, dataId) {
  const secret = env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return false;
  const { ts, v1 } = mpSignatureParts(xSignature);
  if (!ts || !v1) return false;
  const manifest = `id:${String(dataId || "").toLowerCase()};request-id:${xRequestId || ""};ts:${ts};`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [ "sign" ]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

async function handleMercadoPagoWebhook(request, env, url) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!env.MERCADOPAGO_WEBHOOK_SECRET || !env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error("MP webhook received but provider is not configured");
    return new Response(null, { status: 503 });
  }
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id") || "";
  const xSignature = request.headers.get("x-signature") || "";
  const xRequestId = request.headers.get("x-request-id") || "";
  let validSig = false;
  try { validSig = dataId && (await verifyMpSignature(env, xSignature, xRequestId, dataId)); }
  catch (e) { console.error("MP signature check failed", e); }
  // Consumimos el body igual (si lo hay) para no dejar la conexión colgada, pero
  // nunca confiamos en sus datos: la fuente de verdad es la Payments API.
  await request.text().catch(() => {});
  if (!validSig) return new Response(null, { status: 401 });

  let payment;
  try {
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` }
    });
    if (!payRes.ok) { console.error("MP payment fetch failed", payRes.status); return new Response(null, { status: 502 }); }
    payment = await payRes.json();
  } catch (e) {
    console.error("MP payment fetch error", e);
    return new Response(null, { status: 502 });
  }

  if (payment.status !== "approved") return new Response(null, { status: 200 });
  const checkoutId = payment.external_reference;
  if (!checkoutId) return new Response(null, { status: 200 });

  try {
    const result = await confirmCheckoutPayment(env, checkoutId, String(payment.id), Number(payment.transaction_amount || 0));
    if (!result.ok && result.reason === "CHECKOUT_NOT_FOUND") { console.error("MP webhook: unknown checkout", checkoutId); return new Response(null, { status: 200 }); }
    if (!result.ok && result.reason === "AMOUNT_MISMATCH") { console.error("MP webhook: amount mismatch", checkoutId, payment.transaction_amount); return new Response(null, { status: 200 }); }
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error("confirmCheckoutPayment failed", e);
    // 500 para que Mercado Pago reintente: puede ser una falla transitoria de Firestore.
    return new Response(null, { status: 500 });
  }
}

async function handleStripeWebhook(request, env) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const sig = request.headers.get("stripe-signature") || "";
  const rawBody = await request.text().catch(() => "");
  const valid = await verifyStripeSignature(env, rawBody, sig).catch(() => false);
  if (!valid) return new Response(null, { status: 401 });
  let event;
  try { event = JSON.parse(rawBody); } catch (e) { return new Response(null, { status: 400 }); }
  if (event.type !== "checkout.session.completed") return new Response(null, { status: 200 });
  const session = event.data?.object || {};
  if (session.payment_status !== "paid") return new Response(null, { status: 200 });
  const checkoutId = session.client_reference_id || session.metadata?.checkoutId;
  if (!checkoutId) return new Response(null, { status: 200 });
  try {
    const result = await confirmCheckoutPayment(env, checkoutId, session.id, Number(session.amount_total || 0) / 100);
    if (!result.ok && result.reason === "CHECKOUT_NOT_FOUND") { console.error("Stripe webhook: unknown checkout", checkoutId); return new Response(null, { status: 200 }); }
    if (!result.ok && result.reason === "AMOUNT_MISMATCH") { console.error("Stripe webhook: amount mismatch", checkoutId); return new Response(null, { status: 200 }); }
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error("confirmCheckoutPayment (stripe) failed", e);
    return new Response(null, { status: 500 }); // 500 para que Stripe reintente
  }
}

async function handlePaypalWebhook(request, env) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const rawBody = await request.text().catch(() => "");
  const valid = await verifyPaypalWebhookSignature(env, request.headers, rawBody).catch(() => false);
  if (!valid) return new Response(null, { status: 401 });
  let event;
  try { event = JSON.parse(rawBody); } catch (e) { return new Response(null, { status: 400 }); }
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") return new Response(null, { status: 200 });
  const capture = event.resource || {};
  const checkoutId = capture.custom_id || capture.invoice_id;
  if (!checkoutId) return new Response(null, { status: 200 });
  try {
    const result = await confirmCheckoutPayment(env, checkoutId, capture.id, Number(capture.amount?.value || 0));
    if (!result.ok && result.reason === "CHECKOUT_NOT_FOUND") { console.error("PayPal webhook: unknown checkout", checkoutId); return new Response(null, { status: 200 }); }
    if (!result.ok && result.reason === "AMOUNT_MISMATCH") { console.error("PayPal webhook: amount mismatch", checkoutId); return new Response(null, { status: 200 }); }
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error("confirmCheckoutPayment (paypal) failed", e);
    return new Response(null, { status: 500 }); // 500 para que PayPal reintente
  }
}

async function handleLedgerList(env, user) {
  if (!firestoreConfigured(env)) return json({ entries: [] });
  try {
    const entries = await listLedger(env, user.uid, 30);
    return json({ entries: entries.map(e => ({
      type: e.type || "", feature: e.feature || "", provider: e.provider || "", credits: Number(e.credits || 0), createdAt: e.createdAt || "",
      amount: e.amount != null ? Number(e.amount) : (e.amountArs != null ? Number(e.amountArs) : null),
      currency: e.currency || (e.amountArs != null ? "ARS" : null)
    })) });
  } catch (e) {
    console.error("listLedger failed", e);
    return json({ error: "Could not read AI usage history" }, 503);
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
  const profileId = String(body.profile_id || "").trim();
  const mode = String(body.mode || "").trim();
  const resetUsed = body.reset_used === true;
  if (!profileId || !["unlimited", "limited", "blocked"].includes(mode)) return json({ error: "Invalid profile limit" }, 400);
  try {
    await verifySecurityPin(env, user.uid, body.pin, body.actor_profile_id, true);
    const limit = await setProfileLimit(env, user.uid, profileId, mode, body.limit_credits, resetUsed);
    return json({ ok:true, limit });
  } catch (e) {
    return profileAdminError(e);
  }
}

function profileAdminError(e) {
  const code = e?.code || "PROFILE_ADMIN_ERROR";
  const status = code === "INVALID_SECURITY_PIN" ? 403 : code === "PRIMARY_PROFILE_REQUIRED" ? 403 : code === "PIN_NOT_CONFIGURED" || code === "PIN_UPGRADE_REQUIRED" ? 409 : code === "PROFILE_NOT_FOUND" ? 404 : code === "INVALID_PROFILE_LIMIT" || code === "INVALID_PROFILE_CONTROL" ? 400 : 503;
  return json({ error:e?.message || "Profile administration failed", code, primaryProfileId:e?.primaryProfileId || "" }, status);
}
async function handleSecurityPinVerify(body, env, user) {
  try {
    const state = await verifySecurityPin(env, user.uid, body.pin, body.actor_profile_id, true);
    return json({ ok:true, primaryProfileId:state.primaryProfileId });
  } catch (e) { return profileAdminError(e); }
}
async function handleProfileControlsGet(body, env, user) {
  try {
    const state = await getProfileControls(env, user.uid, body.profile_ids || []);
    const limits = await getProfileLimits(env, user.uid, state.profiles.map(p => p.id));
    return json({ ...state, limits });
  } catch (e) {
    console.error("profile controls get failed", e);
    return json({ error:"Could not read profile controls" }, 503);
  }
}
async function handleProfileControlsSet(body, env, user) {
  try {
    await verifySecurityPin(env, user.uid, body.pin, body.actor_profile_id, true);
    const control = await setProfileControl(env, user.uid, body.profile_id, String(body.access_level || "full"), body.allow_ai !== false);
    return json({ ok:true, control });
  } catch (e) { return profileAdminError(e); }
}
async function handlePrimaryProfileSet(body, env, user) {
  try {
    await verifySecurityPin(env, user.uid, body.pin, body.actor_profile_id, true);
    const primaryProfileId = await setPrimaryProfile(env, user.uid, body.profile_id);
    return json({ ok:true, primaryProfileId });
  } catch (e) { return profileAdminError(e); }
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

// ═══════════ Traducción automática de texto libre (categorías propias, etc.) ═══════════
// No usa créditos de IA ni requiere login — es gratis para el usuario, pasa por
// GENERAL_LIMITER (rate limit por IP) y por un cache en Firestore (translations_cache/{hash})
// para no volver a traducir el mismo texto dos veces (ni gastar cuota de Google de nuevo
// si dos usuarios distintos crean la misma categoría, ej. "Comida" / "Mascotas").
const TRANSLATE_MAX_CHARS = 120;

function translateTextHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return "t_" + h.toString(36);
}

// Nombres propios que Google Translate traduce mal porque también son
// palabras comunes del idioma (ej. "American" → "estadounidense",
// "United" → "unido"). Mismo listado de aerolíneas que reservationAirlines
// en assets/plan-reservations.js, para que "Houston – Orlando (United)" o
// "Orlando – Miami (American)" no pierdan el nombre de la aerolínea.
// Ordenado de más largo a más corto para que un alias compuesto (ej.
// "American Airlines") se detecte antes que su forma corta ("American").
const TRANSLATE_PROTECTED_TERMS = [
  "Aerolíneas Argentinas", "Aerolineas Argentinas", "American Airlines",
  "United Airlines", "Delta Air Lines", "Delta Airlines", "LATAM Airlines",
  "Copa Airlines", "Gol Linhas Aereas", "Azul Linhas Aereas", "Air Canada",
  "Air France", "Iberia Express", "British Airways", "Turkish Airlines",
  "Qatar Airways", "Viva Aerobus", "VivaAerobus", "Sky Airline",
  "TAP Air Portugal", "TAP Portugal", "Air Europa", "ITA Airways",
  "Swiss International Air Lines", "Wizz Air", "Spirit Airlines",
  "Frontier Airlines", "Southwest Airlines", "Alaska Airlines",
  "JetBlue Airways", "Aeroméxico", "Aeromexico", "Aerolineas",
  "American", "United", "Delta", "LATAM", "Avianca", "JetSMART",
  "Flybondi", "Copa", "Gol", "Azul", "KLM", "Iberia", "Lufthansa",
  "Turkish", "Emirates", "Qatar", "Volaris", "Arajet", "Wingo",
  "Swiss", "Level", "Ryanair", "EasyJet", "JetBlue", "Spirit",
  "Frontier", "Southwest", "Alaska", "TAP"
].sort((a, b) => b.length - a.length);

function translateProtectPlaceholder(i) { return `ZZTFKEEP${i}ZZ`; }

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// Reemplaza cada nombre propio protegido por un token que Google Translate
// deja intacto (ASCII, sin espacios, no es una palabra real de ningún
// idioma), y devuelve también la lista de coincidencias originales para
// poder restaurarlas después en las 3 traducciones.
function translateProtectTerms(text) {
  let protectedText = text;
  const found = [];
  for (const term of TRANSLATE_PROTECTED_TERMS) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
    protectedText = protectedText.replace(re, (match) => {
      const token = translateProtectPlaceholder(found.length);
      found.push(match);
      return token;
    });
  }
  return { protectedText, found };
}

function translateRestoreTerms(result, found) {
  if (!found.length) return result;
  const restoreOne = (value) => {
    if (typeof value !== "string") return value;
    let out = value;
    found.forEach((original, i) => { out = out.split(translateProtectPlaceholder(i)).join(original); });
    return out;
  };
  return { es: restoreOne(result.es), en: restoreOne(result.en), pt: restoreOne(result.pt) };
}

async function handleTranslateText(body, env) {
  const raw = typeof body.text === "string" ? body.text.trim().replace(/\s+/g, " ") : "";
  if (!raw) return json({ error: "Missing text" }, 400);
  if (raw.length > TRANSLATE_MAX_CHARS) return json({ error: "Text too long" }, 413);
  const apiKey = env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return json({ error: "Translation not configured" }, 500);

  const cachePath = `translations_cache/${translateTextHash(raw)}`;
  if (firestoreConfigured(env)) {
    try {
      const cached = await getDocument(env, cachePath);
      if (cached && cached.source === raw && cached.es && cached.en && cached.pt) {
        return json({ es: cached.es, en: cached.en, pt: cached.pt });
      }
    } catch (e) { console.warn("translation cache read failed", e); }
  }

  const { protectedText, found } = translateProtectTerms(raw);

  let result;
  try {
    result = await translateViaGoogle(protectedText, apiKey);
    result = translateRestoreTerms(result, found);
  } catch (e) {
    console.error("Google Translate failed", e);
    return json({ error: "Translation service unavailable" }, 502);
  }

  if (firestoreConfigured(env)) {
    try { await patchDocument(env, cachePath, { source: raw, ...result, updatedAt: new Date() }); }
    catch (e) { console.warn("translation cache write failed", e); }
  }

  return json(result);
}

// Pide a Google Translate la versión "en" (que de paso detecta el idioma de origen),
// guarda el texto original tal cual para su propio idioma, y solo llama a Google de
// nuevo para los idiomas que todavía faltan (como mucho 3 llamadas, típicamente 2).
async function translateViaGoogle(text, apiKey) {
  const first = await callGoogleTranslate(text, "en", apiKey);
  const detected = (first.detected || "es").toLowerCase().slice(0, 2);
  const out = { es: null, en: null, pt: null };
  if (detected in out) out[detected] = text;
  if (out.en === null) out.en = first.text;
  for (const lang of ["es", "pt"]) {
    if (out[lang] !== null) continue;
    const r = await callGoogleTranslate(text, lang, apiKey);
    out[lang] = r.text;
  }
  return out;
}

async function callGoogleTranslate(text, target, apiKey) {
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target, format: "text" })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google Translate HTTP ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  const t = data?.data?.translations?.[0];
  if (!t) throw new Error("Empty Google Translate response");
  return { text: t.translatedText, detected: t.detectedSourceLanguage || null };
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