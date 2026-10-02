import { fsNet } from "./fs-net.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, query, orderBy, limit, onSnapshot, getDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

function mapsBudgetCacheKey() {
  return "taxusa_maps_budget_cache_" + perfilId + "_" + (localStorage.getItem("trip-planning-active::" + currentUser.uid + "::" + perfilId) || "orlando");
}

let mapsSpentCache = 0;

function computeMapsSpent(data) {
  if (!data) return 0;
  return (data.gastos || []).reduce((s, g) => s + (parseFloat(g.monto) || 0), 0);
}

function listenMapsBudget() {
  if (!currentUser || !perfilId) return;
  mapsSpentCache = parseFloat(localStorage.getItem(mapsBudgetCacheKey())) || 0;
  const tripId = window.TripContext.view(currentUser.uid, perfilId);
  if (tripId === "unassigned") { mapsSpentCache=0; return; }
  const path = tripId === "orlando" ? ["usuarios", currentUser.uid, "perfiles", perfilId, "orlando", "budget"] : ["usuarios", currentUser.uid, "perfiles", perfilId, "tripPlanning", tripId, "data", "budget"];
  onSnapshot(doc(db, ...path), snap => {
    mapsSpentCache = computeMapsSpent(snap.exists() ? snap.data() : null);
    try {
      localStorage.setItem(mapsBudgetCacheKey(), String(mapsSpentCache));
    } catch (e) {}
    const base = parseFloat(localStorage.getItem("taxusa_budget_cache_" + perfilId)) || 0;
    let g = [];
    try {
      g = JSON.parse(localStorage.getItem("taxusa_gastos_cache_" + perfilId) || "[]");
    } catch (e) {}
    renderBudgetUI(base, g);
  }, () => {});
}

const I18N = {
  es: {
    nav_home: "INICIO",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANIFICACIÓN",
    nav_units: "UNID.",
    nav_tickets: "DOCS",
    nav_group: "GRUPO",
    greeting_sub: "Bienvenido de vuelta",
    q_tax: "Calculadora",
    q_gastos: "Gastos",
    q_itin: "Planificación",
    q_units: "AYUDA Y REFERENCIAS",
    q_docs: "Docs",
    q_grupo: "Grupo",
    q_rutas: "Rutas",
    q_perfil: "Perfil",
    label_budget: "Presupuesto Restante",
    budget_hint: "Tocá para ver tus gastos →",
    budget_over_label: "Te pasaste por",
    budget_spent_sfx: "gastado",
    budget_no_data: "Sin presupuesto configurado",
    widget_fx: "Dólar hoy",
    fx_oficial: "Oficial",
    fx_blue: "Blue",
    fx_card: "Tarjeta",
    widget_last_expense: "Último gasto",
    widget_total: "Total gastado",
    no_gastos: "Sin gastos aún",
    widget_weather: "Clima en destino",
    next_event_label: "Próximo evento",
    next_event_empty: "Sin eventos próximos",
    next_event_add: "＋ Agregar actividad",
    tip_label: "Tip de viaje",
    tip_hint: "Tocá para ver otro tip →",
    sections_title: "Secciones",
    offline_msg: "Sin conexión",
    loading: "Cargando...",
    weather_error: "No se pudo obtener el clima.",
    settings_title: "Ajustes",
    label_language: "Idioma",
    btn_change_profile: "Cambiar Perfil",
    btn_theme: "Cambiar Tema",
    btn_update: "Actualizar App",
    btn_switch_app: "Cambiar Aplicación",
    btn_logout: "Cerrar Sesión",
    btn_email: "Cambiar Correo",
    btn_password: "Cambiar Contraseña",
    btn_pin: "Cambiar PIN Offline",
    btn_delete: "Eliminar Cuenta",
    sections: [ {
      icon: "📊",
      color: "ic-blue",
      href: "tax.html",
      name: "Calculadora Tax",
      desc: "Calculá tax y propinas de tus compras"
    }, {
      icon: "🛍️",
      color: "ic-violet",
      href: "compras.html",
      name: "Gastos",
      desc: "Registrá y controlá tu presupuesto"
    }, {
      icon: "📍",
      color: "ic-green",
      href: "lugares.html",
      name: "Planificación",
      desc: "Tu agenda de actividades día a día"
    }, {
      icon: "💡",
      color: "ic-amber",
      href: "unidades.html",
      name: "AYUDA Y REFERENCIAS",
      desc: "Conversor de unidades y ayudas varias"
    }, {
      icon: "📄",
      color: "ic-cyan",
      href: "tickets.html",
      name: "Documentos",
      desc: "ESTA, seguros, check-in y más"
    }, {
      icon: "👥",
      color: "ic-indigo",
      href: "grupo.html",
      name: "Grupo",
      desc: "Gastos compartidos entre viajeros"
    }, {
      icon: "🗺️",
      color: "ic-red",
      href: "rutas.html",
      name: "Rutas",
      desc: "Planificá tus recorridos y destinos"
    }, {
      icon: "🌍",
      color: "ic-teal",
      href: "https://taxfly.github.io/taxfly/planificacion.html",
      name: "Planificación",
      desc: "Viajes, lugares, comidas, compras y atracciones por EE. UU."
    } ],
    tips: [ {
      icon: "💡",
      text: "En EE.UU. el tax no se muestra en el precio. Sumale entre 7% y 11% según el estado donde comprés."
    }, {
      icon: "💳",
      text: "Usá tarjeta sin cargo por compras en el exterior para evitar el recargo del tipo de cambio tarjeta."
    }, {
      icon: "🧾",
      text: "Guardá todos tus recibos en Documentos. Te pueden pedir comprobante para devoluciones."
    }, {
      icon: "✈️",
      text: "Llegá al aeropuerto 3 horas antes de un vuelo internacional para evitar cualquier contratiempo."
    }, {
      icon: "💰",
      text: "Tené siempre algo de cash encima. Muchos tips y mercados solo aceptan efectivo."
    }, {
      icon: "🛍️",
      text: "En outlets podés pedir tax refund si comprás más de cierto monto. Consultá en caja antes de pagar."
    }, {
      icon: "📱",
      text: "Activá el modo avión y usá WiFi para ahorrar roaming. Comprá una SIM local en el aeropuerto."
    }, {
      icon: "🏨",
      text: 'Chequeá si tu hotel cobra "resort fee" aparte. Puede sumar $30–50 por noche sin avisarte.'
    } ]
  },
  en: {
    nav_home: "HOME",
    nav_expenses: "EXPENSES",
    nav_itinerary: "PLANNING",
    nav_units: "UNITS",
    nav_tickets: "DOCS",
    nav_group: "GROUP",
    greeting_sub: "Welcome back",
    q_tax: "Calculator",
    q_gastos: "Expenses",
    q_itin: "Itinerary",
    q_units: "Units",
    q_docs: "Docs",
    q_grupo: "Group",
    q_rutas: "Routes",
    q_perfil: "Profile",
    label_budget: "Remaining Budget",
    budget_hint: "Tap to view your expenses →",
    budget_over_label: "Over budget by",
    budget_spent_sfx: "spent",
    budget_no_data: "No budget configured",
    widget_fx: "Dollar today",
    fx_oficial: "Official",
    fx_blue: "Blue",
    fx_card: "Card rate",
    widget_last_expense: "Last expense",
    widget_total: "Total spent",
    no_gastos: "No expenses yet",
    widget_weather: "Weather at destination",
    next_event_label: "Next event",
    next_event_empty: "No upcoming events",
    next_event_add: "＋ Add activity",
    tip_label: "Travel tip",
    tip_hint: "Tap to see another tip →",
    sections_title: "Sections",
    offline_msg: "No connection",
    loading: "Loading...",
    weather_error: "Could not load weather.",
    settings_title: "Settings",
    label_language: "Language",
    btn_change_profile: "Change Profile",
    btn_theme: "Change Theme",
    btn_update: "Update App",
    btn_switch_app: "Switch App",
    btn_logout: "Log Out",
    btn_email: "Change Email",
    btn_password: "Change Password",
    btn_pin: "Change Offline PIN",
    btn_delete: "Delete Account",
    sections: [ {
      icon: "📊",
      color: "ic-blue",
      href: "tax.html",
      name: "Tax Calculator",
      desc: "Calculate tax and tips on your purchases"
    }, {
      icon: "🛍️",
      color: "ic-violet",
      href: "compras.html",
      name: "Expenses",
      desc: "Track and manage your travel budget"
    }, {
      icon: "📍",
      color: "ic-green",
      href: "lugares.html",
      name: "Itinerary",
      desc: "Your day-by-day activity schedule"
    }, {
      icon: "💡",
      color: "ic-amber",
      href: "unidades.html",
      name: "Help & References",
      desc: "Unit Converter & Utilities"
    }, {
      icon: "📄",
      color: "ic-cyan",
      href: "tickets.html",
      name: "Documents",
      desc: "ESTA, insurance, check-in and more"
    }, {
      icon: "👥",
      color: "ic-indigo",
      href: "grupo.html",
      name: "Group",
      desc: "Split expenses among travelers"
    }, {
      icon: "🗺️",
      color: "ic-red",
      href: "rutas.html",
      name: "Routes",
      desc: "Plan your trips and destinations"
    }, {
      icon: "🛒",
      color: "ic-teal",
      href: "https://taxfly.github.io/taxfly/planificacion.html",
      name: "Maps",
      desc: "Trips, places, meals, shopping and attractions across the USA"
    } ],
    tips: [ {
      icon: "💡",
      text: "In the US, tax is not shown on the price tag. Add 7–11% depending on the state you are shopping in."
    }, {
      icon: "💳",
      text: "Use a no-foreign-fee card to avoid the card exchange rate surcharge on every purchase."
    }, {
      icon: "🧾",
      text: "Save all your receipts in Documents. You may need them for returns or reimbursements."
    }, {
      icon: "✈️",
      text: "Arrive at the airport 3 hours before an international flight to avoid any issues."
    }, {
      icon: "💰",
      text: "Always carry some cash. Many tips and markets only accept it."
    }, {
      icon: "🛍️",
      text: "At outlets, ask about tax refunds if you spend over a certain amount. Check at the register."
    }, {
      icon: "📱",
      text: "Turn on airplane mode and use WiFi to save on roaming. Buy a local SIM at the airport."
    }, {
      icon: "🏨",
      text: 'Check if your hotel charges a "resort fee" separately — it can add $30–50 per night.'
    } ]
  },
  pt: {
    nav_home: "INÍCIO",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANEJAMENTO",
    nav_units: "UNID.",
    nav_tickets: "DOCS",
    nav_group: "GRUPO",
    greeting_sub: "Bem-vindo de volta",
    q_tax: "Calculadora",
    q_gastos: "Gastos",
    q_itin: "Itinerário",
    q_units: "Unidades",
    q_docs: "Docs",
    q_grupo: "Grupo",
    q_rutas: "Rotas",
    q_perfil: "Perfil",
    label_budget: "Orçamento Restante",
    budget_hint: "Toque para ver seus gastos →",
    budget_over_label: "Você passou em",
    budget_spent_sfx: "gasto",
    budget_no_data: "Sem orçamento configurado",
    widget_fx: "Dólar hoje",
    fx_oficial: "Oficial",
    fx_blue: "Blue",
    fx_card: "Cartão",
    widget_last_expense: "Último gasto",
    widget_total: "Total gasto",
    no_gastos: "Sem gastos ainda",
    widget_weather: "Clima no destino",
    next_event_label: "Próximo evento",
    next_event_empty: "Sem eventos próximos",
    next_event_add: "＋ Adicionar atividade",
    tip_label: "Dica de viagem",
    tip_hint: "Toque para ver outra dica →",
    sections_title: "Seções",
    offline_msg: "Sem conexão",
    loading: "Carregando...",
    weather_error: "Não foi possível obter o clima.",
    settings_title: "Configurações",
    label_language: "Idioma",
    btn_change_profile: "Trocar Perfil",
    btn_theme: "Mudar Tema",
    btn_update: "Atualizar App",
    btn_switch_app: "Trocar Aplicativo",
    btn_logout: "Sair",
    btn_email: "Alterar E-mail",
    btn_password: "Alterar Senha",
    btn_pin: "Alterar PIN Offline",
    btn_delete: "Excluir Conta",
    sections: [ {
      icon: "📊",
      color: "ic-blue",
      href: "tax.html",
      name: "Calculadora Tax",
      desc: "Calcule impostos e gorjetas das compras"
    }, {
      icon: "🛍️",
      color: "ic-violet",
      href: "compras.html",
      name: "Gastos",
      desc: "Registre e controle seu orçamento"
    }, {
      icon: "📍",
      color: "ic-green",
      href: "lugares.html",
      name: "Itinerário",
      desc: "Sua agenda de atividades dia a dia"
    }, {
      icon: "💡",
      color: "ic-amber",
      href: "unidades.html",
      name: "Ajuda e Referências",
      desc: "Conversor de Unidades e Utilidades"
    }, {
      icon: "📄",
      color: "ic-cyan",
      href: "tickets.html",
      name: "Documentos",
      desc: "ESTA, seguros, check-in e mais"
    }, {
      icon: "👥",
      color: "ic-indigo",
      href: "grupo.html",
      name: "Grupo",
      desc: "Gastos compartilhados entre viajantes"
    }, {
      icon: "🗺️",
      color: "ic-red",
      href: "rutas.html",
      name: "Rotas",
      desc: "Planeje seus roteiros e destinos"
    }, {
      icon: "🛒",
      color: "ic-teal",
      href: "https://taxfly.github.io/taxfly/planificacion.html",
      name: "Maps",
      desc: "Viagens, lugares, refeições, compras e atrações pelos EUA"
    } ],
    tips: [ {
      icon: "💡",
      text: "Nos EUA o imposto não está no preço. Some de 7% a 11% dependendo do estado onde comprar."
    }, {
      icon: "💳",
      text: "Use cartão sem taxa estrangeira para evitar o câmbio do cartão em cada compra."
    }, {
      icon: "🧾",
      text: "Guarde todos os recibos em Documentos. Você pode precisar deles para devoluções."
    }, {
      icon: "✈️",
      text: "Chegue ao aeroporto 3 horas antes de um voo internacional para evitar imprevistos."
    }, {
      icon: "💰",
      text: "Sempre tenha dinheiro. Muitas gorjetas e mercados só aceitam dinheiro."
    }, {
      icon: "🛍️",
      text: "Em outlets, pergunte sobre reembolso de imposto se gastar acima de certo valor."
    }, {
      icon: "📱",
      text: "Ative o modo avião e use WiFi para economizar no roaming. Compre SIM local no aeroporto."
    }, {
      icon: "🏨",
      text: 'Verifique se o hotel cobra "resort fee" separado — pode somar $30–50 por noite.'
    } ]
  }
};

let lang = localStorage.getItem("appLang") || "es";

let t = I18N[lang] || I18N.es;

const perfilId = localStorage.getItem("perfilActivoId") || "default";

let currentUser = null;

let tipIndex = Math.floor(Math.random() * 8);

function applyI18n() {
  t = I18N[lang] || I18N.es;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (el.id === "ne-title" && el.getAttribute("data-has-event") === "true") return;
    if (t[k]) el.textContent = t[k];
  });
  [ "es", "en", "pt" ].forEach(l => document.getElementById("lang-" + l)?.classList.toggle("active", l === lang));
  renderSections();
  renderTip();
  if (window._lastBudgetArgs) { try { renderBudgetUI(...window._lastBudgetArgs); } catch (e) {} }
  if (document.getElementById("fx-content")?.style.display !== "none") fxRender();
}

window.changeLanguage = function(nl) {
  lang = nl;
  localStorage.setItem("appLang", lang);
  applyI18n();
  window.taxflyRefreshTrips?.();
  updateGreeting();
};

function updateGreeting() {
  const nombre = localStorage.getItem("perfilActivoNombre") || localStorage.getItem("taxusa_offline_email") || "—";
  document.getElementById("greetingName").textContent = nombre.split("@")[0];
  const locales = {
    es: "es-AR",
    en: "en-US",
    pt: "pt-BR"
  };
  document.getElementById("greetingDate").textContent = (new Date).toLocaleDateString(locales[lang] || "es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const foto = localStorage.getItem("perfilActivoFoto");
  [ "btnSettings", "btnSettings2" ].forEach(id => {
    const b = document.getElementById(id);
    if (foto && b) {
      b.style.backgroundImage = `url('${foto}')`;
      b.textContent = "";
    }
  });
}

function renderBudgetUI(base, gastos) {
  window._lastBudgetArgs = [ base, gastos ];
  if (currentUser && perfilId) {
    const tripId=window.TripContext.view(currentUser.uid,perfilId);
    if (tripId!=="orlando") base=tripId==="unassigned"?0:Number(localStorage.getItem("taxusa_budget_cache_"+perfilId+"::"+currentUser.uid+"::"+tripId))||0;
    gastos = gastos.filter(g => (g.tripId || "unassigned") === window.TripContext.view(currentUser.uid, perfilId));
  }
  const gastadoPropio = gastos.reduce((s, g) => s + (parseFloat(g.valor || g.monto) || 0), 0);
  const gastado = gastadoPropio + (mapsSpentCache || 0);
  const totalEl = document.getElementById("total-gasto-val");
  const mapsNoteEl = document.getElementById("total-gasto-maps-note");
  if (!gastos || gastos.length === 0) {
    document.getElementById("last-gasto-val").textContent = "—";
    document.getElementById("last-gasto-name").textContent = t.no_gastos || "Sin gastos";
  } else {
    const last = gastos[0];
    document.getElementById("last-gasto-val").textContent = `${parseFloat(last.valor || last.monto || 0).toFixed(2)}`;
    document.getElementById("last-gasto-name").textContent = last.descripcion || last.nombre || last.tienda || "—";
    const catEl = document.getElementById("last-gasto-cat");
    if (last.categoria) {
      catEl.textContent = last.categoria;
      catEl.style.display = "inline-flex";
    }
  }
  if (totalEl) totalEl.textContent = `${gastado.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
  if (mapsNoteEl) {
    if (mapsSpentCache > 0) {
      mapsNoteEl.textContent = `incluye ${mapsSpentCache.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} de Planificación`;
      mapsNoteEl.style.display = "block";
    } else mapsNoteEl.style.display = "none";
  }
  const wbEl = document.querySelector(".widget-budget");
  if (base <= 0) {
    document.getElementById("wb-value").textContent = t.budget_no_data || "—";
    document.getElementById("wb-pct").textContent = "—";
    const lbl0 = document.querySelector(".widget-budget .wb-label");
    if (lbl0) { lbl0.setAttribute("data-i18n", "label_budget"); lbl0.textContent = t.label_budget; }
    if (wbEl) { wbEl.classList.add("is-empty"); wbEl.classList.remove("is-over"); }
    return;
  }
  if (wbEl) wbEl.classList.remove("is-empty");
  const restante = base - gastado;
  const spentPct = Math.round(gastado / base * 100);
  const over = gastado > base;
  const labelEl = document.querySelector(".widget-budget .wb-label");
  if (labelEl) {
    labelEl.setAttribute("data-i18n", over ? "budget_over_label" : "label_budget");
    labelEl.textContent = over ? t.budget_over_label : t.label_budget;
  }
  if (wbEl) wbEl.classList.toggle("is-over", over);
  document.getElementById("wb-value").textContent = `USD ${Math.abs(restante).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
  const pctEl = document.getElementById("wb-pct");
  pctEl.textContent = spentPct + "% " + (t.budget_spent_sfx || "");
  const bar = document.getElementById("wb-bar");
  bar.style.width = Math.min(100, Math.max(0, spentPct)) + "%";
  bar.style.background = over ? "#fecaca" : "";
  if (spentPct >= 90) pctEl.style.background = "rgba(239,68,68,.35)"; else if (spentPct >= 70) pctEl.style.background = "rgba(245,158,11,.35)"; else pctEl.style.background = "";
}

function loadBudget() {
  const cachedBase = parseFloat(localStorage.getItem("taxusa_budget_cache_" + perfilId)) || 0;
  let cachedGastos = [];
  try {
    cachedGastos = JSON.parse(localStorage.getItem("taxusa_gastos_cache_" + perfilId) || "[]");
  } catch (e) {}
  renderBudgetUI(cachedBase, cachedGastos);
  listenMapsBudget();
  if (!currentUser || !perfilId) return;
  const tripId=window.TripContext.view(currentUser.uid,perfilId);
  const budgetRef=tripId==="orlando"?doc(db,"usuarios",currentUser.uid,"perfiles",perfilId):tripId==="unassigned"?null:doc(db,"usuarios",currentUser.uid,"perfiles",perfilId,"tripPlanning",tripId);
  if (budgetRef) onSnapshot(budgetRef, snap => {
    const field=tripId==="orlando"?"presupuesto":"taxflyBudget";
    if (snap.exists() && snap.data()[field] !== undefined) {
      const base = parseFloat(snap.data()[field]) || 0;
      const key="taxusa_budget_cache_"+perfilId+(tripId==="orlando"?"":"::"+currentUser.uid+"::"+tripId);
      localStorage.setItem(key, String(base));
      let g = [];
      try {
        g = JSON.parse(localStorage.getItem("taxusa_gastos_cache_" + perfilId) || "[]");
      } catch (e) {}
      renderBudgetUI(base, g);
    }
  }, () => {});
  const q = query(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos"), orderBy("fecha", "desc"));
  onSnapshot(q, snap => {
    const gastos = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    try {
      localStorage.setItem("taxusa_gastos_cache_" + perfilId, JSON.stringify(gastos));
    } catch (e) {}
    const base = parseFloat(localStorage.getItem("taxusa_budget_cache_" + perfilId)) || 0;
    renderBudgetUI(base, gastos);
  }, () => {});
}

let fxData = {
  ars: {},
  er: {}
};

let fxCurrent = "ars";

const FX_META = {
  ars: {
    title: "Dólar hoy",
    titleEn: "Dollar today",
    titlePt: "Dólar hoje"
  },
  eur: {
    title: "Euro hoy",
    titleEn: "Euro today",
    titlePt: "Euro hoje"
  },
  uyu: {
    title: "Peso uruguayo",
    titleEn: "Uruguayan Peso",
    titlePt: "Peso uruguaio"
  },
  clp: {
    title: "Peso chileno",
    titleEn: "Chilean Peso",
    titlePt: "Peso chileno"
  },
  pen: {
    title: "Sol peruano",
    titleEn: "Peruvian Sol",
    titlePt: "Sol peruano"
  }
};

function fxFmt(n, decimals = 2) {
  if (!n) return "—";
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function fxFlag(cc) {
  return `<img src="https://flagcdn.com/16x12/${cc}.png" alt="" style="width:16px;height:12px;border-radius:1px;vertical-align:middle;margin-right:3px;" onerror="this.style.display='none'">`;
}

function fxRenderARS() {
  const d = fxData.ars;
  if (!d.oficial) return '<div class="fx-row"><span class="fx-name">—</span><span class="fx-val">—</span></div>';
  const lbl = {
    oficial: t.fx_oficial || "Oficial",
    card: t.fx_card || "Tarjeta"
  };
  return [ `<div class="fx-row"><span class="fx-name">${fxFlag("ar")}${lbl.oficial}</span><span class="fx-val">${fxFmt(d.oficial, 0)}</span></div>`, `<div class="fx-row"><span class="fx-name">💳 ${lbl.card}</span><span class="fx-val">${fxFmt(d.tarjeta, 0)}</span></div>` ].join("");
}

function fxRenderER(code, symbol, flagCc, decimals = 2) {
  const rate = fxData.er[code];
  if (!rate) return '<div class="fx-row"><span class="fx-name">—</span><span class="fx-val">—</span></div>';
  const arsOficial = fxData.ars.oficial || 0;
  const arsTarjeta = fxData.ars.tarjeta || 0;
  const lbl = {
    oficial: t.fx_oficial || "Oficial",
    card: t.fx_card || "Tarjeta"
  };
  const rows = [ `<div class="fx-row"><span class="fx-name">${fxFlag(flagCc)}1 USD</span><span class="fx-val">${symbol}${fxFmt(rate, decimals)}</span></div>` ];
  if (arsOficial) rows.push(`<div class="fx-row"><span class="fx-name">${fxFlag(flagCc)}vs ${lbl.oficial}</span><span class="fx-val">${fxFmt(arsOficial / rate, 2)}</span></div>`);
  if (arsTarjeta) rows.push(`<div class="fx-row"><span class="fx-name">💳 vs ${lbl.card}</span><span class="fx-val">${fxFmt(arsTarjeta / rate, 2)}</span></div>`);
  return rows.join("");
}

function fxRenderUYU() {
  return fxRenderER("UYU", "$U ", "uy", 0);
}

function fxRenderCLP() {
  return fxRenderER("CLP", "$", "cl", 0);
}

function fxRenderPEN() {
  return fxRenderER("PEN", "S/", "pe", 2);
}

function fxRenderEUR() {
  const rate = fxData.er["EUR"];
  if (!rate) return '<div class="fx-row"><span class="fx-name">—</span><span class="fx-val">—</span></div>';
  const arsOficial = fxData.ars.oficial || 0;
  const arsTarjeta = fxData.ars.tarjeta || 0;
  const usdPerEur = 1 / rate;
  const rows = [ `<div class="fx-row"><span class="fx-name">${fxFlag("eu")}1 EUR</span><span class="fx-val">${fxFmt(usdPerEur, 2)} USD</span></div>` ];
  const lblEur = {
    oficial: t.fx_oficial || "Oficial",
    card: t.fx_card || "Tarjeta"
  };
  if (arsOficial) rows.push(`<div class="fx-row"><span class="fx-name">${fxFlag("eu")}vs ${lblEur.oficial}</span><span class="fx-val">${fxFmt(arsOficial * usdPerEur, 0)}</span></div>`);
  if (arsTarjeta) rows.push(`<div class="fx-row"><span class="fx-name">💳 vs ${lblEur.card}</span><span class="fx-val">${fxFmt(arsTarjeta * usdPerEur, 0)}</span></div>`);
  return rows.join("");
}

function fxRender() {
  const content = document.getElementById("fx-content");
  const title = document.getElementById("fx-widget-title");
  const l = lang || "es";
  const meta = FX_META[fxCurrent];
  if (title) title.textContent = l === "en" ? meta.titleEn : l === "pt" ? meta.titlePt : meta.title;
  let html = "";
  if (fxCurrent === "ars") html = fxRenderARS(); else if (fxCurrent === "eur") html = fxRenderEUR(); else if (fxCurrent === "uyu") html = fxRenderUYU(); else if (fxCurrent === "clp") html = fxRenderCLP(); else if (fxCurrent === "pen") html = fxRenderPEN();
  if (content) content.innerHTML = html;
}

window.fxSelect = function(code) {
  fxCurrent = code;
  document.querySelectorAll(".fx-flag-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("fx-btn-" + code);
  if (btn) btn.classList.add("active");
  fxRender();
};

async function loadExchangeRate() {
  if (!navigator.onLine) {
    document.getElementById("fx-loading").textContent = "—";
    return;
  }
  try {
    let d1 = sharedCacheGet("shared-dolarapi-raw-v1", 36e5);
    if (!d1) {
      const r1 = await fetch("https://dolarapi.com/v1/dolares", {
        signal: AbortSignal.timeout(5e3)
      });
      d1 = await r1.json();
      sharedCacheSet("shared-dolarapi-raw-v1", d1);
    }
    const get = casa => d1.find(d => d.casa === casa)?.venta || 0;
    fxData.ars = {
      oficial: get("oficial"),
      tarjeta: get("tarjeta")
    };
    const r2 = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5e3)
    });
    const d2 = await r2.json();
    fxData.er = d2.rates || {};
    document.getElementById("fx-loading").style.display = "none";
    document.getElementById("fx-content").style.display = "block";
    fxRender();
  } catch (e) {
    document.getElementById("fx-loading").textContent = "—";
  }
}

const WMO = {
  0: "Despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna leve",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia leve",
  63: "Lluvia",
  65: "Lluvia intensa",
  71: "Nieve leve",
  73: "Nieve",
  75: "Nieve intensa",
  80: "Chubascos leves",
  81: "Chubascos",
  82: "Chubascos fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo",
  99: "Tormenta fuerte"
};

const WMO_EN = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Hail storm",
  99: "Severe storm"
};

const WMO_PT = {
  0: "Céu limpo",
  1: "Principalmente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Neblina",
  48: "Neblina com geada",
  51: "Garoa leve",
  53: "Garoa",
  55: "Garoa intensa",
  61: "Chuva fraca",
  63: "Chuva",
  65: "Chuva forte",
  71: "Neve fraca",
  73: "Neve",
  75: "Neve intensa",
  80: "Pancadas leves",
  81: "Pancadas",
  82: "Pancadas fortes",
  95: "Trovoada",
  96: "Trovoada com granizo",
  99: "Tempestade"
};

const WI = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "🌪️"
};

const WIND_DIR = [ "N", "NE", "E", "SE", "S", "SO", "O", "NO" ];

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

let weatherCache = {
  city: "",
  data: null,
  ts: 0
};

function renderWeather(r, lang) {
  const body = document.getElementById("ww-body");
  if (!body) return;
  const wmoMap = lang === "en" ? WMO_EN : lang === "pt" ? WMO_PT : WMO;
  const desc = wmoMap[r.code] || wmoMap[0];
  const icon = WI[r.code] || "🌡️";
  const feelsLbl = lang === "en" ? "Feels like" : lang === "pt" ? "Sensação" : "Sensación";
  const humLbl = lang === "en" ? "Humidity" : lang === "pt" ? "Umidade" : "Humedad";
  const windLbl = lang === "en" ? "Wind" : lang === "pt" ? "Vento" : "Viento";
  body.innerHTML = '<div class="ww-main">' + '<div class="ww-icon">' + icon + "</div>" + '<div class="ww-info">' + '<div class="ww-temp">' + r.tempF + "°<span>F / " + r.tempC + "°C</span></div>" + '<div class="ww-city">' + (r.displayName || "—") + "</div>" + '<div class="ww-desc">' + desc + "</div>" + "</div>" + "</div>" + '<div class="ww-extras">' + '<div class="ww-extra"><span>🌡️</span><span>' + feelsLbl + ": " + r.feelsF + "°F</span></div>" + '<div class="ww-extra"><span>💧</span><span>' + humLbl + ": " + r.humidity + "%</span></div>" + '<div class="ww-extra"><span>💨</span><span>' + windLbl + ": " + r.wind + " mph</span></div>" + "</div>";
  const refreshBtn = document.querySelector(".ww-refresh");
  if (refreshBtn) refreshBtn.classList.remove("spinning");
}

window.loadWeather = async function(force = false) {
  const l = lang || localStorage.getItem("appLang") || "es";
  let city = "Orlando";
  try {
    const weatherUid = currentUser?.uid || localStorage.getItem("taxusa_offline_uid");
    const tripId = localStorage.getItem("trip-planning-active::" + weatherUid + "::" + perfilId) || "orlando";
    const trips = JSON.parse(localStorage.getItem("trip-planning-trips::" + weatherUid + "::" + perfilId) || "[]");
    const trip = trips.find(t => t.id === tripId);
    const destination = trip && trip.destinations && trip.destinations[trip.activeDestination || 0];
    if (destination) city = destination.city;
    const t = localStorage.getItem("taxusa_cached_trip");
    if (!destination && t) city = JSON.parse(t).destination || city;
  } catch (e) {}
  const body = document.getElementById("ww-body");
  const refreshBtn = document.querySelector(".ww-refresh");
  if (refreshBtn) refreshBtn.classList.add("spinning");
  if (!force && weatherCache.data && weatherCache.city === city && Date.now() - weatherCache.ts < 18e5) {
    renderWeather(weatherCache.data, l);
    return;
  }
  if (!navigator.onLine) {
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("taxfly-weather-display::" + city.toLowerCase()) || "null"); } catch (_) {}
    const last = weatherCache.city === city && weatherCache.data ? {data:weatherCache.data,ts:weatherCache.ts} : saved;
    if (last?.data) {
      renderWeather(last.data, l);
      const note = document.createElement("div");
      note.className = "ww-error";
      note.textContent = tfL3("Sin conexión · último clima guardado: ", "Offline · last saved weather: ", "Sem conexão · último clima salvo: ") + new Date(last.ts).toLocaleString(tfL3("es-AR", "en-US", "pt-BR")) + tfL3(" (no es actual)", " (not current)", " (não é atual)");
      body.append(note);
      return;
    }
    if (body) body.innerHTML = '<div class="ww-error">📵 ' + tfL3("Sin conexión — clima no disponible", "Offline — weather unavailable", "Sem conexão — clima indisponível") + '</div>';
    return;
  }
  if (body) body.innerHTML = '<div class="ww-loading"><div class="ww-spinner"></div><span>' + (l === "en" ? "Fetching weather..." : l === "pt" ? "Obtendo clima..." : "Obteniendo clima...") + "</span></div>";
  try {
    const geoCacheKey = "shared-geo-cache::" + city.trim().toLowerCase();
    let geo = sharedCacheGet(geoCacheKey, 90 * 24 * 36e5);
    if (!geo) {
      const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=" + (l === "pt" ? "pt" : "es") + "&format=json");
      const geoData = await geoRes.json();
      if (!geoData.results || !geoData.results.length) throw new Error("Ciudad no encontrada");
      const g = geoData.results[0];
      geo = {
        latitude: g.latitude,
        longitude: g.longitude,
        name: g.name,
        country_code: g.country_code
      };
      sharedCacheSet(geoCacheKey, geo);
    }
    const {latitude: latitude, longitude: longitude, name: name, country_code: country_code} = geo;
    const displayName = name + (country_code ? ", " + country_code.toUpperCase() : "");
    const wCacheKey = "shared-weather-current::" + latitude.toFixed(2) + "," + longitude.toFixed(2);
    let c = sharedCacheGet(wCacheKey, 18e5);
    if (!c) {
      const wRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m" + "&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto");
      const wData = await wRes.json();
      c = wData.current;
      sharedCacheSet(wCacheKey, c);
    }
    const result = {
      tempF: Math.round(c.temperature_2m),
      tempC: Math.round((c.temperature_2m - 32) * 5 / 9),
      feelsF: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      code: c.weather_code,
      displayName: displayName
    };
    weatherCache = {
      city: city,
      data: result,
      ts: Date.now()
    };
    try { localStorage.setItem("taxfly-weather-display::" + city.toLowerCase(), JSON.stringify({data:result,ts:weatherCache.ts})); } catch (_) {}
    renderWeather(result, l);
  } catch (e) {
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    const errTxt = l === "en" ? "Could not load weather. Tap the refresh button to retry." : l === "pt" ? "Não foi possível carregar o clima." : "No se pudo cargar el clima. Tocá el botón de actualizar para reintentar.";
    if (body) body.innerHTML = '<div class="ww-error">⚠️ ' + errTxt + "</div>";
  }
};

function loadNextEvent() {
  const emojis = [ "🎡", "🛍️", "🍔", "🏨", "✈️", "🚗", "🎭", "🌅", "🏊", "⚽", "🎵", "🏰" ];
  function renderNoEvent() {
    const titleEl = document.getElementById("ne-title");
    if (titleEl) {
      titleEl.textContent = t.next_event_empty || "Sin eventos próximos";
      titleEl.removeAttribute("data-has-event");
    }
    const timeEl = document.getElementById("ne-time");
    timeEl.textContent = t.next_event_add || "＋ Agregar actividad";
    timeEl.style.fontWeight = "700";
    timeEl.style.color = "var(--primary, #4f8cff)";
    document.getElementById("ne-dot").textContent = "📅";
  }
  if (!currentUser || !perfilId) {
    renderNoEvent();
    return;
  }
  const q = query(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "actividades"), orderBy("date", "asc"));
  onSnapshot(q, snap => {
    const now = new Date;
    const upcoming = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).filter(a => (a.tripId || "unassigned") === window.TripContext.view(currentUser.uid, perfilId) && !a.done && new Date(a.date + "T" + (a.time || "00:00")) >= now);
    if (!upcoming.length) {
      renderNoEvent();
      return;
    }
    const ev = upcoming[0];
    document.getElementById("ne-title").textContent = ev.name || ev.titulo || ev.title || ev.nombre || "—";
    const d = new Date(ev.date + "T" + (ev.time || "00:00"));
    const loc = {
      es: "es-AR",
      en: "en-US",
      pt: "pt-BR"
    };
    const dateStr = d.toLocaleDateString(loc[lang] || "es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
    const timeStr = ev.time ? ` · ${ev.time}` : "";
    document.getElementById("ne-time").textContent = dateStr + timeStr;
    const typeEmoji = {
      vuelo: "✈️",
      hotel: "🏨",
      parque: "🎡",
      comida: "🍔",
      otro: "📍"
    };
    document.getElementById("ne-dot").textContent = typeEmoji[ev.type] || emojis[Math.floor(Math.random() * emojis.length)];
  }, () => {
    renderNoEvent();
  });
}

function renderTip() {
  const tips = t.tips || I18N.es.tips;
  const tip = tips[tipIndex % tips.length];
  const el = document.getElementById("tip-text");
  const ic = document.getElementById("tip-icon");
  if (el) {
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = tip.text;
      el.style.opacity = "1";
    }, 180);
  }
  if (ic) ic.textContent = tip.icon;
}

window.nextTip = function() {
  tipIndex = (tipIndex + 1) % (t.tips || I18N.es.tips).length;
  renderTip();
};

setInterval(() => {
  tipIndex = (tipIndex + 1) % (t.tips || I18N.es.tips).length;
  renderTip();
}, 12e3);

function renderSections() {
  const list = document.getElementById("sectionList");
  if (!list) return;
  const sections = t.sections || I18N.es.sections;
  const lang = localStorage.getItem("appLang") || "es";
  const heading = { es:["Tu viaje","Planificación","Mis cosas"], en:["Your trip","Planning","My things"], pt:["Sua viagem","Planejamento","Minhas coisas"] }[lang] || ["Tu viaje","Planificación","Mis cosas"];
  document.getElementById("homePlanHeading").textContent = heading[0];
  list.replaceChildren();
  const cards = [
    {href:"tax.html", icon:"calculator", tone:"blue", name:lang === "en" ? "Calculator" : "Calculadora"},
    {href:"compras.html", icon:"bag", tone:"violet", name:sections.find(s=>s.href==="compras.html")?.name || "Gastos"},
    {href:"planificacion.html?section=parques", icon:"calendar", tone:"teal", name:heading[1]},
    {href:"unidades.html", icon:"bulb", tone:"amber", name:{es:"Ayudas y referencias", en:"Help & references", pt:"Ajuda e referências"}[lang] || "Ayudas y referencias"},
    {href:"tickets.html", icon:"file", tone:"teal", name:{es:"Documentos",en:"Documents",pt:"Documentos"}[lang]},
    {href:"grupo.html", icon:"users", tone:"violet", name:{es:"Grupo",en:"Group",pt:"Grupo"}[lang]},
    {href:"rutas.html", icon:"map", tone:"amber", name:{es:"Rutas",en:"Routes",pt:"Rotas"}[lang]},
    {href:"mis-cosas.html", icon:"briefcase", tone:"indigo", name:heading[2]}
  ];
  cards.forEach(sec => {
    const a = document.createElement("a");
    a.href = sec.href;
    a.className = "section-card";
    a.innerHTML = `<span class="sc-emoji ui-slot" data-tone="${sec.tone}">${window.uiIcon(sec.icon, 30)}</span><span class="sc-name">${sec.name}</span>`;
    list.appendChild(a);
  });
}

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  if (!currentUser) return;
  const l = lang || "es", m = {
    es: {
      s: "Correo de recuperación enviado.",
      e: "Error: "
    },
    en: {
      s: "Recovery email sent.",
      e: "Error: "
    },
    pt: {
      s: "E-mail de recuperação enviado.",
      e: "Erro: "
    }
  }, tx = m[l] || m.es;
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    showAlert(tx.s);
  } catch (er) {
    showAlert(tx.e + er.message);
  }
};

window.doDeleteAccount = () => window.confirmAndDeleteAccount({
  db: db,
  doc: doc,
  deleteDoc: deleteDoc,
  deleteUser: deleteUser,
  currentUser: currentUser
});

window.gestionarPIN = () => {
  const l = lang || "es", m = {
    es: "Función de PIN disponible en la app completa.",
    en: "PIN function available in the full app.",
    pt: "Função de PIN disponível no app completo."
  };
  showAlert(m[l] || m.es);
};

window.toggleSettings = function() {
  const d = document.getElementById("settingsDrawer"), o = document.getElementById("menuOverlay"), isO = d.classList.contains("open");
  d.classList.toggle("open", !isO);
  o.style.display = isO ? "none" : "block";
};

window.toggleDarkMode = function() {
  const cur = document.documentElement.getAttribute("data-theme"), next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

window.changeProfile = () => {
  localStorage.removeItem("perfilActivoId");
  window.location.href = "profiles.html";
};

window.doLogout = () => signOut(auth).then(() => { window.taxflyClearOfflineUnlock(); window.location.replace("login.html"); });

window.openSwitchApp = () => {
  document.getElementById("switchAppModal").style.display = "flex";
};

window.doSwitchApp = function(d) { window.TaxflyRoutes.enter(d); };
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

async function guardOfflineAuth(user, onOnlineUser, onOfflineUser) {
  if (user) {
    if (!navigator.onLine && !window.taxflyOfflineUnlocked()) { window.location.replace("login.html"); return; }
    onOnlineUser(user); return;
  }
  const online = await probeConnectivity();
  if (!online && localStorage.getItem("taxusa_pin_hash") && localStorage.getItem("taxusa_offline_email") && window.taxflyOfflineUnlocked()) {
    if (onOfflineUser) onOfflineUser();
    return;
  }
  window.location.replace("login.html");
}

function loadOfflineUI() {
  const nombre = localStorage.getItem("perfilActivoNombre") || localStorage.getItem("taxusa_offline_email") || "—";
  const foto = localStorage.getItem("perfilActivoFoto") || "";
  const el = document.getElementById("userEmail");
  if (el) el.textContent = nombre;
  if (foto) {
    const b = document.getElementById("btnSettings");
    if (b) {
      b.style.backgroundImage = `url(${foto})`;
      b.textContent = "";
    }
  }
  loadBudget();
  loadNextEvent();
  window.taxflyOfflineStatus?.render(localStorage.getItem("taxusa_offline_uid"), localStorage.getItem("perfilActivoId"));
}

onAuthStateChanged(auth, user => {
  guardOfflineAuth(user, u => {
    currentUser = u;
    window.taxflyOfflineStatus?.render(u.uid, localStorage.getItem("perfilActivoId"));
    const perfilNombre = localStorage.getItem("perfilActivoNombre");
    document.getElementById("userEmail").textContent = perfilNombre || u.email || "";
    const img = localStorage.getItem("perfilActivoFoto") || u.photoURL;
    if (img) {
      const b = document.getElementById("btnSettings");
      b.style.backgroundImage = `url(${img})`;
      b.textContent = "";
    }
    loadBudget();
    loadNextEvent();
  }, loadOfflineUI);
});

(function() {
  const toast = document.getElementById("offline-toast");
  function upd() {
    toast.classList.toggle("show", !navigator.onLine);
  }
  window.addEventListener("online", upd);
  window.addEventListener("offline", upd);
  window.addEventListener("taxfly:tripchange", () => window.taxflyOfflineStatus?.render(currentUser?.uid || localStorage.getItem("taxusa_offline_uid"), localStorage.getItem("perfilActivoId")));
  window.addEventListener("taxfly:offline-status", () => window.taxflyOfflineStatus?.render(currentUser?.uid || localStorage.getItem("taxusa_offline_uid"), localStorage.getItem("perfilActivoId")));
  upd();
})();

applyI18n();

updateGreeting();

loadExchangeRate();

loadWeather();

if ("serviceWorker" in navigator) {
  const hadServiceWorker = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.taxflyOfflineStatus?.render(currentUser?.uid || localStorage.getItem("taxusa_offline_uid"), localStorage.getItem("perfilActivoId"));
    if (hadServiceWorker) location.reload();
  }, { once: true });
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

sessionStorage.setItem("taxfly_last_page", "./index.html");
