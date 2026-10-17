const fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const P=require('../assets/plan-loading.js');
const args=process.argv.slice(2),baseline=args[args.indexOf('--baseline')+1];
if(!args.includes('--baseline')||!baseline)throw Error('Pass --baseline /path/to/previous/taxfly-main');
const source=fs.readFileSync(path.join(baseline,'assets/plan-firebase.js'),'utf8');
const names=[...source.matchAll(/withTimeout\(fbGet\("([^"]+)"\)/g)].map(match=>match[1]);
if(names.length!==16)throw Error('Expected the previous 16-document startup barrier');
async function sample(current){
 let reads=0;const read=name=>{reads++;return new Promise(resolve=>setTimeout(()=>resolve({}),name==='walmart'?200:20));};
 const start=performance.now();let done;
 if(current){const loading=P.create(read,()=>{},()=>{});await loading.waitFor('agenda');done=Promise.all(Object.values(loading.jobs));}
 else {await Promise.all(names.map(read));done=Promise.resolve();}
 const interactiveMs=performance.now()-start;await done;return {interactiveMs,reads};
}
(async()=>{
 const result={conditions:{samples:3,normalDocumentMs:20,unrelatedWalmartDocumentMs:200,section:'agenda',scope:'Controlled Node simulation, not a browser or production Firebase measurement'}};
 for(const [label,current] of [['baseline',false],['current',true]]){
  const rows=[];for(let i=0;i<3;i++)rows.push(await sample(current));
  const values=rows.map(row=>row.interactiveMs).sort((a,b)=>a-b);result[label]={medianMs:+values[1].toFixed(2),minMs:+values[0].toFixed(2),maxMs:+values[2].toFixed(2),reads:rows[0].reads};
 }
 const json=JSON.stringify(result,null,2);const output=args[args.indexOf('--output')+1];if(args.includes('--output'))fs.writeFileSync(output,json+'\n');console.log(json);
})();
