const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=require('../assets/plan-loading.js');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const between=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
test('the agenda can open while a different section remains loading; no empty state is confirmed for it',async()=>{
 const deferred={},values=[];const load=P.create(name=>new Promise((resolve,reject)=>deferred[name]={resolve,reject}),(...args)=>values.push(args),()=>{},1000);
 await Promise.resolve();deferred.itinerario.resolve({dias:[{id:'personal'}]});await load.waitFor('agenda');
 assert.equal(load.states.itinerario,'ready');assert.equal(load.states.walmart,'loading');assert.equal(values.length,1);
 for(const [name,job] of Object.entries(deferred))if(name!=='itinerario')job.resolve(null);await Promise.all(Object.values(load.jobs));
});
test('late bootstrap failures cannot replace data already accepted from a listener',async()=>{
 const deferred={};let published=0;const load=P.create(name=>new Promise((resolve,reject)=>deferred[name]={resolve,reject}),()=>published++,()=>{},1000);await Promise.resolve();
 load.states.itinerario='ready';deferred.itinerario.reject(Error('old request failed'));await load.jobs.itinerario;assert.equal(load.states.itinerario,'ready');
 load.states.meals='ready';deferred.meals.resolve({meals:[]});await load.jobs.meals;assert.equal(published,0);
 for(const [name,job] of Object.entries(deferred))if(!['itinerario','meals'].includes(name))job.resolve(null);await Promise.all(Object.values(load.jobs));
});
test('section gates distinguish loading, confirmed empty and failure in the chosen language',()=>{
 const panel={dataset:{},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];},innerHTML:''};
 const window={PlanLoading:P,_planInitialState:{itinerario:'loading'},I18N:{t:s=>s==='Cargando…'?'Loading…':'Could not refresh.'}};
 const context=vm.createContext({window,document:{getElementById:()=>panel},parquesSubTab:'itinerario',escapeHtml:s=>s});
 vm.runInContext(between(read('assets/plan-app.js'),'function planPanelPending(section) {','window.planPanelPending='),context);
 assert.equal(context.planPanelPending('parques'),true);assert.match(panel.innerHTML,/Loading/);assert.equal(panel['aria-busy'],'true');
 window._planInitialState.itinerario='error';assert.equal(context.planPanelPending('parques'),true);assert.match(panel.innerHTML,/Could not refresh/);
 window._planInitialState.itinerario='ready';assert.equal(context.planPanelPending('parques'),false);assert.equal(panel.dataset.planWaiting,undefined);
});
test('filter arrows are hidden when all chips fit and disabled correctly at scroll boundaries',()=>{
 const left={},right={},row={scrollWidth:300,clientWidth:300,scrollLeft:0,closest:()=>({querySelectorAll:()=>[left,right]})};
 const c=vm.createContext({document:{getElementById:()=>row}});vm.runInContext(between(read('assets/mis-cosas.js'),'function updateMisFilterArrows() {','function watchMisFilterArrows()'),c);
 c.updateMisFilterArrows();assert.equal(left.hidden,true);assert.equal(right.hidden,true);
 row.scrollWidth=600;c.updateMisFilterArrows();assert.equal(left.hidden,false);assert.equal(left.disabled,true);assert.equal(right.disabled,false);
 row.scrollLeft=300;c.updateMisFilterArrows();assert.equal(right.disabled,true);assert.equal(left.disabled,false);
});
test('category icons are rendered as HTML only where intended; option labels remain plain text',()=>{
 const src=read('assets/compras.js'),c=vm.createContext({localStorage:{getItem:()=> 'es'},CAT_I18N_KEY:{'Datos Móviles':'mobile'},i18n:{es:{mobile:'Datos Móviles'}},customCats:[],uiIconSvg:key=>`<svg data-icon="${key}"></svg>`,catIconSvg:key=>`<svg data-custom="${key}"></svg>`,autoCatIcon:()=> 'phone',esc:s=>s});
 vm.runInContext(between(src,'function catLabel(cat) {','// ═'),c);
 assert.equal(c.catLabel('Datos Móviles'),'Datos Móviles');assert.match(c.catLabelHtml('Datos Móviles'),/<svg data-icon="phone">/);
 assert.ok(src.includes('cats.map(([cat, val])'));assert.doesNotMatch(src,/cats\.slice\(0, 5\)/);
});
test('category bars add cap information rather than repeat the full chart',()=>{
 const source=read('assets/compras.js'),c=vm.createContext({catBudgets:{food:100},CAT_I18N_KEY:{Food:'food',Hotel:'hotel'},catColor:()=> '#000',catLabelHtml:s=>s,fmt:n=>n});
 vm.runInContext(between(source,'function renderCatBars(cats, total) {','window.addGasto ='),c);
 const html=c.renderCatBars([['Food',20],['Hotel',50]],70);assert.match(html,/Food/);assert.doesNotMatch(html,/Hotel/);assert.match(html,/100/);
});

test('Planning and the other screens build the same translated menu and retain the settings button',()=>{
 const source=read('assets/ui.js');
 function render(isPlan,lang){
  const attributes={},button={setAttribute(){}};const avatar={identity:'same-node'};
  const nav={classList:{contains:name=>isPlan&&name==='plan-app-nav',add(){}},querySelector:selector=>selector==='#btnSettings'?avatar:selector==='#btnMore'?button:{},getAttribute:key=>attributes[key],setAttribute:(key,value)=>attributes[key]=value,appendChild:node=>assert.equal(node,avatar),innerHTML:''};
  const c=vm.createContext({localStorage:{getItem:()=>lang},document:{querySelector:selector=>selector==='.plan-app-nav'?(isPlan?nav:null):nav},svg:(name,size)=>`<svg data-icon="${name}" width="${size}"></svg>`});
  vm.runInContext(between(source,'  const NAV_T =','  const LEAD_RE'),c);c.buildNav();return nav.innerHTML;
 }
 for(const lang of ['es','en','pt'])assert.equal(render(true,lang),render(false,lang));
 assert.match(render(true,'en'),/Trip lists and luggage/);assert.match(render(true,'pt'),/Listas e bagagem da viagem/);
});
