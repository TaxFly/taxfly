(function(){
'use strict';
const core=window.TaxflyCare,L=(...x)=>window.tfL3(...x),entries=new Map(),replay=new WeakSet();let pending=null,refreshOpenDialog=null;
function context(){const uid=window._taxflyTripUid||window._uid||localStorage.getItem('taxusa_offline_uid'),profile=window._perfilId||localStorage.getItem('perfilActivoId'),trip=uid&&profile?(window._tripId||window.TripContext?.view(uid,profile)):null;return uid&&profile&&trip?{uid,profile,trip}:null;}
function fields(root){return [...root.querySelectorAll('input,textarea,select')].filter(el=>(el.name||el.id)&&!['file','password','hidden','submit','button'].includes(el.type));}
function snapshot(root){return Object.fromEntries(fields(root).map(el=>[el.name||el.id,['checkbox','radio'].includes(el.type)?!!el.checked:el.value]));}
function restore(root,values){for(const el of fields(root)){const key=el.name||el.id;if(!Object.hasOwn(values,key))continue;if(['checkbox','radio'].includes(el.type))el.checked=!!values[key];else if(typeof values[key]==='string'){
 if(el.tagName==='SELECT'&&values[key]&&![...el.options].some(opt=>opt.value===values[key])){const option=document.createElement('option');option.value=values[key];option.textContent=L('Valor guardado','Saved value','Valor salvo');el.append(option);}
 el.value=values[key];}}
 root.dispatchEvent(new Event('taxfly:draft-restored')); 
}
function currentEntries(){const c=context();return c?[...entries.values()].filter(e=>core.scope(e.context)===core.scope(c)&&e.dirty):[];}
function notify(...words){window.tfToast?.(L(...words));}
function mount(root,{id,onAbandon}){
 const c=context();if(!root||!c)return;const key=core.draftKey(c,id),old=entries.get(key);
 if(old?.root===root)return;
 const initial=snapshot(root),entry={context:c,id,key,root,base:old?.base||JSON.stringify(initial),values:old?.values||initial,dirty:old?.dirty||false,onAbandon};entries.set(key,entry);
 if(entry.dirty)restore(root,entry.values);
 const update=()=>{entry.values=snapshot(root);entry.dirty=JSON.stringify(entry.values)!==entry.base||[...root.querySelectorAll('input[type=file]')].some(el=>el.files?.length);};root.addEventListener('input',update);root.addEventListener('change',update);
 const saved=core.readDraft(localStorage,c,id);
 if(saved&&!entry.dirty){
  const banner=document.createElement('div');banner.className='tf-draft-banner';banner.setAttribute('data-notr','');
  const label=document.createElement('span');const bannerTitle=()=>L('Hay un borrador guardado en este dispositivo. Los archivos adjuntos deberán elegirse de nuevo.','A draft is saved on this device. Attachments must be selected again.','Há um rascunho salvo neste dispositivo. Os anexos precisarão ser selecionados novamente.');label.textContent=bannerTitle();banner.append(label);
  for(const [caption,action] of [[()=>L('Recuperar','Restore','Recuperar'),()=>{restore(root,saved.values);update();}],[()=>L('Descartar','Discard','Descartar'),()=>localStorage.removeItem(key)]]){const b=document.createElement('button');b.type='button';b.textContent=caption();b._tfRefresh=()=>{b.textContent=caption();};b.onclick=()=>{action();banner.remove();};banner.append(b);}
  entry.refreshBanner=()=>{label.textContent=bannerTitle();for(const b of banner.children)b._tfRefresh?.();};
  root.prepend(banner);
 }
}
function complete(root){for(const [key,e]of entries)if(e.root===root){entries.delete(key);try{localStorage.removeItem(key);}catch(_){}}}
function saveAll(list=currentEntries()){return list.map(e=>core.writeDraft(localStorage,e.context,e.id,e.values)).every(Boolean);}
function resolve(){
 const list=currentEntries();if(!list.length)return Promise.resolve(true);if(pending)return pending;
 pending=new Promise(done=>{
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='tf-care-dialog';dialog.setAttribute('data-notr','');dialog.setAttribute('aria-labelledby','tf-draft-title');
  const title=document.createElement('h2');title.id='tf-draft-title';const heading=()=>L('Tenés cambios sin guardar','You have unsaved changes','Há alterações não salvas');title.textContent=heading();
  const body=document.createElement('p');const explanation=()=>L('Podés guardar un borrador en este dispositivo o descartar los cambios. Los archivos adjuntos deberán elegirse de nuevo.','Save a draft on this device or discard your changes. Attachments must be selected again.','Salve um rascunho neste dispositivo ou descarte as alterações. Os anexos precisarão ser selecionados novamente.');body.textContent=explanation();
  const status=document.createElement('p');status.setAttribute('role','status');const actions=document.createElement('div');actions.className='tf-care-actions';dialog.append(title,body,status,actions);
  let finished=false;const finish=value=>{if(finished)return;finished=true;refreshOpenDialog=null;dialog.close();dialog.remove();previous?.focus?.();done(value);};
  for(const [caption,choice] of [[()=>L('Seguir editando','Keep editing','Continuar editando'),'cancel'],[()=>L('Descartar cambios','Discard changes','Descartar alterações'),'discard'],[()=>L('Guardar borrador','Save draft','Salvar rascunho'),'save']]){
   const b=document.createElement('button');b.type='button';b.textContent=caption();b._tfRefresh=()=>{b.textContent=caption();};b.onclick=()=>{
    if(choice==='cancel'){finish(false);return;}
    if(choice==='save'&&!saveAll(list)){status._tfRefresh=()=>{status.textContent=L('No se pudo guardar el borrador. Liberá espacio o seguí editando.','Could not save the draft. Free up space or keep editing.','Não foi possível salvar o rascunho. Libere espaço ou continue editando.');};status._tfRefresh();return;}
    for(const e of list){if(choice==='discard')try{localStorage.removeItem(e.key);}catch(_){}entries.delete(e.key);}
    for(const e of list)e.onAbandon?.();
    finish(true);
   };actions.append(b);
  }
  refreshOpenDialog=()=>{title.textContent=heading();body.textContent=explanation();for(const b of actions.children)b._tfRefresh?.();status._tfRefresh?.();};
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});document.body.append(dialog);dialog.showModal();actions.firstElementChild.focus();
 }).finally(()=>{pending=null;});return pending;
}
window.TaxflyDrafts={mount,complete,resolve,dirty:()=>currentEntries().length>0,context,snapshot};
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const target=event.target.closest?.('a,button,[role=button],[onclick]');if(!target||replay.has(target)||target.closest('.tf-care-dialog,.tf-draft-banner')||!currentEntries().length)return;
 const href=target.getAttribute('href'),handler=target.getAttribute('onclick')||'';
 const navigation=(href&&!href.startsWith('#')&&!target.hasAttribute('download')&&(!target.target||target.target==='_self'))||target.matches('[data-act="profile"],[data-action="select"],[data-action="delete"],[data-action="complete"],[data-action="suspend"],[data-action="restore"]')||/\b(changeProfile|switchSection|switchParquesTab|itinSwitchDay|itinStartEdit|itinStartAdd|itinCancelEdit|itinCancelAdd|itinTogglePend|tripPlanningSelect)\s*\(/.test(handler);
 if(!navigation)return;event.preventDefault();event.stopImmediatePropagation();resolve().then(ok=>{if(ok){replay.add(target);target.click();replay.delete(target);}});
},true);
document.addEventListener('change',event=>{
 const el=event.target;if(!el.matches?.('select[id^="trip-filter"]')||replay.has(el)||!currentEntries().length)return;
 const next=el.value,c=context(),previous=window.TripContext.view(c.uid,c.profile);el.value=previous;event.stopImmediatePropagation();
 resolve().then(ok=>{if(ok&&el.isConnected){el.value=next;replay.add(el);el.dispatchEvent(new Event('change',{bubbles:true}));replay.delete(el);}});
},true);
window.addEventListener('beforeunload',event=>{if(currentEntries().length){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>{saveAll([...entries.values()].filter(e=>e.dirty));});
function refreshLanguage(){for(const entry of entries.values())entry.refreshBanner?.();refreshOpenDialog?.();}
window.I18N?.onChange(refreshLanguage);
window.addEventListener('storage',event=>{if(event.key==='appLang')refreshLanguage();});
document.addEventListener('click',event=>{if(event.target.closest?.('.lang-opt,[data-lang]'))setTimeout(refreshLanguage,0);});
window.mountReservationDraft?.();window.mountAgendaDraft?.();
})();
