import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, onSnapshot, getDoc, collection } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

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

function orlandoDocRef(docId) {
  return doc(db, "usuarios", currentUid, "perfiles", currentPerfilId, "orlando", docId);
}

async function fbSet(docId, data) {
  try {
    await setDoc(orlandoDocRef(docId), data, {
      merge: true
    });
  } catch (e) {
    devError("fbSet error", e);
  }
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
  startApp();
});