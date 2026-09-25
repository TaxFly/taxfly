// ── TaxFly — reCAPTCHA v3 (lógica compartida) ───────────────────────────────
// Antes _rcToken/_rcCheck estaban copiados byte por byte en 4 páginas.
// La site key es pública por diseño de Google reCAPTCHA (no es un secreto).
const _RC_SITE_KEY = '6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME';

window._rcToken = async function (action) {
    return new Promise((resolve) => {
        if (typeof grecaptcha === 'undefined') { resolve(null); return; }
        grecaptcha.ready(() => grecaptcha.execute(_RC_SITE_KEY, { action }).then(resolve).catch(() => resolve(null)));
    });
};

window._rcCheck = async function (action) {
    const token = await window._rcToken(action);
    if (!token) return true;
    try {
        const r = await fetch(window.TAXFLY_CONFIG.WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'verify_recaptcha', token, action }),
        });
        if (!r.ok) return true;
        const d = await r.json();
        return d.success !== false;
    } catch { return true; }
};
