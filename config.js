window.TAXFLY_CONFIG = {
    WORKER_URL: 'https://taxfly-claude.juanbria18.workers.dev',
    FIREBASE_SDK: 'https://www.gstatic.com/firebasejs/12.12.1',
    // Config del proyecto de Firebase — antes estaba copiada y pegada en 12
    // archivos (todas las páginas de TaxFly + Maps). Si alguna vez hay que
    // rotar la apiKey o cambiar de proyecto, esto se toca en un solo lugar.
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyA-eeKl8guVDmTa_NpYvkB0O7-RMbPrkP0",
        authDomain: "viajes-db538.firebaseapp.com",
        projectId: "viajes-db538",
        storageBucket: "viajes-db538.firebasestorage.app",
        messagingSenderId: "237311739178",
        appId: "1:237311739178:web:333e468b184c0402a98a53",
    },
};

// ── Llamada al worker ────────────────────────────────────────────────────────
// Adjunta el ID token del usuario logueado (Authorization: Bearer ...). El
// worker lo exige para todo lo que gasta crédito de Anthropic. Si no hay
// sesión (ej. reCAPTCHA en el login) manda la request sin token.
// Importa firebase-auth desde la MISMA URL que las páginas, así el navegador
// reusa la misma instancia del módulo y getAuth() devuelve la sesión actual.
window.taxflyWorker = async function (body) {
    const headers = { 'Content-Type': 'application/json' };
    try {
        const { getApps } = await import(window.TAXFLY_CONFIG.FIREBASE_SDK + '/firebase-app.js');
        if (getApps().length) {
            const { getAuth } = await import(window.TAXFLY_CONFIG.FIREBASE_SDK + '/firebase-auth.js');
            const auth = getAuth();
            if (auth.authStateReady) await auth.authStateReady();
            if (auth.currentUser) headers.Authorization = 'Bearer ' + await auth.currentUser.getIdToken();
        }
    } catch (e) { /* sin sesión: sigue sin token */ }
    return fetch(window.TAXFLY_CONFIG.WORKER_URL, { method: 'POST', headers, body: JSON.stringify(body) });
};

// ── Actividad reciente (para el PIN offline) ────────────────────────────────
// login.html pedía el PIN offline cada vez que la app arrancaba sin conexión,
// aunque hubieras entrado hace un minuto. Esto guarda "cuándo se usó por
// última vez cualquier página de la app" en localStorage (compartido por
// TaxFly y Maps, mismo origen), para que login.html pueda saltear el PIN si
// hubo uso reciente. Se actualiza solo, en todas las páginas que cargan
// config.js, sin que cada una tenga que acordarse de hacerlo.
(function () {
    const KEY = 'taxfly_last_activity';
    function touch() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
    touch(); // esta página se está usando ahora mismo
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') touch(); });
    // Mientras la pestaña siga abierta y visible, "seguir usando la app"
    // cuenta como actividad aunque no dispares ningún evento puntual.
    setInterval(() => { if (document.visibilityState === 'visible') touch(); }, 5 * 60 * 1000);
    window.taxflyTouchActivity = touch;
    window.taxflyMinutesSinceActivity = function () {
        const last = parseInt(localStorage.getItem(KEY), 10) || 0;
        return (Date.now() - last) / 60000;
    };
})();
