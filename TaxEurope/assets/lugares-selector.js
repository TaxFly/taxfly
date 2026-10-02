const SELECTOR_TO_CITY_ID = {
  orlando: "orlando",
  nyc: "newyork",
  miami: "miami",
  vegas: "lasvegas",
  la: "losangeles",
  sf: "sanfrancisco",
  chicago: "chicago",
  dc: "washington"
};

function buildTransportHTML(city, lang) {
  const t = window._i18n && window._i18n[lang] || {};
  const tips = city["tips_" + lang] || city.tips_es;
  const sysLabel = t.transport_system || "🚇 Sistema";
  const priceLabel = t.transport_price || "💵 Precio";
  const payLabel = t.transport_payment || "💳 Pago";
  const appLabel = t.transport_app || "📱 App recomendada";
  const tipsLabel = t.transport_tips || "💡 Tips locales";
  const officialLabel = t.transport_official || "Oficial PDF/Web";
  const realtimeLabel = t.transport_realtime || "Tiempo real";
  const citySystem = lang !== "es" && city["system_" + lang] ? city["system_" + lang] : city.system;
  const cityPrice = lang !== "es" && city["price_" + lang] ? city["price_" + lang] : city.price;
  const cityPayment = lang !== "es" && city["payment_" + lang] ? city["payment_" + lang] : city.payment;
  const cityMapLabel = lang !== "es" && city["mapLabel_" + lang] ? city["mapLabel_" + lang] : city.mapLabel;
  return `\n        <div style="display:flex;flex-direction:column;gap:10px;">\n            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">${sysLabel}</div>\n                <div style="font-size:.82rem;font-weight:700;color:var(--text);">${citySystem}</div>\n            </div>\n            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${priceLabel}</div>\n                    <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPrice}</div>\n                </div>\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${payLabel}</div>\n                    <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPayment}</div>\n                </div>\n            </div>\n            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">${appLabel}</div>\n                <a href="${city.appLink}" target="_blank" style="font-size:.8rem;font-weight:700;color:var(--accent);text-decoration:none;">${city.app}</a>\n            </div>\n            <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${tipsLabel}</div>\n                <div style="display:flex;flex-direction:column;gap:6px;">\n                    ${tips.map(tip => `<div style="font-size:.78rem;font-weight:600;color:var(--text);line-height:1.4;">${tip}</div>`).join("")}\n                </div>\n            </div>\n            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                <a href="${city.map}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:var(--accent-dim);border:1.5px solid var(--accent);border-radius:12px;text-decoration:none;font-size:.72rem;font-weight:800;color:var(--accent);">🗺️ ${cityMapLabel}</a>\n                <a href="${city.gmaps}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(16,185,129,.08);border:1.5px solid var(--success);border-radius:12px;text-decoration:none;font-size:.72rem;font-weight:800;color:var(--success);">📍 Google Maps</a>\n            </div>\n        </div>`;
}

window.updateInlineTransport = function() {
  const selectorVal = document.getElementById("citySelector")?.value;
  if (!selectorVal) return;
  const cityId = SELECTOR_TO_CITY_ID[selectorVal] || selectorVal;
  const city = typeof CITIES !== "undefined" ? CITIES.find(c => c.id === cityId) : null;
  const lang = localStorage.getItem("appLang") || "es";
  const isOrlando = selectorVal === "orlando";
  const blockA = document.getElementById("inline-transport-nonOrlando");
  const blockB = document.getElementById("inline-transport-orlando");
  if (blockA) blockA.style.display = city && !isOrlando ? "block" : "none";
  if (blockB) blockB.style.display = city && isOrlando ? "block" : "none";
  if (!city) return;
  const html = buildTransportHTML(city, lang);
  if (isOrlando) {
    const content = document.getElementById("inline-transport-content-b");
    if (content) content.innerHTML = html;
  } else {
    const content = document.getElementById("inline-transport-content-a");
    if (content) content.innerHTML = html;
    const title = document.getElementById("inline-transport-title");
    if (title) title.textContent = city.name + " — Transporte";
    const subtitle = document.getElementById("inline-transport-subtitle");
    if (subtitle) subtitle.textContent = city.system;
  }
};

window.togglePlacesCard = function() {
  const body = document.getElementById("places-body");
  const chev = document.getElementById("places-chevron");
  if (!body) return;
  const open = body.style.display !== "none";
  body.style.display = open ? "none" : "block";
  if (chev) chev.style.transform = open ? "rotate(-90deg)" : "";
};

window.toggleInlineTransport = function() {
  const body = document.getElementById("inline-transport-body-a");
  const chev = document.getElementById("inline-transport-chevron-a");
  if (!body) return;
  const open = body.style.display !== "none";
  body.style.display = open ? "none" : "block";
  if (chev) {
    chev.textContent = "▾";
    chev.style.transform = open ? "" : "rotate(180deg)";
  }
};

window.toggleInlineTransportOrlando = function() {
  const body = document.getElementById("inline-transport-body-b");
  const chev = document.getElementById("inline-transport-chevron-b");
  if (!body) return;
  const open = body.style.display !== "none";
  body.style.display = open ? "none" : "block";
  if (chev) {
    chev.textContent = "▾";
    chev.style.transform = open ? "" : "rotate(180deg)";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  if (params.get("tab") === "actividades" || params.get("new") === "reminder") window.switchTab("actividades");
  if (params.get("new") === "reminder") {
    const form = document.getElementById("act-form-body");
    if (form && form.style.display === "none") window.toggleActForm();
    document.getElementById("actName")?.focus();
  }
  const sel = document.getElementById("citySelector");
  if (sel) sel.addEventListener("change", window.updateInlineTransport);
  window.updateInlineTransport();
});
