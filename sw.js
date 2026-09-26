const CACHE = "taxfly-splash-20260926-v1";

const TILES_CACHE = "taxfly-tiles-v1";

const MAX_TILES = 600;

const PRECACHE = [ "./login.html", "./selector.html", "./profiles.html", "./index.html", "./compras.html", "./itinerario.html", "./unidades.html", "./tickets.html", "./grupo.html", "./rutas.html", "./tax.html", "./offline.html", "./assets/style.css", "./assets/splash.css", "./config.js", "./assets/dialogs.js", "./assets/account.js", "./assets/recaptcha.js", "./assets/security.js", "./assets/settings.js", "./assets/ui.css", "./assets/taxie-widget.css", "./assets/ui.js", "./assets/backup.js", "./manifest.json", "./assets/icon-512.png", "./assets/icon-192.png", "./Maps/index.html", "./Maps/Mis_cosas_de_viaje.html", "./Maps/styles.css", "./Maps/sx.css", "./Maps/app.js", "./Maps/theme.js", "./Maps/firebase-sync.js", "./Maps/mis-cosas-firebase.js", "./Maps/sx-ui.js", "./Maps/i18n.js", "./Maps/i18n-orlando.js", "./Maps/i18n-mis.js", "./Maps/vendor-xlsx.min.js", "./Maps/manifest.json", "./Maps/favicon.png", "./Maps/apple-touch-icon-viaje.png", "./Maps/favicon-viaje.png", "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js" ];

const OFFLINE_FALLBACK = "./offline.html";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(PRECACHE.map(url => cache.add(url).catch(err => {
    console.warn("[SW] No se pudo cachear:", url, err);
  })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== TILES_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trimTileCache() {
  const cache = await caches.open(TILES_CACHE);
  const keys = await cache.keys();
  if (keys.length <= MAX_TILES) return;
  const toDelete = keys.slice(0, keys.length - MAX_TILES);
  await Promise.all(toDelete.map(k => cache.delete(k)));
}

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.protocol === "chrome-extension:") return;
  const networkOnly = [ "dolarapi.com", "open.er-api.com", "queue-times.com", "firebaseapp.com", "googleapis.com", "securetoken.googleapis.com", "firebaseio.com", "firestore.googleapis.com", "corsproxy.io", "recaptcha", "taxfly-claude", "taxusa-proxy", "taxusa.juanbria18.workers.dev", "groq", "llama", "anthropic", "osrm", "generate_204" ];
  if (networkOnly.some(d => url.href.includes(d))) return;
  if (/(^|\.)tile\.openstreetmap\.org$/.test(url.hostname)) {
    e.respondWith(caches.open(TILES_CACHE).then(cache => cache.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          cache.put(e.request, res.clone()).then(trimTileCache);
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })));
    return;
  }
  if (url.href.includes("fonts.googleapis.com") || url.href.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })));
    return;
  }
  if (url.href.includes("gstatic.com/firebasejs")) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })));
    return;
  }
  if (url.href.includes("flagcdn.com") || url.href.includes("flagpedia.net")) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => new Response(null, {
      status: 404
    })))));
    return;
  }
  if (url.origin === self.location.origin && e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(fetchWithTimeout(e.request, 8e3).then(res => {
      if (res && res.status === 200) {
        caches.open(CACHE).then(cache => cache.put(e.request, res.clone())).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match(e.request, {
      ignoreSearch: true
    }) || caches.match(OFFLINE_FALLBACK))));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(cached => {
      if (cached) {
        fetch(e.request).then(res => {
          if (res && res.ok) cache.put(e.request, res.clone());
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(res => {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => {
        if (e.request.headers.get("accept")?.includes("text/html")) {
          return caches.match(OFFLINE_FALLBACK);
        }
        return new Response(null, {
          status: 503
        });
      });
    })));
    return;
  }
  e.respondWith(fetch(e.request).then(res => {
    if (res && (res.ok || res.type === "opaque")) {
      const resToCache = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, resToCache));
    }
    return res;
  }).catch(() => caches.match(e.request)));
});

self.addEventListener("message", e => {
  if (e.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data?.type === "CLEAR_CACHE") {
    caches.delete(CACHE).then(() => e.ports[0]?.postMessage({
      ok: true
    }));
  }
});

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(r => {
      clearTimeout(timer);
      resolve(r);
    }).catch(e => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

const BUDGET_NOTIF_TEXTS = {
  es: {
    70: {
      title: "⚠️ Presupuesto al 70%",
      body: "Llevás gastado el 70% de tu presupuesto de viaje."
    },
    90: {
      title: "🚨 Presupuesto al 90%",
      body: "¡Cuidado! Solo te queda el 10% del presupuesto."
    },
    100: {
      title: "🔴 Presupuesto agotado",
      body: "Superaste tu presupuesto total de viaje."
    }
  },
  en: {
    70: {
      title: "⚠️ Budget at 70%",
      body: "You've used 70% of your travel budget."
    },
    90: {
      title: "🚨 Budget at 90%",
      body: "Almost there! Only 10% of your budget left."
    },
    100: {
      title: "🔴 Budget exceeded",
      body: "You've gone over your travel budget."
    }
  },
  pt: {
    70: {
      title: "⚠️ Orçamento em 70%",
      body: "Você usou 70% do seu orçamento de viagem."
    },
    90: {
      title: "🚨 Orçamento em 90%",
      body: "Cuidado! Só restam 10% do orçamento."
    },
    100: {
      title: "🔴 Orçamento esgotado",
      body: "Você ultrapassou o orçamento total de viagem."
    }
  }
};

self.addEventListener("push", e => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (_) {}
  const pct = data.pct || 70;
  const lang = data.lang || "es";
  const url = data.url || "./compras.html";
  const spentN = data.spent ? Number(data.spent).toFixed(0) : null;
  const budgetN = data.budget ? Number(data.budget).toFixed(0) : null;
  const texts = (BUDGET_NOTIF_TEXTS[lang] || BUDGET_NOTIF_TEXTS.es)[pct] || BUDGET_NOTIF_TEXTS.es[70];
  const body = spentN && budgetN ? `${texts.body} (USD ${spentN} / ${budgetN})` : texts.body;
  e.waitUntil(self.registration.showNotification(texts.title, {
    body: body,
    icon: "./assets/icon-192.png",
    badge: "./assets/icon-192.png",
    tag: "budget-alert-" + pct,
    renotify: true,
    vibrate: [ 200, 100, 200 ],
    data: {
      url: url
    },
    actions: [ {
      action: "open",
      title: "📊 Ver gastos"
    }, {
      action: "dismiss",
      title: "✕ Cerrar"
    } ]
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "dismiss") return;
  const targetUrl = e.notification.data && e.notification.data.url || "./compras.html";
  e.waitUntil(clients.matchAll({
    type: "window",
    includeUncontrolled: true
  }).then(list => {
    for (const client of list) {
      if (client.url.includes("compras") && "focus" in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(targetUrl);
  }));
});