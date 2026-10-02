(function () {
  const region=()=>window.TaxflyRoutes?.region?.()||(safeGet('taxfly_destino')==='europe'?'europe':'usa');
  const legacy = {id:'orlando', name:'Mi viaje a Orlando', destinations:[{city:'Orlando',state:'Florida'}]};
  let sdk = null;
  function keys(uid, profile) {
    return {active:`trip-planning-active::${uid}::${profile}${region()==='europe'?'::europe':''}`,
      list:`trip-planning-trips::${uid}::${profile}`,
      view:`trip-planning-view::${uid}::${profile}${region()==='europe'?'::europe':''}`,
      pending:`trip-planning-pending::${uid}::${profile}`};
  }
  const orphanKey=(uid,profile)=>`trip-planning-orphan-count::${uid}::${profile}`;
  function safeGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
  function safeSet(k,v) { try { localStorage.setItem(k,v); } catch(e) {} }
  function readAllTrips(uid, profile) {
    let saved=[];
    try { saved=JSON.parse(safeGet(keys(uid,profile).list)||'[]'); } catch(e) {}
    if (!Array.isArray(saved)) saved=[];
    return saved.filter(t=>t?.id && t.status!=='deleted');
  }
  function readTrips(uid,profile) { return readAllTrips(uid,profile).filter(t=>(t.region||'usa')===region()); }
  function active(uid,profile) {
    const trips=readTrips(uid,profile), id=safeGet(keys(uid,profile).active);
    return trips.some(t=>t.id===id) ? id : trips[0]?.id || 'unassigned';
  }
  function view(uid,profile) {
    const v=safeGet(keys(uid,profile).view);
    return v==='unassigned' && region()==='usa' ? v : active(uid,profile);
  }
  function matches(record,selection) {
    const id=record && Object.prototype.hasOwnProperty.call(record,'tripId')
      ? (record.tripId||'unassigned') : 'unassigned';
    return id===selection;
  }
  function filter(items,uid,profile) { const selected=view(uid,profile); if(region()==='europe'&&selected==='unassigned')return []; return (items||[]).filter(x=>matches(x,selected)); }
  function assign(uid,profile) { return view(uid,profile); }
  function emit(uid,profile) {
    window.dispatchEvent?.(new CustomEvent('taxfly:tripchange',{detail:{uid,profile,id:active(uid,profile)}}));
  }
  function select(uid,profile,id) {
    const k=keys(uid,profile);
    if (id==='unassigned') {if(region()==='europe')return false;safeSet(k.view,id);}
    else if (readTrips(uid,profile).some(t=>t.id===id)) {
      safeSet(k.active,id); safeSet(k.view,id);
    } else return false;
    emit(uid,profile); return true;
  }
  function render(element,uid,profile) {
    if (!element) return;
    const trips=readTrips(uid,profile), selected=view(uid,profile);
    element.replaceChildren();
    const options=trips.map(t=>({id:t.id,name:t.name+(t.status?' (archivado)':'')}));
    if (Number(safeGet(orphanKey(uid,profile)))>0 || (trips.length && selected==='unassigned'))
      options.push({id:'unassigned',name:'Sin viaje'});
    for (const t of options) {
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
        const byId=new Map(readAllTrips(uid,profile).map(t=>[t.id,t]));
        snap.forEach(d=>byId.set(d.id,{...d.data(),id:d.id}));
        if (!byId.has('orlando')) {
          const legacyData=await within(getDocs(collection(db,'usuarios',uid,'perfiles',profile,'orlando')),5000);
          if (!legacyData.empty) byId.set('orlando',legacy);
          if (!byId.has('orlando')) {
            for (const key of ['trip-reservations-v1','outlets-orlando-days-v2','orlando-itinerario-v1','orlando-hotel-v1']) {
              if (safeGet(`${key}::${profile}`)) {byId.set('orlando',legacy);break;}
            }
          }
          if (legacyData.empty) {
            for (const group of ['gastos','actividades','notas']) {
              const records=await within(getDocs(collection(db,'usuarios',uid,'perfiles',profile,group)),5000);
              if (records.docs.some(d=>d.data().tripId==='orlando')) {byId.set('orlando',legacy);break;}
            }
          }
          if (!byId.has('orlando')) {
            await within(window.TaxflyDocsTree.ensure(uid,profile),20000).catch(()=>false);
            const docs=await within(getDocs(collection(db,...window.TaxflyDocsTree.base(uid,profile))),5000);
            if (docs.docs.some(d=>d.data().tripId==='orlando')) byId.set('orlando',legacy);
          }
          if (!byId.has('orlando')) {
            for (const group of ['accesorios','ropa','esenciales','estado']) {
              const items=await within(getDocs(collection(db,'usuarios',uid,'perfiles',profile,'misCosas','root',group)),5000);
              if (!items.empty) {byId.set('orlando',legacy);break;}
            }
          }
        }
        Object.values(pending(uid,profile)).forEach(t=>byId.set(t.id,t));
        cache(uid,profile,[...byId.values()].filter(t=>t.status!=='deleted'));
      } catch(e) {  }
    }
    await flush(uid,profile);
    onChange?.();
  }
  async function save(uid,profile,trip) {
    if (!trip?.id || !trip.name?.trim()) return false;
    const list=readAllTrips(uid,profile);
    const i=list.findIndex(t=>t.id===trip.id);
    if (i<0) list.push(trip); else list[i]=trip;
    cache(uid,profile,list); queue(uid,profile,trip);
    return flush(uid,profile);
  }
  async function create(uid,profile,fields) {
    const id='trip-'+(crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
    const trip={id,region:region(),name:fields.name.trim(),destinations:fields.destinations||[],startDate:fields.startDate||'',endDate:fields.endDate||''};
    const saved=await save(uid,profile,trip);
    select(uid,profile,id);
    return {trip,synced:saved};
  }
  async function archive(uid,profile,id,status) {
    if (!['completed','suspended',''].includes(status)) return false;
    const trip=readTrips(uid,profile).find(t=>t.id===id);
    if (!trip) return false;
    const ok=await save(uid,profile,{...trip,status});
    if (status && active(uid,profile)===id) {
      const next=readTrips(uid,profile).find(t=>t.id!==id && !t.status);
      if (next) select(uid,profile,next.id);
    }
    return ok;
  }
  async function remove(uid,profile,id) {
    if (!sdk||!navigator.onLine) return false;
    const trip=readTrips(uid,profile).find(t=>t.id===id);
    if (!trip) return false;
    try {
      await purgeTagged(uid,profile,id);
      const base=id==='orlando' ? ['usuarios',uid,'perfiles',profile,'orlando']
        : ['usuarios',uid,'perfiles',profile,'tripPlanning',id,'data'];
      const data=await sdk.getDocs(sdk.collection(sdk.db,...base));
      for (const item of data.docs) await sdk.deleteDoc(item.ref);
      const things=id==='orlando' ? ['usuarios',uid,'perfiles',profile,'misCosas','root']
        : ['usuarios',uid,'perfiles',profile,'tripPlanning',id,'misCosas','root'];
      for (const group of ['accesorios','ropa','esenciales','estado']) {
        const docs=await sdk.getDocs(sdk.collection(sdk.db,...things,group));
        for (const item of docs.docs) await sdk.deleteDoc(item.ref);
      }
      if (id==='orlando') await sdk.setDoc(sdk.doc(sdk.db,'usuarios',uid,'perfiles',profile),{presupuesto:0},{merge:true});
      await sdk.setDoc(tripRef(uid,profile,id),{id,status:'deleted',deletedAt:new Date().toISOString()});
      cache(uid,profile,readAllTrips(uid,profile).filter(t=>t.id!==id));
      const p=pending(uid,profile); delete p[id]; safeSet(keys(uid,profile).pending,JSON.stringify(p));
      await clearLocal(uid,profile,id);
      if (safeGet(keys(uid,profile).active)===id) {
        const next=readTrips(uid,profile)[0]?.id || 'unassigned';
        safeSet(keys(uid,profile).active,next);safeSet(keys(uid,profile).view,next);emit(uid,profile);
      }
      return true;
    } catch(e) { return false; }
  }
  async function purgeTagged(uid,profile,id) {
    const owner=['usuarios',uid,'perfiles',profile];
    for (const group of ['gastos','actividades','notas']) {
      const snap=await sdk.getDocs(sdk.collection(sdk.db,...owner,group));
      for (const item of snap.docs) if ((item.data().tripId||'unassigned')===id) await sdk.deleteDoc(item.ref);
    }
    await window.TaxflyDocsTree.ensure(uid,profile);
    const docs=await sdk.getDocs(sdk.collection(sdk.db,...window.TaxflyDocsTree.base(uid,profile)));
    for (const item of docs.docs) if ((item.data().tripId||'unassigned')===id) {
      const chunks=await sdk.getDocs(sdk.collection(sdk.db,...window.TaxflyDocsTree.base(uid,profile),item.id,'chunks'));
      for (const chunk of chunks.docs) await sdk.deleteDoc(chunk.ref);
      await sdk.deleteDoc(item.ref);
    }
  }
  async function clearLocal(uid,profile,id) {
    const suffix=`::${profile}${id==='orlando'?'':'::'+id}`;
    const plan=['trip-reservations-v1','outlets-orlando-days-v2','outlets-orlando-visited-v2',
      'orlando-hotel-v1','orlando-meals-v1','outlets-shopping-list','orlando-budget-v1',
      'orlando-itinerario-v1','walmart-orlando-data-v2','walmart-orlando-checked-v2',
      'parkTracker_v2','parques-custom','parques-extra-zonas','parques-coord-overrides'];
    for (const prefix of plan) {localStorage.removeItem(prefix+suffix);localStorage.removeItem(prefix+suffix+'::pending');}
    for(const key of [`taxfly-prepared::${uid}::${profile}::${id}`,`trip-planning-view::${uid}::${profile}`]) localStorage.removeItem(key);
    const expenses=`taxusa_gastos_cache_${profile}::${uid}`;
    try {const items=JSON.parse(safeGet(expenses)||'[]');safeSet(expenses,JSON.stringify(items.filter(x=>(x.tripId||'unassigned')!==id)));} catch(e) {}
    for(const key of [`taxusa_gastos_pending_${profile}::${uid}`,`taxusa_itin_pending::${uid}::${profile}`]) {
      try {const ops=JSON.parse(safeGet(key)||'[]');safeSet(key,JSON.stringify(ops.filter(op=>{
        const trip=op.data?.tripId||op.tripId;
        return trip ? trip!==id : !String(op.type||'').startsWith('add') || id!=='unassigned';
      })));} catch(e) {}
    }
    const groupKey=`taxusa_pending_ops::${uid}`;
    try {const ops=JSON.parse(safeGet(groupKey)||'[]');safeSet(groupKey,JSON.stringify(ops.filter(op=>{
      const trip=op.gasto?.tripId||op.tripId;
      return trip ? trip!==id : op.type!=='add_gasto'||id!=='unassigned';
    })));} catch(e) {}
    if (typeof indexedDB==='undefined') return;
    await new Promise((resolve,reject)=>{
      const request=indexedDB.open('taxfly_docs_db',1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('kv'))request.result.createObjectStore('kv')};
      request.onerror=()=>reject(request.error);
      request.onsuccess=()=>{const db=request.result,cacheKey=`taxusa_docs_cache_${uid}::${profile}`,
        queueKey=`taxusa_tickets_pending_ops::${uid}::${profile}`;
        const tx=db.transaction('kv','readwrite'),store=tx.objectStore('kv');
        const docs=store.get(cacheKey),queue=store.get(queueKey);
        docs.onsuccess=()=>store.put((docs.result||[]).filter(d=>(d.tripId||'unassigned')!==id),cacheKey);
        queue.onsuccess=()=>{
          const remaining=(queue.result||[]).filter(op=>{
            const trip=op.docObj?.tripId||op.tripId;
            return trip ? trip!==id : op.type!=='save_doc'||id!=='unassigned';
          });
          store.put(remaining,queueKey);
          safeSet(`taxfly-offline-pending-docs::${uid}::${profile}`,String(remaining.length));
        };
        tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
      };
    });
  }
  async function orphanCount(uid,profile) {
    if(region()==='europe')return 0;
    if (!sdk||!navigator.onLine) return null;
    let count=0;
    for(const group of ['gastos','actividades','notas']) {
      const snap=await sdk.getDocs(sdk.collection(sdk.db,'usuarios',uid,'perfiles',profile,group));
      count+=snap.docs.filter(d=>!d.data().tripId||d.data().tripId==='unassigned').length;
    }
    await window.TaxflyDocsTree.ensure(uid,profile);
    const docs=await sdk.getDocs(sdk.collection(sdk.db,...window.TaxflyDocsTree.base(uid,profile)));
    count+=docs.docs.filter(d=>!d.data().tripId||d.data().tripId==='unassigned').length;
    safeSet(orphanKey(uid,profile),String(count));
    return count;
  }
  async function removeOrphans(uid,profile) {
    if(region()==='europe')return false;
    if(!sdk||!navigator.onLine) return false;
    try {await purgeTagged(uid,profile,'unassigned');await clearLocal(uid,profile,'unassigned');
      safeSet(orphanKey(uid,profile),'0');
      if(view(uid,profile)==='unassigned') {const next=readTrips(uid,profile)[0]?.id;
        if(next)select(uid,profile,next);else emit(uid,profile);}
      return true;
    } catch(e) {return false;}
  }
  window.addEventListener?.('online',()=>{
    const uid=window._taxflyTripUid, profile=window._taxflyTripProfile;
    if (uid&&profile) flush(uid,profile);
  });
  window.TripContext={region,keys,readTrips,active,view,matches,filter,assign,render,select,
    hydrate,configure,flush,save,create,archive,remove,removeOrphans,orphanCount,pending,legacy};
})();
