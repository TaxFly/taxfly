(function() {
  "use strict";
  var overlay = document.getElementById("menuOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "menuOverlay";
    overlay.className = "menu-overlay";
    overlay.addEventListener("click", function() { window.toggleSettings?.(); });
    document.body.appendChild(overlay);
  }
  var drawer = document.getElementById("settingsDrawer");
  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "settingsDrawer";
    drawer.className = "settings-drawer";
    document.body.appendChild(drawer);
  }
  if (drawer.getAttribute("data-sx") === "1") return;
  drawer.setAttribute("data-sx", "1");
  var T = {
    es: {
      error: "Error",
      title: "Ajustes",
      close: "Cerrar",
      profile: "Perfil activo",
      prefs: "Preferencias",
      language: "Idioma",
      dark: "Modo oscuro",
      data: "Datos y respaldo",
      bk_title: "Respaldo de tu perfil",
      bk_desc: "Guardá una copia de todo lo de este perfil (gastos, actividades, notas, viajes y Mis cosas) en un archivo JSON, y restaurala cuando la necesites.",
      export: "Exportar",
      import: "Importar",
      last: "Último respaldo: {d}",
      never: "Todavía no hiciste ningún respaldo",
      account: "Cuenta",
      ai_credits: "Créditos IA",
      ai_center: "Inteligencia artificial",
      ai_desc: "Gestioná tus créditos y ayudá a mantener activas las funciones de IA de TaxUSA.",
      buy_credits: "Comprar créditos",
      ai_history: "Historial de uso",
      ai_profile_limits: "Uso de IA por perfil",
      ai_profile_limits_desc: "Elegí cuánto puede usar cada perfil de los créditos de esta cuenta.",
      ai_limit_unlimited: "Sin límite",
      ai_limit_limited: "Límite de créditos",
      ai_limit_blocked: "Sin acceso a IA",
      ai_limit_amount: "Máximo de créditos",
      ai_limit_used: "Usados: {u} de {l}",
      ai_limit_used_unlimited: "Usados registrados: {u}",
      ai_limit_active: "Perfil activo",
      ai_limit_save: "Guardar",
      ai_limit_reset: "Restablecer uso",
      ai_limit_saved: "Límite guardado",
      ai_limit_reset_done: "Uso restablecido",
      ai_limit_loading: "Cargando perfiles…",
      ai_limit_error: "No se pudieron cargar o guardar los límites de IA.",
      ai_limit_note: "Los límites se aplican al perfil seleccionado. El saldo total de créditos sigue perteneciendo a la cuenta.",
      support_taxusa: "Apoyar TaxUSA",
      support_desc: "Los aportes voluntarios ayudan a pagar Claude y la infraestructura.",
      cafecito: "Invitar un cafecito",
      credit_store_title: "Comprar créditos de IA",
      credit_store_desc: "Elegí una cantidad. Los créditos no vencen y se usan solo cuando una función llama a la IA.",
      custom_credits: "Personalizado",
      custom_credits_placeholder: "Cantidad de créditos",
      continue_purchase: "Continuar",
      price_currency_note: "Los precios se muestran en USD, la moneda de referencia de la API de Claude.",
      taxes_note: "El importe final puede variar por impuestos, tasas o conversión de moneda aplicados por tu país, banco o medio de pago.",
      credit_store_pending: "Los pagos todavía no están habilitados. Esta pantalla ya quedó preparada para conectarlos cuando activemos el proveedor de pagos.",
      credits_unit: "créditos",
      soon: "Próximamente",
      history_title: "Historial de uso",
      history_pending: "El historial estará disponible cuando activemos el cobro de créditos. Tu cuenta owner seguirá mostrando acceso ilimitado.",
      cafecito_missing: "Falta configurar tu enlace de Cafecito en config.js (SUPPORT_CAFECITO_URL).",
      open_cafecito: "Abrir Cafecito",
      switch_profile: "Cambiar perfil",
      email: "Cambiar correo",
      email_prompt: "Ingresá tu nuevo correo:",
      email_sent: "Te enviamos un correo de verificación al nuevo email. Abrilo para confirmar el cambio.",
      email_no_session: "No hay una sesión activa.",
      email_invalid: "Ingresá un correo válido.",
      email_error: "No se pudo iniciar el cambio de correo: {m}",
      password: "Cambiar contraseña",
      pin: "PIN offline",
      app: "Aplicación",
      install: "Instalar TaxFly",
      update: "Actualizar app",
      logout: "Cerrar sesión",
      danger: "Zona de peligro",
      del: "Eliminar cuenta",
      exp_title: "Exportar respaldo",
      exp_includes: "Se incluye",
      it_gastos: "Gastos",
      it_act: "Actividades",
      it_notas: "Notas",
      it_orl: "Planificación",
      it_mis: "Mis cosas de viaje",
      it_prof: "Presupuesto y viaje",
      exp_tickets: "Incluir archivos de Tickets",
      exp_tickets_hint: "PDF y fotos: pueden pesar bastante.",
      cancel: "Cancelar",
      download: "Descargar respaldo",
      reading: "Leyendo tus datos…",
      reading_n: "{n} documentos leídos",
      exp_done: "Respaldo descargado",
      docs_size: "{n} documentos · {s}",
      exp_saved: "Guardalo en un lugar seguro (Drive, correo, etc.).",
      warn_read: "No se pudo leer: {l}",
      ok: "Listo",
      imp_title: "Importar respaldo",
      imp_from: "Respaldo de {n}",
      imp_date: "Exportado el {d}",
      imp_has: "{n} documentos",
      imp_dest: "Restaurar en",
      dest_active: "Perfil activo ({n})",
      dest_orig: "Perfil original ({n})",
      dest_orig_new: "Se vuelve a crear en tu lista de perfiles",
      imp_tickets: "Incluir archivos de Tickets ({n} documentos)",
      imp_note: "Los documentos con el mismo id se reemplazan; lo que no esté en el respaldo no se toca.",
      restore: "Restaurar",
      restoring: "Restaurando…",
      restoring_n: "{a} de {b}",
      imp_done: "Restauración completa",
      imp_done_n: "{n} documentos restaurados",
      imp_other: 'El perfil "{n}" ya está en tu lista: cambiá de perfil para verlo.',
      imp_fail: "{n} documentos no se pudieron escribir ({e}).",
      reload: "Recargar",
      go_switch: "Cambiar perfil",
      e_user: "Necesitás tener la sesión iniciada y conexión para hacer esto.",
      e_profile: "No hay un perfil activo. Elegí uno primero.",
      e_json: "El archivo no es un JSON válido.",
      e_notbk: "Este archivo no es un respaldo de TaxFly.",
      e_newer: "Este respaldo es de una versión más nueva de la app.",
      e_gen: "Ocurrió un error: {m}",
      e_app: "La app todavía se está cargando. Probá de nuevo en unos segundos."
    },
    en: {
      error: "Error",
      title: "Settings",
      close: "Close",
      profile: "Active profile",
      prefs: "Preferences",
      language: "Language",
      dark: "Dark mode",
      data: "Data & backup",
      bk_title: "Back up your profile",
      bk_desc: "Save a copy of everything in this profile (expenses, activities, notes, trips and My stuff) as a JSON file, and restore it whenever you need.",
      export: "Export",
      import: "Import",
      last: "Last backup: {d}",
      never: "You haven't made a backup yet",
      account: "Account",
      ai_credits: "AI credits",
      ai_center: "Artificial intelligence",
      ai_desc: "Manage your credits and help keep TaxUSA AI features running.",
      buy_credits: "Buy credits",
      ai_history: "Usage history",
      ai_profile_limits: "AI use by profile",
      ai_profile_limits_desc: "Choose how much each profile can use from this account's AI credits.",
      ai_limit_unlimited: "No limit",
      ai_limit_limited: "Credit limit",
      ai_limit_blocked: "No AI access",
      ai_limit_amount: "Maximum credits",
      ai_limit_used: "Used: {u} of {l}",
      ai_limit_used_unlimited: "Recorded usage: {u}",
      ai_limit_active: "Active profile",
      ai_limit_save: "Save",
      ai_limit_reset: "Reset usage",
      ai_limit_saved: "Limit saved",
      ai_limit_reset_done: "Usage reset",
      ai_limit_loading: "Loading profiles…",
      ai_limit_error: "AI profile limits could not be loaded or saved.",
      ai_limit_note: "Limits apply to the selected profile. The total AI credit balance still belongs to the account.",
      support_taxusa: "Support TaxUSA",
      support_desc: "Voluntary contributions help pay for Claude and infrastructure.",
      cafecito: "Buy me a Cafecito",
      credit_store_title: "Buy AI credits",
      credit_store_desc: "Choose an amount. Credits do not expire and are only used when a feature calls AI.",
      custom_credits: "Custom",
      custom_credits_placeholder: "Number of credits",
      continue_purchase: "Continue",
      price_currency_note: "Prices are shown in USD, the reference currency used for Claude API pricing.",
      taxes_note: "The final amount may vary due to taxes, fees, or currency conversion applied by your country, bank, or payment method.",
      credit_store_pending: "Payments are not enabled yet. This screen is ready to connect once the payment provider is activated.",
      credits_unit: "credits",
      soon: "Coming soon",
      history_title: "Usage history",
      history_pending: "History will be available once credit billing is enabled. Your owner account will keep unlimited access.",
      cafecito_missing: "Your Cafecito link still needs to be configured in config.js (SUPPORT_CAFECITO_URL).",
      open_cafecito: "Open Cafecito",
      switch_profile: "Change profile",
      email: "Change email",
      email_prompt: "Enter your new email:",
      email_sent: "We sent a verification email to the new address. Open it to confirm the change.",
      email_no_session: "There is no active session.",
      email_invalid: "Enter a valid email address.",
      email_error: "Could not start the email change: {m}",
      password: "Change password",
      pin: "Offline PIN",
      app: "App",
      install: "Install TaxFly",
      update: "Update app",
      logout: "Log out",
      danger: "Danger zone",
      del: "Delete account",
      exp_title: "Export backup",
      exp_includes: "Included",
      it_gastos: "Expenses",
      it_act: "Activities",
      it_notas: "Notes",
      it_orl: "Planning",
      it_mis: "My travel stuff",
      it_prof: "Budget & trip",
      exp_tickets: "Include Tickets files",
      exp_tickets_hint: "PDFs and photos: they can be large.",
      cancel: "Cancel",
      download: "Download backup",
      reading: "Reading your data…",
      reading_n: "{n} documents read",
      exp_done: "Backup downloaded",
      docs_size: "{n} documents · {s}",
      exp_saved: "Keep it somewhere safe (Drive, email, etc.).",
      warn_read: "Could not read: {l}",
      ok: "Done",
      imp_title: "Import backup",
      imp_from: "Backup of {n}",
      imp_date: "Exported on {d}",
      imp_has: "{n} documents",
      imp_dest: "Restore into",
      dest_active: "Active profile ({n})",
      dest_orig: "Original profile ({n})",
      dest_orig_new: "It will be re-created in your profile list",
      imp_tickets: "Include Tickets files ({n} documents)",
      imp_note: "Documents with the same id are replaced; anything not in the backup is left untouched.",
      restore: "Restore",
      restoring: "Restoring…",
      restoring_n: "{a} of {b}",
      imp_done: "Restore complete",
      imp_done_n: "{n} documents restored",
      imp_other: 'The profile "{n}" is now in your list: switch profile to see it.',
      imp_fail: "{n} documents could not be written ({e}).",
      reload: "Reload",
      go_switch: "Change profile",
      e_user: "You need to be signed in and online to do this.",
      e_profile: "There is no active profile. Pick one first.",
      e_json: "The file is not valid JSON.",
      e_notbk: "This file is not a TaxFly backup.",
      e_newer: "This backup comes from a newer version of the app.",
      e_gen: "Something went wrong: {m}",
      e_app: "The app is still loading. Try again in a few seconds."
    },
    pt: {
      error: "Erro",
      title: "Configurações",
      close: "Fechar",
      profile: "Perfil ativo",
      prefs: "Preferências",
      language: "Idioma",
      dark: "Modo escuro",
      data: "Dados e backup",
      bk_title: "Backup do seu perfil",
      bk_desc: "Salve uma cópia de tudo neste perfil (gastos, atividades, notas, viagens e Minhas coisas) em um arquivo JSON e restaure quando precisar.",
      export: "Exportar",
      import: "Importar",
      last: "Último backup: {d}",
      never: "Você ainda não fez nenhum backup",
      account: "Conta",
      ai_credits: "Créditos de IA",
      ai_center: "Inteligência artificial",
      ai_desc: "Gerencie seus créditos e ajude a manter os recursos de IA do TaxUSA ativos.",
      buy_credits: "Comprar créditos",
      ai_history: "Histórico de uso",
      ai_profile_limits: "Uso de IA por perfil",
      ai_profile_limits_desc: "Escolha quanto cada perfil pode usar dos créditos de IA desta conta.",
      ai_limit_unlimited: "Sem limite",
      ai_limit_limited: "Limite de créditos",
      ai_limit_blocked: "Sem acesso à IA",
      ai_limit_amount: "Máximo de créditos",
      ai_limit_used: "Usados: {u} de {l}",
      ai_limit_used_unlimited: "Uso registrado: {u}",
      ai_limit_active: "Perfil ativo",
      ai_limit_save: "Salvar",
      ai_limit_reset: "Redefinir uso",
      ai_limit_saved: "Limite salvo",
      ai_limit_reset_done: "Uso redefinido",
      ai_limit_loading: "Carregando perfis…",
      ai_limit_error: "Não foi possível carregar ou salvar os limites de IA.",
      ai_limit_note: "Os limites se aplicam ao perfil selecionado. O saldo total de créditos de IA continua pertencendo à conta.",
      support_taxusa: "Apoiar o TaxUSA",
      support_desc: "As contribuições voluntárias ajudam a pagar o Claude e a infraestrutura.",
      cafecito: "Pagar um Cafecito",
      credit_store_title: "Comprar créditos de IA",
      credit_store_desc: "Escolha uma quantidade. Os créditos não vencem e só são usados quando um recurso chama a IA.",
      custom_credits: "Personalizado",
      custom_credits_placeholder: "Quantidade de créditos",
      continue_purchase: "Continuar",
      price_currency_note: "Os preços são exibidos em USD, a moeda de referência usada nos preços da API do Claude.",
      taxes_note: "O valor final pode variar por impostos, taxas ou conversão de moeda aplicados pelo seu país, banco ou meio de pagamento.",
      credit_store_pending: "Os pagamentos ainda não estão habilitados. Esta tela já está pronta para conectar quando ativarmos o provedor de pagamentos.",
      credits_unit: "créditos",
      soon: "Em breve",
      history_title: "Histórico de uso",
      history_pending: "O histórico estará disponível quando ativarmos a cobrança de créditos. Sua conta owner continuará com acesso ilimitado.",
      cafecito_missing: "Falta configurar seu link do Cafecito em config.js (SUPPORT_CAFECITO_URL).",
      open_cafecito: "Abrir Cafecito",
      switch_profile: "Trocar perfil",
      email: "Alterar e-mail",
      email_prompt: "Digite seu novo e-mail:",
      email_sent: "Enviamos um e-mail de verificação para o novo endereço. Abra-o para confirmar a alteração.",
      email_no_session: "Não há uma sessão ativa.",
      email_invalid: "Digite um e-mail válido.",
      email_error: "Não foi possível iniciar a alteração do e-mail: {m}",
      password: "Alterar senha",
      pin: "PIN offline",
      app: "Aplicativo",
      install: "Instalar TaxFly",
      update: "Atualizar app",
      logout: "Sair",
      danger: "Zona de perigo",
      del: "Excluir conta",
      exp_title: "Exportar backup",
      exp_includes: "Inclui",
      it_gastos: "Gastos",
      it_act: "Atividades",
      it_notas: "Notas",
      it_orl: "Planejamento",
      it_mis: "Minhas coisas de viagem",
      it_prof: "Orçamento e viagem",
      exp_tickets: "Incluir arquivos de Tickets",
      exp_tickets_hint: "PDFs e fotos: podem ser pesados.",
      cancel: "Cancelar",
      download: "Baixar backup",
      reading: "Lendo seus dados…",
      reading_n: "{n} documentos lidos",
      exp_done: "Backup baixado",
      docs_size: "{n} documentos · {s}",
      exp_saved: "Guarde em um lugar seguro (Drive, e-mail etc.).",
      warn_read: "Não foi possível ler: {l}",
      ok: "Pronto",
      imp_title: "Importar backup",
      imp_from: "Backup de {n}",
      imp_date: "Exportado em {d}",
      imp_has: "{n} documentos",
      imp_dest: "Restaurar em",
      dest_active: "Perfil ativo ({n})",
      dest_orig: "Perfil original ({n})",
      dest_orig_new: "Será recriado na sua lista de perfis",
      imp_tickets: "Incluir arquivos de Tickets ({n} documentos)",
      imp_note: "Documentos com o mesmo id são substituídos; o que não estiver no backup não é alterado.",
      restore: "Restaurar",
      restoring: "Restaurando…",
      restoring_n: "{a} de {b}",
      imp_done: "Restauração concluída",
      imp_done_n: "{n} documentos restaurados",
      imp_other: 'O perfil "{n}" já está na sua lista: troque de perfil para vê-lo.',
      imp_fail: "{n} documentos não puderam ser gravados ({e}).",
      reload: "Recarregar",
      go_switch: "Trocar perfil",
      e_user: "Você precisa estar conectado e online para fazer isso.",
      e_profile: "Não há perfil ativo. Escolha um primeiro.",
      e_json: "O arquivo não é um JSON válido.",
      e_notbk: "Este arquivo não é um backup do TaxFly.",
      e_newer: "Este backup é de uma versão mais nova do app.",
      e_gen: "Ocorreu um erro: {m}",
      e_app: "O app ainda está carregando. Tente de novo em alguns segundos."
    }
  };
  function lang() {
    var l = "es";
    try {
      l = localStorage.getItem("appLang") || "es";
    } catch (e) {}
    return T[l] ? l : "es";
  }
  function t(k, v) {
    var s = (T[lang()][k] !== undefined ? T[lang()][k] : T.es[k]) || k;
    if (v) Object.keys(v).forEach(function(n) {
      s = s.split("{" + n + "}").join(v[n]);
    });
    return s;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }
  var P = {
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    refresh: '<path d="M21 12a9 9 0 0 0-15.5-6.2L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15.5 6.2L21 16"/><path d="M16 16h5v5"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    chev: '<polyline points="9 18 15 12 9 6"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/>',
    coffee: '<path d="M3 8h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    sparkles: '<path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4L12 3z"/><path d="m5 14-.9 2.1L2 17l2.1.9L5 20l.9-2.1L8 17l-2.1-.9L5 14z"/><path d="m19 14-.9 2.1L16 17l2.1.9L19 20l.9-2.1L22 17l-2.1-.9L19 14z"/>'
  };
  function ic(n, s) {
    return '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>";
  }
  var css = [ "#settingsDrawer.settings-drawer{width:min(370px,92vw);right:calc(-1 * min(370px,92vw) - 24px);padding:0;gap:0;display:flex;flex-direction:column;overflow:hidden;background:var(--surface);}", "#settingsDrawer.settings-drawer.open{right:0;}", "#settingsDrawer .sx-head{display:flex;align-items:center;justify-content:space-between;padding:calc(18px + env(safe-area-inset-top,0px)) 18px 10px;flex-shrink:0;}", "#settingsDrawer .sx-title{font-size:1.15rem;font-weight:900;color:var(--text);letter-spacing:-.2px;}", "#settingsDrawer .sx-x{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text-sub);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:var(--tr);}", "#settingsDrawer .sx-x:hover{color:var(--text);border-color:var(--primary);}", "#settingsDrawer .sx-scroll{flex:1;overflow-y:auto;padding:4px 18px 22px;-webkit-overflow-scrolling:touch;}", "#settingsDrawer .sx-me{display:flex;align-items:center;gap:12px;padding:14px;border-radius:18px;background:linear-gradient(135deg,rgba(37,99,235,.12),rgba(124,58,237,.10));border:1.5px solid var(--border);margin-bottom:6px;}", "#settingsDrawer .sx-av{width:52px;height:52px;border-radius:50%;background:var(--input-bg) center/cover no-repeat;border:2px solid var(--primary);flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--primary);}", "#settingsDrawer .sx-me-txt{min-width:0;flex:1;}", "#settingsDrawer .sx-me-lbl{font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);}", "#settingsDrawer .sx-me #userEmail{margin:1px 0 0;font-size:1rem;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}", "#settingsDrawer .sx-mail{font-size:.72rem;font-weight:600;color:var(--text-sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}", "#settingsDrawer .sx-chip{flex-shrink:0;width:38px;height:38px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface);color:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:var(--tr);}", "#settingsDrawer .sx-chip:hover{border-color:var(--primary);background:var(--input-bg);}", "#settingsDrawer .sx-sec{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:1.1px;color:var(--text-dim);margin:20px 4px 8px;display:block;}", "#settingsDrawer .sx-card{background:var(--input-bg);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;}", "#settingsDrawer .sx-row{width:100%;display:flex;align-items:center;gap:12px;padding:11px 12px;border:none;background:transparent;color:var(--text);font-family:inherit;font-size:.86rem;font-weight:700;text-align:left;cursor:pointer;transition:var(--tr);}", "#settingsDrawer .sx-row + .sx-row,#settingsDrawer .sx-row + .sx-line,#settingsDrawer .sx-line + .sx-row{border-top:1px solid var(--border);}", "#settingsDrawer button.sx-row:hover{background:var(--surface-2);}", "#settingsDrawer .sx-ico{width:34px;height:34px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--c,var(--primary));background:rgba(37,99,235,.12);background:color-mix(in srgb,var(--c,var(--primary)) 14%,transparent);}", "#settingsDrawer .sx-lbl{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}", "#settingsDrawer .sx-go{color:var(--text-dim);flex-shrink:0;}", "#settingsDrawer .sx-row-lang{flex-wrap:wrap;row-gap:8px;}", "#settingsDrawer .sx-row-lang .sx-lbl{flex:1 1 auto;overflow:visible;text-overflow:clip;}", "#settingsDrawer .sx-lang{display:flex;flex:1 1 100%;background:var(--surface);border-radius:12px;padding:3px;gap:3px;border:1.5px solid var(--border);}", "#settingsDrawer .sx-lang .lang-opt{flex:1;min-width:0;padding:6px 4px;margin:0;font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}", "#settingsDrawer .sx-row:has(> .sx-lang){flex-wrap:wrap;row-gap:8px}", "#settingsDrawer .sx-row:has(> .sx-lang) > .sx-lbl{flex:0 0 auto;min-width:max-content;overflow:visible;text-overflow:clip}", "#settingsDrawer .sx-row:has(> .sx-lang) > .sx-lang{flex:1 1 180px;min-width:180px;margin-left:auto}", "#settingsDrawer .sx-sw{width:42px;height:24px;border-radius:24px;background:var(--border);position:relative;flex-shrink:0;transition:.2s;}", '#settingsDrawer .sx-sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:.2s;}', "#settingsDrawer .sx-sw.on{background:var(--primary);}", "#settingsDrawer .sx-sw.on::after{left:21px;}", "#settingsDrawer .sx-bk{border-radius:18px;border:1.5px solid rgba(16,185,129,.4);background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(14,165,233,.08));padding:14px;}", "#settingsDrawer .sx-bk-h{display:flex;align-items:center;gap:10px;font-weight:900;font-size:.95rem;color:var(--text);margin-bottom:6px;}", "#settingsDrawer .sx-bk-h .sx-ico{--c:#10b981;}", "#settingsDrawer .sx-bk p{margin:0 0 10px;font-size:.76rem;line-height:1.45;font-weight:600;color:var(--text-sub);}", "#settingsDrawer .sx-bk-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;}", "#settingsDrawer .sx-btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font-family:inherit;font-weight:800;font-size:.82rem;cursor:pointer;transition:var(--tr);}", "#settingsDrawer .sx-btn:hover{border-color:#10b981;color:#10b981;}", "#settingsDrawer .sx-btn.pri{background:#10b981;border-color:#10b981;color:#fff;}", "#settingsDrawer .sx-btn.pri:hover{filter:brightness(1.08);color:#fff;}", "#settingsDrawer .sx-last{margin-top:9px;font-size:.68rem;font-weight:700;color:var(--text-dim);display:flex;align-items:center;gap:6px;}", "#settingsDrawer .sx-last.warn{color:#f59e0b;}", "#settingsDrawer .sx-ai{border-radius:20px;border:1.5px solid rgba(124,58,237,.35);background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(37,99,235,.08));padding:14px;overflow:hidden;position:relative;}", '#settingsDrawer .sx-ai::after{content:"";position:absolute;width:110px;height:110px;border-radius:50%;right:-48px;top:-52px;background:rgba(124,58,237,.10);pointer-events:none;}', "#settingsDrawer .sx-ai-top{display:flex;align-items:center;gap:10px;position:relative;z-index:1;list-style:none;cursor:pointer;user-select:none;}", "#settingsDrawer .sx-ai-top::-webkit-details-marker{display:none;}", "#settingsDrawer .sx-ai-top .sx-ico{--c:#7c3aed;}", "#settingsDrawer .sx-ai-title{font-size:.95rem;font-weight:900;color:var(--text);flex:1;}", "#settingsDrawer .sx-ai-balance{font-size:.76rem;font-weight:900;color:#7c3aed;background:var(--surface);border:1px solid var(--border);border-radius:99px;padding:5px 9px;white-space:nowrap;}", "#settingsDrawer .sx-ai-chev{display:flex;align-items:center;justify-content:center;color:var(--text-dim);transition:transform .2s ease;}", "#settingsDrawer .sx-ai[open] .sx-ai-chev{transform:rotate(90deg);}", "#settingsDrawer .sx-ai-body{padding-top:8px;}", "#settingsDrawer .sx-ai-desc{margin:0 0 11px;font-size:.74rem;line-height:1.45;font-weight:600;color:var(--text-sub);position:relative;z-index:1;}", "#settingsDrawer .sx-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:relative;z-index:1;}", "#settingsDrawer .sx-ai-actions .sx-btn{min-width:0;padding:10px 8px;font-size:.76rem;}", "#settingsDrawer .sx-ai-actions .sx-btn.ai-pri{background:linear-gradient(135deg,#7c3aed,#2563eb);border-color:transparent;color:#fff;}", "#settingsDrawer .sx-ai-actions .sx-btn.ai-pri:hover{filter:brightness(1.06);color:#fff;}", "#settingsDrawer .sx-ai-actions .sx-btn.ai-wide{grid-column:1/-1;border-color:rgba(124,58,237,.28);}", "#settingsDrawer .sx-ai-actions .sx-btn.ai-wide:hover{color:#7c3aed;border-color:#7c3aed;}", "#settingsDrawer .sx-ai-support{margin-top:10px;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--border) 80%,transparent);}", "#settingsDrawer .sx-ai-support-copy{font-size:.68rem;line-height:1.4;color:var(--text-dim);font-weight:600;margin:0 0 8px;}", "#settingsDrawer .sx-ai-support .sx-btn{width:100%;border-color:rgba(245,158,11,.35);}", "#settingsDrawer .sx-ai-support .sx-btn:hover{color:#f59e0b;border-color:#f59e0b;}", "#settingsDrawer .sx-foot{margin-top:18px;display:flex;flex-direction:column;gap:10px;}", "#settingsDrawer .sx-out{width:100%;justify-content:center;}", "#settingsDrawer .sx-danger{margin-top:8px;padding-top:14px;border-top:1px dashed var(--border);}", "#settingsDrawer .sx-danger-l{font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:8px;display:block;}", "#settingsDrawer .sx-del{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-radius:12px;border:1.5px solid rgba(239,68,68,.35);background:transparent;color:#ef4444;font-family:inherit;font-weight:800;font-size:.8rem;cursor:pointer;transition:var(--tr);}", "#settingsDrawer .sx-del:hover{background:rgba(239,68,68,.1);border-color:#ef4444;}", "#sxModal{display:none;position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);align-items:center;justify-content:center;padding:18px;}", "#sxModal.open{display:flex;}", "#sxModal .sxm{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow-lg);width:100%;max-width:400px;max-height:90vh;overflow-y:auto;padding:22px 20px;font-family:inherit;}", "#sxModal .sxm-t{font-size:1.05rem;font-weight:900;margin:0 0 4px;display:flex;align-items:center;gap:9px;}", "#sxModal .sxm-s{font-size:.78rem;font-weight:600;color:var(--text-sub);margin:0 0 14px;line-height:1.45;}", "#sxModal .sxm-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px;}", "#sxModal .sxm-chip{font-size:.7rem;font-weight:800;padding:5px 10px;border-radius:99px;background:var(--input-bg);border:1px solid var(--border);color:var(--text-sub);}", "#sxModal .sxm-opt{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border:1.5px solid var(--border);border-radius:14px;background:var(--input-bg);margin-bottom:8px;cursor:pointer;font-size:.82rem;font-weight:700;}", "#sxModal .sxm-opt input{margin-top:2px;accent-color:var(--primary);width:16px;height:16px;flex-shrink:0;}", "#sxModal .sxm-opt small{display:block;font-weight:600;color:var(--text-dim);font-size:.7rem;margin-top:2px;}", "#sxModal .sxm-note{font-size:.72rem;color:var(--text-dim);font-weight:600;margin:6px 0 14px;line-height:1.4;}", "#sxModal .sxm-warn{font-size:.74rem;color:#f59e0b;font-weight:700;margin:0 0 12px;line-height:1.4;}", "#sxModal .sxm-err{font-size:.8rem;color:#ef4444;font-weight:700;margin:0 0 14px;line-height:1.45;}", "#sxModal .sxm-btns{display:flex;gap:8px;margin-top:6px;}", "#sxModal .sxm-b{flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text-sub);font-family:inherit;font-weight:800;font-size:.85rem;cursor:pointer;}", "#sxModal .sxm-b.pri{background:var(--primary);border-color:var(--primary);color:#fff;}", "#sxModal .sxm-packages{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 14px;}", "#sxModal .sxm-pack{padding:14px 10px;border-radius:14px;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text);font-family:inherit;text-align:left;cursor:pointer;transition:var(--tr);}", "#sxModal .sxm-pack:hover{border-color:var(--primary);transform:translateY(-1px);}", "#sxModal .sxm-pack strong{display:block;font-size:1rem;font-weight:900;}", "#sxModal .sxm-pack small{display:block;color:var(--text-dim);font-size:.68rem;font-weight:700;margin-top:2px;}", "#sxModal .sxm-pack[disabled]{opacity:.6;cursor:default;transform:none;}", "#sxModal .sxm-custom{margin:0 0 12px;padding:12px;border:1.5px solid var(--border);border-radius:14px;background:var(--input-bg);}", "#sxModal .sxm-custom-title{font-size:.78rem;font-weight:900;margin-bottom:8px;color:var(--text);}", "#sxModal .sxm-custom-row{display:grid;grid-template-columns:1fr auto;gap:8px;}", "#sxModal .sxm-custom input{min-width:0;width:100%;padding:11px 12px;border-radius:11px;border:1.5px solid var(--border);background:var(--surface);color:var(--text);font:inherit;font-size:.82rem;font-weight:700;outline:none;}", "#sxModal .sxm-custom input:focus{border-color:var(--primary);}", "#sxModal .sxm-custom button{padding:0 13px;border-radius:11px;border:1.5px solid var(--primary);background:var(--primary);color:#fff;font:inherit;font-size:.78rem;font-weight:900;cursor:pointer;}", "#sxModal .sxm-custom button:disabled{opacity:.55;cursor:default;}", "#sxModal .sxm-price-note{font-size:.69rem;line-height:1.45;color:var(--text-dim);font-weight:650;margin:6px 0;}", "#sxModal .sxm-ai-profile{border:1.5px solid var(--border);border-radius:16px;padding:12px;margin:10px 0;background:var(--input-bg);}", "#sxModal .sxm-ai-profile-head{display:flex;align-items:center;gap:8px;margin-bottom:9px;}", "#sxModal .sxm-ai-profile-name{font-size:.84rem;font-weight:900;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}", "#sxModal .sxm-ai-active{font-size:.6rem;font-weight:850;color:#7c3aed;background:rgba(124,58,237,.12);border-radius:99px;padding:4px 7px;}", "#sxModal .sxm-ai-controls{display:grid;grid-template-columns:1fr;gap:8px;}", "#sxModal .sxm-ai-controls select,#sxModal .sxm-ai-controls input{width:100%;box-sizing:border-box;border:1.5px solid var(--border);background:var(--surface);color:var(--text);border-radius:11px;padding:10px;font:700 .78rem inherit;}", "#sxModal .sxm-ai-limit-row{display:none;grid-template-columns:1fr auto;gap:8px;align-items:center;}", "#sxModal .sxm-ai-profile[data-mode=limited] .sxm-ai-limit-row{display:grid;}", "#sxModal .sxm-ai-usage{font-size:.67rem;font-weight:700;color:var(--text-dim);}", "#sxModal .sxm-ai-card-actions{display:flex;gap:7px;margin-top:8px;}", "#sxModal .sxm-ai-card-actions button{flex:1;border:1.5px solid var(--border);background:var(--surface);color:var(--text);border-radius:10px;padding:8px;font:800 .72rem inherit;cursor:pointer;}", "#sxModal .sxm-ai-card-actions button.pri{background:#7c3aed;border-color:#7c3aed;color:#fff;}", "#sxModal .sxm-prog{height:8px;border-radius:8px;background:var(--border);overflow:hidden;margin:10px 0 8px;}", "#sxModal .sxm-prog i{display:block;height:100%;width:0;background:#10b981;transition:width .2s;}", "#sxModal .sxm-prog.ind i{width:40%;animation:sxind 1.1s ease-in-out infinite alternate;}", "@keyframes sxind{from{margin-left:0}to{margin-left:60%}}", "#sxModal .sxm-okic{width:56px;height:56px;border-radius:50%;background:rgba(16,185,129,.15);color:#10b981;display:flex;align-items:center;justify-content:center;margin:2px auto 12px;}", "#sxModal .sxm-center{text-align:center;}" ].join("\n");
  var st = document.createElement("style");
  st.id = "sx-style";
  st.textContent = css;
  document.head.appendChild(st);
  var FLAG = {
    es: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="4.3" y="0" fill="#74acdf"/><rect width="18" height="4.4" y="4.3" fill="#fff"/><rect width="18" height="4.3" y="8.7" fill="#74acdf"/><circle cx="9" cy="6.5" r="1.5" fill="#f6b40e"/></svg>',
    en: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="13" fill="#B22234"/><rect width="18" height="1" y="1" fill="#fff"/><rect width="18" height="1" y="3" fill="#fff"/><rect width="18" height="1" y="5" fill="#fff"/><rect width="18" height="1" y="7" fill="#fff"/><rect width="18" height="1" y="9" fill="#fff"/><rect width="18" height="1" y="11" fill="#fff"/><rect width="7" height="7" fill="#3C3B6E"/></svg>',
    pt: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="13" fill="#009c3b"/><polygon points="9,1 17,6.5 9,12 1,6.5" fill="#FEDF00"/><circle cx="9" cy="6.5" r="2.6" fill="#002776"/></svg>'
  };
  function row(act, icon, color, key, extra) {
    return '<button type="button" class="sx-row" data-act="' + act + '"><span class="sx-ico" style="--c:' + color + '">' + ic(icon) + '</span><span class="sx-lbl" data-t="' + key + '"></span>' + (extra || '<span class="sx-go">' + ic("chev", 16) + "</span>") + "</button>";
  }
  drawer.innerHTML = '<div class="sx-head"><span class="sx-title" data-t="title"></span><button type="button" class="sx-x" data-act="close" data-tl="close" aria-label="Cerrar">' + ic("close", 16) + "</button></div>" + '<div class="sx-scroll">' + '<div class="sx-me">' + '<div class="sx-av" id="sxAvatar">' + ic("users", 22) + "</div>" + '<div class="sx-me-txt"><div class="sx-me-lbl" data-t="profile"></div><p id="userEmail" class="drawer-email"></p><div class="sx-mail" id="sxMail"></div></div>' + '<button type="button" class="sx-chip" data-act="profile" data-tl="switch_profile">' + ic("users", 18) + "</button>" + "</div>" + '<span class="sx-sec" data-t="prefs"></span>' + '<div class="sx-card">' + '<div class="sx-row sx-row-lang"><span class="sx-ico" style="--c:#0ea5e9">' + ic("globe") + '</span><span class="sx-lbl" data-t="language"></span>' + '<div class="sx-lang">' + '<button type="button" class="lang-opt" id="lang-es" data-lang="es">' + FLAG.es + " ES</button>" + '<button type="button" class="lang-opt" id="lang-en" data-lang="en">' + FLAG.en + " EN</button>" + '<button type="button" class="lang-opt" id="lang-pt" data-lang="pt">' + FLAG.pt + " PT</button>" + "</div></div>" + row("theme", "moon", "#7c3aed", "dark", '<span class="sx-sw" id="sxSwitch" role="switch" aria-checked="false"></span>') + "</div>" + '<span class="sx-sec" data-t="data"></span>' + '<div class="sx-bk">' + '<div class="sx-bk-h"><span class="sx-ico">' + ic("shield") + '</span><span data-t="bk_title"></span></div>' + '<p data-t="bk_desc"></p>' + '<div class="sx-bk-btns">' + '<button type="button" class="sx-btn pri" data-act="export">' + ic("download", 16) + '<span data-t="export"></span></button>' + '<button type="button" class="sx-btn" data-act="import">' + ic("upload", 16) + '<span data-t="import"></span></button>' + "</div>" + '<div class="sx-last" id="sxLast"></div>' + "</div>" + '<span class="sx-sec" data-t="ai_center"></span>' + '<details class="sx-ai"><summary class="sx-ai-top"><span class="sx-ico">' + ic("sparkles") + '</span><span class="sx-ai-title" data-t="ai_credits"></span><strong class="sx-ai-balance" id="sxAIValue">—</strong><span class="sx-ai-chev">' + ic("chev",16) + '</span></summary><div class="sx-ai-body"><p class="sx-ai-desc" data-t="ai_desc"></p><div class="sx-ai-actions"><button type="button" class="sx-btn ai-pri" data-act="buy-credits">' + ic("card",16) + '<span data-t="buy_credits"></span></button><button type="button" class="sx-btn" data-act="ai-history">' + ic("history",16) + '<span data-t="ai_history"></span></button><button type="button" class="sx-btn ai-wide" data-act="ai-profile-limits">' + ic("users",16) + '<span data-t="ai_profile_limits"></span></button></div><div class="sx-ai-support"><p class="sx-ai-support-copy" data-t="support_desc"></p><button type="button" class="sx-btn" data-act="cafecito">' + ic("coffee",16) + '<span data-t="cafecito"></span></button></div></div></details>' + '<span class="sx-sec" data-t="account"></span>' + '<div class="sx-card">' + row("email", "mail", "#2563eb", "email") + row("password", "key", "#f59e0b", "password") + row("pin", "lock", "#14b8a6", "pin") + "</div>" + '<span class="sx-sec" data-t="app"></span>' + '<div class="sx-card">' + row("install", "phone", "#10b981", "install") + row("reload", "refresh", "#0ea5e9", "update") + "</div>" + '<div class="sx-foot">' + '<button type="button" class="sx-btn sx-out" data-act="logout">' + ic("logout", 16) + '<span data-t="logout"></span></button>' + '<div class="sx-danger"><span class="sx-danger-l" data-t="danger"></span>' + '<button type="button" class="sx-del" data-act="delete">' + ic("trash", 15) + '<span data-t="del"></span></button></div>' + "</div>" + "</div>" + '<input type="file" id="sxFile" accept="application/json,.json" style="display:none">';
  function applyText() {
    drawer.querySelectorAll("[data-t]").forEach(function(el) {
      el.textContent = t(el.getAttribute("data-t"));
    });
    drawer.querySelectorAll("[data-tl]").forEach(function(el) {
      var s = t(el.getAttribute("data-tl"));
      el.setAttribute("aria-label", s);
      el.setAttribute("title", s);
    });
    [ "es", "en", "pt" ].forEach(function(l) {
      var b = document.getElementById("lang-" + l);
      if (b) b.classList.toggle("active", l === lang());
    });
  }
  function activePid() {
    try {
      return localStorage.getItem("perfilActivoId");
    } catch (e) {
      return null;
    }
  }
  function applyLast() {
    var el = document.getElementById("sxLast");
    if (!el) return;
    var iso = null;
    try {
      iso = localStorage.getItem("taxfly_last_backup_" + activePid());
    } catch (e) {}
    if (iso) {
      var d = new Date(iso), s = isNaN(d) ? "" : d.toLocaleDateString(lang() === "en" ? "en-US" : lang() === "pt" ? "pt-BR" : "es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
      el.className = "sx-last";
      el.innerHTML = ic("check", 13) + "<span>" + esc(t("last", {
        d: s
      })) + "</span>";
    } else {
      el.className = "sx-last warn";
      el.innerHTML = ic("alert", 13) + "<span>" + esc(t("never")) + "</span>";
    }
  }
  function applyTheme() {
    var sw = document.getElementById("sxSwitch");
    if (!sw) return;
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    sw.classList.toggle("on", dark);
    sw.setAttribute("aria-checked", dark ? "true" : "false");
  }
  function applyProfile() {
    var av = document.getElementById("sxAvatar"), foto = null, nombre = null;
    try {
      foto = localStorage.getItem("perfilActivoFoto");
      nombre = localStorage.getItem("perfilActivoNombre");
    } catch (e) {}
    if (av && foto) {
      av.style.backgroundImage = 'url("' + String(foto).replace(/"/g, "%22") + '")';
      av.innerHTML = "";
    }
    var un = document.getElementById("userEmail");
    if (un && !un.textContent && nombre) un.textContent = nombre;
  }
  var aiStatusAt = 0;
  function refreshAIStatus(force) {
    var el = document.getElementById("sxAIValue");
    if (!el || typeof window.taxflyAIStatus !== "function") return;
    if (!force && Date.now() - aiStatusAt < 30000) return;
    aiStatusAt = Date.now();
    el.textContent = "…";
    window.taxflyAIStatus().then(function(st) {
      if (st && st.unlimited) el.textContent = "∞ · Owner";
      else if (st && typeof st.availableCredits === "number") el.textContent = String(st.availableCredits);
      else if (st && st.billingEnabled === false) el.textContent = "Beta";
      else el.textContent = "—";
    }).catch(function() { el.textContent = "—"; });
  }
  function creditPackages() {
    var cfg = window.TAXFLY_CONFIG || {};
    var arr = Array.isArray(cfg.AI_CREDIT_PACKAGES) ? cfg.AI_CREDIT_PACKAGES : [];
    if (!arr.length) arr = [50, 100, 250, 500].map(function(n) { return { credits: n, priceUsd: null, url: "" }; });
    return arr;
  }
  function usd(value) {
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? "USD " + n.toFixed(2) : "USD —";
  }
  function openCreditStore() {
    var cfg = window.TAXFLY_CONFIG || {};
    var packs = creditPackages();
    var enabled = packs.some(function(p) { return p && p.url; });
    var html = packs.map(function(p) {
      var n = Number(p && p.credits || 0);
      var url = p && p.url ? String(p.url) : "";
      var price = usd(p && p.priceUsd);
      return '<button type="button" class="sxm-pack" data-pack-url="' + esc(url) + '"' + (url ? '' : ' disabled') + '><strong>' + esc(n) + ' ' + esc(t("credits_unit")) + '</strong><small>' + esc(price) + ' · ' + esc(url ? (p.label || t("buy_credits")) : t("soon")) + '</small></button>';
    }).join("");
    var customUrl = String(cfg.AI_CUSTOM_CREDIT_CHECKOUT_URL || "").trim();
    var perCredit = Number(cfg.AI_CREDIT_USD_PER_CREDIT);
    var customEnabled = !!customUrl;
    var custom = '<div class="sxm-custom"><div class="sxm-custom-title">' + esc(t("custom_credits")) + '</div><div class="sxm-custom-row"><input id="sxmCustomCredits" type="number" min="10" max="100000" step="1" inputmode="numeric" placeholder="' + esc(t("custom_credits_placeholder")) + '"><button type="button" id="sxmCustomBuy"' + (customEnabled ? '' : ' disabled') + '>' + esc(t("continue_purchase")) + '</button></div><div class="sxm-price-note" id="sxmCustomPrice">USD —</div></div>';
    openModal('<h3 class="sxm-t">' + ic("card", 20) + esc(t("credit_store_title")) + '</h3><p class="sxm-s">' + esc(t("credit_store_desc")) + '</p><div class="sxm-packages">' + html + '</div>' + custom + '<p class="sxm-price-note"><strong>' + esc(t("price_currency_note")) + '</strong><br>' + esc(t("taxes_note")) + '</p>' + (!(enabled || customEnabled) ? '<p class="sxm-note">' + esc(t("credit_store_pending")) + '</p>' : '') + '<div class="sxm-btns"><button type="button" class="sxm-b" data-c="1">' + esc(t("close")) + '</button></div>');
    bind("[data-c]", closeModal);
    modal.querySelectorAll("[data-pack-url]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var url = btn.getAttribute("data-pack-url");
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });
    });
    var input = modal.querySelector("#sxmCustomCredits");
    var priceEl = modal.querySelector("#sxmCustomPrice");
    var customBtn = modal.querySelector("#sxmCustomBuy");
    function updateCustomPrice() {
      var credits = Math.max(0, Math.floor(Number(input && input.value || 0)));
      if (priceEl) priceEl.textContent = (credits > 0 && Number.isFinite(perCredit) && perCredit > 0) ? usd(credits * perCredit) : "USD —";
    }
    if (input) input.addEventListener("input", updateCustomPrice);
    if (customBtn && customEnabled) customBtn.addEventListener("click", function() {
      var credits = Math.floor(Number(input && input.value || 0));
      if (!Number.isFinite(credits) || credits < 10 || credits > 100000) return;
      try {
        var u = new URL(customUrl, location.href);
        u.searchParams.set("credits", String(credits));
        u.searchParams.set("currency", "USD");
        window.open(u.href, "_blank", "noopener,noreferrer");
      } catch (e) {}
    });
  }
  async function loadAIProfiles() {
    var sdk = (window.TAXFLY_CONFIG && window.TAXFLY_CONFIG.FIREBASE_SDK) || "https://www.gstatic.com/firebasejs/12.12.1";
    var appMod = await import(sdk + "/firebase-app.js");
    var authMod = await import(sdk + "/firebase-auth.js");
    var fsMod = await import(sdk + "/firebase-firestore.js");
    var app = appMod.getApp();
    var auth = authMod.getAuth(app);
    if (auth.authStateReady) await auth.authStateReady();
    var user = auth.currentUser;
    if (!user) throw new Error("NO_USER");
    var snap = await fsMod.getDocs(fsMod.collection(fsMod.getFirestore(app), "usuarios", user.uid, "perfiles"));
    return snap.docs.map(function(d) {
      var data = d.data() || {};
      return { id: d.id, nombre: data.nombre || data.name || d.id };
    }).sort(function(a,b){ return String(a.nombre).localeCompare(String(b.nombre)); });
  }
  async function workerJson(body) {
    var res = await window.taxflyWorker(body);
    var data = await res.json().catch(function(){ return {}; });
    if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
    return data;
  }
  function renderAIProfileCards(profiles, limits) {
    var active = "";
    try { active = localStorage.getItem("perfilActivoId") || ""; } catch (e) {}
    var map = {};
    (limits || []).forEach(function(x){ map[x.profileId] = x; });
    return profiles.map(function(p) {
      var x = map[p.id] || { mode:"unlimited", limitCredits:0, usedCredits:0, reservedCredits:0 };
      var mode = ["unlimited","limited","blocked"].indexOf(x.mode) >= 0 ? x.mode : "unlimited";
      var used = Math.max(0, Number(x.usedCredits || 0));
      var limit = Math.max(1, Number(x.limitCredits || 20));
      var usage = mode === "limited" ? t("ai_limit_used", {u:used, l:limit}) : t("ai_limit_used_unlimited", {u:used});
      return '<div class="sxm-ai-profile" data-pid="' + esc(p.id) + '" data-mode="' + esc(mode) + '">' +
        '<div class="sxm-ai-profile-head"><span class="sxm-ai-profile-name">' + esc(p.nombre) + '</span>' + (p.id === active ? '<span class="sxm-ai-active">' + esc(t("ai_limit_active")) + '</span>' : '') + '</div>' +
        '<div class="sxm-ai-controls"><select class="sxm-ai-mode"><option value="unlimited"' + (mode==="unlimited"?' selected':'') + '>' + esc(t("ai_limit_unlimited")) + '</option><option value="limited"' + (mode==="limited"?' selected':'') + '>' + esc(t("ai_limit_limited")) + '</option><option value="blocked"' + (mode==="blocked"?' selected':'') + '>' + esc(t("ai_limit_blocked")) + '</option></select>' +
        '<div class="sxm-ai-limit-row"><input class="sxm-ai-limit" type="number" min="1" max="1000000" step="1" inputmode="numeric" aria-label="' + esc(t("ai_limit_amount")) + '" value="' + esc(limit) + '"><span class="sxm-ai-usage">' + esc(usage) + '</span></div></div>' +
        '<div class="sxm-ai-card-actions"><button type="button" class="pri" data-ai-save="1">' + esc(t("ai_limit_save")) + '</button><button type="button" data-ai-reset="1">' + esc(t("ai_limit_reset")) + '</button></div></div>';
    }).join("");
  }
  async function openAIProfileLimits() {
    openModal('<h3 class="sxm-t">' + ic("users",20) + esc(t("ai_profile_limits")) + '</h3><p class="sxm-s">' + esc(t("ai_profile_limits_desc")) + '</p><p class="sxm-note">' + esc(t("ai_limit_loading")) + '</p>', true);
    try {
      var profiles = await loadAIProfiles();
      var data = await workerJson({ type:"ai_profile_limits_get", profile_ids:profiles.map(function(p){return p.id;}) });
      setBody('<h3 class="sxm-t">' + ic("users",20) + esc(t("ai_profile_limits")) + '</h3><p class="sxm-s">' + esc(t("ai_profile_limits_desc")) + '</p>' + renderAIProfileCards(profiles, data.limits || []) + '<p class="sxm-price-note">' + esc(t("ai_limit_note")) + '</p><div class="sxm-btns"><button type="button" class="sxm-b" data-c="1">' + esc(t("close")) + '</button></div>');
      modal.removeAttribute("data-lock");
      bind("[data-c]", closeModal);
      modal.querySelectorAll(".sxm-ai-profile").forEach(function(card) {
        var sel = card.querySelector(".sxm-ai-mode");
        sel.addEventListener("change", function(){ card.setAttribute("data-mode", sel.value); });
        card.querySelector("[data-ai-save]").addEventListener("click", async function(e) {
          var btn=e.currentTarget, mode=sel.value, input=card.querySelector(".sxm-ai-limit"), n=Math.floor(Number(input.value||0));
          if (mode === "limited" && (!Number.isFinite(n) || n < 1)) { input.focus(); return; }
          btn.disabled=true;
          try { await workerJson({type:"ai_profile_limit_set", profile_id:card.getAttribute("data-pid"), mode:mode, limit_credits: mode==="limited"?n:0}); btn.textContent=t("ai_limit_saved"); setTimeout(function(){btn.textContent=t("ai_limit_save");},1200); }
          catch(err){ console.error("[settings] AI profile limit",err); btn.textContent=t("error"); }
          finally { btn.disabled=false; }
        });
        card.querySelector("[data-ai-reset]").addEventListener("click", async function(e) {
          var btn=e.currentTarget, mode=sel.value, input=card.querySelector(".sxm-ai-limit"), n=Math.max(1,Math.floor(Number(input.value||1)));
          btn.disabled=true;
          try { var r=await workerJson({type:"ai_profile_limit_set", profile_id:card.getAttribute("data-pid"), mode:mode, limit_credits:mode==="limited"?n:0, reset_used:true}); var lim=r.limit||{}; var usage=card.querySelector(".sxm-ai-usage"); if(usage) usage.textContent=mode==="limited"?t("ai_limit_used",{u:0,l:n}):t("ai_limit_used_unlimited",{u:0}); btn.textContent=t("ai_limit_reset_done"); setTimeout(function(){btn.textContent=t("ai_limit_reset");},1200); }
          catch(err){ console.error("[settings] AI profile reset",err); btn.textContent=t("error"); }
          finally { btn.disabled=false; }
        });
      });
    } catch (e) {
      console.error("[settings] AI profile limits", e);
      setBody('<h3 class="sxm-t">' + ic("alert",20) + esc(t("error")) + '</h3><p class="sxm-s">' + esc(t("ai_limit_error")) + '</p><div class="sxm-btns"><button type="button" class="sxm-b pri" data-c="1">' + esc(t("ok")) + '</button></div>');
      modal.removeAttribute("data-lock"); bind("[data-c]", closeModal);
    }
  }
  function openAIHistory() {
    openModal('<h3 class="sxm-t">' + ic("history", 20) + esc(t("history_title")) + '</h3><p class="sxm-s">' + esc(t("history_pending")) + '</p><div class="sxm-btns"><button type="button" class="sxm-b pri" data-c="1">' + esc(t("ok")) + '</button></div>');
    bind("[data-c]", closeModal);
  }
  function openCafecito() {
    var url = String((window.TAXFLY_CONFIG && window.TAXFLY_CONFIG.SUPPORT_CAFECITO_URL) || "").trim();
    if (url) { window.open(url, "_blank", "noopener,noreferrer"); return; }
    openModal('<h3 class="sxm-t">' + ic("coffee", 20) + esc(t("support_taxusa")) + '</h3><p class="sxm-s">' + esc(t("cafecito_missing")) + '</p><div class="sxm-btns"><button type="button" class="sxm-b pri" data-c="1">' + esc(t("ok")) + '</button></div>');
    bind("[data-c]", closeModal);
  }
  function refresh() {
    applyText();
    applyLast();
    applyTheme();
    applyProfile();
    refreshAIStatus(false);
  }
  refresh();
  var tripsUiUrl = new URL("trips-ui.js", document.currentScript.src).href;
  window.addEventListener("load", function() { import(tripsUiUrl).catch(function(e) { console.warn("[trips]", e); }); });
  new MutationObserver(function() {
    if (drawer.classList.contains("open")) refresh();
  }).observe(drawer, {
    attributes: true,
    attributeFilter: [ "class" ]
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      var m = document.getElementById("sxModal");
      if (m && m.classList.contains("open") && !m.getAttribute("data-lock")) closeModal(); else if (drawer.classList.contains("open")) call("toggleSettings");
    }
  });
  (function loadMail() {
    var tries = 0;
    (function poll() {
      var el = document.getElementById("sxMail");
      if (!el) return;
      import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js").then(function(a) {
        return import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js").then(function(b) {
          var u = b.getAuth(a.getApp()).currentUser;
          if (u && u.email) el.textContent = u.email; else if (++tries < 20) setTimeout(poll, 700);
        });
      }).catch(function() {
        if (++tries < 20) setTimeout(poll, 1e3);
      });
    })();
  })();
  function call(name) {
    if (typeof window[name] === "function") return window[name].apply(window, [].slice.call(arguments, 1));
    console.warn("[settings] falta window." + name);
  }
  async function changeEmailFromSettings() {
    try {
      var authMod = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js");
      var auth = authMod.getAuth();
      var user = auth.currentUser;
      if (!user) {
        if (typeof window.showAlert === "function") await window.showAlert(t("email_no_session"));
        else alert(t("email_no_session"));
        return;
      }

      var email;
      if (typeof window.showPrompt === "function") email = await window.showPrompt(t("email_prompt"));
      else email = prompt(t("email_prompt"));
      if (!email) return;
      email = String(email).trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (typeof window.showAlert === "function") await window.showAlert(t("email_invalid"));
        else alert(t("email_invalid"));
        return;
      }

      await authMod.verifyBeforeUpdateEmail(user, email);
      if (typeof window.showAlert === "function") await window.showAlert(t("email_sent"));
      else alert(t("email_sent"));
    } catch (err) {
      console.error("[settings] cambio de correo", err);
      var msg = err && (err.message || err.code) ? (err.message || err.code) : String(err || "");
      var copy = t("email_error", { m: msg });
      if (typeof window.showAlert === "function") await window.showAlert(copy);
      else alert(copy);
    }
  }
  var installPrompt = null;
  window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    installPrompt = e;
  });
  window.addEventListener("appinstalled", function() { installPrompt = null; });
  function installTaxFly() {
    if (installPrompt) {
      var prompt = installPrompt;
      installPrompt = null;
      prompt.prompt();
      return;
    }
    location.href = new URL("login.html?install=1", document.baseURI).href;
  }
  drawer.addEventListener("click", function(e) {
    var lb = e.target.closest("[data-lang]");
    if (lb) {
      call("changeLanguage", lb.getAttribute("data-lang"));
      refresh();
      return;
    }
    var b = e.target.closest("[data-act]");
    if (!b) return;
    switch (b.getAttribute("data-act")) {
     case "close":
      call("toggleSettings");
      break;

     case "profile":
      call("changeProfile");
      break;

     case "theme":
      call("toggleDarkMode");
      applyTheme();
      break;

     case "buy-credits":
      openCreditStore();
      break;

     case "ai-history":
      openAIHistory();
      break;

     case "ai-profile-limits":
      openAIProfileLimits();
      break;

     case "cafecito":
      openCafecito();
      break;

     case "install":
      installTaxFly();
      break;

     case "reload":
      location.reload();
      break;

     case "email":
      changeEmailFromSettings();
      break;

     case "password":
      call("doChangePassword");
      break;

     case "pin":
      call("gestionarPIN");
      break;

     case "logout":
      call("doLogout");
      break;

     case "delete":
      call("doDeleteAccount");
      break;

     case "export":
      openExport();
      break;

     case "import":
      document.getElementById("sxFile").click();
      break;
    }
  });
  document.getElementById("sxFile").addEventListener("change", function(e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (f) startImport(f);
  });
  var modal = null;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "sxModal";
    modal.innerHTML = '<div class="sxm" role="dialog" aria-modal="true"></div>';
    modal.addEventListener("click", function(e) {
      if (e.target === modal && !modal.getAttribute("data-lock")) closeModal();
    });
    document.body.appendChild(modal);
    return modal;
  }
  function openModal(html, lock) {
    var m = ensureModal();
    m.querySelector(".sxm").innerHTML = html;
    if (lock) m.setAttribute("data-lock", "1"); else m.removeAttribute("data-lock");
    m.classList.add("open");
  }
  function closeModal() {
    if (modal) {
      modal.classList.remove("open");
      modal.removeAttribute("data-lock");
    }
  }
  function setBody(html) {
    modal.querySelector(".sxm").innerHTML = html;
  }
  function bind(sel, fn) {
    var el = modal.querySelector(sel);
    if (el) el.addEventListener("click", fn);
    return el;
  }
  function errMsg(e) {
    var m = e && e.message || "";
    return m === "NO_USER" ? t("e_user") : m === "NO_PROFILE" ? t("e_profile") : m === "NO_APP" ? t("e_app") : m === "BAD_JSON" ? t("e_json") : m === "NOT_BACKUP" ? t("e_notbk") : m === "NEWER_VERSION" ? t("e_newer") : t("e_gen", {
      m: m || String(e)
    });
  }
  function showError(e) {
    openModal('<h3 class="sxm-t">' + ic("alert", 20) + esc(t("error")) + '</h3><p class="sxm-err">' + esc(errMsg(e)) + '</p><div class="sxm-btns"><button type="button" class="sxm-b pri" data-c="1">' + esc(t("ok")) + "</button></div>");
    bind("[data-c]", closeModal);
  }
  var backupMod = null;
  function loadBackup() {
    if (backupMod) return backupMod;
    backupMod = import(new URL("assets/backup.js", document.baseURI).href).catch(function(e) {
      backupMod = null;
      throw e;
    });
    return backupMod;
  }
  function fmtSize(n) {
    return n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(0) + " KB" : (n / 1048576).toFixed(1) + " MB";
  }
  function pathLabel(p) {
    var m = {
      actividades: t("it_act"),
      gastos: t("it_gastos"),
      notas: t("it_notas"),
      orlando: t("it_orl"),
      tickets: "Tickets",
      profile: t("it_prof")
    };
    return m[p] || (p.indexOf("misCosas") === 0 ? t("it_mis") : p);
  }
  function openExport() {
    var chips = [ "it_prof", "it_gastos", "it_act", "it_notas", "it_orl", "it_mis" ].map(function(k) {
      return '<span class="sxm-chip">' + esc(t(k)) + "</span>";
    }).join("");
    openModal('<h3 class="sxm-t">' + ic("download", 20) + esc(t("exp_title")) + "</h3>" + '<p class="sxm-s">' + esc(t("exp_includes")) + '</p><div class="sxm-chips">' + chips + "</div>" + '<label class="sxm-opt"><input type="checkbox" id="sxTk"><span>' + esc(t("exp_tickets")) + "<small>" + esc(t("exp_tickets_hint")) + "</small></span></label>" + '<div class="sxm-btns"><button type="button" class="sxm-b" data-x="1">' + esc(t("cancel")) + '</button><button type="button" class="sxm-b pri" data-go="1">' + esc(t("download")) + "</button></div>");
    bind("[data-x]", closeModal);
    bind("[data-go]", runExport);
  }
  function runExport() {
    var inc = !!modal.querySelector("#sxTk").checked;
    openModal('<h3 class="sxm-t">' + ic("download", 20) + esc(t("exp_title")) + '</h3><p class="sxm-s" id="sxPl">' + esc(t("reading")) + '</p><div class="sxm-prog ind"><i></i></div>', true);
    loadBackup().then(function(B) {
      return B.exportBackup({
        includeTickets: inc,
        onProgress: function(p) {
          var el = modal.querySelector("#sxPl");
          if (el && p.docs) el.textContent = t("reading_n", {
            n: p.docs
          });
        }
      });
    }).then(function(r) {
      var url = URL.createObjectURL(r.blob), a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 3e4);
      try {
        localStorage.setItem("taxfly_last_backup_" + activePid(), (new Date).toISOString());
      } catch (e) {}
      applyLast();
      var warn = r.warnings && r.warnings.length ? '<p class="sxm-warn">' + esc(t("warn_read", {
        l: r.warnings.map(function(w) {
          return pathLabel(w.path);
        }).filter(function(v, i, s) {
          return s.indexOf(v) === i;
        }).join(", ")
      })) + "</p>" : "";
      openModal('<div class="sxm-center"><div class="sxm-okic">' + ic("check", 28) + '</div><h3 class="sxm-t" style="justify-content:center">' + esc(t("exp_done")) + "</h3>" + '<p class="sxm-s">' + esc(t("docs_size", {
        n: r.total,
        s: fmtSize(r.bytes)
      })) + "<br>" + esc(t("exp_saved")) + "</p></div>" + warn + '<div class="sxm-btns"><button type="button" class="sxm-b pri" data-c="1">' + esc(t("ok")) + "</button></div>");
      bind("[data-c]", closeModal);
    }).catch(showError);
  }
  function startImport(file) {
    var B, data;
    loadBackup().then(function(m) {
      B = m;
      return file.text();
    }).then(function(txt) {
      data = B.parseBackup(txt);
      return B.listProfiles();
    }).then(function(profiles) {
      var sum = B.summarize(data), active = activePid(), pid = data.profile && data.profile.id;
      var origName = data.profile && data.profile.nombre || "—";
      var activeName = "";
      try {
        activeName = localStorage.getItem("perfilActivoNombre") || "";
      } catch (e) {}
      var sameProfile = !pid || pid === active;
      var origExists = !!(pid && profiles.some(function(p) {
        return p.id === pid;
      }));
      var d = "";
      if (sum.exportedAt) {
        var dt = new Date(sum.exportedAt);
        if (!isNaN(dt)) d = dt.toLocaleDateString(lang() === "en" ? "en-US" : lang() === "pt" ? "pt-BR" : "es-AR", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }
      var dest = "";
      if (!sameProfile) {
        dest = '<p class="sxm-s" style="margin-bottom:8px">' + esc(t("imp_dest")) + "</p>" + '<label class="sxm-opt"><input type="radio" name="sxDest" value="orig"' + (origExists ? "" : " checked") + "><span>" + esc(t("dest_orig", {
          n: origName
        })) + (origExists ? "" : "<small>" + esc(t("dest_orig_new")) + "</small>") + "</span></label>" + '<label class="sxm-opt"><input type="radio" name="sxDest" value="active"' + (origExists ? " checked" : "") + "><span>" + esc(t("dest_active", {
          n: activeName || "…"
        })) + "</span></label>";
      }
      var tk = sum.tickets ? '<label class="sxm-opt"><input type="checkbox" id="sxTk"><span>' + esc(t("imp_tickets", {
        n: sum.tickets
      })) + "</span></label>" : "";
      openModal('<h3 class="sxm-t">' + ic("upload", 20) + esc(t("imp_title")) + "</h3>" + '<p class="sxm-s"><b>' + esc(t("imp_from", {
        n: origName
      })) + "</b><br>" + (d ? esc(t("imp_date", {
        d: d
      })) + " · " : "") + esc(t("imp_has", {
        n: sum.total
      })) + "</p>" + dest + tk + '<p class="sxm-note">' + esc(t("imp_note")) + "</p>" + '<div class="sxm-btns"><button type="button" class="sxm-b" data-x="1">' + esc(t("cancel")) + '</button><button type="button" class="sxm-b pri" data-go="1">' + esc(t("restore")) + "</button></div>");
      bind("[data-x]", closeModal);
      bind("[data-go]", function() {
        var sel = modal.querySelector('input[name="sxDest"]:checked');
        var target = !sameProfile && sel && sel.value === "orig" ? pid : active;
        var tkEl = modal.querySelector("#sxTk");
        runImport(B, data, target, !!(tkEl && tkEl.checked), origName, target !== active);
      });
    }).catch(showError);
  }
  function runImport(B, data, target, inc, name, isOther) {
    openModal('<h3 class="sxm-t">' + ic("upload", 20) + esc(t("imp_title")) + '</h3><p class="sxm-s" id="sxPl">' + esc(t("restoring")) + '</p><div class="sxm-prog"><i id="sxBar"></i></div>', true);
    B.importBackup(data, {
      targetPid: target,
      includeTickets: inc,
      onProgress: function(p) {
        var bar = modal.querySelector("#sxBar"), pl = modal.querySelector("#sxPl");
        if (bar && p.total) bar.style.width = Math.round(p.done / p.total * 100) + "%";
        if (pl && p.total) pl.textContent = t("restoring") + " " + t("restoring_n", {
          a: p.done,
          b: p.total
        });
      }
    }).then(function(r) {
      var extra = "";
      if (r.failed) extra += '<p class="sxm-warn">' + esc(t("imp_fail", {
        n: r.failed,
        e: (r.errors || []).join(", ")
      })) + "</p>";
      if (isOther) extra += '<p class="sxm-s">' + esc(t("imp_other", {
        n: name
      })) + "</p>";
      openModal('<div class="sxm-center"><div class="sxm-okic">' + ic("check", 28) + '</div><h3 class="sxm-t" style="justify-content:center">' + esc(t("imp_done")) + "</h3>" + '<p class="sxm-s">' + esc(t("imp_done_n", {
        n: r.written
      })) + "</p></div>" + extra + '<div class="sxm-btns"><button type="button" class="sxm-b pri" data-r="1">' + esc(isOther ? t("go_switch") : t("reload")) + "</button></div>");
      bind("[data-r]", function() {
        if (isOther) {
          closeModal();
          call("changeProfile");
        } else location.reload();
      });
    }).catch(showError);
  }
})();
