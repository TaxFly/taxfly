const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../assets/guide-core.js');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('guide progress is separated by account, profile and version',()=>{
 assert.notEqual(G.key('u','a'),G.key('u','b'));assert.notEqual(G.key('u','a'),G.key('v','a'));
 assert.notEqual(G.key('a::b','c'),G.key('a','b::c'));assert.ok(G.key('u','a').includes(String(G.VERSION)));
});
test('invalid progress is discarded and resume positions are bounded',()=>{
 assert.deepEqual(G.clean(null),{welcome:false,done:[],offers:[],resume:null});
 assert.deepEqual(G.clean({done:['home','__proto__'],offers:['bad','budget'],resume:{section:'home',index:100}}),{welcome:false,done:['home'],offers:['budget'],resume:{section:'home',index:99}});
 assert.equal(G.clean({resume:{section:'__proto__',index:1}}).resume,null);
});
test('trip setup rejects missing fields, impossible dates and reversed intervals',()=>{
 const v={name:'Trip',city:'Orlando',state:'Florida',startDate:'2027-01-17',endDate:'2027-01-28'};
 assert.equal(G.tripFields({...v,name:'  '}).error,'required');
 for(const dates of [{startDate:'2027-02-30'},{endDate:'2027-01-16'},{startDate:'anything'}])assert.equal(G.tripFields({...v,...dates}).error,'datesError');
 assert.equal(G.tripFields({...v,startDate:'',endDate:''}).fields.startDate,'');
 assert.deepEqual(G.tripFields({...v,name:' Trip '}).fields,{name:'Trip',destinations:[{city:'Orlando',state:'Florida'}],startDate:v.startDate,endDate:v.endDate});
});
test('every guide and interface message has Spanish, English and Portuguese copy',()=>{
 const window={};vm.runInNewContext(read('assets/guide-data.js'),{window});vm.runInNewContext(read('assets/guide-pages.js'),{window});const {copy,tours}=window.TaxflyGuideData;
 assert.deepEqual(Object.keys(tours).sort(),[...G.SECTIONS].sort());
 for(const [key,words] of Object.entries(copy))assert.ok(words.length===3&&words.every(s=>typeof s==='string'&&s.trim()),key);
 for(const [id,tour] of Object.entries(tours)){
  assert.ok(tour.steps.length>=1&&tour.steps.length<=20,id);assert.ok(tour.name.length===3);
  assert.ok(!tour.url.includes('://'));for(const step of tour.steps){assert.equal(step.title.length,3);assert.equal(step.text.length,3);}
 }
 assert.doesNotMatch(read('assets/guide-data.js'),/\p{Extended_Pictographic}/u);
});
test('all signed-in screens load the same guide assets in dependency order and precache them',()=>{
 const assets=['guide-core.js','guide-data.js','guide-pages.js','guide.js'];
 for(const file of ['index.html','compras.html','planificacion.html','tickets.html','lugares.html','rutas.html','mis-cosas.html','grupo.html','tax.html','unidades.html']){
  const html=read(file);assert.ok(html.includes('assets/guide.css'));let last=-1;
  for(const name of assets){const at=html.indexOf('assets/'+name);assert.ok(at>last,file+name);last=at;}
 }
 for(const name of ['guide.css',...assets])assert.ok(read('sw.js').includes('./assets/'+name));
});
test('overview covers every page and individual page guides cover the complete calculator and major subtabs',()=>{
 const window={};for(const file of ['guide-data.js','guide-pages.js'])vm.runInNewContext(read('assets/'+file),{window});const {tours,pages}=window.TaxflyGuideData;
 assert.equal(pages.length,10);assert.equal(tours.overview.steps.length,10);
 assert.deepEqual(Array.from(tours.overview.steps,s=>s.url),Array.from(pages,id=>tours[id].url));
 assert.equal(tours.tax.steps.length,10);assert.ok(tours.tax.steps.some(s=>s.sel==='#split-toggle-lbl'));assert.ok(tours.tax.steps.some(s=>s.view?.tab==='cart'));
 for(const tab of ['gastos','resumen','talles','comparador'])assert.ok(tours.expenses.steps.some(s=>s.view?.tab===tab));
 for(const section of ['parques','outlets','comidas','walmart','reservas'])assert.ok(tours.planning.steps.some(s=>s.view?.section===section));
 for(const tour of Object.values(tours))for(const step of tour.steps)if(step.view)assert.ok(['calc','expense','place','unit','plan'].includes(step.view.kind));
});
