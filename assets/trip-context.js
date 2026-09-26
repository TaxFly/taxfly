// Shared trip selection for TaxFly itinerary and expenses. Legacy records belong
// to the original Orlando trip; explicitly detached records use "unassigned".
(function () {
  function keys(uid, profile) {
    return {
      active: `trip-planning-active::${uid}::${profile}`,
      list: `trip-planning-trips::${uid}::${profile}`,
      view: `trip-planning-view::${uid}::${profile}`
    };
  }
  function readTrips(uid, profile) {
    try {
      const value = JSON.parse(localStorage.getItem(keys(uid, profile).list) || '[]');
      if (Array.isArray(value)) return value;
    } catch (e) {}
    return [];
  }
  function active(uid, profile) {
    return localStorage.getItem(keys(uid, profile).active) || 'orlando';
  }
  function view(uid, profile) {
    const candidate = localStorage.getItem(keys(uid, profile).view);
    return candidate === 'all' || candidate === 'unassigned' ? candidate : active(uid, profile);
  }
  function matches(record, selection) {
    const id = record && Object.prototype.hasOwnProperty.call(record, 'tripId')
      ? (record.tripId || 'unassigned') : 'orlando';
    return selection === 'all' || id === selection;
  }
  function filter(items, uid, profile) {
    return (items || []).filter(item => matches(item, view(uid, profile)));
  }
  function assign(uid, profile) {
    const chosen = view(uid, profile);
    return chosen === 'all' ? active(uid, profile) : chosen;
  }
  function render(element, uid, profile) {
    if (!element) return;
    const trips = readTrips(uid, profile);
    const selected = view(uid, profile);
    element.replaceChildren();
    const opts = [{id:'all', name:'Todos los viajes'},
      {id:'orlando', name:trips.find(t => t.id === 'orlando')?.name || 'Mi viaje a Orlando'},
      ...trips.filter(t => t.id !== 'orlando' && t.status !== 'deleted').map(t => ({id:t.id, name:t.name + (t.status ? ' (archivado)' : '')})),
      {id:'unassigned', name:'Sin viaje'}];
    for (const item of opts) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      element.appendChild(option);
    }
    element.value = opts.some(x => x.id === selected) ? selected : 'orlando';
  }
  function select(uid, profile, value) {
    const k = keys(uid, profile);
    localStorage.setItem(k.view, value);
    if (value !== 'all' && value !== 'unassigned') localStorage.setItem(k.active, value);
  }
  async function hydrate(db, uid, profile, getDocs, collection, onChange) {
    onChange();
    if (!navigator.onLine) return;
    try {
      const snap = await getDocs(collection(db, 'usuarios', uid, 'perfiles', profile, 'tripPlanning'));
      const byId = new Map(readTrips(uid, profile).map(t => [t.id, t]));
      snap.forEach(d => byId.set(d.id, {...d.data(), id:d.id}));
      localStorage.setItem(keys(uid, profile).list, JSON.stringify([...byId.values()].filter(t => t.status !== 'deleted')));
      onChange();
    } catch (e) { /* A cached selection still works offline. */ }
  }
  window.TripContext = {active, view, matches, filter, assign, render, select, hydrate, keys, readTrips};
})();
