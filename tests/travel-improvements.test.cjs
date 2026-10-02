const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const T=require('../assets/travel-core.js'),Links=require('../assets/document-links.js');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const between=(src,a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m};};
const context=(src,values)=>{const c=vm.createContext(values);vm.runInContext(src,c);return c;};

test('90% alerts are independent for user, profile and trip even with identical spend',()=>{
 const src=read('assets/compras.js'),ls=storage(),alerts=[];
 let trip='one';
 const c=context(between(src,'function budgetAlertKey(kind)','async function requestPushPermission()')+'\n'+between(src,'function checkBudgetAlerts(spent)','async function initPushNotifications()'),{window:{TaxflyTravel:T,TripContext:{view:()=>trip}},currentUser:{uid:'u1'},perfilId:'p1',localStorage:ls,presupuestoBase:100,showLocalBudgetNotification:(...args)=>alerts.push(args)});
 c.checkBudgetAlerts(90);c.checkBudgetAlerts(90);assert.equal(alerts.length,1);
 trip='two';c.checkBudgetAlerts(90);assert.equal(alerts.length,2);
 c.currentUser={uid:'u2'};c.checkBudgetAlerts(90);assert.equal(alerts.length,3);
 c.perfilId='p2';c.checkBudgetAlerts(90);assert.equal(alerts.length,4);
 c.currentUser={uid:'u1'};c.perfilId='p1';trip='one';c.checkBudgetAlerts(90);assert.equal(alerts.length,4);
 assert.equal(ls.m.size,8);
});
test('scope delimiters cannot collide and legacy alert keys are separate',()=>{
 assert.notEqual(T.alertKey('alerted_pct','u::p','x','t'),T.alertKey('alerted_pct','u','p::x','t'));
 assert.notEqual(T.alertKey('alerted_pct','u','p','one'),T.alertKey('alerted_pct','u','p','two'));
});
test('Miami 09:00 observes destination daylight saving, independent of device zone',()=>{
 assert.equal(new Date(T.instant('2026-01-10','09:00','America/New_York')).toISOString(),'2026-01-10T14:00:00.000Z');
 assert.equal(new Date(T.instant('2026-07-10','09:00','America/New_York')).toISOString(),'2026-07-10T13:00:00.000Z');
 assert.equal(new Date(T.instant('2026-07-10','09:00','America/Los_Angeles')).toISOString(),'2026-07-10T16:00:00.000Z');
});
test('invalid destination hours/dates are rejected and repeated DST hour is deterministic',()=>{
 assert.ok(Number.isNaN(T.instant('2026-03-08','02:30','America/New_York')));
 assert.ok(Number.isNaN(T.instant('2026-02-30','09:00','America/New_York')));
 assert.ok(Number.isNaN(T.instant('2026-02-10','24:30','America/New_York')));
 assert.ok(Number.isNaN(T.instant('2026-02-10','09:00','bad/zone')));
 assert.equal(new Date(T.instant('2026-11-01','01:30','America/New_York')).toISOString(),'2026-11-01T05:30:00.000Z');
});
test('flight departure and arrival use different zones and can cross a date boundary',()=>{
 const departure=T.instant('2026-07-10','23:00','America/Los_Angeles'),arrival=T.instant('2026-07-11','07:00','America/New_York');
 assert.equal((arrival-departure)/3600000,5);
});
const trip={id:'a',startDate:'2026-10-01',endDate:'2026-10-10',destinations:[{city:'Miami'}]};
test('daily budget subtracts outstanding commitments without duplicating paid expenses',()=>{
 const expenses=[{id:'pay',tripId:'a',reservationId:'r',valor:200}],reservations=[{id:'r',totalPrice:500}];
 const b=T.budget(1000,250,reservations,expenses,trip,Date.parse('2026-10-05T16:00:00Z'));
 assert.deepEqual(b,{balance:750,pending:300,available:450,days:6,daily:75});
 const paid=T.budget(1000,550,reservations,[{...expenses[0],valor:500}],trip,Date.parse('2026-10-05T16:00:00Z'));
 assert.equal(paid.available,450);assert.equal(paid.pending,0);
});
test('days are inclusive, use destination today, and handle future/ended/missing dates',()=>{
 assert.equal(T.budget(100,0,[],[],trip,Date.parse('2026-10-05T01:00:00Z')).days,7); // Still Oct 4 in Miami
 assert.equal(T.budget(100,0,[],[],trip,Date.parse('2026-09-01T16:00:00Z')).days,10);
 assert.equal(T.budget(100,0,[],[],trip,Date.parse('2026-10-10T16:00:00Z')).days,1);
 assert.equal(T.budget(100,0,[],[],trip,Date.parse('2026-10-11T16:00:00Z')).daily,null);
 assert.equal(T.budget(100,0,[],[],{id:'a'}).days,null);
 assert.equal(T.budget(100,0,[],[],{...trip,startDate:'2026-02-30'}).days,null);
});
test('overspending keeps a negative cash balance but never offers negative daily spending',()=>{
 const b=T.budget(100,120,[{id:'r',totalPrice:50}],[],trip,Date.parse('2026-10-05T16:00:00Z'));
 assert.equal(b.balance,-20);assert.equal(b.available,-70);assert.equal(b.daily,0);
 assert.match(T.budgetText(b),/USD -70.00/);
});
test('unknown booking prices do not invent commitments and another trip payment is excluded',()=>{
 assert.equal(T.outstanding([{id:'r',totalPrice:500},{id:'unknown'}],[{tripId:'b',reservationId:'r',valor:500}],'a'),500);
 assert.equal(T.paid({id:'r'},[{tripId:'a',reservationId:'r',valor:200},{tripId:'a',reservationId:'r2',valor:99}],'a'),200);
});
test('payment id is stable and differs by trip, even for colliding encoded inputs',()=>{
 assert.equal(T.paymentId('a','r'),T.paymentId('a','r'));
 assert.notEqual(T.paymentId('a','r'),T.paymentId('b','r'));
 assert.notEqual(T.paymentId('a/b','c'),T.paymentId('a','b/c'));
 assert.ok(!T.paymentId('a/b','c/d').includes('/'));
});
test('pending payment upserts overlay snapshots rather than adding duplicates',()=>{
 const data={reservationId:'r',tripId:'a',valor:100};
 let expenses=T.overlayExpenses([],[{type:'upsert',id:'fixed',data}]);
 expenses=T.overlayExpenses(expenses,[{type:'upsert',id:'fixed',data:{...data,valor:250}}]);
 assert.equal(expenses.length,1);assert.equal(expenses[0].valor,250);
 assert.equal(T.overlayExpenses(expenses,[{type:'del',id:'fixed'}]).length,0);
});
test('payment sync retains newer queued edits while an older write finishes',async()=>{
 const src=between(read('assets/compras.js'),'let flushingExpenses=false;','window.addEventListener("online"'),ls=storage();
 const op={type:'upsert',id:'fixed',data:{valor:100},ts:1};ls.setItem('q',JSON.stringify([op]));
 let release,writes=[];
 const c=context(src,{currentUser:{uid:'u'},perfilId:'p',pendingGastosKey:()=> 'q',getPendingGastos:()=>JSON.parse(ls.getItem('q')),localStorage:ls,db:{},doc:(_,...p)=>p.join('/'),setDoc:(ref,data)=>{writes.push([ref,data]);return new Promise(r=>release=r)},window:{dispatchEvent(){}},Event:class{},navigator:{onLine:true},console});
 const run=c.flushPendingGastos();await new Promise(r=>setImmediate(r));
 ls.setItem('q',JSON.stringify([op,{...op,data:{valor:250},ts:2}]));release();await run;await new Promise(r=>setImmediate(r));
 assert.equal(writes.length,2);assert.equal(writes[1][1].valor,250);assert.match(writes[0][0],/usuarios\/u\/perfiles\/p\/gastos\/fixed/);
 release();await new Promise(r=>setImmediate(r));assert.deepEqual(JSON.parse(ls.getItem('q')),[]);
});
test('retries update one deterministic document after an uncertain network response',async()=>{
 const src=between(read('assets/compras.js'),'let flushingExpenses=false;','window.addEventListener("online"'),ls=storage(),records=new Map();
 ls.setItem('q',JSON.stringify([{type:'upsert',id:'fixed',data:{valor:100},ts:1}]));let count=0;
 const c=context(src,{currentUser:{uid:'u'},perfilId:'p',pendingGastosKey:()=> 'q',getPendingGastos:()=>JSON.parse(ls.getItem('q')),localStorage:ls,db:{},doc:(_,...p)=>p.join('/'),setDoc:async(ref,data)=>{records.set(ref,data);if(!count++)throw Error('response lost')},window:{dispatchEvent(){}},Event:class{},navigator:{onLine:true},console});
 await c.flushPendingGastos();assert.equal(JSON.parse(ls.getItem('q')).length,1);
 await c.flushPendingGastos();assert.equal(records.size,1);assert.deepEqual(JSON.parse(ls.getItem('q')),[]);
});
test('reservation watches use user/profile/trip paths and keep unsynced reservations',()=>{
 const ls=storage(),values=[],paths=[];global.localStorage=ls;
 ls.setItem(T.planningKey('u','p','a')+'::pending',JSON.stringify({items:[{id:'local',totalPrice:30}]}));
 T.watchReservations({uid:'u',pid:'p',trip:'a',db:{},doc:(_,...p)=>{paths.push(p.join('/'));return {};},onSnapshot:(_,cb)=>{cb({exists:()=>true,data:()=>({items:[{id:'old'}]})});return ()=>{}},onChange:x=>values.push(x)});
 assert.equal(values.at(-1)[0].id,'local');assert.equal(paths[0],'usuarios/u/perfiles/p/tripPlanning/a/data/reservations');
 assert.equal(T.readReservations('other','p','a').length,0);delete global.localStorage;
});
test('explicit document codes outrank generic names and contradicting codes are excluded',()=>{
 const reservations=[{id:'wrong',type:'stay',name:'Miami hotel',reference:'ZZ999',provider:'Hotel Miami',startDate:'2026-10-05'},{id:'right',type:'stay',name:'Hotel Miami',reference:'AB-123',provider:'Hotel Miami',startDate:'2026-10-05'}];
 const suggestions=Links.suggest({name:'voucher',type:'🏨',reference:'AB123',provider:'Hotel Miami',startDate:'2026-10-05'},reservations);
 assert.equal(suggestions.length,1);assert.equal(suggestions[0].reservation.id,'right');assert.ok(suggestions[0].score>=20);
});
test('document provider and dates suggest the correct otherwise anonymous booking',()=>{
 const rs=[{id:'old',type:'stay',name:'Hotel',provider:'Hotel ABC',startDate:'2026-09-01'},{id:'right',type:'stay',name:'Hotel',provider:'Hotel ABC',startDate:'2026-10-01'}];
 const suggestions=Links.suggest({name:'archivo',type:'🏨',provider:'Hotel ABC',startDate:'2026-10-01'},rs);
 assert.equal(suggestions[0].reservation.id,'right');assert.ok(suggestions[0].score>suggestions[1].score);
});
function undoHarness(){
 const timers=new Map(),events={},toasts=[];let next=0;
 const src=between(read('assets/ux.js'),'  var undoBatch = []','  /* ---- Skeletons ---- */');
 const window={tfToast:(msg,o)=>toasts.push(o),addEventListener:(event,cb)=>events[event]=cb};
 context(src,{window,localStorage:{getItem:()=> 'es'},setTimeout:(cb,ms)=>{timers.set(++next,{cb,ms});return next},clearTimeout:id=>timers.delete(id),Promise,console});
 return {window,timers,events,toasts,fire(){for(const [id,t]of [...timers]){timers.delete(id);t.cb();}}};
}
test('Undo restores notes/activities and prevents delayed or pagehide deletion',()=>{
 const h=undoHarness();let removed=0,restored=0,committed=0;
 h.window.tfDeleteWithUndo({remove:()=>removed++,restore:()=>restored++,commit:()=>committed++});
 assert.equal([...h.timers.values()][0].ms,6000);assert.equal(removed,1);
 h.toasts.at(-1).onAction();h.fire();h.events.pagehide();assert.equal(restored,1);assert.equal(committed,0);
});
test('timeout followed by pagehide commits each delete exactly once',()=>{
 const h=undoHarness();let commits=0;
 h.window.tfDeleteWithUndo({commit:()=>commits++});h.fire();h.events.pagehide();assert.equal(commits,1);
});
test('rapid deletions share Undo and restore every item in the six-second batch',()=>{
 const h=undoHarness();let restored=0,committed=0;
 for(let i=0;i<3;i++)h.window.tfDeleteWithUndo({restore:()=>restored++,commit:()=>committed++});
 assert.equal(h.timers.size,1);h.toasts.at(-1).onAction();h.fire();assert.equal(restored,3);assert.equal(committed,0);
});
test('pagehide passes unloading flag and removes the delayed timer',()=>{
 const h=undoHarness();let calls=[];
 h.window.tfDeleteWithUndo({commit:unloading=>calls.push(unloading)});h.events.pagehide();h.fire();h.events.pagehide();assert.deepEqual(calls,[true]);assert.equal(h.timers.size,0);
});

test('Home sorts events by destination instant and labels Miami local time',()=>{
 const els=Object.fromEntries(['ne-title','ne-time','ne-dot'].map(id=>[id,{style:{},textContent:''}]));
 const now=Date.parse('2026-10-05T12:00:00Z'),records=[{name:'Late LA',date:'2026-10-05',time:'08:00',timeZone:'America/Los_Angeles',city:'Los Ángeles',tripId:'a'},{name:'Miami breakfast',date:'2026-10-05',time:'09:00',timeZone:'America/New_York',city:'Miami',tripId:'a'},{name:'Other trip',date:'2026-10-05',time:'08:01',timeZone:'America/New_York',tripId:'b'}];
 const c=context(between(read('assets/index-app.js'),'function loadNextEvent(){','function renderTip()'),{window:{TaxflyTravel:T,TripContext:{view:()=> 'a',readTrips:()=>[trip]}},currentUser:{uid:'u'},perfilId:'p',homeReservations:[],renderUpcoming:()=>{},document:{getElementById:id=>els[id]},query:()=>{},collection:()=>{},orderBy:()=>{},db:{},onSnapshot:(_,cb)=>cb({docs:records.map(e=>({id:e.name,data:()=>e}))}),Date:class extends Date{static now(){return now}},lang:'es',t:{},Intl,tfL3:a=>a});
 c.loadNextEvent();assert.equal(els['ne-title'].textContent,'Miami breakfast');assert.match(els['ne-time'].textContent,/09:00 · hora de Miami/);
});
test('Repeating Registrar pago opens the existing expense instead of rendering another payment',()=>{
 let edits=[];
 const c=context(read('assets/compras.js').slice(read('assets/compras.js').indexOf('function offerReservationPayment(){')),{URLSearchParams,location:{search:'?reservation=r&trip=a'},paymentOpened:false,currentUser:{uid:'u'},perfilId:'p',expenseSnapshotReady:true,financeReservations:[{id:'r',name:'Hotel',totalPrice:500}],allGastos:[{id:'existing',reservationId:'r',tripId:'a',valor:200}],window:{TripContext:{view:()=> 'a'},editGasto:id=>edits.push(id)}});
 c.offerReservationPayment();c.offerReservationPayment();assert.deepEqual(edits,['existing']);
});
test('Planning notes use shared Undo and queue the captured account on unload',async()=>{
 let undo;const ls=storage();
 const src=between(read('assets/plan-places.js'),'const hiddenNotes=new Set();','const t=()=>labels');
 const c=context(src,{window:{tfDeleteWithUndo:o=>{undo=o;o.remove();},addEventListener(){}},notes:[{id:'n',text:'Keep'}],user:{uid:'u1'},profile:'p1',localStorage:ls,navigator:{onLine:false},notesRender(){},Date,doc:()=>{},db:{},deleteDoc:()=>{throw Error('should not write during undo')}});
 c.deletePlanNote({id:'n',text:'Keep'});assert.equal(c.notes.length,0);undo.restore();assert.equal(c.notes.length,1);assert.equal(ls.m.size,0);
 c.deletePlanNote({id:'n',text:'Keep'});c.user={uid:'u2'};c.profile='p2';await undo.commit(true);
 const op=JSON.parse(ls.getItem('taxusa_itin_pending::u1::p1'))[0];assert.equal(op.uid,'u1');assert.equal(op.perfilId,'p1');assert.equal(ls.getItem('taxusa_itin_pending::u2::p2'),null);
});
