(function(){
 const $=id=>document.getElementById(id);
 function theme(value){document.documentElement.setAttribute('data-theme',value);document.documentElement.classList.toggle('eu-dark',value==='dark');localStorage.setItem('taxeurope_theme',value);localStorage.setItem('theme',value)}
 theme(localStorage.getItem('taxeurope_theme')||localStorage.getItem('theme')||'light');
 window.toggleSettings=()=>{const drawer=$('settingsDrawer'),overlay=$('menuOverlay');if(!drawer||!overlay)return;const open=drawer.classList.toggle('open');overlay.style.display=open?'block':'none';$('btnSettings')?.setAttribute('aria-expanded',String(open));if(open)drawer.querySelector('.sx-x')?.focus()};
 window.toggleDarkMode=()=>theme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
 window.changeProfile=()=>{localStorage.removeItem('perfilActivoId');location.href='../profiles.html'};
 window.changeLanguage=lang=>{localStorage.setItem('appLang',lang);window.dispatchEvent(new Event('taxfly:languagechange'))};
 const account=action=>async()=>{try{await window.TaxEuropeSession.accountAction(action)}catch(e){window.showAlert(e.message)}};
 window.doLogout=account('logout');window.doChangeEmail=account('email');window.doChangePassword=account('password');window.doDeleteAccount=account('delete');
 window.gestionarPIN=()=>window.showAlert('El PIN sin conexión se administra desde el login común de TaxFly.');
 const more=$('eu-more'),menu=$('eu-more-menu');if(more&&menu){more.onclick=e=>{e.stopPropagation();const open=menu.classList.toggle('show');more.setAttribute('aria-expanded',String(open))};document.addEventListener('click',e=>{if(!e.target.closest('.eu-more-wrap')){menu.classList.remove('show');more.setAttribute('aria-expanded','false')}})}
 const file=location.pathname.split('/').pop();document.querySelectorAll('.nav-bar a').forEach(a=>{if(a.getAttribute('href')===file){a.classList.add('active');a.setAttribute('aria-current','page')}});
 function profile(){const photo=localStorage.getItem('perfilActivoFoto'),button=$('btnSettings');if(button){button.style.backgroundImage='';button.textContent='⚙';if(photo&&(/^(https?:|data:image\/)/i.test(photo))){button.style.backgroundImage='url('+JSON.stringify(photo)+')';button.textContent='';}button.setAttribute('aria-expanded','false')}}
 profile();window.addEventListener('eu:context',profile);window.addEventListener('storage',profile);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('settingsDrawer')?.classList.contains('open'))window.toggleSettings()});
})();
