const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const os = require('node:os');
const {cacheVersion, extractPrecachePaths} = require('../scripts/bump-cache.js');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const between = (src, a, b) => src.slice(src.indexOf(a), src.indexOf(b, src.indexOf(a)));
function context(src, values) { const c = vm.createContext(values); vm.runInContext(src, c); return c; }
function storage(seed={}) { const m=new Map(Object.entries(seed)); return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),_map:m}; }

test('Trip Planning keeps the Orlando data path and isolates new trips', () => {
  const refCode = between(read('Maps/firebase-sync.js'), 'function orlandoDocRef(docId)', 'const docWriteQueues');
  const makeRef = activeTripId => context(refCode, {
    db:{}, currentUid:'user', currentPerfilId:'profile', activeTripId,
    doc:(_db,...path)=>path.join('/')
  }).orlandoDocRef('budget');
  assert.equal(makeRef('orlando'), 'usuarios/user/perfiles/profile/orlando/budget');
  assert.equal(makeRef('trip-123'), 'usuarios/user/perfiles/profile/tripPlanning/trip-123/data/budget');
  const keyCode = between(read('Maps/app.js'), 'function scopedKey(key)', 'function syncedSave(');
  assert.equal(context(keyCode,{window:{_perfilId:'profile',_tripId:'orlando'}}).scopedKey('days'), 'days::profile');
  assert.equal(context(keyCode,{window:{_perfilId:'profile',_tripId:'trip-123'}}).scopedKey('days'), 'days::profile::trip-123');
});

test('editing a stop retains its map pin and coordinate links can restore pins', () => {
  const src=between(read('Maps/app.js'), 'function stopSaveEdit(dayIdx, stopIdx)', 'function stopSaveDayLabel(dayIdx)');
  const original={name:'Dólar Tree',desc:'Old',url:'',lat:28.459,lng:-81.475,custom:'keep'};
  const days=[{stops:[original]}];
  const values={'stop-edit-name':'Dollar Tree','stop-edit-desc':'8910 Turkey Lake Rd · Abre 8:00','stop-edit-url':'',
    'stop-edit-badge':'','stop-edit-badgetext':'','stop-edit-lat':'28.459','stop-edit-lng':'-81.475'};
  let saves=0;
  const c=context(src,{days,document:{getElementById:id=>({value:values[id],style:{},focus(){},setAttribute(){}})},
    saveState:()=>saves++,renderOutlets:()=>{},showMToast:()=>{},URL,Number,window:{},_routeCache:{}});
  c.stopSaveEdit(0,0);
  assert.equal(saves,1);
  assert.equal(days[0].stops[0].name,'Dollar Tree');
  assert.equal(days[0].stops[0].lat,28.459);
  assert.equal(days[0].stops[0].lng,-81.475);
  assert.equal(days[0].stops[0].custom,'keep');
  assert.equal(c.coordsFromMapsUrl('https://www.google.com/maps/place/X/@28.45,-81.47,14z/!3d28.459!4d-81.475').lat,28.459);
});

test('Orlando day three restores all six pins and saves one complete day', async () => {
  const names=['Dollar Tree','ICON Park','Ross Dress for Less','Orlando Outlet Marketplace','The Florida Mall','Crazy Hot Buys'];
  const addresses=['8910 Turkey Lake Rd Ste 500','8375 International Dr','7603 Turkey Lake Rd','5269 International Dr','8001 S Orange Blossom Trl','730 Sand Lake Rd Suite 106'];
  const days=[{stops:[]},{stops:[]},{label:'Outlets',stops:names.slice(0,5).map((name,i)=>({name,desc:addresses[i]}))}];
  let saves=0, searches=0;
  const code=between(read('Maps/app.js'),'const DAY_THREE_OUTLETS = [','function stopSaveDayLabel(');
  const c=context(code,{days,window:{_tripId:'orlando'},document:{getElementById:()=>({disabled:false,textContent:''})},
    validStopCoords:(lat,lng)=>Number.isFinite(lat)&&Number.isFinite(lng)&&lat!==0&&lng!==0,
    coordsFromMapsUrl:()=>null,geoNominatimAddress:async()=>{searches++;return null},stopSearchAddress:()=>'',
    saveState:()=>saves++,renderOutlets:()=>{},showMToast:()=>{},URL,encodeURIComponent,geoSleep:async()=>{},_routeCache:{}});
  await c.recoverStopLocations(2);
  assert.equal(days[2].stops.length,6);
  assert.equal(days[2].stops.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length,6);
  assert.equal(saves,1);
  assert.equal(searches,0);
  await c.recoverStopLocations(2);
  assert.equal(saves,1);
});

test('Firebase writes the newest day after an earlier pending update', async () => {
  let release; const writes=[];
  const code=between(read('Maps/firebase-sync.js'),'const docWriteQueues = new Map();','async function fbGet(');
  const c=context(code,{orlandoDocRef:()=>({}),setDoc:(_ref,data)=>{writes.push(data);return new Promise(resolve=>{release=resolve})},devError:()=>{}});
  const first=c.fbSet('days',{days:[1]});
  const second=c.fbSet('days',{days:[1,2]});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(writes.length,1);
  release(); await first;
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(writes.length,2);
  release(); await second;
  assert.deepEqual(writes.map(x=>x.days.length),[1,2]);
});

test('an older Firebase day snapshot cannot erase recovered local pins', () => {
  const local=storage({'days::p::pending':JSON.stringify({days:[{stops:[{lat:28.445,lng:-81.475}]}],v:5})});
  const src=between(read('Maps/app.js'),'window._shouldIgnoreDaysSnapshot = function(data)', 'function totalDone()');
  const w={_fb:{stableStringify:v=>JSON.stringify(v)}};
  context(src,{window:w,localStorage:local,DAYS_KEY:'days',scopedKey:()=> 'days::p'});
  assert.equal(w._shouldIgnoreDaysSnapshot({days:[{stops:[{}]}],v:5}),true);
  assert.equal(w._shouldIgnoreDaysSnapshot({days:[{stops:[{lat:28.445,lng:-81.475}]}],v:5}),false);
});

test('trip selection isolates profiles and keeps ambiguous records in Sin viaje', () => {
  const cache=storage({
    'trip-planning-active::u::p':'orlando',
    'trip-planning-trips::u::p':JSON.stringify([{id:'orlando',name:'Mi viaje a Orlando'},{id:'trip-1',name:'Nueva York'}])
  });
  const w={};
  context(read('assets/trip-context.js'),{window:w,localStorage:cache,document:{createElement:()=>({})}});
  const records=[{name:'Viejo'}, {name:'Nuevo',tripId:'trip-1'}, {name:'Desvinculado',tripId:'unassigned'}];
  assert.deepEqual(w.TripContext.filter(records,'u','p').map(x=>x.name),[]);
  w.TripContext.select('u','p','trip-1');
  assert.deepEqual(w.TripContext.filter(records,'u','p').map(x=>x.name),['Nuevo']);
  assert.equal(w.TripContext.assign('u','p'),'trip-1');
  w.TripContext.select('u','p','unassigned');
  assert.deepEqual(w.TripContext.filter(records,'u','p').map(x=>x.name),['Viejo','Desvinculado']);
  assert.equal(w.TripContext.assign('u','p'),'unassigned');
  assert.equal(w.TripContext.active('u','otro'),'orlando');
});

test('trip registry reuses existing IDs and retries a local edit without duplicating it', async () => {
  const store=storage({'trip-planning-trips::u::p':JSON.stringify([{id:'orlando',name:'Mi viaje a Orlando'},{id:'trip-1',name:'Nueva York'}])});
  const w={};let online=false;const written=[];
  const c=context(read('assets/trip-context.js'),{window:w,localStorage:store,
    navigator:{get onLine(){return online}},crypto:{randomUUID:()=> 'fixed'},
    document:{createElement:()=>({})},setTimeout,clearTimeout});
  assert.equal(w.TripContext.readTrips('u','p').length,2);
  const first=await w.TripContext.create('u','p',{name:'Miami',destinations:[{city:'Miami',state:'Florida'}]});
  assert.equal(first.synced,false);
  assert.equal(w.TripContext.active('u','p'),'trip-fixed');
  assert.equal(w.TripContext.readTrips('u','p').length,3);
  online=true;
  w.TripContext.configure({db:{},doc:(_db,...path)=>path.join('/'),setDoc:async(ref,data)=>written.push({ref,data})});
  await w.TripContext.flush('u','p');
  assert.equal(written.length,1);
  assert.match(written[0].ref,/usuarios\/u\/perfiles\/p\/tripPlanning\/trip-fixed$/);
  assert.equal(w.TripContext.readTrips('u','p').length,3);
  assert.deepEqual(Object.keys(w.TripContext.pending('u','p')),[]);
});

test('Mis cosas reads Orlando in place and new trips from their own branch', () => {
  const source=between(read('Maps/mis-cosas-firebase.js'),'function rootPath(uid, perfilId, tripId)', 'function buildDB(');
  const c=context(source,{});
  assert.equal(c.rootPath('u','p','orlando'),'usuarios/u/perfiles/p/misCosas/root');
  assert.equal(c.rootPath('u','p','trip-1'),'usuarios/u/perfiles/p/tripPlanning/trip-1/misCosas/root');
  assert.match(read('assets/backup.js'),/"tripPlanning"/);
  assert.match(read('assets/backup.js'),/nestedTripPaths/);
});

test('backup includes each existing trip branch without inventing an ID', () => {
  const src=between(read('assets/backup.js'),'const TRIP_MIS_GROUPS=', 'export async function exportBackup');
  const c=context(src,{isObj:o=>o&&typeof o==='object'&&!Array.isArray(o),
    okId:id=>typeof id==='string'&&!id.includes('/')});
  const paths=c.nestedTripPaths({tripPlanning:{'trip-1':{name:'Miami'}}});
  assert.equal(paths.length,1);
  assert.equal(paths[0].collections[0],'tripPlanning/trip-1/data');
  assert.ok(paths[0].collections.includes('tripPlanning/trip-1/misCosas/root/accesorios'));
  assert.equal(c.nestedTripPaths({tripPlanning:{'bad/id':{}}}).length,0);
});

test('travel tips are hidden in Trip Planning and documents carry a trip ID', () => {
  assert.doesNotMatch(between(read('Maps/app.js'),'function renderOutlets()', 'function switchOutletTab('),/renderTips\(\)/);
  assert.match(read('tickets.html'),/tripId: docObj.tripId \|\| "unassigned"/);
  assert.match(read('tickets.html'),/TripContext\.filter\(allDocs/);
});

test('archiving and deleting a trip leaves other trips and detaches linked records', async () => {
  const store=storage({'trip-planning-active::u::p':'trip-1',
    'trip-planning-trips::u::p':JSON.stringify([{id:'orlando',name:'Orlando'},
      {id:'trip-1',name:'Miami'},{id:'trip-2',name:'Nueva York'}])});
  const w={};const writes=[],detached=[],deleted=[];
  const adapter={db:{},doc:(_db,...segments)=>segments.join('/'),
    collection:(_db,...segments)=>segments.join('/'),
    setDoc:async(ref,data)=>writes.push({ref,data}),
    getDocs:async(ref)=>({docs:ref.endsWith('/gastos')?[{ref:'g1',data:()=>({tripId:'trip-1'})},
      {ref:'g2',data:()=>({tripId:'trip-2'})}]:[],forEach(){}}),
    updateDoc:async(ref,value)=>detached.push({ref,value}),deleteDoc:async(ref)=>deleted.push(ref)};
  context(read('assets/trip-context.js'),{window:w,localStorage:store,navigator:{onLine:true},document:{createElement:()=>({})},setTimeout,clearTimeout});
  w.TripContext.configure(adapter);
  assert.equal(await w.TripContext.archive('u','p','trip-1','completed'),true);
  assert.equal(w.TripContext.active('u','p'),'orlando');
  assert.equal(w.TripContext.readTrips('u','p').find(t=>t.id==='trip-1').status,'completed');
  assert.equal(await w.TripContext.archive('u','p','trip-1',''),true);
  assert.equal(await w.TripContext.remove('u','p','trip-1'),true);
  assert.deepEqual(JSON.parse(JSON.stringify(detached)),[{ref:'g1',value:{tripId:'unassigned'}}]);
  assert.equal(w.TripContext.readTrips('u','p').some(t=>t.id==='trip-1'),false);
  assert.equal(w.TripContext.readTrips('u','p').some(t=>t.id==='trip-2'),true);
  assert.equal(await w.TripContext.remove('u','p','orlando'),false);
  assert.ok(writes.some(x=>x.ref.endsWith('/tripPlanning/trip-1')&&x.data.status==='deleted'));
});

test('login online, offline locked, and offline unlocked choose the correct next screen', async () => {
  const src=between(read('login.html'), 'async function initScreen()', 'let splashExitPromise;');
  async function scenario(online, unlocked) {
    const events=[];
    const c=context(src, {
      currentLang:'es', installRequested:false, applyLanguage:()=>{}, checkRealConnectivity:async()=>{}, isOnline:()=>online,
      localStorage:storage({'taxusa_pin_hash':'saved','taxusa_offline_email':'a@example.com'}),
      hasRecentActivity:()=>unlocked, showScreen:id=>events.push(id),
      showOfflinePinScreen:()=>events.push('PIN'),
      hideSplash:callback=>{events.push('splash'); callback?.()}, goToApp:()=>events.push('app'),
      document:{createElement:()=>({style:{}}),querySelector:()=>({insertBefore(){}})}, t:()=>'',
    });
    await c.initScreen(); return events;
  }
  assert.deepEqual(await scenario(true,false), ['screen-login','splash']);
  assert.deepEqual(await scenario(false,false), ['PIN','splash']);
  assert.deepEqual(await scenario(false,true), ['splash','app']);
});

test('all settings install the main TaxFly PWA', () => {
  const manifest=JSON.parse(read('manifest.json'));
  assert.equal(manifest.short_name,'TaxFly');
  assert.equal(manifest.start_url,'./login.html');
  assert.equal(manifest.scope,'./');
  for (const page of ['index.html','compras.html','itinerario.html','unidades.html','tickets.html','grupo.html','rutas.html','tax.html']) {
    assert.match(read(page), /rel="manifest" href="manifest.json"/);
    assert.match(read(page), /assets\/settings\.js/);
  }
  assert.match(read('assets/settings.js'), /row\("install", "phone"/);
  for (const page of ['Maps/index.html','Maps/Mis_cosas_de_viaje.html']) {
    const html=read(page);
    assert.match(html, /rel="manifest" href="\.\.\/manifest.json"/);
    assert.match(html, /id="sxInstall"(?! hidden)/);
    assert.match(html, /apple-mobile-web-app-title" content="TaxFly"/);
  }
  assert.match(read('Maps/sx-ui.js'), /\.\.\/login\.html\?install=1/);
});

test('profile name is text, image URL is constrained, and buttons retain click behavior', () => {
  class Element {
    constructor(tag) { this.tagName=tag; this.children=[]; this.style={}; this.handlers={}; this.attributes={}; }
    appendChild(el){this.children.push(el);return el}
    append(...els){this.children.push(...els)}
    replaceChildren(...els){this.children=els}
    setAttribute(k,v){this.attributes[k]=v}
    addEventListener(k,fn){this.handlers[k]=fn}
    set innerHTML(v){if(!v.startsWith('<svg viewBox='))throw Error('Unexpected markup injection');this._html=v}
  }
  const grid=new Element('div'),clicked=[],malicious=`<img src=x onerror=alert(1)>"'`;
  const values={URL,location:{href:'https://taxfly.example/profiles.html'},photos:['https://taxfly.example/avatar.png'],
    profiles:[{id:'p1',nombre:malicious,foto:'javascript:alert(1)'}],
    localStorage:storage({'perfilActivoId':'p1'}),document:{getElementById:()=>grid,createElement:tag=>new Element(tag)},
    t:{active:'Activo',addLabel:'Agregar',newProfile:'Nuevo'},handleClick:(...args)=>clicked.push(args),openEditor:()=>{}};
  const c=context(between(read('profiles.html'),'function safeProfilePhoto(', 'window.toggleEditMode'),values);
  c.render();
  assert.equal(grid.children.length,2);
  assert.equal(grid.children[0].children[1].textContent, malicious);
  assert.equal(grid.children[0].children[0].children[0].src, values.photos[0]);
  assert.equal(grid.children[0].tagName,'button');
  grid.children[0].handlers.click();
  assert.equal(clicked[0][1],malicious);
});

test('expense queue survives a failed sync and clears after retry', async () => {
  const store=storage();let fail=true,applied=0;
  const code=between(read('compras.html'),'function getPendingGastos()', 'window.addEventListener("online", () => {');
  const c=context(code, {localStorage:store,PENDING_GASTOS_KEY:'expense-queue',currentUser:{uid:'u'},perfilId:'p',
    window:{dispatchEvent(){}},Event,classDummy:0,Date,console,collection:()=>({}),doc:()=>({}),db:{},
    addDoc:async()=>{if(fail)throw Error('offline');applied++},deleteDoc:async()=>{applied++}});
  c.queueGastoOp({type:'add',data:{nombre:'Cena',valor:20}});
  await c.flushPendingGastos();assert.equal(c.getPendingGastos().length,1);
  fail=false;await c.flushPendingGastos();assert.equal(c.getPendingGastos().length,0);assert.equal(applied,1);
});

test('document queue retains failed upload then syncs and removes it', async () => {
  const src=between(read('tickets.html'),'const QUEUE_KEY = ', 'window.saveDoc = async () => {');
  const data=new Map();let fail=true,uploaded=0;
  const c=context(src,{window:{fsSave:async()=>{if(fail)throw Error('offline');uploaded++},fsDelete:async()=>{}},
    idbGet:async k=>data.get(k),idbSet:async(k,v)=>data.set(k,v),navigator:{onLine:true},
    perfilId:'p',console:{warn(){}},getT:()=>({synced_ok:'sincronizado',synced_ok_pl:'sincronizados'}),showSyncOk:()=>{},
  });
  c.window._uid='u';await c.enqueue({type:'save_doc',docId:'d1',docObj:{name:'Reserva'}});
  await c.window._flushTicketsPending();assert.equal((await c.loadQueue()).length,1);
  fail=false;await c.window._flushTicketsPending();assert.equal((await c.loadQueue()).length,0);assert.equal(uploaded,1);
});

test('cache version changes with an asset and install keeps old worker if shell download fails', async () => {
  const source=read('sw.js'),paths=extractPrecachePaths(source);
  assert.ok(paths.includes('./login.html'));
  assert.equal(cacheVersion(source),source.match(/^const CACHE = "([^"]+)";/)[1]);
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'taxfly-cache-'));
  try {
    for(const item of paths){const dst=path.join(temp,item);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,item),dst)}
    const initial=cacheVersion(source,temp);fs.appendFileSync(path.join(temp,'login.html'),'<!-- revised -->');
    assert.notEqual(cacheVersion(source,temp),initial);
    assert.notEqual(cacheVersion(source+'\n// worker logic changed',temp),cacheVersion(source,temp));
  } finally {fs.rmSync(temp,{recursive:true,force:true})}
  async function install(fails) {
    const listeners={},cached=new Map([['taxfly-old',{}],['other-app',{}]]);let skipped=false;
    const self={location:{origin:'https://taxfly.example'},addEventListener:(k,fn)=>listeners[k]=fn,skipWaiting:async()=>{skipped=true},clients:{claim:async()=>{}}};
    const caches={open:async name=>({addAll:async()=>{if(fails)throw Error('shell failed')},add:async()=>{}}),keys:async()=>[...cached.keys()],delete:async k=>cached.delete(k)};
    const c=context(source,{self,caches,fetch:async()=>{},console,Promise,URL,Response,setTimeout,clearTimeout});
    let installing;listeners.install({waitUntil:p=>installing=p});
    if(fails)await assert.rejects(installing,/shell failed/);else await installing;
    assert.equal(skipped,!fails);
    if(!fails){let activating;listeners.activate({waitUntil:p=>activating=p});await activating;assert.equal(cached.has('taxfly-old'),false);assert.equal(cached.has('other-app'),true)}
  }
  await install(true);await install(false);
});


test('installed PWA shortcut loads cached login offline and refreshes HTML online', async () => {
  const listeners={};let online=false,updated=false;
  const self={location:{origin:'https://taxfly.example'},addEventListener:(k,fn)=>listeners[k]=fn};
  const caches={
    match:async (_request,opts)=>opts?.ignoreSearch ? new Response('cached login') : undefined,
    open:async()=>({put:async()=>{updated=true}}),
  };
  const fetch=async()=>{if(!online)throw Error('offline');return new Response('new login',{status:200})};
  context(read('sw.js'),{self,caches,fetch,console,Promise,URL,Response,setTimeout,clearTimeout});
  const request={url:'https://taxfly.example/login.html?next=compras.html',headers:{get:()=> 'text/html'},method:'GET'};
  async function navigate(){let p;listeners.fetch({request,respondWith:value=>p=value});return (await p).text()}
  assert.equal(await navigate(),'cached login');
  online=true;assert.equal(await navigate(),'new login');
  await new Promise(resolve=>setImmediate(resolve));assert.equal(updated,true);
});
