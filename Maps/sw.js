// Service worker — deja usable el checklist (Outlets/Comidas/Market/Parques)
// sin señal, típico en un parque con wifi malo o sin datos.
// Si tocás app.js/styles.css y no ves el cambio reflejado, subí CACHE_VERSION.
const CACHE_VERSION = 'v30';
const CACHE_NAME = 'orlando-planning-' + CACHE_VERSION;
// Cache aparte para los tiles del mapa (OpenStreetMap): así el mapa del
// día funciona sin señal (típico en un parque con wifi malo). Se recorta
// solo por cantidad de tiles, para no crecer sin límite.
const TILES_CACHE_NAME = 'orlando-tiles-v1';
const MAX_TILES = 600;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './theme.js',
  './firebase-sync.js',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './vendor-xlsx.min.js',
  './Mis_cosas_de_viaje.html',
  './mis-cosas-firebase.js',
  './sx.css',
  './sx-ui.js',
  './i18n.js',
  './i18n-orlando.js',
  './i18n-mis.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== CACHE_NAME && k !== TILES_CACHE_NAME)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Recorta el cache de tiles cuando se pasa de MAX_TILES, borrando las
// entradas más viejas (el orden de caches.keys() sigue el de inserción).
async function trimTileCache() {
  const cache = await caches.open(TILES_CACHE_NAME);
  const keys = await cache.keys();
  if (keys.length <= MAX_TILES) return;
  const toDelete = keys.slice(0, keys.length - MAX_TILES);
  await Promise.all(toDelete.map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Firestore / Firebase: siempre red, la app ya maneja el offline de datos
  // con localStorage — no queremos servir una respuesta vieja acá.
  if (url.hostname.includes('firestore') || url.hostname.includes('firebaseio')) return;

  // App shell propio: NETWORK-FIRST. Mientras la app siga cambiando tan
  // seguido, priorizamos siempre traer la versión más nueva si hay señal
  // — cache-first ya nos hizo servir JS viejo más de una vez (por eso el
  // bug de "entro con un perfil nuevo y veo datos de otro perfil": no
  // eran los datos, era código viejo). Si no hay señal, recién ahí cae
  // al cache, para que la PWA siga abriendo en el parque sin wifi.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        // Clonar YA, antes de devolver la respuesta: si se clona más
        // tarde (ej. dentro de otro .then), el navegador puede haber
        // empezado a consumir el body y el clone() falla ("Response
        // body is already used").
        if (res && res.ok) {
          const resToCache = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resToCache));
        }
        return res;
      }).catch(async () => (await caches.match(req))
        || (await caches.match(req, { ignoreSearch: true }))          // ej. Mis_cosas_de_viaje.html?sec=dia sin señal
        || (req.mode === 'navigate' ? await caches.match('./index.html') : undefined))
    );
    return;
  }

  // Tiles del mapa (OpenStreetMap): cache-first + refresco en segundo plano.
  // Así, si ya se vio el mapa de un día una vez, queda disponible sin señal
  // (el objetivo es poder usarlo en el parque sin datos).
  if (/(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)) {
    event.respondWith(
      caches.open(TILES_CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req).then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              cache.put(req, res.clone()).then(trimTileCache);
            }
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  // Otros recursos externos (fuente, Leaflet, OSRM): network-first con
  // fallback a cache, para no pisar una versión nueva pero sí poder
  // seguir usándolos offline.
  event.respondWith(
    fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) {
        const resToCache = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, resToCache));
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
