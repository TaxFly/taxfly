import {fsNet} from './fs-net.js';
const tc=window.TripContext;
let store=null,identity=null,adapter=null,syncing=false,epoch=0,accountSDK=null;
const message=(state,text)=>window.dispatchEvent(new CustomEvent('eu:sync',{detail:{state,text}}));
const emit=()=>window.dispatchEvent(new CustomEvent('eu:context',{detail:{store,identity}}));
const within=(promise,ms=8000)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Tiempo de espera agotado.')),ms);Promise.resolve(promise).then(x=>{clearTimeout(t);resolve(x)},e=>{clearTimeout(t);reject(e)})});
function scope(){const trip=identity&&tc.readTrips(identity.uid,identity.profile).find(t=>t.id===tc.active(identity.uid,identity.profile));return trip?.region==='europe'?{...identity,trip:trip.id}:null}
function bind(){const next=scope();if(!next){store=null;emit();return}if(store&&store.scope.trip===next.trip&&store.scope.uid===next.uid&&store.scope.profile===next.profile){emit();return}
 epoch++;store=window.TaxEuropeStore.createStore({storage:localStorage,scope:next,changed:()=>{emit();message('local','Guardado en este dispositivo'+(store?.pending.length?' · pendiente de sincronización':''));queueMicrotask(flush)}});emit();hydrate();
}
async function hydrate(){const current=store,version=epoch;if(!current||!adapter||!navigator.onLine)return;try{const snap=await within(adapter.fs.getDocsFromServer(adapter.fs.collection(adapter.db,'usuarios',current.scope.uid,'perfiles',current.scope.profile,'tripPlanning',current.scope.trip,'data')));if(version!==epoch||current!==store)return;const records=snap.docs.filter(d=>d.id.startsWith('eu_')).map(d=>({...d.data(),id:d.id}));current.merge(records);await flush()}catch(e){message('local','Datos locales disponibles. No se pudo consultar la copia en línea.')}}
async function flush(){if(syncing||!adapter||!store||!navigator.onLine||!identity)return;const current=store,version=epoch;let failed=false;syncing=true;try{
 for(const op of current.pending){if(current!==store||version!==epoch||identity?.uid!==current.scope.uid)break;message('pending','Sincronizando '+current.pending.length+' cambio(s)…');
  const ref=adapter.fs.doc(adapter.db,'usuarios',current.scope.uid,'perfiles',current.scope.profile,'tripPlanning',current.scope.trip,'data',op.id);
  const newer=await within(adapter.fs.runTransaction(adapter.db,async transaction=>{const remote=await transaction.get(ref);if(remote.exists()&&remote.data().rev>op.rev)return{...remote.data(),id:op.id};transaction.set(ref,op.record);return null}));
  current.ack(op.id,op.rev);if(newer){current.merge([newer]);message('conflict','Se conservó una versión más reciente de otro dispositivo. Revisá el registro.');}
 }
 if(current===store)message(current.pending.length?'pending':'synced',current.pending.length?'Hay cambios pendientes.':'Cambios guardados en tu cuenta.');
 }catch(e){failed=true;message('local','Guardado local. Pendiente de sincronización: '+(e.code==='permission-denied'?'el servidor rechazó el acceso. Revisá permisos de la cuenta.':'reintentá cuando haya conexión.'));}finally{syncing=false;if(!failed&&store?.pending.length)queueMicrotask(flush)}
}
async function accountAction(action){
 if(!accountSDK)throw new Error('Ingresá desde el login común de TaxFly para administrar tu cuenta.');
 const {authSDK,auth,fs,db}=accountSDK,user=auth.currentUser;if(!user)throw new Error('No hay una sesión activa.');
 if(action==='logout'){await authSDK.signOut(auth);window.taxflyClearOfflineUnlock?.();location.replace('../login.html')}
 if(action==='email')return window.confirmAndChangeEmail({currentUser:user,verifyBeforeUpdateEmail:authSDK.verifyBeforeUpdateEmail});
 if(action==='password'){await authSDK.sendPasswordResetEmail(auth,user.email);return window.showAlert('Enviamos el correo para restablecer tu contraseña.')}
 if(action==='delete')return window.confirmAndDeleteAccount({db,doc:fs.doc,deleteDoc:fs.deleteDoc,deleteUser:authSDK.deleteUser,currentUser:user});
}
window.TaxEuropeSession={accountAction,get store(){return store},get identity(){return identity},refresh:hydrate,flush};
window.addEventListener('taxfly:tripchange',()=>{try{bind()}catch(e){message('error',e.message)}});
window.addEventListener('online',()=>{if(identity)tc.flush(identity.uid,identity.profile);hydrate()});
window.addEventListener('storage',e=>{if(e.key===store?.key){try{store.reload()}catch(error){message('error',error.message)}}});
window.addEventListener('eu:retry',()=>hydrate());
if(new URLSearchParams(location.search).get('demo')==='1'){
 identity={uid:'taxeurope-demo',profile:'demo'};window._taxflyTripUid=identity.uid;window._taxflyTripProfile=identity.profile;
 if(!tc.readTrips(identity.uid,identity.profile).length)await tc.create(identity.uid,identity.profile,{name:'Europa · viaje de ejemplo',startDate:'2026-10-10',endDate:'2026-10-20',destinations:[{countryCode:'ES',countryName:'España',state:'España',city:'Madrid',currency:'EUR'}]});
 bind();message('demo','Demo local: datos separados de tu cuenta.');
 document.querySelectorAll('.nav-bar a,.section-card,.widget-budget,.eu-page-title a,.eu-current-trip a,.app-header a,.dd-item').forEach(a=>{if(!/profiles|login|tickets/.test(a.getAttribute('href')))a.search='?demo=1'});
}else try{
 const cfg=window.TAXFLY_CONFIG,base=cfg.FIREBASE_SDK;
 const [appSDK,authSDK,fs]=await Promise.all([import(base+'/firebase-app.js'),import(base+'/firebase-auth.js'),import(base+'/firebase-firestore.js')]);
 const app=appSDK.getApps().length?appSDK.getApp():appSDK.initializeApp(cfg.FIREBASE_CONFIG);
 let db;try{db=fs.initializeFirestore(app,{...(await fsNet()),localCache:fs.persistentLocalCache({tabManager:fs.persistentMultipleTabManager(),cacheSizeBytes:200*1024*1024})})}catch{db=fs.getFirestore(app)}
 accountSDK={authSDK,auth:authSDK.getAuth(app),fs,db};adapter={fs,db};tc.configure({db,...fs});
 try{if(navigator.onLine){const check=await import(base+'/firebase-app-check.js');check.initializeAppCheck(app,{provider:new check.ReCaptchaV3Provider('6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME'),isTokenAutoRefreshEnabled:true})}}catch{}
 authSDK.onAuthStateChanged(authSDK.getAuth(app),async user=>{
  const generation=++epoch;store=null;identity=null;
  if(!user){emit();message('guest','Ingresá y elegí un perfil para guardar tus datos.');return}
  const profile=localStorage.getItem('perfilActivoId');if(!profile){emit();message('profile','Elegí un perfil para administrar tus viajes.');return}
  identity={uid:user.uid,profile};window._taxflyTripUid=user.uid;window._taxflyTripProfile=profile;
  localStorage.setItem('taxusa_offline_uid',user.uid);
  await tc.hydrate(db,user.uid,profile,fs.getDocs,fs.collection,()=>{});
  if(generation!==epoch||identity?.uid!==user.uid||identity?.profile!==profile)return;try{bind()}catch(e){message('error',e.message)}
 });
}catch(e){
 const uid=localStorage.getItem('taxusa_offline_uid'),profile=localStorage.getItem('perfilActivoId');
 if(!navigator.onLine&&uid&&profile&&window.taxflyOfflineUnlocked?.()){identity={uid,profile};try{bind()}catch(error){message('error',error.message)}}
 else{message('guest','Sin acceso al servicio de cuentas. Las herramientas públicas siguen disponibles; para datos personales, ingresá o desbloqueá el modo sin conexión.');emit()}
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('../sw.js').catch(()=>{});
