/* Decide cómo habla Firestore con el servidor:
 *  - directo a firestore.googleapis.com (lo normal), o
 *  - a través del proxy propio (sync-worker/) cuando un bloqueador de anuncios corta el dominio de
 *    Google (net::ERR_BLOCKED_BY_CLIENT).
 * Uso: initializeFirestore(app, { ...(await fsNet()), ... }).
 * Si en pleno uso se detecta que el canal no funciona, fsNetFailover() cambia de ruta y recarga una vez. */
const BUILD = "2026-10-02-c";
const KEY = "taxfly_fs_route_v1";
const FAILOVER_FLAG = "taxfly_fs_failover";
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

// Prueba las mismas rutas que usa el SDK (canal Listen y commit): las listas de filtros suelen
// bloquear por ruta, no solo por dominio. "blocked" = el navegador/extensión cortó el pedido.
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

// El proxy tiene que ser realmente NUESTRO Worker: una URL de workers.dev sin desplegar también "responde" (404),
// así que se verifica su /__ping con CORS y se lee el contenido.
async function proxyAlive(host) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_MS);
  try {
    const r = await fetch("https://" + host + "/__ping", { cache: "no-store", credentials: "omit", signal: ctrl.signal });
    if (!r.ok) return false;
    const j = await r.json();
    return !!(j && j.ok === true && j.service === "taxfly-sync");
  } catch (e) { return false; } finally { clearTimeout(timer); }
}

async function proxyUsable(host) {
  return (await proxyAlive(host)) && (await reachable(host)) !== "blocked";
}

async function decide() {
  const proxy = cfg().FIRESTORE_PROXY_HOST;
  if (!proxy) return {};
  // Forzar para pruebas: ?fs=proxy | ?fs=direct (queda guardado hasta ?fs=auto)
  try {
    const q = new URLSearchParams(location.search).get("fs");
    if (q === "auto") { localStorage.removeItem(KEY); sessionStorage.removeItem(FAILOVER_FLAG); }
    else if (q === "proxy" || q === "direct") writeCache(q);
  } catch (e) {}
  const cached = readCache();
  if (!navigator.onLine) return settingsFor(cached && cached.mode, proxy);
  if (cached && Date.now() - cached.t < TTL) return settingsFor(cached.mode, proxy);
  const direct = await reachable(DIRECT);
  if (direct !== "blocked") {
    if (direct === "ok") writeCache("direct");
    return {};
  }
  // Bloqueado: usar el proxy solo si realmente responde (si no, es falta de red o el Worker no está desplegado).
  if (await proxyUsable(proxy)) {
    writeCache("proxy");
    return settingsFor("proxy", proxy);
  }
  console.warn("[taxfly] Firestore parece bloqueado y el proxy (" + proxy + ") no responde: ¿está desplegado sync-worker?");
  return {};
}

let decision;
export function fsNet() {
  if (!decision) decision = decide().then(s => { window.taxflyFsRoute = s.host ? "proxy" : "direct"; return s; }, () => ({}));
  return decision;
}

// Fuerza una nueva prueba en la próxima carga.
export function fsNetReset() { try { localStorage.removeItem(KEY); } catch (e) {} }

// Se llama cuando el canal no funciona (escrituras sin confirmar, ningún dato del servidor, etc.):
// prueba la otra ruta y, si anda, cambia y recarga UNA vez por sesión. Devuelve true si va a recargar.
export async function fsNetFailover() {
  try {
    const proxy = cfg().FIRESTORE_PROXY_HOST;
    if (!proxy || !navigator.onLine || sessionStorage.getItem(FAILOVER_FLAG)) { fsNetReset(); return false; }
    const current = window.taxflyFsRoute === "proxy" ? "proxy" : "direct";
    const other = current === "proxy" ? "direct" : "proxy";
    const ok = other === "proxy" ? await proxyUsable(proxy) : (await reachable(DIRECT)) === "ok";
    if (!ok) { fsNetReset(); return false; }
    sessionStorage.setItem(FAILOVER_FLAG, "1");
    writeCache(other);
    console.warn("[taxfly] Cambiando la ruta de Firestore: " + current + " → " + other);
    location.reload();
    return true;
  } catch (e) { return false; }
}

// Diagnóstico: en la consola del navegador, ejecutar  taxflyDiag()  y copiar el resultado.
window.taxflyBuild = BUILD;
window.taxflyDiag = async () => {
  const proxy = cfg().FIRESTORE_PROXY_HOST || null;
  const out = {
    build: BUILD,
    online: navigator.onLine,
    ruta: window.taxflyFsRoute || "(sin decidir)",
    cache: readCache(),
    proxy,
    pruebaDirecta: await reachable(DIRECT),
    proxyPing: proxy ? await proxyAlive(proxy) : null,
    proxyRutas: proxy ? await reachable(proxy) : null,
    cachesSW: await (window.caches ? caches.keys() : Promise.resolve([])).catch(() => []),
    pendientes: Object.keys(localStorage).filter(k => k.startsWith("taxusa_pending_ops")).map(k => {
      try { return [k, JSON.parse(localStorage.getItem(k) || "[]").length]; } catch (e) { return [k, "?"]; }
    })
  };
  console.log(JSON.stringify(out, null, 2));
  return out;
};
console.info("[taxfly] fs-net build " + BUILD);
