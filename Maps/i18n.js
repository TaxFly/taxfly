(function() {
  "use strict";
  var VALID = [ "es", "en", "pt" ];
  var lang = "es";
  try {
    var saved = localStorage.getItem("appLang");
    if (VALID.indexOf(saved) >= 0) lang = saved;
  } catch (e) {}
  var IDX = lang === "en" ? 0 : lang === "pt" ? 1 : -1;
  var listeners = [];
  var DICT = Object.create(null);
  var PATS = [];
  var cache = new Map;
  function norm(s) {
    return s.replace(/\s+/g, " ").trim();
  }
  function rxEsc(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function add(map) {
    Object.keys(map).forEach(function(k) {
      var key = norm(k), val = map[k];
      if (/\{\w+\}/.test(key)) {
        var names = [], src = "^", last = 0, m, re = /\{(\w+)\}/g;
        while (m = re.exec(key)) {
          src += rxEsc(key.slice(last, m.index)) + "([\\s\\S]+?)";
          names.push(m[1]);
          last = m.index + m[0].length;
        }
        src += rxEsc(key.slice(last)) + "$";
        PATS.push({
          re: new RegExp(src),
          names: names,
          val: val,
          weight: key.replace(/\{\w+\}/g, "").length
        });
        PATS.sort(function(a, b) {
          return b.weight - a.weight;
        });
      } else {
        DICT[key] = val;
      }
    });
    cache.clear();
  }
  var MES = {
    ene: 0,
    feb: 1,
    mar: 2,
    abr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    sep: 8,
    sept: 8,
    set: 8,
    oct: 9,
    nov: 10,
    dic: 11
  };
  var MES_OUT = [ [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], [ "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez" ] ];
  var DIA = {
    lun: 0,
    mar: 1,
    mie: 2,
    jue: 3,
    vie: 4,
    sab: 5,
    dom: 6
  };
  var DIA_OUT = [ [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ], [ "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom" ] ];
  var DATE_RE = /^(lun(?:es)?|mar(?:tes)?|mi[eé](?:rcoles)?|jue(?:ves)?|vie(?:rnes)?|s[aá]b(?:ado)?|dom(?:ingo)?)\.?(?:\s+(\d{1,2}))?(?:\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sept?|set|oct|nov|dic)[a-z]*\.?)?$/i;
  var DAYMON_RE = /^(\d{1,2})\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sept?|set|oct|nov|dic)[a-z]*\.?$/i;
  function fold(s) {
    return s.toLowerCase().replace("é", "e").replace("á", "a");
  }
  function dateRule(s) {
    var m = s.match(DATE_RE);
    if (m) {
      var wd = DIA[fold(m[1]).slice(0, 3)], day = m[2], mo = m[3] ? MES[fold(m[3])] : undefined;
      if (wd === undefined) return undefined;
      if (m[3] === undefined && m[2] === undefined && /^mar$/i.test(m[1])) return undefined;
      var w = DIA_OUT[IDX][wd];
      if (mo === undefined) return day ? w + " " + day : w;
      return IDX === 0 ? w + ", " + MES_OUT[0][mo] + " " + day : w + ", " + day + " " + MES_OUT[1][mo];
    }
    m = s.match(/^(lun(?:es)?|mar(?:tes)?|mi[eé](?:rcoles)?|jue(?:ves)?|vie(?:rnes)?|s[aá]b(?:ado)?|dom(?:ingo)?)\.?\s+(\d{1,2})\/(\d{1,2})$/i);
    if (m) {
      var wd2 = DIA[fold(m[1]).slice(0, 3)];
      if (wd2 === undefined) return undefined;
      var mo3 = +m[3] - 1;
      if (mo3 < 0 || mo3 > 11) return undefined;
      return IDX === 0 ? DIA_OUT[0][wd2] + ", " + MES_OUT[0][mo3] + " " + m[2] : DIA_OUT[1][wd2] + ", " + m[2] + " " + MES_OUT[1][mo3];
    }
    m = s.match(DAYMON_RE);
    if (m) {
      var mo2 = MES[fold(m[2])];
      if (mo2 === undefined) return undefined;
      return IDX === 0 ? MES_OUT[0][mo2] + " " + m[1] : m[1] + " " + MES_OUT[1][mo2];
    }
    return undefined;
  }
  function core(s) {
    var r = DICT[s];
    if (r !== undefined) return r[IDX];
    for (var i = 0; i < PATS.length; i++) {
      var p = PATS[i], m = s.match(p.re);
      if (!m) continue;
      var out = p.val[IDX];
      if (out === undefined) continue;
      var vals = {};
      p.names.forEach(function(n, j) {
        vals[n] = t(m[j + 1]);
      });
      return out.replace(/\{(\w+)\}/g, function(all, n) {
        return vals[n] !== undefined ? vals[n] : all;
      });
    }
    return dateRule(s);
  }
  function t(str) {
    if (IDX < 0 || typeof str !== "string" || !str) return str;
    var hit = cache.get(str);
    if (hit !== undefined) return hit;
    var m = str.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var c = norm(m[2]), out = str;
    if (c) {
      var r = core(c);
      if (r !== undefined && r !== null) out = m[1] + r + m[3];
    }
    if (cache.size > 4e3) cache.clear();
    cache.set(str, out);
    return out;
  }
  var SKIP = {
    SCRIPT: 1,
    STYLE: 1,
    TEXTAREA: 1,
    NOSCRIPT: 1,
    CODE: 1
  };
  var ATTRS = [ "placeholder", "title", "aria-label", "alt" ];
  function skipEl(el) {
    return !el || SKIP[el.tagName] || el.closest && el.closest('[data-notr],[contenteditable="true"],.leaflet-tile-pane,.leaflet-control-attribution');
  }
  function doText(n) {
    var st = n.__i18n, v = n.nodeValue;
    if (st && v === st.out) return;
    if (!v || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(v)) return;
    if (skipEl(n.parentElement)) return;
    var out = t(v);
    if (out !== v) {
      n.__i18n = {
        src: v,
        out: out
      };
      n.nodeValue = out;
    } else if (st) n.__i18n = null;
  }
  function doAttrs(el) {
    if (!el || el.nodeType !== 1 || skipEl(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a), st = el.__i18na && el.__i18na[a];
      if (st && v === st.out) continue;
      var out = t(v);
      if (out !== v) {
        (el.__i18na = el.__i18na || {})[a] = {
          src: v,
          out: out
        };
        el.setAttribute(a, out);
      } else if (st) el.__i18na[a] = null;
    }
  }
  function retext(n) {
    var st = n.__i18n;
    if (!st || n.nodeValue !== st.out) return;
    var out = t(st.src);
    st.out = out;
    n.nodeValue = out;
  }
  function reattrs(el) {
    var m = el.__i18na;
    if (!m) return;
    for (var a in m) {
      var st = m[a];
      if (!st || el.getAttribute(a) !== st.out) continue;
      var out = t(st.src);
      st.out = out;
      el.setAttribute(a, out);
    }
  }
  function walk(root, redo) {
    if (!root) return;
    if (root.nodeType === 3) {
      if (redo) retext(root);
      doText(root);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (SKIP[root.tagName]) return;
      if (redo) reattrs(root);
      doAttrs(root);
    }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    for (var n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 3) {
        if (redo) retext(n);
        doText(n);
      } else if (!SKIP[n.tagName]) {
        if (redo) reattrs(n);
        doAttrs(n);
      }
    }
  }
  var titleSrc = null, titleOut = null;
  function doTitle() {
    var v = document.title;
    if (titleSrc === null || v !== titleOut) titleSrc = v;
    titleOut = t(titleSrc);
    if (titleOut !== v) document.title = titleOut;
  }
  var pending = [], queued = false;
  function flush() {
    queued = false;
    var list = pending;
    pending = [];
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.isConnected === false) continue;
      walk(n, false);
    }
    doTitle();
  }
  function queue(n) {
    if (IDX < 0) return;
    pending.push(n);
    if (!queued) {
      queued = true;
      (window.requestAnimationFrame || setTimeout)(flush);
    }
  }
  function markSelectors() {
    var els = document.querySelectorAll(".lang-opt[data-lang]");
    for (var i = 0; i < els.length; i++) {
      var on = els[i].getAttribute("data-lang") === lang;
      els[i].classList.toggle("active", on);
      els[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  function start() {
    document.documentElement.setAttribute("lang", lang);
    markSelectors();
    if (IDX >= 0) {
      walk(document.body, false);
      doTitle();
    }
    new MutationObserver(function(muts) {
      if (IDX < 0) return;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === "childList") {
          for (var j = 0; j < m.addedNodes.length; j++) queue(m.addedNodes[j]);
        } else if (m.type === "characterData") queue(m.target); else if (m.type === "attributes") queue(m.target);
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }
  function setLang(l, fromStorage) {
    if (VALID.indexOf(l) < 0 || l === lang) return;
    lang = l;
    IDX = l === "en" ? 0 : l === "pt" ? 1 : -1;
    if (!fromStorage) {
      try {
        localStorage.setItem("appLang", l);
      } catch (e) {}
    }
    cache.clear();
    window.I18N.lang = lang;
    document.documentElement.setAttribute("lang", lang);
    walk(document.body, true);
    doTitle();
    markSelectors();
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](lang);
      } catch (e) {}
    }
    walk(document.body, false);
  }
  document.addEventListener("click", function(e) {
    var b = e.target.closest && e.target.closest(".lang-opt[data-lang]");
    if (b) setLang(b.getAttribute("data-lang"));
  });
  window.addEventListener("storage", function(e) {
    if (e.key === "appLang" && e.newValue) setLang(e.newValue, true);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.I18N = {
    lang: lang,
    t: t,
    add: function(map) {
      add(map);
      if (IDX >= 0 && document.body) queue(document.body);
    },
    setLang: setLang,
    onChange: function(fn) {
      listeners.push(fn);
    },
    LANGS: VALID
  };
  window.tr = t;
  add({
    Cancelar: [ "Cancel", "Cancelar" ],
    Guardar: [ "Save", "Salvar" ],
    Eliminar: [ "Delete", "Excluir" ],
    Cerrar: [ "Close", "Fechar" ],
    Agregar: [ "Add", "Adicionar" ],
    Editar: [ "Edit", "Editar" ],
    Entendido: [ "Got it", "Entendi" ],
    Listo: [ "Done", "Pronto" ],
    "Sí": [ "Yes", "Sim" ],
    Ajustes: [ "Settings", "Configurações" ],
    "Perfil activo": [ "Active profile", "Perfil ativo" ],
    "Cambiar perfil": [ "Change profile", "Trocar perfil" ],
    Apariencia: [ "Appearance", "Aparência" ],
    Claro: [ "Light", "Claro" ],
    Oscuro: [ "Dark", "Escuro" ],
    Auto: [ "Auto", "Auto" ],
    Idioma: [ "Language", "Idioma" ],
    "Datos y respaldo": [ "Data & backup", "Dados e backup" ],
    Exportar: [ "Export", "Exportar" ],
    Importar: [ "Import", "Importar" ],
    "Empezar de cero": [ "Start from scratch", "Começar do zero" ],
    Cuenta: [ "Account", "Conta" ],
    "Actualizar app": [ "Update app", "Atualizar app" ],
    "Cerrar sesión": [ "Log out", "Sair" ],
    "Volver a TaxUSA": [ "Back to TaxUSA", "Voltar ao TaxUSA" ],
    "Ir a Orlando Planning": [ "Go to Orlando Planning", "Ir para o Orlando Planning" ],
    "Estado de sincronización": [ "Sync status", "Status da sincronização" ],
    "Mis cosas de viaje": [ "My travel stuff", "Minhas coisas de viagem" ],
    "Abrir Mis cosas de viaje": [ "Open My travel stuff", "Abrir Minhas coisas de viagem" ],
    "Volver a TaxUSA ": [ "Back to TaxUSA", "Voltar ao TaxUSA" ],
    Nombre: [ "Name", "Nome" ],
    Notas: [ "Notes", "Notas" ],
    Cantidad: [ "Quantity", "Quantidade" ],
    Buscar: [ "Search", "Buscar" ],
    Todos: [ "All", "Todos" ],
    "Sí, eliminar": [ "Yes, delete", "Sim, excluir" ],
    "Sin conexión": [ "Offline", "Sem conexão" ],
    "Cargando…": [ "Loading…", "Carregando…" ],
    Preferencias: [ "Preferences", "Preferências" ],
    "Aplicación": [ "App", "Aplicativo" ],
    "Modo oscuro": [ "Dark mode", "Modo escuro" ],
    "Instalar app": [ "Install app", "Instalar app" ],
    "Instalar en tu iPhone": [ "Install on your iPhone", "Instalar no seu iPhone" ],
    "Se abre como una app, a pantalla completa y con su propio ícono.": [ "It opens like an app, full screen and with its own icon.", "Abre como um app, em tela cheia e com o seu próprio ícone." ],
    "Tocá Compartir en Safari": [ "Tap Share in Safari", "Toque em Compartilhar no Safari" ],
    'Tocá "Agregar a pantalla de inicio"': [ 'Tap "Add to Home Screen"', 'Toque em "Adicionar à Tela de Início"' ],
    'Tocá "Agregar"': [ 'Tap "Add"', 'Toque em "Adicionar"' ]
  });
})();