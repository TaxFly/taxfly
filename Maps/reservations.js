/* Reservations belong to the active Trip Planning profile and trip. */
const RESERVATIONS_KEY = "trip-reservations-v1";
const reservationGroups = [
  { id: "flight", title: "Vuelos", icon: "plane", empty: "Agregá la aerolínea y el acceso a tu reserva." },
  { id: "stay", title: "Alojamiento", icon: "home", empty: "Guardá el hotel, resort o Airbnb donde vas a estar." },
  { id: "other", title: "Otros", icon: "file", empty: "Traslados, excursiones u otras reservas del viaje." }
];
let reservations = [];
let reservationFormType = null;
let reservationEditingId = null;

window.reservationsInit = function() {
  const saved = syncedLoad(RESERVATIONS_KEY, window._reservationsFromFb);
  reservations = Array.isArray(saved?.items) ? saved.items : [];
  renderReservations();
};

window._setReservationsData = function(data) {
  if (!Array.isArray(data?.items)) return;
  reservations = data.items;
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
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function reservationUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (_) { return ""; }
}

function reservationCard(item) {
  const href = reservationUrl(item.url);
  const dates = [reservationDate(item.startDate), reservationDate(item.endDate)].filter(Boolean).join(" – ");
  return `<article class="reservation-card">
    <div class="reservation-card-top"><strong>${escapeHtml(item.name)}</strong>
      <div class="reservation-actions"><button type="button" data-res-action="edit" data-res-id="${escapeHtml(item.id)}" aria-label="Editar ${escapeHtml(item.name)}">${ic("pencil", 15)}</button><button type="button" data-res-action="delete" data-res-id="${escapeHtml(item.id)}" aria-label="Eliminar ${escapeHtml(item.name)}">${ic("x", 15)}</button></div></div>
    ${dates ? `<div class="reservation-meta">${ic("calendar", 14)} ${escapeHtml(dates)}</div>` : ""}
    ${item.reference ? `<div class="reservation-meta">Código: <b>${escapeHtml(item.reference)}</b></div>` : ""}
    ${item.address ? `<div class="reservation-meta">${ic("pin", 14)} ${escapeHtml(item.address)}</div>` : ""}
    ${item.notes ? `<p class="reservation-notes">${escapeHtml(item.notes)}</p>` : ""}
    <div class="reservation-footer">${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${ic("link", 15)} Abrir reserva</a>` : "<span class=\"reservation-no-link\">Sin enlace cargado</span>"}
      ${item.type === "stay" && item.address ? `<button type="button" data-res-action="starting-point" data-res-id="${escapeHtml(item.id)}">Usar como punto de partida</button>` : ""}
    </div>
  </article>`;
}

function reservationForm(type, item) {
  const stay = type === "stay", flight = type === "flight";
  const nameLabel = flight ? "Aerolínea / vuelo" : stay ? "Nombre del alojamiento" : "Nombre de la reserva";
  const nameHint = flight ? "Ej.: LATAM · LA8123" : stay ? "Ej.: Hotel o Airbnb" : "Ej.: Traslado al aeropuerto";
  return `<form class="reservation-form" id="reservation-form" data-type="${type}">
    <div class="reservation-form-head"><h3>${item ? "Editar reserva" : "Nueva reserva"}</h3><button type="button" id="reservation-cancel" aria-label="Cerrar formulario">${ic("x", 17)}</button></div>
    <label>${nameLabel}<input name="name" required maxlength="90" placeholder="${nameHint}" value="${escapeHtml(item?.name || "")}"></label>
    <div class="reservation-form-dates"><label>${flight ? "Fecha del vuelo" : "Desde"}<input name="startDate" type="date" value="${escapeHtml(item?.startDate || "")}"></label><label>${flight ? "Regreso (opcional)" : "Hasta (opcional)"}<input name="endDate" type="date" value="${escapeHtml(item?.endDate || "")}"></label></div>
    <label>Código de reserva (opcional)<input name="reference" maxlength="50" autocomplete="off" placeholder="Localizador o número de confirmación" value="${escapeHtml(item?.reference || "")}"></label>
    ${stay ? `<label>Dirección del alojamiento (opcional)<input name="address" maxlength="180" placeholder="Calle, ciudad y estado" value="${escapeHtml(item?.address || "")}"></label>` : ""}
    <label>Enlace a mi reserva (opcional)<input name="url" type="url" inputmode="url" placeholder="https://…" value="${escapeHtml(item?.url || "")}"><small>Puede ser el enlace de la aerolínea, Airbnb o el sitio del alojamiento.</small></label>
    <label>Notas (opcional)<textarea name="notes" maxlength="400" rows="2" placeholder="Check-in, horario o dato útil">${escapeHtml(item?.notes || "")}</textarea></label>
    <div class="reservation-form-actions"><button type="button" id="reservation-cancel-bottom">Cancelar</button><button type="submit">Guardar reserva</button></div>
  </form>`;
}

function renderReservations() {
  const panel = document.getElementById("panel-reservas");
  if (!panel) return;
  panel.innerHTML = `<div class="reservations-intro"><h2>Reservas del viaje</h2><p>Todo lo que necesitás para abrir tus reservas, organizado por viaje.</p></div>` + reservationGroups.map(group => {
    const entries = reservations.filter(item => item.type === group.id);
    const selected = reservationFormType === group.id;
    return `<section class="reservation-group"><div class="reservation-group-head"><span class="reservation-group-icon">${ic(group.icon, 19)}</span><div><h3>${group.title}</h3><small>${entries.length} ${entries.length === 1 ? "reserva" : "reservas"}</small></div><button type="button" class="reservation-add" data-res-action="add" data-res-type="${group.id}">${ic("plus", 15)} Agregar</button></div>
      ${entries.length ? `<div class="reservation-list">${entries.map(reservationCard).join("")}</div>` : `<p class="reservation-empty">${group.empty}</p>`}
      ${selected ? reservationForm(group.id, reservations.find(r => r.id === reservationEditingId)) : ""}</section>`;
  }).join("");
  panel.querySelectorAll("[data-res-action]").forEach(button => button.addEventListener("click", onReservationAction));
  const form = panel.querySelector("#reservation-form");
  if (form) {
    form.addEventListener("submit", saveReservation);
    const cancel = () => { reservationFormType = null; reservationEditingId = null; renderReservations(); };
    form.querySelector("#reservation-cancel").addEventListener("click", cancel);
    form.querySelector("#reservation-cancel-bottom").addEventListener("click", cancel);
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
    renderReservations();
    document.querySelector("#reservation-form input[name=name]")?.focus();
    return;
  }
  if (!item) return;
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

function saveReservation(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const name = values.name.trim();
  if (!name) return;
  const url = values.url.trim();
  if (url && !reservationUrl(url)) {
    form.elements.url.setCustomValidity("Usá un enlace que empiece con https:// o http://");
    form.elements.url.reportValidity();
    form.elements.url.addEventListener("input", () => form.elements.url.setCustomValidity(""), { once: true });
    return;
  }
  const existing = reservations.find(r => r.id === reservationEditingId);
  const item = {
    id: existing?.id || (crypto.randomUUID?.() || "res-" + Date.now() + "-" + Math.random().toString(36).slice(2)),
    type: reservationFormType,
    name,
    startDate: values.startDate || "",
    endDate: values.endDate || "",
    reference: values.reference.trim(),
    address: values.address?.trim() || "",
    url: reservationUrl(url),
    notes: values.notes.trim()
  };
  reservations = existing ? reservations.map(r => r.id === item.id ? item : r) : [...reservations, item];
  syncedSave(RESERVATIONS_KEY, { items: reservations }, "reservations");
  reservationFormType = null;
  reservationEditingId = null;
  renderReservations();
  showMToast("Reserva guardada");
}
