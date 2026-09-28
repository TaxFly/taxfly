import {getApps, getApp, initializeApp} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import {getFirestore, doc, collection, getDocs, setDoc, updateDoc, deleteDoc} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import {getAuth, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';

const app=getApps().length ? getApp() : initializeApp(window.TAXFLY_CONFIG.FIREBASE_CONFIG);
const db=getFirestore(app), tc=window.TripContext;
if (!tc) throw new Error('Falta TripContext');
tc.configure({db,doc,collection,getDocs,setDoc,updateDoc,deleteDoc});
let uid=null,profile=null, editing=null;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const styles=document.createElement('style');
styles.textContent=`
.tf-trip-entry{margin:2px 0 14px;padding:7px 2px 11px;border-bottom:1px solid var(--border,#cbd5e1);color:var(--text,#0f172a);display:flex;gap:12px;align-items:center;justify-content:space-between;font:inherit;min-width:0}
.tf-trip-entry .tf-trip-copy{min-width:0}.tf-trip-entry .tf-trip-eyebrow{display:block;color:var(--text-sub,#64748b);font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px}
.tf-trip-entry strong{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tf-trip-entry small{display:block;font-size:11px;color:var(--text-sub,#64748b);margin-top:2px}
.tf-trip-entry button,.tf-trips button{font:inherit;cursor:pointer}.tf-trip-entry button{flex:none;border:0;border-bottom:1px solid currentColor;border-radius:0;padding:5px 0;background:transparent;color:var(--primary,#2563eb);font-size:12px;font-weight:800}
.tf-trip-entry button:hover,.tf-trip-entry button:focus-visible{color:var(--text,#0f172a)}
.tf-trips{position:fixed;inset:0;margin:auto;border:1px solid var(--border,#cbd5e1);border-radius:18px;padding:0;width:min(520px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;background:var(--surface,#fff);color:var(--text,#111827);box-shadow:0 24px 80px #0008;font:inherit;overscroll-behavior:contain}
.tf-trips::backdrop{background:rgba(2,8,23,.68);backdrop-filter:blur(3px)}
.tf-trips .tf-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px 14px;border-bottom:1px solid var(--border,#cbd5e1)}
.tf-trips h2{margin:0;font-size:20px;line-height:1.2}.tf-trips .tf-modal-close{border:0;background:transparent;padding:4px 8px;font-size:24px;line-height:1;color:var(--text-sub,#64748b)}
.tf-trips .tf-modal-content{padding:16px 22px 22px}.tf-trips .tf-line{border:1px solid var(--border,#cbd5e1);border-radius:12px;padding:12px;margin:8px 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tf-trips .tf-line strong{flex:1;min-width:110px;font-size:14px}.tf-trips .tf-line small{font-size:11px;color:var(--text-sub,#64748b)}
.tf-trips button{border:1px solid var(--border,#cbd5e1);background:var(--input-bg,#fff);color:inherit;border-radius:8px;padding:7px 10px;font-size:12px;font-weight:700}.tf-trips button:hover{border-color:var(--primary,#2563eb)}
.tf-trips form{display:grid;gap:12px;margin-top:22px;padding-top:18px;border-top:1px solid var(--border,#cbd5e1)}.tf-trips h3{font-size:16px;margin:0}
.tf-trips input,.tf-trips select{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--border,#cbd5e1);border-radius:9px;background:var(--input-bg,#fff);color:inherit;font:inherit;font-size:13px}
.tf-trips label{font-size:12px;font-weight:700;display:grid;gap:5px}.tf-trips .tf-two{display:flex;gap:8px}.tf-trips .tf-two>*{flex:1;min-width:0}.tf-trips .tf-msg{font-size:12px;color:var(--text-sub,#475569)}.tf-trips .tf-msg:empty{display:none}
.tf-trips #tf-add-city{width:100%}.tf-trips button[type=submit]{background:var(--primary,#2563eb);border-color:var(--primary,#2563eb);color:#fff}
.tf-trips .tf-two label+button{align-self:end;flex:0 0 38px;height:38px;padding:0}
@media(max-width:480px){.tf-trips .tf-modal-head{padding:17px 16px 12px}.tf-trips .tf-modal-content{padding:12px 16px 18px}.tf-trips .tf-line strong{flex-basis:100%}}
`; document.head.appendChild(styles);
const dialog=document.createElement('dialog'); dialog.className='tf-trips'; document.body.appendChild(dialog);
const card=document.createElement('div'); card.className='tf-trip-entry'; card.hidden=true;
const settings=document.querySelector('#settingsDrawer .sx-scroll');
if (settings) settings.insertBefore(card,settings.firstChild);
const home=location.pathname.endsWith('/index.html')||location.pathname.endsWith('/');
if (home) { const top=document.querySelector('header'); if(top) { const c=card.cloneNode(); c.id='tf-trip-home';top.insertAdjacentElement('afterend',c); } }
const words={
 es:{orphan:"Registros sin viaje",activeTrip:"Viaje activo",orphanView:"Viendo registros sin viaje",destination:"Elegí un destino",pending:"pendiente de Firebase",trips:"Mis viajes",openTrips:"Abrir mis viajes",close:"Cerrar viajes",completed:"Finalizado",suspended:"Suspendido",active:"Activo",choose:"Elegir",edit:"Editar",restore:"Restaurar",finish:"Finalizar",suspend:"Suspender",delete:"Eliminar",none:"Sin viaje",see:"Ver registros",editTrip:"Editar viaje",newTrip:"Nuevo viaje",name:"Nombre",from:"Desde",until:"Hasta",addCity:"+ Agregar ciudad",save:"Guardar cambios",create:"Crear viaje",cancel:"Cancelar",city:"Ciudad",state:"Estado",removeCity:"Quitar ciudad",required:"Completá ciudad y estado.",local:"Guardado en este dispositivo; pendiente de sincronización con Firebase.",saved:"Viaje guardado en Firebase.",confirm:"Se eliminará el plan de este viaje. Gastos, actividades y notas quedarán en ‘Sin viaje’. Exportá un respaldo antes de continuar. ¿Eliminar definitivamente?",failed:"No se pudo eliminar. Revisá tu conexión.",changed:"Cambio guardado en Firebase.",changePending:"Cambio pendiente de sincronización."},
 en:{orphan:"Records without a trip",activeTrip:"Active trip",orphanView:"Viewing records without a trip",destination:"Choose a destination",pending:"pending Firebase sync",trips:"My trips",openTrips:"Open my trips",close:"Close trips",completed:"Completed",suspended:"Paused",active:"Active",choose:"Select",edit:"Edit",restore:"Restore",finish:"Finish",suspend:"Pause",delete:"Delete",none:"No trip",see:"View records",editTrip:"Edit trip",newTrip:"New trip",name:"Name",from:"From",until:"Until",addCity:"+ Add city",save:"Save changes",create:"Create trip",cancel:"Cancel",city:"City",state:"State",removeCity:"Remove city",required:"Enter a city and state.",local:"Saved on this device; Firebase sync pending.",saved:"Trip saved to Firebase.",confirm:"This trip plan will be deleted. Expenses, activities and notes will move to No trip. Export a backup before continuing. Delete permanently?",failed:"Could not delete. Check your connection.",changed:"Change saved to Firebase.",changePending:"Change pending sync."},
 pt:{orphan:"Registros sem viagem",activeTrip:"Viagem ativa",orphanView:"Exibindo registros sem viagem",destination:"Escolha um destino",pending:"sincronização pendente",trips:"Minhas viagens",openTrips:"Abrir minhas viagens",close:"Fechar viagens",completed:"Concluída",suspended:"Pausada",active:"Ativa",choose:"Selecionar",edit:"Editar",restore:"Restaurar",finish:"Concluir",suspend:"Pausar",delete:"Excluir",none:"Sem viagem",see:"Ver registros",editTrip:"Editar viagem",newTrip:"Nova viagem",name:"Nome",from:"De",until:"Até",addCity:"+ Adicionar cidade",save:"Salvar alterações",create:"Criar viagem",cancel:"Cancelar",city:"Cidade",state:"Estado",removeCity:"Remover cidade",required:"Informe cidade e estado.",local:"Salvo neste dispositivo; sincronização com Firebase pendente.",saved:"Viagem salva no Firebase.",confirm:"O plano desta viagem será excluído. Gastos, atividades e notas irão para Sem viagem. Exporte um backup antes de continuar. Excluir permanentemente?",failed:"Não foi possível excluir. Verifique sua conexão.",changed:"Alteração salva no Firebase.",changePending:"Alteração aguardando sincronização."}
};
const tr=key=>(words[localStorage.getItem('appLang')]||words.es)[key]||words.es[key];
function activeTrip(){return tc.readTrips(uid,profile).find(t=>t.id===tc.active(uid,profile))||tc.legacy;}
function syncCard(){
  if(!uid||!profile)return;
  const trip=activeTrip(), dest=trip.destinations?.[trip.activeDestination||0];
  for(const el of document.querySelectorAll('.tf-trip-entry')){
    el.hidden=false;el.replaceChildren();
    const label=document.createElement('span'); label.className='tf-trip-copy';
    const eyebrow=document.createElement('span');eyebrow.className='tf-trip-eyebrow';eyebrow.textContent=tc.view(uid,profile)==='unassigned'?tr('orphan'):tr('activeTrip');
    const strong=document.createElement('strong'); strong.textContent=trip.name;
    const small=document.createElement('small');
    const locationLabel=tc.view(uid,profile)==='unassigned'?tr('orphanView'):dest ? `${dest.city}, ${dest.state}` : tr('destination');
    small.textContent=locationLabel+(Object.keys(tc.pending(uid,profile)).length?' · pendiente de Firebase':'');
    label.append(eyebrow,strong,small);
    const btn=document.createElement('button'); btn.type='button';btn.textContent=tr('trips');btn.setAttribute('aria-label',tr('openTrips'));btn.onclick=()=>openManager();
    el.append(label,btn);
  }
}
function notify(message){ const el=dialog.querySelector('.tf-msg');if(el)el.textContent=message; }
function openManager(){ if(!uid||!profile)return;renderDialog();if(!dialog.open)dialog.showModal(); }
function renderDialog(){
  const trips=tc.readTrips(uid,profile), active=tc.active(uid,profile);
  dialog.innerHTML=`<div class="tf-modal-head"><h2>${tr("trips")}</h2><button type="button" class="tf-modal-close" aria-label="${tr("close")}">×</button></div><div class="tf-modal-content"><div class="tf-msg" role="status"></div>
    ${trips.map(t=>`<div class="tf-line" data-id="${esc(t.id)}"><strong>${esc(t.name)}${t.status?' · '+(t.status==='completed'?tr('completed'):tr('suspended')):''}</strong>
    ${t.id===active?`<small>${tr("active")}</small>`:`<button data-action="select">${tr("choose")}</button>`}
    <button data-action="edit">${tr("edit")}</button>
    ${t.status?'<button data-action="restore">${tr("restore")}</button>':`<button data-action="complete">${tr("finish")}</button><button data-action="suspend">${tr("suspend")}</button>`}
    ${t.id==='orlando'?'':`<button data-action="delete">${tr("delete")}</button>`}</div>`).join('')}
    <div class="tf-line" data-id="unassigned"><strong>${tr("none")}</strong><button data-action="select">${tr("see")}</button></div>
    <form id="tf-trip-form"><h3>${editing?tr('editTrip'):tr('newTrip')}</h3>
    <label>${tr("name")}<input name="name" maxlength="80" required value="${esc(editing?.name||'')}"></label>
    <div class="tf-two"><label>${tr("from")}<input name="startDate" type="date" value="${esc(editing?.startDate||'')}"></label><label>${tr("until")}<input name="endDate" type="date" value="${esc(editing?.endDate||'')}"></label></div>
    <div id="tf-cities"></div><button type="button" id="tf-add-city">${tr("addCity")}</button>
    <div class="tf-two"><button type="submit">${editing?tr('save'):tr('create')}</button><button type="button" id="tf-close">${tr("cancel")}</button></div></form></div>`;
  const cities=dialog.querySelector('#tf-cities');
  const addCity=(city='',state='')=>{
    const row=document.createElement('div'); row.className='tf-two';
    row.innerHTML=`<label>${tr("city")}<input name="city" required maxlength="80" placeholder="Orlando" value="${esc(city)}"></label><label>${tr("state")}<input name="state" required maxlength="80" placeholder="Florida" value="${esc(state)}"></label><button type="button" aria-label="${tr("removeCity")}">×</button>`;
    row.querySelector('button').onclick=()=>{if(cities.children.length>1)row.remove()};cities.appendChild(row);
  };
  (editing?.destinations?.length?editing.destinations:[{city:'',state:''}]).forEach(d=>addCity(d.city,d.state));
  dialog.querySelector('#tf-add-city').onclick=()=>addCity();
  dialog.querySelector('.tf-modal-close').onclick=()=>{editing=null;dialog.close()};
  dialog.querySelector('#tf-close').onclick=()=>{editing=null;dialog.close()};
  dialog.querySelector('#tf-trip-form').onsubmit=async e=>{
    e.preventDefault();const form=e.target, button=form.querySelector('[type=submit]');button.disabled=true;
    const names=[...form.querySelectorAll('[name=city]')],states=[...form.querySelectorAll('[name=state]')];
    const destinations=names.map((n,i)=>({city:n.value.trim(),state:states[i].value.trim()}));
    if(destinations.some(d=>!d.city||!d.state)){notify(tr('required'));button.disabled=false;return}
    const fields={name:form.elements.name.value.trim(),startDate:form.elements.startDate.value,endDate:form.elements.endDate.value,destinations};
    if(!fields.name){button.disabled=false;return}
    const result=editing ? await tc.save(uid,profile,{...editing,...fields}) : await tc.create(uid,profile,fields);
    editing=null;renderDialog();syncCard();
    notify(result===false||result?.synced===false?tr('local'):tr('saved'));
    if(result?.trip) location.reload();
  };
  dialog.querySelectorAll('[data-action]').forEach(b=>b.onclick=async()=>{
    const id=b.closest('[data-id]').dataset.id, action=b.dataset.action;
    if(action==='select'){tc.select(uid,profile,id);location.reload();return}
    if(action==='edit'){editing=tc.readTrips(uid,profile).find(t=>t.id===id);renderDialog();return}
    if(action==='delete'){
      if(!confirm(tr('confirm')))return;
      if(!await tc.remove(uid,profile,id)){notify(tr('failed'));return}
      location.reload();return;
    }
    const status=action==='restore'?'':action==='complete'?'completed':'suspended';
    const ok=await tc.archive(uid,profile,id,status);
    renderDialog();syncCard();notify(ok?tr('changed'):tr('changePending'));
  });
}
window.taxflyOpenTrips=openManager;
window.taxflyRefreshTrips=()=>{syncCard();if(dialog.open)renderDialog()};
document.addEventListener('click',e=>{if(e.target.closest('.lang-opt,[data-lang]'))setTimeout(window.taxflyRefreshTrips,0)});
let openFromHash=location.hash==="#viajes";
window.addEventListener('taxfly:tripchange',syncCard);
window.addEventListener('storage',e=>{if(e.key==='appLang'){syncCard();if(dialog.open)renderDialog()}});
window.addEventListener('storage',e=>{
  if(uid&&profile&&[tc.keys(uid,profile).active,tc.keys(uid,profile).list].includes(e.key))location.reload();
});
onAuthStateChanged(getAuth(app),user=>{
  if(!user)return;uid=user.uid;profile=localStorage.getItem('perfilActivoId');if(!profile)return;
  window._taxflyTripUid=uid;window._taxflyTripProfile=profile;
  tc.hydrate(db,uid,profile,getDocs,collection,()=>{syncCard();if(dialog.open)renderDialog()}).then(()=>{
    if(openFromHash){openFromHash=false;openManager()}
  });
});
