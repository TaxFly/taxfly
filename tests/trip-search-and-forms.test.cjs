const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const core=require('../assets/trip-search-core.js'),travel=require('../assets/travel-core.js');
const slice=(s,a,b)=>s.slice(s.indexOf(a),b?s.indexOf(b,s.indexOf(a)):undefined);
const ctx={uid:'u',profile:'p',trip:'a'};
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
function cached(ls,records,context=ctx){const scope=core.scope(context);ls.setItem('taxfly-trip-search::'+scope,JSON.stringify({schema:1,scope,records}));}
const record=(source,id,title)=>({source,id,title,detail:'',kind:'note',href:'lugares.html'});
test('trip search matches accented personal names and codes without translating content',()=>{
 const a=core.records(ctx,'reservations',{items:[{id:'r',name:'Hospedaje São José',reference:'AB-123',notes:'Llegada tarde'}]});
 assert.equal(core.search(a,'sao jose AB-123','pt').length,1);assert.equal(a[0].title,'Hospedaje São José');assert.equal(core.search(a,'AB-999').length,0);
});
test('trip metadata filters other trips and omits document bytes and unrelated fields',()=>{
 const rows=core.records(ctx,'documents',[{id:'d',tripId:'a',name:'Seguro',files:[{name:'Voucher.pdf',dataUrl:'PRIVATE_BYTES',chunks:['PRIVATE_CHUNK']}],secret:'PRIVATE_SECRET'},{id:'other',tripId:'b',name:'Other trip'}]);
 assert.equal(rows.length,1);assert.match(rows[0].detail,/Voucher.pdf/);assert.doesNotMatch(JSON.stringify(rows),/PRIVATE|Other trip/);
});
test('failed sources retain previous results while confirmed empty sources remove stale results',()=>{
 const before=[record('notes','n','Keep'),record('documents','d','Remove')];const after=core.merge(before,[{source:'notes',confirmed:false,records:[]},{source:'documents',confirmed:true,records:[]}]);
 assert.deepEqual(after,[before[0]]);
});
test('partial device snapshots merge with cached results without erasing unseen records',()=>{
 const before=[record('notes','n','Old'),record('notes','n2','Not cached by Firestore')];
 const after=core.merge(before,[{source:'notes',confirmed:true,authoritative:false,records:[record('notes','n','Updated')]}]);
 assert.equal(after.length,2);assert.equal(after.find(x=>x.id==='n').title,'Updated');
});
test('result links reject external origins, script schemes and unrelated screens',()=>{
 const base='https://taxfly.github.io/taxfly/index.html';
 for(const href of ['javascript:alert(1)','https://evil.example/tickets.html','profiles.html'])assert.equal(core.safeHref(href,base),'');
 assert.equal(core.safeHref('tickets.html?doc=a%2Fb',base),'https://taxfly.github.io/taxfly/tickets.html?doc=a%2Fb');
});
function loader({snapshots={},auth}={}){
 const ls=storage(),current={...ctx},queries=[];
 const fs={doc:(_, ...parts)=>parts,collection:(_, ...parts)=>parts,where:(...x)=>x,query:(ref,filter)=>({ref,filter}),getDoc:ref=>get(ref.at(-1),false),getDocs:q=>{queries.push(q);return get(q.ref.at(-1),true);}};
 const names={actividades:'activities',notas:'notes',gastos:'expenses',docs:'documents'};
 function get(name,many){const value=snapshots[names[name]||name];if(value instanceof Error)return Promise.reject(value);if(typeof value==='function')return value();if(value)return Promise.resolve(value);return Promise.resolve(many?{docs:[],metadata:{fromCache:false}}:{exists:()=>false,metadata:{fromCache:false}});}
 const window={TaxflyTripSearch:core,TaxflyTravel:travel,TaxflyDocsTree:{ensure:async()=>true,base:()=>['usuarios','u','perfiles','p','docs']}};
 const c=vm.createContext({window,localStorage:ls,uid:()=>current.uid,profile:()=>current.profile,trip:()=>current.trip,firebase:auth|| (async()=>({fs,db:{},user:{uid:current.uid}})),setTimeout,clearTimeout,Promise,JSON,Map,Error});
 const source=read('assets/travel-tools.js');vm.runInContext(slice(source,'  function searchContext(){','})();'),c);
 return {window,ls,current,queries};
}
const list=(rows,fromCache=false)=>({docs:rows.map(item=>({id:item.id,data:()=>item})),metadata:{fromCache}});
test('search loader queries only the selected trip, not document chunks',async()=>{
 const h=loader({snapshots:{documents:list([{id:'d',name:'Insurance',tripId:'a'}])}});const result=await h.window.taxflyTripSearchLoad();
 assert.equal(result.records.length,1);assert.equal(h.queries.length,4);
 for(const q of h.queries){assert.deepEqual(Array.from(q.filter),['tripId','==','a']);assert.ok(!q.ref.includes('chunks'));}
});
test('cached results appear only after the current authenticated user is verified',async()=>{
 let resolve;const auth=()=>new Promise(r=>resolve=r),h=loader({auth});cached(h.ls,[record('notes','n','Private')]);let calls=0;
 const work=h.window.taxflyTripSearchLoad(()=>calls++);await Promise.resolve();assert.equal(calls,0);
 resolve({fs:{},db:{},user:{uid:'someone-else'}});await assert.rejects(work,/context/);assert.equal(calls,0);
});
test('an error retains valid cached results and reports partial availability',async()=>{
 const h=loader({snapshots:{notes:Error('network')}});cached(h.ls,[record('notes','n','Retained')]);let local;
 const result=await h.window.taxflyTripSearchLoad(data=>local=data);assert.equal(local.records[0].title,'Retained');assert.equal(result.partial,true);assert.equal(result.records[0].title,'Retained');
});
test('an empty offline query does not confirm absence or clear cached results',async()=>{
 const h=loader({snapshots:{notes:list([],true)}});cached(h.ls,[record('notes','n','Retained')]);const result=await h.window.taxflyTripSearchLoad();assert.equal(result.partial,true);assert.equal(result.local,true);assert.equal(result.records.length,1);
});
test('late replies after switching trip cannot write into either trip cache',async()=>{
 let resolve;const h=loader({snapshots:{notes:()=>new Promise(r=>resolve=r)}});const work=h.window.taxflyTripSearchLoad();
 while(!resolve)await new Promise(setImmediate);h.current.trip='b';resolve(list([{id:'n',name:'Old trip',tripId:'a'}]));await assert.rejects(work,/context/);
 assert.equal(h.ls.getItem('taxfly-trip-search::'+core.scope(ctx)),null);assert.equal(h.ls.getItem('taxfly-trip-search::'+core.scope(h.current)),null);
});
test('pending expense edits and deletions are reflected without duplicate results',async()=>{
 const h=loader({snapshots:{expenses:list([{id:'e1',nombre:'Before',tripId:'a'},{id:'e2',nombre:'Delete',tripId:'a'}])}});
 h.ls.setItem('taxusa_gastos_pending_p::u',JSON.stringify([{type:'upd',id:'e1',data:{nombre:'After'}},{type:'del',id:'e2'},{type:'upsert',id:'e3',data:{nombre:'Pending',tripId:'a'}}]));
 const result=await h.window.taxflyTripSearchLoad();assert.deepEqual(Array.from(result.records,x=>x.title).sort(),['After','Pending']);assert.equal(result.local,true);
});
const route=read('assets/rutas-app.js');
function routeHarness(){
 const ls=storage();ls.setItem('perfilActivoId','p');let trip='a';
 const nodes={};for(const id of ['hotel-input','start-date','manual-name','manual-desc','manual-url','links-input','csv-text','return-hotel','days-count','planning-day'])nodes[id]={value:'',checked:false};
 const window={_routeUid:'u',TripContext:{active:()=>trip}},undo=[];
 window.tfDeleteWithUndo=op=>undo.push(op);
 const c=vm.createContext({window,localStorage:ls,document:{getElementById:id=>nodes[id]},JSON,Map,Set,stops:[],routeData:null,visited:{},days:1,activeMethod:null,renderStops(){},setMethod(m){c.activeMethod=m},showToast(){},addedToastMsg:n=>String(n),i18n:{es:{planning_none_added:'none',route_removed:'removed',route_cleared:'cleared'}}});
 vm.runInContext('let activeRouteDraftScope=null;const routeDraftDirty=new Set();const routeDraftFields=["hotel-input","start-date","manual-name","manual-desc","manual-url","links-input","csv-text"];'+slice(route,'function routePlanningScope()','function routePlanningGroups(')+slice(route,'function routeStopIdentity(','function publishRoutePlanning(')+slice(route,'function saveRouteDraft(){','function watchRouteDraft(){')+slice(route,'function importPlanningStops()')+slice(route,'function removeStop(i) {','const dz ='),c);
 return {c,ls,nodes,window,undo,trip:t=>trip=t};
}
test('route import adds only selected stops and repeated imports do not duplicate them',()=>{
 const h=routeHarness(),scope=core.scope(ctx);h.window._routePlanning={scope,groups:[{key:'d',stops:[{name:'One'},{name:'Two'}]}]};h.nodes['planning-day'].value='d';h.nodes['planning-choices']={querySelectorAll:()=>[{value:'1'}]};h.c.importPlanningStops();h.c.importPlanningStops();assert.deepEqual(Array.from(h.c.stops,x=>x.name),['Two']);
});
test('route drafts remain separate for each account, profile and trip',()=>{
 const h=routeHarness();h.c.restoreRouteDraft();h.nodes['hotel-input'].value='Hotel A';h.c.stops=[{name:'A'}];assert.equal(h.c.saveRouteDraft(),true);
 h.trip('b');h.c.stops=[];h.c.restoreRouteDraft();assert.equal(h.nodes['hotel-input'].value,'');h.nodes['hotel-input'].value='Hotel B';h.c.saveRouteDraft();
 h.trip('a');h.c.restoreRouteDraft();assert.equal(h.nodes['hotel-input'].value,'Hotel A');assert.equal(h.c.stops[0].name,'A');
 h.window._routeUid='another';h.c.stops=[];h.c.restoreRouteDraft();assert.equal(h.nodes['hotel-input'].value,'');
});
test('late draft restoration preserves fields edited while profile was loading',()=>{
 const h=routeHarness();h.ls.setItem('taxfly-route-draft::'+core.scope(ctx),JSON.stringify({values:{'hotel-input':'Older saved hotel'}}));h.nodes['hotel-input'].value='Currently typing';vm.runInContext('routeDraftDirty.add("hotel-input")',h.c);h.c.restoreRouteDraft();assert.equal(h.nodes['hotel-input'].value,'Currently typing');
});
test('undo restores the same route stop at its original position and ignores another trip',()=>{
 const h=routeHarness();h.c.stops=[{name:'One'},{name:'Two'}];const original=h.c.stops[0];h.c.removeStop(0);h.undo[0].restore();assert.equal(h.c.stops[0],original);
 h.c.removeStop(0);h.trip('b');h.undo[1].restore();assert.deepEqual(Array.from(h.c.stops,x=>x.name),['Two']);
});
test('clearing stops can be undone without discarding subsequently entered stops',()=>{
 const h=routeHarness();h.c.stops=[{name:'One'},{name:'Two'}];h.c.clearStops();h.c.stops.push({name:'New'});h.undo[0].restore();assert.deepEqual(Array.from(h.c.stops,x=>x.name),['One','Two','New']);
});
test('agenda preserves a linked document while the document list is loading',()=>{
 const window={_tripId:'a',I18N:{t:s=>s}},c=vm.createContext({window,escapeHtml:s=>String(s).replaceAll('"','&quot;').replaceAll('<','&lt;')});
 const plan=read('assets/plan-app.js');vm.runInContext(slice(plan,'function itineraryDocumentOptions(','window.refreshItineraryDocumentOptions='),c);
 assert.match(c.itineraryDocumentOptions('saved-id'),/value="saved-id" selected/);
 window._tripDocuments=[{id:'b',tripId:'b',name:'Private other trip'},{id:'saved-id',tripId:'a',name:'<Voucher>'}];const html=c.itineraryDocumentOptions('saved-id');assert.doesNotMatch(html,/Private other trip/);assert.match(html,/&lt;Voucher>/);assert.match(html,/value="saved-id" selected/);
});
test('expense category preference is scoped to user, profile and trip',()=>{
 const ls=storage(),window={TripContext:{assign:()=> 'a'}},c=vm.createContext({currentUser:{uid:'u'},perfilId:'p',localStorage:ls,window,LAST_CAT_KEY:'last'});
 vm.runInContext(slice(read('assets/compras.js'),'function lastExpenseCategoryKey()','\n}',)+ '\n}',c);
 const before=c.lastExpenseCategoryKey();c.currentUser={uid:'other'};assert.notEqual(c.lastExpenseCategoryKey(),before);
});
function reservationHarness(){
 let resolve;const window={_taxflyTripUid:'u',_perfilId:'p',_tripId:'a'},writes=[],undo=[];
 const c=vm.createContext({window,reservations:[{id:'r',name:'Stay',totalPrice:120,documentId:'doc'}],RESERVATIONS_KEY:'r-key',structuredClone,JSON,showConfirm:()=>new Promise(r=>resolve=r),syncedSave:(...args)=>writes.push(args),renderReservations(){},showUndoToast:(_,restore)=>undo.push(restore)});
 vm.runInContext(slice(read('assets/plan-reservations.js'),'async function onReservationAction(','async function saveReservation('),c);
 return {c,window,writes,undo,confirm:()=>resolve(true),remove:()=>c.onReservationAction({currentTarget:{dataset:{resAction:'delete',resId:'r'}}})};
}
test('reservation Undo restores its stable ID, price and linked document',async()=>{
 const h=reservationHarness(),work=h.remove();h.confirm();await work;assert.equal(h.c.reservations.length,0);h.undo[0]();assert.equal(h.c.reservations[0].id,'r');assert.equal(h.c.reservations[0].totalPrice,120);assert.equal(h.c.reservations[0].documentId,'doc');h.undo[0]();assert.equal(h.c.reservations.length,1);
});
test('changing context while a deletion confirmation is open cannot delete in the new context',async()=>{
 const h=reservationHarness(),work=h.remove();h.window._tripId='b';h.confirm();await work;assert.equal(h.writes.length,0);assert.equal(h.c.reservations.length,1);
});
test('Undo batches restore ordered lists in reverse deletion order',()=>{
 const events={},toasts=[],window={addEventListener:(name,cb)=>events[name]=cb,tfToast:(_,opts)=>toasts.push(opts)},c=vm.createContext({window,localStorage:{getItem:()=> 'es'},setTimeout:()=>1,clearTimeout(){},Promise,console});
 vm.runInContext(slice(read('assets/ux.js'),'  var undoBatch = []','  /* ---- Skeletons ---- */'),c);
 const items=['A','B','C'];for(let i=0;i<2;i++){const removed=items.splice(0,1)[0];window.tfDeleteWithUndo({restore:()=>items.splice(0,0,removed)});}toasts.at(-1).onAction();assert.deepEqual(items,['A','B','C']);
});
test('pending reservations override an empty cached snapshot, including pending deletions',async()=>{
 const h=loader({snapshots:{reservations:{exists:()=>false,metadata:{fromCache:true}}}});
 cached(h.ls,[record('reservations','old','Deleted locally')]);h.ls.setItem(travel.planningKey('u','p','a')+'::pending',JSON.stringify({items:[]}));
 const result=await h.window.taxflyTripSearchLoad();assert.equal(result.records.length,0);assert.equal(result.local,true);
});
test('every navigation screen wires search after its dependencies and caches both search assets',()=>{
 for(const file of ['index','tax','compras','planificacion','tickets','mis-cosas','rutas','unidades','grupo','lugares']){
  const html=read(file+'.html');for(const asset of ['trip-context.js','docs-tree.js','travel-core.js','travel-tools.js','trip-search-core.js','trip-search.js'])assert.ok(html.includes('assets/'+asset),file+' missing '+asset);
  assert.ok(html.indexOf('src="assets/trip-search-core.js"')<html.indexOf('src="assets/trip-search.js"'));
 }
 const sw=read('sw.js');assert.ok(sw.includes('"./assets/trip-search-core.js"'));assert.ok(sw.includes('"./assets/trip-search.js"'));
});
test('all new route labels have nonempty Spanish, English and Portuguese versions',()=>{
 const c=vm.createContext({});vm.runInContext(slice(route,'const i18n =','window.changeLanguage')+';globalThis.translations=i18n;',c);
 for(const lang of ['es','en','pt'])for(const key of ['planning_pick','planning_all','planning_none','route_return','route_return_link','route_removed','route_cleared'])assert.ok(c.translations[lang][key],lang+' '+key);
});
