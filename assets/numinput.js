/*
 * numinput.js
 * Campos numéricos que aceptan coma o punto decimal.
 *
 * Los inputs marcados con data-num son <input type="text" inputmode="decimal">.
 * Mientras se escribe (o se pega), este script:
 *   - cambia la coma por punto, así parseFloat(el.value) siempre funciona;
 *   - saca cualquier carácter que no sea número;
 *   - deja un solo separador decimal.
 *
 * Valores de data-num:
 *   (vacío)  número decimal positivo
 *   "signed" decimal que admite "-" al inicio (latitud, longitud, temperaturas)
 *   "int"    solo dígitos
 *
 * Usa delegación de eventos en captura: corre antes que cualquier
 * oninput="..." del propio campo y también funciona con inputs creados
 * dinámicamente.
 */
(function () {
  "use strict";

  function normalize(raw, mode) {
    var s = String(raw).replace(/,/g, ".");
    var neg = mode === "signed" && /^\s*[-\u2212\u2013]/.test(s);
    if (mode === "int") {
      s = s.replace(/[^0-9]/g, "");
    } else {
      s = s.replace(/[^0-9.]/g, "");
      var i = s.indexOf(".");
      if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
    }
    return (neg ? "-" : "") + s;
  }

  document.addEventListener(
    "input",
    function (e) {
      var el = e.target;
      if (!el || el.tagName !== "INPUT" || !el.hasAttribute("data-num")) return;
      var mode = el.getAttribute("data-num");
      var before = el.value;
      var after = normalize(before, mode);
      if (after === before) return;
      var pos = null;
      try { pos = el.selectionStart; } catch (_) {}
      el.value = after;
      if (pos !== null) {
        var p = Math.max(0, pos - (before.length - after.length));
        try { el.setSelectionRange(p, p); } catch (_) {}
      }
    },
    true
  );
})();
