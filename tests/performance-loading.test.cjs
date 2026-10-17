const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {harness}=require('../scripts/benchmark-loading.cjs');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));

test('concurrent trip hydration shares one read but not accounts, profiles or database instances',async()=>{
 const h=harness(root,{readMs:0});let a=0,b=0;
 const first=h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection,()=>a++);
 const second=h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection,()=>b++);
 assert.equal(first,second);await first;assert.equal(h.counts.reads,1);assert.ok(a>=2&&b>=2);
 await Promise.all([h.tc.hydrate(h.db,'other','p',h.getDocs,h.collection),h.tc.hydrate(h.db,'u','other',h.getDocs,h.collection),h.tc.hydrate({},'u','p',h.getDocs,h.collection)]);
 assert.equal(h.counts.reads,4);
 await h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection);assert.equal(h.counts.reads,5); // no stale permanent cache
});
test('one hydration consumer throwing does not prevent the others from receiving the trip',async()=>{
 const h=harness(root,{readMs:0});let delivered=false;
 await Promise.all([h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection,()=>{throw Error('UI failed')}),h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection,()=>{if(h.tc.readTrips('u','p').length)delivered=true;})]);
 assert.equal(delivered,true);assert.equal(h.counts.reads,1);
});
test('legacy local trip evidence skips unrelated scans without inventing an empty default',async()=>{
 const h=harness(root,{legacy:true,readMs:0});await h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection);
 assert.equal(h.counts.reads,2);assert.equal(h.tc.readTrips('u','p')[0].id,'orlando');
});
test('cold planning proceeds with known trips while an existing queued write remains pending',async()=>{
 const h=harness(root,{pending:true,readMs:0});let releaseWrite,hydration;
 h.tc.configure({db:h.db,collection:h.collection,getDocs:h.getDocs,doc:()=>({}),setDoc:()=>new Promise(r=>releaseWrite=r)});
 const hydrate=h.tc.hydrate;h.tc.hydrate=(...args)=>(hydration=hydrate(...args));
 const c=vm.createContext({...h,window:h.window,currentUid:'u',currentPerfilId:'p',activeTripId:'unassigned',trips:[],doc:()=>({}),updateDoc(){},deleteDoc(){},location:{reload(){}}});
 // loadTrips supplies this adapter; preserve the blocked write during configure.
 const originalConfigure=h.tc.configure;h.tc.configure=adapter=>originalConfigure({...adapter,setDoc:()=>new Promise(r=>releaseWrite=r)});
 vm.runInContext("function publishTrip(){trips=window.TripContext.readTrips('u','p');activeTripId=window.TripContext.active('u','p');}\n"+between(read('assets/plan-firebase.js'),'async function loadTrips()','function listenTripDocuments()'),c);
 await c.loadTrips();assert.equal(c.trips[0].id,'orlando');assert.ok(h.tc.pending('u','p').orlando);assert.equal(typeof releaseWrite,'function');
 releaseWrite();await hydration;assert.equal(h.tc.pending('u','p').orlando,undefined);
});
test('a failed shared hydration can retry and never becomes a confirmed empty list',async()=>{
 const h=harness(root,{readMs:0});let count=0;
 await h.tc.hydrate(h.db,'u','p',()=>{count++;return Promise.reject(Error('network'))},h.collection);
 assert.equal(h.tc.status('u','p').phase,'error');assert.equal(h.tc.status('u','p').hasData,false);
 await h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection);assert.equal(h.tc.status('u','p').phase,'ready');assert.equal(count,1);
});

function mapHarness(){
 const added=[];let css=null;
 const document={querySelector:()=>css,createElement:tag=>({tag,setAttribute(){},remove(){this.removed=true;if(this===css)css=null;}}),head:{appendChild(node){added.push(node);if(node.tag==='link')css=node;}}};
 const window={};const c=vm.createContext({window,document,setTimeout,clearTimeout,Promise,Map,Error});
 vm.runInContext(between(read('assets/plan-app.js'),'let leafletPromise=null;','let _leafletMap = null;'),c);
 const finish=()=>{window.L={};for(const node of added.filter(n=>!n.removed)){if(node.tag==='link')node.sheet={};node.onload?.();}};
 return {c,document,window,added,finish};
}
test('map dependencies are not render-blocking HTML resources',()=>{
 const html=read('planificacion.html');assert.doesNotMatch(html,/<script[^>]+src="https:[^"]*leaflet/);assert.doesNotMatch(html,/<link[^>]+href="https:[^"]*leaflet/);
});
test('map loader is lazy, shares concurrent requests and loads the unchanged CDN resources once',async()=>{
 const h=mapHarness();assert.equal(h.added.length,0);
 const a=h.c.ensureLeaflet(),b=h.c.ensureLeaflet();assert.equal(a,b);assert.equal(h.added.length,2);
 assert.match(h.added[0].href,/leaflet\/1\.9\.4\/leaflet.min.css$/);assert.match(h.added[1].src,/leaflet\/1\.9\.4\/leaflet.min.js$/);
 h.finish();await a;await h.c.ensureLeaflet();assert.equal(h.added.length,2);
});
test('a map resource failure releases shared state so a later explicit attempt can retry',async()=>{
 const h=mapHarness(),first=h.c.ensureLeaflet();h.added[1].onerror();await assert.rejects(first);
 assert.ok(h.added.every(n=>n.removed));const retry=h.c.ensureLeaflet();assert.equal(h.added.length,4);h.finish();await retry;
});
test('hidden outlet maps do not request the map SDK',async()=>{
 const h=mapHarness();const container={isConnected:true};h.document.getElementById=id=>id==='panel-outlets'?{classList:{contains:()=>false}}:container;
 h.c.days=[{stops:[]}];
 vm.runInContext(between(read('assets/plan-app.js'),'let _leafletMap = null;','function stopStartEdit('),h.c);
 await h.c.initDayMap(0);assert.equal(h.added.length,0);
});
test('navigating away during map loading does not initialize a stale container',async()=>{
 const h=mapHarness();let visible=true;
 const container={isConnected:true,setAttribute(){},style:{},innerHTML:''};
 h.document.getElementById=id=>id==='panel-outlets'?{classList:{contains:()=>visible}}:container;
 h.c.days=[{stops:[{lat:1,lng:1}]}];
 vm.runInContext(between(read('assets/plan-app.js'),'let _leafletMap = null;','function stopStartEdit('),h.c);
 const work=h.c.initDayMap(0);visible=false;h.finish();await work; // window.L has no .map(): stale initialization would throw.
 assert.equal(h.added.length,2);
});
test('new map states use the existing ES/EN/PT translation dictionary',()=>{
 const src=read('assets/plan-i18n.js');for(const text of ['Cargando mapa…','No se pudo cargar el mapa.','Reintentar'])assert.match(src,new RegExp('"'+text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'": \\["[^"\\n]+", "[^"\\n]+"\\]'));
});
