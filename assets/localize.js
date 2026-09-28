(function () {
  "use strict";
  const words = {
    "Cancelar": ["Cancel", "Cancelar"],
    "Abrir en Maps": ["Open in Maps", "Abrir no Maps"],
    "Filas por atracción": ["Wait times by attraction", "Filas por atração"],
    "Maps": ["Maps", "Mapas"],
    "Viaje activo": ["Active trip", "Viagem ativa"],
    "Registros sin viaje": ["Records without a trip", "Registros sem viagem"],
    "Gestionar viajes": ["Manage trips", "Gerenciar viagens"],
    "Cambiar Aplicación": ["Switch app", "Trocar aplicativo"],
    "¿A qué destino querés ir?": ["Which destination would you like?", "Para qual destino você quer ir?"],
    "Agregar TaxFly al inicio": ["Add TaxFly to your home screen", "Adicionar o TaxFly à tela inicial"],
    "Tocá el botón Compartir en Safari": ["Tap Share in Safari", "Toque em Compartilhar no Safari"],
    "Tocá “Agregar a pantalla de inicio”": ["Tap “Add to Home Screen”", "Toque em “Adicionar à Tela de Início”"],
    "Tocá “Agregar”": ["Tap “Add”", "Toque em “Adicionar”"],
    "Entendido": ["Got it", "Entendi"],
    "Nuevo recordatorio personal": ["New personal reminder", "Novo lembrete pessoal"],
    "🔔 Nuevo recordatorio personal": ["New personal reminder", "Novo lembrete pessoal"],
    "Mis Documentos": ["My documents", "Meus documentos"],
    "🗂️ Mis Documentos": ["My documents", "Meus documentos"],
    "Boarding passes, vouchers y documentación de viaje": ["Boarding passes, vouchers and travel documents", "Cartões de embarque, vouchers e documentos de viagem"],
    "Creado por Juan Cruz Bria": ["Created by Juan Cruz Bria", "Criado por Juan Cruz Bria"],
    "Emergencias Médicas en EE.UU.": ["Medical emergencies in the USA", "Emergências médicas nos EUA"],
    "Ej: 32819": ["E.g. 32819", "Ex.: 32819"],
    "Tiendas confiables": ["Trusted stores", "Lojas confiáveis"],
    "TIENDAS CONFIABLES": ["TRUSTED STORES", "LOJAS CONFIÁVEIS"],
    "¿QUÉ PRODUCTO QUERÉS BUSCAR?": ["WHAT PRODUCT ARE YOU LOOKING FOR?", "QUAL PRODUTO VOCÊ PROCURA?"],
    "¿Qué producto querés buscar?": ["What product are you looking for?", "Qual produto você procura?"],
    "GENERALISTA": ["GENERAL", "GERAL"],
    "MAYORISTA": ["WHOLESALE", "ATACADO"],
    "ELECTRÓNICA": ["ELECTRONICS", "ELETRÔNICOS"],
    "FOTO / VIDEO": ["PHOTO / VIDEO", "FOTO / VÍDEO"],
    "DEPORTIVO": ["SPORTS", "ESPORTIVO"],
    "GRANDES TIENDAS": ["DEPARTMENT STORES", "LOJAS DE DEPARTAMENTO"],
    "CALZADO": ["FOOTWEAR", "CALÇADOS"],
    "ROPA CASUAL": ["CASUAL WEAR", "ROUPA CASUAL"],
    "COSMÉTICA": ["BEAUTY", "COSMÉTICOS"],
    "Viaje": ["Trip", "Viagem"],
    "Gestionar en TaxFly": ["Manage in TaxFly", "Gerenciar no TaxFly"]
  };
  const original = new WeakMap();
  const attrs = ["placeholder", "title", "aria-label"];
  const lang = () => { try { return localStorage.getItem("appLang") || "es"; } catch (_) { return "es"; } };
  let observer, scheduled = false;
  function translate(root) {
    const choice = lang();
    document.documentElement.lang = choice;
    const index = choice === "en" ? 0 : choice === "pt" ? 1 : -1;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = root;
    do {
      if (node.nodeType === 3 && node.parentElement && !node.parentElement.closest("[data-i18n],script,style,textarea,[contenteditable]")) {
        const stored = original.get(node);
        const current = node.nodeValue;
        const source = stored && current === stored.output ? stored.source : current;
        const trimmed = source.trim();
        const value = words[trimmed];
        if (value) {
          const output = source.replace(trimmed, index < 0 ? trimmed : value[index]);
          original.set(node, { source, output });
          if (current !== output) node.nodeValue = output;
        }
      } else if (node.nodeType === 1 && !node.closest("[data-i18n],script,style,textarea,[contenteditable]")) {
        attrs.forEach(attr => {
          if (!node.hasAttribute(attr)) return;
          const key = attr + ":source", old = original.get(node) || {};
          const current = node.getAttribute(attr);
          const source = old[attr + ":output"] === current ? old[key] : current;
          const value = words[source];
          if (!value) return;
          const output = index < 0 ? source : value[index];
          old[key] = source; old[attr + ":output"] = output; original.set(node, old);
          if (current !== output) node.setAttribute(attr, output);
        });
      }
      node = walker.nextNode();
    } while (node);
  }
  function refresh() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      observer.disconnect();
      translate(document.body);
      observer.observe(document.body, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:attrs });
    });
  }
  function start() {
    observer = new MutationObserver(refresh);
    refresh();
    document.addEventListener("click", event => {
      if (event.target.closest(".lang-opt,[data-lang]")) setTimeout(refresh, 0);
    });
    window.addEventListener("storage", event => { if (event.key === "appLang") refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true }); else start();
})();
