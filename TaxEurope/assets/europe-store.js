(function(root){
'use strict';
const kinds=new Set(['config','budget','expense','refund','stay','plan','reservation','place','packing','member','note','route']);
function valid(r){
 if(!r||!/^eu_[a-zA-Z0-9_-]{1,100}$/.test(r.id)||!kinds.has(r.kind)||typeof r.rev!=='string'||r.rev.length>120||JSON.stringify(r).length>60000)throw new Error('El registro no tiene un formato válido.');
 if(!r.deleted){
  for(const field of ['amount','receivedAmount','roomPrice','taxTotal','fee','vatAmount','rate','fx','netRoom'])if(r[field]!=null&&(typeof r[field]!=='number'||!Number.isFinite(r[field])||r[field]<0))throw new Error('Importe inválido en la copia: '+field);
  if(['expense','budget','refund'].includes(r.kind)&&(typeof r.amount!=='number'||!Number.isFinite(r.amount)||r.amount<0||! /^[A-Z]{3}$/.test(r.currency)))throw new Error('Falta el importe o moneda del registro.');
  if(r.participants!=null&&(!Array.isArray(r.participants)||r.participants.some(x=>typeof x!=='string')||new Set(r.participants).size!==r.participants.length))throw new Error('Participantes inválidos.');
  if(r.ages!=null&&(!Array.isArray(r.ages)||r.ages.some(x=>!Number.isInteger(x)||x<0||x>120)))throw new Error('Edades inválidas.');
  if(r.kind==='config'&&! /^[A-Z]{3}$/.test(r.baseCurrency))throw new Error('Moneda base inválida.');
  if(['member','expense','refund','stay','plan','reservation','place','packing','note','route'].includes(r.kind)&&(typeof r.name!=='string'||!r.name.trim()||r.name.length>5000))throw new Error('Falta el nombre del registro.');
  for(const field of ['currency','baseCurrency'])if(r[field]!=null&&! /^[A-Z]{3}$/.test(r[field]))throw new Error('Moneda inválida.');
 }
 return r;
}
function createStore({storage,scope,clock=()=>Date.now(),uuid=()=>crypto.randomUUID(),changed=()=>{}}){
 if(!scope?.uid||!scope?.profile||!scope?.trip||scope.trip==='unassigned')throw new Error('Elegí un perfil y un viaje europeo.');
 const key=['taxeurope-workspace-v1',scope.uid,scope.profile,scope.trip].join('::');let state={version:1,records:{},pending:{}};let sequence=0,lastClock=0;const device=uuid();const stamp=()=>{lastClock=Math.max(clock(),lastClock+1,...Object.values(state.records).map(r=>(Number(r.rev.slice(0,16))||0)+1));return String(lastClock).padStart(16,'0')};
 function read(){let parsed;try{parsed=JSON.parse(storage.getItem(key)||'null')}catch{throw new Error('No se pudo leer el registro local. Exportá una copia antes de intentar restaurar.');}if(parsed){if(parsed.version!==1||!parsed.records||!parsed.pending)throw new Error('Formato local no compatible.');for(const r of Object.values(parsed.records))valid(r);state=parsed}}
 read();
 function commit(next){storage.setItem(key,JSON.stringify(next));state=next;changed()}
 function write(kind,fields,id,deleted=false){if(!kinds.has(kind))throw new Error('Tipo de registro inválido.');const rev=stamp()+'-'+device+'-'+String(++sequence).padStart(8,'0');const record=valid({...fields,id:id||'eu_'+uuid(),kind,rev,updatedAt:clock(),deleted});commit({...state,records:{...state.records,[record.id]:record},pending:{...state.pending,[record.id]:rev}});return record}
 function put(kind,fields,id){return write(kind,fields,id)}
 function remove(id){const old=state.records[id];if(old)write(old.kind,old,id,true)}
 function merge(records){let map={...state.records};for(const incoming of records){const r=valid(incoming);if(!state.pending[r.id]&&(!map[r.id]||r.rev>map[r.id].rev))map[r.id]=r}commit({...state,records:map})}
 function ack(id,rev){if(state.pending[id]!==rev)return;const next={...state.pending};delete next[id];commit({...state,pending:next})}
 function backup(){return{app:'TaxEurope',version:1,scope:{...scope},exportedAt:new Date(clock()).toISOString(),records:Object.values(state.records)}}
 function restore(value){if(value?.app!=='TaxEurope'||value.version!==1||!Array.isArray(value.records)||value.records.length>5000)throw new Error('El archivo no es un respaldo compatible de TaxEurope.');if(value.scope?.uid!==scope.uid||value.scope?.profile!==scope.profile||value.scope?.trip!==scope.trip)throw new Error('Este respaldo corresponde a otro usuario, perfil o viaje. Seleccioná el viaje original para restaurarlo.');for(const r of value.records)valid(r);let records={...state.records},pending={...state.pending};for(const r of value.records){const updated={...r,rev:stamp()+'-'+device+'-'+String(++sequence).padStart(8,'0')};records[r.id]=updated;pending[r.id]=updated.rev}commit({...state,records,pending})}
 function list(kind){return Object.values(state.records).filter(r=>!r.deleted&&(!kind||r.kind===kind)).sort((a,b)=>b.rev.localeCompare(a.rev))}
 function reload(){read();changed()}
 return{scope,key,put,remove,merge,ack,backup,restore,list,reload,get pending(){return Object.entries(state.pending).map(([id,rev])=>({id,rev,record:state.records[id]}))}};
}
root.TaxEuropeStore={createStore,valid};if(typeof module!=='undefined')module.exports=root.TaxEuropeStore;
})(typeof window!=='undefined'?window:globalThis);
