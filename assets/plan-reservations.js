
const RESERVATIONS_KEY = "trip-reservations-v1";
const reservationGroups = [
  { id: "flight", title: "Vuelos", icon: "plane", empty: "Agregá la aerolínea y el acceso a tu reserva." },
  { id: "stay", title: "Alojamiento", icon: "home", empty: "Guardá el hotel, resort o Airbnb donde vas a estar." },
  { id: "other", title: "Otros", icon: "file", empty: "Traslados, excursiones u otras reservas del viaje." }
];
let reservations = [];
let reservationFormType = null;
let reservationEditingId = null;
const reservationOpen = new Set();

window.reservationsInit = function() {
  const saved = syncedLoad(RESERVATIONS_KEY, window._reservationsFromFb);
  reservations = Array.isArray(saved?.items) ? saved.items : window.TaxflyTravel.readReservations(window._taxflyTripUid,window._perfilId,window._tripId);
  window.TaxflyTravel.writeReservations(window._taxflyTripUid,window._perfilId,window._tripId,reservations);
  renderReservations();
};

window._setReservationsData = function(data) {
  if (!Array.isArray(data?.items)) return;
  reservations = data.items;
  try{localStorage.setItem(scopedKey(RESERVATIONS_KEY),JSON.stringify(data));}catch(_){}
  window.TaxflyTravel.writeReservations(window._taxflyTripUid,window._perfilId,window._tripId,reservations);
  renderReservations();
};
window.reservationsExport = () => reservations;
window.reservationsImport = function(items) {
  if (!Array.isArray(items)) return;
  reservations = items.filter(item => item && ["flight", "stay", "other"].includes(item.type) && typeof item.name === "string");
  syncedSave(RESERVATIONS_KEY, { items: reservations }, "reservations");
  renderReservations();
};

function reservationDate(value) {
  if (!value) return "";
  const d = new Date(value + "T12:00:00");
  const locale = { es: "es-AR", en: "en-US", pt: "pt-BR" }[window.I18N?.lang || localStorage.getItem("appLang")] || "es-AR";
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function reservationUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (_) { return ""; }
}

const reservationAirlines = [
  { name: "Aerolíneas Argentinas", code: "AR", aliases: ["aerolineas argentinas", "aerolineas"] },
  { name: "American Airlines", code: "AA", aliases: ["american airlines", "american"] },
  { name: "Avianca", code: "AV", aliases: ["avianca"] },
  { name: "United Airlines", code: "UA", aliases: ["united airlines", "united"] },
  { name: "LATAM", code: "LA", aliases: ["latam airlines", "latam"] },
  { name: "Delta Air Lines", code: "DL", aliases: ["delta air lines", "delta airlines", "delta"] },
  { name: "JetSMART", code: "JA", aliases: ["jetsmart"] },
  { name: "Flybondi", code: "FO", aliases: ["flybondi"] },
  { name: "Copa Airlines", code: "CM", aliases: ["copa airlines", "copa"] },
  { name: "Gol", code: "G3", aliases: ["gol linhas aereas", "gol"] },
  { name: "Azul", code: "AD", aliases: ["azul linhas aereas", "azul"] },
  { name: "Air Canada", code: "AC", aliases: ["air canada"] },
  { name: "Air France", code: "AF", aliases: ["air france"] },
  { name: "KLM", code: "KL", aliases: ["klm"] },
  { name: "Iberia", code: "IB", aliases: ["iberia"] },
  { name: "British Airways", code: "BA", aliases: ["british airways"] },
  { name: "Lufthansa", code: "LH", aliases: ["lufthansa"] },
  { name: "Turkish Airlines", code: "TK", aliases: ["turkish airlines", "turkish"] },
  { name: "Emirates", code: "EK", aliases: ["emirates"] },
  { name: "Qatar Airways", code: "QR", aliases: ["qatar airways", "qatar"] },
  { name: "Aeroméxico", code: "AM", aliases: ["aeromexico"] },
  { name: "Volaris", code: "Y4", aliases: ["volaris"] },
  { name: "Viva Aerobus", code: "VB", aliases: ["viva aerobus", "vivaaerobus"] },
  { name: "Spirit Airlines", code: "NK", aliases: ["spirit airlines", "spirit"] },
  { name: "Frontier Airlines", code: "F9", aliases: ["frontier airlines", "frontier"] },
  { name: "Southwest Airlines", code: "WN", aliases: ["southwest airlines", "southwest"] },
  { name: "JetBlue", code: "B6", aliases: ["jetblue airways", "jetblue"] },
  { name: "Alaska Airlines", code: "AS", aliases: ["alaska airlines", "alaska"] },
  { name: "Sky Airline", code: "H2", aliases: ["sky airline"] },
  { name: "Arajet", code: "DM", aliases: ["arajet"] },
  { name: "Wingo", code: "P5", aliases: ["wingo"] },
  { name: "TAP Air Portugal", code: "TP", aliases: ["tap air portugal", "tap portugal", "tap"] },
  { name: "Air Europa", code: "UX", aliases: ["air europa"] },
  { name: "ITA Airways", code: "AZ", aliases: ["ita airways"] },
  { name: "Swiss", code: "LX", aliases: ["swiss international air lines", "swiss"] },
  { name: "Level", code: "LL", aliases: ["level"] },
  { name: "Wizz Air", code: "W6", aliases: ["wizz air"] },
  { name: "Ryanair", code: "FR", aliases: ["ryanair"] },
  { name: "EasyJet", code: "U2", aliases: ["easyjet"] }
];

function reservationAirlineMatches(name) {
  const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const found = new Set();
  for (const part of String(name || "").split(/\s*\/\s*/)) {
    const value = normalize(part);
    const carrier = reservationAirlines.find(airline =>
      airline.aliases.some(alias => value === alias || value.startsWith(alias + " ") ||
        value.startsWith(alias + "-") || value.startsWith(alias + "·") || value.startsWith(alias + "–"))
    );
    if (carrier) found.add(carrier);
  }
  return [...found];
}

function reservationAirlineLogos(name) {
  const airlines = reservationAirlineMatches(name);
  if (!airlines.length) return "";
  return `<span class="reservation-airline-logos" aria-label="Aerolíneas: ${escapeHtml(airlines.map(a => a.name).join(", "))}">${airlines.map(airline =>
    `<span class="reservation-airline-logo"><img src="https://images.kiwi.com/airlines/64/${airline.code}.png" alt="${escapeHtml(airline.name)}" title="${escapeHtml(airline.name)}" loading="lazy" onerror="this.parentElement.remove()"></span>`
  ).join("")}</span>`;
}

const reservationStayBrands = [
  { name: "Airbnb", aliases: ["airbnb"], icon: "https://cdn.simpleicons.org/airbnb/FF5A5F" },
  { name: "Hilton", aliases: ["hilton", "hampton inn", "hampton by hilton", "doubletree", "embassy suites", "homewood suites", "home2 suites"], icon: "https://cdn.simpleicons.org/hiltonhotelsandresorts/231F20" },
  { name: "Marriott", aliases: ["marriott", "courtyard", "sheraton", "westin", "residence inn", "fairfield inn", "springhill suites", "ritz-carlton"], icon: "https://cdn.simpleicons.org/marriott/9D1B3A" },
  { name: "Hyatt", aliases: ["hyatt"], domain: "hyatt.com" },
  { name: "Holiday Inn", aliases: ["holiday inn"], domain: "ihg.com" },
  { name: "InterContinental", aliases: ["intercontinental"], domain: "ihg.com" },
  { name: "Wyndham", aliases: ["wyndham"], domain: "wyndhamhotels.com" },
  { name: "Best Western", aliases: ["best western"], domain: "bestwestern.com" },
  { name: "Accor", aliases: ["accor", "novotel", "ibis", "mercure", "sofitel"], domain: "all.accor.com" },
  { name: "Radisson", aliases: ["radisson"], domain: "radissonhotels.com" },
  { name: "Four Seasons", aliases: ["four seasons"], domain: "fourseasons.com" },
  { name: "Rosen Hotels", aliases: ["rosen inn", "rosen centre", "rosen plaza", "rosen shingle creek"], domain: "rosenhotels.com" }
];

function reservationStayBrand(name) {
  const normalized = String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = ` ${normalized.replace(/[^a-z0-9]+/g, " ").trim()} `;
  return reservationStayBrands.find(brand => brand.aliases.some(alias => words.includes(` ${alias} `))) || null;
}

function reservationStayLogo(name) {
  const brand = reservationStayBrand(name);
  if (!brand) return "";
  const src = brand.icon || `https://${brand.domain}/favicon.ico`;
  return `<span class="reservation-airline-logos"><span class="reservation-airline-logo"><img src="${escapeHtml(src)}" alt="${escapeHtml(brand.name)}" title="${escapeHtml(brand.name)}" loading="lazy" onerror="this.closest('.reservation-airline-logos').remove()"></span></span>`;
}

function reservationMapLink(address) {
  return tripMapLink(address);
}

function reservationCard(item) {
  const href = reservationUrl(item.url);
  const travel=window.TaxflyTravel, paid=travel.paid(item,window._tripExpenses||[],window._tripId);
  const total=Number(item.totalPrice)||0;
  const zoneInfo=item.departureTime?`Salida ${item.departureTime} · hora de ${item.departureCity||item.departureZone}`:"";
  const arrival=item.arrivalTime?`Llegada ${item.arrivalDate||""} ${item.arrivalTime} · hora de ${item.arrivalCity||item.arrivalZone}`:"";
  const docs = (window._tripDocuments || []).filter(d => d.linkExplicit ? d.reservationId === item.id : d.id === item.documentId || d.reservationId === item.id);
  const dates = [reservationDate(item.startDate), reservationDate(item.endDate)].filter(Boolean).join(" – ");
  return `<article class="reservation-card" id="reservation-${escapeHtml(item.id)}">
    <div class="reservation-card-top"><div class="reservation-flight-title">${item.type === "flight" ? reservationAirlineLogos(item.name) : item.type === "stay" ? reservationStayLogo(item.name) : ""}<strong>${escapeHtml(item.name)}</strong></div>
      <div class="reservation-actions"><button type="button" data-res-action="edit" data-res-id="${escapeHtml(item.id)}" aria-label="Editar ${escapeHtml(item.name)}">${ic("pencil", 15)}</button><button type="button" data-res-action="delete" data-res-id="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.name)}">${ic("x", 15)}</button></div></div>
    ${dates ? `<div class="reservation-meta">${ic("calendar", 14)} ${escapeHtml(dates)}</div>` : ""}
    ${zoneInfo ? `<div class="reservation-meta">${escapeHtml(zoneInfo)}</div>` : ""}
    ${arrival ? `<div class="reservation-meta">${escapeHtml(arrival)}</div>` : ""}
    <div class="reservation-meta">Total: ${item.totalPrice!==null && item.totalPrice!==undefined ? 'USD '+total.toFixed(2) : 'sin precio'} · Pagado: USD ${paid.toFixed(2)} · Pendiente: ${item.totalPrice!==null && item.totalPrice!==undefined ? 'USD '+Math.max(0,total-paid).toFixed(2) : 'completá el precio'}</div>
    ${item.provider ? `<div class="reservation-meta">Proveedor: ${escapeHtml(item.provider)}</div>` : ""}
    ${item.reference ? `<div class="reservation-meta">Código: <b>${escapeHtml(item.reference)}</b></div>` : ""}
    ${item.address ? `<div class="reservation-meta">${ic("pin", 14)} ${escapeHtml(item.address)}</div>` : ""}
    ${item.notes ? `<p class="reservation-notes">${escapeHtml(item.notes)}</p>` : ""}
    <div class="reservation-footer">${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${ic("link", 15)} Abrir reserva</a>` : "<span class=\"reservation-no-link\">Sin enlace cargado</span>"}
      ${docs.map(d => `<a href="tickets.html?doc=${encodeURIComponent(d.id)}">${ic("file", 14)} ${escapeHtml(d.name || "Documento")}</a>`).join("")}
      <button type="button" data-res-action="payment" data-res-id="${escapeHtml(item.id)}">${paid>0?"Ver / editar pago":"Registrar pago"}</button>
      <button type="button" data-res-action="attach" data-res-id="${escapeHtml(item.id)}">${ic("plus", 14)} Adjuntar documento</button>
      ${item.type === "stay" && item.address ? `<button type="button" data-res-action="starting-point" data-res-id="${escapeHtml(item.id)}">Usar como punto de partida</button>${reservationMapLink(item.address)}` : ""}
    </div>
  </article>`;
}

function reservationForm(type, item) {
  const stay = type === "stay", flight = type === "flight";
  const dest=window.TaxflyTravel.destination(window._trip);
  const nameLabel = flight ? "Aerolínea / vuelo" : stay ? "Nombre del alojamiento" : "Nombre de la reserva";
  const nameHint = flight ? "Ej.: LATAM · LA8123" : stay ? "Ej.: Hotel o Airbnb" : "Ej.: Traslado al aeropuerto";
  return `<form class="reservation-form" id="reservation-form" data-type="${type}">
    <div class="reservation-form-head"><h3>${item ? "Editar reserva" : "Nueva reserva"}</h3><button type="button" id="reservation-cancel" aria-label="Cerrar formulario">${ic("x", 17)}</button></div>
    <label>${nameLabel}<input name="reservationTitle" autocomplete="new-password" required maxlength="90" placeholder="${nameHint}" value="${escapeHtml(item?.name || "")}">${flight ? `<small>Si viajás con dos aerolíneas, separalas con / (ej.: Avianca / American Airlines).</small><span class="reservation-airline-preview" aria-live="polite">${reservationAirlineLogos(item?.name)}</span>` : stay ? `<span class="reservation-airline-preview" aria-live="polite">${reservationStayLogo(item?.name)}</span>` : ""}</label>
    <div class="reservation-form-dates"><label>${flight ? "Fecha del vuelo" : "Desde"}<input name="startDate" type="date" value="${escapeHtml(item?.startDate || "")}"></label><label>${flight ? "Regreso (opcional)" : "Hasta (opcional)"}<input name="endDate" type="date" value="${escapeHtml(item?.endDate || "")}"></label></div>
    <label>Precio total (USD, opcional)<input name="totalPrice" type="number" min="0" step="0.01" value="${item?.totalPrice??''}"><small>El precio no genera un gasto hasta que registres el pago.</small></label>
    <label>Proveedor<input name="provider" maxlength="100" value="${escapeHtml(item?.provider||'')}" placeholder="Aerolínea, hotel o empresa"></label>
    ${window.TaxflyTravel.zoneFields('departure',item?.departureCity||dest.city,item?.departureZone||dest.timeZone)}
    <label>${flight?'Hora de salida':'Hora local del evento'}<input name="departureTime" type="time" value="${escapeHtml(item?.departureTime||'')}"></label>
    ${flight?`<label>Fecha de llegada<input name="arrivalDate" type="date" value="${escapeHtml(item?.arrivalDate||'')}"></label><label>Hora de llegada<input name="arrivalTime" type="time" value="${escapeHtml(item?.arrivalTime||'')}"></label>${window.TaxflyTravel.zoneFields('arrival',item?.arrivalCity||dest.city,item?.arrivalZone||dest.timeZone)}`:''}
    <label>Código de reserva (opcional)<input name="reference" maxlength="50" autocomplete="off" placeholder="Localizador o número de confirmación" value="${escapeHtml(item?.reference || "")}"></label>
    ${stay ? `<label>Dirección del alojamiento (opcional)<input name="lodgingLocation" autocomplete="new-password" maxlength="180" placeholder="Calle, ciudad y estado" value="${escapeHtml(item?.address || "")}"></label>` : ""}
    <label>Enlace a mi reserva (opcional)<input name="url" type="url" inputmode="url" placeholder="https://…" value="${escapeHtml(item?.url || "")}"><small>Puede ser el enlace de la aerolínea, Airbnb o el sitio del alojamiento.</small></label>
    <label>Notas (opcional)<textarea name="notes" maxlength="400" rows="2" placeholder="Check-in, horario o dato útil">${escapeHtml(item?.notes || "")}</textarea></label>
    <label>Documento existente (opcional)<select name="documentId"><option value="">Sin documento vinculado</option>${(window._tripDocuments || []).map(d => `<option value="${escapeHtml(d.id)}"${item?.documentId === d.id ? " selected" : ""}>${escapeHtml(d.name || "Documento")}</option>`).join("")}</select><small>Elegí uno existente o adjuntá un archivo nuevo.</small></label>
    <label>Adjuntar PDF o imagen (opcional)<input name="quickFile" type="file" accept="application/pdf,image/*"><small>Se guardará en Documentos y quedará vinculado a esta reserva.</small></label>
    <div class="reservation-form-actions"><button type="button" id="reservation-cancel-bottom">Cancelar</button><button type="submit">Guardar reserva</button></div>
  </form>`;
}

function renderReservations() {
  const panel = document.getElementById("panel-reservas");
  if (!panel) return;
  const linkedItem = reservations.find(r => r.id === new URLSearchParams(location.search).get("reservation"));
  panel.innerHTML = `<div class="reservations-intro"><h2>Reservas del viaje</h2><p>Todo lo que necesitás para abrir tus reservas, organizado por viaje.</p></div>` + reservationGroups.map(group => {
    const entries = reservations.filter(item => item.type === group.id);
    const selected = reservationFormType === group.id;
    const open = selected || reservationOpen.has(group.id) || (linkedItem && linkedItem.type === group.id);
    return `<section class="reservation-group${open ? " is-open" : ""}"><div class="reservation-group-head" data-res-toggle="${group.id}" role="button" tabindex="0" aria-expanded="${open ? "true" : "false"}"><span class="reservation-group-icon">${ic(group.icon, 19)}</span><div><h3>${group.title}</h3><small>${entries.length} ${entries.length === 1 ? "reserva" : "reservas"}</small></div><button type="button" class="reservation-add" data-res-action="add" data-res-type="${group.id}">${ic("plus", 15)} Agregar</button><span class="reservation-chevron" aria-hidden="true"></span></div><div class="reservation-body">
      ${entries.length ? `<div class="reservation-list">${entries.map(reservationCard).join("")}</div>` : `<p class="reservation-empty">${group.empty}</p>`}
      ${selected ? reservationForm(group.id, reservations.find(r => r.id === reservationEditingId)) : ""}</div></section>`;
  }).join("");
  panel.querySelectorAll("[data-res-action]").forEach(button => button.addEventListener("click", onReservationAction));
  panel.querySelectorAll("[data-res-toggle]").forEach(head => {
    const toggle = () => {
      const id = head.dataset.resToggle;
      if (reservationFormType === id) return; // con el formulario abierto el grupo queda abierto
      const section = head.closest(".reservation-group");
      const nowOpen = !section.classList.contains("is-open");
      section.classList.toggle("is-open", nowOpen);
      head.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      if (nowOpen) reservationOpen.add(id); else reservationOpen.delete(id);
    };
    head.addEventListener("click", e => { if (e.target.closest(".reservation-add")) return; toggle(); });
    head.addEventListener("keydown", e => {
      if (e.target !== head || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault(); toggle();
    });
  });
  const form = panel.querySelector("#reservation-form");
  if (form) {
    form.addEventListener("submit", saveReservation);
    if (reservationFormType === "flight") {
      const nameInput = form.elements.reservationTitle;
      nameInput.addEventListener("input", () => {
        form.querySelector(".reservation-airline-preview").innerHTML = reservationAirlineLogos(nameInput.value);
      });
    } else if (reservationFormType === "stay") {
      const nameInput = form.elements.reservationTitle;
      nameInput.addEventListener("input", () => {
        form.querySelector(".reservation-airline-preview").innerHTML = reservationStayLogo(nameInput.value);
      });
    }
    const cancel = () => { reservationFormType = null; reservationEditingId = null; renderReservations(); };
    form.querySelector("#reservation-cancel").addEventListener("click", cancel);
    form.querySelector("#reservation-cancel-bottom").addEventListener("click", cancel);
  }
  const params = new URLSearchParams(location.search);
  const linkedId = params.get("reservation");
  if (linkedId && reservations.some(r => r.id === linkedId)) {
    params.delete("reservation");
    history.replaceState(null, "", location.pathname + (params.size ? "?" + params : ""));
    setTimeout(() => document.getElementById("reservation-" + linkedId)?.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
  }
}
window.renderReservations = renderReservations;

async function onReservationAction(event) {
  const button = event.currentTarget;
  const action = button.dataset.resAction;
  const item = reservations.find(r => r.id === button.dataset.resId);
  if (action === "add" || action === "edit") {
    reservationFormType = item?.type || button.dataset.resType;
    reservationEditingId = item?.id || null;
    reservationOpen.add(reservationFormType);
    renderReservations();
    document.querySelector("#reservation-form input[name=reservationTitle]")?.focus();
    return;
  }
  if (!item) return;
  if (action === "payment") { location.href="compras.html?reservation="+encodeURIComponent(item.id)+"&trip="+encodeURIComponent(window._tripId);return; }
  if (action === "attach") {
    window.openAttachChoice?.(item.id, item.name);
    return;
  }
  if (action === "starting-point") {
    hotel.addr = item.address;
    hotel.url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(item.address);
    hotelSave();
    renderOutlets();
    showMToast("Punto de partida actualizado");
    return;
  }
  if (action === "delete") {
    const ok = await showConfirm("Se va a eliminar esta reserva del viaje.", "¿Eliminar reserva?", "Eliminar");
    if (!ok) return;
    reservations = reservations.filter(r => r.id !== item.id);
    syncedSave(RESERVATIONS_KEY, { items: reservations }, "reservations");
    renderReservations();
    showMToast("Reserva eliminada");
  }
}

async function saveReservation(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const name = values.reservationTitle.trim();
  if (!name) return;
  const url = values.url.trim();
  if (url && !reservationUrl(url)) {
    form.elements.url.setCustomValidity("Usá un enlace que empiece con https:// o http://");
    form.elements.url.reportValidity();
    form.elements.url.addEventListener("input", () => form.elements.url.setCustomValidity(""), { once: true });
    return;
  }
  if(values.startDate&&values.endDate&&values.endDate<values.startDate){showMToast("La fecha final debe ser posterior a la inicial.");return;}
  const existing = reservations.find(r => r.id === reservationEditingId);
  if(values.departureTime && !Number.isFinite(window.TaxflyTravel.instant(values.startDate,values.departureTime,values.departureZone))) {showMToast("Revisá la fecha y hora de salida: ese horario no existe en la zona elegida.");return;}
  if(values.arrivalTime && (!Number.isFinite(window.TaxflyTravel.instant(values.arrivalDate,values.arrivalTime,values.arrivalZone)) || (values.departureTime && window.TaxflyTravel.instant(values.arrivalDate,values.arrivalTime,values.arrivalZone)<window.TaxflyTravel.instant(values.startDate,values.departureTime,values.departureZone)))) {showMToast("Revisá la llegada: debe tener fecha y ser posterior a la salida en su zona horaria.");return;}
  const item = {
    ...existing,
    totalPrice:values.totalPrice===''?null:Number(values.totalPrice), currency:"USD", provider:values.provider.trim(),
    departureCity:values.departureCity.trim(),departureZone:values.departureZone,departureTime:values.departureTime||"",
    arrivalCity:values.arrivalCity?.trim()||"",arrivalZone:values.arrivalZone||"",arrivalDate:values.arrivalDate||"",arrivalTime:values.arrivalTime||"",
    id: existing?.id || (crypto.randomUUID?.() || "res-" + Date.now() + "-" + Math.random().toString(36).slice(2)),
    type: reservationFormType,
    name,
    startDate: values.startDate || "",
    endDate: values.endDate || "",
    reference: values.reference.trim(),
    address: values.lodgingLocation?.trim() || "",
    url: reservationUrl(url),
    notes: values.notes.trim(),
    documentId: values.documentId || ""
  };
  const attached = form.elements.quickFile?.files?.[0];
  if (attached && !/^image\//.test(attached.type) && attached.type !== "application/pdf") {
    form.elements.quickFile.setCustomValidity("Elegí un PDF o una imagen");
    form.elements.quickFile.reportValidity(); return;
  }
  if (attached) {
    try {
      const req = indexedDB.open("taxfly_docs_db", 1);
      const db = await new Promise((resolve, reject) => {
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains("kv")) req.result.createObjectStore("kv"); };
        req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put({uid:window._taxflyTripUid || window._uid, profile:window._perfilId, tripId:window._tripId || 'orlando', reservationId:item.id, name:item.name, file:attached}, "taxfly-quick-attachment");
        tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
      }); db.close();
    } catch(e) { showMToast("No se pudo guardar el archivo en este dispositivo. Volvé a elegirlo."); return; }
  }
  reservations = existing ? reservations.map(r => r.id === item.id ? item : r) : [...reservations, item];
  syncedSave(RESERVATIONS_KEY, { items: reservations }, "reservations");
  reservationFormType = null;
  reservationEditingId = null;
  renderReservations();
  if (attached) location.href = "tickets.html?reservation=" + encodeURIComponent(item.id) + "&quick=1";
  else showMToast("Reserva guardada");
}

window.I18N?.onChange(() => { if (!reservationFormType) renderReservations(); });
