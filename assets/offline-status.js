/* Per-device evidence of fetched trip data; never claims that live feeds work offline. */
(function () {
  const prefix = 'taxfly-offline-data::';
  const labels = {plan:'Planificación',docs:'Documentos',expenses:'Gastos',places:'Lugares y notas',things:'Mis cosas'};
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
    const current = trip(uid, profile);
    let data = {};
    try { data = JSON.parse(localStorage.getItem(key(uid, profile, current)) || '{}'); } catch (_) {}
    const ready = await shellReady();
    const latest = Math.max(0, ...Object.values(data).filter(Number.isFinite));
    const sections = Object.keys(labels).filter(section => data[section]).map(section => labels[section]);
    const n = pending(uid, profile);
    box.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = ready ? '✓ Pantallas principales guardadas para uso offline' : 'Preparación offline incompleta';
    const detail = document.createElement('span');
    detail.textContent = sections.length
      ? 'Datos consultados en este dispositivo: ' + sections.join(', ') + '. Última preparación local: ' + new Date(latest).toLocaleString('es-AR') + '.'
      : 'Abrí las secciones del viaje con internet para guardar sus datos en este dispositivo.';
    const foot = document.createElement('small');
    foot.textContent = (n ? n + ' cambio' + (n === 1 ? '' : 's') + ' pendiente' + (n === 1 ? '' : 's') + ' de sincronizar. ' : '') + 'Clima, filas, mapas y Taxie requieren conexión para datos actuales.';
    box.append(title,detail,foot);
    const legacy = ['taxusa_itin_pending','taxusa_pending_ops','taxusa_gastos_pending_' + profile]
      .reduce((sum,k) => sum + (() => { try { const v=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(v)?v.length:0; } catch (_) { return 0; } })(),0);
    if (legacy) {
      const warning = document.createElement('small');
      warning.textContent = legacy + ' cambio(s) de una versión anterior sin perfil verificable. No se enviarán automáticamente; conservá un respaldo de este dispositivo.';
      box.append(warning);
    }
    box.dataset.ready = String(ready);
  }
  window.taxflyOfflineStatus = {mark, render};
})();
