const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/plan-app.js'),'utf8');
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
function durations(lang='es'){
 const words={en:{'Revisar duración':'Check duration','Fila estimada':'Estimated wait'},pt:{'Revisar duración':'Revisar duração','Fila estimada':'Espera estimada'}};
 const context=vm.createContext({window:{I18N:{lang,t:t=>words[lang]?.[t]||t}},Intl,escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')});
 vm.runInContext(slice('function itinParseNum(v) {','function itinParseWorkbook')+slice('function itinFmtDur(b) {','function renderItinerario'),context);
 return context;
}
test('imports preserve ranges and ambiguous values instead of joining digits',()=>{
 const c=durations();
 for(const text of ['45-60','45–60 min','45 / 60','1 h 30 min','<unknown>']) assert.equal(c.itinParseNum(text),text);
 assert.equal(c.itinParseNum('12,5 min'),12.5);assert.equal(c.itinParseNum(''),0);
 assert.equal(c.itinDurationText('45-60 min'),'45–60 min');
 assert.match(c.itinDurationText('4560'),/4[.,]560 min · Revisar duración/);
 assert.equal(c.itinDurationText('60–45'),'60–45 · Revisar duración');
});
test('rendering flags ambiguity without mutating stored durations and escapes source text',()=>{
 const c=durations(),block={espera:'45 / 60',dur:'<img src=x>'},before=JSON.stringify(block);
 const text=c.itinFmtDur(block);
 assert.match(text,/45 \/ 60 · Revisar duración/);assert.match(text,/&lt;img/);assert.doesNotMatch(text,/<img/);assert.equal(JSON.stringify(block),before);
});
test('duration labels are immediately translated and numbers use the selected locale',()=>{
 assert.equal(durations('en').itinFmtDur({espera:12.5,dur:0}),'Estimated wait: 12.5 min');
 assert.equal(durations('pt').itinFmtDur({espera:12.5,dur:0}),'Espera estimada: 12,5 min');
 assert.match(durations('en').itinDurationText(4560),/Check duration/);
 assert.match(durations('pt').itinDurationText(4560),/Revisar duração/);
});
test('editing duration ranges preserves separators and safely escapes input values',()=>{
 const c=durations();c.ic=()=>'';c.ITIN_TIPOS={otro:{label:'Otro'}};
 vm.runInContext(slice('function itinEditForm(','function itinSwitchDay'),c);
 const html=c.itinEditForm({id:'test',hora:'',titulo:'',zona:'',tipo:'otro',espera:'45–60',dur:'" onfocus="bad',obs:''});
 assert.match(html,/value="45–60"/);assert.doesNotMatch(html,/value="" onfocus/);
 assert.doesNotMatch(html,/placeholder="Fila estimada \(min\)"[^>]*data-num/);
 const fields={'itin-f-espera':'45–60','itin-f-dur':'12,5'};
 c.document={getElementById:id=>({value:fields[id]||''})};
 assert.equal(c.itinLeerForm().espera,'45–60');assert.equal(c.itinLeerForm().dur,12.5);
});
test('new interface labels exist in all three bundled languages',()=>{
 const dict=fs.readFileSync(path.join(root,'assets/plan-i18n.js'),'utf8');
 for(const [es,en,pt] of [['Flexible','Flexible','Flexível'],['Fila estimada','Estimated wait','Espera estimada'],['Revisar duración','Check duration','Revisar duração']]) assert.ok(dict.includes(`"${es}": ["${en}", "${pt}"]`));
 assert.ok(source.includes('b.hora || window.I18N?.t("Flexible")'));
});
test('section return restores scroll independently for each user, profile and trip',()=>{
 const node={classList:{add(){},remove(){},toggle(){}},style:{},innerHTML:'',textContent:''};
 const win={_taxflyTripUid:'u',_perfilId:'p',_tripId:'a',addEventListener(){},scrollY:0,scrollTo({top}){this.scrollY=top;}};
 const c=vm.createContext({window:win,Map,JSON,document:{querySelectorAll:()=>[],getElementById:()=>({...node}),body:{classList:node.classList}},sessionStorage:{setItem(){}},sectionMeta:{outlets:{title:'',accent:'',theme:''},parques:{title:'',accent:'',theme:''}},escapeHtml:s=>s,parquesSubTab:'itinerario',renderOutlets(){},renderParques(){},updateGlobal(){},updateParquesCounter(){}});
 vm.runInContext(slice('const planSectionScroll = new Map();','function shopSave()'),c);
 c.switchSection('parques');win.scrollY=620;c.switchSection('outlets');assert.equal(win.scrollY,0);
 win.scrollY=80;c.switchSection('parques');assert.equal(win.scrollY,620);
 win._tripId='b';c.switchSection('parques');assert.equal(win.scrollY,0);
 win._perfilId='q';c.switchSection('parques');assert.equal(win.scrollY,0);
 win._taxflyTripUid='other';c.switchSection('outlets');assert.equal(win.scrollY,0);
});

test('returning from an external detail restores day, filters and scroll only in its own context',()=>{
 const storage=new Map();
 const c=vm.createContext({Map,JSON,Number,window:{_taxflyTripUid:'u',_perfilId:'p',_tripId:'a',_appInited:true,scrollY:455,addEventListener(){}},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},itinDias:[{id:'d1'},{id:'d2'}],itinDay:1,itinSoloPend:true,days:[{},{}],currentOutletDay:1,outletSubTab:'lista',parquesSubTab:'atracciones',pkFilter:'epcot',pkSearchQuery:'Test Track',pkFilterMetaList:()=>[{id:'all'},{id:'epcot'}],_itinNeedsReveal:true,_outletsNeedsReveal:true});
 vm.runInContext(slice('const planSectionScroll = new Map();','function switchSection(section)'),c);
 vm.runInContext('visiblePlanSection=planScrollKey("parques");savePlanView();',c);
 c.itinDay=0;c.itinSoloPend=false;c.pkSearchQuery='';c.pkFilter='all';c.parquesSubTab='itinerario';
 assert.equal(c.restorePlanView(),'parques');assert.equal(c.itinDay,1);assert.equal(c.itinSoloPend,true);assert.equal(c.pkFilter,'epcot');assert.equal(c.pkSearchQuery,'Test Track');assert.equal(c.parquesSubTab,'atracciones');
 assert.equal(vm.runInContext('planSectionScroll.get(planScrollKey("parques"))',c),455);
 c.window._tripId='b';c.itinDay=0;assert.equal(c.restorePlanView(),null);assert.equal(c.itinDay,0);
 c.window._tripId='a';storage.set(c.planScrollKey('view-v1'),'{bad');assert.equal(c.restorePlanView(),null);
});

test('changing language refreshes generated labels without rebuilding forms or changing day',()=>{
 const c=durations('pt'),block={hora:'',espera:12.5,dur:0};
 const time={dataset:{itinId:'one'},classList:{contains:()=>true}},meta={dataset:{itinId:'one'},classList:{contains:()=>false}};
 c.document={querySelectorAll:()=>[time,meta]};c.itinBloque=()=>block;c.window.I18N.t=t=>({'Flexible':'Flexível','Fila estimada':'Espera estimada'}[t]||t);
 c.window.I18N.onChange=fn=>c.languageCallback=fn;
 vm.runInContext(source.slice(source.indexOf('function refreshItineraryLabels()')),c);
 c.languageCallback();assert.equal(time.textContent,'Flexível');assert.equal(meta.innerHTML,'Espera estimada: 12,5 min');
});
