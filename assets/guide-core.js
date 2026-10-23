(function(root){
  'use strict';
  const VERSION=1;
  const SECTIONS=['home','budget','expenses','planning','reservations','outlets','food','walmart','places','documents','routes','packing','group','tax','units'];
  const key=(uid,profile)=>'taxfly-guide::'+JSON.stringify([VERSION,uid,profile]);
  function clean(value){
    const s=value&&typeof value==='object'?value:{};
    return {welcome:!!s.welcome,done:SECTIONS.filter(x=>Array.isArray(s.done)&&s.done.includes(x)),offers:SECTIONS.filter(x=>Array.isArray(s.offers)&&s.offers.includes(x)),resume:s.resume&&SECTIONS.includes(s.resume.section)&&Number.isInteger(s.resume.index)?{section:s.resume.section,index:Math.max(0,Math.min(10,s.resume.index))}:null};
  }
  function tripFields(value){
    const name=String(value.name||'').trim().slice(0,80),city=String(value.city||'').trim().slice(0,80),state=String(value.state||'').trim().slice(0,80);
    const date=v=>!v||/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
    if(!name||!city||!state)return {error:'required'};
    if(!date(value.startDate)||!date(value.endDate)||value.startDate&&value.endDate&&value.endDate<value.startDate)return {error:'datesError'};
    return {fields:{name,destinations:[{city,state}],startDate:value.startDate||'',endDate:value.endDate||''}};
  }
  const api={VERSION,SECTIONS,key,clean,tripFields};root.TaxflyGuideCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
