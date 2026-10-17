(function(root){
  "use strict";
  const groups={
    agenda:["itinerario"],
    atracciones:["customParks","parquesExtra","coordOverrides","parques","parquesExcel"],
    outlets:["hotel","days","visited","shopping"],
    comidas:["meals"],walmart:["walmart","wmChecked"],reservas:["reservations"]
  };
  function create(read,publish,onState,timeout=6000){
    const states={},jobs={};
    const names=["hotel","days","visited","meals","walmart","wmChecked","shopping","customParks","parquesExtra","coordOverrides","parques","budget","itinerario","tips","parquesExcel","reservations"];
    for(const name of names){
      states[name]="loading";
      jobs[name]=new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error("timeout")),timeout);
        Promise.resolve().then(()=>read(name)).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
      }).then(value=>{if(states[name]==="loading")publish(name,value);states[name]="ready";onState?.(name);return value;},()=>{if(states[name]!=="ready")states[name]="error";onState?.(name);return undefined;});
    }
    return {states,jobs,waitFor:section=>Promise.all((groups[section]||groups.agenda).map(name=>jobs[name]))};
  }
  const api={groups,create};root.PlanLoading=api;if(typeof module!=="undefined")module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
