(function(){
  'use strict';
  const C=window.TaxflyGuideCore,D=window.TaxflyGuideData;if(!C||!D||window.TaxflyGuide)return;
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const memory=new Map();let jumpOpen=false,scope='',state=C.clean(),phase='',tour=null,index=0,token=0,busy=false,returnFocus=null,target=null,draft={},autoTimer=null,initialized=false,originalView=null;
  const file=()=>location.pathname.split('/').pop()||'index.html';
  const home=()=>file()==='index.html';
  const lang=()=>{try{return {en:1,pt:2}[localStorage.getItem('appLang')]||0;}catch(_){return 0;}};
  const txt=value=>Array.isArray(value)?value[lang()]||value[0]:value;
  const t=key=>txt(D.copy[key]||key);
  const hasTour=id=>C.SECTIONS.includes(id)&&Object.hasOwn(D.tours,id);
  const icon=(name,size=20)=>window.uiIcon?.(name,size)||`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/></svg>`;
  function context(){const uid=window._taxflyTripUid,profile=window._taxflyTripProfile||localStorage.getItem('perfilActivoId');return uid&&profile?{uid,profile}:null;}
  function trips(){const c=context();return c?window.TripContext?.readTrips(c.uid,c.profile)||[]:[];}
  function ready(){const c=context();if(!c||!window.TripContext)return false;const s=window.TripContext.status(c.uid,c.profile);return s.phase==='ready'||s.hasData;}
  function canEdit(){return window.taxflyProfileCan?.('edit')!==false;}
  function persist(){if(!scope)return;const value=JSON.stringify(state);memory.set(scope,value);try{localStorage.setItem(scope,value);}catch(_){}}
  function syncScope(){
    const c=context(),next=c?C.key(c.uid,c.profile):'';if(next===scope)return;
    busy=false;root.removeAttribute('aria-busy');close(false);scope=next;draft={};let value=memory.get(scope);try{value=localStorage.getItem(scope)||value;}catch(_){}
    try{state=C.clean(JSON.parse(value||'null'));}catch(_){state=C.clean();}
    renderHome();
  }
  const root=document.createElement('dialog');root.className='tfg-root';root.id='taxfly-guide';root.setAttribute('data-notr','');root.setAttribute('aria-labelledby','tfg-title');root.setAttribute('aria-describedby','tfg-description');
  root.innerHTML='<div class="tfg-shade"></div><div class="tfg-spot" hidden></div><section class="tfg-card"></section>';document.body.appendChild(root);
  const card=root.querySelector('.tfg-card'),spot=root.querySelector('.tfg-spot');
  // The companion belongs to the guide card; the header help button stays clear of chat.
  const Pet=window.TaxflyMascot;let pet=null,petTimer=0;
  // Floating "Guía de TaxUSA" launcher: mascot + label, bottom-right. Replaces the
  // old question-mark icon that used to live inline in the nav next to the avatar.
  const launch=document.createElement('button');launch.type='button';launch.id='taxfly-help-button';launch.className='tfg-launch-pill';launch.setAttribute('data-notr','');
  launch.innerHTML='<span class="tfg-pill-pet" aria-hidden="true"></span><span class="tfg-pill-label"></span>';
  launch.onclick=()=>openCurrent();
  let launchPet=null,launchTimer=0;
  const greet=()=>{if(!launchPet)return;clearTimeout(launchTimer);try{launchPet.setStill(false);launchPet.play('wave',1400);}catch(_){}launchTimer=setTimeout(()=>launchPet?.setStill(true),1500);};
  launch.addEventListener('pointerenter',greet);launch.addEventListener('focus',greet);
  // Known same-corner floating controls this launcher must never cover. Both were
  // confirmed by a full-repo audit to be the only bottom-right / bottom-wide fixed
  // controls in the app (mis-cosas.html's add button, rutas.html's day nav bar).
  function blockers(){
    return ['btnAdd','day-bottom-nav'].map(id=>document.getElementById(id)).filter(el=>{
      if(!el||!el.isConnected)return false;
      const cs=getComputedStyle(el);
      return cs.display!=='none'&&cs.visibility!=='hidden'&&el.getClientRects().length>0;
    });
  }
  function placeLaunch(){
    if(!launch.isConnected)return;
    let bottom=0;
    for(const el of blockers()){const r=el.getBoundingClientRect();if(r.height)bottom=Math.max(bottom,window.innerHeight-r.top+8);}
    if(bottom>0)launch.style.bottom=bottom+'px';else launch.style.removeProperty('bottom');
  }
  function mountLaunch(){
    if(!launch.isConnected)document.body.appendChild(launch);
    const label=launch.querySelector('.tfg-pill-label');if(label)label.textContent=t('guide');
    if(Pet&&!launchPet){const host=launch.querySelector('.tfg-pill-pet');try{launchPet=Pet.create(host,{state:'idle',still:true});}catch(_){launchPet=null;}}
    placeLaunch();
  }
  window.addEventListener('resize',placeLaunch);
  function dismissSettings(){
    if(!$('#settingsDrawer')?.classList.contains('open'))return;
    if(window.closeSettingsDrawer)window.closeSettingsDrawer();
    else if(window.cerrarDrawer)window.cerrarDrawer();
    else window.toggleSettings?.();
  }
  mountLaunch();
  const PET_STATE={welcome:'wave',hub:'happy',setup:'curious',review:'think',created:'cheer',complete:'cheer',message:'curious',tour:'point'};
  // Short reactions on top of the base pose. While one plays, the arm does not
  // chase the target; once it ends the mascot goes back to pointing at it.
  let moodUntil=0,moodTimer=0,sleepTimer=0;
  const MOODS=[[/escane|\bIA\b|análisis|compar|calcul|equivalen|convert|cotiz/i,'think'],[/guard|sincroniz|cre[aá]|agreg|registr|compart/i,'happy'],[/importante|ojo|aviso|cuidado|tope|límite|impuesto/i,'surprised']];
  function stepMood(step,i,count){
    if(step.mood)return step.mood;
    if(count>1&&i===count-1)return 'cheer';
    if(i===0)return 'wave';
    const text=String(step.title?.[0]||'')+' '+String(step.text?.[0]||'');
    return MOODS.find(([re])=>re.test(text))?.[1]||'';
  }
  function react(name,ms=1700){
    if(!pet||!name)return;
    clearTimeout(moodTimer);moodUntil=Date.now()+ms;
    try{pet.play(name,ms);if(name==='cheer'||name==='happy')pet.hop(name==='cheer'?52:34);pet.talk(Math.min(900,ms));}catch(_){}
    moodTimer=setTimeout(()=>{moodUntil=0;petAim();},ms+60);
  }
  function wakePet(){
    clearTimeout(sleepTimer);if(!root.open||!pet)return;
    if(pet.state()==='sleepy'){if(phase==='tour'){pet.set('point');petAim();}else pet.set(PET_STATE[phase]||'idle');}
    sleepTimer=setTimeout(()=>{if(root.open&&pet&&!busy&&Date.now()>=moodUntil)pet.set('sleepy');},40000);
  }
  function petScene(){
    clearTimeout(petTimer);const host=card.querySelector('.tfg-pet');if(!Pet||!host)return;
    try{
      pet=pet||Pet.create(null,{state:'idle'});pet.mount(host);pet.setStill(false);pet.clearAim();pet.set(PET_STATE[phase]||'idle');
      if(['welcome','created','complete'].includes(phase)){
        const expected=phase;petTimer=setTimeout(()=>{if(root.open&&phase===expected)pet.hop(46);},260);
      }
      if(phase!=='tour')pet.talk(900);
      wakePet();
    }catch(_){pet?.destroy();pet=null;host.remove();}
  }
  function petAim(){
    if(!pet||phase!=='tour'||!target?.isConnected||Date.now()<moodUntil)return;
    const r=target.getBoundingClientRect();if(r.width)pet.pointAt(r.left+r.width/2,r.top+r.height/2);
  }
  function button(action,label,primary=false){return `<button type="button" data-guide="${action}"${primary?' class="tfg-primary"':''}>${esc(t(label))}</button>`;}
  function item(id,label,small=''){return `<button type="button" class="tfg-item" data-tour="${id}">${icon(D.tours[id]?.icon||'bulb')}<span>${esc(label)}${small?`<small>${esc(small)}</small>`:''}</span>${icon('chevDown',15)}</button>`;}
  function lock(on){document.documentElement.classList.toggle('tfg-lock',on);launch.style.visibility=on?'hidden':'';}
  function shell(title,description,body='',actions='',foot='',pinned=''){
    root.dataset.phase=phase;root.dataset.highlight='false';spot.hidden=true;target=null;card.style.cssText='';
    card.innerHTML=`<div class="tfg-top"><span class="tfg-kicker">${icon('bulb',17)} ${esc(t('guide'))}</span><button type="button" class="tfg-close" data-guide="close" aria-label="${esc(t('close'))}"${busy?' disabled':''}>${icon('x',18)}</button></div><div class="tfg-scroll"><div class="tfg-head">${Pet?'<div class="tfg-pet" aria-hidden="true"></div>':''}<h2 id="tfg-title" tabindex="-1">${esc(title)}</h2></div><p id="tfg-description">${esc(description)}</p>${body}</div>${pinned}${actions?`<div class="tfg-actions">${actions}</div>`:''}${foot}`;
    if(!root.open){returnFocus=document.activeElement;root.showModal();}
    lock(true);
    petScene();
    // Move focus when content changes, without letting automatic repositioning steal it.
    $('#tfg-title')?.focus({preventScroll:true});
  }
  function close(save=true){
    if(busy)return;
    token++;if(save&&phase==='tour'&&tour){state.resume={section:tour,index};persist();}
    if(save&&phase==='welcome'){state.welcome=true;persist();}
    clearTimeout(petTimer);clearTimeout(moodTimer);clearTimeout(sleepTimer);moodUntil=0;pet?.setStill(true);restoreView();phase='';tour=null;target=null;
    if(root.open)root.close();lock(false);spot.hidden=true;returnFocus?.isConnected&&returnFocus.focus?.({preventScroll:true});renderHome();
  }
  function welcome(){syncScope();if(!ready())return false;phase='welcome';shell(t('welcome'),t(trips().length?'existing':'welcomeText'),' ',button('later','later')+button(trips().length?'home-tour':'setup',trips().length?'explore':'create',true));return true;}
  function openHub(){
    syncScope();token++;restoreView();phase='hub';
    const current=pageSection(),ids=[current,...D.pages].filter((v,i,a)=>a.indexOf(v)===i);
    let body='<div class="tfg-list">';
    if(state.resume)body+=`<button type="button" class="tfg-item" data-guide="resume">${icon('calendar')}<span>${esc(t('resume'))}<small>${esc(txt(D.tours[state.resume.section].name))}</small></span></button>`;
    if(ready()&&!trips().length&&canEdit())body+=`<button type="button" class="tfg-item" data-guide="setup">${icon('plane')}<span>${esc(t('setup'))}</span></button>`;
    body+=item('overview',t('overview'),t('overviewText'))+`<h3 class="tfg-group-title">${esc(t('pages'))}</h3>`;
    body+=ids.map(id=>item(id,txt(D.tours[id].name),id===current?t('currentPage'):state.done.includes(id)?t('done'):t('wholePage'))).join('')+'</div>';
    shell(t('hub'),t('hubText'),body);
  }
  function readDraft(){const f=card.querySelector('form');if(f)for(const input of f.querySelectorAll('input'))draft[input.name]=input.value;}
  function setup(){
    syncScope();if(!ready()||!canEdit()){phase='message';shell(t('setup'),t(!ready()?'notReady':'readOnly'),'',button('hub','more'));return;}
    state.welcome=true;persist();
    phase='setup';
    const field=(key,type='text',required=false)=>`<label class="tfg-field">${esc(t(key))}<input name="${key==='from'?'startDate':key==='until'?'endDate':key}" type="${type}"${required?' required maxlength="80"':''} value="${esc(draft[key==='from'?'startDate':key==='until'?'endDate':key]||'')}" autocomplete="off"></label>`;
    shell(t('setup'),t('setupText'),`<form id="tfg-trip-form">${field('name','text',true)}<div class="tfg-grid">${field('city','text',true)}${field('state','text',true)}</div><div class="tfg-grid">${field('from','date')}${field('until','date')}</div><div class="tfg-error" role="alert" id="tfg-error"></div><div class="tfg-actions">${button('hub','later')}<button type="submit" class="tfg-primary">${esc(t('review'))}</button></div></form>`);
    card.querySelector('form').onsubmit=e=>{e.preventDefault();readDraft();const r=C.tripFields(draft);if(r.error){$('#tfg-error').textContent=t(r.error);return;}review();};
  }
  function review(){phase='review';const {fields,error}=C.tripFields(draft);if(error){setup();return;}
    shell(t('review'),t('reviewText'),`<div class="tfg-summary"><strong>${esc(fields.name)}</strong><span>${esc(fields.destinations[0].city)}, ${esc(fields.destinations[0].state)}</span><span>${esc([fields.startDate,fields.endDate].filter(Boolean).join(' → ')||t('noDates'))}</span></div><div class="tfg-error" role="alert" id="tfg-error"></div>`,button('setup','back')+button('save','save',true));
  }
  async function saveTrip(){
    if(busy||!ready()||!canEdit())return;
    const {fields,error}=C.tripFields(draft);if(error){setup();return;}
    const c=context(),capturedScope=scope;busy=true;card.querySelectorAll('button').forEach(b=>b.disabled=true);$('#tfg-description').textContent=t('saving');root.setAttribute('aria-busy','true');pet?.set('think');
    try{
      const result=await window.TripContext.create(c.uid,c.profile,fields);
      if(capturedScope!==C.key(context()?.uid,context()?.profile)){syncScope();return;}
      busy=false;root.removeAttribute('aria-busy');
      if(!result?.trip)throw Error('unconfirmed');
      state.welcome=true;state.resume=null;persist();phase='created';
      shell(t('ready'),t(result.synced===false?'pending':'saved'),`<div class="tfg-summary"><strong>${esc(result.trip.name)}</strong><span>${esc(fields.destinations[0].city)}, ${esc(fields.destinations[0].state)}</span></div><div class="tfg-list" style="margin-top:14px">${item('budget',t('budgetAction'))}${item('planning',t('planAction'))}${item('reservations',t('reservationAction'))}</div>`,button('finish-setup','use'));
    }catch(_){if(capturedScope!==C.key(context()?.uid,context()?.profile)){syncScope();return;}busy=false;root.removeAttribute('aria-busy');review();$('#tfg-error').textContent=t('saveError');pet?.set('sad');}
  }
  const PAGE_MAP={'index.html':'home','compras.html':'expenses','tickets.html':'documents','lugares.html':'places','rutas.html':'routes','mis-cosas.html':'packing','grupo.html':'group','tax.html':'tax','unidades.html':'units','planificacion.html':'planning'};
  function currentSection(){
    const map=PAGE_MAP;
    if(file()==='planificacion.html'){const active=$('.section-panel.active, .panel.active');const s=new URLSearchParams(location.search).get('section');const section=active?.id?.replace('panel-','')||s,sections={reservas:'reservations',outlets:'outlets',comidas:'food',walmart:'walmart',lugares:'places'};return Object.hasOwn(sections,section)?sections[section]:'planning';}
    return map[file()]||'home';
  }
  function pageSection(){return file()==='planificacion.html'?'planning':currentSection();}
  // Entering the guide from a tab always starts with that tab's own guide; the hub
  // (other guides + the general tour) stays one tap away from the guide itself.
  function openCurrent(){
    syncScope();if(busy)return;
    const id=Object.hasOwn(PAGE_MAP,file())?pageSection():'';
    if(id&&hasTour(id)){navigate(id,state.resume?.section===id);return;}
    openHub();
  }
  function applyView(view){
    if(!view)return true;
    if(view.kind==='calc'){if(!window.switchCalcTab)return false;window.switchCalcTab(view.tab);}
    if(view.kind==='expense'){if(!window.showSec)return false;window.showSec(view.tab);if(view.tab==='gastos')window.toggleExp?.(true);}
    if(view.kind==='place'){if(!window.switchTab)return false;window.switchTab(view.tab);}
    if(view.kind==='group'){
      const panel=$('#s-grupo'),btn=document.querySelector('.tab-btn[onclick*="\''+view.tab+'\'"]');
      if(panel&&getComputedStyle(panel).display!=='none'&&btn&&window.switchTab)window.switchTab(view.tab,btn);
    }
    if(view.kind==='unit'){if(!window.toggleGroup)return false;if(!$('#'+view.group)?.classList.contains('open'))window.toggleGroup(view.group);}
    if(view.kind==='plan'){
      if(!window._appInited||!window.switchSection)return false;
      window.switchSection(view.section);
      if(view.section==='parques'&&view.tab)window.switchParquesTab?.(view.tab);
      if(view.section==='outlets'&&view.tab)window.switchOutletTab?.(view.tab);
    }
    return true;
  }
  function captureView(){
    if(file()==='tax.html')return {kind:'calc',tab:$('#tab-cart')?.classList.contains('active')?'cart':'individual'};
    if(file()==='compras.html')return {kind:'expense',tab:$('.tab-bar .active')?.id.replace('t-','')||'gastos',exp:$('#exp-toggle')?.getAttribute('aria-expanded')==='true'};
    if(file()==='lugares.html')return {kind:'place',tab:$('.tab-btn.active')?.id.replace('tab-','')||'lugares'};
    if(file()==='planificacion.html'){
      const section=$('.panel.active')?.id.replace('panel-','')||'parques';
      const sub=$('#panel-'+section+' .outlets-stab.active')?.getAttribute('onclick')||'';
      return {kind:'plan',section,tab:sub.match(/\('([^']+)'\)/)?.[1]};
    }
    if(file()==='grupo.html')return {kind:'group',tab:document.querySelector('.tab-panel.active')?.id.replace('tab-','')||'gastos'};
    if(file()==='unidades.html')return {kind:'unit',group:$('.conv-group.open')?.id||'grp-temp'};
    return null;
  }
  function restoreView(){const view=originalView;originalView=null;if(view){try{applyView(view);if(view.kind==='expense')window.toggleExp?.(view.exp);}catch(_){}}}
  function samePage(id){const u=new URL(D.tours[id].url,location.href);if(u.pathname!==location.pathname&&!(home()&&u.pathname.endsWith('/index.html')))return false;
    return file()!=='planificacion.html'||id==='planning'||currentSection()===id;
  }
  function navigate(id,resume=false){
    if(!hasTour(id))return;
    if(samePage(id)){startTour(id,resume?state.resume?.index||0:0);return;}
    const u=new URL(D.tours[id].url,location.href);u.searchParams.set('guide',id);if(resume)u.searchParams.set('guideStep',String(state.resume?.index||0));
    close(false);location.assign(u.href);
  }
  function visibleElement(selector,allowBusy){return [...document.querySelectorAll(selector)].find(el=>!el.closest('[hidden]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none'&&(allowBusy||el.getAttribute('aria-busy')!=='true')&&el.dataset.planWaiting!=='true');}
  function startTour(id,start=0){
    if(!hasTour(id))return;
    dismissSettings();
    if(!originalView)originalView=captureView();
    state.welcome=true;phase='tour';tour=id;index=Math.min(start,D.tours[id].steps.length-1);renderStep();
  }
  // The general tour is the concatenation of every tab guide: these ranges let people jump between tabs.
  function overviewMap(){let at=0;return D.pages.map(id=>{const n=D.tours[id].steps.length,r={id,start:at,end:at+n-1};at+=n;return r;});}
  function renderStep(){
    const seq=++token,step=D.tours[tour].steps[index],count=D.tours[tour].steps.length;
    state.resume={section:tour,index};persist();
    if(step.url){
      const destination=new URL(step.url,location.href),here=location.pathname.endsWith('/')?location.pathname+'index.html':location.pathname;
      if(destination.pathname!==here){
        destination.searchParams.set('guide',tour);destination.searchParams.set('guideStep',String(index));
        close(false);location.assign(destination.href);return;
      }
    }
    const map=tour==='overview'?overviewMap():null,cur=map?map.findIndex(r=>index>=r.start&&index<=r.end):-1;
    const hubBtn=`<button type="button" class="tfg-mini" data-guide="hub">${esc(t('more'))}</button>`;
    const jump=map&&cur>=0?`<details class="tfg-more"${jumpOpen?' open':''}><summary>${esc(t('moreOptions'))}</summary><div class="tfg-more-body"><label class="tfg-jump-label">${esc(t('jumpTo'))}<select data-jump>${map.map((r,i)=>`<option value="${r.start}"${i===cur?' selected':''}>${i+1}. ${esc(txt(D.tours[r.id].name))}</option>`).join('')}</select></label><div class="tfg-more-actions"><button type="button" class="tfg-mini" data-guide="skip-tab">${esc(t(cur===map.length-1?'finish':'skipTab'))}</button>${hubBtn}</div></div></details>`:'';
    const foot=map?'':`<div class="tfg-foot">${hubBtn.replace('tfg-mini','tfg-dismiss')}</div>`;
    dockSide=null;
    const meta=`<div class="tfg-meta"><span class="tfg-step">${esc(t('step'))} ${index+1} ${esc(t('of'))} ${count}</span><div class="tfg-progress" role="progressbar" aria-label="${esc(t('guide'))}" aria-valuemin="0" aria-valuemax="${count}" aria-valuenow="${index+1}"><span style="width:${(index+1)/count*100}%"></span></div></div>${jump}`;
    shell(txt(step.title),txt(step.text),`<p class="tfg-notice" id="tfg-target-status" role="status" hidden></p>`,(index?button('prev','back'):'')+button('pause','pause')+button('next',index===count-1?'finish':'next',true),foot,meta);
    react(stepMood(step,index,count));
    let prepared=false,settled=false,started=Date.now();
    function notice(kind,text,retryable){
      const n=$('#tfg-target-status');if(!n)return;
      n.hidden=false;n.dataset.kind=kind;n.textContent=text;
      if(retryable){
        const b=document.createElement('button');b.type='button';b.textContent=t('retry');
        b.style.cssText='margin-left:8px;border:0;background:transparent;color:inherit;text-decoration:underline;font:inherit;cursor:pointer;padding:0';
        b.onclick=()=>{started=Date.now();settled=false;prepared=false;n.dataset.kind='';n.textContent=t('waiting');seek();};
        n.appendChild(b);
      }
    }
    function seek(){
      if(seq!==token||!root.open||phase!=='tour')return;
      if(!prepared){try{prepared=applyView(step.view);}catch(_){prepared=false;}}
      const waited=Date.now()-started;
      // A target still flagged busy (skeletons, background sync) is good enough after a moment.
      const el=prepared?visibleElement(step.sel,waited>1200):null;
      const loading=file()==='planificacion.html'&&!window._appInited;
      if(el&&!loading){
        target=el;const n=$('#tfg-target-status');if(n){n.hidden=true;n.textContent='';n.dataset.kind='';}
        const reveal=()=>{const tall=el.getBoundingClientRect().height>innerHeight*.5;if(tall)el.style.scrollMarginTop='96px';el.scrollIntoView({block:tall?'start':'center',behavior:'instant'});if(tall)el.style.removeProperty('scroll-margin-top');requestAnimationFrame(position);};
        reveal();
        // The target can sit right after content that is still loading (a grid of cards, a
        // list fetched async). That content growing pushes the target further down the page;
        // redo the scroll + position a few times right after it first appears so the card
        // keeps following it, instead of relying on a single scroll taken too early.
        for(const delay of [250,600,1200,2000])setTimeout(()=>{if(seq===token&&target===el)reveal();},delay);
        return;
      }
      // Stay silent at first; only mention the wait if it really drags on.
      if(waited>1500&&!settled){const n=$('#tfg-target-status');if(n&&!n.textContent){n.hidden=false;n.dataset.kind='loading';n.textContent=t('waiting');}}
      if(waited<(step.optional?400:4500)){setTimeout(seek,100);return;}
      if(settled)return;settled=true;
      // Nothing to highlight: the explanation stays on screen, centred, without a red error.
      if(step.optional){const n=$('#tfg-target-status');if(n){n.hidden=true;n.textContent='';}return;}
      if(!ready()||loading){notice('loading',t('waiting'),true);pet?.set('curious');return;}
      if(!canEdit()){notice('denied',t('readOnly'));pet?.set('curious');return;}
      const emptyHint=document.querySelector('.empty,[data-empty],#empty-state');
      const emptyVisible=emptyHint&&!emptyHint.closest('[hidden]')&&getComputedStyle(emptyHint).display!=='none';
      notice('empty',t(emptyVisible?'emptySection':'notShown'),true);
      pet?.set('curious');
    }
    seek();
  }
  let dockSide=null;
  function position(){
    if(phase!=='tour'||!target?.isConnected)return;
    const w=window.innerWidth,h=window.innerHeight;let raw=target.getBoundingClientRect();
    if(!raw.width||!raw.height){spot.hidden=true;root.dataset.highlight='false';return;}
    const gap=12,pad=10,narrow=w<640,clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
    // Phones use the full width. Larger screens try 380 → 480 → 600 px (a bit more on very
    // large viewports): a wider card needs fewer lines, so it can fit without scrolling.
    const k=w>=2400?1.2:1,widths=narrow?[w-2*pad]:[...new Set([380,480,600].map(v=>Math.min(Math.round(v*k),w-32)))];
    const box=()=>{const q=target.getBoundingClientRect();return {l:q.left-5,t:q.top-5,r:q.right+5,b:q.bottom+5};};
    let bx=box(),place=null,cw=widths[0],ch=0;
    const cx=(bx.l+bx.r)/2,room={below:h-bx.b-gap-pad,above:bx.t-gap-pad,right:w-bx.r-gap-pad,left:bx.l-gap-pad};
    const measure=width=>{
      cw=width;
      // Apply the final width first: the height depends on it.
      if(card.style.width!==width+'px')Object.assign(card.style,{position:'fixed',left:'0px',top:'0px',width:width+'px'});
      // Natural height = card height + whatever the text area hides. Reading it never
      // changes max-height, so the text area keeps its own scroll position.
      const sc=card.querySelector('.tfg-scroll');ch=card.offsetHeight+(sc?sc.scrollHeight-sc.clientHeight:0);
    };
    const fit=()=>{
      const tall=Math.min(ch,h-2*pad),xc=clamp(cx-cw/2,pad,w-cw-pad),yc=clamp(bx.t,pad,h-tall-pad);
      if(room.below>=ch)return {x:xc,y:bx.b+gap,hh:ch};
      if(room.above>=ch)return {x:xc,y:bx.t-gap-ch,hh:ch};
      if(!narrow&&room.right>=cw)return {x:bx.r+gap,y:yc,hh:tall};
      if(!narrow&&room.left>=cw)return {x:bx.l-gap-cw,y:yc,hh:tall};
      return null;
    };
    // 1) the narrowest width where the whole card fits in a free spot.
    for(const width of widths){measure(width);place=fit();if(place)break;}
    if(!place){
      // No clear spot: dock the card at the top or bottom edge as a sheet that scrolls
      // inside itself, and move the page so the highlighted block sits in the free band.
      // Use as much of the viewport as we reasonably can, so the step text is visible
      // without an internal scroll in the overwhelming majority of cases.
      const cardH=Math.min(ch,Math.round(h*(narrow?.72:.8))),sy=window.scrollY,maxY=Math.max(0,document.documentElement.scrollHeight-h);
      const plan=side=>{
        const lo=side==='bottom'?pad:cardH+pad+gap,hi=side==='bottom'?h-cardH-pad-gap:h-pad,bh=bx.b-bx.t;
        const want=bh<=hi-lo?lo+(hi-lo-bh)/2:lo,dy=clamp(bx.t-want,-sy,maxY-sy);
        return {side,dy,loss:Math.max(0,lo-(bx.t-dy))+Math.max(0,(bx.b-dy)-hi)};
      };
      if(!dockSide){const down=plan('bottom'),up=plan('top');dockSide=down.loss<up.loss?'bottom':up.loss<down.loss?'top':((bx.t+bx.b)/2<h/2?'bottom':'top');}
      const chosen=plan(dockSide);
      if(Math.abs(chosen.dy)>=1){window.scrollBy({top:chosen.dy,left:0,behavior:'instant'});bx=box();}
      place={x:Math.round((w-cw)/2),y:dockSide==='bottom'?h-cardH-pad:pad,hh:cardH};
    }
    // Safety net: room.above/below is measured from the target's edges without checking
    // those edges are still inside the viewport (e.g. content above the target grew and
    // pushed it past the bottom). Clamp here so the card can never render off-screen,
    // regardless of which branch above produced it.
    place.hh=Math.min(place.hh,h-2*pad);place.y=clamp(place.y,pad,h-place.hh-pad);
    root.dataset.highlight='true';spot.hidden=false;
    const left=Math.max(4,bx.l),top=Math.max(4,bx.t),right=Math.min(w-4,bx.r),bottom=Math.min(h-4,bx.b);
    Object.assign(spot.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});
    Object.assign(card.style,{left:Math.round(place.x)+'px',top:Math.round(place.y)+'px',maxHeight:Math.ceil(place.hh)+'px'});
    petAim();
  }
  function finish(){const id=tour;state.done=[...new Set([...state.done,id])];state.resume=null;persist();token++;tour=null;phase='complete';shell(t('complete'),t('completeText'),'',button('hub','more')+button('close','use',true));renderHome();}
  function renderHome(){
    if(!initialized)return;
    if(!home()){
      const id=pageSection();let banner=$('#tfg-section-help');
      if(!ready()||state.done.includes(id)||state.offers.includes(id)){banner?.remove();return;}
      if(!banner){banner=document.createElement('aside');banner.id='tfg-section-help';banner.className='tfg-home tfg-section-help';banner.setAttribute('data-notr','');const header=$('header');if(!header)return;header.after(banner);}
      banner.innerHTML=`<strong>${esc(t('sectionHelp'))}</strong><div class="tfg-home-actions">${item(id,txt(D.tours[id].name))}<button type="button" class="tfg-dismiss">${esc(t('later'))}</button></div>`;
      banner.onclick=e=>{if(e.target.closest('[data-tour]'))navigate(id);else if(e.target.closest('.tfg-dismiss')){state.offers=[...new Set([...state.offers,id])];persist();banner.remove();}};
      return;
    }
    let box=$('#tfg-first-steps');if(!ready()||!trips().length){box?.remove();return;}
    if(state.offers.includes('home')||['budget','planning','documents'].every(id=>state.done.includes(id))){box?.remove();return;}
    if(!box){box=document.createElement('section');box.id='tfg-first-steps';box.className='tfg-home';box.setAttribute('data-notr','');const anchor=$('#homePlanHeading')||$('#sectionList');if(!anchor)return;anchor.before(box);}
    box.innerHTML=`<div class="tfg-home-head"><strong>${esc(t('nextSteps'))}</strong><button type="button" class="tfg-close" data-dismiss-home aria-label="${esc(t('later'))}">${icon('x',16)}</button></div><p>${esc(t('nextText'))}</p><div class="tfg-home-actions">${item('budget',t('budgetAction'),state.done.includes('budget')?t('done'):'')}${item('planning',t('planAction'),state.done.includes('planning')?t('done'):'')}${item('documents',txt(D.tours.documents.name),state.done.includes('documents')?t('done'):'')}</div>`;
    box.onclick=e=>{if(e.target.closest('[data-dismiss-home]')){state.offers=[...new Set([...state.offers,'home'])];persist();box.remove();return;}const id=e.target.closest('[data-tour]')?.dataset.tour;if(id)navigate(id);};
  }
  function offerFirstTrip(){
    syncScope();if(!home()||!ready()||state.welcome||root.open||$('dialog[open]:not(#taxfly-guide)'))return false;
    welcome();return true;
  }
  function refresh(){syncScope();
    const settings=$('#settingsDrawer .sx-scroll');if(settings&&!$('#tfg-settings-help')){const help=document.createElement('button');help.id='tfg-settings-help';help.className='tfg-item';help.type='button';help.setAttribute('data-notr','');help.onclick=()=>{dismissSettings();openCurrent();};settings.appendChild(help);}
    if($('#tfg-settings-help'))$('#tfg-settings-help').innerHTML=icon('bulb',18)+`<span>${esc(t('guide'))}</span>`;
    mountLaunch();launch.setAttribute('aria-label',t('guide'));launch.title=t('guide');renderHome();
    if(root.open&&!busy){if(phase==='setup'){readDraft();setup();}else if(phase==='review')review();else if(phase==='hub')openHub();else if(phase==='welcome')welcome();else if(phase==='tour')renderStep();}
  }
  // The page behind the guide must not move: the highlighted element has to stay where it is.
  const stopScroll=e=>{if(!e.target.closest?.('.tfg-card'))e.preventDefault();};
  root.addEventListener('wheel',stopScroll,{passive:false});root.addEventListener('touchmove',stopScroll,{passive:false});
  root.addEventListener('cancel',e=>{e.preventDefault();close();});
  for(const name of ['pointerdown','keydown','wheel'])root.addEventListener(name,wakePet,{passive:true});
  root.addEventListener('click',e=>{
    if(busy)return;const id=e.target.closest('[data-tour]')?.dataset.tour;if(id){navigate(id);return;}
    const act=e.target.closest('[data-guide]')?.dataset.guide;
    if(act==='close'||act==='pause'||act==='later'){if(phase==='setup')readDraft();close();}
    else if(act==='hub')openHub();else if(act==='setup')setup();else if(act==='save')saveTrip();
    else if(act==='home-tour')navigate('overview');else if(act==='resume'&&state.resume)navigate(state.resume.section,true);
    else if(act==='skip-tab'&&tour==='overview'){const m=overviewMap(),i=m.findIndex(r=>index>=r.start&&index<=r.end);if(i<0||i===m.length-1)finish();else{index=m[i+1].start;renderStep();}}
    else if(act==='prev'){index--;renderStep();}else if(act==='next'){if(index===D.tours[tour].steps.length-1)finish();else{index++;renderStep();}}
    else if(act==='finish-setup'){close(false);location.assign(new URL('index.html',location.href).href);}
  });
  root.addEventListener('toggle',e=>{if(e.target.matches?.('.tfg-more'))jumpOpen=e.target.open;},true);
  root.addEventListener('change',e=>{const sel=e.target.closest?.('[data-jump]');if(!sel||busy||phase!=='tour'||tour!=='overview')return;const to=Number(sel.value);if(Number.isInteger(to)&&to>=0&&to<D.tours.overview.steps.length){index=to;renderStep();}});
  // The native dialog traps keyboard focus; Escape pauses, including the welcome.
  let positioning=false;function queuePosition(){if(positioning||phase!=='tour')return;positioning=true;requestAnimationFrame(()=>{positioning=false;position();});}
  window.addEventListener('resize',()=>{dockSide=null;queuePosition();});window.addEventListener('scroll',e=>{if(card.contains(e.target))return;queuePosition();},true);window.visualViewport?.addEventListener('resize',queuePosition);
  // Content that loads after the step is positioned (e.g. the weather card on tax.html
  // filling in once fetchWeather() resolves) reflows the page without firing resize or
  // scroll, which used to leave the highlight stuck over whatever ended up in its old
  // spot. Watching body's box size catches that and re-measures the real target.
  if(window.ResizeObserver){const ro=new ResizeObserver(()=>{queuePosition();placeLaunch();});ro.observe(document.body);}
  document.addEventListener('click',e=>{if(e.target.closest('.lang-opt,[data-lang]'))setTimeout(refresh,0);});
  document.addEventListener('click',e=>{if(e.target.closest('.tab,.plan-section-menu button,.plan-food-switch button'))setTimeout(renderHome,0);});
  window.addEventListener('storage',e=>{if(e.key==='appLang')refresh();if(e.key==='perfilActivoId'||e.key==='taxusa_offline_uid')syncScope();});
  for(const name of ['taxfly:tripchange','taxfly:tripstatus'])window.addEventListener(name,()=>{syncScope();renderHome();scheduleAuto();});
  function scheduleAuto(){clearTimeout(autoTimer);autoTimer=setTimeout(()=>{
    if(!ready()||root.open||$('dialog[open]'))return;
    const params=new URLSearchParams(location.search),id=params.get('guide');
    if(hasTour(id)){const requested=Math.max(0,Math.min(99,Math.trunc(Number(params.get('guideStep'))||0)));params.delete('guide');params.delete('guideStep');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);startTour(id,requested);}
    else if(home())offerFirstTrip();
  },650);}
  window.TaxflyGuide={open:openCurrent,hub:openHub,offerFirstTrip,start:id=>navigate(id),refresh};
  initialized=true;refresh();scheduleAuto();
  let tries=0;const boot=setInterval(()=>{syncScope();renderHome();scheduleAuto();placeLaunch();if(ready()||++tries>=40)clearInterval(boot);},1000);
})();
