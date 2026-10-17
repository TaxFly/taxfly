const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const core=require('../assets/care-core.js'),travel=require('../assets/travel-core.js');
const read=file=>fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),slice=(s,a,b)=>s.slice(s.indexOf(a),b?s.indexOf(b,s.indexOf(a)):undefined);
const ctx={uid:'u',profile:'p',trip:'a'};
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
test('drafts are isolated by account, profile, trip and record',()=>{
 const ls=storage();core.writeDraft(ls,ctx,'reservation-1',{title:'Private'});assert.equal(core.readDraft(ls,ctx,'reservation-1').values.title,'Private');
 for(const change of [{uid:'v'},{profile:'q'},{trip:'b'}])assert.equal(core.readDraft(ls,{...ctx,...change},'reservation-1'),null);assert.equal(core.readDraft(ls,ctx,'reservation-2'),null);
});
test('expired, future-dated and corrupt drafts are ignored; quota failure is reported',()=>{
 const ls=storage(),now=Date.now();core.writeDraft(ls,ctx,'r',{name:'x'},now-31*86400000);assert.equal(core.readDraft(ls,ctx,'r',now),null);
 core.writeDraft(ls,ctx,'r',{name:'x'},now+1000);assert.equal(core.readDraft(ls,ctx,'r',now),null);ls.setItem(core.draftKey(ctx,'r'),'{');assert.equal(core.readDraft(ls,ctx,'r'),null);
 assert.equal(core.writeDraft({setItem(){throw Error('quota')}},ctx,'r',{}),false);
});
function draftHarness(){
 const ls=storage();ls.setItem('perfilActivoId','p');const events={},docEvents={};let document;
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attrs={};this.isConnected=true;this.value='';this.options=[];this.type='text';this.className='';}
  append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
  prepend(child){child.parent=this;this.children.unshift(child);}
  addEventListener(type,cb){(this.listeners[type]??=[]).push(cb);}
  dispatchEvent(event){for(const cb of this.listeners[event.type]||[])cb(event);return true;}
  querySelectorAll(selector){const fields=this.fields||[];return selector==='input[type=file]'?fields.filter(f=>f.type==='file'):fields;}
  setAttribute(name,value){this.attrs[name]=value;}
  getAttribute(name){return this.attrs[name]??null;}
  hasAttribute(name){return name in this.attrs;}
  get firstElementChild(){return this.children[0];}
  focus(){document.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;}
  remove(){this.isConnected=false;if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
  click(){this.onclick?.();}
 }
 document={body:new Element('body'),createElement:tag=>new Element(tag),addEventListener:(type,cb)=>{const previous=docEvents[type];docEvents[type]=event=>{previous?.(event);cb(event);};},activeElement:null};
 const window={_taxflyTripUid:'u',_perfilId:'p',_tripId:'a',TaxflyCare:core,tfL3:(es,en,pt)=>({en,pt}[ls.getItem('appLang')]||es),TripContext:{view:()=>window._tripId},addEventListener:(type,cb)=>events[type]=cb};
 const c=vm.createContext({window,document,localStorage:ls,Map,WeakSet,Promise,JSON,Object,Event:class{constructor(type){this.type=type;}}});vm.runInContext(read('assets/form-drafts.js'),c);
 function form(value='Before'){const el=new Element(),input=new Element('input');input.name='title';input.value=value;el.fields=[input];return {el,input,edit(value){input.value=value;el.dispatchEvent({type:'input'});}};}
 const dialog=()=>document.body.children.at(-1),choice=index=>dialog().children[3].children[index].click();
 return {ls,window,events,docEvents,document,form,dialog,choice,Element,api:window.TaxflyDrafts};
}
test('live snapshot restoration survives a data-driven form rerender',()=>{
 const h=draftHarness(),a=h.form();h.api.mount(a.el,{id:'r'});a.edit('Typing');const b=h.form('Server refresh');h.api.mount(b.el,{id:'r'});assert.equal(b.input.value,'Typing');assert.equal(h.api.dirty(),true);
});
test('file and password values never enter a draft, but selected files trigger protection',()=>{
 const h=draftHarness(),f=h.form(),file=new h.Element('input'),password=new h.Element('input');file.name='file';file.type='file';file.files=[{content:'PRIVATE_BYTES'}];password.name='secret';password.type='password';password.value='PRIVATE_PASSWORD';f.el.fields.push(file,password);h.api.mount(f.el,{id:'r'});f.el.dispatchEvent({type:'change'});
 assert.equal(h.api.dirty(),true);assert.deepEqual(Object.keys(h.api.snapshot(f.el)),['title']);assert.doesNotMatch(JSON.stringify(h.api.snapshot(f.el)),/PRIVATE/);
});
test('saving a draft closes the abandoned editor and offers explicit restoration on reopening',async()=>{
 const h=draftHarness(),f=h.form();let abandoned=0;h.api.mount(f.el,{id:'r',onAbandon:()=>abandoned++});f.edit('Draft title');const result=h.api.resolve();h.choice(2);assert.equal(await result,true);assert.equal(abandoned,1);assert.equal(h.api.dirty(),false);
 const fresh=h.form();h.api.mount(fresh.el,{id:'r'});assert.equal(fresh.input.value,'Before');fresh.el.children[0].children[1].click();assert.equal(fresh.input.value,'Draft title');assert.equal(h.api.dirty(),true);
 h.api.complete(fresh.el);assert.equal(core.readDraft(h.ls,ctx,'r'),null);assert.equal(h.api.dirty(),false);
});
test('keep editing cancels navigation and preserves the current unsaved changes',async()=>{
 const h=draftHarness(),f=h.form();let abandoned=0;h.api.mount(f.el,{id:'r',onAbandon:()=>abandoned++});f.edit('Unsaved');const result=h.api.resolve();h.choice(0);assert.equal(await result,false);assert.equal(h.api.dirty(),true);assert.equal(abandoned,0);assert.equal(core.readDraft(h.ls,ctx,'r'),null);
});
test('discard removes an earlier draft and closes the editor',async()=>{
 const h=draftHarness(),f=h.form();core.writeDraft(h.ls,ctx,'r',{title:'Old draft'});let abandoned=0;h.api.mount(f.el,{id:'r',onAbandon:()=>abandoned++});f.edit('Discard this');const result=h.api.resolve();h.choice(1);assert.equal(await result,true);assert.equal(abandoned,1);assert.equal(core.readDraft(h.ls,ctx,'r'),null);
});
test('storage failure keeps the confirmation open and prevents loss of the form',async()=>{
 const h=draftHarness(),f=h.form();h.api.mount(f.el,{id:'r'});f.edit('Keep me');h.ls.setItem=()=>{throw Error('quota')};const result=h.api.resolve();h.choice(2);assert.equal(h.dialog().open,true);assert.match(h.dialog().children[2].textContent,/No se pudo/);assert.equal(h.api.dirty(),true);h.choice(0);assert.equal(await result,false);
});
test('beforeunload protects dirty edits and pagehide saves them to their original scope',()=>{
 const h=draftHarness(),f=h.form();h.api.mount(f.el,{id:'r'});f.edit('Before leaving');let prevented=false;h.events.beforeunload({preventDefault(){prevented=true}});assert.equal(prevented,true);h.window._tripId='b';h.events.pagehide();assert.equal(core.readDraft(h.ls,ctx,'r').values.title,'Before leaving');assert.equal(core.readDraft(h.ls,{...ctx,trip:'b'},'r'),null);
});
test('navigation waits for a decision and performs the requested action once',async()=>{
 const h=draftHarness(),f=h.form();h.api.mount(f.el,{id:'r'});f.edit('Unsaved');const target=new h.Element('a');target.attrs.href='index.html';target.closest=selector=>selector.includes('a,button')?target:null;target.matches=()=>false;let navigated=0,stopped=0;target.onclick=()=>navigated++;
 h.docEvents.click({target,button:0,preventDefault(){},stopImmediatePropagation(){stopped++}});assert.equal(navigated,0);assert.equal(stopped,1);h.choice(2);await new Promise(setImmediate);assert.equal(navigated,1);
});
test('draft choice labels are available immediately in all three languages',async()=>{
 for(const [lang,title]of [['es','Tenés cambios sin guardar'],['en','You have unsaved changes'],['pt','Há alterações não salvas']]){
  const h=draftHarness();h.ls.setItem('appLang',lang);const f=h.form();h.api.mount(f.el,{id:'r'});f.edit('Dirty');const result=h.api.resolve();assert.equal(h.dialog().children[0].textContent,title);h.choice(0);await result;
 }
});
const reservation={id:'r',name:'São José, flight\nBEGIN:PRIVATE',reminder:{kind:'checkin',date:'2027-01-19',time:'08:00',zone:'America/New_York',lead:1440}};
test('reminders use the saved destination zone instead of the device zone',()=>{
 const e=core.reminderEvent(reservation,travel.instant);assert.equal(new Date(e.at).toISOString(),'2027-01-19T13:00:00.000Z');assert.equal(new Date(e.due).toISOString(),'2027-01-18T13:00:00.000Z');
});
test('invalid dates, DST gaps, unknown zones and unsupported leads cannot schedule alerts',()=>{
 for(const patch of [{date:'2027-02-30'},{date:'2027-03-14',time:'02:30'},{zone:'Unknown/Zone'},{lead:999},{kind:'invalid'}])assert.equal(core.reminderEvent({...reservation,reminder:{...reservation.reminder,...patch}},travel.instant),null);
});
test('editing the reminder time changes its deduplication signature',()=>{
 const next={...reservation,reminder:{...reservation.reminder,time:'09:00'}};assert.notEqual(core.reminderSignature(reservation,core.reminderEvent(reservation,travel.instant)),core.reminderSignature(next,core.reminderEvent(next,travel.instant)));
});
test('calendar export has the saved UTC time, alarm, escaped content and stable UID',()=>{
 const ics=core.calendar(reservation,travel.instant);assert.match(ics,/DTSTART:20270119T130000Z/);assert.match(ics,/TRIGGER:-PT1440M/);assert.match(ics,/SUMMARY:São José\\, flight\\nBEGIN:PRIVATE/);assert.equal(ics.split('\r\nBEGIN:PRIVATE').length,1);assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,1);
 const long=core.calendar({...reservation,name:'á'.repeat(200)},travel.instant);for(const line of long.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 assert.equal(core.calendar({...reservation,reminder:null},travel.instant),'');
});
test('document availability requires every file, not just one cached preview',()=>{
 const img={kind:'img',dataUrl:'data:image/png;base64,YQ=='};assert.equal(core.documentAvailability({files:[img]}).complete,true);assert.equal(core.documentAvailability({files:[img,{kind:'pdf'}]}).complete,false);assert.equal(core.documentAvailability({files:[]}).complete,false);assert.equal(core.documentAvailability({files:[{dataUrl:'https://example.com/file'}]}).complete,false);
});
test('diagnostic records whitelist fields, known screens and bounded numeric durations',()=>{
 const row=core.diagnostic('runtime','https://private.example/secret?token=PII',undefined,123);assert.deepEqual(row,{kind:'runtime',page:'other',at:123});assert.equal(core.diagnostic('PRIVATE_ERROR_MESSAGE','index.html'),null);assert.equal(core.diagnostic('runtime','index.html',123,'PRIVATE'),null);assert.equal(core.diagnostic('navigation','compras.html',999999999,123).ms,3600000);
});
test('diagnostics are opt-in, capped at 100 and never retain error messages, URLs or stacks',()=>{
 const ls=storage(),c=vm.createContext({localStorage:ls,core,location:{pathname:'/taxfly/compras.html?secret=PRIVATE'},Date,JSON});const source=read('assets/travel-care.js');vm.runInContext(slice(source,'const diagnosticEnabled=','window.TaxflyDiagnostics='),c);
 c.record('runtime','PRIVATE_MESSAGE');assert.equal(c.readLog().length,0);ls.setItem('taxfly-diagnostic-enabled','1');for(let i=0;i<120;i++)c.record('runtime','PRIVATE_MESSAGE');assert.equal(c.readLog().length,100);assert.doesNotMatch(ls.getItem('taxfly-diagnostic-log'),/PRIVATE|stack|https|message/);
 const now=Date.now();ls.setItem('taxfly-diagnostic-log',JSON.stringify([{kind:'runtime',page:'index.html',at:now-8*86400000},{kind:'runtime',page:'index.html',at:now,secret:'PRIVATE'}]));assert.equal(c.readLog().length,1);assert.equal(c.readLog()[0].secret,undefined);
});
test('saving an active reservation form is not replaced by a background render',()=>{
 const window={},c=vm.createContext({window,reservationFormType:'flight',document:{getElementById:()=>({})}});const source=read('assets/plan-reservations.js');vm.runInContext(slice(source,'function renderReservations(force=false)','window.mountReservationDraft='),c);assert.doesNotThrow(()=>c.renderReservations());
});
test('document cache availability is confirmed only after IndexedDB succeeds',async()=>{
 const window={},c=vm.createContext({window,DOCS_CACHE_KEY_PFX:'docs:',getPerfilId:()=> 'p',idbSet:async()=>false,Set});vm.runInContext(slice(read('assets/tickets.js'),'async function guardarDocsEnCache(','async function cargarDocsDesdeCache('),c);
 const docs=[{id:'d',files:[{dataUrl:'data:image/png;base64,YQ=='}]}];await c.guardarDocsEnCache(docs);assert.equal(window._tfDocsCachedIds.has('d'),false);c.idbSet=async()=>true;await c.guardarDocsEnCache(docs);assert.equal(window._tfDocsCachedIds.has('d'),true);
});
test('language changes update draft prompts without changing the entered values',async()=>{
 const h=draftHarness(),f=h.form();h.api.mount(f.el,{id:'r'});f.edit('Personal title');const result=h.api.resolve();h.ls.setItem('appLang','pt');h.events.storage({key:'appLang'});assert.equal(h.dialog().children[0].textContent,'Há alterações não salvas');assert.equal(f.input.value,'Personal title');h.choice(0);await result;
});
test('reminder labels can rerender in another language without resetting typed dates or focus',()=>{
 const saved={},fields={reminderKind:{value:'expiry'},reminderDate:{value:'2027-01-28'},reminderTime:{value:'17:30'},reminderLead:{value:'60'},notes:{value:'Personal',focus(){saved.focused=true}}};
 const old={replaceWith:node=>saved.replaced=node},form={elements:fields,querySelector:()=>old,contains:()=>true},document={getElementById:()=>form,activeElement:{name:'notes'},createElement:()=>({content:{firstElementChild:{}}})};
 const window={reservationReminderFields:item=>{saved.reminder=item.reminder;return 'translated labels'},applyReservationReminderForm:target=>saved.form=target},c=vm.createContext({window,document,Number});
 vm.runInContext(slice(read('assets/travel-care.js'),'function refreshReminderFormLanguage(){','window.taxflyReadReservationReminder='),c);c.refreshReminderFormLanguage();assert.deepEqual(JSON.parse(JSON.stringify(saved.reminder)),{kind:'expiry',date:'2027-01-28',time:'17:30',lead:60});assert.equal(saved.focused,true);assert.equal(fields.notes.value,'Personal');assert.equal(saved.form,form);
});
test('reservation alerts are deduplicated and read only the currently selected context',()=>{
 const now=travel.instant(reservation.reminder.date,reservation.reminder.time,reservation.reminder.zone)-1440*60000+1000;
 class Clock extends Date{static now(){return now}}
 const ls=storage(),current={...ctx},toasts=[],queries=[],window={TaxflyTravel:{instant:travel.instant,readReservations:(u,p,t)=>{queries.push([u,p,t]);return t==='a'?[reservation]:[]}},tfToast:(msg,options)=>toasts.push({msg,options})};
 const c=vm.createContext({window,localStorage:ls,document:{visibilityState:'visible'},context:()=>current,core,Date:Clock,L:es=>es,location:{},navigator:{},Object,JSON});
 vm.runInContext(slice(read('assets/travel-care.js'),'function checkAlerts(){','function poll()'),c);c.checkAlerts();c.checkAlerts();assert.equal(toasts.length,1);current.trip='b';c.checkAlerts();assert.equal(toasts.length,1);assert.deepEqual(queries.at(-1),['u','p','b']);assert.doesNotMatch(ls.getItem('taxfly-reservation-alerts::'+core.scope(ctx)),/São|PRIVATE/);
});
test('late document cache writes cannot publish availability for another account',async()=>{
 let resolve;const window={_uid:'u'},c=vm.createContext({window,DOCS_CACHE_KEY_PFX:'docs:',getPerfilId:()=> 'p',idbSet:()=>new Promise(r=>resolve=r),Set,JSON});
 vm.runInContext(slice(read('assets/tickets.js'),'async function guardarDocsEnCache(','async function cargarDocsDesdeCache('),c);const work=c.guardarDocsEnCache([{id:'d',files:[{dataUrl:'data:image/png;base64,YQ=='}]}]);window._uid='other';resolve(true);await work;assert.equal(window._tfDocsCachedIds,undefined);
});
