(function(){
  'use strict';
  const L=(...words)=>window.tfL3(...words),core=window.TaxflyTripSearch;
  let dialog,input,results,status,refresh,title,close,generation=0,context=null,items=[],phase='loading';
  function kind(item){return {reservation:L('Reserva','Booking','Reserva'),document:L('Documento','Document','Documento'),stop:L('Parada','Stop','Parada'),event:L('Evento','Event','Evento'),note:L('Nota','Note','Nota'),expense:L('Gasto','Expense','Gasto')}[item.kind]||'';}
  function sameContext(){const current=window.taxflyTripSearchContext?.();return current&&context&&core.scope(current)===core.scope(context);}
  function text(){
    title.textContent=L('Buscar en el viaje','Search this trip','Buscar nesta viagem');
    input.placeholder=L('Reservas, documentos o paradas…','Bookings, documents or stops…','Reservas, documentos ou paradas…');
    input.setAttribute('aria-label',title.textContent);close.setAttribute('aria-label',L('Cerrar búsqueda','Close search','Fechar busca'));
    refresh.textContent=L('Actualizar','Refresh','Atualizar');
  }
  function render(){
    if(!dialog?.open)return;
    text();results.replaceChildren();
    if(phase==='loading'){status.textContent=L('Cargando datos del viaje…','Loading trip data…','Carregando dados da viagem…');return;}
    if(phase==='unavailable'){status.textContent=L('No se pudo consultar el viaje. Esperá a que cargue el perfil y reintentá.','Could not load this trip. Wait for the profile to load and retry.','Não foi possível consultar a viagem. Aguarde o perfil carregar e tente novamente.');return;}
    if(!sameContext()){invalidate();return;}
    const found=core.search(items,input.value,localStorage.getItem('appLang')||'es');
    status.textContent=phase==='refreshing'?L('Mostrando datos guardados mientras se actualizan…','Showing saved data while refreshing…','Exibindo dados salvos durante a atualização…'):phase==='error'?L('No se pudieron actualizar todos los datos. Se muestran los disponibles.','Some data could not be refreshed. Available results are shown.','Não foi possível atualizar todos os dados. Os disponíveis são exibidos.'):phase==='local'?L('Resultados guardados en este dispositivo.','Results saved on this device.','Resultados salvos neste dispositivo.'):'';
    if(!input.value.trim()){const hint=document.createElement('p');hint.textContent=L('Escribí un nombre, código o lugar para buscar.','Enter a name, code or place to search.','Digite um nome, código ou lugar para buscar.');results.append(hint);return;}
    const count=document.createElement('p');
    const n=new Intl.NumberFormat(localStorage.getItem('appLang')||'es').format(found.length);
    count.textContent=found.length?L(n+' resultado'+(found.length===1?'':'s'),n+' result'+(found.length===1?'':'s'),n+' resultado'+(found.length===1?'':'s')):L('Sin coincidencias en los datos disponibles.','No matches in the available data.','Nenhuma correspondência nos dados disponíveis.');results.append(count);
    for(const item of found.slice(0,100)){
      const href=core.safeHref(item.href,location.href);if(!href)continue;
      const article=document.createElement('article'),link=document.createElement('a'),label=document.createElement('small'),detail=document.createElement('p');
      article.className='tf-search-result';link.href=href;link.textContent=item.title;
      link.onclick=event=>{if(!sameContext()){event.preventDefault();invalidate();}};
      label.textContent=kind(item);detail.textContent=item.detail;article.append(label,link,detail);results.append(article);
    }
    if(found.length>100){const hint=document.createElement('p');hint.textContent=L('Mostrando los primeros 100. Afiná la búsqueda.','Showing the first 100. Refine your search.','Exibindo os primeiros 100. Refine a busca.');results.append(hint);}
  }
  function invalidate(){generation++;context=null;items=[];phase='loading';if(dialog?.open)dialog.close();}
  async function load(){
    const token=++generation;phase=context&&sameContext()?'refreshing':'loading';render();refresh.disabled=true;
    try{
      const data=await window.taxflyTripSearchLoad((local)=>{
        if(token!==generation||!dialog.open)return;context=local.context;items=local.records;phase='refreshing';render();
      });
      if(token!==generation||!dialog.open)return;context=data.context;items=data.records;phase=data.partial?'error':data.local?'local':'ready';render();
    }catch(_){if(token===generation&&dialog.open){phase='error';if(context&&sameContext())render();else{phase='unavailable';render();}}}
    finally{if(token===generation)refresh.disabled=false;}
  }
  window.taxflyOpenTripSearch=()=>{
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='tf-trip-search';dialog.setAttribute('data-notr','');dialog.setAttribute('aria-labelledby','tf-search-title');
      const head=document.createElement('div');head.className='tf-search-head';title=document.createElement('h2');title.id='tf-search-title';close=document.createElement('button');close.type='button';close.textContent='×';close.onclick=()=>dialog.close();head.append(title,close);
      input=document.createElement('input');input.type='search';input.autocomplete='off';input.oninput=render;
      status=document.createElement('p');status.setAttribute('role','status');results=document.createElement('div');results.className='tf-search-results';
      refresh=document.createElement('button');refresh.type='button';refresh.onclick=load;dialog.append(head,input,status,results,refresh);document.body.append(dialog);
      dialog.addEventListener('close',()=>{generation++;items=[];context=null;refresh.disabled=false;});
    }
    document.querySelectorAll('.nav-dropdown.show').forEach(menu=>menu.classList.remove('show'));
    document.querySelectorAll('.btn-nav-more.open').forEach(button=>{button.classList.remove('open');button.setAttribute('aria-expanded','false');});
    input.value='';text();dialog.showModal();input.focus();load();
  };
  window.addEventListener('taxfly:tripchange',invalidate);
  window.addEventListener('storage',event=>{if(event.key==='appLang')render();else if(event.key==='perfilActivoId'||event.key==='taxusa_offline_uid'||event.key?.startsWith('trip-planning-active::'))invalidate();});
  document.addEventListener('click',event=>{if(event.target.closest?.('.lang-opt,[data-lang]'))setTimeout(render,0);});
  window.I18N?.onChange(render);
  // Observe only a requested result, and stop as soon as it is revealed.
  const params=new URLSearchParams(location.search);
  const expense=params.get('searchExpense'),item=params.get('searchItem'),outlet=params.get('searchOutletName');
  if(expense||item||outlet){
    const reveal=()=>{
      let node;
      if(expense)node=[...document.querySelectorAll('[data-search-expense]')].find(el=>el.dataset.searchExpense===expense);
      else if(item&&params.get('searchKind')==='event')node=document.getElementById('act-item-'+item);
      else if(item)node=[...document.querySelectorAll('[data-search-note]')].find(el=>el.dataset.searchNote===item);
      else node=[...document.querySelectorAll('.stop-name')].find(el=>el.textContent===outlet)?.closest('.stop-card');
      if(!node||!node.getClientRects().length)return false;
      node.tabIndex=-1;node.scrollIntoView({block:'center',behavior:'smooth'});node.focus({preventScroll:true});
      for(const key of ['searchExpense','searchItem','searchKind','searchOutletName','searchOutletDay'])params.delete(key);
      history.replaceState(history.state,'',location.pathname+(params.size?'?'+params:'')+location.hash);return true;
    };
    if(!reveal()){
      const observer=new MutationObserver(()=>{if(reveal()){observer.disconnect();clearTimeout(timer);}});
      const timer=setTimeout(()=>observer.disconnect(),20000);
      observer.observe(document.body,{childList:true,subtree:true});
      window.addEventListener('pagehide',()=>{observer.disconnect();clearTimeout(timer);},{once:true});
    }
  }
})();
