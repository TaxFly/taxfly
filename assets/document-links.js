(function(root) {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const words = value => new Set(normalize(value).split(' ').filter(w => w.length > 2 && !['para','con','del','the','and','reserva','confirmacion','comprobante','orlando','enero','2027','pdf','jpg'].includes(w)));
  function kind(doc) {
    const text=normalize([doc.name,doc.provider,...(doc.files||[]).map(f=>f.name)].join(' '));
    if (/\b(airbnb|hotel|alojamiento|hospedaje|resort|lodging|booking)\b/.test(text)) return 'stay';
    if (/\b(vuelo|flight|boarding|aerolinea|aeropuerto|airline|avianca|latam|american)\b/.test(text)) return 'flight';
    if (doc.type==='🏨') return 'stay';
    if (doc.type==='✈️') return 'flight';
    return 'other';
  }
  function suggest(doc, reservations) {
    const type=kind(doc), text=normalize([doc.name,doc.provider,...(doc.files||[]).map(f=>f.name)].join(' '));
    const tokens=words(text);
    return (reservations||[]).map(r=>{
      let score=0; const reasons=[];
      const explicit=normalize(doc.reference).replace(/ /g,''),resRef=normalize(r.reference).replace(/ /g,'');
      if(explicit && resRef && explicit!==resRef)return {reservation:r,score:-100,reason:''};
      if(explicit && resRef===explicit){score+=16;reasons.push('Coincide el localizador');}
      const provider=normalize(doc.provider),rprovider=normalize(r.provider||r.name);
      if(provider&&rprovider&&(provider===rprovider||[...words(provider)].some(w=>words(rprovider).has(w)))){score+=5;reasons.push('Coincide el proveedor');}
      for(const field of ['startDate','endDate'])if(doc[field]&&r[field]&&doc[field]===r[field]){score+=4;reasons.push('Coincide '+(field==='startDate'?'la fecha de inicio':'la fecha final'));}
      if(doc.startDate&&r.startDate&&doc.startDate!==r.startDate && !(explicit&&resRef===explicit))score-=5;
      if(type===r.type && type!=='other'){score+=4;reasons.push(type==='stay'?(root.tfL3||function(a){return a})('Documento de alojamiento','Accommodation document','Documento de hospedagem'):(root.tfL3||function(a){return a})('Documento de vuelo','Flight document','Documento de voo'));}
      const ref=normalize(r.reference);
      if(ref && ref.length>=4 && text.includes(ref)){score+=8;reasons.unshift((root.tfL3||function(a){return a})('Coincide el código de reserva','Booking code matches','O código da reserva coincide'));}
      const overlap=[...words(r.name)].filter(w=>tokens.has(w));
      if(overlap.length){score+=Math.min(6,overlap.length*2);reasons.push((root.tfL3||function(a){return a})('Coincide el nombre','Name matches','O nome coincide'));}
      if(r.startDate && text.includes(normalize(r.startDate))){score+=3;reasons.push((root.tfL3||function(a){return a})('Coincide la fecha','Date matches','A data coincide'));}
      return {reservation:r,score,reason:reasons.join(' · ')};
    }).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score || String(a.reservation.name).localeCompare(String(b.reservation.name)));
  }
  const api={kind,suggest}; root.TaxflyDocumentLinks=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
