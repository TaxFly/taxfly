(function(){
  "use strict";
  function attach(){
    const scroll=document.querySelector("#settingsDrawer .sx-scroll");
    if(!scroll || document.getElementById("planSettingsExtras")) return;
    const ai=[...scroll.querySelectorAll(".sx-sec")].find(el=>/inteligencia|artificial|artificial intelligence|inteligência/i.test(el.textContent||""));
    const wrap=document.createElement("div"); wrap.id="planSettingsExtras";
    wrap.innerHTML='<span class="sx-sec">Presupuesto del viaje</span><div class="sx-card" style="padding:12px"><div id="budget-box"></div></div><span class="sx-sec">Planificación</span><div class="sx-card"><button type="button" class="sx-row" data-wipe="outlets"><span class="sx-lbl">Vaciar lugares</span></button><button type="button" class="sx-row" data-wipe="comidas"><span class="sx-lbl">Vaciar comidas</span></button><button type="button" class="sx-row" data-wipe="walmart"><span class="sx-lbl">Vaciar supermercado</span></button><button type="button" class="sx-row" data-wipe="parques"><span class="sx-lbl">Vaciar parques</span></button></div>';
    if(ai) scroll.insertBefore(wrap,ai); else scroll.appendChild(wrap);
    wrap.addEventListener("click",e=>{const b=e.target.closest("[data-wipe]");if(b&&typeof window.wipeSection==="function")window.wipeSection(b.dataset.wipe);});
    try{window.renderBudgetBox&&window.renderBudgetBox();}catch(e){}
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(attach,0));else setTimeout(attach,0);
  window.addEventListener("load",()=>setTimeout(attach,0));
})();
