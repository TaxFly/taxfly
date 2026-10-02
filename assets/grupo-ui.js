function switchTab(name, btn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  btn.classList.add("active");
}

window.toggleMoreMenu = e => {
  e.stopPropagation();
  const btn = document.getElementById("btnMore");
  const dd = document.getElementById("navDropdown");
  const isOpen = dd.classList.contains("show");
  dd.classList.toggle("show", !isOpen);
  btn.classList.toggle("open", !isOpen);
  if (!isOpen) {
    const close = () => {
      dd.classList.remove("show");
      btn.classList.remove("open");
      document.removeEventListener("click", close);
    };
    setTimeout(() => document.addEventListener("click", close), 0);
  }
};

window.toggleSettings = () => {
  const d = document.getElementById("settingsDrawer");
  const open = d.classList.toggle("open");
  document.getElementById("menuOverlay").style.display = open ? "block" : "none";
};

window.toggleDarkMode = () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

const i18n = {
  es: {
    nav_home: "INICIO",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANIFICACIÓN",
    nav_tax: "TAXES",
    nav_units: "AYUDA Y REFERENCIAS",
    nav_tickets: "DOCUMENTOS",
    nav_routes: "RUTAS",
    nav_more: "MÁS",
    nav_group: "GRUPO",
    nav_units_desc: "Conversor de unidades y ayudas varias",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_routes_desc: "Mapas y navegación",
    nav_group_desc: "Gastos compartidos",
    settings_title: "Ajustes",
    label_language: "Idioma",
    btn_change_profile: "Cambiar Perfil",
    btn_apodo: "Cambiar Apodo",
    btn_theme: "Cambiar Tema",
    btn_update: "Actualizar App",
    btn_email: "Cambiar Correo",
    btn_password: "Cambiar Contraseña",
    btn_pin: "Cambiar PIN Offline",
    btn_switch_app: "Cambiar Aplicación",
    btn_logout: "Cerrar Sesión",
    btn_delete: "Eliminar Cuenta",
    demo_btn: "Probar en modo demo — sin cuenta",
    lbl_new_group: "✈️ Nuevo grupo",
    ph_trip_name: "Nombre del viaje",
    ph_apodo: "Tu apodo en el grupo",
    btn_crear: "Crear",
    lbl_join: "🔗 Unirse",
    ph_code: "Código",
    btn_unirse: "Unirse",
    tab_gastos: "GASTOS",
    tab_balance: "BALANCE",
    tab_resumen: "RESUMEN",
    lbl_new_expense: "➕ Nuevo gasto",
    ph_desc: "Descripción (ej: Cena en Miami)",
    ph_amount: "Monto en USD",
    lbl_paid_by: "Pagó",
    btn_add_expense: "✓ Registrar gasto",
    cat_food: "Comida",
    cat_transport: "Transporte",
    cat_hotel: "Hotel",
    cat_activity: "Actividad",
    cat_shopping: "Compras",
    cat_other: "Otro",
    lbl_history: "📋 Historial",
    empty_expenses: "Todavía no hay gastos 🧳",
    lbl_who_owes: "⚖️ Quién le debe a quién",
    lbl_algo: "Algoritmo de transferencias mínimas — la menor cantidad de pagos posible.",
    empty_data: "Sin datos aún",
    lbl_members: "👥 Integrantes",
    lbl_total_group: "Total gastado por el grupo",
    lbl_per_person: "📊 Por persona",
    footer_by: "Creado por Juan Cruz Bria",
    all_good: "¡Todos están al día! 🎉",
    btn_volver: "← Volver",
    btn_salir_grupo: "🚪 Salir",
    btn_eliminar_grupo: "🗑️ Eliminar",
    confirm_salir: '¿Salir del grupo "{nombre}"?\n\nVas a dejar de ser miembro. Tus gastos registrados se mantendrán.',
    confirm_eliminar: '¿Eliminar el grupo "{nombre}" permanentemente?\n\nEsta acción no se puede deshacer y borrará todos los gastos.',
    confirm_eliminar_miembro: '¿Eliminar a "{nombre}" del grupo?\n\nSus gastos registrados se mantendrán.',
    confirm_eliminar_gasto: "¿Eliminar este gasto?",
    only_creator: "Solo el creador puede eliminar el grupo",
    only_creator_members: "Solo el creador puede eliminar miembros",
    lbl_my_groups: "📂 Mis grupos",
    btn_open: "Abrir",
    lbl_paid: "Pagó",
    lbl_share: "Su parte",
    lbl_connecting: "Conectando…",
    explain_title: "💡 ¿Cómo funciona la división?",
    explain_step1: "<strong>Se registra quién pagó</strong> cada gasto y el monto total.",
    explain_step2: "<strong>Se divide en partes iguales</strong> entre todos los miembros del grupo al momento del gasto.",
    explain_step3: "<strong>Se calcula el balance</strong> de cada persona: lo que pagó menos lo que le corresponde.",
    explain_step4: "<strong>Se minimizan las transferencias</strong>: el algoritmo calcula la menor cantidad de pagos posibles para saldar todas las deudas.",
    explain_warn_label: "⚠️ Importante:",
    explain_warn_text: " Si alguien se une o sale del grupo <em>después</em> de que se registraron gastos, esos gastos no se recalculan automáticamente. Verificá el historial si hubo cambios de miembros.",
    warn_trip_name: "Escribí un nombre para el viaje",
    warn_login_create: "Iniciá sesión para crear un grupo real",
    warn_login_join: "Iniciá sesión para unirte a un grupo",
    warn_code_len: "El código debe tener 6 caracteres",
    creating: "Creando…",
    searching: "Buscando…",
    offline_title: "Sin conexión",
    offline_sub: "Los gastos se guardan localmente y se sincronizan al volver",
    sync_syncing: "Sincronizando gastos pendientes…",
    sync_ok: "✅ Todo sincronizado",
    offline_banner_title: "Sin conexión — modo offline",
    offline_banner_body_ok: "✅ Podés registrar y eliminar gastos — se guardan localmente.",
    offline_banner_body_no: "❌ No podés crear ni unirte a grupos sin conexión.",
    err_no_session: "⚠️ No hay sesión activa",
    msg_recovery_sent: "🔑 Correo de recuperación enviado",
    confirm_delete_account: "¿Eliminar cuenta permanentemente?",
    err_security_retry: "Verificación de seguridad fallida. Intentá de nuevo.",
    err_reauth_required: "❌ Reautenticación requerida",
    msg_apodo_changed: "✅ Apodo cambiado a {nombre}",
    err_security_check: "❌ Verificación de seguridad fallida",
    err_prefix: "❌ Error: ",
    err_create_group_fallback: "No se pudo crear el grupo",
    err_join_group_fallback: "No se pudo unir al grupo",
    err_code_not_found: "❌ Código no encontrado",
    msg_expense_saved_offline: "📥 Gasto guardado — se sincronizará al volver la conexión",
    msg_expense_saved: "✅ Gasto registrado",
    err_demo_unavailable: "⚠️ No disponible en modo demo",
    msg_left_group: "✅ Saliste del grupo correctamente",
    msg_group_deleted: "🗑️ Grupo eliminado correctamente",
    err_delete_prefix: "❌ Error al eliminar: ",
    msg_expense_deleted: "🗑️ Gasto eliminado",
    msg_expense_deleted_offline: "📥 Eliminado localmente — se sincronizará al volver la conexión",
    msg_member_removed: "✅ {nombre} eliminado del grupo",
    err_group_not_found: "❌ Grupo no encontrado",
    err_open_group: "❌ Error al abrir grupo",
    msg_code_copied: "📋 Código {code} copiado",
    err_need_connection_part: "Necesitás conexión para registrar tu parte.",
    msg_part_registered: "Tu parte ({monto}) quedó registrada en Gastos.",
    err_part_failed: "No se pudo registrar tu parte.",
    aria_delete_expense: "Eliminar gasto",
    btn_my_share: "Mi parte ↗",
    aria_delete_member: "Eliminar miembro",
    title_register_part: "Registrar mi parte en Gastos",
    err_no_cache_group: "Sin datos en caché para este grupo",
    offline_banner_body_sync: "🔄 Todo se sincroniza automáticamente cuando vuelve el internet."
  },
  en: {
    nav_home: "HOME",
    nav_expenses: "EXPENSES",
    nav_itinerary: "PLANNING",
    nav_tax: "TAXES",
    nav_units: "Help & References",
    nav_tickets: "DOCUMENTS",
    nav_routes: "ROUTES",
    nav_more: "MORE",
    nav_group: "GROUP",
    nav_units_desc: "Unit Converter & Utilities",
    nav_tickets_desc: "ESTA, insurance, check-in",
    nav_routes_desc: "Maps and navigation",
    nav_group_desc: "Shared expenses",
    settings_title: "Settings",
    label_language: "Language",
    btn_change_profile: "Change Profile",
    btn_apodo: "Change Nickname",
    btn_theme: "Toggle Theme",
    btn_update: "Update App",
    btn_email: "Change Email",
    btn_password: "Change Password",
    btn_pin: "Change PIN Offline",
    btn_switch_app: "Switch App",
    btn_logout: "Sign Out",
    btn_delete: "Delete Account",
    demo_btn: "Try demo mode — no account needed",
    lbl_new_group: "✈️ New group",
    ph_trip_name: "Trip name",
    ph_apodo: "Your nickname",
    btn_crear: "Create",
    lbl_join: "🔗 Join",
    ph_code: "Code",
    btn_unirse: "Join",
    tab_gastos: "EXPENSES",
    tab_balance: "BALANCE",
    tab_resumen: "SUMMARY",
    lbl_new_expense: "➕ New expense",
    ph_desc: "Description (e.g. Dinner in Miami)",
    ph_amount: "Amount in USD",
    lbl_paid_by: "Paid by",
    btn_add_expense: "✓ Record expense",
    cat_food: "Food",
    cat_transport: "Transport",
    cat_hotel: "Hotel",
    cat_activity: "Activity",
    cat_shopping: "Shopping",
    cat_other: "Other",
    lbl_history: "📋 History",
    empty_expenses: "No expenses yet 🧳",
    lbl_who_owes: "⚖️ Who owes whom",
    lbl_algo: "Minimum transfers algorithm — fewest payments possible.",
    empty_data: "No data yet",
    lbl_members: "👥 Members",
    lbl_total_group: "Total spent by the group",
    lbl_per_person: "📊 Per person",
    footer_by: "Created by Juan Cruz Bria",
    all_good: "Everyone is settled up! 🎉",
    btn_volver: "← Back",
    btn_salir_grupo: "🚪 Leave",
    btn_eliminar_grupo: "🗑️ Delete",
    confirm_salir: 'Leave group "{nombre}"?\n\nYou will no longer be a member. Your recorded expenses will remain.',
    confirm_eliminar: 'Delete group "{nombre}" permanently?\n\nThis cannot be undone and will delete all expenses.',
    confirm_eliminar_miembro: 'Remove "{nombre}" from the group?\n\nTheir recorded expenses will remain.',
    confirm_eliminar_gasto: "Delete this expense?",
    only_creator: "Only the creator can delete the group",
    only_creator_members: "Only the creator can remove members",
    lbl_my_groups: "📂 My groups",
    btn_open: "Open",
    lbl_paid: "Paid",
    lbl_share: "Their share",
    lbl_connecting: "Connecting…",
    explain_title: "💡 How does the split work?",
    explain_step1: "<strong>Who paid</strong> each expense and the total amount are recorded.",
    explain_step2: "<strong>The amount is split equally</strong> among all group members at the time of the expense.",
    explain_step3: "<strong>Each person's balance is calculated</strong>: what they paid minus their share.",
    explain_step4: "<strong>Transfers are minimized</strong>: the algorithm finds the fewest payments needed to settle all debts.",
    explain_warn_label: "⚠️ Important:",
    explain_warn_text: " If someone joins or leaves the group <em>after</em> expenses were recorded, those expenses are not recalculated automatically. Check the history if members changed.",
    warn_trip_name: "Enter a name for the trip",
    warn_login_create: "Sign in to create a real group",
    warn_login_join: "Sign in to join a group",
    warn_code_len: "The code must be 6 characters",
    creating: "Creating…",
    searching: "Looking up…",
    offline_title: "No connection",
    offline_sub: "Expenses are saved locally and will sync when back online",
    sync_syncing: "Syncing pending expenses…",
    sync_ok: "✅ All synced",
    offline_banner_title: "No connection — offline mode",
    offline_banner_body_ok: "✅ You can record and delete expenses — saved locally.",
    offline_banner_body_no: "❌ You can't create or join groups without internet.",
    err_no_session: "⚠️ No active session",
    msg_recovery_sent: "🔑 Recovery email sent",
    confirm_delete_account: "Delete account permanently?",
    err_security_retry: "Security check failed. Please try again.",
    err_reauth_required: "❌ Re-authentication required",
    msg_apodo_changed: "✅ Nickname changed to {nombre}",
    err_security_check: "❌ Security check failed",
    err_prefix: "❌ Error: ",
    err_create_group_fallback: "Couldn't create the group",
    err_join_group_fallback: "Couldn't join the group",
    err_code_not_found: "❌ Code not found",
    msg_expense_saved_offline: "📥 Expense saved — it will sync once you're back online",
    msg_expense_saved: "✅ Expense recorded",
    err_demo_unavailable: "⚠️ Not available in demo mode",
    msg_left_group: "✅ You left the group successfully",
    msg_group_deleted: "🗑️ Group deleted successfully",
    err_delete_prefix: "❌ Error deleting: ",
    msg_expense_deleted: "🗑️ Expense deleted",
    msg_expense_deleted_offline: "📥 Deleted locally — it will sync once you're back online",
    msg_member_removed: "✅ {nombre} removed from the group",
    err_group_not_found: "❌ Group not found",
    err_open_group: "❌ Error opening group",
    msg_code_copied: "📋 Code {code} copied",
    err_need_connection_part: "You need a connection to record your share.",
    msg_part_registered: "Your share ({monto}) was recorded in Expenses.",
    err_part_failed: "Couldn't record your share.",
    aria_delete_expense: "Delete expense",
    btn_my_share: "My share ↗",
    aria_delete_member: "Remove member",
    title_register_part: "Record my share in Expenses",
    err_no_cache_group: "No cached data for this group",
    offline_banner_body_sync: "🔄 Everything syncs automatically when you're back online."
  },
  pt: {
    nav_home: "INÍCIO",
    nav_expenses: "GASTOS",
    nav_itinerary: "PLANEJAMENTO",
    nav_tax: "TAXES",
    nav_units: "Ajuda e Referências",
    nav_tickets: "DOCUMENTOS",
    nav_routes: "ROTAS",
    nav_more: "MAIS",
    nav_group: "GRUPO",
    nav_units_desc: "Conversor de Unidades e Utilidades",
    nav_tickets_desc: "ESTA, seguros, check-in",
    nav_routes_desc: "Mapas e navegação",
    nav_group_desc: "Despesas compartilhadas",
    settings_title: "Configurações",
    label_language: "Idioma",
    btn_change_profile: "Mudar Perfil",
    btn_apodo: "Mudar Apelido",
    btn_theme: "Mudar Tema",
    btn_update: "Atualizar App",
    btn_email: "Mudar E-mail",
    btn_password: "Mudar Senha",
    btn_pin: "Alterar PIN Offline",
    btn_switch_app: "Trocar Aplicativo",
    btn_logout: "Sair",
    btn_delete: "Excluir Conta",
    demo_btn: "Testar modo demo — sem conta",
    lbl_new_group: "✈️ Novo grupo",
    ph_trip_name: "Nome da viagem",
    ph_apodo: "Seu apelido no grupo",
    btn_crear: "Criar",
    lbl_join: "🔗 Entrar",
    ph_code: "Código",
    btn_unirse: "Entrar",
    tab_gastos: "GASTOS",
    tab_balance: "BALANÇO",
    tab_resumen: "RESUMO",
    lbl_new_expense: "➕ Nova despesa",
    ph_desc: "Descrição (ex: Jantar em Miami)",
    ph_amount: "Valor em USD",
    lbl_paid_by: "Pagou",
    btn_add_expense: "✓ Registrar despesa",
    cat_food: "Comida",
    cat_transport: "Transporte",
    cat_hotel: "Hotel",
    cat_activity: "Atividade",
    cat_shopping: "Compras",
    cat_other: "Outro",
    lbl_history: "📋 Histórico",
    empty_expenses: "Ainda não há despesas 🧳",
    lbl_who_owes: "⚖️ Quem deve a quem",
    lbl_algo: "Algoritmo de transferências mínimas — menor número de pagamentos.",
    empty_data: "Sem dados ainda",
    lbl_members: "👥 Integrantes",
    lbl_total_group: "Total gasto pelo grupo",
    lbl_per_person: "📊 Por pessoa",
    footer_by: "Criado por Juan Cruz Bria",
    all_good: "Todos estão quites! 🎉",
    btn_volver: "← Voltar",
    btn_salir_grupo: "🚪 Sair",
    btn_eliminar_grupo: "🗑️ Excluir",
    confirm_salir: 'Sair do grupo "{nome}"?\n\nVocê deixará de ser membro. Suas despesas registradas serão mantidas.',
    confirm_eliminar: 'Excluir o grupo "{nome}" permanentemente?\n\nEssa ação não pode ser desfeita e apagará todas as despesas.',
    confirm_eliminar_miembro: 'Remover "{nome}" do grupo?\n\nSuas despesas registradas serão mantidas.',
    confirm_eliminar_gasto: "Excluir esta despesa?",
    only_creator: "Apenas o criador pode excluir o grupo",
    only_creator_members: "Apenas o criador pode remover membros",
    lbl_my_groups: "📂 Meus grupos",
    btn_open: "Abrir",
    lbl_paid: "Pagou",
    lbl_share: "Sua parte",
    lbl_connecting: "Conectando…",
    explain_title: "💡 Como funciona a divisão?",
    explain_step1: "<strong>Quem pagou</strong> cada despesa e o valor total são registrados.",
    explain_step2: "<strong>O valor é dividido igualmente</strong> entre todos os membros do grupo no momento da despesa.",
    explain_step3: "<strong>O saldo de cada pessoa é calculado</strong>: o que pagou menos a sua parte.",
    explain_step4: "<strong>As transferências são minimizadas</strong>: o algoritmo calcula o menor número de pagamentos para quitar todas as dívidas.",
    explain_warn_label: "⚠️ Importante:",
    explain_warn_text: " Se alguém entrar ou sair do grupo <em>depois</em> de despesas registradas, elas não são recalculadas automaticamente. Verifique o histórico se houve mudanças de membros.",
    warn_trip_name: "Digite um nome para a viagem",
    warn_login_create: "Entre na sua conta para criar um grupo real",
    warn_login_join: "Entre na sua conta para participar de um grupo",
    warn_code_len: "O código deve ter 6 caracteres",
    creating: "Criando…",
    searching: "Buscando…",
    offline_title: "Sem conexão",
    offline_sub: "As despesas são salvas localmente e sincronizadas ao voltar",
    sync_syncing: "Sincronizando despesas pendentes…",
    sync_ok: "✅ Tudo sincronizado",
    offline_banner_title: "Sem conexão — modo offline",
    offline_banner_body_ok: "✅ Você pode registrar e excluir despesas — salvas localmente.",
    offline_banner_body_no: "❌ Você não pode criar nem entrar em grupos sem internet.",
    err_no_session: "⚠️ Nenhuma sessão ativa",
    msg_recovery_sent: "🔑 E-mail de recuperação enviado",
    confirm_delete_account: "Excluir conta permanentemente?",
    err_security_retry: "Falha na verificação de segurança. Tente novamente.",
    err_reauth_required: "❌ Reautenticação necessária",
    msg_apodo_changed: "✅ Apelido alterado para {nombre}",
    err_security_check: "❌ Falha na verificação de segurança",
    err_prefix: "❌ Erro: ",
    err_create_group_fallback: "Não foi possível criar o grupo",
    err_join_group_fallback: "Não foi possível entrar no grupo",
    err_code_not_found: "❌ Código não encontrado",
    msg_expense_saved_offline: "📥 Despesa salva — será sincronizada quando a conexão voltar",
    msg_expense_saved: "✅ Despesa registrada",
    err_demo_unavailable: "⚠️ Não disponível no modo demo",
    msg_left_group: "✅ Você saiu do grupo com sucesso",
    msg_group_deleted: "🗑️ Grupo excluído com sucesso",
    err_delete_prefix: "❌ Erro ao excluir: ",
    msg_expense_deleted: "🗑️ Despesa excluída",
    msg_expense_deleted_offline: "📥 Excluído localmente — será sincronizado quando a conexão voltar",
    msg_member_removed: "✅ {nombre} removido do grupo",
    err_group_not_found: "❌ Grupo não encontrado",
    err_open_group: "❌ Erro ao abrir o grupo",
    msg_code_copied: "📋 Código {code} copiado",
    err_need_connection_part: "Você precisa de conexão para registrar sua parte.",
    msg_part_registered: "Sua parte ({monto}) foi registrada em Despesas.",
    err_part_failed: "Não foi possível registrar sua parte.",
    aria_delete_expense: "Excluir despesa",
    btn_my_share: "Minha parte ↗",
    aria_delete_member: "Remover membro",
    title_register_part: "Registrar minha parte em Despesas",
    err_no_cache_group: "Sem dados em cache para este grupo",
    offline_banner_body_sync: "🔄 Tudo é sincronizado automaticamente quando a internet voltar."
  }
};

function tr(key, vars) {
  const lang = localStorage.getItem("appLang") || "es";
  let str = (i18n[lang] || i18n.es)[key];
  if (str == null) return key;
  if (vars) {
    for (const k in vars) str = str.split("{" + k + "}").join(vars[k]);
  }
  return str;
}

window.changeLanguage = lang => {
  { const _b = document.getElementById("ai-bubble"); if (_b) _b.setAttribute("aria-label", lang === "en" ? "Taxie — Travel assistant" : lang === "pt" ? "Taxie — Assistente de viagem" : "Taxie — Asistente de viaje"); }
  localStorage.setItem("appLang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll(".lang-opt").forEach(o => o.classList.remove("active"));
  document.getElementById("lang-" + lang)?.classList.add("active");
  const t = i18n[lang] || i18n.es;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (t[k]) el.innerText = t[k];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if (t[k]) el.placeholder = t[k];
  });
  const offTitle = document.querySelector("#offline-label strong");
  const offSub = document.querySelector("#offline-label span");
  if (offTitle) offTitle.textContent = t.offline_title;
  if (offSub) offSub.textContent = t.offline_sub;
  const syncText = document.getElementById("sync-text");
  if (syncText && syncText.textContent.indexOf("✅") === -1) {
    syncText.textContent = t.sync_syncing;
  }
  const bannerTitle = document.getElementById("offlineBannerTitle");
  const bannerBody = document.getElementById("offlineBannerBody");
  if (bannerTitle && t.offline_banner_title) bannerTitle.textContent = t.offline_banner_title;
  if (bannerBody && t.offline_banner_body_ok) {
    bannerBody.innerHTML = t.offline_banner_body_ok + "<br>" + t.offline_banner_body_no + "<br>" + t.offline_banner_body_sync;
  }
  const inlineHtmlKeys = [ "explain_step1", "explain_step2", "explain_step3", "explain_step4", "explain_warn_text" ];
  inlineHtmlKeys.forEach(k => {
    const el = document.querySelector('[data-i18n="' + k + '"]');
    if (el && t[k]) el.innerHTML = t[k];
  });
  document.title = lang === "en" ? "TaxFly — Group" : lang === "pt" ? "TaxFly — Grupo" : "TaxFly — Grupo";
  if (typeof currentGroup !== "undefined" && currentGroup) renderGrupo();
};

setTimeout(() => {
  const sl = document.getElementById("s-loading");
  if (sl && !sl.classList.contains("hidden")) {
    sl.classList.add("hidden");
    document.getElementById("s-lobby").classList.remove("hidden");
  }
}, 2e3);
