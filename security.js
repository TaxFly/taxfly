// ── TaxFly — hash del PIN offline (con sal) ─────────────────────────────────
// Antes se guardaba directo sha256(pin), sin sal — un PIN de 4-6 dígitos así
// se puede precomputar entero en una tabla arcoíris en segundos. Le agregamos
// una sal por usuario (el email offline cacheado, que ya vive en localStorage
// para esta misma función de PIN offline). No es una sal random por
// dispositivo a propósito: el hash se sincroniza a Firestore para poder
// entrar offline desde otro dispositivo, y ahí necesitamos que la sal sea la
// misma en todos lados — el email de la cuenta cumple ese rol.
window.hashPin = async function (pin) {
    const salt = localStorage.getItem('taxusa_offline_email') || localStorage.getItem('perfilActivoNombre') || 'taxfly';
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + '::' + pin));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};
