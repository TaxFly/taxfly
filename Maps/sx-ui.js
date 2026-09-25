(function() {
  "use strict";
  var html = document.documentElement;
  var sw = null;
  function isDark() {
    return html.getAttribute("data-theme") === "dark";
  }
  function syncSwitch() {
    if (!sw) return;
    var d = isDark();
    sw.classList.toggle("on", d);
    sw.setAttribute("aria-checked", d ? "true" : "false");
  }
  function toggleTheme() {
    var choice = isDark() ? "light" : "dark";
    if (typeof window.setThemeChoice === "function") window.setThemeChoice(choice); else if (typeof window.elegirTema === "function") window.elegirTema(choice); else {
      try {
        localStorage.setItem("theme", choice);
      } catch (e) {}
      html.setAttribute("data-theme", choice);
    }
    syncSwitch();
  }
  var deferred = null;
  var ua = navigator.userAgent || "";
  var isIos = /iphone|ipad|ipod/i.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  var standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  function installRow() {
    return document.getElementById("sxInstall");
  }
  function showInstall() {
    var r = installRow();
    if (r && !standalone) r.hidden = false;
  }
  function hideInstall() {
    var r = installRow();
    if (r) r.hidden = true;
  }
  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    deferred = e;
    showInstall();
  });
  window.addEventListener("appinstalled", function() {
    deferred = null;
    hideInstall();
  });
  function iosModal() {
    var m = document.getElementById("sxInstallModal");
    if (!m) {
      m = document.createElement("div");
      m.id = "sxInstallModal";
      m.innerHTML = '<div class="sxi" role="dialog" aria-modal="true">' + "<h3>Instalar en tu iPhone</h3>" + '<p class="sxi-s">Se abre como una app, a pantalla completa y con su propio ícono.</p>' + '<div class="sxi-step"><span class="sxi-n">1</span><span>Tocá Compartir en Safari</span></div>' + '<div class="sxi-step"><span class="sxi-n">2</span><span>Tocá "Agregar a pantalla de inicio"</span></div>' + '<div class="sxi-step"><span class="sxi-n">3</span><span>Tocá "Agregar"</span></div>' + '<button type="button" class="sxi-ok">Entendido</button></div>';
      m.addEventListener("click", function(e) {
        if (e.target === m || e.target.closest(".sxi-ok")) m.classList.remove("open");
      });
      document.body.appendChild(m);
    }
    m.classList.add("open");
  }
  function installApp() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function(r) {
        deferred = null;
        if (r && r.outcome === "accepted") hideInstall();
      });
    } else if (isIos) iosModal();
  }
  function init() {
    sw = document.getElementById("sxSwitch");
    var t = document.getElementById("sxTheme");
    if (t) t.addEventListener("click", toggleTheme);
    new MutationObserver(syncSwitch).observe(html, {
      attributes: true,
      attributeFilter: [ "data-theme" ]
    });
    syncSwitch();
    var r = installRow();
    if (r) r.addEventListener("click", installApp);
    if (isIos && !standalone) showInstall(); else if (deferred) showInstall();
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        var m = document.getElementById("sxInstallModal");
        if (m) m.classList.remove("open");
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();