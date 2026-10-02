(function(){
  "use strict";
  const root=new URL('../',document.currentScript.src);
  const inEurope=location.pathname.startsWith(new URL('TaxEurope/',root).pathname);
  const entry=['login.html','profiles.html','selector.html'].includes(location.pathname.split('/').pop());
  const region=()=>inEurope?'europe':entry&&localStorage.getItem('taxfly_destino')==='europe'?'europe':'usa';
  function home(app){return new URL(app==='europe'?'TaxEurope/index.html':'index.html',root).href;}
  function enter(app){if(!['usa','europe'].includes(app))return;localStorage.setItem('taxfly_destino',app);localStorage.removeItem('taxusa_pending_redirect');location.href=home(app);}
  function selector(){return new URL('selector.html',root).href;}
  function showSwitcher(){
    let dialog=document.getElementById('taxfly-app-switcher');
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='taxfly-app-switcher';
      dialog.style.cssText='border:1px solid #cbd5e1;border-radius:18px;padding:28px;max-width:90vw;background:#f8fafc;color:#172b5a;font-family:inherit';
      const lang=localStorage.getItem('appLang')||'es';
      const labels={es:['Cambiar app','Cancelar'],en:['Switch app','Cancel'],pt:['Trocar app','Cancelar']}[lang]||['Cambiar app','Cancelar'];
      const title=document.createElement('h2');title.textContent=labels[0];title.style.marginTop='0';dialog.append(title);
      for(const [value,label]of [['usa','TaxUSA'],['europe','TaxEurope'],['',labels[1]]]){
        const button=document.createElement('button');button.type='button';button.textContent=label;
        button.style.cssText='padding:12px 20px;margin:4px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#172b5a;font:inherit;cursor:pointer';
        button.onclick=()=>{dialog.close();if(value)enter(value)};dialog.append(button);
      }
      document.body.append(dialog);
    }
    if(!dialog.open)dialog.showModal();
  }
  function destination(value){
    if(!value)return null;
    try{const url=new URL(value,root);if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return null;
      const relative=url.pathname.slice(root.pathname.length);
      const pages=['index.html','tax.html','taxfree.html','alojamiento.html','compras.html','itinerario.html','planificacion.html','grupo.html','tickets.html','mis-cosas.html','rutas.html','lugares.html','unidades.html','profiles.html'];
      const file=relative.replace(/^TaxEurope\//,'');if(!pages.includes(file))return null;
      return new URL((relative.startsWith('TaxEurope/')||region()==='europe'?'TaxEurope/':'')+file,root).href+url.search+url.hash;
    }catch(e){return null;}
  }
  window.TaxflyRoutes={root:root.href,inEurope,region,home,enter,selector,destination,showSwitcher};
  if(inEurope)localStorage.setItem('taxfly_destino','europe');
})();
