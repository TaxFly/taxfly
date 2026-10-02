(function(){
const $=id=>document.getElementById(id),data=window.TaxEuropeData;
const money=(n,c)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:c,currencyDisplay:'code'}).format(n);
for(const c of data.countries){const o=document.createElement('option');o.value=c.code;o.textContent=c.name;$('eu-country').append(o)}
$('eu-country').value='ES';
function countryChanged(){
 const c=data.country($('eu-country').value);$('eu-city').replaceChildren();$('eu-rate').replaceChildren();
 for(const name of c.cities){const o=document.createElement('option');o.value=name;o.textContent=name;$('eu-city').append(o)}
 for(const rate of [c.standardRate,...c.otherRates]){const o=document.createElement('option');o.value=String(rate);o.textContent=`${rate}%${rate===c.standardRate?' · tasa general':' · verificar producto en el comprobante'}`;$('eu-rate').append(o)}
 const manual=document.createElement('option');manual.value='manual';manual.textContent='Ingresar tasa del comprobante';$('eu-rate').append(manual);
 $('eu-currency').textContent=c.currency;$('eu-fee').value='0';$('eu-tip').value='0';$('eu-amount').value='';
 $('eu-country-note').textContent=`${c.taxName} · ${c.currency} · ${c.eu?'Unión Europea':'Fuera de la Unión Europea'}. ${c.code==='ES'?'Referencia: Península y Baleares; Canarias, Ceuta y Melilla tienen otros regímenes.':c.code==='PT'?'Referencia: Portugal continental; Madeira y Azores tienen otras tasas.':'Verificá las excepciones territoriales y la tasa del producto.'}`;
 $('eu-source').href=c.source;
 $('eu-refund-note').textContent=c.code==='GB'?'Gran Bretaña no ofrece la devolución turística habitual para bienes que llevás en el equipaje. Irlanda del Norte tiene un régimen distinto.':c.code==='CH'?'Suiza tiene su propio régimen: las condiciones de devolución requieren verificación específica.':'En la UE, verificá residencia, mínimos locales, documentos, plazos y validación aduanera. Hoteles y servicios consumidos no se tratan como bienes exportados.';
 calculate();
}
function calculate(){
 $('eu-custom-wrap').hidden=$('eu-rate').value!=='manual';
 try{
 const amount=$('eu-amount').valueAsNumber,rate=$('eu-rate').value==='manual'?$('eu-custom-rate').valueAsNumber:Number($('eu-rate').value);
 if($('eu-amount').value===''){for(const key of ['total','net','vat','refund'])$('eu-'+key).textContent='—';$('eu-error').textContent='Ingresá el importe en la moneda del país.';return}
 const result=window.TaxEuropeTax.calculate({amount,rate,included:$('eu-price-mode').value==='included',tip:$('eu-tip').valueAsNumber,fee:$('eu-fee').valueAsNumber});
 const c=data.country($('eu-country').value);for(const [key,value]of Object.entries({total:result.total,net:result.net,vat:result.vat,refund:result.refundIllustration}))$('eu-'+key).textContent=money(value,c.currency);
 $('eu-error').textContent='';
 }catch(e){$('eu-error').textContent=e.message;for(const key of ['total','net','vat','refund'])$('eu-'+key).textContent='—'}
}
$('eu-country').onchange=countryChanged;$('eu-tax-form').oninput=calculate;$('eu-tax-form').onsubmit=e=>e.preventDefault();
function cards(){
 const normalized=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const term=normalized($('eu-search').value);$('eu-country-cards').replaceChildren();
 for(const c of data.countries.filter(c=>normalized(c.name+' '+c.cities.join(' ')).includes(term))){const card=document.createElement('article');card.className='eu-country-card';const h=document.createElement('h3');h.textContent=c.name;const tag=document.createElement('small');tag.textContent=c.currency+' · '+c.taxName;const p=document.createElement('p');p.textContent=c.eu?'Unión Europea':'Europa · fuera de la UE';const links=document.createElement('div');links.className='eu-city-links';for(const city of c.cities){const a=document.createElement('a');a.textContent=city+' ↗';a.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(city+', '+c.name);a.target='_blank';a.rel='noopener';links.append(a)}card.append(h,tag,p,links);$('eu-country-cards').append(card)}
 $('eu-no-results').hidden=$('eu-country-cards').children.length>0;
}
$('eu-search').oninput=cards;$('eu-open-trips').onclick=()=>{if(window._taxflyTripUid)window.taxflyOpenTrips?.();else location.href='profiles.html'};
document.querySelectorAll('[data-trip-tool]').forEach(a=>a.onclick=e=>{const uid=window._taxflyTripUid,profile=window._taxflyTripProfile;if(!uid||window.TripContext.active(uid,profile)==='unassigned'){e.preventDefault();if(uid)window.taxflyOpenTrips?.();else location.href='profiles.html'}});
countryChanged();$('eu-amount').value='121';calculate();cards();
})();

document.getElementById('eu-switch-app').onclick=()=>document.getElementById('eu-switch-dialog').showModal();
