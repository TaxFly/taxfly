(function(root){
  "use strict";
  const groups={
    agenda:["itinerario"],
    atracciones:["customParks","parquesExtra","coordOverrides","parques","parquesExcel"],
    outlets:["days","visited"],outletShopping:["shopping"],
    comidas:["meals"],walmart:["walmart","wmChecked"],reservas:["reservations"]
  };
  function create(read,publish,onState,timeout=6000){
    const states={},jobs={},attempts={};
    const names=["hotel","days","visited","meals","walmart","wmChecked","shopping","customParks","parquesExtra","coordOverrides","parques","budget","itinerario","tips","parquesExcel","reservations"];
    function start(name){
      const attempt=attempts[name]=(attempts[name]||0)+1;
      states[name]="loading";
      jobs[name]=new Promise(resolve=>{
        const fail=()=>{if(attempt!==attempts[name]){resolve(undefined);return;}if(states[name]!=="ready"){states[name]="error";root.TaxflyDiagnostics?.record("planning");}onState?.(name);resolve(undefined);};
        const timer=setTimeout(fail,timeout);
        // A slow successful read must still recover after the UI timeout. A
        // snapshot already accepted as ready remains authoritative.
        Promise.resolve().then(()=>read(name)).then(value=>{
          clearTimeout(timer);
          if(attempt!==attempts[name]){resolve(undefined);return;}
          if(states[name]!=="ready")publish(name,value);
          states[name]="ready";onState?.(name);resolve(value);
        },()=>{clearTimeout(timer);fail();});
      });
      return jobs[name];
    }
    for(const name of names)start(name);
    return {states,jobs,waitFor:section=>Promise.all((groups[section]||groups.agenda).map(name=>jobs[name])),retry:()=>{const failed=names.filter(name=>states[name]==="error");const retried=failed.map(start);failed.forEach(name=>onState?.(name));return Promise.all(retried);}};
  }
  const api={groups,create};root.PlanLoading=api;if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
