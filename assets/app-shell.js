(function () {
  const inMaps = /\/Maps\//i.test(location.pathname);
  const page = location.pathname.split("/").pop() || "index.html";
  const prefix = inMaps ? "../" : "";
  const inPlan = inMaps || ["itinerario.html", "rutas.html"].includes(page);
  const inExpenses = !inMaps && ["compras.html", "grupo.html", "tax.html"].includes(page);
  const params = new URLSearchParams(location.search);
  const section = inMaps ? page === "Mis_cosas_de_viaje.html" ? "cosas"
    : params.get("section") === "reservas" ? "reservas"
    : params.get("subtab") === "atracciones" ? "atracciones" : "agenda"
    : page === "itinerario.html" ? "recordatorios" : page === "rutas.html" ? "rutas" : "";
  const translations = {
    es: {home:"Inicio",plan:"Plan del viaje",expenses:"Gastos",docs:"Documentos",agenda:"Agenda",reservas:"Reservas",rutas:"Rutas",atracciones:"Atracciones",cosas:"Mis cosas",recordatorios:"Recordatorios",movimientos:"Movimientos",comparar:"Comparar",grupo:"Grupo",calculadora:"Calculadora",settings:"Ajustes"},
    en: {home:"Home",plan:"Trip plan",expenses:"Expenses",docs:"Documents",agenda:"Schedule",reservas:"Reservations",rutas:"Routes",atracciones:"Attractions",cosas:"My things",recordatorios:"Reminders",movimientos:"Transactions",comparar:"Compare",grupo:"Group",calculadora:"Calculator",settings:"Settings"},
    pt: {home:"Início",plan:"Plano da viagem",expenses:"Gastos",docs:"Documentos",agenda:"Agenda",reservas:"Reservas",rutas:"Rotas",atracciones:"Atrações",cosas:"Minhas coisas",recordatorios:"Lembretes",movimientos:"Movimentos",comparar:"Comparar",grupo:"Grupo",calculadora:"Calculadora",settings:"Ajustes"}
  };
  const lang = (() => { try { return localStorage.getItem("appLang") || "es"; } catch (_) { return "es"; } })();
  const t = translations[lang] || translations.es;
  const main = [
    ["home", prefix + "index.html", ["index.html", "unidades.html"].includes(page) && !inMaps],
    ["plan", prefix + "Maps/index.html?section=parques", inPlan],
    ["expenses", prefix + "compras.html", inExpenses],
    ["docs", prefix + "tickets.html", page === "tickets.html" && !inMaps]
  ];
  const children = [
    ["agenda", prefix + "Maps/index.html?section=parques"],
    ["reservas", prefix + "Maps/index.html?section=reservas"],
    ["rutas", prefix + "rutas.html"],
    ["atracciones", prefix + "Maps/index.html?section=parques&subtab=atracciones"],
    ["cosas", prefix + "Maps/Mis_cosas_de_viaje.html"],
    ["recordatorios", prefix + "itinerario.html?tab=actividades"]
  ];
  const expenseChildren = [["movimientos", "compras.html"], ["comparar", "compras.html?section=comparador"], ["grupo", "grupo.html"], ["calculadora", "tax.html"]];
  const expenseSection = page === "grupo.html" ? "grupo" : page === "tax.html" ? "calculadora" : params.get("section") === "comparador" ? "comparar" : "movimientos";
  const link = ([name, href, active]) => `<a href="${href}"${active ? ' aria-current="page"' : ""}>${t[name]}</a>`;
  window.taxflySetPlanSection = name => {
    document.querySelectorAll(".tf-app-subnav [data-plan-section]").forEach(item => {
      if (item.dataset.planSection === name) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  };
  window.taxflySetExpenseSection = name => {
    document.querySelectorAll(".tf-app-subnav [data-expense-section]").forEach(item => {
      if (item.dataset.expenseSection === name) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  };
  function mount() {
    if (document.querySelector(".tf-app-shell")) return;
    document.body.classList.add(inMaps ? page === "Mis_cosas_de_viaje.html" ? "tf-shell-mis" : "tf-shell-map" : "tf-shell-root");
    const shell = document.createElement("header");
    shell.className = "tf-app-shell";
    shell.innerHTML = `<div class="tf-app-main"><a class="tf-app-brand" href="${prefix}index.html"><span class="tf-app-brand-icon" aria-hidden="true">✈</span>TaxFly</a><nav class="tf-app-links" aria-label="Navegación principal">${main.map(link).join("")}</nav><button class="tf-app-settings" type="button" aria-label="${t.settings}" title="${t.settings}">⚙</button></div>${inPlan ? `<nav class="tf-app-subnav" aria-label="Secciones del plan">${children.map(([name, href]) => `<a data-plan-section="${name}" href="${href}"${section === name ? ' aria-current="page"' : ""}>${t[name]}</a>`).join("")}</nav>` : inExpenses ? `<nav class="tf-app-subnav" aria-label="Secciones de gastos">${expenseChildren.map(([name, href]) => `<a data-expense-section="${name}" href="${href}"${expenseSection === name ? ' aria-current="page"' : ""}>${t[name]}</a>`).join("")}</nav>` : ""}`;
    if (inMaps) {
      const sync = document.querySelector("#sync-dot, #syncDot");
      if (sync) shell.querySelector(".tf-app-main").insertBefore(sync, shell.querySelector(".tf-app-settings"));
    }
    shell.querySelector(".tf-app-settings").addEventListener("click", () => {
      const original = document.getElementById("btnSettings");
      if (original) original.click(); else location.assign(prefix + "index.html#ajustes");
    });
    document.body.prepend(shell);
    if (!inMaps && page === "index.html" && location.hash === "#ajustes") {
      setTimeout(() => document.getElementById("btnSettings")?.click(), 0);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, {once:true});
  else mount();
})();
