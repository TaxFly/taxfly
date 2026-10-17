import { fsNet } from "./fs-net.js";
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc, getDocFromCache, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const FS_NET = await fsNet();
const db = (() => {
  try {
    return initializeFirestore(app, {
      ...FS_NET,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

window.taxflyPlanDb = db;
window.dispatchEvent(new Event("taxfly:plan-db"));

const auth = getAuth(app);

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

const TAXFLY_LOGIN_URL = "https://taxfly.github.io/taxfly/login.html";

const TAXFLY_PROFILES_URL = "https://taxfly.github.io/taxfly/profiles.html";

const PENDING_REDIRECT_KEY = "taxusa_pending_redirect";

let currentUid = null;
let planGeneration=0;

let currentPerfilId = null;

const legacyTrip = window.TripContext.legacy;
let trips = [];
let activeTripId = "unassigned";
const tripActiveKey = () => window.TripContext.keys(currentUid,currentPerfilId).active;
function activeTrip() { return trips.find(t => t.id === activeTripId) || null; }
function publishTrip() {
  trips = window.TripContext.readTrips(currentUid,currentPerfilId);
  activeTripId = window.TripContext.active(currentUid,currentPerfilId);
  window._trip = activeTrip(); window._tripId = activeTripId; window._tripList = trips;
}
window.addEventListener("storage", e => {
  if (currentUid && currentPerfilId &&
      (e.key === tripActiveKey() || e.key === window.TripContext.keys(currentUid,currentPerfilId).list)) location.reload();
});
async function loadTrips() {
  window._taxflyTripUid=currentUid; window._taxflyTripProfile=currentPerfilId;
  window.TripContext.configure({db,doc,collection,getDocs,setDoc,updateDoc,deleteDoc});
  // Camino rapido: si ya hay viajes guardados en este dispositivo, se arranca con ellos
  // y la sincronizacion con el servidor sigue en segundo plano.
  publishTrip();
  const startedWith = activeTripId;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady=resolve; });
  const hydrating = window.TripContext.hydrate(db,currentUid,currentPerfilId,getDocs,collection,()=>{
    publishTrip();
    if(trips.length || window.TripContext.status(currentUid,currentPerfilId).phase!=='loading')resolveReady();
  }).catch(() => {}).then(() => {publishTrip();resolveReady();});
  if (!trips.length) { await ready; return; }
  hydrating.then(() => { if (activeTripId !== startedWith) location.reload(); });
}
function listenTripDocuments() {
  let unsubscribe = () => {}, cancelled = false;
  Promise.resolve(window.TaxflyDocsTree?.ensure(currentUid, currentPerfilId)).catch(() => false).then(() => {
    if (cancelled) return;
    unsubscribe = onSnapshot(collection(db, ...window.TaxflyDocsTree.base(currentUid, currentPerfilId)), snap => {
      window._tripDocuments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(d => (d.tripId || "unassigned") === activeTripId);
      window.renderReservations?.();
      window.refreshItineraryDocumentOptions?.();
    }, () => {});
  });
  return () => { cancelled = true; unsubscribe(); };
}
window.tripPlanningCreate = async function(name,destinations,startDate,endDate) {
  await window.TripContext.create(currentUid,currentPerfilId,{name,destinations,startDate,endDate});
  publishTrip(); location.assign("planificacion.html");
};
window.tripPlanningUpdate = async function(trip) {
  if(!trip || !trips.some(t=>t.id===trip.id))return false;
  const saved=await window.TripContext.save(currentUid,currentPerfilId,trip);
  publishTrip();
  if(!saved) window.showMToast?.("Guardado en este dispositivo; pendiente de Firebase.");
  return true;
};
window.tripPlanningSelect = function(id) {
  if(!window.TripContext.select(currentUid,currentPerfilId,id))return;
  location.assign("planificacion.html");
};
window.tripPlanningArchive = async function(id,status) {
  const saved=await window.TripContext.archive(currentUid,currentPerfilId,id,status);
  publishTrip();
  if(!saved) window.showMToast?.("Pendiente de sincronización con Firebase.");
  location.assign("planificacion.html"); return true;
};
window.tripPlanningRestore = async function(id) {
  await window.TripContext.archive(currentUid,currentPerfilId,id,"");
  window.tripPlanningSelect(id); return true;
};
window.tripPlanningDelete = async function(id) {
  if(!await window.TripContext.remove(currentUid,currentPerfilId,id))return false;
  publishTrip(); location.assign("planificacion.html"); return true;
};

function orlandoDocRef(docId) {
  if (activeTripId === "orlando") return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "orlando", docId);
  return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "tripPlanning", activeTripId, "data", docId);
}

const docWriteQueues = new Map();
function fbSet(docId, data) {
  const snapshot = JSON.parse(JSON.stringify(data));
  const ref = orlandoDocRef(docId);
  const previous = docWriteQueues.get(docId) || Promise.resolve();
  const write = previous.catch(() => {}).then(() => setDoc(ref, snapshot, { merge: true }));
  docWriteQueues.set(docId, write);
  write.then(() => { if (docWriteQueues.get(docId) === write) docWriteQueues.delete(docId); },
    e => { devError("fbSet error", e); if (docWriteQueues.get(docId) === write) docWriteQueues.delete(docId); });
  return write;
}

async function fbGet(docId, throwOnError=false) {
  try {
    const ref = orlandoDocRef(docId);
    // Cache local primero (instantaneo). Los listeners onSnapshot que se activan
    // despues del primer render traen la version del servidor y actualizan la pantalla.
    try {
      const cached = await getDocFromCache(ref);
      if (cached.exists()) return cached.data();
    } catch (_) {}
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    devError("fbGet error", e);
    if(throwOnError)throw e;
    return null;
  }
}

function stableStringify(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",") + "}";
}

const CONFLICT_WINDOW_MS = 6e3;

const initialPlanningCallbacks=new Map();
function fbListen(docId, callback) {
  const generation=planGeneration;
  const deliver=data=>{
    if(generation!==planGeneration || !data)return;
    const pending = window._planPendingPayload?.(docId);
    if (pending) {
      try { if (stableStringify(JSON.parse(pending)) !== stableStringify(data)) return; } catch (_) { return; }
    }
    const log = window._syncedWriteLog && window._syncedWriteLog[docId];
    if (window._appInited && log && Date.now() - log.at < CONFLICT_WINDOW_MS) {
      if (stableStringify(data) !== log.value) {
        window.showMToast && window.showMToast("⚠️ Otro dispositivo editó esto casi al mismo tiempo — revisá que no se haya perdido nada");
      }
    }
    callback(data);
  };
  initialPlanningCallbacks.set(docId,deliver);
  return onSnapshot(orlandoDocRef(docId),{includeMetadataChanges:true},snap=>{
    if(generation!==planGeneration)return;
    if(!snap.exists()&&snap.metadata?.fromCache)return;
    if(window._planInitialState)window._planInitialState[docId]="ready";
    if(snap.exists())deliver(snap.data());
    window.refreshPlanningLoadState?.();
  },()=>{
    if(generation!==planGeneration)return;
    if(window._planInitialState?.[docId]!=="ready")window._planInitialState[docId]="error";
    window.refreshPlanningLoadState?.();
  });
}

function tripDocRef(id){return doc(db,'usuarios',currentUid,'perfiles',currentPerfilId,'tripPlanning',id);}

function perfilDocRef() {
  return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId);
}

async function fbSetPresupuesto(v) {
  window.TaxflyTravel.publishBudget(currentUid,currentPerfilId,activeTripId,v);
  try {
    const ref=activeTripId==="orlando"?perfilDocRef():tripDocRef(activeTripId);
    await setDoc(ref,{[activeTripId==="orlando"?"presupuesto":"taxflyBudget"]:v},{merge:true});
    return true;
  } catch (e) {
    devError("fbSetPresupuesto error", e);
    return false;
  }
}

function listenTaxflyPresupuesto(cb) {
  const uid=currentUid,pid=currentPerfilId,trip=activeTripId;
  const key='taxusa_budget_cache_'+pid+'::'+uid+(trip==='orlando'?'':'::'+trip);
  const cached=localStorage.getItem(key),state=window.TaxflyTravel.loadState(cached!==null&&Number.isFinite(Number(cached))?Number(cached):undefined);
  const valid=()=>uid===currentUid&&pid===currentPerfilId&&trip===activeTripId;
  if(state.hasValue)cb(state.value);
  const ref=trip==='orlando'?perfilDocRef():tripDocRef(trip);
  const localChange=event=>{
    const data=event.detail;
    if(valid() && data?.uid===uid && data.pid===pid && data.trip===trip){state.receive(data.value);cb(data.value);}
  };
  window.addEventListener('taxfly:budget-updated',localChange);
  const stop=onSnapshot(ref,{includeMetadataChanges:true},snap=>{
    if(!valid())return;
    const value=Number(snap.exists()?snap.data()[trip==='orlando'?'presupuesto':'taxflyBudget']:0)||0;
    if(state.receive(value,snap,value===0)){window._planBudgetError=false;window._planFinanceError=!!window._planExpenseError;localStorage.setItem(key,String(value));cb(value);}
  },()=>{if(valid()){window._planBudgetError=true;window._planFinanceError=true;window.budgetRefresh?.();}});
  return ()=>{stop();window.removeEventListener('taxfly:budget-updated',localChange);};
}
function listenTaxflyGastos(cb) {
  const uid=currentUid,pid=currentPerfilId,trip=activeTripId,key='taxusa_gastos_cache_'+pid+'::'+uid;
  let cached;try{const raw=localStorage.getItem(key);if(raw!==null)cached=JSON.parse(raw);}catch(_){}
  const state=window.TaxflyTravel.loadState(Array.isArray(cached)?cached:undefined);
  const valid=()=>uid===currentUid&&pid===currentPerfilId&&trip===activeTripId;
  const publish=()=>{
    const ops=JSON.parse(localStorage.getItem('taxusa_gastos_pending_'+pid+'::'+uid)||'[]');
    window._tripExpenses=window.TaxflyTravel.overlayExpenses(state.value||[],ops).filter(g=>(g.tripId||'unassigned')===trip);
    window.renderReservations?.();cb(window._tripExpenses.reduce((sum,g)=>sum+(Number(g.valor)||0),0),window._tripExpenses.length);
  };
  if(state.hasValue)publish();
  const localChange=()=>{if(valid()&&state.hasValue)publish();};
  const storageChange=e=>{if(e.key==='taxusa_gastos_pending_'+pid+'::'+uid)localChange();};
  window.addEventListener('taxfly-pending-updated',localChange);
  window.addEventListener('storage',storageChange);
  const stop=onSnapshot(collection(db,'usuarios',uid,'perfiles',pid,'gastos'),{includeMetadataChanges:true},snap=>{
    if(!valid())return;
    const items=snap.docs.map(d=>({...d.data(),id:d.id}));
    if(state.receive(items,snap,!items.length)){window._planExpenseError=false;window._planFinanceError=!!window._planBudgetError;localStorage.setItem(key,JSON.stringify(items));publish();}
  },()=>{if(valid()){window._planExpenseError=true;window._planFinanceError=true;window.budgetRefresh?.();}});
  return ()=>{stop();window.removeEventListener('taxfly-pending-updated',localChange);window.removeEventListener('storage',storageChange);};
}

async function migrateManualExpenses() {
  if (!navigator.onLine) return;
  const old = window._getLegacyBudgetExpenses?.() || [];
  if (!old.length) return;
  if (old.some(x => !x?.id || !(Number(x.monto) > 0))) return;
  const dest = collection(db, "usuarios", currentUid, "perfiles", currentPerfilId, "gastos");
  for (const expense of old) {
    if (!expense?.id || !(Number(expense.monto) > 0)) continue;
    await setDoc(doc(dest, "maps-" + activeTripId + "-" + expense.id), {
      nombre: expense.nota || expense.cat || "Gasto de Planificación",
      valor: Number(expense.monto),
      cat: expense.cat || "otros",
      fecha: expense.fecha || Date.now(),
      tripId: activeTripId,
      source: "trip-planning"
    }, { merge: true });
  }
  await window._clearLegacyBudgetExpenses?.();
}

async function addTaxflyGasto(data) {
  const uid=currentUid,pid=currentPerfilId,trip=activeTripId;
  if (!uid || !pid) return false;
  const gasto = {
    nombre: String(data.nombre || "Gasto"), valor: Number(data.valor) || 0,
    cat: data.cat || "📦 Otros", fecha: Date.now(), thumb: "",
    tripId: trip, source: data.source || "trip-planning"
  };
  if (!(gasto.valor > 0)) return false;
  const ref=doc(collection(db,"usuarios",uid,"perfiles",pid,"gastos"));
  const key="taxusa_gastos_pending_"+pid+"::"+uid;
  const op={type:"upsert",id:ref.id,data:gasto,ts:Date.now()};
  try {
    const ops=JSON.parse(localStorage.getItem(key)||"[]");
    ops.push(op);localStorage.setItem(key,JSON.stringify(ops));
  } catch (_) { return false; }
  window.dispatchEvent(new Event("taxfly-pending-updated"));
  if (navigator.onLine) {
    // The same document ID is reused by every retry, including reconnect sync.
    setDoc(ref,gasto,{merge:true}).then(()=>{
      const latest=JSON.parse(localStorage.getItem(key)||"[]");
      localStorage.setItem(key,JSON.stringify(latest.filter(item=>JSON.stringify(item)!==JSON.stringify(op))));
      window.dispatchEvent(new Event("taxfly-pending-updated"));
    }).catch(error=>devError("addTaxflyGasto queued",error));
  }
  return true;
}

window._fb = {
  fbSet: fbSet,
  fbGet: fbGet,
  fbListen: fbListen,
  stableStringify: stableStringify,
  fbSetPresupuesto: fbSetPresupuesto,
  listenTaxflyPresupuesto: listenTaxflyPresupuesto,
  listenTaxflyGastos: listenTaxflyGastos,
  addTaxflyGasto: addTaxflyGasto
};

window._fbSignOut = async function() {
  try {
    await signOut(auth);
  } catch (e) {}
  window.location.replace(TAXFLY_LOGIN_URL);
};

async function startApp() {
  const generation=planGeneration;
  await loadTrips();
  if(generation!==planGeneration)return;
  if (!trips.length) { location.replace("index.html#viajes"); return; }
  listenTripDocuments();
  initialPlanningCallbacks.clear();
  const fields={"hotel": ["_hotelFromFb", null], "days": ["_daysFromFb", "days"], "visited": ["_visitedFromFb", "visited"], "meals": ["_mealsFromFb", "meals"], "walmart": ["_wmDataFromFb", "data"], "wmChecked": ["_wmCheckedFromFb", "checked"], "shopping": ["_shopFromFb", null], "customParks": ["_customParksFromFb", "items"], "parquesExtra": ["_parquesExtraFromFb", null], "coordOverrides": ["_coordOverridesFromFb", null], "parques": ["_parquesFromFb", "state"], "budget": ["_budgetFromFb", null], "itinerario": ["_itinFromFb", null], "tips": ["_tipsFromFb", null], "parquesExcel": ["_parquesExcelFromFb", null], "reservations": ["_reservationsFromFb", null]};
  const loading=window.PlanLoading.create(id=>fbGet(id,true),(id,data)=>{
    if(generation!==planGeneration)return;
    const [name,field]=fields[id];
    if(data)window[name]=field?data[field]:data;
    if(id==="days"&&data)window._daysVersionFromFb=data.v||1;
    if(window._appInited&&data)initialPlanningCallbacks.get(id)?.(data);
  },id=>{if(generation===planGeneration){window.refreshPlanningLoadState?.();if(id==="budget")window.budgetRefresh?.();if(id==="meals")window.renderTodayCard?.();}});
  window._planInitialState=loading.states;
  const params=new URLSearchParams(location.search);
  let section=params.get("section");
  try{section=section||sessionStorage.getItem("orl_section");}catch(_){}
  const first=section==="parques"||!section?(params.get("subtab")==="atracciones"?"atracciones":"agenda"):section;
  await loading.waitFor(first);
  if(generation!==planGeneration)return;
  window._fbReady = true;
  if (Object.values(loading.states).some(state=>state==="ready")) window.taxflyOfflineStatus?.mark("plan", currentUid, currentPerfilId, activeTripId);
  if (window._appInit) window._appInit();
  document.getElementById("trip-loading")?.remove();
  loading.jobs.budget.then(()=>{if(generation===planGeneration&&loading.states.budget==="ready")return migrateManualExpenses();}).catch(e => devError("expense migration", e));
  fbListen("hotel", data => {
    if (window.hotel) {
      Object.assign(window.hotel, data);
      window.renderOutlets && window.renderOutlets();
    }
  });
  fbListen("reservations", data => {
    if (data && data.items && window._appInited) window._setReservationsData?.(data);
  });
  fbListen("visited", data => {
    if (data && data.visited && window.visited) {
      window.visited.length = 0;
      data.visited.forEach(arr => window.visited.push(new Set(Array.isArray(arr) ? arr : [])));
      window.syncVisitedLength && window.syncVisitedLength();
      window.renderOutlets && window.renderOutlets();
      window.updateGlobal && window.updateGlobal();
    }
  });
  fbListen("days", data => {
    if (data && data.days && window.days) {
      if (window._shouldIgnoreDaysSnapshot?.(data)) return;
      window.days.length = 0;
      data.days.forEach(d => window.days.push(d));
      window.syncVisitedLength && window.syncVisitedLength();
      window.renderOutlets && window.renderOutlets();
      window.updateGlobal && window.updateGlobal();
    }
  });
  fbListen("meals", data => {
    if (data && data.meals && window._appInited) {
      window._setMealData && window._setMealData(data.meals);
      window.renderComidas && window.renderComidas();
    }
  });
  fbListen("walmart", data => {
    if (data && data.data && window._appInited) {
      window._setWmData && window._setWmData(data.data);
      window.renderWalmart && window.renderWalmart();
    }
  });
  fbListen("wmChecked", data => {
    if (data && data.checked && window.wmChecked) {
      window.wmChecked.clear();
      data.checked.forEach(k => window.wmChecked.add(k));
      window.renderWalmart && window.renderWalmart();
    }
  });
  fbListen("shopping", data => {
    if (data && data.items !== undefined && window._appInited) {
      window._shopFromFb = data;
      window._setShopData && window._setShopData(data);
      window.renderOutlets && window.renderOutlets();
    }
  });
  fbListen("customParks", data => {
    if (data && data.items !== undefined && window._appInited) {
      window._setCustomParksData && window._setCustomParksData(data.items);
      window.renderParques && window.renderParques();
    }
  });
  fbListen("parquesExtra", data => {
    if (data && window._appInited) {
      window._setExtraZonesData && window._setExtraZonesData(data);
      window.renderParques && window.renderParques();
    }
  });
  fbListen("coordOverrides", data => {
    if (data && window._appInited) {
      window._setCoordOverridesData && window._setCoordOverridesData(data);
      window.renderParques && window.renderParques();
    }
  });
  fbListen("parques", data => {
    if (data && data.state && window._appInited) {
      parquesState = data.state;
      window.renderParques && window.renderParques();
      updateParquesCounter();
    }
  });
  fbListen("itinerario", data => {
    if (data && data.dias !== undefined && window._appInited) {
      window._itinFromFb = data;
      window._setItinData && window._setItinData(data);
      window.renderParques && window.renderParques();
    }
  });
  fbListen("tips", data => {
    if (data && data.items !== undefined && window._appInited) {
      window._setTipsData && window._setTipsData(data.items);
      window.renderOutlets && window.renderOutlets();
    }
  });
  fbListen("parquesExcel", data => {
    if (data && window._appInited) {
      window._setParquesExcelData && window._setParquesExcelData(data);
      window.renderParques && window.renderParques();
    }
  });
  fbListen("budget", data => {
    if (data && window._appInited) {
      window._setBudgetData && window._setBudgetData(data);
      window.budgetRefresh && window.budgetRefresh();
    }
  });
  listenTaxflyPresupuesto(p => window._setTaxflyBudget && window._setTaxflyBudget({
    presupuesto: p
  }));
  listenTaxflyGastos((t, n) => window._setTaxflyBudget && window._setTaxflyBudget({
    gastos: t,
    gastosN: n
  }));
}

onAuthStateChanged(auth, user => {
  planGeneration++;
  if (!user) {
    currentUid=null;currentPerfilId=null;window._resetTaxflyFinance?.();
    try {
      localStorage.setItem(PENDING_REDIRECT_KEY, location.href);
    } catch (e) {}
    window.location.replace(TAXFLY_LOGIN_URL);
    return;
  }
  let perfilId = null;
  try {
    perfilId = localStorage.getItem("perfilActivoId");
  } catch (e) {}
  if (!perfilId) {
    try {
      localStorage.setItem(PENDING_REDIRECT_KEY, location.href);
    } catch (e) {}
    window.location.replace(TAXFLY_PROFILES_URL);
    return;
  }
  if(currentUid!==user.uid||currentPerfilId!==perfilId)window._resetTaxflyFinance?.();
  currentUid = user.uid;
  currentPerfilId = perfilId;
  window._perfilId = perfilId;
  try {
    const requested = new URLSearchParams(location.search).get("trip");
    if (requested && requested === localStorage.getItem(tripActiveKey())) activeTripId = requested;
  } catch (e) {}
  startApp();
});
