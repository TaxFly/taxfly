(function(root){
'use strict';
const scope=c=>JSON.stringify([c.uid,c.profile,c.trip]);
const draftKey=(c,id)=>'taxfly-form-draft::'+JSON.stringify([c.uid,c.profile,c.trip,id]);
function readDraft(storage,c,id,now=Date.now()){
 try{const value=JSON.parse(storage.getItem(draftKey(c,id))||'null');return value?.schema===1&&value.scope===scope(c)&&value.id===id&&Number.isFinite(value.at)&&value.at<=now&&now-value.at<30*86400000&&value.values&&typeof value.values==='object'&&!Array.isArray(value.values)?value:null;}catch(_){return null;}
}
function writeDraft(storage,c,id,values,now=Date.now()){
 try{storage.setItem(draftKey(c,id),JSON.stringify({schema:1,scope:scope(c),id,at:now,values}));return true;}catch(_){return false;}
}
function reminderEvent(reservation,instant){
 const r=reservation.reminder;if(!r||!['event','checkin','expiry'].includes(r.kind)||![0,60,1440].includes(Number(r.lead)))return null;
 const at=instant(r.date,r.time,r.zone);return Number.isFinite(at)?{at,due:at-Number(r.lead)*60000,kind:r.kind}:null;
}
function reminderSignature(item,event){return JSON.stringify([item.id,event.kind,event.at,event.due]);}
function calendar(item,instant){
 const e=reminderEvent(item,instant);if(!e)return '';
 const stamp=at=>new Date(at).toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
 const escape=value=>String(value||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const uid=Array.from(String(item.id)).map(c=>c.codePointAt(0).toString(16)).join('-');
 // Fold by UTF-8 octets, including the continuation space, as required by ICS.
 const fold=line=>{let parts=[],part='',bytes=0;for(const ch of line){const size=new TextEncoder().encode(ch).length;if(bytes+size>73){parts.push(part);part=' ';bytes=1;}part+=ch;bytes+=size;}parts.push(part);return parts.join('\r\n');};
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TaxFly//Reservation reminder//EN','BEGIN:VEVENT','UID:'+uid+'@taxfly','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(e.at),'DTEND:'+stamp(e.at+60000),'SUMMARY:'+escape(item.name),'BEGIN:VALARM','TRIGGER:-PT'+Number(item.reminder.lead)+'M','ACTION:DISPLAY','DESCRIPTION:TaxFly','END:VALARM','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
function documentAvailability(item){
 const files=Array.isArray(item.files)?item.files:[];
 const ready=files.filter(f=>typeof f.dataUrl==='string'&&/^data:(?:image\/[\w.+-]+|application\/pdf);base64,/.test(f.dataUrl)&&f.dataUrl.length>f.dataUrl.indexOf(',')+1).length;
 return {count:files.length,ready,complete:files.length>0&&ready===files.length};
}
const routes=['index.html','compras.html','planificacion.html','lugares.html','tickets.html','mis-cosas.html','rutas.html','tax.html','grupo.html','unidades.html'];
function diagnostic(kind,page,duration,now=Date.now()){
 if(!Number.isFinite(now)||!['runtime','promise','resource','navigation','lcp','planning','documents','expenses'].includes(kind))return null;
 const value={kind,page:routes.includes(page)?page:'other',at:now};
 if(['navigation','lcp'].includes(kind)&&Number.isFinite(duration)&&duration>=0)value.ms=Math.min(3600000,Math.round(duration));
 return value;
}
const api={scope,draftKey,readDraft,writeDraft,reminderEvent,reminderSignature,calendar,documentAvailability,diagnostic};root.TaxflyCare=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
