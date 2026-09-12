export default {
  async fetch(request, env) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (body.type === 'invoice_ocr' || body.type === 'insurance_analysis') {
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return json({ error: 'Anthropic API key not configured' }, 500);
      return body.type === 'invoice_ocr' ? handleInvoice(body, apiKey) : handleInsurance(body, apiKey);
    }
    if (body.type === 'verify_recaptcha') return handleRecaptcha(body, env);
    if (body.type === 'moderate_image') return handleModerate(body, env);
    return json({ error: 'Unknown or missing "type" (expected invoice_ocr, insurance_analysis, verify_recaptcha or moderate_image)' }, 400);
  },
};

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

// ── Moderación de avatares (Groq Vision) ──────────────────
async function handleModerate(body, env) {
  const { imageBase64, mediaType = 'image/jpeg' } = body;
  if (!imageBase64) return json({ error: 'Missing imageBase64' }, 400);

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return json({ error: 'API key not configured' }, 500);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 200,
        messages: [
          {
            role: 'system',
            content: `Eres un moderador de contenido para una app de perfiles. Analizá la imagen y respondé SOLO con un objeto JSON con esta estructura exacta:
{"approved": true|false, "reason": "breve explicación en español"}

Rechazá (approved: false) si la imagen contiene:
- Contenido sexual, desnudez o pornografía (incluyendo genitales)
- Violencia extrema, gore o imágenes perturbadoras
- Personajes de ficción con copyright claro (Disney, Marvel, anime famosos, etc.)
- Logos o marcas registradas como elemento principal
- Contenido de odio, símbolos nazis o extremistas

Aprobá (approved: true) si es una foto de persona real, paisaje, mascota, ilustración genérica, o similar.
No incluyas texto fuera del JSON.`
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
              { type: 'text', text: '¿Esta imagen es apropiada para un avatar de perfil de usuario?' }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Groq error:', err);
      return json({ error: 'Upstream API error', detail: err }, 502);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const result = tryParseJson(text);
    if (!result) return json({ error: 'Could not parse moderation result' }, 502);
    return json(result);

  } catch (err) {
    console.error('moderate handler error:', err);
    return json({ error: 'Internal error', detail: err.message }, 500);
  }
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
