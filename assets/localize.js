(function () {
  "use strict";
  // Helper global para mensajes escritos desde JS: tfL3("es", "en", "pt")
  window.tfL3 = function (es, en, pt) {
    var l = "es";
    try { l = localStorage.getItem("appLang") || "es"; } catch (_) {}
    return l === "en" ? en : l === "pt" ? pt : es;
  };
  const words = {
    "Cancelar": ["Cancel", "Cancelar"],
    "Cerrar": ["Close", "Fechar"],
    "Cerrar cámara": ["Close camera", "Fechar câmera"],
    "Cerrar visor": ["Close viewer", "Fechar visualizador"],
    "✕ Cerrar": ["✕ Close", "✕ Fechar"],
    "🗑️ Eliminar foto": ["🗑️ Delete photo", "🗑️ Excluir foto"],
    "💾 Guardar": ["💾 Save", "💾 Salvar"],
    "🖨️ Imprimir": ["🖨️ Print", "🖨️ Imprimir"],
    "Analizar con IA — ¿Dónde conviene comprarlo?": ["Analyze with AI — Where is it best to buy it?", "Analisar com IA — Onde vale mais a pena comprar?"],
    "Vincular documento": ["Link document", "Vincular documento"],
    "Vincular documento existente": ["Link existing document", "Vincular documento existente"],
    "Reserva de Planificación": ["Planning reservation", "Reserva do Planejamento"],
    "Guardar vínculo": ["Save link", "Salvar vínculo"],
    "Documento": ["Document", "Documento"],
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
    "Generalista": ["General", "Geral"],
    "Marketplace": ["Marketplace", "Marketplace"],
    "Mayorista": ["Wholesale", "Atacado"],
    "Electrónica": ["Electronics", "Eletrônicos"],
    "Foto / Video": ["Photo / Video", "Foto / Vídeo"],
    "Apple oficial": ["Official Apple", "Apple oficial"],
    "Deportivo": ["Sports", "Esportivo"],
    "Calzado": ["Footwear", "Calçados"],
    "Grandes tiendas": ["Department stores", "Lojas de departamento"],
    "Outlet/Descuento": ["Outlet / Discount", "Outlet / Desconto"],
    "Ropa casual": ["Casual wear", "Roupa casual"],
    "Cosmética": ["Beauty", "Cosméticos"],
    "Hogar / Herram.": ["Home / Tools", "Casa / Ferram."],
    "Muebles / Hogar": ["Furniture / Home", "Móveis / Casa"],
    "Videojuegos": ["Video games", "Videogames"],
    "Presupuesto general de TaxFly; el saldo usa los gastos del filtro elegido.": ["TaxFly overall budget; the balance uses the expenses of the selected filter.", "Orçamento geral do TaxFly; o saldo usa os gastos do filtro escolhido."],
    "Sin conexión": ["Offline", "Sem conexão"],
    "Sin conexión — modo offline": ["Offline mode", "Modo offline"],
    "Sin conexión — los conversores funcionan normalmente": ["Offline — converters work normally", "Sem conexão — os conversores funcionam normalmente"],
    "Clima en destino": ["Weather at destination", "Clima no destino"],
    "Este PIN se usa para acceder sin conexión": ["This PIN is used to sign in offline", "Este PIN é usado para acessar sem conexão"],
    "PIN Nuevo (4–6 dígitos)": ["New PIN (4–6 digits)", "Novo PIN (4–6 dígitos)"],
    "¡PIN actualizado!": ["PIN updated!", "PIN atualizado!"],
    "Podés usarlo para entrar sin conexión": ["You can use it to sign in offline", "Você pode usá-lo para entrar sem conexão"],
    "Categoría": ["Category", "Categoria"],
    "Súper (sin preparar)": ["Groceries (unprepared)", "Supermercado (não preparado)"],
    "Alimento básico": ["Basic food", "Alimento básico"],
    "Ingresá el % de tax si no encontrás tu ciudad.": ["Enter the tax % if you can't find your city.", "Informe a % de imposto se não encontrar sua cidade."],
    "Sumá cada producto del súper y mirá el total con tax al final, sin salir de la app.": ["Add each grocery item and see the total with tax at the end, without leaving the app.", "Some cada produto do supermercado e veja o total com imposto no final, sem sair do app."],
    "Todavía no agregaste productos.": ["You haven't added any products yet.", "Você ainda não adicionou produtos."],
    "Guardar en Gastos": ["Save to Expenses", "Salvar em Gastos"],
    "Mi Viaje": ["My Trip", "Minha Viagem"],
    "¿A qué ciudad vas?": ["Which city are you going to?", "Para qual cidade você vai?"],
    "Mis grupos": ["My groups", "Meus grupos"],
    "Podés registrar y eliminar gastos — se guardan localmente.": ["You can add and delete expenses — they are saved locally.", "Você pode registrar e excluir gastos — eles são salvos localmente."],
    "No podés crear ni unirte a grupos sin conexión.": ["You can't create or join groups while offline.", "Você não pode criar nem entrar em grupos sem conexão."],
    "Todo se sincroniza automáticamente cuando vuelve el internet.": ["Everything syncs automatically when the internet is back.", "Tudo é sincronizado automaticamente quando a internet voltar."],
    "Pagó": ["Paid", "Pagou"],
    "Todavía no hay gastos 🧳": ["No expenses yet 🧳", "Ainda não há gastos 🧳"],
    "Quién le debe a quién": ["Who owes whom", "Quem deve a quem"],
    "Algoritmo de transferencias mínimas — la menor cantidad de pagos posible.": ["Minimum-transfer algorithm — the fewest possible payments.", "Algoritmo de transferências mínimas — o menor número possível de pagamentos."],
    "Sin datos aún": ["No data yet", "Sem dados ainda"],
    "¿Cómo funciona la división?": ["How does the split work?", "Como funciona a divisão?"],
    "Transporte Público": ["Public transport", "Transporte público"],
    "Activá los recordatorios": ["Turn on reminders", "Ative os lembretes"],
    "Todavía no agregaste actividades.": ["You haven't added any activities yet.", "Você ainda não adicionou atividades."],
    "¡Empezá a planificar tu viaje!": ["Start planning your trip!", "Comece a planejar sua viagem!"],
    "AGREGAR NOTA": ["ADD NOTE", "ADICIONAR NOTA"],
    "Checklist de Viaje": ["Trip checklist", "Checklist de viagem"],
    "¿Necesitás adaptador desde Argentina?": ["Need an adapter from Argentina?", "Precisa de adaptador para a Argentina?"],
    "Cámaras digitales": ["Digital cameras", "Câmeras digitais"],
    "Revisá antes de enchufar": ["Check before plugging in", "Verifique antes de ligar na tomada"],
    "Cantidad de días": ["Number of days", "Quantidade de dias"],
    "días": ["days", "dias"],
    "Agregar paradas": ["Add stops", "Adicionar paradas"],
    "Pegá links de Google Maps o Apple Maps (uno por línea)": ["Paste Google Maps or Apple Maps links (one per line)", "Cole links do Google Maps ou Apple Maps (um por linha)"],
    "Agregar links →": ["Add links →", "Adicionar links →"],
    "Tocá para subir un CSV": ["Tap to upload a CSV", "Toque para enviar um CSV"],
    "Columnas: nombre, descripción (opcional), link (opcional)": ["Columns: name, description (optional), link (optional)", "Colunas: nome, descrição (opcional), link (opcional)"],
    "O pegá el contenido CSV directo": ["Or paste the CSV content directly", "Ou cole o conteúdo do CSV diretamente"],
    "Agregar desde CSV →": ["Add from CSV →", "Adicionar do CSV →"],
    "Descripción (opcional)": ["Description (optional)", "Descrição (opcional)"],
    "Link o dirección de Maps (opcional)": ["Maps link or address (optional)", "Link ou endereço do Maps (opcional)"],
    "+ Agregar parada": ["+ Add stop", "+ Adicionar parada"],
    "Todavía no agregaste paradas": ["You haven't added any stops yet", "Você ainda não adicionou paradas"],
    "Planificación": ["Planning", "Planejamento"],
    "Clima / Temperatura": ["Weather / Temperature", "Clima / Temperatura"],
    "Antiácido": ["Antacid", "Antiácido"],
    "Lágrimas artificiales": ["Artificial tears", "Lágrimas artificiais"],
    "Sales de rehidratación": ["Rehydration salts", "Sais de reidratação"],
    "Sin resultados. Probá otro nombre.": ["No results. Try another name.", "Sem resultados. Tente outro nome."],
    "Esta información es orientativa. Consultá siempre con un farmacéutico o médico antes de automedicarte. Las dosis pueden variar según edad y peso.": ["This information is for guidance only. Always check with a pharmacist or doctor before self-medicating. Doses may vary by age and weight.", "Esta informação é apenas orientativa. Consulte sempre um farmacêutico ou médico antes de se automedicar. As doses podem variar conforme idade e peso."],
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
