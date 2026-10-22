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
  "es": [
    "32 °F = 0 °C. Para convertir °F a °C: resta 32 y divide entre 1,8.",
    "68 °F = 20 °C y 86 °F = 30 °C: dos referencias para interpretar el pronóstico.",
    "37 °C = 98,6 °F: es una equivalencia de temperatura, no un criterio de fiebre.",
    "1 milla = 1,609 km aproximadamente. Una distancia de 10 millas equivale a unos 16,1 km.",
    "65 mph ≈ 105 km/h. Es una conversión, no el límite de velocidad de todas las autopistas: sigue las señales.",
    "1 galón estadounidense ≈ 3,785 litros. No lo confundas con el galón imperial, que es mayor.",
    "1 lb ≈ 454 g. Para estimar el precio por kilogramo desde un precio por libra, multiplícalo por 2,205.",
    "50 lb ≈ 22,68 kg. Comprueba el límite exacto del boleto: 50 lb y 23 kg no son idénticos.",
    "1 oz de peso ≈ 28,35 g. La onza de peso no es la onza líquida (fl oz).",
    "1 US fl oz ≈ 29,57 ml; una botella de 16,9 US fl oz contiene unos 500 ml.",
    "1 pulgada (in) = 2,54 cm. Úsalo para revisar las dimensiones del equipaje en la web de la aerolínea.",
    "1 pie (ft) = 30,48 cm. Una altura de 6 ft equivale a unos 1,83 m.",
    "1 cuarto de galón estadounidense (US qt) ≈ 0,946 litros. Es una medida de volumen, no de peso.",
    "1 pinta estadounidense (US pint) ≈ 473 ml; la pinta imperial es de unos 568 ml.",
    "Para pasar de millas por galón estadounidense a litros/100 km, divide 235,215 entre los mpg. Ejemplo: 30 mpg ≈ 7,84 l/100 km.",
    "1 yarda (yd) = 0,9144 m. Una distancia de 100 yd equivale a 91,44 m."
  ],
  "en": [
    "32°F = 0°C. To convert °F to °C, subtract 32 and divide by 1.8.",
    "68°F = 20°C and 86°F = 30°C: useful reference points for the forecast.",
    "37°C = 98.6°F: a temperature conversion, not a fever threshold.",
    "1 mile is about 1.609 km; 10 miles is roughly 16.1 km.",
    "65 mph is about 105 km/h. That is a conversion, not a universal highway speed limit; follow posted signs.",
    "1 US gallon is about 3.785 litres; a UK imperial gallon is about 4.546 litres. Fuel prices and mpg use the US gallon in the US.",
    "1 lb is about 454 g. Multiply a per-pound price by 2.205 to estimate the per-kilogram price.",
    "50 lb is about 22.68 kg. Check the exact allowance on your ticket: 50 lb and 23 kg are not identical.",
    "1 oz by weight is about 28.35 g; it is different from a fluid ounce (fl oz).",
    "1 US fl oz is about 29.57 ml; a 16.9 US fl oz bottle holds about 500 ml. UK fluid ounces are a different size.",
    "1 inch equals 2.54 cm; use it to check cabin-bag dimensions on your airline’s website.",
    "1 foot equals 30.48 cm; 6 ft is about 1.83 m.",
    "1 US quart is about 0.946 litres, smaller than an imperial quart; it measures volume, not weight.",
    "A US pint is about 473 ml; a UK imperial pint is about 568 ml. Keep this in mind when comparing drink sizes.",
    "For US mpg to L/100 km, divide 235.215 by mpg: 30 US mpg is about 7.84 L/100 km. Do not apply UK mpg figures directly.",
    "1 yard equals 0.9144 metres; 100 yd is 91.44 m."
  ],
  "pt": [
    "32 °F = 0 °C. Para converter °F em °C, subtraia 32 e divida por 1,8.",
    "68 °F = 20 °C e 86 °F = 30 °C: referências para entender a previsão.",
    "37 °C = 98,6 °F: é uma conversão de temperatura, não um critério de febre.",
    "1 milha equivale a cerca de 1,609 km; 10 milhas são aproximadamente 16,1 km.",
    "65 mph ≈ 105 km/h. É uma conversão, não o limite de todas as rodovias: siga as placas.",
    "1 galão americano equivale a cerca de 3,785 litros; não é o galão imperial, de aproximadamente 4,546 litros.",
    "1 lb equivale a cerca de 454 g. Multiplique o preço por libra por 2,205 para estimar o preço por quilo.",
    "50 lb ≈ 22,68 kg. Confira o limite exato da passagem: 50 lb e 23 kg não são iguais.",
    "1 oz de peso equivale a cerca de 28,35 g; não é a mesma medida que a onça líquida (fl oz).",
    "1 US fl oz equivale a cerca de 29,57 ml; uma garrafa de 16,9 US fl oz tem aproximadamente 500 ml.",
    "1 polegada (in) = 2,54 cm. Use a conversão para conferir as dimensões da bagagem no site da companhia.",
    "1 pé (ft) = 30,48 cm; 6 ft equivalem a aproximadamente 1,83 m.",
    "1 quarto de galão americano (US qt) equivale a cerca de 0,946 litro; mede volume, não peso.",
    "1 pinta americana (US pint) equivale a cerca de 473 ml; a pinta imperial tem aproximadamente 568 ml.",
    "Para converter mpg americano em km/l, multiplique por 0,42514: 30 mpg ≈ 12,75 km/l.",
    "1 jarda (yd) = 0,9144 m; 100 yd equivalem a 91,44 m."
  ]
};

window.nextTip = () => {
  const lang = localStorage.getItem("appLang") || "es";
  const el = document.getElementById("tip-content");
  if (!el) return;
  el.style.opacity = 0;
  setTimeout(() => {
    const activeLang = localStorage.getItem("appLang") || "es";
    const list = unitTips[activeLang] || unitTips.es;
    tipIndex = (tipIndex + 1) % list.length;
    el.innerText = list[tipIndex];
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
  tipIndex = 0;
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
  if (tc) tc.innerText = (unitTips[lang] || unitTips.es)[tipIndex % (unitTips[lang] || unitTips.es).length];
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
  if (tc) tc.innerText = (unitTips[lang] || unitTips.es)[tipIndex % (unitTips[lang] || unitTips.es).length];
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
