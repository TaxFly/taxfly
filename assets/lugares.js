import { fsNet } from "./fs-net.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut, reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword, sendEmailVerification, sendPasswordResetEmail, verifyBeforeUpdateEmail, deleteUser } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, getDoc, getDocs, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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

let currentUser = null;

const perfilId = localStorage.getItem("perfilActivoId");

function refreshItineraryTrip() {
  if (!currentUser || !perfilId) return;
  const tc = window.TripContext;
  tc.render(document.getElementById("trip-filter-itinerary"), currentUser.uid, perfilId);
  renderActivities(localActivities);
  renderNotes(localNotes);
  renderChecklist(localStorage.getItem("appLang") || "es");
  const trip = tc.readTrips(currentUser.uid, perfilId).find(t => t.id === tc.view(currentUser.uid, perfilId));
  const city = trip?.destinations?.[trip.activeDestination || 0]?.city;
  const cityMap = {"Orlando":"orlando", "Nueva York":"nyc", "New York":"nyc", "Miami":"miami", "Las Vegas":"vegas", "Los Ángeles":"la", "Los Angeles":"la", "San Francisco":"sf", "Chicago":"chicago", "Washington D.C.":"dc"};
  const selector = document.getElementById("citySelector");
  if (selector && city) {
    selector.querySelector('option[value="custom"]')?.remove();
    if (!cityMap[city]) {
      const option = document.createElement("option");
      option.value = "custom";
      option.textContent = city;
      selector.appendChild(option);
    }
    selector.value = cityMap[city] || "custom";
    renderCityData();
  }
}

const perfilFoto = localStorage.getItem("perfilActivoFoto");

if (perfilFoto) {
  const _btn = document.getElementById("btnSettings");
  if (_btn) {
    _btn.style.backgroundImage = `url(${perfilFoto})`;
    _btn.innerText = "";
  }
}

let currentTipIndex = 0;

const i18n = {
  es: {
    nav_home: "INICIO",
    nav_tax: "TAXES",
    nav_expenses: "GASTOS",
    nav_routes: "RUTAS",
    nav_units: "AYUDA Y REFERENCIAS",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_more: "MÁS",
    nav_units_desc: "Conversor de unidades y ayudas varias",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartidos",
    tab_places: "LUGARES",
    tab_activities: "RECORDATORIOS",
    tab_notes: "NOTAS",
    itinerary_title: "📍 Lugares del viaje",
    tip_label: "✨ Tip de Viaje",
    city_orlando: "Orlando",
    city_nyc: "Nueva York",
    city_miami: "Miami",
    city_vegas: "Las Vegas",
    city_la: "Los Ángeles",
    city_sf: "San Francisco",
    city_chicago: "Chicago",
    city_dc: "Washington D.C.",
    status_low: "BAJA 🟢",
    status_med: "MED 🟡",
    status_high: "ALTA 🔴",
    status_closed: "CERRADO 🌙",
    status_na: "N/A",
    label_add_activity: "➕ Nueva Actividad",
    act_placeholder: "Ej: Vuelo EZE → MCO",
    label_date: "Fecha",
    label_time: "Hora",
    label_type: "Tipo",
    type_flight: "✈️ Vuelo",
    type_hotel: "🏨 Hotel",
    type_park: "🎡 Parque",
    type_food: "🍽️ Comida",
    type_other: "📌 Otro",
    btn_add_activity: "AGREGAR ACTIVIDAD",
    label_schedule: "📅 Agenda",
    empty_activities: "Todavía no agregaste actividades.\n¡Empezá a planificar tu viaje!",
    progress_label: "Progreso del viaje",
    btn_pin: "Cambiar PIN Offline",
    label_notes: "📝 Notas y Recordatorios",
    note_placeholder: "Vuelos, hoteles, recordatorios...",
    btn_add_note: "AGREGAR NOTA",
    label_checklist: "✅ Checklist de Viaje",
    settings_title: "Ajustes",
    label_language: "Idioma",
    btn_change_profile: "Cambiar Perfil",
    btn_theme: "Cambiar Tema",
    btn_refresh: "Actualizar App",
    btn_change_email: "Cambiar Correo",
    btn_change_pass: "Cambiar Contraseña",
    btn_logout: "Cerrar Sesión",
    btn_delete_acc: "Eliminar Cuenta",
    footer_by: "Creado por Juan Cruz Bria",
    prompt_new_email: "Ingresa el nuevo correo electrónico:",
    prompt_new_pass: "Ingresa la nueva contraseña (mínimo 6 caracteres):",
    alert_email_verify: "Se ha enviado un correo de verificación. El cambio se aplicará tras verificar.",
    alert_pass_success: "Contraseña actualizada con éxito.",
    alert_reauth_required: "Error: Reautenticación requerida para cambios sensibles.",
    confirm_delete_account: "¿ESTÁS SEGURO? Esta acción borrará todos tus datos de forma permanente.",
    confirm_delete: "¿Eliminar?",
    tab_transport: "MOVILIDAD",
    section_public_transport: "Transporte Público",
    section_park_tracker: "Tracker de Parques",
    section_park_tracker_sub: "Tachá cada atracción que hagas",
    btn_reset_progress: "↺ Reiniciar progreso",
    transport_title: "🚇 Transporte Público por Ciudad",
    transport_intro: "Seleccioná una ciudad para ver info de transporte, precios y mapas oficiales.",
    transport_system: "🚇 Sistema",
    transport_price: "💵 Precio",
    transport_payment: "💳 Pago",
    transport_app: "📱 App recomendada",
    transport_tips: "💡 Tips locales",
    transport_official: "Oficial PDF/Web",
    transport_realtime: "Tiempo real",
    act_form_open: "▼ VER",
    act_form_close: "▲ CERRAR",
    adaptador_open: "▼ VER",
    adaptador_close: "▲ OCULTAR",
    adaptador_title: "🔌 Enchufes en USA",
    checklist_progress_label: "Preparativos",
    custom_check_placeholder: "Agregar ítem...",
    offline_title: "Sin conexión",
    offline_sub: "Los cambios se guardan y se sincronizan al volver",
    sync_pending: "Sincronizando {n} cambio{s} pendiente{s}…",
    sync_ok: "✅ Todo sincronizado",
    sync_fail: "⚠️ {n} cambio{s} sin sincronizar",
    toast_activity_saved: "📥 Actividad guardada — se sincronizará al volver la conexión",
    toast_note_saved: "📥 Nota guardada — se sincronizará al volver la conexión",
    rbn_title: "Activá los recordatorios",
    rbn_sub: "Te avisamos 1 día y 1 hora antes de cada actividad",
    rbn_action: "ACTIVAR",
    bell_on: "🔔 Recordatorio activado",
    bell_off: "🔕 Recordatorio cancelado",
    reminder_denied: "Activá las notificaciones desde los ajustes del navegador.",
    reminder_day_before: "Mañana: {name} a las {time}",
    reminder_hour_before: "En 1 hora: {name}",
    reminder_body_day: "Recordatorio de tu itinerario TaxUSA",
    reminder_body_hour: "Recordatorio de tu itinerario TaxUSA",
    reminder_no_time: "Agregá un horario a la actividad para activar el recordatorio."
  },
  en: {
    nav_home: "HOME",
    nav_tax: "TAXES",
    nav_expenses: "EXPENSES",
    nav_routes: "ROUTES",
    nav_units: "Help & References",
    nav_tickets: "DOCUMENTS",
    nav_group: "GROUP",
    nav_more: "MORE",
    nav_units_desc: "Unit Converter & Utilities",
    nav_tickets_desc: "ESTA, insurance, check-in",
    nav_group_desc: "Shared expenses",
    tab_places: "PLACES",
    tab_activities: "REMINDERS",
    tab_notes: "NOTES",
    itinerary_title: "📍 Trip places",
    tip_label: "✨ Travel Tip",
    city_orlando: "Orlando",
    city_nyc: "New York",
    city_miami: "Miami",
    city_vegas: "Las Vegas",
    city_la: "Los Angeles",
    city_sf: "San Francisco",
    city_chicago: "Chicago",
    city_dc: "Washington D.C.",
    status_low: "LOW 🟢",
    status_med: "MED 🟡",
    status_high: "HIGH 🔴",
    status_closed: "CLOSED 🌙",
    status_na: "N/A",
    label_add_activity: "➕ New Activity",
    act_placeholder: "E.g.: Flight EZE → MCO",
    label_date: "Date",
    label_time: "Time",
    label_type: "Type",
    type_flight: "✈️ Flight",
    type_hotel: "🏨 Hotel",
    type_park: "🎡 Park",
    type_food: "🍽️ Food",
    type_other: "📌 Other",
    btn_add_activity: "ADD ACTIVITY",
    label_schedule: "📅 Schedule",
    empty_activities: "No activities added yet.\nStart planning your trip!",
    progress_label: "Trip progress",
    label_notes: "📝 Notes & Reminders",
    note_placeholder: "Flights, hotels, reminders...",
    btn_add_note: "ADD NOTE",
    label_checklist: "✅ Travel Checklist",
    btn_pin: "Change PIN Offline",
    settings_title: "Settings",
    label_language: "Language",
    btn_change_profile: "Change Profile",
    btn_theme: "Toggle Theme",
    btn_refresh: "Refresh App",
    btn_change_email: "Change Email",
    btn_change_pass: "Change Password",
    btn_logout: "Sign Out",
    btn_delete_acc: "Delete Account",
    footer_by: "Created by Juan Cruz Bria",
    prompt_new_email: "Enter your new email address:",
    prompt_new_pass: "Enter new password (min 6 characters):",
    alert_email_verify: "Verification email sent. Changes will apply after verification.",
    alert_pass_success: "Password updated successfully.",
    alert_reauth_required: "Error: Re-authentication required for sensitive changes.",
    confirm_delete_account: "ARE YOU SURE? This action will permanently delete all your data.",
    confirm_delete: "Delete?",
    tab_transport: "TRANSIT",
    section_public_transport: "Public Transit",
    section_park_tracker: "Park Tracker",
    section_park_tracker_sub: "Check off each ride you do",
    btn_reset_progress: "↺ Reset progress",
    transport_title: "🚇 Public Transit by City",
    transport_intro: "Select a city to see transit info, prices and official maps.",
    transport_system: "🚇 System",
    transport_price: "💵 Price",
    transport_payment: "💳 Payment",
    transport_app: "📱 Recommended App",
    transport_tips: "💡 Local Tips",
    transport_official: "Official PDF/Web",
    transport_realtime: "Real time",
    act_form_open: "▼ VIEW",
    act_form_close: "▲ CLOSE",
    adaptador_open: "▼ VIEW",
    adaptador_close: "▲ HIDE",
    adaptador_title: "🔌 Outlets in the USA",
    checklist_progress_label: "Preparations",
    custom_check_placeholder: "Add item...",
    offline_title: "No connection",
    offline_sub: "Changes are saved and will sync when back online",
    sync_pending: "Syncing {n} pending change{s}…",
    sync_ok: "✅ All synced",
    sync_fail: "⚠️ {n} change{s} failed to sync",
    toast_activity_saved: "📥 Activity saved — will sync when back online",
    toast_note_saved: "📥 Note saved — will sync when back online",
    rbn_title: "Enable reminders",
    rbn_sub: "We'll notify you 1 day and 1 hour before each activity",
    rbn_action: "ENABLE",
    bell_on: "🔔 Reminder set",
    bell_off: "🔕 Reminder cancelled",
    reminder_denied: "Enable notifications in your browser settings.",
    reminder_day_before: "Tomorrow: {name} at {time}",
    reminder_hour_before: "In 1 hour: {name}",
    reminder_body_day: "TaxUSA itinerary reminder",
    reminder_body_hour: "TaxUSA itinerary reminder",
    reminder_no_time: "Add a time to this activity to enable the reminder."
  },
  pt: {
    nav_home: "INÍCIO",
    nav_tax: "TAXES",
    nav_expenses: "GASTOS",
    nav_routes: "ROTAS",
    nav_units: "Ajuda e Referências",
    nav_tickets: "DOCUMENTOS",
    nav_group: "GRUPO",
    nav_more: "MAIS",
    nav_units_desc: "Conversor de Unidades e Utilidades",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_group_desc: "Gastos compartilhados",
    tab_places: "LUGARES",
    tab_activities: "LEMBRETES",
    tab_notes: "NOTAS",
    itinerary_title: "📍 Lugares da viagem",
    tip_label: "✨ Dica de Viagem",
    btn_pin: "Alterar PIN Offline",
    city_orlando: "Orlando",
    city_nyc: "Nova York",
    city_miami: "Miami",
    city_vegas: "Las Vegas",
    city_la: "Los Angeles",
    city_sf: "San Francisco",
    city_chicago: "Chicago",
    city_dc: "Washington D.C.",
    status_low: "BAIXA 🟢",
    status_med: "MED 🟡",
    status_high: "ALTA 🔴",
    status_closed: "FECHADO 🌙",
    status_na: "N/D",
    label_add_activity: "➕ Nova Atividade",
    act_placeholder: "Ex: Voo EZE → MCO",
    label_date: "Data",
    label_time: "Hora",
    label_type: "Tipo",
    type_flight: "✈️ Voo",
    type_hotel: "🏨 Hotel",
    type_park: "🎡 Parque",
    type_food: "🍽️ Comida",
    type_other: "📌 Outro",
    btn_add_activity: "ADICIONAR ATIVIDADE",
    label_schedule: "📅 Agenda",
    empty_activities: "Nenhuma atividade adicionada.\nComece a planejar sua viagem!",
    progress_label: "Progresso da viagem",
    label_notes: "📝 Notas e Lembretes",
    note_placeholder: "Voos, hotéis, lembretes...",
    btn_add_note: "ADICIONAR NOTA",
    label_checklist: "✅ Checklist de Viagem",
    settings_title: "Configurações",
    label_language: "Idioma",
    btn_change_profile: "Trocar Perfil",
    btn_theme: "Alternar Tema",
    btn_refresh: "Atualizar App",
    btn_change_email: "Alterar Email",
    btn_change_pass: "Alterar Senha",
    btn_logout: "Sair",
    btn_delete_acc: "Excluir Conta",
    footer_by: "Criado por Juan Cruz Bria",
    prompt_new_email: "Digite o novo endereço de email:",
    prompt_new_pass: "Digite a nova senha (mínimo 6 caracteres):",
    alert_email_verify: "Email de verificação enviado. As alterações serão aplicadas após verificação.",
    alert_pass_success: "Senha atualizada com sucesso.",
    alert_reauth_required: "Erro: Reautenticação necessária para mudanças sensíveis.",
    confirm_delete_account: "TEM CERTEZA? Esta ação excluirá todos os seus dados permanentemente.",
    confirm_delete: "Excluir?",
    tab_transport: "MOBILIDADE",
    section_public_transport: "Transporte Público",
    section_park_tracker: "Tracker de Parques",
    section_park_tracker_sub: "Marque cada atração que fizer",
    btn_reset_progress: "↺ Reiniciar progresso",
    transport_title: "🚇 Transporte Público por Cidade",
    transport_intro: "Selecione uma cidade para ver informações de transporte, preços e mapas oficiais.",
    transport_system: "🚇 Sistema",
    transport_price: "💵 Preço",
    transport_payment: "💳 Pagamento",
    transport_app: "📱 App recomendado",
    transport_tips: "💡 Dicas locais",
    transport_official: "Oficial PDF/Web",
    transport_realtime: "Tempo real",
    act_form_open: "▼ VER",
    act_form_close: "▲ FECHAR",
    adaptador_open: "▼ VER",
    adaptador_close: "▲ OCULTAR",
    adaptador_title: "🔌 Tomadas nos EUA",
    checklist_progress_label: "Preparativos",
    custom_check_placeholder: "Adicionar item...",
    offline_title: "Sem conexão",
    offline_sub: "As alterações são salvas e sincronizadas ao voltar",
    sync_pending: "Sincronizando {n} alteração{s} pendente{s}…",
    sync_ok: "✅ Tudo sincronizado",
    sync_fail: "⚠️ {n} alteração{s} sem sincronizar",
    toast_activity_saved: "📥 Atividade salva — será sincronizada ao voltar",
    toast_note_saved: "📥 Nota salva — será sincronizada ao voltar",
    rbn_title: "Ativar lembretes",
    rbn_sub: "Te avisamos 1 dia e 1 hora antes de cada atividade",
    rbn_action: "ATIVAR",
    bell_on: "🔔 Lembrete ativado",
    bell_off: "🔕 Lembrete cancelado",
    reminder_denied: "Ative as notificações nas configurações do navegador.",
    reminder_day_before: "Amanhã: {name} às {time}",
    reminder_hour_before: "Em 1 hora: {name}",
    reminder_body_day: "Lembrete do itinerário TaxUSA",
    reminder_body_hour: "Lembrete do itinerário TaxUSA",
    reminder_no_time: "Adicione um horário à atividade para ativar o lembrete."
  }
};

window._i18n = i18n;

const tips = {
  es: [ "Comprá los tickets de Disney con anticipación — hasta 20% más barato.", "En NYC, la tarjeta OMNY funciona como Sube en el subte.", "Los outlets suelen tener mejores precios de jueves a sábado.", "En Florida, la mayoría de hoteles cobran resort fee aparte. Preguntá antes.", "El Uber Pool en grandes ciudades ahorra hasta 40% vs taxi.", "En Vegas, los buffets de lunes a jueves son más baratos y menos llenos.", "Las atracciones de Universal abren antes que Disney — ideal para madrugadores.", "Siempre avisá a tu banco antes de viajar para evitar bloqueos de tarjeta.", "En Miami, South Beach tiene estacionamiento gratis después de las 21hs.", "Las tiendas Target suelen tener mejores precios que Walmart en electrónica." ],
  en: [ "Buy Disney tickets in advance — up to 20% cheaper.", "In NYC, the OMNY card works like a transit pass on the subway.", "Outlets usually have better prices Thursday through Saturday.", "In Florida, most hotels charge resort fees separately. Ask upfront.", "Uber Pool in big cities saves up to 40% vs a taxi.", "In Vegas, buffets Monday–Thursday are cheaper and less crowded.", "Universal opens before Disney — perfect for early birds.", "Always notify your bank before traveling to avoid card blocks.", "In Miami, South Beach has free parking after 9 PM.", "Target stores often have better prices than Walmart on electronics." ],
  pt: [ "Compre ingressos da Disney com antecedência — até 20% mais barato.", "Em NYC, o cartão OMNY funciona como o bilhete Único no metrô.", "Outlets costumam ter melhores preços de quinta a sábado.", "Na Flórida, a maioria dos hotéis cobra resort fee separado. Pergunte antes.", "O Uber Pool em grandes cidades economiza até 40% vs táxi.", "Em Vegas, os buffets de segunda a quinta são mais baratos e menos cheios.", "A Universal abre antes da Disney — ideal para quem acorda cedo.", "Avise seu banco antes de viajar para evitar bloqueios no cartão.", "Em Miami, South Beach tem estacionamento gratuito após as 21h.", "As lojas Target costumam ter preços melhores que o Walmart em eletrônicos." ]
};

const citiesConfig = {
  orlando: [],
  nyc: ["Times Square", "Central Park", "Brooklyn Bridge", "The Met"],
  miami: ["South Beach", "Wynwood", "Brickell", "Bayside"],
  vegas: ["The Strip", "Fremont Street", "High Roller", "Bellagio"],
  la: ["Hollywood", "Santa Monica", "Beverly Hills", "Griffith Park"],
  sf: ["Golden Gate Bridge", "Fisherman's Wharf", "Alcatraz", "Union Square"],
  chicago: ["Millennium Park", "Navy Pier", "Magnificent Mile", "Art Institute"],
  dc: ["National Mall", "Smithsonian", "U.S. Capitol", "Georgetown"]
};

const placesText = {
  es:{places:"Lugares para explorar",parks:"Parques",nearby:"Algunos parques están fuera de la ciudad; comprobá la distancia antes de ir.",loading:"Consultando esperas…",unavailable:"Esperas en vivo no disponibles",average:"Nivel promedio de filas",low:"Bajo",medium:"Medio",high:"Alto",count:"atracciones medidas",closed:"Cerrado"},
  en:{places:"Places to explore",parks:"Parks",nearby:"Some parks are outside the city; check the distance before visiting.",loading:"Checking wait times…",unavailable:"Live waits unavailable",average:"Average queue level",low:"Low",medium:"Moderate",high:"High",count:"measured attractions",closed:"Closed"},
  pt:{places:"Lugares para conhecer",parks:"Parques",nearby:"Alguns parques ficam fora da cidade; confira a distância antes de ir.",loading:"Consultando esperas…",unavailable:"Esperas ao vivo indisponíveis",average:"Nível médio das filas",low:"Baixo",medium:"Médio",high:"Alto",count:"atrações medidas",closed:"Fechado"}
};

const checklistItems = {
  es: [ "🛂 Pasaporte vigente", "💳 Tarjeta avisada al banco", "🔌 Adaptador de corriente", "💊 Seguro médico / medicamentos", "🧳 Valija con medidas de aerolínea", "📱 SIM internacional / eSIM", "💵 Dólares en efectivo", "🔒 Candado TSA", "📄 Reservas impresas o en favoritos", "🗺️ Google Maps de la zona offline", "🎟️ Cuponeras de Outlets descargadas", "🚗 Licencia de conducir física" ],
  en: [ "🛂 Valid passport", "💳 Bank notified", "🔌 Power adapter", "💊 Travel insurance / meds", "🧳 Carry-on within airline limits", "📱 International SIM / eSIM", "💵 Cash dollars", "🔒 TSA lock", "📄 Reservations saved or printed", "🎒 Carry-on backpack", "🗺️ Offline Google Maps of the area", "🎟️ Outlet Coupon Books downloaded", "🚗 Physical driver's license" ],
  pt: [ "🛂 Passaporte válido", "💳 Banco avisado", "🔌 Adaptador de energia", "💊 Seguro de saúde / remédios", "🧳 Mala dentro dos limites da cia aérea", "📱 SIM internacional / eSIM", "💵 Dólares em espécie", "🔒 Cadeado TSA", "📄 Reservas salvas ou impressas", "🎒 Mochila de mão para o voo", "🗺️ Google Maps da área em offline", "🎟️ Cupons de desconto dos Outlets", "🚗 Carteira de motorista física" ]
};

window.switchTab = tab => {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("panel-" + tab).classList.add("active");
  document.getElementById("tab-" + tab).classList.add("active");
};

window._updateParquesTab = () => {
  const card = document.getElementById("inline-parques-card");
  if (card) card.style.display = "none";
};

window._i18n = i18n;

window.renderCityData = async () => {
  if (window._updateParquesTab) window._updateParquesTab();
  if (window.updateInlineTransport) window.updateInlineTransport();
  const cityKey = document.getElementById("citySelector").value;
  const lang = localStorage.getItem("appLang") || "es", t = placesText[lang] || placesText.es;
  const container = document.getElementById("dynamicQueues"), parkBox = document.getElementById("cityParks");
  const places = citiesConfig[cityKey] || [];
  container.innerHTML = places.map(name => `<div class="queue-card"><div class="queue-name">${esc(name)}</div></div>`).join("");
  if (places.length) container.insertAdjacentHTML("afterbegin", `<h3 style="grid-column:1/-1;margin:0">${t.places}</h3>`);
  parkBox.textContent = "";
  if (!ParkLive.CITY_DESTINATIONS[cityKey]) return;
  parkBox.innerHTML = `<h3>${t.parks}</h3><p class="park-source">${t.loading}</p>`;
  try {
    const parks = await ParkLive.parksForCity(cityKey);
    if (document.getElementById("citySelector").value !== cityKey) return;
    parkBox.innerHTML = `<h3>${t.parks}</h3><p class="park-source">${t.nearby}</p><p class="park-source"><a href="https://themeparks.wiki/" target="_blank" rel="noopener noreferrer">Powered by ThemeParks.wiki</a> · <a href="https://queue-times.com/" target="_blank" rel="noopener noreferrer">Powered by Queue-Times.com</a></p>` +
      (parks.length ? parks.map((park,i) => `<div class="park-live-card"><strong>${esc(park.name)}</strong><span class="park-level" id="park-level-${i}" aria-live="polite">${t.loading}</span></div>`).join("") : `<p class="park-source">${t.unavailable}</p>`);
    // Limit simultaneous provider requests; each park is updated independently.
    for (let i=0;i<parks.length;i+=3) await Promise.all(parks.slice(i,i+3).map(async (park,offset) => {
      const el = document.getElementById(`park-level-${i+offset}`);
      try {
        const result = await ParkLive.parkSummary(park);
        if (el && document.getElementById("citySelector").value===cityKey)
          {
            if (!result.level) { el.closest(".park-live-card")?.remove(); return; }
            el.className="park-level " + (result.level === "low" ? "q-low" : result.level === "medium" ? "q-med" : result.level === "high" ? "q-high" : "q-off");
            el.textContent=`${t[result.level]} ${result.level === "closed" ? "☾" : ""}`.trim();
          }
      } catch (_) { if (el && document.getElementById("citySelector").value===cityKey) el.closest(".park-live-card")?.remove(); }
    }));
    if (document.getElementById("citySelector").value===cityKey && !parkBox.querySelector(".park-live-card"))
      parkBox.insertAdjacentHTML("beforeend", `<p class="park-source">${t.unavailable}</p>`);
  } catch (_) { if (document.getElementById("citySelector").value===cityKey) parkBox.innerHTML=`<h3>${t.parks}</h3><p class="park-source">${t.unavailable}</p>`; }
};

window.toggleActForm = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang];
  const body = document.getElementById("act-form-body");
  const toggle = document.getElementById("act-form-toggle");
  const open = body.style.display === "none" || body.style.display === "";
  body.style.display = open ? "block" : "none";
  toggle.textContent = open ? t.act_form_close || "▲ CERRAR" : t.act_form_open || "▼ VER";
};

window.nextTip = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const el = document.getElementById("tip-text");
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => {
    currentTipIndex = (currentTipIndex + 1) % tips[lang].length;
    el.innerText = tips[lang][currentTipIndex];
    el.style.opacity = 1;
  }, 300);
};

const PENDING_KEY = "taxusa_itin_pending";
const pendingKey = () => PENDING_KEY + "::" + (currentUser?.uid || "sin-usuario") + "::" + (perfilId || "sin-perfil");

function getPending() {
  try {
    return JSON.parse(localStorage.getItem(pendingKey()) || "[]");
  } catch (e) {
    return [];
  }
}

function savePending(ops) {
  localStorage.setItem(pendingKey(), JSON.stringify(ops));
}

function queueOp(op) {
  const ops = getPending();
  if (!currentUser || !perfilId) return;
  ops.push({...op, uid:currentUser.uid, perfilId});
  savePending(ops);
}

async function flushPending() {
  const ops = getPending();
  if (!ops.length) return;
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang];
  const banner = document.getElementById("sync-banner");
  const syncText = document.getElementById("sync-text");
  function syncMsg(key, n) {
    const s = n === 1 ? "" : lang === "pt" ? "ões" : "s";
    return (t[key] || i18n.es[key]).replace("{n}", n).replace(/\{s\}/g, s);
  }
  if (banner) {
    banner.classList.add("visible");
    if (syncText) syncText.textContent = syncMsg("sync_pending", ops.length);
  }
  const failed = [];
  for (const op of ops) {
    if (!currentUser || op.uid !== currentUser.uid || op.perfilId !== perfilId) { failed.push(op); continue; }
    try {
      const base = [ "usuarios", currentUser.uid, "perfiles", perfilId ];
      if (op.type === "add_activity") {
        await addDoc(collection(db, ...base, "actividades"), op.data);
      } else if (op.type === "toggle_activity") {
        await updateDoc(doc(db, ...base, "actividades", op.id), {
          done: op.done
        });
      } else if (op.type === "del_activity") {
        await deleteDoc(doc(db, ...base, "actividades", op.id));
      } else if (op.type === "add_note") {
        await addDoc(collection(db, ...base, "notas"), op.data);
      } else if (op.type === "del_note") {
        await deleteDoc(doc(db, ...base, "notas", op.id));
      }
    } catch (e) {
      failed.push(op);
    }
  }
  savePending(failed);
  if (banner) {
    if (!failed.length) {
      if (syncText) syncText.textContent = t.sync_ok || "✅ Todo sincronizado";
      setTimeout(() => banner.classList.remove("visible"), 2200);
    } else {
      if (syncText) syncText.textContent = syncMsg("sync_fail", failed.length);
    }
  }
}

window._flushPending = flushPending;

const typeIconMap = {
  vuelo: "✈️",
  hotel: "🏨",
  parque: "🎡",
  comida: "🍽️",
  otro: "📌"
};

let localActivities = [];

window.addActivity = async () => {
  const nameEl = document.getElementById("actName");
  const dateEl = document.getElementById("actDate");
  const name = nameEl.value.trim();
  const date = dateEl.value;
  const time = document.getElementById("actTime").value;
  const type = document.getElementById("actType").value;
  if (!name || !date) {
    nameEl.focus();
    return;
  }
  const data = {
    name: name,
    date: date,
    time: time || "",
    type: type,
    done: false,
    createdAt: Date.now(),
    tripId: currentUser && perfilId ? window.TripContext.assign(currentUser.uid, perfilId) : "orlando"
  };
  if (currentUser && perfilId) {
    if (!navigator.onLine) {
      const tempId = "tmp_" + Date.now();
      localActivities.push({
        id: tempId,
        ...data,
        _pending: true
      });
      renderActivities(localActivities);
      queueOp({
        type: "add_activity",
        data: data,
        tempId: tempId
      });
      showOfflineToast(i18n[localStorage.getItem("appLang") || "es"].toast_activity_saved || "📥 Actividad guardada — se sincronizará al volver la conexión");
    } else {
      try {
        await addDoc(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "actividades"), data);
      } catch (e) {
        console.error("Error al guardar actividad:", e);
        showAlert("Error al guardar. Reintente.");
      }
    }
    nameEl.value = "";
    dateEl.value = "";
    document.getElementById("actTime").value = "";
  }
};

window.toggleActivity = async (id, currentDone) => {
  if (!currentUser || !perfilId) return;
  localActivities = localActivities.map(a => a.id === id ? {
    ...a,
    done: !currentDone
  } : a);
  renderActivities(localActivities);
  if (!navigator.onLine) {
    const ops = getPending().map(op => op.tempId === id ? {
      ...op,
      data: {
        ...op.data,
        done: !currentDone
      }
    } : op);
    savePending(ops);
  } else {
    try {
      await updateDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "actividades", id), {
        done: !currentDone
      });
    } catch (e) {
      queueOp({
        type: "toggle_activity",
        id: id,
        done: !currentDone
      });
    }
  }
};

window.deleteActivity = id => {
  const idx = localActivities.findIndex(x => x.id === id);
  if (idx < 0) return;
  const item = localActivities[idx];
  window._tfHidden = window._tfHidden || new Set();
  tfDeleteWithUndo({
    remove: () => { window._tfHidden.add(id); localActivities = localActivities.filter(x => x.id !== id); renderActivities(localActivities); },
    restore: () => { window._tfHidden.delete(id); if (!localActivities.some(x => x.id === id)) localActivities.splice(Math.min(idx, localActivities.length), 0, item); renderActivities(localActivities); },
    commit: async unloading => {
  const wasPending = item._pending;
  if (!navigator.onLine || wasPending || unloading) {
    const ops = getPending().filter(op => op.tempId !== id);
    if (!wasPending) ops.push({
      type: "del_activity",
      id: id
    });
    savePending(ops);
  } else {
    try {
      await deleteDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "actividades", id));
    } catch (e) {
      queueOp({
        type: "del_activity",
        id: id
      });
    }
  }
  window._tfHidden.delete(id);
    }
  });
};

function renderActivities(acts) {
  if (window._tfHidden && window._tfHidden.size) acts = acts.filter(a => !window._tfHidden.has(a.id));
  if (currentUser && perfilId) acts = window.TripContext.filter(acts, currentUser.uid, perfilId);
  const lang = localStorage.getItem("appLang") || "es";
  const container = document.getElementById("activitiesList");
  const progressCard = document.getElementById("progressCard");
  const progressFill = document.getElementById("progressFill");
  const progressCount = document.getElementById("progressCount");
  if (acts.length === 0) {
    progressCard.style.display = "none";
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🗺️</div><div class="empty-text">${i18n[lang].empty_activities.replace("\n", "<br>")}</div></div>`;
    return;
  }
  const done = acts.filter(a => a.done).length;
  const pct = Math.round(done / acts.length * 100);
  progressCard.style.display = "block";
  progressCount.textContent = `${done}/${acts.length}`;
  progressFill.style.width = pct + "%";
  const grouped = {};
  acts.forEach(a => {
    const k = a.date || "sin-fecha";
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(a);
  });
  const sortedDates = Object.keys(grouped).sort();
  container.innerHTML = sortedDates.map(dateKey => {
    const dayActs = grouped[dateKey];
    const dateLabel = dateKey === "sin-fecha" ? "📌" : formatDate(dateKey, lang);
    const dayDone = dayActs.filter(a => a.done).length;
    return `\n                <div>\n                    <div class="act-group-header">\n                        <span class="act-group-date">${dateLabel}</span>\n                        <span class="act-group-count">${dayDone}/${dayActs.length}</span>\n                    </div>\n                    ${dayActs.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99")).map(act => `\n                        <div class="act-item ${act.done ? "done" : ""}" id="act-item-${act.id}" data-type="${act.type}">\n                            <div class="act-check ${act.done ? "checked" : ""}" onclick="toggleActivity('${act.id}', ${act.done})"></div>\n                            <div class="act-info">\n                                <div class="act-name">${typeIconMap[act.type] || "📌"} ${esc(act.name)}${window.tfSyncBadge ? tfSyncBadge(act._pending ? "pending" : "ok", true) : ""}</div>\n                                <div class="act-meta">\n                                    ${act.time ? `<span class="act-time">🕐 ${act.time}</span>` : ""}\n                                    <span class="act-badge badge-${act.type}">${getBadgeLabel(act.type, lang)}</span>\n                                </div>\n                            </div>\n                            <button class="act-bell ${isReminderOn(act.id) ? "on" : ""}" onclick="toggleReminder('${act.id}','${act.name.replace(/'/g, "\\'")}','${act.date}','${act.time || ""}')" title="Recordatorio">🔔</button>\n                            <button class="act-del" onclick="deleteActivity('${act.id}')" aria-label="Eliminar actividad">✕</button>\n                        </div>\n                    `).join("")}\n                </div>\n            `;
  }).join("");
}

function formatDate(dateStr, lang) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    const opts = {
      weekday: "short",
      day: "numeric",
      month: "short"
    };
    const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR";
    return d.toLocaleDateString(locale, opts).toUpperCase();
  } catch {
    return dateStr;
  }
}

function getBadgeLabel(type, lang) {
  const labels = {
    es: {
      vuelo: "Vuelo",
      hotel: "Hotel",
      parque: "Parque",
      comida: "Comida",
      otro: "Otro"
    },
    en: {
      vuelo: "Flight",
      hotel: "Hotel",
      parque: "Park",
      comida: "Food",
      otro: "Other"
    },
    pt: {
      vuelo: "Voo",
      hotel: "Hotel",
      parque: "Parque",
      comida: "Comida",
      otro: "Outro"
    }
  };
  return labels[lang]?.[type] || type;
}

function listenActivities() {
  if (!currentUser || !perfilId) return;
  const q = query(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "actividades"), orderBy("date", "asc"));
  onSnapshot(q, sn => {
    if (!sn.metadata?.fromCache) window.taxflyOfflineStatus?.mark("places", currentUser.uid, perfilId);
    localActivities = sn.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    for (const op of getPending()) {
      if (op.type === "add_activity") localActivities.push({id:op.tempId,...op.data,_pending:true});
      if (op.type === "toggle_activity") localActivities = localActivities.map(a => a.id === op.id ? {...a,done:op.done,_pending:true} : a);
      if (op.type === "del_activity") localActivities = localActivities.filter(a => a.id !== op.id);
    }
    renderActivities(localActivities);
  }, error => {
    console.error("Error en actividades:", error);
  });
}

let localNotes = [];

window.addNote = async () => {
  const input = document.getElementById("noteInput");
  const text = input.value.trim();
  if (!text || !currentUser || !perfilId) return;
  const data = {
    text: text,
    createdAt: Date.now(),
    tripId: currentUser && perfilId ? window.TripContext.assign(currentUser.uid, perfilId) : "orlando"
  };
  if (!navigator.onLine) {
    const tempId = "tmp_note_" + Date.now();
    localNotes.unshift({
      id: tempId,
      ...data,
      _pending: true
    });
    renderNotes(localNotes);
    queueOp({
      type: "add_note",
      data: data,
      tempId: tempId
    });
    showOfflineToast(i18n[localStorage.getItem("appLang") || "es"].toast_note_saved || "📥 Nota guardada — se sincronizará al volver la conexión");
  } else {
    try {
      await addDoc(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "notas"), data);
    } catch (e) {
      console.error(e);
    }
  }
  input.value = "";
};

function renderNotes(notes) {
  if (window._tfHidden && window._tfHidden.size) notes = notes.filter(n => !window._tfHidden.has(n.id));
  if (currentUser && perfilId) notes = window.TripContext.filter(notes, currentUser.uid, perfilId);
  const lang = localStorage.getItem("appLang") || "es";
  const notesList = document.getElementById("notesList");
  if (!notes.length) {
    notesList.innerHTML = "";
    return;
  }
  notesList.innerHTML = notes.map(d => {
    const ts = d.createdAt ? new Date(d.createdAt).toLocaleDateString(lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-AR") : "";
    return `\n            <div class="note-item" style="${d._pending ? "opacity:.7;" : ""}">\n                <div>\n                    <div class="note-text">${d.text}${window.tfSyncBadge ? tfSyncBadge(d._pending ? "pending" : "ok", true) : ""}</div>\n                    ${ts ? `<div class="note-meta">${ts}</div>` : ""}\n                </div>\n                <button class="note-del" onclick="window.deleteNote('${d.id}')" aria-label="Eliminar nota">✕</button>\n            </div>`;
  }).join("");
}

function listenNotes() {
  if (!currentUser || !perfilId) return;
  const q = query(collection(db, "usuarios", currentUser.uid, "perfiles", perfilId, "notas"), orderBy("createdAt", "desc"));
  onSnapshot(q, sn => {
    if (!sn.metadata?.fromCache) window.taxflyOfflineStatus?.mark("places", currentUser.uid, perfilId);
    localNotes = sn.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    for (const op of getPending()) {
      if (op.type === "add_note") localNotes.unshift({id:op.tempId,...op.data,_pending:true});
      if (op.type === "del_note") localNotes = localNotes.filter(n => n.id !== op.id);
    }
    renderNotes(localNotes);
  });
}

window.deleteNote = id => {
  const idx = localNotes.findIndex(x => x.id === id);
  if (idx < 0) return;
  const item = localNotes[idx];
  window._tfHidden = window._tfHidden || new Set();
  tfDeleteWithUndo({
    remove: () => { window._tfHidden.add(id); localNotes = localNotes.filter(x => x.id !== id); renderNotes(localNotes); },
    restore: () => { window._tfHidden.delete(id); if (!localNotes.some(x => x.id === id)) localNotes.splice(Math.min(idx, localNotes.length), 0, item); renderNotes(localNotes); },
    commit: async unloading => {
  const wasPending = item._pending;
  if (!navigator.onLine || wasPending || unloading) {
    const ops = getPending().filter(op => op.tempId !== id);
    if (!wasPending) ops.push({
      type: "del_note",
      id: id
    });
    savePending(ops);
  } else {
    try {
      await deleteDoc(doc(db, "usuarios", currentUser.uid, "perfiles", perfilId, "notas", id));
    } catch (e) {
      queueOp({
        type: "del_note",
        id: id
      });
    }
  }
  window._tfHidden.delete(id);
    }
  });
};

window.addCustomCheckItem = () => {
  const input = document.getElementById("customCheckInput");
  const text = input.value.trim();
  if (!text) return;
  const key = checklistStorageKey("custom_checklist_");
  const customItems = JSON.parse(localStorage.getItem(key) || "[]");
  customItems.push(text);
  localStorage.setItem(key, JSON.stringify(customItems));
  input.value = "";
  renderChecklist(localStorage.getItem("appLang") || "es");
};

function checklistStorageKey(prefix) {
  const profile = perfilId || "default";
  const trip = currentUser ? window.TripContext.view(currentUser.uid, profile) : "orlando";
  const scoped = `${prefix}${profile}::${trip}`;
  const legacy = `${prefix}${profile}`;
  if (trip === "orlando" && localStorage.getItem(scoped) === null && localStorage.getItem(legacy) !== null) {
    localStorage.setItem(scoped, localStorage.getItem(legacy));
  }
  return scoped;
}

function renderChecklist(lang) {
  const baseItems = checklistItems[lang] || checklistItems.es;
  const customKey = checklistStorageKey("custom_checklist_");
  const customItems = JSON.parse(localStorage.getItem(customKey) || "[]");
  const allItems = [ ...baseItems, ...customItems ];
  const statusKey = checklistStorageKey("checklist_status_");
  const savedStatus = JSON.parse(localStorage.getItem(statusKey) || "{}");
  const container = document.getElementById("travelChecklist");
  if (!container) return;
  container.innerHTML = allItems.map((item, i) => {
    const isChecked = savedStatus[i] || false;
    const isCustom = i >= baseItems.length;
    return `\n            <div class="checklist-item">\n                <div class="cl-check ${isChecked ? "checked" : ""}" onclick="toggleChecklist(${i})"></div>\n                <span class="cl-label" style="flex:1;">${item}</span>\n                ${isCustom ? `<button onclick="removeCustomItem(${i - baseItems.length})" aria-label="Quitar ítem" style="background:none;border:none;color:var(--danger);cursor:pointer;font-weight:bold;padding:0 5px;">✕</button>` : ""}\n            </div>\n        `;
  }).join("");
  const progressCard = document.getElementById("checkProgressCard");
  const progressFill = document.getElementById("checkProgressFill");
  const progressCount = document.getElementById("checkProgressCount");
  const total = allItems.length;
  const done = allItems.filter((_, i) => savedStatus[i]).length;
  if (progressCard) progressCard.style.display = total > 0 ? "block" : "none";
  if (progressCount) progressCount.textContent = `${done}/${total}`;
  if (progressFill) progressFill.style.width = `${total ? Math.round(done / total * 100) : 0}%`;
}

window.toggleChecklist = idx => {
  const statusKey = checklistStorageKey("checklist_status_");
  const savedStatus = JSON.parse(localStorage.getItem(statusKey) || "{}");
  savedStatus[idx] = !savedStatus[idx];
  localStorage.setItem(statusKey, JSON.stringify(savedStatus));
  renderChecklist(localStorage.getItem("appLang") || "es");
};

window.removeCustomItem = customIdx => {
  const customKey = checklistStorageKey("custom_checklist_");
  let customItems = JSON.parse(localStorage.getItem(customKey) || "[]");
  customItems.splice(customIdx, 1);
  localStorage.setItem(customKey, JSON.stringify(customItems));
  const statusKey = checklistStorageKey("checklist_status_");
  const previous = JSON.parse(localStorage.getItem(statusKey) || "{}");
  const baseCount = (checklistItems[localStorage.getItem("appLang") || "es"] || checklistItems.es).length;
  const removed = baseCount + customIdx;
  const shifted = {};
  Object.entries(previous).forEach(([index, checked]) => {
    const n = Number(index);
    if (n !== removed) shifted[n > removed ? n - 1 : n] = checked;
  });
  localStorage.setItem(statusKey, JSON.stringify(shifted));
  renderChecklist(localStorage.getItem("appLang") || "es");
};

window.changeLanguage = lang => {
  { const _b = document.getElementById("ai-bubble"); if (_b) _b.setAttribute("aria-label", lang === "en" ? "Travel assistant" : lang === "pt" ? "Assistente de viagem" : "Asistente de viaje"); }
  { const _c = document.getElementById("ai-close"); if (_c) _c.setAttribute("aria-label", lang === "en" ? "Close chat" : lang === "pt" ? "Fechar chat" : "Cerrar chat"); }
  localStorage.setItem("appLang", lang);
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang]?.[key]) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (i18n[lang]?.[key]) el.placeholder = i18n[lang][key];
  });
  document.querySelectorAll(".lang-opt").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("lang-" + lang);
  if (btn) btn.classList.add("active");
  const actType = document.getElementById("actType");
  if (actType) {
    const types = [ [ "vuelo", i18n[lang].type_flight ], [ "hotel", i18n[lang].type_hotel ], [ "parque", i18n[lang].type_park ], [ "comida", i18n[lang].type_food ], [ "otro", i18n[lang].type_other ] ];
    const cur = actType.value;
    actType.innerHTML = types.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    actType.value = cur;
  }
  const tipEl = document.getElementById("tip-text");
  if (tipEl) tipEl.innerText = tips[lang][currentTipIndex];
  document.title = lang === "en" ? "TaxFly — Itinerary" : lang === "pt" ? "TaxFly — Itinerário" : "TaxFly — Itinerario";
  renderCityData();
  if (window._updateParquesTab) window._updateParquesTab();
  if (window.updateInlineTransport) window.updateInlineTransport();
  renderChecklist(lang);
  if (window.renderCityGrid) window.renderCityGrid();
  if (window.taxieUpdateLang) window.taxieUpdateLang(lang);
  if (window.activeCity) {
    const tmp = window.activeCity;
    window.activeCity = null;
    if (window.showCity) window.showCity(tmp);
  }
  const transportTitle = document.querySelector('[data-i18n="transport_title"]');
  if (transportTitle) transportTitle.textContent = i18n[lang].transport_title || "";
  const transportIntro = document.getElementById("transport-intro");
  if (transportIntro) transportIntro.textContent = i18n[lang].transport_intro || "";
  if (localActivities && localActivities.length > 0) renderActivities(localActivities);
  renderAdaptador(lang);
  const actFormBody = document.getElementById("act-form-body");
  const actFormToggle = document.getElementById("act-form-toggle");
  if (actFormBody && actFormToggle) {
    const isOpen = actFormBody.style.display !== "none" && actFormBody.style.display !== "";
    actFormToggle.textContent = isOpen ? i18n[lang].act_form_close || "▲ CERRAR" : i18n[lang].act_form_open || "▼ VER";
  }
  const adaptadorBody = document.getElementById("adaptador-body");
  const adaptadorToggle = document.getElementById("adaptador-toggle");
  if (adaptadorBody && adaptadorToggle) {
    const isOpen = adaptadorBody.style.display !== "none";
    adaptadorToggle.textContent = isOpen ? i18n[lang].adaptador_close || "▲ OCULTAR" : i18n[lang].adaptador_open || "▼ VER";
  }
};

const adaptadorContent = {
  es: {
    intro: "En USA se usa <strong>110V / 60Hz</strong>. Si tu dispositivo dice <strong>100–240V</strong> en la etiqueta, solo necesitás un adaptador universal. Si dice solo 220V, necesitás un transformador.",
    typeA_title: "Tipo A — 2 enchufes planos",
    typeA_sub: "El más común en USA, México y Japón. Sin tierra.",
    typeB_title: "Tipo B — 2 planos + 1 redondo",
    typeB_sub: "Igual que el Tipo A pero con toma a tierra. Muy común en aires acondicionados y electrodomésticos.",
    tip_title: "💡 ¿Necesitás adaptador desde Argentina?",
    tip_body: "Argentina usa enchufes <strong>Tipo I</strong> (2 enchufes en V). En USA el estándar es <strong>Tipo A/B</strong>, así que sí necesitás un adaptador universal. Los encontrás en cualquier ferretería o aeropuerto",
    no_trans_title: "✅ Dispositivos que NO necesitan transformador",
    items: [ "📱 Cargadores de celular", "💻 Laptops y tablets", "📷 Cámaras digitales", "🎧 Auriculares con USB" ],
    warn_title: "⚠️ Revisá antes de enchufar",
    warn_body: "Secadores de pelo, planchas y aparatos de 220V exclusivo <strong>sí necesitan transformador</strong>. Enchufar sin transformador puede dañar el dispositivo."
  },
  en: {
    intro: "The USA uses <strong>110V / 60Hz</strong>. If your device label says <strong>100–240V</strong>, you only need a universal adapter. If it says 220V only, you need a voltage converter.",
    typeA_title: "Type A — 2 flat pins",
    typeA_sub: "Most common in the USA, Mexico and Japan. No ground pin.",
    typeB_title: "Type B — 2 flat + 1 round pin",
    typeB_sub: "Same as Type A but with a ground pin. Common for air conditioners and appliances.",
    tip_title: "💡 Do you need an adapter from Argentina?",
    tip_body: "Argentina uses <strong>Type I</strong> plugs (2 angled pins). The USA standard is <strong>Type A/B</strong>, so yes, you need a universal adapter. Find them at any hardware store or airport.",
    no_trans_title: "✅ Devices that do NOT need a converter",
    items: [ "📱 Phone chargers", "💻 Laptops and tablets", "📷 Digital cameras", "🎧 USB headphones" ],
    warn_title: "⚠️ Check before plugging in",
    warn_body: "Hair dryers, straighteners and 220V-only appliances <strong>do need a voltage converter</strong>. Plugging in without one can damage the device."
  },
  pt: {
    intro: "Nos EUA usa-se <strong>110V / 60Hz</strong>. Se o seu dispositivo diz <strong>100–240V</strong> na etiqueta, você só precisa de um adaptador universal. Se diz apenas 220V, precisa de um transformador.",
    typeA_title: "Tipo A — 2 pinos planos",
    typeA_sub: "O mais comum nos EUA, México e Japão. Sem aterramento.",
    typeB_title: "Tipo B — 2 planos + 1 redondo",
    typeB_sub: "Igual ao Tipo A mas com aterramento. Muito comum em ar-condicionado e eletrodomésticos.",
    tip_title: "💡 Você precisa de adaptador vindo do Brasil?",
    tip_body: "O Brasil usa tomadas <strong>Tipo N</strong> (padrão NBR 14136). Nos EUA o padrão é <strong>Tipo A/B</strong>, então sim, você precisa de um adaptador universal. Encontre em qualquer loja de eletrônicos ou aeroporto.",
    no_trans_title: "✅ Dispositivos que NÃO precisam de transformador",
    items: [ "📱 Carregadores de celular", "💻 Laptops e tablets", "📷 Câmeras digitais", "🎧 Fones com USB" ],
    warn_title: "⚠️ Verifique antes de ligar",
    warn_body: "Secadores de cabelo, chapinhas e aparelhos de 220V exclusivo <strong>precisam de transformador</strong>. Ligar sem transformador pode danificar o aparelho."
  }
};

function renderAdaptador(lang) {
  const body = document.getElementById("adaptador-body");
  if (!body || body.style.display === "none") return;
  const c = adaptadorContent[lang] || adaptadorContent.es;
  body.innerHTML = `\n            <p style="font-size:.78rem;color:var(--text-sub);font-weight:600;margin-bottom:12px;line-height:1.5;">${c.intro}</p>\n            <div style="display:flex;flex-direction:column;gap:10px;">\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:12px;">\n                    <div style="font-size:1.6rem;flex-shrink:0;">🔌</div>\n                    <div>\n                        <div style="font-size:.8rem;font-weight:900;color:var(--text);">${c.typeA_title}</div>\n                        <div style="font-size:.72rem;color:var(--text-sub);font-weight:600;margin-top:3px;">${c.typeA_sub}</div>\n                    </div>\n                </div>\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:12px;">\n                    <div style="font-size:1.6rem;flex-shrink:0;">🔌</div>\n                    <div>\n                        <div style="font-size:.8rem;font-weight:900;color:var(--text);">${c.typeB_title}</div>\n                        <div style="font-size:.72rem;color:var(--text-sub);font-weight:600;margin-top:3px;">${c.typeB_sub}</div>\n                    </div>\n                </div>\n                <div style="background:var(--primary-dim);border:1.5px solid var(--primary);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.75rem;font-weight:800;color:var(--primary);margin-bottom:5px;">${c.tip_title}</div>\n                    <div style="font-size:.72rem;color:var(--text);font-weight:600;line-height:1.5;">${c.tip_body}</div>\n                </div>\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.75rem;font-weight:800;color:var(--text);margin-bottom:8px;">${c.no_trans_title}</div>\n                    <div style="display:flex;flex-direction:column;gap:4px;">\n                        ${c.items.map(i => `<div style="font-size:.72rem;color:var(--text-sub);font-weight:600;">${i}</div>`).join("")}\n                    </div>\n                </div>\n                <div style="background:rgba(239,68,68,.08);border:1.5px solid var(--danger);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.75rem;font-weight:800;color:var(--danger);margin-bottom:5px;">${c.warn_title}</div>\n                    <div style="font-size:.72rem;color:var(--text);font-weight:600;line-height:1.5;">${c.warn_body}</div>\n                </div>\n            </div>\n        `;
}

window.toggleAdaptador = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const t = i18n[lang];
  const body = document.getElementById("adaptador-body");
  const toggle = document.getElementById("adaptador-toggle");
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  toggle.textContent = isOpen ? t.adaptador_open || "▼ VER" : t.adaptador_close || "▲ OCULTAR";
  if (!isOpen) renderAdaptador(lang);
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

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  if (!currentUser) return;
  const lang = localStorage.getItem("appLang") || "es";
  const m = {
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
  };
  const t = m[lang] || m.es;
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    window.showAlert(t.s);
  } catch (er) {
    window.showAlert(t.e + er.message);
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

onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    if (!perfilId) {
      window.location.replace("profiles.html");
      return;
    }
    const perfilNombre = localStorage.getItem("perfilActivoNombre");
    document.getElementById("userEmail").innerText = perfilNombre || user.email;
    const img = perfilFoto || user.photoURL;
    if (img) {
      const btn = document.getElementById("btnSettings");
      btn.style.backgroundImage = `url(${img})`;
      btn.innerText = "";
    }
    try {
      const snap = await getDoc(doc(db, "usuarios", user.uid, "perfiles", perfilId));
      if (snap.exists() && snap.data().destino) {
        const sel = document.getElementById("citySelector");
        if (sel) sel.value = snap.data().destino.toLowerCase();
      }
    } catch (e) {}
    renderCityData();
    const tripSelect = document.getElementById("trip-filter-itinerary");
    tripSelect.addEventListener("change", () => {
      window.TripContext.select(user.uid, perfilId, tripSelect.value);
      location.reload();
    });
    window.TripContext.hydrate(db, user.uid, perfilId, getDocs, collection, refreshItineraryTrip);
    listenNotes();
    listenActivities();
    const lang = localStorage.getItem("appLang") || "es";
    window.changeLanguage(lang);
    setInterval(window.nextTip, 8e3);
    if (navigator.onLine && getPending().length > 0) flushPending();
    initReminderBanner();
    scheduleAllReminders();
  } else {
    try {
      await probeConnectivity();
      window.location.replace("login.html");
    } catch (e) {
      const pinHash = localStorage.getItem("taxusa_pin_hash");
      const pinEmail = localStorage.getItem("taxusa_offline_email");
      if (!pinHash || !pinEmail || !window.taxflyOfflineUnlocked()) {
        window.location.replace("login.html");
        return;
      }
      const nombre = localStorage.getItem("perfilActivoNombre") || pinEmail;
      const el = document.getElementById("userEmail");
      if (el) el.innerText = nombre;
      const foto = localStorage.getItem("perfilActivoFoto") || "";
      if (foto) {
        const btn = document.getElementById("btnSettings");
        if (btn) {
          btn.style.backgroundImage = `url(${foto})`;
          btn.innerText = "";
        }
      }
      renderCityData();
      const lang = localStorage.getItem("appLang") || "es";
      window.changeLanguage(lang);
    }
  }
});

const REMINDERS_KEY = "taxfly_reminders_" + (perfilId || "default");

function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveReminders(obj) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(obj));
}

function isReminderOn(actId) {
  return !!loadReminders()[actId];
}

function initReminderBanner() {
  if (!("Notification" in window)) return;
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  const banner = document.getElementById("reminder-banner");
  if (!banner) return;
  document.getElementById("rbn-title").textContent = T.rbn_title || "Activá los recordatorios";
  document.getElementById("rbn-sub").textContent = T.rbn_sub || "Te avisamos antes de cada actividad";
  document.getElementById("rbn-action").textContent = T.rbn_action || "ACTIVAR";
  if (Notification.permission !== "granted") {
    banner.style.display = "flex";
  } else {
    banner.style.display = "none";
  }
}

window.pedirPermisoRecordatorios = async function() {
  if (!("Notification" in window)) return;
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  const result = await Notification.requestPermission();
  if (result === "granted") {
    document.getElementById("reminder-banner").style.display = "none";
    scheduleAllReminders();
    showReminderToast("🔔 " + (T.rbn_title || "Recordatorios activados"));
  } else {
    showAlert(T.reminder_denied || "Activá las notificaciones desde los ajustes del navegador.");
  }
};

window.toggleReminder = function(actId, actName, actDate, actTime) {
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  if (!("Notification" in window)) return;
  if (!actTime) {
    showReminderToast(T.reminder_no_time || "Agregá un horario para activar el recordatorio.");
    return;
  }
  if (Notification.permission !== "granted") {
    pedirPermisoRecordatorios();
    return;
  }
  const reminders = loadReminders();
  const wasOn = !!reminders[actId];
  if (wasOn) {
    delete reminders[actId];
    saveReminders(reminders);
    showReminderToast(T.bell_off || "🔕 Recordatorio cancelado");
  } else {
    reminders[actId] = {
      name: actName,
      date: actDate,
      time: actTime
    };
    saveReminders(reminders);
    showReminderToast(T.bell_on || "🔔 Recordatorio activado");
  }
  const bellBtn = document.querySelector(`#act-item-${actId} .act-bell`);
  if (bellBtn) bellBtn.classList.toggle("on", !wasOn);
  scheduleAllReminders();
};

const _reminderTimers = {};

function scheduleAllReminders() {
  if (Notification.permission !== "granted") return;
  const reminders = loadReminders();
  const lang = localStorage.getItem("appLang") || "es";
  const T = i18n[lang] || i18n.es;
  Object.values(_reminderTimers).forEach(ids => ids.forEach(clearTimeout));
  for (const k in _reminderTimers) delete _reminderTimers[k];
  const now = Date.now();
  Object.entries(reminders).forEach(([actId, info]) => {
    if (!info.date || !info.time) return;
    const actMs = new Date(`${info.date}T${info.time}:00`).getTime();
    if (isNaN(actMs)) return;
    const timers = [];
    const dayBefore = actMs - 24 * 60 * 60 * 1e3;
    const msUntilDay = dayBefore - now;
    if (msUntilDay > 0 && msUntilDay < 7 * 24 * 60 * 60 * 1e3) {
      const title = (T.reminder_day_before || "Mañana: {name} a las {time}").replace("{name}", info.name).replace("{time}", info.time);
      timers.push(setTimeout(() => {
        fireNotification(title, T.reminder_body_day || "Recordatorio de tu itinerario TaxUSA", actId);
      }, msUntilDay));
    }
    const hourBefore = actMs - 60 * 60 * 1e3;
    const msUntilHour = hourBefore - now;
    if (msUntilHour > 0 && msUntilHour < 7 * 24 * 60 * 60 * 1e3) {
      const title = (T.reminder_hour_before || "En 1 hora: {name}").replace("{name}", info.name);
      timers.push(setTimeout(() => {
        fireNotification(title, T.reminder_body_hour || "Recordatorio de tu itinerario TaxUSA", actId);
      }, msUntilHour));
    }
    if (timers.length) _reminderTimers[actId] = timers;
  });
}

async function fireNotification(title, body, actId) {
  if (Notification.permission !== "granted") return;
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: body,
        icon: "./assets/icon-192.png",
        badge: "./assets/icon-192.png",
        tag: "reminder-" + actId,
        renotify: true,
        vibrate: [ 200, 100, 200 ],
        data: {
          url: "./lugares.html"
        }
      });
      return;
    } catch (e) {}
  }
  new Notification(title, {
    body: body,
    icon: "./assets/icon-192.png"
  });
}

function showReminderToast(msg) {
  const t = document.getElementById("reminder-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") scheduleAllReminders();
});
