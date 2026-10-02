(function(root){
  function calculate({amount,rate,included=true,tip=0,fee=0}) {
    for(const n of [amount,rate,tip,fee]) if(typeof n!=="number"||!Number.isFinite(n)||n<0) throw new RangeError("Ingresá importes válidos, mayores o iguales a cero.");
    if(rate>100)throw new RangeError("Revisá la tasa de IVA.");
    const net=included?amount/(1+rate/100):amount;
    const vat=included?amount-net:net*rate/100;
    const gross=included?amount:net+vat;
    return {net,vat,gross,total:gross+tip,vatCeiling:vat,refundIllustration:Math.max(0,vat-fee)};
  }
  const api={calculate};root.TaxEuropeTax=api;
  if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
