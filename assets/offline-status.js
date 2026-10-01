/* Per-device evidence of fetched trip data; never claims that live feeds work offline. */
(function () {
  const prefix = 'taxfly-offline-data::';
  const labels = {plan:'Planificación',docs:'Documentos',expenses:'Gastos',places:'Lugares y notas',things:'Mis cosas'};
  const TXT = {
    es: {locale:'es-AR', labels, ready:'✓ Pantallas principales guardadas para uso offline', notReady:'Preparación offline incompleta',
      data:'Datos consultados en este dispositivo: ', last:'. Última preparación local: ', open:'Abrí las secciones del viaje con internet para guardar sus datos en este dispositivo.',
      one:' cambio pendiente de sincronizar. ', many:' cambios pendientes de sincronizar. ', live:'Clima, filas, mapas y Taxie requieren conexión para datos actuales.',
      close:'Cerrar aviso', legacyA:' cambio(s) de una versión anterior sin perfil verificable. No se enviarán automáticamente; conservá un respaldo de este dispositivo.'},
    en: {locale:'en-US', labels:{plan:'Planning',docs:'Documents',expenses:'Expenses',places:'Places & notes',things:'My things'}, ready:'✓ Main screens saved for offline use', notReady:'Offline preparation incomplete',
      data:'Data viewed on this device: ', last:'. Last local preparation: ', open:'Open the trip sections while online to save their data on this device.',
      one:' change pending sync. ', many:' changes pending sync. ', live:'Weather, wait times, maps and Taxie need a connection for live data.',
      close:'Dismiss notice', legacyA:' change(s) from an older version without a verifiable profile. They will not be sent automatically; keep a backup of this device.'},
    pt: {locale:'pt-BR', labels:{plan:'Planejamento',docs:'Documentos',expenses:'Gastos',places:'Lugares e notas',things:'Minhas coisas'}, ready:'✓ Telas principais salvas para uso offline', notReady:'Preparação offline incompleta',
      data:'Dados consultados neste dispositivo: ', last:'. Última preparação local: ', open:'Abra as seções da viagem com internet para salvar seus dados neste dispositivo.',
      one:' alteração pendente de sincronização. ', many:' alterações pendentes de sincronização. ', live:'Clima, filas, mapas e Taxie precisam de conexão para dados atuais.',
      close:'Fechar aviso', legacyA:' alteração(ões) de uma versão anterior sem perfil verificável. Não serão enviadas automaticamente; mantenha um backup deste dispositivo.'}
  };
  const tx = () => { let l = 'es'; try { l = localStorage.getItem('appLang') || 'es'; } catch (_) {} return TXT[l] || TXT.es; };
  let dismissed = false;
  let dismissTimer;
  const key = (uid, profile, trip) => prefix + uid + '::' + profile + '::' + trip;
  function trip(uid, profile) {
    return window.TripContext?.view(uid, profile) || 'orlando';
  }
  function mark(section, uid, profile, tripId) {
    if (!navigator.onLine || !uid || !profile || !labels[section]) return;
    try {
      const k = key(uid, profile, tripId || trip(uid, profile));
      const data = JSON.parse(localStorage.getItem(k) || '{}');
      data[section] = Date.now();
      localStorage.setItem(k, JSON.stringify(data));
      window.dispatchEvent(new Event('taxfly:offline-status'));
    } catch (_) {}
  }
  function pending(uid, profile) {
    const count = k => { try { const x = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(x) ? x.length : Object.keys(x).length; } catch (_) { return 0; } };
    const selected = trip(uid, profile);
    return count('taxusa_gastos_pending_' + profile + '::' + uid)
      + count('taxusa_itin_pending::' + uid + '::' + profile)
      + count('trip-planning-pending::' + uid + '::' + profile)
      + count('taxusa_pending_ops::' + uid)
      + count('days::' + profile + (selected === 'orlando' ? '' : '::' + selected) + '::pending')
      + Number(localStorage.getItem('taxfly-offline-pending-docs::' + uid + '::' + profile) || 0);
  }
  async function shellReady() {
    if (!navigator.serviceWorker) return false;
    try {
      const registration = navigator.serviceWorker.controller ? null : await Promise.race([navigator.serviceWorker.ready, new Promise(resolve => setTimeout(() => resolve(null), 3000))]);
      const worker = navigator.serviceWorker.controller || registration?.active;
      if (!worker) return false;
      return await new Promise(resolve => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => resolve(false), 3000);
        channel.port1.onmessage = e => { clearTimeout(timer); resolve(!!e.data?.ready); };
        worker.postMessage({type:'OFFLINE_STATUS'}, [channel.port2]);
      });
    } catch (_) { return false; }
  }
  async function render(uid, profile) {
    const box = document.getElementById('offline-readiness');
    if (!box || !uid || !profile) return;
    if (dismissed) { box.hidden = true; return; }
    const current = trip(uid, profile);
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key(uid, profile, current)) || '{}'); } catch (_) {}
    const ready = await shellReady();
    if (dismissed) return;
    const latest = Math.max(0, ...Object.values(data).filter(Number.isFinite));
    const T = tx();
    const sections = Object.keys(labels).filter(section => data[section]).map(section => T.labels[section]);
    const n = pending(uid, profile);
    box.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = ready ? T.ready : T.notReady;
    const detail = document.createElement('span');
    detail.textContent = sections.length
      ? T.data + sections.join(', ') + T.last + new Date(latest).toLocaleString(T.locale) + '.'
      : T.open;
    const foot = document.createElement('small');
    foot.textContent = (n ? n + (n === 1 ? T.one : T.many) : '') + T.live;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'offline-readiness-close';
    close.setAttribute('aria-label', T.close);
    close.textContent = '×';
    const dismiss = () => {
      dismissed = true;
      clearTimeout(dismissTimer);
      box.hidden = true;
    };
    close.addEventListener('click', dismiss);
    box.append(title,detail,foot,close);
    const legacy = ['taxusa_itin_pending','taxusa_pending_ops','taxusa_gastos_pending_' + profile]
      .reduce((sum,k) => sum + (() => { try { const v=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(v)?v.length:0; } catch (_) { return 0; } })(),0);
    if (legacy) {
      const warning = document.createElement('small');
      warning.textContent = legacy + T.legacyA;
      box.append(warning);
    }
    box.dataset.ready = String(ready);
    box.hidden = false;
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(dismiss, 8000);
  }
  window.taxflyOfflineStatus = {mark, render};
})();
