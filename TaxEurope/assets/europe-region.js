(function(){
 document.documentElement.dataset.region='europe';
 const css=document.createElement('link');css.rel='stylesheet';css.href='assets/europe.css';document.head.appendChild(css);
 document.addEventListener('DOMContentLoaded',()=>{if(location.pathname.endsWith('/tickets.html')){document.title='TaxEurope — Documentos';const a=document.createElement('a');a.href='index.html';a.textContent='← TaxEurope · Inicio';a.style.cssText='display:block;padding:12px 20px;font-size:13px;color:#25447d;font-weight:800';document.body.prepend(a)}});
})();
