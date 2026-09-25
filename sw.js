// TaxFly Service Worker — único para todo el sitio (Tax + Maps/Orlando +
// Mis cosas de viaje), scope raíz. Antes Maps/ tenía su propio sw.js con su
// propio cache; ahora comparten éste, así una sola versión (CACHE) controla
// el refresco de todo. Recordá bumpear CACHE acá cada vez que cambies algo
// que esté en PRECACHE, para forzar el refresco completo.
const CACHE = 'taxfly-2b1dc709cc1d';
// Cache aparte para los tiles del mapa (OpenStreetMap) en Maps/itinerario:
// así el mapa del día funciona sin señal. Se recorta solo por cantidad de
// tiles, para no crecer sin límite.
const TILES_CACHE = 'taxfly-tiles-v1';
const MAX_TILES = 600;

const PRECACHE = [
    // ── TaxFly / TaxUSA ──
    './login.html',
    './selector.html',
    './profiles.html',
    './index.html',
    './compras.html',
    './itinerario.html',
    './unidades.html',
    './tickets.html',
    './grupo.html',
    './rutas.html',
    './tax.html',
    './offline.html',
    './assets/style.css',
    './config.js',
    './assets/dialogs.js',
    './assets/account.js',
    './assets/recaptcha.js',
    './assets/security.js',
    './assets/settings.js',
    './assets/ui.css',
    './assets/taxie-widget.css',
    './assets/ui.js',
    './assets/backup.js',
    './manifest.json',
    './assets/icon-512.png',
    './assets/icon-192.png',
    // ── Maps / Orlando Planning / Mis cosas de viaje ──
    './Maps/index.html',
    './Maps/Mis_cosas_de_viaje.html',
    './Maps/styles.css',
    './Maps/sx.css',
    './Maps/app.js',
    './Maps/theme.js',
    './Maps/firebase-sync.js',
    './Maps/mis-cosas-firebase.js',
    './Maps/sx-ui.js',
    './Maps/i18n.js',
    './Maps/i18n-orlando.js',
    './Maps/i18n-mis.js',
    './Maps/vendor-xlsx.min.js',
    './Maps/manifest.json',
    './Maps/favicon.png',
    './Maps/apple-touch-icon-viaje.png',
    './Maps/favicon-viaje.png',
    // Firebase SDK — necesario para que las páginas con sesión funcionen offline
    'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js',
    'https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js',
];

const OFFLINE_FALLBACK = './offline.html';

// ── Install: precachear con Promise.allSettled para que un fallo
//    no rompa todo el proceso de instalación ──
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache =>
            Promise.allSettled(PRECACHE.map(url =>
                cache.add(url).catch(err => {
                    console.warn('[SW] No se pudo cachear:', url, err);
                })
            ))
        ).then(() => self.skipWaiting())
    );
});

// ── Activate: limpiar cachés viejos ──
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE && k !== TILES_CACHE).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Recorta el cache de tiles cuando se pasa de MAX_TILES, borrando las
// entradas más viejas (el orden de caches.keys() sigue el de inserción).
async function trimTileCache() {
    const cache = await caches.open(TILES_CACHE);
    const keys = await cache.keys();
    if (keys.length <= MAX_TILES) return;
    const toDelete = keys.slice(0, keys.length - MAX_TILES);
    await Promise.all(toDelete.map(k => cache.delete(k)));
}

// ── Fetch ──
self.addEventListener('fetch', e => {
    // Ignorar peticiones no-GET
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);

    // Ignorar extensiones de Chrome
    if (url.protocol === 'chrome-extension:') return;

    // ── 1. APIs externas y Firebase (Auth/Firestore) — siempre red ──
    const networkOnly = [
        'dolarapi.com', 'open.er-api.com', 'queue-times.com',
        'firebaseapp.com', 'googleapis.com',
        'securetoken.googleapis.com', 'firebaseio.com', 'firestore.googleapis.com',
        'corsproxy.io', 'recaptcha',
        'taxfly-claude', 'taxusa-proxy', 'taxusa.juanbria18.workers.dev',
        'groq', 'llama', 'anthropic',
        'osrm', // servicio de rutas de Maps: siempre fresco
        'generate_204',   // probe de conectividad — nunca cachear
    ];
    if (networkOnly.some(d => url.href.includes(d))) return;

    // ── 2. Tiles del mapa (OpenStreetMap, usado en Maps/itinerario) →
    //    Cache First + refresco en background, para verse sin señal ──
    if (/(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)) {
        e.respondWith(
            caches.open(TILES_CACHE).then(cache =>
                cache.match(e.request).then(cached => {
                    const network = fetch(e.request).then(res => {
                        if (res && (res.ok || res.type === 'opaque')) {
                            cache.put(e.request, res.clone()).then(trimTileCache);
                        }
                        return res;
                    }).catch(() => cached);
                    return cached || network;
                })
            )
        );
        return;
    }

    // ── 3. Google Fonts → Stale While Revalidate ──
    if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
        e.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(e.request).then(cached => {
                    const fetchPromise = fetch(e.request)
                        .then(res => {
                            if (res && res.ok) cache.put(e.request, res.clone());
                            return res;
                        })
                        .catch(() => cached);
                    return cached || fetchPromise;
                })
            )
        );
        return;
    }

    // ── 4. Firebase SDK (gstatic) → Cache First con actualización en background ──
    // CRÍTICO para el modo offline: todas las páginas hacen `import ... from
    // "https://www.gstatic.com/firebasejs/..."` de forma estática. Si ese fetch
    // falla (sin red y sin este cacheo), el módulo entero no se ejecuta y
    // onAuthStateChanged nunca se dispara — la página queda colgada sin mostrar
    // el usuario ni entrar al modo offline ya implementado en el código.
    if (url.href.includes('gstatic.com/firebasejs')) {
        e.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(e.request).then(cached => {
                    const fetchPromise = fetch(e.request)
                        .then(res => {
                            if (res && res.ok) cache.put(e.request, res.clone());
                            return res;
                        })
                        .catch(() => cached);
                    return cached || fetchPromise;
                })
            )
        );
        return;
    }

    // ── 5. Flags CDN → Cache agresivo ──
    if (url.href.includes('flagcdn.com') || url.href.includes('flagpedia.net')) {
        e.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(e.request).then(r => r ||
                    fetch(e.request).then(res => {
                        if (res && res.ok) cache.put(e.request, res.clone());
                        return res;
                    }).catch(() => new Response(null, { status: 404 }))
                )
            )
        );
        return;
    }

    // ── 6. HTML propio → Network First con fallback a caché ──
    if (
        url.origin === self.location.origin &&
        e.request.headers.get('accept')?.includes('text/html')
    ) {
        e.respondWith(
            fetchWithTimeout(e.request, 8000)
                .then(res => {
                    if (res && res.status === 200) {
                        caches.open(CACHE).then(cache => cache.put(e.request, res.clone())).catch(() => {});
                    }
                    return res;
                })
                .catch(() =>
                    caches.match(e.request).then(cached =>
                        cached
                        || caches.match(e.request, { ignoreSearch: true }) // ej. Mis_cosas_de_viaje.html?sec=dia sin señal
                        || caches.match(OFFLINE_FALLBACK)
                    )
                )
        );
        return;
    }

    // ── 7. CSS, JS, imágenes locales → Cache First ──
    if (url.origin === self.location.origin) {
        e.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(e.request).then(cached => {
                    if (cached) {
                        // Actualizar en background sin bloquear
                        fetch(e.request).then(res => {
                            if (res && res.ok) cache.put(e.request, res.clone());
                        }).catch(() => {});
                        return cached;
                    }
                    return fetch(e.request).then(res => {
                        if (res && res.ok) cache.put(e.request, res.clone());
                        return res;
                    }).catch(() => {
                        if (e.request.headers.get('accept')?.includes('text/html')) {
                            return caches.match(OFFLINE_FALLBACK);
                        }
                        return new Response(null, { status: 503 });
                    });
                })
            )
        );
        return;
    }

    // ── 8. Otros recursos externos (Leaflet, fuentes sueltas, etc.) →
    //    Network First con fallback a cache ──
    e.respondWith(
        fetch(e.request).then(res => {
            if (res && (res.ok || res.type === 'opaque')) {
                const resToCache = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, resToCache));
            }
            return res;
        }).catch(() => caches.match(e.request))
    );
});

// ── Mensajes desde la app ──
self.addEventListener('message', e => {
    if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
    if (e.data?.type === 'CLEAR_CACHE') {
        caches.delete(CACHE).then(() => e.ports[0]?.postMessage({ ok: true }));
    }
});

// ── Helper: fetch con timeout ──
function fetchWithTimeout(request, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), ms);
        fetch(request)
            .then(r => { clearTimeout(timer); resolve(r); })
            .catch(e => { clearTimeout(timer); reject(e); });
    });
}


// ══════════════════════════════════════════════════════
// ── PUSH NOTIFICATIONS — alertas de presupuesto ───────
// ══════════════════════════════════════════════════════

// Textos por idioma para notificaciones disparadas desde el servidor
const BUDGET_NOTIF_TEXTS = {
    es: {
        70:  { title: '⚠️ Presupuesto al 70%',   body: 'Llevás gastado el 70% de tu presupuesto de viaje.' },
        90:  { title: '🚨 Presupuesto al 90%',   body: '¡Cuidado! Solo te queda el 10% del presupuesto.' },
        100: { title: '🔴 Presupuesto agotado',  body: 'Superaste tu presupuesto total de viaje.' },
    },
    en: {
        70:  { title: '⚠️ Budget at 70%',    body: "You've used 70% of your travel budget." },
        90:  { title: '🚨 Budget at 90%',    body: 'Almost there! Only 10% of your budget left.' },
        100: { title: '🔴 Budget exceeded',  body: "You've gone over your travel budget." },
    },
    pt: {
        70:  { title: '⚠️ Orçamento em 70%',   body: 'Você usou 70% do seu orçamento de viagem.' },
        90:  { title: '🚨 Orçamento em 90%',   body: 'Cuidado! Só restam 10% do orçamento.' },
        100: { title: '🔴 Orçamento esgotado', body: 'Você ultrapassou o orçamento total de viagem.' },
    },
};

// Evento push — payload JSON del servidor (Firebase Cloud Function):
// { pct: 70|90|100, lang: 'es'|'en'|'pt', spent: 123.45, budget: 500, url: '...' }
self.addEventListener('push', e => {
    let data = {};
    try { data = e.data ? e.data.json() : {}; } catch(_) {}

    const pct    = data.pct    || 70;
    const lang   = data.lang   || 'es';
    const url    = data.url    || './compras.html';
    const spentN  = data.spent  ? Number(data.spent).toFixed(0)  : null;
    const budgetN = data.budget ? Number(data.budget).toFixed(0) : null;

    const texts = (BUDGET_NOTIF_TEXTS[lang] || BUDGET_NOTIF_TEXTS.es)[pct]
                || BUDGET_NOTIF_TEXTS.es[70];

    const body = (spentN && budgetN)
        ? `${texts.body} (USD ${spentN} / ${budgetN})`
        : texts.body;

    e.waitUntil(
        self.registration.showNotification(texts.title, {
            body,
            icon:     './assets/icon-192.png',
            badge:    './assets/icon-192.png',
            tag:      'budget-alert-' + pct,
            renotify: true,
            vibrate:  [200, 100, 200],
            data:     { url },
            actions:  [
                { action: 'open',    title: '📊 Ver gastos' },
                { action: 'dismiss', title: '✕ Cerrar'      },
            ],
        })
    );
});

// Click en la notificación — abre/enfoca la app
self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'dismiss') return;

    const targetUrl = (e.notification.data && e.notification.data.url) || './compras.html';

    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            // Si ya hay una tab con compras abierta, enfocarla
            for (const client of list) {
                if (client.url.includes('compras') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abrir nueva
            if (clients.openWindow) return clients.openWindow(targetUrl);
        })
    );
});
