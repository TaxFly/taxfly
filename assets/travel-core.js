/* Fechas locales del destino y saldos de viaje, sin depender de la hora del dispositivo. */
(function(root){
'use strict';
const cities = {'Miami':'America/New_York','Orlando':'America/New_York','Nueva York':'America/New_York','New York':'America/New_York','Washington D.C.':'America/New_York','Washington':'America/New_York','Boston':'America/New_York','Chicago':'America/Chicago','Dallas':'America/Chicago','Houston':'America/Chicago','Los Ángeles':'America/Los_Angeles','Los Angeles':'America/Los_Angeles','Las Vegas':'America/Los_Angeles','San Francisco':'America/Los_Angeles','Seattle':'America/Los_Angeles','Denver':'America/Denver','Phoenix':'America/Phoenix','Honolulu':'Pacific/Honolulu','Anchorage':'America/Anchorage','Buenos Aires':'America/Argentina/Buenos_Aires','Madrid':'Europe/Madrid','Londres':'Europe/London','UTC':'UTC'};
const scope=(uid,profile,trip)=>[uid,profile,trip].map(x=>encodeURIComponent(String(x||''))).join('::');
const alertKey=(kind,uid,profile,trip)=>'taxusa_budget_'+kind+'::'+scope(uid,profile,trip);
const paymentId=(trip,reservation)=>'reservation_'+[trip,reservation].map(x=>Array.from(String(x)).map(c=>c.codePointAt(0).toString(16)).join('-')).join('_');
function validZone(zone){try{new Intl.DateTimeFormat('en',{timeZone:zone}).format();return !!zone;}catch(_){return false;}}
function destination(trip){const d=trip?.destinations?.[trip.activeDestination||0]||{};const city=d.city||trip?.destination||'Orlando';return {city,timeZone:validZone(d.timeZone)?d.timeZone:validZone(trip?.timeZone)?trip.timeZone:cities[city]||'America/New_York'};}
function parts(ms,zone){return Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(ms).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));}
function localDate(ms,zone){const p=parts(ms,zone);return p.year+'-'+p.month+'-'+p.day;}
function instant(date,time,zone){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^\d{2}:\d{2}$/.test(time||'')||!validZone(zone))return NaN;
 const target=Date.parse(date+'T'+time+':00Z');if(!Number.isFinite(target)||new Date(target).toISOString().slice(0,16)!==date+'T'+time)return NaN;
 // Find possible offsets on both sides of daylight-saving transitions. Ambiguous hours use the first occurrence.
 const offsets=new Set([-36,-12,0,12,36].map(h=>{const t=target+h*3600000,p=parts(t,zone);return Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00Z`)-t;}));
 const matches=[...offsets].map(o=>target-o).filter(ms=>{const p=parts(ms,zone);return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`===date+'T'+time;});
 return matches.length?Math.min(...matches):NaN;
}
function zoneFields(prefix,city,zone){const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const zones=[...new Set([...Object.values(cities),...(Intl.supportedValuesOf?Intl.supportedValuesOf("timeZone"):[]),zone])].filter(validZone);return `<label>Ciudad / aeropuerto<input name="${prefix}City" value="${esc(city)}" maxlength="80" placeholder="Ej.: Miami"></label><label>Zona horaria<select name="${prefix}Zone">${zones.map(z=>`<option value="${esc(z)}"${z===zone?' selected':''}>${esc(z)}</option>`).join('')}</select><small>El horario corresponde a esta zona. En cambios de hora, una hora repetida usa la primera ocurrencia.</small></label>`;}
function paid(reservation,expenses,trip){return (expenses||[]).filter(g=>g.reservationId===reservation.id&&(g.tripId||'unassigned')===trip).reduce((s,g)=>s+Math.max(0,Number(g.valor)||0),0);}
function outstanding(reservations,expenses,trip){return (reservations||[]).reduce((s,r)=>s+Math.max(0,(Number(r.totalPrice)||0)-paid(r,expenses,trip)),0);}
function budget(base,spent,reservations,expenses,trip,now=Date.now()){
 const balance=Number(base)-Number(spent),pending=outstanding(reservations,expenses,trip?.id),available=balance-pending;
 const zone=destination(trip).timeZone,today=localDate(now,zone),start=trip?.startDate,end=trip?.endDate;
 const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
 let days=null;if(validDate(start)&&validDate(end)&&end>=start)days=Math.max(0,Math.round((Date.parse(end+'T00:00:00Z')-Date.parse((today>start?today:start)+'T00:00:00Z'))/86400000)+1);
 return {balance,pending,available,days,daily:days>0?Math.max(0,available)/days:null};
}
function budgetText(b){const l=root.tfL3||((es)=>es),money=x=>'USD '+x.toFixed(2);return [l('Pendiente de reservas: ','Bookings outstanding: ','Reservas pendentes: ')+money(b.pending),l('Disponible diario: ','Daily available: ','Disponível por dia: ')+(b.daily===null?(b.days===0?l('viaje finalizado','trip ended','viagem encerrada'):l('completá las fechas del viaje','set trip dates','complete as datas da viagem')):money(b.daily)+l(' · ',' · ',' · ')+b.days+l(' días restantes',' days remaining',' dias restantes'))].join('\n');}
const reservationKey=(uid,pid,trip)=>'taxfly-reservations::'+scope(uid,pid,trip);
function readReservations(uid,pid,trip){try{return JSON.parse(localStorage.getItem(reservationKey(uid,pid,trip))||'[]');}catch(_){return [];}}
function writeReservations(uid,pid,trip,items){try{localStorage.setItem(reservationKey(uid,pid,trip),JSON.stringify(items));}catch(_){}}
function planningKey(uid,pid,trip){return 'trip-reservations-v1::'+pid+(trip==='orlando'?'':'::'+trip)+'::'+uid;}
function watchReservations({uid,pid,trip,db,doc,onSnapshot,onChange}){
 onChange(readReservations(uid,pid,trip));if(['all','unassigned'].includes(trip))return ()=>{};
 const path=['usuarios',uid,'perfiles',pid,...(trip==='orlando'?['orlando','reservations']:['tripPlanning',trip,'data','reservations'])];
 return onSnapshot(doc(db,...path),snap=>{let items=snap.exists()?snap.data().items||[]:[];try{const p=localStorage.getItem(planningKey(uid,pid,trip)+'::pending');if(p)items=JSON.parse(p).items||[];}catch(_){}writeReservations(uid,pid,trip,items);onChange(items);},()=>{});
}
function overlayExpenses(expenses,ops){const map=new Map((expenses||[]).map(g=>[g.id,g]));for(const op of ops||[]){if(op.type==='upsert')map.set(op.id,{...map.get(op.id),...op.data,id:op.id,_pending:true});else if(op.type==='upd'&&map.has(op.id))map.set(op.id,{...map.get(op.id),...op.data});else if(op.type==='del')map.delete(op.id);}return [...map.values()];}
const api={cities,scope,alertKey,paymentId,validZone,destination,instant,localDate,zoneFields,paid,outstanding,budget,budgetText,readReservations,writeReservations,planningKey,watchReservations,overlayExpenses};root.TaxflyTravel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
