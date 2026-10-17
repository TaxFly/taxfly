const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
const T=require('../assets/travel-core.js');
function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};}
const routeApp=read('assets/rutas-app.js'),routeModule=read('assets/rutas.js'),plan=read('assets/plan-firebase.js');
function routeHarness(){
 const ls=storage();ls.setItem('perfilActivoId','p');const input={value:''},pending=[],published=[];
 const window={_routeUid:'u',TripContext:{active:()=> 'a',readTrips:()=>[{id:'a',destinations:[{city:'Orlando',state:'FL'}]}]},publishRoutePlanning:data=>{published.push(data);window._routePlanning=data;},addEventListener(){}};
 const c=vm.createContext({window,localStorage:ls,document:{getElementById:()=>input},currentUser:{uid:'u'},db:{},doc:(_,...parts)=>parts.join('/'),getDoc:ref=>new Promise((resolve,reject)=>pending.push({ref,resolve,reject})),Promise,JSON});
 vm.runInContext(between(routeApp,'function routePlanningGroups(','function routeStopIdentity('),c);window.routePlanningGroups=c.routePlanningGroups;
 vm.runInContext(between(routeModule,'let routePlanningGeneration=0;','window.doLogout'),c);
 const finish=(offset=0,data=[{addr:'Saved',locations:{'Orlando::FL':{addr:'Scoped hotel'}}},{days:[{id:'shops',dayName:'Original name',stops:[{name:'Outlet',note:'Personal note',url:'https://maps/a'}]}]},{dias:[{id:'park',nombre:'EPCOT',bloques:[{titulo:'Test Track',obs:'My note'}]}]}])=>{for(let i=0;i<3;i++)pending[offset+i].resolve({metadata:{fromCache:false},exists:()=>data[i]!==null,data:()=>data[i]});};
 return {c,ls,input,pending,published,window,finish};
}
test('routes reuse the destination hotel and expose both planning day types without mutating content',async()=>{
 const h=routeHarness(),request=h.c.loadTripStartingPoint('u');h.finish();await request;
 assert.equal(h.input.value,'Scoped hotel');const data=h.published.at(-1);
 assert.equal(data.groups.length,2);assert.equal(data.groups[0].label,'Original name');assert.equal(data.groups[0].stops[0].desc,'Personal note');
});
test('late accommodation responses preserve typing, including an explicit blank override',async()=>{
 const h=routeHarness();let request=h.c.loadTripStartingPoint('u');h.input.value='My manual address';h.finish();await request;assert.equal(h.input.value,'My manual address');
 h.input.value='';h.ls.setItem('taxusa_hotel_addr::u::p::a','');request=h.c.loadTripStartingPoint('u');h.finish(3);await request;assert.equal(h.input.value,'');
});
test('late route planning responses cannot publish into a different profile or replace a newer refresh',async()=>{
 const h=routeHarness(),old=h.c.loadTripStartingPoint('u'),latest=h.c.loadTripStartingPoint('u');h.finish(3);await latest;const count=h.published.length;h.finish();await old;assert.equal(h.published.length,count);
 const other=h.c.loadTripStartingPoint('u');h.ls.setItem('perfilActivoId','q');h.finish(6);await other;assert.equal(h.published.at(-1).loading,true); // no old completion published
});
test('failed refresh preserves known same-context planning; cached-empty responses are not confirmed emptiness',async()=>{
 const h=routeHarness();let req=h.c.loadTripStartingPoint('u');h.finish();await req;
 req=h.c.loadTripStartingPoint('u');h.pending[3].reject(Error('network'));h.pending[4].resolve({});h.pending[5].resolve({});await req;assert.equal(h.published.at(-1).groups.length,2);assert.equal(h.published.at(-1).error,true);
 const fresh=routeHarness();req=fresh.c.loadTripStartingPoint('u');for(const p of fresh.pending)p.resolve({metadata:{fromCache:true},exists:()=>false});await req;assert.equal(fresh.published.at(-1).error,true);
});
test('reimporting stops avoids duplicates while preserving manual entries and saved source content',()=>{
 const ls=storage();ls.setItem('perfilActivoId','p');const original={name:'Store',desc:'Note',url:'https://maps/a'};
 const window={_routeUid:'u',TripContext:{active:()=> 'a'},_routePlanning:{scope:JSON.stringify(['u','p','a']),groups:[{key:'g',stops:[original]}]}};
 const c=vm.createContext({window,localStorage:ls,document:{getElementById:()=>({value:'g'})},i18n:{es:{planning_none_added:"Already added"}},stops:[{name:'Manual',url:''}],renderStops(){},showToast(){},addedToastMsg:n=>n,Set,JSON});
 vm.runInContext(between(routeApp,'function routePlanningScope()','function routePlanningGroups(')+between(routeApp,'function routeStopIdentity(','function publishRoutePlanning(')+routeApp.slice(routeApp.indexOf('function importPlanningStops()')),c);
 c.importPlanningStops();c.importPlanningStops();assert.equal(c.stops.length,2);assert.equal(c.stops[0].name,'Manual');c.stops[1].desc='Changed';assert.equal(original.desc,'Note');
 window._routeUid='other';c.importPlanningStops();assert.equal(c.stops.length,2);
});
test('new route UI strings are present in ES, EN and PT in the existing translation dictionary',()=>{
 const c=vm.createContext({});vm.runInContext(between(routeApp,'const i18n =','window.changeLanguage')+';globalThis.dict=i18n;',c);
 for(const key of Object.keys(c.dict.es).filter(key=>key.startsWith('planning_')))for(const lang of ['es','en','pt'])assert.ok(c.dict[lang][key],lang+key);
});
function expenseHarness(){
 const ls=storage(),events=new Map(),writes=[],snapshots=[],totals=[];ls.setItem('taxusa_gastos_cache_p::u','[]');
 const window={TaxflyTravel:T,addEventListener:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);},removeEventListener:(name,fn)=>events.get(name)?.delete(fn),dispatchEvent:e=>{for(const fn of events.get(e.type)||[])fn(e);}};
 const c=vm.createContext({window,localStorage:ls,currentUid:'u',currentPerfilId:'p',activeTripId:'a',navigator:{onLine:true},db:{},collection:(_,...parts)=>parts.join('/'),doc:(collection,id)=>({collection,id:id||'fixed-id'}),setDoc:(ref,data)=>new Promise((resolve,reject)=>writes.push({ref,data,resolve,reject})),onSnapshot:(_,options,next)=>{snapshots.push(next);return ()=>{};},devError(){},Event,JSON,Date});
 vm.runInContext(between(plan,'function listenTaxflyGastos(cb) {','async function migrateManualExpenses()')+between(plan,'async function addTaxflyGasto(data) {','window._fb ='),c);
 const stop=c.listenTaxflyGastos((total,n)=>totals.push([total,n]));return {c,ls,window,events,writes,snapshots,totals,stop};
}
test('a queued planning expense immediately refreshes totals, matches its server row once, and removes its listeners',async()=>{
 const h=expenseHarness();assert.equal(await h.c.addTaxflyGasto({nombre:'Food',valor:25}),true);
 assert.deepEqual(h.totals.at(-1),[25,1]);const op=JSON.parse(h.ls.getItem('taxusa_gastos_pending_p::u'))[0];assert.equal(op.type,'upsert');assert.equal(op.id,h.writes[0].ref.id);
 h.snapshots[0]({metadata:{fromCache:false},docs:[{id:op.id,data:()=>op.data}]});assert.deepEqual(h.totals.at(-1),[25,1]);
 h.writes[0].resolve();await new Promise(setImmediate);assert.equal(JSON.parse(h.ls.getItem('taxusa_gastos_pending_p::u')).length,0);assert.deepEqual(h.totals.at(-1),[25,1]);
 h.stop();assert.equal(h.events.get('taxfly-pending-updated').size,0);
});
test('failed expense writes retain the fixed ID for retry and ignore another trip',async()=>{
 const h=expenseHarness();await h.c.addTaxflyGasto({valor:10});h.writes[0].reject(Error('uncertain result'));await new Promise(setImmediate);
 const key='taxusa_gastos_pending_p::u',ops=JSON.parse(h.ls.getItem(key));assert.equal(ops.length,1);
 const actual=new Map();const purchases=read('assets/compras.js');
 const c=vm.createContext({currentUser:{uid:'u'},perfilId:'p',db:{},localStorage:h.ls,pendingGastosKey:()=>key,getPendingGastos:()=>JSON.parse(h.ls.getItem(key)),flushingExpenses:false,doc:(_,...parts)=>parts.at(-1),setDoc:async(id,data)=>actual.set(id,data),window:{dispatchEvent(){}},navigator:{onLine:true},Event,JSON,Set});
 vm.runInContext(between(purchases,'async function flushPendingGastos() {','window.addEventListener("online"'),c);
 await c.flushPendingGastos();h.ls.setItem(key,JSON.stringify(ops));await c.flushPendingGastos();assert.equal(actual.size,1);assert.equal(actual.get(ops[0].id).valor,10);
 h.c.activeTripId='b';const count=h.totals.length;h.window.dispatchEvent(new Event('taxfly-pending-updated'));assert.equal(h.totals.length,count);
});
test('repeated route transfer uses its stable import ID without creating another undated day; another account is ignored',()=>{
 const ls=storage(),data={uid:'u',profile:'p',tripId:'a',importId:'transfer',days:[{name:'Original day',stops:[{name:'Outlet'}]}]};ls.setItem('taxfly-route-import',JSON.stringify(data));
 let id=0;const c=vm.createContext({sessionStorage:ls,window:{_taxflyTripUid:'u',_perfilId:'p',_tripId:'a'},itinDias:[],itinNorm:s=>s.toLowerCase(),itinNewId:()=>String(++id),itinSave(){},showMToast(){},JSON,Date,Array});
 const app=read('assets/plan-app.js');vm.runInContext(between(app,'function importSharedRoute() {','let itinDias ='),c);
 c.importSharedRoute();ls.setItem('taxfly-route-import',JSON.stringify(data));c.importSharedRoute();assert.equal(c.itinDias.length,1);assert.equal(c.itinDias[0].bloques.length,1);
 data.uid='other';ls.setItem('taxfly-route-import',JSON.stringify(data));c.importSharedRoute();assert.equal(c.itinDias.length,1);
});
test('a saved budget updates Home, Expenses and Planning immediately only for the matching account and trip',()=>{
 for(const page of ['assets/index-app.js','assets/compras.js']){
  let handler,renders=0;const state=T.loadState(100);
  const window={addEventListener:(name,fn)=>{if(name==='taxfly:budget-updated')handler=fn;},TripContext:{view:()=> 'a'}};
  const c=vm.createContext({window,currentUser:{uid:'u'},perfilId:'p',homeFinance:{base:state},homeScope:'s',homeContext:()=> 's',financeStates:{base:state},expenseScope:'s',expenseContext:()=> 's',presupuestoBase:100,lastGastosTotal:0,renderBudgetUI:()=>renders++,updateBudgetDisplay:()=>renders++});
  const source=read(page),start=source.indexOf('window.addEventListener("taxfly:budget-updated"');
  vm.runInContext(source.slice(start,source.indexOf('\n});',start)+4),c);
  for(const detail of [{uid:'other',pid:'p',trip:'a',value:2},{uid:'u',pid:'other',trip:'a',value:2},{uid:'u',pid:'p',trip:'b',value:2}])handler({detail});assert.equal(renders,0);
  handler({detail:{uid:'u',pid:'p',trip:'a',value:250}});assert.equal(state.value,250);assert.equal(renders,1);
 }
 const h=expenseHarness();let handler,total;
 h.c.window.addEventListener=(name,fn)=>{if(name==='taxfly:budget-updated')handler=fn;};
 h.c.perfilDocRef=()=>({});h.c.tripDocRef=()=>({});
 vm.runInContext(between(plan,'function listenTaxflyPresupuesto(cb) {','function listenTaxflyGastos(cb) {'),h.c);
 h.c.listenTaxflyPresupuesto(value=>total=value);handler({detail:{uid:'u',pid:'p',trip:'a',value:250}});assert.equal(total,250);
 h.c.activeTripId='b';handler({detail:{uid:'u',pid:'p',trip:'a',value:400}});assert.equal(total,250);
});
test('budget publisher uses the canonical scoped cache key and rejects invalid values',()=>{
 const ls=storage(),events=[];const window={dispatchEvent:e=>events.push(e)};
 vm.runInNewContext(read('assets/travel-core.js'),{window,localStorage:ls,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
 assert.equal(window.TaxflyTravel.publishBudget('u','p','a',250),true);assert.equal(ls.getItem('taxusa_budget_cache_p::u::a'),'250');assert.equal(events[0].detail.trip,'a');
 assert.equal(window.TaxflyTravel.publishBudget('u','p','a',NaN),false);assert.equal(events.length,1);
});
test('creating an expense offline queues one stable row that the Home/Planning overlay can count',async()=>{
 const ops=[],ls=storage(),fields={nombre:{value:'Lunch',focus(){}},valor:{value:'18'}};
 const window={TaxflyTravel:T,TripContext:{assign:()=> 'a'}};
 const c=vm.createContext({window,localStorage:ls,currentUser:{uid:'u'},perfilId:'p',navigator:{onLine:false},allGastos:[],LAST_CAT_KEY:'cat',document:{getElementById:id=>fields[id],querySelector:()=>null},db:{},collection:()=>({}),doc:()=>({id:'new-fixed'}),queueGastoOp:op=>ops.push(op),getPendingGastos:()=>ops,guardarGastosEnCache(){},renderGastosList(){},showExpToast(){},bt:t=>t,Date});
 vm.runInContext(between(read('assets/compras.js'),'window.addGastoWithThumb =','let _viewerGastoId'),c);await c.window.addGastoWithThumb('');
 assert.equal(ops.length,1);assert.equal(ops[0].type,'upsert');assert.equal(ops[0].id,'new-fixed');assert.equal(c.allGastos.length,1);assert.equal(c.allGastos[0].valor,18);
});

test('the route connector never announces no saved stops before authentication and planning loading complete',()=>{
 const ls=storage();ls.setItem('perfilActivoId','p');const nodes={'planning-day':{value:'',replaceChildren(){},appendChild(){}},'planning-status':{},'planning-import':{},'planning-hotel':{}};
 const window={_routeUid:'u',TripContext:{active:()=> 'a'}};
 const c=vm.createContext({window,localStorage:ls,document:{getElementById:id=>nodes[id],createElement:()=>({})},JSON});
 vm.runInContext(between(routeApp,'const i18n =','window.changeLanguage')+between(routeApp,'function routePlanningScope()','function routePlanningGroups(')+between(routeApp,'function renderRoutePlanning()','function usePlanningHotel()'),c);
 c.renderRoutePlanning();assert.equal(nodes['planning-status'].textContent,'Cargando Planificación…');
 const scope=JSON.stringify(['u','p','a']);window._routePlanning={scope,groups:[],loading:true};c.renderRoutePlanning();assert.equal(nodes['planning-status'].textContent,'Cargando Planificación…');
 window._routePlanning={scope,groups:[],error:true};c.renderRoutePlanning();assert.equal(nodes['planning-status'].textContent,'No se pudo actualizar Planificación.');
 window._routePlanning={scope,groups:[]};c.renderRoutePlanning();assert.equal(nodes['planning-status'].textContent,'No hay paradas guardadas para este viaje.');
});
