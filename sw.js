const CACHE = "taxfly-64e4e08a0a88";

const TILES_CACHE = "taxfly-tiles-v1";

const MAX_TILES = 600;

const PRECACHE = ["./login.html", "./selector.html", "./profiles.html", "./index.html", "./compras.html", "./itinerario.html", "./lugares.html", "./planificacion.html", "./assets/plan-cohesion.css", "./assets/mis-cohesion.css", "./assets/shared-chrome.css", "./404.html", "./unidades.html", "./tickets.html", "./grupo.html", "./rutas.html", "./tax.html", "./offline.html", "./assets/style.css", "./assets/cohesion.css", "./assets/map-links.js", "./assets/reconnect.js", "./assets/reconnect-sync.js", "./assets/fs-net.js", "./assets/group-exit.js", "./assets/localize.js", "./assets/splash.css", "./config.js", "./assets/dialogs.js", "./assets/account.js", "./assets/autofill.js", "./assets/numinput.js", "./assets/recaptcha.js", "./assets/security.js", "./assets/settings.js", "./assets/ui.css", "./assets/taxie-widget.css", "./assets/taxie-corner.css", "./assets/taxie.js", "./assets/ui.js", "./assets/ux.js", "./assets/ux.css", "./assets/park-live.js", "./assets/trip-context.js", "./assets/docs-tree.js", "./assets/compras.js", "./assets/tax.js", "./assets/unidades-i18n.js", "./assets/unidades.js", "./assets/unidades-farma.js", "./assets/unidades-frases.js", "./assets/lugares.js", "./assets/lugares-ciudades.js", "./assets/lugares-selector.js", "./assets/tickets.js", "./assets/grupo.js", "./assets/grupo-ui.js", "./assets/mis-cosas.js", "./assets/rutas.js", "./assets/rutas-app.js", "./assets/trips-ui.js", "./assets/backup.js", "./assets/offline-status.js", "./assets/travel-tools.js", "./assets/document-links.js", "./assets/travel-tools.css", "./manifest.json", "./assets/icon-512.png", "./assets/icon-192.png", "./mis-cosas.html", "./assets/plan-styles.css", "./assets/app-settings.css", "./assets/plan-app.js", "./assets/plan-places.js", "./assets/plan-legacy-parks.js", "./assets/plan-reservations.js", "./assets/plan-theme.js", "./assets/plan-firebase.js", "./assets/mis-firebase.js", "./assets/app-settings.js", "./assets/plan-i18n.js", "./assets/plan-i18n-orlando.js", "./assets/mis-i18n.js", "./assets/index-app.js", "./assets/login-app.js", "./assets/profiles-app.js", "./assets/plan-vendor-xlsx.min.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js", "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js", "./europe.html", "./assets/europe.css", "./assets/app-routes.js", "./TaxEurope/unidades.html", "./TaxEurope/tax.html", "./TaxEurope/tickets.html", "./TaxEurope/selector.html", "./TaxEurope/planificacion.html", "./TaxEurope/lugares.html", "./TaxEurope/mis-cosas.html", "./TaxEurope/compras.html", "./TaxEurope/manifest.json", "./TaxEurope/dialogs.js", "./TaxEurope/404.html", "./TaxEurope/config.js", "./TaxEurope/rutas.html", "./TaxEurope/profiles.html", "./TaxEurope/itinerario.html", "./TaxEurope/grupo.html", "./TaxEurope/login.html", "./TaxEurope/index.html", "./TaxEurope/offline.html", "./TaxEurope/assets/toonHead-1777776300938.png", "./TaxEurope/assets/mis-i18n.js", "./TaxEurope/assets/plan-i18n.js", "./TaxEurope/assets/recaptcha.js", "./TaxEurope/assets/document-links.js", "./TaxEurope/assets/europe-tax.js", "./TaxEurope/assets/grupo.js", "./TaxEurope/assets/docs-tree.js", "./TaxEurope/assets/taxie.js", "./TaxEurope/assets/fs-net.js", "./TaxEurope/assets/adventurerNeutral-1778027686067.png", "./TaxEurope/assets/numinput.js", "./TaxEurope/assets/account.js", "./TaxEurope/assets/plan-firebase.js", "./TaxEurope/assets/funEmoji-1777776318834.png", "./TaxEurope/assets/offline-status.js", "./TaxEurope/assets/avataaarsNeutral-1777775836519.png", "./TaxEurope/assets/backup.js", "./TaxEurope/assets/europe-app.js", "./TaxEurope/assets/travel-tools.js", "./TaxEurope/assets/adventurerNeutral-1777776216395.png", "./TaxEurope/assets/map-links.js", "./TaxEurope/assets/app-settings.js", "./TaxEurope/assets/index-app.js", "./TaxEurope/assets/mis-firebase.js", "./TaxEurope/assets/avataaars-1777775817701.png", "./TaxEurope/assets/lugares-ciudades.js", "./TaxEurope/assets/adventurerNeutral-1778027689046.png", "./TaxEurope/assets/plan-cohesion.css", "./TaxEurope/assets/app-settings.css", "./TaxEurope/assets/ui.css", "./TaxEurope/assets/rutas-app.js", "./TaxEurope/assets/group-exit.js", "./TaxEurope/assets/plan-styles.css", "./TaxEurope/assets/tax.js", "./TaxEurope/assets/adventurerNeutral-1778027669500.png", "./TaxEurope/assets/taxie-corner.css", "./TaxEurope/assets/autofill.js", "./TaxEurope/assets/dialogs.js", "./TaxEurope/assets/login-app.js", "./TaxEurope/assets/plan-vendor-xlsx.min.js", "./TaxEurope/assets/ux.css", "./TaxEurope/assets/europe-data.js", "./TaxEurope/assets/funEmoji-1778027720162.png", "./TaxEurope/assets/ux.js", "./TaxEurope/assets/adventurerNeutral-1778027676790.png", "./TaxEurope/assets/plan-legacy-parks.js", "./TaxEurope/assets/reconnect.js", "./TaxEurope/assets/unidades-farma.js", "./TaxEurope/assets/reconnect-sync.js", "./TaxEurope/assets/settings.js", "./TaxEurope/assets/compras.js", "./TaxEurope/assets/adventurerNeutral-1778027684221.png", "./TaxEurope/assets/unidades-i18n.js", "./TaxEurope/assets/shared-chrome.css", "./TaxEurope/assets/icon-192.png", "./TaxEurope/assets/tickets.js", "./TaxEurope/assets/rutas.js", "./TaxEurope/assets/funEmoji-1778027718459.png", "./TaxEurope/assets/trips-ui.js", "./TaxEurope/assets/adventurerNeutral-1778027673553.png", "./TaxEurope/assets/europe-session.js", "./TaxEurope/assets/lugares-selector.js", "./TaxEurope/assets/plan-places.js", "./TaxEurope/assets/europe-region.js", "./TaxEurope/assets/splash.css", "./TaxEurope/assets/funEmoji-1777776315983.png", "./TaxEurope/assets/toonHead-1777776298831.png", "./TaxEurope/assets/adventurerNeutral-1778027664793.png", "./TaxEurope/assets/lugares.js", "./TaxEurope/assets/taxie-widget.css", "./TaxEurope/assets/profiles-app.js", "./TaxEurope/assets/unidades-frases.js", "./TaxEurope/assets/avataaars-1777775812674.png", "./TaxEurope/assets/funEmoji-1778027716106.png", "./TaxEurope/assets/mis-cosas.js", "./TaxEurope/assets/adventurerNeutral-1777776225455.png", "./TaxEurope/assets/park-live.js", "./TaxEurope/assets/plan-reservations.js", "./TaxEurope/assets/pixelArt-1777776289844.png", "./TaxEurope/assets/plan-theme.js", "./TaxEurope/assets/icon-512.png", "./TaxEurope/assets/micah-1777776263627.png", "./TaxEurope/assets/plan-i18n-orlando.js", "./TaxEurope/assets/grupo-ui.js", "./TaxEurope/assets/ui.js", "./TaxEurope/assets/style.css", "./TaxEurope/assets/adventurerNeutral-1778027680096.png", "./TaxEurope/assets/travel-tools.css", "./TaxEurope/assets/cohesion.css", "./TaxEurope/assets/localize.js", "./TaxEurope/assets/trip-context.js", "./TaxEurope/assets/europe.css", "./TaxEurope/assets/security.js", "./TaxEurope/assets/funEmoji-1777776311828.png", "./TaxEurope/assets/plan-app.js", "./TaxEurope/assets/unidades.js", "./TaxEurope/assets/mis-cohesion.css", "./TaxEurope/alojamiento.html", "./TaxEurope/assets/europe-core.js", "./TaxEurope/assets/europe-icon.svg", "./TaxEurope/assets/europe-native.css", "./TaxEurope/assets/europe-native.js", "./TaxEurope/assets/europe-rules.js", "./TaxEurope/assets/europe-store.js", "./TaxEurope/taxfree.html", "./TaxEurope/assets/europe-usa-layout.css", "./TaxEurope/assets/europe-chrome.css", "./TaxEurope/assets/europe-chrome.js"];

const OFFLINE_FALLBACK = "./offline.html";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async cache => {
    // Firebase modules are imported by the signed-in screens. They are as
    // essential as the local scripts for opening those screens offline.
    const required = PRECACHE.filter(url => url.startsWith("./") || url.includes("gstatic.com/firebasejs/"));
    await cache.addAll(required);
    const optional = PRECACHE.filter(url => !required.includes(url));
    await Promise.allSettled(optional.map(url => cache.add(url).catch(err => {
      console.warn("[SW] No se pudo cachear:", url, err);
    })));
    await self.skipWaiting();
  }));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("taxfly-") && k !== CACHE && k !== TILES_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
  const networkOnly = [ "dolarapi.com", "open.er-api.com", "queue-times.com", "firebaseapp.com", "googleapis.com", "securetoken.googleapis.com", "firebaseio.com", "firestore.googleapis.com", "corsproxy.io", "recaptcha", "taxfly-claude", "taxfly-sync", "taxusa-proxy", "taxusa.juanbria18.workers.dev", "groq", "llama", "anthropic", "osrm", "generate_204" ];
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
  if (url.origin === self.location.origin && /\.(?:js|css)$/.test(url.pathname)) {
    e.respondWith(fetchWithTimeout(new Request(e.request, { cache: "no-cache" }), 8e3).then(res => {
      if (res && res.ok) caches.open(CACHE).then(cache => cache.put(e.request, res.clone())).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || new Response(null, { status: 503 }))));
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
  if (e.data?.type === "OFFLINE_STATUS") {
    e.waitUntil(caches.open(CACHE).then(async cache => {
      const local = PRECACHE.filter(url => url.startsWith("./") || url.includes("gstatic.com/firebasejs/"));
      const missing = [];
      for (const url of local) if (!await cache.match(url)) missing.push(url);
      e.ports[0]?.postMessage({ready: missing.length === 0, total: local.length, missing: missing.length});
    }).catch(() => e.ports[0]?.postMessage({ready: false, missing: -1})));
  }
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
