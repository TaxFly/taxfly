(function(){
  'use strict';
  const L=(...words)=>window.tfL3(...words),core=window.TaxflyTripSearch;
  const ICON='<svg class="ui-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
  let host,field,input,cancel,panel,results,status,refresh,hint,scrim,generation=0,context=null,items=[],phase='loading',active=false;
  function kind(item){return {reservation:L('Reserva','Booking','Reserva'),document:L('Documento','Document','Documento'),stop:L('Parada','Stop','Parada'),event:L('Evento','Event','Evento'),note:L('Nota','Note','Nota'),expense:L('Gasto','Expense','Gasto')}[item.kind]||'';}
  function sameContext(){const current=window.taxflyTripSearchContext?.();return current&&context&&core.scope(current)===core.scope(context);}
  function text(){
    if(!input)return;
    const label=L('Buscar en el viaje','Search this trip','Buscar nesta viagem');
    input.placeholder=L('Buscar','Search','Buscar');input.setAttribute('aria-label',label);
    cancel.textContent=L('Cancelar','Cancel','Cancelar');
    refresh.textContent=L('Actualizar','Refresh','Atualizar');
    panel.setAttribute('aria-label',label);
  }
  // Keep the results panel inside the part of the screen the keyboard leaves free.
  function fit(){
    if(!active||!panel)return;
    const vv=window.visualViewport,r=field.getBoundingClientRect();
    const viewH=vv?vv.height:window.innerHeight,top=r.bottom-(vv?vv.offsetTop:0);
    panel.style.maxHeight=Math.max(160,Math.floor(viewH-top-20))+'px';
  }
  function render(){
    text();
    if(!active)return;
    results.replaceChildren();
    if(phase==='loading'){status.textContent=L('Cargando datos del viaje…','Loading trip data…','Carregando dados da viagem…');return;}
    if(phase==='unavailable'){status.textContent=L('No se pudo consultar el viaje. Esperá a que cargue el perfil y reintentá.','Could not load this trip. Wait for the profile to load and retry.','Não foi possível consultar a viagem. Aguarde o perfil carregar e tente novamente.');return;}
    if(!sameContext()){invalidate();return;}
    const found=core.search(items,input.value,localStorage.getItem('appLang')||'es');
    status.textContent=phase==='refreshing'?L('Mostrando datos guardados mientras se actualizan…','Showing saved data while refreshing…','Exibindo dados salvos durante a atualização…'):phase==='error'?L('No se pudieron actualizar todos los datos. Se muestran los disponibles.','Some data could not be refreshed. Available results are shown.','Não foi possível atualizar todos os dados. Os disponíveis são exibidos.'):phase==='local'?L('Resultados guardados en este dispositivo.','Results saved on this device.','Resultados salvos neste dispositivo.'):'';
    if(!input.value.trim()){const tip=document.createElement('p');tip.textContent=L('Escribí un nombre, código o lugar para buscar.','Enter a name, code or place to search.','Digite um nome, código ou lugar para buscar.');results.append(tip);return;}
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
    if(found.length>100){const tip=document.createElement('p');tip.textContent=L('Mostrando los primeros 100. Afiná la búsqueda.','Showing the first 100. Refine your search.','Exibindo os primeiros 100. Refine a busca.');results.append(tip);}
    fit();
  }
  function deactivate(){
    if(!active)return;
    active=false;generation++;items=[];context=null;refresh.disabled=false;
    host.classList.remove('tf-searching');panel.hidden=true;scrim.hidden=true;
    input.value='';input.blur();
  }
  function invalidate(){generation++;context=null;items=[];phase='loading';deactivate();}
  async function load(){
    const token=++generation;phase=context&&sameContext()?'refreshing':'loading';render();refresh.disabled=true;
    try{
      const data=await window.taxflyTripSearchLoad((local)=>{
        if(token!==generation||!active)return;context=local.context;items=local.records;phase='refreshing';render();
      });
      if(token!==generation||!active)return;context=data.context;items=data.records;phase=data.partial?'error':data.local?'local':'ready';render();
    }catch(_){if(token===generation&&active){phase='error';if(context&&sameContext())render();else{phase='unavailable';render();}}}
    finally{if(token===generation)refresh.disabled=false;}
  }
  function activate(){
    if(active)return;
    active=true;
    host.classList.add('tf-searching');panel.hidden=false;scrim.hidden=false;
    render();fit();load();
  }
  function mount(){
    if(field)return true;
    host=document.querySelector('.app-header')||document.querySelector('.hdr-row');
    if(!host)return false;
    field=document.createElement('label');field.className='tf-hsearch';field.setAttribute('data-notr','');
    const icon=document.createElement('span');icon.className='tf-hsearch-ic';icon.innerHTML=ICON;
    input=document.createElement('input');input.type='search';input.autocomplete='off';input.autocapitalize='off';input.spellcheck=false;input.enterKeyHint='search';input.setAttribute('inputmode','search');input.setAttribute('autocorrect','off');input.name='tf-trip-search';
    hint=document.createElement('kbd');hint.className='tf-hsearch-kbd';hint.setAttribute('aria-hidden','true');hint.textContent=/Mac|iPhone|iPad/i.test(navigator.platform||'')?'⌘K':'Ctrl K';
    cancel=document.createElement('button');cancel.type='button';cancel.className='tf-hsearch-cancel';
    field.append(icon,input,hint);
    scrim=document.createElement('div');scrim.className='tf-hsearch-scrim';scrim.hidden=true;
    panel=document.createElement('div');panel.className='tf-hsearch-panel';panel.hidden=true;panel.setAttribute('role','region');
    status=document.createElement('p');status.setAttribute('role','status');results=document.createElement('div');results.className='tf-search-results';
    refresh=document.createElement('button');refresh.type='button';refresh.className='tf-hsearch-refresh';
    panel.append(status,results,refresh);
    const logo=host.querySelector(':scope > .logo, :scope > .taxfly-wordmark');
    host.classList.add('tf-has-search');
    if(logo)logo.after(field);else host.prepend(field);
    field.after(cancel);cancel.after(panel);
    // The scrim lives on <body>: some headers use backdrop-filter, which would trap a fixed child.
    scrim.style.zIndex=host.closest('.header')?'105':'250';document.body.append(scrim);
    input.addEventListener('focus',activate);
    input.addEventListener('input',render);
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();input.blur();}});
    cancel.onclick=deactivate;scrim.onclick=deactivate;refresh.onclick=load;
    // Scrolling the results dismisses the keyboard but keeps the panel open.
    panel.addEventListener('touchmove',()=>{if(document.activeElement===input)input.blur();},{passive:true});
    panel.addEventListener('click',event=>{if(event.target.closest('.tf-search-result a'))setTimeout(deactivate,0);});
    window.visualViewport?.addEventListener('resize',fit);window.visualViewport?.addEventListener('scroll',fit);window.addEventListener('resize',fit);
    text();return true;
  }
  window.taxflyOpenTripSearch=()=>{if(mount()){window.scrollTo({top:0});input.focus();}};
  document.addEventListener('keydown',event=>{
    if((event.ctrlKey||event.metaKey)&&!event.altKey&&event.key.toLowerCase()==='k'){if(mount()){event.preventDefault();input.focus();}}
    else if(event.key==='Escape'&&active){event.preventDefault();deactivate();}
  });
  if(!mount()){
    const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect();});
    watcher.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>watcher.disconnect(),8000);
  }
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
