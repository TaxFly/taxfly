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
  const refCode = between(read('Maps/firebase-sync.js'), 'function orlandoDocRef(docId)', 'async function fbSet(');
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

test('login online, offline locked, and offline unlocked choose the correct next screen', async () => {
  const src=between(read('login.html'), 'async function initScreen()', 'let splashExitPromise;');
  async function scenario(online, unlocked) {
    const events=[];
    const c=context(src, {
      currentLang:'es', applyLanguage:()=>{}, checkRealConnectivity:async()=>{}, isOnline:()=>online,
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
