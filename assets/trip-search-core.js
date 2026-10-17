(function(root){
  'use strict';
  const sources=['reservations','itinerario','days','documents','activities','notes','expenses'];
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const scope=context=>JSON.stringify([context.uid,context.profile,context.trip]);
  function records(context,source,value){
    const out=[],trip=context.trip;
    const add=(kind,id,title,detail,href)=>{if(title)out.push({source,kind,id:String(id),title:String(title),detail:String(detail||''),href});};
    const join=(...values)=>values.filter(Boolean).map(String).join(' · ');
    if(source==='reservations')for(const r of value?.items||[])add('reservation',r.id,r.name,join(r.provider,r.reference,r.startDate,r.endDate,r.address,r.notes),'planificacion.html?section=reservas&reservation='+encodeURIComponent(r.id));
    if(source==='itinerario')for(const day of value?.dias||[])for(const block of day.bloques||[])add('stop',day.id+':'+block.id,block.titulo,join(day.nombre,day.fecha,block.hora,block.zona,block.obs),'planificacion.html?section=parques&searchDay='+encodeURIComponent(day.id)+'&searchStop='+encodeURIComponent(block.id));
    if(source==='days')for(const [index,day] of (value?.days||[]).entries())for(const stop of day.stops||[])add('stop',index+':'+(stop.id||normalize(stop.name)),stop.name,join(day.dayName,day.date,stop.note,stop.desc,stop.address),'planificacion.html?section=outlets&searchOutletDay='+index+'&searchOutletName='+encodeURIComponent(stop.name));
    const kinds={documents:'document',activities:'event',notes:'note',expenses:'expense'};
    if(kinds[source])for(const item of Array.isArray(value)?value:[]){
      if((item.tripId||'unassigned')!==trip)continue;
      const title=item.name||item.nombre||item.title||item.titulo||item.text||item.texto;
      const detail=join(item.provider,item.reference,item.date,item.fecha&&typeof item.fecha==='string'?item.fecha:'',item.time,item.address,item.description,item.note,item.notes,item.content,item.text,item.texto,item.body,...(item.files||[]).map(file=>file.name));
      const href=source==='documents'?'tickets.html?doc='+encodeURIComponent(item.id):source==='expenses'?'compras.html?searchExpense='+encodeURIComponent(item.id):'lugares.html?searchKind='+encodeURIComponent(kinds[source])+'&searchItem='+encodeURIComponent(item.id);
      add(kinds[source],item.id,title,detail,href);
    }
    return out;
  }
  function merge(previous,updates){
    const map=new Map((previous||[]).filter(item=>sources.includes(item.source)).map(item=>[item.source+':'+item.id,item]));
    for(const update of updates){if(!sources.includes(update.source)||!update.confirmed)continue;if(update.authoritative!==false)for(const [key,item] of map)if(item.source===update.source)map.delete(key);for(const item of update.records)map.set(item.source+':'+item.id,item);}
    return [...map.values()];
  }
  function search(items,query,language='es'){
    const tokens=normalize(query).split(' ').filter(Boolean);if(!tokens.length)return [];
    return (items||[]).map(item=>({item,title:normalize(item.title),text:normalize(item.title+' '+item.detail)})).filter(row=>tokens.every(token=>row.text.includes(token))).sort((a,b)=>{
      const rank=row=>tokens.reduce((score,token)=>score+(row.title.startsWith(token)?4:row.title.includes(token)?2:0),0);
      return rank(b)-rank(a)||a.item.title.localeCompare(b.item.title,language);
    }).map(row=>row.item);
  }
  function safeHref(value,base){try{const url=new URL(value,base),origin=new URL(base);if(url.origin!==origin.origin||!['planificacion.html','tickets.html','compras.html','lugares.html'].includes(url.pathname.split('/').pop()))return '';return url.href;}catch(_){return '';}}
  const api={sources,scope,normalize,records,merge,search,safeHref};root.TaxflyTripSearch=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
