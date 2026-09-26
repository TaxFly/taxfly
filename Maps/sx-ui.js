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
  function installRow() {
    return document.getElementById("sxInstall");
  }
  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    deferred = e;
  });
  window.addEventListener("appinstalled", function() {
    deferred = null;
  });
  function installApp() {
    if (deferred) {
      var prompt = deferred;
      deferred = null;
      prompt.prompt();
    } else {
      // Open the main entry page so Safari saves TaxFly, never this subpage.
      location.href = new URL("../login.html?install=1", document.baseURI).href;
    }
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
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
