(function(root) {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const words = value => new Set(normalize(value).split(' ').filter(w => w.length > 2 && !['para','con','del','the','and','reserva','confirmacion','comprobante','orlando','enero','2027','pdf','jpg'].includes(w)));
  function kind(doc) {
    const text=normalize([doc.name,...(doc.files||[]).map(f=>f.name)].join(' '));
    if (/\b(airbnb|hotel|alojamiento|hospedaje|resort|lodging|booking)\b/.test(text)) return 'stay';
    if (/\b(vuelo|flight|boarding|aerolinea|aeropuerto|airline|avianca|latam|american)\b/.test(text)) return 'flight';
    if (doc.type==='🏨') return 'stay';
    if (doc.type==='✈️') return 'flight';
    return 'other';
  }
  function suggest(doc, reservations) {
    const type=kind(doc), text=normalize([doc.name,...(doc.files||[]).map(f=>f.name)].join(' '));
    const tokens=words(text);
    return (reservations||[]).map(r=>{
      let score=0; const reasons=[];
      if(type===r.type && type!=='other'){score+=4;reasons.push(type==='stay'?'Documento de alojamiento':'Documento de vuelo');}
      const ref=normalize(r.reference);
      if(ref && ref.length>=4 && text.includes(ref)){score+=8;reasons.unshift('Coincide el código de reserva');}
      const overlap=[...words(r.name)].filter(w=>tokens.has(w));
      if(overlap.length){score+=Math.min(6,overlap.length*2);reasons.push('Coincide el nombre');}
      if(r.startDate && text.includes(normalize(r.startDate))){score+=3;reasons.push('Coincide la fecha');}
      return {reservation:r,score,reason:reasons.join(' · ')};
    }).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score || String(a.reservation.name).localeCompare(String(b.reservation.name)));
  }
  const api={kind,suggest}; root.TaxflyDocumentLinks=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
