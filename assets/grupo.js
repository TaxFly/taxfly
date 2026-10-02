import { fsNet, fsNetFailover } from "./fs-net.js";
import { leaveAllGroups, leaveGroupsError } from "./group-exit.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const _RC_SITE_KEY = "6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME";

const _RC_VERIFY_URL = window.TAXFLY_CONFIG.WORKER_URL;

async function _rcToken(action) {
  return new Promise(resolve => {
    if (typeof grecaptcha === "undefined" || typeof grecaptcha.ready !== "function") {
      resolve(null);
      return;
    }
    const timer = setTimeout(() => resolve(null), 4000);
    const done = v => {
      clearTimeout(timer);
      resolve(v);
    };
    try {
      grecaptcha.ready(() => {
        try {
          grecaptcha.execute(_RC_SITE_KEY, {
            action: action
          }).then(done).catch(() => done(null));
        } catch (e) {
          done(null);
        }
      });
    } catch (e) {
      done(null);
    }
  });
}

async function _rcCheck(action) {
  const token = await _rcToken(action);
  if (!token) return true;
  try {
    const r = await fetch(_RC_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "verify_recaptcha",
        token: token,
        action: action
      })
    });
    if (!r.ok) return true;
    const d = await r.json();
    return d.success !== false;
  } catch {
    return true;
  }
}

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);

const FS_NET = await fsNet();
const db = (() => {
  try {
    return initializeFirestore(app, {
      ...FS_NET,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

const auth = getAuth(app);

// Si el servidor no confirma a tiempo (p. ej. un bloqueador corta el canal), no esperamos para siempre.
const withTimeout = (p, ms = 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

let currentUser = null;

let currentGroup = null;

let unsubscribe = null;

let categoriaActiva = "comida";

const perfilFoto = localStorage.getItem("perfilActivoFoto");

(function() {
  const f = perfilFoto;
  if (f) {
    const b = document.getElementById("btnSettings");
    if (b) {
      b.style.backgroundImage = `url(${f})`;
      b.innerText = "";
    }
  }
})();

const $ = id => document.getElementById(id);

// --- Identidad de miembro (uid + perfil) -----------------------------------
// Dos cuentas "Juan Cruz" y "Jorge" creadas desde el mismo mail comparten el
// mismo uid de Firebase Auth. Antes de esto, todo el módulo identificaba a un
// miembro solo por `uid`, así que el segundo perfil nunca se agregaba al grupo
// (quedaba "ya sos miembro" aunque fuera otra persona) y, si se forzaba, pisaba
// los datos del primero. Estos helpers distinguen por uid+perfilId (con
// fallback por apodo para membresías viejas sin perfilId guardado), igual
// criterio que ya usa group-exit.js al salir de un grupo.
const normName = s => String(s || "").trim().toLowerCase();

function esMismoMiembro(m, uid, perfilId, nombre) {
  if (!m || m.uid !== uid) return false;
  if (m.perfilId || perfilId) return m.perfilId === perfilId;
  return normName(m.nombre) === normName(nombre);
}

function memberId(m) {
  if (!m) return "";
  return m.uid + "::" + (m.perfilId ? m.perfilId : "n:" + normName(m.nombre));
}

function currentMemberId() {
  if (!currentUser) return "";
  return memberId({ uid: currentUser.uid, perfilId: currentUser.perfilId, nombre: currentUser.name });
}

// --- Roles -----------------------------------------------------------------
// admin: puede todo · editor: carga y borra gastos · lector: solo mira.
// El rol es POR CUENTA (uid) y vive en `adminUids` / `lectorUids` del grupo: son las listas que
// leen las reglas de Firestore, así que también se cumple en el servidor. Quien no está en
// ninguna es editor. El creador (creadoPor) es siempre administrador y no se le puede sacar.
const ROLES = [ "admin", "editor", "lector" ];

function rolDe(m, data) {
  if (!m || !data) return "lector";
  if (m.uid === data.creadoPor) return "admin";
  if ((data.adminUids || []).includes(m.uid)) return "admin";
  if ((data.lectorUids || []).includes(m.uid)) return "lector";
  return "editor";
}

function miRol() {
  if (!currentGroup || !currentUser) return "lector";
  if (currentGroup._demo) return "admin";
  const data = currentGroup.data;
  if (!(data.miembroUids || []).includes(currentUser.uid)) return "lector";
  return rolDe({ uid: currentUser.uid }, data);
}

// Patch de Firestore que deja a una cuenta con el rol indicado.
function patchRol(uid, rol) {
  return {
    adminUids: rol === "admin" ? arrayUnion(uid) : arrayRemove(uid),
    lectorUids: rol === "lector" ? arrayUnion(uid) : arrayRemove(uid)
  };
}

const esAdmin = () => miRol() === "admin";
const puedeEditar = () => miRol() !== "lector";

const fmt = n => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
}).format(n);

function showSection(id) {
  [ "s-loading", "s-lobby", "s-grupo" ].forEach(s => $(s).classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function showToast(msg) {
  if (window.tfToast) { window.tfToast(msg, { duration: 2800 }); return; }
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2800);
}

function shake(id) {
  const el = $(id);
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 400);
}

onAuthStateChanged(auth, async user => {
  if (user) {
    if (!navigator.onLine && !window.taxflyOfflineUnlocked()) { window.location.replace("login.html"); return; }
    currentUser = {
      uid: user.uid,
      name: user.displayName || user.email.split("@")[0],
      perfilId: localStorage.getItem("perfilActivoId") || null
    };
    const perfilNombre = localStorage.getItem("perfilActivoNombre");
    document.getElementById("userEmail").innerText = perfilNombre || user.email;
    const savedCode = localStorage.getItem("grupoActivo");
    if (savedCode) {
      if (!navigator.onLine) {
        const grupoCache = cargarGrupoDesdeCache(savedCode);
        if (grupoCache) {
          currentGroup = {
            id: savedCode,
            _offline: true,
            data: grupoCache
          };
          showSection("s-grupo");
          window._flushPending = flushPending;
          renderGrupo();
          updatePendingBadge();
          updateOfflineBanner(true);
        } else {
          showSection("s-lobby");
          cargarMisGrupos();
          updateOfflineBanner(true);
        }
      } else {
        try {
          const snap = await getDoc(doc(db, "grupos", savedCode));
          if (snap.exists()) {
            suscribirGrupo(savedCode);
          } else {
            localStorage.removeItem("grupoActivo");
            buscarGrupoEnFirestore(user.uid);
          }
        } catch (e) {
          buscarGrupoEnFirestore(user.uid);
        }
      }
    } else {
      if (!navigator.onLine) {
        showSection("s-lobby");
        cargarMisGrupos();
        updateOfflineBanner(true);
      } else {
        buscarGrupoEnFirestore(user.uid);
      }
    }
  } else {
    currentUser = null;
    showSection("s-lobby");
  }
  const img = perfilFoto || user && user.photoURL;
  if (img) {
    const btn = document.getElementById("btnSettings");
    btn.style.backgroundImage = `url(${img})`;
    btn.innerText = "";
  }
  const lang = localStorage.getItem("appLang") || "es";
  window.changeLanguage(lang);
});

async function buscarGrupoEnFirestore(uid) {
  try {
    const q = query(collection(db, "grupos"), where("miembroUids", "array-contains", uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const grupos = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      grupos.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      grupos.forEach(g => guardarGrupoEnLista(g.id, g.nombre));
      const savedCode = localStorage.getItem("grupoActivo");
      if (savedCode && grupos.find(g => g.id === savedCode)) {
        suscribirGrupo(savedCode);
      } else {
        showSection("s-lobby");
        cargarMisGrupos();
      }
    } else {
      showSection("s-lobby");
      cargarMisGrupos();
    }
  } catch (e) {
    showSection("s-lobby");
    cargarMisGrupos();
  }
}

window.changeProfile = () => {
  localStorage.removeItem("perfilActivoId");
  window.location.href = "profiles.html";
};

window.gestionarPIN = () => {
  document.getElementById("settingsDrawer").classList.remove("open");
  document.getElementById("menuOverlay").style.display = "none";
  if (!navigator.onLine) {
    const lang = localStorage.getItem("appLang") || "es";
    showAlert(lang === "en" ? "You need internet to change your PIN." : lang === "pt" ? "Você precisa de internet para alterar o PIN." : "Necesitás internet para cambiar el PIN.");
    return;
  }
  localStorage.setItem("taxusa_action", "change_pin");
  window.location.href = "login.html";
};

window.doLogout = () => {
  signOut(auth).then(() => {
    window.taxflyClearOfflineUnlock();
    window.location.replace("login.html");
  }).catch(er => showToast("❌ " + er.message));
};

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: auth.currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    showToast(tr("err_no_session"));
    return;
  }
  try {
    await sendPasswordResetEmail(auth, firebaseUser.email);
    showToast(tr("msg_recovery_sent"));
  } catch (er) {
    showToast("❌ " + er.message);
  }
};

window.doDeleteAccount = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return;
  if (!await showConfirm(tr("confirm_delete_account"))) return;
  if (!await _rcCheck("delete_account")) {
    showAlert(tr("err_security_retry"));
    return;
  }
  try {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    try {
      await leaveAllGroups(db, firebaseUser.uid);
    } catch (e) {
      console.error("[doDeleteAccount] no se pudo salir de los grupos", e);
      if (currentGroup && !currentGroup._demo) suscribirGrupo(currentGroup.id);
      showToast(leaveGroupsError());
      return;
    }
    await deleteDoc(doc(db, "usuarios", firebaseUser.uid));
    await deleteUser(firebaseUser);
    window.location.replace("login.html");
  } catch (er) {
    showToast(tr("err_reauth_required"));
  }
};

window.cambiarApodo = async () => {
  if (!currentUser) {
    showToast(tr("err_no_session"));
    return;
  }
  const nuevo = await showPrompt("Nuevo apodo:", currentUser.name);
  if (!nuevo || !nuevo.trim()) return;
  const nuevoNombre = nuevo.trim();
  try {
    if (currentGroup && !currentGroup._demo) {
      const ref = doc(db, "grupos", currentGroup.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const miembros = data.miembros.map(m => esMismoMiembro(m, currentUser.uid, currentUser.perfilId, currentUser.name) ? {
          ...m,
          nombre: nuevoNombre
        } : m);
        const miKey = currentMemberId();
        const gastos = data.gastos.map(g => (g.pagadorKey ? g.pagadorKey === miKey : g.pagadorUid === currentUser.uid) ? {
          ...g,
          pagadorNombre: nuevoNombre
        } : g);
        await updateDoc(ref, puedeEditar() ? {
          miembros: miembros,
          gastos: gastos
        } : {
          miembros: miembros
        });
      }
    }
    currentUser.name = nuevoNombre;
    localStorage.setItem("perfilActivoNombre", nuevoNombre);
    document.getElementById("userEmail").innerText = nuevoNombre;
    showToast(tr("msg_apodo_changed", { nombre: nuevoNombre }));
    window.toggleSettings();
  } catch (er) {
    showToast("❌ " + er.message);
  }
};

window.crearGrupo = async () => {
  const nombre = $("inp-nombre").value.trim();
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  if (!nombre) {
    shake("btn-crear");
    showToast("⚠️ " + (t.warn_trip_name || "Escribí un nombre para el viaje"));
    return;
  }
  if (!await _rcCheck("create_group")) {
    showToast(tr("err_security_check"));
    return;
  }
  if (!currentUser) {
    showToast("⚠️ " + (t.warn_login_create || "Iniciá sesión para crear un grupo real"));
    activarDemo();
    return;
  }
  const apodoInput = $("inp-apodo-crear").value.trim();
  const apodo = apodoInput || currentUser.name;
  const btn = $("btn-crear");
  btn.disabled = true;
  btn.textContent = t.creating || "Creando…";
  try {
    const _alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const _rnd = crypto.getRandomValues(new Uint8Array(6));
    const code = Array.from(_rnd, b => _alpha[b % _alpha.length]).join("");
    await setDoc(doc(db, "grupos", code), {
      nombre: nombre,
      codigo: code,
      creadoPor: currentUser.uid,
      createdAt: serverTimestamp(),
      miembros: [ {
        uid: currentUser.uid,
        nombre: apodo,
        perfilId: localStorage.getItem("perfilActivoId") || null
      } ],
      miembroUids: [ currentUser.uid ],
      gastos: [],
      requiereAprobacion: true,
      solicitudes: [],
      adminUids: [ currentUser.uid ],
      lectorUids: []
    });
    currentUser.name = apodo;
    localStorage.setItem("perfilActivoNombre", apodo);
    suscribirGrupo(code);
  } catch (e) {
    showToast(tr("err_prefix") + (e.message || tr("err_create_group_fallback")));
    console.error("[crearGrupo]", e);
  } finally {
    btn.disabled = false;
    btn.textContent = t.btn_crear || "Crear";
  }
};

window.unirseGrupo = async () => {
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  if (!currentUser) {
    showToast("⚠️ " + (t.warn_login_join || "Iniciá sesión para unirte a un grupo"));
    activarDemo();
    return;
  }
  const code = $("inp-codigo").value.trim().toUpperCase();
  if (code.length !== 6) {
    shake("btn-unirse");
    showToast("⚠️ " + (t.warn_code_len || "El código debe tener 6 caracteres"));
    return;
  }
  const apodoInput = $("inp-apodo-unirse").value.trim();
  const apodo = apodoInput || currentUser.name;
  const btn = $("btn-unirse");
  btn.disabled = true;
  btn.textContent = t.searching || "Buscando…";
  try {
    const ref = doc(db, "grupos", code);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      showToast(tr("err_code_not_found"));
      return;
    }
    const data = snap.data();
    const yaMiembro = data.miembros.some(m => esMismoMiembro(m, currentUser.uid, currentUser.perfilId, apodo));
    if (!yaMiembro && data.requiereAprobacion === true) {
      // Grupo con aprobación: se anota una solicitud y el creador decide.
      const yaPidio = (data.solicitudes || []).some(x => esMismoMiembro(x, currentUser.uid, currentUser.perfilId, apodo));
      if (yaPidio) {
        showToast(tr("msg_request_already"));
      } else {
        await updateDoc(ref, {
          solicitudes: arrayUnion({
            uid: currentUser.uid,
            nombre: apodo,
            perfilId: currentUser.perfilId || null,
            fecha: Date.now()
          })
        });
        showToast(tr("msg_request_sent"));
      }
      guardarSolicitudLocal({ id: code, nombre: data.nombre, apodo: apodo, perfilId: currentUser.perfilId || null });
      $("inp-codigo").value = "";
      renderMisSolicitudes();
      return;
    }
    if (!yaMiembro) {
      await updateDoc(ref, {
        miembros: arrayUnion({
          uid: currentUser.uid,
          nombre: apodo,
          perfilId: currentUser.perfilId
        }),
        miembroUids: arrayUnion(currentUser.uid)
      });
    }
    currentUser.name = apodo;
    localStorage.setItem("perfilActivoNombre", apodo);
    suscribirGrupo(code);
  } catch (e) {
    showToast(tr("err_prefix") + (e.message || tr("err_join_group_fallback")));
    console.error("[unirseGrupo]", e);
  } finally {
    btn.disabled = false;
    btn.textContent = t.btn_unirse || "Unirse";
  }
};

let listenWatchdog = null;

function suscribirGrupo(code) {
  if (unsubscribe) unsubscribe();
  clearTimeout(listenWatchdog);
  localStorage.setItem("grupoActivo", code);
  let gotServer = false;
  listenWatchdog = setTimeout(() => {
    if (!gotServer && navigator.onLine) {
      console.warn("[grupo] sin datos del servidor tras 12 s: ¿canal en tiempo real bloqueado?");
      fsNetFailover();
    }
  }, 12000);
  unsubscribe = onSnapshot(doc(db, "grupos", code), { includeMetadataChanges: true }, snap => {
    if (!snap.metadata.fromCache) {
      gotServer = true;
      clearTimeout(listenWatchdog);
    }
    if (!snap.exists()) {
      if (!snap.metadata.fromCache && !snap.metadata.hasPendingWrites) salirDeVistaGrupo(snap.id, "msg_group_gone");
      return;
    }
    const _d = snap.data();
    if (!snap.metadata.fromCache && !snap.metadata.hasPendingWrites && currentUser && Array.isArray(_d.miembroUids) && !_d.miembroUids.includes(currentUser.uid)) {
      salirDeVistaGrupo(snap.id, "msg_removed_from_group");
      return;
    }
    currentGroup = {
      id: snap.id,
      data: _d
    };
    guardarGrupoEnCache(snap.id, snap.data());
    guardarGrupoEnLista(snap.id, snap.data().nombre);
    renderGrupo();
    migrarRoles(snap.id, _d, snap.metadata.fromCache);
    sincronizarMisPartes(snap.id, snap.data());
  }, err => {
    console.warn("Listen error", err);
    fsNetFailover();
    updateOfflineBanner(true);
  });
  showSection("s-grupo");
  updateOfflineBanner(false);
  window._flushPending = flushPending;
  if (navigator.onLine && getPending().length > 0) {
    flushPending();
  }
  updatePendingBadge();
}

const PENDING_KEY = "taxusa_pending_ops";
const pendingKey = () => PENDING_KEY + "::" + (currentUser?.uid || "sin-usuario");

function getPending() {
  try {
    return JSON.parse(localStorage.getItem(pendingKey()) || "[]");
  } catch (e) {
    return [];
  }
}

function savePending(ops) {
  localStorage.setItem(pendingKey(), JSON.stringify(ops));
  updatePendingBadge();
}

function updatePendingBadge() {
  const n = getPending().length;
  const badge = document.getElementById("pending-badge");
  if (badge) {
    badge.textContent = n;
    badge.style.display = n ? "inline" : "none";
  }
}

function queueOp(op) {
  const ops = getPending();
  if (!currentUser) return;
  ops.push({...op, uid:currentUser.uid});
  savePending(ops);
}

const CACHE_PREFIX = "taxusa_grupo_cache_";

function guardarGrupoEnCache(id, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(data));
  } catch (e) {}
}

function cargarGrupoDesdeCache(id) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

window.updateOfflineBanner = function(isOffline) {
  const banner = document.getElementById("offline-group-banner");
  if (!banner) return;
  if (isOffline) {
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
};

function updateOfflineBanner(isOffline) {
  window.updateOfflineBanner(isOffline);
}

let flushing = false;
let lastFlushError = null;

const sameOp = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function removePendingOp(op) {
  // Quita solo esta operación de lo que hay guardado ahora: si el usuario cargó otro gasto mientras
  // sincronizábamos, no se pisa.
  const cur = getPending();
  const i = cur.findIndex(x => sameOp(x, op));
  if (i >= 0) {
    cur.splice(i, 1);
    savePending(cur);
  }
}

async function applyPendingOp(op) {
  const ref = doc(db, "grupos", op.groupId);
  if (op.type === "add_gasto") {
    await withTimeout(updateDoc(ref, { gastos: arrayUnion(op.gasto) }));
  } else if (op.type === "del_gasto") {
    if (op.gasto) {
      await withTimeout(updateDoc(ref, { gastos: arrayRemove(op.gasto) }));
    } else {
      const snap = await withTimeout(getDoc(ref));
      if (snap.exists()) {
        await withTimeout(updateDoc(ref, { gastos: snap.data().gastos.filter(g => g.id !== op.gastoId) }));
      }
    }
  }
}

// Una operación "muerta" nunca va a poder sincronizarse: el grupo ya no existe o el usuario ya no es miembro.
// Se descarta para que no quede el aviso "sin sincronizar" para siempre. Cualquier otro error se reintenta.
async function pendingOpIsDead(op, e) {
  const code = e && e.code;
  if (code !== "not-found" && code !== "permission-denied") return false;
  try {
    const snap = await withTimeout(getDoc(doc(db, "grupos", op.groupId)));
    if (!snap.exists()) return true;
    const d = snap.data();
    return !(d.miembroUids || []).includes(currentUser.uid) || (d.lectorUids || []).includes(currentUser.uid) && d.creadoPor !== currentUser.uid;
  } catch (e2) {
    return false;
  }
}

async function flushPending() {
  if (flushing || !currentUser || getPending().length === 0) return;
  flushing = true;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const banner = document.getElementById("sync-banner");
  const syncText = document.getElementById("sync-text");
  const syncDiscard = document.getElementById("sync-discard");
  if (banner) {
    banner.classList.add("visible");
    banner.onclick = null;
    if (syncText) syncText.textContent = t.sync_syncing;
    if (syncDiscard) syncDiscard.style.display = "none";
  }
  const tried = [];
  let dropped = 0;
  try {
    for (const op of getPending()) {
      if (op.uid !== currentUser.uid) continue;
      tried.push(op);
      try {
        await applyPendingOp(op);
        removePendingOp(op);
      } catch (e) {
        lastFlushError = (e && (e.code || e.message)) || "error";
        console.error("[flushPending]", op.type, op.groupId, lastFlushError, e);
        if (await pendingOpIsDead(op, e)) {
          removePendingOp(op);
          dropped++;
        }
      }
    }
  } finally {
    flushing = false;
    const left = getPending().length;
    if (banner) {
      if (left === 0) {
        lastFlushError = null;
        if (syncText) syncText.textContent = t.sync_ok;
        setTimeout(() => banner.classList.remove("visible"), 2200);
      } else {
        if (syncText) syncText.textContent = "⚠️ " + left + " " + (lang === "en" ? "expense" + (left > 1 ? "s" : "") + " not synced · tap to retry" : lang === "pt" ? "despesa" + (left > 1 ? "s" : "") + " não sincronizada" + (left > 1 ? "s" : "") + " · toque para tentar" : "gasto" + (left > 1 ? "s" : "") + " sin sincronizar · tocá para reintentar");
        if (syncText && lastFlushError) syncText.textContent += " [" + lastFlushError + "]";
        banner.onclick = () => flushPending();
        if (syncDiscard) syncDiscard.style.display = "inline";
      }
    }
    if (dropped) {
      showToast(lang === "en" ? "A pending expense was discarded: you're no longer in that group." : lang === "pt" ? "Uma despesa pendente foi descartada: você não faz mais parte desse grupo." : "Se descartó un gasto pendiente: ya no sos parte de ese grupo.");
    }
    // Gastos cargados mientras sincronizábamos
    if (getPending().some(op => op.uid === currentUser.uid && !tried.some(x => sameOp(x, op)))) setTimeout(flushPending, 1500);
  }
}

window.taxflyFlush = () => flushPending().then(() => lastFlushError);

// Descarta manualmente los gastos que quedaron sin sincronizar en el grupo actual
// (botón "descartar" del banner). No reintenta más ni toca pendientes de otros grupos.
window.discardPendingSync = function() {
  if (!currentUser || !currentGroup) return;
  const restantes = getPending().filter(op => !(op.uid === currentUser.uid && op.groupId === currentGroup.id));
  savePending(restantes);
  lastFlushError = null;
  const banner = document.getElementById("sync-banner");
  if (banner) banner.classList.remove("visible");
};

// Reintento automático mientras haya pendientes (por si el aviso quedó en "sin sincronizar").
setInterval(() => {
  if (navigator.onLine && currentUser && currentGroup && !currentGroup._demo && getPending().length) flushPending();
}, 30000);

window.agregarGasto = async () => {
  if (!puedeEditar()) {
    showToast("🔒 " + tr("err_read_only"));
    return;
  }
  const desc = $("g-desc").value.trim();
  const monto = parseFloat($("g-monto").value);
  const pkey = $("g-pagador").value;
  if (!desc || isNaN(monto) || monto <= 0) {
    shake("btn-agregar");
    return;
  }
  const pagador = currentGroup.data.miembros.find(m => memberId(m) === pkey);
  const gasto = {
    id: Date.now().toString(),
    desc: desc,
    monto: monto,
    cat: categoriaActiva,
    pagadorUid: pagador.uid,
    pagadorKey: memberId(pagador),
    pagadorNombre: pagador.nombre,
    fecha: (new Date).toLocaleDateString("es-AR"),
    entre: currentGroup.data.miembros.map(m => m.uid),
    entreKeys: currentGroup.data.miembros.map(m => memberId(m))
  };
  if (currentGroup._demo) {
    currentGroup.data.gastos.push(gasto);
    renderGrupo();
  } else if (!navigator.onLine) {
    currentGroup.data.gastos.push(gasto);
    renderGrupo();
    queueOp({
      type: "add_gasto",
      groupId: currentGroup.id,
      gasto: gasto
    });
    showToast(tr("msg_expense_saved_offline"));
  } else {
    try {
      await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), {
        gastos: arrayUnion(gasto)
      }));
      showToast(tr("msg_expense_saved"));
    } catch (e) {
      // Sin confirmación del servidor: queda en la cola local y se reintenta (arrayUnion es idempotente).
      fsNetFailover();
      if (!currentGroup.data.gastos.some(g => g.id === gasto.id)) currentGroup.data.gastos.push(gasto);
      renderGrupo();
      queueOp({
        type: "add_gasto",
        groupId: currentGroup.id,
        gasto: gasto
      });
      showToast(tr("msg_expense_saved_offline"));
    }
  }
  $("g-desc").value = "";
  $("g-monto").value = "";
};

window.setCategoria = (cat, el) => {
  categoriaActiva = cat;
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
};

window.volverLobby = () => {
  if (unsubscribe) unsubscribe();
  clearTimeout(listenWatchdog);
  localStorage.removeItem("grupoActivo");
  currentGroup = null;
  showSection("s-lobby");
  cargarMisGrupos();
};

window.abandonarGrupo = async () => {
  if (!currentGroup || currentGroup._demo) {
    showToast(tr("err_demo_unavailable"));
    return;
  }
  if (!currentUser) return;
  const nombre = currentGroup.data.nombre;
  const lang = localStorage.getItem("appLang") || "es";
  const confirmMsg = (i18n[lang] || i18n.es).confirm_salir.replace("{nombre}", nombre).replace("{nome}", nombre);
  if (!await showConfirm(confirmMsg)) return;
  const salidaId = currentGroup.id;
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  try {
    const ref = doc(db, "grupos", currentGroup.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const miMid = currentMemberId();
    const nuevosMiembros = data.miembros.filter(m => memberId(m) !== miMid);
    const quedaEseUid = nuevosMiembros.some(m => m.uid === currentUser.uid);
    const nuevosUids = quedaEseUid ? (data.miembroUids || []) : (data.miembroUids || []).filter(uid => uid !== currentUser.uid);
    const esDueno = data.creadoPor === currentUser.uid;
    if (esDueno && !nuevosMiembros.length) {
      // Era el último integrante: el grupo no tiene sentido sin nadie.
      await deleteDoc(ref);
    } else {
      const patch = {
        miembros: nuevosMiembros,
        miembroUids: nuevosUids
      };
      if (!quedaEseUid) {
        patch.adminUids = arrayRemove(currentUser.uid);
        patch.lectorUids = arrayRemove(currentUser.uid);
        // El grupo no puede quedar sin creador: pasa a un administrador (o, si no hay, al primero que queda).
        if (esDueno) {
          const heredero = nuevosMiembros.find(m => (data.adminUids || []).includes(m.uid)) || nuevosMiembros[0];
          patch.creadoPor = heredero.uid;
        }
      }
      await updateDoc(ref, patch);
    }
    const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== currentGroup.id);
    localStorage.setItem("misGrupos", JSON.stringify(grupos));
    if (unsubscribe) unsubscribe();
    localStorage.removeItem("grupoActivo");
    currentGroup = null;
    showSection("s-lobby");
    cargarMisGrupos();
    showToast(tr("msg_left_group"));
  } catch (e) {
    if (currentGroup && currentGroup.id === salidaId) suscribirGrupo(salidaId);
    showToast(tr("err_prefix") + e.message);
  }
};

window.eliminarGrupo = async () => {
  if (!currentGroup || currentGroup._demo) {
    showToast(tr("err_demo_unavailable"));
    return;
  }
  if (!await _rcCheck("delete_group")) {
    showToast(tr("err_security_check"));
    return;
  }
  if (currentGroup.data.creadoPor !== currentUser.uid) {
    const lang = localStorage.getItem("appLang") || "es";
    const t = i18n[lang] || i18n.es;
    showToast("❌ " + (t.only_creator || "Solo el creador puede eliminar el grupo"));
    return;
  }
  const nombre = currentGroup.data.nombre;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const confirmMsg = (t.confirm_eliminar || '¿Eliminar el grupo "{nombre}" permanentemente?\n\nEsta acción no se puede deshacer y borrará todos los gastos.').replace("{nombre}", nombre).replace("{nome}", nombre);
  if (!await showConfirm(confirmMsg)) return;
  try {
    if (unsubscribe) unsubscribe();
    await deleteDoc(doc(db, "grupos", currentGroup.id));
    const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== currentGroup.id);
    localStorage.setItem("misGrupos", JSON.stringify(grupos));
    localStorage.removeItem("grupoActivo");
    currentGroup = null;
    showSection("s-lobby");
    cargarMisGrupos();
    showToast(tr("msg_group_deleted"));
  } catch (e) {
    showToast(tr("err_delete_prefix") + e.message);
    console.error("[eliminarGrupo]", e);
  }
};

window.eliminarGasto = gastoId => {
  if (!currentGroup) return;
  if (!puedeEditar()) {
    showToast("🔒 " + tr("err_read_only"));
    return;
  }
  const grp = currentGroup;
  const item = grp.data.gastos.find(g => g.id === gastoId);
  if (!item) return;
  window._tfHidden = window._tfHidden || new Set();
  tfDeleteWithUndo({
    remove: () => { window._tfHidden.add(gastoId); if (currentGroup === grp) renderGrupo(); },
    restore: () => { window._tfHidden.delete(gastoId); if (currentGroup === grp) renderGrupo(); },
    commit: async unloading => {
      try {
        if (grp._demo) {
          grp.data.gastos = grp.data.gastos.filter(g => g.id !== gastoId);
          return;
        }
        if (!navigator.onLine || unloading) {
          grp.data.gastos = grp.data.gastos.filter(g => g.id !== gastoId);
          const ops = getPending().filter(op => !(op.type === "add_gasto" && op.gasto.id === gastoId));
          const wasLocal = getPending().some(op => op.type === "add_gasto" && op.gasto.id === gastoId);
          savePending(wasLocal ? ops : [ ...ops, {
            type: "del_gasto",
            groupId: grp.id,
            gastoId: gastoId,
            gasto: item
          } ]);
          if (!unloading) showToast(tr("msg_expense_deleted_offline"));
          return;
        }
        try {
          await withTimeout(updateDoc(doc(db, "grupos", grp.id), {
            gastos: arrayRemove(item)
          }));
        } catch (e) {
          fsNetFailover();
          grp.data.gastos = grp.data.gastos.filter(g => g.id !== gastoId);
          savePending([ ...getPending(), { type: "del_gasto", groupId: grp.id, gastoId: gastoId, gasto: item, uid: currentUser.uid } ]);
          showToast(tr("msg_expense_deleted_offline"));
        }
      } catch (e) {
        showToast(tr("err_prefix") + e.message);
      } finally {
        window._tfHidden.delete(gastoId);
        if (currentGroup === grp && !unloading) renderGrupo();
      }
    }
  });
};

window.eliminarMiembro = async mid => {
  if (!currentGroup || currentGroup._demo) {
    showToast(tr("err_demo_unavailable"));
    return;
  }
  if (!esAdmin()) {
    showToast("❌ " + tr("only_creator_members"));
    return;
  }
  const miembro = currentGroup.data.miembros.find(m => memberId(m) === mid);
  if (!miembro) return;
  if (miembro.uid === currentGroup.data.creadoPor) {
    showToast(tr("err_creator_role"));
    return;
  }
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const confirmMsg = (t.confirm_eliminar_miembro || '¿Eliminar a "{nombre}" del grupo?\n\nSus gastos registrados se mantendrán.').replace("{nombre}", miembro.nombre).replace("{nome}", miembro.nombre);
  if (!await showConfirm(confirmMsg)) return;
  try {
    const ref = doc(db, "grupos", currentGroup.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const nuevosMiembros = snap.data().miembros.filter(m => memberId(m) !== mid);
    const quedaEseUid = nuevosMiembros.some(m => m.uid === miembro.uid);
    const nuevosUids = quedaEseUid ? (snap.data().miembroUids || []) : (snap.data().miembroUids || []).filter(u => u !== miembro.uid);
    const patch = {
      miembros: nuevosMiembros,
      miembroUids: nuevosUids
    };
    if (!quedaEseUid) Object.assign(patch, { adminUids: arrayRemove(miembro.uid), lectorUids: arrayRemove(miembro.uid) });
    await updateDoc(ref, patch);
    showToast(tr("msg_member_removed", { nombre: miembro.nombre }));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
  }
};

function guardarGrupoEnLista(id, nombre) {
  const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]");
  const existente = grupos.find(g => g.id === id);
  if (!existente) {
    grupos.unshift({
      id: id,
      nombre: nombre
    });
    localStorage.setItem("misGrupos", JSON.stringify(grupos.slice(0, 10)));
  } else if (nombre && existente.nombre !== nombre) {
    // El creador pudo renombrar el grupo: se actualiza el nombre guardado.
    existente.nombre = nombre;
    localStorage.setItem("misGrupos", JSON.stringify(grupos));
  }
}

function cargarMisGrupos() {
  renderMisSolicitudes();
  refrescarSolicitudes();
  const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]");
  const wrap = $("mis-grupos-wrap");
  const lista = $("mis-grupos-list");
  if (!wrap || !lista) return;
  if (!grupos.length) {
    wrap.classList.add("hidden");
    return;
  }
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const labelEl = wrap.querySelector(".slabel");
  if (labelEl) labelEl.textContent = t.lbl_my_groups || "📂 Mis grupos";
  wrap.classList.remove("hidden");
  lista.innerHTML = grupos.map(g => `\n        <div class="grupo-item" data-id="${esc(g.id)}" onclick="volverAGrupo(this.dataset.id)">\n            <div>\n                <div class="grupo-item-name">✈️ ${esc(g.nombre)}</div>\n                <div class="grupo-item-code">${esc(g.id)}</div>\n            </div>\n            <button class="grupo-item-btn">${t.btn_open || "Abrir"}</button>\n        </div>`).join("");
}

window.volverAGrupo = async id => {
  if (!navigator.onLine) {
    const grupoCache = cargarGrupoDesdeCache(id);
    if (grupoCache) {
      localStorage.setItem("grupoActivo", id);
      currentGroup = {
        id: id,
        _offline: true,
        data: grupoCache
      };
      showSection("s-grupo");
      window._flushPending = flushPending;
      renderGrupo();
      updatePendingBadge();
      updateOfflineBanner(true);
    } else {
      const lang = localStorage.getItem("appLang") || "es";
      showToast("⚠️ " + tr("err_no_cache_group"));
    }
    return;
  }
  try {
    const snap = await getDoc(doc(db, "grupos", id));
    if (snap.exists()) {
      suscribirGrupo(id);
    } else {
      showToast(tr("err_group_not_found"));
      const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== id);
      localStorage.setItem("misGrupos", JSON.stringify(grupos));
      cargarMisGrupos();
    }
  } catch (e) {
    showToast(tr("err_open_group"));
  }
};

window.copiarCodigo = () => {
  const c = $("g-codigo").textContent;
  navigator.clipboard?.writeText(c).catch(() => {});
  showToast(tr("msg_code_copied", { code: c }));
};

function renderGrupo() {
  const {nombre: nombre, codigo: codigo, miembros: miembros, gastos: _gastosAll, creadoPor: creadoPor} = currentGroup.data;
  const gastos = window._tfHidden && window._tfHidden.size ? _gastosAll.filter(g => !window._tfHidden.has(g.id)) : _gastosAll;
  $("g-titulo").textContent = nombre || currentGroup.data.nome || "—";
  $("g-codigo").textContent = codigo;
  window._formOpen = document.getElementById("form-gasto")?.classList.contains("open") ?? window._formOpen ?? false;
  window._explainOpen = document.getElementById("explain-body")?.classList.contains("open") ?? window._explainOpen ?? false;
  const btnEliminar = document.getElementById("btn-eliminar-grupo");
  if (btnEliminar) {
    btnEliminar.style.display = currentUser && creadoPor === currentUser.uid && !currentGroup._demo ? "block" : "none";
  }
  const sel = $("g-pagador");
  const miMid = currentUser ? currentMemberId() : "";
  sel.innerHTML = miembros.map(m => `<option value="${esc(memberId(m))}"${memberId(m) === miMid ? " selected" : ""}>${esc(m.nombre)}</option>`).join("");
  const lista = $("lista-gastos");
  const miR = miRol();
  const puedeEd = miR !== "lector";
  renderAdmin(miR === "admin" && !currentGroup._demo, nombre);
  const rolEl = $("g-mi-rol");
  if (rolEl) rolEl.textContent = currentGroup._demo ? "" : tr("lbl_your_role") + ": " + tr("rol_" + miR);
  const cardNuevo = $("card-nuevo-gasto");
  if (cardNuevo) cardNuevo.classList.toggle("hidden", !puedeEd);
  if (!gastos.length) {
    lista.innerHTML = `<div class="empty-state"><span class="es-icon">🧳</span>${(i18n[localStorage.getItem("appLang") || "es"] || i18n.es).empty_expenses}</div>`;
  } else {
    lista.innerHTML = [ ...gastos ].reverse().map(g => `\n            <div class="gasto-item cat-${esc(g.cat || "otro")}" id="gasto-${esc(g.id)}">\n                <div class="gasto-emoji">${catEmoji(g.cat)}</div>\n                <div class="gasto-body">\n                    <div class="gasto-desc">${esc(g.desc)}</div>\n                    <div class="gasto-meta">${esc(g.pagadorNombre)} · ${esc(g.fecha)}</div>\n                </div>\n                <div class="gasto-monto">${fmt(g.monto)}</div>\n                ${puedeEd ? `<button class="gasto-del" data-id="${esc(g.id)}" onclick="eliminarGasto(this.dataset.id)" title="${tr('aria_delete_expense')}" aria-label="${tr('aria_delete_expense')}">🗑️</button>` : ""}\n            </div>`).join("");
  }
  $("members-list").innerHTML = miembros.map(m => {
    const mid = memberId(m);
    const esDueno = m.uid === creadoPor;
    const rol = rolDe(m, currentGroup.data);
    const puedeGestionar = miR === "admin" && !currentGroup._demo && mid !== miMid && !esDueno;
    const badge = `<span class="rol-badge r-${rol}">${esDueno ? "👑 " : ""}${tr("rol_" + rol)}</span>`;
    const selector = puedeGestionar ? `<select class="rol-sel" data-mid="${esc(mid)}" onchange="cambiarRol(this.dataset.mid, this.value)" title="${tr("aria_change_role")}" aria-label="${tr("aria_change_role")}">${rolOptions(rol)}</select>` : "";
    const del = puedeGestionar ? `<button class="member-del" data-uid="${esc(mid)}" onclick="eliminarMiembro(this.dataset.uid)" title="${tr('aria_delete_member')}" aria-label="${tr('aria_delete_member')}">✕</button>` : "";
    return `<span class="member-chip">👤 ${esc(m.nombre)} ${puedeGestionar ? selector : badge}${del}</span>`;
  }).join("");
  renderBalances(miembros, gastos);
  renderResumen(miembros, gastos);
}

// --- Administración del grupo (solo el creador) -----------------------------
function renderAdmin(esAdmin, nombre) {
  const card = $("admin-card");
  if (!card) return;
  card.classList.toggle("hidden", !esAdmin);
  if (!esAdmin) return;
  const inp = $("adm-nombre");
  if (inp && document.activeElement !== inp) inp.value = nombre || "";
  const chk = $("adm-aprobacion");
  if (chk) chk.checked = currentGroup.data.requiereAprobacion === true;
  const sols = currentGroup.data.solicitudes || [];
  const badge = $("req-count");
  if (badge) {
    badge.textContent = sols.length;
    badge.classList.toggle("hidden", !sols.length);
  }
  $("adm-solicitudes").innerHTML = sols.length ? sols.map(r => {
    const mid = esc(memberId(r));
    return `<div class="req-row">
            <span class="req-name">${esc(r.nombre)}</span>
            <span class="req-actions">
                <select class="rol-sel req-rol" aria-label="${tr("lbl_role_on_accept")}" title="${tr("lbl_role_on_accept")}">${rolOptions("editor")}</select>
                <button class="req-btn req-ok" data-mid="${mid}" onclick="aceptarSolicitud(this.dataset.mid, this.closest('.req-row').querySelector('select').value)" aria-label="${tr("aria_accept_request")}">${tr("btn_accept")}</button>
                <button class="req-btn req-no" data-mid="${mid}" onclick="rechazarSolicitud(this.dataset.mid)" aria-label="${tr("aria_reject_request")}">${tr("btn_reject")}</button>
            </span>
        </div>`;
  }).join("") : `<div class="empty-state">${tr("empty_requests")}</div>`;
}

function adminGuard() {
  if (!currentGroup || currentGroup._demo) {
    showToast(tr("err_demo_unavailable"));
    return false;
  }
  if (!esAdmin()) {
    showToast(tr("only_creator_admin"));
    return false;
  }
  if (!navigator.onLine) {
    showToast(tr("err_need_online_admin"));
    return false;
  }
  return true;
}

window.renombrarGrupo = async () => {
  if (!adminGuard()) return;
  const nuevo = $("adm-nombre").value.trim().slice(0, 40);
  if (!nuevo) {
    showToast(tr("err_group_name_empty"));
    return;
  }
  if (nuevo === currentGroup.data.nombre) return;
  try {
    await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), { nombre: nuevo }));
    showToast(tr("msg_group_renamed"));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
  }
};

window.setAprobacion = async on => {
  if (!adminGuard()) {
    renderGrupo();
    return;
  }
  try {
    await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), { requiereAprobacion: !!on }));
    showToast(tr(on ? "msg_approval_on" : "msg_approval_off"));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
    renderGrupo();
  }
};

window.aceptarSolicitud = async (mid, rol) => {
  if (!adminGuard()) return;
  // Se usa el objeto tal cual está guardado para poder quitarlo con arrayRemove sin pisar otras solicitudes.
  const sol = (currentGroup.data.solicitudes || []).find(r => memberId(r) === mid);
  if (!sol) return;
  try {
    const patch = { solicitudes: arrayRemove(sol), ...patchRol(sol.uid, ROLES.includes(rol) ? rol : "editor") };
    if (!(currentGroup.data.miembros || []).some(m => memberId(m) === mid)) {
      patch.miembros = arrayUnion({ uid: sol.uid, nombre: sol.nombre, perfilId: sol.perfilId || null });
      patch.miembroUids = arrayUnion(sol.uid);
    }
    await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), patch));
    showToast(tr("msg_request_accepted", { nombre: sol.nombre }));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
  }
};

window.rechazarSolicitud = async mid => {
  if (!adminGuard()) return;
  const sol = (currentGroup.data.solicitudes || []).find(r => memberId(r) === mid);
  if (!sol) return;
  try {
    await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), { solicitudes: arrayRemove(sol) }));
    showToast(tr("msg_request_rejected", { nombre: sol.nombre }));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
  }
};

function rolOptions(sel) {
  return ROLES.map(r => `<option value="${r}"${r === sel ? " selected" : ""}>${tr("rol_" + r)}</option>`).join("");
}

window.cambiarRol = async (mid, rol) => {
  if (!adminGuard()) {
    renderGrupo();
    return;
  }
  if (!ROLES.includes(rol)) return;
  const miembro = currentGroup.data.miembros.find(m => memberId(m) === mid);
  if (!miembro) return;
  if (miembro.uid === currentGroup.data.creadoPor) {
    showToast(tr("err_creator_role"));
    renderGrupo();
    return;
  }
  try {
    // El rol es de la cuenta: si el mismo mail tiene dos perfiles en el grupo, ambos pasan a este rol.
    await withTimeout(updateDoc(doc(db, "grupos", currentGroup.id), patchRol(miembro.uid, rol)));
    showToast(tr("msg_role_changed", { nombre: miembro.nombre, rol: tr("rol_" + rol) }));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
    renderGrupo();
  }
};

// Salir de la pantalla de un grupo del que ya no somos parte (nos sacaron o lo eliminaron).
function salirDeVistaGrupo(id, msgKey) {
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  clearTimeout(listenWatchdog);
  try {
    localStorage.removeItem(CACHE_PREFIX + id);
    if (localStorage.getItem("grupoActivo") === id) localStorage.removeItem("grupoActivo");
    const lista = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== id);
    localStorage.setItem("misGrupos", JSON.stringify(lista));
  } catch (e) {}
  currentGroup = null;
  showSection("s-lobby");
  cargarMisGrupos();
  showToast(tr(msgKey));
}

// --- Solicitudes que yo envié (lado del que quiere entrar) -------------------
const solKey = () => "taxusa_solicitudes::" + (currentUser?.uid || "sin-usuario");

function getSolicitudesLocal() {
  try {
    return JSON.parse(localStorage.getItem(solKey()) || "[]");
  } catch (e) {
    return [];
  }
}

function setSolicitudesLocal(lista) {
  try {
    localStorage.setItem(solKey(), JSON.stringify(lista));
  } catch (e) {}
}

function guardarSolicitudLocal(item) {
  const lista = getSolicitudesLocal().filter(x => x.id !== item.id);
  lista.unshift(item);
  setSolicitudesLocal(lista.slice(0, 10));
}

function quitarSolicitudLocal(id) {
  setSolicitudesLocal(getSolicitudesLocal().filter(x => x.id !== id));
}

function renderMisSolicitudes() {
  const wrap = $("mis-solicitudes-wrap");
  const lista = $("mis-solicitudes-list");
  if (!wrap || !lista) return;
  const items = currentUser ? getSolicitudesLocal() : [];
  if (!items.length) {
    wrap.classList.add("hidden");
    return;
  }
  wrap.classList.remove("hidden");
  lista.innerHTML = items.map(g => `
        <div class="grupo-item pending">
            <div>
                <div class="grupo-item-name">✈️ ${esc(g.nombre)}</div>
                <div class="grupo-item-code">${esc(g.id)} · <span class="grupo-item-wait">${tr("lbl_waiting")}</span></div>
            </div>
            <button class="grupo-item-btn" data-id="${esc(g.id)}" onclick="verSolicitud(this.dataset.id)">${tr("btn_check_status")}</button>
        </div>`).join("");
}

async function estadoSolicitud(item) {
  const snap = await withTimeout(getDoc(doc(db, "grupos", item.id)));
  if (!snap.exists()) return { estado: "gone" };
  const d = snap.data();
  if ((d.miembros || []).some(m => esMismoMiembro(m, currentUser.uid, item.perfilId, item.apodo))) return { estado: "approved", data: d };
  if ((d.solicitudes || []).some(x => esMismoMiembro(x, currentUser.uid, item.perfilId, item.apodo))) return { estado: "pending" };
  return { estado: "denied" };
}

window.verSolicitud = async id => {
  const item = getSolicitudesLocal().find(x => x.id === id);
  if (!item || !currentUser) return;
  if (!navigator.onLine) {
    showToast(tr("offline_title"));
    return;
  }
  try {
    const r = await estadoSolicitud(item);
    if (r.estado === "pending") {
      showToast(tr("msg_request_still_pending"));
      return;
    }
    quitarSolicitudLocal(id);
    if (r.estado === "approved") {
      currentUser.name = item.apodo;
      localStorage.setItem("perfilActivoNombre", item.apodo);
      guardarGrupoEnLista(id, r.data.nombre);
      showToast(tr("msg_request_approved", { nombre: r.data.nombre }));
      suscribirGrupo(id);
      return;
    }
    showToast(tr(r.estado === "gone" ? "msg_group_gone" : "msg_request_denied"));
    renderMisSolicitudes();
  } catch (e) {
    showToast(tr("err_open_group"));
  }
};

let _refrescandoSol = false;

// Al volver al lobby: si te aceptaron (o rechazaron) se actualiza solo, sin tener que tocar "Ver estado".
async function refrescarSolicitudes() {
  if (_refrescandoSol || !currentUser || !navigator.onLine) return;
  const items = getSolicitudesLocal();
  if (!items.length) return;
  _refrescandoSol = true;
  let cambio = false;
  try {
    for (const item of items) {
      try {
        const r = await estadoSolicitud(item);
        if (r.estado === "pending") continue;
        quitarSolicitudLocal(item.id);
        cambio = true;
        if (r.estado === "approved") {
          guardarGrupoEnLista(item.id, r.data.nombre);
          showToast(tr("msg_request_approved", { nombre: r.data.nombre }));
        } else {
          showToast(tr(r.estado === "gone" ? "msg_group_gone" : "msg_request_denied"));
        }
      } catch (e) {}
    }
  } finally {
    _refrescandoSol = false;
  }
  if (cambio) cargarMisGrupos();
}

// Grupos que guardaban el rol solo en miembros[].rol: el creador copia esos roles a adminUids/lectorUids una vez.
let _migrandoRoles = false;

async function migrarRoles(id, data, fromCache) {
  if (_migrandoRoles || fromCache || !navigator.onLine || !currentUser || data.creadoPor !== currentUser.uid) return;
  if (Array.isArray(data.adminUids) && Array.isArray(data.lectorUids)) return;
  _migrandoRoles = true;
  try {
    const porUid = {};
    (data.miembros || []).forEach(m => { (porUid[m.uid] = porUid[m.uid] || []).push(m.rol); });
    const admins = Object.keys(porUid).filter(u => u === data.creadoPor || porUid[u].includes("admin"));
    const lectores = Object.keys(porUid).filter(u => !admins.includes(u) && porUid[u].every(r => r === "lector"));
    await withTimeout(updateDoc(doc(db, "grupos", id), { adminUids: admins, lectorUids: lectores }));
  } catch (e) {
    console.warn("[migrarRoles]", e);
  } finally {
    _migrandoRoles = false;
  }
}

let _syncingPartes = false;

async function sincronizarMisPartes(groupId, data) {
  if (!currentUser || !navigator.onLine || _syncingPartes || currentGroup?._demo) return;
  const profile = localStorage.getItem("perfilActivoId");
  if (!profile) return;
  _syncingPartes = true;
  try {
    const gastosCol = collection(db, "usuarios", currentUser.uid, "perfiles", profile, "gastos");
    const misGastos = (data.gastos || []).filter(g => g.entre?.includes(currentUser.uid));
    const activeIds = new Set();
    const tripId = window.TripContext.assign(currentUser.uid, profile);
    for (const g of misGastos) {
      const amount = Math.round(g.monto / g.entre.length * 100) / 100;
      const mirrorId = `grupo-${groupId}-${g.id}-${currentUser.uid}`;
      activeIds.add(mirrorId);
      try {
        await setDoc(doc(gastosCol, mirrorId), {
          nombre: g.desc,
          valor: amount,
          cat: g.cat || "otro",
          fecha: Date.now(),
          tripId: tripId,
          source: "grupo",
          groupId: groupId,
          groupExpenseId: g.id
        }, { merge: true });
      } catch (e) {}
    }
    // Borra los espejos de gastos que ya no están en el grupo (se eliminaron o te sacaron de "entre")
    try {
      const q = query(gastosCol, where("groupId", "==", groupId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        if (!activeIds.has(d.id)) await deleteDoc(d.ref);
      }
    } catch (e) {}
  } finally {
    _syncingPartes = false;
  }
}

window.registrarMiParte = async gastoId => {
  const gasto = currentGroup?.data.gastos.find(g => g.id === gastoId);
  const profile = localStorage.getItem("perfilActivoId");
  if (!gasto || !currentUser || !profile || !gasto.entre?.includes(currentUser.uid) || !navigator.onLine) {
    showToast(tr("err_need_connection_part"));
    return;
  }
  const tripId = window.TripContext.assign(currentUser.uid, profile);
  const amount = Math.round(gasto.monto / gasto.entre.length * 100) / 100;
  try {
    const ref = doc(db, "usuarios", currentUser.uid, "perfiles", profile, "gastos", `grupo-${currentGroup.id}-${gasto.id}-${currentUser.uid}`);
    await setDoc(ref, { nombre: gasto.desc, valor: amount, cat: gasto.cat || "otro", fecha: Date.now(), tripId, source: "grupo", groupId: currentGroup.id, groupExpenseId: gasto.id }, { merge: true });
    showToast(tr("msg_part_registered", { monto: fmt(amount) }));
  } catch (_) { showToast(tr("err_part_failed")); }
};

function calcularDeudas(miembros, gastos) {
  const bal = {};
  // uid real -> memberId del primer miembro con ese uid, para leer gastos viejos
  // (de antes de este fix) que todavía guardan solo el uid, no el perfil exacto.
  const uidFallback = {};
  miembros.forEach(m => {
    bal[memberId(m)] = 0;
    if (!(m.uid in uidFallback)) uidFallback[m.uid] = memberId(m);
  });
  gastos.forEach(g => {
    const entreKeys = g.entreKeys || (g.entre || []).map(uid => uidFallback[uid] || uid);
    const share = g.monto / entreKeys.length;
    entreKeys.forEach(k => {
      if (k in bal) bal[k] -= share;
    });
    const pk = g.pagadorKey || uidFallback[g.pagadorUid] || g.pagadorUid;
    if (pk in bal) bal[pk] += g.monto;
  });
  const creditors = [], debtors = [];
  Object.entries(bal).forEach(([uid, b]) => {
    const nombre = miembros.find(m => memberId(m) === uid)?.nombre || uid;
    if (b > .01) creditors.push({
      nombre: nombre,
      bal: b
    });
    if (b < -.01) debtors.push({
      nombre: nombre,
      bal: -b
    });
  });
  const txs = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci], d = debtors[di];
    const amt = Math.min(c.bal, d.bal);
    txs.push({
      de: d.nombre,
      a: c.nombre,
      monto: amt
    });
    c.bal -= amt;
    d.bal -= amt;
    if (c.bal < .01) ci++;
    if (d.bal < .01) di++;
  }
  return txs;
}

function renderBalances(miembros, gastos) {
  const cont = $("balances-cont");
  const txs = calcularDeudas(miembros, gastos);
  if (!txs.length) {
    cont.innerHTML = `<div class="empty-state"><span class="es-icon">✅</span>${(i18n[localStorage.getItem("appLang") || "es"] || i18n.es).all_good}</div>`;
    return;
  }
  cont.innerHTML = txs.map(t => `\n        <div class="balance-row">\n            <span class="b-de">${esc(t.de)}</span>\n            <span class="b-arr">→</span>\n            <span class="b-a">${esc(t.a)}</span>\n            <span class="b-m">${fmt(t.monto)}</span>\n        </div>`).join("");
}

function renderResumen(miembros, gastos) {
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const totales = {};
  const uidFallback = {};
  miembros.forEach(m => {
    totales[memberId(m)] = {
      nombre: m.nombre,
      pagado: 0,
      parte: 0
    };
    if (!(m.uid in uidFallback)) uidFallback[m.uid] = memberId(m);
  });
  gastos.forEach(g => {
    const entreKeys = g.entreKeys || (g.entre || []).map(uid => uidFallback[uid] || uid);
    const share = g.monto / entreKeys.length;
    entreKeys.forEach(k => {
      if (k in totales) totales[k].parte += share;
    });
    const pk = g.pagadorKey || uidFallback[g.pagadorUid] || g.pagadorUid;
    if (pk in totales) totales[pk].pagado += g.monto;
  });
  const totalGlobal = gastos.reduce((s, g) => s + g.monto, 0);
  $("total-global").textContent = fmt(totalGlobal);
  $("resumen-cont").innerHTML = Object.values(totales).map(p => {
    const b = p.pagado - p.parte;
    const badge = b >= 0 ? `<span class="badge-pos">+${fmt(b)}</span>` : `<span class="badge-neg">${fmt(b)}</span>`;
    return `<div class="resumen-row">\n            <div class="resumen-nom">${esc(p.nombre)}</div>\n            <div class="resumen-stats">\n                <span>${t.lbl_paid}: <strong>${fmt(p.pagado)}</strong></span>\n                <span>${t.lbl_share}: <strong>${fmt(p.parte)}</strong></span>\n                ${badge}\n            </div>\n        </div>`;
  }).join("");
  const formBody = document.getElementById("form-gasto");
  const formToggle = document.getElementById("toggle-form-gasto");
  const expBody = document.getElementById("explain-body");
  const expToggle = document.getElementById("toggle-explain");
  if (formBody) {
    formBody.classList.toggle("open", !!window._formOpen);
    if (formToggle) formToggle.classList.toggle("open", !!window._formOpen);
  }
  if (expBody) {
    expBody.classList.toggle("open", !!window._explainOpen);
    if (expToggle) expToggle.classList.toggle("open", !!window._explainOpen);
  }
}

window._formOpen = false;

window._explainOpen = false;

window.toggleCollapsible = function(bodyId, toggleId) {
  const body = document.getElementById(bodyId);
  const toggle = document.getElementById(toggleId);
  if (!body) return;
  const isOpen = body.classList.contains("open");
  body.classList.toggle("open", !isOpen);
  if (toggle) toggle.classList.toggle("open", !isOpen);
  if (bodyId === "form-gasto") window._formOpen = !isOpen;
  if (bodyId === "explain-body") window._explainOpen = !isOpen;
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function catEmoji(cat) {
  return {
    comida: "🍽️",
    transporte: "🚗",
    alojamiento: "🏨",
    actividad: "🎡",
    compras: "🛍️",
    otro: "📦"
  }[cat] || "📦";
}

window.activarDemo = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const demoNames = {
    es: {
      you: "Vos",
      friend1: "Lucas",
      friend2: "Sofi",
      trip: "Viaje a Miami 🌴",
      d1: "Cena en el restaurante",
      d2: "Alquiler del auto",
      d3: "Hotel primera noche",
      d4: "Entradas al parque"
    },
    en: {
      you: "You",
      friend1: "Lucas",
      friend2: "Sofi",
      trip: "Miami Trip 🌴",
      d1: "Dinner at the restaurant",
      d2: "Car rental",
      d3: "Hotel first night",
      d4: "Park tickets"
    },
    pt: {
      you: "Você",
      friend1: "Lucas",
      friend2: "Sofi",
      trip: "Viagem a Miami 🌴",
      d1: "Jantar no restaurante",
      d2: "Aluguel do carro",
      d3: "Hotel primeira noite",
      d4: "Ingressos no parque"
    }
  };
  const n = demoNames[lang] || demoNames.es;
  currentUser = {
    uid: "u1",
    name: n.you
  };
  const emailEl = document.getElementById("userEmail");
  if (emailEl) emailEl.innerText = "demo";
  currentGroup = {
    id: "DEMO99",
    _demo: true,
    data: {
      nome: n.trip,
      nombre: n.trip,
      codigo: "DEMO99",
      miembros: [ {
        uid: "u1",
        nombre: n.you
      }, {
        uid: "u2",
        nombre: n.friend1
      }, {
        uid: "u3",
        nombre: n.friend2
      } ],
      gastos: [ {
        id: "1",
        desc: n.d1,
        monto: 150,
        cat: "comida",
        pagadorUid: "u1",
        pagadorNombre: n.you,
        fecha: "30/04/2026",
        entre: [ "u1", "u2", "u3" ]
      }, {
        id: "2",
        desc: n.d2,
        monto: 300,
        cat: "transporte",
        pagadorUid: "u2",
        pagadorNombre: n.friend1,
        fecha: "01/05/2026",
        entre: [ "u1", "u2", "u3" ]
      }, {
        id: "3",
        desc: n.d3,
        monto: 240,
        cat: "alojamiento",
        pagadorUid: "u3",
        pagadorNombre: n.friend2,
        fecha: "01/05/2026",
        entre: [ "u1", "u2", "u3" ]
      }, {
        id: "4",
        desc: n.d4,
        monto: 90,
        cat: "actividad",
        pagadorUid: "u1",
        pagadorNombre: n.you,
        fecha: "02/05/2026",
        entre: [ "u1", "u2", "u3" ]
      } ]
    }
  };
  showSection("s-grupo");
  renderGrupo();
};
