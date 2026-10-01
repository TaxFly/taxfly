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

/* ---------- TaxFly · UX compartido (parte 2) ----------
   tfToast(msg, {actionText, onAction, duration})  toast global con botón de acción
   tfDeleteWithUndo({message, remove, restore, commit, delay})  borrar con "Deshacer"
   tfSkeleton(el, n, h)  filas esqueleto mientras carga
   tfSyncBadge(state)  HTML de insignia: "synced" | "pending"
   Modales: Escape, foco atrapado/devuelto y botón "atrás" del celular (automático). */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---- Toast global ---- */
  var toastEl, toastTimer;
  window.tfToast = function (msg, opts) {
    opts = opts || {};
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "tf-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    clearTimeout(toastTimer);
    toastEl.textContent = "";
    var span = document.createElement("span");
    span.textContent = msg;
    toastEl.appendChild(span);
    if (opts.actionText && typeof opts.onAction === "function") {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = opts.actionText;
      b.onclick = function () { hide(); opts.onAction(); };
      toastEl.appendChild(b);
    }
    toastEl.classList.add("show");
    toastTimer = setTimeout(hide, opts.duration || 5000);
    function hide() { toastEl.classList.remove("show"); }
  };

  /* ---- Borrar con deshacer: se quita ya de la UI y se confirma a los 5 s ---- */
  window.tfDeleteWithUndo = function (o) {
    var delay = o.delay || 5000, undone = false;
    if (o.remove) o.remove();
    var t = setTimeout(function () { if (!undone && o.commit) o.commit(); }, delay);
    var lg = (function () { try { return localStorage.getItem("appLang") || "es"; } catch (e) { return "es"; } })();
    var T = { es: ["Eliminado", "Deshacer"], en: ["Deleted", "Undo"], pt: ["Excluído", "Desfazer"] }[lg] || ["Eliminado", "Deshacer"];
    window.tfToast(o.message || T[0], {
      actionText: o.undoText || T[1], duration: delay,
      onAction: function () { undone = true; clearTimeout(t); if (o.restore) o.restore(); }
    });
    // Si se cierra la pestaña antes, el borrado igual se confirma
    window.addEventListener("pagehide", function () { if (!undone) { clearTimeout(t); undone = true; if (o.commit) o.commit(true); } }, { once: true });   // true = la página se está cerrando
  };

  /* ---- Skeletons ---- */
  window.tfSkeleton = function (el, n, h) {
    if (!el) return;
    var html = "";
    for (var i = 0; i < (n || 3); i++) html += '<div class="tf-skel" style="height:' + (h || 56) + 'px"></div>';
    el.innerHTML = html;
    el.setAttribute("aria-busy", "true");
  };

  /* ---- Insignia de sincronización ---- */
  window.tfSyncBadge = function (state, compact) {
    var pending = state === "pending" || (state == null && navigator.onLine === false);
    var txt = pending ? (compact ? "⏳" : "⏳ pendiente") : (compact ? "✓" : "✓ guardado");
    return '<span class="tf-sync ' + (pending ? "pending" : "ok") + '" title="' +
      (pending ? "Pendiente de sincronizar" : "Guardado") + '" aria-label="' + (pending ? "Pendiente de sincronizar" : "Guardado") + '">' + txt + "</span>";
  };

  /* ---- Modales unificados ---- */
  var MODAL_SEL = ".modal,.modal-bg,.modal-overlay,.overlay,[role='dialog'],[aria-modal='true']";
  var stack = [], opener = null, popping = false;

  function visible(el) {
    if (!el.isConnected || el.closest("#tf-toast,.tf-dialog-overlay,.menu-overlay")) return false;
    var cs = getComputedStyle(el);
    return cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity > 0 && el.offsetWidth > 0 && /fixed|absolute/.test(cs.position);
  }
  function topModal() {
    for (var i = stack.length - 1; i >= 0; i--) if (visible(stack[i])) return stack[i];
    return null;
  }
  function closeModal(m) {
    var btn = m.querySelector("[data-close],.modal-close,.close,.close-btn,[aria-label*='errar' i],[aria-label*='lose' i]");
    if (!btn) {
      var all = m.querySelectorAll("button");
      for (var i = 0; i < all.length; i++) if (/^\s*(cancelar|cerrar|cancel|close|×|✕|✖)\s*$/i.test(all[i].textContent)) { btn = all[i]; break; }
    }
    if (btn) btn.click(); else m.dispatchEvent(new MouseEvent("click", { bubbles: true }));  // cierre por fondo
  }
  function focusables(m) {
    return Array.prototype.filter.call(
      m.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"),
      function (e) { return e.offsetWidth > 0; });
  }
  function sync() {
    var open = Array.prototype.filter.call(document.querySelectorAll(MODAL_SEL), visible);
    open.forEach(function (m) {
      if (stack.indexOf(m) < 0) {
        if (!stack.length) opener = document.activeElement;
        stack.push(m);
        history.pushState({ tfModal: stack.length }, "");
        var f = focusables(m)[0]; if (f && !m.contains(document.activeElement)) f.focus();
      }
    });
    var gone = stack.filter(function (m) { return !visible(m); });
    if (gone.length) {
      stack = stack.filter(function (m) { return visible(m); });
      if (!stack.length && opener && opener.focus && document.contains(opener)) { try { opener.focus(); } catch (e) {} opener = null; }
      if (!popping && history.state && history.state.tfModal) { popping = true; history.back(); }   // quita la entrada que agregamos
    }
  }
  document.addEventListener("keydown", function (e) {
    var m = topModal(); if (!m) return;
    if (e.key === "Escape" && !document.querySelector(".tf-dialog-overlay")) { e.preventDefault(); closeModal(m); }
    if (e.key === "Tab") {
      var f = focusables(m); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !m.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("popstate", function () {
    if (popping) { popping = false; return; }
    var m = topModal();
    if (m) { popping = true; closeModal(m); setTimeout(function () { popping = false; }, 50); }  // "atrás" cierra el modal, no la página
  });
  function initModals() {
    if (!window.MutationObserver) return;
    var p = false;
    new MutationObserver(function () {
      if (p) return; p = true;
      setTimeout(function () { p = false; sync(); }, 30);
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "hidden", "open"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initModals); else initModals();
})();
