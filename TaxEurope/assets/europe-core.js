(function(root){
'use strict';
const finite=(x,name='importe')=>{if(typeof x!=='number'||!Number.isFinite(x)||x<0)throw new Error('Revisá '+name+'.');return x};
const round=x=>Math.round((x+Number.EPSILON)*100)/100;
function date(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error('Ingresá una fecha válida.');const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw new Error('Ingresá una fecha válida.');return d}
function exportDeadline(purchase,rule){const d=date(purchase);if(rule.deadline==='days90'){d.setUTCDate(d.getUTCDate()+90);return d.toISOString().slice(0,10)}if(rule.deadline==='month3')return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+4,0)).toISOString().slice(0,10);return null}
function taxFree(input,rule){
 finite(input.amount);const rate=finite(input.rate,'IVA');if(rate>100)throw new Error('Revisá la tasa de IVA.');const vat=input.vatAmount==null?input.amount-input.amount/(1+rate/100):finite(input.vatAmount,'IVA del comprobante');if(vat>input.amount)throw new Error('El IVA no puede superar el total de la compra.');finite(input.fee||0);
 const issues=[],unknown=[];
 if(!rule||!rule.verified)unknown.push('Revisar regla específica del país y territorio.');
 if(rule?.disabled&&!input.specialTerritory)issues.push('Este territorio no ofrece el régimen turístico habitual para bienes en el equipaje.');
 if(input.residency==='in')issues.push('La residencia indicada no cumple la condición general del territorio.');
 if(input.residency!=='in'&&input.residency!=='out')unknown.push('Confirmar residencia habitual fuera del territorio exigido.');
 if(input.exportGoods!==true)issues.push('Se requieren bienes exportados en el equipaje personal, no servicios consumidos.');
 if(!input.retailer)unknown.push('Confirmar comercio y documento de devolución.');
 if(input.specialTerritory)unknown.push('Territorio especial: no aplicar automáticamente la regla nacional.');
 if(rule?.minimum!=null){const basis=round(rule.basis==='net'?input.amount-vat:input.amount);if(rule.ambiguousMinimum&&basis===rule.minimum)unknown.push('Confirmar el umbral exacto con el comercio.');else if(rule.strict?basis<=rule.minimum:basis<rule.minimum)issues.push('El importe no alcanza el mínimo del régimen.');}
 if(rule?.age){if(!Number.isFinite(input.age))unknown.push('Falta confirmar la edad.');else if(input.age<rule.age)issues.push('No se cumple la edad mínima.');}
 if(rule?.maxStayMonths&&!input.shortStay)unknown.push('Confirmar duración de la estancia inferior a '+rule.maxStayMonths+' meses.');
 let deadline=null;
 if(input.purchaseDate&&rule){deadline=exportDeadline(input.purchaseDate,rule);if(input.exitDate&&deadline&&date(input.exitDate)>date(deadline))issues.push('La salida indicada supera el plazo de exportación.');if(input.exitDate&&date(input.exitDate)<date(input.purchaseDate))issues.push('La salida no puede ser anterior a la compra.');}
 else unknown.push('Falta la fecha de compra.');
 if(!input.exitDate)unknown.push('Falta la fecha prevista de salida del territorio fiscal.');
 return{vat:round(vat),illustration:round(Math.max(0,vat-(input.fee||0))),deadline,status:issues.length?'blocked':unknown.length?'review':'potential',issues,unknown};
}
function touristTax({nights,ages,rate,cap=null,ageMin=0,percent=false,netRoom=0}){
 if(!Number.isInteger(nights)||nights<1)throw new Error('Ingresá un número entero de noches.');
 if(!Array.isArray(ages)||!ages.length||ages.some(a=>!Number.isInteger(a)||a<0||a>120))throw new Error('Ingresá las edades de los huéspedes.');
 finite(rate,'tarifa');if(!Number.isInteger(ageMin)||ageMin<0||ageMin>120)throw new Error('Revisá la edad mínima.');if(cap!==null&&(!Number.isInteger(cap)||cap<1))throw new Error('Revisá el máximo de noches.');
 const chargeable=ages.filter(a=>a>=ageMin).length,chargedNights=cap===null?nights:Math.min(nights,cap);
 const total=percent?finite(netRoom,'precio del alojamiento sin IVA')*rate/100:chargeable*chargedNights*rate;
 return{total:round(total),chargeable,chargedNights};
}
function budget(records,base){
 const expenses=records.filter(r=>r.kind==='expense'&&!r.deleted),totals={},categories={},unconverted=[];let spent=0,refunds=0;
 for(const r of expenses){finite(r.amount);totals[r.currency]=round((totals[r.currency]||0)+r.amount);const factor=r.currency===base?1:r.baseCurrency===base&&r.fx>0?r.fx:null;
  if(factor===null){unconverted.push(r);continue}const value=r.amount*factor;spent+=value;categories[r.category||'Otros']=(categories[r.category||'Otros']||0)+value;
 }
 for(const r of records.filter(r=>r.kind==='refund'&&r.status==='received'&&!r.deleted)){const factor=r.currency===base?1:r.baseCurrency===base&&r.fx>0?r.fx:null;if(factor!==null)refunds+=finite(r.receivedAmount||0)*factor;else if(r.receivedAmount>0)unconverted.push(r)}
 const amount=records.find(r=>r.kind==='budget'&&r.currency===base&&!r.deleted)?.amount||0;
 return{base,budget:round(amount),spent:round(spent),refunds:round(refunds),netSpent:round(spent-refunds),remaining:round(amount-spent+refunds),totals,categories,unconverted};
}
function settle(expenses,members,base){
 if(new Set(members).size!==members.length)throw new Error('Los nombres del grupo deben ser únicos.');
 const cents=Object.fromEntries(members.map(m=>[m,0]));const excluded=[];
 for(const e of expenses){const people=e.participants||[];const factor=e.currency===base?1:e.baseCurrency===base&&e.fx>0?e.fx:null;if(!members.includes(e.payer)||!people.length||new Set(people).size!==people.length||people.some(p=>!members.includes(p))||factor===null){excluded.push(e);continue}
  const total=Math.round(finite(e.amount)*factor*100),part=Math.floor(total/people.length),rem=total%people.length;cents[e.payer]+=total;people.forEach((p,i)=>cents[p]-=part+(i<rem?1:0));
 }
 const creditors=Object.entries(cents).filter(([,v])=>v>0).map(([name,value])=>({name,value})),debtors=Object.entries(cents).filter(([,v])=>v<0).map(([name,value])=>({name,value:-value})),transfers=[];
 let i=0,j=0;while(i<debtors.length&&j<creditors.length){const value=Math.min(debtors[i].value,creditors[j].value);transfers.push({from:debtors[i].name,to:creditors[j].name,amount:value/100});debtors[i].value-=value;creditors[j].value-=value;if(!debtors[i].value)i++;if(!creditors[j].value)j++}
 return{balances:Object.fromEntries(Object.entries(cents).map(([k,v])=>[k,v/100])),transfers,excluded};
}
function mapsRoute(stops,mode='walking'){
 if(!Array.isArray(stops)||stops.length<2||stops.length>10)throw new Error('Elegí de 2 a 10 paradas para abrir una ruta.');
 if(stops.some(s=>typeof s!=='string'||!s.trim()||s.length>500))throw new Error('Completá las direcciones de las paradas.');
 const modes=['walking','transit','driving','bicycling'];if(!modes.includes(mode))throw new Error('Revisá el medio de transporte.');
 const url=new URL('https://www.google.com/maps/dir/');url.searchParams.set('api','1');url.searchParams.set('origin',stops[0]);url.searchParams.set('destination',stops.at(-1));url.searchParams.set('travelmode',mode);if(stops.length>2)url.searchParams.set('waypoints',stops.slice(1,-1).join('|'));return url.href;
}
function safeURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
const api={finite,round,date,exportDeadline,taxFree,touristTax,budget,settle,mapsRoute,safeURL};root.TaxEuropeCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
