import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

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

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

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

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

const destino = "usa";

const destinoLabel = destino === "europe" ? "TaxEurope" : "TaxUSA";

const i18n = {
  es: {
    pageTitle: `${destinoLabel} — Perfiles`,
    title: "¿Quién está planificando hoy?",
    editTitle: "Administrar Perfiles",
    manage: "EDITAR PERFILES",
    done: "LISTO",
    save: "GUARDAR",
    cancel: "CANCELAR",
    delete: "Eliminar Perfil",
    edit: "Editar Perfil",
    newProfile: "Nuevo Perfil",
    addLabel: "Nuevo",
    guest: "Invitado",
    active: "Activo",
    confirm: "¿Eliminar este perfil?",
    logout: "🚪 CERRAR SESIÓN",
    namePlaceholder: "Tu nombre",
    err_save_profile: "No se pudo guardar el perfil: {msg}\n\nSi elegiste una foto propia, puede ser que sea muy pesada — probá con una más chica.",
    err_unknown: "error desconocido",
    err_image_format: "Solo se aceptan imágenes JPG, PNG o WebP.",
    err_photo_too_big: "La foto no puede superar los {mb} MB.",
    err_image_too_small: "La imagen es muy pequeña. Mínimo {dim}×{dim} px.",
    err_security_retry: "Verificación de seguridad fallida. Intentá de nuevo.",
    mod_checking: "Verificando imagen...",
    mod_ok: "✓ Foto verificada y aprobada",
    mod_rejected: "✗ Foto rechazada: {reason}",
    mod_error: "✗ No se pudo verificar la foto. Intentá de nuevo.",
    err_confirm_rights: "Por favor confirmá que tenés los derechos sobre la foto antes de guardar."
  },
  en: {
    pageTitle: `${destinoLabel} — Profiles`,
    title: "Who's planning today?",
    editTitle: "Manage Profiles",
    manage: "EDIT PROFILES",
    done: "DONE",
    save: "SAVE",
    cancel: "CANCEL",
    delete: "Delete Profile",
    edit: "Edit Profile",
    newProfile: "New Profile",
    addLabel: "New",
    guest: "Guest",
    active: "Active",
    confirm: "Delete this profile?",
    logout: "🚪 SIGN OUT",
    namePlaceholder: "Your name",
    err_save_profile: "Couldn't save the profile: {msg}\n\nIf you picked your own photo, it might be too heavy — try a smaller one.",
    err_unknown: "unknown error",
    err_image_format: "Only JPG, PNG or WebP images are accepted.",
    err_photo_too_big: "The photo can't be larger than {mb} MB.",
    err_image_too_small: "The image is too small. Minimum {dim}×{dim} px.",
    err_security_retry: "Security check failed. Please try again.",
    mod_checking: "Verifying image...",
    mod_ok: "✓ Photo verified and approved",
    mod_rejected: "✗ Photo rejected: {reason}",
    mod_error: "✗ Could not verify the photo. Please try again.",
    err_confirm_rights: "Please confirm you have the rights to the photo before saving."
  },
  pt: {
    pageTitle: `${destinoLabel} — Perfis`,
    title: "Quem está planejando hoje?",
    editTitle: "Gerenciar Perfis",
    manage: "EDITAR PERFIS",
    done: "PRONTO",
    save: "SALVAR",
    cancel: "CANCELAR",
    delete: "Excluir Perfil",
    edit: "Editar Perfil",
    newProfile: "Novo Perfil",
    addLabel: "Novo",
    guest: "Convidado",
    active: "Ativo",
    confirm: "Excluir este perfil?",
    logout: "🚪 SAIR",
    namePlaceholder: "Seu nome",
    err_save_profile: "Não foi possível salvar o perfil: {msg}\n\nSe você escolheu uma foto própria, ela pode ser muito pesada — tente uma menor.",
    err_unknown: "erro desconhecido",
    err_image_format: "Só são aceitas imagens JPG, PNG ou WebP.",
    err_photo_too_big: "A foto não pode ultrapassar {mb} MB.",
    err_image_too_small: "A imagem é muito pequena. Mínimo {dim}×{dim} px.",
    err_security_retry: "Falha na verificação de segurança. Tente novamente.",
    mod_checking: "Verificando imagem...",
    mod_ok: "✓ Foto verificada e aprovada",
    mod_rejected: "✗ Foto rejeitada: {reason}",
    mod_error: "✗ Não foi possível verificar a foto. Tente novamente.",
    err_confirm_rights: "Confirme que você tem os direitos sobre a foto antes de salvar."
  }
};

function tr(key, vars) {
  const cur = i18n[localStorage.getItem("appLang") || "es"] || i18n.es;
  let str = cur[key];
  if (str == null) return key;
  if (vars) {
    for (const k in vars) str = str.split("{" + k + "}").join(vars[k]);
  }
  return str;
}

const photos = [ "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1777776216395.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1777776225455.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1777776311828.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1777776315983.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1777776318834.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027664793.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027669500.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027673553.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027676790.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027680096.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027684221.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027686067.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/adventurerNeutral-1778027689046.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1778027716106.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1778027718459.png", "https://raw.githubusercontent.com/TaxFly/taxfly/main/assets/funEmoji-1778027720162.png" ];

let uid, profiles = [], editingId = null, selectedPhoto = photos[0], isEditing = false;

let lang = localStorage.getItem("appLang") || "es";

let t = i18n[lang];

function applyLang() {
  t = i18n[lang];
  document.title = t.pageTitle;
  document.getElementById("pageTitle").innerText = isEditing ? t.editTitle : t.title;
  document.getElementById("manageBtn").innerText = isEditing ? t.done : t.manage;
  document.getElementById("btnSave").innerText = t.save;
  document.getElementById("btnCancel").innerText = t.cancel;
  document.getElementById("btnDelete").innerText = t.delete;
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.innerText = t.logout;
  const nameInput = document.getElementById("nameInput");
  if (nameInput) nameInput.placeholder = t.namePlaceholder;
  render();
}

applyLang();

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

async function checkRealConnectivity() {
  return await probeConnectivity();
}

function loadOfflineProfiles() {
  try {
    const cached = localStorage.getItem("taxfly_cached_profiles");
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
}

function enterOfflineMode() {
  const cachedProfiles = loadOfflineProfiles();
  const cachedUid = localStorage.getItem("taxusa_offline_uid");
  if (!cachedUid) {
    window.location.replace("login.html");
    return;
  }
  uid = cachedUid;
  if (cachedProfiles && cachedProfiles.length > 0) {
    profiles = cachedProfiles;
  } else {
    const nombre = localStorage.getItem("taxusa_cached_name") || t.guest;
    const foto = localStorage.getItem("taxusa_cached_foto") || photos[0];
    profiles = [ {
      id: localStorage.getItem("perfilActivoId") || "p_offline",
      nombre: nombre,
      foto: foto
    } ];
  }
  const badge = document.createElement("div");
  badge.style.cssText = "background:rgba(239,159,39,.1);border:1.5px solid rgba(239,159,39,.3);color:#BA7517;border-radius:12px;padding:8px 14px;font-size:.78rem;font-weight:700;margin-bottom:12px;text-align:center;";
  badge.innerHTML = (window.uiIcon ? window.uiIcon("phone", 14) + " " : "") + "Modo sin conexión — mostrando datos guardados";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.gap = "6px";
  badge.style.justifyContent = "center";
  const wrap = document.querySelector(".profiles-wrap") || document.body;
  wrap.insertBefore(badge, wrap.firstChild);
  render();
}

onAuthStateChanged(auth, async user => {
  const online = await checkRealConnectivity();
  if (!online) {
    if (!window.taxflyOfflineUnlocked()) { window.location.replace("login.html"); return; }
    enterOfflineMode();
    return;
  }
  if (!user || (!navigator.onLine && !window.taxflyOfflineUnlocked())) {
    window.location.replace("login.html");
    return;
  }
  uid = user.uid;
  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    profiles = snap.exists() ? snap.data().perfiles || [] : [];
    if (profiles.length === 0) {
      profiles = [ {
        id: "p" + Date.now(),
        nombre: t.guest,
        foto: photos[0]
      } ];
      await setDoc(doc(db, "usuarios", uid), {
        perfiles: profiles
      });
    }
    localStorage.setItem("taxfly_cached_profiles", JSON.stringify(profiles));
  } catch (e) {
    const cached = loadOfflineProfiles();
    if (cached) profiles = cached;
  }
  render();
});

function safeProfilePhoto(url) {
  if (typeof url !== "string") return photos[0];
  if (/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(url)) return url;
  try {
    const parsed = new URL(url, location.href);
    return parsed.protocol === "https:" ? parsed.href : photos[0];
  } catch (e) { return photos[0]; }
}

function render() {
  const activeId = localStorage.getItem("perfilActivoId");
  const grid = document.getElementById("profilesGrid");
  grid.replaceChildren();
  profiles.forEach(p => {
    const isActive = p.id === activeId;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "profile-item";
    item.setAttribute("aria-label", p.nombre);
    item.addEventListener("click", () => handleClick(p.id, p.nombre, p.foto));
    const wrapper = document.createElement("span");
    wrapper.className = "avatar-wrapper";
    const avatar = document.createElement("img");
    avatar.className = "avatar" + (isActive ? " is-active" : "");
    avatar.src = safeProfilePhoto(p.foto);
    avatar.alt = "";
    avatar.addEventListener("error", () => { if (avatar.src !== photos[0]) avatar.src = photos[0]; }, { once: true });
    wrapper.appendChild(avatar);
    if (isActive) {
      const badge = document.createElement("span");
      badge.className = "active-badge";
      badge.textContent = t.active;
      wrapper.appendChild(badge);
    }
    const overlay = document.createElement("span");
    overlay.className = "edit-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    wrapper.appendChild(overlay);
    item.appendChild(wrapper);
    const name = document.createElement("span");
    name.className = "profile-name";
    name.textContent = p.nombre;
    if (isActive) { name.style.color = "var(--text)"; name.style.fontWeight = "800"; }
    item.appendChild(name);
    grid.appendChild(item);
  });
  if (profiles.length < 5) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "profile-item";
    item.addEventListener("click", () => openEditor(null));
    const wrapper = document.createElement("span");
    wrapper.className = "avatar-wrapper";
    const avatar = document.createElement("span");
    avatar.className = "add-avatar";
    const plus = document.createElement("span");
    plus.textContent = "+";
    const label = document.createElement("span");
    label.className = "add-label";
    label.textContent = t.addLabel;
    avatar.append(plus, label);
    wrapper.appendChild(avatar);
    item.appendChild(wrapper);
    const name = document.createElement("span");
    name.className = "profile-name";
    name.textContent = t.newProfile;
    item.appendChild(name);
    grid.appendChild(item);
  }
}

window.toggleEditMode = () => {
  isEditing = !isEditing;
  document.body.classList.toggle("editing-mode", isEditing);
  document.getElementById("pageTitle").innerText = isEditing ? t.editTitle : t.title;
  document.getElementById("manageBtn").innerText = isEditing ? t.done : t.manage;
};

window.handleClick = (id, nombre, fotoEnc) => {
  if (isEditing) {
    openEditor(id);
    return;
  }
  const foto = safeProfilePhoto(fotoEnc);
  localStorage.setItem("perfilActivoId", id);
  localStorage.setItem("perfilActivoNombre", nombre);
  localStorage.setItem("perfilActivoFoto", foto);
  let pending = null;
  try {
    pending = localStorage.getItem("taxusa_pending_redirect");
    if (pending) localStorage.removeItem("taxusa_pending_redirect");
  } catch (e) {}
  if (pending) {
    window.location.replace(pending);
    return;
  }
  const destino = "usa";
  window.location.replace("index.html");
};

window.openEditor = id => {
  editingId = id;
  const p = profiles.find(x => x.id === id);
  document.getElementById("modalTitle").innerText = id ? t.edit : t.newProfile;
  document.getElementById("nameInput").value = p ? p.nombre : "";
  selectedPhoto = p ? p.foto : photos[0];
  document.getElementById("btnDelete").style.display = id ? "block" : "none";
  updatePreview();
  const grid = document.getElementById("photoGrid");
  grid.innerHTML = photos.map(url => `\n            <img src="${url}" alt="Foto de perfil" class="photo-option ${url === selectedPhoto ? "selected" : ""}"\n                 onclick="selectPhoto('${url}')">\n        `).join("");
  document.getElementById("editModal").classList.add("show");
};

window.selectPhoto = url => {
  selectedPhoto = url;
  document.querySelectorAll(".photo-option").forEach(img => img.classList.toggle("selected", img.src === url));
  updatePreview();
};

function updatePreview() {
  document.getElementById("previewAvatar").style.backgroundImage = `url('${selectedPhoto}')`;
}

window.closeModal = () => document.getElementById("editModal").classList.remove("show");

window.doLogout = async () => {
  try {
    await signOut(auth);
    window.taxflyClearOfflineUnlock();
    localStorage.removeItem("perfilActivoId");
    localStorage.removeItem("perfilActivoNombre");
    localStorage.removeItem("perfilActivoFoto");
    window.location.replace("login.html");
  } catch (e) {
    console.error("Error al cerrar sesión:", e);
  }
};

window.saveProfile = async () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return;
  const isNew = !editingId;
  const newProfile = {
    id: "p" + Date.now(),
    nombre: name,
    foto: selectedPhoto
  };
  const updatedProfiles = editingId ? profiles.map(p => p.id === editingId ? {
    ...p,
    nombre: name,
    foto: selectedPhoto
  } : p) : [ ...profiles, newProfile ];
  try {
    await updateDoc(doc(db, "usuarios", uid), {
      perfiles: updatedProfiles
    });
  } catch (err) {
    console.error("Error guardando perfil:", err);
    showAlert(tr("err_save_profile", { msg: err.message || tr("err_unknown") }));
    return;
  }
  profiles = updatedProfiles;
  localStorage.setItem("taxfly_cached_profiles", JSON.stringify(profiles));
  if (isNew) {
    handleClick(newProfile.id, newProfile.nombre, newProfile.foto || "");
    return;
  }
  closeModal();
  if (isEditing) toggleEditMode();
  render();
};

let cropImage = null, cropOffsetX = 0, cropOffsetY = 0, cropZoom = 1;

let isDragging = false, dragStartX = 0, dragStartY = 0, dragOffsetX = 0, dragOffsetY = 0;

let customPhotoDataUrl = null;

const MAX_MB = 2;

const MIN_DIM = 100;

const CANVAS_SIZE = 240;

document.getElementById("photoUpload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  handleFileSelected(file);
  this.value = "";
});

const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});

function handleFileSelected(file) {
  const allowed = [ "image/jpeg", "image/png", "image/webp" ];
  if (!allowed.includes(file.type)) {
    showAlert(tr("err_image_format"));
    return;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    showAlert(tr("err_photo_too_big", { mb: MAX_MB }));
    return;
  }
  const reader = new FileReader;
  reader.onload = ev => {
    const img = new Image;
    img.onload = () => {
      if (img.width < MIN_DIM || img.height < MIN_DIM) {
        showAlert(tr("err_image_too_small", { dim: MIN_DIM }));
        return;
      }
      openCropModal(img);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function openCropModal(img) {
  cropImage = img;
  cropZoom = 1;
  const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
  cropOffsetX = (CANVAS_SIZE - img.width * scale) / 2;
  cropOffsetY = (CANVAS_SIZE - img.height * scale) / 2;
  document.getElementById("zoomRange").value = 1;
  document.getElementById("cropModal").classList.add("show");
  drawCrop();
}

function drawCrop() {
  const canvas = document.getElementById("cropCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (!cropImage) return;
  const baseScale = Math.max(CANVAS_SIZE / cropImage.width, CANVAS_SIZE / cropImage.height);
  const scale = baseScale * cropZoom;
  ctx.drawImage(cropImage, cropOffsetX, cropOffsetY, cropImage.width * scale, cropImage.height * scale);
}

document.getElementById("zoomRange").addEventListener("input", function() {
  cropZoom = parseFloat(this.value);
  drawCrop();
});

const wrapper = document.getElementById("cropWrapper");

wrapper.addEventListener("mousedown", e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOffsetX = cropOffsetX;
  dragOffsetY = cropOffsetY;
});

window.addEventListener("mousemove", e => {
  if (!isDragging) return;
  cropOffsetX = dragOffsetX + (e.clientX - dragStartX);
  cropOffsetY = dragOffsetY + (e.clientY - dragStartY);
  drawCrop();
});

window.addEventListener("mouseup", () => isDragging = false);

wrapper.addEventListener("touchstart", e => {
  isDragging = true;
  dragStartX = e.touches[0].clientX;
  dragStartY = e.touches[0].clientY;
  dragOffsetX = cropOffsetX;
  dragOffsetY = cropOffsetY;
});

wrapper.addEventListener("touchmove", e => {
  if (!isDragging) return;
  e.preventDefault();
  cropOffsetX = dragOffsetX + (e.touches[0].clientX - dragStartX);
  cropOffsetY = dragOffsetY + (e.touches[0].clientY - dragStartY);
  drawCrop();
}, {
  passive: false
});

wrapper.addEventListener("touchend", () => isDragging = false);

window.cancelCrop = () => document.getElementById("cropModal").classList.remove("show");

window.confirmCrop = async () => {
  const canvas = document.getElementById("cropCanvas");
  const dataUrl = canvas.toDataURL("image/jpeg", .92);
  document.getElementById("cropModal").classList.remove("show");
  await moderateAndApplyPhoto(dataUrl);
};

async function moderateAndApplyPhoto(dataUrl) {
  if (!await _rcCheck("upload_photo")) {
    showAlert(tr("err_security_retry"));
    return;
  }
  const statusEl = document.getElementById("modStatus");
  const statusText = document.getElementById("modStatusText");
  const termsRow = document.getElementById("termsRow");
  statusEl.className = "mod-status checking";
  statusText.textContent = tr("mod_checking");
  termsRow.style.display = "none";
  document.getElementById("previewAvatar").style.backgroundImage = `url('${dataUrl}')`;
  try {
    const base64 = dataUrl.split(",")[1];
    const response = await window.taxflyWorker({
      type: "moderate_image",
      imageBase64: base64,
      mediaType: "image/jpeg"
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Backend error ${response.status}: ${result.error || "unknown"}`);
    }
    if (result.approved) {
      customPhotoDataUrl = dataUrl;
      selectedPhoto = dataUrl;
      statusEl.className = "mod-status approved";
      statusText.textContent = tr("mod_ok");
      termsRow.style.display = "flex";
      updatePreview();
    } else {
      statusEl.className = "mod-status rejected";
      statusText.textContent = tr("mod_rejected", { reason: result.reason });
      document.getElementById("previewAvatar").style.backgroundImage = `url('${selectedPhoto}')`;
      customPhotoDataUrl = null;
    }
  } catch (err) {
    console.warn("Moderation error:", err);
    statusEl.className = "mod-status rejected";
    statusText.textContent = tr("mod_error");
    document.getElementById("previewAvatar").style.backgroundImage = `url('${selectedPhoto}')`;
    customPhotoDataUrl = null;
  }
}

const originalOpenEditor = window.openEditor;

window.openEditor = id => {
  originalOpenEditor(id);
  document.getElementById("modStatus").className = "mod-status";
  document.getElementById("termsRow").style.display = "none";
  document.getElementById("termsCheck").checked = false;
  customPhotoDataUrl = null;
};

const originalSave = window.saveProfile;

window.saveProfile = async () => {
  if (customPhotoDataUrl && !document.getElementById("termsCheck").checked) {
    showAlert(tr("err_confirm_rights"));
    return;
  }
  await originalSave();
};

const DEL_TXT = {
  es: {
    msg: n => `Antes de eliminar "${n}", podés guardar una copia de todo lo de este perfil (gastos, itinerario, notas y Orlando Planning) en un archivo JSON.`,
    backup: "Descargar respaldo y eliminar",
    noBackup: "Eliminar sin respaldo",
    cancel: "Cancelar",
    busy: "Preparando respaldo…",
    fail: "No se pudo generar el respaldo, así que el perfil NO se eliminó. Revisá tu conexión e intentá de nuevo."
  },
  en: {
    msg: n => `Before deleting "${n}", you can save a copy of everything in this profile (expenses, itinerary, notes and Orlando Planning) as a JSON file.`,
    backup: "Download backup and delete",
    noBackup: "Delete without backup",
    cancel: "Cancel",
    busy: "Preparing backup…",
    fail: "The backup could not be created, so the profile was NOT deleted. Check your connection and try again."
  },
  pt: {
    msg: n => `Antes de excluir "${n}", você pode salvar uma cópia de tudo neste perfil (gastos, itinerário, notas e Orlando Planning) em um arquivo JSON.`,
    backup: "Baixar backup e excluir",
    noBackup: "Excluir sem backup",
    cancel: "Cancelar",
    busy: "Preparando backup…",
    fail: "Não foi possível criar o backup, então o perfil NÃO foi excluído. Verifique sua conexão e tente de novo."
  }
};

function askDeleteChoice(name) {
  const T = DEL_TXT[lang] || DEL_TXT.es;
  return new Promise(resolve => {
    if (window.tfEnsureDialogStyles) window.tfEnsureDialogStyles();
    const ov = document.createElement("div");
    ov.className = "tf-dialog-overlay";
    ov.innerHTML = `<div class="tf-dialog-box" role="alertdialog" aria-modal="true">\n                <div class="tf-dialog-msg"></div>\n                <div class="tf-dialog-actions" style="flex-direction:column;align-items:stretch;">\n                    <button type="button" class="tf-dialog-btn tf-dialog-btn-ok" data-c="backup"></button>\n                    <button type="button" class="tf-dialog-btn tf-dialog-btn-danger" data-c="delete" style="background:transparent;color:var(--danger);border:1.5px solid rgba(239,68,68,.4);"></button>\n                    <button type="button" class="tf-dialog-btn tf-dialog-btn-cancel" data-c="cancel"></button>\n                </div></div>`;
    ov.querySelector(".tf-dialog-msg").textContent = T.msg(name);
    ov.querySelector('[data-c="backup"]').textContent = T.backup;
    ov.querySelector('[data-c="delete"]').textContent = T.noBackup;
    ov.querySelector('[data-c="cancel"]').textContent = T.cancel;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add("show"));
    const done = v => {
      ov.classList.remove("show");
      setTimeout(() => ov.remove(), 160);
      document.removeEventListener("keydown", onKey);
      resolve(v);
    };
    const onKey = e => {
      if (e.key === "Escape") done(null);
    };
    document.addEventListener("keydown", onKey);
    ov.addEventListener("click", e => {
      const c = e.target.closest && e.target.closest("[data-c]");
      if (c) done(c.dataset.c === "cancel" ? null : c.dataset.c); else if (e.target === ov) done(null);
    });
  });
}

async function downloadProfileBackup(pid) {
  const B = await (import("./backup.js"));
  const r = await B.exportBackup({
    pid: pid
  });
  const url = URL.createObjectURL(r.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = r.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4e3);
  return r;
}

window.deleteProfile = async () => {
  if (profiles.length <= 1) return;
  const target = profiles.find(p => p.id === editingId);
  const choice = await askDeleteChoice(target && target.nombre || "");
  if (!choice) return;
  if (choice === "backup") {
    const btn = document.getElementById("btnDelete");
    const T = DEL_TXT[lang] || DEL_TXT.es;
    const prevTxt = btn ? btn.innerText : "";
    if (btn) {
      btn.disabled = true;
      btn.innerText = T.busy;
    }
    try {
      await downloadProfileBackup(editingId);
    } catch (e) {
      console.error(e);
      if (btn) {
        btn.disabled = false;
        btn.innerText = prevTxt;
      }
      await showAlert(T.fail);
      return;
    }
    if (btn) {
      btn.disabled = false;
      btn.innerText = prevTxt;
    }
  } else if (!await showConfirm(t.confirm, {
    danger: true
  })) {
    return;
  }
  profiles = profiles.filter(p => p.id !== editingId);
  await updateDoc(doc(db, "usuarios", uid), {
    perfiles: profiles
  });
  localStorage.setItem("taxfly_cached_profiles", JSON.stringify(profiles));
  closeModal();
  if (isEditing) toggleEditMode();
  render();
};
