// One trip registry for TaxFly, Trip Planning and Mis cosas. The existing
// tripPlanning paths and localStorage keys remain authoritative; no data copy.
(function () {
  const legacy = {id:'orlando', name:'Mi viaje a Orlando', destinations:[{city:'Orlando',state:'Florida'}]};
  let sdk = null;
  function keys(uid, profile) {
    return {active:`trip-planning-active::${uid}::${profile}`,
      list:`trip-planning-trips::${uid}::${profile}`,
      view:`trip-planning-view::${uid}::${profile}`,
      pending:`trip-planning-pending::${uid}::${profile}`};
  }
  function safeGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
  function safeSet(k,v) { try { localStorage.setItem(k,v); } catch(e) {} }
  function readTrips(uid, profile) {
    let saved=[];
    try { saved=JSON.parse(safeGet(keys(uid,profile).list)||'[]'); } catch(e) {}
    if (!Array.isArray(saved)) saved=[];
    return [saved.find(t=>t?.id==='orlando')||legacy,
      ...saved.filter(t=>t?.id && t.id!=='orlando' && t.status!=='deleted')];
  }
  function active(uid,profile) {
    const id=safeGet(keys(uid,profile).active)||'orlando';
    return readTrips(uid,profile).some(t=>t.id===id) ? id : 'orlando';
  }
  function view(uid,profile) {
    const v=safeGet(keys(uid,profile).view);
    return v==='unassigned' ? v : active(uid,profile);
  }
  function matches(record,selection) {
    const id=record && Object.prototype.hasOwnProperty.call(record,'tripId')
      ? (record.tripId||'unassigned') : 'unassigned';
    return id===selection;
  }
  function filter(items,uid,profile) { return (items||[]).filter(x=>matches(x,view(uid,profile))); }
  function assign(uid,profile) { return view(uid,profile); }
  function emit(uid,profile) {
    window.dispatchEvent?.(new CustomEvent('taxfly:tripchange',{detail:{uid,profile,id:active(uid,profile)}}));
  }
  function select(uid,profile,id) {
    const k=keys(uid,profile);
    if (id==='unassigned') safeSet(k.view,id);
    else if (readTrips(uid,profile).some(t=>t.id===id)) {
      safeSet(k.active,id); safeSet(k.view,id);
    } else return false;
    emit(uid,profile); return true;
  }
  function render(element,uid,profile) {
    if (!element) return;
    const trips=readTrips(uid,profile), selected=view(uid,profile);
    element.replaceChildren();
    for (const t of [...trips.map(t=>({id:t.id,name:t.name+(t.status?' (archivado)':'')})),
      {id:'unassigned',name:'Sin viaje'}]) {
      const option=document.createElement('option'); option.value=t.id; option.textContent=t.name;
      element.appendChild(option);
    }
    element.value=selected;
  }
  function configure(adapter) { sdk=adapter; }
  function tripRef(uid,profile,id) { return sdk.doc(sdk.db,'usuarios',uid,'perfiles',profile,'tripPlanning',id); }
  function cache(uid,profile,trips) { safeSet(keys(uid,profile).list,JSON.stringify(trips)); emit(uid,profile); }
  function pending(uid,profile) {
    try { return JSON.parse(safeGet(keys(uid,profile).pending)||'{}'); } catch(e) { return {}; }
  }
  function queue(uid,profile,trip) {
    const p=pending(uid,profile); p[trip.id]=trip;
    safeSet(keys(uid,profile).pending,JSON.stringify(p));
  }
  function within(promise,ms) {
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('sync timeout')),ms);
      Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value)},
        error=>{clearTimeout(timer);reject(error)});
    });
  }
  async function flush(uid,profile) {
    if (!sdk || !navigator.onLine) return false;
    let success=true;
    for (const trip of Object.values(pending(uid,profile))) {
      try {
        await within(sdk.setDoc(tripRef(uid,profile,trip.id),trip,{merge:true}),8000);
        const p=pending(uid,profile);
        if (JSON.stringify(p[trip.id])===JSON.stringify(trip)) {
          delete p[trip.id]; safeSet(keys(uid,profile).pending,JSON.stringify(p));
        }
      } catch(e) { success=false; }
    }
    emit(uid,profile); return success;
  }
  async function hydrate(db,uid,profile,getDocs,collection,onChange) {
    configure({...sdk,db,getDocs,collection});
    onChange?.();
    if (navigator.onLine) {
      try {
        const snap=await within(getDocs(collection(db,'usuarios',uid,'perfiles',profile,'tripPlanning')),5000);
        const byId=new Map(readTrips(uid,profile).map(t=>[t.id,t]));
        snap.forEach(d=>byId.set(d.id,{...d.data(),id:d.id}));
        Object.values(pending(uid,profile)).forEach(t=>byId.set(t.id,t));
        cache(uid,profile,[...byId.values()].filter(t=>t.status!=='deleted'));
      } catch(e) { /* Local state stays available. */ }
    }
    await flush(uid,profile);
    onChange?.();
  }
  async function save(uid,profile,trip) {
    if (!trip?.id || !trip.name?.trim()) return false;
    const list=readTrips(uid,profile);
    const i=list.findIndex(t=>t.id===trip.id);
    if (i<0) list.push(trip); else list[i]=trip;
    cache(uid,profile,list); queue(uid,profile,trip);
    return flush(uid,profile);
  }
  async function create(uid,profile,fields) {
    const id='trip-'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
    const trip={id,name:fields.name.trim(),destinations:fields.destinations||[],startDate:fields.startDate||'',endDate:fields.endDate||''};
    const saved=await save(uid,profile,trip);
    select(uid,profile,id);
    return {trip,synced:saved};
  }
  async function archive(uid,profile,id,status) {
    if (!['completed','suspended',''].includes(status)) return false;
    const trip=readTrips(uid,profile).find(t=>t.id===id);
    if (!trip) return false;
    const ok=await save(uid,profile,{...trip,status});
    if (status && active(uid,profile)===id) select(uid,profile,'orlando');
    return ok;
  }
  async function remove(uid,profile,id) {
    if (id==='orlando'||!sdk||!navigator.onLine) return false;
    const trip=readTrips(uid,profile).find(t=>t.id===id);
    if (!trip) return false;
    try {
      for (const group of ['gastos','actividades','notas']) {
        const snap=await sdk.getDocs(sdk.collection(sdk.db,'usuarios',uid,'perfiles',profile,group));
        for (const item of snap.docs) if (item.data().tripId===id) await sdk.updateDoc(item.ref,{tripId:'unassigned'});
      }
      const docs=await sdk.getDocs(sdk.collection(sdk.db,'users',uid,'profiles',profile,'docs'));
      for(const item of docs.docs) if(item.data().tripId===id) await sdk.updateDoc(item.ref,{tripId:'unassigned'});
      const base=['usuarios',uid,'perfiles',profile,'tripPlanning',id];
      const data=await sdk.getDocs(sdk.collection(sdk.db,...base,'data'));
      for (const item of data.docs) await sdk.deleteDoc(item.ref);
      // Firestore does not cascade-delete nested collections.
      for (const group of ['accesorios','ropa','esenciales','estado']) {
        const docs=await sdk.getDocs(sdk.collection(sdk.db,...base,'misCosas','root',group));
        for (const item of docs.docs) await sdk.deleteDoc(item.ref);
      }
      await sdk.setDoc(tripRef(uid,profile,id),{id,status:'deleted',deletedAt:new Date().toISOString()});
      cache(uid,profile,readTrips(uid,profile).filter(t=>t.id!==id));
      const p=pending(uid,profile); delete p[id]; safeSet(keys(uid,profile).pending,JSON.stringify(p));
      if (safeGet(keys(uid,profile).active)===id) select(uid,profile,'orlando');
      return true;
    } catch(e) { return false; }
  }
  window.addEventListener?.('online',()=>{
    const uid=window._taxflyTripUid, profile=window._taxflyTripProfile;
    if (uid&&profile) flush(uid,profile);
  });
  window.TripContext={keys,readTrips,active,view,matches,filter,assign,render,select,
    hydrate,configure,flush,save,create,archive,remove,pending,legacy};
})();
