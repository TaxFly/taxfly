// ─── Set de íconos SVG (reemplaza los emojis nativos en el UI) ───
// Íconos de línea consistentes (24x24, stroke=currentColor) para que la
// navegación, categorías y estados se vean igual en iOS/Android/Windows,
// en vez de depender del set de emoji de cada sistema operativo.
const ICON_PATHS = {
  bag:        '<path d="M6 2 4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-2-6"/><path d="M4 8h16"/><path d="M9 12a3 3 0 0 0 6 0"/>',
  utensils:   '<path d="M7 2v6a2 2 0 0 0 4 0V2"/><path d="M9 8v14"/><path d="M17 2c-1.5 0-3 1.5-3 4v4a2 2 0 0 0 2 2h1v10"/>',
  cart:       '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 3h2l2.6 12.4A2 2 0 0 0 9.55 17H18a2 2 0 0 0 1.96-1.6L21.5 8H6"/>',
  ferris:     '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/><path d="M12 20v2M8 22h8"/>',
  gear:       '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  pencil:     '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/>',
  calendar:   '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>',
  home:       '<path d="M3 11 12 3l9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
  map:        '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  castle:     '<path d="M3 21V9l3-2v3l3-2v-2l3 3 3-3v2l3-2v3l3 2v10Z"/><path d="M3 21h18"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
  clapper:    '<path d="M3 8.5 5 3l3.3 3-2 5.5Z"/><path d="M8.3 6 11.6 9l6.7-3.5-3.3-3Z"/><path d="M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>',
  shirt:      '<path d="M8 3 3 6l2 3 3-1.2V21h8V7.8L19 9l2-3-5-3-2 2h-4Z"/>',
  pants:      '<path d="M6 2h12l1 8-2 12h-3l-1.5-11L11 22H8L6 10Z"/>',
  dumbbell:   '<path d="M4 9v6M2 10.5v3M22 10.5v3M20 9v6M7 12h10"/><rect x="5.5" y="8" width="3" height="8" rx="1"/><rect x="15.5" y="8" width="3" height="8" rx="1"/>',
  footprints: '<path d="M8 15c1.7 0 3-1 3-3 0-1.2-.7-2-1.4-3-.6-1-1-1.7-1-3a2.6 2.6 0 0 0-5.2 0c0 1 .3 1.6.8 2.5"/><path d="M4 21c0-1.7 1-3 3-3s3 1.3 3 3"/><path d="M16 12c-1.7 0-3-1-3-3 0-1.2.7-2 1.4-3 .6-1 1-1.7 1-3a2.6 2.6 0 0 1 5.2 0c0 1-.3 1.6-.8 2.5"/><path d="M13 18c0-1.7 1-3 3-3s3 1.3 3 3"/>',
  backpack:   '<path d="M7 8V6a5 5 0 0 1 10 0v2"/><path d="M6 8h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"/><path d="M9 12h6M9 16h6"/><path d="M9 8v-.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V8"/>',
  bread:      '<path d="M4 12a5 5 0 0 1 5-6h6a5 5 0 0 1 5 6v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 12v6M12 12v6M15 12v6"/>',
  egg:        '<path d="M12 22c4.4 0 7-3.6 7-8 0-6-4-12-7-12S5 8 5 14c0 4.4 2.6 8 7 8Z"/>',
  drumstick:  '<path d="M12.5 11.5c2 2 5 1.5 7-.5 1.6-1.6 1.8-3.7.5-5s-3.4-1-5 .5c-2 2-2.5 5-.5 7Z"/><path d="M13 11 4 20a2 2 0 1 0 2.8 2.8L15 15"/><path d="M6 22c-1 0-1.8-.6-2-1.6"/>',
  can:        '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M6 9h12"/><path d="M9 4V2h6v2"/>',
  snowflake:  '<path d="M12 2v20M4.9 6l14.2 12M4.9 18 19.1 6"/><path d="M8 3.5 12 6l4-2.5M8 20.5 12 18l4 2.5M3.4 8.7 6 12l-2.6 3.3M20.6 8.7 18 12l2.6 3.3"/>',
  coffee:     '<path d="M4 8h13a3 3 0 0 1 0 6h-1"/><path d="M4 8v7a5 5 0 0 0 5 5h3a5 5 0 0 0 5-5V8"/><path d="M7 3.5c-.7.6-.7 1.4 0 2M11 3.5c-.7.6-.7 1.4 0 2"/>',
  fork:       '<path d="M7 2v6a2 2 0 0 0 4 0V2"/><path d="M9 8v14"/><path d="M17 2c-1.5 0-3 1.5-3 4v4a2 2 0 0 0 2 2h1v10"/>',
  car:        '<path d="M5 13 6.6 8.2A2 2 0 0 1 8.5 7h7a2 2 0 0 1 1.9 1.2L19 13"/><path d="M4 13h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><circle cx="7.5" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
  plane:      '<path d="M3.5 19 21 12 3.5 5l1.5 6.2L14 12l-9 .8Z"/>',
  sparkles:   '<path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/>',
  dino:       '<path d="M4 20V13a5 5 0 0 1 5-5h1V6a2 2 0 0 1 2-2h3l2 3h1a2 2 0 0 1 2 2v3l2 1-2 1v1a3 3 0 0 1-3 3h-1v3h-3v-3h-3l-1 3H6l1-3a2 2 0 0 1-3-3Z"/><circle cx="15" cy="8" r=".6" fill="currentColor" stroke="none"/>',
  masks:      '<path d="M4 5c3 0 4 2 4 4s-1 3-2 3-3-1.5-3-4a5 5 0 0 1 1-3Z"/><path d="M20 5c-3 0-4 2-4 4s1 3 2 3 3-1.5 3-4a5 5 0 0 0-1-3Z"/><path d="M8 13c1.3 3 3 5 4 5s2.7-2 4-5"/><path d="M7 8.3c.6.6.6 1.4 0 2M17 8.3c-.6.6-.6 1.4 0 2"/>',
  globe:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18Z"/>',
  check:      '<path d="M20 6 9 17l-5-5"/>',
  wallet:     '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 13.5h.01"/>',
  x:          '<path d="M18 6 6 18M6 6l12 12"/>',
  search:     '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  droplet:    '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  file:       '<path d="M7 2h7l5 5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5.5 20V3.5A1.5 1.5 0 0 1 7 2Z"/><path d="M14 2v5h5"/>',
  plug:       '<path d="M9 3v4M15 3v4M6.5 7h11l-1 6a6 6 0 0 1-9 0Z"/><path d="M12 17v4"/>',
  pin:        '<path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  chevronUp:  '<path d="M6 15l6-6 6 6"/>',
  chevronDown:'<path d="M6 9l6 6 6-6"/>',
  chevronLeft:'<path d="M15 6l-6 6 6 6"/>',
  chevronRight:'<path d="M9 6l6 6-6 6"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
};
function ic(name, size) {
  const s = size || 16;
  return `<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

// Escapa texto de usuario antes de insertarlo en innerHTML (previene XSS).
// Usar SIEMPRE que un valor escrito por alguien (nombre de producto, nota,
// snack, comida, etc.) se inserte en un template literal destinado a innerHTML.
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// ─── Guardado y carga sincronizados (localStorage + Firebase) ───
// Los 6 módulos (hotel, días, comidas, Walmart, compras, parques) repetían
// el mismo patrón: guardar en localStorage con try/catch, y subir el dato
// a Firebase con su docId. Estos tres helpers concentran ese patrón.
//
// syncedSave: guarda `localValue` en `localKey` y sube `fbValue` (o
// `localValue` si no se pasa uno distinto) al docId de Firebase. Se admite
// una forma distinta para Firebase porque algunos módulos (ej. "días")
// envuelven el dato de otra manera para cada destino.
// Registro de "lo último que yo mandé" por docId, usado por fbListen (en el
// script de Firebase) para avisar si otro dispositivo pisó el mismo dato
// casi al mismo tiempo. Ver comentario junto a CONFLICT_WINDOW_MS.
window._syncedWriteLog = window._syncedWriteLog || {};

// Todas las keys de localStorage de datos del viaje (hotel, outlets,
// comidas, walmart, presupuesto, parques...) pasan por acá para quedar
// separadas por perfil DENTRO DEL MISMO NAVEGADOR. Sin esto, Firestore
// separa bien por perfil, pero mientras esos datos todavía no llegaron,
// la app cae de vuelta al cache local como "pintado rápido" — y si ese
// cache no está separado por perfil, un perfil nuevo ve por un instante
// (o de forma permanente si Firestore también viene vacío) los datos
// que quedaron pisados de otro perfil usado antes en este mismo navegador.
function scopedKey(key) {
  return key + '::' + (window._perfilId || 'sinperfil');
}

function syncedSave(localKey, localValue, docId, fbValue) {
  try { localStorage.setItem(scopedKey(localKey), JSON.stringify(localValue)); } catch(e) {}
  const payload = fbValue !== undefined ? fbValue : localValue;
  if (window._fb && window._fb.stableStringify) {
    window._syncedWriteLog[docId] = { at: Date.now(), value: window._fb.stableStringify(payload) };
  }
  window._fb && window._fb.fbSet(docId, payload);
}

// localLoad: lee y parsea un valor de localStorage. null si no existe o
// está corrupto.
function localLoad(localKey) {
  try {
    const raw = localStorage.getItem(scopedKey(localKey));
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// syncedLoad: prioriza el dato ya bajado de Firebase (pasado en `fbValue`,
// típicamente `window._xFromFb`) por sobre lo que haya en localStorage,
// igual que hacía cada módulo por separado.
function syncedLoad(localKey, fbValue) {
  return (fbValue !== undefined && fbValue !== null) ? fbValue : localLoad(localKey);
}

// App hermana: inventario de equipaje (accesorios, ropa, mochila del día).
// Si cambia el link, actualizarlo acá y en el botón del header (index.html).
const MIS_COSAS_URL = './Mis_cosas_de_viaje.html';

const HOTEL_KEY = 'orlando-hotel-v1';
let hotel = { addr: "", url: "#" };
function hotelLoad() {
  const d = syncedLoad(HOTEL_KEY, window._hotelFromFb);
  if (d) hotel = d;
}
function hotelSave() {
  syncedSave(HOTEL_KEY, hotel, 'hotel');
}
hotelLoad();

// ─── OUTLETS STATE (declared early to avoid TDZ errors) ───
let outletSubTab = 'cronograma';
let currentOutletDay = 0;
const SHOPPING_KEY = 'outlets-shopping-list';
const shopCats = [
  { id:'remeras',       icon:'shirt', title:'Remeras / T-Shirts' },
  { id:'pantalones',    icon:'pants', title:'Pantalones / Jeans' },
  { id:'ropa-deportiva',icon:'dumbbell', title:'Ropa Deportiva' },
  { id:'calzado',       icon:'footprints', title:'Calzado / Zapatillas' },
  { id:'accesorios',    icon:'backpack', title:'Accesorios / Bolsos' },
  { id:'varios',        icon:'bag', title:'Varios' },
];
let shopItems = [];
let shopChecked = new Set();
let shopEditingItem = null;
let shopOpenSections = new Set(['remeras','calzado']);
let shopListTab = 'need'; // 'need' | 'noneed'

// Versión del FORMATO con que se guarda 'days' en Firebase. Ya no hay datos de
// ejemplo en el código con los que reconciliar, así que no se usa para migrar.
const DAYS_VERSION = 5;

// El cronograma de Outlets arranca VACÍO para todos los perfiles: cada perfil
// arma el suyo (o lo trae de Firebase / de un backup importado).
const days = [];

const STORAGE_KEY = 'outlets-orlando-visited-v2';
const DAYS_KEY = 'outlets-orlando-days-v2';
const visited = []; // en paralelo a `days`: un Set de paradas visitadas por día
let stopEditingIdx = null; // { dayIdx, stopIdx } or null
let stopAddingDay = null;  // dayIdx or null

function saveState() {
  const visitedArr = visited.map(s => [...s]);
  syncedSave(STORAGE_KEY, visitedArr, 'visited', { visited: visitedArr });
  syncedSave(DAYS_KEY, days, 'days', { days: days, v: DAYS_VERSION });
}

// Rellena `visited` para que tenga un Set por cada día. Con trim=true además
// descarta los que sobren (solo al cargar/importar: en los listeners en tiempo
// real 'days' y 'visited' llegan en orden indeterminado, así que ahí no se recorta).
function syncVisitedLength(trim) {
  while (visited.length < days.length) visited.push(new Set());
  if (trim && visited.length > days.length) visited.length = days.length;
}

function loadState() {
  const savedDays = syncedLoad(DAYS_KEY, window._daysFromFb);
  days.length = 0;
  if (Array.isArray(savedDays)) savedDays.forEach(d => days.push(d));

  const savedVisited = syncedLoad(STORAGE_KEY, window._visitedFromFb);
  visited.length = 0;
  if (Array.isArray(savedVisited)) savedVisited.forEach(arr => visited.push(new Set(Array.isArray(arr) ? arr : [])));
  syncVisitedLength(true);
  if (currentOutletDay >= days.length) currentOutletDay = 0;
}

function totalDone() {
  return visited.reduce((acc, s) => acc + s.size, 0);
}
function totalAll() {
  return days.reduce((acc, d) => acc + d.stops.length, 0);
}

function hardRefresh() {
  const btn = document.getElementById('refresh-btn');
  if (btn) { btn.classList.add('spinning'); setTimeout(() => btn.classList.remove('spinning'), 500); }
  // Force reload bypassing cache
  window.location.reload(true);
}

function updateGlobal() {
  const done = totalDone();
  const all = totalAll();
  document.getElementById('global-counter').textContent = done + ' / ' + all;
}

function launchConfetti() {
  const wrap = document.getElementById('confetti-wrap');
  wrap.innerHTML = '';
  const colors = ['#2563eb','#7c3aed','#10b981','#f0ede8','#e87bba'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random()*100}%;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      width: ${4 + Math.random()*8}px;
      height: ${4 + Math.random()*8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random()*2}s;
      animation-delay: ${Math.random()*0.5}s;
    `;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function toggleStop(dayIdx, stopIdx) {
  if (visited[dayIdx].has(stopIdx)) {
    visited[dayIdx].delete(stopIdx);
  } else {
    visited[dayIdx].add(stopIdx);
    const day = days[dayIdx];
    if (visited[dayIdx].size === day.stops.length) {
      setTimeout(launchConfetti, 200);
    }
  }
  saveState();
  renderOutlets();
  updateGlobal();
}

async function resetDay(d) {
  const dayLabel = ['Día 1','Día 2','Día 3'][d] || `Día ${d+1}`;
  const ok = await showConfirm(`Se van a desmarcar todas las paradas de ${dayLabel}.`, '¿Reiniciar día?', 'Reiniciar', true);
  if (!ok) return;
  visited[d].clear();
  saveState();
  renderOutlets();
  updateGlobal();
}




// App init - called after Firebase data is loaded
window._appInit = function() {
  hotelLoad();
  loadState();
  mealLoad();
  wmLoad();
  shopLoad();
  customParksLoad();
  parquesExcelLoad();
  parquesExcelApply();
  extraZonesLoad();
  coordOverridesLoad();
  parquesLoad();
  itinLoad();
  tipsLoad();
  budgetLoad();
  renderOutlets();
  updateGlobal();
  renderTodayCard();
  loadArsRate();
  loadWeatherForecast();
  // Expose globals for realtime listeners
  window.visited = visited;
  window.days = days;
  window.hotel = hotel;
  window.wmChecked = wmChecked;
  window.renderOutlets = renderOutlets;
  window.renderComidas = renderComidas;
  window.renderWalmart = renderWalmart;
  window.renderParques = renderParques;
  window.updateGlobal = updateGlobal;
  window.renderTodayCard = renderTodayCard;
  window._appInited = true;
  // Patch fbSet to show sync dot feedback
  patchFbSyncDot();

  // Shortcuts del manifest (mantener presionado el ícono de la app):
  // abren directo en la sección pedida (ej. ?section=walmart).
  try {
    const params = new URLSearchParams(location.search);
    const sec = params.get('section');
    const OK = ['outlets','comidas','walmart','parques'];
    let back = null;
    try { back = sessionStorage.getItem('orl_section'); } catch(e) {}
    if (sec && OK.includes(sec)) switchSection(sec);
    else if (back && OK.includes(back) && back !== 'outlets') switchSection(back);
  } catch(e) {}
};

// If Firebase already ready (unlikely but safe), init now
if (window._fbReady) {
  window._appInit();
} // else Firebase module will call _appInit after loading

// ─── COMIDAS ───────────────────────────────────────────────
const MEAL_KEY = 'orlando-meals-v1';
function mealSave() {
  syncedSave(MEAL_KEY, mealData, 'meals', { meals: mealData });
}
function mealLoad() {
  const d = syncedLoad(MEAL_KEY, window._mealsFromFb);
  if (d) mealData = d;
}

window._setMealData = function(d) { mealData = d; };
let mealData = [];
const mealNames = ["Desayuno","Almuerzo","Cena"];
const typeConf = {
  disney:    { label:"Disney",    cls:"mbadge-disney",    icon:"castle" },
  universal: { label:"Universal", cls:"mbadge-universal", icon:"clapper" },
  free:      { label:"Libre",     cls:"mbadge-free",      icon:null },
  arrival:   { label:"Llegada",   cls:"mbadge-arrival",   icon:"plane" },
  walmart:   { label:"Walmart",   cls:"mbadge-walmart",   icon:"cart" },
};

function renderComidas() {
  const panel = document.getElementById('panel-comidas');
  let html = '<div class="comidas-panel">';
  if (mealData.length === 0) {
    html += `<div class="all-done" style="display:block">
        <div class="all-done-emoji">${ic('calendar',44)}</div>
        <div class="all-done-title">Sin días cargados</div>
        <div class="all-done-sub">Agregá el primer día del viaje con el botón + para armar tu plan de comidas.</div>
      </div>`;
  }
  mealData.forEach(day => {
    const tc = typeConf[day.type];
    // Parse date to split number and month
    const dateParts = day.date.split(' ');
    const dateNum = dateParts[0] || day.date;
    const dateMon = dateParts[1] || '';
    // Meal preview dots
    const dots = day.meals.map(m =>
      `<span class="meal-dot${m && m !== '—' ? ' filled' : ''}"></span>`
    ).join('');
    // Meal rows
    const mealsHtml = day.meals.map((m, i) =>
      `<div class="meal-row-item" id="mcell-${day.id}-${i}" onclick="editMealCell(${day.id},${i})">
        <span class="meal-row-label">${mealNames[i]}</span>
        <span class="meal-row-text${(!m || m === '—') ? ' empty' : ''}" id="mtext-${day.id}-${i}">${(!m || m === '—') ? 'Sin planificar' : escapeHtml(m)}</span>
        <span class="meal-row-edit-icon">${ic('pencil',13)}</span>
      </div>`
    ).join('');
    // Snack chips
    const snackChips = day.snacks.map((s,si) =>
      `<span class="snack-chip">${escapeHtml(s)}<button class="snack-chip-rm" onclick="removeSnackM(${day.id},${si})">×</button></span>`
    ).join('');
    html += `
      <div class="day-meal-card" id="mcard-${day.id}">
        <div class="day-meal-header" onclick="toggleMealCard(${day.id})">
          <div class="meal-date-pill">
            <span class="meal-date-num">${dateNum}</span>
            <span class="meal-date-mon">${dateMon}</span>
          </div>
          <div class="meal-header-center">
            <div class="meal-day-title">${day.title}</div>
            <span class="meal-day-badge ${tc.cls}">${tc.icon ? ic(tc.icon, 11) : ''}${tc.label}</span>
          </div>
          <div class="meal-preview">${dots}</div>
          <span class="meal-chevron">${ic('chevronDown',14)}</span>
        </div>
        <div class="day-meal-body">
          <div class="meals-stack">${mealsHtml}</div>
          <div class="meal-extras">
            <div class="snacks-row" id="msnacks-${day.id}">
              <div class="snacks-row-label">${ic('backpack',11)} Mochila / Snacks</div>
              <div class="snack-chips" id="msnack-list-${day.id}">
                ${snackChips}
                <button class="snack-chip-add" onclick="showSnackInputM(${day.id})">+ agregar</button>
              </div>
              <div class="snack-inline-input" id="msnack-input-${day.id}" style="display:none">
                <input class="snack-field" type="text" id="msnack-field-${day.id}" placeholder="ej: Granola bar"
                  onkeydown="if(event.key==='Enter')addSnackM(${day.id})">
                <button class="mbtn msave" onclick="addSnackM(${day.id})">OK</button>
                <button class="mbtn" onclick="hideSnackInputM(${day.id})">${ic('x',14)}</button>
              </div>
            </div>
            ${day.notes || true ? `<textarea class="notes-ta" placeholder="Notas del día..." rows="2"
              onchange="saveMealNotes(${day.id},this.value)">${escapeHtml(day.notes)}</textarea>` : ''}
            <div class="del-day-row">
              <button class="mbtn mdel" onclick="deleteMealDay(${day.id})">Eliminar día</button>
            </div>
          </div>
        </div>
      </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
  renderTodayCard();
}

function toggleMealCard(id) {
  document.getElementById('mcard-'+id).classList.toggle('open');
}

function editMealCell(dayId, idx) {
  const row = document.getElementById(`mcell-${dayId}-${idx}`);
  if (row.classList.contains('editing')) return;
  // Close any other open editor
  document.querySelectorAll('.meal-row-item.editing').forEach(r => {
    const [,dId,i] = r.id.split('-');
    cancelMealCell(Number(dId), Number(i));
  });
  const current = mealData.find(d=>d.id===dayId).meals[idx];
  row.classList.add('editing');
  row.onclick = null;
  row.innerHTML = `
    <span class="meal-row-label">${mealNames[idx]}</span>
    <div style="flex:1;display:flex;flex-direction:column;gap:6px">
      <textarea class="meal-cell-textarea" id="mta-${dayId}-${idx}" placeholder="¿Qué van a comer?">${current === '—' ? '' : escapeHtml(current)}</textarea>
      <div class="meal-edit-actions">
        <button class="mbtn" onclick="cancelMealCell(${dayId},${idx})">Cancelar</button>
        <button class="mbtn msave" onclick="saveMealCell(${dayId},${idx})">Guardar</button>
      </div>
    </div>`;
  document.getElementById(`mta-${dayId}-${idx}`).focus();
}

function saveMealCell(dayId, idx) {
  const ta = document.getElementById(`mta-${dayId}-${idx}`);
  const val = ta.value.trim() || '—';
  mealData.find(d=>d.id===dayId).meals[idx] = val;
  mealSave();
  showMToast('Guardado ✓');
  // Re-render just this row
  const row = document.getElementById(`mcell-${dayId}-${idx}`);
  row.classList.remove('editing');
  row.onclick = () => editMealCell(dayId, idx);
  row.innerHTML = `
    <span class="meal-row-label">${mealNames[idx]}</span>
    <span class="meal-row-text${val === '—' ? ' empty' : ''}" id="mtext-${dayId}-${idx}">${val === '—' ? 'Sin planificar' : escapeHtml(val)}</span>
    <span class="meal-row-edit-icon">${ic('pencil',13)}</span>`;
}

function cancelMealCell(dayId, idx) {
  const current = mealData.find(d=>d.id===dayId).meals[idx];
  const row = document.getElementById(`mcell-${dayId}-${idx}`);
  if (!row) return;
  row.classList.remove('editing');
  row.onclick = () => editMealCell(dayId, idx);
  row.innerHTML = `
    <span class="meal-row-label">${mealNames[idx]}</span>
    <span class="meal-row-text${(!current || current === '—') ? ' empty' : ''}" id="mtext-${dayId}-${idx}">${(!current || current === '—') ? 'Sin planificar' : escapeHtml(current)}</span>
    <span class="meal-row-edit-icon">${ic('pencil',13)}</span>`;
}

function showSnackInputM(id) {
  document.getElementById(`msnack-input-${id}`).style.display = 'flex';
  document.getElementById(`msnack-field-${id}`).focus();
}
function hideSnackInputM(id) {
  document.getElementById(`msnack-input-${id}`).style.display = 'none';
  document.getElementById(`msnack-field-${id}`).value = '';
}
function addSnackM(id) {
  const f = document.getElementById(`msnack-field-${id}`);
  const val = f.value.trim();
  if (!val) return;
  mealData.find(d=>d.id===id).snacks.push(val);
  rerenderSnacksM(id);
  hideSnackInputM(id);
  mealSave();
  showMToast('Snack agregado ✓');
}
function removeSnackM(id, si) {
  mealData.find(d=>d.id===id).snacks.splice(si,1);
  mealSave();
  rerenderSnacksM(id);
}
function rerenderSnacksM(id) {
  const day = mealData.find(d=>d.id===id);
  const chips = day.snacks.map((s,si) =>
    `<span class="snack-chip">${escapeHtml(s)}<button class="snack-chip-rm" onclick="removeSnackM(${id},${si})">×</button></span>`
  ).join('');
  document.getElementById(`msnack-list-${id}`).innerHTML =
    chips + `<button class="snack-chip-add" onclick="showSnackInputM(${id})">+ agregar</button>`;
}
function saveMealNotes(id, val) {
  mealData.find(d=>d.id===id).notes = val;
  mealSave();
}
async function deleteMealDay(id) {
  const ok = await showConfirm('¿Eliminar este día del plan de comidas?', '¿Eliminar día?', 'Eliminar');
  if (!ok) return;
  mealData = mealData.filter(d=>d.id!==id);
  mealSave();
  renderComidas();
  showMToast('Día eliminado');
}
function openMealModal() { document.getElementById('mealModal').classList.add('open'); }
function closeMealModal() {
  document.getElementById('mealModal').classList.remove('open');
  ['mDate','mTitle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
    const err = document.getElementById(id + '-err');
    if (err) err.classList.remove('show');
  });
}
function addMealDay() {
  const date = document.getElementById('mDate').value.trim();
  const title = document.getElementById('mTitle').value.trim();
  let hasError = false;
  ['mDate','mTitle'].forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(id + '-err');
    if (!el.value.trim()) {
      el.classList.add('error');
      if (err) err.classList.add('show');
      hasError = true;
    } else {
      el.classList.remove('error');
      if (err) err.classList.remove('show');
    }
  });
  if (hasError) return;
  const newId = Date.now();
  mealData.push({
    id: newId,
    date, title,
    type: document.getElementById('mType').value,
    meals: [
      document.getElementById('mBreakfast').value.trim() || '—',
      document.getElementById('mLunch').value.trim() || '—',
      document.getElementById('mDinner').value.trim() || '—',
    ],
    snacks: [], notes: ''
  });
  mealSave();
  renderComidas();
  closeMealModal();
  ['mDate','mTitle','mBreakfast','mLunch','mDinner'].forEach(id=>document.getElementById(id).value='');
  showMToast('Día agregado ✓');
  setTimeout(()=>{ document.getElementById('mcard-'+newId)?.scrollIntoView({behavior:'smooth',block:'center'}); },100);
}

function openHotelEdit() {
  document.getElementById('hotelEditModal').classList.add('open');
  document.getElementById('hotel-edit-addr').value = hotel.addr;
  document.getElementById('hotel-edit-url').value = hotel.url;
  setTimeout(() => document.getElementById('hotel-edit-addr').focus(), 50);
}
function closeHotelEdit() { document.getElementById('hotelEditModal').classList.remove('open'); }
function saveHotelEdit() {
  const addr = document.getElementById('hotel-edit-addr').value.trim();
  if (!addr) return;
  hotel.addr = addr;
  hotel.url = document.getElementById('hotel-edit-url').value.trim() || hotel.url;
  hotelSave();
  closeHotelEdit();
  renderOutlets();
  showMToast('Dirección guardada ✓');
}

let _toastEl = null;
function showMToast(msg) {
  if (!_toastEl) _toastEl = document.getElementById('mtoast');
  if (!_toastEl) return;
  _toastEl.textContent = msg;
  _toastEl.classList.add('show');
  clearTimeout(_toastEl._timer);
  _toastEl._timer = setTimeout(() => _toastEl.classList.remove('show'), 2000);
}

// ─── DESHACER (en vez de pedir confirmación antes de borrar) ───────
// Los borrados de un solo ítem (parada, producto, prenda, cosa de la
// valija) se ejecutan al toque y ofrecen 4s para deshacer, en vez de
// interrumpir con un modal de confirmación antes de borrar.
let _undoTimer = null;
let _undoAction = null;
function showUndoToast(message, undoFn) {
  if (_undoTimer) { clearTimeout(_undoTimer); _undoTimer = null; }
  _undoAction = undoFn;
  const el = document.getElementById('undoToast');
  if (!el) return;
  el.querySelector('.undo-toast-msg').textContent = message;
  el.classList.add('show');
  _undoTimer = setTimeout(() => { el.classList.remove('show'); _undoAction = null; }, 4000);
}
function undoLastAction() {
  if (_undoTimer) { clearTimeout(_undoTimer); _undoTimer = null; }
  const el = document.getElementById('undoToast');
  if (el) el.classList.remove('show');
  const action = _undoAction;
  _undoAction = null;
  if (action) action();
}

// ─── SYNC DOT ────────────────────────────────────────────────
let _syncTimer = null;
function syncDotState(state) {
  const dot = document.getElementById('sync-dot');
  if (!dot) return;
  dot.className = 'sync-dot' + (state ? ' ' + state : '');
  if (state === 'saved') {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => { dot.className = 'sync-dot'; }, 2500);
  }
}

// Wrap fbSet to show sync feedback — called after _appInit when window._fb is guaranteed to exist
function patchFbSyncDot() {
  if (!window._fb) return;
  const orig = window._fb.fbSet;
  window._fb.fbSet = async function(docId, data) {
    syncDotState('saving');
    try {
      await orig(docId, data);
      syncDotState('saved');
    } catch(e) {
      syncDotState('error');
      devError('fbSet error', e);
    }
  };
}

// ─── CUSTOM CONFIRM / ALERT ──────────────────────────────────
let _confirmResolve = null;
function showConfirm(msg, title = '¿Confirmar?', okLabel = 'Eliminar', safe = false) {
  return new Promise(resolve => {
    _confirmResolve = resolve;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent = msg;
    const okBtn = document.getElementById('confirmOk');
    okBtn.textContent = okLabel;
    okBtn.className = 'confirm-btn-ok' + (safe ? ' safe' : '');
    document.getElementById('confirmOverlay').classList.add('open');
    okBtn.onclick = () => { document.getElementById('confirmOverlay').classList.remove('open'); resolve(true); };
    document.getElementById('confirmCancel').onclick = () => { document.getElementById('confirmOverlay').classList.remove('open'); resolve(false); };
  });
}
function showAlert(msg, title = 'Atención') {
  return new Promise(resolve => {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMsg').textContent = msg;
    document.getElementById('alertOverlay').classList.add('open');
    document.getElementById('alertOk').onclick = () => { closeAlert(); resolve(); };
  });
}
function closeAlert() {
  document.getElementById('alertOverlay').classList.remove('open');
}

// ─── CACHE COMPARTIDO CON TAXFLY (mismo dominio → mismo localStorage) ──
// Taxfly y Maps le pegan a las mismas APIs (Open-Meteo, dolarapi.com) por
// separado. Como comparten origen, guardamos la respuesta CRUDA de cada
// API bajo una key común: quien la pida primero "calienta" el cache para
// la otra app, y cada una sigue procesando esos datos crudos a su manera
// (Taxfly muestra sensación térmica/humedad/viento que acá no usamos, y
// viceversa con el pronóstico extendido). No se comparte el resultado ya
// procesado, para no romper campos que una app necesita y la otra no pide.
function sharedCacheGet(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || (Date.now() - c.ts) > ttlMs) return null;
    return c.data;
  } catch(e) { return null; }
}
function sharedCacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch(e) {}
}

// ─── CLIMA (Open-Meteo) ───────────────────────────────────────
// Portado de Taxfly (tax.html) — misma fuente, gratis y sin API key.
// Se cachea 30 min en localStorage para no golpear la API de más.
const WEATHER_CITY = 'Orlando, FL';
const WEATHER_KEY = 'orlando-weather-cache-v1';
const WMO = {
  0:'Despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Nublado',
  45:'Niebla',48:'Niebla con escarcha',
  51:'Llovizna leve',53:'Llovizna',55:'Llovizna intensa',
  61:'Lluvia leve',63:'Lluvia',65:'Lluvia intensa',
  71:'Nieve leve',73:'Nieve',75:'Nieve intensa',
  80:'Chubascos leves',81:'Chubascos',82:'Chubascos fuertes',
  95:'Tormenta',96:'Tormenta con granizo',99:'Tormenta fuerte'
};
const WI = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',
  95:'⛈️',96:'⛈️',99:'🌪️'
};
let weatherCache = localLoad(WEATHER_KEY) || { data: null, ts: 0 };
let _cityGeo = null;
async function geocodeWeatherCity() {
  if (_cityGeo) return _cityGeo;
  const cacheKey = 'shared-geo-cache::' + WEATHER_CITY.trim().toLowerCase();
  const cached = sharedCacheGet(cacheKey, 90 * 24 * 3600000); // 90 días: la ubicación de una ciudad no cambia
  if (cached) { _cityGeo = cached; return _cityGeo; }
  try {
    const geoRes = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(WEATHER_CITY) + '&count=1&language=es&format=json');
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results.length) return null;
    _cityGeo = { latitude: geoData.results[0].latitude, longitude: geoData.results[0].longitude };
    sharedCacheSet(cacheKey, _cityGeo);
    return _cityGeo;
  } catch(e) { devError('geocode error', e); return null; }
}

async function fetchWeatherForToday(force) {
  const now = Date.now();
  if (!force && weatherCache.data && (now - weatherCache.ts) < 1800000) return weatherCache.data;
  try {
    const geo = await geocodeWeatherCity();
    if (!geo) return weatherCache.data || null;
    // Mismo set de parámetros "current" que pide Taxfly, para que la
    // respuesta cruda sirva para las dos apps (acá solo usamos temp+code,
    // Taxfly además muestra sensación térmica, humedad y viento).
    const sharedKey = 'shared-weather-current::' + geo.latitude.toFixed(2) + ',' + geo.longitude.toFixed(2);
    let c = sharedCacheGet(sharedKey, 1800000);
    if (!c) {
      const wRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + geo.latitude + '&longitude=' + geo.longitude +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m' +
        '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto');
      const wData = await wRes.json();
      c = wData.current;
      sharedCacheSet(sharedKey, c);
    }
    const result = { tempF: Math.round(c.temperature_2m), tempC: Math.round((c.temperature_2m - 32) * 5/9), code: c.weather_code };
    weatherCache = { data: result, ts: now };
    try { localStorage.setItem(WEATHER_KEY, JSON.stringify(weatherCache)); } catch(e) {}
    return result;
  } catch(e) { devError('weather fetch error', e); return weatherCache.data || null; }
}

// Pronóstico extendido (hasta 16 días, límite gratis de Open-Meteo): para
// que cada pestaña de día del cronograma de Outlets muestre qué clima
// espera, y ayude a decidir qué día conviene para exteriores. Taxfly no
// tiene esta funcionalidad, así que no hay nada que compartir acá.
const FORECAST_KEY = 'orlando-forecast-cache-v1';
let weatherForecast = localLoad(FORECAST_KEY) || { data: null, ts: 0 };
async function fetchWeatherForecast(force) {
  const now = Date.now();
  if (!force && weatherForecast.data && (now - weatherForecast.ts) < 3 * 3600000) return weatherForecast.data;
  try {
    const geo = await geocodeWeatherCity();
    if (!geo) return weatherForecast.data || null;
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + geo.latitude + '&longitude=' + geo.longitude +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=16');
    const data = await res.json();
    const daily = data.daily || {};
    const days = (daily.time || []).map((date, i) => ({
      date,
      code: daily.weather_code[i],
      tmaxF: Math.round(daily.temperature_2m_max[i]),
      tminF: Math.round(daily.temperature_2m_min[i]),
    }));
    weatherForecast = { data: days, ts: now };
    try { localStorage.setItem(FORECAST_KEY, JSON.stringify(weatherForecast)); } catch(e) {}
    return days;
  } catch(e) { devError('forecast fetch error', e); return weatherForecast.data || null; }
}
// Busca, dentro del pronóstico ya bajado, el día cuyo mes/día calendario
// coincide con una fecha del cronograma (ej. "Lun 25/01" o "25 ene").
function forecastForTripDate(dateStr) {
  const p = parseTripDayDate(dateStr);
  if (!p || !weatherForecast.data) return null;
  return weatherForecast.data.find(f => {
    const d = new Date(f.date + 'T00:00:00');
    return d.getDate() === p.d && (d.getMonth() + 1) === p.mo;
  }) || null;
}
async function loadWeatherForecast(force) {
  await fetchWeatherForecast(force);
  if (document.getElementById('panel-outlets')?.classList.contains('active')) renderOutlets();
}

// ─── COTIZACIÓN USD → ARS (dolarapi.com) ──────────────────────
// Portado de Taxfly (compras.html). Usa el dólar OFICIAL (no el
// "tarjeta"), que es la referencia habitual para presupuestar un viaje;
// si por algo no viene en la respuesta, cae al tarjeta como backup.
const FX_KEY = 'orlando-fx-cache-v1';
const SHARED_FX_KEY = 'shared-dolarapi-raw-v1';
let fxCache = localLoad(FX_KEY) || { rate: null, label: '', ts: 0 };
let currentArsRate = fxCache.rate || null;
let currentArsLabel = fxCache.label || '';

async function fetchArsRate(force) {
  const now = Date.now();
  if (!force && fxCache.rate && (now - fxCache.ts) < 3600000) return fxCache;
  try {
    // Payload crudo de dolarapi.com compartido con Taxfly: si Taxfly ya
    // lo pidió hace menos de 1h, lo reusamos en vez de pegarle de nuevo.
    let d = sharedCacheGet(SHARED_FX_KEY, 3600000);
    if (!d) {
      const r = await fetch('https://dolarapi.com/v1/dolares');
      d = await r.json();
      sharedCacheSet(SHARED_FX_KEY, d);
    }
    const oficial = d.find(x => x.casa === 'oficial');
    const tarjeta = d.find(x => x.casa === 'tarjeta');
    const pick = oficial || tarjeta;
    if (pick && pick.venta) {
      fxCache = { rate: pick.venta, label: pick===oficial ? 'oficial' : 'tarjeta', ts: now };
      try { localStorage.setItem(FX_KEY, JSON.stringify(fxCache)); } catch(e) {}
    }
    return fxCache;
  } catch(e) { devError('fx fetch error', e); return fxCache; }
}
function fmtArs(n) { return Math.round(n).toLocaleString('es-AR'); }
async function loadArsRate(force) {
  const fx = await fetchArsRate(force);
  currentArsRate = fx.rate || null;
  currentArsLabel = fx.label || '';
  if (document.getElementById('panel-walmart')?.classList.contains('active')) renderWalmart();
}
function wmRefreshFx(e) { e && e.stopPropagation(); loadArsRate(true); }

// ─── HOY: mini card con el día del itinerario + clima ─────────
// Reutiliza mealData (el cronograma maestro: fecha + tipo + comidas) para
// mostrar de un vistazo qué toca hoy, sin tener que buscarlo entre tabs.
// Aparece en el header de las 4 secciones (Outlets, Comidas, Market,
// Parques) — no solo en Outlets.
const MONTHS_ES = { ene:1, feb:2, mar:3, abr:4, may:5, jun:6, jul:7, ago:8, sep:9, oct:10, nov:11, dic:12 };
function parseTripDayDate(str) {
  if (!str) return null;
  let m = String(str).match(/(\d{1,2})\/(\d{1,2})/);
  if (m) return { d: +m[1], mo: +m[2] };
  m = String(str).toLowerCase().match(/(\d{1,2})\s*([a-záéíóúñ]{3,})/i);
  if (m) {
    const mon = MONTHS_ES[m[2].slice(0,3)];
    if (mon) return { d: +m[1], mo: mon };
  }
  return null;
}
function findTodayMealDay() {
  if (typeof mealData === 'undefined' || !mealData) return null;
  const now = new Date();
  const td = now.getDate(), tm = now.getMonth() + 1;
  return mealData.find(d => { const p = parseTripDayDate(d.date); return p && p.d === td && p.mo === tm; }) || null;
}
// Si hoy no es ninguno de los días del viaje (lo más común: todavía falta
// para viajar), calculamos la próxima fecha en la que cae el primer día
// del cronograma, tomando el año actual o el que viene si ya pasó.
function nextOccurrence(mo, d) {
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let candidate = new Date(now.getFullYear(), mo - 1, d);
  if (candidate < today0) candidate = new Date(now.getFullYear() + 1, mo - 1, d);
  return candidate;
}
function daysUntilTrip() {
  if (typeof mealData === 'undefined' || !mealData || !mealData.length) return null;
  const first = mealData[0];
  const p = parseTripDayDate(first.date);
  if (!p) return null;
  const target = nextOccurrence(p.mo, p.d);
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const days = Math.round((target - today0) / 86400000);
  return { days, title: first.title, dateLabel: first.date };
}
function renderTodayCard() {
  const slot = document.getElementById('today-card-slot');
  const chip = document.getElementById('trip-chip-slot');
  if (!slot) return;
  const day = findTodayMealDay();
  if (!day) {
    const countdown = daysUntilTrip();
    if (!countdown || countdown.days <= 0) { slot.style.display = 'none'; slot.innerHTML = ''; if (chip) chip.innerHTML = ''; return; }
    slot.style.display = 'none'; slot.innerHTML = '';
    if (chip) {
      chip.innerHTML = `<span class="trip-chip" title="${escapeHtml(countdown.title)} · ${escapeHtml(countdown.dateLabel)}">${ic('plane', 14)}<b>${countdown.days}</b> día${countdown.days === 1 ? '' : 's'}</span>`;
    }
    return;
  }
  if (chip) chip.innerHTML = '';
  const meta = (typeof typeConf !== 'undefined' && typeConf[day.type]) || { icon: 'calendar' };
  const mealsLine = (day.meals || []).filter(m => m && m !== '—').slice(0, 2).join(' · ');
  slot.style.display = 'flex';
  slot.innerHTML = `
    <div class="today-card">
      <span class="today-card-badge">HOY</span>
      <span class="today-card-icon">${ic(meta.icon || 'calendar', 15)}</span>
      <div class="today-card-body">
        <div class="today-card-title">${escapeHtml(day.title)}</div>
        ${mealsLine ? `<div class="today-card-sub">${escapeHtml(mealsLine)}</div>` : ''}
      </div>
      <span class="today-card-weather" id="today-card-weather">···</span>
    </div>`;
  fetchWeatherForToday().then(w => {
    const wEl = document.getElementById('today-card-weather');
    if (!wEl) return;
    if (!w) { wEl.textContent = ''; return; }
    wEl.innerHTML = `${WI[w.code] || '🌡️'} ${w.tempF}°F`;
    wEl.title = (WMO[w.code] || '') + ' · ' + w.tempC + '°C';
  });
}

// ─── PRESUPUESTO DEL VIAJE (compartido con Taxfly) ─────────────
// UNA sola cuenta para las dos apps, todo en USD:
//   restante = presupuesto (Taxfly) − gastos cargados en Taxfly
//                                   − gastos manuales cargados acá
//                                   − estimado del Market (solo si se activa)
// El presupuesto total vive en el perfil de Taxfly (campo `presupuesto`);
// acá se muestra y se puede editar, pero es el MISMO número. Los gastos de
// Taxfly llegan en vivo (solo lectura). Los gastos manuales de Orlando
// (Outlets/Comidas/Parques/Otros) viven en orlando/budget y Taxfly también
// los descuenta.
//
// Sin doble conteo: el checklist del Market es un ESTIMADO (suma de los
// ítems tildados), no un ticket real. Como el súper se suele cargar en
// Taxfly con el lector de tickets, por defecto NO se descuenta (se muestra
// como dato informativo). Si el súper se va a cargar solo acá, se activa
// "Descontar estimado del Market" y ahí sí cuenta (Taxfly lo respeta: el
// flag `countMarket` viaja en el mismo doc).
const BUDGET_KEY = 'orlando-budget-v1';
const TFX_KEY = 'orlando-taxfly-budget-v1';
function budgetDefaults() { return { total: 0, gastos: [], countMarket: false }; }
let budgetData = Object.assign(budgetDefaults(), localLoad(BUDGET_KEY) || {});
// Espejo de lo que hay en Taxfly (presupuesto + suma de gastos), con cache
// local para que la píldora se vea al toque y sin señal.
let tfx = Object.assign({ presupuesto: 0, gastos: 0, gastosN: 0 }, localLoad(TFX_KEY) || {});
let _tfxPresLoaded = false;
let budgetEditingTotal = false;
let budgetAddingCat = null;
function budgetLoad() {
  const d = syncedLoad(BUDGET_KEY, window._budgetFromFb);
  if (d) budgetData = Object.assign(budgetDefaults(), d);
  const t = localLoad(TFX_KEY);
  if (t) tfx = Object.assign({ presupuesto: 0, gastos: 0, gastosN: 0 }, t);
  if (!Array.isArray(budgetData.gastos)) budgetData.gastos = [];
  budgetRenderAll();
}
function budgetSave() {
  // walmartSpent va siempre con el valor actual del checklist, para no
  // pisar el número que Taxfly lee con uno viejo.
  budgetData.walmartSpent = wmTotalChecked();
  syncedSave(BUDGET_KEY, budgetData, 'budget', budgetData);
}
window._setBudgetData = function(d) {
  budgetData = Object.assign(budgetDefaults(), d);
  if (!Array.isArray(budgetData.gastos)) budgetData.gastos = [];
};
window._setTaxflyBudget = function(p) {
  Object.assign(tfx, p);
  try { localStorage.setItem(scopedKey(TFX_KEY), JSON.stringify(tfx)); } catch(e) {}
  if ('presupuesto' in p && !_tfxPresLoaded) {
    _tfxPresLoaded = true;
    budgetMigrateLegacyTotal();
  }
  budgetRenderAll();
};
// Antes Orlando tenía su propio "total". Si Taxfly todavía no tiene
// presupuesto, lo subimos ahí (una sola vez); si ya tiene, manda Taxfly.
function budgetMigrateLegacyTotal() {
  const legacy = parseFloat(budgetData.total) || 0;
  if (legacy <= 0) return;
  const clearLegacy = () => { budgetData.total = 0; budgetSave(); };
  if (tfx.presupuesto > 0) { clearLegacy(); return; }
  if (!(window._fb && window._fb.fbSetPresupuesto)) return;
  tfx.presupuesto = legacy;
  window._fb.fbSetPresupuesto(legacy).then(ok => {
    if (ok) clearLegacy(); else { tfx.presupuesto = 0; budgetRenderAll(); }
  });
}

const budgetCatMeta = {
  outlets: { label: 'Outlets', icon: 'bag' },
  comidas: { label: 'Comidas', icon: 'utensils' },
  parques: { label: 'Parques', icon: 'ferris' },
  otros:   { label: 'Otros',   icon: 'backpack' },
};
function budgetUsd(n) {
  return '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function budgetManualTotal() { return budgetData.gastos.reduce((s, g) => s + (g.monto || 0), 0); }
function budgetMarketEstimate() { return wmTotalChecked(); }
function budgetMarketCounted() { return budgetData.countMarket ? budgetMarketEstimate() : 0; }
function budgetSpentTotal() { return (tfx.gastos || 0) + budgetManualTotal() + budgetMarketCounted(); }
function budgetRemaining() { return (tfx.presupuesto || 0) - budgetSpentTotal(); }

function budgetEditTotal() {
  budgetEditingTotal = true;
  renderBudgetBox();
  setTimeout(() => document.getElementById('budget-total-input')?.focus(), 30);
}
function budgetSetTotal() {
  const input = document.getElementById('budget-total-input');
  const v = parseFloat(input?.value);
  if (isNaN(v) || v <= 0) { input?.classList.add('error'); return; }
  tfx.presupuesto = v;
  try { localStorage.setItem(scopedKey(TFX_KEY), JSON.stringify(tfx)); } catch(e) {}
  window._fb && window._fb.fbSetPresupuesto && window._fb.fbSetPresupuesto(v);
  budgetEditingTotal = false;
  budgetRenderAll();
}
function budgetToggleMarket() {
  budgetData.countMarket = !budgetData.countMarket;
  budgetSave();
  budgetRenderAll();
}
function budgetOpenAdd(cat) {
  budgetAddingCat = cat;
  renderBudgetBox();
  setTimeout(() => document.getElementById('budget-add-amount')?.focus(), 30);
}
function budgetCancelAdd() { budgetAddingCat = null; renderBudgetBox(); }
function budgetConfirmAdd() {
  const amountEl = document.getElementById('budget-add-amount');
  const noteEl = document.getElementById('budget-add-note');
  const amount = parseFloat(amountEl?.value);
  if (isNaN(amount) || amount <= 0) { amountEl?.classList.add('error'); return; }
  budgetData.gastos.push({ id: 'g' + Date.now(), cat: budgetAddingCat, monto: amount, nota: (noteEl?.value || '').trim() });
  budgetAddingCat = null;
  budgetSave();
  budgetRenderAll();
}
function budgetDeleteGasto(id) {
  budgetData.gastos = budgetData.gastos.filter(g => g.id !== id);
  budgetSave();
  budgetRenderAll();
}

// Píldora del header (las 4 secciones): "Presupuesto restante $X".
function renderBudgetPill() {
  const slot = document.getElementById('budget-pill-slot');
  if (!slot) return;
  const base = tfx.presupuesto || 0;
  let cls = 'budget-pill', label, val = '';
  if (base <= 0) {
    cls += ' empty';
    label = 'Definir presupuesto';
  } else {
    const rem = budgetRemaining();
    if (rem < 0) { cls += ' over'; label = 'Excedido'; }
    else {
      label = 'restante';
      if (rem / base < 0.2) cls += ' low';
    }
    val = budgetUsd(Math.abs(rem));
  }
  slot.innerHTML = `<button type="button" class="${cls}" onclick="openBudgetFromPill()" title="Ver detalle del presupuesto">
    <span class="budget-pill-icon">${ic('wallet', 15)}</span>
    ${cls.includes('over') ? `<span class="budget-pill-label">${label}</span><span class="budget-pill-val">${val}</span>` : `${val ? `<span class="budget-pill-val">${val}</span>` : ''}<span class="budget-pill-label">${label}</span>`}
  </button>`;
}
function openBudgetFromPill() {
  if (typeof openSettingsDrawer === 'function') openSettingsDrawer();
  setTimeout(() => {
    try { document.getElementById('budget-box')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch(e) {}
  }, 60);
}
window.openBudgetFromPill = openBudgetFromPill;

function renderBudgetBox() {
  const box = document.getElementById('budget-box');
  if (!box) return;
  const base = tfx.presupuesto || 0;
  const hasTotal = base > 0 && !budgetEditingTotal;

  if (!hasTotal) {
    box.innerHTML = `
      <div class="budget-set-row">
        <input type="number" min="0" step="1" id="budget-total-input" class="wm-edit-input" placeholder="Presupuesto total (USD)" value="${base || ''}" oninput="this.classList.remove('error')">
        <button class="mbtn msave" onclick="budgetSetTotal()">Guardar</button>
      </div>
      <div class="budget-note">Es el mismo presupuesto que en Taxfly: si lo cargás acá, ya queda cargado allá.</div>`;
    return;
  }

  const spent = budgetSpentTotal();
  const remaining = base - spent;
  const pct = Math.min(100, Math.max(0, Math.round(spent / base * 100)));
  const manual = budgetManualTotal();
  const wmEst = budgetMarketEstimate();
  const counted = !!budgetData.countMarket;

  let gastosHtml = '';
  budgetData.gastos.forEach(g => {
    const meta = budgetCatMeta[g.cat] || budgetCatMeta.otros;
    gastosHtml += `
      <div class="budget-gasto-row">
        <span class="budget-gasto-cat">${ic(meta.icon,13)} ${meta.label}${g.nota ? ' · ' + escapeHtml(g.nota) : ''}</span>
        <span class="budget-gasto-monto">${budgetUsd(g.monto)}
          <button class="wm-icon-btn wm-icon-del" onclick="budgetDeleteGasto('${g.id}')" title="Eliminar" aria-label="Eliminar gasto">${ic('x',14)}</button>
        </span>
      </div>`;
  });

  let addForm;
  if (budgetAddingCat) {
    const meta = budgetCatMeta[budgetAddingCat];
    addForm = `
      <div class="wm-edit-form" style="margin-top:8px" onclick="event.stopPropagation()">
        <div style="font-size:12px;font-weight:700;margin-bottom:6px;color:var(--accent);display:flex;align-items:center;gap:6px">${ic(meta.icon,13)} Nuevo gasto — ${meta.label}</div>
        <div class="budget-edit-row">
          <input type="number" min="0" step="0.01" id="budget-add-amount" class="wm-edit-input" placeholder="$ monto" oninput="this.classList.remove('error')">
          <input type="text" id="budget-add-note" class="wm-edit-input" placeholder="Nota (opcional)">
        </div>
        <div class="wm-edit-actions">
          <button class="mbtn" onclick="budgetCancelAdd()">Cancelar</button>
          <button class="mbtn msave" onclick="budgetConfirmAdd()">Agregar</button>
        </div>
      </div>`;
  } else {
    addForm = `
      <div class="budget-add-cats">
        ${Object.keys(budgetCatMeta).map(cat => `<button class="budget-add-cat-btn" onclick="budgetOpenAdd('${cat}')">${ic(budgetCatMeta[cat].icon,13)} ${budgetCatMeta[cat].label}</button>`).join('')}
      </div>`;
  }

  box.innerHTML = `
    <div class="budget-summary">
      <div class="budget-summary-row">
        <span>Presupuesto</span>
        <span class="budget-summary-val">${budgetUsd(base)} <button class="wm-icon-btn" onclick="budgetEditTotal()" title="Editar" aria-label="Editar presupuesto">${ic('pencil',12)}</button></span>
      </div>
      <div class="budget-summary-row budget-summary-sub">
        <span>Gastado en Taxfly${tfx.gastosN ? ' (' + tfx.gastosN + ')' : ''}</span>
        <span class="budget-summary-val">${budgetUsd(tfx.gastos)}</span>
      </div>
      <div class="budget-summary-row budget-summary-sub">
        <span>Gastado en Orlando</span>
        <span class="budget-summary-val">${budgetUsd(manual)}</span>
      </div>
      ${counted ? `<div class="budget-summary-row budget-summary-sub">
        <span>Market (estimado)</span>
        <span class="budget-summary-val">${budgetUsd(wmEst)}</span>
      </div>` : ''}
      <div class="budget-summary-row budget-summary-remaining${remaining<0?' negative':''}">
        <span>${remaining>=0?'Restante':'Excedido'}</span>
        <span class="budget-summary-val">${budgetUsd(Math.abs(remaining))}</span>
      </div>
      <div class="wm-progress-bar-bg"><div class="wm-progress-bar-fill" style="width:${pct}%;${pct>=100?'background:#ef4444':''}"></div></div>
    </div>
    <div class="budget-gastos-list">${gastosHtml || '<div class="budget-empty">Sin gastos cargados acá todavía.</div>'}</div>
    ${addForm}
    <label class="budget-market-toggle">
      <input type="checkbox" ${counted ? 'checked' : ''} onchange="budgetToggleMarket()">
      <span>
        <b>Descontar estimado del Market</b> (${budgetUsd(wmEst)})
        <small>${counted
          ? 'Activado: usalo solo si el súper NO lo cargás en Taxfly, si no se cuenta dos veces.'
          : 'Apagado: se asume que el súper se carga en Taxfly (ticket). Así no se cuenta dos veces.'}</small>
      </span>
    </label>
    <div class="budget-note">Compartido con Taxfly: lo que cargues allá se descuenta acá, y los gastos de esta lista también se descuentan en Taxfly. Todo en USD.</div>`;
}
window.renderBudgetBox = renderBudgetBox;
function budgetRenderAll() { renderBudgetPill(); renderBudgetBox(); }
window.budgetRefresh = budgetRenderAll;

// ─── Unificación con TaxUSA/Taxfly ─────────────────────────────
// Taxfly lee este mismo doc 'budget' para sumar los gastos manuales de
// Orlando a su total. Además de los gastos manuales, mandamos el estimado
// actual del Market (`walmartSpent`) y el flag `countMarket`: Taxfly solo
// suma el estimado si `countMarket` está activo (ver arriba, sin doble
// conteo). merge:true no pisa el resto del doc. Con debounce para no
// escribir en cada tecla si el usuario edita rápido.
let _wmSpentSyncTimer = null;
function syncWalmartSpentForTaxfly() {
  budgetRenderAll(); // la píldora/detalle se actualizan al toque, sin esperar la red
  clearTimeout(_wmSpentSyncTimer);
  _wmSpentSyncTimer = setTimeout(() => {
    const spent = wmTotalChecked();
    budgetData.walmartSpent = spent;
    window._fb && window._fb.fbSet('budget', { walmartSpent: spent });
  }, 800);
}


// listener se registra al final del script, después de que el DOM esté listo
window.addEventListener('DOMContentLoaded', function(){
  document.getElementById('mealModal').addEventListener('click', function(e){
    if(e.target===this) closeMealModal();
  });
  document.getElementById('wmAddModal').addEventListener('click', function(e){
    if(e.target===this) wmCloseAddModal();
  });
  document.getElementById('hotelEditModal').addEventListener('click', function(e){
    if(e.target===this) closeHotelEdit();
  });
  document.getElementById('sizeGuideModal').addEventListener('click', function(e){
    if(e.target===this) closeSizeGuide();
  });
  // Pintar Outlets con los datos locales de entrada, sin esperar a Firebase
  // (antes solo se renderizaba cuando llegaba la respuesta de Firebase).
  renderOutlets();
});

// ─── WALMART ───────────────────────────────────────────────
const WM_DATA_KEY = 'walmart-orlando-data-v2';
const WM_CHECKED_KEY = 'walmart-orlando-checked-v2';
const WM_OPEN_KEY = 'walmart-orlando-open-v2';

const wmCatMeta = {
  pan:       { icon:'bread', title:'Panadería y Snacks' },
  lacteos:   { icon:'egg', title:'Lácteos y Huevos' },
  carnes:    { icon:'drumstick', title:'Carnes y Fiambres' },
  secos:     { icon:'can', title:'Secos y Enlatados' },
  congelados:{ icon:'snowflake', title:'Congelados' },
  desayuno:  { icon:'coffee', title:'Desayuno y Bebidas' },
  extras:    { icon:'backpack', title:'Extras' },
};

window._setWmData = function(d) { wmData = d; };
window._setShopData = function(d) {
  if (d.items !== undefined) shopItems = d.items;
  if (d.checked !== undefined) shopChecked = new Set(d.checked);
};
window._setCustomParksData = function(items) {
  customParks = items || [];
  customParks.forEach(p => { if (p.color) PARK_COLORS[p.id] = p.color; });
};
window._setExtraZonesData = function(zones) {
  extraZones = zones || {};
  extraZonesApply();
};
window._setCoordOverridesData = function(overrides) { coordOverrides = overrides || {}; };
window._setParquesExcelData = function(data) {
  parquesExcelData = data || {};
  parquesExcelApply();
};
let wmData = [];

let wmChecked = new Set();
let wmOpenSections = new Set(Object.keys(wmCatMeta));
let wmEditingItem = null; // { catId, itemId } or null

function wmSave() {
  syncedSave(WM_DATA_KEY, wmData, 'walmart', { data: wmData });
  syncedSave(WM_CHECKED_KEY, [...wmChecked], 'wmChecked', { checked: [...wmChecked] });
  // wmOpenSections es solo de UI local, no se sincroniza con Firebase.
  try { localStorage.setItem(scopedKey(WM_OPEN_KEY), JSON.stringify([...wmOpenSections])); } catch(e){}
}

function wmLoad() {
  const d = syncedLoad(WM_DATA_KEY, window._wmDataFromFb);
  if (d) wmData = d;

  const c = syncedLoad(WM_CHECKED_KEY, window._wmCheckedFromFb);
  if (c) c.forEach(k => wmChecked.add(k));

  const o = localLoad(WM_OPEN_KEY);
  if (o) { wmOpenSections.clear(); o.forEach(k => wmOpenSections.add(k)); }
}

function wmGetCat(catId) { return wmData.find(c => c.id === catId); }
function wmGetItem(catId, itemId) { return wmGetCat(catId)?.items.find(i => i.id === itemId); }

function wmItemPrice(item) { return (item.qty || 1) * (item.price || 0); }

function wmTotalAll() { return wmData.reduce((a,c) => a + c.items.reduce((b,i) => b + wmItemPrice(i), 0), 0); }
function wmTotalChecked() {
  let t = 0;
  wmData.forEach(cat => cat.items.forEach(item => {
    if (wmChecked.has(item.id)) t += wmItemPrice(item);
  }));
  return t;
}
function wmCountAll() { return wmData.reduce((a,c) => a + c.items.length, 0); }

function wmToggle(itemId, e) {
  e.stopPropagation();
  if (wmChecked.has(itemId)) wmChecked.delete(itemId);
  else wmChecked.add(itemId);
  wmSave();
  renderWalmart();
}

function wmToggleSection(catId) {
  if (wmOpenSections.has(catId)) wmOpenSections.delete(catId);
  else wmOpenSections.add(catId);
  wmSave();
  renderWalmart();
}

function wmDeleteItem(catId, itemId, e) {
  e.stopPropagation();
  const cat = wmGetCat(catId);
  const idx = cat.items.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const [removed] = cat.items.splice(idx, 1);
  const wasChecked = wmChecked.has(itemId);
  wmChecked.delete(itemId);
  wmSave();
  renderWalmart();
  showUndoToast(`"${removed.name}" eliminado`, () => {
    cat.items.splice(idx, 0, removed);
    if (wasChecked) wmChecked.add(itemId);
    wmSave();
    renderWalmart();
  });
}

function wmStartEdit(catId, itemId, e) {
  e.stopPropagation();
  wmEditingItem = { catId, itemId };
  renderWalmart();
  setTimeout(() => document.getElementById('wm-edit-name')?.focus(), 50);
}

function wmCancelEdit() {
  wmEditingItem = null;
  renderWalmart();
}

function wmSaveEdit() {
  const { catId, itemId } = wmEditingItem;
  const item = wmGetItem(catId, itemId);
  const name = document.getElementById('wm-edit-name').value.trim();
  const qty  = parseFloat(document.getElementById('wm-edit-qty').value) || 1;
  const unit = document.getElementById('wm-edit-unit').value.trim();
  const price= parseFloat(document.getElementById('wm-edit-price').value) || 0;
  if (!name) return;
  item.name  = name;
  item.qty   = qty;
  item.unit  = unit;
  item.price = price;
  wmEditingItem = null;
  wmSave();
  renderWalmart();
  showMToast('Guardado ✓');
}

function wmOpenAddModal() {
  document.getElementById('wmAddModal').classList.add('open');
  document.getElementById('wm-add-name').focus();
}
function wmCloseAddModal() {
  document.getElementById('wmAddModal').classList.remove('open');
  ['wm-add-name','wm-add-qty','wm-add-unit','wm-add-price'].forEach(id => {
    document.getElementById(id).value = '';
  });
}
function wmAddItem() {
  const name  = document.getElementById('wm-add-name').value.trim();
  const catId = document.getElementById('wm-add-cat').value;
  const qty   = parseFloat(document.getElementById('wm-add-qty').value) || 1;
  const unit  = document.getElementById('wm-add-unit').value.trim() || '';
  const price = parseFloat(document.getElementById('wm-add-price').value) || 0;
  if (!name) {
    const el = document.getElementById('wm-add-name');
    el.classList.add('error');
    document.getElementById('wm-add-name-err').classList.add('show');
    el.focus();
    return;
  }
  let cat = wmGetCat(catId);
  if (!cat) {
    // Perfil nuevo: wmData arranca vacío, la categoría se crea al agregar el primer producto.
    cat = { id: catId, items: [] };
    wmData.push(cat);
    const order = Object.keys(wmCatMeta);
    wmData.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  const newId = 'custom-' + Date.now();
  cat.items.push({ id: newId, name, qty, unit, price });
  wmOpenSections.add(catId);
  wmSave();
  renderWalmart();
  wmCloseAddModal();
  showMToast('Producto agregado ✓');
}

async function wmReset() {
  const ok = await showConfirm('Se van a desmarcar todos los productos del carrito.', '¿Reiniciar checks?', 'Reiniciar', true);
  if (!ok) return;
  wmChecked.clear();
  wmSave();
  renderWalmart();
}

function renderWalmart() {
  const panel = document.getElementById('panel-walmart');
  const total = wmCountAll();
  const checked = wmChecked.size;
  const pct = total > 0 ? Math.round(checked / total * 100) : 0;
  const totalAll = wmTotalAll().toFixed(2);
  const totalChk = wmTotalChecked().toFixed(2);

  let html = '<div class="wm-panel">';

  html += `
    <div class="wm-summary-bar">
      <div class="wm-stat"><div class="wm-stat-val">${checked}</div><div class="wm-stat-lbl">en carrito</div></div>
      <div class="wm-stat"><div class="wm-stat-val">${total - checked}</div><div class="wm-stat-lbl">pendientes</div></div>
      <div class="wm-stat"><div class="wm-stat-val">${pct}%</div><div class="wm-stat-lbl">listo</div></div>
    </div>
    <div class="wm-total-bar">
      <span class="wm-total-label">Total del carrito</span>
      <span class="wm-total-val">$${totalChk} <span style="font-size:12px;color:var(--muted);font-weight:400;">/ $${totalAll}</span></span>
    </div>
    ${currentArsRate ? `
    <div class="wm-total-bar wm-total-bar-ars" onclick="wmRefreshFx(event)" title="Tocar para actualizar cotización">
      <span class="wm-total-label">≈ pesos <span class="wm-fx-badge">$${fmtArs(currentArsRate)} ${currentArsLabel === 'oficial' ? 'oficial' : currentArsLabel}</span></span>
      <span class="wm-total-val wm-total-val-ars">$${fmtArs(wmTotalChecked()*currentArsRate)} <span style="font-size:12px;color:var(--muted);font-weight:400;">/ $${fmtArs(wmTotalAll()*currentArsRate)}</span></span>
    </div>` : `<div class="wm-fx-loading">Cotización USD→ARS: buscando…</div>`}
    <div class="wm-progress-bar-bg">
      <div class="wm-progress-bar-fill" style="width:${pct}%"></div>
    </div>`;

  wmData.forEach(cat => {
    const meta = wmCatMeta[cat.id] || { icon:'📦', title: cat.id };
    const catDone = cat.items.filter(i => wmChecked.has(i.id)).length;
    const isOpen = wmOpenSections.has(cat.id);
    const isEditing = wmEditingItem?.catId === cat.id;

    html += `
      <div class="wm-section ${isOpen?'open':''}" id="wmsec-${cat.id}">
        <div class="wm-section-header" onclick="wmToggleSection('${cat.id}')">
          <span class="wm-section-icon">${ic(meta.icon,16)}</span>
          <span class="wm-section-title">${meta.title}</span>
          <span class="wm-section-count">${catDone}/${cat.items.length}</span>
          <span class="wm-section-chevron">${ic('chevronDown',14)}</span>
        </div>
        <div class="wm-items">`;

    cat.items.forEach(item => {
      const isChecked = wmChecked.has(item.id);
      const isEditingThis = wmEditingItem?.catId === cat.id && wmEditingItem?.itemId === item.id;
      const lineTotal = (wmItemPrice(item)).toFixed(2);

      if (isEditingThis) {
        html += `
          <div class="wm-item wm-item-editing" onclick="event.stopPropagation()">
            <div class="wm-edit-form">
              <input class="wm-edit-input wm-edit-name" id="wm-edit-name" placeholder="Nombre del producto" value="${escapeHtml(item.name)}">
              <div class="wm-edit-row">
                <input class="wm-edit-input wm-edit-small" id="wm-edit-qty" type="number" min="0.1" step="0.1" placeholder="Cant." value="${item.qty}">
                <input class="wm-edit-input wm-edit-unit" id="wm-edit-unit" placeholder="Unidad (oz, lb, caja…)" value="${escapeHtml(item.unit)}">
                <input class="wm-edit-input wm-edit-small" id="wm-edit-price" type="number" min="0" step="0.01" placeholder="$ c/u" value="${item.price}">
              </div>
              <div class="wm-edit-hint">Precio unitario. Total = cantidad × precio.</div>
              <div class="wm-edit-actions">
                <button class="mbtn" onclick="wmCancelEdit()">Cancelar</button>
                <button class="mbtn msave" onclick="wmSaveEdit()">Guardar</button>
              </div>
            </div>
          </div>`;
      } else {
        html += `
          <div class="wm-item ${isChecked?'checked':''}" onclick="wmToggle('${item.id}', event)">
            <div class="wm-check">${isChecked?'✓':''}</div>
            <div class="wm-item-body">
              <div class="wm-item-name">${escapeHtml(item.name)}</div>
              <div class="wm-item-detail">${item.qty} ${escapeHtml(item.unit)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
              <div class="wm-item-price">$${lineTotal}</div>
              <button class="wm-icon-btn" onclick="wmStartEdit('${cat.id}','${item.id}',event)" title="Editar" aria-label="Editar ${escapeHtml(item.name)}">${ic('pencil',13)}</button>
              <button class="wm-icon-btn wm-icon-del" onclick="wmDeleteItem('${cat.id}','${item.id}',event)" title="Eliminar" aria-label="Eliminar ${escapeHtml(item.name)}">${ic('x',14)}</button>
            </div>
          </div>`;
      }
    });

    html += `</div></div>`;
  });

  html += `
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:center">
      <button class="wm-reset-btn" onclick="wmOpenAddModal()">+ Agregar producto</button>
      <button class="wm-reset-btn" onclick="wmReset()">↺ Reiniciar checks</button>
    </div>`;
  html += '</div>';
  panel.innerHTML = html;
  syncWalmartSpentForTaxfly();
}

// Update switchSection to handle 3 main sections
const sectionMeta = {
  outlets: {
    title: 'Outlets',
    accent: 'Orlando',
    subtitle: 'Cronograma de compras',
    theme: 'theme-outlets'
  },
  comidas: {
    title: 'Orlando',
    accent: 'Meal Planning',
    subtitle: 'Planificación de comidas',
    theme: 'theme-comidas'
  },
  walmart: {
    title: 'Orlando',
    accent: 'Market',
    subtitle: 'Lista de compras',
    theme: 'theme-walmart'
  },
  parques: {
    title: 'Orlando',
    accent: 'Theme Parks',
    subtitle: 'Tracker de atracciones',
    theme: 'theme-parques'
  }
};

function switchSection(section) {
  // Recuerda la sección para volver donde estabas al ir a "Mis cosas de viaje" y regresar.
  try { sessionStorage.setItem('orl_section', section); } catch(e) {}
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

  document.getElementById('panel-' + section).classList.add('active');
  document.getElementById('nav-' + section).classList.add('active');

  // Update header title & theme
  const meta = sectionMeta[section];
  document.getElementById('main-title').innerHTML = meta.title + ' <span class="ht-accent">' + meta.accent + '</span>';
  document.getElementById('main-subtitle').textContent = meta.subtitle;
  { const gc = document.getElementById('global-counter'); if (gc) gc.style.display = (section === 'outlets' || section === 'parques') ? '' : 'none'; }
  document.body.className = meta.theme;

  document.getElementById('addDayFab').style.display = section === 'comidas' ? 'block' : 'none';

  if (section === 'comidas') renderComidas();
  if (section === 'walmart') renderWalmart();
  if (section === 'outlets') renderOutlets();
  if (section === 'parques') renderParques();

  // Update global counter label for parques
  if (section === 'parques') {
    updateParquesCounter();
  } else {
    updateGlobal();
  }

  window.scrollTo({top:0,behavior:'smooth'});
}

// ─── OUTLETS ───────────────────────────────────────────────

function shopSave() {
  const payload = { items: shopItems, checked: [...shopChecked] };
  syncedSave(SHOPPING_KEY, payload, 'shopping', payload);
}
function shopLoad() {
  const fbValue = (window._shopFromFb && window._shopFromFb.items) ? window._shopFromFb : undefined;
  const d = syncedLoad(SHOPPING_KEY, fbValue);
  shopItems = d?.items || [];
  shopChecked = new Set(d?.checked || []);
}
function shopGetItem(id) { return shopItems.find(i => i.id === id); }

let _outletsFirstRender = true;

function renderOutlets() {
  // shopLoad() removido de acá — solo se carga al init para no pisar cambios en memoria
  const panel = document.getElementById('panel-outlets');

  let html = `<div class="outlets-panel">
    <div class="outlets-subtabs">
      <button class="outlets-stab${outletSubTab==='cronograma'?' active':''}" onclick="switchOutletTab('cronograma')">${ic('calendar',13)} Cronograma</button>
      <button class="outlets-stab${outletSubTab==='lista'?' active':''}" onclick="switchOutletTab('lista')">${ic('shirt',13)} Compras</button>
    </div>`;

  if (outletSubTab === 'cronograma') {
    if (currentOutletDay >= days.length) currentOutletDay = Math.max(0, days.length - 1);
    const currentDay = currentOutletDay;
    if (days.length === 0) {
      html += `<div class="all-done" style="display:block">
        <div class="all-done-emoji">${ic('calendar',44)}</div>
        <div class="all-done-title">Sin días cargados</div>
        <div class="all-done-sub">Agregá el primer día del cronograma para empezar.</div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:14px">
        <button class="wm-reset-btn" onclick="openOutletDayModal()">+ Agregar día</button>
      </div>`;
    } else {
      html += `<div class="outlets-day-tabs">
        ${days.map((d,i) => {
          const fc = forecastForTripDate(d.date);
          const wBadge = fc ? `<span class="odt-weather" title="${escapeHtml(WMO[fc.code]||'')} · mín ${fc.tminF}°F">${WI[fc.code]||'🌡️'} ${fc.tmaxF}°</span>` : '';
          return `<button class="outlets-day-tab${i===currentDay?' active':''}" onclick="switchOutletDay(${i})">${escapeHtml(d.dayName || ('Día ' + (i+1)))}<span class="odt-date">${escapeHtml(d.date || '')}${wBadge}</span></button>`;
        }).join('')}
        <button class="btn-nav-set" style="margin-left:2px" onclick="openOutletDayModal()" title="Agregar día">+</button>
      </div>`;
      html += `<div class="outlets-day-content">`;
      html += renderDayContent(currentDay);
      html += `</div>`;
    }
    html += `<div style="margin-top:16px">${renderTips()}</div>`;
  } else {
    // Shopping list
    html += renderShopList();
  }

  html += `</div>`;
  panel.innerHTML = html;

  // Init map after DOM is ready
  if (outletSubTab === 'cronograma' && days.length > 0) {
    const currentDay = typeof currentOutletDay !== 'undefined' ? currentOutletDay : 0;
    setTimeout(() => initDayMap(currentDay), 100);
  }

  // Apply slideIn animation only on the first render
  if (_outletsFirstRender) {
    _outletsFirstRender = false;
    panel.querySelectorAll('.stop-card').forEach((card, i) => {
      card.style.animation = `slideIn .3s ease both`;
      card.style.animationDelay = `${i * 0.04}s`;
    });
  }
}


function switchOutletTab(tab) {
  outletSubTab = tab;
  renderOutlets();
}

function switchOutletDay(d) {
  currentOutletDay = d;
  renderOutlets();
}

function openOutletDayModal() {
  ['outlet-day-date','outlet-day-name','outlet-day-label'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
    el.classList.remove('error');
    const err = document.getElementById(id + '-err');
    if (err) err.classList.remove('show');
  });
  document.getElementById('outlet-day-name').value = 'Día ' + (days.length + 1);
  document.getElementById('outletDayModal').classList.add('open');
}
function closeOutletDayModal() {
  document.getElementById('outletDayModal').classList.remove('open');
}
function addOutletDay() {
  const dateEl = document.getElementById('outlet-day-date');
  const date = dateEl.value.trim();
  if (!date) {
    dateEl.classList.add('error');
    document.getElementById('outlet-day-date-err').classList.add('show');
    return;
  }
  const dayName = document.getElementById('outlet-day-name').value.trim() || ('Día ' + (days.length + 1));
  const label = document.getElementById('outlet-day-label').value.trim() || 'Sin descripción todavía';
  days.push({ dayName, date, label, stops: [] });
  visited.push(new Set());
  currentOutletDay = days.length - 1;
  saveState();
  closeOutletDayModal();
  renderOutlets();
  updateGlobal();
  showMToast('Día agregado');
}
// Mover un día del cronograma de outlets. `visited` va en paralelo a
// `days`, así que se mueve el mismo índice en las dos listas.
function outletMoveDay(idx, dir) {
  const j = idx + dir;
  if (j < 0 || j >= days.length) return;
  [days[idx], days[j]] = [days[j], days[idx]];
  [visited[idx], visited[j]] = [visited[j], visited[idx]];
  currentOutletDay = j;
  saveState();
  renderOutlets();
  updateGlobal();
}

function outletDeleteDay(idx) {
  if (!days[idx]) return;
  const [removedDay] = days.splice(idx, 1);
  const [removedVisited] = visited.splice(idx, 1);
  if (currentOutletDay >= days.length) currentOutletDay = days.length - 1;
  saveState();
  renderOutlets();
  updateGlobal();
  showUndoToast(`Día "${removedDay.dayName || removedDay.date}" eliminado`, () => {
    days.splice(idx, 0, removedDay);
    visited.splice(idx, 0, removedVisited);
    currentOutletDay = idx;
    saveState();
    renderOutlets();
    updateGlobal();
  });
}

function renderDayContent(d) {
  const day = days[d];
  const total = day.stops.length;
  const done = visited[d].size;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const allDone = done === total && total > 0;

  let html = `
    <div class="hotel-bar" id="hotel-bar-${d}">
      <a href="${hotel.url}" style="display:flex;align-items:center;gap:10px;flex:1;text-decoration:none;min-width:0" onclick="event.stopPropagation()">
        <div class="hotel-icon">${ic('home',16)}</div>
        <div class="hotel-info">
          <div class="hotel-label">Punto de partida</div>
          <div class="hotel-addr">${hotel.addr ? escapeHtml(hotel.addr) : 'Sin definir — tocá el lápiz para agregarlo'}</div>
        </div>
        <div class="hotel-arrow">↗</div>
      </a>
      <button class="wm-icon-btn" onclick="openHotelEdit()" title="Editar dirección" aria-label="Editar punto de partida" style="flex-shrink:0;opacity:0.5">${ic('pencil',13)}</button>
    </div>`;

  // Editable day label
  if (stopEditingIdx?.dayIdx === d && stopEditingIdx?.stopIdx === 'label') {
    html += `<div style="margin-bottom:14px">
      <input id="stop-edit-label" class="wm-edit-input" style="width:100%;margin-bottom:6px" value="${escapeHtml(day.label)}">
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="mbtn" onclick="stopCancelEdit()">Cancelar</button>
        <button class="mbtn msave" onclick="stopSaveDayLabel(${d})">Guardar</button>
      </div>
    </div>`;
  } else {
    html += `<div class="day-label" style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <span style="flex:1">${escapeHtml(day.label)}</span>
      <button class="wm-icon-btn" onclick="stopStartEditLabel(${d});event.stopPropagation()" title="Editar descripción del día" style="flex-shrink:0">${ic('pencil',13)}</button>
    </div>`;
  }

  html += `<div class="progress-wrap">
      <div class="progress-meta">
        <div class="progress-stats">
          <div class="stat"><div class="stat-val ${done>0?'accent':''}">${done}</div><div class="stat-lbl">visitadas</div></div>
          <div class="stat"><div class="stat-val">${total}</div><div class="stat-lbl">paradas</div></div>
          <div class="stat"><div class="stat-val ${pct===100?'accent':''}">${pct}%</div><div class="stat-lbl">completado</div></div>
        </div>
        <button class="reset-btn" onclick="resetDay(${d})">↺ reiniciar</button>
      </div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>`;

  if (allDone) {
    html += `<div class="all-done" style="display:block">
      <div class="all-done-emoji">${ic('sparkles',44)}</div>
      <div class="all-done-title">¡Día completado!</div>
      <div class="all-done-sub">Visitaste las ${total} paradas del día.</div>
    </div>`;
  }

  day.stops.forEach((s, i) => {
    const isV = visited[d].has(i);
    const isEditingThis = stopEditingIdx?.dayIdx === d && stopEditingIdx?.stopIdx === i;

    if (isEditingThis) {
      const badgeVal = s.badge || '';
      const badgeText = escapeHtml(s.badgeText || '');
      html += `
        <div class="stop-card" onclick="event.stopPropagation()" style="cursor:default;flex-direction:column;align-items:stretch">
          <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;margin-bottom:10px;color:var(--accent);display:flex;align-items:center;gap:6px">${ic('pencil',13)} Editar parada</div>
          <div class="wm-edit-form" style="width:100%">
            <input class="wm-edit-input" id="stop-edit-name" placeholder="Nombre del lugar" value="${escapeHtml(s.name)}" style="margin-bottom:6px;width:100%">
            <textarea class="wm-edit-input" id="stop-edit-desc" placeholder="Descripción (horarios, tips…)" style="margin-bottom:6px;width:100%;min-height:56px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4">${s.desc}</textarea>
            <input class="wm-edit-input" id="stop-edit-url" placeholder="URL de Google Maps" value="${escapeHtml(s.url||'')}" style="margin-bottom:6px;width:100%">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
              <select class="wm-edit-input" id="stop-edit-badge">
                <option value=""${badgeVal===''?' selected':''}>Sin badge</option>
                <option value="star"${badgeVal==='star'?' selected':''}>⭐ Imperdible</option>
                <option value="rec"${badgeVal==='rec'?' selected':''}>✅ Recomendado</option>
              </select>
              <input class="wm-edit-input" id="stop-edit-badgetext" placeholder="Texto badge (ej: N°1)" value="${badgeText}">
            </div>
            <div class="wm-edit-actions">
              <button class="mbtn" onclick="stopCancelEdit()">Cancelar</button>
              <button class="mbtn msave" onclick="stopSaveEdit(${d},${i})">Guardar</button>
            </div>
          </div>
        </div>`;
    } else {
      let badge = '';
      if (s.badge === 'star') badge = `<span class="badge badge-star">${escapeHtml(s.badgeText)}</span>`;
      if (s.badge === 'rec')  badge = `<span class="badge badge-rec">${escapeHtml(s.badgeText)}</span>`;
      html += `
        <div class="stop-card${isV?' visited':''}" draggable="true"
          ondragstart="stopDragStart(${d},${i},event)"
          ondragover="stopDragOver(${d},${i},event)"
          ondragend="stopDragEnd(event)"
          ondrop="stopDrop(${d},${i},event)"
          onclick="toggleStop(${d},${i})">
          <div class="stop-drag-handle" onclick="event.stopPropagation()" ondragstart="event.stopPropagation()" title="Arrastrar para reordenar" aria-label="Arrastrar para reordenar" role="button">⠿</div>
          <div class="stop-num">${isV ? '✓' : i+1}</div>
          <div class="stop-body">
            <div class="stop-name">${escapeHtml(s.name)}</div>
            <div class="stop-desc">${escapeHtml(s.desc)}</div>
            <div class="stop-footer">
              <div class="badges">${badge}</div>
              <div class="stop-footer-actions">
                <button class="wm-icon-btn stop-action-btn" onclick="stopMoveUp(${d},${i},event)" title="Subir" aria-label="Mover parada arriba" ${i===0?'style="opacity:0.25;pointer-events:none"':''}>${ic('chevronUp',14)}</button>
                <button class="wm-icon-btn stop-action-btn" onclick="stopMoveDown(${d},${i},event)" title="Bajar" aria-label="Mover parada abajo" ${i===day.stops.length-1?'style="opacity:0.25;pointer-events:none"':''}>${ic('chevronDown',14)}</button>
                ${s.url && /^https?:\/\//i.test(s.url) ? `<a class="maps-btn" href="${escapeHtml(s.url)}" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  Maps
                </a>` : ''}
                <button class="wm-icon-btn stop-action-btn" onclick="stopStartEdit(${d},${i});event.stopPropagation()" title="Editar parada" aria-label="Editar ${escapeHtml(s.name)}">${ic('pencil',14)}</button>
                <button class="wm-icon-btn wm-icon-del stop-action-btn" onclick="stopDelete(${d},${i},event)" title="Eliminar parada" aria-label="Eliminar ${escapeHtml(s.name)}">${ic('x',14)}</button>
              </div>
            </div>
          </div>
        </div>`;
    }
  });

  // Add stop form or button
  if (stopAddingDay === d) {
    html += `
      <div class="stop-card" onclick="event.stopPropagation()" style="cursor:default;flex-direction:column;align-items:stretch">
        <div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;margin-bottom:10px;color:var(--green)">+ Nueva parada</div>
        <div class="wm-edit-form" style="width:100%">
          <input class="wm-edit-input" id="stop-add-name" placeholder="Nombre del lugar" style="margin-bottom:6px;width:100%">
          <textarea class="wm-edit-input" id="stop-add-desc" placeholder="Descripción (horarios, tips…)" style="margin-bottom:6px;width:100%;min-height:56px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4"></textarea>
          <input class="wm-edit-input" id="stop-add-url" placeholder="URL de Google Maps (opcional)" style="margin-bottom:6px;width:100%">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
            <select class="wm-edit-input" id="stop-add-badge">
              <option value="">Sin badge</option>
              <option value="star">⭐ Imperdible</option>
              <option value="rec">✅ Recomendado</option>
            </select>
            <input class="wm-edit-input" id="stop-add-badgetext" placeholder="Texto badge (ej: N°1)">
          </div>
          <div class="wm-edit-actions">
            <button class="mbtn" onclick="stopCancelAdd()">Cancelar</button>
            <button class="mbtn msave" onclick="stopAddConfirm(${d})">Agregar</button>
          </div>
        </div>
      </div>`;
  } else {
    html += `<button onclick="stopStartAdd(${d})" style="width:100%;padding:12px;border:1px dashed var(--border2);border-radius:var(--radius);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;margin-top:2px" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--muted)'">+ Agregar parada</button>`;
  }

  // ─── MAP ───────────────────────────────────────────────────
  const stopsWithCoords = day.stops.filter(s => s.lat && s.lng);
  if (stopsWithCoords.length > 0) {
    const canOptimize = stopsWithCoords.length === day.stops.length && stopsWithCoords.length >= 3;
    html += `
      <div class="day-map-wrap" style="margin-top:14px;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);">
        <div class="day-map-header" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;background:var(--surface);border-bottom:1px solid var(--border);">
          <div class="day-map-title">${ic('map',13)} Mapa del día · ${stopsWithCoords.length} paradas</div>
          ${canOptimize ? `<button class="mbtn" id="optimize-btn-${d}" onclick="optimizeDayOrder(${d})" title="Reordena las paradas para viajar menos entre ellas">↻ Optimizar orden</button>` : ''}
        </div>
        ${stopsWithCoords.length > 1 ? `<div class="day-route-info" id="day-route-info-${d}">Calculando ruta…</div>` : ''}
        <div id="day-map-container-${d}" class="day-map-container"></div>
      </div>`;
  }

  html += `<div class="del-day-row">
      ${days.length > 1 ? `<button class="mbtn" onclick="outletMoveDay(${d},-1)" ${d === 0 ? 'disabled' : ''} title="Mover el día hacia la izquierda">${ic('chevronLeft',13)} Mover</button>
      <button class="mbtn" onclick="outletMoveDay(${d},1)" ${d === days.length - 1 ? 'disabled' : ''} title="Mover el día hacia la derecha">Mover ${ic('chevronRight',13)}</button>` : ''}
      <button class="mbtn mdel" onclick="outletDeleteDay(${d})">Eliminar este día</button>
    </div>`;

  return html;
}

// ─── RUTEO ENTRE PARADAS (OSRM, servidor demo público y gratis) ─
// Le da valor real al cronograma de outlets: cuánto se tarda de una
// parada a la siguiente, no solo dónde están. Se cachea en memoria por
// combinación de coordenadas para no repetir el pedido en cada render.
let _routeCache = {};
function fmtDist(m) { return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(1) + ' km'; }
function fmtDur(s) {
  const min = Math.round(s / 60);
  return min < 60 ? min + ' min' : Math.floor(min / 60) + 'h ' + (min % 60) + 'min';
}
function applyRouteInfo(d, route) {
  const infoEl = document.getElementById('day-route-info-' + d);
  if (infoEl) {
    const legsHtml = (route.legs || []).map((leg, i) =>
      `<span class="route-leg-chip">${i+1}→${i+2} · ${fmtDur(leg.duration)} · ${fmtDist(leg.distance)}</span>`
    ).join('');
    infoEl.innerHTML = `
      <div class="route-total">${ic('pin',12)} ${fmtDur(route.duration)} · ${fmtDist(route.distance)} en auto (total)</div>
      <div class="route-legs">${legsHtml}</div>`;
  }
  if (_leafletMap && route.geometry) {
    L.geoJSON(route.geometry, { style: { color: '#2563eb', weight: 3, opacity: 0.55, dashArray: '2,7' } }).addTo(_leafletMap);
  }
}
async function fetchRouteInfo(d, stopsWithCoords) {
  const infoEl = document.getElementById('day-route-info-' + d);
  const key = stopsWithCoords.map(s => s.lat.toFixed(5) + ',' + s.lng.toFixed(5)).join(';');
  if (_routeCache[key]) { applyRouteInfo(d, _routeCache[key]); return; }
  try {
    const coordsStr = stopsWithCoords.map(s => s.lng + ',' + s.lat).join(';');
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
    const data = await res.json();
    if (!data.routes || !data.routes.length) { if (infoEl) infoEl.textContent = ''; return; }
    _routeCache[key] = data.routes[0];
    applyRouteInfo(d, data.routes[0]);
  } catch(e) { devError('route fetch error', e); if (infoEl) infoEl.textContent = ''; }
}

// Reordena las paradas del día para minimizar el tiempo de viaje total,
// usando el endpoint /trip de OSRM (el mismo servidor demo que ya usa el
// ruteo). Se fija la primera parada como punto de partida (source=first)
// y se deja libre el resto del orden. Solo disponible si TODAS las
// paradas del día tienen coordenadas cargadas.
async function optimizeDayOrder(d) {
  const day = days[d];
  const stopsWithCoords = day.stops.filter(s => s.lat && s.lng);
  if (stopsWithCoords.length !== day.stops.length || stopsWithCoords.length < 3) return;
  const btn = document.getElementById('optimize-btn-' + d);
  if (btn) { btn.disabled = true; btn.textContent = '↻ Optimizando…'; }
  try {
    const coordsStr = day.stops.map(s => s.lng + ',' + s.lat).join(';');
    const res = await fetch(`https://router.project-osrm.org/trip/v1/driving/${coordsStr}?source=first&roundtrip=false`);
    const data = await res.json();
    if (!data.waypoints || !data.trips || !data.trips.length) { showMToast('No se pudo optimizar la ruta'); return; }
    const order = data.waypoints
      .map((wp, originalIdx) => ({ originalIdx, seq: wp.waypoint_index }))
      .sort((a, b) => a.seq - b.seq)
      .map(x => x.originalIdx);
    // Remapear qué paradas estaban visitadas al nuevo orden, para no
    // "desmarcar" nada solo por haber reordenado la lista.
    const oldVisited = visited[d];
    const newVisited = new Set();
    order.forEach((oldIdx, newIdx) => { if (oldVisited.has(oldIdx)) newVisited.add(newIdx); });
    day.stops = order.map(i => day.stops[i]);
    visited[d] = newVisited;
    _routeCache = {}; // el orden cambió: invalidar la ruta cacheada
    saveState();
    showMToast('Orden optimizado ✓ — se acomodaron las paradas para viajar menos');
    renderOutlets();
  } catch(e) {
    devError('trip optimize error', e);
    showMToast('No se pudo optimizar la ruta (sin conexión a OSRM)');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '↻ Optimizar orden'; }
  }
}

// ─── MAP LOGIC ──────────────────────────────────────────────
let _leafletMap = null;

function initDayMap(d) {
  const container = document.getElementById(`day-map-container-${d}`);
  if (!container) return;

  // Destroy previous map instance
  if (_leafletMap) {
    _leafletMap.remove();
    _leafletMap = null;
  }
  container.innerHTML = '';

  const day = days[d];
  const stopsWithCoords = day.stops.filter(s => s.lat && s.lng);
  if (!stopsWithCoords.length) return;

  _leafletMap = L.map(container, { zoomControl: true, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(_leafletMap);

  const bounds = [];

  stopsWithCoords.forEach((s) => {
    const originalIdx = day.stops.indexOf(s);
    const isVisited = visited[d].has(originalIdx);
    const isStar = s.badge === 'star';
    const isRec = s.badge === 'rec';

    const color = isVisited ? '#555' : isStar ? '#2563eb' : isRec ? '#10b981' : '#7c3aed';
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};
        color:${isVisited?'#888':'#fff'};
        display:flex;align-items:center;justify-content:center;
        font-family:'DM Sans',sans-serif;font-weight:800;font-size:11px;
        border:2px solid ${isVisited?'#333':'rgba(255,255,255,0.25)'};
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
        opacity:${isVisited?'0.5':'1'};
      ">${originalIdx + 1}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });

    const badgeHtml = isStar ? `<span style="font-size:10px;color:#2563eb">⭐ Imperdible</span>` :
                      isRec  ? `<span style="font-size:10px;color:#10b981">✅ ${escapeHtml(s.badgeText)}</span>` : '';
    const visitedHtml = isVisited ? `<span style="font-size:10px;color:#10b981">✓ Visitado</span>` : '';

    L.marker([s.lat, s.lng], { icon })
      .bindPopup(`
        <div class="map-popup-name">${originalIdx + 1}. ${escapeHtml(s.name)}</div>
        <div class="map-popup-desc">${escapeHtml(s.desc)}</div>
        ${badgeHtml || visitedHtml ? `<div style="margin-top:5px;display:flex;gap:6px">${badgeHtml}${visitedHtml}</div>` : ''}
        ${s.url && /^https?:\/\//i.test(s.url) ? `<a href="${escapeHtml(s.url)}" target="_blank" style="display:inline-block;margin-top:7px;font-size:11px;color:#2563eb;text-decoration:none;font-family:'DM Sans',sans-serif;font-weight:600">↗ Abrir en Maps</a>` : ''}
      `, { maxWidth: 220 })
      .addTo(_leafletMap);

    bounds.push([s.lat, s.lng]);
  });

  _leafletMap.fitBounds(bounds, { padding: [28, 28] });
  setTimeout(() => _leafletMap && _leafletMap.invalidateSize(), 150);

  if (stopsWithCoords.length > 1) fetchRouteInfo(d, stopsWithCoords);
}
function stopStartEdit(dayIdx, stopIdx) {
  stopEditingIdx = { dayIdx, stopIdx };
  stopAddingDay = null;
  renderOutlets();
  setTimeout(() => document.getElementById('stop-edit-name')?.focus(), 50);
}
function stopStartEditLabel(dayIdx) {
  stopEditingIdx = { dayIdx, stopIdx: 'label' };
  stopAddingDay = null;
  renderOutlets();
  setTimeout(() => document.getElementById('stop-edit-label')?.focus(), 50);
}
function stopCancelEdit() {
  stopEditingIdx = null;
  renderOutlets();
}
function stopSaveEdit(dayIdx, stopIdx) {
  const nameEl = document.getElementById('stop-edit-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.style.borderColor = '#ef4444';
    nameEl.focus();
    nameEl.setAttribute('placeholder', '⚠ El nombre no puede estar vacío');
    setTimeout(() => { nameEl.style.borderColor = ''; nameEl.placeholder = 'Nombre del lugar'; }, 2000);
    return;
  }
  days[dayIdx].stops[stopIdx] = {
    name,
    desc: document.getElementById('stop-edit-desc').value.trim(),
    url: document.getElementById('stop-edit-url').value.trim(),
    badge: document.getElementById('stop-edit-badge').value || undefined,
    badgeText: document.getElementById('stop-edit-badgetext').value.trim() || undefined,
  };
  stopEditingIdx = null;
  saveState();
  renderOutlets();
  showMToast('Parada guardada ✓');
}
function stopSaveDayLabel(dayIdx) {
  const label = document.getElementById('stop-edit-label').value.trim();
  if (!label) return;
  days[dayIdx].label = label;
  stopEditingIdx = null;
  saveState();
  renderOutlets();
  showMToast('Descripción guardada ✓');
}
function stopDelete(dayIdx, stopIdx, e) {
  e && e.stopPropagation();
  const [removed] = days[dayIdx].stops.splice(stopIdx, 1);
  // Rebuild visited set for this day to avoid index gaps
  const oldVisited = visited[dayIdx];
  const wasVisited = oldVisited.has(stopIdx);
  const newVisited = new Set();
  [...oldVisited].forEach(idx => { if (idx < stopIdx) newVisited.add(idx); else if (idx > stopIdx) newVisited.add(idx - 1); });
  visited[dayIdx] = newVisited;
  saveState();
  renderOutlets();
  updateGlobal();
  showUndoToast(`"${removed.name}" eliminada`, () => {
    days[dayIdx].stops.splice(stopIdx, 0, removed);
    const restored = new Set();
    [...visited[dayIdx]].forEach(idx => restored.add(idx >= stopIdx ? idx + 1 : idx));
    if (wasVisited) restored.add(stopIdx);
    visited[dayIdx] = restored;
    saveState();
    renderOutlets();
    updateGlobal();
  });
}
function stopStartAdd(dayIdx) {
  stopAddingDay = dayIdx;
  stopEditingIdx = null;
  renderOutlets();
  setTimeout(() => document.getElementById('stop-add-name')?.focus(), 50);
}
function stopCancelAdd() {
  stopAddingDay = null;
  renderOutlets();
}
function stopAddConfirm(dayIdx) {
  const nameEl = document.getElementById('stop-add-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.style.borderColor = '#ef4444';
    nameEl.focus();
    nameEl.setAttribute('placeholder', '⚠ Escribí el nombre del lugar');
    setTimeout(() => { nameEl.style.borderColor = ''; nameEl.placeholder = 'Nombre del lugar'; }, 2000);
    return;
  }
  days[dayIdx].stops.push({
    name,
    desc: document.getElementById('stop-add-desc').value.trim(),
    url: document.getElementById('stop-add-url').value.trim(),
    badge: document.getElementById('stop-add-badge').value || undefined,
    badgeText: document.getElementById('stop-add-badgetext').value.trim() || undefined,
  });
  stopAddingDay = null;
  saveState();
  renderOutlets();
  updateGlobal();
  showMToast('Parada agregada ✓');
}

// ─── MOVE UP / DOWN ─────────────────────────────────────────
function stopMoveUp(dayIdx, stopIdx, e) {
  e && e.stopPropagation();
  if (stopIdx === 0) return;
  const stops = days[dayIdx].stops;
  [stops[stopIdx - 1], stops[stopIdx]] = [stops[stopIdx], stops[stopIdx - 1]];
  // Fix visited indices
  const vis = visited[dayIdx];
  const hadPrev = vis.has(stopIdx - 1);
  const hadCurr = vis.has(stopIdx);
  if (hadPrev) vis.add(stopIdx); else vis.delete(stopIdx);
  if (hadCurr) vis.add(stopIdx - 1); else vis.delete(stopIdx - 1);
  saveState();
  renderOutlets();
}
function stopMoveDown(dayIdx, stopIdx, e) {
  e && e.stopPropagation();
  if (stopIdx >= days[dayIdx].stops.length - 1) return;
  const stops = days[dayIdx].stops;
  [stops[stopIdx], stops[stopIdx + 1]] = [stops[stopIdx + 1], stops[stopIdx]];
  const vis = visited[dayIdx];
  const hadCurr = vis.has(stopIdx);
  const hadNext = vis.has(stopIdx + 1);
  if (hadNext) vis.add(stopIdx); else vis.delete(stopIdx);
  if (hadCurr) vis.add(stopIdx + 1); else vis.delete(stopIdx + 1);
  saveState();
  renderOutlets();
}

// ─── DRAG & DROP ────────────────────────────────────────────
let dragSrc = null; // { dayIdx, stopIdx }
function stopDragStart(dayIdx, stopIdx, e) {
  dragSrc = { dayIdx, stopIdx };
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function stopDragOver(dayIdx, stopIdx, e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (!dragSrc || (dragSrc.dayIdx === dayIdx && dragSrc.stopIdx === stopIdx)) return;
  document.querySelectorAll('.stop-card.drag-over').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}
function stopDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.stop-card.drag-over').forEach(el => el.classList.remove('drag-over'));
  dragSrc = null;
}
function stopDrop(dayIdx, stopIdx, e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragSrc) return;
  const { dayIdx: srcDay, stopIdx: srcStop } = dragSrc;
  if (srcDay !== dayIdx || srcStop === stopIdx) { dragSrc = null; return; }
  // Reorder stops
  const stops = days[dayIdx].stops;
  const moved = stops.splice(srcStop, 1)[0];
  const targetIdx = srcStop < stopIdx ? stopIdx - 1 : stopIdx;
  stops.splice(targetIdx, 0, moved);
  // Rebuild visited for this day
  const vis = visited[dayIdx];
  const visitedArr = [...vis];
  const newVis = new Set();
  // map old indices to new
  visitedArr.forEach(oldIdx => {
    let newIdx = oldIdx;
    if (oldIdx === srcStop) {
      newIdx = targetIdx;
    } else if (srcStop < stopIdx) {
      if (oldIdx > srcStop && oldIdx <= targetIdx) newIdx = oldIdx - 1;
    } else {
      if (oldIdx >= targetIdx && oldIdx < srcStop) newIdx = oldIdx + 1;
    }
    newVis.add(newIdx);
  });
  visited[dayIdx] = newVis;
  dragSrc = null;
  saveState();
  renderOutlets();
  showMToast('Parada reordenada ✓');
}

// ─── GUÍA DE TALLES US ↔ ARG (Outlets · Compras) ───────────────
// Tabla estática de referencia — aproximada, puede variar por marca.
const SIZE_GUIDE = [
  { title: 'Remeras / Buzos', cols: ['US', 'ARG'], rows: [
    ['XS','38-40'], ['S','40-42'], ['M','42-44'], ['L','44-46'], ['XL','46-48'], ['XXL','48-50'],
  ]},
  { title: 'Pantalones (jean, hombre — cintura)', cols: ['US', 'ARG'], rows: [
    ['28','38'], ['30','40'], ['32','42'], ['34','44'], ['36','46'], ['38','48'],
  ]},
  { title: 'Calzado (unisex, aprox.)', cols: ['US', 'ARG / EU'], rows: [
    ['6','37'], ['6.5','37.5'], ['7','38'], ['7.5','39'], ['8','39.5'], ['8.5','40'],
    ['9','41'], ['9.5','41.5'], ['10','42'], ['10.5','43'], ['11','43.5'], ['11.5','44'], ['12','45'],
  ]},
];
function renderSizeGuide() {
  return `<div class="size-guide-grid">${SIZE_GUIDE.map(g => `
    <div class="size-guide-block">
      <div class="size-guide-title">${g.title}</div>
      <div class="size-guide-table-wrap">
        <table class="size-guide-table">
          <thead><tr>${g.cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${g.rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`).join('')}</div>`;
}
function openSizeGuide() {
  document.getElementById('size-guide-content').innerHTML = renderSizeGuide();
  document.getElementById('sizeGuideModal').classList.add('open');
}
function closeSizeGuide() {
  document.getElementById('sizeGuideModal').classList.remove('open');
}

function renderShopList() {
  const prioColor = { alta:'#ef4444', media:'var(--accent)', baja:'var(--green)' };
  const isNeed = shopListTab === 'need';
  const filtered = shopItems.filter(i => isNeed ? i.needIt !== false : i.needIt === false);

  let html = `
  <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
    <button class="mbtn" onclick="openSizeGuide()">${ic('shirt',12)} Guía de talles US↔ARG</button>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:14px">
    <button onclick="shopListTab='need';renderOutlets()" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:var(--radius-sm);border:1px solid ${isNeed?'var(--accent)':'var(--border2)'};background:${isNeed?'var(--accent)':'transparent'};color:${isNeed?'#fff':'var(--muted)'};font-family:'DM Sans',sans-serif;font-size:var(--fs-xs);font-weight:600;cursor:pointer;">${ic('check',13)} A comprar</button>
    <button onclick="shopListTab='noneed';renderOutlets()" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:var(--radius-sm);border:1px solid ${!isNeed?'#ef4444':'var(--border2)'};background:${!isNeed?'rgba(239,68,68,0.12)':'transparent'};color:${!isNeed?'#ef4444':'var(--muted)'};font-family:'DM Sans',sans-serif;font-size:var(--fs-xs);font-weight:600;cursor:pointer;">${ic('x',13)} No necesito</button>
  </div>`;

  shopCats.forEach(cat => {
    const catItems = filtered.filter(i => i.catId === cat.id);
    if (catItems.length === 0) return;
    const catDone = catItems.filter(i => shopChecked.has(i.id)).length;
    const isOpen = shopOpenSections.has(cat.id);

    html += `<div class="wm-section${isOpen?' open':''}" id="shopsec-${cat.id}">
      <div class="wm-section-header" onclick="shopToggleSection('${cat.id}')">
        <span class="wm-section-icon">${ic(cat.icon,16)}</span>
        <span class="wm-section-title">${cat.title}</span>
        <span class="wm-section-count">${catDone}/${catItems.length}</span>
        <span class="wm-section-chevron">${ic('chevronDown',14)}</span>
      </div>
      <div class="wm-items">`;

    catItems.forEach(item => {
      const isChecked = shopChecked.has(item.id);
      const isEditingThis = shopEditingItem === item.id;
      const pColor = prioColor[item.priority] || 'var(--muted)';
      const moveLabel = ic(isNeed ? 'ban' : 'check', 13);
      const moveTitle = isNeed ? 'Mover a No necesito' : 'Mover a A comprar';

      if (isEditingThis) {
        html += `<div class="wm-item wm-item-editing" onclick="event.stopPropagation()">
          <div class="wm-edit-form">
            <input class="wm-edit-input" id="shop-edit-name" placeholder="Qué querés comprar" value="${escapeHtml(item.name)}">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
              <input class="wm-edit-input" id="shop-edit-size" placeholder="Talle (M, 42, 32x30…)" value="${escapeHtml(item.size||'')}">
              <input class="wm-edit-input" id="shop-edit-store" placeholder="Tienda sugerida" value="${escapeHtml(item.store||'')}">
            </div>
            <select class="wm-edit-input" id="shop-edit-prio" style="margin-bottom:6px">
              <option value="alta"${item.priority==='alta'?' selected':''}>🔴 Alta prioridad</option>
              <option value="media"${item.priority==='media'?' selected':''}>🟡 Media prioridad</option>
              <option value="baja"${item.priority==='baja'?' selected':''}>🟢 Baja prioridad</option>
            </select>
            <div class="wm-edit-actions">
              <button class="mbtn" onclick="shopCancelEdit()">Cancelar</button>
              <button class="mbtn msave" onclick="shopSaveEdit('${item.id}')">Guardar</button>
            </div>
          </div>
        </div>`;
      } else {
        html += `<div class="wm-item${isChecked?' checked':''}" onclick="shopToggle('${item.id}',event)">
          <div class="wm-check">${isChecked?'✓':''}</div>
          <div class="wm-item-body">
            <div class="wm-item-name">${escapeHtml(item.name)}</div>
            <div class="wm-item-detail">${item.size ? 'Talle: '+escapeHtml(item.size) : ''} ${item.store ? '· '+escapeHtml(item.store) : ''}</div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <span style="width:8px;height:8px;border-radius:50%;background:${pColor};display:inline-block;flex-shrink:0" title="Prioridad ${item.priority}"></span>
            <button class="wm-icon-btn" onclick="shopMoveItem('${item.id}',event)" title="${moveTitle}" aria-label="${moveTitle}">${moveLabel}</button>
            <button class="wm-icon-btn" onclick="shopStartEdit('${item.id}',event)" title="Editar" aria-label="Editar ${escapeHtml(item.name)}">${ic('pencil',13)}</button>
            <button class="wm-icon-btn wm-icon-del" onclick="shopDeleteItem('${item.id}',event)" title="Eliminar" aria-label="Eliminar ${escapeHtml(item.name)}">${ic('x',14)}</button>
          </div>
        </div>`;
      }
    });

    html += `</div></div>`;
  });

  if (filtered.length === 0) {
    html += `<div style="text-align:center;padding:40px 20px;color:var(--muted);font-size:13px;">
      ${isNeed ? 'No hay prendas en la lista. Agregá una con el botón de abajo.' : 'Nada descartado todavía. Usá el 🚫 para mover ítems acá, o agregá uno directamente.'}
    </div>`;
  }

  html += `<div style="display:flex;gap:8px;margin-top:14px;justify-content:center">
    <button class="wm-reset-btn" onclick="shopOpenAddModal('${isNeed ? 'need' : 'noneed'}')">+ Agregar prenda</button>
    <button class="wm-reset-btn" onclick="shopReset()">↺ Reiniciar checks</button>
  </div>`;

  return html;
}

function shopToggleSection(catId) {
  if (shopOpenSections.has(catId)) shopOpenSections.delete(catId);
  else shopOpenSections.add(catId);
  renderOutlets();
}
function shopMoveItem(id, e) {
  e && e.stopPropagation();
  const item = shopGetItem(id);
  if (!item) return;
  item.needIt = item.needIt === false ? true : false;
  shopSave();
  showMToast(item.needIt ? 'Movido a A comprar ✓' : 'Movido a No necesito ✓');
  renderOutlets();
}
function shopToggle(id, e) {
  e && e.stopPropagation();
  if (shopChecked.has(id)) shopChecked.delete(id);
  else shopChecked.add(id);
  shopSave();
  renderOutlets();
}
function shopStartEdit(id, e) {
  e && e.stopPropagation();
  shopEditingItem = id;
  const item = shopGetItem(id);
  if (item) shopOpenSections.add(item.catId);
  renderOutlets();
}
function shopCancelEdit() { shopEditingItem = null; renderOutlets(); }
function shopSaveEdit(id) {
  const item = shopGetItem(id);
  if (!item) return;
  const name = document.getElementById('shop-edit-name').value.trim();
  if (!name) return;
  item.name = name;
  item.size = document.getElementById('shop-edit-size').value.trim();
  item.store = document.getElementById('shop-edit-store').value.trim();
  item.priority = document.getElementById('shop-edit-prio').value;
  shopEditingItem = null;
  shopSave();
  renderOutlets();
  showMToast('Guardado ✓');
}
function shopDeleteItem(id, e) {
  e && e.stopPropagation();
  const idx = shopItems.findIndex(i => i.id === id);
  if (idx === -1) return;
  const [removed] = shopItems.splice(idx, 1);
  const wasChecked = shopChecked.has(id);
  shopChecked.delete(id);
  shopSave();
  renderOutlets();
  showUndoToast(`"${removed.name}" eliminado`, () => {
    shopItems.splice(idx, 0, removed);
    if (wasChecked) shopChecked.add(id);
    shopSave();
    renderOutlets();
  });
}
async function shopReset() {
  const ok = await showConfirm('Se van a desmarcar todas las prendas compradas.', '¿Reiniciar checks?', 'Reiniciar', true);
  if (!ok) return;
  shopChecked.clear();
  shopSave();
  renderOutlets();
}
function shopOpenAddModal(tab) {
  window._shopAddTab = tab || 'need';
  document.getElementById('shopAddModal').classList.add('open');
  setTimeout(() => document.getElementById('shop-add-name')?.focus(), 50);
}
function shopCloseAddModal() {
  document.getElementById('shopAddModal').classList.remove('open');
  ['shop-add-name','shop-add-size','shop-add-store'].forEach(id => {
    const el = document.getElementById(id); if(el) { el.value=''; el.classList.remove('error'); }
  });
  const err = document.getElementById('shop-add-name-err');
  if (err) err.classList.remove('show');
}
function shopAddItem() {
  const nameEl = document.getElementById('shop-add-name');
  const name = nameEl.value.trim();
  const catId = document.getElementById('shop-add-cat').value;
  const size = document.getElementById('shop-add-size').value.trim();
  const store = document.getElementById('shop-add-store').value.trim();
  const priority = document.getElementById('shop-add-prio').value;
  if (!name) {
    nameEl.classList.add('error');
    const err = document.getElementById('shop-add-name-err');
    if (err) err.classList.add('show');
    nameEl.focus();
    return;
  }
  const needIt = (window._shopAddTab || 'need') === 'need';
  const newItem = { id:'shop-'+Date.now(), catId, name, size, store, priority, needIt };
  shopItems.push(newItem);
  shopOpenSections.add(catId);
  shopSave();
  renderOutlets();
  shopCloseAddModal();
  showMToast('Prenda agregada ✓');
}

// ─── PARQUES ───────────────────────────────────────────────
const PARQUES_KEY = 'parkTracker_v2';
let parquesState = {};

function parquesLoad() {
  const d = syncedLoad(PARQUES_KEY, window._parquesFromFb);
  if (d) parquesState = d;
}

function parquesSave() {
  syncedSave(PARQUES_KEY, parquesState, 'parques', { state: parquesState });
}

function pkKey(parkId, zoneIdx, attrIdx) { return `${parkId}_${zoneIdx}_${attrIdx}`; }
function pkDone(parkId, zoneIdx, attrIdx) { return !!parquesState[pkKey(parkId, zoneIdx, attrIdx)]; }

function toggleAttraction(parkId, zoneIdx, attrIdx) {
  const k = pkKey(parkId, zoneIdx, attrIdx);
  parquesState[k] = !parquesState[k];
  parquesSave();
  // Actualizar pin en mapa sin re-renderizar todo
  const mapInst = _parkMaps[parkId];
  if (mapInst) {
    const park = allParksList().find(p => p.id === parkId);
    const attr = park?.zones[zoneIdx]?.attractions[attrIdx];
    const globalIdx = park ? (() => { let idx=0; for(let zi=0;zi<zoneIdx;zi++) idx+=park.zones[zi].attractions.length; return idx+attrIdx; })() : -1;
    const markerObj = mapInst._markers && mapInst._markers[globalIdx];
    if (markerObj && attr) {
      const isDone = !!parquesState[k];
      const color = PARK_COLORS[parkId] || '#8b5cf6';
      markerObj.setIcon(makeParkPin(color, isDone, attr.name));
    }
  }
  renderParques();
}

function pkCountPark(park) {
  let done = 0, total = 0;
  park.zones.forEach((z, zi) => z.attractions.forEach((_, ai) => { total++; if (pkDone(park.id, zi, ai)) done++; }));
  return { done, total };
}

function pkCountAll() {
  let done = 0, total = 0;
  allParksList().forEach(p => { const c = pkCountPark(p); done += c.done; total += c.total; });
  return { done, total };
}

function updateParquesCounter() {
  const { done, total } = pkCountAll();
  document.getElementById('global-counter').textContent = done + ' / ' + total;
}

const PARK_ICONS = { mk: 'castle', epcot: 'globe', hs: 'clapper', ioa: 'dino', usf: 'masks', epic: 'sparkles' };
let pkFilter = 'all';
let pkSearchQuery = '';
function pkNorm(s) { return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
let pkOpenCards = new Set(); // ids de parques con la card abierta; arranca vacío

// ─── PARQUES PERSONALIZADOS Y ATRACCIONES AGREGADAS A MANO ───────
// Dos capas de datos de usuario, separadas de PARKS_DATA (que es código,
// no algo persistido, así que se re-arma igual en cada carga):
// - customParks: parques enteros que el usuario creó desde cero.
// - extraZones: una zona extra por parque PREDEFINIDO (mk, epcot, etc.)
//   con las atracciones que el usuario sumó porque notó que faltaban.
// Ambas se guardan en localStorage + Firebase igual que el resto de los
// módulos, y en el init se "reinyectan" dentro de park.zones para que el
// resto del código (contador, mapa, buscador, toggle) las trate exactamente
// igual que a las atracciones curadas, sin casos especiales.
const CUSTOM_PARKS_KEY = 'parques-custom';
const EXTRA_ZONES_KEY = 'parques-extra-zonas';
const PARK_COLOR_OPTIONS = ['#2563eb','#7c3aed','#10b981','#f59e0b','#ef4444','#0ea5e9','#ec4899','#14b8a6'];
let customParks = [];
let extraZones = {};

function customParksSave() { syncedSave(CUSTOM_PARKS_KEY, customParks, 'customParks', { items: customParks }); }
function customParksLoad() {
  const d = syncedLoad(CUSTOM_PARKS_KEY, window._customParksFromFb);
  customParks = d || [];
  customParks.forEach(p => { if (p.color) PARK_COLORS[p.id] = p.color; });
}
function extraZonesSave() { syncedSave(EXTRA_ZONES_KEY, extraZones, 'parquesExtra', extraZones); }
// Reinyecta las zonas agregadas a mano dentro de los parques que vienen de Excel.
function extraZonesApply() {
  Object.keys(extraZones).forEach(parkId => {
    const park = PARKS_DATA.find(p => p.id === parkId);
    const zone = extraZones[parkId];
    if (park && zone && zone.attractions && zone.attractions.length > 0 && !park.zones.includes(zone)) {
      park.zones.push(zone);
    }
  });
}
function extraZonesLoad() {
  const d = syncedLoad(EXTRA_ZONES_KEY, window._parquesExtraFromFb);
  extraZones = d || {};
  extraZonesApply();
}
function allParksList() { return [...PARKS_DATA, ...customParks]; }
function pkIsCustomPark(parkId) { return customParks.some(p => p.id === parkId); }

// ─── COORDENADAS: overrides + geocodificación real ────────────────
// Los pines "de fábrica" de PARKS_DATA fueron estimados a mano y pueden
// estar corridos. En vez de tratar de arreglar ~190 a ciegas desde acá,
// esta capa deja que la propia app (corriendo en el navegador del usuario,
// con internet real) los verifique contra Wikipedia y permite corregir
// cualquier atracción a mano — con dirección o lat/lng directos. La
// corrección se guarda acá, nunca se pisa PARKS_DATA (que es código).
const COORD_OVERRIDES_KEY = 'parques-coord-overrides';
let coordOverrides = {}; // { "parkId_zoneIdx_attrIdx": {lat, lng} }
function coordOverridesSave() { syncedSave(COORD_OVERRIDES_KEY, coordOverrides, 'coordOverrides', coordOverrides); }
function coordOverridesLoad() {
  const d = syncedLoad(COORD_OVERRIDES_KEY, window._coordOverridesFromFb);
  coordOverrides = d || {};
}
// Coordenadas "efectivas" de una atracción: la corrección si existe,
// si no la que trae PARKS_DATA/customParks.
function pkCoord(parkId, zoneIdx, attrIdx, attr) {
  const ov = coordOverrides[`${parkId}_${zoneIdx}_${attrIdx}`];
  if (ov) return { lat: ov.lat, lng: ov.lng };
  if (attr.lat && attr.lng) return { lat: attr.lat, lng: attr.lng };
  return null;
}
function pkSetCoordOverride(parkId, zoneIdx, attrIdx, lat, lng) {
  coordOverrides[`${parkId}_${zoneIdx}_${attrIdx}`] = { lat, lng };
  coordOverridesSave();
}

// Wikipedia: busca el artículo de la atracción (con el nombre del parque
// como pista para desambiguar, ej. "Space Mountain Magic Kingdom") y lee
// sus coordenadas del propio Wikidata/infobox vía prop=coordinates — mucho
// más preciso que adivinar texto, porque es un campo estructurado.
async function geoWikipediaCoords(name, parkHint) {
  try {
    const query = parkHint ? `${name} ${parkHint}` : name;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData && searchData[1] && searchData[1][0];
    if (!title) return null;

    const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=coordinates&format=json&origin=*`;
    const coordRes = await fetch(coordUrl);
    const coordData = await coordRes.json();
    const pages = coordData.query && coordData.query.pages;
    const page = pages && Object.values(pages)[0];
    const coord = page && page.coordinates && page.coordinates[0];
    if (!coord) return null;
    return { lat: coord.lat, lng: coord.lon, title };
  } catch (e) {
    devError('geoWikipediaCoords error', e);
    return null;
  }
}

// Nominatim (OpenStreetMap): geocodifica una dirección escrita a mano.
// Gratis, sin API key, pero pide no golpearlo muy seguido (1 req/seg).
async function geoNominatimAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data || !data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) {
    devError('geoNominatimAddress error', e);
    return null;
  }
}
function geoSleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Búsqueda automática combinada: Wikipedia primero (más precisa cuando la
// atracción tiene artículo propio), y si no encuentra nada, Nominatim como
// respaldo buscando "nombre + parque" como si fuera una dirección. Así el
// usuario no tiene que elegir método — un solo botón prueba las dos.
async function geoAutoSearch(name, parkHint) {
  const wiki = await geoWikipediaCoords(name, parkHint);
  if (wiki) return { lat: wiki.lat, lng: wiki.lng, source: 'wikipedia', title: wiki.title };
  await geoSleep(250);
  const query = parkHint ? `${name}, ${parkHint}` : name;
  const nomi = await geoNominatimAddress(query);
  if (nomi) return { lat: nomi.lat, lng: nomi.lng, source: 'nominatim' };
  return null;
}

// Catálogo de parques: arranca VACÍO para todos los perfiles. Se llena con
// "Actualizar desde Excel" (hojas por parque), con "+ Agregar parque" o con
// un backup importado. Nada de esto viene hardcodeado en el código.
const PARKS_DATA = [];

function pkToggleCard(id) {
  const wasOpen = pkOpenCards.has(id);
  if (wasOpen) {
    pkOpenCards.delete(id);
    // Destruir mapa al colapsar para evitar grises
    if (_parkMaps[id]) {
      _parkMaps[id].remove();
      delete _parkMaps[id];
    }
  } else {
    pkOpenCards.add(id);
  }
  renderParques();
  // Si se abre, inicializar mapa después del render
  if (!wasOpen) {
    setTimeout(() => initParkMap(id), 80);
  }
}

function pkSetFilter(id) {
  pkFilter = id;
  renderParques();
}

// Filtra en vivo sobre el DOM ya renderizado (sin volver a llamar a
// renderParques) para no perder el foco del input en cada letra que se
// escribe. Al limpiar la búsqueda, todo vuelve al estado de apertura que
// tenían las cards antes de buscar (pkOpenCards).
function pkApplySearch(value) {
  pkSearchQuery = value;
  const q = pkNorm(value);
  document.querySelectorAll('.park-card').forEach(card => {
    const parkId = card.id.replace('pkcard-', '');
    const passesFilter = pkFilter === 'all' || pkFilter === parkId;
    let anyMatch = false;
    card.querySelectorAll('.park-attr-item').forEach(item => {
      const match = !q || (item.dataset.name || '').includes(q);
      item.style.display = match ? '' : 'none';
      if (match) anyMatch = true;
    });
    card.querySelectorAll('.park-zone-title').forEach(title => {
      let el = title.nextElementSibling;
      let zoneHasMatch = false;
      while (el && el.classList.contains('park-attr-item')) {
        if (el.style.display !== 'none') zoneHasMatch = true;
        el = el.nextElementSibling;
      }
      title.style.display = (!q || zoneHasMatch) ? '' : 'none';
    });
    card.classList.toggle('pk-hidden', !passesFilter || (!!q && !anyMatch));
    if (q) {
      if (anyMatch) card.classList.add('open');
    } else {
      card.classList.toggle('open', pkOpenCards.has(parkId));
    }
  });
  const clearBtn = document.querySelector('.parques-search-clear');
  const wrap = document.querySelector('.parques-search-wrap');
  if (wrap) wrap.classList.toggle('has-value', !!value);
  if (!clearBtn && value) {
    // Se agrega el botón de borrar sin re-renderizar todo el panel.
    const btn = document.createElement('button');
    btn.className = 'parques-search-clear';
    btn.setAttribute('aria-label', 'Borrar búsqueda');
    btn.innerHTML = ic('x', 13);
    btn.onclick = () => { document.getElementById('pkSearchInput').value = ''; pkApplySearch(''); };
    wrap && wrap.appendChild(btn);
  } else if (clearBtn && !value) {
    clearBtn.remove();
  }
}

async function pkResetAll() {
  const ok = await showConfirm('Se va a borrar todo el progreso de atracciones. ¿Confirmás?', '¿Reiniciar Parques?', 'Reiniciar', true);
  if (!ok) return;
  parquesState = {};
  parquesSave();
  renderParques();
  updateParquesCounter();
}

// Filtros de la barra de parques: solo "Todos". El resto se suma solo con cada
// parque que se crea (a mano, desde Excel o al importar un backup).
let pkFilterMetaBase = [
  { id: 'all',  label: 'Todos' },
];
function pkFilterMetaList() {
  return [...pkFilterMetaBase, ...customParks.map(p => ({ id: p.id, label: p.name }))];
}

// ─── PARK MAPS ─────────────────────────────────────────────
// Color de pin por parque. Se completa al crear/cargar cada parque.
const PARK_COLORS = {};

let _parkMaps = {};
let _pkMapOpen = {};

function makeParkPin(color, isDone, label) {
  const bg   = isDone ? 'transparent' : color;
  const border = isDone ? color : 'rgba(255,255,255,0.25)';
  const textColor = isDone ? color : '#fff';
  const check = isDone ? '✓' : '';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${bg};
      color:${textColor};
      display:flex;align-items:center;justify-content:center;
      font-family:'DM Sans',sans-serif;font-weight:800;font-size:13px;
      border:2px solid ${border};
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      opacity:${isDone ? '0.7' : '1'};
      transition:all .2s;
    ">${check}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16]
  });
}

function pkToggleParkMap(parkId) {
  const container = document.getElementById(`pkmap-container-${parkId}`);
  const chev = document.getElementById(`pkmap-chev-${parkId}`);
  const wrap = document.getElementById(`pkmap-wrap-${parkId}`);
  if (!container) return;

  const isOpen = container.style.display !== 'none';
  if (isOpen) {
    container.style.display = 'none';
    if (chev) chev.style.transform = '';
    if (wrap) wrap.classList.remove('open');
    if (_parkMaps[parkId]) {
      _parkMaps[parkId].remove();
      delete _parkMaps[parkId];
    }
  } else {
    container.style.display = 'block';
    if (chev) chev.style.transform = 'rotate(180deg)';
    if (wrap) wrap.classList.add('open');
    setTimeout(() => initParkMap(parkId), 80);
  }
}

function initParkMap(parkId) {
  const container = document.getElementById(`pkmap-container-${parkId}`);
  if (!container || container.style.display === 'none') return;

  // Destruir instancia previa si existe
  if (_parkMaps[parkId]) {
    _parkMaps[parkId].remove();
    delete _parkMaps[parkId];
  }
  container.innerHTML = '';

  const park = allParksList().find(p => p.id === parkId);
  if (!park) return;

  const color = PARK_COLORS[parkId] || '#8b5cf6';
  const map = L.map(container, { zoomControl: true, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const bounds = [];
  const markers = [];
  let globalIdx = 0;

  park.zones.forEach((zone, zi) => {
    zone.attractions.forEach((attr, ai) => {
      const coord = pkCoord(parkId, zi, ai, attr);
      if (!coord) { globalIdx++; return; }
      const isDone = pkDone(parkId, zi, ai);
      const icon = makeParkPin(color, isDone, attr.name);

      const heightHtml = attr.height
        ? `<div style="font-size:10px;color:#8b5cf6;font-weight:600;margin-top:2px">↑ ${attr.height}</div>`
        : '';
      const doneHtml = isDone
        ? `<div style="margin-top:5px;font-size:11px;color:#10b981">✓ Completada</div>`
        : '';

      const marker = L.marker([coord.lat, coord.lng], { icon })
        .bindPopup(`
          <div class="map-popup-name">${attr.name}</div>
          <div class="map-popup-desc">${zone.name}</div>
          ${heightHtml}
          ${doneHtml}
        `, { maxWidth: 200 })
        .addTo(map);

      markers[globalIdx] = marker;
      bounds.push([coord.lat, coord.lng]);
      globalIdx++;
    });
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [28, 28] });
  }

  map._markers = markers;
  _parkMaps[parkId] = map;
  setTimeout(() => map && map.invalidateSize(), 150);
}

// Inicializar mapas de parques que están abiertos al renderizar
function initOpenParkMaps() {
  pkOpenCards.forEach(parkId => {
    setTimeout(() => initParkMap(parkId), 120);
  });
}

let parquesSubTab = 'itinerario'; // 'itinerario' | 'atracciones'
function switchParquesTab(t) { parquesSubTab = t; renderParques(); }

function renderParques() {
  const panel = document.getElementById('panel-parques');
  const subtabs = `<div class="outlets-subtabs">
      <button class="outlets-stab${parquesSubTab==='itinerario'?' active':''}" onclick="switchParquesTab('itinerario')">${ic('calendar',13)} Itinerario</button>
      <button class="outlets-stab${parquesSubTab==='atracciones'?' active':''}" onclick="switchParquesTab('atracciones')">${ic('sparkles',13)} Atracciones</button>
    </div>`;
  if (parquesSubTab === 'itinerario') {
    panel.innerHTML = `<div class="parques-panel">${subtabs}${itinMochilaLink()}${renderItinerario()}</div>`;
    updateParquesCounter();
    return;
  }
  const { done: gDone, total: gTotal } = pkCountAll();
  const gPct = gTotal > 0 ? Math.round(gDone / gTotal * 100) : 0;

  let html = `<div class="parques-panel">
    ${subtabs}
    <div class="parques-global-bar">
      <div class="parques-global-nums">
        <div class="parques-global-count">${gDone}</div>
        <div class="parques-global-lbl">de ${gTotal}</div>
      </div>
      <div class="parques-global-right">
        <div class="parques-global-title">Atracciones completadas</div>
        <div class="parques-prog-bg"><div class="parques-prog-fill" style="width:${gPct}%"></div></div>
      </div>
    </div>
    ${itinMochilaLink()}
    <div class="parques-search-wrap">
      ${ic('search', 15)}
      <input type="text" class="parques-search-input" id="pkSearchInput" placeholder="Buscar una atracción…" value="${escapeHtml(pkSearchQuery)}" oninput="pkApplySearch(this.value)">
      ${pkSearchQuery ? `<button class="parques-search-clear" onclick="document.getElementById('pkSearchInput').value='';pkApplySearch('')" aria-label="Borrar búsqueda">${ic('x', 13)}</button>` : ''}
    </div>
    <div class="parques-filter-bar">`;

  pkFilterMetaList().forEach(f => {
    html += `<button class="parques-filter-btn${pkFilter===f.id?' active':''}" onclick="pkSetFilter('${f.id}')">${f.label}</button>`;
  });
  html += `</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <button class="wm-reset-btn" onclick="itinOpenImport()">${ic('file',12)} Actualizar desde Excel</button>
      <button class="wm-reset-btn" onclick="pkOpenAddParkModal()">+ Agregar parque</button>
    </div>`;

  if (allParksList().length === 0) {
    html += `<div class="all-done" style="display:block">
        <div class="all-done-emoji">${ic('sparkles',44)}</div>
        <div class="all-done-title">Sin parques cargados</div>
        <div class="all-done-sub">Importá las atracciones desde tu Excel o agregá un parque a mano para empezar.</div>
      </div>`;
  }

  allParksList().forEach(park => {
    const visible = pkFilter === 'all' || pkFilter === park.id;
    const { done, total } = pkCountPark(park);
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const q = pkNorm(pkSearchQuery);
    const parkMatches = !q || park.zones.some(z => z.attractions.some(a => pkNorm(a.name).includes(q)));
    const isOpen = pkOpenCards.has(park.id) || (!!q && parkMatches);
    const isCustom = pkIsCustomPark(park.id);
    // El color/clase "personalizado" tiene que valer también para los parques
    // que trajo una importación de Excel (van a PARKS_DATA, no a customParks),
    // así que se deriva de park.cls y no de pkIsCustomPark. isCustom sigue
    // gobernando el botón de eliminar: ese solo debe verse en los parques
    // agregados a mano con "+ Agregar parque".
    const usesCustomColor = park.cls === 'pk-custom';
    const colorStyle = usesCustomColor ? ` style="--pk-color:${park.color}"` : '';

    html += `<div class="park-card ${park.cls}${usesCustomColor ? ' pk-custom' : ''}${(!visible || (q && !parkMatches)) ? ' pk-hidden' : ''}${isOpen ? ' open' : ''}" id="pkcard-${park.id}"${colorStyle}>
      <div class="park-card-header" onclick="pkToggleCard('${park.id}')">
        <span class="park-card-emoji">${ic(PARK_ICONS[park.id] || 'ferris', 20)}</span>
        <div class="park-card-info">
          <div class="park-card-name">${escapeHtml(park.name)}</div>
          <div class="park-card-label">${escapeHtml(park.label)}</div>
        </div>
        <div class="park-card-right">
          <span class="park-card-count">${done}/${total}</span>
          <div class="park-mini-bar-bg"><div class="park-mini-bar-fill" style="width:${pct}%"></div></div>
          ${isCustom ? `<button class="wm-icon-btn wm-icon-del" onclick="pkDeleteCustomPark('${park.id}');event.stopPropagation()" title="Eliminar parque" aria-label="Eliminar parque ${escapeHtml(park.name)}">${ic('x', 13)}</button>` : ''}
          <span class="park-card-chevron">${ic('chevronDown',14)}</span>
        </div>
      </div>
      <div class="park-card-body">`;

    park.zones.forEach((zone, zi) => {
      const zoneMatches = !q || zone.attractions.some(a => pkNorm(a.name).includes(q));
      html += `<div class="park-zone-title"${zoneMatches ? '' : ' style="display:none"'}>${escapeHtml(zone.name)}</div>`;
      zone.attractions.forEach((attr, ai) => {
        const done = pkDone(park.id, zi, ai);
        const itemMatches = !q || pkNorm(attr.name).includes(q);
        const hasCoord = !!pkCoord(park.id, zi, ai, attr);
        html += `<div class="park-attr-item${done ? ' pk-done' : ''}" data-name="${escapeHtml(pkNorm(attr.name))}"${itemMatches ? '' : ' style="display:none"'} onclick="toggleAttraction('${park.id}',${zi},${ai})">
          <div class="park-attr-check">${done ? '✓' : ''}</div>
          <div class="park-attr-body">
            <div class="park-attr-name">${escapeHtml(attr.name)}</div>
            ${attr.height ? `<div class="park-attr-height">↑ ${escapeHtml(attr.height)}</div>` : ''}
            ${(attr.duracion || attr.indispensable || attr.fila) ? `<div class="park-attr-height">${[
              attr.indispensable && `⭐ ${attr.indispensable}`,
              attr.duracion && `⏱ ${attr.duracion}`,
              attr.fila && `🚶 ${attr.fila}${/^\d+$/.test(String(attr.fila)) ? ' min' : ''}`,
            ].filter(Boolean).map(escapeHtml).join(' · ')}</div>` : ''}
            ${attr.obs ? `<div class="park-attr-height">${escapeHtml(attr.obs)}</div>` : ''}
          </div>
          <button class="wm-icon-btn pk-loc-btn${hasCoord ? '' : ' pk-loc-missing'}" onclick="pkOpenLocationModal('${park.id}',${zi},${ai});event.stopPropagation()" title="${hasCoord ? 'Corregir ubicación' : 'Sin coordenadas — agregar'}" aria-label="Ubicación de ${escapeHtml(attr.name)}">${ic('pin', 13)}</button>
          ${attr._custom ? `<button class="wm-icon-btn wm-icon-del" onclick="pkDeleteAttraction('${park.id}',${zi},${ai},event)" title="Eliminar" aria-label="Eliminar ${escapeHtml(attr.name)}">${ic('x', 13)}</button>` : ''}
        </div>`;
      });
    });

    html += `<div class="park-add-attr-row" style="gap:8px;flex-wrap:wrap">
      <button class="wm-reset-btn" onclick="pkOpenAddAttrModal('${park.id}')">+ Agregar atracción</button>
      <button class="wm-reset-btn" onclick="pkVerifyParkCoords('${park.id}')" id="pk-verify-btn-${park.id}">${ic('pin',12)} Verificar coordenadas</button>
    </div>`;

    // Mapa colapsable por parque
    let parkAttrsWithCoordsCount = 0;
    park.zones.forEach((z, zi) => z.attractions.forEach((a, ai) => { if (pkCoord(park.id, zi, ai, a)) parkAttrsWithCoordsCount++; }));
    if (parkAttrsWithCoordsCount > 0) {
      html += `
        <div class="day-map-wrap" id="pkmap-wrap-${park.id}" style="margin:0;border-radius:0 0 var(--radius) var(--radius);border-top:1px solid var(--border);border-left:none;border-right:none;border-bottom:none;">
          <div class="day-map-header" onclick="pkToggleParkMap('${park.id}')">
            <div class="day-map-title">${ic('map',13)} Mapa · ${parkAttrsWithCoordsCount} atracciones</div>
            <span class="day-map-chevron" id="pkmap-chev-${park.id}">${ic('chevronDown',14)}</span>
          </div>
          <div id="pkmap-container-${park.id}" class="day-map-container" style="display:none;height:280px;"></div>
        </div>`;
    }

    html += `</div></div>`;
  });

  if (allParksList().length > 0) html += `<div class="parques-reset-row"><button class="wm-reset-btn" onclick="pkResetAll()">↺ Reiniciar todo</button></div>`;
  html += `</div>`;
  panel.innerHTML = html;
  updateParquesCounter();
  // Inicializar mapas para cards ya abiertas
  setTimeout(() => {
    pkOpenCards.forEach(parkId => {
      // Solo si el container existe y está visible (card open)
      const container = document.getElementById(`pkmap-container-${parkId}`);
      if (container && container.style.display !== 'none' && !_parkMaps[parkId]) {
        initParkMap(parkId);
      }
    });
  }, 80);
}



function itinMochilaLink() {
  return `<a class="pk-mochila-link" href="${MIS_COSAS_URL}?sec=dia">
      <span class="pk-mochila-ic">${ic('backpack', 18)}</span>
      <span class="pk-mochila-txt"><strong>Mochila del día</strong><small>Revisala al salir del hotel y antes de irte del parque</small></span>
      <span class="pk-mochila-arrow" aria-hidden="true">${ic('chevronRight', 16)}</span>
    </a>`;
}

// ─── IMPORTAR ITINERARIO DESDE EXCEL ────────────────────────
// Lee la hoja "Itinerario" de un .xlsx con el mismo formato que la
// planilla original (Día / Parque / Zona / Atracción / Tipo / Hora /
// Espera / Duración / Lightning Pass / Observaciones) y arma los días.
// SheetJS se baja recién cuando hace falta, para no pesar en el arranque.
// La copia local va en el repo y la cachea el service worker, así importar
// también anda sin señal. Si por algo falta, se intenta el CDN.
const XLSX_SRCS = ['vendor-xlsx.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
let _xlsxPromise = null;
function cargarScript(src) {
  return new Promise((resolve, reject) => {
    const sc = document.createElement('script');
    sc.src = src;
    sc.onload = () => resolve();
    sc.onerror = () => reject(new Error('script'));
    document.head.appendChild(sc);
  });
}
function cargarXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = (async () => {
    for (const src of XLSX_SRCS) {
      try { await cargarScript(src); if (window.XLSX) return window.XLSX; } catch(e) {}
    }
    _xlsxPromise = null;
    throw new Error('xlsx');
  })();
  return _xlsxPromise;
}

const ITIN_MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
// Antes se buscaba por coincidencia exacta ("universal studios" tenía que
// venir escrito así, letra por letra). Distintas versiones de la planilla
// traen "Universal Studios Florida" o "Universal Epic Universe" en vez del
// nombre pelado, así que ahora se busca por inclusión de una palabra clave.
const ITIN_PARK_MATCH = [
  { id: 'mk',    match: ['magic kingdom'] },
  { id: 'epcot', match: ['epcot'] },
  { id: 'hs',    match: ['hollywood studios'] },
  { id: 'ak',    match: ['animal kingdom'] },
  { id: 'usf',   match: ['universal studios'] },
  { id: 'ioa',   match: ['islands of adventure', 'island of adventure'] },
  { id: 'epic',  match: ['epic universe'] },
];
function itinParkIdFromName(parque) {
  const n = itinNorm(parque);
  const hit = ITIN_PARK_MATCH.find(p => p.match.some(m => n.includes(m)));
  return hit ? hit.id : '';
}
const ITIN_TIPO_MAP = {
  'ride':'ride', 'atraccion':'ride', 'atracción':'ride',
  'show':'show', 'espectaculo':'show',
  'comida':'comida', 'almuerzo':'comida', 'cena':'comida', 'desayuno':'comida',
  'caminata':'caminata', 'visita':'caminata', 'recorrido':'caminata', 'ingreso':'caminata',
  'traslado':'traslado', 'transporte':'traslado',
};

function itinNorm(v) {
  return String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
}
// Las fechas de Excel llegan como número de serie (días desde 1899-12-30).
function itinFechaDesdeSerial(n) {
  const ms = (Number(n) - 25569) * 86400000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';
  return d.getUTCDate() + ' ' + ITIN_MESES[d.getUTCMonth()];
}
function itinParseFecha(v) {
  if (typeof v === 'number' && v > 20000 && v < 80000) return itinFechaDesdeSerial(v);
  if (v instanceof Date) return v.getDate() + ' ' + ITIN_MESES[v.getMonth()];
  const s = String(v || '').trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})/);
  if (m) return parseInt(m[1],10) + ' ' + (ITIN_MESES[parseInt(m[2],10)-1] || '');
  return s;
}
// "8:00am - 9:00am" / "15:30pm" / "Horario variable" → "08:00" o ''
function itinParseHora(v) {
  const s = String(v || '').trim();
  const m = s.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (!m) return '';
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = (m[3] || '').toLowerCase();
  if (h <= 12) {
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 12;
  }
  if (h > 23) return '';
  return String(h).padStart(2,'0') + ':' + min;
}
function itinParseNum(v) {
  const n = parseInt(String(v == null ? '' : v).replace(/[^\d]/g,''), 10);
  return isNaN(n) || n < 0 ? 0 : n;
}

// Devuelve [{fecha, nombre, parkId, bloques:[...]}] a partir del workbook.
function itinParseWorkbook(wb) {
  const XLSX = window.XLSX;
  let hoja = wb.SheetNames.find(n => itinNorm(n).includes('itinerario')) || wb.SheetNames[0];
  const filas = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { header: 1, raw: true, defval: '' });
  if (!filas.length) throw new Error('vacio');

  // Buscar la fila de encabezados (la que tiene "Día" o "Fecha" y algo de
  // atracción). Algunas versiones de la planilla traen antes una tabla
  // resumen por día que también tiene "Día"/"Fecha" pero no atracciones,
  // así que se exige que aparezcan las dos cosas juntas.
  let hi = -1;
  for (let i = 0; i < Math.min(filas.length, 30); i++) {
    const celdas = filas[i].map(itinNorm);
    if (celdas.some(c => c === 'dia' || c === 'fecha') && celdas.some(c => c.includes('atracc') || c.includes('actividad'))) { hi = i; break; }
  }
  if (hi === -1) throw new Error('encabezados');

  const head = filas[hi].map(itinNorm);
  const col = (...claves) => head.findIndex(h => h && claves.some(k => h.includes(k)));
  const cDia    = col('dia', 'fecha');
  const cParque = col('parque');
  const cZona   = col('zona');
  const cAct    = col('atracc','actividad');
  const cTipo   = col('tipo');
  const cHora   = col('hora');
  const cEsp    = col('esperada','espera','fila');
  const cDur    = col('duracion');
  const cLL     = col('lightning');
  const cObs    = col('observ','nota');
  const cEstr   = col('estrategia de fila','estrategia');
  const cPlanB  = col('regla de corte','plan b');
  if (cDia === -1 || cAct === -1) throw new Error('encabezados');
  const limpiarCelda = v => { const s = String(v == null ? '' : v).trim(); return s === '-' ? '' : s; };

  const mapa = new Map();
  for (let i = hi + 1; i < filas.length; i++) {
    const r = filas[i];
    if (!r || !r.length) continue;
    const titulo = String(r[cAct] == null ? '' : r[cAct]).trim();
    const fecha = itinParseFecha(r[cDia]);
    if (!fecha || !titulo || titulo === '-') continue;
    const parque = String((cParque > -1 ? r[cParque] : '') || '').trim();
    const parkId = itinParkIdFromName(parque);
    const clave = fecha + '|' + parque;
    if (!mapa.has(clave)) mapa.set(clave, { fecha, nombre: parque || fecha, parkId, esParque: !!parkId, bloques: [] });
    const dia = mapa.get(clave);

    // Observaciones: se arma juntando lo que haya de Lightning Lane,
    // estrategia de fila, plan B y la columna de observaciones en sí,
    // según lo que traiga cada versión de la planilla.
    const partesObs = [];
    if (cLL > -1 && itinNorm(r[cLL]) === 'si') partesObs.push('Lightning Lane.');
    const estr = cEstr > -1 ? limpiarCelda(r[cEstr]) : '';
    if (estr) partesObs.push(estr + '.');
    const planB = cPlanB > -1 ? limpiarCelda(r[cPlanB]) : '';
    if (planB) partesObs.push(planB + '.');
    const obsCol = cObs > -1 ? limpiarCelda(r[cObs]) : '';
    if (obsCol) partesObs.push(obsCol);

    const horaRaw = cHora > -1 ? limpiarCelda(r[cHora]) : '';
    const hora = itinParseHora(horaRaw);
    // Si no se pudo interpretar como hora de reloj (ej. "T+35", relativo a
    // la apertura del parque) se guarda igual como texto en observaciones
    // en vez de perderla.
    if (horaRaw && !hora) partesObs.unshift(`Horario objetivo: ${horaRaw}.`);

    const zona = String((cZona > -1 ? r[cZona] : '') || '').trim();
    dia.bloques.push({
      id: itinNewId() + dia.bloques.length,
      hora,
      titulo,
      zona: zona === '-' ? '' : zona,
      tipo: ITIN_TIPO_MAP[itinNorm(cTipo > -1 ? r[cTipo] : '')] || 'otro',
      espera: cEsp > -1 ? itinParseNum(r[cEsp]) : 0,
      dur: cDur > -1 ? itinParseNum(r[cDur]) : 0,
      obs: partesObs.join(' ').trim(),
    });
  }
  const dias = [...mapa.values()];
  if (!dias.length) throw new Error('vacio');
  dias.forEach(d => itinOrdenar(d));
  return dias;
}

// ─── ATRACCIONES: ACTUALIZAR DESDE EL MISMO EXCEL ────────────
// Además de la hoja "Itinerario", el mismo archivo trae una hoja por
// parque (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom,
// Universal Studios, Universal Islands of Adventure, Universal Epic
// Universe) con el formato "ATRACCIÓN | LUGAR | DURACIÓN | INDISPENSABLE
// | OBSERVACIONES | ... | FILA/ TIEMPO" repitiendo el encabezado antes
// de cada zona. Antes esto NO se leía nunca: la lista de "Atracciones"
// era 100% fija en el código, sin relación con el Excel — por eso
// cambiar de archivo nunca la actualizaba, sin importar qué tuviera
// adentro. Esto arma zonas/atracciones tal cual estén en la hoja y
// reemplaza por completo lo que haya en ese parque (a diferencia de
// "extraZones", que solo suma). Lo tildado y las coordenadas corregidas
// a mano se mantienen matcheando por nombre de atracción, no por
// posición, porque el orden puede cambiar entre una importación y otra.
const PARQUES_EXCEL_KEY = 'parques-excel-datos';
const ATR_SHEETS = [
  { id: 'mk',    match: ['magic kingdom'] },
  { id: 'epcot', match: ['epcot'] },
  { id: 'hs',    match: ['hollywood studios'] },
  { id: 'ak',    match: ['animal kingdom'] },
  { id: 'usf',   match: ['universal studios'] },
  { id: 'ioa',   match: ['islands of adventure'] },
  { id: 'epic',  match: ['epic universe'] },
];
// Metadata (nombre visible, etiqueta y color) de los parques que reconoce el
// lector de Excel por el nombre de la hoja. NO son datos de ningún perfil: solo
// sirven para nombrar y pintar el parque cuando una hoja lo trae. Si aparece un
// id que no está acá, se usa un genérico.
const ATR_NEW_PARK_META = {
  mk:    { name: 'Magic Kingdom',        emoji: '🏰', label: 'Walt Disney World', color: '#c084fc' },
  epcot: { name: 'EPCOT',                emoji: '🌍', label: 'Walt Disney World', color: '#4dd0c4' },
  hs:    { name: 'Hollywood Studios',    emoji: '🎬', label: 'Walt Disney World', color: '#ff7675' },
  ak:    { name: 'Animal Kingdom',       emoji: '🌴', label: 'Walt Disney World', color: '#22a06b' },
  ioa:   { name: 'Islands of Adventure', emoji: '🦖', label: 'Universal Orlando', color: '#69f0ae' },
  usf:   { name: 'Universal Studios',    emoji: '🎭', label: 'Universal Orlando', color: '#64b5f6' },
  epic:  { name: 'Epic Universe',        emoji: '✨', label: 'Universal Orlando', color: '#ce93d8' },
};

let parquesExcelData = {}; // { parkId: { zones: [{name, attractions:[...]}] } }
function parquesExcelSave() { syncedSave(PARQUES_EXCEL_KEY, parquesExcelData, 'parquesExcel', parquesExcelData); }
function parquesExcelLoad() {
  const d = syncedLoad(PARQUES_EXCEL_KEY, window._parquesExcelFromFb);
  parquesExcelData = d || {};
}
// Arma PARKS_DATA desde cero con lo guardado de las importaciones de Excel
// (parquesExcelData): PARKS_DATA ya no trae ningún parque en el código, así que
// es 100% derivado. Sin importación, queda vacío. Al final vuelve a sumar las
// zonas agregadas a mano (extraZones) arriba de lo que trajo el Excel.
function parquesExcelApply() {
  PARKS_DATA.length = 0;
  pkFilterMetaBase = pkFilterMetaBase.filter(f => f.id === 'all');
  Object.keys(parquesExcelData).forEach(parkId => {
    const zones = (parquesExcelData[parkId] && parquesExcelData[parkId].zones) || [];
    const meta = ATR_NEW_PARK_META[parkId] || { name: parkId, emoji: '🎢', label: '', color: '#8b5cf6' };
    PARKS_DATA.push({
      id: parkId, name: meta.name, emoji: meta.emoji, label: meta.label, cls: 'pk-custom', color: meta.color,
      zones: zones.map(z => ({ name: z.name, attractions: z.attractions.map(a => Object.assign({}, a)) })),
    });
    if (!PARK_ICONS[parkId]) PARK_ICONS[parkId] = 'sparkles';
    PARK_COLORS[parkId] = meta.color;
    pkFilterMetaBase.push({ id: parkId, label: meta.name });
  });
  extraZonesApply();
}

function atrTitleCase(s) {
  let t = String(s || '').trim().toLowerCase().replace(/(^|[\s/\-])([a-záéíóúñ])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  // Siglas tipo "U.S.A" quedan en mayúsculas en vez de "U.s.a".
  t = t.replace(/\b(?:[a-z]\.){2,}[a-z]?\b/gi, m => m.toUpperCase());
  return t;
}

// Parsea una hoja de parque. El encabezado se repite antes de cada zona
// pero siempre en las mismas columnas, así que lo buscamos una sola vez
// y después recorremos toda la hoja saltando las repeticiones.
function atrParseHoja(wb, hoja) {
  const XLSX = window.XLSX;
  const filas = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { header: 1, raw: true, defval: '' });
  let hi = -1, head = null;
  for (let i = 0; i < filas.length; i++) {
    const celdas = filas[i].map(itinNorm);
    if (celdas.some(c => c === 'atraccion') && celdas.some(c => c === 'lugar')) { hi = i; head = celdas; break; }
  }
  if (hi === -1) return null;
  const col = (...claves) => head.findIndex(h => h && claves.some(k => h.includes(k)));
  const cName = col('atraccion');
  const cZona = col('lugar');
  const cDur  = col('duracion');
  const cInd  = col('indispensable');
  const cObs  = col('observ');
  const cFila = col('fila', 'tiempo');
  if (cName === -1 || cZona === -1) return null;

  const limpiar = v => { const s = String(v == null ? '' : v).trim(); return s === '-' ? '' : s; };
  const zonasMap = new Map();
  for (let i = hi; i < filas.length; i++) {
    const r = filas[i];
    if (!r || !r.length) continue;
    const nombre = limpiar(r[cName]);
    const zonaRaw = limpiar(r[cZona]);
    if (!nombre || !zonaRaw || itinNorm(nombre) === 'atraccion') continue; // fila vacía o encabezado repetido
    const zona = atrTitleCase(zonaRaw);
    if (!zonasMap.has(zona)) zonasMap.set(zona, []);
    zonasMap.get(zona).push({
      name: nombre,
      duracion: cDur > -1 ? limpiar(r[cDur]) : '',
      indispensable: cInd > -1 ? limpiar(r[cInd]) : '',
      obs: cObs > -1 ? limpiar(r[cObs]) : '',
      fila: cFila > -1 ? limpiar(r[cFila]) : '',
    });
  }
  const zones = [...zonasMap.entries()].map(([name, attractions]) => ({ name, attractions }));
  return zones.length ? zones : null;
}

// Recorre el libro buscando la hoja de cada parque conocido. Devuelve
// { parkId: zones } solo para los que encontró y pudo leer.
function atrParseWorkbook(wb) {
  const out = {};
  ATR_SHEETS.forEach(({ id, match }) => {
    const hoja = wb.SheetNames.find(n => match.some(m => itinNorm(n).includes(itinNorm(m))));
    if (!hoja) return;
    const zones = atrParseHoja(wb, hoja);
    if (zones) out[id] = zones;
  });
  return out;
}

// Aplica lo parseado: reemplaza las zonas de cada parque encontrado y
// migra lo tildado + coordenadas corregidas a mano por nombre.
function atrAplicarImport(datos) {
  Object.keys(datos).forEach(parkId => {
    const parkPrev = allParksList().find(p => p.id === parkId);
    const hechosPorNombre = new Set();
    const coordsPorNombre = new Map();
    if (parkPrev) {
      parkPrev.zones.forEach((z, zi) => z.attractions.forEach((a, ai) => {
        if (pkDone(parkId, zi, ai)) hechosPorNombre.add(pkNorm(a.name));
        const c = pkCoord(parkId, zi, ai, a);
        if (c) coordsPorNombre.set(pkNorm(a.name), c);
      }));
    }
    parquesExcelData[parkId] = { zones: datos[parkId] };
    Object.keys(parquesState).forEach(k => { if (k.startsWith(parkId + '_')) delete parquesState[k]; });
    Object.keys(coordOverrides).forEach(k => { if (k.startsWith(parkId + '_')) delete coordOverrides[k]; });
    datos[parkId].forEach((z, zi) => z.attractions.forEach((a, ai) => {
      const n = pkNorm(a.name);
      if (hechosPorNombre.has(n)) parquesState[pkKey(parkId, zi, ai)] = true;
      if (coordsPorNombre.has(n)) coordOverrides[pkKey(parkId, zi, ai)] = coordsPorNombre.get(n);
    }));
  });
  parquesExcelApply();
  parquesExcelSave();
  parquesSave();
  coordOverridesSave();
}

// ─── Modal de importación ───
let itinImportDias = null;
let itinImportSel = new Set();

function itinOpenImport() { document.getElementById('itin-xlsx-input').click(); }

async function itinArchivoElegido(ev) {
  const file = ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  showMToast('Leyendo el archivo…');
  try {
    await cargarXLSX();
  } catch (e) {
    showAlert('No se pudo cargar el lector de Excel. Probá con señal o wifi, porque la primera vez necesita descargarlo.', 'Sin conexión');
    return;
  }
  let wb;
  try {
    const buf = await file.arrayBuffer();
    wb = window.XLSX.read(buf, { type: 'array' });
  } catch (e) {
    devError('xlsx read', e);
    showAlert('No pude leer el archivo. Revisá que sea un .xlsx válido.', 'No se pudo importar');
    return;
  }

  let itinOk = true;
  try {
    itinImportDias = itinParseWorkbook(wb);
  } catch (e) {
    itinOk = false;
    devError('xlsx parse', e);
  }

  // Además del itinerario, el mismo archivo puede traer las hojas de
  // cada parque (Magic Kingdom, EPCOT, etc.) con las atracciones. Si
  // encuentra alguna, ofrece actualizar la lista de "Atracciones" con
  // eso — independiente de si el itinerario se pudo leer o no.
  let atrDatos = null;
  try { atrDatos = atrParseWorkbook(wb); } catch (e) { devError('xlsx atracciones parse', e); }
  const atrParques = atrDatos ? Object.keys(atrDatos) : [];
  let atrAplicado = false;
  if (atrParques.length) {
    const nombres = atrParques.map(id => (allParksList().find(p => p.id === id) || ATR_NEW_PARK_META[id] || {}).name || id);
    const ok = await showConfirm(
      `Se encontraron atracciones para: ${nombres.join(', ')}. Se reemplazan las zonas y atracciones de esos parques tal cual están en el Excel (lo tildado y las ubicaciones corregidas se mantienen por nombre).`,
      'Actualizar Atracciones', 'Actualizar'
    );
    if (ok) {
      atrAplicarImport(atrDatos);
      renderParques();
      showMToast('Atracciones actualizadas desde el Excel');
      atrAplicado = true;
    }
  }

  if (!itinOk) {
    if (!atrAplicado) {
      showAlert('No encontré la hoja del itinerario ni datos de atracciones. Revisá que sea el .xlsx correcto y que tenga filas cargadas.', 'No se pudo importar');
    }
    return;
  }
  // Por defecto vienen tildados los días de parque (los de outlets no).
  itinImportSel = new Set(itinImportDias.map((d,i) => d.esParque ? i : -1).filter(i => i >= 0));
  if (!itinImportSel.size) itinImportDias.forEach((d,i) => itinImportSel.add(i));
  itinRenderImport();
  document.getElementById('itinImportModal').classList.add('open');
}

function itinRenderImport() {
  const cont = document.getElementById('itin-import-list');
  cont.innerHTML = itinImportDias.map((d,i) => {
    const existe = itinDias.some(x => x.fecha === d.fecha);
    return `<label class="itin-imp-row">
      <input type="checkbox" ${itinImportSel.has(i)?'checked':''} onchange="itinImportToggle(${i},this.checked)">
      <span class="itin-imp-body">
        <strong>${escapeHtml(d.nombre)}</strong>
        <small>${escapeHtml(d.fecha)} · ${d.bloques.length} bloques · ${existe ? 'reemplaza el día que ya tenés' : 'día nuevo'}</small>
      </span>
    </label>`;
  }).join('');
  const n = itinImportSel.size;
  document.getElementById('itin-import-count').textContent =
    n === 0 ? 'No seleccionaste ningún día.' : (n === 1 ? '1 día seleccionado.' : n + ' días seleccionados.');
}
function itinImportToggle(i, v) {
  if (v) itinImportSel.add(i); else itinImportSel.delete(i);
  itinRenderImport();
}
function itinCloseImport() {
  document.getElementById('itinImportModal').classList.remove('open');
  itinImportDias = null;
  itinImportSel = new Set();
}

// Aplica los días elegidos. `modo`:
//  'merge'     → reemplaza los días con la misma fecha y agrega los nuevos
//  'reemplazar'→ deja SOLO los días del archivo
async function itinAplicarImport(modo) {
  if (!itinImportSel.size) { showAlert('Elegí al menos un día para importar.', 'Nada seleccionado'); return; }
  const elegidos = itinImportDias.filter((_, i) => itinImportSel.has(i));
  if (modo === 'reemplazar') {
    const ok = await showConfirm(`Se borra el itinerario actual (${itinDias.length} días) y queda solo lo del archivo.`, '¿Reemplazar todo?', 'Reemplazar');
    if (!ok) return;
  }
  // Los tildes se mantienen por fecha + nombre del bloque, así no se
  // pierde lo ya hecho cuando el archivo trae los mismos bloques.
  const hechosPorNombre = new Set();
  itinDias.forEach(d => d.bloques.forEach(b => {
    if (itinHechos.has(b.id)) hechosPorNombre.add(d.fecha + '|' + itinNorm(b.titulo));
  }));

  const nuevos = elegidos.map(d => ({
    id: itinNewId(),
    fecha: d.fecha,
    nombre: d.nombre,
    parkId: d.parkId,
    nota: (itinDias.find(x => x.fecha === d.fecha) || {}).nota || '',
    bloques: d.bloques.map(b => Object.assign({}, b, { id: itinNewId() + Math.random().toString(36).slice(2,5) })),
  }));

  if (modo === 'reemplazar') {
    itinDias = nuevos;
  } else {
    const fechas = new Set(nuevos.map(d => d.fecha));
    itinDias = itinDias.filter(d => !fechas.has(d.fecha)).concat(nuevos);
    itinDias.sort((a,b) => itinFechaOrden(a.fecha) - itinFechaOrden(b.fecha));
  }

  // Rearmar los tildes sobre los ids nuevos
  const hechos = new Set();
  itinDias.forEach(d => d.bloques.forEach(b => {
    if (hechosPorNombre.has(d.fecha + '|' + itinNorm(b.titulo))) hechos.add(b.id);
  }));
  itinHechos = hechos;

  itinDay = 0;
  itinEditing = null; itinAdding = false; itinEditDay = false;
  itinSave();
  itinCloseImport();
  renderParques();
  showMToast(`Itinerario actualizado (${nuevos.length} ${nuevos.length === 1 ? 'día' : 'días'})`);
}

// "19 ene" → número ordenable. Lo que no se entienda va al final.
function itinFechaOrden(f) {
  const m = String(f || '').match(/(\d{1,2})\s*([a-záéíóú]*)/i);
  if (!m) return 9999;
  const mes = ITIN_MESES.indexOf(itinNorm(m[2]).slice(0,3));
  return (mes === -1 ? 11 : mes) * 100 + parseInt(m[1], 10);
}

// ─── TIPS DEL VIAJE ─────────────────────────────────────────
// Recordatorios cortos que no dan para una sección propia. Se pueden
// agregar, editar y borrar como cualquier otra lista.
const TIPS_KEY = 'orlando-tips-v1';
let tipsItems = tipsDefault();
let tipsAdding = false;
let tipsEditing = null;
let tipsOpen = false;

function tipsDefault() { return []; }
function tipsSave() { syncedSave(TIPS_KEY, tipsItems, 'tips', { items: tipsItems }); }
function tipsLoad() {
  const d = syncedLoad(TIPS_KEY, window._tipsFromFb);
  const items = (d && d.items) ? d.items : (Array.isArray(d) ? d : null);
  if (items) tipsItems = items;
}
window._setTipsData = function(items) { tipsItems = items || []; };

function tipsToggleOpen() { tipsOpen = !tipsOpen; renderOutlets(); }
function renderTips() {
  let html = `<div class="wm-section${tipsOpen ? ' open' : ''}" id="tips-section">
    <div class="wm-section-header" onclick="tipsToggleOpen()">
      <span class="wm-section-icon">${ic('sparkles', 16)}</span>
      <span class="wm-section-title">Tips del viaje</span>
      <span class="wm-section-count">${tipsItems.length}</span>
      <span class="wm-section-chevron">${ic('chevronDown',14)}</span>
    </div>
    <div class="wm-items">`;
  tipsItems.forEach(t => {
    if (tipsEditing === t.id) {
      html += `<div class="wm-item" onclick="event.stopPropagation()" style="cursor:default">
        <div class="wm-edit-form" style="width:100%">
          <textarea class="wm-edit-input" id="tip-edit-txt" style="width:100%;min-height:56px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4;margin-bottom:6px">${escapeHtml(t.texto)}</textarea>
          <div class="wm-edit-actions">
            <button class="mbtn" onclick="tipsCancelEdit()">Cancelar</button>
            <button class="mbtn msave" onclick="tipsSaveEdit('${t.id}')">Guardar</button>
          </div>
        </div>
      </div>`;
      return;
    }
    html += `<div class="wm-item" style="cursor:default">
      <div class="wm-item-body"><div class="tip-text">${escapeHtml(t.texto)}</div></div>
      <button class="wm-icon-btn" onclick="tipsStartEdit('${t.id}')" title="Editar" aria-label="Editar tip">${ic('pencil',13)}</button>
      <button class="wm-icon-btn wm-icon-del" onclick="tipsDelete('${t.id}',event)" title="Eliminar" aria-label="Eliminar tip">${ic('x',13)}</button>
    </div>`;
  });
  if (tipsAdding) {
    html += `<div class="wm-item" onclick="event.stopPropagation()" style="cursor:default">
      <div class="wm-edit-form" style="width:100%">
        <textarea class="wm-edit-input" id="tip-add-txt" placeholder="Escribí el tip…" style="width:100%;min-height:56px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4;margin-bottom:6px"></textarea>
        <div class="wm-edit-actions">
          <button class="mbtn" onclick="tipsCancelAdd()">Cancelar</button>
          <button class="mbtn msave" onclick="tipsAddConfirm()">Agregar</button>
        </div>
      </div>
    </div>`;
  } else {
    html += `<div style="padding:8px 4px"><button class="wm-reset-btn" onclick="tipsStartAdd()">+ Agregar tip</button></div>`;
  }
  html += `</div></div>`;
  return html;
}
function tipsStartAdd() { tipsAdding = true; tipsOpen = true; tipsEditing = null; renderOutlets(); }
function tipsCancelAdd() { tipsAdding = false; renderOutlets(); }
function tipsAddConfirm() {
  const txt = (document.getElementById('tip-add-txt').value || '').trim();
  if (!txt) { showAlert('Escribí el tip antes de agregarlo.', 'Falta el texto'); return; }
  tipsItems.push({ id: 'tp' + Date.now(), texto: txt });
  tipsAdding = false; tipsSave(); renderOutlets(); showMToast('Tip agregado');
}
function tipsStartEdit(id) { tipsEditing = id; tipsAdding = false; renderOutlets(); }
function tipsCancelEdit() { tipsEditing = null; renderOutlets(); }
function tipsSaveEdit(id) {
  const t = tipsItems.find(x => x.id === id);
  const txt = (document.getElementById('tip-edit-txt').value || '').trim();
  if (!txt) { showAlert('El tip no puede quedar vacío.', 'Falta el texto'); return; }
  t.texto = txt; tipsEditing = null; tipsSave(); renderOutlets();
}
function tipsDelete(id, e) {
  e && e.stopPropagation();
  const idx = tipsItems.findIndex(t => t.id === id);
  if (idx === -1) return;
  const [removed] = tipsItems.splice(idx, 1);
  tipsSave(); renderOutlets();
  showUndoToast('Tip eliminado', () => { tipsItems.splice(idx, 0, removed); tipsSave(); renderOutlets(); });
}


// ─── ITINERARIO POR DÍA ─────────────────────────────────────
// Cronograma editable de cada día de parque: bloques con hora, zona,
// tipo y notas, que se van tildando durante el día. Mismo patrón de
// guardado que el resto (localStorage + Firebase).
const ITIN_KEY = 'orlando-itinerario-v1';
let itinDias = itinDefault();
let itinHechos = new Set();
let itinDay = 0;
let itinEditing = null;   // id del bloque en edición
let itinAdding = false;   // agregando bloque al día actual
let itinEditDay = false;  // editando encabezado del día
let itinSoloPend = false;

const ITIN_TIPOS = {
  ride:     { label:'Atracción', icon:'sparkles' },
  show:     { label:'Show',      icon:'masks' },
  comida:   { label:'Comida',    icon:'fork' },
  caminata: { label:'Recorrido', icon:'pin' },
  traslado: { label:'Traslado',  icon:'car' },
  otro:     { label:'Otro',      icon:'calendar' },
};

function itinSave() {
  const payload = { dias: itinDias, hechos: [...itinHechos] };
  syncedSave(ITIN_KEY, payload, 'itinerario', payload);
}
function itinLoad() {
  const d = syncedLoad(ITIN_KEY, window._itinFromFb);
  itinDias = (d && d.dias) ? d.dias : itinDefault();
  itinHechos = new Set((d && d.hechos) || []);
  if (itinDay >= itinDias.length) itinDay = 0;
}
window._setItinData = function(d) {
  if (d.dias !== undefined) itinDias = d.dias;
  if (d.hechos !== undefined) itinHechos = new Set(d.hechos);
  if (itinDay >= itinDias.length) itinDay = 0;
};

function itinGetDay() { return itinDias[itinDay]; }
function itinBloque(id) {
  for (const d of itinDias) { const b = d.bloques.find(x => x.id === id); if (b) return b; }
  return null;
}
function itinNewId() { return 'it' + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

// Orden por hora — los bloques sin hora quedan al final, en su lugar.
// Solo se usa al importar desde Excel o cuando el usuario lo pide a propósito
// (botón "Ordenar por hora"): NO se llama automáticamente al agregar/editar
// un bloque, para no pisar el orden manual que arma con las flechas ↑/↓.
function itinOrdenar(day) {
  day.bloques.sort((a, b) => (a.hora || '99:99').localeCompare(b.hora || '99:99'));
}

// Mueve un bloque una posición hacia arriba (dir=-1) o abajo (dir=1) dentro
// del día actual. El orden se guarda tal cual en itinDias, así que persiste
// (y se sincroniza) igual que cualquier otro cambio del itinerario.
function itinMoveBlock(id, dir) {
  const day = itinGetDay();
  const idx = day.bloques.findIndex(b => b.id === id);
  if (idx === -1) return;
  const j = idx + dir;
  if (j < 0 || j >= day.bloques.length) return;
  const tmp = day.bloques[idx];
  day.bloques[idx] = day.bloques[j];
  day.bloques[j] = tmp;
  itinSave();
  renderParques();
}

// Reordena a mano, a pedido, con el botón "Ordenar por hora" (no automático).
function itinOrdenarManual() {
  itinOrdenar(itinGetDay());
  itinSave();
  renderParques();
  showMToast('Ordenado por hora');
}

function itinFmtDur(b) {
  const partes = [];
  if (b.espera > 0) partes.push('fila ~' + b.espera + ' min');
  if (b.dur > 0) partes.push(b.dur + ' min');
  return partes.join(' · ');
}

function renderItinerario() {
  if (!itinDias.length) {
    return `<div class="all-done" style="display:block">
        <div class="all-done-emoji">${ic('calendar',44)}</div>
        <div class="all-done-title">Sin días cargados</div>
        <div class="all-done-sub">Agregá el primer día del itinerario para empezar.</div>
      </div>
      <div style="display:flex;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="wm-reset-btn" onclick="itinOpenImport()">${ic('file',12)} Importar desde Excel</button>
        <button class="wm-reset-btn" onclick="itinAddDay()">+ Agregar día</button>
      </div>`;
  }
  if (itinDay >= itinDias.length) itinDay = itinDias.length - 1;
  const day = itinGetDay();

  let html = `<div class="outlets-day-tabs">
    ${itinDias.map((d,i) => {
      const fc = forecastForTripDate(d.fecha);
      const wBadge = fc ? `<span class="odt-weather" title="${escapeHtml(WMO[fc.code]||'')} · mín ${fc.tminF}°F">${WI[fc.code]||'🌡️'} ${fc.tmaxF}°</span>` : '';
      const pend = d.bloques.filter(b => !itinHechos.has(b.id)).length;
      return `<button class="outlets-day-tab${i===itinDay?' active':''}" onclick="itinSwitchDay(${i})">${escapeHtml(d.nombre || ('Día ' + (i+1)))}<span class="odt-date">${escapeHtml(d.fecha || '')}${pend===0 && d.bloques.length ? ' ✓' : ''}${wBadge}</span></button>`;
    }).join('')}
    <button class="btn-nav-set" style="margin-left:2px" onclick="itinAddDay()" title="Agregar día">+</button>
  </div>`;

  html += `<div class="outlets-day-content">`;

  // Encabezado del día: nombre, fecha y progreso
  const total = day.bloques.length;
  const done = day.bloques.filter(b => itinHechos.has(b.id)).length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  if (itinEditDay) {
    html += `<div class="stop-card" style="cursor:default;flex-direction:column;align-items:stretch">
      <div class="wm-edit-form" style="width:100%">
        <input class="wm-edit-input" id="itin-day-name" value="${escapeHtml(day.nombre||'')}" placeholder="Nombre del día (ej: EPCOT)" style="margin-bottom:6px;width:100%">
        <input class="wm-edit-input" id="itin-day-fecha" value="${escapeHtml(day.fecha||'')}" placeholder="Fecha (ej: 19 ene)" style="margin-bottom:6px;width:100%">
        <textarea class="wm-edit-input" id="itin-day-nota" placeholder="Nota del día (ej: cierra 22hs, llevar poncho)" style="margin-bottom:6px;width:100%;min-height:48px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4">${escapeHtml(day.nota||'')}</textarea>
        <div class="del-day-row" style="margin:0 0 8px">
          <button class="mbtn" onclick="itinMoveDay(-1)" ${itinDay === 0 ? 'disabled' : ''} title="Mover el día hacia la izquierda">${ic('chevronLeft',13)} Mover</button>
          <button class="mbtn" onclick="itinMoveDay(1)" ${itinDay === itinDias.length - 1 ? 'disabled' : ''} title="Mover el día hacia la derecha">Mover ${ic('chevronRight',13)}</button>
        </div>
        <div class="wm-edit-actions">
          <button class="mbtn mdel" onclick="itinDeleteDay()">Eliminar día</button>
          <button class="mbtn" onclick="itinCancelDay()">Cancelar</button>
          <button class="mbtn msave" onclick="itinSaveDay()">Guardar</button>
        </div>
      </div>
    </div>`;
  } else {
    html += `<div class="itin-daybar">
      <div class="itin-daybar-main">
        <div class="itin-daybar-title">${escapeHtml(day.nombre || 'Día')} <span class="itin-daybar-date">${escapeHtml(day.fecha || '')}</span></div>
        <div class="wm-progress-bar-bg" style="margin-top:6px"><div class="wm-progress-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="itin-daybar-num">${done}<small>/${total}</small></div>
      <button class="wm-icon-btn" onclick="itinStartEditDay()" title="Editar día" aria-label="Editar día">${ic('pencil',14)}</button>
    </div>`;
    if (day.nota) html += `<div class="itin-daynote">${escapeHtml(day.nota)}</div>`;
  }

  html += `<div class="itin-tools">
    ${total > 0 ? `<label class="itin-chk"><input type="checkbox" ${itinSoloPend?'checked':''} onchange="itinTogglePend(this.checked)"> Ver solo lo que falta</label>` : '<span></span>'}
    <span style="display:flex;gap:6px;flex-wrap:wrap">
      ${total > 1 ? `<button class="wm-reset-btn" onclick="itinOrdenarManual()" title="Reordena todos los bloques del día por hora">${ic('calendar',12)} Ordenar por hora</button>` : ''}
      <button class="wm-reset-btn" onclick="itinOpenImport()">${ic('file',12)} Actualizar desde Excel</button>
      ${total > 0 ? `<button class="wm-reset-btn" onclick="itinResetDay()">↺ Destildar día</button>` : ''}
    </span>
  </div>`;

  const visibles = day.bloques.filter(b => !itinSoloPend || !itinHechos.has(b.id));
  if (!visibles.length && total > 0) {
    html += `<div class="all-done" style="display:block">
      <div class="all-done-emoji">${ic('check',40)}</div>
      <div class="all-done-title">Día completo</div>
      <div class="all-done-sub">Ya hiciste todo lo que tenías anotado.</div>
    </div>`;
  }

  visibles.forEach(b => {
    const i = day.bloques.indexOf(b);
    if (itinEditing === b.id) { html += itinEditForm(b, i); return; }
    const hecho = itinHechos.has(b.id);
    const tipo = ITIN_TIPOS[b.tipo] || ITIN_TIPOS.otro;
    const meta = itinFmtDur(b);
    html += `<div class="itin-block${hecho?' done':''}" onclick="itinToggle('${b.id}')">
      <div class="itin-time">${escapeHtml(b.hora || '--:--')}</div>
      <div class="itin-check">${hecho ? '✓' : ''}</div>
      <div class="itin-body">
        <div class="itin-title">${escapeHtml(b.titulo || '(sin nombre)')}</div>
        <div class="itin-meta">
          <span class="itin-tag">${ic(tipo.icon,11)} ${tipo.label}</span>
          ${b.zona ? `<span>${escapeHtml(b.zona)}</span>` : ''}
          ${meta ? `<span>${meta}</span>` : ''}
        </div>
        ${b.obs ? `<div class="itin-obs">${escapeHtml(b.obs)}</div>` : ''}
      </div>
      <div class="itin-actions">
        <div class="itin-move-col">
          <button class="wm-icon-btn itin-move-btn" ${(i===0||itinSoloPend)?'disabled':''} onclick="itinMoveBlock('${b.id}',-1);event.stopPropagation()" title="${itinSoloPend?'Desactivá \'Ver solo lo que falta\' para reordenar':'Subir'}" aria-label="Subir ${escapeHtml(b.titulo)}">${ic('chevronUp',13)}</button>
          <button class="wm-icon-btn itin-move-btn" ${(i===day.bloques.length-1||itinSoloPend)?'disabled':''} onclick="itinMoveBlock('${b.id}',1);event.stopPropagation()" title="${itinSoloPend?'Desactivá \'Ver solo lo que falta\' para reordenar':'Bajar'}" aria-label="Bajar ${escapeHtml(b.titulo)}">${ic('chevronDown',13)}</button>
        </div>
        <button class="wm-icon-btn" onclick="itinStartEdit('${b.id}');event.stopPropagation()" title="Editar" aria-label="Editar ${escapeHtml(b.titulo)}">${ic('pencil',13)}</button>
        <button class="wm-icon-btn wm-icon-del" onclick="itinDelete('${b.id}',event)" title="Eliminar" aria-label="Eliminar ${escapeHtml(b.titulo)}">${ic('x',14)}</button>
      </div>
    </div>`;
  });

  if (itinAdding) {
    html += itinEditForm(null);
  } else {
    html += `<button onclick="itinStartAdd()" class="itin-add-btn">+ Agregar bloque</button>`;
  }

  html += `</div>`;
  return html;
}

function itinEditForm(b, idx) {
  const v = b || { hora:'', titulo:'', zona:'', tipo:'ride', dur:0, espera:0, obs:'' };
  const nuevo = !b;
  return `<div class="stop-card" onclick="event.stopPropagation()" style="cursor:default;flex-direction:column;align-items:stretch">
    ${nuevo ? `<div style="font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;margin-bottom:10px;color:var(--green)">+ Nuevo bloque</div>` : ''}
    <div class="wm-edit-form" style="width:100%">
      <div style="display:grid;grid-template-columns:96px 1fr;gap:6px;margin-bottom:6px">
        <input class="wm-edit-input" id="itin-f-hora" type="time" value="${escapeHtml(v.hora)}">
        <input class="wm-edit-input" id="itin-f-titulo" value="${escapeHtml(v.titulo)}" placeholder="Qué hacés (ej: Test Track)">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <select class="wm-edit-input" id="itin-f-tipo">
          ${Object.entries(ITIN_TIPOS).map(([k,t]) => `<option value="${k}"${v.tipo===k?' selected':''}>${t.label}</option>`).join('')}
        </select>
        <input class="wm-edit-input" id="itin-f-zona" value="${escapeHtml(v.zona)}" placeholder="Zona (ej: World Nature)">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <input class="wm-edit-input" id="itin-f-espera" type="number" min="0" step="5" value="${v.espera||''}" placeholder="Fila estimada (min)">
        <input class="wm-edit-input" id="itin-f-dur" type="number" min="0" step="5" value="${v.dur||''}" placeholder="Duración (min)">
      </div>
      <textarea class="wm-edit-input" id="itin-f-obs" placeholder="Notas (Lightning Lane, single rider, de agua…)" style="margin-bottom:6px;width:100%;min-height:52px;resize:vertical;font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4">${escapeHtml(v.obs)}</textarea>
      <div class="wm-edit-actions">
        <button class="mbtn" onclick="${nuevo ? 'itinCancelAdd()' : 'itinCancelEdit()'}">Cancelar</button>
        <button class="mbtn msave" onclick="${nuevo ? 'itinAddConfirm()' : `itinSaveEdit('${b.id}')`}">${nuevo ? 'Agregar' : 'Guardar'}</button>
      </div>
    </div>
  </div>`;
}

function itinLeerForm() {
  const val = id => (document.getElementById(id) || {}).value || '';
  const num = id => { const n = parseInt(val(id), 10); return isNaN(n) || n < 0 ? 0 : n; };
  return {
    hora: val('itin-f-hora').trim(),
    titulo: val('itin-f-titulo').trim(),
    zona: val('itin-f-zona').trim(),
    tipo: val('itin-f-tipo') || 'otro',
    espera: num('itin-f-espera'),
    dur: num('itin-f-dur'),
    obs: val('itin-f-obs').trim(),
  };
}

function itinSwitchDay(i) { itinDay = i; itinEditing = null; itinAdding = false; itinEditDay = false; renderParques(); }
function itinTogglePend(v) { itinSoloPend = v; renderParques(); }

function itinToggle(id) {
  if (itinHechos.has(id)) itinHechos.delete(id); else itinHechos.add(id);
  itinSave();
  renderParques();
}
function itinStartEdit(id) { itinEditing = id; itinAdding = false; renderParques(); }
function itinCancelEdit() { itinEditing = null; renderParques(); }
function itinSaveEdit(id) {
  const b = itinBloque(id);
  const f = itinLeerForm();
  if (!f.titulo) { showAlert('Escribí qué hacés en este bloque.', 'Falta el nombre'); return; }
  Object.assign(b, f);
  itinEditing = null;
  itinSave();
  renderParques();
}
function itinStartAdd() { itinAdding = true; itinEditing = null; renderParques(); }
function itinCancelAdd() { itinAdding = false; renderParques(); }
function itinAddConfirm() {
  const f = itinLeerForm();
  if (!f.titulo) { showAlert('Escribí qué hacés en este bloque.', 'Falta el nombre'); return; }
  itinGetDay().bloques.push(Object.assign({ id: itinNewId() }, f));
  itinAdding = false;
  itinSave();
  renderParques();
  showMToast('Bloque agregado');
}
function itinDelete(id, e) {
  e && e.stopPropagation();
  const day = itinGetDay();
  const idx = day.bloques.findIndex(b => b.id === id);
  if (idx === -1) return;
  const [removed] = day.bloques.splice(idx, 1);
  const estaba = itinHechos.has(id);
  itinHechos.delete(id);
  itinSave();
  renderParques();
  showUndoToast(`"${removed.titulo}" eliminado`, () => {
    day.bloques.splice(idx, 0, removed);
    if (estaba) itinHechos.add(id);
    itinSave();
    renderParques();
  });
}

function itinMoveDay(dir) {
  const j = itinDay + dir;
  if (j < 0 || j >= itinDias.length) return;
  // Los botones viven dentro del formulario del día: si hay algo tipeado
  // sin guardar, lo conservamos antes de re-renderizar.
  itinAplicarFormDia();
  [itinDias[itinDay], itinDias[j]] = [itinDias[j], itinDias[itinDay]];
  itinDay = j;
  itinSave();
  renderParques();
}

function itinAddDay() {
  const n = itinDias.length + 1;
  itinDias.push({ id: itinNewId(), fecha: '', nombre: 'Día ' + n, parkId: '', bloques: [] });
  itinDay = itinDias.length - 1;
  itinEditDay = true;
  itinSave();
  renderParques();
}
function itinStartEditDay() { itinEditDay = true; renderParques(); }
function itinCancelDay() { itinEditDay = false; renderParques(); }
function itinAplicarFormDia() {
  const nom = document.getElementById('itin-day-name');
  if (!nom) return;
  const day = itinGetDay();
  day.nombre = (nom.value || '').trim() || day.nombre;
  day.fecha = (document.getElementById('itin-day-fecha').value || '').trim();
  day.nota = (document.getElementById('itin-day-nota').value || '').trim();
}
function itinSaveDay() {
  const day = itinGetDay();
  day.nombre = (document.getElementById('itin-day-name').value || '').trim() || ('Día ' + (itinDay + 1));
  day.fecha = (document.getElementById('itin-day-fecha').value || '').trim();
  day.nota = (document.getElementById('itin-day-nota').value || '').trim();
  itinEditDay = false;
  itinSave();
  renderParques();
}
async function itinDeleteDay() {
  const day = itinGetDay();
  const ok = await showConfirm(`Se elimina "${day.nombre}" con sus ${day.bloques.length} bloques.`, '¿Eliminar el día?', 'Eliminar');
  if (!ok) return;
  day.bloques.forEach(b => itinHechos.delete(b.id));
  itinDias.splice(itinDay, 1);
  if (itinDay >= itinDias.length) itinDay = Math.max(0, itinDias.length - 1);
  itinEditDay = false;
  itinSave();
  renderParques();
}
async function itinResetDay() {
  const day = itinGetDay();
  const ok = await showConfirm(`Se destildan los bloques de "${day.nombre}".`, '¿Destildar el día?', 'Destildar', true);
  if (!ok) return;
  day.bloques.forEach(b => itinHechos.delete(b.id));
  itinSave();
  renderParques();
}

function itinDefault() { return []; }

// ─── MODAL: agregar parque personalizado ──────────────────────────
let pkAddParkColor = PARK_COLOR_OPTIONS[0];
let pkWikiCandidates = []; // [{name, checked}] — resultado de la búsqueda automática, editable antes de guardar

function pkOpenAddParkModal() {
  const nameEl = document.getElementById('pk-add-name');
  nameEl.value = '';
  nameEl.classList.remove('error');
  document.getElementById('pk-add-name-err').classList.remove('show');
  pkAddParkColor = PARK_COLOR_OPTIONS[Math.floor(Math.random() * PARK_COLOR_OPTIONS.length)];
  pkRenderColorSwatches();
  pkWikiCandidates = [];
  document.getElementById('pk-wiki-status').textContent = '';
  document.getElementById('pk-wiki-results').style.display = 'none';
  document.getElementById('pk-wiki-results').innerHTML = '';
  document.getElementById('addParkModal').classList.add('open');
}
function pkCloseAddParkModal() {
  document.getElementById('addParkModal').classList.remove('open');
}
function pkRenderColorSwatches() {
  const wrap = document.getElementById('pk-color-swatches');
  if (!wrap) return;
  wrap.innerHTML = PARK_COLOR_OPTIONS.map(c =>
    `<button type="button" class="pk-color-swatch${c === pkAddParkColor ? ' active' : ''}" style="background:${c}" onclick="pkPickColor('${c}')" aria-label="Elegir color"></button>`
  ).join('');
}
function pkPickColor(c) { pkAddParkColor = c; pkRenderColorSwatches(); }

// Búsqueda automática en Wikipedia: es un intento "best effort" — Wikipedia
// no tiene una API pensada para esto, así que se busca el artículo del
// parque, se ubica una sección tipo "Attractions"/"Rides" y se extraen los
// nombres de su lista. La calidad depende de cómo esté armado ese artículo
// puntual; por eso el resultado siempre se muestra para revisar y destildar
// antes de guardarlo, nunca se importa directo.
async function pkWikiSearchAttractions(parkName) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(parkName)}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData && searchData[1] && searchData[1][0];
    if (!title) return { ok: false, reason: 'not_found' };

    const sectionsUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=sections&format=json&origin=*`;
    const sectionsRes = await fetch(sectionsUrl);
    const sectionsData = await sectionsRes.json();
    const sections = (sectionsData.parse && sectionsData.parse.sections) || [];
    const target = sections.find(s => /attraction|ride|roller.?coaster/i.test(s.line));
    if (!target) return { ok: false, reason: 'no_section', title };

    const wikitextUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&section=${target.index}&format=json&origin=*`;
    const wikitextRes = await fetch(wikitextUrl);
    const wikitextData = await wikitextRes.json();
    const wikitext = wikitextData.parse && wikitextData.parse.wikitext && wikitextData.parse.wikitext['*'];
    if (!wikitext) return { ok: false, reason: 'no_wikitext', title };

    const names = pkParseAttractionNames(wikitext);
    if (names.length === 0) return { ok: false, reason: 'empty', title };
    return { ok: true, title, names };
  } catch (e) {
    devError('pkWikiSearchAttractions error', e);
    return { ok: false, reason: 'error' };
  }
}

// Parsea la sección de wikitext buscando nombres de atracciones. Wikipedia
// no tiene una estructura uniforme entre parques: unos usan lista simple
// (líneas con *), otros una tabla (wikitable) con una fila por atracción y
// columnas de tipo/año/estado además del nombre. Si tratáramos cualquier
// línea que empieza con "|" como un nombre, mezclaríamos esas otras
// columnas (año, tipo, estado) como si fueran atracciones — por eso acá
// llevamos control de en qué fila de la tabla estamos y solo tomamos la
// PRIMERA celda de cada fila (asumiendo que el nombre va primero, que es
// la convención más común en estas tablas de Wikipedia).
function pkParseAttractionNames(wikitext) {
  const names = [];
  let inTable = false;
  let rowNameFound = false; // ya se encontró el nombre para la fila actual
  wikitext.split('\n').forEach(raw => {
    let line = raw.trim();

    if (line.startsWith('{|')) { inTable = true; rowNameFound = false; return; }
    if (line.startsWith('|}')) { inTable = false; return; }
    if (line.startsWith('|-')) { rowNameFound = false; return; }
    if (line.startsWith('!')) { return; } // celda de encabezado de tabla

    let candidate;
    if (inTable) {
      if (!line.startsWith('|') || rowNameFound) return; // ya se tomó el nombre de esta fila, o es otra columna
      candidate = line.replace(/^\|\s*/, '');
      // Formato "| Nombre || Tipo || Año || Estado" en una sola línea:
      // quedarnos solo con la primera celda.
      candidate = candidate.split('||')[0].trim();
      // Si la primera celda de la fila es una imagen, no sirve como
      // nombre — seguimos esperando la próxima celda de esta misma fila.
      if (/^\[\[\s*(File|Image)\s*:/i.test(candidate) || /\.(jpe?g|png|svg|gif)\b/i.test(candidate)) return;
    } else if (line.startsWith('*')) {
      candidate = line.replace(/^\*+\s*/, '');
    } else {
      return;
    }

    candidate = candidate.replace(/<ref[^>]*>.*?<\/ref>/gi, '').replace(/<ref[^>]*\/>/gi, '');
    candidate = candidate.replace(/\{\{[^}]*\}\}/g, '');
    candidate = candidate.replace(/<[^>]+>/g, ''); // <br/>, <small>, etc. sueltos
    const wikilink = candidate.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
    let name;
    if (wikilink) {
      name = (wikilink[2] || wikilink[1]).trim();
    } else {
      name = candidate.replace(/'''/g, '').replace(/''/g, '').trim();
      name = name.split(/\s+[–—-]\s+/)[0];
      name = name.split('(')[0].trim();
    }
    name = name.replace(/\[\[|\]\]/g, '').trim();
    if (name && name.length > 1 && name.length < 60 && !/^\d+$/.test(name)) {
      names.push(name);
      if (inTable) rowNameFound = true;
    }
  });
  return [...new Set(names)].slice(0, 40);
}

async function pkWikiSearchClick() {
  const nameEl = document.getElementById('pk-add-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.classList.add('error');
    document.getElementById('pk-add-name-err').classList.add('show');
    return;
  }
  const statusEl = document.getElementById('pk-wiki-status');
  statusEl.textContent = 'Buscando en Wikipedia…';
  document.getElementById('pk-wiki-results').style.display = 'none';
  const result = await pkWikiSearchAttractions(name);
  if (!result.ok) {
    statusEl.textContent = 'No pude encontrar una lista automática para ese parque — creá el parque y agregá las atracciones a mano con "+ Agregar atracción".';
    pkWikiCandidates = [];
    return;
  }
  pkWikiCandidates = result.names.map(n => ({ name: n, checked: true }));
  statusEl.textContent = `Encontradas ${pkWikiCandidates.length} en el artículo "${result.title}" — revisá y destildá las que no correspondan antes de crear el parque:`;
  pkRenderWikiResults();
}
function pkRenderWikiResults() {
  const wrap = document.getElementById('pk-wiki-results');
  if (!wrap) return;
  if (pkWikiCandidates.length === 0) { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
  wrap.style.display = 'block';
  wrap.innerHTML = pkWikiCandidates.map((c, i) =>
    `<label class="pk-wiki-item">
      <input type="checkbox" ${c.checked ? 'checked' : ''} onchange="pkWikiCandidates[${i}].checked=this.checked">
      <span>${escapeHtml(c.name)}</span>
    </label>`
  ).join('');
}

function pkCreateCustomPark() {
  const nameEl = document.getElementById('pk-add-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.classList.add('error');
    document.getElementById('pk-add-name-err').classList.add('show');
    return;
  }
  const id = 'custom_' + Date.now();
  const selected = pkWikiCandidates.filter(c => c.checked).map(c => ({ name: c.name, _custom: true }));
  const park = {
    id, name, label: 'Parque personalizado', cls: 'pk-custom', color: pkAddParkColor,
    zones: [{ name: 'Atracciones', attractions: selected }]
  };
  customParks.push(park);
  PARK_COLORS[id] = pkAddParkColor;
  customParksSave();
  pkOpenCards.add(id);
  pkCloseAddParkModal();
  renderParques();
  showMToast('Parque agregado');
}

async function pkDeleteCustomPark(parkId) {
  const park = customParks.find(p => p.id === parkId);
  if (!park) return;
  const ok = await showConfirm(`Se va a borrar "${park.name}" y todas sus atracciones.`, '¿Eliminar parque?', 'Eliminar');
  if (!ok) return;
  customParks = customParks.filter(p => p.id !== parkId);
  customParksSave();
  // Limpiar el progreso guardado de ese parque
  Object.keys(parquesState).filter(k => k.startsWith(parkId + '_')).forEach(k => delete parquesState[k]);
  parquesSave();
  renderParques();
  showMToast('Parque eliminado');
}

// ─── MODAL: agregar atracción a cualquier parque ──────────────────
let pkAddAttrParkId = null;
function pkOpenAddAttrModal(parkId) {
  pkAddAttrParkId = parkId;
  const nameEl = document.getElementById('pk-attr-add-name');
  nameEl.value = '';
  nameEl.classList.remove('error');
  document.getElementById('pk-attr-add-name-err').classList.remove('show');
  document.getElementById('pk-attr-add-height').value = '';
  document.getElementById('pk-attr-add-address').value = '';
  document.getElementById('pk-attr-add-lat').value = '';
  document.getElementById('pk-attr-add-lng').value = '';
  document.getElementById('pk-attr-loc-status').textContent = '';
  document.getElementById('addAttrModal').classList.add('open');
}
function pkCloseAddAttrModal() {
  document.getElementById('addAttrModal').classList.remove('open');
}
async function pkAttrLocSearchAuto() {
  const name = document.getElementById('pk-attr-add-name').value.trim();
  const statusEl = document.getElementById('pk-attr-loc-status');
  if (!name) { statusEl.textContent = 'Escribí primero el nombre de la atracción.'; return; }
  const park = allParksList().find(p => p.id === pkAddAttrParkId);
  statusEl.textContent = 'Buscando en Wikipedia…';
  const result = await geoAutoSearch(name, park && park.name);
  if (!result) { statusEl.textContent = 'No encontré esta atracción ni en Wikipedia ni por dirección — probá con una dirección manual o cargá las coordenadas a mano.'; return; }
  document.getElementById('pk-attr-add-lat').value = result.lat.toFixed(6);
  document.getElementById('pk-attr-add-lng').value = result.lng.toFixed(6);
  statusEl.textContent = result.source === 'wikipedia' ? `Encontrado en "${result.title}".` : 'Encontrado por dirección aproximada — revisalo bien.';
}
async function pkAttrLocSearchAddress() {
  const address = document.getElementById('pk-attr-add-address').value.trim();
  const statusEl = document.getElementById('pk-attr-loc-status');
  if (!address) { statusEl.textContent = 'Escribí una dirección primero.'; return; }
  statusEl.textContent = 'Buscando dirección…';
  const result = await geoNominatimAddress(address);
  if (!result) { statusEl.textContent = 'No encontré esa dirección.'; return; }
  document.getElementById('pk-attr-add-lat').value = result.lat.toFixed(6);
  document.getElementById('pk-attr-add-lng').value = result.lng.toFixed(6);
  statusEl.textContent = 'Dirección encontrada.';
}
function pkAddAttraction() {
  const nameEl = document.getElementById('pk-attr-add-name');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.classList.add('error');
    document.getElementById('pk-attr-add-name-err').classList.add('show');
    return;
  }
  const height = document.getElementById('pk-attr-add-height').value.trim();
  const lat = parseFloat(document.getElementById('pk-attr-add-lat').value);
  const lng = parseFloat(document.getElementById('pk-attr-add-lng').value);
  const attr = { name, _custom: true };
  if (height) attr.height = height;
  if (!isNaN(lat) && !isNaN(lng)) { attr.lat = lat; attr.lng = lng; }

  const park = allParksList().find(p => p.id === pkAddAttrParkId);
  if (!park) return;

  if (pkIsCustomPark(park.id)) {
    let zone = park.zones[0];
    if (!zone) { zone = { name: 'Atracciones', attractions: [] }; park.zones.push(zone); }
    zone.attractions.push(attr);
    customParksSave();
  } else {
    let zone = park.zones.find(z => z._extra);
    if (!zone) { zone = { name: 'Agregado por vos', attractions: [], _extra: true }; park.zones.push(zone); }
    zone.attractions.push(attr);
    extraZones[park.id] = zone;
    extraZonesSave();
  }
  pkOpenCards.add(park.id);
  pkCloseAddAttrModal();
  renderParques();
  showMToast('Atracción agregada');
}

// Solo se puede borrar una atracción que el usuario agregó a mano
// (attr._custom) — las curadas del parque quedan protegidas.
function pkDeleteAttraction(parkId, zoneIdx, attrIdx, e) {
  e && e.stopPropagation();
  const park = allParksList().find(p => p.id === parkId);
  if (!park) return;
  const zone = park.zones[zoneIdx];
  if (!zone) return;
  const [removed] = zone.attractions.splice(attrIdx, 1);
  const prefix = `${parkId}_${zoneIdx}_`;
  const wasDone = !!parquesState[prefix + attrIdx];

  const reindex = (shiftUp) => {
    const rebuilt = {};
    Object.keys(parquesState).forEach(k => {
      if (k.startsWith(prefix)) {
        const idx = parseInt(k.slice(prefix.length), 10);
        if (!shiftUp && idx === attrIdx) return;
        const newIdx = shiftUp ? (idx >= attrIdx ? idx + 1 : idx) : (idx > attrIdx ? idx - 1 : idx);
        rebuilt[prefix + newIdx] = parquesState[k];
      } else {
        rebuilt[k] = parquesState[k];
      }
    });
    parquesState = rebuilt;
  };
  reindex(false);
  parquesSave();
  const isCustom = pkIsCustomPark(parkId);
  if (isCustom) customParksSave(); else extraZonesSave();
  renderParques();

  showUndoToast(`"${removed.name}" eliminada`, () => {
    zone.attractions.splice(attrIdx, 0, removed);
    reindex(true);
    if (wasDone) parquesState[prefix + attrIdx] = true;
    parquesSave();
    if (isCustom) customParksSave(); else extraZonesSave();
    renderParques();
  });
}

// ─── EXPORTAR / IMPORTAR TODO (backup en JSON) ────────────────────
function exportAllData() {
  const payload = {
    _app: 'orlando-planning',
    _exportedAt: new Date().toISOString(),
    hotel,
    days,
    visited: visited.map(s => [...s]),
    mealData,
    wmData,
    wmChecked: [...wmChecked],
    shopItems,
    shopChecked: [...shopChecked],
    customParks,
    extraZones,
    coordOverrides,
    parquesExcel: parquesExcelData,
    parquesState,
    tipsItems,
    itinDias,
    itinHechos: [...itinHechos],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orlando-planning-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showMToast('Backup descargado');
}

async function importAllData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch (e) {
      await showAlert('El archivo no es un JSON válido.');
      event.target.value = '';
      return;
    }
    const ok = await showConfirm(
      data._app === 'orlando-planning'
        ? 'Se van a reemplazar TODOS los datos actuales (outlets, comidas, market, parques) por los del archivo.'
        : 'Este archivo no parece un backup de esta app, pero se puede intentar igual. Se van a reemplazar TODOS los datos actuales.',
      '¿Importar backup?', 'Importar', true
    );
    if (!ok) { event.target.value = ''; return; }

    if (data.hotel) Object.assign(hotel, data.hotel);
    if (data.days) { days.length = 0; data.days.forEach(d => days.push(d)); }
    if (data.visited) { visited.length = 0; data.visited.forEach(arr => visited.push(new Set(arr))); }
    syncVisitedLength(true); // siempre un Set de visitadas por día
    if (data.mealData) mealData = data.mealData;
    if (data.wmData) wmData = data.wmData;
    if (data.wmChecked) { wmChecked.clear(); data.wmChecked.forEach(k => wmChecked.add(k)); }
    if (data.shopItems) shopItems = data.shopItems;
    if (data.shopChecked) { shopChecked.clear(); data.shopChecked.forEach(k => shopChecked.add(k)); }
    if (data.parquesExcel) parquesExcelData = data.parquesExcel;
    if (data.customParks) {
      customParks = data.customParks;
      customParks.forEach(p => { if (p.color) PARK_COLORS[p.id] = p.color; });
    }
    if (data.extraZones) extraZones = data.extraZones;
    // Rearma PARKS_DATA desde el Excel importado y reaplica las zonas a mano
    // (sin duplicarlas, porque PARKS_DATA se reconstruye desde cero).
    if (data.parquesExcel || data.extraZones) parquesExcelApply();
    if (data.coordOverrides) coordOverrides = data.coordOverrides;
    if (data.parquesState) parquesState = data.parquesState;
    if (data.tipsItems) tipsItems = data.tipsItems;
    if (data.itinDias) itinDias = data.itinDias;
    if (data.itinHechos) { itinHechos.clear(); data.itinHechos.forEach(k => itinHechos.add(k)); }

    hotelSave(); saveState(); mealSave(); wmSave(); shopSave();
    customParksSave(); extraZonesSave(); coordOverridesSave(); parquesExcelSave(); parquesSave(); itinSave(); tipsSave();

    currentOutletDay = 0;
    closeSettingsDrawer();
    switchSection('outlets');
    showMToast('Datos importados');
    event.target.value = '';
  };
  reader.readAsText(file);
}

// ─── VACIAR TODO POR SECCIÓN (para arrancar un viaje distinto) ────
async function wipeSection(section) {
  if (section === 'outlets') return wipeOutlets();
  if (section === 'comidas') return wipeComidas();
  if (section === 'walmart') return wipeWalmart();
  if (section === 'parques') return wipeParques();
}
async function wipeOutlets() {
  const ok = await showConfirm('Se van a borrar TODOS los días y paradas del cronograma de Outlets (la lista de compras y el checklist no se tocan).', '¿Vaciar cronograma?', 'Vaciar', true);
  if (!ok) return;
  days.length = 0;
  visited.length = 0;
  currentOutletDay = 0;
  saveState();
  closeSettingsDrawer();
  switchSection('outlets');
  showMToast('Cronograma vaciado');
}
async function wipeComidas() {
  const ok = await showConfirm('Se van a borrar TODOS los días del plan de comidas.', '¿Vaciar Comidas?', 'Vaciar', true);
  if (!ok) return;
  mealData = [];
  mealSave();
  closeSettingsDrawer();
  switchSection('comidas');
  showMToast('Comidas vaciado');
}
async function wipeWalmart() {
  const ok = await showConfirm('Se van a borrar TODOS los productos de la lista de Market (las categorías quedan, para agregar productos nuevos).', '¿Vaciar Market?', 'Vaciar', true);
  if (!ok) return;
  wmData.forEach(cat => { cat.items = []; });
  wmChecked.clear();
  wmSave();
  closeSettingsDrawer();
  switchSection('walmart');
  showMToast('Market vaciado');
}
async function wipeParques() {
  const ok = await showConfirm('Se van a borrar todos los parques (los agregados a mano y los importados desde Excel), sus atracciones y todo el progreso marcado.', '¿Vaciar Parques?', 'Vaciar', true);
  if (!ok) return;
  customParks = [];
  extraZones = {};
  coordOverrides = {};
  parquesExcelData = {};
  parquesExcelApply(); // sin datos de Excel deja PARKS_DATA vacío
  parquesState = {};
  pkFilter = 'all';
  pkOpenCards.clear();
  customParksSave();
  extraZonesSave();
  coordOverridesSave();
  parquesExcelSave();
  parquesSave();
  closeSettingsDrawer();
  switchSection('parques');
  showMToast('Parques vaciado');
}

// ─── MODAL: ubicación de una atracción (una por una) ──────────────
let pkLocTarget = null; // { parkId, zoneIdx, attrIdx }
function pkOpenLocationModal(parkId, zoneIdx, attrIdx) {
  const park = allParksList().find(p => p.id === parkId);
  const zone = park && park.zones[zoneIdx];
  const attr = zone && zone.attractions[attrIdx];
  if (!attr) return;
  pkLocTarget = { parkId, zoneIdx, attrIdx };
  document.getElementById('pk-loc-title').textContent = attr.name;
  document.getElementById('pk-loc-subtitle').textContent = park.name;
  document.getElementById('pk-loc-address').value = '';
  document.getElementById('pk-loc-status').textContent = '';
  document.getElementById('pk-loc-lat').value = attr.lat != null ? attr.lat : (coordOverrides[`${parkId}_${zoneIdx}_${attrIdx}`]?.lat ?? '');
  document.getElementById('pk-loc-lng').value = attr.lng != null ? attr.lng : (coordOverrides[`${parkId}_${zoneIdx}_${attrIdx}`]?.lng ?? '');
  document.getElementById('locationModal').classList.add('open');
}
function pkCloseLocationModal() {
  document.getElementById('locationModal').classList.remove('open');
  pkLocTarget = null;
}
async function pkLocSearchAuto() {
  if (!pkLocTarget) return;
  const park = allParksList().find(p => p.id === pkLocTarget.parkId);
  const attr = park.zones[pkLocTarget.zoneIdx].attractions[pkLocTarget.attrIdx];
  const statusEl = document.getElementById('pk-loc-status');
  statusEl.textContent = 'Buscando en Wikipedia…';
  const result = await geoAutoSearch(attr.name, park.name);
  if (!result) {
    statusEl.textContent = 'No encontré esta atracción ni en Wikipedia ni por dirección — probá escribiendo una dirección más específica o cargá las coordenadas a mano.';
    return;
  }
  document.getElementById('pk-loc-lat').value = result.lat.toFixed(6);
  document.getElementById('pk-loc-lng').value = result.lng.toFixed(6);
  statusEl.textContent = result.source === 'wikipedia'
    ? `Encontrado en el artículo "${result.title}" — revisá el pin y guardá si está bien.`
    : 'Encontrado por dirección aproximada (Wikipedia no tenía esta atracción) — revisá bien el pin antes de guardar.';
}
async function pkLocSearchAddress() {
  const address = document.getElementById('pk-loc-address').value.trim();
  const statusEl = document.getElementById('pk-loc-status');
  if (!address) { statusEl.textContent = 'Escribí una dirección primero.'; return; }
  statusEl.textContent = 'Buscando dirección…';
  const result = await geoNominatimAddress(address);
  if (!result) {
    statusEl.textContent = 'No encontré esa dirección — probá con más detalle (ej. agregá la ciudad).';
    return;
  }
  document.getElementById('pk-loc-lat').value = result.lat.toFixed(6);
  document.getElementById('pk-loc-lng').value = result.lng.toFixed(6);
  statusEl.textContent = 'Dirección encontrada — revisá el pin y guardá si está bien.';
}
function pkSaveLocation() {
  if (!pkLocTarget) return;
  const lat = parseFloat(document.getElementById('pk-loc-lat').value);
  const lng = parseFloat(document.getElementById('pk-loc-lng').value);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    document.getElementById('pk-loc-status').textContent = 'Coordenadas inválidas.';
    return;
  }
  pkSaveCoord(pkLocTarget.parkId, pkLocTarget.zoneIdx, pkLocTarget.attrIdx, lat, lng);
  pkCloseLocationModal();
  renderParques();
  showMToast('Ubicación guardada');
}
// Guarda coordenadas en el lugar correcto: directo en el objeto si la
// atracción es de un parque/zona propios del usuario (se persisten
// completos), o en coordOverrides si es una atracción curada de PARKS_DATA
// (que es código y no se puede editar de forma permanente).
function pkSaveCoord(parkId, zoneIdx, attrIdx, lat, lng) {
  const park = allParksList().find(p => p.id === parkId);
  if (!park) return;
  const zone = park.zones[zoneIdx];
  const attr = zone && zone.attractions[attrIdx];
  if (!attr) return;
  if (pkIsCustomPark(parkId)) {
    attr.lat = lat; attr.lng = lng;
    customParksSave();
  } else if (zone._extra) {
    attr.lat = lat; attr.lng = lng;
    extraZonesSave();
  } else {
    pkSetCoordOverride(parkId, zoneIdx, attrIdx, lat, lng);
  }
}

// ─── Verificación automática en lote, parque por parque ───────────
// Recorre las atracciones del parque y busca cada una en Wikipedia, con
// una pausa entre pedidos para no saturar la API. Nunca pisa una
// corrección que el usuario ya haya guardado a mano; sólo completa lo
// que falta o lo que sigue con la coordenada original sin revisar.
async function pkVerifyParkCoords(parkId) {
  const park = allParksList().find(p => p.id === parkId);
  if (!park) return;
  const btn = document.getElementById(`pk-verify-btn-${parkId}`);
  const targets = [];
  park.zones.forEach((zone, zi) => zone.attractions.forEach((attr, ai) => targets.push({ zi, ai, attr })));
  if (targets.length === 0) return;

  const ok = await showConfirm(
    `Se va a buscar la ubicación de las ${targets.length} atracciones de "${park.name}" (primero en Wikipedia, y si no aparece, por dirección aproximada). Puede tardar uno o dos minutos. Las que ya corregiste a mano no se tocan.`,
    '¿Verificar coordenadas?', 'Verificar'
  );
  if (!ok) return;

  let found = 0, checked = 0;
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando 0/' + targets.length + '…'; }

  for (const t of targets) {
    const key = `${parkId}_${t.zi}_${t.ai}`;
    if (coordOverrides[key]) { checked++; continue; } // ya corregida a mano, no se toca
    const result = await geoAutoSearch(t.attr.name, park.name);
    if (result) {
      pkSaveCoord(parkId, t.zi, t.ai, result.lat, result.lng);
      found++;
    }
    checked++;
    if (btn) btn.textContent = `Verificando ${checked}/${targets.length}…`;
    await geoSleep(500); // ser prudente con las APIs públicas (Wikipedia + Nominatim)
  }

  if (btn) { btn.disabled = false; btn.innerHTML = ic('pin', 12) + ' Verificar coordenadas'; }
  renderParques();
  showMToast(`Corregidas ${found} de ${targets.length}`);
}
