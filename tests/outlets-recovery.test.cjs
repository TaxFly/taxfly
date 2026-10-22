const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../assets/plan-loading.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('outlet schedule does not depend on hotel or shopping requests',async()=>{
 const load=P.create(name=>['hotel','shopping'].includes(name)?Promise.reject(Error('offline')):Promise.resolve(null),()=>{},()=>{});
 await load.waitFor('outlets');await Promise.all(Object.values(load.jobs));
 assert.deepEqual(P.groups.outlets,['days','visited']);assert.equal(load.states.days,'ready');assert.equal(load.states.shopping,'error');
});
test('a successful slow read recovers after timeout without losing its value',async()=>{
 let finish;const published=[];
 const load=P.create(name=>name==='days'?new Promise(resolve=>finish=resolve):Promise.resolve(null),(name,value)=>published.push([name,value]),()=>{},5);
 await load.waitFor('outlets');assert.equal(load.states.days,'error');
 finish({days:[{id:'saved'}]});await tick();assert.equal(load.states.days,'ready');assert.deepEqual(published.find(([name])=>name==='days')[1],{days:[{id:'saved'}]});
});
test('retry recovers failed reads and ignores older timed-out responses',async()=>{
 let oldFinish,attempt=0;const values=[];
 const load=P.create(name=>name!=='days'?null:++attempt===1?new Promise(resolve=>oldFinish=resolve):{days:['new']},(name,value)=>{if(name==='days')values.push(value)},()=>{},5);
 await load.waitFor('outlets');await load.retry();oldFinish({days:['old']});await tick();
 assert.equal(load.states.days,'ready');assert.deepEqual(values,[{days:['new']}]);
});
test('snapshot accepted during a timeout stays authoritative',async()=>{
 let finish;const values=[];const load=P.create(name=>name==='days'?new Promise(resolve=>finish=resolve):null,(name,v)=>{if(name==='days')values.push(v)},()=>{},5);
 await load.waitFor('outlets');load.states.days='ready';finish({days:['stale']});await tick();assert.deepEqual(values,[]);
});
test('outlet errors retain tab switching and retry, with separate readiness for purchases',()=>{
 const s=fs.readFileSync(require.resolve('../assets/plan-app.js'),'utf8');
 const panel={dataset:{},setAttribute(){},removeAttribute(){},innerHTML:''};
 const window={PlanLoading:P,_planInitialState:{days:'ready',visited:'ready',shopping:'error'}};
 const c=vm.createContext({window,document:{getElementById:()=>panel},outletSubTab:'cronograma',escapeHtml:s=>s,outletTabsHTML:()=>'<nav>tabs</nav>'});
 vm.runInContext(s.slice(s.indexOf('function planPanelPending(section) {'),s.indexOf('window.planPanelPending=')),c);
 assert.equal(c.planPanelPending('outlets'),false);c.outletSubTab='lista';assert.equal(c.planPanelPending('outlets'),true);
 assert.match(panel.innerHTML,/tabs/);assert.match(panel.innerHTML,/retryPlanningLoads/);
});
