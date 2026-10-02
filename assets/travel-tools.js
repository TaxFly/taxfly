(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const LANG=()=>localStorage.getItem('appLang')||'es';
  const D={
    'Cargando el perfil…':['Loading profile…','Carregando o perfil…'],
    'Guardado en este dispositivo':['Saved on this device','Salvo neste dispositivo'],
    'Necesita atención':['Needs attention','Precisa de atenção'],
    'Sincronizando':['Syncing','Sincronizando'],
    'Sincronizado':['Synced','Sincronizado'],
    'Viaje sin conexión':['Offline trip','Viagem sem conexão'],
    'Preparado: ':['Prepared: ','Preparado: '],
    'Todavía no preparado en este dispositivo':['Not prepared on this device yet','Ainda não preparado neste dispositivo'],
    'Preparando…':['Preparing…','Preparando…'],
    'Preparar viaje':['Prepare trip','Preparar viagem'],
    'cambio(s) pendiente(s)':['pending change(s)','alteração(ões) pendente(s)'],
    'Sin cambios pendientes':['No pending changes','Sem alterações pendentes'],
    'Reintentar':['Retry','Tentar novamente'],
    'Reintentando…':['Retrying…','Tentando novamente…'],
    'Ver datos y documentos':['View data and documents','Ver dados e documentos'],
    'Reservas, agenda, rutas y listas':['Bookings, schedule, routes and lists','Reservas, agenda, rotas e listas'],
    'Disponible':['Available','Disponível'],
    'Pendiente':['Pending','Pendente'],
    'Al abrir Ajustes con internet aparecerán los archivos de este viaje.':['Open Settings with internet to see this trip’s files.','Ao abrir Configurações com internet, os arquivos desta viagem aparecerão.'],
    'Clima, filas y Maps':['Weather, wait times and Maps','Clima, filas e Maps'],
    'Las direcciones siguen visibles en Reservas.':['Addresses remain visible in Bookings.','Os endereços continuam visíveis em Reservas.'],
    'Requiere internet':['Needs internet','Requer internet'],
    'No se pudo consultar la lista de archivos: ':['Could not fetch the file list: ','Não foi possível consultar a lista de arquivos: '],
    'La sesión tardó demasiado':['Sign-in took too long','A sessão demorou demais'],
    'El perfil cambió. Volvé a abrir la preparación.':['The profile changed. Reopen the preparation.','O perfil mudou. Abra a preparação novamente.'],
    'Conectate para descargar los datos.':['Connect to the internet to download the data.','Conecte-se para baixar os dados.'],
    'Se perdió la conexión durante la descarga.':['Connection lost during the download.','A conexão foi perdida durante o download.'],
    'Descargando datos del viaje':['Downloading trip data','Baixando dados da viagem'],
    'de':['of','de'],
    'No se pudieron descargar ':['Could not download ','Não foi possível baixar '],
    'Descargando':['Downloading','Baixando'],
    'Faltan partes de ':['Missing parts of ','Faltam partes de '],
    'Las pantallas todavía no están guardadas. Recargá la app con internet y reintentá.':['The screens are not saved yet. Reload the app with internet and try again.','As telas ainda não foram salvas. Recarregue o app com internet e tente de novo.'],
    'Preparación terminada. Los archivos marcados están disponibles en este dispositivo.':['Preparation finished. The selected files are available on this device.','Preparação concluída. Os arquivos marcados estão disponíveis neste dispositivo.'],
    'Preparación incompleta: ':['Preparation incomplete: ','Preparação incompleta: ']
  };
  const L=k=>{const i={en:0,pt:1}[LANG()],v=D[k];return v&&i!==undefined?v[i]:k;};
  const LOC=()=>({en:'en-US',pt:'pt-BR'}[LANG()]||'es-AR');
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const uid = () => window._uid || window._taxflyTripUid || localStorage.getItem('taxusa_offline_uid');
  const profile = () => localStorage.getItem('perfilActivoId');
  const trip = () => { const u=uid(), p=profile(); return u && p ? (window.TripContext?.view(u,p) || localStorage.getItem(`trip-planning-active::${u}::${p}`) || 'orlando') : 'orlando'; };
  const scoped = key => `${key}::${profile()}${trip()==='orlando'?'':'::'+trip()}`;
  const docsKey = () => `taxusa_docs_cache_${uid()}::${profile()}`;
  const prepKey = () => `taxfly-prepared::${uid()}::${profile()}::${trip()}`;
  const root = document.createElement('section'); root.id='tf-tools';
  root.innerHTML='<span class="sx-sec">Sin conexión</span><div class="tf-offline-card"><div id="tf-tools-section"></div></div>';
  const section = () => root.querySelector('#tf-tools-section');
  const tab='offline', discovered=new Set(); let preparing=false;
  function attach() {
    if(root.isConnected)return;
    const drawer=document.querySelector('#settingsDrawer .sx-scroll');
    if(!drawer)return;
    const prefs=drawer.querySelector('.sx-sec');
    const card=prefs?.nextElementSibling;
    if(card)card.after(root);else drawer.prepend(root);
    offline();
    document.getElementById('btnSettings')?.addEventListener('click',()=>setTimeout(offline,0));
  }
  attach();
  if(!root.isConnected)document.addEventListener('DOMContentLoaded',attach,{once:true});
  window.addEventListener('online',()=>{discovered.clear();offline()});
  window.addEventListener('offline',offline);
  window.addEventListener('taxfly:offline-status',offline);
  window.addEventListener('taxfly:tripchange',offline);
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.lang-opt,[data-lang]'))setTimeout(offline,60)});
  window.addEventListener('storage',e=>{if(e.key==='appLang')offline()});
  window.TaxflyOffline={refresh:offline};
  function idbGet(key) { return new Promise(resolve=>{const request=indexedDB.open('taxfly_docs_db',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('kv'))request.result.createObjectStore('kv')};request.onerror=()=>resolve(null);request.onsuccess=()=>{const db=request.result, q=db.transaction('kv').objectStore('kv').get(key);q.onsuccess=()=>{resolve(q.result||null);db.close()};q.onerror=()=>{resolve(null);db.close()}}}); }
  function idbPut(key,value) { return new Promise((resolve,reject)=>{const request=indexedDB.open('taxfly_docs_db',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('kv'))request.result.createObjectStore('kv')};request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(value,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}}}); }
  function pendingCount() {
    const u=uid(),p=profile(); let n=0;
    for(const key of [`taxusa_gastos_pending_${p}::${u}`,`taxusa_itin_pending::${u}::${p}`,`taxusa_pending_ops::${u}`,`trip-planning-pending::${u}::${p}`,`${scoped('outlets-orlando-days-v2')}::pending`]) { const v=read(key); n+=Array.isArray(v)?v.length:v&&typeof v==='object'?Object.keys(v).length:v?1:0; }
    n+=Number(localStorage.getItem(`taxfly-offline-pending-docs::${u}::${p}`)||0); return n;
  }
  async function offline() {
    if(!root.isConnected)return;
    if(!uid()||!profile()) {section().textContent=L('Cargando el perfil…');return;}
    const scope=prepKey(), stamp=read(scope), cached=await idbGet(docsKey());
    if(!root.isConnected||scope!==prepKey())return;
    const docs=(cached||[]).filter(d=>(d.tripId||'unassigned')===trip());
    const ready=docs.filter(d=>d.files?.length && d.files.every(f=>f.dataUrl));
    const count=pendingCount(), ageKey=`taxfly-pending-since::${uid()}::${profile()}`;
    if(count && !localStorage.getItem(ageKey))localStorage.setItem(ageKey,String(Date.now()));
    if(!count)localStorage.removeItem(ageKey);
    const age=Date.now()-Number(localStorage.getItem(ageKey)||Date.now());
    const syncLabel=count ? !navigator.onLine?L('Guardado en este dispositivo'):age>300000?L('Necesita atención'):L('Sincronizando') : L('Sincronizado');
    section().innerHTML=`<h3>${L('Viaje sin conexión')}</h3><p>${stamp?.at?L('Preparado: ')+new Date(stamp.at).toLocaleString(LOC()):L('Todavía no preparado en este dispositivo')}</p><button type="button" class="tf-primary" id="tf-prepare" ${preparing?'disabled':''}>${preparing?L('Preparando…'):L('Preparar viaje')}</button><div id="tf-progress" role="status" aria-live="polite"></div><div class="tf-row"><div><strong>${syncLabel}</strong><small>${count?count+' '+L('cambio(s) pendiente(s)'):L('Sin cambios pendientes')}</small></div>${count&&navigator.onLine?'<button type="button" class="tf-secondary" id="tf-retry">'+L('Reintentar')+'</button>':''}</div><details class="tf-details"><summary>${L('Ver datos y documentos')}</summary><div class="tf-row"><div><strong>${L('Reservas, agenda, rutas y listas')}</strong></div><span class="tf-status ${stamp?.core?'':'wait'}">${stamp?.core?L('Disponible'):L('Pendiente')}</span></div>${docs.map(d=>`<div class="tf-row"><label><input type="checkbox" data-doc="${escape(d.id)}" ${ready.includes(d)?'checked':''}> ${escape(d.name)}</label><span class="tf-status ${ready.includes(d)?'':'wait'}">${ready.includes(d)?L('Disponible'):L('Pendiente')}</span></div>`).join('')||'<p>'+L('Al abrir Ajustes con internet aparecerán los archivos de este viaje.')+'</p>'}<div class="tf-row"><div><strong>${L('Clima, filas y Maps')}</strong><small>${L('Las direcciones siguen visibles en Reservas.')}</small></div><span class="tf-status live">${L('Requiere internet')}</span></div></details>`;
    root.querySelector('#tf-prepare').onclick=()=>prepare(docs);
    const retry=root.querySelector('#tf-retry');if(retry)retry.onclick=async()=>{retry.disabled=true;retry.textContent=L('Reintentando…');await window.taxflyRetryPending?.();await offline()};
    if(navigator.onLine && document.getElementById('settingsDrawer')?.classList.contains('open') && !discovered.has(scope)) {
      discovered.add(scope);
      discoverDocs().catch(e=>{const el=root.querySelector('#tf-progress');if(el)el.textContent=L('No se pudo consultar la lista de archivos: ')+e.message});
    }
  }
  async function discoverDocs() {
    const {fs,db,user}=await firebase(), p=profile(),t=trip();
    if(!await window.TaxflyDocsTree.ensure(user.uid,p))throw Error(L('Los documentos todavía se están actualizando. Reintentá en un momento.'));
    const snapshot=await fs.getDocsFromServer(fs.collection(db,...window.TaxflyDocsTree.base(user.uid,p)));
    const previous=await idbGet(docsKey())||[], byId=new Map(previous.map(d=>[d.id,d])); let changed=false;
    for(const snap of snapshot.docs) { const item={id:snap.id,...snap.data()};if((item.tripId||'unassigned')!==t)continue;
      if(!byId.has(item.id)){byId.set(item.id,item);changed=true;}
    }
    if(changed){await idbPut(docsKey(),[...byId.values()]);await offline();}
  }
  async function firebase() {
    const base='https://www.gstatic.com/firebasejs/12.12.1/';
    const [a,auth,fs]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
    const app=a.getApps().length?a.getApp():a.initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
    const user=await new Promise((resolve,reject)=>{let unsub=()=>{};const timer=setTimeout(()=>{unsub();reject(Error(L('La sesión tardó demasiado')))},10000);unsub=auth.onAuthStateChanged(auth.getAuth(app),u=>{if(u){clearTimeout(timer);unsub();resolve(u)}},reject)});
    if(user.uid!==uid())throw Error(L('El perfil cambió. Volvé a abrir la preparación.'));
    return {fs,db:await (async()=>{try{const {fsNet}=await import(new URL('assets/fs-net.js',document.baseURI).href);return fs.initializeFirestore(app,{...(await fsNet()),localCache:fs.persistentLocalCache({tabManager:fs.persistentMultipleTabManager(),cacheSizeBytes:200*1024*1024})});}catch(e){return fs.getFirestore(app);}})(),user};
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
    if(preparing)return; if(!navigator.onLine){$('#tf-progress').textContent=L('Conectate para descargar los datos.');return;}
    preparing=true;const selected=[...root.querySelectorAll('[data-doc]:checked')].map(e=>e.dataset.doc);const status=$('#tf-progress');$('#tf-prepare').disabled=true;
    try {
      const {fs,db,user}=await firebase(),u=user.uid,p=profile(),t=trip();
      const base=t==='orlando'?['usuarios',u,'perfiles',p,'orlando']:['usuarios',u,'perfiles',p,'tripPlanning',t,'data'];
      const names=['reservations','days','itinerario','hotel','meals','shopping','visited','budget','parques','walmart','wmChecked','customParks','parquesExtra','coordOverrides','tips','parquesExcel'];
      let loaded=0;
      for(const name of names){
        if(!navigator.onLine)throw Error(L('Se perdió la conexión durante la descarga.'));
        status.textContent=`${L('Descargando datos del viaje')}: ${++loaded} ${L('de')} ${names.length}…`;
        try { const snap=await fs.getDocFromServer(fs.doc(db,...base,name)); if(snap.exists()) {
          const raw=snap.data(); const fields={days:'days',meals:'meals',visited:'visited',parques:'state',walmart:'data',wmChecked:'checked',customParks:'items'}; const value=fields[name] ? raw[fields[name]] : raw; const keys={reservations:'trip-reservations-v1',days:'outlets-orlando-days-v2',itinerario:'orlando-itinerario-v1',hotel:'orlando-hotel-v1',meals:'orlando-meals-v1',shopping:'outlets-shopping-list',visited:'outlets-orlando-visited-v2',budget:'orlando-budget-v1',parques:'parkTracker_v2',walmart:'walmart-orlando-data-v2',wmChecked:'walmart-orlando-checked-v2',customParks:'parques-custom',parquesExtra:'parques-extra-zonas',coordOverrides:'parques-coord-overrides',tips:'orlando-tips-v1',parquesExcel:'parques-excel-datos'};
          const key=`${keys[name]}::${p}${t==='orlando'?'':'::'+t}`;
          if(value!==undefined && !localStorage.getItem(key+'::pending'))localStorage.setItem(key,JSON.stringify(value));
        }} catch(e){throw Error(L('No se pudieron descargar ')+name+'. '+e.message)}
      }
      for(const group of ['actividades','notas','gastos']) { const snap=await fs.getDocsFromServer(fs.collection(db,'usuarios',u,'perfiles',p,group)); await idbPut(`taxfly-prepared-${group}::${u}::${p}`,snap.docs.map(d=>({id:d.id,...d.data()}))); }
      if(!await window.TaxflyDocsTree.ensure(u,p))throw Error(L('Los documentos todavía se están actualizando. Reintentá en un momento.'));
      const docSnap=await fs.getDocsFromServer(fs.collection(db,...window.TaxflyDocsTree.base(u,p)));
      const byId=new Map((oldDocs||[]).map(d=>[d.id,d]));
      for(const snap of docSnap.docs){const meta={id:snap.id,...snap.data()};const existing=byId.get(meta.id);if(existing?.files?.every(f=>f.dataUrl)&&existing.files.length===meta.files?.length)continue;byId.set(meta.id,{...meta,files:meta.files||[]});}
      const inTrip=[...byId.values()].filter(d=>(d.tripId||'unassigned')===t);
      for(const d of inTrip){if(!selected.includes(d.id))continue;if(d.files?.every(f=>f.dataUrl))continue;
        status.textContent=`${L('Descargando')} ${d.name}…`;
        const chunks=await fs.getDocsFromServer(fs.collection(db,...window.TaxflyDocsTree.base(u,p),d.id,'chunks'));
        const parts={}; chunks.forEach(s=>{const [fi,ci]=s.id.split('_').map(Number);(parts[fi]||=[])[ci]=s.data().data});
        const files=d.files.map(f=>({...f,dataUrl:Array.isArray(f.chunks)?f.chunks.join(''):(parts[f.fileIdx]||[]).join('')}));
        if(files.some(f=>!f.dataUrl))throw Error(L('Faltan partes de ')+d.name+'.');
        byId.set(d.id,{...d,files});
      }
      const thingsBase=t==='orlando'?['usuarios',u,'perfiles',p,'misCosas','root']:['usuarios',u,'perfiles',p,'tripPlanning',t,'misCosas','root'];
      for(const group of ['accesorios','ropa','esenciales','estado']) { const snap=await fs.getDocsFromServer(fs.collection(db,...thingsBase,group)); await idbPut(`taxfly-prepared-things::${u}::${p}::${t}::${group}`,snap.docs.map(d=>({id:d.id,...d.data()}))); }
      await idbPut(docsKey(),[...byId.values()]);
      if(!await shellReady())throw Error(L('Las pantallas todavía no están guardadas. Recargá la app con internet y reintentá.'));
      localStorage.setItem(prepKey(),JSON.stringify({at:Date.now(),core:true}));
      window.taxflyOfflineStatus?.mark('plan',u,p,t); window.taxflyOfflineStatus?.mark('docs',u,p,t);
      status.textContent=L('Preparación terminada. Los archivos marcados están disponibles en este dispositivo.');
      preparing=false;await offline();
    }catch(e){status.textContent=L('Preparación incompleta: ')+e.message;status.classList.add('tf-error');preparing=false;$('#tf-prepare').disabled=false;}
  }
})();
