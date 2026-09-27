import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const firebaseConfig = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const TAXFLY_LOGIN_URL = "https://taxfly.github.io/taxfly/login.html";

const TAXFLY_PROFILES_URL = "https://taxfly.github.io/taxfly/profiles.html";

const PENDING_REDIRECT_KEY = "taxusa_pending_redirect";

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

window._misCosasReady = new Promise(resolve => {
  window._misCosasResolve = resolve;
});

function rootPath(uid, perfilId, tripId) {
  // The original Mis cosas collection remains the Orlando trip. Other trips
  // get isolated collections without copying or mutating legacy documents.
  return tripId === "orlando" ? `usuarios/${uid}/perfiles/${perfilId}/misCosas/root`
    : `usuarios/${uid}/perfiles/${perfilId}/tripPlanning/${tripId}/misCosas/root`;
}

function buildDB(uid, perfilId, tripId) {
  const base = rootPath(uid, perfilId, tripId);
  return {
    collection(name) {
      const ref = collection(db, `${base}/${name}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({
              docs: snap.docs.map(d => ({
                id: d.id,
                data: () => d.data()
              }))
            });
          }, errCb);
        }
      };
    },
    doc(path) {
      const ref = doc(db, `${base}/${path}`);
      return {
        onSnapshot(cb, errCb) {
          return onSnapshot(ref, snap => {
            cb({
              exists: snap.exists(),
              data: () => snap.data()
            });
          }, errCb);
        },
        set(data) {
          return setDoc(ref, data);
        },
        delete() {
          return deleteDoc(ref);
        }
      };
    }
  };
}

window._misCosasSignOut = async function() {
  try {
    await signOut(auth);
  } catch (e) {}
  window.location.replace(TAXFLY_LOGIN_URL);
};

onAuthStateChanged(auth, async user => {
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
  window.TripContext.configure({db,doc,collection,getDocs,setDoc,updateDoc,deleteDoc});
  window._taxflyTripUid=user.uid; window._taxflyTripProfile=perfilId;
  await window.TripContext.hydrate(db,user.uid,perfilId,getDocs,collection);
  const tripId = window.TripContext.active(user.uid, perfilId);
  window._misCosasScope = `${user.uid}::${perfilId}::${tripId}`;
  const trip = window.TripContext.readTrips(user.uid, perfilId).find(t => t.id === tripId);
  renderTripManager(trip || { name: "Mi viaje a Orlando", destinations: [{ city: "Orlando", state: "Florida" }] });
  window._misCosasResolve({ DB: buildDB(user.uid, perfilId, tripId) });
});

function tmEscapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const TM_WMO = {
  0: "Despejado", 1: "Mayormente despejado", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Niebla", 48: "Niebla con escarcha", 51: "Llovizna leve", 53: "Llovizna", 55: "Llovizna intensa",
  61: "Lluvia leve", 63: "Lluvia", 65: "Lluvia intensa", 71: "Nieve leve", 73: "Nieve", 75: "Nieve intensa",
  80: "Chubascos leves", 81: "Chubascos", 82: "Chubascos fuertes", 95: "Tormenta", 96: "Tormenta con granizo", 99: "Tormenta fuerte"
};
const TM_WI = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "❄️", 75: "❄️", 80: "🌦️", 81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "🌪️"
};

function tmCacheGet(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttlMs) return null;
    return data;
  } catch (e) { return null; }
}
function tmCacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch (e) {}
}

async function tmGeocodeDestination(dest) {
  const city = [dest.city, dest.state].filter(Boolean).join(", ");
  const cacheKey = "shared-geo-cache::" + city.trim().toLowerCase();
  const cached = tmCacheGet(cacheKey, 90 * 24 * 36e5);
  if (cached) return cached;
  try {
    const cityAliases = { "Nueva York": "New York", "Los Ángeles": "Los Angeles", "Washington D.C.": "Washington" };
    const searchCity = cityAliases[dest.city] || dest.city;
    const res = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(searchCity) + "&count=20&countryCode=US&language=en&format=json");
    const data = await res.json();
    if (!data.results || !data.results.length) return null;
    const match = data.results.find(g => g.admin1?.toLowerCase() === dest.state?.toLowerCase()) || data.results[0];
    const geo = { latitude: match.latitude, longitude: match.longitude };
    tmCacheSet(cacheKey, geo);
    return geo;
  } catch (e) { return null; }
}

async function tmRenderWeather(dest) {
  const slot = document.getElementById("trip-manager-weather");
  if (!slot) return;
  try {
    const geo = await tmGeocodeDestination(dest);
    if (!geo) { slot.textContent = "Clima actual no disponible"; return; }
    const sharedKey = "shared-weather-current::" + geo.latitude.toFixed(2) + "," + geo.longitude.toFixed(2);
    let c = tmCacheGet(sharedKey, 18e5);
    if (!c) {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + geo.latitude + "&longitude=" + geo.longitude + "&current=temperature_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto");
      const data = await res.json();
      c = data.current;
      tmCacheSet(sharedKey, c);
    }
    if (!document.getElementById("trip-manager-weather")) return;
    const tempC = Math.round((c.temperature_2m - 32) * 5 / 9);
    slot.textContent = `${TM_WI[c.weather_code] || "🌡️"} Ahora ${tempC} °C · ${TM_WMO[c.weather_code] || "Clima actual"}`;
  } catch (e) {
    slot.textContent = "Clima actual no disponible";
  }
}

function renderTripManager(trip) {
  const slot = document.getElementById("trip-manager");
  if (!slot) return;
  const destinations = Array.isArray(trip.destinations) ? trip.destinations : [];
  const dest = destinations[trip.activeDestination || 0];
  const destLabel = dest ? [dest.city, dest.state].filter(Boolean).join(", ") : "";
  slot.innerHTML = `<div class="trip-manager-heading">
      <div class="trip-manager-title"><span class="trip-manager-symbol" aria-hidden="true">✈️</span><div><span class="trip-manager-kicker">VIAJE ACTIVO</span><strong title="${tmEscapeHtml(trip.name)}">${tmEscapeHtml(trip.name)}</strong></div></div>
      <a class="trip-manager-edit" href="../index.html#viajes" aria-label="Editar viaje en TaxFly">✏️<span>Editar viaje</span></a>
    </div>
    ${destLabel ? `<div class="trip-manager-destinations"><span>Destino</span><div class="trip-manager-options"><button type="button" class="active">${tmEscapeHtml(destLabel)}</button></div><span class="trip-manager-weather" id="trip-manager-weather" role="status" aria-live="polite">Cargando clima actual…</span></div>` : ""}`;
  if (dest) tmRenderWeather(dest);
}
