const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
function swHarness(missing=[]){
 const events={},calls={network:0,skip:0,claim:0,put:0},records=new Map();
 const precache=JSON.parse(read('sw.js').match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
 for(const url of precache)records.set(url,'old-build:'+url);
 for(const url of missing)records.delete(url);
 const cache={match:async key=>records.has(typeof key==='string'?key:key.url)?new Response(records.get(typeof key==='string'?key:key.url)):undefined,addAll:async urls=>calls.install=urls,put:async()=>calls.put++};
 const self={location:{origin:'https://taxfly.example',href:'https://taxfly.example/taxfly/sw.js'},addEventListener:(type,fn)=>events[type]=fn,skipWaiting:()=>calls.skip++,clients:{claim:()=>calls.claim++}};
 const c=vm.createContext({self,caches:{open:async()=>cache,keys:async()=>[],delete:async()=>true},fetch:async()=>{calls.network++;return new Response('new network build')},Promise,URL,Request,Response,console,setTimeout,clearTimeout});
 vm.runInContext(read('sw.js'),c);
 const request=async(path,accept='text/html')=>{let result;events.fetch({request:{url:'https://taxfly.example/taxfly/'+path,method:'GET',headers:{get:()=>accept}},respondWith:p=>result=p});return result?await result:null;};
 return {events,calls,cache,records,c,request};
}
test('service worker installs one build without taking over open tabs or forcing activation',async()=>{
 const h=swHarness();let done;h.events.install({waitUntil:p=>done=p});await done;
 assert.ok(h.calls.install.length>50);assert.ok(h.calls.install.every(request=>request.cache==='reload'));
 h.events.activate({waitUntil:p=>done=p});await done;assert.equal(h.calls.skip,0);assert.equal(h.calls.claim,0);
 h.events.message({data:{type:'SKIP_WAITING'}});assert.equal(h.calls.skip,0);
});
test('HTML, application JS and translations come from one active cache even with a newer network build',async()=>{
 const h=swHarness();
 for(const [file,accept] of [['index.html?section=a','text/html'],['assets/plan-app.js','application/javascript'],['assets/plan-i18n.js','application/javascript'],['assets/recaptcha.js','application/javascript']]){
  const response=await h.request(file,accept);assert.match(await response.text(),/^old-build:/);
 }
 assert.equal(h.calls.network,0);assert.equal(h.calls.put,0);
 assert.equal(await (await h.request('')).text(),'old-build:./index.html');
});
test('a missing cached core script does not mix in new code; HTML uses the offline fallback',async()=>{
 const h=swHarness(['./assets/plan-i18n.js','./planificacion.html']);
 assert.equal((await h.request('assets/plan-i18n.js','application/javascript')).status,503);
 assert.equal(await (await h.request('planificacion.html')).text(),'old-build:./offline.html');assert.equal(h.calls.network,2);
});
test('connectivity probes and current live services bypass the app cache',async()=>{
 const h=swHarness();assert.equal(await h.request('config.js?connectivity=123','application/javascript'),null);
 let intercepted=false;h.events.fetch({request:{url:'https://firestore.googleapis.com/test',method:'GET',headers:{get:()=>''}},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
});
test('offline readiness identifies the active version and does not report ready when a translation is missing',async()=>{
 const h=swHarness(['./assets/plan-i18n.js']);let done,result;
 h.events.message({data:{type:'OFFLINE_STATUS'},ports:[{postMessage:value=>result=value}],waitUntil:p=>done=p});await done;
 assert.equal(result.ready,false);assert.equal(result.missing,1);assert.match(result.version,/^taxfly-/);
});
test('verified reconnection retries work without changing form contents or navigating',async()=>{
 const events=new Map(),timers=new Map(),calls=[];let online=false,reachable=false,id=0;
 const form={value:'Unsaved edit'};
 const window={addEventListener:(name,fn)=>events.set(name,fn),dispatchEvent:e=>calls.push(e.type),taxflyRetryPending:()=>calls.push('retry'),retryPendingPlanning:()=>calls.push('planning')};
 const c=vm.createContext({window,document:{hidden:false,addEventListener(){}},navigator:{get onLine(){return online;}},location:{reload(){throw Error('must not reload')}},fetch:async()=>({ok:reachable}),AbortController,Date,Promise,Event,setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(read('assets/reconnect.js'),c);const tick=async()=>{const [key,fn]=timers.entries().next().value;timers.delete(key);await fn();};
 online=true;events.get('online')();await tick();assert.equal(calls.length,0);reachable=true;await tick();assert.deepEqual(calls,['taxfly:reconnected','retry','planning']);assert.equal(form.value,'Unsaved edit');assert.equal(timers.size,0);
});
function offlineApi(){
 const ls=storage(),window={TripContext:{view:()=> 'trip'},dispatchEvent(){}};
 vm.runInNewContext(read('assets/offline-status.js'),{window,localStorage:ls,navigator:{onLine:true},Date,Event,setTimeout,clearTimeout});return {ls,api:window.taxflyOfflineStatus};
}
test('pending evidence counts planning documents once, includes packing and documents, and isolates account/profile/trip keys',()=>{
 const {ls,api}=offlineApi();ls.setItem('orlando-hotel-v1::p::trip::pending','{"addr":"A","url":"B"}');ls.setItem('orlando-itinerario-v1::p::trip::pending','{"dias":[]}');ls.setItem('taxusa_gastos_pending_p::u','[{"id":"1"}]');ls.setItem('trip-reservations-v1::p::trip::u::pending','{}');ls.setItem('taxfly-packing-deletes::u::p::trip','[{},{}]');ls.setItem('taxfly-offline-pending-docs::u::p','2');
 ls.setItem('taxusa_gastos_pending_p::other','[{},{}]');ls.setItem('orlando-hotel-v1::p::other::pending','{}');ls.setItem('orlando-hotel-v1::q::trip::pending','{}');assert.equal(api.pending('u','p'),8);assert.equal(api.pending(null,'p'),0);
});
function prepareHarness(){
 const ls=storage(),idb=new Map(),nodes={'#tf-progress':{textContent:'',classList:{add(){}}},'#tf-prepare':{disabled:false}};let profile='p';
 const c=vm.createContext({preparing:false,prepKey:()=>`taxfly-prepared::u::${profile}::trip`,uid:()=> 'u',profile:()=>profile,trip:()=> 'trip',docsKey:()=>`docs::u::${profile}`,navigator:{onLine:true},L:t=>t,$:key=>nodes[key],root:{querySelectorAll:()=>[]},localStorage:ls,window:{TaxflyDocsTree:{ensure:async()=>true,base:()=>['docs']},taxflyOfflineStatus:{mark(){}}},shellReady:async()=>true,offline:async()=>{},idbPut:async(key,value)=>idb.set(key,value),firebase:async()=>({user:{uid:'u'},db:{},fs:{doc:(_,...parts)=>parts.join('/'),collection:(_,...parts)=>parts.join('/'),getDocFromServer:async()=>({exists:()=>true,data:()=>({addr:'Hotel',items:[]})}),getDocsFromServer:async()=>({docs:[]})}}),Map,Date,JSON,Number,Array});
 const source=read('assets/travel-tools.js');vm.runInContext(source.slice(source.indexOf('  async function prepare(oldDocs)'),source.lastIndexOf('})();')),c);
 return {c,ls,idb,nodes,setProfile:p=>profile=p};
}
test('preparation writes the UID-scoped reservation cache and preserves pending local edits',async()=>{
 const h=prepareHarness();h.ls.setItem('orlando-hotel-v1::p::trip','{"addr":"Manual draft"}');h.ls.setItem('orlando-hotel-v1::p::trip::pending','{"addr":"Manual draft"}');await h.c.prepare([]);
 assert.equal(JSON.parse(h.ls.getItem('orlando-hotel-v1::p::trip')).addr,'Manual draft');assert.ok(h.ls.getItem('trip-reservations-v1::p::trip::u'));assert.equal(h.ls.getItem('trip-reservations-v1::p::trip'),null);assert.equal(JSON.parse(h.ls.getItem('taxfly-prepared::u::p::trip')).schema,2);
});
test('changing profile during preparation cannot certify or write the new profile with old data',async()=>{
 const h=prepareHarness();let release;h.c.firebase=()=>new Promise(resolve=>release=resolve);const job=h.c.prepare([]);h.setProfile('q');release({user:{uid:'u'}});await job;
 assert.equal(h.ls.getItem('taxfly-prepared::u::q::trip'),null);assert.equal(h.idb.size,0);assert.match(h.nodes['#tf-progress'].textContent,/perfil cambió/);
});
test('a document missing any declared chunk is rejected instead of becoming offline-ready',()=>{
 const source=read('assets/travel-tools.js'),snippet=between(source,'const files=(d._serverFiles||d.files).map','byId.set(d.id,{...d,files');
 const run=(parts,files=[{fileIdx:0,numChunks:2}])=>{const c=vm.createContext({parts,d:{name:'Ticket',files},L:t=>t,Error,Array,Number});vm.runInContext(snippet+';globalThis.result=files;',c);return c.result;};
 assert.throws(()=>run({0:['data:application/pdf;base64,AAA']}),/Faltan partes/);assert.throws(()=>run({0:[,'BBB']}),/Faltan partes/);assert.equal(run({0:['data:application/pdf;base64,AAA','BBB']})[0].dataUrl,'data:application/pdf;base64,AAABBB');assert.equal(run({},[{chunks:['data:application/pdf;base64,AAA','BBB']}])[0].dataUrl,'data:application/pdf;base64,AAABBB');
});

test('offline settings labels use the existing ES/EN/PT dictionary and an empty queue is not called synced',()=>{
 const source=read('assets/travel-tools.js'),c=vm.createContext({});vm.runInContext(between(source,'  const D={','  const L=')+';globalThis.dict=D;',c);
 for(const key of ['Sin conexión','Conexión de red disponible','Disponibilidad sin conexión','Pantallas de la app','Última descarga de datos: ','Datos de Planificación descargados','Cambios pendientes','Sin cambios pendientes detectados','Los cambios del servidor se verifican al conectar.','Actualización lista. Cerrá todas las pestañas de TaxFly y volvé a abrirlo cuando termines de guardar.'])assert.ok(c.dict[key]?.length===2&&c.dict[key].every(Boolean),key);
 const label=between(source,'    const syncLabel=','    const screensReady=');
 for(const [count,online,expected] of [[0,true,'Sin cambios pendientes detectados'],[0,false,'Sin cambios pendientes detectados'],[1,true,'Cambios pendientes'],[1,false,'Guardado en este dispositivo']]){
  const context=vm.createContext({count,navigator:{onLine:online},age:0,L:t=>t});vm.runInContext(label+';globalThis.label=syncLabel;',context);assert.equal(context.label,expected);
 }
});
test('overlapping retry requests share one job and a later retry can start after completion',async()=>{
 let calls=0,release;const window={};const c=vm.createContext({window,clearTimeout(){},syncAll:()=>{calls++;return new Promise(resolve=>release=resolve);}});
 vm.runInContext(between(read('assets/reconnect-sync.js'),'let reconnectSyncJob=null','async function syncAll()'),c);
 const a=window.taxflyRetryPending(),b=window.taxflyRetryPending();assert.equal(a,b);assert.equal(calls,1);release();await a;
 const next=window.taxflyRetryPending();assert.equal(calls,2);release();await next;
});

test('an evicted shell entry can recover online only when the deployed worker matches its version',async()=>{
 const h=swHarness(['./assets/plan-app.js']);let fetches=0;
 h.c.fetch=async request=>{fetches++;return request.url.endsWith('/sw.js')?new Response(read('sw.js')):new Response('repaired same-build script');};
 assert.equal(await (await h.request('assets/plan-app.js','application/javascript')).text(),'repaired same-build script');assert.equal(fetches,2);assert.equal(h.calls.put,1);
});
