(function(){
'use strict';
const core=window.TaxflyCare,L=(...words)=>window.tfL3(...words),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context=()=>window.TaxflyDrafts?.context();
window.reservationReminderFields=item=>{
 const r=item?.reminder||{},option=(value,label)=>`<option value="${value}"${String(r.kind||'off')===value?' selected':''}>${escape(label)}</option>`;
 return `<fieldset class="tf-reminder-fields" data-notr><legend>${L('Recordatorio opcional','Optional reminder','Lembrete opcional')}</legend><label>${L('Aviso','Reminder','Aviso')}<select name="reminderKind">${option('off',L('Desactivado','Off','Desativado'))}${option('event',L('Horario importante','Important time','Horário importante'))}${option('checkin',L('Check-in','Check-in','Check-in'))}${option('expiry',L('Vencimiento','Expiry','Vencimento'))}</select></label><div class="reservation-form-dates"><label>${L('Fecha de referencia','Reference date','Data de referência')}<input name="reminderDate" type="date" value="${escape(r.date||'')}"></label><label>${L('Hora en la zona elegida arriba','Time in the zone selected above','Hora no fuso selecionado acima')}<input name="reminderTime" type="time" value="${escape(r.time||'')}"></label></div><label>${L('Anticipación','Lead time','Antecedência')}<select name="reminderLead">${[[0,L('A esa hora','At that time','Nesse horário')],[60,L('Una hora antes','One hour before','Uma hora antes')],[1440,L('Un día antes','One day before','Um dia antes')]].map(([value,label])=>`<option value="${value}"${Number(r.lead||0)===value?' selected':''}>${label}</option>`).join('')}</select></label><small>${L('La anticipación se resta a la fecha y hora elegidas.','The lead time is subtracted from the selected date and time.','A antecedência é subtraída da data e hora selecionadas.')} ${L('Avisos en este dispositivo con TaxFly abierta. Para usar las alarmas de tu calendario, exportá el recordatorio después de guardar e importalo allí.','Alerts on this device while TaxFly is open. To use your calendar alarms, export the reminder after saving and import it there.','Avisos neste dispositivo enquanto o TaxFly estiver aberto. Para usar os alarmes do calendário, exporte o lembrete após salvar e importe-o lá.')}</small></fieldset>`;
};
window.applyReservationReminderForm=form=>{
 const kind=form.elements.reminderKind;if(!kind)return;
 const update=fill=>{
  const off=kind.value==='off';for(const name of ['reminderDate','reminderTime','reminderLead'])form.elements[name].disabled=off;
  if(!off&&fill){form.elements.reminderDate.value=(kind.value==='expiry'?form.elements.endDate.value:'')||form.elements.startDate.value;form.elements.reminderTime.value=form.elements.departureTime.value||'09:00';form.elements.reminderLead.value=kind.value==='checkin'?'1440':'0';}
 };form._tfReminderAbort?.abort();form._tfReminderAbort=new AbortController();const options={signal:form._tfReminderAbort.signal};kind.addEventListener('change',()=>update(true),options);form.addEventListener('taxfly:draft-restored',()=>update(false),options);update(false);
};

function refreshReminderFormLanguage(){
 const form=document.getElementById('reservation-form'),old=form?.querySelector('.tf-reminder-fields');if(!old)return;
 const value=name=>form.elements[name]?.value||'';
 const reminder={kind:value('reminderKind'),date:value('reminderDate'),time:value('reminderTime'),lead:Number(value('reminderLead'))};
 const focus=form.contains(document.activeElement)?document.activeElement.name:null;
 const template=document.createElement('template');template.innerHTML=window.reservationReminderFields({reminder});old.replaceWith(template.content.firstElementChild);
 window.applyReservationReminderForm(form);if(focus)form.elements[focus]?.focus();
}
window.taxflyReadReservationReminder=values=>{
 if(!values.reminderKind||values.reminderKind==='off')return null;
 const reminder={kind:values.reminderKind,date:values.reminderDate,time:values.reminderTime,lead:Number(values.reminderLead),zone:values.departureZone};
 return core.reminderEvent({reminder},window.TaxflyTravel.instant)?reminder:false;
};
window.reservationReminderSummary=item=>{
 const e=core.reminderEvent(item,window.TaxflyTravel.instant);if(!e)return '';
 const kind={event:L('Horario importante','Important time','Horário importante'),checkin:'Check-in',expiry:L('Vencimiento','Expiry','Vencimento')}[e.kind];
 const when=new Intl.DateTimeFormat(localStorage.getItem('appLang')||'es',{dateStyle:'medium',timeStyle:'short',timeZone:item.reminder.zone}).format(new Date(e.due));
 return `<div class="reservation-meta" data-notr>${escape(kind+' · '+when+' · '+item.reminder.zone)}</div>`;
};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
window.taxflyExportReminder=item=>{const data=core.calendar(item,window.TaxflyTravel.instant);if(data)download(new Blob([data],{type:'text/calendar;charset=utf-8'}),'taxfly-recordatorio.ics');};
let root;
const diagnosticEnabled=()=>{try{return localStorage.getItem('taxfly-diagnostic-enabled')==='1';}catch(_){return false;}};
function readLog(){try{
 const now=Date.now(),raw=localStorage.getItem('taxfly-diagnostic-log')||'[]';
 const rows=JSON.parse(raw).map(row=>core.diagnostic(row.kind,row.page,row.ms,row.at)).filter(row=>row&&row.at<=now&&row.at>now-7*86400000).slice(-100);
 const clean=JSON.stringify(rows);if(raw!==clean)try{localStorage.setItem('taxfly-diagnostic-log',clean);}catch(_){}
 return rows;
 }catch(_){return [];}}

function record(kind,duration){if(!diagnosticEnabled())return;try{const row=core.diagnostic(kind,location.pathname.split('/').pop()||'index.html',duration);if(row)localStorage.setItem('taxfly-diagnostic-log',JSON.stringify([...readLog(),row].slice(-100)));}catch(_){}}
window.TaxflyDiagnostics={record,read:readLog};
window.addEventListener('error',event=>record(event.target&&event.target!==window?'resource':'runtime'),true);
window.addEventListener('unhandledrejection',()=>record('promise'));
function measure(){const n=performance.getEntriesByType('navigation')[0];if(n&&n.loadEventEnd>0)record('navigation',n.loadEventEnd);}
if(document.readyState==='complete')measure();else window.addEventListener('load',()=>setTimeout(measure,0),{once:true});
let observer;function observePaint(){if(observer||!diagnosticEnabled()||!window.PerformanceObserver)return;try{observer=new PerformanceObserver(list=>{const entry=list.getEntries().at(-1);if(entry)record('lcp',entry.startTime);});observer.observe({type:'largest-contentful-paint',buffered:true});}catch(_){}}
observePaint();
function preferences(){
 const drawer=document.querySelector('#settingsDrawer .sx-scroll');if(!drawer)return;
 if(!root){root=document.createElement('section');root.id='tf-care-preferences';root.setAttribute('data-notr','');}if(!root.isConnected)drawer.append(root);
 const permission=window.Notification?.permission;
 root.innerHTML=`<span class="sx-sec">${L('Recordatorios de reservas','Booking reminders','Lembretes de reservas')}</span><div class="tf-offline-card"><p>${L('Se revisan mientras TaxFly está abierta. Cada reserva permite exportar su aviso al calendario.','Checked while TaxFly is open. Each booking lets you export its reminder to your calendar.','Verificados enquanto o TaxFly estiver aberto. Cada reserva permite exportar o aviso ao calendário.')}</p><button type="button" data-care="notify"${!window.Notification||permission==='granted'?' disabled':''}>${!window.Notification?L('Notificaciones no disponibles','Notifications unavailable','Notificações indisponíveis'):permission==='granted'?L('Notificaciones permitidas','Notifications allowed','Notificações permitidas'):L('Activar notificaciones','Enable notifications','Ativar notificações')}</button><p class="tf-care-status" role="status"></p></div><span class="sx-sec">${L('Diagnóstico técnico local','Local technical diagnostics','Diagnóstico técnico local')}</span><div class="tf-offline-card"><label class="tf-care-toggle"><input type="checkbox" data-care="diagnostic"${diagnosticEnabled()?' checked':''}><span>${L('Registrar errores y tiempos de carga','Record errors and loading times','Registrar erros e tempos de carregamento')}</span></label><p>${L('Opcional. Guarda hasta 100 registros durante 7 días en este navegador: tipo de error, pantalla, fecha y duración. No guarda contenido personal ni envía información.','Optional. Stores up to 100 records for 7 days in this browser: error type, screen, date and duration. No personal content is stored or information sent.','Opcional. Guarda até 100 registros por 7 dias neste navegador: tipo de erro, tela, data e duração. Não guarda conteúdo pessoal nem envia informações.')}</p><p>${new Intl.NumberFormat(localStorage.getItem('appLang')||'es').format(readLog().length)} ${L('registros locales','local records','registros locais')}</p><div class="tf-care-actions"><button type="button" data-care="export">${L('Exportar diagnóstico','Export diagnostics','Exportar diagnóstico')}</button><button type="button" data-care="clear">${L('Borrar registros','Clear records','Apagar registros')}</button></div></div>`;
 root.querySelector('[data-care=notify]').onclick=async()=>{
  const button=root.querySelector('[data-care=notify]');button.disabled=true;
  try{const permission=await Notification.requestPermission();preferences();if(permission!=='granted')root.querySelector('.tf-care-status').textContent=L('El navegador no permitió las notificaciones. Podés revisar sus ajustes.','The browser did not allow notifications. You can check its settings.','O navegador não permitiu notificações. Você pode verificar as configurações.');}catch(_){button.disabled=false;}
 };
 root.querySelector('[data-care=diagnostic]').onchange=event=>{try{localStorage.setItem('taxfly-diagnostic-enabled',event.target.checked?'1':'0');if(event.target.checked){measure();observePaint();}else{observer?.disconnect();observer=null;}}catch(_){}preferences();};
 root.querySelector('[data-care=clear]').onclick=()=>{try{localStorage.removeItem('taxfly-diagnostic-log');}catch(_){}preferences();};
 root.querySelector('[data-care=export]').onclick=()=>download(new Blob([JSON.stringify({schema:1,records:readLog()},null,2)],{type:'application/json'}),'taxfly-diagnostico.json');
}
function checkAlerts(){
 const c=context();if(!c||document.visibilityState==='prerender')return;
 const now=Date.now(),key='taxfly-reservation-alerts::'+core.scope(c);let seen={};try{seen=JSON.parse(localStorage.getItem(key)||'{}');}catch(_){}
 // Expire old claims without retaining names or full reservation metadata.
 seen=Object.fromEntries(Object.entries(seen).filter(([,at])=>Number.isFinite(at)&&at>now-7*86400000));
 const due=[];for(const item of window.TaxflyTravel.readReservations(c.uid,c.profile,c.trip)){
  const event=core.reminderEvent(item,window.TaxflyTravel.instant);if(!event||event.due>now||now-event.due>86400000)continue;
  const signature=core.reminderSignature(item,event);if(seen[signature])continue;seen[signature]=now;due.push(item);
 }
 try{localStorage.setItem(key,JSON.stringify(seen));}catch(_){return;}
 if(!due.length)return;
 const message=L('Tenés recordatorios de reservas para revisar.','You have booking reminders to review.','Há lembretes de reservas para revisar.');
 window.tfToast?.(message,{duration:8000,actionText:L('Ver reservas','View bookings','Ver reservas'),onAction:()=>{location.href='planificacion.html?section=reservas';}});
 if(window.Notification?.permission==='granted'){
  const options={body:message,tag:'taxfly-booking-reminder',data:{url:'./planificacion.html?section=reservas'}};
  const fallback=()=>{try{new Notification('TaxFly',options);}catch(_){}};
  if(navigator.serviceWorker)navigator.serviceWorker.ready.then(reg=>reg.showNotification('TaxFly',options)).catch(fallback);else fallback();
 }
}
function poll(){if(navigator.locks?.request)navigator.locks.request('taxfly-reservation-alerts',{ifAvailable:true},lock=>{if(lock)checkAlerts();}).catch(()=>{});else checkAlerts();}
preferences();window.addEventListener('load',preferences,{once:true});
document.addEventListener('click',event=>{if(event.target.closest?.('#btnSettings'))preferences();if(event.target.closest?.('.lang-opt,[data-lang]'))setTimeout(()=>{preferences();refreshReminderFormLanguage();},0);});window.I18N?.onChange(()=>{preferences();refreshReminderFormLanguage();});
window.addEventListener('storage',event=>{if(event.key==='appLang'||event.key==='taxfly-diagnostic-enabled')preferences();if(event.key==='appLang')refreshReminderFormLanguage();});
window.addEventListener('pageshow',poll);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});window.addEventListener('taxfly:tripchange',poll);setInterval(poll,60000);poll();
window.dispatchEvent(new Event('taxfly:care-ready'));
window.renderReservations?.();
})();
