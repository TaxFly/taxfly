(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const uid = () => window._uid || window._taxflyTripUid || localStorage.getItem('taxusa_offline_uid');
  const profile = () => localStorage.getItem('perfilActivoId');
  const trip = () => { const u=uid(), p=profile(); return u && p ? (window.TripContext?.view(u,p) || localStorage.getItem(`trip-planning-active::${u}::${p}`) || 'orlando') : 'orlando'; };
  const scoped = key => `${key}::${profile()}${trip()==='orlando'?'':'::'+trip()}`;
  const docsKey = () => `taxusa_docs_cache_${uid()}::${profile()}`;
  const prepKey = () => `taxfly-prepared::${uid()}::${profile()}::${trip()}`;
  const section = () => root.querySelector('#tf-tools-section');
  const root = document.createElement('div'); root.id='tf-tools';
  root.innerHTML = `<button type="button" class="tf-launch" aria-label="Abrir búsqueda y herramientas del viaje">⌕ Buscar</button><div class="tf-overlay"><div class="tf-dialog" role="dialog" aria-modal="true" aria-label="Herramientas del viaje"><div class="tf-head"><div><h2>Tu viaje</h2><small id="tf-trip-label"></small></div><button type="button" class="tf-close" aria-label="Cerrar">✕</button></div><div class="tf-tabs"><button type="button" class="tf-tab" data-tab="offline">Sin conexión</button><button type="button" class="tf-tab" data-tab="search">Buscar</button><button type="button" class="tf-tab" data-tab="settings">Ajustes</button></div><div id="tf-tools-section"></div></div></div>`;
  document.body.append(root);
  let tab='search', before=null, preparing=false; const discovered=new Set();
  function open(name) { tab=name; before=document.activeElement; root.querySelector('.tf-overlay').classList.add('open'); render(); root.querySelector('.tf-close').focus(); }
  function close() { root.querySelector('.tf-overlay').classList.remove('open'); before?.focus(); }
  root.querySelector('.tf-launch').onclick=()=>open('search');
  root.querySelector('.tf-close').onclick=close;
  root.querySelector('.tf-overlay').onclick=e=>{if(e.target.classList.contains('tf-overlay'))close();};
  root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
  root.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  window.TaxflyTools={open,readDocs:()=>idbGet(docsKey())};
  function render() {
    root.querySelector('#tf-trip-label').textContent=(window.TripContext?.readTrips(uid(),profile())||[]).find(t=>t.id===trip())?.name || 'Viaje activo';
    root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    if(tab==='offline') offline(); else if(tab==='settings') settings(); else search();
  }
  function idbGet(key) { return new Promise(resolve=>{const request=indexedDB.open('taxfly_docs_db',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('kv'))request.result.createObjectStore('kv')};request.onerror=()=>resolve(null);request.onsuccess=()=>{const db=request.result, q=db.transaction('kv').objectStore('kv').get(key);q.onsuccess=()=>{resolve(q.result||null);db.close()};q.onerror=()=>{resolve(null);db.close()}}}); }
  function idbPut(key,value) { return new Promise((resolve,reject)=>{const request=indexedDB.open('taxfly_docs_db',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('kv'))request.result.createObjectStore('kv')};request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}}}); }
  function pendingCount() {
    const u=uid(),p=profile(); let n=0;
    for(const key of [`taxusa_gastos_pending_${p}::${u}`,`taxusa_itin_pending::${u}::${p}`,`taxusa_pending_ops::${u}`,`trip-planning-pending::${u}::${p}`,`${scoped('outlets-orlando-days-v2')}::pending`]) { const v=read(key); n+=Array.isArray(v)?v.length:v&&typeof v==='object'?Object.keys(v).length:v?1:0; }
    n+=Number(localStorage.getItem(`taxfly-offline-pending-docs::${u}::${p}`)||0); return n;
  }
  async function offline() {
    const stamp=read(prepKey()), cached=await idbGet(docsKey()); if(tab!=='offline')return;
    const docs=(cached||[]).filter(d=>(d.tripId||'unassigned')===trip());
    const ready=docs.filter(d=>d.files?.length && d.files.every(f=>f.dataUrl));
    const count=pendingCount(), ageKey=`taxfly-pending-since::${uid()}::${profile()}`;
    if(count && !localStorage.getItem(ageKey))localStorage.setItem(ageKey,String(Date.now()));
    if(!count)localStorage.removeItem(ageKey);
    const age=Date.now()-Number(localStorage.getItem(ageKey)||Date.now());
    const syncLabel=count ? !navigator.onLine?'Guardado en este dispositivo':age>300000?'Necesita atención':'Sincronizando' : 'Sincronizado';
    section().innerHTML=`<h3>Preparar viaje sin conexión</h3><p>Guarda reservas, agenda, rutas, listas y los archivos que elijas. La preparación es por dispositivo.</p><div class="tf-actions"><button class="tf-primary" id="tf-prepare" ${preparing?'disabled':''}>${preparing?'Preparando…':'Preparar viaje sin conexión'}</button><small>${stamp?.at?'Última preparación: '+new Date(stamp.at).toLocaleString('es-AR'):'Todavía no preparado'}</small></div><div class="tf-meter"><span style="width:${stamp?.core?Math.round((4+ready.length)/(5+Math.max(ready.length,1))*100):0}%"></span></div><div id="tf-progress" role="status" aria-live="polite"></div><div class="tf-row"><div><strong>Reservas y agenda</strong><small>Fechas, códigos y recorridos</small></div><span class="tf-status ${stamp?.core?'':'wait'}">${stamp?.core?'Disponible':'Pendiente'}</span></div><div class="tf-row"><div><strong>Rutas y listas</strong><small>Datos del viaje guardados localmente</small></div><span class="tf-status ${stamp?.core?'':'wait'}">${stamp?.core?'Disponible':'Pendiente'}</span></div><h3>Documentos</h3><div id="tf-doc-options">${docs.map(d=>`<div class="tf-row"><label><input type="checkbox" data-doc="${escape(d.id)}" ${ready.includes(d)?'checked':''}> ${escape(d.name)}</label><span class="tf-status ${ready.includes(d)?'':'wait'}">${ready.includes(d)?'Disponible':'Pendiente'}</span></div>`).join('')||'<p>Los archivos del viaje aparecerán al preparar los datos.</p>'}</div><div class="tf-row"><div><strong>Clima, filas y Maps</strong><small>Datos en vivo: necesitás conexión. Las direcciones quedan en Reservas.</small></div><span class="tf-status live">Requiere internet</span></div><div class="tf-row"><div><strong>${syncLabel}</strong><small>${count} cambio(s) pendiente(s). ${count?'Se reintentan al reconectar.':'Todo lo registrado en este dispositivo está al día.'}</small></div>${count&&navigator.onLine?'<button class="tf-secondary" id="tf-retry">Reintentar</button>':''}</div>`;
    $('#tf-prepare').onclick=()=>prepare(docs);
    const retry=$('#tf-retry');if(retry)retry.onclick=async()=>{retry.disabled=true;retry.textContent='Reintentando…';await window.taxflyRetryPending?.();await offline()};
    const scope=prepKey(); if(navigator.onLine && !discovered.has(scope)) { discovered.add(scope); discoverDocs().catch(e=>{const el=$('#tf-progress');if(el && tab==='offline')el.textContent='No se pudo consultar la lista de archivos: '+e.message}); }
  }
  async function discoverDocs() {
    const {fs,db,user}=await firebase(), p=profile(),t=trip();
    const snapshot=await fs.getDocsFromServer(fs.collection(db,'users',user.uid,'profiles',p,'docs'));
    const previous=await idbGet(docsKey())||[], byId=new Map(previous.map(d=>[d.id,d])); let changed=false;
    for(const snap of snapshot.docs) { const item={id:snap.id,...snap.data()};if((item.tripId||'unassigned')!==t)continue;
      if(!byId.has(item.id)){byId.set(item.id,item);changed=true;}
    }
    if(changed){await idbPut(docsKey(),[...byId.values()]);if(tab==='offline')await offline();}
  }
  async function firebase() {
    const base='https://www.gstatic.com/firebasejs/12.12.1/';
    const [a,auth,fs]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
    const app=a.getApps().length?a.getApp():a.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    const user=await new Promise((resolve,reject)=>{let unsub=()=>{};const timer=setTimeout(()=>{unsub();reject(Error('La sesión tardó demasiado'))},10000);unsub=auth.onAuthStateChanged(auth.getAuth(app),u=>{if(u){clearTimeout(timer);unsub();resolve(u)}},reject)});
    if(user.uid!==uid())throw Error('El perfil cambió. Volvé a abrir la preparación.');
    return {fs,db:fs.getFirestore(app),user};
  }
  async function shellReady() {
    if(!navigator.serviceWorker)return false;
    const registration=await Promise.race([navigator.serviceWorker.ready,new Promise(resolve=>setTimeout(()=>resolve(null),5000))]);
    const worker=navigator.serviceWorker.controller||registration?.active;
    if(!worker)return false;
    return new Promise(resolve=>{const channel=new MessageChannel(), timer=setTimeout(()=>resolve(false),4000);
      channel.port1.onmessage=e=>{clearTimeout(timer);resolve(!!e.data?.ready)};
      worker.postMessage({type:'OFFLINE_STATUS'},[channel.port2]);
    });
  }
  async function prepare(oldDocs) {
    if(preparing)return; if(!navigator.onLine){$('#tf-progress').textContent='Conectate para descargar los datos.';return;}
    preparing=true;const selected=[...root.querySelectorAll('[data-doc]:checked')].map(e=>e.dataset.doc);const status=$('#tf-progress');$('#tf-prepare').disabled=true;
    try {
      const {fs,db,user}=await firebase(),u=user.uid,p=profile(),t=trip();
      const base=t==='orlando'?['usuarios',u,'perfiles',p,'orlando']:['usuarios',u,'perfiles',p,'tripPlanning',t,'data'];
      const names=['reservations','days','itinerario','hotel','meals','shopping','visited','budget','parques','walmart','wmChecked','customParks','parquesExtra','coordOverrides','tips','parquesExcel'];
      let loaded=0;
      for(const name of names){
        if(!navigator.onLine)throw Error('Se perdió la conexión durante la descarga.');
        status.textContent=`Descargando datos del viaje: ${++loaded} de ${names.length}…`;
        try { const snap=await fs.getDocFromServer(fs.doc(db,...base,name)); if(snap.exists()) {
          const raw=snap.data(); const fields={days:'days',meals:'meals',visited:'visited',parques:'state',walmart:'data',wmChecked:'checked',customParks:'items'}; const value=fields[name] ? raw[fields[name]] : raw; const keys={reservations:'trip-reservations-v1',days:'outlets-orlando-days-v2',itinerario:'orlando-itinerario-v1',hotel:'orlando-hotel-v1',meals:'orlando-meals-v1',shopping:'outlets-shopping-list',visited:'outlets-orlando-visited-v2',budget:'orlando-budget-v1',parques:'parkTracker_v2',walmart:'walmart-orlando-data-v2',wmChecked:'walmart-orlando-checked-v2',customParks:'parques-custom',parquesExtra:'parques-extra-zonas',coordOverrides:'parques-coord-overrides',tips:'orlando-tips-v1',parquesExcel:'parques-excel-datos'};
          const key=`${keys[name]}::${p}${t==='orlando'?'':'::'+t}`;
          if(value!==undefined && !localStorage.getItem(key+'::pending'))localStorage.setItem(key,JSON.stringify(value));
        }} catch(e){throw Error('No se pudieron descargar '+name+'. '+e.message)}
      }
      for(const group of ['actividades','notas','gastos']) { const snap=await fs.getDocsFromServer(fs.collection(db,'usuarios',u,'perfiles',p,group)); await idbPut(`taxfly-prepared-${group}::${u}::${p}`,snap.docs.map(d=>({id:d.id,...d.data()}))); }
      const docSnap=await fs.getDocsFromServer(fs.collection(db,'users',u,'profiles',p,'docs'));
      const byId=new Map((oldDocs||[]).map(d=>[d.id,d]));
      for(const snap of docSnap.docs){const meta={id:snap.id,...snap.data()};const existing=byId.get(meta.id);if(existing?.files?.every(f=>f.dataUrl)&&existing.files.length===meta.files?.length)continue;byId.set(meta.id,{...meta,files:meta.files||[]});}
      const inTrip=[...byId.values()].filter(d=>(d.tripId||'unassigned')===t);
      for(const d of inTrip){if(!selected.includes(d.id))continue;if(d.files?.every(f=>f.dataUrl))continue;
        status.textContent=`Descargando ${d.name}…`;
        const chunks=await fs.getDocsFromServer(fs.collection(db,'users',u,'profiles',p,'docs',d.id,'chunks'));
        const parts={}; chunks.forEach(s=>{const [fi,ci]=s.id.split('_').map(Number);(parts[fi]||=[])[ci]=s.data().data});
        const files=d.files.map(f=>({...f,dataUrl:Array.isArray(f.chunks)?f.chunks.join(''):(parts[f.fileIdx]||[]).join('')}));
        if(files.some(f=>!f.dataUrl))throw Error('Faltan partes de '+d.name+'.');
        byId.set(d.id,{...d,files});
      }
      const thingsBase=t==='orlando'?['usuarios',u,'perfiles',p,'misCosas','root']:['usuarios',u,'perfiles',p,'tripPlanning',t,'misCosas','root'];
      for(const group of ['accesorios','ropa','esenciales','estado']) { const snap=await fs.getDocsFromServer(fs.collection(db,...thingsBase,group)); await idbPut(`taxfly-prepared-things::${u}::${p}::${t}::${group}`,snap.docs.map(d=>({id:d.id,...d.data()}))); }
      await idbPut(docsKey(),[...byId.values()]);
      if(!await shellReady())throw Error('Las pantallas todavía no están guardadas. Recargá la app con internet y reintentá.');
      localStorage.setItem(prepKey(),JSON.stringify({at:Date.now(),core:true}));
      window.taxflyOfflineStatus?.mark('plan',u,p,t); window.taxflyOfflineStatus?.mark('docs',u,p,t);
      status.textContent='Preparación terminada. Los archivos marcados están disponibles en este dispositivo.';
      preparing=false;await offline();
    }catch(e){status.textContent='Preparación incompleta: '+e.message;status.classList.add('tf-error');preparing=false;$('#tf-prepare').disabled=false;}
  }
  async function search() {
    section().innerHTML='<h3>Buscar en el viaje</h3><input type="search" id="tf-query" placeholder="Reserva, documento, lugar o gasto" aria-label="Buscar en el viaje"><div id="tf-results" aria-live="polite"></div>';
    const input=$('#tf-query'),out=$('#tf-results'); input.focus();
    const [docs,places,notes,savedExpenses]=await Promise.all([idbGet(docsKey()),idbGet(`taxfly-prepared-actividades::${uid()}::${profile()}`),idbGet(`taxfly-prepared-notas::${uid()}::${profile()}`),idbGet(`taxfly-prepared-gastos::${uid()}::${profile()}`)]);if(tab!=='search')return;
    const t=trip(),p=profile(),u=uid(),items=[];
    const reservations=read(scoped('trip-reservations-v1'))?.items||[];
    reservations.forEach(r=>items.push({label:r.name,detail:`Reserva · ${r.reference||r.startDate||''}`,text:[r.name,r.reference,r.address,r.notes].join(' '),url:`planificacion.html?section=reservas&reservation=${encodeURIComponent(r.id)}`}));
    (docs||[]).filter(d=>(d.tripId||'unassigned')===t).forEach(d=>items.push({label:d.name,detail:'Documento',text:d.name,url:`tickets.html?doc=${encodeURIComponent(d.id)}`}));
    for(const x of [...(places||[]),...(notes||[])].filter(x=>(x.tripId||'unassigned')===t))items.push({label:x.name||x.title||x.text||x.contenido||'Lugar o nota',detail:'Lugar o nota',text:JSON.stringify(x),url:'lugares.html'});
    const expenses=savedExpenses||read(`taxusa_gastos_cache_${p}::${u}`)||[];
    expenses.filter(g=>(g.tripId||'unassigned')===t).forEach(g=>items.push({label:g.nombre||g.name||g.descripcion||g.comercio||'Gasto',detail:'Gasto',text:JSON.stringify(g),url:'compras.html'}));
    const days=read(scoped('outlets-orlando-days-v2'));if(days)items.push({label:'Agenda y recorridos',detail:'Plan del viaje',text:JSON.stringify(days).slice(0,20000),url:'planificacion.html'});
    if(navigator.onLine) (async()=>{
      try {
        const {fs,db,user}=await firebase(); if(tab!=='search'||trip()!==t)return;
        const base=t==='orlando'?['usuarios',u,'perfiles',p,'orlando']:['usuarios',u,'perfiles',p,'tripPlanning',t,'data'];
        const [resSnap,docSnap,...groups]=await Promise.all([
          fs.getDocFromServer(fs.doc(db,...base,'reservations')),
          fs.getDocsFromServer(fs.collection(db,'users',u,'profiles',p,'docs')),
          ...['actividades','notas','gastos'].map(g=>fs.getDocsFromServer(fs.collection(db,'usuarios',u,'perfiles',p,g)))
        ]);
        const known=new Set(items.map(i=>i.url+'|'+i.label));
        const add=i=>{const key=i.url+'|'+i.label;if(!known.has(key)){known.add(key);items.push(i)}};
        (resSnap.data()?.items||[]).forEach(r=>add({label:r.name,detail:`Reserva · ${r.reference||r.startDate||''}`,text:[r.name,r.reference,r.address,r.notes].join(' '),url:`planificacion.html?section=reservas&reservation=${encodeURIComponent(r.id)}`}));
        docSnap.forEach(d=>{const x=d.data();if((x.tripId||'unassigned')===t)add({label:x.name,detail:'Documento',text:x.name,url:`tickets.html?doc=${encodeURIComponent(d.id)}`})});
        ['Lugar','Nota','Gasto'].forEach((kind,index)=>groups[index].forEach(d=>{const x=d.data();if((x.tripId||'unassigned')!==t)return;add({label:x.name||x.nombre||x.title||x.text||x.contenido||kind,detail:kind,text:JSON.stringify(x),url:index===2?'compras.html':'lugares.html'})}));
        if(tab==='search'&&input.isConnected)update();
      }catch(e){console.warn('Búsqueda de datos recientes no disponible',e)}
    })();
    const update=()=>{const q=input.value.trim().toLocaleLowerCase('es');out.replaceChildren();if(q.length<2){out.textContent='Escribí al menos dos letras.';return}const found=items.filter(i=>i.text.toLocaleLowerCase('es').includes(q)).slice(0,25);if(!found.length){out.textContent='No hay resultados guardados para este viaje.';return}for(const i of found){const a=document.createElement('a');a.className='tf-result';a.href=i.url;const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=i.label;small.textContent=i.detail;a.append(strong,small);out.append(a)}};input.oninput=update;update();
  }
  function settings() {
    section().innerHTML=`<h3>Configuración central</h3><div class="tf-row"><label for="tf-lang">Idioma</label><select id="tf-lang"><option value="es">Español</option><option value="en">English</option><option value="pt">Português</option></select></div><div class="tf-row"><label for="tf-theme">Apariencia</label><select id="tf-theme"><option value="auto">Automática</option><option value="light">Clara</option><option value="dark">Oscura</option></select></div><div class="tf-row"><div><strong>Perfil activo</strong><small>${escape(localStorage.getItem('perfilActivoNombre')||'Perfil actual')}</small></div><a href="profiles.html">Cambiar perfil</a></div><div class="tf-row"><div><strong>Sin conexión</strong><small>Preparación y cambios pendientes</small></div><button class="tf-secondary" id="tf-go-offline">Ver estado</button></div><div class="tf-row"><div><strong>Respaldo</strong><small>Exportar o restaurar datos desde los ajustes existentes</small></div><button class="tf-secondary" id="tf-backup">Abrir respaldo</button></div>`;
    $('#tf-lang').value=localStorage.getItem('appLang')||'es';$('#tf-theme').value=localStorage.getItem('theme')||'auto';
    $('#tf-lang').onchange=e=>{localStorage.setItem('appLang',e.target.value);location.reload()};
    $('#tf-theme').onchange=e=>{if(e.target.value==='auto')localStorage.removeItem('theme');else localStorage.setItem('theme',e.target.value);location.reload()};
    $('#tf-go-offline').onclick=()=>{tab='offline';render()};
    $('#tf-backup').onclick=()=>{close(); if(typeof window.openSettingsDrawer==='function')window.openSettingsDrawer(); else if(typeof window.toggleSettings==='function')window.toggleSettings(); else location.href='planificacion.html?settings=1'};
  }
})();
