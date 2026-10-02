import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, onSnapshot, serverTimestamp, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const _RC_SITE_KEY = "6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME";

const _RC_VERIFY_URL = window.TAXFLY_CONFIG.WORKER_URL;

async function _rcToken(action) {
  return new Promise(resolve => {
    if (typeof grecaptcha === "undefined") {
      resolve(null);
      return;
    }
    grecaptcha.ready(() => grecaptcha.execute(_RC_SITE_KEY, {
      action: action
    }).then(resolve).catch(() => resolve(null)));
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

const db = (() => {
  try {
    return initializeFirestore(app, {
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
      name: user.displayName || user.email.split("@")[0]
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
        const miembros = data.miembros.map(m => m.uid === currentUser.uid ? {
          ...m,
          nombre: nuevoNombre
        } : m);
        const gastos = data.gastos.map(g => g.pagadorUid === currentUser.uid ? {
          ...g,
          pagadorNombre: nuevoNombre
        } : g);
        await updateDoc(ref, {
          miembros: miembros,
          gastos: gastos
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
        nombre: apodo
      } ],
      miembroUids: [ currentUser.uid ],
      gastos: []
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
    if (!data.miembros.some(m => m.uid === currentUser.uid)) {
      await updateDoc(ref, {
        miembros: arrayUnion({
          uid: currentUser.uid,
          nombre: apodo
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

function suscribirGrupo(code) {
  if (unsubscribe) unsubscribe();
  localStorage.setItem("grupoActivo", code);
  unsubscribe = onSnapshot(doc(db, "grupos", code), snap => {
    if (!snap.exists()) return;
    currentGroup = {
      id: snap.id,
      data: snap.data()
    };
    guardarGrupoEnCache(snap.id, snap.data());
    guardarGrupoEnLista(snap.id, snap.data().nombre);
    renderGrupo();
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

async function flushPending() {
  const ops = getPending();
  if (!ops.empty && ops.length === 0) return;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const banner = document.getElementById("sync-banner");
  const syncText = document.getElementById("sync-text");
  if (banner) {
    banner.classList.add("visible");
    if (syncText) syncText.textContent = t.sync_syncing;
  }
  const failed = [];
  for (const op of ops) {
    if (!currentUser || op.uid !== currentUser.uid) { failed.push(op); continue; }
    try {
      if (op.type === "add_gasto") {
        await updateDoc(doc(db, "grupos", op.groupId), {
          gastos: arrayUnion(op.gasto)
        });
      } else if (op.type === "del_gasto") {
        const ref = doc(db, "grupos", op.groupId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const nuevosGastos = snap.data().gastos.filter(g => g.id !== op.gastoId);
          await updateDoc(ref, {
            gastos: nuevosGastos
          });
        }
      }
    } catch (e) {
      failed.push(op);
    }
  }
  savePending(failed);
  if (banner) {
    if (failed.length === 0) {
      if (syncText) syncText.textContent = t.sync_ok;
      setTimeout(() => banner.classList.remove("visible"), 2200);
    } else {
      if (syncText) syncText.textContent = "⚠️ " + failed.length + " " + (lang === "en" ? "expense" + (failed.length > 1 ? "s" : "") + " not synced" : lang === "pt" ? "despesa" + (failed.length > 1 ? "s" : "") + " não sincronizada" + (failed.length > 1 ? "s" : "") : "gasto" + (failed.length > 1 ? "s" : "") + " sin sincronizar");
    }
  }
}

window.agregarGasto = async () => {
  const desc = $("g-desc").value.trim();
  const monto = parseFloat($("g-monto").value);
  const puid = $("g-pagador").value;
  if (!desc || isNaN(monto) || monto <= 0) {
    shake("btn-agregar");
    return;
  }
  const pagador = currentGroup.data.miembros.find(m => m.uid === puid);
  const gasto = {
    id: Date.now().toString(),
    desc: desc,
    monto: monto,
    cat: categoriaActiva,
    pagadorUid: pagador.uid,
    pagadorNombre: pagador.nombre,
    fecha: (new Date).toLocaleDateString("es-AR"),
    entre: currentGroup.data.miembros.map(m => m.uid)
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
    await updateDoc(doc(db, "grupos", currentGroup.id), {
      gastos: arrayUnion(gasto)
    });
    showToast(tr("msg_expense_saved"));
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
  try {
    const ref = doc(db, "grupos", currentGroup.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const nuevosMiembros = data.miembros.filter(m => m.uid !== currentUser.uid);
    const nuevosUids = (data.miembroUids || []).filter(uid => uid !== currentUser.uid);
    await updateDoc(ref, {
      miembros: nuevosMiembros,
      miembroUids: nuevosUids
    });
    const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]").filter(g => g.id !== currentGroup.id);
    localStorage.setItem("misGrupos", JSON.stringify(grupos));
    if (unsubscribe) unsubscribe();
    localStorage.removeItem("grupoActivo");
    currentGroup = null;
    showSection("s-lobby");
    cargarMisGrupos();
    showToast(tr("msg_left_group"));
  } catch (e) {
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
            gastoId: gastoId
          } ]);
          if (!unloading) showToast(tr("msg_expense_deleted_offline"));
          return;
        }
        const ref = doc(db, "grupos", grp.id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const nuevosGastos = snap.data().gastos.filter(g => g.id !== gastoId);
        await updateDoc(ref, {
          gastos: nuevosGastos
        });
      } catch (e) {
        showToast(tr("err_prefix") + e.message);
      } finally {
        window._tfHidden.delete(gastoId);
        if (currentGroup === grp && !unloading) renderGrupo();
      }
    }
  });
};

window.eliminarMiembro = async uid => {
  if (!currentGroup || currentGroup._demo) {
    showToast(tr("err_demo_unavailable"));
    return;
  }
  if (currentGroup.data.creadoPor !== currentUser.uid) {
    const lang = localStorage.getItem("appLang") || "es";
    const t = i18n[lang] || i18n.es;
    showToast("❌ " + (t.only_creator_members || "Solo el creador puede eliminar miembros"));
    return;
  }
  const miembro = currentGroup.data.miembros.find(m => m.uid === uid);
  if (!miembro) return;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang] || i18n.es;
  const confirmMsg = (t.confirm_eliminar_miembro || '¿Eliminar a "{nombre}" del grupo?\n\nSus gastos registrados se mantendrán.').replace("{nombre}", miembro.nombre).replace("{nome}", miembro.nombre);
  if (!await showConfirm(confirmMsg)) return;
  try {
    const ref = doc(db, "grupos", currentGroup.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const nuevosMiembros = snap.data().miembros.filter(m => m.uid !== uid);
    const nuevosUids = (snap.data().miembroUids || []).filter(u => u !== uid);
    await updateDoc(ref, {
      miembros: nuevosMiembros,
      miembroUids: nuevosUids
    });
    showToast(tr("msg_member_removed", { nombre: miembro.nombre }));
  } catch (e) {
    showToast(tr("err_prefix") + e.message);
  }
};

function guardarGrupoEnLista(id, nombre) {
  const grupos = JSON.parse(localStorage.getItem("misGrupos") || "[]");
  if (!grupos.find(g => g.id === id)) {
    grupos.unshift({
      id: id,
      nombre: nombre
    });
    localStorage.setItem("misGrupos", JSON.stringify(grupos.slice(0, 10)));
  }
}

function cargarMisGrupos() {
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
  sel.innerHTML = miembros.map(m => `<option value="${esc(m.uid)}"${currentUser && m.uid === currentUser.uid ? " selected" : ""}>${esc(m.nombre)}</option>`).join("");
  const lista = $("lista-gastos");
  const esCreador = currentUser && creadoPor === currentUser.uid;
  if (!gastos.length) {
    lista.innerHTML = `<div class="empty-state"><span class="es-icon">🧳</span>${(i18n[localStorage.getItem("appLang") || "es"] || i18n.es).empty_expenses}</div>`;
  } else {
    lista.innerHTML = [ ...gastos ].reverse().map(g => `\n            <div class="gasto-item cat-${esc(g.cat || "otro")}" id="gasto-${esc(g.id)}">\n                <div class="gasto-emoji">${catEmoji(g.cat)}</div>\n                <div class="gasto-body">\n                    <div class="gasto-desc">${esc(g.desc)}</div>\n                    <div class="gasto-meta">${esc(g.pagadorNombre)} · ${esc(g.fecha)}</div>\n                </div>\n                <div class="gasto-monto">${fmt(g.monto)}</div>\n                ${!currentGroup._demo && g.entre?.includes(currentUser?.uid) ? `<button style="border:1px solid var(--border);border-radius:9px;padding:6px;background:var(--surface);color:var(--primary);font-size:.68rem;font-weight:800;cursor:pointer;white-space:nowrap;" data-id="${esc(g.id)}" onclick="registrarMiParte(this.dataset.id)" title="${tr('title_register_part')}">${tr('btn_my_share')}</button>` : ""}\n                <button class="gasto-del" data-id="${esc(g.id)}" onclick="eliminarGasto(this.dataset.id)" title="${tr('aria_delete_expense')}" aria-label="${tr('aria_delete_expense')}">🗑️</button>\n            </div>`).join("");
  }
  $("members-list").innerHTML = miembros.map(m => {
    const puedeEliminar = esCreador && m.uid !== currentUser.uid && !currentGroup._demo;
    return `<span class="member-chip">👤 ${esc(m.nombre)}${puedeEliminar ? `<button class="member-del" data-uid="${esc(m.uid)}" onclick="eliminarMiembro(this.dataset.uid)" title="${tr('aria_delete_member')}" aria-label="${tr('aria_delete_member')}">✕</button>` : ""}</span>`;
  }).join("");
  renderBalances(miembros, gastos);
  renderResumen(miembros, gastos);
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
  miembros.forEach(m => bal[m.uid] = 0);
  gastos.forEach(g => {
    const share = g.monto / g.entre.length;
    g.entre.forEach(uid => {
      if (uid in bal) bal[uid] -= share;
    });
    if (g.pagadorUid in bal) bal[g.pagadorUid] += g.monto;
  });
  const creditors = [], debtors = [];
  Object.entries(bal).forEach(([uid, b]) => {
    const nombre = miembros.find(m => m.uid === uid)?.nombre || uid;
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
  miembros.forEach(m => totales[m.uid] = {
    nombre: m.nombre,
    pagado: 0,
    parte: 0
  });
  gastos.forEach(g => {
    const share = g.monto / g.entre.length;
    g.entre.forEach(uid => {
      if (uid in totales) totales[uid].parte += share;
    });
    if (g.pagadorUid in totales) totales[g.pagadorUid].pagado += g.monto;
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
