(function(){
  "use strict";
  var state={accessLevel:"full",allowAI:true,isPrimary:false,loaded:false};
  function lang(){try{return localStorage.getItem("appLang")||"es"}catch(e){return"es"}}
  function msg(kind){var L={es:{ro:"Este perfil está en modo solo lectura.",del:"Este perfil no tiene permiso para eliminar contenido."},en:{ro:"This profile is read-only.",del:"This profile cannot delete content."},pt:{ro:"Este perfil está em modo somente leitura.",del:"Este perfil não pode excluir conteúdo."}};return (L[lang()]||L.es)[kind]}
  function notify(text){if(typeof window.showAlert==="function")window.showAlert(text);else alert(text)}
  function isSettings(el){return !!el.closest("#settingsDrawer,#sxModal,#menuOverlay");}
  function isNavigation(el){if(el.closest('#taxfly-guide,.tfg-launch,#taxfly-help-button,#tfg-first-steps'))return true;var a=el.closest("a[href]");if(a)return true;var raw=[el.id,el.className,el.getAttribute&&el.getAttribute("data-act"),el.getAttribute&&el.getAttribute("aria-label"),el.textContent].join(" ").toLowerCase();return /(menu|nav|back|volver|atrás|settings|ajustes|perfil|profile|idioma|language|theme|tema|cerrar|close|logout|salir|export|respaldo|backup|home|inicio)/.test(raw);}
  function isDelete(el){var raw=[el.id,el.className,el.getAttribute&&el.getAttribute("data-act"),el.getAttribute&&el.getAttribute("aria-label"),el.textContent].join(" ").toLowerCase();return /(delete|remove|trash|eliminar|borrar|excluir|remover)/.test(raw);}
  function isMutation(el){if(isSettings(el)||isNavigation(el))return false;var c=el.closest("button,input,textarea,select,[contenteditable=true]");if(!c)return false;if(c.matches("input:not([type=button]):not([type=submit]),textarea,select,[contenteditable=true]"))return true;var raw=[c.id,c.className,c.getAttribute&&c.getAttribute("data-act"),c.getAttribute&&c.getAttribute("aria-label"),c.textContent].join(" ").toLowerCase();return /(save|add|edit|delete|remove|create|upload|submit|generate|optimi|guardar|agregar|editar|eliminar|borrar|crear|subir|registrar|pagar|confirmar|generar|importar|excluir|salvar|adicionar)/.test(raw);}
  function guardEvent(e){var el=e.target;if(!el||!state.loaded||state.isPrimary)return;if(state.accessLevel==="readonly"&&isMutation(el)){e.preventDefault();e.stopImmediatePropagation();notify(msg("ro"));return;}if(state.accessLevel==="standard"&&isDelete(el.closest("button,a,[role=button]")||el)){e.preventDefault();e.stopImmediatePropagation();notify(msg("del"));}}
  document.addEventListener("click",guardEvent,true);document.addEventListener("submit",guardEvent,true);document.addEventListener("beforeinput",function(e){if(state.loaded&&!state.isPrimary&&state.accessLevel==="readonly"&&!isSettings(e.target)){e.preventDefault();notify(msg("ro"));}},true);
  async function load(){var pid="";try{pid=localStorage.getItem("perfilActivoId")||""}catch(e){}if(!pid||typeof window.taxflyWorker!=="function")return;try{var r=await window.taxflyWorker({type:"profile_controls_get",profile_ids:[pid]});var d=await r.json();if(!r.ok)return;var c=(d.controls||[]).find(function(x){return x.profileId===pid});if(c)state={...state,...c,loaded:true};else state.loaded=true;document.documentElement.setAttribute("data-profile-access",state.accessLevel);window.dispatchEvent(new CustomEvent("taxfly:profile-access",{detail:state}));}catch(e){state.loaded=true;}}
  window.taxflyProfileCan=function(action){if(state.isPrimary)return true;if(action==="delete")return state.accessLevel==="full";if(action==="edit")return state.accessLevel!=="readonly";if(action==="ai")return state.allowAI!==false&&state.accessLevel!=="readonly";return true};
  window.taxflyProfileAccess=function(){return {...state}};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load);else load();
})();

// --- Avatar del botón de ajustes: fuente única + auto-reparación ---
// Antes, cada página (tax.js, index-app.js, compras.js, rutas.js, etc.)
// reimplementaba por su cuenta "leer perfilActivoFoto y pintarlo en
// #btnSettings", en momentos distintos del ciclo de carga. Si algo repintaba
// el botón (ej. buildNav() de ui.js al cambiar idioma) después de que esa
// copia particular corriera, la foto desaparecía. Esto no reemplaza esas
// copias (para no tocar 13 archivos a ciegas), sino que agrega un único
// punto que vuelve a aplicar la foto cada vez que detecta que el botón la
// perdió, sin importar cuál de esas copias falló.
(function(){
  "use strict";
  function getFoto(){try{return localStorage.getItem("perfilActivoFoto")||""}catch(e){return""}}
  function paint(btn,foto){
    if(!btn||!foto)return;
    var want="url(\""+foto+"\")";
    if(btn.style.backgroundImage!==want)btn.style.backgroundImage=want;
    if(btn.textContent)btn.textContent="";
  }
  function applyAvatar(){
    var foto=getFoto();
    if(!foto)return;
    ["btnSettings","btnSettings2"].forEach(function(id){paint(document.getElementById(id),foto)});
  }
  window.taxflyApplyAvatar=applyAvatar;
  window.addEventListener("taxfly:profile-updated",applyAvatar);
  window.addEventListener("taxfly:profile-access",applyAvatar);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",applyAvatar);else applyAvatar();
  // Auto-reparación: si algo repinta el nav (cambio de idioma, re-render,
  // etc.) y el botón se queda sin la imagen de fondo, la reaplicamos apenas
  // el DOM vuelve a cambiar.
  function watch(){
    var mo=new MutationObserver(function(){
      var foto=getFoto();
      if(!foto)return;
      ["btnSettings","btnSettings2"].forEach(function(id){
        var btn=document.getElementById(id);
        if(btn&&!btn.style.backgroundImage)paint(btn,foto);
      });
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.body)watch();else document.addEventListener("DOMContentLoaded",watch);
})();
