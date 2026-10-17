// Controlled startup measurements: no browser, production network or private data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{performance}=require('node:perf_hooks');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
const slice=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
function harness(root,{legacy=false,pending=false,readMs=20,writeMs=200}={}){
 const localStorage=storage(),window={dispatchEvent(){},addEventListener(){}},db={},counts={reads:0,writes:0};
 const trip={id:'orlando',name:'Orlando',destinations:[{city:'Orlando',state:'Florida'}]};
 if(legacy)localStorage.setItem('orlando-hotel-v1::p',JSON.stringify({addr:'QA hotel'}));
 if(pending)localStorage.setItem('trip-planning-pending::u::p',JSON.stringify({orlando:trip}));
 const collection=(_,...p)=>p.join('/');
 const getDocs=async ref=>{counts.reads++;await sleep(readMs);const docs=!legacy&&ref.endsWith('/tripPlanning')?[{id:'orlando',data:()=>trip}]:[];return {docs,empty:!docs.length,metadata:{fromCache:false},forEach:cb=>docs.forEach(cb)};};
 const setDoc=async()=>{counts.writes++;await sleep(writeMs);};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/trip-context.js'),'utf8'),{window,localStorage,navigator:{onLine:true},setTimeout,clearTimeout,CustomEvent:class{},console});
 const tc=window.TripContext;tc.configure({db,collection,getDocs,setDoc,doc:()=>({})});
 return {tc,window,db,localStorage,getDocs,collection,setDoc,counts};
}
async function sample(root,scenario){
 const h=harness(root,{legacy:scenario==='legacy',pending:scenario==='pending'}),start=performance.now();let elapsed;
 if(scenario==='duplicate')await Promise.all([h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection),h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection)]);
 if(scenario==='legacy')await h.tc.hydrate(h.db,'u','p',h.getDocs,h.collection);
 if(scenario==='pending'){
  let finished;const hydrate=h.tc.hydrate;h.tc.hydrate=(...args)=>(finished=hydrate(...args));
  const c=vm.createContext({...h,window:h.window,currentUid:'u',currentPerfilId:'p',activeTripId:'unassigned',trips:[],doc:()=>({}),updateDoc(){},deleteDoc(){},location:{reload(){}},console});
  vm.runInContext(`function publishTrip(){trips=window.TripContext.readTrips('u','p');activeTripId=window.TripContext.active('u','p');}\n`+slice(fs.readFileSync(path.join(root,'assets/plan-firebase.js'),'utf8'),'async function loadTrips()','function listenTripDocuments()'),c);
  await c.loadTrips();elapsed=performance.now()-start;await finished;
 }
 return {ms:Number((elapsed??performance.now()-start).toFixed(2)),...h.counts};
}
async function measure(root){
 const result={};for(const scenario of ['duplicate','legacy','pending']){
  const samples=[];for(let i=0;i<3;i++)samples.push(await sample(root,scenario));
  const ordered=samples.map(x=>x.ms).sort((a,b)=>a-b);
  result[scenario]={medianMs:ordered[1],minMs:ordered[0],maxMs:ordered[2],reads:samples[0].reads,writes:samples[0].writes};
 }
 const html=fs.readFileSync(path.join(root,'planificacion.html'),'utf8');
 result.initialLeaflet={blockingScripts:(html.match(/<script\s+src="https:\/\/[^\"]*leaflet[^\"]*"\s*>/g)||[]).length,blockingStylesheets:(html.match(/<link[^>]+href="https:\/\/[^\"]*leaflet[^\"]*"/g)||[]).length};
 return result;
}
async function main(){
 const args=process.argv.slice(2),arg=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
 const result={conditions:{readLatencyMs:20,pendingWriteLatencyMs:200,samplesPerScenario:3,scope:'Controlled Node simulation, not browser LCP or production Firebase latency'},current:await measure(path.resolve(__dirname,'..'))};
 if(arg('--baseline'))result.baseline=await measure(path.resolve(arg('--baseline')));
 const text=JSON.stringify(result,null,2);if(arg('--output'))fs.writeFileSync(arg('--output'),text+'\n');console.log(text);
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={harness,sample,measure};
