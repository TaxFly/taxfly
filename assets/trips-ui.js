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
.tf-trip-entry{margin:12px 0;padding:11px 13px;border:1px solid var(--border,#cbd5e1);border-radius:14px;background:var(--surface,#fff);color:var(--text,#0f172a);display:flex;gap:12px;align-items:center;justify-content:space-between;font:inherit}
.tf-trip-entry strong{display:block;font-size:13px}.tf-trip-entry small{font-size:11px;opacity:.75}
.tf-trip-entry button,.tf-trips button{font:inherit;cursor:pointer}.tf-trip-entry button{border:1px solid var(--border,#94a3b8);border-radius:9px;padding:8px;background:var(--input-bg,#fff);color:inherit}
.tf-trips{border:0;border-radius:18px;padding:20px;width:min(500px,calc(100% - 24px));max-height:90vh;overflow:auto;background:var(--surface,#fff);color:var(--text,#111827);box-shadow:0 18px 60px #0008;font:inherit}
.tf-trips::backdrop{background:#0009}.tf-trips h2{margin:0 0 14px}.tf-trips .tf-line{border:1px solid var(--border,#cbd5e1);border-radius:10px;padding:10px;margin:7px 0;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.tf-trips .tf-line strong{flex:1;min-width:130px}.tf-trips button{border:1px solid var(--border,#cbd5e1);background:var(--input-bg,#fff);color:inherit;border-radius:8px;padding:6px 9px}
.tf-trips form{display:grid;gap:9px;margin-top:15px}.tf-trips input,.tf-trips select{width:100%;box-sizing:border-box;padding:9px;border:1px solid var(--border,#cbd5e1);border-radius:8px;background:var(--input-bg,#fff);color:inherit;font:inherit}
.tf-trips label{font-size:12px;font-weight:700}.tf-trips .tf-two{display:flex;gap:8px}.tf-trips .tf-two>*{flex:1;min-width:0}.tf-trips .tf-msg{font-size:12px;min-height:18px;color:var(--text-sub,#475569)}
`; document.head.appendChild(styles);
const dialog=document.createElement('dialog'); dialog.className='tf-trips'; document.body.appendChild(dialog);
const card=document.createElement('div'); card.className='tf-trip-entry'; card.hidden=true;
const settings=document.querySelector('#settingsDrawer .sx-scroll');
if (settings) settings.insertBefore(card,settings.firstChild);
const home=location.pathname.endsWith('/index.html')||location.pathname.endsWith('/');
if (home) { const top=document.querySelector('header'); if(top) { const c=card.cloneNode(); c.id='tf-trip-home';top.insertAdjacentElement('afterend',c); } }
function activeTrip(){return tc.readTrips(uid,profile).find(t=>t.id===tc.active(uid,profile))||tc.legacy;}
function syncCard(){
  if(!uid||!profile)return;
  const trip=activeTrip(), dest=trip.destinations?.[trip.activeDestination||0];
  for(const el of document.querySelectorAll('.tf-trip-entry')){
    el.hidden=false;el.replaceChildren();
    const label=document.createElement('span');
    const strong=document.createElement('strong'); strong.textContent='✈️ '+trip.name;
    const small=document.createElement('small');
    const locationLabel=tc.view(uid,profile)==='unassigned'?'Viendo registros sin viaje':dest ? `${dest.city}, ${dest.state}` : 'Elegí un destino';
    small.textContent=locationLabel+(Object.keys(tc.pending(uid,profile)).length?' · pendiente de Firebase':'');
    label.append(strong,small);
    const btn=document.createElement('button'); btn.type='button';btn.textContent='Viajes';btn.onclick=()=>openManager();
    el.append(label,btn);
  }
}
function notify(message){ const el=dialog.querySelector('.tf-msg');if(el)el.textContent=message; }
function openManager(){ if(!uid||!profile)return;renderDialog();dialog.showModal(); }
function renderDialog(){
  const trips=tc.readTrips(uid,profile), active=tc.active(uid,profile);
  dialog.innerHTML=`<h2>Viajes de TaxFly</h2><div class="tf-msg" role="status"></div>
    ${trips.map(t=>`<div class="tf-line" data-id="${esc(t.id)}"><strong>${esc(t.name)}${t.status?' · '+(t.status==='completed'?'Finalizado':'Suspendido'):''}</strong>
    ${t.id===active?'<small>Activo</small>':`<button data-action="select">Elegir</button>`}
    <button data-action="edit">Editar</button>
    ${t.status?'<button data-action="restore">Restaurar</button>':`<button data-action="complete">Finalizar</button><button data-action="suspend">Suspender</button>`}
    ${t.id==='orlando'?'':`<button data-action="delete">Eliminar</button>`}</div>`).join('')}
    <div class="tf-line" data-id="unassigned"><strong>Sin viaje</strong><button data-action="select">Ver registros</button></div>
    <form id="tf-trip-form"><h3>${editing?'Editar viaje':'Nuevo viaje'}</h3>
    <label>Nombre<input name="name" maxlength="80" required value="${esc(editing?.name||'')}"></label>
    <div class="tf-two"><label>Desde<input name="startDate" type="date" value="${esc(editing?.startDate||'')}"></label><label>Hasta<input name="endDate" type="date" value="${esc(editing?.endDate||'')}"></label></div>
    <div id="tf-cities"></div><button type="button" id="tf-add-city">+ Agregar ciudad</button>
    <div class="tf-two"><button type="submit">${editing?'Guardar cambios':'Crear viaje'}</button><button type="button" id="tf-close">Cerrar</button></div></form>`;
  const cities=dialog.querySelector('#tf-cities');
  const addCity=(city='',state='')=>{
    const row=document.createElement('div'); row.className='tf-two';
    row.innerHTML=`<label>Ciudad<input name="city" required maxlength="80" placeholder="Orlando" value="${esc(city)}"></label><label>Estado<input name="state" required maxlength="80" placeholder="Florida" value="${esc(state)}"></label><button type="button" aria-label="Quitar ciudad">×</button>`;
    row.querySelector('button').onclick=()=>{if(cities.children.length>1)row.remove()};cities.appendChild(row);
  };
  (editing?.destinations?.length?editing.destinations:[{city:'',state:''}]).forEach(d=>addCity(d.city,d.state));
  dialog.querySelector('#tf-add-city').onclick=()=>addCity();
  dialog.querySelector('#tf-close').onclick=()=>{editing=null;dialog.close()};
  dialog.querySelector('#tf-trip-form').onsubmit=async e=>{
    e.preventDefault();const form=e.target, button=form.querySelector('[type=submit]');button.disabled=true;
    const names=[...form.querySelectorAll('[name=city]')],states=[...form.querySelectorAll('[name=state]')];
    const destinations=names.map((n,i)=>({city:n.value.trim(),state:states[i].value.trim()}));
    if(destinations.some(d=>!d.city||!d.state)){notify('Completá ciudad y estado.');button.disabled=false;return}
    const fields={name:form.elements.name.value.trim(),startDate:form.elements.startDate.value,endDate:form.elements.endDate.value,destinations};
    if(!fields.name){button.disabled=false;return}
    const result=editing ? await tc.save(uid,profile,{...editing,...fields}) : await tc.create(uid,profile,fields);
    editing=null;renderDialog();syncCard();
    notify(result===false||result?.synced===false?'Guardado en este dispositivo; pendiente de sincronización con Firebase.':'Viaje guardado en Firebase.');
    if(result?.trip) location.reload();
  };
  dialog.querySelectorAll('[data-action]').forEach(b=>b.onclick=async()=>{
    const id=b.closest('[data-id]').dataset.id, action=b.dataset.action;
    if(action==='select'){tc.select(uid,profile,id);location.reload();return}
    if(action==='edit'){editing=tc.readTrips(uid,profile).find(t=>t.id===id);renderDialog();return}
    if(action==='delete'){
      if(!confirm('Se eliminará el plan de este viaje. Gastos, actividades y notas quedarán en “Sin viaje”. Exportá un respaldo antes de continuar. ¿Eliminar definitivamente?'))return;
      if(!await tc.remove(uid,profile,id)){notify('No se pudo eliminar. Revisá tu conexión.');return}
      location.reload();return;
    }
    const status=action==='restore'?'':action==='complete'?'completed':'suspended';
    const ok=await tc.archive(uid,profile,id,status);
    renderDialog();syncCard();notify(ok?'Cambio guardado en Firebase.':'Cambio pendiente de sincronización.');
  });
}
window.taxflyOpenTrips=openManager;
let openFromHash=location.hash==="#viajes";
window.addEventListener('taxfly:tripchange',syncCard);
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
