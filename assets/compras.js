import { fsNet } from "./fs-net.js";
const onReady = f => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", f) : setTimeout(f, 0);
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, setDoc, getDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(FB);

const auth = getAuth(app);

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

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
  isTokenAutoRefreshEnabled: true
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

let currentUser = null;

const perfilId = localStorage.getItem("perfilActivoId");

const GASTOS_CACHE_KEY = "taxusa_gastos_cache_" + (perfilId || "default");
const gastosCacheKey = () => GASTOS_CACHE_KEY + "::" + (currentUser?.uid || localStorage.getItem("taxusa_offline_uid") || "sin-usuario");

const BUDGET_CACHE_KEY = "taxusa_budget_cache_" + (perfilId || "default");
function currentBudgetKey() {
  const id = currentUser && perfilId ? window.TripContext.view(currentUser.uid, perfilId) : "orlando";
  const uid = currentUser?.uid || localStorage.getItem("taxusa_offline_uid") || "sin-usuario";
  return BUDGET_CACHE_KEY + "::" + uid + (id === "orlando" ? "" : "::" + id);
}
function currentBudgetRef() {
  const id=window.TripContext.view(currentUser.uid,perfilId);
  return id==="unassigned"?null:id==="orlando"?doc(db,"usuarios",currentUser.uid,"perfiles",perfilId):doc(db,"usuarios",currentUser.uid,"perfiles",perfilId,"tripPlanning",id);
}
function currentBudgetField() { return window.TripContext.view(currentUser.uid,perfilId)==="orlando"?"presupuesto":"taxflyBudget"; }

const PENDING_GASTOS_KEY = "taxusa_gastos_pending_" + (perfilId || "default");
const pendingGastosKey = () => PENDING_GASTOS_KEY + "::" + (currentUser?.uid || "sin-usuario");

function guardarGastosEnCache(gastos) {
  try {
    localStorage.setItem(gastosCacheKey(), JSON.stringify(gastos));
  } catch (e) {}
}

function cargarGastosDesdeCache() {
  try {
    const raw = localStorage.getItem(gastosCacheKey());
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function guardarPresupuestoEnCache(v) {
  try {
    localStorage.setItem(currentBudgetKey(), String(v));
  } catch (e) {}
}

function cargarPresupuestoDesdeCache() {
  const v = localStorage.getItem(currentBudgetKey());
  return v !== null ? parseFloat(v) : null;
}

function getPendingGastos() {
  try {
    return JSON.parse(localStorage.getItem(pendingGastosKey()) || "[]");
  } catch (e) {
    return [];
  }
}

function savePendingGastos(ops) {
  try {
    localStorage.setItem(pendingGastosKey(), JSON.stringify(ops));
    window.dispatchEvent(new Event("taxfly-pending-updated"));
  } catch (e) {}
}

function queueGastoOp(op) {
  const ops = getPendingGastos();
  ops.push({
    ...op,
    ts: Date.now()
  });
  savePendingGastos(ops);
}

let flushingExpenses=false;
async function flushPendingGastos() {
  if (!currentUser || !perfilId) return;
  const ops = getPendingGastos(), uid=currentUser.uid, pendingStorageKey=pendingGastosKey();
  if (!ops.length || flushingExpenses) return;
  flushingExpenses=true;
  const failed = [];
  for (const op of ops) {
    try {
      if (op.type === "add") {
        await addDoc(collection(db, "usuarios", uid, "perfiles", perfilId, "gastos"), op.data);
      } else if (op.type === "upsert") {
        await setDoc(doc(db,"usuarios",uid,"perfiles",perfilId,"gastos",op.id),op.data,{merge:true});
      } else if (op.type === "del") {
        await deleteDoc(doc(db, "usuarios", uid, "perfiles", perfilId, "gastos", op.id));
      } else if (op.type === "upd") {
        await updateDoc(doc(db, "usuarios", uid, "perfiles", perfilId, "gastos", op.id), op.data);
      }
    } catch (e) {
      failed.push(...ops.slice(ops.indexOf(op)));
      break; // Preserve order: an earlier failed payment must not overwrite a newer one on retry.
    }
  }
  const latest=JSON.parse(localStorage.getItem(pendingStorageKey)||'[]');
  const successful=new Set(ops.filter(op=>!failed.includes(op)).map(op=>JSON.stringify(op)));
  localStorage.setItem(pendingStorageKey,JSON.stringify(latest.filter(op=>!successful.has(JSON.stringify(op)))));
  flushingExpenses=false;
  window.dispatchEvent(new Event("taxfly-pending-updated"));
  if(!failed.length&&latest.some(op=>!ops.some(old=>JSON.stringify(old)===JSON.stringify(op)))&&navigator.onLine&&currentUser?.uid===uid)flushPendingGastos();
}

window.addEventListener("online", () => {
  flushPendingGastos();
});

const perfilFoto = localStorage.getItem("perfilActivoFoto");

let presupuestoBase = 0;
let catBudgets = {};

let mapsSpent = 0;

let tripBudgetUnsubs = [];
let financeReservations=[], expenseSnapshotReady=false, paymentOpened=false;
function filteredGastos() {
  return currentUser && perfilId ? window.TripContext.filter(allGastos, currentUser.uid, perfilId) : allGastos;
}
function refreshGastosTrip() {
  if (!currentUser || !perfilId) return;
  window.TripContext.render(document.getElementById("trip-filter-expenses"), currentUser.uid, perfilId);
  renderGastosList(allGastos);
  listenTripPlanningSpent();
}
function listenTripPlanningSpent() {
  tripBudgetUnsubs.forEach(stop => stop());
  tripBudgetUnsubs = [];
  const tc = window.TripContext;
  const selection = tc.view(currentUser.uid, perfilId);
  const trips = tc.readTrips(currentUser.uid, perfilId);
  const ids = selection === "all" ? ["orlando", ...trips.filter(t => t.id !== "orlando" && t.status !== "deleted").map(t => t.id)] : selection === "unassigned" ? [] : [selection];
  const totals = new Map();
  mapsSpent = 0;
  financeReservations=[];
  tripBudgetUnsubs.push(window.TaxflyTravel.watchReservations({uid:currentUser.uid,pid:perfilId,trip:selection,db,doc,onSnapshot,onChange:items=>{financeReservations=items;renderBudgetCard();offerReservationPayment();}}));
  updateBudgetDisplay(filteredGastos().reduce((sum, g) => sum + (Number(g.valor) || 0), 0));
  ids.forEach(id => {
    const path = id === "orlando" ? ["usuarios", currentUser.uid, "perfiles", perfilId, "orlando", "budget"] : ["usuarios", currentUser.uid, "perfiles", perfilId, "tripPlanning", id, "data", "budget"];
    tripBudgetUnsubs.push(onSnapshot(doc(db, ...path), snap => {
      const d = snap.exists() ? snap.data() : null;
      totals.set(id, (d?.gastos || []).reduce((s, g) => s + (Number(g.monto) || 0), 0));
      mapsSpent = [...totals.values()].reduce((a, b) => a + b, 0);
      updateBudgetDisplay(filteredGastos().reduce((sum, g) => sum + (Number(g.valor) || 0), 0));
    }, () => {}));
  });
}

let lastGastosTotal = 0;

let allRates = {};

let baseRates = {
  oficial: 0,
  tarjeta: 0,
  eur: 0,
  brl: 0
};

const flags = {
  EUR: '<img src="https://flagcdn.com/20x15/eu.png" alt="" onerror="this.outerHTML=\'🇪🇺\'">',
  GBP: '<img src="https://flagcdn.com/20x15/gb.png" alt="" onerror="this.outerHTML=\'🇬🇧\'">',
  CHF: '<img src="https://flagcdn.com/20x15/ch.png" alt="" onerror="this.outerHTML=\'🇨🇭\'">',
  BRL: '<img src="https://flagcdn.com/20x15/br.png" alt="" onerror="this.outerHTML=\'🇧🇷\'">',
  CLP: '<img src="https://flagcdn.com/20x15/cl.png" alt="" onerror="this.outerHTML=\'🇨🇱\'">',
  UYU: '<img src="https://flagcdn.com/20x15/uy.png" alt="" onerror="this.outerHTML=\'🇺🇾\'">',
  MXN: '<img src="https://flagcdn.com/20x15/mx.png" alt="" onerror="this.outerHTML=\'🇲🇽\'">',
  PEN: '<img src="https://flagcdn.com/20x15/pe.png" alt="" onerror="this.outerHTML=\'🇵🇪\'">',
  COP: '<img src="https://flagcdn.com/20x15/co.png" alt="" onerror="this.outerHTML=\'🇨🇴\'">'
};

let tipIndex = 0;

let video, stream;

const i18n = {
  es: {
    nav_home: "INICIO",
    nav_taxes: "TAXES",
    nav_itinerary: "PLANIFICACIÓN",
    nav_routes: "RUTAS",
    nav_more: "MÁS",
    nav_units: "AYUDA Y REFERENCIAS",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_units_desc: "Conversor de unidades y ayudas varias",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartidos",
    label_budget: "Presupuesto Restante",
    btn_set: "SET",
    btn_change_budget: "✏️ Cambiar",
    bc_empty_title: "Definí tu presupuesto",
    bc_empty_sub: "Ingresá cuánto pensás gastar en este viaje y te mostramos cuánto te queda.",
    btn_save_budget: "GUARDAR",
    bc_total: "Presupuesto total",
    bc_over_label: "Te pasaste por",
    bc_progress: "Gastaste USD {spent} de USD {total} ({pct}%)",
    bc_spent_expenses: "🧾 Gastos",
    bc_spent_plan: "🗺️ Planificación",
    bc_hint: "Vale para este viaje. Se descuentan tus gastos y lo cargado en Planificación.",
    bc_hint_unassigned: "Sin viaje: este presupuesto se guarda solo en este dispositivo.",
    bc_no_trip: "Sin viaje",
    bc_invalid: "Ingresá un monto mayor a 0.",
    caps_title: "Topes por categoría",
    caps_help: "Poné un máximo para las categorías que quieras controlar. Dejalo vacío si no querés tope.",
    caps_placeholder: "Sin tope",
    caps_assigned: "Topes asignados: USD {sum} de USD {total}",
    caps_assigned_nobudget: "Topes asignados: USD {sum}",
    caps_over_total: "Los topes suman más que tu presupuesto total.",
    caps_save: "GUARDAR TOPES",
    caps_saved: "✅ Guardado",
    ocr_analyzing: "Analizando ticket... 🧐",
    ocr_detecting: "Detectando Totales y Taxes",
    shopping_guide: "GUÍA DE COMPRAS",
    tab_list: "GASTOS",
    tab_summary: "RESUMEN",
    tab_sizes: "TALLES",
    tab_compare: "COMPARAR",
    scanner_beta_msg: "⚠️ El escáner está en beta. Verificá siempre el monto detectado.",
    btn_scan_ticket: "ESCANEAR TICKET",
    btn_camera: "ESCANEAR",
    btn_gallery: "DESDE GALERÍA",
    rate_official: "Dólar Oficial",
    rate_card: "Dólar Tarjeta",
    label_exchange: "Cotizaciones",
    label_expense_log: "Registro de gastos",
    btn_camera_sub: "Escaneá el ticket y detecto el total",
    btn_gallery_sub: "Subí una foto de un ticket ya sacado",
    opt_pound: "Libra",
    opt_real: "Real",
    opt_clp: "P. Chileno",
    opt_uyu: "P. Uruguayo",
    opt_mxn: "P. Mexicano",
    opt_pen: "Sol Peruano",
    opt_cop: "P. Colombiano",
    placeholder_product: "Producto",
    placeholder_price: "Precio USD",
    label_cat_tag: "Categoría",
    cat_shopping: "🛍️ Compras",
    cat_clothing: "👟 Ropa",
    cat_food: "🍔 Comida",
    cat_entertainment: "🎢 Entretenimiento",
    cat_transport: "🚗 Transporte",
    cat_accommodation: "🏨 Alojamiento",
    cat_pharmacy: "💊 Farmacia",
    cat_flights: "✈️ Vuelos",
    cat_other: "📦 Otros",
    cat_add_aria: "Nueva categoría",
    cat_new_title: "Nueva categoría",
    cat_new_name_ph: "Nombre de la categoría",
    cat_new_create: "Crear categoría",
    cat_new_mine: "Tus categorías",
    cat_new_dup: "Ya existe una categoría con ese nombre.",
    cat_new_empty: "Escribí un nombre para la categoría.",
    btn_save_expense: "GUARDAR GASTO",
    loading: "Cargando...",
    empty_expenses: "No hay gastos.",
    fill_product_msg: "Completá el nombre del producto.",
    day_today: "Hoy",
    day_yesterday: "Ayer",
    day_nodate: "Sin fecha",
    toast_saved: "Guardado",
    toast_deleted: "Gasto eliminado",
    toast_updated: "Gasto actualizado",
    undo: "Deshacer",
    edit_title: "Editar gasto",
    edit_save: "Guardar cambios",
    edit_cancel: "Cancelar",
    aria_edit: "Editar gasto",
    aria_delete: "Eliminar gasto",
    dash_total: "Total gastado",
    dash_count: "Compras",
    dash_avg: "Promedio",
    dash_top: "Mayor gasto",
    dash_by_cat: "Por Categoría",
    donut_total_lbl: "TOTAL",
    empty_dash: "Aún no hay gastos cargados.\n¡Empezá a registrar tus compras!",
    sizes_shoes_title: "Calzado ARG → US",
    sizes_shoes_sub: "Zapatillas y zapatos",
    sizes_clothing_title: "Ropa ARG → US",
    sizes_clothing_sub: "Un M arg. suele ser L en US",
    sizes_pants_title: "Pantalón ARG → US",
    sizes_pants_sub: "Cintura cm → US Waist",
    sizes_tops: "Remeras / Tops",
    sizes_hoodies: "Buzos / Camperas",
    gender_male: "👨 Hombre",
    gender_female: "👩 Mujer",
    col_arg: "ARG",
    col_us: "US",
    pants_col_arg: "ARG cm",
    pants_col_waist: "US Waist",
    pants_col_size: "Talle US",
    settings_title: "Ajustes",
    label_language: "Idioma",
    btn_change_profile: "Cambiar Perfil",
    btn_theme: "Cambiar Tema",
    btn_update: "Actualizar App",
    btn_email: "Cambiar Correo",
    btn_password: "Cambiar Contraseña",
    btn_pin: "Cambiar PIN Offline",
    btn_logout: "Cerrar Sesión",
    btn_delete: "Eliminar Cuenta",
    footer_by: "Creado por Juan Cruz Bria",
    alert_no_total: "No se detectó el total. Cargalo manualmente.",
    alert_upcoming: "🚀 El Comparador de Precios estará disponible próximamente.",
    offline_title: "Sin conexión",
    offline_sub: "El chat y los tipos de cambio no están disponibles",
    ocr_modal_title: "🧾 Ticket detectado — revisá los datos",
    ocr_items_title: "📦 Ítems detectados",
    ocr_cancel: "✕ Cancelar",
    ocr_save: "✅ Guardar Gasto",
    btn_export_share: "COMPARTIR RESUMEN",
    ec_spent: "TOTAL GASTADO",
    ec_rest: "RESTANTE",
    ec_count: "Compras",
    ec_avg: "Promedio",
    ec_top: "Mayor gasto",
    ec_by_cat: "POR CATEGORÍA",
    ec_footer_tag: "Generado con TaxUSA",
    export_generating: "Generando...",
    export_copied: "✅ Imagen copiada al portapapeles",
    export_saved: "✅ Listo para compartir",
    export_error: "No se pudo generar el archivo.",
    sheet_title: "¿CÓMO QUERÉS COMPARTIRLO?",
    sheet_img_name: "Imagen",
    sheet_img_desc: "Ideal para compartir al instante",
    sheet_pdf_name: "PDF",
    sheet_pdf_desc: "Ideal para guardar o enviar formalmente",
    sheet_cancel: "Cancelar",
    sizes_filter_cat: "Categoría",
    sizes_filter_gender: "Género",
    sizes_cat_remera: "Remeras",
    sizes_cat_pantalon: "Pantalones",
    sizes_cat_zapatilla: "Zapatillas",
    sizes_cat_campera: "Camperas",
    gender_male_short: "Hombre",
    gender_female_short: "Mujer",
    sz_men: "Hombre",
    sz_women: "Mujer",
    sz_note_nike_rem_h: "Nike y Tommy corren un poco más pequeños. En Gap podés pedir tu talle ARG habitual.",
    sz_note_nike_rem_m: "En ropa de mujer las marcas varían mucho. Siempre probarse o revisar la guía de cm.",
    sz_note_pant_h: "Los pantalones US se venden por Waist × Inseam (ej: 32×32). El Inseam es el largo interno de la pierna en pulgadas.",
    sz_note_pant_m: "Gap usa talle numérico par (0, 2, 4…). Levi's para mujer usa cintura en pulgadas. H&M tiende a correr grande.",
    sz_note_zap_h: "Nike y Adidas difieren hasta media talla entre sí. Converse recomienda pedir medio número más grande.",
    sz_note_zap_m: "Para zapatillas de mujer, Nike y Adidas suelen estar alineadas. Converse sugiere pedir 0.5 más grande.",
    sz_note_camp_h: "The North Face y Columbia son más generosos en el corte que Nike. Para TNF un M ARG suele ir bien en M US.",
    sz_note_camp_m: "En camperas de abrigo el corte es más holgado que en ropa deportiva Nike.",
    sz_chest_cm: "Pecho cm",
    sz_waist_us: "US Waist",
    sz_inseam: "Inseam",
    sz_foot_cm: "cm pie",
    sz_us_letter: "US (letra)",
    sz_us_num: "US (núm.)"
  },
  en: {
    nav_home: "HOME",
    nav_taxes: "TAXES",
    nav_itinerary: "PLANNING",
    nav_routes: "ROUTES",
    nav_more: "MORE",
    nav_units: "Help & References",
    nav_tickets: "DOCUMENTS",
    nav_group: "GROUP",
    nav_units_desc: "Unit Converter & Utilities",
    nav_tickets_desc: "ESTA, insurance, check-in",
    nav_group_desc: "Shared expenses",
    label_budget: "Remaining Budget",
    btn_set: "SET",
    btn_change_budget: "✏️ Change",
    bc_empty_title: "Set your budget",
    bc_empty_sub: "Enter how much you plan to spend on this trip and we'll show what's left.",
    btn_save_budget: "SAVE",
    bc_total: "Total budget",
    bc_over_label: "Over budget by",
    bc_progress: "Spent USD {spent} of USD {total} ({pct}%)",
    bc_spent_expenses: "🧾 Expenses",
    bc_spent_plan: "🗺️ Planning",
    bc_hint: "Applies to this trip. Your expenses and what's logged in Planning are deducted.",
    bc_hint_unassigned: "No trip: this budget is saved only on this device.",
    bc_no_trip: "No trip",
    bc_invalid: "Enter an amount greater than 0.",
    caps_title: "Category limits",
    caps_help: "Set a maximum for the categories you want to control. Leave blank for no limit.",
    caps_placeholder: "No limit",
    caps_assigned: "Limits assigned: USD {sum} of USD {total}",
    caps_assigned_nobudget: "Limits assigned: USD {sum}",
    caps_over_total: "The limits add up to more than your total budget.",
    caps_save: "SAVE LIMITS",
    caps_saved: "✅ Saved",
    ocr_analyzing: "Analyzing ticket... 🧐",
    ocr_detecting: "Detecting Totals and Taxes",
    shopping_guide: "SHOPPING GUIDE",
    tab_list: "EXPENSES",
    tab_summary: "SUMMARY",
    tab_sizes: "SIZES",
    tab_compare: "COMPARE",
    scanner_beta_msg: "⚠️ Scanner is in beta. Always verify the detected amount.",
    btn_scan_ticket: "SCAN TICKET",
    btn_camera: "SCAN",
    btn_gallery: "FROM GALLERY",
    rate_official: "Official Dollar",
    rate_card: "Card Dollar",
    label_exchange: "Exchange Rates",
    label_expense_log: "Expense log",
    btn_camera_sub: "Scan a receipt and I detect the total",
    btn_gallery_sub: "Upload a photo of an existing receipt",
    opt_pound: "Pound",
    opt_real: "Real",
    opt_clp: "Chilean P.",
    opt_uyu: "Uruguayan P.",
    opt_mxn: "Mexican P.",
    opt_pen: "Peruvian Sol",
    opt_cop: "Colombian P.",
    placeholder_product: "Product Name",
    placeholder_price: "Price in USD",
    label_cat_tag: "Category",
    cat_shopping: "🛍️ Shopping",
    cat_clothing: "👟 Clothing",
    cat_food: "🍔 Food",
    cat_entertainment: "🎢 Entertainment",
    cat_transport: "🚗 Transport",
    cat_accommodation: "🏨 Accommodation",
    cat_pharmacy: "💊 Pharmacy",
    cat_flights: "✈️ Flights",
    cat_other: "📦 Other",
    cat_add_aria: "New category",
    cat_new_title: "New category",
    cat_new_name_ph: "Category name",
    cat_new_create: "Create category",
    cat_new_mine: "Your categories",
    cat_new_dup: "A category with that name already exists.",
    cat_new_empty: "Enter a name for the category.",
    btn_save_expense: "SAVE EXPENSE",
    loading: "Loading...",
    empty_expenses: "No expenses.",
    fill_product_msg: "Please fill in the product name.",
    day_today: "Today",
    day_yesterday: "Yesterday",
    day_nodate: "No date",
    toast_saved: "Saved",
    toast_deleted: "Expense deleted",
    toast_updated: "Expense updated",
    undo: "Undo",
    edit_title: "Edit expense",
    edit_save: "Save changes",
    edit_cancel: "Cancel",
    aria_edit: "Edit expense",
    aria_delete: "Delete expense",
    dash_total: "Total spent",
    dash_count: "Purchases",
    dash_avg: "Average",
    dash_top: "Biggest expense",
    dash_by_cat: "By Category",
    donut_total_lbl: "TOTAL",
    empty_dash: "No expenses recorded yet.\nStart tracking your purchases!",
    sizes_shoes_title: "Footwear ARG → US",
    sizes_shoes_sub: "Sneakers and shoes",
    sizes_clothing_title: "Clothing ARG → US",
    sizes_clothing_sub: "An ARG M is usually a US L",
    sizes_pants_title: "Pants ARG → US",
    sizes_pants_sub: "Waist cm → US Waist",
    sizes_tops: "T-shirts / Tops",
    sizes_hoodies: "Hoodies / Jackets",
    gender_male: "👨 Men",
    gender_female: "👩 Women",
    col_arg: "ARG",
    col_us: "US",
    pants_col_arg: "ARG cm",
    pants_col_waist: "US Waist",
    pants_col_size: "US Size",
    settings_title: "Settings",
    label_language: "Language",
    btn_change_profile: "Change Profile",
    btn_theme: "Toggle Theme",
    btn_update: "Update App",
    btn_email: "Change Email",
    btn_password: "Change Password",
    btn_pin: "Change Offline PIN",
    btn_logout: "Sign Out",
    btn_delete: "Delete Account",
    footer_by: "Created by Juan Cruz Bria",
    alert_no_total: "Total not detected. Please enter it manually.",
    alert_upcoming: "🚀 The Price Comparator will be available soon.",
    offline_title: "No connection",
    offline_sub: "Chat and exchange rates are not available",
    ocr_modal_title: "🧾 Ticket detected — review your data",
    ocr_items_title: "📦 Detected items",
    ocr_cancel: "✕ Cancel",
    ocr_save: "✅ Save Expense",
    btn_export_share: "SHARE SUMMARY",
    ec_spent: "TOTAL SPENT",
    ec_rest: "REMAINING",
    ec_count: "Purchases",
    ec_avg: "Average",
    ec_top: "Biggest expense",
    ec_by_cat: "BY CATEGORY",
    ec_footer_tag: "Generated with TaxUSA",
    export_generating: "Generating...",
    export_copied: "✅ Image copied to clipboard",
    export_saved: "✅ Ready to share",
    export_error: "Could not generate the file.",
    sheet_title: "HOW DO YOU WANT TO SHARE IT?",
    sheet_img_name: "Image",
    sheet_img_desc: "Best for instant sharing",
    sheet_pdf_name: "PDF",
    sheet_pdf_desc: "Best for saving or sending formally",
    sheet_cancel: "Cancel",
    sizes_filter_cat: "Category",
    sizes_filter_gender: "Gender",
    sizes_cat_remera: "T-Shirts",
    sizes_cat_pantalon: "Pants",
    sizes_cat_zapatilla: "Sneakers",
    sizes_cat_campera: "Jackets",
    gender_male_short: "Men",
    gender_female_short: "Women",
    sz_men: "Men",
    sz_women: "Women",
    sz_note_nike_rem_h: "Nike and Tommy run a bit small. At Gap you can usually pick your ARG size.",
    sz_note_nike_rem_m: "Women's sizing varies a lot between brands. Always try on or check the cm guide.",
    sz_note_pant_h: "US pants are sold by Waist × Inseam (e.g. 32×32). Inseam is the inner leg length in inches.",
    sz_note_pant_m: "Gap uses even number sizing (0, 2, 4…). Levi's women use waist in inches. H&M tends to run large.",
    sz_note_zap_h: "Nike and Adidas can differ by half a size. Converse recommends going half a size up.",
    sz_note_zap_m: "For women's sneakers, Nike and Adidas are usually aligned. Converse suggests going 0.5 up.",
    sz_note_camp_h: "The North Face and Columbia cut more generously than Nike. An ARG M in TNF is usually a US M.",
    sz_note_camp_m: "Winter jackets tend to have a looser cut compared to Nike sportswear.",
    sz_chest_cm: "Chest cm",
    sz_waist_us: "US Waist",
    sz_inseam: "Inseam",
    sz_foot_cm: "Foot cm",
    sz_us_letter: "US (letter)",
    sz_us_num: "US (num)"
  },
  pt: {
    nav_home: "INÍCIO",
    nav_taxes: "TAXES",
    nav_itinerary: "PLANEJAMENTO",
    nav_routes: "ROTAS",
    nav_more: "MAIS",
    nav_units: "Ajuda e Referências",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_units_desc: "Conversor de Unidades e Utilidades",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartilhados",
    label_budget: "Orçamento Restante",
    btn_set: "SET",
    btn_change_budget: "✏️ Alterar",
    bc_empty_title: "Defina seu orçamento",
    bc_empty_sub: "Informe quanto pretende gastar nesta viagem e mostramos quanto resta.",
    btn_save_budget: "SALVAR",
    bc_total: "Orçamento total",
    bc_over_label: "Você passou em",
    bc_progress: "Gastou USD {spent} de USD {total} ({pct}%)",
    bc_spent_expenses: "🧾 Gastos",
    bc_spent_plan: "🗺️ Planejamento",
    bc_hint: "Vale para esta viagem. Seus gastos e o lançado em Planejamento são descontados.",
    bc_hint_unassigned: "Sem viagem: este orçamento fica salvo só neste dispositivo.",
    bc_no_trip: "Sem viagem",
    bc_invalid: "Insira um valor maior que 0.",
    caps_title: "Limites por categoria",
    caps_help: "Defina um máximo para as categorias que quiser controlar. Deixe vazio para não ter limite.",
    caps_placeholder: "Sem limite",
    caps_assigned: "Limites atribuídos: USD {sum} de USD {total}",
    caps_assigned_nobudget: "Limites atribuídos: USD {sum}",
    caps_over_total: "Os limites somam mais que seu orçamento total.",
    caps_save: "SALVAR LIMITES",
    caps_saved: "✅ Salvo",
    ocr_analyzing: "Analisando ticket... 🧐",
    ocr_detecting: "Detectando Totais e Taxes",
    shopping_guide: "GUIA DE COMPRAS",
    tab_list: "GASTOS",
    tab_summary: "RESUMO",
    tab_sizes: "TAMANHOS",
    tab_compare: "COMPARAR",
    scanner_beta_msg: "⚠️ O scanner está em beta. Verifique sempre o valor detectado.",
    btn_scan_ticket: "ESCANEAR TICKET",
    btn_camera: "ESCANEAR",
    btn_gallery: "DA GALERIA",
    rate_official: "Dólar Oficial",
    rate_card: "Dólar Cartão",
    label_exchange: "Cotações",
    label_expense_log: "Registro de gastos",
    btn_camera_sub: "Escaneie o ticket e detecto o total",
    btn_gallery_sub: "Envie a foto de um ticket já tirado",
    opt_pound: "Libra",
    opt_real: "Real",
    opt_clp: "P. Chileno",
    opt_uyu: "P. Uruguaio",
    opt_mxn: "P. Mexicano",
    opt_pen: "Sol Peruano",
    opt_cop: "P. Colombiano",
    placeholder_product: "Produto",
    placeholder_price: "Preço USD",
    label_cat_tag: "Categoria",
    cat_shopping: "🛍️ Compras",
    cat_clothing: "👟 Roupas",
    cat_food: "🍔 Comida",
    cat_entertainment: "🎢 Entretenimento",
    cat_transport: "🚗 Transporte",
    cat_accommodation: "🏨 Hospedagem",
    cat_pharmacy: "💊 Farmácia",
    cat_flights: "✈️ Voos",
    cat_other: "📦 Outros",
    cat_add_aria: "Nova categoria",
    cat_new_title: "Nova categoria",
    cat_new_name_ph: "Nome da categoria",
    cat_new_create: "Criar categoria",
    cat_new_mine: "Suas categorias",
    cat_new_dup: "Já existe uma categoria com esse nome.",
    cat_new_empty: "Digite um nome para a categoria.",
    btn_save_expense: "SALVAR GASTO",
    loading: "Carregando...",
    empty_expenses: "Sem gastos.",
    fill_product_msg: "Por favor preencha o nome do produto.",
    day_today: "Hoje",
    day_yesterday: "Ontem",
    day_nodate: "Sem data",
    toast_saved: "Salvo",
    toast_deleted: "Gasto excluído",
    toast_updated: "Gasto atualizado",
    undo: "Desfazer",
    edit_title: "Editar gasto",
    edit_save: "Salvar alterações",
    edit_cancel: "Cancelar",
    aria_edit: "Editar gasto",
    aria_delete: "Excluir gasto",
    dash_total: "Total gasto",
    dash_count: "Compras",
    dash_avg: "Média",
    dash_top: "Maior gasto",
    dash_by_cat: "Por Categoria",
    donut_total_lbl: "TOTAL",
    empty_dash: "Nenhum gasto registrado ainda.\nComece a registrar suas compras!",
    sizes_shoes_title: "Calçados ARG → US",
    sizes_shoes_sub: "Tênis e sapatos",
    sizes_clothing_title: "Roupas ARG → US",
    sizes_clothing_sub: "Um M arg. geralmente é L nos EUA",
    sizes_pants_title: "Calças ARG → US",
    sizes_pants_sub: "Cintura cm → US Waist",
    sizes_tops: "Camisetas / Tops",
    sizes_hoodies: "Moletons / Jaquetas",
    gender_male: "👨 Homem",
    gender_female: "👩 Mulher",
    col_arg: "ARG",
    col_us: "US",
    pants_col_arg: "ARG cm",
    pants_col_waist: "US Waist",
    pants_col_size: "Tamanho US",
    settings_title: "Configurações",
    label_language: "Idioma",
    btn_change_profile: "Trocar Perfil",
    btn_theme: "Alternar Tema",
    btn_update: "Atualizar App",
    btn_email: "Alterar E-mail",
    btn_password: "Alterar Senha",
    btn_pin: "Alterar PIN Offline",
    btn_logout: "Sair",
    btn_delete: "Excluir Conta",
    footer_by: "Criado por Juan Cruz Bria",
    alert_no_total: "Total não detectado. Por favor insira manualmente.",
    alert_upcoming: "🚀 O Comparador de Preços estará disponível em breve.",
    offline_title: "Sem conexão",
    offline_sub: "Chat e cotações não estão disponíveis",
    ocr_modal_title: "🧾 Ticket detectado — revise seus dados",
    ocr_items_title: "📦 Itens detectados",
    ocr_cancel: "✕ Cancelar",
    ocr_save: "✅ Salvar Gasto",
    btn_export_share: "COMPARTILHAR RESUMO",
    ec_spent: "TOTAL GASTO",
    ec_rest: "RESTANTE",
    ec_count: "Compras",
    ec_avg: "Média",
    ec_top: "Maior gasto",
    ec_by_cat: "POR CATEGORIA",
    ec_footer_tag: "Gerado com TaxUSA",
    export_generating: "Gerando...",
    export_copied: "✅ Imagem copiada para a área de transferência",
    export_saved: "✅ Pronto para compartilhar",
    export_error: "Não foi possível gerar o arquivo.",
    sheet_title: "COMO VOCÊ QUER COMPARTILHAR?",
    sheet_img_name: "Imagem",
    sheet_img_desc: "Ideal para compartilhar instantaneamente",
    sheet_pdf_name: "PDF",
    sheet_pdf_desc: "Ideal para salvar ou enviar formalmente",
    sheet_cancel: "Cancelar",
    sizes_filter_cat: "Categoria",
    sizes_filter_gender: "Gênero",
    sizes_cat_remera: "Camisetas",
    sizes_cat_pantalon: "Calças",
    sizes_cat_zapatilla: "Tênis",
    sizes_cat_campera: "Jaquetas",
    gender_male_short: "Homem",
    gender_female_short: "Mulher",
    sz_men: "Homem",
    sz_women: "Mulher",
    sz_note_nike_rem_h: "Nike e Tommy tendem a ser menores. Na Gap você pode pedir seu tamanho ARG habitual.",
    sz_note_nike_rem_m: "Os tamanhos femininos variam muito entre marcas. Sempre experimente ou consulte a guia em cm.",
    sz_note_pant_h: "Calças nos EUA são vendidas por Waist × Inseam (ex: 32×32). Inseam é o comprimento interno da perna em polegadas.",
    sz_note_pant_m: "Gap usa numeração par (0, 2, 4…). Levi's feminino usa cintura em polegadas. H&M tende a ser maior.",
    sz_note_zap_h: "Nike e Adidas podem diferir em meio tamanho. Converse recomenda pedir meio número a mais.",
    sz_note_zap_m: "Para tênis femininos, Nike e Adidas geralmente se alinham. Converse sugere pedir 0.5 a mais.",
    sz_note_camp_h: "The North Face e Columbia têm corte mais folgado que a Nike. Um ARG M na TNF costuma ser um US M.",
    sz_note_camp_m: "Jaquetas de inverno tendem a ter corte mais folgado do que o sportswear Nike.",
    sz_chest_cm: "Peito cm",
    sz_waist_us: "US Waist",
    sz_inseam: "Inseam",
    sz_foot_cm: "Pé cm",
    sz_us_letter: "US (letra)",
    sz_us_num: "US (núm.)"
  }
};

const shoppingTips = {
  es: [ "Jersey Gardens (NJ): ¡Tax Free! No pagás impuesto en ropa ni calzado.", "El precio de etiqueta NO incluye el Tax (aprox. 7-9%).", "Ross/Marshalls: Los mejores precios están en los racks de 'Clearance'.", "Apple: Comprá 'Refurbished' en su web oficial para ahorrar un 15%.", "Best Buy: Tienen sección 'Open Box' con productos casi nuevos rebajados.", "Cupones: Descargá 'RetailMeNot' para descuentos en el momento.", "Seguridad: Nunca dejes bolsas visibles dentro del auto estacionado.", "Un 'M' en USA suele ser un 'L' en Argentina. ¡Probate siempre!", "Siempre tené billetes de $1 y $5 USD para propinas rápidas.", "Premium Outlets: Registrate en su web para recibir cuponeras VIP gratis.", "Pesá tu valija antes de ir al aeropuerto; el límite suele ser 23 kg.", "Avisá en tu homebanking que vas a usar la tarjeta en el exterior." ],
  en: [ "Jersey Gardens (NJ): Tax Free! No tax on clothing or footwear.", "The price tag does NOT include sales tax (approx. 7-9%).", "Ross Stores / Marshalls: Best deals are in the Clearance racks.", "Apple: Buy Refurbished on their official site to save around 15%.", "Best Buy has an Open Box section with nearly new discounted products.", "Download RetailMeNot for instant in-store discounts.", "Safety: Never leave shopping bags visible inside a parked car.", "A Medium (M) in the US is usually a Large (L). Always try things on!", "Always carry $1 and $5 bills for quick tips.", "Premium Outlets: Sign up for free VIP coupon booklets.", "Weigh your suitcase before the airport; limit is usually 23 kg (50 lb).", "Notify your bank that you'll be using your card abroad." ],
  pt: [ "Jersey Gardens (NJ): Tax Free! Sem imposto em roupas e calçados.", "O preço na etiqueta NÃO inclui o imposto (aprox. 7-9%).", "Ross / Marshalls: Os melhores preços estão nas gôndolas de 'Clearance'.", "Apple: Compre 'Refurbished' no site oficial para economizar até 15%.", "Best Buy tem seção 'Open Box' com produtos quase novos com desconto.", "Baixe o RetailMeNot para cupons de desconto na hora da compra.", "Segurança: Nunca deixe sacolas visíveis dentro do carro estacionado.", "Um 'M' nos EUA costuma ser um 'G' no Brasil. Sempre experimente!", "Tenha sempre notas de $1 e $5 USD para gorjetas rápidas.", "Premium Outlets: Cadastre-se no site para receber cupons VIP grátis.", "Pese sua mala antes do aeroporto; o limite costuma ser 23 kg.", "Avise seu banco que vai usar o cartão no exterior." ]
};

const knownStores = [ "ROSS", "MARSHALLS", "WALMART", "APPLE", "BEST BUY", "TARGET", "TJ MAXX", "MACY'S", "ZARA", "H&M", "NIKE", "ADIDAS", "AMAZON", "COSTCO", "FOOT LOCKER", "JD SPORTS", "BATH & BODY WORKS" ];

window.formatVisual = inp => {
  let v = inp.value.replace(/[^\d.]/g, "");
  let p = v.split(".");
  if (p.length > 2) v = p[0] + "." + p.slice(1).join("");
  if (v === "") return;
  let int = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  inp.value = v.includes(".") ? int + "." + (p[1] || "").substring(0, 2) : int;
};

function cleanVal(s) {
  return parseFloat((s || "").toString().replace(/,/g, "")) || 0;
}

function fmt(n) {
  return parseFloat(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

window.nextTip = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const list = shoppingTips[lang];
  tipIndex = (tipIndex + 1) % list.length;
  const el = document.getElementById("tip-text");
  if (el) {
    el.style.opacity = 0;
    setTimeout(() => {
      el.innerText = list[tipIndex];
      el.style.opacity = 1;
    }, 300);
  }
};

window.changeLanguage = lang => {
  { const _b = document.getElementById("ai-bubble"); if (_b) _b.setAttribute("aria-label", lang === "en" ? "Taxie — Travel assistant" : lang === "pt" ? "Taxie — Assistente de viagem" : "Taxie — Asistente de viaje"); }
  localStorage.setItem("appLang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll(".lang-opt").forEach(o => o.classList.remove("active"));
  document.getElementById("lang-" + lang)?.classList.add("active");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (i18n[lang]?.[k]) el.innerText = i18n[lang][k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if (i18n[lang]?.[k]) el.placeholder = i18n[lang][k];
  });
  document.querySelectorAll("option[data-i18n]").forEach(opt => {
    const k = opt.getAttribute("data-i18n");
    if (i18n[lang]?.[k]) opt.text = i18n[lang][k];
  });
  const el = document.getElementById("tip-text");
  if (el) el.innerText = shoppingTips[lang][tipIndex];
  const t = i18n[lang] || i18n.es;
  const offTitle = document.querySelector("#offline-label strong");
  const offSub = document.querySelector("#offline-label span");
  if (offTitle) offTitle.textContent = t.offline_title;
  if (offSub) offSub.textContent = t.offline_sub;
  document.title = lang === "en" ? "TaxFly — Expenses" : lang === "pt" ? "TaxFly — Gastos" : "TaxFly — Gastos";
  const ocrTitle = document.getElementById("ocr-modal-title");
  if (ocrTitle) ocrTitle.textContent = t.ocr_modal_title || "";
  const ocrItemsTitle = document.getElementById("ocr-items-title");
  if (ocrItemsTitle) ocrItemsTitle.textContent = t.ocr_items_title || "";
  const ocrCancel = document.getElementById("ocr-btn-cancel-lbl");
  if (ocrCancel) ocrCancel.textContent = t.ocr_cancel || "";
  const ocrSave = document.getElementById("ocr-btn-confirm-lbl");
  if (ocrSave) ocrSave.textContent = t.ocr_save || "";
  const donutLbl = document.getElementById("donut-lbl");
  if (donutLbl) donutLbl.textContent = t.donut_total_lbl || "TOTAL";
  [ [ "scan-cam-lbl", "btn_camera" ], [ "scan-cam-sub", "btn_camera_sub" ], [ "scan-gal-lbl", "btn_gallery" ], [ "scan-gal-sub", "btn_gallery_sub" ] ].forEach(([ id, k ]) => {
    const el = document.getElementById(id);
    if (el && t[k]) el.textContent = t[k];
  });
  const emptyDash = document.getElementById("dash-empty");
  if (emptyDash && t.empty_dash) {
    const parts = t.empty_dash.split("\n");
    emptyDash.innerHTML = "<span>🛍️</span>" + (parts[0] || "") + "<br>" + (parts[1] || "");
  }
  if (window.taxieUpdateLang) window.taxieUpdateLang(lang);
  if (window.szReRender) window.szReRender();
  if (typeof allGastos !== "undefined" && allGastos.length) renderDashboard(allGastos);
  try { renderBudgetCard(); renderCapsEditor(); } catch (e) {}
  try { if (typeof allGastos !== "undefined" && allGastos.length) renderGastosList(allGastos); } catch (e) {}
};

(function() {
  const SZ_DATA = {
    remera: {
      H: {
        cols: [ "ARG", "XS", "S", "M", "L", "XL", "2XL" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_nike_rem_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–102", "102–107", "107–112" ], [ "US", "XS", "S", "M", "L", "XL", "2XL" ] ]
        }, {
          name: "Gap",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_nike_rem_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–107", "107–117", "117–127" ], [ "US", "XS", "S", "M", "L", "XL", "XXL" ] ]
        }, {
          name: "Levi's",
          bg: "#FAEEDA",
          color: "#854F0B",
          noteKey: "sz_note_nike_rem_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–107", "107–117", "—" ], [ "US", "XS", "S", "M", "L", "XL", "XXL" ] ]
        }, {
          name: "Tommy Hilfiger",
          bg: "#EEEDFE",
          color: "#534AB7",
          noteKey: "sz_note_nike_rem_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–107", "107–117", "117–127" ], [ "US", "XS", "S", "M", "L", "XL", "XXL" ] ]
        }, {
          name: "H&M",
          bg: "#FAECE7",
          color: "#993C1D",
          noteKey: "sz_note_nike_rem_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–102", "102–112", "112–122" ], [ "US", "XS", "S", "M", "L", "XL", "2XL" ] ]
        } ]
      },
      M: {
        cols: [ "ARG", "XS", "S", "M", "L", "XL" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_nike_rem_m",
          rows: [ [ "sz_chest_cm", "<81", "81–86", "86–91", "91–97", "97–107" ], [ "US", "XS", "S", "M", "L", "XL" ] ]
        }, {
          name: "Gap",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_nike_rem_m",
          rows: [ [ "sz_chest_cm", "<81", "81–86", "86–91", "91–97", "97–107" ], [ "US", "XS", "S", "M", "L", "XL" ] ]
        }, {
          name: "H&M",
          bg: "#FAECE7",
          color: "#993C1D",
          noteKey: "sz_note_nike_rem_m",
          rows: [ [ "sz_chest_cm", "<80", "80–85", "85–90", "90–96", "96–104", "—" ], [ "US", "XS", "S", "M", "L", "XL" ] ]
        }, {
          name: "Zara",
          bg: "#EEEDFE",
          color: "#534AB7",
          noteKey: "sz_note_nike_rem_m",
          rows: [ [ "sz_chest_cm", "<80", "80–84", "84–88", "88–96", "96–104", "—" ], [ "US", "XS", "S", "M", "L", "—" ] ]
        } ]
      }
    },
    pantalon: {
      H: {
        cols: [ "cm", "70–72", "73–75", "76–79", "80–84", "85–89", "90–94", "95–99", "100–105" ],
        brands: [ {
          name: "Levi's",
          bg: "#FAEEDA",
          color: "#854F0B",
          noteKey: "sz_note_pant_h",
          rows: [ [ "sz_waist_us", '28"', '29"', '30"', '32"', '34"', '36"', '38"', '40"' ], [ "sz_inseam", "30", "30", "30", "32", "32", "32", "32", "32" ] ]
        }, {
          name: "Gap",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_pant_h",
          rows: [ [ "sz_waist_us", "28", "29", "30", "32", "34", "36", "38", "40" ], [ "sz_inseam", "30", "30", "30", "32", "32", "32", "32", "32" ] ]
        }, {
          name: "Wrangler",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_pant_h",
          rows: [ [ "sz_waist_us", "28", "29", "30", "32", "34", "36", "38", "40" ], [ "sz_inseam", "30", "30", "30", "32", "32", "32", "32", "32" ] ]
        } ]
      },
      M: {
        cols: [ "ARG", "34", "36", "38", "40", "42", "44", "46", "48" ],
        brands: [ {
          name: "Levi's",
          bg: "#FAEEDA",
          color: "#854F0B",
          noteKey: "sz_note_pant_m",
          rows: [ [ "sz_us_num", "24", "25", "26", "27–28", "29–30", "31–32", "33–34", "36" ] ]
        }, {
          name: "Gap",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_pant_m",
          rows: [ [ "sz_us_letter", "00", "0", "2", "4–6", "8–10", "12–14", "16", "18" ] ]
        }, {
          name: "H&M",
          bg: "#FAECE7",
          color: "#993C1D",
          noteKey: "sz_note_pant_m",
          rows: [ [ "sz_us_letter", "0", "2", "4", "6–8", "10–12", "14", "16", "18" ] ]
        } ]
      }
    },
    zapatilla: {
      H: {
        cols: [ "ARG", "38", "39", "40", "41", "42", "43", "44", "45", "46" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_zap_h",
          rows: [ [ "US", "6", "7", "8", "9", "10", "11", "12", "13", "14" ], [ "sz_foot_cm", "24", "24.5", "25", "25.5", "26", "27", "28", "29", "30" ] ]
        }, {
          name: "Adidas",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_zap_h",
          rows: [ [ "US", "6", "7", "7.5", "8.5", "9.5", "10.5", "11.5", "12.5", "13.5" ], [ "sz_foot_cm", "23.8", "24.5", "25.1", "25.7", "26.3", "27", "27.7", "28.3", "29" ] ]
        }, {
          name: "New Balance",
          bg: "#FAEEDA",
          color: "#854F0B",
          noteKey: "sz_note_zap_h",
          rows: [ [ "US", "6", "7", "7.5", "8.5", "9.5", "10.5", "11.5", "12.5", "13.5" ], [ "sz_foot_cm", "24", "24.5", "25", "25.7", "26.3", "27", "27.6", "28.3", "29" ] ]
        }, {
          name: "Converse",
          bg: "#EEEDFE",
          color: "#534AB7",
          noteKey: "sz_note_zap_h",
          rows: [ [ "US", "5", "6", "7", "8", "9", "10", "11", "12", "13" ], [ "sz_foot_cm", "23.5", "24.1", "24.8", "25.4", "26", "26.7", "27.3", "28", "28.6" ] ]
        } ]
      },
      M: {
        cols: [ "ARG", "35", "36", "37", "38", "39", "40", "41", "42" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_zap_m",
          rows: [ [ "US", "5", "6", "7", "8", "9", "10", "11", "12" ], [ "sz_foot_cm", "21.6", "22.2", "22.9", "23.5", "24.1", "24.8", "25.4", "26" ] ]
        }, {
          name: "Adidas",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_zap_m",
          rows: [ [ "US", "4.5", "5.5", "6.5", "7.5", "8.5", "9.5", "10.5", "11.5" ], [ "sz_foot_cm", "21.6", "22.2", "22.9", "23.5", "24.1", "24.8", "25.4", "26" ] ]
        }, {
          name: "Converse",
          bg: "#EEEDFE",
          color: "#534AB7",
          noteKey: "sz_note_zap_m",
          rows: [ [ "US", "4", "5", "6", "7", "8", "9", "10", "11" ], [ "sz_foot_cm", "21", "21.6", "22.2", "23", "23.5", "24.1", "24.8", "25.4" ] ]
        } ]
      }
    },
    campera: {
      H: {
        cols: [ "ARG", "XS", "S", "M", "L", "XL", "2XL" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_camp_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–102", "102–112", "112–122" ], [ "US", "XS", "S", "M", "L", "XL", "2XL" ] ]
        }, {
          name: "The North Face",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_camp_h",
          rows: [ [ "sz_chest_cm", "<86", "86–91", "91–97", "97–107", "107–117", "117–127" ], [ "US", "XS", "S", "M", "L", "XL", "XXL" ] ]
        }, {
          name: "Columbia",
          bg: "#FAEEDA",
          color: "#854F0B",
          noteKey: "sz_note_camp_h",
          rows: [ [ "sz_chest_cm", "86–91", "91–97", "97–107", "107–117", "117–127", "127–137" ], [ "US", "S", "M", "L", "XL", "2XL", "3XL" ] ]
        } ]
      },
      M: {
        cols: [ "ARG", "XS", "S", "M", "L", "XL" ],
        brands: [ {
          name: "Nike",
          bg: "#E6F1FB",
          color: "#185FA5",
          noteKey: "sz_note_camp_m",
          rows: [ [ "sz_chest_cm", "<81", "81–86", "86–91", "91–97", "97–107" ], [ "US", "XS", "S", "M", "L", "XL" ] ]
        }, {
          name: "The North Face",
          bg: "#E1F5EE",
          color: "#0F6E56",
          noteKey: "sz_note_camp_m",
          rows: [ [ "sz_chest_cm", "<81", "81–86", "86–91", "91–97", "97–107" ], [ "US", "XS", "S", "M", "L", "XL" ] ]
        } ]
      }
    }
  };
  let szCat = "remera", szGen = "H";
  function szT(key) {
    const lang = localStorage.getItem("appLang") || "es";
    return i18n[lang] && i18n[lang][key] || key;
  }
  function szRender() {
    const out = document.getElementById("sz-tables-out");
    if (!out) return;
    const d = SZ_DATA[szCat] && SZ_DATA[szCat][szGen];
    if (!d) {
      out.innerHTML = "";
      return;
    }
    let html = "";
    d.brands.forEach(b => {
      const colHdr = d.cols.map(c => `<th>${c}</th>`).join("");
      const rowsHtml = b.rows.map((row, ri) => {
        const cells = row.map((cell, ci) => {
          if (ci === 0) return `<td class="sz-row-lbl">${szT(cell) || cell}</td>`;
          return `<td class="${ri === 0 ? "sz-hl" : ""}">${cell}</td>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      const note = szT(b.noteKey);
      html += `<div class="sz-brand-card">\n                <div class="sz-brand-header">\n                    <span class="sz-brand-badge" style="background:${b.bg};color:${b.color}">${esc(b.name)}</span>\n                </div>\n                <div class="sz-table-wrap"><table class="sz-table"><thead><tr>${colHdr}</tr></thead><tbody>${rowsHtml}</tbody></table></div>\n                ${note ? `<div class="sz-note">💡 ${note}</div>` : ""}\n            </div>`;
    });
    out.innerHTML = html;
  }
  window.szSetCat = function(btn) {
    szCat = btn.dataset.cat;
    document.querySelectorAll("#sz-cat-pills .sz-pill").forEach(p => p.classList.remove("sz-pill-active"));
    btn.classList.add("sz-pill-active");
    szRender();
  };
  window.szSetGen = function(btn) {
    szGen = btn.dataset.gen;
    document.querySelectorAll("#sz-gen-pills .sz-pill").forEach(p => p.classList.remove("sz-pill-active"));
    btn.classList.add("sz-pill-active");
    szRender();
  };
  window.szReRender = szRender;
  onReady(szRender);
})();

function sharedCacheGet(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || Date.now() - c.ts > ttlMs) return null;
    return c.data;
  } catch (e) {
    return null;
  }
}

function sharedCacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data: data,
      ts: Date.now()
    }));
  } catch (e) {}
}

async function fetchRates() {
  try {
    let d1 = sharedCacheGet("shared-dolarapi-raw-v1", 36e5);
    if (!d1) {
      const r1 = await fetch("https://dolarapi.com/v1/dolares");
      d1 = await r1.json();
      sharedCacheSet("shared-dolarapi-raw-v1", d1);
    }
    baseRates.oficial = d1.find(d => d.casa === "oficial")?.venta || 0;
    baseRates.tarjeta = d1.find(d => d.casa === "tarjeta")?.venta || 0;
    const r2 = await fetch("https://open.er-api.com/v6/latest/USD");
    const d2 = await r2.json();
    allRates = d2.rates;
    baseRates.eur = allRates.EUR;
    baseRates.brl = allRates.BRL;
    document.getElementById("oficial-local").value = fmt(baseRates.oficial);
    document.getElementById("tarjeta-local").value = fmt(baseRates.tarjeta);
    document.getElementById("eur-local").value = fmt(baseRates.eur);
    document.getElementById("brl-local").value = fmt(baseRates.brl);
  } catch (e) {
    console.error(e);
  }
}

window.updateMulti = type => {
  const code = document.getElementById(`select-${type}`).value;
  baseRates[type] = allRates[code];
  document.getElementById(`flag-${type}`).innerHTML = flags[code];
  document.getElementById(`${type}-usd`).value = "1.00";
  document.getElementById(`${type}-local`).value = fmt(baseRates[type]);
};

window.convert = (type, dir) => {
  const u = document.getElementById(`${type}-usd`), l = document.getElementById(`${type}-local`);
  const r = baseRates[type];
  if (dir === "usd") l.value = fmt(cleanVal(u.value) * r); else u.value = fmt(cleanVal(l.value) / r);
};

// ═══════════ Presupuesto: tarjeta, edición inline y topes por categoría ═══════════
function bt(key, vars) {
  const lang = localStorage.getItem("appLang") || "es";
  let str = (i18n[lang] && i18n[lang][key]) || i18n.es[key] || key;
  if (vars) Object.keys(vars).forEach(k => { str = str.split("{" + k + "}").join(vars[k]); });
  return str;
}

function budgetTripName() {
  if (!currentUser || !perfilId) return "";
  const tc = window.TripContext;
  const id = tc.view(currentUser.uid, perfilId);
  if (id === "unassigned") return bt("bc_no_trip");
  const trip = tc.readTrips(currentUser.uid, perfilId).find(t => t.id === id);
  return trip ? trip.name : "";
}

function renderBudgetCard() {
  const card = document.getElementById("budget-card");
  const row = document.getElementById("budget-set-row");
  if (!card || !row) return;
  const has = presupuestoBase > 0;
  const editing = row._editing === true;
  // Lo registrado desde Supermercado ("Registrar como gasto") se muestra en el chip Planificación, no en Gastos.
  // El total (eff) no cambia: solo se reparte entre los dos chips.
  let superSum = 0;
  try {
    superSum = filteredGastos().filter(g => g.source === "walmart" && !pendingDeletes.has(g.id)).reduce((t, g) => t + (Number(g.valor) || 0), 0);
  } catch (e) {}
  const spentG = Math.max(0, (lastGastosTotal || 0) - superSum), spentP = (mapsSpent || 0) + superSum;
  const eff = (lastGastosTotal || 0) + (mapsSpent || 0);
  const pct = has ? eff / presupuestoBase * 100 : 0;
  const over = has && eff > presupuestoBase;
  const show = (id, on, disp) => { const el = document.getElementById(id); if (el) el.style.display = on ? (disp || "block") : "none"; };

  card.classList.toggle("bc-over", over);

  const tripEl = document.getElementById("bc-trip");
  const name = budgetTripName();
  if (tripEl) { tripEl.textContent = name ? "✈️ " + name : ""; tripEl.style.display = name ? "" : "none"; }

  const lbl = document.getElementById("bc-label");
  if (lbl) lbl.textContent = !has ? "" : over ? bt("bc_over_label") : (i18n[localStorage.getItem("appLang") || "es"]?.label_budget || "Presupuesto Restante");

  show("bc-empty", !has);
  show("bc-main", has);
  show("budget-info-row", has && !editing, "flex");
  row.style.display = (!has || editing) ? "flex" : "none";
  const cancel = document.getElementById("bc-cancel-btn");
  if (cancel) cancel.style.display = editing ? "" : "none";

  if (has) {
    const rest = presupuestoBase - eff;
    const trip=currentUser?window.TripContext.readTrips(currentUser.uid,perfilId).find(t=>t.id===window.TripContext.view(currentUser.uid,perfilId)):null;
    const daily=document.getElementById("budget-daily");if(daily)daily.textContent=window.TaxflyTravel.budgetText(window.TaxflyTravel.budget(presupuestoBase,eff,financeReservations,filteredGastos().filter(g=>!pendingDeletes.has(g.id)),trip));
    const disp = document.getElementById("disp-fondo");
    if (disp) disp.textContent = "USD " + fmt(rest);
    const fill = document.getElementById("bc-fill");
    if (fill) {
      fill.style.width = Math.min(100, Math.max(0, pct)).toFixed(1) + "%";
      fill.style.background = pct >= 100 ? "#fecaca" : pct >= 90 ? "#fb923c" : pct >= 70 ? "#fbbf24" : "#34d399";
    }
    const txt = document.getElementById("bc-progress-txt");
    if (txt) txt.textContent = bt("bc_progress", { spent: fmt(eff), total: fmt(presupuestoBase), pct: Math.round(pct) });
    const cg = document.getElementById("bc-chip-gastos");
    if (cg) cg.textContent = bt("bc_spent_expenses") + " USD " + fmt(spentG);
    const cp = document.getElementById("budget-maps-note");
    if (cp) cp.textContent = bt("bc_spent_plan") + " USD " + fmt(spentP);
    const base = document.getElementById("budget-base-val");
    if (base) base.textContent = "USD " + fmt(presupuestoBase);
    const tl = document.getElementById("bc-total-lbl");
    if (tl) tl.textContent = bt("bc_total");
  }

  const hint = document.getElementById("bc-hint");
  if (hint) {
    const unassigned = currentUser && perfilId && window.TripContext.view(currentUser.uid, perfilId) === "unassigned";
    hint.textContent = unassigned ? bt("bc_hint_unassigned") : bt("bc_hint");
  }
}

window.refreshBudgetInfoRow = function refreshBudgetInfoRow() { renderBudgetCard(); };

window.toggleBudgetEdit = () => {
  const row = document.getElementById("budget-set-row");
  const input = document.getElementById("input-fondo");
  if (!row || !input) return;
  if (row._editing) { window.cancelBudgetEdit(); return; }
  row._editing = true;
  input.value = presupuestoBase > 0 ? String(presupuestoBase) : "";
  renderBudgetCard();
  setTimeout(() => { input.focus(); input.select(); }, 50);
};

window.cancelBudgetEdit = () => {
  const row = document.getElementById("budget-set-row");
  const input = document.getElementById("input-fondo");
  if (!row || !input) return;
  row._editing = false;
  input.value = "";
  renderBudgetCard();
};

(function initBudgetInput() {
  const input = document.getElementById("input-fondo");
  const row = document.getElementById("budget-set-row");
  if (!input || !row) return;
  input.addEventListener("focus", () => { input._skipBlur = false; });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); input._skipBlur = true; window.updateFondo(); }
    else if (e.key === "Escape") { input._skipBlur = true; window.cancelBudgetEdit(); }
  });
  // iOS no da foco a los botones: pointerdown avisa que el toque va a un botón, no a "salir del campo"
  row.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) { row._pressing = true; setTimeout(() => { row._pressing = false; }, 500); }
  });
  input.addEventListener("blur", () => {
    if (input._skipBlur) { input._skipBlur = false; return; }
    if (row._pressing) return;
    const v = parseFloat(input.value);
    if (isFinite(v) && v > 0 && v !== presupuestoBase) window.updateFondo();
    else if (row._editing) window.cancelBudgetEdit();
  });
})();

window.updateFondo = async () => {
  const input = document.getElementById("input-fondo");
  const v = parseFloat(String(input.value).replace(",", "."));
  if (!isFinite(v) || v <= 0) {
    showAlert(bt("bc_invalid"));
    return;
  }
  presupuestoBase = v;
  guardarPresupuestoEnCache(v);
  const row = document.getElementById("budget-set-row");
  if (row) row._editing = false;
  input.value = "";
  const spent = filteredGastos().reduce((s, g) => s + (Number(g.valor) || 0), 0);
  updateBudgetDisplay(spent);
  if (currentUser && perfilId) {
    try {
      const ref = currentBudgetRef();
      if (ref) await setDoc(ref, { [currentBudgetField()]: v }, { merge: true });
    } catch (e) {
      console.warn("Budget save failed, cached locally", e);
    }
  }
};

// ── Topes por categoría (se guardan junto al presupuesto, por clave i18n: cat_shopping, cat_food…) ──
function normalizeCatBudgets(o) {
  const out = {};
  Object.keys(o || {}).forEach(k => { const n = Number(o[k]); if (isFinite(n) && n > 0) out[k] = n; });
  return out;
}
function catBudgetsCacheKey() { return currentBudgetKey() + "::cats"; }
function guardarTopesEnCache(obj) {
  try { localStorage.setItem(catBudgetsCacheKey(), JSON.stringify(obj || {})); } catch (e) {}
}
function cargarTopesDesdeCache() {
  try {
    const o = JSON.parse(localStorage.getItem(catBudgetsCacheKey()) || "{}");
    return normalizeCatBudgets(o && typeof o === "object" ? o : {});
  } catch (e) { return {}; }
}

function renderCapsEditor() {
  const list = document.getElementById("caps-list");
  if (!list) return;
  list.innerHTML = Object.keys(CAT_I18N_KEY).map(cat => {
    const key = CAT_I18N_KEY[cat];
    const val = catBudgets[key] ? String(catBudgets[key]) : "";
    return `<div class="caps-row"><span class="caps-name">${catLabel(cat)}</span><input type="text" inputmode="decimal" data-capkey="${key}" placeholder="${bt("caps_placeholder")}" value="${val}" data-num></div>`;
  }).join("");
  updateCapsTotal();
}

function updateCapsTotal() {
  const out = document.getElementById("caps-total");
  if (!out) return;
  let sum = 0;
  document.querySelectorAll("#caps-list input[data-capkey]").forEach(i => { const v = parseFloat(i.value); if (isFinite(v) && v > 0) sum += v; });
  if (presupuestoBase > 0) {
    out.textContent = bt("caps_assigned", { sum: fmt(sum), total: fmt(presupuestoBase) }) + (sum > presupuestoBase ? " — " + bt("caps_over_total") : "");
    out.classList.toggle("warn", sum > presupuestoBase);
  } else {
    out.textContent = bt("caps_assigned_nobudget", { sum: fmt(sum) });
    out.classList.remove("warn");
  }
}

(function initCapsUi() {
  const list = document.getElementById("caps-list");
  const box = document.getElementById("caps-box");
  if (list) list.addEventListener("input", updateCapsTotal);
  if (box) box.addEventListener("toggle", () => { if (box.open) renderCapsEditor(); });
})();

window.guardarTopes = async () => {
  const obj = {};
  document.querySelectorAll("#caps-list input[data-capkey]").forEach(i => {
    const v = parseFloat(i.value);
    obj[i.dataset.capkey] = isFinite(v) && v > 0 ? v : 0;   // 0 = sin tope (así un merge también borra topes viejos)
  });
  catBudgets = normalizeCatBudgets(obj);
  guardarTopesEnCache(catBudgets);
  if (typeof allGastos !== "undefined") renderDashboard(allGastos);
  updateCapsTotal();
  const btn = document.getElementById("caps-save-btn");
  if (btn) {
    btn.textContent = bt("caps_saved");
    setTimeout(() => { btn.textContent = bt("caps_save"); }, 1600);
  }
  if (currentUser && perfilId) {
    try {
      const ref = currentBudgetRef();
      if (ref) await setDoc(ref, { presupuestoCats: obj }, { merge: true });
    } catch (e) {
      console.warn("Caps save failed, cached locally", e);
    }
  }
};

function renderCatBars(cats, total) {
  const rows = cats.slice();
  Object.keys(CAT_I18N_KEY).forEach(cat => {
    if (catBudgets[CAT_I18N_KEY[cat]] && !rows.some(r => r[0] === cat)) rows.push([cat, 0]);
  });
  return rows.map(([cat, val]) => {
    const cap = catBudgets[CAT_I18N_KEY[cat]] || 0;
    if (cap > 0) {
      const p = val / cap * 100;
      const color = p >= 100 ? "var(--danger)" : p >= 80 ? "#f59e0b" : catColor(cat);
      return `<div class="cat-bar-row"><div class="cat-bar-top"><div class="cat-bar-name">${catLabel(cat)}${p >= 100 ? " ⚠️" : ""}</div><div class="cat-bar-amount">${fmt(val)} <span style="color:var(--text-dim);font-weight:600;">/ ${fmt(cap)}</span></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${Math.min(100, Math.round(p))}%;background:${color};"></div></div></div>`;
    }
    return `<div class="cat-bar-row"><div class="cat-bar-top"><div class="cat-bar-name">${catLabel(cat)}</div><div class="cat-bar-amount">${fmt(val)} <span style="color:var(--text-dim);font-weight:600;">${Math.round(val / total * 100)}%</span></div></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${Math.round(val / total * 100)}%;background:${catColor(cat)};"></div></div></div>`;
  }).join("");
}

window.addGasto = async () => {
  await addGastoWithThumb("");
};

function showExpToast(msg, actionLabel, onAction, ms) {
  const el = document.getElementById("exp-toast");
  if (!el) return;
  clearTimeout(el._t);
  el.textContent = "";
  const span = document.createElement("span");
  span.textContent = msg;
  el.appendChild(span);
  if (actionLabel) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = actionLabel;
    btn.onclick = () => {
      el.classList.remove("show");
      if (onAction) onAction();
    };
    el.appendChild(btn);
  }
  el.classList.add("show");
  el._t = setTimeout(() => el.classList.remove("show"), ms || 2200);
}

function dropPendingAdd(g) {
  const ops = getPendingGastos();
  const i = ops.findIndex(o => o.type === "add" && o.data && o.data.fecha === g.fecha && o.data.nombre === g.nombre);
  if (i > -1) {
    ops.splice(i, 1);
    savePendingGastos(ops);
  }
}

async function removeGastoRemote(g) {
  const id = g.id;
  if (g.reservationId) {
    // Remove queued creation/updates first. A delete follows any write already in flight.
    savePendingGastos(getPendingGastos().filter(o=>o.id!==id));
    queueGastoOp({type:'del',id});flushPendingGastos();return;
  }
  if (String(id).startsWith("local_")) {
    dropPendingAdd(g);
    return;
  }
  if (!navigator.onLine || !currentUser) {
    queueGastoOp({ type: "del", id: id });
    return;
  }
  try {
    await deleteDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos", id));
  } catch (e) {
    queueGastoOp({ type: "del", id: id });
  }
}

function commitDelete(id) {
  const p = pendingDeletes.get(id);
  if (!p) return;
  clearTimeout(p.timer);
  pendingDeletes.delete(id);
  removeGastoRemote(p.gasto);
}

function commitAllDeletesNow() {
  [ ...pendingDeletes.keys() ].forEach(commitDelete);
}

function undoDelete(id) {
  const p = pendingDeletes.get(id);
  if (!p) return;
  clearTimeout(p.timer);
  pendingDeletes.delete(id);
  if (!allGastos.some(x => x.id === id)) allGastos.push(p.gasto);
  allGastos.sort((x, y) => (Number(y.fecha) || 0) - (Number(x.fecha) || 0));
  guardarGastosEnCache(allGastos);
  renderGastosList(allGastos);
}

window.deleteGasto = id => {
  if (!perfilId) return;
  const g = allGastos.find(x => x.id === id);
  if (!g || pendingDeletes.has(id)) return;
  commitAllDeletesNow();
  const cached = cargarGastosDesdeCache() || [];
  guardarGastosEnCache(cached.filter(x => x.id !== id));
  allGastos = allGastos.filter(x => x.id !== id);
  pendingDeletes.set(id, { gasto: g, timer: setTimeout(() => commitDelete(id), 6000) });
  renderGastosList(allGastos);
  showExpToast(bt("toast_deleted"), bt("undo"), () => undoDelete(id), 6000);
};

function persistPendingDeletesSafely() {
  if (!pendingDeletes.size) return;
  pendingDeletes.forEach(p => {
    clearTimeout(p.timer);
    if (String(p.gasto.id).startsWith("local_")) dropPendingAdd(p.gasto); else queueGastoOp({ type: "del", id: p.gasto.id });
  });
  pendingDeletes.clear();
  document.getElementById("exp-toast")?.classList.remove("show");
  flushPendingGastos();
}

window.addEventListener("pagehide", persistPendingDeletesSafely);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") persistPendingDeletesSafely();
});

let _editGastoId = null;

window.editGasto = id => {
  const g = allGastos.find(x => x.id === id);
  if (!g) return;
  _editGastoId = id;
  const hint=document.getElementById('edit-payment-hint');if(hint)hint.textContent=g.reservationId?'Pago acumulado de la reserva · editá el total ya pagado.':'';
  document.getElementById("edit-gasto-name").value = g.nombre || "";
  document.getElementById("edit-gasto-val").value = parseFloat(g.valor) || 0;
  const sel = document.getElementById("edit-gasto-cat");
  const current = g.cat || "📦 Otros";
  const cats = Object.keys(CAT_COLORS);
  if (!cats.includes(current)) cats.push(current);
  sel.innerHTML = cats.map(c => `<option value="${esc(c)}"${c === current ? " selected" : ""}>${esc(catLabel(c))}</option>`).join("");
  document.getElementById("edit-gasto-overlay").classList.add("open");
  setTimeout(() => document.getElementById("edit-gasto-name").focus(), 50);
};

window.closeEditGasto = () => {
  document.getElementById("edit-gasto-overlay").classList.remove("open");
  _editGastoId = null;
};

window.saveEditGasto = async () => {
  const id = _editGastoId;
  const g = allGastos.find(x => x.id === id);
  if (!g) { closeEditGasto(); return; }
  const nombre = document.getElementById("edit-gasto-name").value.trim();
  const valor = parseFloat(document.getElementById("edit-gasto-val").value);
  const cat = document.getElementById("edit-gasto-cat").value || "📦 Otros";
  if (!nombre || isNaN(valor) || valor < 0) {
    showAlert(bt("fill_product_msg"));
    return;
  }
  const patch = { nombre: nombre, valor: valor, cat: cat };
  const before = { ...g };
  allGastos = allGastos.map(x => x.id === id ? { ...x, ...patch } : x);
  const cached = cargarGastosDesdeCache() || [];
  guardarGastosEnCache(cached.map(x => x.id === id ? { ...x, ...patch } : x));
  closeEditGasto();
  renderGastosList(allGastos);
  showExpToast(bt("toast_updated"));
  if (g.reservationId && getPendingGastos().some(o=>o.type==='upsert'&&o.id===id)) {
    savePendingGastos(getPendingGastos().map(o=>o.type==='upsert'&&o.id===id?{...o,data:{...o.data,...patch},ts:Date.now()}:o));flushPendingGastos();return;
  }
  if (String(id).startsWith("local_")) {
    const ops = getPendingGastos();
    const op = ops.find(o => o.type === "add" && o.data && o.data.fecha === before.fecha && o.data.nombre === before.nombre);
    if (op) {
      op.data = { ...op.data, ...patch };
      savePendingGastos(ops);
    }
    return;
  }
  if (!navigator.onLine || !currentUser) {
    queueGastoOp({ type: "upd", id: id, data: patch });
    return;
  }
  try {
    await updateDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos", id), patch);
  } catch (e) {
    queueGastoOp({ type: "upd", id: id, data: patch });
  }
};

document.addEventListener("keydown", e => {
  const ov = document.getElementById("edit-gasto-overlay");
  if (!ov || !ov.classList.contains("open")) return;
  if (e.key === "Escape") closeEditGasto();
  if (e.key === "Enter" && !e.isComposing && e.target.tagName !== "SELECT") {
    e.preventDefault();
    if (e.target.id === "edit-gasto-name" && document.getElementById("edit-gasto-val").value === "") document.getElementById("edit-gasto-val").focus(); else saveEditGasto();
  }
});

let allGastos = [];

const CAT_COLORS = {
  "🛍️ Compras": "#2563eb",
  "👟 Ropa": "#7c3aed",
  "🍔 Comida": "#f59e0b",
  "🎢 Entretenimiento": "#0ea5e9",
  "🚗 Transporte": "#10b981",
  "🏨 Alojamiento": "#8b5cf6",
  "💊 Farmacia": "#ef4444",
  "✈️ Vuelos": "#0284c7",
  "📦 Otros": "#94a3b8"
};

const CAT_I18N_KEY = {
  "🛍️ Compras": "cat_shopping",
  "👟 Ropa": "cat_clothing",
  "🍔 Comida": "cat_food",
  "🎢 Entretenimiento": "cat_entertainment",
  "🚗 Transporte": "cat_transport",
  "🏨 Alojamiento": "cat_accommodation",
  "💊 Farmacia": "cat_pharmacy",
  "✈️ Vuelos": "cat_flights",
  "📦 Otros": "cat_other"
};

function catColor(cat) {
  return CAT_COLORS[cat] || "#94a3b8";
}

function catLabel(cat) {
  const lang = localStorage.getItem("appLang") || "es";
  const key = CAT_I18N_KEY[cat];
  return key && i18n[lang]?.[key] || cat;
}

// ═══════════ Categorías personalizadas ═══════════
// Se suman a las fijas: reutilizan CAT_COLORS / CAT_I18N_KEY, así dashboard, topes y editor las toman solos.
const BUILTIN_CATS = new Set(Object.keys(CAT_I18N_KEY));
const CUSTOM_CAT_PALETTE = ["#ec4899", "#14b8a6", "#f97316", "#84cc16", "#6366f1", "#eab308", "#06b6d4", "#f43f5e"];
let customCats = [];            // [{ name: "🎮 Juegos", color: "#ec4899" }]
let _newCatColor = CUSTOM_CAT_PALETTE[0];
// Íconos SVG (línea, stroke=currentColor) para categorías personalizadas — sin emojis.
const CAT_ICON_SVGS = {
  tag: '<path d="M3 11.2V5a2 2 0 0 1 2-2h6.2a2 2 0 0 1 1.41.59l8 8a2 2 0 0 1 0 2.82l-6.2 6.2a2 2 0 0 1-2.82 0l-8-8A2 2 0 0 1 3 11.2Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  suitcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
  beach: '<circle cx="12" cy="7" r="3"/><path d="M3 13c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M3 18c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/>',
  mountain: '<path d="m3 20 6-11 4 6 2-3 6 8Z"/><circle cx="17" cy="6" r="2"/>',
  "ferris-wheel": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7"/>',
  camera: '<path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  ticket: '<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M13 7v10" stroke-dasharray="2.2 2.2"/>',
  gamepad: '<rect x="2.5" y="7.5" width="19" height="10" rx="4"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11" r="1"/><circle cx="18.5" cy="13.5" r="1"/>',
  gift: '<rect x="3" y="9" width="18" height="11" rx="1"/><path d="M3 9h18v3H3z"/><path d="M12 9v11"/><path d="M12 9C9.5 9 8 7.6 8 6a2 2 0 1 1 4 0v3Zm0 0c2.5 0 4-1.4 4-3a2 2 0 1 0-4 0v3Z"/>',
  "teddy-bear": '<circle cx="12" cy="14" r="7"/><circle cx="6" cy="6.5" r="2.3"/><circle cx="18" cy="6.5" r="2.3"/><circle cx="9.3" cy="13" r="1"/><circle cx="14.7" cy="13" r="1"/><path d="M9.5 16.8c.9.8 4.1.8 5 0"/>',
  glasses: '<circle cx="6.5" cy="14" r="3.3"/><circle cx="17.5" cy="14" r="3.3"/><path d="M9.8 13h4.4M3 13l1.3-5.3A2 2 0 0 1 6.2 6h1.1M21 13l-1.3-5.3A2 2 0 0 0 17.7 6h-1.1"/>',
  handbag: '<path d="M5 9h14l1.2 10.2a2 2 0 0 1-2 2.3H5.8a2 2 0 0 1-2-2.3Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
  backpack: '<path d="M7 20V9a5 5 0 0 1 10 0v11"/><rect x="5" y="9" width="14" height="12" rx="2.5"/><path d="M9 4.5h6M9 13.5h6M10.5 17h3"/>',
  bottle: '<path d="M10 2h4v3.2c1.3.8 2 2.1 2 3.6V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8.8c0-1.5.7-2.8 2-3.6Z"/><path d="M8.5 13h7"/>',
  cart: '<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3h2.6l2.1 11.6a2 2 0 0 0 2 1.7h8.1a2 2 0 0 0 2-1.6L21 8H6"/>',
  pizza: '<path d="M12 2 2 20h20Z"/><circle cx="12" cy="13" r="1"/><circle cx="9.5" cy="17" r="1"/><circle cx="14.5" cy="17" r="1"/>',
  coffee: '<path d="M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 3c0 1.2-1 1.3-1 2.5S8 7 8 7M12 3c0 1.2-1 1.3-1 2.5S12 7 12 7"/>',
  beer: '<path d="M5 9h10v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"/><path d="M15 10.5h1.5a2 2 0 0 1 0 4H15"/><path d="M6 9 6.6 4h7.8L15 9"/>',
  "ice-cream": '<path d="M7 10a5 5 0 0 1 10 0Z"/><path d="M7 10h10l-4.2 10a.9.9 0 0 1-1.6 0Z"/>',
  taxi: '<path d="M5 16V10l1.7-4.2A2 2 0 0 1 8.6 4.5h6.8a2 2 0 0 1 1.9 1.3L19 10v6"/><rect x="3" y="13" width="18" height="6" rx="2"/><circle cx="7.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/><path d="M9 8h6"/>',
  train: '<rect x="5" y="3" width="14" height="13" rx="4"/><path d="M5 11h14"/><circle cx="9" cy="14.2" r="0.1"/><circle cx="8.5" cy="13.5" r="1"/><circle cx="15.5" cy="13.5" r="1"/><path d="M8 20 6 22M16 20l2 2"/>',
  ship: '<path d="M3 16h18l-2.3 4.1a1 1 0 0 1-.9.5H6.2a1 1 0 0 1-.9-.5Z"/><path d="M12 16V4"/><path d="M12 5 17 10.5H12Z"/>',
  fuel: '<path d="M4 21V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15"/><path d="M4 11h9"/><path d="M15 8l3 2v6a1.6 1.6 0 0 0 3.2 0V9.5a2 2 0 0 0-.6-1.4L18.5 6"/><path d="M3 21h13"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 16V7h3.5a3 3 0 0 1 0 6H9"/>',
  passport: '<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M8.5 15.5c0-1.9 1.6-2.5 3.5-2.5s3.5.6 3.5 2.5"/>',
  phone: '<rect x="6.5" y="2" width="11" height="20" rx="2.2"/><path d="M11 18.5h2"/>',
  plug: '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v4a6 6 0 0 1-12 0Z"/><path d="M12 18v4"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01M18 15v.01"/>',
  scissors: '<circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M20 4 8.5 13.5M8.3 10.5 20 20"/>',
  stethoscope: '<path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v2a5 5 0 0 0 10 0v-2.5"/><circle cx="19" cy="9.5" r="2"/><path d="M5 3H4M9 3H8"/>',
  umbrella: '<path d="M3 12a9 9 0 0 1 18 0Z"/><path d="M12 12v8a2 2 0 0 1-3.5 1.3"/><path d="M12 3v1"/>'
};
const CUSTOM_CAT_ICONS = Object.keys(CAT_ICON_SVGS);
function catIconSvg(key, extra) {
  const d = CAT_ICON_SVGS[key] || CAT_ICON_SVGS.tag;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra ? " " + extra : ""}>${d}</svg>`;
}
let _newCatIcon = CUSTOM_CAT_ICONS[0];

function customCatsCacheKey() { return "taxfly_custom_cats::" + (currentUser?.uid || localStorage.getItem("taxusa_offline_uid") || "sin-usuario"); }
function customCatKey(name) {
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h * 33) ^ name.charCodeAt(i)) >>> 0;
  return "cc_" + h.toString(36);
}
function normalizeCustomCats(arr) {
  const seen = new Set(), out = [];
  (Array.isArray(arr) ? arr : []).forEach(c => {
    // Migración: categorías viejas guardaban el emoji pegado al nombre ("🎮 Juegos").
    // Lo quitamos del texto y, si no hay ícono guardado, usamos uno por defecto.
    let name = String(c && c.name || "").trim().replace(/^[\p{Extended_Pictographic}\u200d\ufe0f\s]+/u, "").trim().slice(0, 40);
    if (!name || seen.has(name) || BUILTIN_CATS.has(name)) return;
    const color = /^#[0-9a-f]{6}$/i.test(c.color || "") ? c.color : "#94a3b8";
    const icon = CAT_ICON_SVGS[c.icon] ? c.icon : "tag";
    seen.add(name);
    out.push({ name, color, icon });
  });
  return out.slice(0, 30);
}
function applyCustomCats() {
  Object.keys(CAT_I18N_KEY).forEach(k => { if (!BUILTIN_CATS.has(k)) { delete CAT_I18N_KEY[k]; delete CAT_COLORS[k]; } });
  customCats.forEach(c => { CAT_COLORS[c.name] = c.color; CAT_I18N_KEY[c.name] = customCatKey(c.name); });
}
function bindCatTag(btn) {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#cat-tag-row .cat-tag").forEach(b => b.classList.remove("sel"));
    btn.classList.add("sel");
  });
}
function renderCustomCatChips(selectName) {
  const row = document.getElementById("cat-tag-row");
  const addBtn = document.getElementById("cat-add-btn");
  if (!row || !addBtn) return;
  const prev = selectName || row.querySelector(".cat-tag.sel")?.dataset.cat;
  row.querySelectorAll(".cat-tag[data-custom]").forEach(b => b.remove());
  customCats.forEach(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cat-tag";
    b.dataset.cat = c.name;
    b.dataset.custom = "1";
    b.innerHTML = `<span class="cat-tag-icon">${catIconSvg(c.icon)}</span>${esc(c.name)}`;
    bindCatTag(b);
    row.insertBefore(b, addBtn);
  });
  const tags = [...row.querySelectorAll(".cat-tag")];
  let hit = prev && tags.find(b => b.dataset.cat === prev);
  if (!hit) {
    try { const last = localStorage.getItem("taxfly_last_expense_cat"); hit = last && tags.find(b => b.dataset.cat === last); } catch (e) {}
  }
  if (hit) { tags.forEach(b => b.classList.remove("sel")); hit.classList.add("sel"); }
  else if (!row.querySelector(".cat-tag.sel") && tags[0]) tags[0].classList.add("sel");
}
function refreshAfterCatsChange() {
  applyCustomCats();
  renderCustomCatChips();
  if (typeof allGastos !== "undefined") {
    try { renderGastosList(allGastos); renderDashboard(allGastos); } catch (e) {}
  }
  if (!document.getElementById("caps-box")?.open) { try { renderCapsEditor(); } catch (e) {} }
}
async function saveCustomCats() {
  try { localStorage.setItem(customCatsCacheKey(), JSON.stringify(customCats)); } catch (e) {}
  if (currentUser && perfilId && navigator.onLine) {
    try { await setDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId), { customCats }, { merge: true }); }
    catch (e) { console.warn("Custom cats save failed, cached locally", e); }
  }
}
async function loadCustomCats() {
  try { customCats = normalizeCustomCats(JSON.parse(localStorage.getItem(customCatsCacheKey()) || "[]")); } catch (e) { customCats = []; }
  refreshAfterCatsChange();
  if (!currentUser || !perfilId) return;
  try {
    const snap = await getDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId));
    const remote = snap.exists() ? snap.data().customCats : null;
    if (Array.isArray(remote)) {
      customCats = normalizeCustomCats(remote);
      try { localStorage.setItem(customCatsCacheKey(), JSON.stringify(customCats)); } catch (e) {}
      refreshAfterCatsChange();
    } else if (customCats.length) {
      saveCustomCats();   // había categorías locales y la nube estaba vacía: las subimos
    }
  } catch (e) { console.warn("Custom cats load failed", e); }
}

function renderCatIcons() {
  const box = document.getElementById("cat-new-icons");
  if (!box) return;
  box.innerHTML = CUSTOM_CAT_ICONS.map(i => `<button type="button" class="cat-icon${i === _newCatIcon ? " sel" : ""}" data-icon="${i}" role="radio" aria-checked="${i === _newCatIcon}">${catIconSvg(i)}</button>`).join("");
  box.querySelectorAll(".cat-icon").forEach(b => b.addEventListener("click", () => { _newCatIcon = b.dataset.icon; renderCatIcons(); }));
}
function renderCatSwatches() {
  const box = document.getElementById("cat-new-swatches");
  if (!box) return;
  box.innerHTML = CUSTOM_CAT_PALETTE.map(c => `<button type="button" class="cat-swatch${c === _newCatColor ? " sel" : ""}" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join("");
  box.querySelectorAll(".cat-swatch").forEach(b => b.addEventListener("click", () => { _newCatColor = b.dataset.color; renderCatSwatches(); }));
}
function renderMyCats() {
  const wrap = document.getElementById("cat-mine"), list = document.getElementById("cat-mine-list");
  if (!wrap || !list) return;
  wrap.style.display = customCats.length ? "" : "none";
  list.innerHTML = customCats.map((c, i) => `<div class="cat-mine-row"><span class="cat-mine-dot" style="background:${c.color}"></span><span class="cat-mine-icon">${catIconSvg(c.icon)}</span><span class="n">${esc(c.name)}</span><button type="button" class="cat-mine-del" data-i="${i}" aria-label="✕">✕</button></div>`).join("");
  list.querySelectorAll(".cat-mine-del").forEach(b => b.addEventListener("click", async () => {
    const c = customCats[Number(b.dataset.i)];
    if (!c) return;
    customCats.splice(Number(b.dataset.i), 1);
    await saveCustomCats();
    refreshAfterCatsChange();
    renderMyCats();
  }));
}
window.openCatCreator = () => {
  _newCatColor = CUSTOM_CAT_PALETTE[customCats.length % CUSTOM_CAT_PALETTE.length];
  _newCatIcon = CUSTOM_CAT_ICONS[0];
  document.getElementById("cat-new-name").value = "";
  renderCatIcons();
  renderCatSwatches();
  renderMyCats();
  document.getElementById("cat-new-overlay").classList.add("open");
  setTimeout(() => document.getElementById("cat-new-name").focus(), 50);
};
window.closeCatCreator = () => document.getElementById("cat-new-overlay").classList.remove("open");
window.saveNewCat = async () => {
  const txt = document.getElementById("cat-new-name").value.trim().replace(/\s+/g, " ");
  if (!txt) { showAlert(bt("cat_new_empty")); return; }
  const name = txt;
  const dup = [...BUILTIN_CATS].some(k => catLabel(k).replace(/^\S+\s*/, "").toLowerCase() === txt.toLowerCase())
    || customCats.some(c => c.name.toLowerCase() === txt.toLowerCase());
  if (dup) { showAlert(bt("cat_new_dup")); return; }
  customCats.push({ name, color: _newCatColor, icon: _newCatIcon });
  customCats = normalizeCustomCats(customCats);
  applyCustomCats();
  renderCustomCatChips(name);
  closeCatCreator();
  await saveCustomCats();
  refreshAfterCatsChange();
  renderCustomCatChips(name);
};
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeCatCreator();
  if (e.key === "Enter" && !e.isComposing && e.target && e.target.id === "cat-new-name") { e.preventDefault(); saveNewCat(); }
});

const pendingDeletes = new Map();

function dayKey(ts) {
  const n = Number(ts);
  const d = new Date(n);
  if (!n || isNaN(d.getTime())) return "none";
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function dayLabel(key, ts) {
  if (key === "none") return bt("day_nodate");
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (key === dayKey(now.getTime())) return bt("day_today");
  if (key === dayKey(yest.getTime())) return bt("day_yesterday");
  const lang = localStorage.getItem("appLang") || "es";
  const loc = { es: "es-AR", en: "en-US", pt: "pt-BR" }[lang] || "es-AR";
  return new Date(Number(ts)).toLocaleDateString(loc, { weekday: "short", day: "numeric", month: "short" });
}

function zeroLabel() {
  const lg = localStorage.getItem("appLang") || "es";
  return { es: "Sin costo", en: "No cost", pt: "Sem custo" }[lg] || "Sin costo";
}
function amountLabel(v) {
  return (parseFloat(v) || 0) > 0 ? "-" + fmt(v) : zeroLabel();
}

// Detección automática de ícono SVG por palabra clave en el texto de la categoría
// (sirve tanto para categorías propias en español/inglés como para las que llegan
// de otras fuentes, ej. "grupo", que no usan emoji). Usa la misma librería de íconos
// de línea que la barra de navegación (window.UI_ICONS, definida en ui.js).
// Sin match: ícono genérico "tag".
const CAT_KEYWORD_ICONS = [
  [/comid|food|resta|cena|almuerz|desayun|cocin|cafe|coffee|bebid|beer|cerve/i, "utensils"],
  [/entreten|divers|activ|parque|\bpark\b|juego|\bgame\b|ferris/i, "ferris"],
  [/ticket|entrada|cine|show|pelicula|movie/i, "ticket"],
  [/\bbus\b|tren|train/i, "bus"],
  [/transport|\bauto\b|taxi|uber|combustible|nafta|\bfuel\b|\bgas\b|estacionamient|parking/i, "car"],
  [/alojamient|hotel|hosped|lodging|airbnb/i, "bed"],
  [/vuelo|flight|avion|aerol/i, "plane"],
  [/ropa|clothing|shirt/i, "shirt"],
  [/regalo|\bgift\b/i, "gift"],
  [/compra|\bshop/i, "cart"],
  [/farmacia|salud|medic|pharma|doctor|pastill|pill/i, "medical"],
  [/segur[oa]|insurance/i, "shield"],
  [/telefon|celular|\besim\b|\bsim\b|datos|\bphone\b/i, "phone"],
  [/document|pasaporte|passport|\bvisa\b|\bid\b/i, "idcard"],
  [/mochila|backpack|equipaje|maleta/i, "briefcase"],
  [/efectivo|\bcash\b|dinero/i, "cash"]
];
function autoCatIcon(catText) {
  const t = String(catText || "").replace(/^[\p{Extended_Pictographic}\u200d\ufe0f\s]+/u, "").trim();
  for (const [re, icon] of CAT_KEYWORD_ICONS) if (re.test(t)) return icon;
  return "tag";
}
function uiIconSvg(name) {
  const icons = window.UI_ICONS || {};
  const d = icons[name] || icons.tag || "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

function gastoItemHtml(g) {
  const cat = g.cat || "📦 Otros";
  const customCat = customCats.find(c => c.name === cat);
  const catIconHtml = customCat ? catIconSvg(customCat.icon) : uiIconSvg(autoCatIcon(cat));
  const catDisplayLabel = customCat ? customCat.name : catLabel(cat).replace(/^\S+\s*/, "");
  const thumbHtml = g.thumb ? `<img class="h-thumb" src="${g.thumb}" alt="recibo" onclick="openReceiptViewer('${g.thumb}','${g.id}')">` : `<div class="h-thumb-placeholder">${catIconHtml}</div>`;
  const editLbl = esc(bt("aria_edit") + ": " + (g.nombre || ""));
  return `<div class="history-item" style="border-left-color:${catColor(cat)}">
                ${thumbHtml}
                <div class="h-main" role="button" tabindex="0" aria-label="${editLbl}" onclick="editGasto('${g.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();editGasto('${g.id}')}">
                    <div class="h-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(g.nombre)}${window.tfSyncBadge ? tfSyncBadge(g._pending || String(g.id).startsWith("local_") ? "pending" : "ok", true) : ""}</div>
                    <div style="font-size:.62rem;color:var(--text-dim);margin-top:1px;">${catDisplayLabel}</div>
                </div>
                <div class="h-right">
                    <div class="h-amount"${(parseFloat(g.valor) || 0) > 0 ? "" : ' style="color:var(--text-dim);font-size:.8rem;"'}>${amountLabel(g.valor)}</div>
                    <button class="h-del" onclick="deleteGasto('${g.id}')" aria-label="${esc(bt("aria_delete"))}">✕</button>
                </div>
            </div>`;
}

function renderGastosList(gastos) {
  if (currentUser && perfilId) gastos = window.TripContext.filter(gastos, currentUser.uid, perfilId);
  gastos = (gastos || []).filter(g => !pendingDeletes.has(g.id));
  const c = document.getElementById("listaGastos");
  if (!gastos.length) {
    c.innerHTML = '<p style="text-align:center;color:var(--text-dim);font-size:.85rem;" data-i18n="empty_expenses">' + esc(bt("empty_expenses")) + '</p>';
    updateBudgetDisplay(0);
    renderDashboard([]);
    return;
  }
  let total = 0;
  gastos.forEach(g => total += parseFloat(g.valor) || 0);
  const sorted = gastos.slice().sort((x, y) => (Number(y.fecha) || 0) - (Number(x.fecha) || 0));
  const groups = [];
  const byKey = {};
  sorted.forEach(g => {
    const k = dayKey(g.fecha);
    if (!byKey[k]) {
      byKey[k] = { key: k, ts: g.fecha, sub: 0, items: [] };
      groups.push(byKey[k]);
    }
    byKey[k].sub += parseFloat(g.valor) || 0;
    byKey[k].items.push(g);
  });
  c.innerHTML = groups.map(grp => `<section class="exp-day-card"><div class="exp-day-head"><span>${esc(dayLabel(grp.key, grp.ts))}</span><b>${amountLabel(grp.sub)}</b></div>` + grp.items.map(gastoItemHtml).join("") + `</section>`).join("");
  updateBudgetDisplay(total);
  renderDashboard(gastos);
}

function listenGastos() {
  if (!currentUser || !perfilId) return;
  const cached = cargarGastosDesdeCache();
  if (cached && cached.length) {
    allGastos = window.TaxflyTravel.overlayExpenses(cached,getPendingGastos());
    if(!navigator.onLine)expenseSnapshotReady=true;
    renderGastosList(allGastos);
  }
  const q = query(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos"), orderBy("fecha", "desc"));
  onSnapshot(q, snap => {
    if (!snap.metadata?.fromCache) window.taxflyOfflineStatus?.mark("expenses", currentUser.uid, perfilId);
    expenseSnapshotReady=!navigator.onLine || !snap.metadata?.fromCache;
    if (snap.empty) {
      const pending = getPendingGastos();
      const hayLocales = allGastos.some(g => String(g.id).startsWith("local_"));
      if (pending.length > 0 || hayLocales) {allGastos=window.TaxflyTravel.overlayExpenses(allGastos,pending);renderGastosList(allGastos);offerReservationPayment();return;}
      allGastos = window.TaxflyTravel.overlayExpenses([],getPendingGastos());
      guardarGastosEnCache(allGastos);
      renderGastosList(allGastos);offerReservationPayment();
      return;
    }
    const gastosFirestore = snap.docs.map(d => {
      const data = d.data(), val = parseFloat(data.valor) || 0;
      return {
        ...data,
        id: d.id,
        valor: val
      };
    });
    allGastos = window.TaxflyTravel.overlayExpenses(gastosFirestore,getPendingGastos());
    guardarGastosEnCache(allGastos);
    renderGastosList(allGastos);offerReservationPayment();
  });
}

function listenPresupuestoYOrlando() {
  if (!currentUser || !perfilId) return;
  const ref=currentBudgetRef(), field=currentBudgetField();
  if (ref) onSnapshot(ref,snap=>{
    if (!snap.exists()) return;
    const cats=snap.data().presupuestoCats;
    if (cats && typeof cats==="object") {
      catBudgets=normalizeCatBudgets(cats);
      guardarTopesEnCache(catBudgets);
      if (!document.getElementById("caps-box")?.open) renderCapsEditor();
      if (typeof allGastos!=="undefined") renderDashboard(allGastos);
    }
    if (snap.data()[field]===undefined) return;
    presupuestoBase=Number(snap.data()[field])||0;
    guardarPresupuestoEnCache(presupuestoBase);
    updateBudgetDisplay(lastGastosTotal);
    refreshBudgetInfoRow();
  },()=>{});
  listenTripPlanningSpent();
}

function updateBudgetDisplay(spent) {
  lastGastosTotal = spent;
  const eff = spent + mapsSpent;
  renderBudgetCard();
  if (presupuestoBase > 0) checkBudgetAlerts(eff);
}

const VAPID_PUBLIC_KEY = localStorage.getItem("taxfly_vapid_key") || "";

function isVapidConfigured() {
  return VAPID_PUBLIC_KEY.length === 87 && !VAPID_PUBLIC_KEY.endsWith("abcdefg");
}

function budgetAlertKey(kind) {
  const uid=currentUser?.uid || localStorage.getItem("taxusa_offline_uid");
  return window.TaxflyTravel.alertKey(kind,uid,perfilId,uid?window.TripContext.view(uid,perfilId):"unassigned");
}

function getLastAlertedPct() {
  try {
    const v = localStorage.getItem(budgetAlertKey("alerted_pct"));
    return v ? Number(v) : null;
  } catch (e) {
    return null;
  }
}

function setLastAlertedPct(pct) {
  try {
    if (pct === null) localStorage.removeItem(budgetAlertKey("alerted_pct")); else localStorage.setItem(budgetAlertKey("alerted_pct"), String(pct));
  } catch (e) {}
}

function getLastCheckedSpent() {
  try {
    const v = localStorage.getItem(budgetAlertKey("last_spent"));
    return v === null ? null : Number(v);
  } catch (e) {
    return null;
  }
}

function setLastCheckedSpent(spent) {
  try { localStorage.setItem(budgetAlertKey("last_spent"), String(spent)); } catch (e) {}
}

async function requestPushPermission() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([ ...rawData ].map(c => c.charCodeAt(0)));
}

async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    if (!isVapidConfigured()) {
      console.info("[Push] Sin clave VAPID configurada — solo notificaciones locales.");
      return null;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    console.log("[Push] Suscripción creada:", sub.endpoint);
    return sub;
  } catch (e) {
    console.warn("[Push] No se pudo suscribir:", e);
    return null;
  }
}

async function showLocalBudgetNotification(pct, spent, budget) {
  const notificationTag=budgetAlertKey("notification")+"-"+pct;
  const granted = await requestPushPermission();
  if (!granted) return;
  const lang = localStorage.getItem("appLang") || "es";
  const texts = {
    es: {
      70: {
        title: "⚠️ Presupuesto al 70%",
        body: `Gastaste ${fmt(spent)} de ${fmt(budget)} USD.`
      },
      90: {
        title: "🚨 Presupuesto al 90%",
        body: `¡Cuidado! Solo te quedan ${fmt(budget - spent)} USD.`
      },
      100: {
        title: "🔴 Presupuesto agotado",
        body: `Superaste tu presupuesto. Llevás ${fmt(spent)} USD gastados.`
      }
    },
    en: {
      70: {
        title: "⚠️ Budget at 70%",
        body: `You've spent ${fmt(spent)} of ${fmt(budget)} USD.`
      },
      90: {
        title: "🚨 Budget at 90%",
        body: `Almost there! Only ${fmt(budget - spent)} USD left.`
      },
      100: {
        title: "🔴 Budget exceeded",
        body: `You went over budget. Total spent: ${fmt(spent)} USD.`
      }
    },
    pt: {
      70: {
        title: "⚠️ Orçamento em 70%",
        body: `Você gastou ${fmt(spent)} de ${fmt(budget)} USD.`
      },
      90: {
        title: "🚨 Orçamento em 90%",
        body: `Cuidado! Restam apenas ${fmt(budget - spent)} USD.`
      },
      100: {
        title: "🔴 Orçamento esgotado",
        body: `Você ultrapassou o orçamento. Total: ${fmt(spent)} USD.`
      }
    }
  };
  const t = (texts[lang] || texts.es)[pct];
  if (!t) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(t.title, {
      body: t.body,
      icon: "./assets/icon-192.png",
      badge: "./assets/icon-192.png",
      tag: notificationTag,
      renotify: true,
      vibrate: [ 200, 100, 200 ],
      data: {
        url: "./compras.html"
      },
      actions: [ {
        action: "open",
        title: "📊 Ver gastos"
      }, {
        action: "dismiss",
        title: "✕ Cerrar"
      } ]
    });
  } catch (e) {
    console.warn("[Push] showNotification falló:", e);
  }
}

function checkBudgetAlerts(spent) {
  if (!(currentUser?.uid||localStorage.getItem("taxusa_offline_uid")) || !perfilId || !presupuestoBase || presupuestoBase <= 0) return;
  const lastSpent = getLastCheckedSpent();
  const huboGastoNuevo = lastSpent === null || Math.abs(spent - lastSpent) > 0.009;
  setLastCheckedSpent(spent);
  if (!huboGastoNuevo) return;
  const pct = spent / presupuestoBase * 100;
  let threshold = null;
  if (pct >= 100) threshold = 100; else if (pct >= 90) threshold = 90; else if (pct >= 70) threshold = 70;
  if (!threshold) {
    setLastAlertedPct(null);
    return;
  }
  if (getLastAlertedPct() === threshold) return;
  setLastAlertedPct(threshold);
  showLocalBudgetNotification(threshold, spent, presupuestoBase);
}

async function initPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (Notification.permission === "granted") {
    await subscribeToPush();
  }
}

window.activarNotificaciones = async function() {
  const lang = localStorage.getItem("appLang") || "es";
  const btn = document.getElementById("btn-activar-notif");
  const banner = document.getElementById("notif-banner");
  if (Notification.permission === "denied") {
    const msgs = {
      es: "Las notificaciones están bloqueadas. Para activarlas, andá a Ajustes del sistema → Notificaciones → tu navegador y habilitá los permisos para este sitio.",
      en: "Notifications are blocked. To enable them, go to System Settings → Notifications → your browser and allow permissions for this site.",
      pt: "As notificações estão bloqueadas. Para ativá-las, acesse Configurações → Notificações → seu navegador e permita as notificações para este site."
    };
    showAlert(msgs[lang] || msgs.es);
    return;
  }
  const granted = await requestPushPermission();
  if (granted) {
    await subscribeToPush();
    if (banner) banner.style.display = "none";
    if (btn) {
      btn.classList.remove("denied");
    }
    const ok = {
      es: "✅ Notificaciones activadas",
      en: "✅ Notifications enabled",
      pt: "✅ Notificações ativadas"
    };
    showAlert(ok[lang] || ok.es);
  } else {
    const msgs = {
      es: "🔕 Notificaciones bloqueadas — activar en ajustes",
      en: "🔕 Notifications blocked — enable in settings",
      pt: "🔕 Notificações bloqueadas — ativar nas configurações"
    };
    if (btn) {
      btn.textContent = msgs[lang] || msgs.es;
      btn.classList.add("denied");
    }
    const deny = {
      es: "Podés activarlas luego desde Ajustes del navegador.",
      en: "You can enable them later in browser Settings.",
      pt: "Você pode ativá-las depois nas Configurações do navegador."
    };
    showAlert(deny[lang] || deny.es);
  }
};

function renderDashboard(gastos) {
  if (currentUser && perfilId) gastos = window.TripContext.filter(gastos, currentUser.uid, perfilId);
  const empty = document.getElementById("dash-empty");
  const content = document.getElementById("dash-content");
  if (!empty || !content) return;
  if (!gastos || !gastos.length) {
    empty.style.display = "block";
    content.style.display = "none";
    return;
  }
  empty.style.display = "none";
  content.style.display = "block";
  const total = gastos.reduce((s, g) => s + g.valor, 0);
  const count = gastos.length;
  const top = gastos.reduce((a, b) => b.valor > a.valor ? b : a, gastos[0]);
  document.getElementById("dash-total").textContent = "$" + fmt(total);
  document.getElementById("dash-count").textContent = count;
  document.getElementById("dash-avg").textContent = "$" + fmt(total / count);
  document.getElementById("dash-top").textContent = top.nombre.substring(0, 13) + (top.nombre.length > 13 ? "…" : "");
  {
    const dv = document.getElementById("donut-val");
    dv.textContent = "$" + fmt(total);
    dv.style.fontSize = Math.min(16, 66 / (dv.textContent.length * .6)).toFixed(1) + "px";
  }
  const bycat = {};
  gastos.forEach(g => {
    const c = g.cat || "📦 Otros";
    bycat[c] = (bycat[c] || 0) + g.valor;
  });
  const cats = Object.entries(bycat).sort((a, b) => b[1] - a[1]);
  const svg = document.getElementById("donut-svg");
  const cx = 70, cy = 70, R = 58, r = 42;
  let angle = -Math.PI / 2, paths = "";
  cats.forEach(([cat, val]) => {
    const a = val / total * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + a), y2 = cy + R * Math.sin(angle + a);
    const xi1 = cx + r * Math.cos(angle), yi1 = cy + r * Math.sin(angle);
    const xi2 = cx + r * Math.cos(angle + a), yi2 = cy + r * Math.sin(angle + a);
    const lg = a > Math.PI ? 1 : 0, col = catColor(cat);
    paths += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} A${R},${R} 0 ${lg},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${r},${r} 0 ${lg},0 ${xi1.toFixed(1)},${yi1.toFixed(1)} Z" fill="${col}" opacity="0.93" stroke="var(--surface)" stroke-width="2"/>`;
    angle += a;
  });
  svg.innerHTML = paths;
  document.getElementById("donut-legend").innerHTML = cats.slice(0, 5).map(([cat, val]) => `<div class="legend-item"><div class="legend-dot" style="background:${catColor(cat)}"></div><div class="legend-name">${catLabel(cat)}</div><div class="legend-val">${fmt(val)}</div><div class="legend-pct">${Math.round(val / total * 100)}%</div></div>`).join("");
  document.getElementById("cat-bars").innerHTML = renderCatBars(cats, total);
}

window.abrirExportSheet = function() {
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  if (!filteredGastos().length) {
    const msg = {
      es: "No hay gastos para exportar.",
      en: "No expenses to export.",
      pt: "Nenhum gasto para exportar."
    };
    showAlert(msg[lang] || msg.es);
    return;
  }
  document.getElementById("sheet-title").textContent = T.sheet_title || "¿CÓMO QUERÉS COMPARTIRLO?";
  document.querySelectorAll('[data-i18n="sheet_img_name"]').forEach(el => el.textContent = T.sheet_img_name || "Imagen");
  document.querySelectorAll('[data-i18n="sheet_img_desc"]').forEach(el => el.textContent = T.sheet_img_desc || "Ideal para compartir al instante");
  document.querySelectorAll('[data-i18n="sheet_pdf_name"]').forEach(el => el.textContent = T.sheet_pdf_name || "PDF");
  document.querySelectorAll('[data-i18n="sheet_pdf_desc"]').forEach(el => el.textContent = T.sheet_pdf_desc || "Ideal para guardar o enviar formalmente");
  document.querySelectorAll('[data-i18n="sheet_cancel"]').forEach(el => el.textContent = T.sheet_cancel || "Cancelar");
  document.getElementById("export-sheet-overlay").classList.add("open");
};

window.closeExportSheet = function() {
  document.getElementById("export-sheet-overlay").classList.remove("open");
};

function poblarExportCard() {
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  const exportGastos = filteredGastos();
  const total = exportGastos.reduce((s, g) => s + g.valor, 0);
  const count = exportGastos.length;
  const avg = total / count;
  const top = exportGastos.reduce((a, b) => b.valor > a.valor ? b : a, exportGastos[0]);
  const rest = presupuestoBase > 0 ? presupuestoBase - total - mapsSpent : null;
  const now = new Date;
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";
  document.getElementById("ec-date-lbl").textContent = now.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  document.getElementById("ec-spent-lbl").textContent = T.ec_spent || "TOTAL GASTADO";
  document.getElementById("ec-rest-lbl").textContent = T.ec_rest || "RESTANTE";
  document.getElementById("ec-count-lbl").textContent = T.ec_count || "Compras";
  document.getElementById("ec-avg-lbl").textContent = T.ec_avg || "Promedio";
  document.getElementById("ec-top-lbl").textContent = T.ec_top || "Mayor gasto";
  document.getElementById("ec-cats-title").textContent = T.ec_by_cat || "POR CATEGORÍA";
  document.getElementById("ec-footer-tag").textContent = T.ec_footer_tag || "Generado con TaxUSA";
  document.getElementById("ec-spent-val").textContent = "$" + fmt(total + mapsSpent);
  document.getElementById("ec-rest-val").textContent = rest !== null ? "$" + fmt(rest) : "—";
  document.getElementById("ec-rest-val").style.color = rest !== null ? rest < 0 ? "#ef4444" : "#34d399" : "#f1f5f9";
  document.getElementById("ec-count").textContent = count;
  document.getElementById("ec-avg").textContent = "$" + fmt(avg);
  document.getElementById("ec-top-val").textContent = top.nombre.length > 14 ? top.nombre.substring(0, 14) + "…" : top.nombre;
  const bycat = {};
  exportGastos.forEach(g => {
    const c = g.cat || "📦 Otros";
    bycat[c] = (bycat[c] || 0) + g.valor;
  });
  const cats = Object.entries(bycat).sort((a, b) => b[1] - a[1]);
  document.getElementById("ec-cats-list").innerHTML = cats.map(([cat, val]) => {
    const pct = Math.round(val / total * 100);
    const col = catColor(cat);
    return `<div class="ec-cat-row">\n            <div class="ec-cat-dot" style="background:${col}"></div>\n            <div class="ec-cat-name">${catLabel(cat)}</div>\n            <div class="ec-cat-bar-track"><div class="ec-cat-bar-fill" style="width:${pct}%;background:${col};"></div></div>\n            <div class="ec-cat-amt">${fmt(val)}</div>\n            <div class="ec-cat-pct">${pct}%</div>\n        </div>`;
  }).join("");
  return {
    total: total,
    now: now
  };
}

async function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`) && window.html2canvas) {
      res();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

window.exportarResumen = async function(formato) {
  closeExportSheet();
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  const btn = document.getElementById("btn-export-share");
  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span><span>${T.export_generating || "Generando..."}</span>`;
  const {total: total, now: now} = poblarExportCard();
  const dateSlug = now.toISOString().slice(0, 10);
  try {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    const card = document.getElementById("export-card");
    card.style.top = "-9999px";
    card.style.left = "0";
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0f172a",
      logging: false,
      width: 390,
      height: card.scrollHeight
    });
    card.style.left = "-9999px";
    if (formato === "image") {
      canvas.toBlob(async blob => {
        if (!blob) throw new Error("blob null");
        const filename = `taxusa-resumen-${dateSlug}.png`;
        const file = new File([ blob ], filename, {
          type: "image/png"
        });
        if (navigator.canShare && navigator.canShare({
          files: [ file ]
        })) {
          try {
            await navigator.share({
              title: "TaxFly — Resumen de gastos",
              text: `💸 ${fmt(total)} USD${presupuestoBase > 0 ? " / Presupuesto: $" + fmt(presupuestoBase) : ""}`,
              files: [ file ]
            });
            showExportToast(T.export_saved || "✅ Listo para compartir");
          } catch (err) {
            if (err.name !== "AbortError") downloadBlob(blob, filename);
          }
        } else if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([ new ClipboardItem({
              "image/png": blob
            }) ]);
            showExportToast(T.export_copied || "✅ Imagen copiada al portapapeles");
          } catch {
            downloadBlob(blob, filename);
          }
        } else {
          downloadBlob(blob, filename);
        }
        resetExportBtn(btn, T);
      }, "image/png");
    } else {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const {jsPDF: jsPDF} = window.jspdf;
      const imgData = canvas.toDataURL("image/png", 1);
      const pdfW = 210;
      const ratio = canvas.height / canvas.width;
      const pdfH = Math.round(pdfW * ratio);
      const pdf = new jsPDF({
        orientation: pdfH > pdfW ? "portrait" : "landscape",
        unit: "mm",
        format: [ pdfW, pdfH ]
      });
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      const filename = `taxusa-resumen-${dateSlug}.pdf`;
      try {
        const pdfBlob = pdf.output("blob");
        const file = new File([ pdfBlob ], filename, {
          type: "application/pdf"
        });
        if (navigator.canShare && navigator.canShare({
          files: [ file ]
        })) {
          await navigator.share({
            title: "TaxFly — Resumen de gastos",
            text: `💸 ${fmt(total)} USD`,
            files: [ file ]
          });
          showExportToast(T.export_saved || "✅ Listo para compartir");
        } else {
          pdf.save(filename);
          showExportToast(T.export_saved || "✅ PDF guardado");
        }
      } catch (shareErr) {
        if (shareErr.name !== "AbortError") {
          pdf.save(filename);
          showExportToast(T.export_saved || "✅ PDF guardado");
        }
      }
      resetExportBtn(btn, T);
    }
  } catch (e) {
    console.error("[Export]", e);
    resetExportBtn(btn, T);
    showAlert(T.export_error || "No se pudo generar el archivo.");
  }
};

function resetExportBtn(btn, T) {
  btn.disabled = false;
  btn.innerHTML = `<span>📤</span><span>${T.btn_export_share || "COMPARTIR RESUMEN"}</span>`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5e3);
}

function showExportToast(msg) {
  const t = document.getElementById("export-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3200);
}

window.showSec = s => {
  window.taxflySetExpenseSection?.(s === "comparador" ? "comparar" : "movimientos");
  [ "gastos", "resumen", "talles", "comparador" ].forEach(id => {
    const el = document.getElementById("sec-" + id);
    if (el) el.style.display = s === id ? "block" : "none";
    const tb = document.getElementById("t-" + id);
    if (tb) tb.className = s === id ? "tab-btn active" : "tab-btn";
  });
  if (s === "resumen") renderDashboard(allGastos);
  if (s === "comparador") compInit();
  window.scrollTo(0, 0);
};

onReady(() => {
  if (new URLSearchParams(location.search).get("section") === "comparador") window.showSec("comparador");
});

onReady(() => {
  if ("Notification" in window) {
    const banner = document.getElementById("notif-banner");
    const btn = document.getElementById("btn-activar-notif");
    const perm = Notification.permission;
    const lang = localStorage.getItem("appLang") || "es";
    const msgs = {
      es: {
        default: "🔔 Activar alertas de presupuesto",
        denied: "🔕 Notificaciones bloqueadas — activar en ajustes"
      },
      en: {
        default: "🔔 Enable budget alerts",
        denied: "🔕 Notifications blocked — enable in settings"
      },
      pt: {
        default: "🔔 Ativar alertas de orçamento",
        denied: "🔕 Notificações bloqueadas — ativar nas configurações"
      }
    };
    const m = msgs[lang] || msgs.es;
    if (perm === "granted") {
      if (banner) banner.style.display = "none";
    } else if (perm === "denied") {
      if (banner) banner.style.display = "block";
      if (btn) {
        btn.textContent = m.denied;
        btn.classList.add("denied");
      }
    } else {
      if (banner) banner.style.display = "block";
      if (btn) btn.textContent = m.default;
    }
  }
  document.querySelectorAll("#cat-tag-row .cat-tag").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#cat-tag-row .cat-tag").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
    });
  });
  try {
    const last = localStorage.getItem(LAST_CAT_KEY);
    const tags = [ ...document.querySelectorAll("#cat-tag-row .cat-tag") ];
    const hit = last && tags.find(b => b.dataset.cat === last);
    if (hit) {
      tags.forEach(b => b.classList.remove("sel"));
      hit.classList.add("sel");
    }
  } catch (e) {}
  const nombreEl = document.getElementById("nombre");
  const valorEl = document.getElementById("valor");
  if (nombreEl && valorEl) {
    nombreEl.addEventListener("keydown", e => {
      if (e.key !== "Enter" || e.isComposing) return;
      e.preventDefault();
      if (valorEl.value === "") valorEl.focus(); else addGasto();
    });
    valorEl.addEventListener("keydown", e => {
      if (e.key !== "Enter" || e.isComposing) return;
      e.preventDefault();
      addGasto();
    });
  }
  window.toggleQuotes(localStorage.getItem("taxfly_quotes_open") === "1");
  window.toggleExp(localStorage.getItem("taxfly_exp_open") !== "0");
});

window.toggleExp = force => {
  const btn = document.getElementById("exp-toggle");
  const body = document.getElementById("exp-body");
  if (!btn || !body) return;
  const open = typeof force === "boolean" ? force : btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(open));
  body.hidden = !open;
  try { localStorage.setItem("taxfly_exp_open", open ? "1" : "0"); } catch (e) {}
};

window.toggleQuotes = force => {
  const btn = document.getElementById("quote-toggle");
  const body = document.getElementById("quote-body");
  if (!btn || !body) return;
  const open = typeof force === "boolean" ? force : btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(open));
  body.hidden = !open;
  try { localStorage.setItem("taxfly_quotes_open", open ? "1" : "0"); } catch (e) {}
};

window.startScanner = async () => {
  document.getElementById("scanner-ui").style.display = "block";
  document.getElementById("scanner-warning").style.display = "block";
  video = document.getElementById("video-preview");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: {
          ideal: 1920
        },
        height: {
          ideal: 1080
        }
      }
    });
    video.srcObject = stream;
  } catch (e) {
    const lang = localStorage.getItem("appLang") || "es";
    const m = {
      es: "Cámara no disponible.",
      en: "Camera not available.",
      pt: "Câmera não disponível."
    };
    showAlert(m[lang] || m.es);
    stopScanner();
  }
};

window.stopScanner = () => {
  if (stream) stream.getTracks().forEach(t => t.stop());
  document.getElementById("scanner-ui").style.display = "none";
  document.getElementById("ocr-loader").style.display = "none";
};

function preprocessCanvas(src) {
  const dst = document.createElement("canvas");
  const sw = src.width, sh = src.height;
  const scale = Math.min(1, 2e3 / Math.max(sw, sh));
  dst.width = Math.round(sw * scale);
  dst.height = Math.round(sh * scale);
  const ctx = dst.getContext("2d");
  ctx.filter = "grayscale(100%) contrast(180%) brightness(110%)";
  ctx.drawImage(src, 0, 0, dst.width, dst.height);
  const img = ctx.getImageData(0, 0, dst.width, dst.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i];
    const v = gray < 128 ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return dst;
}

window.captureTicket = async () => {
  const loader = document.getElementById("ocr-loader");
  loader.style.display = "flex";
  const raw = document.getElementById("ocr-canvas");
  raw.width = video.videoWidth;
  raw.height = video.videoHeight;
  raw.getContext("2d").drawImage(video, 0, 0);
  const thumb = getThumb(raw);
  await runOCR(raw, thumb);
  stopScanner();
};

window.handleGalleryImage = async e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("scanner-warning").style.display = "block";
  const loader = document.getElementById("ocr-loader");
  loader.style.position = "fixed";
  loader.style.display = "flex";
  const img = new Image;
  img.onload = async () => {
    const raw = document.getElementById("ocr-canvas");
    raw.width = img.naturalWidth;
    raw.height = img.naturalHeight;
    raw.getContext("2d").drawImage(img, 0, 0);
    const thumb = getThumb(raw);
    await runOCR(raw, thumb);
    loader.style.position = "absolute";
    loader.style.display = "none";
    e.target.value = "";
  };
  img.src = URL.createObjectURL(file);
};

function getThumb(canvas) {
  const t = document.createElement("canvas");
  const maxW = 120, maxH = 200;
  const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
  t.width = Math.round(canvas.width * ratio);
  t.height = Math.round(canvas.height * ratio);
  t.getContext("2d").drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL("image/jpeg", .55);
}

let _lastThumb = "";

async function runOCR(rawCanvas, thumb) {
  _lastThumb = thumb;
  const lang = localStorage.getItem("appLang") || "es";
  const msgs = {
    es: {
      analyzing: "Analizando ticket con IA... 🧐"
    },
    en: {
      analyzing: "Analyzing ticket with AI... 🧐"
    },
    pt: {
      analyzing: "Analisando ticket com IA... 🧐"
    }
  };
  const m = msgs[lang] || msgs.es;
  const loaderText = document.querySelector("#ocr-loader span");
  if (loaderText) loaderText.textContent = m.analyzing;
  try {
    const base64 = rawCanvas.toDataURL("image/jpeg", .92).split(",")[1];
    const resp = await window.taxflyWorker({
      type: "invoice_ocr",
      image_base64: base64,
      image_media_type: "image/jpeg"
    });
    if (!resp.ok) throw new Error("API error: " + resp.status);
    const parsed = await resp.json();
    openOcrModal(parsed, thumb);
  } catch (err) {
    console.error("Claude OCR error:", err);
    const noTotal = {
      es: "No se pudo leer el ticket. Ingresá el total manualmente.",
      en: "Could not read ticket. Enter total manually.",
      pt: "Não foi possível ler o ticket. Insira o total manualmente."
    };
    openOcrModal("", thumb);
    setTimeout(() => showAlert(noTotal[lang] || noTotal.es), 400);
  }
}

function parseTicketData(text) {
  const raw = text.toUpperCase();
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const STORES = [ "WHOLE FOODS", "BED BATH", "WALGREENS", "TARGET", "WALMART", "ROSS", "MARSHALLS", "TJ MAXX", "CVS", "MACY'S", "NORDSTROM", "COSTCO", "BEST BUY", "APPLE", "NIKE", "ADIDAS", "FOOT LOCKER", "GAP", "OLD NAVY", "ZARA", "H&M", "COACH", "BATH & BODY", "DOLLAR TREE", "DOLLAR GENERAL", "ALDI", "TRADER JOE", "KROGER", "SAFEWAY", "PUBLIX", "HOME DEPOT", "LOWE'S", "PETCO", "PETSMART" ];
  let store = "Compra";
  for (const s of STORES) {
    if (raw.includes(s)) {
      store = s.charAt(0) + s.slice(1).toLowerCase();
      break;
    }
  }
  const MONEY_RE = /\$?\s*(\d{1,5}(?:,\d{3})*\.\d{2})/g;
  function extractMoney(line) {
    const vals = [];
    let m;
    MONEY_RE.lastIndex = 0;
    while ((m = MONEY_RE.exec(line)) !== null) {
      const v = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(v) && v > 0) vals.push(v);
    }
    return vals;
  }
  const KW_TOTAL = [ "GRAND TOTAL", "TOTAL AMOUNT", "TOTAL DUE", "AMOUNT DUE", "TOTAL PAYABLE", "SALE TOTAL", "NET TOTAL", "BALANCE DUE", "YOUR TOTAL", "TRANSACTION TOTAL", "DEBIT TOTAL", "MCARD TEND", "DEBIT TEND", "CASH TEND", "CREDIT TEND", "TOTAL" ];
  const KW_SUB = [ "SUBTOTAL", "SUB TOTAL", "SUB-TOTAL", "MDSE TOTAL", "NET SALES", "MERCHANDISE" ];
  const KW_TAX = [ "SALES TAX", "STATE TAX", "LOCAL TAX", "COUNTY TAX", "CITY TAX", "TAX 1", "TAX 2", "CO TAX", "IL TAX", "CA TAX", "NY TAX", "FL TAX", "FOOD TAX", "TOTAL TAX", "TAX" ];
  const KW_PAY = [ "VISA", "MASTERCARD", "MASTER CARD", "AMEX", "AMERICAN EXPRESS", "DISCOVER", "DEBIT", "CREDIT", "CASH", "CHECK", "EBT", "FSA", "GIFT CARD", "APPLE PAY", "GOOGLE PAY", "TENDERED", "TOTAL PAYMENT", "PAYMENT", "PAID", "TOTAL PAID" ];
  const KW_CHANGE = [ "CHANGE DUE", "CHANGE", "YOUR CHANGE", "CASH CHANGE", "CASH BACK" ];
  const KW_IGNORE = [ "ITEMS SOLD", "# ITEMS", "QTY", "UNIT PRICE", "SKU", "UPC", "REF#", "APPROVAL", "AID", "TC#", "TERMINAL", "STORE#", "REGISTER", "INVOICE", "REC#", "RECEIPT#", "BOTTLE DEPOSIT", "NETWORK ID", "TRANS ID", "VALIDATION", "PHONE", "FAX", "WWW", "HTTP", "THANK YOU", "HAVE A", "SURVEY", "POINTS", "BALANCE REWARDS", "VISIT US", "FACEBOOK", "INSTAGRAM", "SCAN", "QR", "BARCODE", "APPROVED FSA", "TAX ANALYSIS", "RATE%", "RATE %", "5.0000", "9.5000", "9.750", "LOCAL  8.", "SALES TAX ANALYSIS" ];
  let total = 0, subtotal = 0, taxes = 0, montoEnt = 0, vuelto = 0;
  const items = [];
  for (const line of lines) {
    if (KW_IGNORE.some(k => line.includes(k))) continue;
    const vals = extractMoney(line);
    if (!vals.length) continue;
    const hasNeg = /\d\s*-\s*$/.test(line) || /^-\s*\$?\s*\d/.test(line) || /\(\s*\d/.test(line);
    const v = Math.max(...vals);
    const isChange = KW_CHANGE.some(k => line.includes(k));
    const isSub = KW_SUB.some(k => line.includes(k));
    const isTax = KW_TAX.some(k => line.includes(k)) && !isSub;
    const isPay = KW_PAY.some(k => line.includes(k));
    const isTotal = KW_TOTAL.some(k => line.includes(k)) && !isChange && !isPay && !isSub;
    const isDisc = hasNeg || [ "YOU SAVED", "SAVINGS", "COUPON", "DISCOUNT", "PROMO", "REBATE", "EXTRABUCKS", "MARKDOWN", "INSTANT SAVINGS", "STORE COUPON", "DIGITAL COUPON", "GC APPLIED" ].some(k => line.includes(k));
    if (isChange) {
      vuelto = Math.max(vuelto, v);
      continue;
    }
    if (isDisc) continue;
    if (isTax) {
      const tv = vals.length > 1 ? vals[vals.length - 1] : vals[0];
      if (tv > 0 && tv < 500) taxes += tv;
      continue;
    }
    if (isPay && !isTotal) {
      if (v > montoEnt) montoEnt = v;
      continue;
    }
    if (isSub) {
      if (v > subtotal) subtotal = v;
      continue;
    }
    if (isTotal) {
      if (v > total) total = v;
      continue;
    }
    if (v >= .5 && v < 500 && !isTotal) {
      const name = line.replace(/\$?\s*\d{1,5}(?:,\d{3})*\.\d{2}/g, "").replace(/[TX\s]+$/, "").trim();
      if (name.length > 2 && name.length < 60) items.push({
        name: name,
        price: v
      });
    }
  }
  let final = 0;
  if (total > 0) final = total; else if (montoEnt > 0) final = montoEnt - vuelto; else if (subtotal > 0) final = subtotal + taxes; else if (items.length > 0) final = items.reduce((s, i) => s + i.price, 0) + taxes;
  if (final < .01 || final > 9999) final = 0;
  return {
    store: store,
    total: final,
    subtotal: subtotal,
    taxes: taxes,
    items: items
  };
}

function openOcrModal(text, thumb) {
  let d;
  if (text && typeof text === "object") {
    d = text;
  } else {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.total === "number") d = parsed;
    } catch (_) {}
  }
  if (!d) d = parseTicketData(text || "");
  document.getElementById("ocr-store-name").textContent = d.store;
  document.getElementById("ocr-total-input").value = d.total > 0 ? d.total.toFixed(2) : "";
  document.getElementById("ocr-tax-val").textContent = "$" + (d.taxes || 0).toFixed(2);
  document.getElementById("ocr-sub-val").textContent = "$" + (d.subtotal || 0).toFixed(2);
  const img = document.getElementById("ocr-preview-img");
  if (thumb) {
    img.src = thumb;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }
  const wrap = document.getElementById("ocr-items-wrap");
  const list = document.getElementById("ocr-items-list");
  if (d.items && d.items.length > 0) {
    wrap.style.display = "block";
    list.innerHTML = d.items.slice(0, 12).map(it => `<div class="ocr-item-row"><div class="ocr-item-name">${esc(it.name)}</div><div class="ocr-item-price">${it.price.toFixed(2)}</div></div>`).join("");
  } else {
    wrap.style.display = "none";
  }
  document.getElementById("nombre").value = d.store;
  autoCat(d.store);
  document.getElementById("ocr-modal-overlay").classList.add("open");
}

window.closeOcrModal = () => document.getElementById("ocr-modal-overlay").classList.remove("open");

function autoCat(store) {
  const s = store.toUpperCase();
  let cat = "🛍️ Compras";
  if ([ "WHOLE FOODS", "TRADER JOE", "KROGER", "SAFEWAY", "PUBLIX", "ALDI", "WALMART", "COSTCO", "TARGET" ].some(x => s.includes(x))) cat = "🍔 Comida"; else if ([ "WALGREENS", "CVS", "DOLLAR TREE", "DOLLAR GENERAL" ].some(x => s.includes(x))) cat = "💊 Farmacia"; else if ([ "ROSS", "MARSHALLS", "TJ MAXX", "ZARA", "H&M", "GAP", "OLD NAVY", "MACY", "NORDSTROM", "NIKE", "ADIDAS", "FOOT LOCKER", "COACH" ].some(x => s.includes(x))) cat = "👟 Ropa"; else if ([ "BEST BUY", "APPLE" ].some(x => s.includes(x))) cat = "🛍️ Compras";
  document.querySelectorAll("#cat-tag-row .cat-tag").forEach(b => {
    b.classList.toggle("sel", b.dataset.cat === cat);
  });
}

window.confirmOcrScan = async () => {
  const total = parseFloat(document.getElementById("ocr-total-input").value);
  const lang = localStorage.getItem("appLang") || "es";
  const msgs = {
    es: "Ingresá un total válido.",
    en: "Please enter a valid total.",
    pt: "Por favor insira um total válido."
  };
  if (isNaN(total) || total <= 0) {
    showAlert(msgs[lang] || msgs.es);
    return;
  }
  document.getElementById("valor").value = total.toFixed(2);
  closeOcrModal();
  await addGastoWithThumb(_lastThumb);
};

const LAST_CAT_KEY = "taxfly_last_expense_cat";

window.addGastoWithThumb = async thumb => {
  const n = document.getElementById("nombre").value;
  const v = parseFloat(document.getElementById("valor").value);
  const selTag = document.querySelector("#cat-tag-row .cat-tag.sel");
  const cat = selTag ? selTag.dataset.cat : "📦 Otros";
  const lang = localStorage.getItem("appLang") || "es";
  const fillMsgs = {
    es: "Completá el nombre del producto.",
    en: "Please fill in the product name.",
    pt: "Por favor preencha o nome do produto."
  };
  if (!n || isNaN(v) || v < 0) {
    showAlert(fillMsgs[lang] || fillMsgs.es);
    return;
  }
  const gastoData = {
    nombre: n,
    valor: v,
    cat: cat,
    fecha: Date.now(),
    thumb: thumb || "",
    tripId: currentUser && perfilId ? window.TripContext.assign(currentUser.uid, perfilId) : "orlando"
  };
  const localId = "local_" + Date.now();
  const cached = cargarGastosDesdeCache() || [];
  cached.unshift({
    ...gastoData,
    id: localId
  });
  guardarGastosEnCache(cached);
  allGastos.unshift({
    ...gastoData,
    id: localId
  });
  renderGastosList(allGastos);
  document.getElementById("nombre").value = "";
  document.getElementById("valor").value = "";
  try { localStorage.setItem(LAST_CAT_KEY, cat); } catch (e) {}
  showExpToast(bt("toast_saved"));
  if (!thumb) document.getElementById("nombre").focus();
  if (!navigator.onLine || !currentUser) {
    queueGastoOp({
      type: "add",
      data: gastoData
    });
    return;
  }
  try {
    await addDoc(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos"), gastoData);
    allGastos = allGastos.filter(g => g.id !== localId);
    guardarGastosEnCache(allGastos);
  } catch (e) {
    queueGastoOp({
      type: "add",
      data: gastoData
    });
  }
};

let _viewerGastoId = "";

window.openReceiptViewer = (thumb, id) => {
  _viewerGastoId = id;
  document.getElementById("receipt-viewer-img").src = thumb;
  document.getElementById("receipt-viewer").classList.add("open");
};

window.closeReceiptViewer = () => document.getElementById("receipt-viewer").classList.remove("open");

window.deleteReceiptPhoto = async () => {
  if (!_viewerGastoId || !currentUser || !perfilId) return;
  const lang = localStorage.getItem("appLang") || "es";
  const msgs = {
    es: "¿Eliminar la foto del recibo? El gasto se mantiene.",
    en: "Delete receipt photo? The expense stays.",
    pt: "Excluir foto do recibo? O gasto permanece."
  };
  if (!await showConfirm(msgs[lang] || msgs.es)) return;
  try {
    await updateDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos", _viewerGastoId), {
      thumb: ""
    });
    closeReceiptViewer();
  } catch (e) {
    console.error(e);
  }
};

function parseTicket(text) {
  openOcrModal(text, "");
}

window.toggleSettings = () => {
  const d = document.getElementById("settingsDrawer"), open = d.classList.toggle("open");
  document.getElementById("menuOverlay").style.display = open ? "block" : "none";
};

window.toggleDarkMode = () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

window.changeProfile = () => {
  localStorage.removeItem("perfilActivoId");
  window.location.href = "profiles.html";
};

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

window.pinInputFocus = el => {};

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
  const pinHash = await window.createPinHash(p1);
  localStorage.setItem("taxusa_pin_hash", pinHash);
  localStorage.removeItem("taxusa_offline_pin");
  if (currentUser) {
    try {
      await setDoc(doc(db, "usuarios", currentUser.uid), {
        pinHash: pinHash
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

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  if (!currentUser) return;
  const l = localStorage.getItem("appLang") || "es", m = {
    es: {
      s: "Correo de recuperación enviado.",
      e: "Error: "
    },
    en: {
      s: "Recovery email sent.",
      e: "Error: "
    }
  }, t = m[l];
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    showAlert(t.s);
  } catch (er) {
    showAlert(t.e + er.message);
  }
};

window.doDeleteAccount = () => window.confirmAndDeleteAccount({
  db: db,
  doc: doc,
  deleteDoc: deleteDoc,
  deleteUser: deleteUser,
  currentUser: currentUser,
  rcCheck: _rcCheck
});

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.replace("login.html");
    return;
  }
  currentUser = user;
  const requestedTrip=new URLSearchParams(location.search).get("trip");
  if(requestedTrip && window.TripContext.readTrips(user.uid,perfilId).some(t=>t.id===requestedTrip))window.TripContext.select(user.uid,perfilId,requestedTrip);
  const cachedBudget = cargarPresupuestoDesdeCache();
  presupuestoBase = cachedBudget ?? 0;
  catBudgets = cargarTopesDesdeCache();
  if (cachedBudget !== null) {
    presupuestoBase = cachedBudget;
    const inputFondo = document.getElementById("input-fondo");
    if (inputFondo) {
      inputFondo.value = "";
      inputFondo.placeholder = "USD 0";
    }
    refreshBudgetInfoRow();
  }

  const perfilNombre = localStorage.getItem("perfilActivoNombre");
  document.getElementById("userEmail").innerText = perfilNombre || user.email;
  if (!perfilId) {
    window.location.replace("profiles.html");
    return;
  }
  const img = perfilFoto || user.photoURL;
  if (img) {
    const b = document.getElementById("btnSettings");
    b.style.backgroundImage = `url(${img})`;
    b.innerText = "";
  }
  loadCustomCats();
  try {
    const ref=currentBudgetRef();
    const snap=ref ? await getDoc(ref) : null;
    const field=currentBudgetField();
    if (snap?.exists() && snap.data().presupuestoCats && typeof snap.data().presupuestoCats === "object") {
      catBudgets = normalizeCatBudgets(snap.data().presupuestoCats);
      guardarTopesEnCache(catBudgets);
    }
    if (snap?.exists() && snap.data()[field] !== undefined) {
      presupuestoBase = Number(snap.data()[field]);
      guardarPresupuestoEnCache(presupuestoBase);
      const inputF = document.getElementById("input-fondo");
      if (inputF) {
        inputF.value = "";
        inputF.placeholder = "USD 0";
      }
      refreshBudgetInfoRow();
    }
  } catch (e) {
    console.error(e);
  }
  fetchRates();
  const tripSelect = document.getElementById("trip-filter-expenses");
  tripSelect.addEventListener("change", () => {
    window.TripContext.select(user.uid, perfilId, tripSelect.value);
    location.reload();
  });
  window.TripContext.hydrate(db, user.uid, perfilId, getDocs, collection, refreshGastosTrip);
  listenGastos();
  listenPresupuestoYOrlando();
  setTimeout(refreshBudgetInfoRow, 500);
  flushPendingGastos();
  initPushNotifications();
  const lang = localStorage.getItem("appLang") || "es";
  window.changeLanguage(lang);
  document.getElementById("tip-text").innerText = shoppingTips[lang][0];
  setInterval(window.nextTip, 8e3);
});

const COMP_STORES = [ {
  id: "amazon",
  name: "Amazon",
  tag: "Generalista",
  emoji: "📦",
  color: "#FF9900",
  url: q => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`
}, {
  id: "walmart",
  name: "Walmart",
  tag: "Generalista",
  emoji: "🛒",
  color: "#0071CE",
  url: q => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`
}, {
  id: "target",
  name: "Target",
  tag: "Generalista",
  emoji: "🎯",
  color: "#CC0000",
  url: q => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`
}, {
  id: "costco",
  name: "Costco",
  tag: "Mayorista",
  emoji: "🏬",
  color: "#005DAA",
  url: q => `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(q)}`
}, {
  id: "ebay",
  name: "eBay",
  tag: "Marketplace",
  emoji: "🏷️",
  color: "#E53238",
  url: q => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`
}, {
  id: "bestbuy",
  name: "Best Buy",
  tag: "Electrónica",
  emoji: "💛",
  color: "#003B64",
  url: q => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`
}, {
  id: "bhphoto",
  name: "B&H Photo",
  tag: "Foto / Video",
  emoji: "📷",
  color: "#003580",
  url: q => `https://www.bhphotovideo.com/c/search?Ntt=${encodeURIComponent(q)}`
}, {
  id: "adorama",
  name: "Adorama",
  tag: "Foto / Video",
  emoji: "🎥",
  color: "#c0392b",
  url: q => `https://www.adorama.com/l/?searchinfo=${encodeURIComponent(q)}`
}, {
  id: "apple",
  name: "Apple Store",
  tag: "Apple oficial",
  emoji: "🍎",
  color: "#555555",
  url: q => `https://www.apple.com/us/search/${encodeURIComponent(q)}`
}, {
  id: "newegg",
  name: "Newegg",
  tag: "PC / Gaming",
  emoji: "💻",
  color: "#F37022",
  url: q => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`
}, {
  id: "microcenter",
  name: "Micro Center",
  tag: "PC / Hardware",
  emoji: "🖥️",
  color: "#B22222",
  url: q => `https://www.microcenter.com/search/search_results.aspx?Ntx=mode+matchall&Ntk=all&N=4294967288&myStore=false&cf=&Ntt=${encodeURIComponent(q)}`
}, {
  id: "nike",
  name: "Nike",
  tag: "Deportivo",
  emoji: "👟",
  color: "#111111",
  url: q => `https://www.nike.com/w?q=${encodeURIComponent(q)}&vst=${encodeURIComponent(q)}`
}, {
  id: "adidas",
  name: "Adidas",
  tag: "Deportivo",
  emoji: "⚡",
  color: "#000000",
  url: q => `https://www.adidas.com/us/search?q=${encodeURIComponent(q)}`
}, {
  id: "nordstrom",
  name: "Nordstrom",
  tag: "Premium",
  emoji: "👗",
  color: "#1D1D1D",
  url: q => `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${encodeURIComponent(q)}`
}, {
  id: "macys",
  name: "Macy's",
  tag: "Grandes tiendas",
  emoji: "⭐",
  color: "#E21C21",
  url: q => `https://www.macys.com/shop/featured/${encodeURIComponent(q)}`
}, {
  id: "zappos",
  name: "Zappos",
  tag: "Calzado",
  emoji: "👠",
  color: "#1D4ED8",
  url: q => `https://www.zappos.com/search?term=${encodeURIComponent(q)}`
}, {
  id: "tjmaxx",
  name: "TJ Maxx",
  tag: "Outlet/Descuento",
  emoji: "🏷️",
  color: "#C8102E",
  url: q => `https://www.tjmaxx.tjx.com/store/jump/search?q=${encodeURIComponent(q)}`
}, {
  id: "gap",
  name: "Gap",
  tag: "Ropa casual",
  emoji: "👕",
  color: "#1A1A2E",
  url: q => `https://www.gap.com/browse/search.do?searchText=${encodeURIComponent(q)}`
}, {
  id: "sephora",
  name: "Sephora",
  tag: "Cosmética",
  emoji: "💄",
  color: "#C44B99",
  url: q => `https://www.sephora.com/search?keyword=${encodeURIComponent(q)}`
}, {
  id: "ulta",
  name: "Ulta Beauty",
  tag: "Cosmética",
  emoji: "💅",
  color: "#8B1A4A",
  url: q => `https://www.ulta.com/search?search=${encodeURIComponent(q)}`
}, {
  id: "rei",
  name: "REI",
  tag: "Outdoor",
  emoji: "🏕️",
  color: "#1F6B31",
  url: q => `https://www.rei.com/search?q=${encodeURIComponent(q)}`
}, {
  id: "homedepot",
  name: "Home Depot",
  tag: "Hogar / Herram.",
  emoji: "🔨",
  color: "#F96302",
  url: q => `https://www.homedepot.com/s/${encodeURIComponent(q)}`
}, {
  id: "ikea",
  name: "IKEA",
  tag: "Muebles / Hogar",
  emoji: "🪑",
  color: "#0051BA",
  url: q => `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(q)}`
}, {
  id: "gamestop",
  name: "GameStop",
  tag: "Videojuegos",
  emoji: "🎮",
  color: "#5C0A0A",
  url: q => `https://www.gamestop.com/search#q=${encodeURIComponent(q)}`
}, {
  id: "google",
  name: "Google Shopping",
  tag: "Comparador",
  emoji: "🛍️",
  color: "#4285F4",
  url: q => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`
}, {
  id: "pricespy",
  name: "PriceSpy",
  tag: "Comparador",
  emoji: "📊",
  color: "#009900",
  url: q => `https://pricespy.com/search?search=${encodeURIComponent(q)}`
} ];

function compNormalize(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const COMP_CATEGORY_KEYWORDS = {
  "Deportivo": [ "zapatilla", "zapatillas", "nike", "adidas", "running", "futbol", "botines", "deportiv" ],
  "Foto / Video": [ "camara", "foto", "lente", "lentes", "gopro", "dron", "drone", "video" ],
  "Electrónica": [ "notebook", "laptop", "iphone", "celular", "telefono", "tablet", "ipad", "auricular", "auriculares", "smartwatch", "televisor" ],
  "Apple oficial": [ "macbook", "airpods", "apple watch" ],
  "PC / Gaming": [ "placa de video", "gpu", "gabinete gamer", "teclado gamer", "mouse gamer" ],
  "PC / Hardware": [ "procesador", "memoria ram", "motherboard", "disco ssd" ],
  "Videojuegos": [ "ps5", "playstation", "xbox", "nintendo", "switch", "videojuego" ],
  "Cosmética": [ "maquillaje", "perfume", "skincare", "labial" ],
  "Calzado": [ "zapatos", "botas", "sandalias" ],
  "Outdoor": [ "mochila", "carpa", "camping", "trekking" ],
  "Hogar / Herram.": [ "herramienta", "herramientas", "taladro" ],
  "Muebles / Hogar": [ "mueble", "muebles", "sofa" ]
};

function compDetectCategory(q) {
  const norm = compNormalize(q);
  for (const [ tag, keywords ] of Object.entries(COMP_CATEGORY_KEYWORDS)) {
    if (keywords.some(k => norm.includes(compNormalize(k)))) return tag;
  }
  return null;
}

function compRenderGrid(q) {
  const grid = document.getElementById("comp-stores-grid");
  if (!grid) return;
  const category = q ? compDetectCategory(q) : null;
  const stores = category ? [ ...COMP_STORES.filter(s => s.tag === category), ...COMP_STORES.filter(s => s.tag !== category) ] : COMP_STORES;
  grid.innerHTML = stores.map(s => {
    const href = q ? s.url(q) : "#";
    const dimmed = q ? "" : "opacity:.45;pointer-events:none;";
    const highlighted = category && s.tag === category ? " comp-store-highlight" : "";
    return `<a class="comp-store-card${highlighted}" href="${href}" target="_blank" rel="noopener"\n            style="--store-color:${s.color};${dimmed}">\n            <div class="comp-store-inner">\n                <div class="comp-store-emoji">${s.emoji}</div>\n                <div class="comp-store-info">\n                    <div class="comp-store-name">${esc(s.name)}</div>\n                    <div class="comp-store-tag">${s.tag}</div>\n                </div>\n            </div>\n        </a>`;
  }).join("");
}

function compFormatAI(text) {
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  const lines = html.split("\n");
  const result = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isBullet = /^[•\-\*]\ /.test(line);
    if (isBullet) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push("<li>" + line.replace(/^[•\-\*]\ +/, "") + "</li>");
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      if (line) result.push("<p>" + line + "</p>");
    }
  }
  if (inList) result.push("</ul>");
  return result.join("");
}

window.compToggleIABtn = function() {
  const q = (document.getElementById("comp-product")?.value || "").trim();
  const wrap = document.getElementById("comp-ai-btn-wrap");
  if (wrap) wrap.style.display = q.length >= 2 ? "block" : "none";
};

window.compActualizarLinks = function() {
  const q = (document.getElementById("comp-product")?.value || "").trim();
  compRenderGrid(q);
};

const COMP_CACHE_PREFIX = "comp_ia_cache_";
const COMP_CACHE_TTL_MS = 4 * 60 * 60 * 1000;

function compCacheKey(q) {
  return COMP_CACHE_PREFIX + q.trim().toLowerCase();
}

function compGetCached(q) {
  try {
    const raw = localStorage.getItem(compCacheKey(q));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.reply || !parsed.ts) return null;
    if (Date.now() - parsed.ts > COMP_CACHE_TTL_MS) return null;
    return parsed.reply;
  } catch (e) {
    return null;
  }
}

function compSetCache(q, reply) {
  try {
    localStorage.setItem(compCacheKey(q), JSON.stringify({
      reply: reply,
      ts: Date.now()
    }));
  } catch (e) {}
}

function compRenderAIResult(q, reply) {
  const panel = document.getElementById("comp-ai-panel");
  if (!panel) return;
  panel.innerHTML = `<div class="comp-ai-result">\n            <div class="comp-ai-header">\n                <span class="comp-ai-icon">🤖</span>\n                <span class="comp-ai-title">Recomendación IA para "${esc(q)}"</span>\n            </div>\n            <div class="comp-ai-body">${compFormatAI(reply)}</div>\n            <div class="comp-ai-disclaimer">Orientación general basada en una búsqueda web al momento de la consulta. No es una cotización garantizada; los precios pueden cambiar.</div>\n        </div>`;
}

window.compAnalizarIA = async function() {
  const q = (document.getElementById("comp-product")?.value || "").trim();
  if (!q) return;
  const panel = document.getElementById("comp-ai-panel");
  if (!panel) return;

  const cached = compGetCached(q);
  if (cached) {
    panel.style.display = "block";
    compRenderAIResult(q, cached);
    return;
  }

  if (!await _rcCheck("ai_analyze")) {
    return;
  }

  panel.style.display = "block";
  panel.innerHTML = `<div class="comp-ai-loading">\n        <div class="comp-ai-dots"><div class="comp-ai-dot"></div><div class="comp-ai-dot"></div><div class="comp-ai-dot"></div></div>\n        <span class="comp-ai-loading-txt">Analizando tiendas para "<strong>${esc(q)}</strong>"...</span>\n    </div>`;
  const storeList = COMP_STORES.filter(s => s.id !== "google" && s.id !== "pricespy").map(s => `${s.name} (${s.tag})`).join(", ");
  try {
    const resp = await window.taxflyWorker({
      type: "compare_shopping",
      product: q,
      storeList: storeList
    });
    if (!resp.ok) throw new Error("API error: " + resp.status);
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Respuesta vacía del worker");
    compSetCache(q, reply);
    compRenderAIResult(q, reply);
  } catch (e) {
    console.error("compare_shopping error:", e);
    panel.innerHTML = `<div class="comp-ai-result" style="border-color:var(--danger);background:rgba(239,68,68,.06);">\n            <div class="comp-ai-body"><p>❌ No se pudo conectar con la IA. Verificá tu conexión e intentá de nuevo.</p></div>\n        </div>`;
  }
};

window.compBuscar = function() {
  const q = (document.getElementById("comp-product")?.value || "").trim();
  compRenderGrid(q);
  compToggleIABtn();
  if (!q) {
    document.getElementById("comp-product")?.focus();
    return;
  }
};

window.compInit = function() {
  const q = (document.getElementById("comp-product")?.value || "").trim();
  compRenderGrid(q);
  compToggleIABtn();
};

function offerReservationPayment(){
 const q=new URLSearchParams(location.search),id=q.get('reservation'),tripId=q.get('trip');
 if(paymentOpened||!id||!currentUser||!expenseSnapshotReady||tripId!==window.TripContext.view(currentUser.uid,perfilId))return;
 const reservation=financeReservations.find(r=>r.id===id);if(!reservation)return;
 paymentOpened=true;
 const existing=allGastos.find(g=>g.reservationId===id&&g.tripId===tripId);
 if(existing){window.editGasto(existing.id);return;}
 const panel=document.createElement('section');panel.className='budget-card';panel.style.cssText='padding:20px;margin:16px 0';
 const title=document.createElement('h3');title.textContent='Registrar pago · '+reservation.name;panel.append(title);
 const form=document.createElement('form');form.innerHTML='<label>Pagado acumulado (USD)<input name="amount" type="number" min="0.01" step="0.01" required></label><p>Registrá lo que ya pagaste. Los próximos cambios se hacen sobre este mismo gasto.</p><button type="submit">Guardar pago</button> <button type="button" data-cancel>Cancelar</button>';
 form.elements.amount.value=Number(reservation.totalPrice)>0?Number(reservation.totalPrice).toFixed(2):'';
 form.querySelector('[data-cancel]').onclick=()=>panel.remove();
 form.onsubmit=e=>{e.preventDefault();const amount=Number(form.elements.amount.value);if(!Number.isFinite(amount)||amount<=0)return;
 const uid=currentUser.uid;if(window.TripContext.view(uid,perfilId)!==tripId)return;
 const existing=allGastos.find(g=>g.reservationId===id&&g.tripId===tripId);if(existing){panel.remove();window.editGasto(existing.id);return;}
 const expenseId=window.TaxflyTravel.paymentId(tripId,id),data={nombre:reservation.name,valor:amount,cat:'📦 Otros',fecha:Date.now(),thumb:'',tripId,reservationId:id,source:'reservation'};
 queueGastoOp({type:'upsert',id:expenseId,data});allGastos=window.TaxflyTravel.overlayExpenses(allGastos,getPendingGastos());guardarGastosEnCache(allGastos);renderGastosList(allGastos);panel.remove();flushPendingGastos();showExpToast('Pago registrado');
 };
 panel.append(form);document.getElementById('budget-card').after(panel);panel.scrollIntoView({block:'center',behavior:'smooth'});form.elements.amount.focus();
}
