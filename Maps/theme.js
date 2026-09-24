// Key 'theme' compartida con TaxUSA/Taxfly (mismo dominio): cuando el
// usuario elige "Auto" acá, borramos la key en vez de guardar el string
// 'auto', porque Taxfly interpreta "sin key" como auto y cualquier otro
// valor lo toma literal para el atributo data-theme (guardar 'auto' ahí
// rompería el tema en Taxfly).
const THEME_KEY = 'theme';
function applyThemeChoice(choice) {
  if (choice === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else if (choice === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else {
    document.documentElement.removeAttribute('data-theme');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
  }
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.themeChoice === choice));
}
function setThemeChoice(choice) {
  try {
    if (choice === 'auto') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch(e) {}
  applyThemeChoice(choice);
}
function openSettingsDrawer() {
  document.getElementById('settingsDrawer').classList.add('open');
  document.getElementById('settingsOverlay').classList.add('open');
  window.renderBudgetBox && window.renderBudgetBox();
}
function closeSettingsDrawer() {
  document.getElementById('settingsDrawer').classList.remove('open');
  document.getElementById('settingsOverlay').classList.remove('open');
}
(function initTheme() {
  let choice = 'auto';
  try { choice = localStorage.getItem(THEME_KEY) || 'auto'; } catch(e) {}
  applyThemeChoice(choice);
})();

// ─── Foto de perfil en el botón de Ajustes ─────────────────────────
// Mismo patrón que Taxfly: el botón de ajustes ES la foto del perfil
// activo (mismo localStorage, mismo origen). Si no hay foto cargada,
// se queda con el ícono de engranaje de siempre.
(function initProfileButton() {
  let foto = null, nombre = null;
  try {
    foto = localStorage.getItem('perfilActivoFoto');
    nombre = localStorage.getItem('perfilActivoNombre');
  } catch(e) {}
  const btn = document.getElementById('btnSettings');
  if (foto && btn) {
    btn.style.backgroundImage = `url('${foto}')`;
    btn.innerHTML = '';
  }
  const nameEl = document.getElementById('settings-profile-name');
  if (nameEl) nameEl.textContent = nombre || '—';
  const avatarEl = document.getElementById('settings-profile-avatar');
  if (avatarEl) {
    if (foto) { avatarEl.style.backgroundImage = `url('${foto}')`; }
    else { avatarEl.textContent = (nombre || '?').trim().charAt(0).toUpperCase(); }
  }
})();

// Manda a elegir otro perfil en Taxfly (mismo mecanismo de "volver acá"
// que ya usa el login cuando no hay sesión/perfil activo).
function changeProfile() {
  try { localStorage.setItem('taxusa_pending_redirect', location.href); } catch(e) {}
  window.location.href = 'https://taxfly.github.io/taxfly/profiles.html';
}
