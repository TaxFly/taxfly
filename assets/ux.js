/* TaxFly · mejoras de uso compartidas.
   1) Barras horizontales sin scrollbar: rueda del mouse + arrastrar.
   2) Elementos con onclick que no son botones: accesibles con Tab / Enter / Espacio. */
(function () {
  "use strict";

  /* ---------- 1) Scroll horizontal con mouse ---------- */
  var HS_SELECTOR = [
    ".filter-row", ".comp-cat-strip", ".cat-bar", ".chips",
    ".day-tabs-wrap", ".tab-bar", ".preview-strip", "[data-hscroll]"
  ].join(",");

  function setupHScroll(row) {
    if (row._hs) return;
    row._hs = true;

    function overflows() { return row.scrollWidth > row.clientWidth + 1; }
    function mark() { row.classList.toggle("hs-scrollable", overflows()); }
    mark();
    row.addEventListener("pointerenter", mark);
    window.addEventListener("resize", mark);

    // Rueda -> horizontal (solo si desborda y todavía hay recorrido)
    row.addEventListener("wheel", function (e) {
      if (!overflows() || e.ctrlKey) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      var max = row.scrollWidth - row.clientWidth;
      if ((d < 0 && row.scrollLeft <= 0) || (d > 0 && row.scrollLeft >= max - 1)) return;
      e.preventDefault();
      row.scrollLeft += d;
    }, { passive: false });

    // Arrastrar con el mouse (el touch ya scrollea nativo)
    var down = false, moved = false, startX = 0, startLeft = 0;
    row.addEventListener("mousedown", function (e) {
      if (e.button !== 0 || !overflows()) return;
      var t = e.target;
      if (t && t.closest && t.closest("input,select,textarea")) return;
      down = true; moved = false; startX = e.pageX; startLeft = row.scrollLeft;
    });
    window.addEventListener("mousemove", function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; row.classList.add("hs-dragging"); }
      if (moved) row.scrollLeft = startLeft - dx;
    });
    window.addEventListener("mouseup", function () {
      if (!down) return;
      down = false;
      if (moved) setTimeout(function () { row.classList.remove("hs-dragging"); }, 0);
    });

    // Mantener a la vista el elemento tocado
    row.addEventListener("click", function (e) {
      if (moved) return;
      var el = e.target && e.target.closest && e.target.closest("button,a,[role='tab'],[onclick]");
      if (el && row.contains(el) && el.scrollIntoView) {
        el.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
      }
    });
  }

  /* ---------- 2) Teclado para elementos clickeables ---------- */
  var KB_SELECTOR = "div[onclick],span[onclick],li[onclick],tr[onclick],img[onclick],p[onclick]";
  var INTERACTIVE = "a[href],button,input,select,textarea,summary,[role='button'],[tabindex]";

  function isBackdrop(el) {
    var oc = el.getAttribute("onclick") || "";
    if (/event\.target|e\.target|target\s*===?/.test(oc)) return true;      // cerrar al tocar el fondo
    var id = (el.id || "") + " " + (typeof el.className === "string" ? el.className : "");
    return /overlay|backdrop|scrim/i.test(id);
  }

  function setupKeyboard(el) {
    if (el._kb || el.hasAttribute("data-ux-kb")) return;
    el._kb = true;
    if (el.hasAttribute("tabindex") || el.hasAttribute("role")) return;
    if (el.getAttribute("aria-hidden") === "true" || isBackdrop(el)) return;
    if (el.querySelector(INTERACTIVE)) return;                               // contenedor con botones adentro
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-ux-kb", "");
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
    var el = e.target;
    if (!el || !el.hasAttribute || !el.hasAttribute("data-ux-kb") || e.target !== el) return;
    e.preventDefault();
    el.click();
  });

  /* ---------- Arranque + contenido dinámico ---------- */
  function scan(root) {
    root = root && root.querySelectorAll ? root : document;
    if (root.matches && root !== document) {
      if (root.matches(HS_SELECTOR)) setupHScroll(root);
      if (root.matches(KB_SELECTOR)) setupKeyboard(root);
    }
    root.querySelectorAll(HS_SELECTOR).forEach(setupHScroll);
    root.querySelectorAll(KB_SELECTOR).forEach(setupKeyboard);
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    (window.requestAnimationFrame || setTimeout)(function () { pending = false; scan(document); });
  }

  function init() {
    scan(document);
    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
