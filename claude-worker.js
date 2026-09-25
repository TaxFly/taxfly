// ── TaxFly — Worker de Cloudflare ────────────────────────────────────────────
// Seguridad:
//  · Las rutas que gastan crédito de Anthropic exigen un ID token de Firebase
//    válido (Authorization: Bearer <token>). El worker lo verifica contra las
//    claves públicas de Google, así solo gastan crédito usuarios logueados en
//    el proyecto de TaxFly. El rate limit de esas rutas es por usuario (uid).
//  · verify_recaptcha sigue abierto (se usa en el login, antes de tener
//    sesión), con rate limit por IP. No gasta crédito.
//  · CORS solo para los orígenes de ALLOWED_ORIGINS (wrangler.toml).
//  · Ya no existe APP_SECRET: vivía en el cliente, no protegía nada.

const FIREBASE_PROJECT_ID = 'viajes-db538';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const AI_TYPES = ['invoice_ocr', 'insurance_analysis', 'moderate_image', 'optimize_route', 'taxie_chat'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = isAllowedOrigin(origin, env);

    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Un navegador desde otro sitio: no respondemos. (Sin header Origin, por
    // ej. curl, igual tiene que pasar las mismas validaciones de abajo.)
    if (origin && !allowed) return json({ error: 'Origin not allowed' }, 403);

    const res = await handle(request, env);
    if (allowed) {
      const h = new Headers(res.headers);
      for (const [k, v] of Object.entries(corsHeaders(origin))) h.set(k, v);
      return new Response(res.body, { status: res.status, headers: h });
    }
    return res;
  },
};

async function handle(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const isCostRoute = AI_TYPES.includes(body.type);

  // ── Rutas con costo: requieren usuario logueado ──
  if (isCostRoute) {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return json({ error: 'Login required' }, 401);

    let user;
    try {
      user = await verifyFirebaseToken(token);
    } catch (e) {
      return json({ error: 'Invalid or expired session', detail: String(e.message || e) }, 401);
    }

    if (env.COST_LIMITER) {
      const { success } = await env.COST_LIMITER.limit({ key: `uid:${user.uid}` });
      if (!success) return json({ error: 'Too many requests, try again in a bit' }, 429);
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) return json({ error: 'Anthropic API key not configured' }, 500);
    if (body.type === 'invoice_ocr') return handleInvoice(body, apiKey);
    if (body.type === 'insurance_analysis') return handleInsurance(body, apiKey);
    if (body.type === 'moderate_image') return handleModerate(body, apiKey);
    // optimize_route usa Sonnet (mejor razonamiento geográfico, temperatura
    // baja para consistencia). taxie_chat sigue en Haiku.
    if (body.type === 'optimize_route') return handleAIChat(body, apiKey, 'claude-sonnet-5', 800, 0.2);
    return handleAIChat(body, apiKey, 'claude-haiku-4-5-20251001', 800, 0.7); // taxie_chat
  }

  // ── Rutas abiertas ──
  if (env.GENERAL_LIMITER) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const { success } = await env.GENERAL_LIMITER.limit({ key: `${ip}:${body.type}` });
    if (!success) return json({ error: 'Too many requests, try again in a bit' }, 429);
  }
  if (body.type === 'verify_recaptcha') return handleRecaptcha(body, env);
  return json({ error: 'Unknown or missing "type"' }, 400);
}

// ── CORS ─────────────────────────────────────────────────
function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  const list = String(env.ALLOWED_ORIGINS || 'https://taxfly.github.io')
    .split(',').map(s => s.trim()).filter(Boolean);
  if (list.includes(origin)) return true;
  // Para probar en tu compu (Live Server, python -m http.server, etc.)
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// ── Verificación del ID token de Firebase ────────────────
// Es un JWT RS256 firmado por Google. Se valida firma + aud + iss + tiempos,
// tal como indica la doc de Firebase para verificar tokens sin el Admin SDK.
let _jwks = null;        // { keys: Map<kid, CryptoKey>, exp: ms }

async function getGoogleKeys() {
  if (_jwks && _jwks.exp > Date.now()) return _jwks.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error('Could not fetch Google keys');
  const data = await res.json();
  const maxAge = Number((res.headers.get('Cache-Control') || '').match(/max-age=(\d+)/)?.[1] || 3600);
  const keys = new Map();
  for (const jwk of data.keys || []) {
    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    keys.set(jwk.kid, key);
  }
  _jwks = { keys, exp: Date.now() + maxAge * 1000 };
  return keys;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyFirebaseToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const dec = new TextDecoder();
  const header = JSON.parse(dec.decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(dec.decode(b64urlToBytes(parts[1])));

  if (header.alg !== 'RS256') throw new Error('bad alg');

  let keys = await getGoogleKeys();
  let key = keys.get(header.kid);
  if (!key) { _jwks = null; keys = await getGoogleKeys(); key = keys.get(header.kid); } // rotaron las claves
  if (!key) throw new Error('unknown kid');

  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1]));
  if (!ok) throw new Error('bad signature');

  const now = Math.floor(Date.now() / 1000);
  const skew = 60;
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error('bad aud');
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) throw new Error('bad iss');
  if (!payload.sub || typeof payload.sub !== 'string') throw new Error('no sub');
  if (typeof payload.exp !== 'number' || payload.exp < now - skew) throw new Error('expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + skew) throw new Error('iat in future');
  if (typeof payload.auth_time !== 'number' || payload.auth_time > now + skew) throw new Error('bad auth_time');

  return { uid: payload.sub, email: payload.email || null };
}

// ── Optimización de rutas / chat Taxie ──────────────────
// Handler genérico: recibe { messages: [{role, content}, ...], max_tokens }
// en formato "estilo OpenAI" (incluyendo un mensaje role:"system" opcional
// al principio, como ya mandaba el cliente), lo traduce al formato de Claude
// (system aparte) y devuelve la respuesta con la MISMA forma que ya
// consumía el cliente (choices[0].message.content), para no tener que
// reescribir el parseo en rutas.html.
async function handleAIChat(body, apiKey, model, defaultMaxTokens, defaultTemperature) {
  const { messages } = body;
  if (!Array.isArray(messages) || !messages.length) {
    return json({ error: 'Missing required field: messages' }, 400);
  }

  let system;
  const chatMessages = [];
  for (const m of messages) {
    if (!m || typeof m.content !== 'string') continue;
    if (m.role === 'system') system = system ? `${system}\n\n${m.content}` : m.content;
    else chatMessages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
  }
  if (!chatMessages.length) return json({ error: 'No user/assistant messages provided' }, 400);

  const maxTokens = Math.min(Number(body.max_tokens) || defaultMaxTokens, 1500);
  const temperature = typeof body.temperature === 'number' ? body.temperature : defaultTemperature;

  const claudeRes = await callClaude(apiKey, {
    model,
    max_tokens: maxTokens,
    ...(temperature !== undefined ? { temperature } : {}),
    ...(system ? { system } : {}),
    messages: chatMessages,
  });

  if (claudeRes.error) return json({ error: 'Upstream API error', detail: claudeRes.error }, 502);

  return json({
    choices: [{ message: { role: 'assistant', content: claudeRes.text } }],
  });
}

// ── Facturas / tickets ──────────────────────────────────
async function handleInvoice(body, apiKey) {
  const { image_base64, image_media_type } = body;
  if (!image_base64) return json({ error: 'Missing required field: image_base64' }, 400);
  const mediaType = image_media_type || 'image/jpeg';

  const prompt = `You are reading a photo of a store receipt/ticket (in Spanish, English or Portuguese).
Extract the data and respond ONLY with a JSON object, nothing else, no markdown, no explanation:

{
  "store": "store or business name",
  "total": 0.00,
  "subtotal": 0.00,
  "taxes": 0.00,
  "items": [ { "name": "item name", "price": 0.00 } ]
}

Rules:
- For "store": use the printed name/text on the receipt if present. If there's no readable name but you can clearly recognize a well-known brand from its logo (shape, colors, typography), use that brand name. If you're not confident (small/unfamiliar local business with an unclear logo), use "Compra" instead of guessing — never invent a store name you're not reasonably sure about.
- "total", "subtotal" and "taxes" must be numbers (not strings), using dot as decimal separator.
- If a field is not present on the receipt, use 0 for numbers.
- List at most 12 items. If items aren't clearly readable, return an empty array.
- Do not invent data that isn't visible on the receipt.`;

  const claudeRes = await callClaude(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: image_base64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  if (claudeRes.error) return json({ error: 'Upstream API error', detail: claudeRes.error }, 502);

  const parsed = tryParseJson(claudeRes.text);
  if (!parsed) return json({ store: 'Compra', total: 0, subtotal: 0, taxes: 0, items: [] });

  return json({
    store: parsed.store || 'Compra',
    total: Number(parsed.total) || 0,
    subtotal: Number(parsed.subtotal) || 0,
    taxes: Number(parsed.taxes) || 0,
    items: Array.isArray(parsed.items) ? parsed.items.slice(0, 12).map(it => ({
      name: String(it.name || ''),
      price: Number(it.price) || 0,
    })) : [],
  });
}

// ── Pólizas de seguro ────────────────────────────────────
async function handleInsurance(body, apiKey) {
  const { fileBase64, mediaType, docName } = body;
  if (!fileBase64 || !mediaType || !docName) {
    return json({ error: 'Missing required fields: fileBase64, mediaType, docName' }, 400);
  }

  const isImage = mediaType.startsWith('image/');
  const prompt = `You are analyzing a travel insurance policy document.
Extract ONLY these two fields from the document:
1. insurer: The insurance company name (e.g. "Assist Card", "Allianz", "IATI", "Mapfre", "Europ Assistance", "Falabella Seguros", etc.)
2. phone: The 24/7 emergency phone number for medical emergencies abroad (international format preferred, e.g. "+1-800-XXX-XXXX" or "+54-11-XXXX-XXXX")

Document name hint: "${docName}"

Respond ONLY with a JSON object, nothing else, no markdown:
{"insurer": "...", "phone": "..."}

If you cannot find a field, use null for that field. Do not invent data.`;

  const content = isImage
    ? [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileBase64 } },
        { type: 'text', text: prompt },
      ]
    : [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
        { type: 'text', text: prompt },
      ];

  const claudeRes = await callClaude(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{ role: 'user', content }],
  });

  if (claudeRes.error) return json({ error: 'Upstream API error', detail: claudeRes.error }, 502);

  const parsed = tryParseJson(claudeRes.text);
  if (!parsed) return json({ insurer: null, phone: null, name: docName });

  return json({
    insurer: parsed.insurer || null,
    phone: parsed.phone || null,
    name: docName,
  });
}

// ── reCAPTCHA ────────────────────────────────────────────
async function handleRecaptcha(body, env) {
  const { token, action } = body;
  if (!token) return json({ success: false, error: 'Missing token' }, 400);

  const secretKey = env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY not configured — skipping verification');
    return json({ success: true, score: null, warning: 'reCAPTCHA not configured' });
  }

  try {
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
    });

    if (!verifyRes.ok) {
      console.error('Google reCAPTCHA API error:', verifyRes.status);
      return json({ success: true, warning: 'Verification service unavailable' });
    }

    const data = await verifyRes.json();
    const SCORE_THRESHOLD = 0.5;
    const isHuman =
      data.success === true &&
      (data.score === undefined || data.score >= SCORE_THRESHOLD) &&
      (!action || !data.action || data.action === action);

    if (!isHuman) {
      console.warn('reCAPTCHA rejected:', {
        success: data.success, score: data.score, action: data.action, errors: data['error-codes'],
      });
    }

    return json({ success: isHuman, score: data.score ?? null });

  } catch (err) {
    console.error('verify-recaptcha handler error:', err);
    return json({ success: true, warning: 'Verification failed silently' });
  }
}

// ── Moderación de avatares ─────────────────────────────────
// Antes usaba Groq (llama-4-scout), pero Groq dio de baja ese modelo el
// 17/07/2026 (y el reemplazo, llama-4-maverick, también está dado de baja
// desde marzo 2026 — Groq rota sus modelos de visión seguido). Migrado a
// Claude, mismo proveedor que ya usamos para facturas/seguro — un
// proveedor menos del que depender, y ya no hace falta GROQ_API_KEY.
async function handleModerate(body, apiKey) {
  const { imageBase64, mediaType = 'image/jpeg' } = body;
  if (!imageBase64) return json({ error: 'Missing imageBase64' }, 400);
  if (!apiKey) return json({ error: 'Anthropic API key not configured' }, 500);

  const prompt = `Analizá esta imagen para un avatar de perfil de usuario. Respondé SOLO con un objeto JSON con esta estructura exacta, sin markdown ni texto adicional:
{"approved": true|false, "reason": "breve explicación en español"}

Rechazá (approved: false) si la imagen contiene:
- Contenido sexual, desnudez o pornografía (incluyendo genitales)
- Violencia extrema, gore o imágenes perturbadoras
- Personajes de ficción con copyright claro (Disney, Marvel, anime famosos, etc.)
- Logos o marcas registradas como elemento principal
- Contenido de odio, símbolos nazis o extremistas

Aprobá (approved: true) si es una foto de persona real, paisaje, mascota, ilustración genérica, o similar.`;

  const claudeRes = await callClaude(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  if (claudeRes.error) return json({ error: 'Upstream API error', detail: claudeRes.error }, 502);

  const result = tryParseJson(claudeRes.text);
  if (!result) return json({ error: 'Could not parse moderation result' }, 502);
  return json(result);
}

// ── Helpers ──────────────────────────────────────────────
async function callClaude(apiKey, payload) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return { error: err };
  }
  const data = await response.json();
  const text = (data.content || []).map(c => c.text || '').join('').trim();
  return { text };
}

function tryParseJson(text) {
  if (!text) return null;
  const clean = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(clean); } catch (e) { return null; }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
