import { fsNet } from "./fs-net.js";
const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

let initializeApp, getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, deleteDoc, addDoc, collection, initializeAppCheck, ReCaptchaV3Provider;

let app, auth, db;

let firebaseOk = true;

try {
  ({initializeApp: initializeApp} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js")));
  ({getAuth: getAuth, onAuthStateChanged: onAuthStateChanged, signOut: signOut, sendPasswordResetEmail: sendPasswordResetEmail, deleteUser: deleteUser, verifyBeforeUpdateEmail: verifyBeforeUpdateEmail} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js")));
  ({getFirestore: getFirestore, initializeFirestore: initializeFirestore, persistentLocalCache: persistentLocalCache, persistentMultipleTabManager: persistentMultipleTabManager, doc: doc, setDoc: setDoc, getDoc: getDoc, deleteDoc: deleteDoc, addDoc: addDoc, collection: collection} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js")));
  ({initializeAppCheck: initializeAppCheck, ReCaptchaV3Provider: ReCaptchaV3Provider} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js")));
  app = initializeApp(FB);
  auth = getAuth(app);
  const FS_NET = await fsNet();
  try {
    db = initializeFirestore(app, {
      ...FS_NET,
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

let tripData = {
  destination: "Orlando",
  date: "2027-01-01"
};

let currentTip = 0;

let tipIndex = 0;

let tipTimer;

let perfilId = null;

let perfilFoto = null;

const taxData = {
  "District of Columbia": [{n:"Washington, DC",t:Date.now() >= Date.parse("2026-10-01T00:00:00-04:00") ? 7 : 6}],
  Alabama: [ {
    n: "Birmingham",
    t: 10
  } ],
  Alaska: [ {
    n: "Sin Tax",
    t: 0
  } ],
  Arizona: [ {
    n: "Phoenix",
    t: 9.1
  } ],
  Arkansas: [ {
    n: "Little Rock",
    t: 8.625
  } ],
  California: [ {
    n: "Los Angeles",
    t: 9.75
  }, {
    n: "San Francisco",
    t: 8.63
  }, {
    n: "San Diego",
    t: 7.75
  } ],
  Colorado: [ {
    n: "Denver",
    t: 9.15
  } ],
  Connecticut: [ {
    n: "Stamford",
    t: 6.35
  } ],
  Delaware: [ {
    n: "Sin Tax",
    t: 0
  } ],
  Florida: [ {
    n: "Orlando",
    t: 6.5
  }, {
    n: "Miami",
    t: 7
  }, {
    n: "Tampa",
    t: 7.5
  }, {
    n: "Kissimmee",
    t: 7.5
  }, { n: "Jacksonville", t: 7.5 }, { n: "Tallahassee", t: 7.5 } ],
  Georgia: [ {
    n: "Atlanta",
    t: 8.9
  } ],
  Hawaii: [ {
    n: "Honolulu",
    t: 4.5
  } ],
  Idaho: [ {
    n: "Boise",
    t: 6
  } ],
  Illinois: [ {
    n: "Chicago",
    t: 10.5
  } ],
  Indiana: [ {
    n: "New Castle",
    t: 7
  } ],
  Iowa: [ {
    n: "Des Moines",
    t: 7
  } ],
  Kansas: [ {
    n: "Wichita",
    t: 7.5
  } ],
  Kentucky: [ {
    n: "Louisville",
    t: 6
  } ],
  Louisiana: [ {
    n: "New Orleans",
    t: 10
  } ],
  Maine: [ {
    n: "Portland",
    t: 5.5
  } ],
  Maryland: [ {
    n: "Baltimore",
    t: 6
  } ],
  Massachusetts: [ {
    n: "Boston",
    t: 6.25
  } ],
  Michigan: [ {
    n: "Detroit",
    t: 6
  } ],
  Minnesota: [ {
    n: "Minneapolis",
    t: 9.025
  } ],
  Mississippi: [ {
    n: "Jackson",
    t: 8
  } ],
  Missouri: [ {
    n: "St. Louis",
    t: 9.679
  } ],
  Montana: [ {
    n: "Sin Tax",
    t: 0
  } ],
  Nebraska: [ {
    n: "Omaha",
    t: 7
  } ],
  Nevada: [ {
    n: "Las Vegas",
    t: 8.38
  } ],
  "New Hampshire": [ {
    n: "Sin Tax",
    t: 0
  } ],
  "New Jersey": [ {
    n: "Jersey City",
    t: 6.625
  } ],
  "New Mexico": [ {
    n: "Albuquerque",
    t: 7.625
  } ],
  "New York": [ {
    n: "NYC",
    t: 8.875
  }, {
    n: "Buffalo",
    t: 8.75
  } ],
  "North Carolina": [ {
    n: "Charlotte",
    t: 8.25
  } ],
  "North Dakota": [ {
    n: "Fargo",
    t: 7.75
  } ],
  Ohio: [ {
    n: "Columbus",
    t: 7.5
  } ],
  Oklahoma: [ {
    n: "Oklahoma City",
    t: 8.63
  } ],
  Oregon: [ {
    n: "Sin Tax",
    t: 0
  } ],
  Pennsylvania: [ {
    n: "Philadelphia",
    t: 8
  } ],
  "Rhode Island": [ {
    n: "Providence",
    t: 7
  } ],
  "South Carolina": [ {
    n: "Charleston",
    t: 9
  } ],
  "South Dakota": [ {
    n: "Sioux Falls",
    t: 6.2
  } ],
  Tennessee: [ {
    n: "Nashville",
    t: 9.75
  } ],
  Texas: [ {
    n: "Houston",
    t: 8.25
  }, {
    n: "Dallas",
    t: 8.25
  }, {
    n: "Austin",
    t: 8.25
  } ],
  Utah: [ {
    n: "Salt Lake City",
    t: 8.45
  } ],
  Vermont: [ {
    n: "Burlington",
    t: 7
  } ],
  Virginia: [ {
    n: "Virginia Beach",
    t: 6
  } ],
  Washington: [ {
    n: "Seattle",
    t: 10.55
  } ],
  "West Virginia": [ {
    n: "Bridgeport",
    t: 7
  } ],
  Wisconsin: [ {
    n: "Milwaukee",
    t: 7.9
  } ],
  Wyoming: [ {
    n: "Cheyenne",
    t: 6
  } ]
};

const i18n = {
  es: {
    nav_expenses: "GASTOS",
    nav_home: "INICIO",
    nav_itinerary: "PLANIFICACIÓN",
    nav_compare: "COMPARAR",
    nav_units: "AYUDA Y REFERENCIAS",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_routes: "RUTAS",
    nav_more: "MÁS",
    nav_units_desc: "Conversor de unidades y ayudas varias",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartidos",
    label_price: "Precio en Etiqueta (USD)",
    label_category: "Categoría",
    cat_general: "GENERAL",
    cat_tech: "TECH",
    cat_food: "COMIDA",
    cat_med: "MEDICINA",
    cat_clothing: "ROPA",
    label_state: "Estado",
    label_city: "Ciudad / Condado",
    label_zip: "ZIP preciso (opcional)",
    btn_zip_search: "Buscar",
    tax_applied: "Tax Aplicado",
    label_tip: "Propina (Tip)",
    label_total: "TOTAL FINAL (INC. TIP)",
    label_other: "OTRO",
    settings_title: "Ajustes",
    label_language: "Idioma",
    btn_pin: "Cambiar PIN Offline",
    btn_change_profile: "Cambiar Perfil",
    btn_theme: "Cambiar Tema",
    btn_update: "Actualizar App",
    btn_email: "Cambiar Correo",
    btn_password: "Cambiar Contraseña",
    btn_logout: "Cerrar Sesión",
    btn_delete: "Eliminar Cuenta",
    modal_trip_title: "Mi Viaje",
    modal_city_label: "¿A qué ciudad vas?",
    modal_date_label: "Fecha del viaje",
    btn_save: "GUARDAR",
    btn_close: "CERRAR",
    trip_prefix: "Faltan para",
    footer_by: "Creado por Juan Cruz Bria",
    tip_label: "CONSEJO ECONÓMICO",
    d: "d",
    h: "h",
    m: "m",
    s: "s",
    alert_upcoming: "🚀 El Comparador de Precios estará disponible próximamente.",
    split_title: "Dividir la Cuenta",
    split_open: "VER",
    split_close: "OCULTAR",
    split_people: "Personas",
    split_people_lbl: "personas",
    split_tip_pct: "Propina",
    split_base: "Base (precio en etiqueta)",
    split_result_title: "Resultado",
    split_per_person: "por persona",
    split_total: "total cuenta",
    split_subtotal: "subtotal",
    split_tax: "tax",
    split_tip_amt: "propina",
    offline_title: "Sin conexión",
    offline_sub: "La calculadora, propina y dividir cuenta siguen funcionando normalmente",
    btn_manual_tax: "Ingresar tax manualmente",
    cart_title: "Carrito de Compras",
    cart_open: "VER",
    cart_close: "OCULTAR",
    cart_hint: "Sumá cada producto del súper y mirá el total con tax al final, sin salir de la app.",
    cart_exempt: "Sin tax",
    cart_empty: "Todavía no agregaste productos.",
    cart_subtotal: "Subtotal",
    cart_tax: "Tax",
    cart_total: "TOTAL",
    cart_clear: "Vaciar",
    cart_save: "Guardar en Gastos",
    tab_individual: "Precio Individual",
    tab_cart: "Carrito",
    food_prepared: "Preparada / Restaurante",
    food_grocery: "Súper (sin preparar)",
    food_staple: "Alimento básico",
    food_candy: "Golosina / gaseosa",
    med_otc: "Venta libre (OTC)",
    med_rx: "Con receta",
    med_listed: "Remedio de lista exenta (FL)"
  },
  en: {
    nav_expenses: "EXPENSES",
    nav_home: "HOME",
    nav_itinerary: "PLANNING",
    nav_compare: "COMPARE",
    nav_units: "Help & References",
    nav_tickets: "DOCUMENTS",
    nav_group: "GROUP",
    nav_routes: "ROUTES",
    nav_more: "MORE",
    nav_units_desc: "Unit Converter & Utilities",
    nav_tickets_desc: "ESTA, insurance, check-in",
    nav_group_desc: "Shared expenses",
    label_price: "Pre-tax Price (USD)",
    label_category: "Category",
    cat_general: "GENERAL",
    cat_tech: "TECH",
    cat_food: "FOOD",
    cat_med: "MEDICINE",
    cat_clothing: "CLOTHING",
    label_state: "State",
    label_city: "City / County",
    label_zip: "Precise ZIP (optional)",
    btn_zip_search: "Search",
    tax_applied: "Applied Tax",
    label_tip: "Tip",
    label_total: "FINAL TOTAL (TIP INC.)",
    label_other: "OTHER",
    settings_title: "Settings",
    label_language: "Language",
    btn_pin: "Change PIN Offline",
    btn_change_profile: "Change Profile",
    btn_theme: "Toggle Theme",
    btn_update: "Update App",
    btn_email: "Change Email",
    btn_password: "Change Password",
    btn_logout: "Sign Out",
    btn_delete: "Delete Account",
    modal_trip_title: "My Trip",
    modal_city_label: "Where are you going?",
    modal_date_label: "Trip Date",
    btn_save: "SAVE",
    btn_close: "CLOSE",
    trip_prefix: "Days until",
    footer_by: "Created by Juan Cruz Bria",
    tip_label: "ECONOMIC TIP",
    d: "d",
    h: "h",
    m: "m",
    s: "s",
    alert_upcoming: "🚀 The Price Comparator will be available soon.",
    split_title: "Split the Bill",
    split_open: "SHOW",
    split_close: "HIDE",
    split_people: "People",
    split_people_lbl: "people",
    split_tip_pct: "Tip",
    split_base: "Base (pre-tax price)",
    split_result_title: "Result",
    split_per_person: "per person",
    split_total: "total bill",
    split_subtotal: "subtotal",
    split_tax: "tax",
    split_tip_amt: "tip",
    offline_title: "No connection",
    offline_sub: "Calculator, tip and split bill work normally without internet",
    btn_manual_tax: "Enter tax manually",
    cart_title: "Shopping Cart",
    cart_open: "SHOW",
    cart_close: "HIDE",
    cart_hint: "Add each item from the store and see the total with tax at the end, without leaving the app.",
    cart_exempt: "Tax free",
    cart_empty: "No items added yet.",
    cart_subtotal: "Subtotal",
    cart_tax: "Tax",
    cart_total: "TOTAL",
    cart_clear: "Clear",
    cart_save: "Save to Expenses",
    tab_individual: "Individual Price",
    tab_cart: "Cart",
    food_prepared: "Prepared / Restaurant",
    food_grocery: "Grocery (unprepared)",
    food_staple: "Grocery staple",
    food_candy: "Candy / soda",
    med_otc: "Over-the-counter (OTC)",
    med_rx: "Prescription",
    med_listed: "Listed exempt remedy (FL)"
  },
  pt: {
    nav_expenses: "GASTOS",
    nav_home: "INÍCIO",
    nav_itinerary: "PLANEJAMENTO",
    nav_compare: "COMPARAR",
    nav_units: "Ajuda e Referências",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_routes: "ROTAS",
    nav_more: "MAIS",
    nav_units_desc: "Conversor de Unidades e Utilidades",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartilhados",
    label_price: "Preço na Etiqueta (USD)",
    label_category: "Categoria",
    cat_general: "GERAL",
    cat_tech: "TECH",
    cat_food: "COMIDA",
    cat_med: "MEDICINA",
    cat_clothing: "ROUPA",
    label_state: "Estado",
    label_city: "Cidade / Condado",
    label_zip: "CEP preciso (opcional)",
    btn_zip_search: "Buscar",
    tax_applied: "Tax Aplicado",
    label_tip: "Gorjeta (Tip)",
    label_total: "TOTAL FINAL (COM GORJETA)",
    label_other: "OUTRO",
    settings_title: "Configurações",
    label_language: "Idioma",
    btn_pin: "Alterar PIN Offline",
    btn_change_profile: "Trocar Perfil",
    btn_theme: "Alternar Tema",
    btn_update: "Atualizar App",
    btn_email: "Alterar E-mail",
    btn_password: "Alterar Senha",
    btn_logout: "Sair",
    btn_delete: "Excluir Conta",
    modal_trip_title: "Minha Viagem",
    modal_city_label: "Para qual cidade você vai?",
    modal_date_label: "Data da viagem",
    btn_save: "SALVAR",
    btn_close: "FECHAR",
    trip_prefix: "Faltam para",
    footer_by: "Criado por Juan Cruz Bria",
    tip_label: "DICA ECONÔMICA",
    d: "d",
    h: "h",
    m: "m",
    s: "s",
    alert_upcoming: "🚀 O Comparador de Preços estará disponível em breve.",
    split_title: "Dividir a Conta",
    split_open: "VER",
    split_close: "OCULTAR",
    split_people: "Pessoas",
    split_people_lbl: "pessoas",
    split_tip_pct: "Gorjeta",
    split_base: "Base (preço na etiqueta)",
    split_result_title: "Resultado",
    split_per_person: "por pessoa",
    split_total: "total conta",
    split_subtotal: "subtotal",
    split_tax: "tax",
    split_tip_amt: "gorjeta",
    offline_title: "Sem conexão",
    offline_sub: "Calculadora, gorjeta e dividir conta funcionam normalmente sem internet",
    btn_manual_tax: "Inserir imposto manualmente",
    cart_title: "Carrinho de Compras",
    cart_open: "VER",
    cart_close: "OCULTAR",
    cart_hint: "Some cada produto do mercado e veja o total com imposto no final, sem sair do app.",
    cart_exempt: "Sem imposto",
    cart_empty: "Ainda não adicionou produtos.",
    cart_subtotal: "Subtotal",
    cart_tax: "Imposto",
    cart_total: "TOTAL",
    cart_clear: "Esvaziar",
    cart_save: "Salvar em Gastos",
    tab_individual: "Preço Individual",
    tab_cart: "Carrinho",
    food_prepared: "Preparada / Restaurante",
    food_grocery: "Supermercado (sem preparar)",
    food_staple: "Alimento básico",
    food_candy: "Doce / refrigerante",
    med_otc: "Venda livre (OTC)",
    med_rx: "Com receita",
    med_listed: "Remédio isento (FL)"
  }
};

const econTips = {
  es: [ "Delaware y Oregon tienen 0% de Sales Tax. Ideal para Apple o lujo.", "En NYC, ropa y calzado de menos de $110 están exentos de tax municipal.", "New Jersey tiene 0% de tax en ropa. Ideal si vas al Jersey Gardens desde NY.", "En Miami (7%), los outlets como Sawgrass rinden más con su libro de cupones.", "Texas ofrece 'Tax Free Shopping' para turistas extranjeros en locales adheridos.", "Recuerda: en EE.UU. el precio de etiqueta NUNCA incluye el impuesto de venta.", "Minnesota y Pennsylvania no cobran impuestos en la mayoría de la ropa.", "Las propinas se calculan sobre el valor total CON impuestos en muchos tickets.", "Si comprás online y retirás en tienda, pagás el tax de esa ubicación.", "Florida suspende el Sales Tax en algunos fines de semana del año escolar." ],
  en: [ "Delaware and Oregon have 0% Sales Tax. Ideal for Apple or luxury items.", "In NYC, clothing under $110 is exempt from local sales tax.", "New Jersey has 0% tax on clothing. Great if you visit Jersey Gardens from NY.", "In Miami (7%), outlets like Sawgrass are better with their coupon book.", "Texas offers Tax Free Shopping for foreign tourists at participating stores.", "Remember: in the US, the price tag NEVER includes sales tax.", "Minnesota and Pennsylvania don't charge tax on most clothing.", "Tips are calculated on the total WITH taxes on many receipts.", "If you order online and pick up in store, you pay that location's tax.", "Florida suspends Sales Tax some weekends during back-to-school season." ],
  pt: [ "Delaware e Oregon têm 0% de Sales Tax. Ótimo para Apple ou artigos de luxo.", "Em NYC, roupas abaixo de US$110 são isentas de imposto municipal.", "New Jersey tem 0% de imposto em roupas. Ideal perto de NY no Jersey Gardens.", "Em Miami (7%), outlets como Sawgrass rendem mais com o cupom book deles.", "Texas oferece Tax Free Shopping para turistas estrangeiros em lojas participantes.", "Lembre: nos EUA a etiqueta NUNCA inclui o imposto de venda.", "Minnesota e Pennsylvania não cobram imposto na maioria das roupas.", "A gorjeta é calculada sobre o total COM impostos em muitos tickets.", "Se comprar online e retirar na loja, paga o tax daquela localização.", "Florida suspende o Sales Tax em alguns fins de semana do ano letivo." ]
};

window.cambiarConsejo = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const el = document.getElementById("tip-content");
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => {
    tipIndex = (tipIndex + 1) % econTips[lang].length;
    el.innerText = econTips[lang][tipIndex];
    el.style.opacity = 1;
  }, 300);
};

window.clicConsejo = () => {
  clearInterval(tipTimer);
  window.cambiarConsejo();
  tipTimer = setInterval(window.cambiarConsejo, 8e3);
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
  const tc = document.getElementById("tip-content");
  if (tc) tc.innerText = econTips[lang][tipIndex];
  calculate();
  updateTripUI();
  document.title = lang === "en" ? "TaxFly — Taxes" : lang === "pt" ? "TaxFly — Impostos" : "TaxFly — Taxes";
  if (window.taxieUpdateLang) window.taxieUpdateLang(lang);
  const lbl = document.getElementById("wc-label");
  if (lbl) {
    lbl.textContent = lang === "en" ? "Weather at destination" : lang === "pt" ? "Clima no destino" : "Clima en destino";
  }
  if (weatherCache && weatherCache.data) {
    renderWeather(weatherCache.data, weatherCache.city, lang);
  }
  const tipToggleLbl = document.getElementById("tip-toggle-lbl");
  if (tipToggleLbl) {
    if (tipOpen) {
      tipToggleLbl.textContent = lang === "en" ? "▲ HIDE" : "▲ OCULTAR";
    } else {
      tipToggleLbl.textContent = lang === "en" ? "▼ SHOW" : lang === "pt" ? "▼ VER" : "▼ VER";
    }
  }
  const splitToggleLbl = document.getElementById("split-toggle-lbl");
  if (splitToggleLbl) {
    if (splitOpen) {
      splitToggleLbl.innerHTML = "▲ <span>" + (i18n[lang].split_close || "OCULTAR") + "</span>";
    } else {
      splitToggleLbl.innerHTML = "▼ <span>" + (i18n[lang].split_open || "VER") + "</span>";
    }
  }
  const cartToggleLbl = document.getElementById("cart-toggle-lbl");
  if (cartToggleLbl) {
    if (typeof cartOpen !== "undefined" && cartOpen) {
      cartToggleLbl.innerHTML = "▲ <span>" + (i18n[lang].cart_close || "OCULTAR") + "</span>";
    } else {
      cartToggleLbl.innerHTML = "▼ <span>" + (i18n[lang].cart_open || "VER") + "</span>";
    }
  }
  if (typeof renderCart === "function") renderCart();
};

window.setCategory = cat => {
  document.querySelectorAll("#panel-individual .cat-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("btn-" + cat).classList.add("active");
  document.getElementById("food-mode-grid")?.classList.toggle("show", cat === "food");
  document.getElementById("food-candy-grid")?.classList.toggle("show", cat === "food" && individualFoodMode === "grocery");
  document.getElementById("med-mode-grid")?.classList.toggle("show", cat === "med");
  calculate();
};

window.setFoodMode = mode => {
  individualFoodMode = mode;
  document.getElementById("foodmode-prepared")?.classList.toggle("active", mode === "prepared");
  document.getElementById("foodmode-grocery")?.classList.toggle("active", mode === "grocery");
  document.getElementById("food-candy-grid")?.classList.toggle("show", mode === "grocery");
  calculate();
};

window.setFoodCandy = isCandy => {
  individualFoodCandy = isCandy;
  document.getElementById("foodcandy-no")?.classList.toggle("active", !isCandy);
  document.getElementById("foodcandy-yes")?.classList.toggle("active", isCandy);
  calculate();
};

window.setMedMode = mode => {
  individualMedMode = mode;
  document.getElementById("medmode-otc")?.classList.toggle("active", mode === "otc");
  document.getElementById("medmode-rx")?.classList.toggle("active", mode === "prescription");
  document.getElementById("medmode-eligible")?.classList.toggle("active", mode === "eligible_otc");
  calculate();
};

window.setTip = pct => {
  currentTip = pct;
  document.querySelectorAll(".tip-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tip-" + pct).classList.add("active");
  document.getElementById("custom-tip-input").value = "";
  calculate();
  updateTipBadge();
};

window.setCustomTip = () => {
  const v = parseFloat(document.getElementById("custom-tip-input").value);
  currentTip = isNaN(v) ? 0 : v;
  if (!isNaN(v)) document.querySelectorAll(".tip-btn").forEach(b => b.classList.remove("active"));
  calculate();
  updateTipBadge();
};

// Rules checked against state tax agencies, September 2026. City rates are
// estimates unless the jurisdiction is identified by an address.
const CANDY_SODA_FULL_TAX_STATES = new Set([
  "Arkansas","Colorado","Connecticut","Florida","Illinois","Indiana","Iowa","Kentucky",
  "Maine","Maryland","Minnesota","New Jersey","New York","North Carolina",
  "North Dakota","Rhode Island","Tennessee","Texas","Wisconsin"
]);
function getFoodTaxRate(state, mode, localRate, isCandy) {
  if (mode !== "grocery") return localRate;
  if (isCandy && CANDY_SODA_FULL_TAX_STATES.has(state)) return localRate;
  // Reduced statewide food rates; keep local components where the agency says they apply.
  if (state === "Alabama") return Math.max(0, localRate - 2); // 4% general → 2% food state rate
  if (state === "Mississippi") return Math.max(0, localRate - 2); // 7% → 5%
  if (state === "Missouri" || state === "Tennessee") return Math.max(0, localRate - 3);
  if (state === "Utah") return 3; // combined grocery food rate
  if (state === "Virginia") return 1;
  if (state === "Hawaii" || state === "Idaho" || state === "South Dakota") return localRate;
  if (state === "Louisiana") return Math.max(0, localRate - 5); // state exempt, local may apply
  return 0; // ordinary unprepared groceries; confirm product qualification in the receipt
}

function getMedTaxRate(state, mode, localRate) {
  if (mode === "prescription") return 0;
  if (state === "Minnesota" && mode === "otc") return 0; // drugs with Drug Facts label
  if (state === "Florida" && mode === "eligible_otc") return 0; // DR-46NT listed remedies
  return localRate; // OTC by itself is not proof of an exemption
}

const CLOTHING_EXEMPT_STATES = new Set(["Minnesota","New Jersey","Pennsylvania","Vermont"]);
function getClothingTaxRate(state, price, localRate, cityName = "") {
  if (CLOTHING_EXEMPT_STATES.has(state)) return 0; // qualifying everyday clothes only
  if (state === "New York" && price < 110) {
    return cityName === "NYC" ? 0 : cityName === "Buffalo" ? 4.75 : localRate;
  }
  // MA and RI tax only the amount above their per-item exemption.
  if (state === "Massachusetts") return price > 175 ? localRate * (price - 175) / price : 0;
  if (state === "Rhode Island") return price > 250 ? localRate * (price - 250) / price : 0;
  return localRate;
}

function selectedTaxCity(id) {
  const sel = document.getElementById(id);
  return sel?.selectedOptions?.[0]?.textContent?.split(" (")[0] || "";
}
// State-specific clauses shown alongside the generic estimate note.
// Kept in sync with getFoodTaxRate / getMedTaxRate / getClothingTaxRate above.
const STATE_TAX_NOTES = {
  Florida: {
    es: "En Florida, alimentos sin preparar suelen estar exentos (las golosinas tributan) y los medicamentos de venta libre solo están exentos si figuran en la lista oficial.",
    en: "In Florida, unprepared groceries are generally exempt (candy is taxed), and OTC medicine is exempt only if it's on the official list.",
    pt: "Na Flórida, alimentos não preparados geralmente são isentos (doces são tributados), e remédios de venda livre só são isentos se constarem na lista oficial."
  },
  Minnesota: {
    es: "En Minnesota, la ropa está exenta y los medicamentos de venta libre con etiqueta Drug Facts suelen estar exentos.",
    en: "In Minnesota, clothing is exempt, and OTC drugs with a Drug Facts label are generally exempt.",
    pt: "Em Minnesota, roupas são isentas e remédios de venda livre com rótulo Drug Facts geralmente são isentos."
  },
  "New Jersey": {
    es: "En New Jersey, la ropa cotidiana suele estar exenta.",
    en: "In New Jersey, everyday clothing is generally exempt.",
    pt: "Em New Jersey, roupas do dia a dia geralmente são isentas."
  },
  Pennsylvania: {
    es: "En Pennsylvania, la ropa cotidiana suele estar exenta.",
    en: "In Pennsylvania, everyday clothing is generally exempt.",
    pt: "Na Pensilvânia, roupas do dia a dia geralmente são isentas."
  },
  Vermont: {
    es: "En Vermont, la ropa cotidiana suele estar exenta.",
    en: "In Vermont, everyday clothing is generally exempt.",
    pt: "Em Vermont, roupas do dia a dia geralmente são isentas."
  },
  "New York": {
    es: "En Nueva York, la ropa de menos de $110 suele estar exenta (varía según la ciudad).",
    en: "In New York, clothing under $110 is generally exempt (varies by city).",
    pt: "Em Nova York, roupas com menos de US$ 110 geralmente são isentas (varia por cidade)."
  },
  Massachusetts: {
    es: "En Massachusetts, la ropa tributa solo en el monto que supera los $175 por prenda.",
    en: "In Massachusetts, clothing is taxed only on the amount above $175 per item.",
    pt: "Em Massachusetts, roupas são tributadas apenas no valor acima de US$ 175 por peça."
  },
  "Rhode Island": {
    es: "En Rhode Island, la ropa tributa solo en el monto que supera los $250 por prenda.",
    en: "In Rhode Island, clothing is taxed only on the amount above $250 per item.",
    pt: "Em Rhode Island, roupas são tributadas apenas no valor acima de US$ 250 por peça."
  }
};
// States where groceries get a reduced rate vs. the general rate.
const STATE_FOOD_REDUCED = new Set(["Alabama", "Mississippi", "Missouri", "Tennessee", "Utah", "Virginia", "Louisiana"]);
// States where groceries are taxed at the full general rate (no exemption).
const STATE_FOOD_NO_EXEMPTION = new Set(["Hawaii", "Idaho", "South Dakota"]);
function getStateTaxNote(state, lang) {
  if (!state) return "";
  if (STATE_TAX_NOTES[state]) return STATE_TAX_NOTES[state][lang] || STATE_TAX_NOTES[state].es;
  if (STATE_FOOD_REDUCED.has(state)) {
    const t = {
      es: `En ${state}, los alimentos sin preparar pueden tener una tasa reducida respecto a la general.`,
      en: `In ${state}, unprepared groceries may have a reduced rate compared to the general rate.`,
      pt: `Em ${state}, alimentos não preparados podem ter uma alíquota reduzida em relação à geral.`
    };
    return t[lang] || t.es;
  }
  if (STATE_FOOD_NO_EXEMPTION.has(state)) {
    const t = {
      es: `En ${state}, los alimentos sin preparar no están exentos: tributan a la tasa general.`,
      en: `In ${state}, unprepared groceries aren't exempt: they're taxed at the general rate.`,
      pt: `Em ${state}, alimentos não preparados não são isentos: são tributados na alíquota geral.`
    };
    return t[lang] || t.es;
  }
  return "";
}
function updateTaxRuleNote() {
  const lang = localStorage.getItem("appLang") || "es";
  const base = {
    es: "Estimación: las tasas y exenciones dependen de la dirección, el producto y su uso. Confirmá el recibo antes de pagar.",
    en: "Estimate: rates and exemptions depend on address, product and use. Check the receipt before paying.",
    pt: "Estimativa: alíquotas e isenções dependem do endereço, produto e uso. Confira o recibo."
  };
  const targets = [
    { id: "tax-rule-note", stateId: "state-select" },
    { id: "cart-tax-rule-note", stateId: "cart-state-select" }
  ];
  for (const t of targets) {
    const el = document.getElementById(t.id);
    if (!el) continue;
    const state = document.getElementById(t.stateId)?.value || "";
    const extra = getStateTaxNote(state, lang);
    el.textContent = (base[lang] || base.es) + (extra ? " " + extra : "");
  }
}
function validateZipTax(data, selectedState) {
  const rate = Number(data?.rates?.combined) * 100;
  if (!Number.isFinite(rate) || rate < 0 || rate > 20) throw new Error("invalid rate");
  const returned = String(data.state || "").trim().toLowerCase();
  if (returned && selectedState && returned !== selectedState.toLowerCase() && STATE_ALIASES[returned] !== selectedState) throw new Error("state mismatch");
  return rate;
}
let manualTaxActive = false;

let individualFoodMode = "grocery";

let individualFoodCandy = false;

let individualMedMode = "otc";

let zipTaxOverride = null;

window.lookupZipTax = async () => {
  const zipInput = document.getElementById("zip-input");
  const statusEl = document.getElementById("zip-status");
  const zip = (zipInput?.value || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    statusEl.textContent = "⚠ " + tfL3("Ingresá un ZIP de 5 dígitos", "Enter a 5-digit ZIP code", "Digite um ZIP de 5 dígitos");
    statusEl.style.color = "var(--warn)";
    return;
  }
  if (!navigator.onLine) {
    statusEl.textContent = "⚠ " + tfL3("Sin conexión — usando tasa de ciudad", "Offline — using city rate", "Sem conexão — usando a taxa da cidade");
    statusEl.style.color = "var(--warn)";
    return;
  }
  statusEl.textContent = tfL3("Buscando…", "Searching…", "Buscando…");
  statusEl.style.color = "var(--text-sub)";
  try {
    const res = await fetch(`https://salestaxzip.com/api/v1/rate/${zip}`);
    if (!res.ok) throw new Error("zip not found");
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("bad response");
    zipTaxOverride = validateZipTax(json.data, document.getElementById("state-select")?.value);
    statusEl.textContent = `✓ ${json.data.city}, ${json.data.state} — ${zipTaxOverride.toFixed(3)}% ${tfL3("estimado por ZIP", "estimated by ZIP", "estimado por ZIP")}`;
    statusEl.style.color = "var(--success)";
  } catch (e) {
    zipTaxOverride = null;
    statusEl.textContent = "⚠ " + tfL3("ZIP no encontrado — usando tasa de ciudad", "ZIP not found — using city rate", "ZIP não encontrado — usando a taxa da cidade");
    statusEl.style.color = "var(--warn)";
  }
  calculate();
  if (typeof renderCart === "function") renderCart();
};

window.clearZipTax = () => {
  zipTaxOverride = null;
  const zipInput = document.getElementById("zip-input");
  const statusEl = document.getElementById("zip-status");
  if (zipInput) zipInput.value = "";
  if (statusEl) {
    statusEl.textContent = "";
  }
  calculate();
  if (typeof renderCart === "function") renderCart();
};

let cartZipTaxOverride = null;

window.lookupCartZipTax = async () => {
  const zipInput = document.getElementById("cart-zip-input");
  const statusEl = document.getElementById("cart-zip-status");
  const zip = (zipInput?.value || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    statusEl.textContent = "⚠ " + tfL3("Ingresá un ZIP de 5 dígitos", "Enter a 5-digit ZIP code", "Digite um ZIP de 5 dígitos");
    statusEl.style.color = "var(--warn)";
    return;
  }
  if (!navigator.onLine) {
    statusEl.textContent = "⚠ " + tfL3("Sin conexión — usando tasa de ciudad", "Offline — using city rate", "Sem conexão — usando a taxa da cidade");
    statusEl.style.color = "var(--warn)";
    return;
  }
  statusEl.textContent = tfL3("Buscando…", "Searching…", "Buscando…");
  statusEl.style.color = "var(--text-sub)";
  try {
    const res = await fetch(`https://salestaxzip.com/api/v1/rate/${zip}`);
    if (!res.ok) throw new Error("zip not found");
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("bad response");
    cartZipTaxOverride = validateZipTax(json.data, document.getElementById("cart-state-select")?.value);
    statusEl.textContent = `✓ ${json.data.city}, ${json.data.state} — ${cartZipTaxOverride.toFixed(3)}% ${tfL3("estimado por ZIP", "estimated by ZIP", "estimado por ZIP")}`;
    statusEl.style.color = "var(--success)";
  } catch (e) {
    cartZipTaxOverride = null;
    statusEl.textContent = "⚠ " + tfL3("ZIP no encontrado — usando tasa de ciudad", "ZIP not found — using city rate", "ZIP não encontrado — usando a taxa da cidade");
    statusEl.style.color = "var(--warn)";
  }
  if (typeof renderCart === "function") renderCart();
};

window.clearCartZipTax = () => {
  cartZipTaxOverride = null;
  const zipInput = document.getElementById("cart-zip-input");
  const statusEl = document.getElementById("cart-zip-status");
  if (zipInput) zipInput.value = "";
  if (statusEl) {
    statusEl.textContent = "";
  }
  if (typeof renderCart === "function") renderCart();
};

window.calculate = () => {
  updateTaxRuleNote();
  const price = parseFloat(document.getElementById("price").value) || 0;
  const state = document.getElementById("state-select")?.value;
  let tax;
  if (manualTaxActive) {
    const manVal = parseFloat(document.getElementById("manual-tax-input")?.value);
    tax = isNaN(manVal) ? 0 : manVal;
  } else if (zipTaxOverride !== null) {
    tax = zipTaxOverride;
  } else {
    tax = parseFloat(document.getElementById("city-select").value) || 0;
  }
  const cat = document.querySelector("#panel-individual .cat-btn.active");
  if (cat?.id === "btn-food") tax = getFoodTaxRate(state, individualFoodMode, tax, individualFoodCandy); else if (cat?.id === "btn-med") tax = getMedTaxRate(state, individualMedMode, tax); else if (cat?.id === "btn-clothing") tax = getClothingTaxRate(state, price, tax, selectedTaxCity("city-select"));
  const subtotal = price * (1 + tax / 100);
  const fmt = n => n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  [ 0, 10, 15, 20 ].forEach(p => {
    const el = document.getElementById(`val-tip-${p}`);
    if (el) el.innerText = `${fmt(subtotal * p / 100)}`;
  });
  const cv = parseFloat(document.getElementById("custom-tip-input").value) || 0;
  document.getElementById("val-tip-custom").innerText = `${fmt(subtotal * cv / 100)}`;
  document.getElementById("total-with-tax").innerText = `USD ${fmt(subtotal)}`;
  const lang = localStorage.getItem("appLang") || "es";
  document.getElementById("tax-detail").innerText = `${i18n[lang].tax_applied}: ${tax}%`;
  window._indivFinal = subtotal * (1 + currentTip / 100);
  document.getElementById("final-total").innerText = `USD ${fmt(subtotal * (1 + currentTip / 100))}`;
};

window.toggleManualTax = () => {
  manualTaxActive = !manualTaxActive;
  const lang = localStorage.getItem("appLang") || "es";
  const grp = document.getElementById("manual-tax-group");
  const btn = document.getElementById("toggle-manual-tax");
  const stateG = document.getElementById("state-select")?.closest(".input-group");
  const cityG = document.getElementById("city-select")?.closest(".input-group");
  const lblManual = document.querySelector("#manual-tax-group .slabel");
  const lblHint = document.querySelector("#manual-tax-group div");
  if (manualTaxActive) {
    if (grp) grp.style.display = "block";
    if (btn) btn.textContent = lang === "en" ? "✕ Use state/city selector" : "✕ Usar selector de estado/ciudad";
    if (lblManual) lblManual.textContent = lang === "en" ? "MANUAL TAX (%)" : "TAX MANUAL (%)";
    if (lblHint) lblHint.textContent = lang === "en" ? "Enter the tax % if your city is not listed." : "Ingresá el % de tax si no encontrás tu ciudad.";
    if (stateG) stateG.style.opacity = ".4";
    if (cityG) cityG.style.opacity = ".4";
    document.getElementById("manual-tax-input")?.focus();
  } else {
    if (grp) grp.style.display = "none";
    if (btn) btn.textContent = lang === "en" ? "✏️ Enter tax manually" : "✏️ Ingresar tax manualmente";
    if (stateG) stateG.style.opacity = "1";
    if (cityG) cityG.style.opacity = "1";
    const inp = document.getElementById("manual-tax-input");
    if (inp) inp.value = "";
    calculate();
  }
};

window.applyManualTax = () => {
  calculate();
};

window.loadCities = () => {
  const state = document.getElementById("state-select").value;
  const cs = document.getElementById("city-select");
  cs.innerHTML = "";
  (taxData[state] || []).forEach(c => {
    const o = document.createElement("option");
    o.value = c.t;
    o.text = `${c.n} (${c.t}%)`;
    cs.appendChild(o);
  });
  if (zipTaxOverride !== null) window.clearZipTax();
  calculate();
};

window.openTripModal = () => document.getElementById("tripModal").classList.add("show");

window.closeTripModal = () => document.getElementById("tripModal").classList.remove("show");

window.saveTripSettings = async () => {
  const dest = document.getElementById("input-destination").value || "Orlando";
  const date = document.getElementById("input-date").value || "2027-01-01";
  tripData = {
    destination: dest,
    date: date
  };
  try {
    localStorage.setItem("taxusa_cached_trip", JSON.stringify(tripData));
  } catch (e) {}
  if (currentUser && perfilId) {
    try {
      await setDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId), {
        trip: tripData
      }, {
        merge: true
      });
    } catch (e) {
      console.error(e);
    }
  }
  updateTripUI();
  fetchWeather(dest);
  autoSelectTaxByCity(dest);
  closeTripModal();
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

function updateTripUI() {
  const lang = localStorage.getItem("appLang") || "es";
  document.getElementById("tripLabel").innerHTML = `${esc(i18n[lang].trip_prefix)} ${esc(tripData.destination)} ${window.uiIcon ? window.uiIcon("plane", 12).replace('class="ui-ic"', 'class="ui-ic ui-lead-end"') : ""}`;
  document.getElementById("input-destination").value = tripData.destination;
  document.getElementById("input-date").value = tripData.date;
}

function updateCountdown() {
  if (!tripData.date) return;
  const diff = new Date(tripData.date + "T00:00:00").getTime() - Date.now();
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang];
  if (diff <= 0) {
    document.getElementById("timer").innerText = lang === "es" ? "¡Buen viaje!" : lang === "pt" ? "Boa viagem!" : "Safe travels!";
    return;
  }
  const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
  document.getElementById("timer").innerText = `${d}${t.d} ${h}${t.h} ${m}${t.m} ${s}${t.s}`;
}

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
  if (dd && !btn.contains(e.target)) {
    dd.classList.remove("show");
    btn.classList.remove("open");
  }
});

window.toggleSettings = () => {
  const d = document.getElementById("settingsDrawer");
  const open = d.classList.toggle("open");
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
  const hashHex = await window.createPinHash(p1);
  localStorage.setItem("taxusa_pin_hash", hashHex);
  localStorage.removeItem("taxusa_offline_pin");
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
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    showAlert(tfL3("Correo de recuperación enviado.", "Recovery email sent.", "E-mail de recuperação enviado."));
  } catch (er) {
    showAlert(er.message);
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

async function handleAuthState(user) {
  if (!user) {
    const pinHash = localStorage.getItem("taxusa_pin_hash");
    const pinEmail = localStorage.getItem("taxusa_offline_email");
    if (pinHash && pinEmail && window.taxflyOfflineUnlocked()) {
      const perfilNombre = localStorage.getItem("perfilActivoNombre");
      const emailEl = document.getElementById("userEmail");
      if (emailEl) emailEl.innerText = perfilNombre || pinEmail;
      const foto = localStorage.getItem("perfilActivoFoto") || "";
      if (foto) {
        const btn = document.getElementById("btnSettings");
        if (btn) {
          btn.style.backgroundImage = `url('${foto}')`;
          btn.innerText = "";
        }
      }
      try {
        const cachedTrip = localStorage.getItem("taxusa_cached_trip");
        if (cachedTrip) tripData = JSON.parse(cachedTrip);
      } catch (e) {}
      updateTripUI();
      autoSelectTaxByCity(tripData.destination);
      if (weatherCache && weatherCache.data) {
        const lang = localStorage.getItem("appLang") || "es";
        renderWeather(weatherCache.data, weatherCache.city, lang);
      } else {
        const wc = document.getElementById("wc-body");
        if (wc) wc.innerHTML = '<div class="wc-error">⚠️ Sin conexión — clima no disponible</div>';
      }
      return;
    }
    window.location.replace("login.html");
    return;
  }
  currentUser = user;
  perfilId = localStorage.getItem("perfilActivoId");
  perfilFoto = localStorage.getItem("perfilActivoFoto");
  const perfilNombre = localStorage.getItem("perfilActivoNombre");
  document.getElementById("userEmail").innerText = perfilNombre || user.email;
  if (!perfilId) {
    window.location.replace("profiles.html");
    return;
  }
  const img = perfilFoto || user.photoURL;
  if (img) {
    const btn = document.getElementById("btnSettings");
    btn.style.backgroundImage = `url('${img}')`;
    btn.innerText = "";
  }
  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid, "perfiles", perfilId));
    if (snap.exists() && snap.data().trip) {
      tripData = snap.data().trip;
      try {
        localStorage.setItem("taxusa_cached_trip", JSON.stringify(tripData));
      } catch (e) {}
    }
    autoSelectTaxByCity(tripData.destination);
  } catch (e) {
    console.error(e);
  }
  updateTripUI();
  fetchWeather(tripData.destination);
}

if (firebaseOk) {
  onAuthStateChanged(auth, handleAuthState);
} else {
  handleAuthState(null);
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

window.fetchWeather = async function(city) {
  const lang = localStorage.getItem("appLang") || "es";
  city = city || tripData.destination || "Orlando";
  const body = document.getElementById("wc-body");
  const lbl = document.getElementById("wc-label");
  const refreshBtn = document.querySelector(".wc-refresh");
  if (refreshBtn) refreshBtn.classList.add("spinning");
  if (!body) return;
  const now = Date.now();
  if (weatherCache.city === city && weatherCache.data && now - weatherCache.ts < 18e5) {
    renderWeather(weatherCache.data, city, lang);
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    return;
  }
  if (!navigator.onLine) {
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    if (weatherCache && weatherCache.data) {
      renderWeather(weatherCache.data, weatherCache.city, lang);
    } else {
      body.innerHTML = '<div class="wc-error">📵 Sin conexión — clima no disponible</div>';
    }
    return;
  }
  body.innerHTML = '<div class="wc-loading"><div class="wc-spinner"></div><span>' + (lang === "en" ? "Fetching weather..." : lang === "pt" ? "Obtendo clima..." : "Obteniendo clima...") + "</span></div>";
  try {
    const geoCacheKey = "shared-geo-cache::" + city.trim().toLowerCase();
    let geo = sharedCacheGet(geoCacheKey, 90 * 24 * 36e5);
    if (!geo) {
      const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1&language=" + (lang === "pt" ? "pt" : "es") + "&format=json");
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
      feelsC: Math.round((c.apparent_temperature - 32) * 5 / 9),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      windDir: WIND_DIR[Math.round(c.wind_direction_10m / 45) % 8],
      code: c.weather_code,
      displayName: displayName
    };
    weatherCache = {
      city: city,
      data: result,
      ts: Date.now()
    };
    renderWeather(result, city, lang);
  } catch (e) {
    if (refreshBtn) refreshBtn.classList.remove("spinning");
    const errTxt = lang === "en" ? "Could not load weather. Tap the refresh button to retry." : lang === "pt" ? "Não foi possível carregar o clima. Toque no botão de atualizar para tentar." : "No se pudo cargar el clima. Tocá el botón de actualizar para reintentar.";
    body.innerHTML = '<div class="wc-error">⚠️ ' + errTxt + "</div>";
  }
};

function renderWeather(r, city, lang) {
  const body = document.getElementById("wc-body");
  const lbl = document.getElementById("wc-label");
  if (!body) return;
  const wmoMap = lang === "en" ? WMO_EN : lang === "pt" ? WMO_PT : WMO;
  const desc = wmoMap[r.code] || wmoMap[0];
  const icon = WI[r.code] || "🌡️";
  const feelsLbl = lang === "en" ? "Feels like" : lang === "pt" ? "Sensação" : "Sensación";
  const humLbl = lang === "en" ? "Humidity" : lang === "pt" ? "Umidade" : "Humedad";
  const windLbl = lang === "en" ? "Wind" : lang === "pt" ? "Vento" : "Viento";
  const lblTxt = lang === "en" ? "Weather at destination" : lang === "pt" ? "Clima no destino" : "Clima en destino";
  if (lbl) lbl.textContent = lblTxt;
  body.innerHTML = '<div class="wc-main">' + '<div class="wc-icon">' + icon + "</div>" + '<div class="wc-info">' + '<div class="wc-temp">' + r.tempF + "°<span>F / " + r.tempC + "°C</span></div>" + '<div class="wc-city">' + r.displayName + "</div>" + '<div class="wc-desc">' + desc + "</div>" + "</div>" + "</div>" + '<div class="wc-extras">' + '<div class="wc-extra"><span>🌡️</span><span>' + feelsLbl + ": " + r.feelsF + "°F</span></div>" + '<div class="wc-extra"><span>💧</span><span>' + humLbl + ": " + r.humidity + "%</span></div>" + '<div class="wc-extra"><span>💨</span><span>' + windLbl + ": " + r.wind + " mph " + r.windDir + "</span></div>" + "</div>";
}

let splitPeople = 2;

let splitTipPct = 0;

let splitOpen = false;

window.toggleSplit = () => {
  splitOpen = !splitOpen;
  const body = document.getElementById("split-body");
  const lbl = document.getElementById("split-toggle-lbl");
  const lang = localStorage.getItem("appLang") || "es";
  body.classList.toggle("open", splitOpen);
  if (lbl) lbl.innerHTML = splitOpen ? "▲ <span>" + (i18n[lang].split_close || "OCULTAR") + "</span>" : "▼ <span>" + (i18n[lang].split_open || "VER") + "</span>";
};

window.changePeople = delta => {
  splitPeople = Math.max(1, Math.min(20, splitPeople + delta));
  const el = document.getElementById("people-count");
  if (el) el.textContent = splitPeople;
  calcSplit();
};

window.setSplitTip = pct => {
  splitTipPct = pct;
  document.querySelectorAll(".split-tip-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("stip-" + pct);
  if (btn) btn.classList.add("active");
  calcSplit();
};

window.calcSplit = () => {
  const raw = parseFloat(document.getElementById("split-price")?.value) || 0;
  const res = document.getElementById("split-result");
  if (!res) return;
  if (raw <= 0) {
    res.style.display = "none";
    return;
  }
  const state = document.getElementById("state-select")?.value;
  const taxPct = manualTaxActive ? parseFloat(document.getElementById("manual-tax-input")?.value) || 0 : zipTaxOverride !== null ? zipTaxOverride : parseFloat(document.getElementById("city-select")?.value) || 0;
  const cat = document.querySelector("#panel-individual .cat-btn.active")?.id;
  let effectiveTax = taxPct;
  if (cat === "btn-food") effectiveTax = getFoodTaxRate(state, individualFoodMode, taxPct, individualFoodCandy); else if (cat === "btn-med") effectiveTax = getMedTaxRate(state, individualMedMode, taxPct); else if (cat === "btn-clothing") effectiveTax = getClothingTaxRate(state, raw, taxPct);
  const tax = raw * effectiveTax / 100;
  const subtotal = raw + tax;
  const tip = subtotal * splitTipPct / 100;
  const total = subtotal + tip;
  const perPerson = total / splitPeople;
  const fmt = n => n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  document.getElementById("split-per-person").textContent = "$" + fmt(perPerson);
  document.getElementById("split-total-full").textContent = "$" + fmt(total);
  document.getElementById("split-subtotal-disp").textContent = "$" + fmt(raw);
  document.getElementById("split-tax-disp").textContent = "$" + fmt(tax);
  document.getElementById("split-tip-disp").textContent = "$" + fmt(tip);
  res.style.display = "block";
};

let tipOpen = true;

window.toggleTip = () => {
  tipOpen = !tipOpen;
  const body = document.getElementById("tip-body");
  const lbl = document.getElementById("tip-toggle-lbl");
  const lang = localStorage.getItem("appLang") || "es";
  body.classList.toggle("open", tipOpen);
  if (lbl) lbl.textContent = tipOpen ? lang === "en" ? "▲ HIDE" : lang === "pt" ? "▲ OCULTAR" : "▲ OCULTAR" : lang === "en" ? "▼ SHOW" : lang === "pt" ? "▼ VER" : "▼ VER";
};

function updateTipBadge() {
  const badge = document.getElementById("tip-preview-badge");
  if (!badge) return;
  const custom = parseFloat(document.getElementById("custom-tip-input")?.value);
  badge.textContent = !isNaN(custom) && custom > 0 ? custom + "%" : currentTip + "%";
}

const CITY_ALIASES = {
  "nueva york": "NYC",
  "new york": "NYC",
  "nueva york city": "NYC",
  ny: "NYC",
  nyc: "NYC",
  "new york city": "NYC",
  manhattan: "NYC",
  brooklyn: "NYC",
  queens: "NYC",
  bronx: "NYC",
  "nova york": "NYC",
  buffalo: "Buffalo",
  "los angeles": "Los Angeles",
  "los ángeles": "Los Angeles",
  la: "Los Angeles",
  "los angeles ca": "Los Angeles",
  "los ángeles ca": "Los Angeles",
  "san francisco": "San Francisco",
  sf: "San Francisco",
  "san francisco ca": "San Francisco",
  "san diego": "San Diego",
  miami: "Miami",
  "miami fl": "Miami",
  orlando: "Orlando",
  "orlando fl": "Orlando",
  tampa: "Tampa",
  kissimmee: "Kissimmee",
  chicago: "Chicago",
  "chicago il": "Chicago",
  houston: "Houston",
  "houston tx": "Houston",
  dallas: "Dallas",
  "dallas tx": "Dallas",
  austin: "Austin",
  "austin tx": "Austin",
  "las vegas": "Las Vegas",
  vegas: "Las Vegas",
  "las vegas nv": "Las Vegas",
  seattle: "Seattle",
  "seattle wa": "Seattle",
  boston: "Boston",
  "boston ma": "Boston",
  atlanta: "Atlanta",
  "atlanta ga": "Atlanta",
  denver: "Denver",
  "denver co": "Denver",
  phoenix: "Phoenix",
  "phoenix az": "Phoenix",
  nashville: "Nashville",
  "nashville tn": "Nashville",
  "nueva orleans": "New Orleans",
  "new orleans": "New Orleans",
  "new orleans la": "New Orleans",
  filadelfia: "Philadelphia",
  philadelphia: "Philadelphia",
  philly: "Philadelphia",
  "philadelphia pa": "Philadelphia",
  minneapolis: "Minneapolis",
  "minneapolis mn": "Minneapolis",
  portland: "Portland",
  "portland me": "Portland",
  "salt lake city": "Salt Lake City",
  slc: "Salt Lake City",
  "salt lake": "Salt Lake City",
  "salt lake city ut": "Salt Lake City",
  detroit: "Detroit",
  "detroit mi": "Detroit",
  milwaukee: "Milwaukee",
  "milwaukee wi": "Milwaukee",
  louisville: "Louisville",
  "louisville ky": "Louisville",
  baltimore: "Baltimore",
  "baltimore md": "Baltimore",
  charlotte: "Charlotte",
  "charlotte nc": "Charlotte",
  columbus: "Columbus",
  "columbus oh": "Columbus",
  indianapolis: "New Castle",
  "indianapolis in": "New Castle",
  "oklahoma city": "Oklahoma City",
  okc: "Oklahoma City",
  albuquerque: "Albuquerque",
  "albuquerque nm": "Albuquerque",
  "jersey city": "Jersey City",
  "new jersey": "Jersey City",
  newark: "Jersey City",
  "nueva jersey": "Jersey City",
  "washington dc": "Washington, DC",
  "washington d.c.": "Washington, DC",
  dc: "Washington, DC",
  "virginia beach": "Virginia Beach",
  honolulu: "Honolulu",
  hawaii: "Honolulu",
  "hawái": "Honolulu",
  omaha: "Omaha",
  "omaha ne": "Omaha",
  "des moines": "Des Moines",
  "des moines ia": "Des Moines",
  "st louis": "St. Louis",
  "saint louis": "St. Louis",
  "san luis": "St. Louis",
  "st. louis": "St. Louis",
  wichita: "Wichita",
  "kansas city": "Wichita",
  "little rock": "Little Rock",
  "little rock ar": "Little Rock",
  birmingham: "Birmingham",
  "birmingham al": "Birmingham",
  jackson: "Jackson",
  "jackson ms": "Jackson",
  "sioux falls": "Sioux Falls",
  "sioux falls sd": "Sioux Falls",
  fargo: "Fargo",
  "fargo nd": "Fargo",
  cheyenne: "Cheyenne",
  "cheyenne wy": "Cheyenne",
  boise: "Boise",
  "boise id": "Boise",
  bridgeport: "Bridgeport",
  "charleston wv": "Bridgeport",
  providence: "Providence",
  "providence ri": "Providence",
  burlington: "Burlington",
  "burlington vt": "Burlington",
  stamford: "Stamford",
  connecticut: "Stamford",
  hartford: "Stamford",
  "charleston sc": "Charleston",
  charleston: "Charleston",
  alaska: "Sin Tax",
  anchorage: "Sin Tax",
  delaware: "Sin Tax",
  wilmington: "Sin Tax",
  montana: "Sin Tax",
  billings: "Sin Tax",
  "new hampshire": "Sin Tax",
  "nueva hampshire": "Sin Tax",
  "manchester nh": "Sin Tax",
  oregon: "Sin Tax",
  "oregón": "Sin Tax",
  "portland or": "Sin Tax",
  "tampa fl": "Tampa",
  clearwater: "Tampa",
  "st. petersburg": "Tampa",
  "st petersburg": "Tampa",
  "fort lauderdale": "Miami",
  "fort lauderdale fl": "Miami",
  "fort worth": "Dallas",
  "fort worth tx": "Dallas",
  "san antonio": "Houston",
  "san antonio tx": "Houston",
  anaheim: "Los Angeles",
  "long beach": "Los Angeles",
  "santa monica": "Los Angeles",
  pasadena: "Los Angeles",
  burbank: "Los Angeles",
  "san jose": "San Francisco",
  "san josé": "San Francisco",
  "silicon valley": "San Francisco",
  oakland: "San Francisco",
  sacramento: "Los Angeles",
  scottsdale: "Phoenix",
  tempe: "Phoenix",
  mesa: "Phoenix",
  chandler: "Phoenix",
  tucson: "Phoenix",
  henderson: "Las Vegas",
  "north las vegas": "Las Vegas",
  reno: "Las Vegas",
  cincinnati: "Columbus",
  cleveland: "Columbus",
  akron: "Columbus",
  pittsburgh: "Philadelphia",
  "pittsburgh pa": "Philadelphia",
  raleigh: "Charlotte",
  durham: "Charlotte",
  "chapel hill": "Charlotte",
  memphis: "Nashville",
  "memphis tn": "Nashville",
  knoxville: "Nashville",
  richmond: "Virginia Beach",
  "richmond va": "Virginia Beach",
  "st paul": "Minneapolis",
  "saint paul": "Minneapolis",
  "st. paul": "Minneapolis",
  "kansas city mo": "St. Louis",
  savannah: "Atlanta",
  "savannah ga": "Atlanta",
  jacksonville: "Jacksonville",
  "jacksonville fl": "Orlando",
  tallahassee: "Tallahassee",
  "newark nj": "Jersey City",
  "new haven": "Stamford",
  "hartford ct": "Stamford"
};

const STATE_ALIASES = {
  alabama: "Alabama",
  al: "Alabama",
  alaska: "Alaska",
  ak: "Alaska",
  arizona: "Arizona",
  az: "Arizona",
  arkansas: "Arkansas",
  ar: "Arkansas",
  california: "California",
  ca: "California",
  cali: "California",
  colorado: "Colorado",
  co: "Colorado",
  connecticut: "Connecticut",
  ct: "Connecticut",
  delaware: "Delaware",
  de: "Delaware",
  florida: "Florida",
  fl: "Florida",
  georgia: "Georgia",
  ga: "Georgia",
  hawaii: "Hawaii",
  hi: "Hawaii",
  "hawái": "Hawaii",
  idaho: "Idaho",
  id: "Idaho",
  illinois: "Illinois",
  il: "Illinois",
  indiana: "Indiana",
  in: "Indiana",
  iowa: "Iowa",
  ia: "Iowa",
  kansas: "Kansas",
  ks: "Kansas",
  kentucky: "Kentucky",
  ky: "Kentucky",
  louisiana: "Louisiana",
  la: "Louisiana",
  maine: "Maine",
  me: "Maine",
  maryland: "Maryland",
  md: "Maryland",
  massachusetts: "Massachusetts",
  ma: "Massachusetts",
  michigan: "Michigan",
  mi: "Michigan",
  minnesota: "Minnesota",
  mn: "Minnesota",
  mississippi: "Mississippi",
  ms: "Mississippi",
  missouri: "Missouri",
  mo: "Missouri",
  montana: "Montana",
  mt: "Montana",
  nebraska: "Nebraska",
  ne: "Nebraska",
  nevada: "Nevada",
  nv: "Nevada",
  "new hampshire": "New Hampshire",
  nh: "New Hampshire",
  "nueva hampshire": "New Hampshire",
  "new jersey": "New Jersey",
  nj: "New Jersey",
  "nueva jersey": "New Jersey",
  "new mexico": "New Mexico",
  nm: "New Mexico",
  "nuevo méxico": "New Mexico",
  "nuevo mexico": "New Mexico",
  "new york": "New York",
  ny: "New York",
  "nueva york state": "New York",
  "north carolina": "North Carolina",
  nc: "North Carolina",
  "carolina del norte": "North Carolina",
  "north dakota": "North Dakota",
  nd: "North Dakota",
  "dakota del norte": "North Dakota",
  ohio: "Ohio",
  oh: "Ohio",
  oklahoma: "Oklahoma",
  ok: "Oklahoma",
  oregon: "Oregon",
  or: "Oregon",
  "oregón": "Oregon",
  pennsylvania: "Pennsylvania",
  pa: "Pennsylvania",
  pensilvania: "Pennsylvania",
  "rhode island": "Rhode Island",
  ri: "Rhode Island",
  "south carolina": "South Carolina",
  sc: "South Carolina",
  "carolina del sur": "South Carolina",
  "south dakota": "South Dakota",
  sd: "South Dakota",
  "dakota del sur": "South Dakota",
  tennessee: "Tennessee",
  tn: "Tennessee",
  texas: "Texas",
  tx: "Texas",
  utah: "Utah",
  ut: "Utah",
  vermont: "Vermont",
  vt: "Vermont",
  virginia: "Virginia",
  va: "Virginia",
  washington: "Washington",
  wa: "Washington",
  "west virginia": "West Virginia",
  wv: "West Virginia",
  "virginia occidental": "West Virginia",
  wisconsin: "Wisconsin",
  wi: "Wisconsin",
  wyoming: "Wyoming",
  wy: "Wyoming"
};

const CITY_TO_TAX = {};

for (const [state, cities] of Object.entries(taxData)) {
  for (const city of cities) {
    CITY_TO_TAX[city.n.toLowerCase()] = {
      state: state,
      cityName: city.n
    };
  }
}

function resolveCityAlias(dest) {
  const aliasCity = CITY_ALIASES[dest];
  if (aliasCity) {
    const entry = CITY_TO_TAX[aliasCity.toLowerCase()];
    if (entry) return entry;
  }
  if (CITY_TO_TAX[dest]) return CITY_TO_TAX[dest];
  const aliasState = STATE_ALIASES[dest];
  if (aliasState && taxData[aliasState]) {
    const firstCity = taxData[aliasState][0];
    return {
      state: aliasState,
      cityName: firstCity.n
    };
  }
  for (const [key, val] of Object.entries(CITY_TO_TAX)) {
    if (dest.includes(key) || key.includes(dest)) return val;
  }
  return null;
}

window.saveManualCityChoice = (stateId = "state-select", cityId = "city-select") => {
  const stateSelect = document.getElementById(stateId);
  const citySelect = document.getElementById(cityId);
  if (!stateSelect || !citySelect || !citySelect.value) return;
  const cityName = citySelect.options[citySelect.selectedIndex]?.text || "";
  try {
    localStorage.setItem("taxusa_manual_city", JSON.stringify({
      state: stateSelect.value,
      cityName
    }));
  } catch (e) {}
};

window.autoSelectTaxByCity = destination => {
  try {
    if (localStorage.getItem("taxusa_manual_city")) return;
  } catch (e) {}
  if (!destination) return;
  const dest = destination.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const destNorm = dest;
  let match = null;
  for (const [alias, target] of Object.entries(CITY_ALIASES)) {
    const aliasNorm = alias.normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (aliasNorm === destNorm) {
      match = CITY_TO_TAX[target.toLowerCase()];
      if (match) break;
    }
  }
  if (!match) {
    for (const [alias, stateName] of Object.entries(STATE_ALIASES)) {
      const aliasNorm = alias.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (aliasNorm === destNorm && taxData[stateName]) {
        const firstCity = taxData[stateName][0];
        match = {
          state: stateName,
          cityName: firstCity.n
        };
        break;
      }
    }
  }
  if (!match) match = CITY_TO_TAX[destNorm];
  if (!match) {
    for (const [key, val] of Object.entries(CITY_TO_TAX)) {
      const keyNorm = key.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (destNorm.includes(keyNorm) || keyNorm.includes(destNorm)) {
        match = val;
        break;
      }
    }
  }
  if (!match) return;
  const stateSelect = document.getElementById("state-select");
  const citySelect = document.getElementById("city-select");
  if (!stateSelect || !citySelect) return;
  stateSelect.value = match.state;
  loadCities();
  for (let i = 0; i < citySelect.options.length; i++) {
    if (citySelect.options[i].text.startsWith(match.cityName)) {
      citySelect.selectedIndex = i;
      break;
    }
  }
  calculate();
  const cartStateSelect = document.getElementById("cart-state-select");
  const cartCitySelect = document.getElementById("cart-city-select");
  if (cartStateSelect && cartCitySelect) {
    cartStateSelect.value = match.state;
    loadCartCities();
    for (let i = 0; i < cartCitySelect.options.length; i++) {
      if (cartCitySelect.options[i].text.startsWith(match.cityName)) {
        cartCitySelect.selectedIndex = i;
        break;
      }
    }
    renderCart();
  }
};

const _origCalc = window.calculate;

window.calculate = () => {
  _origCalc && _origCalc();
  const mainPrice = document.getElementById("price")?.value;
  const splitInput = document.getElementById("split-price");
  if (splitInput && mainPrice && !splitInput.value) {}
  calcSplit();
};

window.onload = () => {
  const ss = document.getElementById("state-select");
  Object.keys(taxData).sort().forEach(s => {
    const o = document.createElement("option");
    o.value = s;
    o.text = s;
    if (s === "Florida") o.selected = true;
    ss.appendChild(o);
  });
  loadCities();
  const css = document.getElementById("cart-state-select");
  if (css) {
    Object.keys(taxData).sort().forEach(s => {
      const o = document.createElement("option");
      o.value = s;
      o.text = s;
      if (s === "Florida") o.selected = true;
      css.appendChild(o);
    });
    loadCartCities();
  }
  try {
    const savedCity = JSON.parse(localStorage.getItem("taxusa_manual_city") || "null");
    if (savedCity && taxData[savedCity.state]) {
      ss.value = savedCity.state;
      loadCities();
      const citySelect = document.getElementById("city-select");
      for (let i = 0; i < citySelect.options.length; i++) {
        if (citySelect.options[i].text === savedCity.cityName) {
          citySelect.selectedIndex = i;
          break;
        }
      }
      calculate();
      if (css) {
        css.value = savedCity.state;
        loadCartCities();
        const cartCitySelect = document.getElementById("cart-city-select");
        for (let i = 0; i < cartCitySelect.options.length; i++) {
          if (cartCitySelect.options[i].text === savedCity.cityName) {
            cartCitySelect.selectedIndex = i;
            break;
          }
        }
        renderCart();
      }
    }
  } catch (e) {}
  setInterval(updateCountdown, 1e3);
  const lang = localStorage.getItem("appLang") || "es";
  window.changeLanguage(lang);
  const tc = document.getElementById("tip-content");
  if (tc) tc.innerText = econTips[lang][tipIndex];
  tipTimer = setInterval(window.cambiarConsejo, 8e3);
};

window.switchCalcTab = tab => {
  const tabIndividual = document.getElementById("tab-individual");
  const tabCart = document.getElementById("tab-cart");
  const panelIndividual = document.getElementById("panel-individual");
  const panelCart = document.getElementById("panel-cart");
  if (tab === "cart") {
    tabCart.classList.add("active");
    tabIndividual.classList.remove("active");
    panelCart.classList.add("active");
    panelIndividual.classList.remove("active");
    renderCart();
  } else {
    tabIndividual.classList.add("active");
    tabCart.classList.remove("active");
    panelIndividual.classList.add("active");
    panelCart.classList.remove("active");
  }
};

let cartItems = [];

let cartCurrentCategory = "general";

let cartFoodMode = "grocery";

let cartFoodCandy = false;

let cartMedMode = "otc";

let cartManualTaxActive = false;

const CART_CAT_META = {
  general: {
    icon: "🛍️",
    i18nKey: "cat_general"
  },
  tech: {
    icon: "💻",
    i18nKey: "cat_tech"
  },
  food: {
    icon: "🍎",
    i18nKey: "cat_food"
  },
  med: {
    icon: "💊",
    i18nKey: "cat_med"
  },
  clothing: {
    icon: "👕",
    i18nKey: "cat_clothing"
  }
};

function getCartItemTaxRate(item, state, localRate) {
  if (item.category === "food") return getFoodTaxRate(state, item.mode, localRate, item.isCandy);
  if (item.category === "med") return getMedTaxRate(state, item.mode, localRate);
  if (item.category === "clothing") return getClothingTaxRate(state, item.price, localRate, selectedTaxCity("cart-city-select"));
  return localRate;
}

window.setCartCategory = cat => {
  cartCurrentCategory = cat;
  document.querySelectorAll("#panel-cart .cat-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("cart-btn-" + cat).classList.add("active");
  document.getElementById("cart-food-mode-grid")?.classList.toggle("show", cat === "food");
  document.getElementById("cart-food-candy-grid")?.classList.toggle("show", cat === "food" && cartFoodMode === "grocery");
  document.getElementById("cart-med-mode-grid")?.classList.toggle("show", cat === "med");
};

window.setCartFoodMode = mode => {
  cartFoodMode = mode;
  document.getElementById("cart-foodmode-prepared")?.classList.toggle("active", mode === "prepared");
  document.getElementById("cart-foodmode-grocery")?.classList.toggle("active", mode === "grocery");
  document.getElementById("cart-food-candy-grid")?.classList.toggle("show", mode === "grocery");
};

window.setCartFoodCandy = isCandy => {
  cartFoodCandy = isCandy;
  document.getElementById("cart-foodcandy-no")?.classList.toggle("active", !isCandy);
  document.getElementById("cart-foodcandy-yes")?.classList.toggle("active", isCandy);
};

window.setCartMedMode = mode => {
  cartMedMode = mode;
  document.getElementById("cart-medmode-otc")?.classList.toggle("active", mode === "otc");
  document.getElementById("cart-medmode-rx")?.classList.toggle("active", mode === "prescription");
  document.getElementById("cart-medmode-eligible")?.classList.toggle("active", mode === "eligible_otc");
};

window.loadCartCities = () => {
  const state = document.getElementById("cart-state-select").value;
  const cs = document.getElementById("cart-city-select");
  cs.innerHTML = "";
  (taxData[state] || []).forEach(c => {
    const o = document.createElement("option");
    o.value = c.t;
    o.text = `${c.n} (${c.t}%)`;
    cs.appendChild(o);
  });
  if (cartZipTaxOverride !== null) window.clearCartZipTax();
  renderCart();
};

window.toggleCartManualTax = () => {
  cartManualTaxActive = !cartManualTaxActive;
  const lang = localStorage.getItem("appLang") || "es";
  const grp = document.getElementById("cart-manual-tax-group");
  const btn = document.getElementById("cart-toggle-manual-tax");
  const stateG = document.getElementById("cart-state-select")?.closest(".input-group");
  const cityG = document.getElementById("cart-city-select")?.closest(".input-group");
  if (cartManualTaxActive) {
    if (grp) grp.style.display = "block";
    if (btn) btn.innerHTML = lang === "en" ? "✕ Use state/city selector" : lang === "pt" ? "✕ Usar seletor de estado/cidade" : "✕ Usar selector de estado/ciudad";
    if (stateG) stateG.style.opacity = ".4";
    if (cityG) cityG.style.opacity = ".4";
    document.getElementById("cart-manual-tax-input")?.focus();
  } else {
    if (grp) grp.style.display = "none";
    if (btn) btn.innerHTML = '✏️ <span data-i18n="btn_manual_tax">' + (i18n[lang].btn_manual_tax || "Ingresar tax manualmente") + "</span>";
    if (stateG) stateG.style.opacity = "1";
    if (cityG) cityG.style.opacity = "1";
    const inp = document.getElementById("cart-manual-tax-input");
    if (inp) inp.value = "";
  }
  renderCart();
};

function getCurrentCartTaxRate() {
  if (cartManualTaxActive) {
    const v = parseFloat(document.getElementById("cart-manual-tax-input")?.value);
    return isNaN(v) ? 0 : v;
  }
  if (cartZipTaxOverride !== null) return cartZipTaxOverride;
  return parseFloat(document.getElementById("cart-city-select")?.value) || 0;
}

window.addCartItem = () => {
  const input = document.getElementById("cart-price-input");
  const price = parseFloat(input.value);
  if (isNaN(price) || price <= 0) {
    input.focus();
    return;
  }
  const mode = cartCurrentCategory === "food" ? cartFoodMode : cartCurrentCategory === "med" ? cartMedMode : null;
  const isCandy = cartCurrentCategory === "food" && cartFoodMode === "grocery" ? cartFoodCandy : false;
  cartItems.push({
    id: Date.now() + Math.random(),
    price: price,
    category: cartCurrentCategory,
    mode: mode,
    isCandy: isCandy
  });
  input.value = "";
  renderCart();
  input.focus();
};

window.removeCartItem = id => {
  const idx = cartItems.findIndex(it => it.id === id);
  if (idx < 0) return;
  const item = cartItems[idx];
  const lang = localStorage.getItem("appLang") || "es";
  const msgs = { es: "Ítem eliminado", en: "Item removed", pt: "Item removido" };
  tfDeleteWithUndo({
    message: msgs[lang] || msgs.es,
    remove: () => { cartItems = cartItems.filter(it => it.id !== id); renderCart(); },
    restore: () => { if (!cartItems.some(it => it.id === id)) cartItems.splice(Math.min(idx, cartItems.length), 0, item); renderCart(); },
    commit: () => {}
  });
};

window.clearCart = () => {
  if (!cartItems.length) return;
  const prev = cartItems;
  const lang = localStorage.getItem("appLang") || "es";
  const msgs = { es: "Carrito vaciado", en: "Cart cleared", pt: "Carrinho esvaziado" };
  tfDeleteWithUndo({
    message: msgs[lang] || msgs.es,
    remove: () => { cartItems = []; renderCart(); },
    restore: () => { cartItems = prev; renderCart(); },
    commit: () => {}
  });
};

function renderCart() {
  updateTaxRuleNote();
  const list = document.getElementById("cart-list");
  if (!list) return;
  const summary = document.getElementById("cart-summary");
  const actions = document.getElementById("cart-actions");
  const fmt = n => n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const lang = localStorage.getItem("appLang") || "es";
  if (!cartItems.length) {
    list.innerHTML = `<div class="cart-empty" id="cart-empty">${i18n[lang].cart_empty}</div>`;
    if (summary) summary.style.display = "none";
    if (actions) actions.style.display = "none";
    return;
  }
  const state = document.getElementById("cart-state-select")?.value;
  const localRate = getCurrentCartTaxRate();
  list.innerHTML = cartItems.map(it => {
    const meta = CART_CAT_META[it.category] || CART_CAT_META.general;
    const catLabel = it.isCandy ? i18n[lang].food_candy || "Golosina" : i18n[lang][meta.i18nKey] || it.category;
    const catIcon = it.isCandy ? "🍬" : meta.icon;
    const itemRate = getCartItemTaxRate(it, state, localRate);
    const exempt = itemRate === 0;
    return `\n        <div class="cart-item">\n            <div class="cart-item-info">\n                <span class="cart-item-price">${fmt(it.price)}</span>\n                <span class="cart-item-tag" style="${exempt ? "" : "color:var(--text-dim);background:var(--input-bg);"}">${catIcon} ${catLabel}${exempt ? " · " + i18n[lang].cart_exempt : ` · ${itemRate}%`}</span>\n            </div>\n            <button class="cart-item-del" onclick="removeCartItem(${it.id})">✕</button>\n        </div>`;
  }).join("");
  const subtotal = cartItems.reduce((s, it) => s + it.price, 0);
  const taxAmt = cartItems.reduce((s, it) => s + it.price * getCartItemTaxRate(it, state, localRate) / 100, 0);
  const total = subtotal + taxAmt;
  const blendedPct = subtotal > 0 ? taxAmt / subtotal * 100 : 0;
  document.getElementById("cart-subtotal").innerText = `${fmt(subtotal)}`;
  document.getElementById("cart-tax-lbl").innerText = `${i18n[lang].cart_tax} (~${blendedPct.toFixed(2)}%)`;
  document.getElementById("cart-tax-amt").innerText = `${fmt(taxAmt)}`;
  document.getElementById("cart-total").innerText = `${fmt(total)}`;
  if (summary) summary.style.display = "block";
  if (actions) actions.style.display = "flex";
}

window.clearIndividual = () => {
  const priceEl = document.getElementById("price");
  if (priceEl) priceEl.value = "";
  const tipEl = document.getElementById("custom-tip-input");
  if (tipEl) tipEl.value = "";
  calculate();
};

window.saveIndividualAsExpense = async () => {
  const lang = localStorage.getItem("appLang") || "es";
  const total = Math.round((window._indivFinal || 0) * 100) / 100;
  const L = (es, en, pt) => ({ es, en, pt })[lang] || es;
  if (!(total > 0)) {
    const m = L("Ingresá un precio para guardar el gasto.", "Enter a price to save the expense.", "Informe um preço para salvar o gasto.");
    if (window.showAlert) window.showAlert(m); else if (window.tfToast) window.tfToast(m);
    return;
  }
  const promptMsg = L("¿Qué compraste? (nombre del gasto)", "What did you buy? (expense name)", "O que você comprou? (nome do gasto)");
  const nombre = window.showPrompt ? await window.showPrompt(promptMsg, "") : prompt(promptMsg, "");
  if (!nombre || !nombre.trim()) return;
  const activeId = document.querySelector("#panel-individual .cat-btn.active")?.id;
  const catMap = {
    "btn-general": "🛍️ Compras",
    "btn-tech": "🛍️ Compras",
    "btn-food": "🍔 Comida",
    "btn-med": "💊 Farmacia",
    "btn-clothing": "👟 Ropa"
  };
  const gastoData = {
    nombre: nombre.trim(),
    valor: total,
    cat: catMap[activeId] || "🛍️ Compras",
    fecha: Date.now(),
    thumb: "",
    tripId: currentUser && perfilId ? window.TripContext.assign(currentUser.uid, perfilId) : "orlando"
  };
  try {
    if (firebaseOk && currentUser && perfilId && navigator.onLine) {
      await addDoc(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos"), gastoData);
    } else {
      const pid = perfilId || "default";
      const key = "taxusa_gastos_pending_" + pid;
      let pending = [];
      try {
        pending = JSON.parse(localStorage.getItem(key) || "[]");
      } catch (e) {
        pending = [];
      }
      pending.push({ type: "add", data: gastoData, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(pending));
    }
    const fmt2 = n => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const ok = L(`Guardado en Gastos: ${fmt2(total)} (${gastoData.nombre}).`, `Saved to Expenses: ${fmt2(total)} (${gastoData.nombre}).`, `Salvo em Gastos: ${fmt2(total)} (${gastoData.nombre}).`);
    if (window.showAlert) window.showAlert(ok); else if (window.tfToast) window.tfToast(ok);
    const priceEl = document.getElementById("price");
    if (priceEl) priceEl.value = "";
    calculate();
  } catch (e) {
    const err = L("No se pudo guardar el gasto.", "Could not save the expense.", "Não foi possível salvar o gasto.");
    if (window.showAlert) window.showAlert(err); else if (window.tfToast) window.tfToast(err);
  }
};

window.saveCartAsExpense = async () => {
  if (!cartItems.length) return;
  const lang = localStorage.getItem("appLang") || "es";
  const promptMsgs = {
    es: "¿En qué local hiciste la compra?",
    en: "Which store did you shop at?",
    pt: "Em qual loja você comprou?"
  };
  const store = window.showPrompt ? await window.showPrompt(promptMsgs[lang] || promptMsgs.es, "") : prompt(promptMsgs[lang] || promptMsgs.es, "");
  if (!store) return;
  const state = document.getElementById("cart-state-select")?.value;
  const localRate = getCurrentCartTaxRate();
  const subtotal = cartItems.reduce((s, it) => s + it.price, 0);
  const taxAmt = cartItems.reduce((s, it) => s + it.price * getCartItemTaxRate(it, state, localRate) / 100, 0);
  const total = parseFloat((subtotal + taxAmt).toFixed(2));
  const fmt = n => n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const gastoData = {
    nombre: store,
    valor: total,
    cat: "🍔 Comida",
    fecha: Date.now(),
    thumb: "",
    tripId: currentUser && perfilId ? window.TripContext.assign(currentUser.uid, perfilId) : "orlando"
  };
  try {
    if (firebaseOk && currentUser && perfilId && navigator.onLine) {
      await addDoc(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "gastos"), gastoData);
    } else {
      const pid = perfilId || "default";
      const key = "taxusa_gastos_pending_" + pid;
      let pending = [];
      try {
        pending = JSON.parse(localStorage.getItem(key) || "[]");
      } catch (e) {
        pending = [];
      }
      pending.push({
        type: "add",
        data: gastoData,
        ts: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(pending));
    }
    const okMsgs = {
      es: `Guardado en Gastos: ${fmt(total)} en ${store}.`,
      en: `Saved to Expenses: ${fmt(total)} at ${store}.`,
      pt: `Salvo em Gastos: ${fmt(total)} em ${store}.`
    };
    if (window.showAlert) window.showAlert(okMsgs[lang] || okMsgs.es); else if (window.tfToast) window.tfToast(okMsgs[lang] || okMsgs.es);
    cartItems = [];
    renderCart();
  } catch (e) {
    const errMsgs = {
      es: "No se pudo guardar el gasto.",
      en: "Could not save the expense.",
      pt: "Não foi possível salvar o gasto."
    };
    if (window.showAlert) window.showAlert(errMsgs[lang] || errMsgs.es); else if (window.tfToast) window.tfToast(errMsgs[lang] || errMsgs.es);
  }
};

const _origCalcForCart = window.calculate;

window.calculate = () => {
  _origCalcForCart && _origCalcForCart();
  renderCart();
};

const MED_DATA = {
  er: {
    items: {
      es: [ {
        name: "Visita a Urgencias (nivel bajo)",
        detail: "Revisión simple, sin estudios (CPT 99281-99282) — fee de instalación incluido",
        range: "$800 – $1,900"
      }, {
        name: "Visita a Urgencias (nivel medio)",
        detail: "Examen + análisis de sangre básico (CPT 99283-99284)",
        range: "$1,900 – $3,500"
      }, {
        name: "Visita a Urgencias (nivel alto)",
        detail: "Múltiples estudios, observación (CPT 99285) — caso típico",
        range: "$3,500 – $8,000"
      }, {
        name: "Radiografía simple (tórax/tobillo)",
        detail: "Sin contraste — precio por imagen, cargo aparte del fee de sala",
        range: "$300 – $900"
      }, {
        name: "TC / TAC (tomografía computada)",
        detail: "Abdomen o tórax sin contraste — uno de los cargos que más infla la factura",
        range: "$1,500 – $5,000"
      }, {
        name: "Sutura de herida simple",
        detail: "Hasta 5 cm sin complicaciones (CPT 12001) — más fee de sala ER",
        range: "$500 – $1,500"
      }, {
        name: "Traslado en ambulancia",
        detail: "Promedio nacional 2025, trayecto corto — factura por separado",
        range: "$1,300 – $2,800"
      } ],
      en: [ {
        name: "ER Visit (low level)",
        detail: "Simple check, no procedures (CPT 99281-99282) — facility fee included",
        range: "$800 – $1,900"
      }, {
        name: "ER Visit (moderate)",
        detail: "Exam + basic bloodwork (CPT 99283-99284)",
        range: "$1,900 – $3,500"
      }, {
        name: "ER Visit (high complexity)",
        detail: "Multiple tests, observation (CPT 99285) — typical case",
        range: "$3,500 – $8,000"
      }, {
        name: "X-Ray (chest/ankle)",
        detail: "No contrast — per image, billed separately from ER facility fee",
        range: "$300 – $900"
      }, {
        name: "CT Scan",
        detail: "Abdomen or chest, no contrast — one of the biggest bill inflators",
        range: "$1,500 – $5,000"
      }, {
        name: "Laceration repair (simple)",
        detail: "Up to 5 cm, no complications (CPT 12001) — plus ER facility fee",
        range: "$500 – $1,500"
      }, {
        name: "Ambulance transport",
        detail: "2025 national avg, short distance — billed separately",
        range: "$1,300 – $2,800"
      } ],
      pt: [ {
        name: "Pronto-Socorro (nível baixo)",
        detail: "Avaliação simples, sem procedimentos (CPT 99281-99282)",
        range: "$800 – $1.900"
      }, {
        name: "Pronto-Socorro (nível médio)",
        detail: "Exame + hemograma básico (CPT 99283-99284)",
        range: "$1.900 – $3.500"
      }, {
        name: "Pronto-Socorro (alta complexidade)",
        detail: "Múltiplos exames, observação (CPT 99285) — caso típico",
        range: "$3.500 – $8.000"
      }, {
        name: "Raio-X simples (tórax/tornozelo)",
        detail: "Sem contraste — por imagem, cobrado separado da taxa de sala",
        range: "$300 – $900"
      }, {
        name: "Tomografia (TC)",
        detail: "Abdômen ou tórax sem contraste — um dos maiores infladores da conta",
        range: "$1.500 – $5.000"
      }, {
        name: "Sutura de ferimento simples",
        detail: "Até 5 cm sem complicações (CPT 12001) — mais taxa de sala ER",
        range: "$500 – $1.500"
      }, {
        name: "Transporte de ambulância",
        detail: "Média nacional 2025, curta distância — cobrado separadamente",
        range: "$1.300 – $2.800"
      } ]
    },
    tip: {
      es: "<strong>⚠️ Llamá SIEMPRE al seguro antes de ir a urgencias.</strong> El ER promedio cuesta USD 2.600 sin seguro (UnitedHealthcare 2025). Si podés, elegí Urgent Care — cuesta entre 5 y 10 veces menos. En emergencia real (paro, ACV, trauma grave), llamá al <strong>911</strong> sin dudar. Pedí siempre factura itemizada — hay cargos que podés disputar.",
      en: "<strong>⚠️ ALWAYS call your insurer before going to the ER.</strong> The average ER visit costs USD 2,600 without insurance (UnitedHealthcare 2025). When possible, choose Urgent Care — it's 5-10x cheaper. For real emergencies (cardiac arrest, stroke, severe trauma), call <strong>911</strong> immediately. Always request an itemized bill — many charges can be disputed.",
      pt: "<strong>⚠️ SEMPRE ligue para o seguro antes de ir à emergência.</strong> A visita média ao PS custa USD 2.600 sem seguro (UnitedHealthcare 2025). Se possível, prefira o Urgent Care — custa de 5 a 10 vezes menos. Em emergências reais (parada cardíaca, AVC, trauma grave), ligue para o <strong>911</strong>. Peça sempre a conta detalhada — muitas cobranças podem ser contestadas."
    }
  },
  urgent: {
    items: {
      es: [ {
        name: "Consulta base Urgent Care (sin seguro)",
        detail: "Visita estándar, sin estudios adicionales — promedio nacional 2025",
        range: "$150 – $280"
      }, {
        name: "Test rápido (strep, gripe, COVID)",
        detail: "Incluye toma de muestra y resultado — varía según tipo de test",
        range: "$60 – $200"
      }, {
        name: "Análisis de sangre o urina (UTI/ITU)",
        detail: "Urinalysis + cultivo básico o hemograma simple",
        range: "$50 – $150"
      }, {
        name: "Radiografía en Urgent Care",
        detail: "Esguince, fractura menor — más económico que en ER",
        range: "$200 – $450"
      }, {
        name: "Inyección IV / hidratación",
        detail: "Antibiótico IV, solución salina, antieméticos, etc.",
        range: "$150 – $400"
      }, {
        name: "Sutura o cierre de herida",
        detail: "Corte simple con puntos o Dermabond — precio al walk-in",
        range: "$150 – $350"
      }, {
        name: "Consulta pediátrica urgente",
        detail: "Niño sin turno, sin hospitalización — cargo base en 2025",
        range: "$150 – $300"
      } ],
      en: [ {
        name: "Urgent Care base visit (uninsured)",
        detail: "Standard visit, no extra tests — 2025 national average",
        range: "$150 – $280"
      }, {
        name: "Rapid test (strep, flu, COVID)",
        detail: "Includes swab and result — varies by test type",
        range: "$60 – $200"
      }, {
        name: "Blood or urine test (UTI)",
        detail: "Urinalysis + basic culture or blood panel",
        range: "$50 – $150"
      }, {
        name: "X-Ray at Urgent Care",
        detail: "Sprain, minor fracture — cheaper than ER",
        range: "$200 – $450"
      }, {
        name: "IV drip / hydration",
        detail: "IV antibiotic, saline, antiemetics, etc.",
        range: "$150 – $400"
      }, {
        name: "Laceration / wound closure",
        detail: "Simple cut with sutures or Dermabond — walk-in price",
        range: "$150 – $350"
      }, {
        name: "Pediatric urgent visit",
        detail: "Child, no appointment, no hospitalization — 2025 base price",
        range: "$150 – $300"
      } ],
      pt: [ {
        name: "Consulta base Urgent Care (sem seguro)",
        detail: "Visita padrão, sem exames extras — média nacional 2025",
        range: "$150 – $280"
      }, {
        name: "Teste rápido (strep, gripe, COVID)",
        detail: "Inclui coleta e resultado — varia conforme o tipo de teste",
        range: "$60 – $200"
      }, {
        name: "Exame de sangue ou urina (ITU)",
        detail: "Urinálise + cultura básica ou hemograma simples",
        range: "$50 – $150"
      }, {
        name: "Raio-X no Urgent Care",
        detail: "Torção, fratura leve — mais barato que no PS",
        range: "$200 – $450"
      }, {
        name: "Injeção IV / hidratação",
        detail: "Antibiótico IV, soro, antieméticos, etc.",
        range: "$150 – $400"
      }, {
        name: "Sutura / fechamento de ferimento",
        detail: "Corte simples com pontos ou Dermabond — preço walk-in",
        range: "$150 – $350"
      }, {
        name: "Consulta pediátrica urgente",
        detail: "Criança, sem agendamento, sem internação — preço base 2025",
        range: "$150 – $300"
      } ]
    },
    tip: {
      es: "<strong>💡 Urgent Care vs Urgencias (ER):</strong> Para fiebre, infecciones, cortes, torceduras y molestias que no son vida-o-muerte, el Urgent Care es la opción correcta. En 2025 cuesta entre USD 150–280 base, contra USD 2.600 en el ER por el mismo problema. Buscá cadenas como <strong>CityMD, MinuteClinic o AFC Urgent Care</strong>. Muchos abren 7 días. Informá siempre tu seguro al registrarte.",
      en: "<strong>💡 Urgent Care vs ER:</strong> For fever, infections, cuts, sprains and non-life-threatening issues, Urgent Care is the right call. In 2025 it costs $150–$280 base vs. $2,600 average at the ER for the same issue. Look for <strong>CityMD, MinuteClinic or AFC Urgent Care</strong>. Many are open 7 days. Always provide your travel insurance when checking in.",
      pt: "<strong>💡 Urgent Care vs Emergência:</strong> Para febre, infecções, cortes, torções e problemas não fatais, o Urgent Care é a escolha certa. Em 2025 custa entre USD 150–280 base, contra USD 2.600 no PS pelo mesmo problema. Procure <strong>CityMD, MinuteClinic ou AFC Urgent Care</strong>. Muitos funcionam 7 dias. Informe seu seguro viagem no cadastro."
    }
  },
  pharma: {
    items: {
      es: [ {
        name: "Ibuprofeno 200mg (Advil) × 50 tab",
        detail: "Analgésico/antiinflamatorio OTC — precio en Walmart/Target 2025",
        range: "$8 – $16"
      }, {
        name: "Acetaminofén 500mg (Tylenol) × 100",
        detail: "Analgésico y antipirético OTC — precio en CVS/Walgreens 2025",
        range: "$10 – $20"
      }, {
        name: "Antihistamínico (Benadryl / Claritin)",
        detail: "Para alergias, urticaria, picaduras — en cadenas de farmacia",
        range: "$10 – $28"
      }, {
        name: "Antibiótico genérico (amoxicilina)",
        detail: "Con receta — precio con cupón GoodRx en farmacias de cadena 2025",
        range: "$10 – $35"
      }, {
        name: "EpiPen (adrenalina, emergencia alérgica)",
        detail: "Con receta, precio sin seguro — con GoodRx puede bajar a $100–250",
        range: "$300 – $650"
      }, {
        name: "Antidiarreico (Imodium) + antiácido",
        detail: "Kit OTC estándar — precio en Walmart o Target 2025",
        range: "$10 – $22"
      }, {
        name: "Kit básico primeros auxilios",
        detail: "Neosporin + Band-Aid surtido + antiséptico",
        range: "$15 – $32"
      } ],
      en: [ {
        name: "Ibuprofen 200mg (Advil) × 50 tabs",
        detail: "OTC analgesic/anti-inflammatory — Walmart/Target 2025 price",
        range: "$8 – $16"
      }, {
        name: "Acetaminophen 500mg (Tylenol) × 100",
        detail: "OTC analgesic/antipyretic — CVS/Walgreens 2025 price",
        range: "$10 – $20"
      }, {
        name: "Antihistamine (Benadryl / Claritin)",
        detail: "For allergies, hives, insect bites — chain pharmacy price",
        range: "$10 – $28"
      }, {
        name: "Generic antibiotic (amoxicillin)",
        detail: "Prescription — 2025 price with GoodRx coupon at chain pharmacy",
        range: "$10 – $35"
      }, {
        name: "EpiPen (epinephrine, allergic emergency)",
        detail: "Prescription, uninsured price — GoodRx can bring it to $100–250",
        range: "$300 – $650"
      }, {
        name: "Anti-diarrheal (Imodium) + antacid",
        detail: "Standard OTC kit — Walmart or Target 2025",
        range: "$10 – $22"
      }, {
        name: "Basic first aid kit",
        detail: "Neosporin + assorted Band-Aid + antiseptic",
        range: "$15 – $32"
      } ],
      pt: [ {
        name: "Ibuprofeno 200mg (Advil) × 50 comp.",
        detail: "Analgésico/anti-inflamatório OTC — preço Walmart/Target 2025",
        range: "$8 – $16"
      }, {
        name: "Paracetamol 500mg (Tylenol) × 100",
        detail: "Analgésico e antitérmico OTC — preço CVS/Walgreens 2025",
        range: "$10 – $20"
      }, {
        name: "Anti-histamínico (Benadryl / Claritin)",
        detail: "Para alergias, urticária, picadas — preço em redes de farmácia",
        range: "$10 – $28"
      }, {
        name: "Antibiótico genérico (amoxicilina)",
        detail: "Com receita — preço 2025 com cupom GoodRx em redes de farmácia",
        range: "$10 – $35"
      }, {
        name: "EpiPen (adrenalina, emergência alérgica)",
        detail: "Com receita, sem seguro — com GoodRx pode cair a $100–250",
        range: "$300 – $650"
      }, {
        name: "Antidiarreico (Imodium) + antiácido",
        detail: "Kit OTC padrão — preço Walmart ou Target 2025",
        range: "$10 – $22"
      }, {
        name: "Kit básico de primeiros socorros",
        detail: "Neosporin + Band-Aid sortido + antisséptico",
        range: "$15 – $32"
      } ]
    },
    tip: {
      es: "<strong>💊 Farmacias de cadena:</strong> CVS, Walgreens y Walmart Pharmacy tienen los mejores precios. Siempre usá la app <strong>GoodRx</strong> antes de pagar — en antibióticos genéricos puede bajar hasta un 80% el precio de lista. El EpiPen sin seguro cuesta hasta USD 650, pero con GoodRx o el programa de ahorro de fabricante puede bajar a USD 100–250.",
      en: "<strong>💊 Chain pharmacies:</strong> CVS, Walgreens and Walmart Pharmacy have the best prices. Always check the <strong>GoodRx app</strong> before paying — for generic antibiotics it can cut up to 80% off the list price. EpiPens can run up to $650 without insurance, but GoodRx or manufacturer savings programs can bring it down to $100–250.",
      pt: "<strong>💊 Farmácias de rede:</strong> CVS, Walgreens e Walmart Pharmacy têm os melhores preços. Sempre use o app <strong>GoodRx</strong> antes de pagar — para antibióticos genéricos pode reduzir até 80% do preço de tabela. O EpiPen sem seguro pode custar até USD 650, mas com GoodRx ou programas de desconto do fabricante pode cair para USD 100–250."
    }
  },
  dental: {
    items: {
      es: [ {
        name: "Consulta de emergencia dental",
        detail: "Examen + radiografía panorámica — promedio nacional 2025",
        range: "$100 – $250"
      }, {
        name: "Extracción dental simple",
        detail: "Diente erupcionado sin complicaciones — precio promedio 2025",
        range: "$150 – $400"
      }, {
        name: "Extracción molar del juicio",
        detail: "Impactado con anestesia local — puede llegar a $600 con sedación",
        range: "$300 – $700"
      }, {
        name: "Tratamiento de conducto (endodoncia)",
        detail: "Molar sin corona — rango actualizado 2025 según GoodRx y ADA",
        range: "$1,000 – $1,800"
      }, {
        name: "Antibiótico dental (amoxicilina)",
        detail: "Para infecciones agudas, con receta — 10 días de tratamiento",
        range: "$10 – $35"
      }, {
        name: "Relleno / obturación compuesta",
        detail: "Resina compuesta, una superficie — precio promedio dentista 2025",
        range: "$150 – $350"
      }, {
        name: "Corona dental provisional",
        detail: "Mientras se resuelve la emergencia — material y tiempo del dentista",
        range: "$500 – $1,200"
      } ],
      en: [ {
        name: "Emergency dental visit",
        detail: "Exam + panoramic X-ray — 2025 national average",
        range: "$100 – $250"
      }, {
        name: "Simple tooth extraction",
        detail: "Erupted tooth, no complications — 2025 average price",
        range: "$150 – $400"
      }, {
        name: "Wisdom tooth extraction",
        detail: "Impacted with local anesthesia — up to $600 with sedation",
        range: "$300 – $700"
      }, {
        name: "Root canal treatment",
        detail: "Molar without crown — 2025 range per GoodRx & ADA data",
        range: "$1,000 – $1,800"
      }, {
        name: "Dental antibiotic (amoxicillin)",
        detail: "For acute infections, prescription — 10-day course",
        range: "$10 – $35"
      }, {
        name: "Composite filling",
        detail: "Composite resin, one surface — 2025 average dentist price",
        range: "$150 – $350"
      }, {
        name: "Temporary dental crown",
        detail: "While resolving the emergency — material + dentist time",
        range: "$500 – $1,200"
      } ],
      pt: [ {
        name: "Consulta de emergência dental",
        detail: "Exame + radiografia panorâmica — média nacional 2025",
        range: "$100 – $250"
      }, {
        name: "Extração dental simples",
        detail: "Dente erupcionado sem complicações — preço médio 2025",
        range: "$150 – $400"
      }, {
        name: "Extração de siso",
        detail: "Impactado com anestesia local — até $600 com sedação",
        range: "$300 – $700"
      }, {
        name: "Tratamento de canal (endodontia)",
        detail: "Molar sem coroa — faixa 2025 segundo GoodRx e ADA",
        range: "$1.000 – $1.800"
      }, {
        name: "Antibiótico dental (amoxicilina)",
        detail: "Para infecções agudas, com receita — 10 dias de tratamento",
        range: "$10 – $35"
      }, {
        name: "Restauração composta",
        detail: "Resina composta, uma superfície — preço médio 2025",
        range: "$150 – $350"
      }, {
        name: "Coroa dental provisória",
        detail: "Enquanto a emergência é resolvida — material + tempo do dentista",
        range: "$500 – $1.200"
      } ]
    },
    tip: {
      es: "<strong>🦷 Tip dental 2025:</strong> Un tratamiento de conducto en molar cuesta USD 1.000–1.800 sin seguro (GoodRx/ADA 2025). Muchas universidades con facultad de odontología ofrecen atención de emergencia a precios reducidos. Ante dolor agudo, un antibiótico controla la infección temporalmente. La corona va aparte — sumale USD 800–1.500 si la necesitás.",
      en: "<strong>🦷 Dental tip 2025:</strong> A molar root canal costs USD 1,000–1,800 without insurance (GoodRx/ADA 2025). Many dental schools offer emergency care at reduced prices. For acute pain, an antibiotic can temporarily control infection. The crown is separate — add USD 800–1,500 if needed.",
      pt: "<strong>🦷 Dica dental 2025:</strong> Um canal em molar custa USD 1.000–1.800 sem seguro (GoodRx/ADA 2025). Muitas faculdades de odontologia oferecem atendimento de emergência a preços reduzidos. Em caso de dor aguda, um antibiótico controla a infecção temporariamente. A coroa é cobrada à parte — some USD 800–1.500 se necessário."
    }
  }
};

let medCatActive = "er";

window.toggleMed = () => {
  const body = document.getElementById("med-body");
  const lbl = document.getElementById("med-toggle-lbl");
  const open = body.classList.toggle("open");
  const lang = localStorage.getItem("appLang") || "es";
  const labels = {
    es: [ "▲ CERRAR", "▼ VER" ],
    en: [ "▲ CLOSE", "▼ VIEW" ],
    pt: [ "▲ FECHAR", "▼ VER" ]
  };
  const [cls, opn] = labels[lang] || labels.es;
  lbl.innerHTML = open ? `${cls.split(" ")[0]} <span id="med-toggle-txt">${cls.split(" ")[1]}</span>` : `${opn.split(" ")[0]} <span id="med-toggle-txt">${opn.split(" ")[1]}</span>`;
  if (open) {
    renderMed();
    loadInsuranceBanner();
  }
};

window.setMedCat = (cat, btn) => {
  medCatActive = cat;
  document.querySelectorAll(".med-cat").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderMed();
};

function renderMed() {
  const lang = localStorage.getItem("appLang") || "es";
  const data = MED_DATA[medCatActive];
  const items = data.items[lang] || data.items.es;
  const tip = data.tip[lang] || data.tip.es;
  const disclaimers = {
    es: "⚠️ Precios estimativos basados en GoodRx, Mira Health, eHealth, UnitedHealthcare y ADA — datos 2025. Los costos reales varían por estado, hospital y seguro. Llamá siempre a tu seguro antes de ir.",
    en: "⚠️ Estimated prices based on GoodRx, Mira Health, eHealth, UnitedHealthcare & ADA — 2025 data. Actual costs vary by state, hospital and insurance. Always call your insurer first.",
    pt: "⚠️ Preços estimativos baseados em GoodRx, Mira Health, eHealth, UnitedHealthcare e ADA — dados 2025. Os custos reais variam por estado, hospital e seguro. Ligue sempre para seu seguro antes de ir."
  };
  const d = document.getElementById("med-disclaimer");
  if (d) d.textContent = disclaimers[lang] || disclaimers.es;
  const container = document.getElementById("med-items");
  container.innerHTML = items.map(item => `\n        <div class="med-item">\n            <div class="med-item-info">\n                <div class="med-item-name">${esc(item.name)}</div>\n                <div class="med-item-detail">${item.detail}</div>\n            </div>\n            <div class="med-item-price">\n                <div class="med-item-range">${item.range}</div>\n                <div class="med-item-unit">USD</div>\n            </div>\n        </div>\n    `).join("");
  const tipBox = document.getElementById("med-tip-box");
  if (tipBox) tipBox.innerHTML = tip;
  const catLabels = {
    es: {
      er: "🚨 Urgencias",
      urgent: "⚕️ Urgent Care",
      pharma: "💊 Farmacia",
      dental: "🦷 Dental"
    },
    en: {
      er: "🚨 ER",
      urgent: "⚕️ Urgent Care",
      pharma: "💊 Pharmacy",
      dental: "🦷 Dental"
    },
    pt: {
      er: "🚨 Emergência",
      urgent: "⚕️ Urgent Care",
      pharma: "💊 Farmácia",
      dental: "🦷 Dentista"
    }
  };
  const cl = catLabels[lang] || catLabels.es;
  Object.entries(cl).forEach(([k, v]) => {
    const b = document.getElementById("medcat-" + k);
    if (b) b.textContent = v;
  });
  const titles = {
    es: "Emergencias Médicas en EE.UU.",
    en: "Medical Emergencies in the U.S.",
    pt: "Emergências Médicas nos EUA"
  };
  const tl = document.getElementById("med-title-lbl");
  if (tl) tl.textContent = titles[lang] || titles.es;
}

let _insCache = null;

async function loadInsuranceBanner() {
  const slot = document.getElementById("med-insurance-slot");
  if (!slot) return;
  if (_insCache) {
    renderInsuranceBanner(_insCache);
    return;
  }
  const lang = localStorage.getItem("appLang") || "es";
  const perfilId = localStorage.getItem("perfilActivoId") || "default";
  const cacheKey = "taxusa_docs_cache_" + perfilId;
  const loadingText = {
    es: "Buscando tu seguro de viaje…",
    en: "Looking for your travel insurance…",
    pt: "Procurando seu seguro viagem…"
  };
  slot.innerHTML = `<div class="med-insurance-banner" style="margin-bottom:14px;">\n        <div class="med-ins-loading"><div class="med-ins-spinner"></div>${loadingText[lang] || loadingText.es}</div>\n    </div>`;
  let docs = [];
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) docs = JSON.parse(raw);
  } catch (e) {}
  const insuranceDocs = docs.filter(d => d.type === "🛡️" || d.type === "🩺");
  if (!insuranceDocs.length) {
    _insCache = {
      found: false
    };
    renderInsuranceBanner(_insCache);
    return;
  }
  const doc = insuranceDocs[0];
  const file = (doc.files || [])[0];
  if (!file || !file.dataUrl) {
    _insCache = {
      found: true,
      name: doc.name,
      phone: null,
      insurer: null,
      docId: doc.id,
      fromName: true
    };
    renderInsuranceBanner(_insCache);
    return;
  }
  try {
    const result = await analyzeInsuranceDoc(file, doc.name, lang);
    _insCache = {
      found: true,
      ...result,
      docId: doc.id
    };
  } catch (e) {
    _insCache = {
      found: true,
      name: doc.name,
      phone: null,
      insurer: null,
      docId: doc.id,
      fromName: true
    };
  }
  renderInsuranceBanner(_insCache);
}

async function analyzeInsuranceDoc(file, docName, lang) {
  let mediaType = "image/jpeg";
  let isImage = true;
  if (file.dataUrl && file.dataUrl.startsWith("data:")) {
    const mime = file.dataUrl.split(";")[0].split(":")[1];
    mediaType = mime;
    isImage = mime.startsWith("image/");
  } else if (file.name) {
    if (file.name.toLowerCase().endsWith(".pdf")) {
      mediaType = "application/pdf";
      isImage = false;
    } else if (file.name.toLowerCase().endsWith(".png")) {
      mediaType = "image/png";
      isImage = true;
    }
  }
  let b64 = file.dataUrl || "";
  if (b64.includes(",")) b64 = b64.split(",")[1];
  const prompt = `You are analyzing a travel insurance policy document. \nExtract ONLY these two fields from the document:\n1. insurer: The insurance company name (e.g. "Assist Card", "Allianz", "IATI", "Mapfre", "Europ Assistance", "Falabella Seguros", etc.)\n2. phone: The 24/7 emergency phone number for medical emergencies abroad (international format preferred, e.g. "+1-800-XXX-XXXX" or "+54-11-XXXX-XXXX")\n\nDocument name hint: "${docName}"\n\nRespond ONLY with a JSON object, nothing else, no markdown:\n{"insurer": "...", "phone": "..."}\n\nIf you cannot find a field, use null for that field. Do not invent data.`;
  const content = isImage ? [ {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: b64
    }
  }, {
    type: "text",
    text: prompt
  } ] : [ {
    type: "document",
    source: {
      type: "base64",
      media_type: "application/pdf",
      data: b64
    }
  }, {
    type: "text",
    text: prompt
  } ];
  const res = await window.taxflyWorker({
    type: "insurance_analysis",
    fileBase64: b64,
    mediaType: mediaType,
    docName: docName
  });
  if (!res.ok) throw new Error("analyze-insurance error: " + res.status);
  const parsed = await res.json();
  return {
    insurer: parsed.insurer || null,
    phone: parsed.phone || null,
    name: docName
  };
}

function renderInsuranceBanner(state) {
  const slot = document.getElementById("med-insurance-slot");
  if (!slot) return;
  const lang = localStorage.getItem("appLang") || "es";
  if (!state.found) {
    const noIns = {
      es: '🛡️ Sin seguro guardado — <a href="tickets.html" style="color:var(--primary);font-weight:800;text-decoration:none;">agregá tu póliza en Documentos</a>',
      en: '🛡️ No insurance found — <a href="tickets.html" style="color:var(--primary);font-weight:800;text-decoration:none;">add your policy in Documents</a>',
      pt: '🛡️ Sem seguro salvo — <a href="tickets.html" style="color:var(--primary);font-weight:800;text-decoration:none;">adicione sua apólice em Documentos</a>'
    };
    slot.innerHTML = `<div class="med-insurance-banner" style="margin-bottom:14px;background:rgba(0,0,0,.03);border-color:var(--border);">\n            <div class="med-ins-none">${noIns[lang] || noIns.es}</div>\n        </div>`;
    return;
  }
  const labels = {
    es: {
      badge: "TU SEGURO DE VIAJE",
      call: "📞 Llamar ahora",
      view: "📄 Ver póliza",
      noPhone: "Sin tel. detectado",
      fallback: "Documento guardado"
    },
    en: {
      badge: "YOUR TRAVEL INSURANCE",
      call: "📞 Call now",
      view: "📄 View policy",
      noPhone: "No phone detected",
      fallback: "Saved document"
    },
    pt: {
      badge: "SEU SEGURO VIAGEM",
      call: "📞 Ligar agora",
      view: "📄 Ver apólice",
      noPhone: "Sem tel. detectado",
      fallback: "Documento salvo"
    }
  };
  const lbl = labels[lang] || labels.es;
  const displayName = state.insurer || state.name || lbl.fallback;
  const phoneBtn = state.phone ? `<a class="med-ins-btn med-ins-btn-call" href="tel:${state.phone.replace(/\s/g, "")}">${lbl.call}</a>` : `<span class="med-ins-btn" style="background:var(--input-bg);color:var(--text-dim);cursor:default;">${lbl.noPhone}</span>`;
  const policyUrl = state.docId ? `tickets.html#doc-${state.docId}` : "tickets.html";
  slot.innerHTML = `<div class="med-insurance-banner">\n        <div class="med-ins-header">\n            <div class="med-ins-icon">🛡️</div>\n            <div class="med-ins-info">\n                <div class="med-ins-label">${lbl.badge}</div>\n                <div class="med-ins-name">${displayName}</div>\n                ${state.insurer && state.name !== state.insurer ? `<div class="med-ins-doc">📄 ${esc(state.name)}</div>` : ""}\n                ${state.phone ? `<div class="med-ins-doc">📞 ${state.phone}</div>` : ""}\n            </div>\n        </div>\n        <div class="med-ins-actions">\n            ${phoneBtn}\n            <a class="med-ins-btn med-ins-btn-view" href="${policyUrl}">${lbl.view}</a>\n        </div>\n    </div>`;
}

const _origChangeLang = window.changeLanguage;

window.changeLanguage = function(lang) {
  if (_origChangeLang) _origChangeLang(lang);
  const body = document.getElementById("med-body");
  if (body && body.classList.contains("open")) {
    renderMed();
    if (_insCache) renderInsuranceBanner(_insCache);
  }
};
