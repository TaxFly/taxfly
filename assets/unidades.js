import { fsNet } from "./fs-net.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";

const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

const app = initializeApp(FB);

const auth = getAuth(app);

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

if (navigator.onLine) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
      isTokenAutoRefreshEnabled: true
    });
  } catch (e) {}
}

let currentUser = null;

const perfilFoto = localStorage.getItem("perfilActivoFoto");

let tipIndex = 0;

const i18n = window.i18n;

const unitTips = {
  es: [ "32°F = 0°C, el punto de congelamiento del agua.", "50 lbs es el límite estándar de equipaje en vuelos a EE.UU.", "1 galón de nafta = 3.785 litros. El precio suele mostrarse por galón.", "6 feet (6ft) equivalen a 1.83 m — la estatura promedio de un hombre en EE.UU.", "16.9 fl oz es la botella de agua más común en los supermercados.", "La velocidad en autopistas suele ser 65 mph ≈ 105 km/h.", "1 libra (lb) = 453 gramos. El pollo se vende por libra.", "1 oz de queso ≈ 28 gramos. Los paquetes de snacks los listan en oz.", "37°C (fiebre) = 98.6°F en términos médicos americanos.", "1 milla = 1.609 km. Las distancias en GPS americanos son en millas." ],
  en: [ "32°F = 0°C, the freezing point of water.", "50 lbs is the standard luggage limit on US flights.", "1 gallon of gas = 3.785 liters. Gas prices are shown per gallon.", "6 feet = 1.83 m — the average US adult male height.", "16.9 fl oz is the most common water bottle size in stores.", "Highway speed is usually 65 mph ≈ 105 km/h.", "1 pound (lb) = 453 grams. Chicken is sold by the pound.", "1 oz of cheese ≈ 28 grams. Snack packages list weight in oz.", "37°C (fever) = 98.6°F in US medical terms.", "1 mile = 1.609 km. US GPS distances are in miles." ],
  pt: [ "32°F = 0°C, o ponto de congelamento da água.", "50 lbs é o limite padrão de bagagem em voos para os EUA.", "1 galão de gasolina = 3,785 litros. O preço é mostrado por galão.", "6 pés = 1,83 m — a altura média de um homem adulto nos EUA.", "16,9 fl oz é a garrafa de água mais comum nos supermercados.", "A velocidade nas rodovias costuma ser 65 mph ≈ 105 km/h.", "1 libra (lb) = 453 gramas. O frango é vendido por libra.", "1 oz de queijo ≈ 28 gramas. Pacotes de snacks listam em oz.", "37°C (febre) = 98,6°F nos termos médicos americanos.", "1 milha = 1,609 km. Os GPS americanos usam milhas." ]
};

window.nextTip = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const el = document.getElementById("tip-content");
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => {
    tipIndex = (tipIndex + 1) % unitTips[lang].length;
    el.innerText = unitTips[lang][tipIndex];
    el.style.opacity = 1;
  }, 300);
};

window.toggleGroup = id => {
  const group = document.getElementById(id);
  if (!group) return;
  const isOpen = group.classList.contains("open");
  document.querySelectorAll(".conv-group").forEach(g => g.classList.remove("open"));
  if (!isOpen) group.classList.add("open");
};

window.changeLanguage = lang => {
  { const _b = document.getElementById("ai-bubble"); if (_b) _b.setAttribute("aria-label", lang === "en" ? "Taxie — Travel assistant" : lang === "pt" ? "Taxie — Assistente de viagem" : "Taxie — Asistente de viaje"); }
  localStorage.setItem("appLang", lang);
  document.documentElement.setAttribute("lang", lang);
  document.querySelectorAll(".lang-opt").forEach(o => o.classList.remove("active"));
  document.getElementById("lang-" + lang)?.classList.add("active");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (i18n[lang]?.[k]) el.innerText = i18n[lang][k];
  });
  const tc = document.getElementById("tip-content");
  if (tc) tc.innerText = unitTips[lang][tipIndex];
  document.title = lang === "en" ? "TaxFly — Units" : lang === "pt" ? "TaxFly — Unidades" : "TaxFly — Unidades";
  const offMsg = document.getElementById("offline-toast-msg");
  if (offMsg && i18n[lang]?.offline_msg) offMsg.textContent = i18n[lang].offline_msg;
  if (window.taxieUpdateLang) window.taxieUpdateLang(lang);
  if (window.frasesRender) window.frasesRender();
  if (window.farmaRender && window.farmaGetFilteredCurrent) window.farmaRender(window.farmaGetFilteredCurrent());
  if (window.farmaInitCats) window.farmaInitCats();
  const syncMsg = document.getElementById("sync-ok-msg");
  if (syncMsg && window.i18n[lang]?.sync_ok) syncMsg.textContent = window.i18n[lang].sync_ok;
};

window.conv = id => {
  const val = parseFloat(document.getElementById(id).value);
  if (isNaN(val)) {
    clearGroup(id);
    return;
  }
  switch (id) {
   case "f":
    set("c", ((val - 32) * 5 / 9).toFixed(1));
    break;

   case "c":
    set("f", (val * 9 / 5 + 32).toFixed(1));
    break;

   case "mph":
    set("kmh", (val * 1.60934).toFixed(1));
    break;

   case "kmh":
    set("mph", (val / 1.60934).toFixed(1));
    break;

   case "lb":
    set("kg", (val * .453592).toFixed(2));
    break;

   case "kg":
    set("lb", (val / .453592).toFixed(2));
    break;

   case "oz":
    set("gr", (val * 28.3495).toFixed(1));
    break;

   case "gr":
    set("oz", (val / 28.3495).toFixed(1));
    break;

   case "gal":
    set("lit", (val * 3.78541).toFixed(2));
    set("floz", (val * 128).toFixed(1));
    break;

   case "lit":
    set("gal", (val / 3.78541).toFixed(2));
    set("floz", (val * 33.814).toFixed(1));
    break;

   case "floz":
    set("lit", (val / 33.814).toFixed(3));
    set("gal", (val / 128).toFixed(3));
    break;

   case "ft":
    set("in", (val * 12).toFixed(1));
    set("cm", (val * 30.48).toFixed(1));
    break;

   case "in":
    set("ft", (val / 12).toFixed(2));
    set("cm", (val * 2.54).toFixed(1));
    break;

   case "cm":
    set("ft", (val / 30.48).toFixed(2));
    set("in", (val / 2.54).toFixed(1));
    break;
  }
};

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function clearGroup(id) {
  const groups = [ [ "f", "c" ], [ "mph", "kmh" ], [ "lb", "kg" ], [ "oz", "gr" ], [ "gal", "lit", "floz" ], [ "ft", "in", "cm" ] ];
  groups.forEach(g => {
    if (g.includes(id)) g.forEach(f => {
      if (f !== id) set(f, "");
    });
  });
}

window.toggleMoreMenu = e => {
  e.stopPropagation();
  const btn = document.getElementById("btnMore");
  const dd = document.getElementById("navDropdown");
  const isOpen = dd.classList.contains("show");
  dd.classList.toggle("show", !isOpen);
  btn.classList.toggle("open", !isOpen);
};

document.addEventListener("click", e => {
  const dd = document.getElementById("navDropdown");
  const btn = document.getElementById("btnMore");
  if (dd && btn && !btn.contains(e.target)) {
    dd.classList.remove("show");
    btn.classList.remove("open");
  }
});

window.toggleSettings = () => {
  const d = document.getElementById("settingsDrawer"), open = d.classList.toggle("open");
  document.getElementById("menuOverlay").style.display = open ? "block" : "none";
};

window.toggleDarkMode = () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

window.changeProfile = () => {
  localStorage.removeItem("perfilActivoId");
  window.location.href = "profiles.html";
};

window.gestionarPIN = () => {
  document.getElementById("settingsDrawer").classList.remove("open");
  document.getElementById("menuOverlay").style.display = "none";
  const lang = localStorage.getItem("appLang") || "es";
  const texts = {
    es: {
      title: "Cambiar PIN Offline",
      sub: "Este PIN se usa para acceder sin conexión",
      l1: "PIN Nuevo (4–6 dígitos)",
      l2: "Confirmar PIN",
      btn: "Guardar PIN",
      ok: "¡PIN actualizado!",
      okSub: "Podés usarlo para entrar sin conexión"
    },
    en: {
      title: "Change Offline PIN",
      sub: "This PIN is used to access without internet",
      l1: "New PIN (4–6 digits)",
      l2: "Confirm PIN",
      btn: "Save PIN",
      ok: "PIN updated!",
      okSub: "You can use it to sign in offline"
    },
    pt: {
      title: "Alterar PIN Offline",
      sub: "Este PIN é usado para acessar sem internet",
      l1: "Novo PIN (4–6 dígitos)",
      l2: "Confirmar PIN",
      btn: "Salvar PIN",
      ok: "PIN atualizado!",
      okSub: "Você pode usá-lo para entrar sem conexão"
    }
  };
  const t = texts[lang] || texts.es;
  document.getElementById("pinModalTitle").textContent = t.title;
  document.getElementById("pinModalSub").textContent = t.sub;
  document.getElementById("pinLabel1").textContent = t.l1;
  document.getElementById("pinLabel2").textContent = t.l2;
  document.getElementById("pinConfirmBtn").textContent = t.btn;
  document.getElementById("pinSuccessMsg").textContent = t.ok;
  document.getElementById("pinSuccessSub").textContent = t.okSub;
  document.getElementById("pinInput1").value = "";
  document.getElementById("pinInput2").value = "";
  document.getElementById("pinError").style.display = "none";
  document.getElementById("pinStep1").style.display = "block";
  document.getElementById("pinStep2").style.display = "none";
  const overlay = document.getElementById("pinModalOverlay");
  overlay.style.display = "flex";
  setTimeout(() => document.getElementById("pinInput1").focus(), 100);
};

window.closePinModal = () => {
  document.getElementById("pinModalOverlay").style.display = "none";
};

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && document.getElementById("pinModalOverlay").style.display === "flex") window.closePinModal();
});

window.confirmarPIN = async () => {
  const lang = localStorage.getItem("appLang") || "es";
  const errMsgs = {
    es: "Los PINs no coinciden o son muy cortos (mín. 4 dígitos).",
    en: "PINs don't match or are too short (min. 4 digits).",
    pt: "Os PINs não coincidem ou são curtos demais (mín. 4 dígitos)."
  };
  const p1 = document.getElementById("pinInput1").value.trim();
  const p2 = document.getElementById("pinInput2").value.trim();
  const errEl = document.getElementById("pinError");
  if (p1.length < 4 || p1 !== p2) {
    errEl.textContent = errMsgs[lang] || errMsgs.es;
    errEl.style.display = "block";
    document.getElementById("pinInput1").style.borderColor = "var(--danger)";
    document.getElementById("pinInput2").style.borderColor = "var(--danger)";
    return;
  }
  errEl.style.display = "none";
  const hash = await window.createPinHash(p1);
  localStorage.setItem("taxusa_pin_hash", hash);
  if (currentUser) {
    if (!navigator.onLine) {
      localStorage.setItem("taxusa_pin_pending_sync", hash);
    } else {
      try {
        await setDoc(doc(db, "usuarios", currentUser.uid), {
          pinHash: hash
        }, {
          merge: true
        });
        localStorage.removeItem("taxusa_pin_pending_sync");
      } catch (e) {
        console.warn("PIN sync error:", e);
        localStorage.setItem("taxusa_pin_pending_sync", hash);
      }
    }
  }
  document.getElementById("pinStep1").style.display = "none";
  document.getElementById("pinStep2").style.display = "block";
  setTimeout(() => window.closePinModal(), 2200);
};

window.doLogout = () => signOut(auth).then(() => { window.taxflyClearOfflineUnlock(); window.location.replace("login.html"); });

window.doChangeEmail = () => window.confirmAndChangeEmail({
  currentUser: currentUser,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmail
});

window.doChangePassword = async () => {
  if (!currentUser) return;
  const l = localStorage.getItem("appLang") || "es", m = {
    es: {
      s: "Correo de recuperación enviado.",
      e: "Error: "
    },
    en: {
      s: "Recovery email sent.",
      e: "Error: "
    }
  }, t = m[l];
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    showAlert(t.s);
  } catch (er) {
    showAlert(t.e + er.message);
  }
};

window.doDeleteAccount = () => window.confirmAndDeleteAccount({
  db: db,
  doc: doc,
  deleteDoc: deleteDoc,
  deleteUser: deleteUser,
  currentUser: currentUser
});

async function probeConnectivity() {
  const cached = sessionStorage.getItem("taxfly_connectivity");
  if (cached !== null) return cached === "1";
  try {
    await fetch("https://www.gstatic.com/generate_204", {
      method: "HEAD",
      cache: "no-store",
      mode: "no-cors",
      signal: AbortSignal.timeout(1500)
    });
    sessionStorage.setItem("taxfly_connectivity", "1");
    return true;
  } catch (e) {
    sessionStorage.setItem("taxfly_connectivity", "0");
    return false;
  }
}

window.addEventListener("online", () => sessionStorage.setItem("taxfly_connectivity", "1"));

window.addEventListener("offline", () => sessionStorage.setItem("taxfly_connectivity", "0"));

onAuthStateChanged(auth, async user => {
  if (!user) {
    try {
      await probeConnectivity();
      window.location.replace("login.html");
      return;
    } catch (e) {
      const pinHash = localStorage.getItem("taxusa_pin_hash");
      const pinEmail = localStorage.getItem("taxusa_offline_email");
      if (!pinHash || !pinEmail || !window.taxflyOfflineUnlocked()) {
        window.location.replace("login.html");
        return;
      }
      const nombre = localStorage.getItem("perfilActivoNombre") || pinEmail;
      document.getElementById("userEmail").innerText = nombre;
      const foto = localStorage.getItem("perfilActivoFoto") || "";
      if (foto) {
        const btn = document.getElementById("btnSettings");
        btn.style.backgroundImage = `url(${foto})`;
        btn.innerText = "";
      }
      const lang = localStorage.getItem("appLang") || "es";
      window.changeLanguage(lang);
      return;
    }
  }
  currentUser = user;
  const perfilNombre = localStorage.getItem("perfilActivoNombre");
  document.getElementById("userEmail").innerText = perfilNombre || user.email;
  const perfilId = localStorage.getItem("perfilActivoId");
  if (!perfilId) {
    window.location.replace("profiles.html");
    return;
  }
  const img = perfilFoto || user.photoURL;
  if (img) {
    const btn = document.getElementById("btnSettings");
    btn.style.backgroundImage = `url(${img})`;
    btn.innerText = "";
  }
  const lang = localStorage.getItem("appLang") || "es";
  window.changeLanguage(lang);
  const tc = document.getElementById("tip-content");
  if (tc) tc.innerText = unitTips[lang][tipIndex];
  setInterval(window.nextTip, 8e3);
  window._flushPinPending = async () => {
    const pendingHash = localStorage.getItem("taxusa_pin_pending_sync");
    if (!pendingHash || !navigator.onLine || !currentUser) return;
    try {
      await setDoc(doc(db, "usuarios", currentUser.uid), {
        pinHash: pendingHash
      }, {
        merge: true
      });
      localStorage.removeItem("taxusa_pin_pending_sync");
      const t = document.getElementById("sync-ok-toast");
      const m = document.getElementById("sync-ok-msg");
      if (t) {
        if (m) m.textContent = "PIN sincronizado";
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 3e3);
      }
    } catch (e) {
      console.warn("PIN flush error:", e);
    }
  };
  if (navigator.onLine) window._flushPinPending();
});
