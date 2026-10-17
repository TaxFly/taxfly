const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const T=require('../assets/travel-core.js');
const read=f=>fs.readFileSync(require('node:path').join(__dirname,'..',f),'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k),data};}
const snap=(items,fromCache=false)=>({docs:items.map((data,i)=>({id:data.id||String(i),data:()=>data})),empty:!items.length,metadata:{fromCache}});
const docSnap=(data,fromCache=false)=>({exists:()=>data!==null,data:()=>data,metadata:{fromCache}});

test('first cached emptiness is unknown; metadata-only server confirmation permits genuine emptiness',()=>{
 const s=T.loadState();assert.equal(s.receive([],snap([],true),true),false);assert.equal(s.hasValue,false);
 assert.equal(s.receive([],snap([]),true),true);assert.equal(s.hasValue,true);assert.deepEqual(s.value,[]);
});
test('refresh cache and failures preserve confirmed values; later server updates recover',()=>{
 const s=T.loadState([{id:'saved'}]);assert.equal(s.receive([],snap([],true),true),false);
 s.fail();assert.equal(s.value[0].id,'saved');assert.equal(s.error,true);
 s.receive([{id:'new'}],snap([{id:'new'}]));assert.equal(s.error,false);assert.equal(s.value[0].id,'new');
 s.receive([],snap([]),true);assert.equal(s.value.length,0);
});
test('zero budget is unknown from empty cache, but valid when confirmed or locally saved',()=>{
 const s=T.loadState();assert.equal(s.receive(0,docSnap({},true),true),false);
 s.receive(0,docSnap({presupuesto:0}),true);assert.equal(s.hasValue,true);assert.equal(s.value,0);
 assert.equal(T.loadState(0).hasValue,true);
});
test('a pending local edit can be rendered before server acknowledgement',()=>{
 const s=T.loadState();assert.equal(s.receive([], {metadata:{fromCache:true,hasPendingWrites:true}},true),true);
});
test('reservation cache is never erased by initial cached missing document or late callbacks after stop',()=>{
 const ls=storage();global.localStorage=ls;let callback,fail,latest,states=[];
 T.writeReservations('u','p','trip',[{id:'r'}]);
 const stop=T.watchReservations({uid:'u',pid:'p',trip:'trip',db:{},doc:()=>({}),onSnapshot:(_,opts,cb,error)=>{assert.equal(opts.includeMetadataChanges,true);callback=cb;fail=error;return ()=>{}},onChange:x=>latest=x,onState:s=>states.push({has:s.hasValue,error:s.error})});
 callback(docSnap(null,true));assert.equal(latest[0].id,'r');assert.equal(T.readReservations('u','p','trip')[0].id,'r');
 fail();assert.equal(states.at(-1).error,true);assert.equal(latest[0].id,'r');
 callback(docSnap({items:[]}));assert.deepEqual(latest,[]);
 stop();callback(docSnap({items:[{id:'late'}]}));assert.deepEqual(T.readReservations('u','p','trip'),[]);
 delete global.localStorage;
});

test('trip hydration failure never becomes a confirmed no-trips state; offline scoped cache remains available',async()=>{
 const ls=storage(),window={dispatchEvent(){},addEventListener(){}};
 vm.runInNewContext(read('assets/trip-context.js'),{window,localStorage:ls,navigator:{onLine:true},CustomEvent:class{},setTimeout,clearTimeout,Promise,Map,JSON});
 await window.TripContext.hydrate({},'u','p',()=>Promise.reject(Error('offline')),()=>({}));
 assert.equal(window.TripContext.status('u','p').phase,'error');assert.equal(window.TripContext.status('u','p').hasData,false);
 ls.setItem(window.TripContext.keys('u','p').list,JSON.stringify([{id:'a',name:'A'}]));
 assert.equal(window.TripContext.readTrips('u','p')[0].id,'a');assert.equal(window.TripContext.status('other','p').hasData,false);
});

test('home listeners reject late updates after trip/account change and preserve known data on error',()=>{
 const source=read('assets/index-app.js'),ls=storage(),callbacks=[],renders=[];
 let generation=1,scope='u/p/a';
 const c=vm.createContext({window:{TaxflyTravel:T,TripContext:{view:()=> 'a'}},currentUser:{uid:'u'},perfilId:'p',homeGeneration:1,homeScope:scope,homeStops:[],homeReservationUnsub:()=>{},homeReservations:[],homeFinance:null,homeContext:()=>scope,homeContextReady:()=>true,homeValid:(g,k)=>g===generation&&k===scope,readHomeCache:k=>{const raw=ls.getItem(k);return raw===null?undefined:JSON.parse(raw)},homeBudgetKey:()=> 'base-a',homeExpensesKey:()=> 'expenses-u-p',mapsBudgetCacheKey:()=> 'maps-a',renderBudgetUI:()=>{},renderUpcoming:()=>{},listenMapsBudget:()=>{},localStorage:ls,doc:(_,...p)=>p.join('/'),collection:(_,...p)=>p.join('/'),query:x=>x,orderBy:()=>{},db:{},onSnapshot:(ref,options,cb,error)=>{callbacks.push({ref,cb,error});return ()=>{};}});
 // Isolate budget loading; reservations are independently covered above.
 c.window.TaxflyTravel={...T,watchReservations:()=>()=>{}};
 vm.runInContext(between(source,'function loadBudget()','function syncHomeContext()'),c);c.loadBudget();generation=c.homeGeneration;
 callbacks[0].cb(docSnap({taxflyBudget:500}));callbacks[1].cb(snap([{id:'x',tripId:'a',valor:30}]));
 assert.equal(ls.getItem('base-a'),'500');callbacks[1].cb(snap([],true));assert.equal(JSON.parse(ls.getItem('expenses-u-p')).length,1);
 callbacks[0].error();assert.equal(c.homeFinance.base.value,500);assert.equal(c.homeFinance.base.error,true);
 scope='other/p/b';callbacks[0].cb(docSnap({taxflyBudget:999}));callbacks[1].cb(snap([]));
 assert.equal(ls.getItem('base-a'),'500');assert.equal(JSON.parse(ls.getItem('expenses-u-p')).length,1);
});

test('expense listeners wait for confirmed emptiness, preserve failures, and ignore stale trip callbacks',()=>{
 const ls=storage(),listeners=[],renders=[];let scope='u/p/a';
 const c=vm.createContext({window:{TaxflyTravel:T,taxflyOfflineStatus:{mark(){}}},currentUser:{uid:'u'},perfilId:'p',expenseGeneration:1,expenseScope:scope,financeStates:{expenses:T.loadState(),base:T.loadState()},expenseStops:[],allGastos:[],expenseSnapshotReady:false,expenseValid:(g,s)=>g===1&&s===scope,gastosCacheKey:()=> 'expenses',getPendingGastos:()=>[],localStorage:ls,collection:(_,...p)=>p.join('/'),query:x=>x,orderBy:()=>{},db:{},onSnapshot:(ref,options,cb,error)=>{listeners.push({cb,error});return ()=>{}},renderGastosList:x=>renders.push(x),offerReservationPayment(){},renderBudgetCard(){}});
 vm.runInContext(between(read('assets/compras.js'),'function listenGastos()','function listenPresupuestoYOrlando()'),c);c.listenGastos();
 listeners[0].cb(snap([],true));assert.equal(renders.length,0);assert.equal(ls.getItem('expenses'),null);
 listeners[0].cb(snap([{id:'one',valor:30}]));assert.equal(renders.at(-1).length,1);
 listeners[0].error();assert.equal(renders.at(-1).length,1);assert.equal(c.financeStates.expenses.error,true);
 scope='u/p/b';listeners[0].cb(snap([]));assert.equal(JSON.parse(ls.getItem('expenses')).length,1);
 scope='u/p/a';listeners[0].cb(snap([]));assert.equal(renders.at(-1).length,0);
});

test('loading and error labels exist in the current ES/EN/PT dictionaries',()=>{
 for(const [file,name] of [['assets/index-app.js','I18N'],['assets/compras.js','i18n']]){
  const src=read(file),start=src.indexOf('const '+name+' = {'),end=src.indexOf('\n};',start)+3;
  const dictionaries=vm.runInNewContext(src.slice(start,end)+'\n'+name);
  for(const l of ['es','en','pt'])for(const key of ['load_error','saved_offline','no_local_data',file.includes('index')?'loading':'loading_data'])assert.ok(dictionaries[l][key],`${file}:${l}:${key}`);
 }
});

function nodes(){const els=new Map();return {getElementById(id){if(!els.has(id))els.set(id,{style:{},textContent:'',_editing:false,setAttribute(k,v){this[k]=v;},classList:{toggle(){}}});return els.get(id);}};}
function dictionaries(file,name){const src=read(file),start=src.indexOf('const '+name+' = {'),end=src.indexOf('\n};',start)+3;return vm.runInNewContext(src.slice(start,end)+'\n'+name);}
for(const language of ['es','en','pt'])test(`expense card ${language}: loading -> confirmed empty -> cached budget -> refresh failure without lost amount`,()=>{
 const document=nodes(),i18n=dictionaries('assets/compras.js','i18n'),states={base:T.loadState(),expenses:T.loadState(),maps:T.loadState(),reservations:T.loadState([])};
 const c=vm.createContext({document,window:{TripContext:{view:()=> 'a',readTrips:()=>[]},TaxflyTravel:T},currentUser:{uid:'u'},perfilId:'p',expenseContextReady:()=>true,expenseScope:'scope',expenseContext:()=> 'scope',financeStates:states,navigator:{onLine:true},financeMessage:()=>i18n[language].load_error,bt:k=>i18n[language][k],i18n,localStorage:{getItem:()=>language},presupuestoBase:0,lastGastosTotal:0,mapsSpent:0,financeReservations:[],filteredGastos:()=>[],pendingDeletes:new Set(),budgetTripName:()=> 'Trip',fmt:n=>n.toFixed(2)});
 vm.runInContext(between(read('assets/compras.js'),'function renderBudgetCard()','window.refreshBudgetInfoRow'),c);
 c.renderBudgetCard();assert.equal(document.getElementById('bc-empty').style.display,'none');assert.equal(document.getElementById('budget-set-row').style.display,'none');
 states.base.receive(0);states.expenses.receive([]);states.maps.receive(0);c.renderBudgetCard();assert.equal(document.getElementById('bc-empty').style.display,'block');
 states.base.receive(500);c.presupuestoBase=500;c.renderBudgetCard();assert.equal(document.getElementById('disp-fondo').textContent,'USD 500.00');
 states.base.fail();c.renderBudgetCard();assert.equal(document.getElementById('disp-fondo').textContent,'USD 500.00');assert.equal(document.getElementById('bc-hint').textContent,i18n[language].load_error);
 c.expenseContext=()=> 'other-trip';c.renderBudgetCard();assert.equal(document.getElementById('bc-main').style.display,'none');
});

test('initial HTML cannot show a budget setup form or no-upcoming-events before authentication',()=>{
 const html=read('compras.html');assert.match(html,/<div id="bc-empty" style="display:none;">/);assert.match(html,/id="budget-set-row" style="display:none;"/);
 assert.match(read('index.html'),/id="ne-title" data-i18n="loading">/);
});

test('planning budget ignores cached missing fields, retains refresh errors and rejects another account',()=>{
 const ls=storage(),callbacks=[],values=[];ls.setItem('taxusa_budget_cache_p::u','500');
 const c=vm.createContext({window:{TaxflyTravel:T,budgetRefresh(){}},currentUid:'u',currentPerfilId:'p',activeTripId:'orlando',localStorage:ls,perfilDocRef:()=> 'profile',tripDocRef:()=> 'trip',onSnapshot:(ref,options,cb,error)=>{callbacks.push({cb,error});return ()=>{};}});
 vm.runInContext(between(read('assets/plan-firebase.js'),'function listenTaxflyPresupuesto(cb)','function listenTaxflyGastos(cb)'),c);
 c.listenTaxflyPresupuesto(x=>values.push(x));assert.deepEqual(values,[500]);
 callbacks[0].cb(docSnap({},true));assert.deepEqual(values,[500]);callbacks[0].error();assert.equal(c.window._planFinanceError,true);assert.equal(ls.getItem('taxusa_budget_cache_p::u'),'500');
 c.currentUid='another';callbacks[0].cb(docSnap({presupuesto:900}));assert.deepEqual(values,[500]);
 c.currentUid='u';callbacks[0].cb(docSnap({presupuesto:700}));assert.equal(values.at(-1),700);assert.equal(c.window._planFinanceError,false);
});
test('planning does not offer budget setup until both financial sources are known',()=>{
 const document=nodes();const c=vm.createContext({document,window:{tr:s=>s},navigator:{onLine:true},financePresReady:false,financeExpensesReady:false,tfx:{presupuesto:0},budgetRemaining:()=>0,budgetUsd:x=>String(x),ic:()=>''});
 vm.runInContext(between(read('assets/plan-app.js'),'function planFinanceMessage()','function openBudgetFromPill()'),c);
 c.renderBudgetPill();assert.match(document.getElementById('budget-pill-slot').innerHTML,/Cargando/);assert.doesNotMatch(document.getElementById('budget-pill-slot').innerHTML,/Definir presupuesto/);
 c.financePresReady=true;c.financeExpensesReady=true;c.renderBudgetPill();assert.match(document.getElementById('budget-pill-slot').innerHTML,/Definir presupuesto/);
});
