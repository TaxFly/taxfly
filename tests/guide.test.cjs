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
  assert.ok(tour.steps.length>=1&&tour.steps.length<=(id==='overview'?99:20),id);assert.ok(tour.name.length===3);
  assert.ok(!tour.url.includes('://'));for(const step of tour.steps){assert.equal(step.title.length,3);assert.equal(step.text.length,3);}
 }
 assert.doesNotMatch(read('assets/guide-data.js'),/\p{Extended_Pictographic}/u);
});
test('all signed-in screens load the same guide assets in dependency order and precache them',()=>{
 const assets=['guide-core.js','guide-data.js','guide-pages.js','mascot.js','guide.js'];
 for(const file of ['index.html','compras.html','planificacion.html','tickets.html','lugares.html','rutas.html','mis-cosas.html','grupo.html','tax.html','unidades.html']){
  const html=read(file);assert.ok(html.includes('assets/guide.css'));let last=-1;
  for(const name of assets){const at=html.indexOf('assets/'+name);assert.ok(at>last,file+name);last=at;}
 }
 for(const name of ['guide.css',...assets])assert.ok(read('sw.js').includes('./assets/'+name));
});
test('overview walks through every step of every tab guide, subtabs included',()=>{
 const window={};for(const file of ['guide-data.js','guide-pages.js'])vm.runInNewContext(read('assets/'+file),{window});const {tours,pages}=window.TaxflyGuideData;
 assert.equal(pages.length,10);
 const expected=pages.flatMap(id=>tours[id].steps.map(s=>[s.sel,tours[id].url]));
 assert.equal(JSON.stringify(Array.from(tours.overview.steps,s=>[s.sel,s.url])),JSON.stringify(expected));
 assert.ok(tours.overview.steps.length<=99,'resume index is bounded to 99');
 for(const step of tours.overview.steps)assert.match(step.title[0],/ · /);
 // every subtab is part of the general tour
 const views=new Set(tours.overview.steps.map(s=>s.view&&JSON.stringify(s.view)).filter(Boolean));
 for(const v of [{kind:'calc',tab:'individual'},{kind:'calc',tab:'cart'},{kind:'expense',tab:'gastos'},{kind:'expense',tab:'resumen'},{kind:'expense',tab:'talles'},{kind:'expense',tab:'comparador'},{kind:'place',tab:'lugares'},{kind:'place',tab:'actividades'},{kind:'place',tab:'notas'},{kind:'group',tab:'gastos'},{kind:'group',tab:'balances'},{kind:'group',tab:'resumen'},{kind:'unit',group:'grp-weight'},{kind:'unit',group:'grp-oz'},{kind:'unit',group:'grp-liquid'},{kind:'unit',group:'grp-length'}])assert.ok(views.has(JSON.stringify(v)),JSON.stringify(v));
 for(const sec of ['parques','outlets','comidas','walmart','reservas','lugares'])assert.ok(tours.overview.steps.some(s=>s.view?.section===sec),sec);
 for(const tab of ['itinerario','atracciones'])assert.ok(tours.overview.steps.some(s=>s.view?.section==='parques'&&s.view?.tab===tab),tab);
 for(const tab of ['cronograma','lista'])assert.ok(tours.overview.steps.some(s=>s.view?.section==='outlets'&&s.view?.tab===tab),tab);
 assert.equal(tours.tax.steps.length,10);assert.ok(tours.tax.steps.some(s=>s.sel==='#split-toggle-lbl'));
 for(const tour of Object.values(tours))for(const step of tour.steps)if(step.view)assert.ok(['calc','expense','place','unit','plan','group'].includes(step.view.kind));
});
test('the home tour does not depend on the self-dismissing offline card',()=>{
 const window={};for(const file of ['guide-data.js','guide-pages.js'])vm.runInNewContext(read('assets/'+file),{window});
 assert.ok(window.TaxflyGuideData.tours.home.steps.find(s=>s.sel==='#offline-readiness').optional);
});
test('guide opens the current tab guide first, no glow behind the mascot, and home sections stop reporting busy',()=>{
 const guide=read('assets/guide.js'),css=read('assets/guide.css'),home=read('assets/index-app.js');
 assert.match(guide,/launch\.onclick=\(\)=>openCurrent\(\)/);
 assert.match(guide,/help\.onclick=\(\)=>\{dismissSettings\(\);openCurrent\(\);\}/);
 assert.match(guide,/open:openCurrent,hub:openHub/);
 assert.doesNotMatch(css.match(/\.tfg-pet\{[^}]*\}/)[0],/gradient|shadow/);
 assert.match(home,/list\.removeAttribute\(["']aria-busy["']\)/);
 assert.doesNotMatch(guide,/errorSection/);
});
test('the general tour lets people jump or skip between tabs',()=>{
 const guide=read('assets/guide.js'),css=read('assets/guide.css');
 assert.match(guide,/data-jump/);assert.match(guide,/act==='skip-tab'/);assert.match(guide,/function overviewMap\(\)/);assert.match(css,/\.tfg-more>summary/);
 const window={};for(const file of ['guide-data.js','guide-pages.js'])vm.runInNewContext(read('assets/'+file),{window});
 const {tours,pages}=window.TaxflyGuideData;let at=0;
 for(const id of pages){assert.equal(tours.overview.steps[at].url,tours[id].url);at+=tours[id].steps.length;}
 assert.equal(at,tours.overview.steps.length);
});
test('the guide card is measured at its final width, locks page scroll and hides the launcher',()=>{
 const guide=read('assets/guide.js'),css=read('assets/guide.css');
 const pos=guide.slice(guide.indexOf('function position()'),guide.indexOf('function finish()'));
 assert.ok(pos.indexOf("width:cw+'px'")<pos.indexOf('card.offsetHeight'),'width is applied before measuring height');
 assert.match(pos,/room\.right>=cw/);assert.match(pos,/room\.left>=cw/);
 assert.match(guide,/lock\(true\)/);assert.match(guide,/lock\(false\)/);assert.match(guide,/addEventListener\('wheel',stopScroll/);
 assert.match(css,/html\.tfg-lock/);
});

test('the guide card scrolls inside itself, never covers the target and the mascot reacts',()=>{
 const guide=read('assets/guide.js'),css=read('assets/guide.css');
 const pos=guide.slice(guide.indexOf('function position()'),guide.indexOf('function finish()'));
 // Reading the height must not touch max-height (that used to reset the text scroll on every scroll event).
 assert.doesNotMatch(pos.slice(0,pos.indexOf('const box=')),/maxHeight/);
 assert.match(pos,/scrollHeight-sc\.clientHeight/);
 assert.match(guide,/card\.contains\(e\.target\)\)return/);
 assert.match(pos,/dockSide/);assert.match(pos,/window\.scrollBy/);
 assert.match(guide,/class="tfg-scroll"/);assert.match(css,/\.tfg-scroll\{[^}]*overflow-y:auto/);
 assert.match(css,/\.tfg-card\{[^}]*overflow:hidden/);
 // Expressions: every pose used must exist in the mascot engine.
 const poses=[...read('assets/mascot.js').match(/const POSES=\{[^\n]*/)[0].matchAll(/(\w+):\{ar:/g)].map(m=>m[1]);
 const used=[...guide.matchAll(/'(wave|cheer|think|happy|curious|surprised|sad|sleepy|point)'/g)].map(m=>m[1]);
 for(const name of used)assert.ok(poses.includes(name),name);
 assert.match(guide,/function stepMood/);assert.match(guide,/function react\(/);
});

test('first login forces profile creation, later logins go to the last profile of that account',()=>{
 const prof=read('assets/profiles-app.js'),index=read('assets/index-app.js');
 assert.doesNotMatch(prof,/nombre: t\.guest, foto: photos\[0\] \} \];\n\s+primaryProfileId = profiles\[0\]\.id/);
 assert.match(prof,/function routeAfterLogin\(\)/);assert.match(prof,/forceCreate = true;\s+openEditor\(null\)/);
 assert.match(prof,/taxfly_last_profile_/);assert.match(prof,/get\("auto"\) !== "1"/);
 assert.match(prof,/perfilActivoUid/);
 assert.match(index,/perfilActivoUid"\)!==u\.uid\)\{window\.location\.replace\("profiles\.html\?auto=1"\)/);
 assert.match(index,/window\.doLogout = \(\) => signOut\(auth\)\.then\(\(\) => \{[^}]*perfilActivoId/);
});
