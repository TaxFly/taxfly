const onReady = f => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", f) : setTimeout(f, 0);
const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

let initializeApp, getAuth, onAuthStateChanged, signOut, deleteUser, initializeAppCheck, ReCaptchaV3Provider, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, setDoc, deleteDoc, getDoc, getDocs, query, orderBy, writeBatch;

let app, auth, db;

let firebaseOk = true;

try {
  ({initializeApp: initializeApp} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js")));
  ({getAuth: getAuth, onAuthStateChanged: onAuthStateChanged, signOut: signOut, deleteUser: deleteUser} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js")));
  ({initializeAppCheck: initializeAppCheck, ReCaptchaV3Provider: ReCaptchaV3Provider} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js")));
  ({getFirestore: getFirestore, initializeFirestore: initializeFirestore, persistentLocalCache: persistentLocalCache, persistentMultipleTabManager: persistentMultipleTabManager, collection: collection, doc: doc, setDoc: setDoc, deleteDoc: deleteDoc, getDoc: getDoc, getDocs: getDocs, query: query, orderBy: orderBy, writeBatch: writeBatch} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js")));
  app = initializeApp(FB);
  auth = getAuth(app);
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    db = getFirestore(app);
  }
  if (navigator.onLine) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {}
  }
} catch (err) {
  console.warn("[TaxFly] SDK de Firebase no disponible (sin conexión) — modo offline directo.", err);
  firebaseOk = false;
}

let currentUser = null;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
  sessionStorage.setItem("taxfly_last_page", "./tickets.html");
}

function getPerfilId() {
  return localStorage.getItem("perfilActivoId") || "default";
}

const DOCS_CACHE_KEY_PFX = "taxusa_docs_cache_";

const IDB_NAME = "taxfly_docs_db";

const IDB_STORE = "kv";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function idbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function idbGet(key) {
  try {
    const db = await idbOpen();
    return await new Promise(res => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const rq = tx.objectStore(IDB_STORE).get(key);
      rq.onsuccess = () => res(rq.result ?? null);
      rq.onerror = () => res(null);
    });
  } catch (e) {
    return null;
  }
}

async function idbSet(key, value) {
  try {
    const db = await idbOpen();
    return await new Promise(res => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => res(false);
    });
  } catch (e) {
    return false;
  }
}

async function guardarDocsEnCache(docs) {
  await idbSet(DOCS_CACHE_KEY_PFX + (window._uid || "sin-usuario") + "::" + getPerfilId(), docs);
}

async function cargarDocsDesdeCache() {
  return await idbGet(DOCS_CACHE_KEY_PFX + (window._uid || "sin-usuario") + "::" + getPerfilId());
}

window.addEventListener("offline", () => {
  renderList();
});

// Migra los documentos del árbol viejo (users/profiles) antes de leer o escribir; si no se puede, falla y se reintenta.
async function ensureDocsTree(uid, pid) {
  if (!await window.TaxflyDocsTree.ensure(uid, pid)) throw new Error("Migración de documentos pendiente");
}

function docsCol(uid, pid) {
  return collection(db, "usuarios", uid, "perfiles", pid, "docs");
}

function chunksCol(uid, pid, docId) {
  return collection(db, "usuarios", uid, "perfiles", pid, "docs", docId, "chunks");
}

const CHUNK = 8e5;

function splitChunks(b64) {
  const out = [];
  for (let i = 0; i < b64.length; i += CHUNK) out.push(b64.slice(i, i + CHUNK));
  return out;
}

window.fsSave = async (uid, pid, docObj) => {
  await ensureDocsTree(uid, pid);
  const ref = doc(docsCol(uid, pid), docObj.id);
  const filesMeta = docObj.files.map((f, fileIdx) => {
    const chunks = splitChunks(f.dataUrl);
    return {
      kind: f.kind,
      name: f.name,
      fileIdx: fileIdx,
      numChunks: chunks.length,
      _chunks: chunks
    };
  });
  await setDoc(ref, {
    id: docObj.id,
    perfilId: docObj.perfilId,
    tripId: docObj.tripId || "unassigned",
    reservationId: docObj.reservationId || "",
    linkExplicit: !!docObj.linkExplicit,
    name: docObj.name,
    type: docObj.type,
    createdAt: docObj.createdAt,
    files: filesMeta.map(({_chunks: _chunks, ...meta}) => meta)
  });
  const batch = writeBatch(db);
  const cCol = chunksCol(uid, pid, docObj.id);
  for (const fm of filesMeta) {
    for (let ci = 0; ci < fm._chunks.length; ci++) {
      batch.set(doc(cCol, `${fm.fileIdx}_${ci}`), {
        data: fm._chunks[ci]
      });
    }
  }
  await batch.commit();
};

window.fsLink = async (uid, pid, docId, reservationId, tripId) => {
  await ensureDocsTree(uid, pid);
  return setDoc(doc(docsCol(uid, pid), docId), {reservationId, tripId, linkExplicit:true}, {merge:true});
};

window.fsLoad = async (uid, pid) => {
  await ensureDocsTree(uid, pid);
  const snap = await getDocs(query(docsCol(uid, pid), orderBy("createdAt", "desc")));
  const out = [];
  for (const d of snap.docs) {
    const data = d.data();
    const filesMeta = data.files || [];
    const isOldFormat = filesMeta.some(f => Array.isArray(f.chunks));
    let files;
    if (isOldFormat) {
      files = filesMeta.map(f => ({
        kind: f.kind,
        name: f.name,
        dataUrl: (f.chunks || []).join("")
      }));
    } else if (filesMeta.length) {
      const chunkSnap = await getDocs(chunksCol(uid, pid, d.id));
      const byFile = {};
      chunkSnap.forEach(c => {
        const [fi, ci] = c.id.split("_").map(Number);
        (byFile[fi] ||= [])[ci] = c.data().data;
      });
      files = filesMeta.map(f => ({
        kind: f.kind,
        name: f.name,
        dataUrl: (byFile[f.fileIdx] || []).join("")
      }));
    } else {
      files = [];
    }
    out.push({
      ...data,
      files: files
    });
  }
  return out;
};

window.fsDelete = async (uid, pid, docId) => {
  await ensureDocsTree(uid, pid);
  const chunkSnap = await getDocs(chunksCol(uid, pid, docId));
  if (!chunkSnap.empty) {
    const batch = writeBatch(db);
    chunkSnap.forEach(c => batch.delete(c.ref));
    await batch.commit();
  }
  await deleteDoc(doc(docsCol(uid, pid), docId));
};

async function probeConnectivity() {
  const cached = sessionStorage.getItem("taxfly_connectivity");
  if (cached !== null) return cached === "1";
  try {
    await fetch("https://www.gstatic.com/generate_204", {
      method: "HEAD",
      cache: "no-store",
      mode: "no-cors",
      signal: AbortSignal.timeout(1500)
    });
    sessionStorage.setItem("taxfly_connectivity", "1");
    return true;
  } catch (e) {
    sessionStorage.setItem("taxfly_connectivity", "0");
    return false;
  }
}

window.addEventListener("online", () => sessionStorage.setItem("taxfly_connectivity", "1"));

window.addEventListener("offline", () => sessionStorage.setItem("taxfly_connectivity", "0"));

function initDocsTripSelector(uid) {
  if (!uid) return;
  const select = document.getElementById("trip-filter-docs");
  window.TripContext.render(select, uid, perfilId);
  select.onchange = () => {
    if (!window.TripContext.select(uid, perfilId, select.value)) return;
    renderList();
    loadReservationsForDocs();
  };
}

async function handleAuthState(user) {
  if (!user) {
    try {
      const online = await probeConnectivity();
      if (online) {
        window.location.replace("login.html");
        return;
      }
      throw new Error("offline");
    } catch (e) {
      const pinHash = localStorage.getItem("taxusa_pin_hash");
      const pinEmail = localStorage.getItem("taxusa_offline_email");
      if (!pinHash || !pinEmail || !window.taxflyOfflineUnlocked()) {
        window.location.replace("login.html");
        return;
      }
      const nombre = localStorage.getItem("perfilActivoNombre") || pinEmail;
      document.getElementById("userEmail").innerText = nombre;
      const foto = localStorage.getItem("perfilActivoFoto") || "";
      if (foto) {
        const b = document.getElementById("btnSettings");
        b.style.backgroundImage = `url(${foto})`;
        b.innerText = "";
      }
      window._uid = localStorage.getItem("taxusa_offline_uid");
      initDocsTripSelector(window._uid);
      initDocs();
      return;
    }
  }
  currentUser = user;
  window._uid = user.uid;
  initDocsTripSelector(user.uid);
  const perfilNombre = localStorage.getItem("perfilActivoNombre");
  document.getElementById("userEmail").innerText = perfilNombre || user.email;
  if (!localStorage.getItem("perfilActivoId")) {
    window.location.replace("profiles.html");
    return;
  }
  const foto = localStorage.getItem("perfilActivoFoto") || user.photoURL;
  if (foto) {
    const b = document.getElementById("btnSettings");
    b.style.backgroundImage = `url(${foto})`;
    b.innerText = "";
  }
  if (navigator.onLine && window._flushTicketsPending) await window._flushTicketsPending();
  initDocs();
  if (navigator.onLine && typeof flushPendingDocs === "function") flushPendingDocs();
}

if (firebaseOk) {
  onAuthStateChanged(auth, handleAuthState);
} else {
  handleAuthState(null);
}

window.gestionarPIN = () => {
  document.getElementById("settingsDrawer").classList.remove("open");
  document.getElementById("menuOverlay").style.display = "none";
  const lang = localStorage.getItem("appLang") || "es";
  const texts = {
    es: {
      title: "Cambiar PIN Offline",
      sub: "Este PIN se usa para acceder sin conexión",
      l1: "PIN Nuevo (4–6 dígitos)",
      l2: "Confirmar PIN",
      btn: "Guardar PIN",
      ok: "¡PIN actualizado!",
      okSub: "Podés usarlo para entrar sin conexión"
    },
    en: {
      title: "Change Offline PIN",
      sub: "This PIN is used to access without internet",
      l1: "New PIN (4–6 digits)",
      l2: "Confirm PIN",
      btn: "Save PIN",
      ok: "PIN updated!",
      okSub: "You can use it to sign in offline"
    },
    pt: {
      title: "Alterar PIN Offline",
      sub: "Este PIN é usado para acessar sem internet",
      l1: "Novo PIN (4–6 dígitos)",
      l2: "Confirmar PIN",
      btn: "Salvar PIN",
      ok: "PIN atualizado!",
      okSub: "Você pode usá-lo para entrar sem conexão"
    }
  };
  const t = texts[lang] || texts.es;
  document.getElementById("pinModalTitle").textContent = t.title;
  document.getElementById("pinModalSub").textContent = t.sub;
  document.getElementById("pinLabel1").textContent = t.l1;
  document.getElementById("pinLabel2").textContent = t.l2;
  document.getElementById("pinConfirmBtn").textContent = t.btn;
  document.getElementById("pinSuccessMsg").textContent = t.ok;
  document.getElementById("pinSuccessSub").textContent = t.okSub;
  document.getElementById("pinInput1").value = "";
  document.getElementById("pinInput2").value = "";
  document.getElementById("pinError").style.display = "none";
  document.getElementById("pinStep1").style.display = "block";
  document.getElementById("pinStep2").style.display = "none";
  const overlay = document.getElementById("pinModalOverlay");
  overlay.style.display = "flex";
  setTimeout(() => document.getElementById("pinInput1").focus(), 100);
};

window.closePinModal = () => {
  document.getElementById("pinModalOverlay").style.display = "none";
};

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && document.getElementById("pinModalOverlay").style.display === "flex") window.closePinModal();
});

window.confirmarPIN = async () => {
  const lang = localStorage.getItem("appLang") || "es";
  const errMsgs = {
    es: "Los PINs no coinciden o son muy cortos (mín. 4 dígitos).",
    en: "PINs don't match or are too short (min. 4 digits).",
    pt: "Os PINs não coincidem ou são curtos demais (mín. 4 dígitos)."
  };
  const p1 = document.getElementById("pinInput1").value.trim();
  const p2 = document.getElementById("pinInput2").value.trim();
  const errEl = document.getElementById("pinError");
  if (p1.length < 4 || p1 !== p2) {
    errEl.textContent = errMsgs[lang] || errMsgs.es;
    errEl.style.display = "block";
    document.getElementById("pinInput1").style.borderColor = "var(--danger)";
    document.getElementById("pinInput2").style.borderColor = "var(--danger)";
    return;
  }
  errEl.style.display = "none";
  const hash = await window.createPinHash(p1);
  localStorage.setItem("taxusa_pin_hash", hash);
  if (currentUser) {
    try {
      await setDoc(doc(db, "usuarios", currentUser.uid), {
        pinHash: hash
      }, {
        merge: true
      });
    } catch (e) {
      console.warn("PIN sync error:", e);
    }
  }
  document.getElementById("pinStep1").style.display = "none";
  document.getElementById("pinStep2").style.display = "block";
  setTimeout(() => window.closePinModal(), 2200);
};

window.doLogout = () => signOut(auth).then(() => { window.taxflyClearOfflineUnlock(); window.location.replace("login.html"); });

window.doDeleteAccount = () => window.confirmAndDeleteAccount({
  db: db,
  doc: doc,
  deleteDoc: deleteDoc,
  deleteUser: deleteUser,
  currentUser: currentUser,
  rcCheck: _rcCheck
});

const perfilId = localStorage.getItem("perfilActivoId") || "default";

(function() {
  const f = localStorage.getItem("perfilActivoFoto");
  if (f) {
    const b = document.getElementById("btnSettings");
    if (b) {
      b.style.backgroundImage = `url(${f})`;
      b.innerText = "";
    }
  }
})();

let allDocs = [];

let activeFilter = "all";

let selType = "✈️";
let typeChosenManually = false;

let pending = [];

let camStream = null;

let viewingId = null;

const TYPE_CFG = {
  "✈️": {
    color: "#2563eb",
    bg: "rgba(37,99,235,.12)"
  },
  "🏨": {
    color: "#7c3aed",
    bg: "rgba(124,58,237,.12)"
  },
  "🚗": {
    color: "#10b981",
    bg: "rgba(16,185,129,.12)"
  },
  "🎟️": {
    color: "#f59e0b",
    bg: "rgba(245,158,11,.12)"
  },
  "🛡️": {
    color: "#0ea5e9",
    bg: "rgba(14,165,233,.12)"
  },
  "🩺": {
    color: "#ef4444",
    bg: "rgba(239,68,68,.12)"
  },
  "💉": {
    color: "#06b6d4",
    bg: "rgba(6,182,212,.12)"
  },
  "📋": {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,.12)"
  },
  "📦": {
    color: "#94a3b8",
    bg: "rgba(148,163,184,.12)"
  }
};

const LABELS = {
  es: {
    "✈️": "Boarding Pass",
    "🏨": "Hotel / Airbnb",
    "🚗": "Alquiler Auto",
    "🎟️": "Entrada",
    "🛡️": "Seguro Viaje",
    "🩺": "Cob. Médica",
    "💉": "Cert. Vacunas",
    "📋": "ESTA / Visa",
    "📦": "Otro"
  },
  en: {
    "✈️": "Boarding Pass",
    "🏨": "Hotel / Airbnb",
    "🚗": "Car Rental",
    "🎟️": "Ticket",
    "🛡️": "Travel Insurance",
    "🩺": "Medical Cover",
    "💉": "Vaccine Cert.",
    "📋": "ESTA / Visa",
    "📦": "Other"
  },
  pt: {
    "✈️": "Boarding Pass",
    "🏨": "Hotel / Airbnb",
    "🚗": "Aluguel Carro",
    "🎟️": "Ingresso",
    "🛡️": "Seguro Viagem",
    "🩺": "Cob. Médica",
    "💉": "Cert. Vacinas",
    "📋": "ESTA / Visto",
    "📦": "Outro"
  }
};

const I18N = {
  es: {
    nav_home: "INICIO",
    nav_taxes: "TAXES",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANIFICACIÓN",
    nav_units: "AYUDA Y REFERENCIAS",
    nav_group: "GRUPO",
    nav_routes: "RUTAS",
    nav_more: "MÁS",
    nav_routes_desc: "Mapas y direcciones",
    nav_units_desc: "Conversor de unidades y ayudas varias",
    nav_group_desc: "Gastos compartidos",
    btn_pin: "Cambiar PIN Offline",
    nav_tickets: "TICKETS",
    docs_title: "🗂️ Mis Documentos",
    docs_sub: "Boarding passes, vouchers y documentación de viaje",
    filter_all: "Todos",
    filter_flights: "✈️ Vuelos",
    filter_hotel: "🏨 Hotel",
    filter_car: "🚗 Auto",
    filter_tickets: "🎟️ Entradas",
    filter_insurance: "🛡️ Seguro",
    filter_medical: "🩺 Médico",
    filter_esta: "📋 ESTA",
    filter_other: "📦 Otros",
    type_boarding: "Boarding Pass",
    type_hotel: "Hotel / Airbnb",
    type_car: "Alquiler Auto",
    type_ticket: "Entrada / Ticket",
    type_insurance: "Seguro Viaje",
    type_medical: "Cob. Médica",
    type_vaccine: "Cert. Vacunas",
    type_esta: "ESTA / Visa",
    type_other: "Otro",
    btn_add_doc: "AGREGAR DOCUMENTO",
    sheet_title: "Nuevo Documento",
    label_name: "Nombre",
    ph_name: "Ej: Vuelo AA123 — MIA",
    label_type: "Tipo",
    label_source: "Agregar archivo",
    src_cam: "Cámara",
    src_file: "Galería / PDF",
    btn_cancel: "CANCELAR",
    btn_save: "GUARDAR",
    btn_share: "Compartir",
    btn_del: "Eliminar",
    empty_docs: "Todavía no tenés documentos guardados.\nAgregá tu boarding pass, vouchers y más.",
    settings_title: "Ajustes",
    label_lang: "Idioma",
    btn_profile: "Cambiar Perfil",
    btn_theme: "Cambiar Tema",
    btn_update: "Actualizar App",
    btn_email: "Cambiar Correo",
    btn_password: "Cambiar Contraseña",
    btn_switch_app: "Cambiar Aplicación",
    btn_logout: "Cerrar Sesión",
    btn_delete: "Eliminar Cuenta",
    footer_by: "Creado por Juan Cruz Bria",
    lbl_ver: "VER",
    lbl_pgs: "pág.",
    offline_msg: "Sin conexión — los documentos se sincronizarán al reconectar",
    offline_chat: "Sin conexión — el chat de Taxie no está disponible",
    offline_pending_1: "1 cambio pendiente — se sincronizará al reconectar",
    offline_pending_n: " cambios pendientes — se sincronizarán al reconectar",
    synced_ok: "sincronizado",
    synced_ok_pl: "sincronizados",
    heavy_pdf_title: "📄 Archivo muy pesado",
    heavy_pdf_sub: "Este PDF supera los <strong>3 MB</strong>. Elegí cómo querés continuar:",
    heavy_opt_a_title: "⚡ Comprimir acá (automático)",
    heavy_opt_a_body: "El PDF se convierte en imágenes para reducir el tamaño.<br><strong>⚠️ El texto ya no va a ser seleccionable ni copiable.</strong><br>Ideal para boarding passes y vouchers.",
    heavy_opt_b_title: "🌐 Comprimir en ilovepdf.com",
    heavy_opt_b_body: "Se abre ilovepdf en una nueva pestaña. Comprimís el archivo,<br>lo guardás y lo volvés a subir acá.<br><strong>✅ El texto sigue siendo seleccionable y copiable.</strong>",
    heavy_opt_c_title: "📤 Subir igual sin comprimir",
    heavy_opt_c_body: "Puede fallar si el archivo es muy grande.<br>Recomendado solo si el PDF tiene entre 3 y 4 MB.",
    heavy_cancel: "CANCELAR",
    viewer_loading: "Cargando PDF…",
        viewer_error: "No se pudo cargar el PDF.",
    err_choose_trip_link: "Elegí el viaje de este documento antes de vincularlo.",
    err_compress_failed: "No se pudo comprimir el PDF. Intentá desde ilovepdf.com",
    err_camera_unavailable: "Cámara no disponible.",
    err_enter_name: "Ingresá un nombre.",
    err_add_image_or_pdf: "Agregá al menos una imagen o PDF.",
    err_share_failed: "No se pudo compartir.",
    search_placeholder: "Buscar en el documento…"
  },
  en: {
    nav_home: "HOME",
    nav_taxes: "TAXES",
    nav_expenses: "EXPENSES",
    nav_itinerary: "PLANNING",
    nav_units: "Help & Resources",
    nav_group: "GROUP",
    nav_routes: "ROUTES",
    nav_more: "MORE",
    nav_routes_desc: "Maps & directions",
    nav_units_desc: "Unit Converter & Utilities",
    nav_group_desc: "Shared expenses",
    btn_pin: "Change PIN Offline",
    nav_tickets: "TICKETS",
    docs_title: "🗂️ My Documents",
    docs_sub: "Boarding passes, vouchers and travel docs",
    filter_all: "All",
    filter_flights: "✈️ Flights",
    filter_hotel: "🏨 Hotel",
    filter_car: "🚗 Car",
    filter_tickets: "🎟️ Tickets",
    filter_insurance: "🛡️ Insurance",
    filter_medical: "🩺 Medical",
    filter_esta: "📋 ESTA",
    filter_other: "📦 Other",
    type_boarding: "Boarding Pass",
    type_hotel: "Hotel / Airbnb",
    type_car: "Car Rental",
    type_ticket: "Entry / Ticket",
    type_insurance: "Travel Insurance",
    type_medical: "Med. Cover",
    type_vaccine: "Vaccine Cert.",
    type_esta: "ESTA / Visa",
    type_other: "Other",
    btn_add_doc: "ADD DOCUMENT",
    sheet_title: "New Document",
    label_name: "Name",
    ph_name: "Ex: Flight AA123 — MIA",
    label_type: "Type",
    label_source: "Add file",
    src_cam: "Camera",
    src_file: "Gallery / PDF",
    btn_cancel: "CANCEL",
    btn_save: "SAVE",
    btn_share: "Share",
    btn_del: "Delete",
    empty_docs: "No documents saved yet.\nAdd your boarding pass, vouchers and more.",
    settings_title: "Settings",
    label_lang: "Language",
    btn_profile: "Change Profile",
    btn_theme: "Toggle Theme",
    btn_update: "Update App",
    btn_email: "Change Email",
    btn_password: "Change Password",
    btn_switch_app: "Switch App",
    btn_logout: "Sign Out",
    btn_delete: "Delete Account",
    footer_by: "Created by Juan Cruz Bria",
    lbl_ver: "VIEW",
    lbl_pgs: "p.",
    offline_msg: "Offline — documents will sync when reconnected",
    offline_chat: "Offline — Taxie chat is not available",
    offline_pending_1: "1 change pending — will sync when reconnected",
    offline_pending_n: " changes pending — will sync when reconnected",
    synced_ok: "synced",
    synced_ok_pl: "synced",
    heavy_pdf_title: "📄 File too large",
    heavy_pdf_sub: "This PDF exceeds <strong>3 MB</strong>. Choose how to proceed:",
    heavy_opt_a_title: "⚡ Compress here (automatic)",
    heavy_opt_a_body: "The PDF is converted to images to reduce size.<br><strong>⚠️ Text will no longer be selectable or copyable.</strong><br>Ideal for boarding passes and vouchers.",
    heavy_opt_b_title: "🌐 Compress at ilovepdf.com",
    heavy_opt_b_body: "Opens ilovepdf in a new tab. Compress the file,<br>save it and re-upload it here.<br><strong>✅ Text remains selectable and copyable.</strong>",
    heavy_opt_c_title: "📤 Upload anyway without compressing",
    heavy_opt_c_body: "May fail if the file is too large.<br>Recommended only if the PDF is between 3 and 4 MB.",
    heavy_cancel: "CANCEL",
    viewer_loading: "Loading PDF…",
        viewer_error: "Could not load the PDF.",
    err_choose_trip_link: "Choose this document's trip before linking it.",
    err_compress_failed: "Couldn't compress the PDF. Try it at ilovepdf.com",
    err_camera_unavailable: "Camera not available.",
    err_enter_name: "Enter a name.",
    err_add_image_or_pdf: "Add at least one image or PDF.",
    err_share_failed: "Couldn't share.",
    search_placeholder: "Search in the document…"
  },
  pt: {
    nav_home: "INÍCIO",
    nav_taxes: "TAXES",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANEJAMENTO",
    nav_units: "Ajuda e Recursos",
    nav_group: "GRUPO",
    nav_routes: "ROTAS",
    nav_more: "MAIS",
    nav_routes_desc: "Mapas e direções",
    nav_units_desc: "Conversor de Unidades e Utilidades",
    nav_group_desc: "Gastos compartilhados",
    btn_pin: "Alterar PIN Offline",
    nav_tickets: "TICKETS",
    docs_title: "🗂️ Meus Documentos",
    docs_sub: "Boarding passes, vouchers e documentação de viagem",
    filter_all: "Todos",
    filter_flights: "✈️ Voos",
    filter_hotel: "🏨 Hotel",
    filter_car: "🚗 Carro",
    filter_tickets: "🎟️ Ingressos",
    filter_insurance: "🛡️ Seguro",
    filter_medical: "🩺 Médico",
    filter_esta: "📋 ESTA",
    filter_other: "📦 Outros",
    type_boarding: "Boarding Pass",
    type_hotel: "Hotel / Airbnb",
    type_car: "Aluguel Carro",
    type_ticket: "Ingresso / Ticket",
    type_insurance: "Seguro Viagem",
    type_medical: "Cob. Médica",
    type_vaccine: "Cert. Vacinas",
    type_esta: "ESTA / Visto",
    type_other: "Outro",
    btn_add_doc: "ADICIONAR DOCUMENTO",
    sheet_title: "Novo Documento",
    label_name: "Nome",
    ph_name: "Ex: Voo AA123 — MIA",
    label_type: "Tipo",
    label_source: "Adicionar arquivo",
    src_cam: "Câmera",
    src_file: "Galeria / PDF",
    btn_cancel: "CANCELAR",
    btn_save: "SALVAR",
    btn_share: "Compartilhar",
    btn_del: "Excluir",
    empty_docs: "Nenhum documento salvo ainda.\nAdicione seu boarding pass, vouchers e mais.",
    settings_title: "Configurações",
    label_lang: "Idioma",
    btn_profile: "Trocar Perfil",
    btn_theme: "Alternar Tema",
    btn_update: "Atualizar App",
    btn_email: "Alterar Email",
    btn_password: "Alterar Senha",
    btn_switch_app: "Trocar Aplicativo",
    btn_logout: "Sair",
    btn_delete: "Excluir Conta",
    footer_by: "Criado por Juan Cruz Bria",
    lbl_ver: "VER",
    lbl_pgs: "pág.",
    offline_msg: "Sem conexão — documentos serão sincronizados ao reconectar",
    offline_chat: "Sem conexão — o chat do Taxie não está disponível",
    offline_pending_1: "1 alteração pendente — será sincronizada ao reconectar",
    offline_pending_n: " alterações pendentes — serão sincronizadas ao reconectar",
    synced_ok: "sincronizado",
    synced_ok_pl: "sincronizados",
    heavy_pdf_title: "📄 Arquivo muito pesado",
    heavy_pdf_sub: "Este PDF ultrapassa <strong>3 MB</strong>. Escolha como continuar:",
    heavy_opt_a_title: "⚡ Comprimir aqui (automático)",
    heavy_opt_a_body: "O PDF é convertido em imagens para reduzir o tamanho.<br><strong>⚠️ O texto não será mais selecionável nem copiável.</strong><br>Ideal para boarding passes e vouchers.",
    heavy_opt_b_title: "🌐 Comprimir no ilovepdf.com",
    heavy_opt_b_body: "Abre o ilovepdf em uma nova aba. Comprima o arquivo,<br>salve e faça o upload novamente aqui.<br><strong>✅ O texto permanece selecionável e copiável.</strong>",
    heavy_opt_c_title: "📤 Enviar assim sem comprimir",
    heavy_opt_c_body: "Pode falhar se o arquivo for muito grande.<br>Recomendado apenas se o PDF tiver entre 3 e 4 MB.",
    heavy_cancel: "CANCELAR",
    viewer_loading: "Carregando PDF…",
        viewer_error: "Não foi possível carregar o PDF.",
    err_choose_trip_link: "Escolha a viagem deste documento antes de vinculá-lo.",
    err_compress_failed: "Não foi possível comprimir o PDF. Tente em ilovepdf.com",
    err_camera_unavailable: "Câmera não disponível.",
    err_enter_name: "Digite um nome.",
    err_add_image_or_pdf: "Adicione ao menos uma imagem ou PDF.",
    err_share_failed: "Não foi possível compartilhar.",
    search_placeholder: "Buscar no documento…"
  }
};

function tr(key, vars) {
  const lang = localStorage.getItem("appLang") || "es";
  let str = (I18N[lang] || I18N.es)[key];
  if (str == null) return key;
  if (vars) {
    for (const k in vars) str = str.split("{" + k + "}").join(vars[k]);
  }
  return str;
}

async function initDocs() {
  loadReservationsForDocs();
  const cached = await cargarDocsDesdeCache();
  if (cached && cached.length) {
    allDocs = cached;
    renderList();
    updateStorage();
    openRequestedDocument();
  }
  const legacy = await idbGet(QUEUE_KEY) || [];
  if (!navigator.onLine) {
    if (!cached || !cached.length) {
      hideSyncBanner();
      renderList();
      updateStorage();
    }
    if (legacy.length) showSyncBanner("Hay documentos pendientes de una versión anterior sin usuario verificable. Conservá un respaldo de este dispositivo.", true);
    await consumeQuickAttachment();
    return;
  }
  showSyncBanner("Cargando documentos…", false);
  try {
    allDocs = await window.fsLoad(window._uid, perfilId);
    const byId = new Map(allDocs.map(d => [d.id,d]));
    for (const op of await loadQueue()) {
      if (op.uid !== window._uid || op.perfilId !== perfilId) continue;
      if (op.type === "save_doc") byId.set(op.docId,op.docObj);
      if (op.type === "del_doc") byId.delete(op.docId);
      if (op.type === "link_doc" && byId.has(op.docId)) Object.assign(byId.get(op.docId),{reservationId:op.reservationId,tripId:op.tripId,linkExplicit:true});
    }
    allDocs = [...byId.values()];
    await guardarDocsEnCache(allDocs);
    window.taxflyOfflineStatus?.mark("docs", window._uid, perfilId);
    hideSyncBanner();
  } catch (e) {
    console.warn("Firestore load error", e);
    hideSyncBanner();
    if (!cached) {
      allDocs = [];
    }
  }
  await refreshPendingDocs();
  renderList();
  updateStorage();
  openRequestedDocument();
  await consumeQuickAttachment();
  if (legacy.length) showSyncBanner("Hay documentos pendientes de una versión anterior sin usuario verificable. Conservá un respaldo antes de borrar datos locales; no se enviarán a otro perfil automáticamente.", true);
}

async function consumeQuickAttachment() {
  const params = new URLSearchParams(location.search);
  if (!params.has("quick") || !params.has("reservation")) return;
  const draft = await idbGet("taxfly-quick-attachment");
  if (!draft || draft.uid !== window._uid || draft.profile !== perfilId || draft.reservationId !== params.get("reservation") || draft.tripId !== window.TripContext.assign(window._uid, perfilId)) return;
  try {
    window.openAddModal();
    document.getElementById("inp-name").value = draft.name;
    await window.handleFiles([draft.file]);
    if (document.getElementById("heavyPdfModal").classList.contains("show")) return;
    if (!pending.length) throw Error("El archivo no pudo procesarse");
    await window.saveDoc();
    await idbSet("taxfly-quick-attachment", null);
    params.delete("quick");
    history.replaceState(null, "", location.pathname + (params.size ? "?" + params : ""));
  } catch(e) { console.warn("Adjunto pendiente", e); showSyncBanner("La reserva se guardó. Revisá el archivo y guardalo desde Documentos.", true); }
}

let linkedReservations = [];
function documentReservation(d) {
  return d.linkExplicit
    ? linkedReservations.find(r => r.id === d.reservationId)
    : linkedReservations.find(r => r.id === d.reservationId || r.documentId === d.id);
}
function documentSuggestions(d) {
  if (!window._uid || !['unassigned',window.TripContext.assign(window._uid,perfilId)].includes(d.tripId||'unassigned')) return [];
  return window.TaxflyDocumentLinks.suggest(d,linkedReservations);
}
window.openDocumentLink = id => {
  const target=id || viewingId, docObj=allDocs.find(d=>d.id===target), dialog=document.getElementById('docLinkDialog');
  if (!docObj || !window._uid) return;
  const currentTrip=window.TripContext.assign(window._uid,perfilId);
  if (!['unassigned',currentTrip].includes(docObj.tripId||'unassigned')) {
    showAlert(tr('err_choose_trip_link')); return;
  }
  const matches=documentSuggestions(docObj), best=matches[0], second=matches[1];
  const confident=best && best.score>=6 && (!second || best.score-second.score>=2);
  dialog.dataset.docId=docObj.id;
  document.getElementById('doc-link-description').textContent=`${docObj.name} · ${window.TaxflyDocumentLinks.kind(docObj)==='stay'?tfL3('Alojamiento','Accommodation','Hospedagem'):window.TaxflyDocumentLinks.kind(docObj)==='flight'?tfL3('Vuelo','Flight','Voo'):tfL3('Documento del viaje','Trip document','Documento da viagem')}`;
  const hint=document.getElementById('doc-link-suggestion');hint.replaceChildren();
  if(best){const block=document.createElement('div');block.className='doc-link-suggestion';
    const heading=document.createElement('strong'),detail=document.createElement('span');
    heading.textContent=(confident?tfL3('Sugerencia: ','Suggestion: ','Sugestão: '):tfL3('Posible vínculo: ','Possible link: ','Possível vínculo: '))+best.reservation.name;
    detail.textContent=best.reason+(confident?tfL3(' · Confirmá antes de guardar',' · Confirm before saving',' · Confirme antes de salvar'):tfL3(' · Revisá la reserva correcta',' · Check that it is the right reservation',' · Verifique se é a reserva correta'));
    block.append(heading,detail);hint.append(block);
  }else hint.textContent=linkedReservations.length?tfL3('No hay una coincidencia clara. Elegí la reserva manualmente.','No clear match. Choose the reservation manually.','Nenhuma correspondência clara. Escolha a reserva manualmente.'):tfL3('Todavía no hay reservas en este viaje.','There are no reservations in this trip yet.','Ainda não há reservas nesta viagem.');
  const select=document.getElementById('doc-link-reservation');select.replaceChildren();
  for(const [id,name] of [['',tfL3('Sin reserva vinculada','No linked reservation','Sem reserva vinculada')],...linkedReservations.map(r=>[r.id,r.name])]) {
    const option=document.createElement('option');option.value=id;option.textContent=name;select.append(option);
  }
  select.value=documentReservation(docObj)?.id || (confident?best.reservation.id:'');
  document.getElementById('doc-link-feedback').textContent='';
  dialog.showModal();
};
document.getElementById('doc-link-cancel').onclick=()=>document.getElementById('docLinkDialog').close();
document.getElementById('doc-link-save').onclick=async()=>{
  const dialog=document.getElementById('docLinkDialog'),docObj=allDocs.find(d=>d.id===dialog.dataset.docId),chosen=document.getElementById('doc-link-reservation').value;
  if(!docObj || (chosen && !linkedReservations.some(r=>r.id===chosen)))return;
  const button=document.getElementById('doc-link-save');button.disabled=true;
  const previous={reservationId:docObj.reservationId,linkExplicit:docObj.linkExplicit,tripId:docObj.tripId};
  try {
    docObj.reservationId=chosen;docObj.linkExplicit=true;
    if(chosen && (docObj.tripId||'unassigned')==='unassigned')docObj.tripId=window.TripContext.assign(window._uid,perfilId);
    if(!await idbSet(DOCS_CACHE_KEY_PFX+window._uid+'::'+perfilId,allDocs))throw Error(tfL3('No se pudo guardar en este dispositivo.','Couldn\'t save on this device.','Não foi possível salvar neste dispositivo.'));
    renderList();
    const q=await loadQueue(), pendingSave=q.find(o=>o.docId===docObj.id && o.type==='save_doc');
    if(pendingSave){pendingSave.docObj.reservationId=chosen;pendingSave.docObj.tripId=docObj.tripId;pendingSave.docObj.linkExplicit=true;await saveQueue(q);}
    else if(!navigator.onLine)await enqueueLink(docObj.id,chosen,docObj.tripId);
    else try {await window.fsLink(window._uid,perfilId,docObj.id,chosen,docObj.tripId)} catch(e){await enqueueLink(docObj.id,chosen,docObj.tripId)}
    dialog.close();showSyncOk(navigator.onLine?(chosen?tfL3('Documento vinculado a la reserva','Document linked to the reservation','Documento vinculado à reserva'):tfL3('Vínculo eliminado','Link removed','Vínculo removido')):tfL3('Vínculo guardado en este dispositivo','Link saved on this device','Vínculo salvo neste dispositivo'));
    updateOfflineToast();
  }catch(e){docObj.reservationId=previous.reservationId;docObj.linkExplicit=previous.linkExplicit;docObj.tripId=previous.tripId;await guardarDocsEnCache(allDocs);renderList();document.getElementById('doc-link-feedback').textContent=e.message;}
  finally{button.disabled=false;}
};

window.openReservationLinkDialog = reservationId => {
  const dialog = document.getElementById('reservationLinkDialog');
  const reservation = linkedReservations.find(r => r.id === reservationId);
  dialog.dataset.reservationId = reservationId;
  document.getElementById('reservation-link-description').textContent = reservation ? reservation.name : '';
  const select = document.getElementById('reservation-link-doc');
  select.replaceChildren();
  if (!allDocs.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = tfL3('Todavía no tenés documentos guardados','You don\'t have any saved documents yet','Você ainda não tem documentos salvos');
    select.append(option);
  } else {
    allDocs.forEach(d => {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.name || tfL3('Documento','Document','Documento');
      select.append(option);
    });
  }
  document.getElementById('reservation-link-feedback').textContent = '';
  dialog.showModal();
};
function refreshReservationLinkDialog() {
  const dialog = document.getElementById('reservationLinkDialog');
  if (!dialog.open || !dialog.dataset.reservationId) return;
  const reservation = linkedReservations.find(r => r.id === dialog.dataset.reservationId);
  if (reservation) document.getElementById('reservation-link-description').textContent = reservation.name;
}
document.getElementById('reservation-link-cancel').onclick = () => document.getElementById('reservationLinkDialog').close();
document.getElementById('reservation-link-save').onclick = async () => {
  const dialog = document.getElementById('reservationLinkDialog');
  const reservationId = dialog.dataset.reservationId;
  const chosen = document.getElementById('reservation-link-doc').value;
  const docObj = allDocs.find(d => d.id === chosen);
  if (!docObj) { document.getElementById('reservation-link-feedback').textContent = tfL3('Elegí un documento.','Choose a document.','Escolha um documento.'); return; }
  const button = document.getElementById('reservation-link-save');
  button.disabled = true;
  const previous = {reservationId: docObj.reservationId, linkExplicit: docObj.linkExplicit, tripId: docObj.tripId};
  try {
    docObj.reservationId = reservationId;
    docObj.linkExplicit = true;
    if ((docObj.tripId || 'unassigned') === 'unassigned') docObj.tripId = window.TripContext.assign(window._uid, perfilId);
    if (!await idbSet(DOCS_CACHE_KEY_PFX+window._uid+'::'+perfilId, allDocs)) throw Error(tfL3('No se pudo guardar en este dispositivo.','Couldn\'t save on this device.','Não foi possível salvar neste dispositivo.'));
    renderList();
    const q = await loadQueue(), pendingSave = q.find(o => o.docId === docObj.id && o.type === 'save_doc');
    if (pendingSave) { pendingSave.docObj.reservationId = reservationId; pendingSave.docObj.tripId = docObj.tripId; pendingSave.docObj.linkExplicit = true; await saveQueue(q); }
    else if (!navigator.onLine) await enqueueLink(docObj.id, reservationId, docObj.tripId);
    else try { await window.fsLink(window._uid, perfilId, docObj.id, reservationId, docObj.tripId) } catch(e) { await enqueueLink(docObj.id, reservationId, docObj.tripId) }
    dialog.close();
    const params = new URLSearchParams(location.search);
    params.delete('linkReservation');
    history.replaceState(null, '', location.pathname + (params.size ? '?'+params : ''));
    showSyncOk(navigator.onLine ? tfL3('Documento vinculado a la reserva','Document linked to the reservation','Documento vinculado à reserva') : tfL3('Vínculo guardado en este dispositivo','Link saved on this device','Vínculo salvo neste dispositivo'));
    updateOfflineToast();
  } catch(e) { docObj.reservationId = previous.reservationId; docObj.linkExplicit = previous.linkExplicit; docObj.tripId = previous.tripId; await guardarDocsEnCache(allDocs); renderList(); document.getElementById('reservation-link-feedback').textContent = e.message; }
  finally { button.disabled = false; }
};
async function enqueueLink(docId,reservationId,tripId) {
  const q=await loadQueue();const prior=q.find(o=>o.docId===docId && o.type==='link_doc');
  if(prior){prior.reservationId=reservationId;prior.tripId=tripId;}
  else q.push({type:'link_doc',docId,reservationId,tripId,uid:window._uid,perfilId});
  await saveQueue(q);
}

async function loadReservationsForDocs() {
  if (!window._uid || !perfilId) return;
  const tripId = window.TripContext.assign(window._uid, perfilId);
  const cacheKey = `trip-reservations-v1::${perfilId}${tripId === "orlando" ? "" : "::" + tripId}`;
  try { linkedReservations = JSON.parse(localStorage.getItem(cacheKey) || "{}").items || []; } catch (_) {}
  renderList();
  fillDocumentFromReservation();
  refreshReservationLinkDialog();
  if (!navigator.onLine || tripId === "unassigned") return;
  try {
    const path = tripId === "orlando"
      ? ["usuarios", window._uid, "perfiles", perfilId, "orlando", "reservations"]
      : ["usuarios", window._uid, "perfiles", perfilId, "tripPlanning", tripId, "data", "reservations"];
    const snap = await getDoc(doc(db, ...path));
    if (window.TripContext.assign(window._uid, perfilId) !== tripId) return;
    if (snap.exists() && Array.isArray(snap.data().items)) linkedReservations = snap.data().items;
    renderList();
    fillDocumentFromReservation();
    refreshReservationLinkDialog();
  } catch (_) {}
}

function fillDocumentFromReservation() {
  const id = new URLSearchParams(location.search).get("reservation");
  const reservation = linkedReservations.find(r => r.id === id);
  if (!reservation) return;
  const nameInput = document.getElementById("inp-name");
  if (nameInput && !nameInput.value.trim()) nameInput.value = reservation.name;
  const type = reservation.type === "flight" ? "✈️" : reservation.type === "stay" ? "🏨" : "📦";
  document.querySelector(`.type-btn[data-type="${type}"]`)?.click();
}

function openRequestedDocument() {
  const params = new URLSearchParams(location.search);
  const id = params.get("doc");
  if (id && allDocs.some(d => d.id === id)) {
    params.delete("doc");
    history.replaceState(null, "", location.pathname + (params.size ? "?" + params : ""));
    window.openViewer(id);
  }
  if (params.has("reservation") && !document.getElementById("addModal").classList.contains("show")) {
    window.openAddModal();
    fillDocumentFromReservation();
  }
  const linkId = params.get("linkReservation");
  if (linkId && !document.getElementById("reservationLinkDialog").open) {
    window.openReservationLinkDialog(linkId);
  }
}

function showSyncBanner(msg, isError) {
  let b = document.getElementById("sync-banner");
  if (!b) {
    b = document.createElement("div");
    b.id = "sync-banner";
    b.style.cssText = "position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:10px 18px;font-size:.78rem;font-weight:700;color:var(--text-sub);box-shadow:var(--shadow-lg);z-index:9999;display:flex;align-items:center;gap:8px;white-space:nowrap;";
    document.body.appendChild(b);
  }
  b.innerHTML = (isError ? "⚠️ " : "☁️ ") + msg;
  b.style.display = "flex";
  b.style.borderColor = isError ? "var(--danger)" : "var(--border)";
}

function hideSyncBanner() {
  const b = document.getElementById("sync-banner");
  if (b) b.style.display = "none";
}

function renderList() {
  const lang = localStorage.getItem("appLang") || "es";
  const t = I18N[lang] || I18N.es;
  const lbl = LABELS[lang] || LABELS.es;
  const list = document.getElementById("doc-list");
  const empty = document.getElementById("empty-state");
  const visible=window._uid?allDocs.filter(d => !(window._tfHidden && window._tfHidden.has(d.id))):[];
  const filtered = activeFilter === "all" ? visible : visible.filter(d => d.type === activeFilter);
  if (!filtered.length) {
    list.innerHTML = "";
    if (activeFilter !== "all" && allDocs.length > 0) {
      const typeName = (LABELS[lang] || LABELS.es)[activeFilter] || activeFilter;
      const msgs = {
        es: `No tenés documentos de tipo <strong>${typeName}</strong> guardados.`,
        en: `No <strong>${typeName}</strong> documents saved yet.`,
        pt: `Nenhum documento do tipo <strong>${typeName}</strong> salvo ainda.`
      };
      empty.innerHTML = `<span class="empty-icon">${activeFilter}</span><p>${msgs[lang] || msgs.es}</p>`;
    } else {
      empty.innerHTML = `<span class="empty-icon">🗂️</span><p>${(t.empty_docs || "").replace("\n", "<br>")}</p>`;
    }
    empty.style.display = "flex";
    return;
  }
  empty.style.display = "none";
  list.innerHTML = filtered.map(doc => {
    const linked = documentReservation(doc);
    const suggested = linked ? null : documentSuggestions(doc)[0];
    const cfg = TYPE_CFG[doc.type] || TYPE_CFG["📦"];
    const f0 = doc.files?.[0];
    const pages = doc.files?.filter(f => f.kind === "pdf").length || 0;
    const imgs = doc.files?.filter(f => f.kind === "img").length || 0;
    const date = new Date(doc.createdAt).toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : "es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    let preview = "";
    const hasFiles = doc.files && doc.files.length > 0;
    const filesHaveData = hasFiles && doc.files.some(f => f.dataUrl && f.dataUrl.length > 0);
    const offlineBadge = hasFiles && !filesHaveData && !navigator.onLine ? `<div class="doc-offline-badge">📵 Archivo no disponible offline</div>` : "";
    if (f0?.kind === "img" && f0.dataUrl) {
      preview = `<img class="doc-thumb" src="${f0.dataUrl}" alt="preview" loading="lazy">`;
    } else if (f0?.kind === "pdf" && f0.dataUrl) {
      const pagesLabel = pages === 1 ? "1 pág." : pages + " págs.";
      const sizeKB = Math.round((f0.dataUrl?.length || 0) * .75 / 1024);
      const sizeStr = sizeKB > 1024 ? (sizeKB / 1024).toFixed(1) + " MB" : sizeKB + " KB";
      const fname = f0.name || doc.name + ".pdf";
      preview = `<div class="doc-pdf-preview">\n                <div class="doc-pdf-icon"><span>PDF</span></div>\n                <div class="doc-pdf-meta">\n                    <div class="doc-pdf-filename">${fname}</div>\n                    <div class="doc-pdf-size">${sizeStr} · ${pagesLabel}</div>\n                </div>\n                <div class="doc-pdf-badge">PDF</div>\n            </div>`;
    }
    const typeLabel = lbl[doc.type] || "Doc";
    const totalFiles = doc.files?.length || 0;
    return `<div class="doc-card" style="border-left-color:${cfg.color}" onclick="openViewer('${doc.id}')">\n            <div class="doc-stripe" style="background:${cfg.color}"></div>\n            <div class="doc-body">\n                <div class="doc-top">\n                    <div class="doc-icon" style="background:${cfg.bg}">${doc.type}</div>\n                    <div class="doc-info">\n                        <div class="doc-name">${esc(doc.name)}${window.tfSyncBadge ? tfSyncBadge(window._tfPendingDocs && window._tfPendingDocs.has(doc.id) ? "pending" : "ok", true) : ""}</div>\n                        <div class="doc-meta">\n                            <span>${typeLabel}</span>\n                            ${linked ? `<span class="doc-meta-dot"></span><span>Reserva: ${esc(linked.name)}</span>` : ""}\n                            <span class="doc-meta-dot"></span>\n                            <span>${date}</span>\n                            <span class="doc-meta-dot"></span>\n                            <span>${totalFiles} ${t.lbl_pgs || "pág."}</span>\n                        </div>\n                    </div>\n                    <div class="doc-btns">\n                        ${linked ? `<a class="doc-view-btn" href="planificacion.html?section=reservas&reservation=${encodeURIComponent(linked.id)}" onclick="event.stopPropagation()" style="text-decoration:none;">VER RESERVA</a>` : ""}\n                        <button class="doc-view-btn" onclick="event.stopPropagation();openDocumentLink('${doc.id}')">${linked?'CAMBIAR VÍNCULO':'VINCULAR'}</button>
                        <button class="doc-view-btn" onclick="event.stopPropagation();openViewer('${doc.id}')">${t.lbl_ver || "VER"}</button>\n                        <button class="doc-del-btn" onclick="event.stopPropagation();deleteDoc('${doc.id}')" title="Eliminar" aria-label="Eliminar documento">🗑️</button>\n                    </div>\n                </div>\n                ${!linked && suggested ? `<div class="doc-link-hint">🔗 Podría corresponder a <button type="button" onclick="event.stopPropagation();openDocumentLink('${doc.id}')">${esc(suggested.reservation.name)}</button></div>` : ""}\n                ${preview}\n                ${offlineBadge}\n            </div>\n        </div>`;
  }).join("");
}

window.setFilter = f => {
  activeFilter = f;
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.toggle("active", p.dataset.filter === f));
  renderList();
};

function updateStorage() {
  const total = allDocs.reduce((s, d) => s + (d.files || []).reduce((ss, f) => ss + (f.dataUrl?.length || 0), 0), 0);
  const mb = total / 1048576;
  const pct = Math.min(100, mb / 50 * 100);
  document.getElementById("storage-lbl").textContent = `${allDocs.length} doc${allDocs.length !== 1 ? "s" : ""}`;
  document.getElementById("storage-size").textContent = `${mb.toFixed(1)} MB`;
  document.getElementById("storage-fill").style.width = pct + "%";
  document.getElementById("storage-fill").style.background = pct > 80 ? "var(--danger)" : pct > 50 ? "var(--warn)" : "var(--primary)";
}

window.openAddModal = () => {
  typeChosenManually = false;
  document.getElementById("addModal").classList.add("show");
  document.body.style.overflow = "hidden";
};

window.closeAddModal = () => {
  document.getElementById("addModal").classList.remove("show");
  document.body.style.overflow = "";
  document.getElementById("inp-name").value = "";
  pending = [];
  renderPreview();
  document.querySelectorAll(".type-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  selType = "✈️";
  typeChosenManually = false;
  document.getElementById("doc-type-hint").textContent = "";
};

window.bgClick = e => {
  if (e.target === e.currentTarget) closeAddModal();
};

window.setType = btn => {
  typeChosenManually = true;
  document.getElementById("doc-type-hint").textContent = "";
  document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  selType = btn.dataset.type;
};

const MAX_PDF_BYTES = 3 * 1024 * 1024;

function compressImage(dataUrl) {
  return new Promise(res => {
    const img = new Image;
    img.onload = () => {
      const MAX = 1400;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) {
          h = Math.round(h * MAX / w);
          w = MAX;
        } else {
          w = Math.round(w * MAX / h);
          h = MAX;
        }
      }
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      res(c.toDataURL("image/jpeg", .75));
    };
    img.src = dataUrl;
  });
}

async function compressPdfToImages(dataUrl) {
  const pdfjs = await (import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"));
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), c => c.charCodeAt(0));
  const pdf = await pdfjs.getDocument({
    data: bytes
  }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({
      scale: 2.5
    });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport: vp
    }).promise;
    pages.push({
      dataUrl: canvas.toDataURL("image/jpeg", .88),
      kind: "img",
      name: `page_${i}.jpg`
    });
  }
  return pages;
}

window.handleFiles = async files => {
  const first=Array.from(files)[0];
  if(first && !typeChosenManually) {
    const title=document.getElementById("inp-name");
    if(!title.value.trim())title.value=first.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g," ").trim();
    const detected=window.TaxflyDocumentLinks.kind({name:title.value,files:[{name:first.name}],type:'📦'});
    const suggestedType=detected==='stay'?'🏨':detected==='flight'?'✈️':'📦';
    document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===suggestedType));
    selType=suggestedType;
    document.getElementById('doc-type-hint').textContent='Categoría sugerida a partir del nombre del archivo. Podés cambiarla.';
  }
  for (const f of Array.from(files)) {
    const raw = await toDataUrl(f);
    if (f.type === "application/pdf") {
      const sizeBytes = Math.round(raw.length * .75);
      if (sizeBytes > MAX_PDF_BYTES) {
        showHeavyPdfModal(raw, f.name);
        continue;
      }
      pending.push({
        dataUrl: raw,
        kind: "pdf",
        name: f.name
      });
    } else {
      const compressed = await compressImage(raw);
      pending.push({
        dataUrl: compressed,
        kind: "img",
        name: f.name
      });
    }
  }
  renderPreview();
};

let _heavyPdfRaw = null;

let _heavyPdfName = null;

function showHeavyPdfModal(raw, name) {
  _heavyPdfRaw = raw;
  _heavyPdfName = name;
  document.getElementById("heavyPdfModal").classList.add("show");
}

window.closeHeavyPdfModal = () => {
  document.getElementById("heavyPdfModal").classList.remove("show");
  _heavyPdfRaw = null;
  _heavyPdfName = null;
};

window.compressHerePdf = async () => {
  if (!_heavyPdfRaw) return;
  const name = _heavyPdfName;
  document.getElementById("heavyPdfModal").classList.remove("show");
  showSyncBanner("Comprimiendo PDF… puede tardar unos segundos", false);
  try {
    const pages = await compressPdfToImages(_heavyPdfRaw);
    pending.push(...pages);
    renderPreview();
  } catch (e) {
    console.error(e);
    showAlert(tr('err_compress_failed'));
  }
  hideSyncBanner();
  _heavyPdfRaw = null;
  _heavyPdfName = null;
};

window.openIlovePdf = () => {
  window.open("https://www.ilovepdf.com/es/comprimir_pdf", "_blank");
  window.closeHeavyPdfModal();
};

window.addPdfAnyway = () => {
  if (_heavyPdfRaw) pending.push({
    dataUrl: _heavyPdfRaw,
    kind: "pdf",
    name: _heavyPdfName
  });
  renderPreview();
  window.closeHeavyPdfModal();
};

function toDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader;
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function renderPreview() {
  const strip = document.getElementById("preview-strip");
  if (!pending.length) {
    strip.style.display = "none";
    strip.innerHTML = "";
    return;
  }
  strip.style.display = "flex";
  strip.innerHTML = pending.map((f, i) => f.kind === "pdf" ? `<div class="preview-item"><div class="preview-pdf"><span>📄</span><small>PDF</small></div><button class="preview-remove" onclick="rmFile(${i})" aria-label="Quitar archivo">✕</button></div>` : `<div class="preview-item"><img class="preview-thumb" alt="Vista previa" src="${f.dataUrl}"><button class="preview-remove" onclick="rmFile(${i})" aria-label="Quitar archivo">✕</button></div>`).join("");
}

window.rmFile = i => {
  pending.splice(i, 1);
  renderPreview();
};

window.openCamera = async () => {
  const ui = document.getElementById("camera-ui");
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      }
    });
    document.getElementById("cam-video").srcObject = camStream;
    ui.style.display = "block";
  } catch {
    showAlert(tr('err_camera_unavailable'));
  }
};

window.stopCamera = () => {
  if (camStream) {
    camStream.getTracks().forEach(t => t.stop());
    camStream = null;
  }
  document.getElementById("camera-ui").style.display = "none";
};

window.capturePhoto = () => {
  const v = document.getElementById("cam-video");
  const c = document.getElementById("cam-canvas");
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  c.getContext("2d").drawImage(v, 0, 0);
  const dataUrl = c.toDataURL("image/jpeg", .78);
  pending.push({
    dataUrl: dataUrl,
    kind: "img",
    name: `foto_${Date.now()}.jpg`
  });
  renderPreview();
  stopCamera();
};

function getLang() {
  return localStorage.getItem("appLang") || "es";
}

function getT() {
  return I18N[getLang()] || I18N.es;
}

function showSyncOk(msg) {
  const t = document.getElementById("sync-ok-toast");
  const m = document.getElementById("sync-ok-msg");
  if (!t) return;
  if (m) m.textContent = msg || getT().synced_ok_pl;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3500);
}

window.showSyncOk = showSyncOk;

async function refreshPendingDocs() {
  try {
    const q = await loadQueue();
    const ids = new Set(q.filter(o => o.docId && (o.type === "save_doc" || o.type === "link_doc") && o.uid === window._uid && o.perfilId === perfilId).map(o => o.docId));
    const prev = window._tfPendingDocs;
    const changed = !prev || prev.size !== ids.size || [ ...ids ].some(i => !prev.has(i));
    window._tfPendingDocs = ids;
    if (changed && typeof renderList === "function" && allDocs) renderList();
  } catch (e) {}
}

async function updateOfflineToast() {
  refreshPendingDocs();
  const toast = document.getElementById("offline-toast");
  if (!toast) return;
  const msgEl = document.getElementById("offline-toast-msg");
  const t = getT();
  if (!navigator.onLine) {
    const q = await loadQueue();
    if (q.length === 1 && msgEl) msgEl.textContent = t.offline_pending_1; else if (q.length > 1 && msgEl) msgEl.textContent = q.length + t.offline_pending_n; else if (msgEl) msgEl.textContent = t.offline_chat;
    toast.classList.add("show");
  } else {
    toast.classList.remove("show");
  }
}

window.updateOfflineToast = updateOfflineToast;

const QUEUE_KEY = "taxusa_tickets_pending_ops";
const queueScope = () => QUEUE_KEY + "::" + (window._uid || "sin-usuario") + "::" + perfilId;

async function loadQueue() {
  return await idbGet(queueScope()) || [];
}

async function saveQueue(q) {
  await idbSet(queueScope(), q);
  try { localStorage.setItem("taxfly-offline-pending-docs::" + (window._uid || "") + "::" + perfilId, String(q.length)); } catch (_) {}
}

async function enqueue(op) {
  if (!window._uid || !perfilId) throw new Error("No hay perfil activo para guardar el cambio pendiente");
  const q = await loadQueue();
  q.push({...op, uid: window._uid, perfilId});
  await saveQueue(q);
}

async function dequeue(id) {
  const q = (await loadQueue()).filter(o => o.docId !== id);
  await saveQueue(q);
}

window._flushTicketsPending = async () => {
  const uid = window._uid, profile = perfilId;
  if (!uid || !profile || !navigator.onLine) return;
  const q = await loadQueue();
  if (!q.length) return;
  let synced = 0;
  for (const op of q) {
    if (window._uid !== uid || perfilId !== profile || op.uid !== uid || op.perfilId !== profile) break;
    try {
      if (op.type === "save_doc") {
        await window.fsSave(uid, profile, op.docObj);
      } else if (op.type === "del_doc") {
        await window.fsDelete(uid, profile, op.docId);
      } else if (op.type === "link_doc") {
        await window.fsLink(uid, profile, op.docId, op.reservationId, op.tripId);
      } else break;
      await dequeue(op.docId);
      synced++;
    } catch (e) {
      console.warn("Flush error", e);
      break;
    }
  }
  if (synced > 0) {
    const t = getT();
    const label = synced === 1 ? t.synced_ok : t.synced_ok_pl;
    showSyncOk(`✅ ${synced} documento${synced > 1 ? "s" : ""} ${label}`);
  }
};

window.saveDoc = async () => {
  const name = document.getElementById("inp-name").value.trim();
  if (!name) {
    showAlert(tr('err_enter_name'));
    return;
  }
  if (!pending.length) {
    showAlert(tr('err_add_image_or_pdf'));
    return;
  }
  const docObj = {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    perfilId: perfilId,
    tripId:window._uid?window.TripContext.assign(window._uid,perfilId):"unassigned",
    reservationId: new URLSearchParams(location.search).get("reservation") || "",
    name: name,
    type: selType,
    files: [ ...pending ],
    createdAt: Date.now()
  };
  allDocs.unshift(docObj);
  await guardarDocsEnCache(allDocs);
  closeAddModal();
  if (docObj.reservationId) history.replaceState(null, "", location.pathname);
  renderList();
  updateStorage();
  if (!navigator.onLine) {
    await enqueue({
      type: "save_doc",
      docId: docObj.id,
      docObj: docObj
    });
    updateOfflineToast();
    return;
  }
  showSyncBanner("Sincronizando…", false);
  try {
    await window.fsSave(window._uid, perfilId, docObj);
    hideSyncBanner();
  } catch (e) {
    console.error("Firestore save error", e);
    await enqueue({
      type: "save_doc",
      docId: docObj.id,
      docObj: docObj
    });
    updateOfflineToast();
    showSyncBanner("Sin conexión — se guarda al reconectar", true);
    setTimeout(hideSyncBanner, 4e3);
  }
};

window.deleteDoc = id => {
  const idx = allDocs.findIndex(d => d.id === id);
  if (idx < 0) return;
  const item = allDocs[idx];
  window._tfHidden = window._tfHidden || new Set();
  tfDeleteWithUndo({
    remove: () => { window._tfHidden.add(id); renderList(); },
    restore: () => { window._tfHidden.delete(id); renderList(); },
    commit: async () => {
  const q = await loadQueue();
  const wasPending = q.some(o => o.docId === id && o.type === "save_doc");
  if (wasPending) {
    await dequeue(id);
  }
  window._tfHidden.delete(id);
  allDocs = allDocs.filter(d => d.id !== id);
  await guardarDocsEnCache(allDocs);
  renderList();
  updateStorage();
  if (!navigator.onLine) {
    if (!wasPending) await enqueue({
      type: "del_doc",
      docId: id
    });
    updateOfflineToast();
    return;
  }
  try {
    await window.fsDelete(window._uid, perfilId, id);
  } catch (e) {
    console.warn("Firestore delete error", e);
    if (!wasPending) await enqueue({
      type: "del_doc",
      docId: id
    });
    updateOfflineToast();
  }
    }
  });
};

window.deleteFromViewer = async () => {
  if (viewingId) {
    await deleteDoc(viewingId);
    closeViewer();
  }
};

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";

const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

let _pdfjs = null;

let _pdfDoc = null;

let _searchItems = [];

let _matchIdxs = [];

let _curMatch = -1;

let _hasPdfText = false;

async function getPdfJs() {
  if (_pdfjs) return _pdfjs;
  _pdfjs = await (import(PDFJS_URL));
  _pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return _pdfjs;
}

window.openViewer = async id => {
  const docObj = allDocs.find(d => d.id === id);
  if (!docObj) return;
  viewingId = id;
  _pdfDoc = null;
  _searchItems = [];
  _matchIdxs = [];
  _curMatch = -1;
  _hasPdfText = false;
  document.getElementById("searchInput").value = "";
  document.getElementById("searchCount").textContent = "";
  document.getElementById("viewerSearch").classList.remove("open");
  document.getElementById("btnSearchToggle").style.display = "none";
  document.getElementById("btnSearchToggle").classList.remove("active");
  document.getElementById("viewer-title").textContent = `${docObj.type} ${docObj.name}`;
  document.getElementById("viewerModal").classList.add("show");
  document.body.style.overflow = "hidden";
  const _aiBubble = document.getElementById("ai-bubble");
  const _aiChat = document.getElementById("ai-chat");
  if (_aiBubble) _aiBubble.style.display = "none";
  if (_aiChat) {
    _aiChat.classList.remove("open");
    _aiChat.style.display = "none";
  }
  const body = document.getElementById("viewer-body");
  const pdfFile = (docObj.files || []).find(f => f.kind === "pdf");
  const imgFiles = (docObj.files || []).filter(f => f.kind === "img");
  if (pdfFile) {
    body.innerHTML = '<div class="pdf-loading"><div class="pdf-spinner"></div>' + (I18N[localStorage.getItem("appLang") || "es"]?.viewer_loading || "Cargando PDF…") + "</div>";
    try {
      const pdfjs = await getPdfJs();
      const bytes = Uint8Array.from(atob(pdfFile.dataUrl.split(",")[1]), c => c.charCodeAt(0));
      _pdfDoc = await pdfjs.getDocument({
        data: bytes
      }).promise;
      body.innerHTML = "";
      const testPage = await _pdfDoc.getPage(1);
      const testContent = await testPage.getTextContent();
      _hasPdfText = testContent.items.some(it => it.str && it.str.trim().length > 0);
      for (let p = 1; p <= _pdfDoc.numPages; p++) {
        const page = await _pdfDoc.getPage(p);
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const cssScale = window.innerWidth * .96 / page.getViewport({
          scale: 1
        }).width;
        const vp = page.getViewport({
          scale: cssScale * dpr
        });
        const wrapper = document.createElement("div");
        wrapper.className = "viewer-page";
        wrapper.dataset.pageNum = p;
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        canvas.style.width = vp.width / dpr + "px";
        canvas.style.height = vp.height / dpr + "px";
        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport: vp
        }).promise;
        wrapper.appendChild(canvas);
        if (_hasPdfText) {
          const content = await page.getTextContent();
          const textLayer = document.createElement("div");
          textLayer.className = "text-layer";
          textLayer.style.cssText = `width:${vp.width}px;height:${vp.height}px;`;
          content.items.forEach((item, idx) => {
            if (!item.str) return;
            const tx = pdfjs.Util.transform(vp.transform, item.transform);
            const span = document.createElement("span");
            span.textContent = item.str;
            span.dataset.page = p;
            span.dataset.item = idx;
            const fontH = Math.abs(tx[3]);
            span.style.cssText = `\n                            left:${tx[4]}px;\n                            top:${tx[5] - fontH}px;\n                            font-size:${fontH}px;\n                            width:${item.width * cssScale}px;\n                        `;
            textLayer.appendChild(span);
            _searchItems.push({
              pageNum: p,
              text: item.str.toLowerCase(),
              span: span
            });
          });
          wrapper.appendChild(textLayer);
        }
        body.appendChild(wrapper);
      }
      if (_hasPdfText) {
        document.getElementById("btnSearchToggle").style.display = "flex";
      }
      imgFiles.forEach((f, i) => {
        const w = document.createElement("div");
        w.className = "viewer-page";
        w.innerHTML = `<img src="${f.dataUrl}" alt="Pág ${i + 1}" style="width:100%;display:block;">`;
        body.appendChild(w);
      });
    } catch (e) {
      console.error("pdf.js error", e);
      body.innerHTML = `<div class="pdf-loading">⚠️ ${I18N[localStorage.getItem("appLang") || "es"]?.viewer_error || "No se pudo cargar el PDF."}<br><small style="opacity:.6">${e.message}</small></div>`;
    }
  } else {
    body.innerHTML = imgFiles.map((f, i) => `<div class="viewer-page"><img src="${f.dataUrl}" alt="Pág ${i + 1}" style="width:100%;display:block;"></div>`).join("");
  }
};

window.closeViewer = () => {
  document.getElementById("viewerModal").classList.remove("show");
  document.body.style.overflow = "";
  viewingId = null;
  _pdfDoc = null;
  _searchItems = [];
  _matchIdxs = [];
  _curMatch = -1;
  document.getElementById("viewer-body").innerHTML = "";
  const _aiBubble = document.getElementById("ai-bubble");
  if (_aiBubble) _aiBubble.style.display = "flex";
};

window.toggleSearch = () => {
  const bar = document.getElementById("viewerSearch");
  const btn = document.getElementById("btnSearchToggle");
  const open = bar.classList.toggle("open");
  btn.classList.toggle("active", open);
  if (open) {
    setTimeout(() => document.getElementById("searchInput").focus(), 80);
  } else {
    clearHighlights();
    document.getElementById("searchCount").textContent = "";
  }
};

function clearHighlights() {
  _searchItems.forEach(it => it.span.classList.remove("highlight", "selected"));
  _matchIdxs = [];
  _curMatch = -1;
}

window.onSearchInput = () => {
  clearHighlights();
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) {
    document.getElementById("searchCount").textContent = "";
    return;
  }
  _matchIdxs = [];
  _searchItems.forEach((it, i) => {
    if (it.text.includes(q)) {
      it.span.classList.add("highlight");
      _matchIdxs.push(i);
    }
  });
  document.getElementById("searchCount").textContent = _matchIdxs.length ? `1 / ${_matchIdxs.length}` : tfL3("Sin resultados","No results","Sem resultados");
  if (_matchIdxs.length) {
    _curMatch = 0;
    scrollToMatch(0);
  }
};

window.onSearchKey = e => {
  if (e.key === "Enter") navMatch(1);
};

window.navMatch = dir => {
  if (!_matchIdxs.length) return;
  _searchItems[_matchIdxs[_curMatch]]?.span.classList.remove("selected");
  _curMatch = (_curMatch + dir + _matchIdxs.length) % _matchIdxs.length;
  scrollToMatch(_curMatch);
  document.getElementById("searchCount").textContent = `${_curMatch + 1} / ${_matchIdxs.length}`;
};

function scrollToMatch(idx) {
  const it = _searchItems[_matchIdxs[idx]];
  if (!it) return;
  it.span.classList.add("selected");
  it.span.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

window.shareDoc = async () => {
  const doc = allDocs.find(d => d.id === viewingId);
  if (!doc?.files?.[0]) return;
  const f = doc.files[0];
  try {
    const blob = await (await fetch(f.dataUrl)).blob();
    const file = new File([ blob ], doc.name + (f.kind === "pdf" ? ".pdf" : ".jpg"), {
      type: blob.type
    });
    if (navigator.canShare?.({
      files: [ file ]
    })) {
      await navigator.share({
        files: [ file ],
        title: doc.name
      });
    } else {
      const a = document.createElement("a");
      a.href = f.dataUrl;
      a.download = file.name;
      a.click();
    }
  } catch (e) {
    if (e.name !== "AbortError") showAlert(tr('err_share_failed'));
  }
};

window.toggleMoreMenu = e => {
  e.stopPropagation();
  const btn = document.getElementById("btnMore");
  const dd = document.getElementById("navDropdown");
  const isOpen = dd.classList.contains("show");
  dd.classList.toggle("show", !isOpen);
  btn.classList.toggle("open", !isOpen);
};

document.addEventListener("click", e => {
  const dd = document.getElementById("navDropdown");
  const btn = document.getElementById("btnMore");
  if (dd && btn && !btn.contains(e.target)) {
    dd.classList.remove("show");
    btn.classList.remove("open");
  }
});

window.toggleSettings = () => {
  const d = document.getElementById("settingsDrawer"), open = d.classList.toggle("open");
  document.getElementById("menuOverlay").style.display = open ? "block" : "none";
};

window.toggleDarkMode = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

window.changeProfile = () => {
  localStorage.removeItem("perfilActivoId");
  window.location.href = "profiles.html";
};

window.changeLanguage = lang => {
  { const _b = document.getElementById("ai-bubble"); if (_b) _b.setAttribute("aria-label", lang === "en" ? "Taxie — Travel assistant" : lang === "pt" ? "Taxie — Assistente de viagem" : "Taxie — Asistente de viaje"); }
  localStorage.setItem("appLang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll(".lang-opt").forEach(o => o.classList.remove("active"));
  document.getElementById("lang-" + lang)?.classList.add("active");
  const t = I18N[lang] || I18N.es;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (t[k]) el.innerText = t[k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if (t[k]) el.placeholder = t[k];
  });
  document.title = lang === "en" ? "TaxFly — Documents" : lang === "pt" ? "TaxFly — Documentos" : "TaxFly — Documentos";
  const setHtml = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.innerHTML = val;
  };
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };
  setHtml("heavy-pdf-title", t.heavy_pdf_title);
  setHtml("heavy-pdf-sub", t.heavy_pdf_sub);
  setText("heavy-opt-a-title", t.heavy_opt_a_title);
  setHtml("heavy-opt-a-body", t.heavy_opt_a_body);
  setText("heavy-opt-b-title", t.heavy_opt_b_title);
  setHtml("heavy-opt-b-body", t.heavy_opt_b_body);
  setText("heavy-opt-c-title", t.heavy_opt_c_title);
  setHtml("heavy-opt-c-body", t.heavy_opt_c_body);
  setText("heavy-cancel-btn", t.heavy_cancel);
  renderList();
  if (window.taxieUpdateLang) window.taxieUpdateLang(lang);
};

onReady(() => {
  const lang = localStorage.getItem("appLang") || "es";
  changeLanguage(lang);
});
