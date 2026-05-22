export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileBase64, mediaType, docName } = req.body;

  if (!fileBase64 || !mediaType || !docName) {
    return res.status(400).json({ error: 'Missing required fields: fileBase64, mediaType, docName' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
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
        { type: 'text', text: prompt }
      ]
    : [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
        { type: 'text', text: prompt }
      ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Upstream API error', detail: err });
    }

    const data = await response.json();
    const text = (data.content || []).map(c => c.text || '').join('').trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({
      insurer: parsed.insurer || null,
      phone:   parsed.phone   || null,
      name:    docName,
    });

  } catch (err) {
    console.error('analyze-insurance handler error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
