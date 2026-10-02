if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

const tr = window.tr || (x => x);

if (window.I18N) I18N.onChange(() => {
  try {
    render();
  } catch (e) {}
});

const SEC = {
  accesorios: {
    tab: "Accesorios",
    icon: "camera",
    titulo: "Mis accesorios",
    sub: "Tus cámaras y equipos",
    key: "items",
    def: "ambos",
    nuevo: "Agregar accesorio",
    editar: "Editar accesorio",
    buscar: "Buscar accesorio…",
    grupoLbl: "Dispositivos",
    cantLbl: "Cantidad",
    singular: "accesorio",
    plural: "accesorios",
    vacio: "Todavía no cargaste accesorios.",
    grupos: []
  },
  ropa: {
    tab: "Ropa de viaje",
    corto: "Ropa",
    icon: "shirt",
    titulo: "Ropa de viaje",
    sub: "Lo que llevo y lo que vuelve",
    key: "ropa",
    def: "otros",
    nuevo: "Agregar prenda",
    editar: "Editar prenda",
    buscar: "Buscar prenda…",
    grupoLbl: "Tipo",
    cantLbl: "Cantidad que llevo",
    singular: "prenda",
    plural: "prendas",
    vacio: "Todavía no cargaste ropa para el viaje.",
    grupos: [ [ "interior", "Ropa interior y medias", 3 ], [ "arriba", "Remeras y buzos", 0 ], [ "abajo", "Pantalones y shorts", 4 ], [ "abrigo", "Abrigo", 5 ], [ "calzado", "Calzado", 1 ], [ "otros", "Otros", 2 ] ]
  },
  esenciales: {
    tab: "Esenciales",
    icon: "list",
    titulo: "Esenciales",
    sub: "Documentos, higiene, electrónica y varios",
    key: "esenciales",
    def: "varios",
    nuevo: "Agregar esencial",
    editar: "Editar esencial",
    buscar: "Buscar…",
    grupoLbl: "Tipo",
    cantLbl: "Cantidad",
    singular: "ítem",
    plural: "ítems",
    vacio: "Todavía no cargaste esenciales.",
    grupos: [ [ "documentos", "Documentos", 0 ], [ "higiene", "Higiene y sol", 1 ], [ "electronica", "Electrónica", 4 ], [ "varios", "Varios", 2 ] ]
  }
};

const SECS = Object.keys(SEC);

const TABS = [ ...SECS, "dia" ];

const BOLSOS = [ [ "valija", "Valija grande" ], [ "carry", "Carry-on" ], [ "mochila", "Mochila" ] ];

const bolsoNombre = b => (BOLSOS.find(x => x[0] === b) || [ , "" ])[1];

let filtroBolso = {
  accesorios: "todos",
  ropa: "todos",
  esenciales: "todos"
};

let mochila = {
  hotel: [],
  parque: []
};

let mochilaPend = 0, dispPend = 0;

const ENLACES_DEF = [];

const enlaces = ENLACES_DEF;

const urlValida = u => {
  try {
    const x = new URL(u);
    return x.protocol === "https:" || x.protocol === "http:";
  } catch (e) {
    return false;
  }
};

const limpiaMochila = v => ({
  hotel: Array.isArray(v && v.hotel) ? v.hotel.filter(x => typeof x === "string") : [],
  parque: Array.isArray(v && v.parque) ? v.parque.filter(x => typeof x === "string") : []
});

const DEV_DEF = [ {
  id: "gopro",
  nombre: "GoPro",
  ci: 0
}, {
  id: "insta360",
  nombre: "Insta360",
  ci: 1
} ];

let dispositivos = DEV_DEF.map(d => ({
  ...d
}));

const limpiaDisp = v => Array.isArray(v) ? v.filter(d => d && typeof d.id === "string" && d.id && typeof d.nombre === "string" && d.nombre.trim()).map((d, i) => ({
  id: d.id.slice(0, 40),
  nombre: d.nombre.trim().slice(0, 30),
  ci: Number.isInteger(d.ci) ? (d.ci % 6 + 6) % 6 : i % 6
})) : DEV_DEF.map(d => ({
  ...d
}));

const devById = id => dispositivos.find(d => d.id === id);

const devsDe = i => [ ...new Set(i.dispositivos || []) ].filter(devById);

const legacyDevs = g => g === "ambos" ? [ "gopro", "insta360" ] : g === "gopro" || g === "insta360" ? [ g ] : [];

const grupoDe = (s, i) => {
  if (s !== "accesorios") return i.grupo;
  const d = devsDe(i);
  return d.length === 0 ? "_none" : d.length === 1 ? d[0] : "_multi";
};

const gruposDe = s => s !== "accesorios" ? SEC[s].grupos : [ ...dispositivos.map(d => [ d.id, d.nombre, d.ci ]), [ "_multi", "Varios dispositivos", 3 ], [ "_none", "Sin dispositivo", 6 ] ];

const gInfo = (s, g) => {
  const L = gruposDe(s);
  return L.find(x => x[0] === g) || (s === "accesorios" ? L[L.length - 1] : L.find(x => x[0] === SEC[s].def));
};

let data = {
  accesorios: [],
  ropa: [],
  esenciales: []
};

let sec = "accesorios";

try {
  const u = localStorage.getItem("seccion");
  if (TABS.includes(u)) sec = u;
} catch (e) {}

try {
  const u = new URLSearchParams(location.search).get("sec");
  if (TABS.includes(u)) sec = u;
} catch (e) {}

let filtro = {
  accesorios: "todos",
  ropa: "todos",
  esenciales: "todos"
};

let busqueda = "";

let control = false;

let soloFalta = false;

let modo = null;

let DB = null;

const overrides = {};

const cadenas = {};

const timers = {};

const $ = s => document.querySelector(s);

const ICONS = {
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>',
  shirt: '<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z"/>',
  list: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  backpack: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/><path d="M8 10h8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  upRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  more: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  upload: '<path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-4.5-4.5L6 21"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  cloudOff: '<path d="m2 2 20 20"/><path d="M5.8 5.8A7 7 0 0 0 7 19.5h10.5a4.5 4.5 0 0 0 1.6-.3"/><path d="M20.5 15.2A4.5 4.5 0 0 0 17.5 8h-1.3A7 7 0 0 0 9 4.5"/>',
  settings: '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z"/>',
  auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  logout: '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9"/>',
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  camIcon: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.2"/>'
};

const ic = (n, sz = 16) => `<svg class="ic" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;

function hidratar(root = document) {
  root.querySelectorAll("i[data-ic]").forEach(el => {
    el.outerHTML = ic(el.dataset.ic, +el.dataset.s || 16);
  });
}

hidratar();

let _lg = 0;

const LOGO_SVG = {
  taxusa: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="__ID__tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#2563eb"/></linearGradient><clipPath id="__ID__tc"><rect width="32" height="32" rx="10"/></clipPath></defs><rect width="32" height="32" rx="10" fill="url(#__ID__tg)"/><g clip-path="url(#__ID__tc)"><path d="M-2 19.4 C6 15.2 10 15.2 16 19.4 S26 23.599999999999998 34 18.4" stroke="#ef4444" stroke-width="2.9" stroke-linecap="round"/><path d="M-2 23.6 C6 19.400000000000002 10 19.400000000000002 16 23.6 S26 27.8 34 22.6" stroke="#fff" stroke-width="2.9" stroke-linecap="round"/><path d="M-2 27.8 C6 23.6 10 23.6 16 27.8 S26 32.0 34 26.8" stroke="#ef4444" stroke-width="2.9" stroke-linecap="round"/></g><polygon points="16.00,3.90 17.65,8.32 22.37,8.53 18.68,11.47 19.94,16.02 16.00,13.41 12.06,16.02 13.32,11.47 9.63,8.53 14.35,8.32" fill="#fff" stroke="#fff" stroke-width=".6" stroke-linejoin="round"/></svg>`,
  orlando: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="__ID__og" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0891b2"/><stop offset="1" stop-color="#2563eb"/></linearGradient><clipPath id="__ID__cog"><rect width="32" height="32" rx="10"/></clipPath></defs><rect width="32" height="32" rx="10" fill="url(#__ID__og)"/><g clip-path="url(#__ID__cog)"><path d="M-2 27.6 C6 24.4 10 24.4 16 27.6 S26 30.8 34 26.8" stroke="#fff" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round" fill="none"/></g><path d="M16 3.6c-4.9 0-8.6 3.7-8.6 8.5 0 5.6 5.7 10.4 8.6 13.2 2.9-2.8 8.6-7.6 8.6-13.2 0-4.8-3.7-8.5-8.6-8.5Z" fill="#fff"/><polygon points="16.00,7.40 17.14,10.44 20.37,10.58 17.84,12.60 18.70,15.72 16.00,13.93 13.30,15.72 14.16,12.60 11.63,10.58 14.86,10.44" fill="url(#__ID__og)"/></svg>`
};

function logo(tipo, sz = 20) {
  const svg = LOGO_SVG[tipo];
  if (!svg) return ic("link", 14);
  _lg++;
  return svg.replace(/__ID__/g, "lg" + _lg + "_").replace("<svg", `<svg width="${sz}" height="${sz}"`);
}

const tipoLogo = e => /orlando|\/maps\b/i.test(e.nombre + " " + e.url) ? "orlando" : /taxusa|taxfly/i.test(e.nombre + " " + e.url) ? "taxusa" : "";

let _confOk = null;

function confirmar(titulo, msg, ok = "Sí") {
  $("#confTit").textContent = titulo;
  $("#confMsg").textContent = msg;
  $("#confSi").textContent = ok;
  $("#confNo").hidden = false;
  $("#confDlg").showModal();
  return new Promise(res => {
    _confOk = res;
  });
}

const avisar = (titulo, msg) => {
  $("#confTit").textContent = titulo;
  $("#confMsg").textContent = msg;
  $("#confSi").textContent = "Entendido";
  $("#confNo").hidden = true;
  $("#confDlg").showModal();
  return new Promise(res => {
    _confOk = res;
  });
};

$("#confSi").onclick = () => {
  $("#confDlg").close();
  _confOk && _confOk(true);
  _confOk = null;
};

$("#confNo").onclick = () => {
  $("#confDlg").close();
  _confOk && _confOk(false);
  _confOk = null;
};

$("#confDlg").addEventListener("close", () => {
  if (_confOk) {
    _confOk(false);
    _confOk = null;
  }
});

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const items = () => data[sec] || [];

const esAsset = () => false;

const srcFoto = f => f;

function aviso(txt) {
  $("#banner").innerHTML = txt ? `<div class="banner">${esc(txt)}</div>` : "";
}

function normalizar(o, s) {
  const g = String(o.grupo ?? o.uso ?? o.tipo ?? "").toLowerCase().replace(/\s/g, "");
  const cantidad = Math.max(1, parseInt(o.cantidad, 10) || 1);
  const dispositivosItem = s !== "accesorios" ? [] : Array.isArray(o.dispositivos) ? [ ...new Set(o.dispositivos.filter(x => typeof x === "string")) ] : legacyDevs(g);
  return {
    id: o.id || uid(),
    nombre: String(o.nombre || o.name || "").trim(),
    grupo: s === "accesorios" ? "" : SEC[s].grupos.some(x => x[0] === g) ? g : SEC[s].def,
    dispositivos: dispositivosItem,
    cantidad: cantidad,
    vuelta: Math.min(cantidad, Math.max(0, parseInt(o.vuelta, 10) || 0)),
    notas: String(o.notas || ""),
    bolso: BOLSOS.some(x => x[0] === o.bolso) ? o.bolso : "",
    diaria: !!o.diaria,
    fotos: Array.isArray(o.fotos) ? o.fotos.filter(f => typeof f === "string" && (f.startsWith("data:image") || esAsset(f))) : []
  };
}

const cuerpo = ({id: id, ...r}) => r;

function iniciarNube(dbAdapter) {
  DB = dbAdapter;
  modo = "nube";
  for (const s of SECS) {
    DB.collection(s).onSnapshot(snap => {
      data[s] = snap.docs.map(d => overrides[s + "/" + d.id] || normalizar({
        ...d.data(),
        id: d.id
      }, s));
      render();
    }, err => aviso("Se cortó la conexión con la nube. Recargá la página para seguir sincronizando."));
  }
  DB.doc("estado/dispositivos").onSnapshot(d => {
    if (dispPend) return;
    dispositivos = d.exists ? limpiaDisp((d.data() || {}).lista) : DEV_DEF.map(x => ({
      ...x
    }));
    render();
    refrescarDevDlg();
  }, () => {});
  DB.doc("estado/mochila").onSnapshot(d => {
    if (mochilaPend) return;
    mochila = limpiaMochila(d.exists ? d.data() : null);
    render();
  }, () => {});
  render();
}

function conTimeout(promesa, ms) {
  return Promise.race([ promesa, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("timeout"), {
    code: "timeout"
  })), ms)) ]);
}

function errorNube(e) {
  const code = e && e.code;
  if (code === "timeout") aviso("Se está demorando en guardar — puede ser la conexión. El cambio queda en cola y se guarda solo apenas vuelva la señal."); else if (code === "quota_exceeded") aviso("Se llenó el espacio de la nube. Borrá algunos ítems para poder agregar nuevos."); else if (code === "invalid_argument") aviso("No tenés permiso para modificar esta lista."); else aviso("No se pudo guardar el último cambio. Revisá la conexión y volvé a intentar.");
}

function escribirNube(s, item) {
  const key = s + "/" + item.id;
  cadenas[key] = (cadenas[key] || Promise.resolve()).then(() => conTimeout(DB.doc(key).set(cuerpo(item)), 15e3)).catch(errorNube);
  return cadenas[key];
}

async function borrarAssets(ids) {}

let dbp = null, localOK = true;

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("accesorios-camaras", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function iniciarLocal() {
  modo = "local";
  try {
    dbp = openDB();
    const db = await dbp;
    const get = k => new Promise((res, rej) => {
      const q = db.transaction("kv").objectStore("kv").get(tripLocalKey(k));
      q.onsuccess = () => res(Array.isArray(q.result) ? q.result : []);
      q.onerror = () => rej(q.error);
    });
    for (const s of SECS) data[s] = (await get(SEC[s].key)).map(o => normalizar(o, s));
    dispositivos = await new Promise(res => {
      const q = db.transaction("kv").objectStore("kv").get(tripLocalKey("dispositivos"));
      q.onsuccess = () => res(q.result === undefined ? DEV_DEF.map(x => ({
        ...x
      })) : limpiaDisp(q.result));
      q.onerror = () => res(DEV_DEF.map(x => ({
        ...x
      })));
    });
    mochila = await new Promise(res => {
      const q = db.transaction("kv").objectStore("kv").get(tripLocalKey("mochila"));
      q.onsuccess = () => res(limpiaMochila(q.result));
      q.onerror = () => res(limpiaMochila(null));
    });
  } catch (e) {
    localOK = false;
    aviso('Este navegador no permite guardar datos. Los cambios se pierden al cerrar: usá "Exportar JSON" antes de salir.');
  }
  render();
}

function tripLocalKey(k) {
  const user=localStorage.getItem("taxusa_offline_uid") || "sinusuario";
  const profile=localStorage.getItem("perfilActivoId") || "sinperfil";
  const scope=window._misCosasScope || [user,profile,window.TripContext.active(user,profile)].join("::");
  return scope.endsWith("::orlando") ? k : `${scope}::${k}`;
}
const guardarLocal = s => putLocal(SEC[s].key, data[s]);

async function putLocal(k, v) {
  if (!localOK) return;
  try {
    const db = await dbp;
    await new Promise((res, rej) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(v, tripLocalKey(k));
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    aviso("No se pudo guardar el último cambio. Exportá un JSON como respaldo.");
  }
}

const norm = u => new URL(u, location.href).href.split(/[?#]/)[0].replace(/index\.html$/, "");

const misma = u => {
  try {
    return new URL(u, location.href).origin === location.origin;
  } catch (e) {
    return false;
  }
};

function guardarDisp() {
  if (modo === "local") {
    putLocal("dispositivos", dispositivos);
    return;
  }
  const v = {
    lista: dispositivos.map(d => ({
      ...d
    }))
  };
  dispPend++;
  cadenas.dispositivos = (cadenas.dispositivos || Promise.resolve()).then(() => conTimeout(DB.doc("estado/dispositivos").set(v), 15e3)).catch(errorNube).finally(() => {
    dispPend--;
  });
}

function guardarMochila() {
  if (modo === "local") {
    putLocal("mochila", mochila);
    return;
  }
  const v = {
    hotel: [ ...mochila.hotel ],
    parque: [ ...mochila.parque ]
  };
  mochilaPend++;
  cadenas.mochila = (cadenas.mochila || Promise.resolve()).then(() => conTimeout(DB.doc("estado/mochila").set(v), 15e3)).catch(errorNube).finally(() => {
    mochilaPend--;
  });
}

function reemplazarEnLista(s, item) {
  const L = data[s], i = L.findIndex(x => x.id === item.id);
  if (i >= 0) L[i] = item; else L.push(item);
}

function guardarItem(s, item, demora = 0) {
  reemplazarEnLista(s, item);
  if (modo === "local") {
    guardarLocal(s);
    return;
  }
  const key = s + "/" + item.id;
  overrides[key] = item;
  clearTimeout(timers[key]);
  timers[key] = setTimeout(async () => {
    await escribirNube(s, item);
    if (overrides[key] === item) delete overrides[key];
  }, demora);
}

async function borrarItem(s, item) {
  data[s] = data[s].filter(i => i.id !== item.id);
  if (modo === "local") {
    guardarLocal(s);
    return;
  }
  delete overrides[s + "/" + item.id];
  try {
    await conTimeout(DB.doc(s + "/" + item.id).delete(), 15e3);
    await borrarAssets(item.fotos);
  } catch (e) {
    errorNube(e);
  }
}

function pintarTitulo(t) {
  t = tr(t);
  const p = t.split(" ");
  $("#titulo").innerHTML = p.length > 1 ? `${esc(p.slice(0, -1).join(" "))} <span>${esc(p[p.length - 1])}</span>` : `<span>${esc(t)}</span>`;
}

function render() {
  document.body.dataset.sec = sec;
  $("#secTabs").innerHTML = TABS.map(s => `<button role="tab" data-sec="${s}" aria-selected="${s === sec}">${ic(s === "dia" ? "backpack" : SEC[s].icon, 18)}<span>${s === "dia" ? "Mochila" : SEC[s].corto || SEC[s].tab}</span></button>`).join("");
  $("#syncDot").className = "sync-dot " + (modo || "");
  $("#syncDot").title = modo === "nube" ? "Sincronizado con tu cuenta" : modo === "local" ? "Guardado solo en este navegador" : "Conectando…";
  $("#modo").hidden = modo !== "local";
  $("#modo").innerHTML = modo === "local" ? ic("cloudOff", 14) + "Guardado solo en este navegador" : "";
  const esDia = sec === "dia";
  [ "#btnControl", "#btnAdd", ".bar", "#tabs", "#bar2" ].forEach(q => $(q).hidden = esDia);
  document.body.classList.toggle("diamode", esDia);
  if (esDia) {
    document.body.classList.remove("controlmode");
    renderDia();
    return;
  }
  const S = SEC[sec], L = items();
  document.title = S.titulo;
  pintarTitulo(S.titulo);
  $("#btnAdd").innerHTML = ic("plus", 17) + S.nuevo;
  $("#search").placeholder = S.buscar;
  $("#btnControl").classList.toggle("on", control);
  $("#btnControl").setAttribute("aria-pressed", control);
  document.body.classList.toggle("controlmode", control);
  const unidades = L.reduce((a, i) => a + i.cantidad, 0);
  $("#resumen").textContent = L.length ? `${L.length} ${L.length === 1 ? S.singular : S.plural}, ${unidades} unidades en total` : sec === "accesorios" ? dispositivos.length ? dispositivos.map(d => d.nombre).join(" · ") : "Agregá tus dispositivos" : S.sub;
  if (control && L.length) {
    const volvieron = L.reduce((a, i) => a + i.vuelta, 0);
    const falta = unidades - volvieron;
    const conFalta = L.filter(i => i.vuelta < i.cantidad).length;
    $("#ctrl").innerHTML = `<div class="ctrl ${falta ? "warn" : "ok"}">\n      <div class="l"><div class="badge">${ic(falta ? "alert" : "check", 18)}</div><div><strong>${falta ? `Faltan ${falta} ${falta === 1 ? "unidad" : "unidades"} en ${conFalta} ${conFalta === 1 ? S.singular : S.plural}` : "Volvió todo"}</strong>\n      <span>Volvieron ${volvieron} de ${unidades} unidades</span></div></div>\n      <div class="r">\n        <label class="chk"><input type="checkbox" id="soloFalta" ${soloFalta ? "checked" : ""}> Ver solo lo que falta</label>\n        <button class="btn" id="ctrlReset">Reiniciar</button>\n      </div></div>`;
  } else $("#ctrl").innerHTML = "";
  const esAcc = sec === "accesorios";
  const cuenta = {
    todos: L.length
  };
  gruposDe(sec).forEach(([g]) => cuenta[g] = 0);
  L.forEach(i => {
    if (esAcc) {
      const d = devsDe(i);
      d.forEach(x => cuenta[x]++);
      if (!d.length) cuenta._none++;
    } else cuenta[i.grupo]++;
  });
  let f = filtro[sec];
  if (f !== "todos" && !(f in cuenta)) f = filtro[sec] = "todos";
  const chipsG = esAcc ? [ ...dispositivos.map(d => [ d.id, d.nombre ]), ...cuenta._none ? [ [ "_none", "Sin dispositivo" ] ] : [] ] : S.grupos.map(([g, t]) => [ g, t ]);
  $("#tabs").innerHTML = [ [ "todos", "Todos" ], ...chipsG ].map(([k, t]) => `<button data-f="${k}" aria-pressed="${f === k}">${esc(t)}<span class="n">${cuenta[k]}</span></button>`).join("") + (esAcc ? `<button class="add-chip" data-devs="1">${ic("plus", 13)}Dispositivo</button>` : "");
  const cb = {
    todos: L.length,
    sin: L.filter(i => !i.bolso).length
  };
  BOLSOS.forEach(([b]) => cb[b] = L.filter(i => i.bolso === b).length);
  const fbSel = filtroBolso[sec];
  $("#bar2").innerHTML = L.length ? `<span class="lbl-chip">Bolso</span>` + [ [ "todos", "Todos" ], ...BOLSOS, [ "sin", "Sin asignar" ] ].map(([k, t]) => `<button data-fb="${k}" aria-pressed="${fbSel === k}">${t} <span class="n">${cb[k]}</span></button>`).join("") : "";
  const c = $("#content");
  if (!modo) {
    c.innerHTML = `<div class="empty"><p>Cargando tu lista…</p></div>`;
    return;
  }
  if (!L.length) {
    c.innerHTML = `<div class="empty"><div class="ic-big">${ic(S.icon, 26)}</div><p>${S.vacio} Podés agregarlos uno por uno o importar tu lista en JSON.</p>\n      <div class="actions" style="justify-content:center">\n        <button class="btn" data-act="import">${ic("upload", 16)}Importar JSON</button>\n        <button class="btn primary" data-act="add">${ic("plus", 16)}${S.nuevo}</button></div></div>`;
    return;
  }
  const q = busqueda.trim().toLowerCase();
  const fb = filtroBolso[sec];
  const enGrupo = i => f === "todos" || (esAcc ? f === "_none" ? !devsDe(i).length : devsDe(i).includes(f) : i.grupo === f);
  const vis = L.filter(i => enGrupo(i) && (fb === "todos" || (fb === "sin" ? !i.bolso : i.bolso === fb)) && (!q || i.nombre.toLowerCase().includes(q) || i.notas.toLowerCase().includes(q)) && (!(control && soloFalta) || i.vuelta < i.cantidad));
  if (!vis.length) {
    c.innerHTML = `<div class="empty"><div class="ic-big">${ic(control && soloFalta ? "check" : "search", 26)}</div><p>${control && soloFalta ? "No falta nada en este filtro." : "Nada coincide con la búsqueda."}</p></div>`;
    return;
  }
  c.innerHTML = gruposDe(sec).map(([g, t, ci]) => {
    const lst = vis.filter(i => grupoDe(sec, i) === g).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    if (!lst.length) return "";
    return `<h2 class="group"><span class="dot" style="background:var(--c${ci})"></span>${esc(t)} <small>${lst.length}</small></h2>\n      <ul class="list">${lst.map(filaHTML).join("")}</ul>`;
  }).join("");
}

function renderDia() {
  document.title = "Mochila del día";
  pintarTitulo("Mochila del día");
  const lista = SECS.flatMap(s => data[s].filter(i => i.diaria).map(i => ({
    s: s,
    i: i,
    k: s + "/" + i.id
  })));
  $("#resumen").textContent = lista.length ? `${lista.length} ${lista.length === 1 ? "cosa" : "cosas"} para revisar` : "Lo que sacás del hotel cada mañana";
  const c = $("#content");
  $("#ctrl").innerHTML = "";
  if (!modo) {
    c.innerHTML = `<div class="empty"><p>Cargando tu lista…</p></div>`;
    return;
  }
  if (!lista.length) {
    c.innerHTML = `<div class="empty"><div class="ic-big">${ic("backpack", 26)}</div><p>Todavía no elegiste qué va en la mochila del día.</p>\n      <div class="actions" style="justify-content:center"><button class="btn primary" data-act="pick">Elegir qué va</button></div></div>`;
    return;
  }
  const n = lista.length;
  const h = lista.filter(x => mochila.hotel.includes(x.k)).length;
  const p = lista.filter(x => mochila.parque.includes(x.k)).length;
  let msg, ok;
  if (p > 0) {
    ok = p === n;
    msg = ok ? "Tenés todo para volver al hotel" : `Te ${n - p === 1 ? "falta 1 cosa" : `faltan ${n - p} cosas`} antes de irte del parque`;
  } else {
    ok = h === n;
    msg = ok ? "Mochila lista para salir" : `Te ${n - h === 1 ? "falta 1 cosa" : `faltan ${n - h} cosas`} para salir del hotel`;
  }
  $("#ctrl").innerHTML = `<div class="ctrl ${ok ? "ok" : "warn"}">\n    <div class="l"><div class="badge">${ic(ok ? "check" : "alert", 18)}</div><div><strong>${msg}</strong>\n      <div class="pasos"><span>Al salir del hotel: ${h} de ${n}</span><span>Al irte del parque: ${p} de ${n}</span></div></div></div>\n    <div class="r">\n      <button class="btn" data-act="pick">Elegir qué va</button>\n      <button class="btn" data-act="nuevodia">Nuevo día</button>\n    </div></div>`;
  c.innerHTML = SECS.map(s => {
    const lst = lista.filter(x => x.s === s).sort((a, b) => a.i.nombre.localeCompare(b.i.nombre, "es"));
    if (!lst.length) return "";
    return `<h2 class="group">${ic(SEC[s].icon, 14)}${SEC[s].tab} <small>${lst.length}</small></h2><ul class="list">${lst.map(({s: s, i: i, k: k}) => {
      const hh = mochila.hotel.includes(k), pp = mochila.parque.includes(k);
      const th = i.fotos.length ? `<img src="${esc(srcFoto(i.fotos[0]))}" alt="${esc(i.nombre)}" data-lb="${i.id}" data-s="${s}" data-n="0" loading="lazy">` : `<div class="nophoto" title="Sin foto">${ic("image", 24)}</div>`;
      return `<li class="row${hh && (pp || !p) ? " done" : ""}" style="cursor:default">\n        <div class="thumbs">${th}</div>\n        <div class="info"><h3>${esc(i.nombre)}${i.cantidad > 1 ? `<span class="qty">×${i.cantidad}</span>` : ""}</h3></div>\n        <div class="dchecks">\n          <button data-dk="hotel|${k}" aria-pressed="${hh}">${hh ? ic("check", 14) : ""}Hotel</button>\n          <button data-dk="parque|${k}" aria-pressed="${pp}">${pp ? ic("check", 14) : ""}Parque</button>\n        </div></li>`;
    }).join("")}</ul>`;
  }).join("");
}

function abrirPicker() {
  const html = SECS.map(s => {
    if (!data[s].length) return "";
    const lst = [ ...data[s] ].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return `<div class="pkh">${SEC[s].tab}</div><ul class="pk">${lst.map(i => `<li><label>\n      <input type="checkbox" data-pk="${s}/${i.id}" ${i.diaria ? "checked" : ""}>\n      ${i.fotos[0] ? `<img src="${esc(srcFoto(i.fotos[0]))}" alt="">` : ""}\n      <span>${esc(i.nombre)}</span></label></li>`).join("")}</ul>`;
  }).join("");
  $("#pickList").innerHTML = html || '<p class="notes">Primero cargá cosas en las otras pestañas.</p>';
  $("#pickDlg").showModal();
}

[ [ "editor", "#edCancel" ], [ "impDlg", "#impCancel" ], [ "devDlg", "#devClose" ], [ "pickDlg", "#pickCancel" ] ].forEach(([id, btn]) => {
  const d = document.getElementById(id), f = d && d.querySelector(".dlg");
  if (!f) return;
  const x = document.createElement("button");
  x.type = "button";
  x.className = "dx";
  x.setAttribute("aria-label", "Cerrar");
  x.innerHTML = ic("x", 16);
  x.addEventListener("click", () => {
    const b = $(btn);
    if (b) b.click(); else d.close();
  });
  f.insertBefore(x, f.firstChild);
});

$("#pickCancel").onclick = () => $("#pickDlg").close();

$("#pickOk").onclick = () => {
  const quitar = [];
  document.querySelectorAll("#pickList [data-pk]").forEach(cb => {
    const [s, id] = cb.dataset.pk.split("/");
    const it = data[s].find(i => i.id === id);
    if (!it || it.diaria === cb.checked) return;
    guardarItem(s, {
      ...it,
      diaria: cb.checked
    });
    if (!cb.checked) quitar.push(cb.dataset.pk);
  });
  if (quitar.length) {
    mochila.hotel = mochila.hotel.filter(k => !quitar.includes(k));
    mochila.parque = mochila.parque.filter(k => !quitar.includes(k));
    guardarMochila();
  }
  $("#pickDlg").close();
  render();
};

function etiquetas(i) {
  if (sec === "accesorios") {
    const d = devsDe(i);
    return d.length ? d.map(id => {
      const v = devById(id);
      return `<span class="tag" style="--k:var(--c${v.ci})">${esc(v.nombre)}</span>`;
    }).join("") : `<span class="tag" style="--k:var(--c6)">Sin dispositivo</span>`;
  }
  const [, t, ci] = gInfo(sec, i.grupo);
  return `<span class="tag" style="--k:var(--c${ci})">${esc(t)}</span>`;
}

function filaHTML(i) {
  const max = control ? 1 : 2;
  let th;
  if (!i.fotos.length) th = `<div class="nophoto" title="Sin foto">${ic("image", 24)}</div>`; else {
    th = i.fotos.slice(0, max).map((f, n) => `<img src="${esc(srcFoto(f))}" alt="${esc(i.nombre)}" data-lb="${i.id}" data-n="${n}" loading="lazy">`).join("");
    if (i.fotos.length > max && !control) th += `<div class="more" data-lb="${i.id}" data-n="${max}">+${i.fotos.length - max}</div>`;
  }
  const done = i.vuelta >= i.cantidad;
  const cnt = control ? `<div class="counter">\n      <button data-dec="${i.id}" aria-label="Restar uno">${ic("minus", 16)}</button>\n      <button class="val" data-full="${i.id}" aria-label="Volvieron ${i.vuelta} de ${i.cantidad}. Tocar para marcar todo">${i.vuelta}/${i.cantidad}</button>\n      <button data-inc="${i.id}" aria-label="Sumar uno">${ic("plus", 16)}</button></div>` : "";
  return `<li class="row${control && done ? " done" : ""}" data-id="${i.id}" tabindex="0">\n    <div class="thumbs">${th}</div>\n    <div class="info">\n      ${etiquetas(i)}\n      <h3>${esc(i.nombre)}${i.cantidad > 1 && !control ? `<span class="qty">×${i.cantidad}</span>` : ""}${i.bolso ? `<span class="chip">${bolsoNombre(i.bolso)}</span>` : ""}</h3>\n      ${i.notas ? `<p class="notes">${esc(i.notas)}</p>` : ""}\n    </div>\n    ${cnt}\n  </li>`;
}

function abrirDrawer() {
  $("#settingsDrawer").classList.add("open");
  $("#settingsOverlay").classList.add("open");
}

function cerrarDrawer() {
  $("#settingsDrawer").classList.remove("open");
  $("#settingsOverlay").classList.remove("open");
}

const cerrarMenu = cerrarDrawer;

function aplicarTema(choice) {
  const dark = choice === "dark" || choice !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.querySelectorAll(".theme-opt").forEach(b => b.classList.toggle("active", b.dataset.themeChoice === choice));
}

function elegirTema(choice) {
  try {
    if (choice === "auto") localStorage.removeItem("theme"); else localStorage.setItem("theme", choice);
  } catch (e) {}
  aplicarTema(choice);
}

(function initAjustes() {
  let choice = "auto", foto = null, nombre = null;
  try {
    choice = localStorage.getItem("theme") || "auto";
    foto = localStorage.getItem("perfilActivoFoto");
    nombre = localStorage.getItem("perfilActivoNombre");
  } catch (e) {}
  aplicarTema(choice);
  const btn = $("#btnSettings");
  if (foto) {
    btn.style.backgroundImage = `url('${foto.replace(/'/g, "%27")}')`;
    btn.innerHTML = "";
  }
  $("#settings-profile-name").textContent = nombre || "—";
  const av = $("#settings-profile-avatar");
  if (foto) av.style.backgroundImage = `url('${foto.replace(/'/g, "%27")}')`; else av.textContent = (nombre || "?").trim().charAt(0).toUpperCase();
  btn.addEventListener("click", abrirDrawer);
  $("#sxClose").addEventListener("click", cerrarDrawer);
  $("#settingsOverlay").addEventListener("click", cerrarDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarDrawer();
  });
})();

function cambiarPerfil() {
  try {
    localStorage.setItem("taxusa_pending_redirect", location.href);
  } catch (e) {}
  location.href = "https://taxfly.github.io/taxfly/profiles.html";
}

async function vaciarSeccion(s) {
  const dia = s === "dia";
  const nombre = dia ? "la mochila del día" : SEC[s].tab.toLowerCase();
  const msg = dia ? "Se destilda todo y se quita lo que elegiste para la mochila del día. Los ítems siguen en sus listas." : `Se van a borrar TODOS los ítems de ${nombre}. Esta acción no se puede deshacer.`;
  if (!await confirmar(`¿Vaciar ${nombre}?`, msg, "Vaciar")) return;
  cerrarDrawer();
  if (dia) {
    SECS.forEach(x => data[x].filter(i => i.diaria).forEach(i => guardarItem(x, {
      ...i,
      diaria: false
    })));
    mochila = {
      hotel: [],
      parque: []
    };
    guardarMochila();
  } else {
    for (const it of [ ...data[s] ]) await borrarItem(s, it);
  }
  render();
}

$("#settingsDrawer").addEventListener("click", async e => {
  const w = e.target.closest("[data-wipe]");
  if (w) {
    vaciarSeccion(w.dataset.wipe);
    return;
  }
  const d = e.target.closest("[data-do]");
  if (!d) return;
  const a = d.dataset.do;
  if (a === "perfil") cambiarPerfil(); else if (a === "refresh") location.reload(); else if (a === "dispositivos") {
    cerrarDrawer();
    abrirDevDlg();
  } else if (a === "logout") {
    if (window._misCosasSignOut) await window._misCosasSignOut(); else location.href = "https://taxfly.github.io/taxfly/login.html";
  }
});

function pintarDevDlg() {
  $("#devList").innerHTML = dispositivos.length ? dispositivos.map(d => `<div class="dev-row"><span class="dot" style="background:var(--c${d.ci})"></span>\n      <input value="${esc(d.nombre)}" data-rn="${esc(d.id)}" maxlength="30" aria-label="Nombre del dispositivo">\n      <button type="button" data-rmdev="${esc(d.id)}" aria-label="Eliminar ${esc(d.nombre)}">${ic("trash", 16)}</button></div>`).join("") : '<p class="notes" style="margin:0">No hay dispositivos todavía.</p>';
}

function abrirDevDlg() {
  pintarDevDlg();
  $("#devErr").hidden = true;
  $("#devNombre").value = "";
  if (!$("#devDlg").open) $("#devDlg").showModal();
}

function refrescarDevDlg() {
  if ($("#devDlg").open && !document.activeElement.matches("#devList input")) pintarDevDlg();
}

function cambioDisp() {
  guardarDisp();
  render();
  if (draft && $("#editor").open) {
    const sel = [ ...document.querySelectorAll('#edGrupos input[name="dev"]:checked') ].map(x => x.value);
    pintarEdGrupos(sel);
  }
}

$("#devClose").onclick = () => $("#devDlg").close();

$("#devForm").addEventListener("submit", e => {
  e.preventDefault();
  const n = $("#devNombre").value.trim();
  const err = t => {
    $("#devErr").textContent = t;
    $("#devErr").hidden = false;
  };
  if (!n) return err("Escribí el nombre del dispositivo.");
  if (dispositivos.some(d => d.nombre.toLowerCase() === n.toLowerCase())) return err("Ya tenés un dispositivo con ese nombre.");
  const usados = new Set(dispositivos.map(d => d.ci));
  const libre = [ 0, 1, 2, 3, 4, 5 ].find(c => !usados.has(c));
  dispositivos.push({
    id: uid(),
    nombre: n.slice(0, 30),
    ci: libre ?? dispositivos.length % 6
  });
  $("#devNombre").value = "";
  $("#devErr").hidden = true;
  cambioDisp();
  pintarDevDlg();
});

$("#devList").addEventListener("change", e => {
  const inp = e.target.closest("[data-rn]");
  if (!inp) return;
  const d = devById(inp.dataset.rn);
  if (!d) return;
  const n = inp.value.trim().slice(0, 30);
  if (!n || dispositivos.some(x => x !== d && x.nombre.toLowerCase() === n.toLowerCase())) {
    inp.value = d.nombre;
    return;
  }
  d.nombre = n;
  cambioDisp();
});

$("#devList").addEventListener("click", async e => {
  const b = e.target.closest("[data-rmdev]");
  if (!b) return;
  const d = devById(b.dataset.rmdev);
  if (!d) return;
  if (!await confirmar("¿Eliminar dispositivo?", `Se quita "${d.nombre}" de tus dispositivos y de los accesorios que lo usan. Los accesorios no se borran.`, "Eliminar")) return;
  dispositivos = dispositivos.filter(x => x.id !== d.id);
  data.accesorios.filter(i => (i.dispositivos || []).includes(d.id) || legacyDevs(i.grupo).includes(d.id)).forEach(i => guardarItem("accesorios", {
    ...i,
    grupo: "",
    dispositivos: [ ...new Set([ ...i.dispositivos || [], ...legacyDevs(i.grupo) ]) ].filter(x => x !== d.id)
  }));
  cambioDisp();
  pintarDevDlg();
});

$("#secTabs").addEventListener("click", e => {
  const b = e.target.closest("[data-sec]");
  if (!b || b.dataset.sec === sec) return;
  sec = b.dataset.sec;
  busqueda = "";
  $("#search").value = "";
  try {
    localStorage.setItem("seccion", sec);
  } catch (err) {}
  render();
});

$("#bar2").addEventListener("click", e => {
  const b = e.target.closest("[data-fb]");
  if (!b) return;
  filtroBolso[sec] = b.dataset.fb;
  render();
});

$("#tabs").addEventListener("click", e => {
  if (e.target.closest("[data-devs]")) {
    abrirDevDlg();
    return;
  }
  const b = e.target.closest("button[data-f]");
  if (!b) return;
  filtro[sec] = b.dataset.f;
  render();
});

$("#search").addEventListener("input", e => {
  busqueda = e.target.value;
  render();
});

$("#btnControl").onclick = () => {
  control = !control;
  render();
};

$("#ctrl").addEventListener("change", e => {
  if (e.target.id === "soloFalta") {
    soloFalta = e.target.checked;
    render();
  }
});

$("#ctrl").addEventListener("click", async e => {
  const act = e.target.closest("[data-act]");
  if (act) {
    if (act.dataset.act === "pick") abrirPicker(); else if (act.dataset.act === "nuevodia") nuevoDia();
    return;
  }
  if (e.target.id !== "ctrlReset") return;
  const s = sec;
  if (!await confirmar("¿Reiniciar el control?", `Se pone en 0 el control de vuelta de ${SEC[s].tab.toLowerCase()}.`, "Reiniciar")) return;
  data[s].filter(i => i.vuelta).forEach(i => guardarItem(s, {
    ...i,
    vuelta: 0
  }));
  render();
});

async function nuevoDia() {
  if (!await confirmar("¿Empezar un día nuevo?", "Se destilda todo lo de hotel y parque.", "Empezar")) return;
  mochila = {
    hotel: [],
    parque: []
  };
  guardarMochila();
  render();
}

$("#content").addEventListener("click", e => {
  const t = e.target;
  const lb = t.closest("[data-lb]");
  if (lb) {
    abrirVisor(lb.dataset.lb, +lb.dataset.n, lb.dataset.s || sec);
    return;
  }
  const dk = t.closest("[data-dk]");
  if (dk) {
    const [paso, k] = dk.dataset.dk.split("|");
    const arr = mochila[paso];
    mochila[paso] = arr.includes(k) ? arr.filter(x => x !== k) : [ ...arr, k ];
    guardarMochila();
    render();
    return;
  }
  const act = t.closest("[data-act]");
  if (act) {
    const a = act.dataset.act;
    if (a === "add") abrirEditor(); else if (a === "import") $("#fileJson").click(); else if (a === "pick") abrirPicker(); else if (a === "nuevodia") nuevoDia();
    return;
  }
  const cb = t.closest("[data-inc],[data-dec],[data-full]");
  if (cb) {
    const id = cb.dataset.inc || cb.dataset.dec || cb.dataset.full;
    const it = items().find(i => i.id === id);
    if (!it) return;
    let v = it.vuelta;
    if (cb.dataset.inc) v = Math.min(it.cantidad, v + 1); else if (cb.dataset.dec) v = Math.max(0, v - 1); else v = v >= it.cantidad ? 0 : it.cantidad;
    guardarItem(sec, {
      ...it,
      vuelta: v
    }, 400);
    render();
    return;
  }
  const row = t.closest(".row");
  if (row && row.dataset.id) abrirEditor(row.dataset.id);
});

$("#content").addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.classList.contains("row")) abrirEditor(e.target.dataset.id);
});

$("#btnAdd").onclick = () => abrirEditor();

function achicarImagen(file, max, calidad) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image;
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("imagen")), "image/jpeg", calidad ?? .85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rej(new Error("imagen"));
    };
    img.src = url;
  });
}

const blobADataURL = b => new Promise((res, rej) => {
  const r = new FileReader;
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(b);
});

function dataURLABlob(d) {
  const [cab, b64] = d.split(",");
  const tipo = (cab.match(/data:([^;]+)/) || [])[1] || "image/jpeg";
  const bin = atob(b64), arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([ arr ], {
    type: tipo
  });
}

function imgADataURL(src) {
  return new Promise((res, rej) => {
    const img = new Image;
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      res(c.toDataURL("image/jpeg", .9));
    };
    img.onerror = rej;
    img.src = src;
  });
}

async function fotoADataURL(f) {
  try {
    return await blobADataURL(await (await fetch(srcFoto(f))).blob());
  } catch (e) {
    return await imgADataURL(srcFoto(f));
  }
}

async function subirBlob(blob) {
  return modo === "nube" ? await comprimirParaNube(blob) : await blobADataURL(blob);
}

const NUBE_FOTO_MAX = 500 * 1024;

const NUBE_ITEM_MAX = 900 * 1024;

async function comprimirParaNube(file) {
  const intentos = [ [ 1300, .7 ], [ 1e3, .55 ], [ 750, .45 ], [ 500, .35 ] ];
  let dataUri = null;
  for (const [max, calidad] of intentos) {
    dataUri = await blobADataURL(await achicarImagen(file, max, calidad));
    if (dataUri.length <= NUBE_FOTO_MAX) break;
  }
  return dataUri;
}

let draft = null;

function abrirEditor(id) {
  const S = SEC[sec];
  const orig = id ? items().find(i => i.id === id) : null;
  draft = orig ? {
    ...orig,
    fotos: [ ...orig.fotos ]
  } : {
    id: null,
    nombre: "",
    grupo: sec === "accesorios" ? "" : filtro[sec] !== "todos" ? filtro[sec] : S.def,
    dispositivos: sec === "accesorios" && devById(filtro[sec]) ? [ filtro[sec] ] : [],
    cantidad: 1,
    vuelta: 0,
    notas: "",
    bolso: "",
    diaria: false,
    fotos: []
  };
  draft._nuevas = [];
  draft._quitar = [];
  draft._guardado = false;
  draft._sec = sec;
  $("#edTitle").textContent = orig ? S.editar : S.nuevo;
  $("#edGrupoLbl").textContent = S.grupoLbl;
  $("#edCantLbl").textContent = S.cantLbl;
  pintarEdGrupos(draft.dispositivos || []);
  $("#edNombre").value = draft.nombre;
  $("#edCant").value = draft.cantidad;
  $("#edNotas").value = draft.notas;
  $("#edBolsos").innerHTML = [ ...BOLSOS, [ "", "Sin asignar" ] ].map(([b, t]) => `<label style="--k:var(--theme-accent)"><input type="radio" name="bolso" value="${b}" ${b === draft.bolso ? "checked" : ""}><span>${t}</span></label>`).join("");
  $("#edDiaria").checked = draft.diaria;
  $("#edDel").style.visibility = orig ? "visible" : "hidden";
  $("#edErr").hidden = true;
  pintarFotos();
  $("#editor").showModal();
  if (!orig) $("#edNombre").focus();
}

function pintarEdGrupos(sel) {
  const S = SEC[draft._sec];
  if (draft._sec === "accesorios") {
    $("#edGrupos").innerHTML = dispositivos.map(d => `<label style="--k:var(--c${d.ci})"><input type="checkbox" name="dev" value="${esc(d.id)}" ${sel.includes(d.id) ? "checked" : ""}><span>${esc(d.nombre)}</span></label>`).join("") + `<div class="ed-hint" style="flex-basis:100%">${dispositivos.length ? "Podés marcar más de uno." : "Todavía no agregaste dispositivos."} <button type="button" data-devs="1">${dispositivos.length ? "Administrar dispositivos" : "Agregar dispositivo"}</button></div>`;
  } else {
    $("#edGrupos").innerHTML = S.grupos.map(([g, t, ci]) => `<label style="--k:var(--c${ci})"><input type="radio" name="grupo" value="${g}" ${g === draft.grupo ? "checked" : ""}><span>${t}</span></label>`).join("");
  }
}

$("#edGrupos").addEventListener("click", e => {
  if (e.target.closest("[data-devs]")) abrirDevDlg();
});

let subiendo = 0;

function pintarFotos() {
  $("#edFotos").innerHTML = draft.fotos.map((f, n) => `<div class="ph"><img src="${esc(srcFoto(f))}" alt="Foto ${n + 1}"><button type="button" class="x" data-rm="${n}" aria-label="Quitar foto ${n + 1}">${ic("x", 14)}</button></div>`).join("") + `<button type="button" class="addph" id="edAddPh" ${subiendo ? "disabled" : ""}>${subiendo ? "Subiendo…" : ic("camera", 22) + "Agregar fotos"}</button>`;
}

function error(txt) {
  $("#edErr").textContent = txt;
  $("#edErr").hidden = !txt;
}

$("#edFotos").addEventListener("click", e => {
  const rm = e.target.closest("[data-rm]");
  if (rm) {
    const [f] = draft.fotos.splice(+rm.dataset.rm, 1);
    if (esAsset(f)) {
      if (draft._nuevas.includes(f)) {
        draft._nuevas = draft._nuevas.filter(x => x !== f);
        borrarAssets([ f ]);
      } else draft._quitar.push(f);
    }
    pintarFotos();
    return;
  }
  if (e.target.closest("#edAddPh")) $("#filePhotos").click();
});

$("#filePhotos").addEventListener("change", async e => {
  const files = [ ...e.target.files ];
  e.target.value = "";
  const d = draft, errores = [];
  subiendo++;
  pintarFotos();
  error("");
  for (const f of files) {
    try {
      const blob = await conTimeout(achicarImagen(f, modo === "nube" ? 1300 : 1200), 2e4);
      const dataUri = await conTimeout(subirBlob(blob), 2e4);
      if (modo === "nube") {
        const totalActual = d.fotos.reduce((a, x) => a + x.length, 0);
        if (totalActual + dataUri.length > NUBE_ITEM_MAX) throw new Error("sin_espacio_item");
      }
      d.fotos.push(dataUri);
    } catch (err) {
      const razon = err && err.message === "sin_espacio_item" ? " (este ítem ya no tiene lugar — sacá otra foto primero)" : err && err.code === "timeout" ? " (tardó demasiado — probá con otra foto)" : "";
      errores.push(f.name + razon);
    }
    if (draft === d) pintarFotos();
  }
  subiendo--;
  if (draft === d) {
    pintarFotos();
    if (errores.length) error("No se pudieron agregar: " + errores.join(", ") + ". Probá con JPG o PNG.");
  }
});

$("#edForm").addEventListener("submit", e => {
  e.preventDefault();
  if (subiendo) {
    error("Esperá a que terminen de subir las fotos.");
    return;
  }
  const nombre = $("#edNombre").value.trim();
  if (!nombre) {
    error("Escribí un nombre.");
    $("#edNombre").focus();
    return;
  }
  const s = draft._sec;
  const item = {
    id: draft.id || uid(),
    nombre: nombre,
    grupo: s === "accesorios" ? "" : document.querySelector('input[name="grupo"]:checked').value,
    dispositivos: s === "accesorios" ? [ ...document.querySelectorAll('#edGrupos input[name="dev"]:checked') ].map(x => x.value) : [],
    cantidad: Math.max(1, parseInt($("#edCant").value, 10) || 1),
    vuelta: draft.vuelta,
    notas: $("#edNotas").value.trim(),
    fotos: [ ...draft.fotos ],
    bolso: (document.querySelector('input[name="bolso"]:checked') || {}).value || "",
    diaria: $("#edDiaria").checked
  };
  item.vuelta = Math.min(item.vuelta, item.cantidad);
  draft._guardado = true;
  const quitar = draft._quitar;
  $("#editor").close();
  guardarItem(s, item);
  if (quitar.length) borrarAssets(quitar);
  render();
});

$("#editor").addEventListener("close", () => {
  if (draft && !draft._guardado && draft._nuevas.length) borrarAssets(draft._nuevas);
});

$("#edCancel").onclick = () => $("#editor").close();

$("#edDel").onclick = async () => {
  const s = draft._sec, id = draft.id, nombre = draft.nombre, extra = draft._nuevas;
  if (!await confirmar("¿Eliminar?", `Se va a borrar "${nombre}". Esta acción no se puede deshacer.`, "Eliminar")) return;
  const orig = data[s].find(i => i.id === id);
  draft._guardado = true;
  $("#editor").close();
  if (orig) borrarItem(s, orig);
  borrarAssets(extra);
  render();
};

$("#btnExport").onclick = async () => {
  if (!SECS.some(s => data[s].length)) {
    avisar("Nada para exportar", "Todavía no cargaste nada en ninguna sección.");
    return;
  }
  const btn = $("#btnExport"), lbl = btn.querySelector(".tx");
  btn.disabled = true;
  lbl.textContent = "Preparando…";
  try {
    const out = {
      version: 3,
      exportado: (new Date).toISOString(),
      dispositivos: dispositivos.map(d => ({
        ...d
      }))
    };
    for (const s of SECS) {
      out[s] = [];
      for (const it of data[s]) {
        const fotos = [];
        for (const f of it.fotos) {
          if (f.startsWith("data:")) fotos.push(f); else {
            try {
              fotos.push(await fotoADataURL(f));
            } catch (e) {}
          }
        }
        out[s].push({
          ...cuerpo(it),
          fotos: fotos
        });
      }
    }
    const json = JSON.stringify(out, null, 2);
    const nombre = `mis_cosas_de_viaje_${(new Date).toISOString().slice(0, 10)}.json`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ json ], {
      type: "application/json"
    }));
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
  } finally {
    btn.disabled = false;
    lbl.textContent = "Exportar";
    cerrarMenu();
  }
};

$("#btnImport").onclick = () => {
  cerrarMenu();
  $("#fileJson").click();
};

let pendientes = null, pendientesDisp = null;

$("#fileJson").addEventListener("change", async e => {
  const f = e.target.files[0];
  e.target.value = "";
  if (!f) return;
  try {
    const raw = JSON.parse(await f.text());
    const origen = Array.isArray(raw) ? {
      [sec]: raw
    } : raw;
    const nuevos = {};
    for (const s of SECS) {
      if (Array.isArray(origen[s])) {
        const arr = origen[s].map(o => normalizar({
          ...o,
          id: undefined
        }, s)).filter(i => i.nombre);
        if (arr.length) nuevos[s] = arr;
      }
    }
    pendientesDisp = Array.isArray(origen.dispositivos) ? limpiaDisp(origen.dispositivos) : null;
    const secsArchivo = Object.keys(nuevos);
    if (!secsArchivo.length) throw new Error("vacío");
    if (secsArchivo.every(s => !data[s].length)) {
      aplicarImport(nuevos, true, pendientesDisp);
      return;
    }
    pendientes = nuevos;
    const trae = secsArchivo.map(s => `${nuevos[s].length} ${tr(nuevos[s].length === 1 ? SEC[s].singular : SEC[s].plural)}`).join(" " + tr("y") + " ");
    const tengo = secsArchivo.filter(s => data[s].length).map(s => `${data[s].length} ${tr(data[s].length === 1 ? SEC[s].singular : SEC[s].plural)}`).join(" " + tr("y") + " ");
    $("#impMsg").textContent = `El archivo trae ${trae}, y ya tenés cargados ${tengo}. "Reemplazar" solo pisa las secciones que vienen en el archivo.`;
    $("#impDlg").showModal();
  } catch (err) {
    avisar("No se pudo importar", 'El archivo no es un JSON válido. Tiene que tener una lista "accesorios", "ropa" o "esenciales" con al menos un "nombre".');
  }
});

function fusionarDisp(nuevos, lista) {
  const need = new Set;
  (nuevos.accesorios || []).forEach(i => i.dispositivos.forEach(id => need.add(id)));
  let cambio = false;
  need.forEach(id => {
    if (devById(id)) return;
    const d = (lista || []).find(x => x.id === id) || DEV_DEF.find(x => x.id === id);
    if (d) {
      dispositivos.push({
        ...d,
        ci: dispositivos.length % 6
      });
      cambio = true;
    }
  });
  if (cambio) guardarDisp();
}

async function aplicarImport(nuevos, reemplazar, listaDisp) {
  fusionarDisp(nuevos, listaDisp);
  const primera = Object.keys(nuevos)[0];
  if (!nuevos[sec] && primera) {
    sec = primera;
    try {
      localStorage.setItem("seccion", sec);
    } catch (e) {}
  }
  if (modo === "local") {
    for (const s in nuevos) {
      nuevos[s].forEach(i => i.fotos = i.fotos.filter(f => f.startsWith("data:")));
      data[s] = reemplazar ? nuevos[s] : data[s].concat(nuevos[s]);
      guardarLocal(s);
    }
    render();
    return;
  }
  const total = Object.values(nuevos).reduce((a, l) => a + l.length, 0);
  let n = 0, fallidas = 0;
  const botones = [ "#btnImport", "#btnExport", "#btnAdd" ].map(s => $(s));
  botones.forEach(b => b.disabled = true);
  try {
    for (const s in nuevos) {
      if (reemplazar) {
        for (const it of [ ...data[s] ]) {
          await borrarItem(s, it);
        }
        render();
      }
      for (const it of nuevos[s]) {
        n++;
        aviso(`Importando ${n} de ${total}…`);
        try {
          const fotos = [];
          let totalFotos = 0;
          for (const f of it.fotos) {
            if (!f.startsWith("data:")) continue;
            try {
              const comprimida = await conTimeout(subirBlob(dataURLABlob(f)), 2e4);
              if (totalFotos + comprimida.length > NUBE_ITEM_MAX) {
                fallidas++;
                continue;
              }
              fotos.push(comprimida);
              totalFotos += comprimida.length;
            } catch (e) {
              fallidas++;
            }
          }
          const item = {
            ...it,
            id: uid(),
            fotos: fotos
          };
          reemplazarEnLista(s, item);
          await escribirNube(s, item);
        } catch (e) {
          fallidas++;
        }
      }
    }
    aviso(fallidas ? `Importación lista. ${fallidas} ítems o fotos no se pudieron guardar/subir.` : "");
  } finally {
    botones.forEach(b => b.disabled = false);
    render();
  }
}

$("#impCancel").onclick = () => {
  pendientes = null;
  $("#impDlg").close();
};

$("#impReplace").onclick = () => {
  $("#impDlg").close();
  const p = pendientes, d = pendientesDisp;
  pendientes = null;
  aplicarImport(p, true, d);
};

$("#impMerge").onclick = () => {
  $("#impDlg").close();
  const p = pendientes, d = pendientesDisp;
  pendientes = null;
  aplicarImport(p, false, d);
};

let lbItem = null, lbN = 0;

function abrirVisor(id, n, s = sec) {
  lbItem = (data[s] || []).find(i => i.id === id);
  if (!lbItem) return;
  lbN = Math.min(n, lbItem.fotos.length - 1);
  pintarVisor();
  $("#lb").showModal();
}

function pintarVisor() {
  $("#lbImg").src = srcFoto(lbItem.fotos[lbN]);
  $("#lbImg").alt = lbItem.nombre;
  $("#lbCap").textContent = `${lbItem.nombre} (${lbN + 1} de ${lbItem.fotos.length})`;
  $("#lbPrev").hidden = $("#lbNext").hidden = lbItem.fotos.length < 2;
}

const mover = d => {
  lbN = (lbN + d + lbItem.fotos.length) % lbItem.fotos.length;
  pintarVisor();
};

$("#lbPrev").onclick = () => mover(-1);

$("#lbNext").onclick = () => mover(1);

$("#lbClose").onclick = () => $("#lb").close();

$("#lb").addEventListener("click", e => {
  if (e.target.id === "lb") $("#lb").close();
});

$("#lb").addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") mover(-1);
  if (e.key === "ArrowRight") mover(1);
});

window.addEventListener("storage", e => { if(e.key?.startsWith("trip-planning-active::")) location.reload(); });
render();

function esperarFirebaseReady(timeoutMs) {
  return new Promise(resolve => {
    const t0 = Date.now();
    (function poll() {
      if (window._misCosasReady) {
        window._misCosasReady.then(resolve).catch(() => resolve(null));
        return;
      }
      if (Date.now() - t0 > timeoutMs) {
        resolve(null);
        return;
      }
      setTimeout(poll, 50);
    })();
  });
}

(async () => {
  const listo = await esperarFirebaseReady(8e3);
  if (listo && listo.DB) iniciarNube(listo.DB); else iniciarLocal();
})();
