const CACHE_VERSION = 'v51';
const CACHE_NAME = 'trip-planning-' + CACHE_VERSION;
const TILES_CACHE_NAME = 'orlando-tiles-v1';
const MAX_TILES = 600;

const APP_SHELL = [
  './index.html',
  './Mis_cosas_de_viaje.html',
  './mis-cosas-firebase.js',
  './sx.css',
  './sx-ui.js',
  './i18n.js',
  './i18n-mis.js',
  '../assets/trip-context.js',
  '../assets/cohesion.css',
  '../assets/autofill.js'
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
        .filter((k) => k.startsWith('trip-planning-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

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

  if (url.hostname.includes('firestore') || url.hostname.includes('firebaseio')) return;

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const resToCache = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, resToCache));
        }
        return res;
      }).catch(async () => (await caches.match(req))
        || (await caches.match(req, { ignoreSearch: true }))
        || (req.mode === 'navigate' ? await caches.match('./index.html') : undefined))
    );
    return;
  }

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
