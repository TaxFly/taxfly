(function(root) {
  'use strict';
  const normalize = value => String(typeof value === 'string' ? value : value?.text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function topic(value) {
    const s = normalize(value);
    const rules = [
      ['temperature', /°[fc]|fahrenheit|celsius/],
      ['entry', /\b(esta|visa|pasaporte|passport|passaporte|b1\/b2)\b/],
      ['customs', /aduana|aduaneir|franquicia|receita|sunat|sag\b|dian|duty free|e-dbv|djrv/],
      ['hotel', /hotel|resort fee|hospedagem|lodging|incidentals|alojamiento/],
      ['luggage', /equipaje|baggage|luggage|bagagem|maleta|carry-on|power bank|powerbank|liquidos|liquids/],
      ['parks', /disney|lightning lane|universal|hogwarts|express pass|theme park/],
      ['payments', /iof|spread|percepcion|conversion|transaction|comisiones|dcc|cambio|currency|ganancias|stop debit/],
      ['tipping', /propina|gratuity|gorjeta|tipping|tip of/],
      ['transit', /omny|metrorail|metrobus|clipper|\bmetro\b|\bbart\b|\bcta\b|\borca\b|\blynx\b|trolley|sunrail|flyaway|\brtd\b|monorail|streetcar|le pass|transbord|transfers|integracao|blue line|orange line|silver line/],
      ['weather', /huracan|hurricane|furacao|forecast|pronostico/],
      ['units-volume', /gallon|galon|galao|\bfl oz\b|pinta|\bpint\b|quart|mpg/],
      ['units-weight', /\blb\b|\blbs\b|libra|pound|\boz\b/],
      ['units-distance', /milla|mile|milha|\bmph\b|pulgada|inch|polegada|\bft\b|yarda|\byard\b|jarda/],
      ['shopping', /refurbished|open box|open-box|outlet|cupon|coupon|garantia|warranty|devolucion|return policy|recibo|receipt|tallas|size labels/]
    ];
    return rules.find(([,regex]) => regex.test(s))?.[0] || 'visit:' + s.slice(0, 40);
  }
  function priority(value) {
    const s=normalize(value);
    // Pintas, cuartos y yardas siguen disponibles, con menor frecuencia que referencias cotidianas.
    return /^(?:1|a) (?:us )?(?:pinta|pint|cuarto|quart|yarda|yard|jarda)/.test(s) ? 0.5 : 1;
  }
  function createRotation() {
    let signature='', seen=new Map();
    return {
      reset() { signature=''; seen.clear(); },
      nextIndex(list, current=0) {
        if (!Array.isArray(list) || list.length<2) return 0;
        const strings=list.map(v=>typeof v==='string'?v:v?.text||'');
        const nextSignature=JSON.stringify(strings);
        if (nextSignature!==signature) { signature=nextSignature; seen.clear(); }
        current=((Number(current)||0)%list.length+list.length)%list.length;
        const currentText=strings[current];
        if(!seen.has(currentText))seen.set(currentText,1);
        let candidates=Array.from({length:list.length-1},(_,i)=>(current+i+1)%list.length)
          .filter(i=>strings[i] && strings[i]!==currentText);
        if(!candidates.length)return current;
        const different=candidates.filter(i=>topic(list[i])!==topic(list[current]));
        if(different.length)candidates=different;
        const score=i=>(seen.get(strings[i])||0)/priority(list[i]);
        const selected=candidates.reduce((best,i)=>score(i)<score(best)?i:best,candidates[0]);
        seen.set(strings[selected],(seen.get(strings[selected])||0)+1);
        return selected;
      }
    };
  }
  const screens=new Map();
  const api={topic,priority,createRotation,
    nextIndex(list,current,screen='default') {
      if(!screens.has(screen))screens.set(screen,createRotation());
      return screens.get(screen).nextIndex(list,current);
    },
    reset(screen='default') { screens.get(screen)?.reset(); }
  };
  if(typeof module==='object' && module.exports)module.exports=api;
  root.TaxflyTips=api;
})(typeof window!=='undefined'?window:globalThis);
