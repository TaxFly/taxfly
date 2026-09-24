export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-App-Secret',
        },
      });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // Secreto compartido: frena bots/scrapers que solo copian la URL del
    // worker sin mirar el JS de la app. No es autenticación real (el valor
    // vive en el cliente), la protección de fondo contra abuso masivo es
    // el rate limiting de más abajo.
    const providedSecret = request.headers.get('X-App-Secret');
    if (!env.APP_SHARED_SECRET || providedSecret !== env.APP_SHARED_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    // Rate limiting: límite más estricto para las rutas que gastan crédito de
    // Anthropic (facturas/seguro/moderación de fotos/rutas/chat de Taxie), más
    // amplio para reCAPTCHA.
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const AI_TYPES = ['invoice_ocr', 'insurance_analysis', 'moderate_image', 'optimize_route', 'taxie_chat'];
    const isCostRoute = AI_TYPES.includes(body.type);
    const limiter = isCostRoute ? env.COST_LIMITER : env.GENERAL_LIMITER;
    if (limiter) {
      const { success } = await limiter.limit({ key: `${ip}:${body.type}` });
      if (!success) return json({ error: 'Too many requests, try again in a bit' }, 429);
    }

    if (AI_TYPES.includes(body.type)) {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return json({ error: 'Anthropic API key not configured' }, 500);
      if (body.type === 'invoice_ocr') return handleInvoice(body, apiKey);
      if (body.type === 'insurance_analysis') return handleInsurance(body, apiKey);
      if (body.type === 'moderate_image') return handleModerate(body, apiKey);
      // Antes rutas.html llamaba directo a Groq (openai/gpt-oss-120b) en otro
      // worker sin auth. Ahora pasa por acá, mismo proveedor/secreto que el
      // resto de la app.
      // optimize_route usa Sonnet (mejor razonamiento geográfico/de planificación,
      // priorizamos precisión) con temperatura baja para que sea consistente.
      // taxie_chat sigue en Haiku (charla, no necesita tanto razonamiento).
      if (body.type === 'optimize_route') return handleAIChat(body, apiKey, 'claude-sonnet-5', 800, 0.2);
      return handleAIChat(body, apiKey, 'claude-haiku-4-5-20251001', 800, 0.7); // taxie_chat
    }
    if (body.type === 'verify_recaptcha') return handleRecaptcha(body, env);
    return json({ error: 'Unknown or missing "type" (expected invoice_ocr, insurance_analysis, verify_recaptcha, moderate_image, optimize_route or taxie_chat)' }, 400);
  },
};

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
      'Access-Control-Allow-Origin': '*',
    },
  });
}
