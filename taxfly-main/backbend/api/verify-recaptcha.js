export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, action } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Missing token' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // Si no está configurado el secret, dejar pasar (no bloquear al usuario)
    console.warn('RECAPTCHA_SECRET_KEY not configured — skipping verification');
    return res.status(200).json({ success: true, score: null, warning: 'reCAPTCHA not configured' });
  }

  try {
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
    });

    if (!verifyRes.ok) {
      console.error('Google reCAPTCHA API error:', verifyRes.status);
      return res.status(200).json({ success: true, warning: 'Verification service unavailable' });
    }

    const data = await verifyRes.json();

    // data.score va de 0.0 (bot) a 1.0 (humano)
    // Umbral recomendado: 0.5 — ajustable según necesidad
    const SCORE_THRESHOLD = 0.5;

    const isHuman =
      data.success === true &&
      (data.score === undefined || data.score >= SCORE_THRESHOLD) &&
      (!action || !data.action || data.action === action);

    if (!isHuman) {
      console.warn('reCAPTCHA rejected:', {
        success: data.success,
        score: data.score,
        action: data.action,
        errors: data['error-codes'],
      });
    }

    return res.status(200).json({
      success: isHuman,
      score: data.score ?? null,
    });

  } catch (err) {
    console.error('verify-recaptcha handler error:', err);
    // En caso de error inesperado, dejar pasar (mejor experiencia de usuario)
    return res.status(200).json({ success: true, warning: 'Verification failed silently' });
  }
}
