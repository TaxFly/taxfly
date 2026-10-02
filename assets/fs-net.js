/* Decide cómo habla Firestore con el servidor:
 *  - directo a firestore.googleapis.com (lo normal), o
 *  - a través del proxy propio (sync-worker/) cuando un bloqueador de anuncios
 *    corta el dominio de Google (net::ERR_BLOCKED_BY_CLIENT).
 * La decisión se prueba una vez, se guarda unas horas y se aplica con
 * initializeFirestore(app, { ...(await fsNet()), ... }). */
const KEY = "taxfly_fs_route_v1";
const TTL = 6 * 3600 * 1000;
const PROBE_MS = 3500;
const DIRECT = "firestore.googleapis.com";

const cfg = () => window.TAXFLY_CONFIG || {};
const project = () => (cfg().FIREBASE_CONFIG || {}).projectId || "";
const settingsFor = (mode, proxy) => (mode === "proxy" && proxy ? { host: proxy, ssl: true } : {});

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    return c && (c.mode === "proxy" || c.mode === "direct") ? c : null;
  } catch (e) { return null; }
}
function writeCache(mode) {
  try { localStorage.setItem(KEY, JSON.stringify({ mode, t: Date.now() })); } catch (e) {}
}

// Prueba las mismas rutas que usa el SDK (canal Listen y commit): las listas de
// filtros suelen bloquear por ruta, no solo por dominio.
async function reachable(host) {
  const db = encodeURIComponent("projects/" + project() + "/databases/(default)");
  const urls = [
    "https://" + host + "/google.firestore.v1.Firestore/Listen/channel?VER=8&database=" + db + "&RID=rpc&SID=probe&AID=0&CI=0&TYPE=xmlhttp&t=1",
    "https://" + host + "/v1/projects/" + project() + "/databases/(default)/documents:commit"
  ];
  const results = await Promise.all(urls.map(async url => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROBE_MS);
    try {
      await fetch(url, { mode: "no-cors", cache: "no-store", credentials: "omit", signal: ctrl.signal });
      return "ok";
    } catch (e) {
      return e && e.name === "AbortError" ? "timeout" : "blocked";
    } finally { clearTimeout(timer); }
  }));
  return results.includes("blocked") ? "blocked" : results.includes("timeout") ? "timeout" : "ok";
}

async function decide() {
  const proxy = cfg().FIRESTORE_PROXY_HOST;
  if (!proxy) return {};
  // Forzar para pruebas: ?fs=proxy | ?fs=direct (queda guardado hasta ?fs=auto)
  try {
    const q = new URLSearchParams(location.search).get("fs");
    if (q === "auto") localStorage.removeItem(KEY);
    else if (q === "proxy" || q === "direct") { writeCache(q); }
  } catch (e) {}
  const cached = readCache();
  if (!navigator.onLine) return settingsFor(cached && cached.mode, proxy);
  if (cached && Date.now() - cached.t < TTL) return settingsFor(cached.mode, proxy);
  const direct = await reachable(DIRECT);
  if (direct !== "blocked") {
    if (direct === "ok") writeCache("direct");
    return {};
  }
  // Bloqueado: usar el proxy solo si realmente responde (si no, es falta de red).
  if ((await reachable(proxy)) === "ok") {
    writeCache("proxy");
    return settingsFor("proxy", proxy);
  }
  return {};
}

let decision;
export function fsNet() {
  if (!decision) decision = decide().then(s => { window.taxflyFsRoute = s.host ? "proxy" : "direct"; return s; }, () => ({}));
  return decision;
}
// Llamar cuando falle el canal en tiempo real: fuerza una nueva prueba en la próxima carga.
export function fsNetReset() { try { localStorage.removeItem(KEY); } catch (e) {} }
