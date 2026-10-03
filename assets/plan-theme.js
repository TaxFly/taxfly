const THEME_KEY = "theme";

function applyThemeChoice(choice) {
  if (choice === "dark") document.documentElement.setAttribute("data-theme", "dark"); else if (choice === "light") document.documentElement.setAttribute("data-theme", "light"); else {
    document.documentElement.removeAttribute("data-theme");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme", "dark");
  }
  document.querySelectorAll(".theme-opt").forEach(b => b.classList.toggle("active", b.dataset.themeChoice === choice));
}

function setThemeChoice(choice) {
  try {
    if (choice === "auto") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, choice);
  } catch (e) {}
  applyThemeChoice(choice);
}

function openSettingsDrawer() {
  document.getElementById("settingsDrawer").classList.add("open");
  document.getElementById("settingsOverlay").classList.add("open");
  window.renderBudgetBox && window.renderBudgetBox();
}

function closeSettingsDrawer() {
  document.getElementById("settingsDrawer").classList.remove("open");
  document.getElementById("settingsOverlay").classList.remove("open");
}

(function initTheme() {
  let choice = "auto";
  try {
    choice = localStorage.getItem(THEME_KEY) || "auto";
  } catch (e) {}
  applyThemeChoice(choice);
})();

(function initProfileButton() {
  let foto = null, nombre = null;
  try {
    foto = localStorage.getItem("perfilActivoFoto");
    nombre = localStorage.getItem("perfilActivoNombre");
  } catch (e) {}
  const btn = document.getElementById("btnSettings");
  if (foto && btn) {
    btn.style.backgroundImage = `url('${foto}')`;
    btn.innerHTML = "";
  }
  const nameEl = document.getElementById("settings-profile-name");
  if (nameEl) nameEl.textContent = nombre || "—";
  const avatarEl = document.getElementById("settings-profile-avatar");
  if (avatarEl) {
    if (foto) {
      avatarEl.style.backgroundImage = `url('${foto}')`;
    } else {
      avatarEl.textContent = (nombre || "?").trim().charAt(0).toUpperCase();
    }
  }
})();

function changeProfile() {
  try {
    localStorage.setItem("taxusa_pending_redirect", location.href);
  } catch (e) {}
  window.location.href = "https://taxfly.github.io/taxfly/profiles.html";
}

// Shared Settings drawer adapters for Planificación.
window.toggleSettings = function() {
  const drawer = document.getElementById("settingsDrawer");
  if (drawer && drawer.classList.contains("open")) closeSettingsDrawer(); else openSettingsDrawer();
};
window.toggleDarkMode = function() {
  setThemeChoice(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
};
window.doLogout = async function() {
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js");
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    await authMod.signOut(authMod.getAuth(app));
  } catch (e) {}
  try { window.taxflyClearOfflineUnlock && window.taxflyClearOfflineUnlock(); } catch (e) {}
  location.replace("login.html");
};
window.doChangePassword = async function() {
  const lang = localStorage.getItem("appLang") || "es";
  const copy = lang === "en" ? ["Enter new password (min. 6 characters):","Password updated.","Could not update password: "] : lang === "pt" ? ["Digite a nova senha (mín. 6 caracteres):","Senha atualizada.","Não foi possível atualizar a senha: "] : ["Ingresá la nueva contraseña (mín. 6 caracteres):","Contraseña actualizada.","No se pudo actualizar la contraseña: "];
  const pass = window.showPrompt ? await window.showPrompt(copy[0]) : prompt(copy[0]);
  if (!pass || pass.length < 6) return;
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js");
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    await authMod.updatePassword(authMod.getAuth(app).currentUser, pass);
    window.showAlert ? window.showAlert(copy[1]) : alert(copy[1]);
  } catch (e) { window.showAlert ? window.showAlert(copy[2] + (e.message || e)) : alert(copy[2] + (e.message || e)); }
};
window.doDeleteAccount = async function() {
  const lang = localStorage.getItem("appLang") || "es";
  const msg = lang === "en" ? "Permanently delete account?" : lang === "pt" ? "Excluir conta permanentemente?" : "¿Eliminar cuenta permanentemente?";
  const ok = window.showConfirm ? await window.showConfirm(msg) : confirm(msg);
  if (!ok) return;
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js");
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    await authMod.deleteUser(authMod.getAuth(app).currentUser);
    location.replace("login.html");
  } catch (e) { window.showAlert ? window.showAlert(String(e.message || e)) : alert(String(e.message || e)); }
};
