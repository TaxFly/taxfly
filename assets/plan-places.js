import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import {collection,query,orderBy,onSnapshot,addDoc,deleteDoc,doc} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
const db=await new Promise(resolve=>{if(window.taxflyPlanDb)return resolve(window.taxflyPlanDb);window.addEventListener('taxfly:plan-db',()=>resolve(window.taxflyPlanDb),{once:true})});
const cities={orlando:'Orlando',nyc:'Nueva York',miami:'Miami',vegas:'Las Vegas',la:'Los Ángeles',sf:'San Francisco',chicago:'Chicago',dc:'Washington D.C.'};
const landmarks={nyc:['Times Square','Central Park','Brooklyn Bridge','The Met'],miami:['South Beach','Wynwood','Brickell'],vegas:['The Strip','Fremont Street','Bellagio'],la:['Hollywood','Santa Monica','Griffith Park'],sf:['Golden Gate Bridge','Alcatraz'],chicago:['Millennium Park','Navy Pier'],dc:['National Mall','Smithsonian museums']};
const labels={es:{places:'Lugares del viaje',notes:'Notas del viaje',placeholder:'Escribí una nota para este viaje…',add:'Agregar nota',empty:'Todavía no hay notas para este viaje.',loading:'Consultando esperas…',unavailable:'Esperas no disponibles',closed:'Cerrado',low:'Bajo',medium:'Medio',high:'Alto',delete:'Eliminar nota',error:'No se pudo guardar. Intentá de nuevo.'},en:{places:'Trip places',notes:'Trip notes',placeholder:'Write a note for this trip…',add:'Add note',empty:'No notes for this trip yet.',loading:'Checking waits…',unavailable:'Waits unavailable',closed:'Closed',low:'Low',medium:'Moderate',high:'High',delete:'Delete note',error:'Could not save. Try again.'},pt:{places:'Lugares da viagem',notes:'Notas da viagem',placeholder:'Escreva uma nota para esta viagem…',add:'Adicionar nota',empty:'Ainda não há notas para esta viagem.',loading:'Consultando filas…',unavailable:'Filas indisponíveis',closed:'Fechado',low:'Baixo',medium:'Médio',high:'Alto',delete:'Excluir nota',error:'Não foi possível salvar. Tente novamente.'}};
let user=null,profile=null,notes=[],city='orlando',parksRequest=0,unsubscribe=null;
const hiddenNotes=new Set();
const noteQueueKey=(uid,pid)=>'taxusa_itin_pending::'+uid+'::'+pid;
function pendingNotes(uid,pid){try{return JSON.parse(localStorage.getItem(noteQueueKey(uid,pid))||'[]').filter(o=>o.type==='del_note'&&o.uid===uid&&o.perfilId===pid);}catch(_){return [];}}
async function flushNoteDeletes(){
 const uid=user?.uid,pid=profile;if(!uid||!pid||!navigator.onLine)return;
 for(const op of pendingNotes(uid,pid))try{
  await deleteDoc(doc(db,'usuarios',uid,'perfiles',pid,'notas',op.id));
  const key=noteQueueKey(uid,pid),latest=JSON.parse(localStorage.getItem(key)||'[]'),idx=latest.findIndex(o=>JSON.stringify(o)===JSON.stringify(op));if(idx>=0){latest.splice(idx,1);localStorage.setItem(key,JSON.stringify(latest));}
 }catch(_){}
}
function deletePlanNote(n){
 const uid=user?.uid,pid=profile,idx=notes.findIndex(x=>x.id===n.id);if(!uid||!pid)return;
 window.tfDeleteWithUndo({
  remove:()=>{hiddenNotes.add(n.id);notes=notes.filter(x=>x.id!==n.id);notesRender();},
  restore:()=>{hiddenNotes.delete(n.id);if(user?.uid===uid&&profile===pid&&!notes.some(x=>x.id===n.id)){notes.splice(Math.max(0,idx),0,n);notesRender();}},
  commit:async unloading=>{
   const key=noteQueueKey(uid,pid),ops=JSON.parse(localStorage.getItem(key)||'[]');ops.push({type:'del_note',id:n.id,uid,perfilId:pid,ts:Date.now()});localStorage.setItem(key,JSON.stringify(ops));
   if(!unloading&&user?.uid===uid&&profile===pid)await flushNoteDeletes();hiddenNotes.delete(n.id);
  }
 });
}
window.addEventListener('online',flushNoteDeletes);
const t=()=>labels[localStorage.getItem('appLang')]||labels.es;
function tripId(){return window.TripContext?.view(user?.uid,profile)||window._tripId||'orlando'}
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function notesRender(){const box=document.getElementById('plan-notes-list');if(!box)return;box.replaceChildren();const deleted=new Set(pendingNotes(user?.uid,profile).map(o=>o.id));const items=notes.filter(n=>!hiddenNotes.has(n.id)&&!deleted.has(n.id)&&(n.tripId||'unassigned')===tripId());if(!items.length){box.append(el('p','plan-muted',t().empty));return}for(const n of items){const row=el('div','plan-note-item'),body=el('div',''),txt=el('p','',n.text),date=el('small','',new Date(n.createdAt||Date.now()).toLocaleDateString(localStorage.getItem('appLang')==='en'?'en-US':'es-AR'));body.append(txt,date);const btn=el('button','', '×');btn.type='button';btn.setAttribute('aria-label',t().delete);btn.onclick=()=>deletePlanNote(n);row.append(body,btn);box.append(row)}}
async function parksRender(){const box=document.getElementById('plan-places-parks');if(!box)return;const request=++parksRequest;box.replaceChildren();for(const name of landmarks[city]||[])box.append(el('div','plan-place-card',name));if(!window.ParkLive?.CITY_DESTINATIONS[city])return;const loading=el('p','plan-muted',t().loading);box.append(loading);try{const parks=await ParkLive.parksForCity(city);if(request!==parksRequest||!box.isConnected)return;loading.remove();for(const park of parks){const card=el('div','plan-place-card'),name=el('strong','',park.name),status=el('span','plan-place-status',t().loading);card.append(name,status);box.append(card);ParkLive.parkSummary(park).then(result=>{if(request!==parksRequest||!card.isConnected)return;status.className='plan-place-status '+(result.level||'unknown');status.textContent=result.level?t()[result.level]:t().unavailable}).catch(()=>status.textContent=t().unavailable)}}catch(_){if(request===parksRequest)loading.textContent=t().unavailable}}
function render(){const root=document.getElementById('plan-places-root');if(!root)return;root.replaceChildren();const placeCard=el('section','plan-places-card'),title=el('h2','',t().places),selector=el('select','');selector.setAttribute('aria-label',t().places);for(const [key,value] of Object.entries(cities)){const option=el('option','',value);option.value=key;selector.append(option)}selector.value=city;selector.onchange=()=>{city=selector.value;parksRender()};const parks=el('div','plan-places-grid');parks.id='plan-places-parks';const attribution=el('p','plan-muted');attribution.innerHTML='<a href="https://themeparks.wiki/" target="_blank" rel="noopener noreferrer">Powered by ThemeParks.wiki</a> · <a href="https://queue-times.com/" target="_blank" rel="noopener noreferrer">Powered by Queue-Times.com</a>';placeCard.append(title,selector,parks,attribution);
 const noteCard=el('section','plan-places-card'),noteTitle=el('h2','',t().notes),field=el('textarea','');field.rows=3;field.placeholder=t().placeholder;field.setAttribute('aria-label',t().notes);const add=el('button','plan-note-add',t().add);add.type='button';add.onclick=async()=>{const value=field.value.trim();if(!value||!user||!profile)return;add.disabled=true;try{await addDoc(collection(db,'usuarios',user.uid,'perfiles',profile,'notas'),{text:value,tripId:window.TripContext.assign(user.uid,profile),createdAt:Date.now()});field.value=''}catch(_){error.textContent=t().error}finally{add.disabled=false}};const error=el('p','plan-muted'),list=el('div','');list.id='plan-notes-list';noteCard.append(noteTitle,field,add,error,list);root.append(placeCard,noteCard);parksRender();notesRender()}
window.renderPlanPlaces=render;
onAuthStateChanged(getAuth(),u=>{user=u;profile=localStorage.getItem('perfilActivoId');if(unsubscribe){unsubscribe();unsubscribe=null}if(!user||!profile)return;flushNoteDeletes();unsubscribe=onSnapshot(query(collection(db,'usuarios',user.uid,'perfiles',profile,'notas'),orderBy('createdAt','desc')),snap=>{notes=snap.docs.map(d=>({id:d.id,...d.data()}));notesRender()})});
window.addEventListener('storage',e=>{if(e.key==='appLang'&&document.getElementById('panel-lugares')?.classList.contains('active'))render()});

if(document.getElementById("panel-lugares")?.classList.contains("active"))render();
