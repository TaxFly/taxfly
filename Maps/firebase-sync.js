import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);

const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

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

let currentPerfilId = null;

const legacyTrip = { id: "orlando", name: "Mi viaje a Orlando", destinations: [ { city: "Orlando", state: "Florida" } ] };
let trips = [ legacyTrip ];
let activeTripId = "orlando";
const tripCacheKey = () => "trip-planning-trips::" + currentUid + "::" + currentPerfilId;
const tripActiveKey = () => "trip-planning-active::" + currentUid + "::" + currentPerfilId;
function activeTrip() { return trips.find(t => t.id === activeTripId) || legacyTrip; }
function tripDocRef(id) { return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "tripPlanning", id); }
function saveTripCache() {
  try { localStorage.setItem(tripCacheKey(), JSON.stringify(trips)); localStorage.setItem(tripActiveKey(), activeTripId); } catch (e) {}
}
async function loadTrips() {
  try {
    const saved = JSON.parse(localStorage.getItem(tripCacheKey()) || "[]");
    if (Array.isArray(saved)) trips = [ saved.find(t => t && t.id === "orlando") || legacyTrip, ...saved.filter(t => t && t.id && t.id !== "orlando") ];
    activeTripId = localStorage.getItem(tripActiveKey()) || "orlando";
  } catch (e) {}
  try {
    if (!navigator.onLine) throw new Error("offline");
    const snap = await Promise.race([getDocs(collection(db, "usuarios", currentUid, "perfiles", currentPerfilId, "tripPlanning")), new Promise((_, reject) => setTimeout(() => reject(new Error("trip list timeout")), 3000))]);
    const byId = new Map(trips.map(t => [t.id, t]));
    snap.forEach(d => byId.set(d.id, { ...d.data(), id: d.id }));
    trips = [ byId.get("orlando") || legacyTrip, ...[...byId.values()].filter(t => t.id !== "orlando" && t.status !== "deleted") ];
  } catch (e) { devError("trip list", e); }
  if (!trips.some(t => t.id === activeTripId)) activeTripId = "orlando";
  if (activeTrip().status && trips.some(t => !t.status)) activeTripId = trips.find(t => !t.status).id;
  saveTripCache();
  window._trip = activeTrip();
  window._tripId = activeTripId;
  window._tripList = trips;
}

window.tripPlanningCreate = async function(name, destinations, startDate, endDate) {
  const id = "trip-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const trip = { id, name, destinations, startDate: startDate || "", endDate: endDate || "" };
  trips.push(trip);
  activeTripId = id;
  saveTripCache();
  try { await setDoc(tripDocRef(id), trip); } catch (e) { devError("save trip", e); }
  location.assign("./index.html?trip=" + encodeURIComponent(id));
};
window.tripPlanningUpdate = async function(trip) {
  if (!trip || !trips.some(t => t.id === trip.id)) return false;
  try { await setDoc(tripDocRef(trip.id), trip); } catch (e) { devError("update trip", e); return false; }
  trips = trips.map(t => t.id === trip.id ? trip : t);
  saveTripCache();
  window._trip = activeTrip();
  window._tripList = trips;
  return true;
};
window.tripPlanningSelect = function(id) {
  if (!trips.some(t => t.id === id)) return;
  activeTripId = id;
  saveTripCache();
  location.assign("./index.html?trip=" + encodeURIComponent(id));
};

window.tripPlanningArchive = async function(id, status) {
  const trip = trips.find(t => t.id === id);
  if (!trip || !["completed", "suspended"].includes(status)) return false;
  const updated = { ...trip, status };
  if (!await window.tripPlanningUpdate(updated)) return false;
  if (activeTripId === id) activeTripId = trips.find(t => !t.status)?.id || id;
  saveTripCache();
  location.assign("./index.html?trip=" + encodeURIComponent(activeTripId));
  return true;
};

window.tripPlanningRestore = async function(id) {
  const trip = trips.find(t => t.id === id);
  if (!trip || !await window.tripPlanningUpdate({ ...trip, status: "" })) return false;
  window.tripPlanningSelect(id);
  return true;
};

window.tripPlanningDelete = async function(id) {
  // Legacy Orlando lives in the original collection and must remain recoverable.
  if (id === "orlando" || !trips.some(t => t.id === id) || !navigator.onLine) return false;
  try {
    // Keep purchase and itinerary history visible under "Sin viaje".
    for (const group of ["gastos", "actividades", "notas"]) {
      const linked = await getDocs(collection(db, "usuarios", currentUid, "perfiles", currentPerfilId, group));
      for (const item of linked.docs) {
        if (item.data().tripId === id) await updateDoc(item.ref, { tripId: "unassigned" });
      }
    }
    const data = await getDocs(collection(db, "usuarios", currentUid, "perfiles", currentPerfilId, "tripPlanning", id, "data"));
    for (const item of data.docs) await deleteDoc(item.ref);
    await setDoc(tripDocRef(id), { id, status: "deleted", deletedAt: new Date().toISOString() });
  } catch (e) { devError("delete trip", e); return false; }
  trips = trips.filter(t => t.id !== id);
  // Existing local keys keep their old names; only the deleted trip suffix is removed.
  const suffix = "::" + currentPerfilId + "::" + id;
  try { Object.keys(localStorage).filter(k => k.endsWith(suffix)).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  if (activeTripId === id) activeTripId = trips.find(t => !t.status)?.id || "orlando";
  saveTripCache();
  location.assign("./index.html?trip=" + encodeURIComponent(activeTripId));
  return true;
};

function orlandoDocRef(docId) {
  if (activeTripId === "orlando") return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "orlando", docId);
  return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "tripPlanning", activeTripId, "data", docId);
}

const docWriteQueues = new Map();
function fbSet(docId, data) {
  // Keep full-array updates in order: an earlier geocode result must never
  // replace a later version of the same day after a slow network write.
  const snapshot = JSON.parse(JSON.stringify(data));
  const ref = orlandoDocRef(docId);
  const previous = docWriteQueues.get(docId) || Promise.resolve();
  const write = previous.catch(() => {}).then(() => setDoc(ref, snapshot, { merge: true }));
  docWriteQueues.set(docId, write);
  write.then(() => { if (docWriteQueues.get(docId) === write) docWriteQueues.delete(docId); },
    e => { devError("fbSet error", e); if (docWriteQueues.get(docId) === write) docWriteQueues.delete(docId); });
  return write;
}

async function fbGet(docId) {
  try {
    const snap = await getDoc(orlandoDocRef(docId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    devError("fbGet error", e);
    return null;
  }
}

function stableStringify(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",") + "}";
}

const CONFLICT_WINDOW_MS = 6e3;

function fbListen(docId, callback) {
  return onSnapshot(orlandoDocRef(docId), snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    const log = window._syncedWriteLog && window._syncedWriteLog[docId];
    if (window._appInited && log && Date.now() - log.at < CONFLICT_WINDOW_MS) {
      if (stableStringify(data) !== log.value) {
        window.showMToast && window.showMToast("⚠️ Otro dispositivo editó esto casi al mismo tiempo — revisá que no se haya perdido nada");
      }
    }
    callback(data);
  });
}

function perfilDocRef() {
  return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId);
}

async function fbSetPresupuesto(v) {
  try {
    await setDoc(perfilDocRef(), {
      presupuesto: v
    }, {
      merge: true
    });
    return true;
  } catch (e) {
    devError("fbSetPresupuesto error", e);
    return false;
  }
}

function listenTaxflyPresupuesto(cb) {
  return onSnapshot(perfilDocRef(), snap => {
    const p = snap.exists() ? snap.data().presupuesto : undefined;
    cb(p === undefined || p === null ? 0 : parseFloat(p) || 0);
  }, () => {});
}

function listenTaxflyGastos(cb) {
  return onSnapshot(collection(db, "usuarios", currentUid, "perfiles", currentPerfilId, "gastos"), snap => {
    let total = 0, n = 0;
    snap.forEach(d => {
      const x = d.data() || {};
      if ((x.tripId === undefined ? "orlando" : x.tripId) !== activeTripId) return;
      total += parseFloat(x.valor || x.monto) || 0;
      n++;
    });
    cb(total, n);
  }, () => {});
}

window._fb = {
  fbSet: fbSet,
  fbGet: fbGet,
  fbListen: fbListen,
  stableStringify: stableStringify,
  fbSetPresupuesto: fbSetPresupuesto,
  listenTaxflyPresupuesto: listenTaxflyPresupuesto,
  listenTaxflyGastos: listenTaxflyGastos
};

window._fbSignOut = async function() {
  try {
    await signOut(auth);
  } catch (e) {}
  window.location.replace(TAXFLY_LOGIN_URL);
};

async function startApp() {
  await loadTrips();
  const withTimeout = (p, ms) => Promise.race([ p, new Promise(resolve => setTimeout(() => resolve(null), ms)) ]);
  const results = await Promise.allSettled([ withTimeout(fbGet("hotel"), 1e4), withTimeout(fbGet("days"), 1e4), withTimeout(fbGet("visited"), 1e4), withTimeout(fbGet("meals"), 1e4), withTimeout(fbGet("walmart"), 1e4), withTimeout(fbGet("wmChecked"), 1e4), withTimeout(fbGet("shopping"), 1e4), withTimeout(fbGet("customParks"), 1e4), withTimeout(fbGet("parquesExtra"), 1e4), withTimeout(fbGet("coordOverrides"), 1e4), withTimeout(fbGet("parques"), 1e4), withTimeout(fbGet("budget"), 1e4), withTimeout(fbGet("itinerario"), 1e4), withTimeout(fbGet("tips"), 1e4), withTimeout(fbGet("parquesExcel"), 1e4) ]);
  const val = r => r.status === "fulfilled" ? r.value : null;
  const [hotelData, daysData, visitedData, mealDataFb, wmDataFb, wmCheckedFb, shopDataFb, customParksDataFb, parquesExtraDataFb, coordOverridesDataFb, parquesDataFb, budgetDataFb, itinDataFb, tipsDataFb, parquesExcelDataFb] = results.map(val);
  if (hotelData) window._hotelFromFb = hotelData;
  if (daysData && daysData.days) {
    window._daysFromFb = daysData.days;
    window._daysVersionFromFb = daysData.v || 1;
  }
  if (visitedData && visitedData.visited) window._visitedFromFb = visitedData.visited;
  if (mealDataFb && mealDataFb.meals) window._mealsFromFb = mealDataFb.meals;
  if (wmDataFb && wmDataFb.data) window._wmDataFromFb = wmDataFb.data;
  if (wmCheckedFb && wmCheckedFb.checked) window._wmCheckedFromFb = wmCheckedFb.checked;
  if (shopDataFb) window._shopFromFb = shopDataFb;
  if (customParksDataFb && customParksDataFb.items) window._customParksFromFb = customParksDataFb.items;
  if (parquesExtraDataFb) window._parquesExtraFromFb = parquesExtraDataFb;
  if (coordOverridesDataFb) window._coordOverridesFromFb = coordOverridesDataFb;
  if (parquesDataFb && parquesDataFb.state) window._parquesFromFb = parquesDataFb.state;
  if (budgetDataFb) window._budgetFromFb = budgetDataFb;
  if (itinDataFb) window._itinFromFb = itinDataFb;
  if (tipsDataFb) window._tipsFromFb = tipsDataFb;
  if (parquesExcelDataFb) window._parquesExcelFromFb = parquesExcelDataFb;
  window._fbReady = true;
  window._splashFbReady && window._splashFbReady();
  if (window._appInit) window._appInit();
  fbListen("hotel", data => {
    if (window.hotel) {
      Object.assign(window.hotel, data);
      window.renderOutlets && window.renderOutlets();
    }
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
  if (!user) {
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
  currentUid = user.uid;
  currentPerfilId = perfilId;
  window._perfilId = perfilId;
  // A direct link may select an existing trip, but never an unknown ID.
  try {
    const requested = new URLSearchParams(location.search).get("trip");
    if (requested && requested === localStorage.getItem(tripActiveKey())) activeTripId = requested;
  } catch (e) {}
  startApp();
});
