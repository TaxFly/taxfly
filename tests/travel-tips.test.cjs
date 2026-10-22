const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const cut=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function env(){
 const m=new Map(),events={},timers=[],el={style:{},innerText:''};
 const localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
 const core=require('../assets/travel-tip-core.js'),rot=core.createRotation();
 const window={TaxflyTips:{...core,nextIndex:(list,index)=>rot.nextIndex(list,index),reset:()=>rot.reset()},addEventListener:(k,f)=>(events[k]??=[]).push(f)};
 const ctx=vm.createContext({window,localStorage,document:{getElementById:()=>el},setTimeout:f=>timers.push(f),clearTimeout(){},Math});
 return {window,localStorage,events,timers,el,run:s=>vm.runInContext(s,ctx)};
}
function loadHome(e){const s=read('assets/index-app.js');e.run(cut(s,'const I18N =','let lang =')+'\nlet lang="es",t=I18N.es;\n'+cut(s,'const TIPS_ES_PAIS =','let tipIndex ='));}
function loadShop(e){e.run('let tipIndex=0;'+cut(read('assets/compras.js'),'const shoppingTips =','const knownStores ='));}
function loadCities(e){e.run(cut(read('assets/lugares-ciudades.js'),'const CITIES =','window.renderCityGrid ='));}
test('home country layers stay in Spanish, support every country and never mutate the base',()=>{
 const e=env();loadHome(e);const base=e.run('tipsList().length');
 assert.ok(e.run('tipsList().every(t=>!/(SUBE|ARCA|percepción)/.test(t.text))'));
 for(const c of ['AR','MX','CO','CL','PE','CR','PA','GT']){
  e.localStorage.setItem('appCountry',c);assert.ok(e.run('tipsList().length')>base);
  for(const l of ['en','pt']){e.run(`lang="${l}";t=I18N[lang]`);assert.equal(e.run('tipsList().length'),e.run('t.tips.length'));}
  e.run('lang="es";t=I18N.es');
 }
 for(const c of ['','ZZ','toString','__proto__']){e.localStorage.setItem('appCountry',c);assert.equal(e.run('tipsList().length'),base);}
 e.localStorage.setItem('appCountry','ar');assert.ok(e.run('tipsList().length')>base);
 e.localStorage.removeItem('appCountry');assert.equal(e.run('tipsList().length'),base);
});
test('shopping customs match the country and never leak to English or Portuguese',()=>{
 const e=env();loadShop(e);const base=e.run('shoppingTipsFor("es").length');
 for(const c of ['AR','MX','CO','CL','PE','CR','PA','GT']){
  e.localStorage.setItem('appCountry',c);assert.ok(e.run('shoppingTipsFor("es").length')>base);
  assert.equal(e.run('shoppingTipsFor("en").length'),11);assert.equal(e.run('shoppingTipsFor("pt").length'),13);
 }
 e.localStorage.removeItem('appCountry');assert.equal(e.run('shoppingTipsFor("es").length'),base);
 assert.ok(e.run('shoppingTipsFor("es").every(t=>!/(ARCA|SUBE|Receita|DIAN)/.test(t))'));
});
test('both city surfaces include the same country layer without translation leakage',()=>{
 const e=env();loadCities(e);e.run(cut(read('assets/lugares-selector.js'),'function buildTransportHTML','window.updateInlineTransport'));
 e.localStorage.setItem('appCountry','AR');
 assert.ok(e.run('buildTransportHTML(CITIES.find(c=>c.id==="newyork"),"es")').includes('SUBE'));
 assert.ok(e.run('cityTipsFor(CITIES.find(c=>c.id==="washington"),"es").some(t=>t.includes("SUBE"))'));
 for(const l of ['en','pt'])assert.ok(!e.run(`buildTransportHTML(CITIES[1],"${l}")`).includes('SUBE'));
 e.localStorage.removeItem('appCountry');assert.ok(!e.run('buildTransportHTML(CITIES[1],"es")').includes('SUBE'));
 const cities=e.run('CITIES');assert.equal(cities.length,12);
 for(const c of cities)for(const l of ['es','en','pt'])assert.ok(c['tips_'+l].length>=6);
});
test('delayed shopping rotation keeps current language and valid indices across unequal lists',()=>{
 const e=env();loadShop(e);e.run(cut(read('assets/compras.js'),'window.nextTip =','window.changeLanguage ='));
 e.localStorage.setItem('appLang','es');e.localStorage.setItem('appCountry','AR');
 for(let i=0;i<30;i++){e.window.nextTip();e.timers.shift()();assert.ok(e.el.innerText);}
 e.window.nextTip();e.localStorage.setItem('appLang','pt');e.timers.shift()();assert.ok(e.run('shoppingTips.pt').includes(e.el.innerText));
 e.events['taxfly:countrychange'][0]();assert.equal(e.el.innerText,e.run('shoppingTips.pt[0]'));
});
test('places and units do not restore a stale language after delayed rotation',()=>{
 for(const f of ['lugares','unidades']){
  const e=env(),s=read(`assets/${f}.js`);
  if(f==='lugares'){e.run('let currentTipIndex=0;'+cut(s,'const tips =','const citiesConfig ='));e.run(cut(s,'window.nextTip =','const PENDING_KEY ='));}
  else e.run('let tipIndex=0;'+cut(s,'const unitTips =','window.toggleGroup ='));
  e.localStorage.setItem('appLang','es');e.window.nextTip();e.localStorage.setItem('appLang','en');e.timers.shift()();
  assert.ok(e.run(f==='lugares'?'tips.en':'unitTips.en').includes(e.el.innerText));
 }
});
test('all shipped tips have provenance or are explicitly identified as editorial advice',()=>{
 const d=JSON.parse(read('docs/travel-tips-sources-2026-10.json'));assert.equal(d.review_date,'2026-10-22');
 for(const r of d.records){assert.ok(r.sources.length||r.status==='consejo editorial');for(const k of r.sources)assert.ok(d.sources[k]?.url.startsWith('https://'));}
 const e=env();loadHome(e);loadShop(e);loadCities(e);
 e.run(cut(read('assets/lugares.js'),'const tips =','const citiesConfig ='));
 e.run(cut(read('assets/unidades.js'),'const unitTips =','window.nextTip ='));
 const actual=e.run('[...Object.values(I18N).flatMap(v=>v.tips.map(t=>t.text)),...Object.values(TIPS_ES_PAIS).flat().map(t=>t.text),...Object.values(shoppingTips).flat(),...Object.values(shoppingTipsPais).flat(),...Object.values(tips).flat(),...Object.values(tipsPais).flat(),...Object.values(unitTips).flat(),...CITIES.flatMap(c=>Object.entries(c).filter(([k])=>k.startsWith("tips_")).flatMap(([,v])=>v))]');
 const recorded=new Set(d.records.flatMap(r=>Object.values(r.texts)));for(const t of actual)assert.ok(recorded.has(t),t);assert.equal(actual.length,431);
});
