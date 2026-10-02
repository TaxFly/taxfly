import { fsNet } from "./fs-net.js";
const FB = window.TAXFLY_CONFIG.FIREBASE_CONFIG;

let initializeApp, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, initializeAppCheck, ReCaptchaV3Provider;

let app, auth, db;

let firebaseOk = true;

try {
  ({initializeApp: initializeApp} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js")));
  ({getAuth: getAuth, signInWithEmailAndPassword: signInWithEmailAndPassword, createUserWithEmailAndPassword: createUserWithEmailAndPassword, onAuthStateChanged: onAuthStateChanged, sendPasswordResetEmail: sendPasswordResetEmail, sendEmailVerification: sendEmailVerification, signOut: signOut, GoogleAuthProvider: GoogleAuthProvider, signInWithPopup: signInWithPopup, signInWithRedirect: signInWithRedirect, getRedirectResult: getRedirectResult} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js")));
  ({getFirestore: getFirestore, initializeFirestore: initializeFirestore, persistentLocalCache: persistentLocalCache, persistentMultipleTabManager: persistentMultipleTabManager, doc: doc, getDoc: getDoc, setDoc: setDoc, updateDoc: updateDoc} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js")));
  ({initializeAppCheck: initializeAppCheck, ReCaptchaV3Provider: ReCaptchaV3Provider} = await (import("https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js")));
  app = initializeApp(FB);
  auth = getAuth(app);
  const FS_NET = await fsNet();
  try {
    db = initializeFirestore(app, {
      ...FS_NET,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 200 * 1024 * 1024
      })
    });
  } catch (e) {
    db = getFirestore(app);
  }
  if (navigator.onLine) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider("6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME"),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {}
  }
} catch (err) {
  console.warn("[TaxFly] SDK de Firebase no disponible (sin conexión) — se usa el flujo de PIN offline directo.", err);
  firebaseOk = false;
}

const i18n = {
  es: {
    welcome: "Bienvenido",
    create: "Crear Cuenta",
    email: "Correo electrónico",
    pass: "Contraseña",
    login: "INGRESAR",
    register: "REGISTRARME",
    noAccount: "¿No tenés cuenta? Registrate aquí",
    haveAccount: "¿Ya tenés cuenta? Ingresá aquí",
    verif: "Te enviaremos un mail de verificación. Revisá tu bandeja o SPAM.",
    forgot: "¿Olvidaste tu contraseña?",
    errFields: "Por favor completá todos los campos.",
    regOk: "¡Registro exitoso! Se envió verificación a ",
    noVerif: "Tu cuenta aún no fue verificada. Revisá tu correo.",
    resendVerif: "Reenviar correo",
    resetOk: "Correo de recuperación enviado.",
    resetEmail: "Ingresá tu correo arriba primero.",
    errInvalidCredential: "Usuario o contraseña incorrectos.",
    errTooManyRequests: "Demasiados intentos. Esperá unos minutos.",
    errUserNotFound: "No existe cuenta con ese correo.",
    errWrongPassword: "Contraseña incorrecta.",
    errInvalidEmail: "El correo no es válido.",
    errNetworkFailed: "Sin conexión a internet.",
    errDefault: "Ocurrió un error. Volvé a intentarlo.",
    googleBtn: "Continuar con Google",
    orSep: "o",
    errGoogleClosed: "Cerraste la ventana de Google antes de terminar.",
    errGoogleFailed: "No se pudo ingresar con Google. Probá de nuevo o usá tu correo.",
    errGoogleDomain: "Google no está habilitado para este sitio todavía (falta autorizar el dominio en Firebase).",
    errGoogleDisabled: "El ingreso con Google no está activado en Firebase.",
    offlineBadge: "Sin conexión — ingresá con tu PIN",
    tryOnline: "🌐 Intentar con internet",
    noPinOffline: "No hay PIN configurado para esta cuenta. Necesitás conexión para ingresar.",
    pinWrong: "PIN incorrecto. Intentá de nuevo.",
    pinWrongCount: "PIN incorrecto. Quedan %d intentos.",
    pinLocked: "Demasiados intentos. Esperá 15 minutos o ingresá con internet.",
    createPinTitle: "Creá tu PIN de seguridad",
    createPinSub: "Este PIN de 6 dígitos protege los controles de perfiles y también te permite entrar sin internet.",
    confirmPinTitle: "Confirmá tu PIN",
    confirmPinSub: "Ingresá el mismo PIN para confirmar.",
    pinMismatch: "Los PINs no coinciden. Volvé a intentarlo.",
    pinSaved: "✅ PIN guardado correctamente.",
    skipPin: "Omitir por ahora",
    changePinTitle: "Cambiar PIN",
    changePinInfo: "Para cambiar tu PIN te enviaremos un correo de verificación. Una vez verificado, podrás crear uno nuevo.",
    sendVerify: "📧 Enviar correo de verificación",
    verifyEmailSent: "✅ Correo enviado. Verificá tu casilla y volvé aquí para continuar.",
    pinChangedOk: "✅ PIN actualizado correctamente.",
    cancel: "Cancelar",
    newPinTitle: "Nuevo PIN",
    newPinSub: "Ingresá tu nuevo PIN de 4 dígitos.",
    iVerified: "✅ Ya verifiqué mi correo — ingresar nuevo PIN",
    offlineInfoTitle: "¿Cómo usarla sin internet?",
    offlineStep1: "Iniciá sesión al menos una vez con WiFi.",
    offlineStep2: "Creá tu PIN de 4 dígitos cuando te lo pida.",
    offlineStep3: "¡Listo! La próxima vez podés entrar con el PIN aunque no tengas conexión.",
    offlineNote: "Todavía en desarrollo. La calculadora, propina, conversores y gastos siguen funcionando offline.",
    installAndroidBtn: "➕ Agregar a inicio (Android)",
    installIosBtn: "📲 Agregar a inicio (iPhone)",
    iosTitle: "📲 Agregar TaxFly al inicio",
    iosStep1: "Tocá el botón <strong>Compartir</strong> en Safari",
    iosStep2: "Tocá <strong>\"Agregar a pantalla de inicio\"</strong>",
    iosStep3: "Tocá <strong>\"Agregar\"</strong>",
    iosClose: "Entendido",
    installHelp: "Para instalar TaxFly, abrí el menú del navegador y elegí ‘Instalar app’ o ‘Agregar a pantalla de inicio’. Si ya está instalada, abrila desde el ícono de TaxFly.",
    verifyResent: "Correo de verificación reenviado. Revisá tu bandeja (y spam)."
  },
  en: {
    welcome: "Welcome",
    create: "Create Account",
    email: "Email address",
    pass: "Password",
    login: "LOGIN",
    register: "REGISTER",
    noAccount: "Don't have an account? Sign up",
    haveAccount: "Already have an account? Log in",
    verif: "We'll send you a verification email. Check your inbox or SPAM.",
    forgot: "Forgot your password?",
    errFields: "Please fill all fields.",
    regOk: "Registration successful! Verification sent to ",
    noVerif: "Your account hasn't been verified yet. Check your email.",
    resendVerif: "Resend email",
    resetOk: "Recovery email sent.",
    resetEmail: "Please enter your email above first.",
    errInvalidCredential: "Incorrect email or password.",
    errTooManyRequests: "Too many failed attempts. Please wait.",
    errUserNotFound: "No account found with that email.",
    errWrongPassword: "Incorrect password.",
    errInvalidEmail: "The email address is not valid.",
    errNetworkFailed: "No internet connection.",
    errDefault: "An error occurred. Please try again.",
    googleBtn: "Continue with Google",
    orSep: "or",
    errGoogleClosed: "You closed the Google window before finishing.",
    errGoogleFailed: "Couldn't sign in with Google. Try again or use your email.",
    errGoogleDomain: "Google sign-in isn't enabled for this site yet (the domain must be authorized in Firebase).",
    errGoogleDisabled: "Google sign-in isn't turned on in Firebase.",
    offlineBadge: "Offline — enter your PIN",
    tryOnline: "🌐 Try with internet",
    noPinOffline: "No PIN configured for this account. You need internet to log in.",
    pinWrong: "Wrong PIN. Try again.",
    pinWrongCount: "Wrong PIN. %d attempts left.",
    pinLocked: "Too many attempts. Wait 15 minutes or sign in online.",
    createPinTitle: "Create your security PIN",
    createPinSub: "This 6-digit PIN protects profile controls and also lets you sign in without internet.",
    confirmPinTitle: "Confirm your PIN",
    confirmPinSub: "Enter the same PIN again to confirm.",
    pinMismatch: "PINs don't match. Please try again.",
    pinSaved: "✅ PIN saved successfully.",
    skipPin: "Skip for now",
    changePinTitle: "Change PIN",
    changePinInfo: "To change your PIN, we'll send a verification email. Once verified, you can set a new one.",
    sendVerify: "📧 Send verification email",
    verifyEmailSent: "✅ Email sent. Check your inbox and come back to continue.",
    pinChangedOk: "✅ PIN updated successfully.",
    cancel: "Cancel",
    newPinTitle: "New PIN",
    newPinSub: "Enter your new 4-digit PIN.",
    iVerified: "✅ I verified my email — set new PIN",
    offlineInfoTitle: "How to use it offline?",
    offlineStep1: "Sign in at least once with WiFi.",
    offlineStep2: "Create your 4-digit PIN when prompted.",
    offlineStep3: "Done! Next time you can enter with your PIN even without internet.",
    offlineNote: "Still in development. Calculator, tips, unit converter and expenses keep working offline.",
    installAndroidBtn: "➕ Add to home screen (Android)",
    installIosBtn: "📲 Add to home screen (iPhone)",
    iosTitle: "📲 Add TaxFly to your home screen",
    iosStep1: "Tap the <strong>Share</strong> button in Safari",
    iosStep2: "Tap <strong>\"Add to Home Screen\"</strong>",
    iosStep3: "Tap <strong>\"Add\"</strong>",
    iosClose: "Got it",
    installHelp: "To install TaxFly, open your browser menu and choose ‘Install app’ or ‘Add to Home Screen’. If it is already installed, open it from the TaxFly icon.",
    verifyResent: "Verification email sent again. Check your inbox (and spam)."
  },
  pt: {
    welcome: "Bem-vindo",
    create: "Criar Conta",
    email: "E-mail",
    pass: "Senha",
    login: "ENTRAR",
    register: "CADASTRAR",
    noAccount: "Não tem conta? Cadastre-se",
    haveAccount: "Já tem conta? Entre aqui",
    verif: "Enviaremos um e-mail de verificação. Verifique sua caixa ou SPAM.",
    forgot: "Esqueceu sua senha?",
    errFields: "Por favor, preencha todos os campos.",
    regOk: "Cadastro realizado! Verificação enviada para ",
    noVerif: "Sua conta ainda não foi verificada. Verifique seu e-mail.",
    resendVerif: "Reenviar e-mail",
    resetOk: "E-mail de recuperação enviado.",
    resetEmail: "Digite seu e-mail acima primeiro.",
    errInvalidCredential: "E-mail ou senha incorretos.",
    errTooManyRequests: "Muitas tentativas. Aguarde alguns minutos.",
    errUserNotFound: "Não existe conta com esse e-mail.",
    errWrongPassword: "Senha incorreta.",
    errInvalidEmail: "O endereço de e-mail não é válido.",
    errNetworkFailed: "Sem conexão com a internet.",
    errDefault: "Ocorreu um erro. Tente novamente.",
    googleBtn: "Continuar com Google",
    orSep: "ou",
    errGoogleClosed: "Você fechou a janela do Google antes de terminar.",
    errGoogleFailed: "Não foi possível entrar com o Google. Tente novamente ou use seu e-mail.",
    errGoogleDomain: "O login com Google ainda não está habilitado para este site (falta autorizar o domínio no Firebase).",
    errGoogleDisabled: "O login com Google não está ativado no Firebase.",
    offlineBadge: "Sem conexão — use seu PIN",
    tryOnline: "🌐 Tentar com internet",
    noPinOffline: "Nenhum PIN configurado. Você precisa de internet para entrar.",
    pinWrong: "PIN incorreto. Tente novamente.",
    pinWrongCount: "PIN incorreto. %d tentativas restantes.",
    pinLocked: "Muitas tentativas. Aguarde 15 minutos ou entre com internet.",
    createPinTitle: "Crie seu PIN de segurança",
    createPinSub: "Este PIN de 6 dígitos protege os controles de perfis e também permite entrar sem internet.",
    confirmPinTitle: "Confirme seu PIN",
    confirmPinSub: "Digite o mesmo PIN novamente para confirmar.",
    pinMismatch: "Os PINs não coincidem. Tente novamente.",
    pinSaved: "✅ PIN salvo com sucesso.",
    skipPin: "Pular por agora",
    changePinTitle: "Alterar PIN",
    changePinInfo: "Para alterar seu PIN, enviaremos um e-mail de verificação. Após verificar, você poderá criar um novo.",
    sendVerify: "📧 Enviar e-mail de verificação",
    verifyEmailSent: "✅ E-mail enviado. Verifique sua caixa e volte aqui.",
    pinChangedOk: "✅ PIN atualizado com sucesso.",
    cancel: "Cancelar",
    newPinTitle: "Novo PIN",
    newPinSub: "Digite seu novo PIN de 4 dígitos.",
    iVerified: "✅ Já verifiquei meu e-mail — criar novo PIN",
    offlineInfoTitle: "Como usar sem internet?",
    offlineStep1: "Entre pelo menos uma vez com WiFi.",
    offlineStep2: "Crie seu PIN de 4 dígitos quando solicitado.",
    offlineStep3: "Pronto! Da próxima vez pode entrar com o PIN sem internet.",
    offlineNote: "Ainda em desenvolvimento. Calculadora, gorjetas, conversores e gastos continuam funcionando offline.",
    installAndroidBtn: "➕ Adicionar à tela inicial (Android)",
    installIosBtn: "📲 Adicionar à tela inicial (iPhone)",
    iosTitle: "📲 Adicionar o TaxFly à tela inicial",
    iosStep1: "Toque no botão <strong>Compartilhar</strong> no Safari",
    iosStep2: "Toque em <strong>\"Adicionar à Tela de Início\"</strong>",
    iosStep3: "Toque em <strong>\"Adicionar\"</strong>",
    iosClose: "Entendi",
    installHelp: "Para instalar o TaxFly, abra o menu do navegador e escolha ‘Instalar app’ ou ‘Adicionar à tela inicial’. Se já estiver instalado, abra-o pelo ícone do TaxFly.",
    verifyResent: "E-mail de verificação reenviado. Verifique sua caixa de entrada (e o spam)."
  }
};

let currentLang = localStorage.getItem("appLang") || "es";

let isLoginMode = true;

let pinBuffer = "";
let pinChecking = false;

let pinStep = 1;

let pinFirst = "";

const PIN_ATTEMPT_KEY = "taxfly_pin_attempts_v2";
const PIN_LOCK_KEY = "taxfly_pin_locked_until_v2";
let pinAttempts = 0;
function pinLockRemaining() {
  const until = Number(localStorage.getItem(PIN_LOCK_KEY)) || 0;
  if (until <= Date.now()) {
    if (until) { localStorage.removeItem(PIN_LOCK_KEY); localStorage.removeItem(PIN_ATTEMPT_KEY); }
    pinAttempts = Number(localStorage.getItem(PIN_ATTEMPT_KEY)) || 0;
    return 0;
  }
  return until - Date.now();
}
function clearPinFailures() {
  pinAttempts = 0;
  localStorage.removeItem(PIN_ATTEMPT_KEY);
  localStorage.removeItem(PIN_LOCK_KEY);
}
function recordPinFailure() {
  pinAttempts = (Number(localStorage.getItem(PIN_ATTEMPT_KEY)) || 0) + 1;
  localStorage.setItem(PIN_ATTEMPT_KEY, String(pinAttempts));
  if (pinAttempts >= MAX_PIN_ATTEMPTS) localStorage.setItem(PIN_LOCK_KEY, String(Date.now() + 15 * 60 * 1000));
}


const MAX_PIN_ATTEMPTS = 5;
const NEW_PIN_LENGTH = 6;
function offlinePinLength() {
  const n = Number(localStorage.getItem("taxusa_pin_length"));
  return n === 6 ? 6 : 4; // PINs creados antes de esta versión siguen funcionando.
}


let changePinStep = "send";

let changePinFirst = "";

let changePinBuffer = "";

function t(key, ...args) {
  let str = (i18n[currentLang] || i18n.es)[key] || key;
  args.forEach(a => {
    str = str.replace("%d", a);
  });
  return str;
}

const PIN_GRACE_MINUTES = 30;

function hasRecentActivity() {
  return typeof window.taxflyMinutesSinceActivity === "function" && window.taxflyMinutesSinceActivity() < PIN_GRACE_MINUTES;
}

async function sha256(str) {
  return window.hashPin(str);
}

function isOnline() {
  return window._isOnline === true;
}

async function checkRealConnectivity() {
  if (window._connectivityPromise) return window._connectivityPromise;
  if (window._isOnline !== undefined) return window._isOnline;
  window._connectivityPromise = (async () => {
    try {
      await fetch("https://www.gstatic.com/generate_204", {
        method: "HEAD",
        cache: "no-store",
        mode: "no-cors",
        signal: AbortSignal.timeout(1500)
      });
      window._isOnline = true;
    } catch (e) {
      window._isOnline = false;
    }
    window._connectivityPromise = null;
    return window._isOnline;
  })();
  return window._connectivityPromise;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("appLang", lang);
  const flagSVGs = {
    es: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="4.3" y="0" fill="#74acdf"/><rect width="18" height="4.4" y="4.3" fill="#fff"/><rect width="18" height="4.3" y="8.7" fill="#74acdf"/><circle cx="9" cy="6.5" r="1.5" fill="#f6b40e"/></svg>',
    en: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="13" fill="#B22234"/><rect width="18" height="1" y="1" fill="#fff"/><rect width="18" height="1" y="3" fill="#fff"/><rect width="18" height="1" y="5" fill="#fff"/><rect width="18" height="1" y="7" fill="#fff"/><rect width="18" height="1" y="9" fill="#fff"/><rect width="18" height="1" y="11" fill="#fff"/><rect width="7" height="7" fill="#3C3B6E"/></svg>',
    pt: '<svg width="18" height="13" viewBox="0 0 18 13" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="13" fill="#009c3b"/><polygon points="9,1 17,6.5 9,12 1,6.5" fill="#FEDF00"/><circle cx="9" cy="6.5" r="2.6" fill="#002776"/></svg>'
  };
  document.getElementById("selectedFlag").innerHTML = flagSVGs[lang] || flagSVGs.es;
  document.getElementById("selectedCode").innerText = lang.toUpperCase();
  document.getElementById("langOptions").classList.remove("show");
  applyTexts();
}

window.applyLanguage = applyLanguage;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function setPlaceholder(id, value) {
  const el = document.getElementById(id);
  if (el) el.placeholder = value;
}

function applyTexts() {
  setText("login-title", isLoginMode ? t("welcome") : t("create"));
  setText("mainBtn", isLoginMode ? t("login") : t("register"));
  setText("toggleLink", isLoginMode ? t("noAccount") : t("haveAccount"));
  setText("forgotLink", t("forgot"));
  setText("googleBtnTxt", t("googleBtn"));
  setText("orSepTxt", t("orSep"));
  setText("verifNotice", t("verif"));
  setPlaceholder("email", t("email"));
  setPlaceholder("password", t("pass"));
  setText("offline-badge-text", t("offlineBadge"));
  setText("try-online-btn", t("tryOnline"));
  setText("skip-pin-btn", t("skipPin"));
  setText("btnAndroid", t("installAndroidBtn"));
  setText("btnIos", t("installIosBtn"));
  setText("ios-title", t("iosTitle"));
  setText("ios-close", t("iosClose"));
  ["ios-step1", "ios-step2", "ios-step3"].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = t("iosStep" + (i + 1));
  });
  if (pinStep === 1) {
    setText("create-pin-title", t("createPinTitle"));
    setText("create-pin-sub", t("createPinSub"));
  } else {
    setText("create-pin-title", t("confirmPinTitle"));
    setText("create-pin-sub", t("confirmPinSub"));
  }
  setText("change-pin-title", t("changePinTitle"));
  setText("change-pin-info", t("changePinInfo"));
  setText("send-verify-btn", t("sendVerify"));
  setText("new-pin-title", t("newPinTitle"));
  setText("new-pin-sub", t("newPinSub"));
  setText("oi-title-txt", t("offlineInfoTitle"));
  setText("oi-step1", t("offlineStep1"));
  setText("oi-step2", t("offlineStep2"));
  setText("oi-step3", t("offlineStep3"));
  setText("oi-note-txt", t("offlineNote"));
}

window.toggleMode = () => {
  isLoginMode = !isLoginMode;
  const vn = document.getElementById("verifNotice");
  if (isLoginMode) {
    vn.classList.remove("visible");
    setTimeout(() => {
      vn.style.display = "none";
    }, 350);
  } else {
    vn.style.display = "block";
    requestAnimationFrame(() => vn.classList.add("visible"));
  }
  applyTexts();
};

const RECAPTCHA_SITE_KEY = "6LeOivYsAAAAAPYMmhytNumUem-rxSrtpPbU7sME";

const RECAPTCHA_VERIFY_URL = window.TAXFLY_CONFIG.WORKER_URL;

async function getRecaptchaToken(action) {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === "undefined") {
      resolve(null);
      return;
    }
    grecaptcha.ready(() => {
      grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: action
      }).then(resolve).catch(reject);
    });
  });
}

async function verifyRecaptchaToken(token, action) {
  if (!token) return true;
  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "verify_recaptcha",
        token: token,
        action: action
      })
    });
    if (!res.ok) return true;
    const data = await res.json();
    return data.success !== false;
  } catch {
    return true;
  }
}

window.handleAuth = async () => {
  if (!isOnline()) {
    const cachedHash = localStorage.getItem("taxusa_pin_hash");
    const cachedEmail = localStorage.getItem("taxusa_offline_email");
    const hasCachedPin = cachedHash && cachedHash !== "" && cachedHash !== "null";
    if (cachedEmail && hasCachedPin) {
      showOfflinePinScreen();
      return;
    } else {
      showAlert(t("errNetworkFailed"));
      return;
    }
  }
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  if (!email || !pass) {
    showAlert(t("errFields"));
    return;
  }
  const action = isLoginMode ? "login" : "register";
  try {
    const rcToken = await getRecaptchaToken(action);
    const rcOk = await verifyRecaptchaToken(rcToken, action);
    if (!rcOk) {
      showAlert(t("errTooManyRequests"));
      return;
    }
  } catch {}
  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(cred.user);
      showAlert(t("regOk") + email);
      await signOut(auth);
      location.reload();
    }
  } catch (e) {
    const map = {
      "auth/invalid-credential": t("errInvalidCredential"),
      "auth/wrong-password": t("errWrongPassword"),
      "auth/user-not-found": t("errUserNotFound"),
      "auth/invalid-email": t("errInvalidEmail"),
      "auth/too-many-requests": t("errTooManyRequests"),
      "auth/network-request-failed": t("errNetworkFailed")
    };
    showAlert(map[e.code] || t("errDefault"));
  }
};

// Ingreso / registro con Google. Una cuenta de Google ya viene con el correo verificado,
// así que sigue el mismo camino que el login normal (onAuthStateChanged → PIN → app).
let googleBusy = false;

window.handleGoogle = async () => {
  if (googleBusy) return;
  if (!isOnline() || !firebaseOk) {
    showAlert(t("errNetworkFailed"));
    return;
  }
  googleBusy = true;
  const btn = document.getElementById("googleBtn");
  if (btn) btn.disabled = true;
  try {
    try {
      const rcToken = await getRecaptchaToken("google_login");
      const rcOk = await verifyRecaptchaToken(rcToken, "google_login");
      if (!rcOk) {
        showAlert(t("errTooManyRequests"));
        return;
      }
    } catch {}
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      // Navegadores / apps instaladas (PWA en iPhone) que bloquean ventanas emergentes: se usa redirección.
      if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw e;
    }
  } catch (e) {
    const map = {
      "auth/popup-closed-by-user": t("errGoogleClosed"),
      "auth/cancelled-popup-request": null,
      "auth/unauthorized-domain": t("errGoogleDomain"),
      "auth/operation-not-allowed": t("errGoogleDisabled"),
      "auth/network-request-failed": t("errNetworkFailed"),
      "auth/too-many-requests": t("errTooManyRequests"),
      "auth/account-exists-with-different-credential": t("errGoogleFailed")
    };
    const msg = e.code in map ? map[e.code] : t("errGoogleFailed");
    if (msg) showAlert(msg);
    console.warn("[handleGoogle]", e.code || e);
  } finally {
    googleBusy = false;
    if (btn) btn.disabled = false;
  }
};

// Si volvió de una redirección de Google, onAuthStateChanged ya se encarga del resto;
// esto solo muestra el error si la redirección falló.
if (firebaseOk) getRedirectResult(auth).catch(e => {
  if (e && e.code && e.code !== "auth/no-auth-event") console.warn("[getRedirectResult]", e.code);
});

window.resetPassword = async () => {
  const email = document.getElementById("email").value.trim();
  if (!email) {
    showAlert(t("resetEmail"));
    return;
  }
  try {
    const rcToken = await getRecaptchaToken("reset_password");
    const rcOk = await verifyRecaptchaToken(rcToken, "reset_password");
    if (!rcOk) {
      showAlert(t("errTooManyRequests"));
      return;
    }
    await sendPasswordResetEmail(auth, email);
    showAlert(t("resetOk"));
  } catch (e) {
    showAlert(t("errDefault"));
  }
};

if (firebaseOk) onAuthStateChanged(auth, async user => {
  if (!user) {
    hideSplash();
    return;
  }
  await checkRealConnectivity();
  if (!isOnline()) {
    const cachedHash = localStorage.getItem("taxusa_pin_hash");
    const cachedEmail = localStorage.getItem("taxusa_offline_email");
    const hasCachedPin = cachedHash && cachedHash !== "" && cachedHash !== "null";
    if (hasRecentActivity()) {
      goToApp();
      return;
    }
    if (cachedEmail && hasCachedPin) {
      showOfflinePinScreen();
    }
    return;
  }
  if (!user.emailVerified) {
    const wantsResend = await showConfirm(t("noVerif"), {
      okText: t("resendVerif") || "Reenviar correo",
      cancelText: "OK"
    });
    if (wantsResend) {
      try {
        await sendEmailVerification(user);
        showAlert(t("verifyResent"));
      } catch (e) {
        showAlert(t("errDefault"));
      }
    }
    await signOut(auth);
    return;
  }
  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    const data = snap.exists() ? snap.data() : {};
    let pinHash = data.pinHash || null;
    const serverPinLength = Number(data.pinLength);
    localStorage.setItem("taxusa_pin_length", serverPinLength === 6 ? "6" : "4");
    const pendingHash = localStorage.getItem("taxusa_pin_pending_sync");
    if (pendingHash) {
      pinHash = pendingHash;
      try {
        await setDoc(doc(db, "usuarios", user.uid), { pinHash: pendingHash }, { merge: true });
        localStorage.removeItem("taxusa_pin_pending_sync");
      } catch (e) {}
    }
    const pinEmail = user.email;
    localStorage.setItem("taxusa_offline_email", pinEmail);
    localStorage.setItem("taxusa_offline_uid", user.uid);
    if (pinHash) localStorage.setItem("taxusa_pin_hash", pinHash); else localStorage.removeItem("taxusa_pin_hash");
    const cachedName = localStorage.getItem("perfilActivoNombre") || "";
    const cachedFoto = localStorage.getItem("perfilActivoFoto") || "";
    if (cachedName) localStorage.setItem("taxusa_cached_name", cachedName);
    if (cachedFoto) localStorage.setItem("taxusa_cached_foto", cachedFoto);
    try {
      window.taxflyTouchActivity && window.taxflyTouchActivity();
    } catch (e) {}
    if (!pinHash) {
      showCreatePinScreen();
    } else {
      goToApp();
    }
  } catch (e) {
    goToApp();
  }
});

function goToApp() {
  if (installRequested) return;
  localStorage.removeItem('taxusa_pending_redirect');
  hideSplash(() => window.location.replace("index.html"));
}

async function initScreen() {
  applyLanguage(currentLang);
  if (installRequested) {
    showScreen("screen-login");
    hideSplash(() => {
      showInstallButtons();
      if (isIos) showIosModal();
    });
    return;
  }
  await checkRealConnectivity();
  if (isOnline()) {
    showScreen("screen-login");
    hideSplash();
  } else {
    const cachedHash = localStorage.getItem("taxusa_pin_hash");
    const cachedEmail = localStorage.getItem("taxusa_offline_email");
    const hasCachedPin = cachedHash && cachedHash !== "" && cachedHash !== "null";
    if (cachedEmail && hasCachedPin && hasRecentActivity()) {
      hideSplash(() => goToApp());
    } else if (cachedEmail && hasCachedPin) {
      showOfflinePinScreen();
      hideSplash();
    } else {
        showScreen("screen-login");
        const badge = document.createElement("div");
        badge.className = "offline-badge show";
        badge.style.marginBottom = "16px";
        badge.innerHTML = "<span>📵</span><span>" + t("noPinOffline") + "</span>";
        const card = document.querySelector("#screen-login .login-card");
        card.insertBefore(badge, card.firstChild);
        hideSplash();
    }
  }
}

let splashExitPromise;
function hideSplash(callback) {
  if (!splashExitPromise) {
    splashExitPromise = new Promise(resolve => {
      setTimeout(() => {
        document.documentElement.classList.remove("splash-loading");
        const splash = document.getElementById("splash-screen");
        if (!splash) return resolve();
        splash.classList.add("tf-leaving");
        const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
        setTimeout(() => { splash.remove(); resolve(); }, duration);
      }, Math.max(0, (window._splashMinEnd || 0) - Date.now()));
    });
  }
  return splashExitPromise.then(() => { if (callback) callback(); });
}

window.addEventListener("online", () => {
  if (document.getElementById("screen-pin-offline").classList.contains("hidden") === false) showScreen("screen-login");
});

window.addEventListener("offline", () => {
  if (!document.getElementById("screen-login").classList.contains("hidden")) {
    const h = localStorage.getItem("taxusa_pin_hash");
    const e = localStorage.getItem("taxusa_offline_email");
    if (e && h && h !== "" && h !== "null" && !hasRecentActivity()) showOfflinePinScreen();
  }
});

function showOfflinePinScreen() {
  document.documentElement.classList.remove("splash-loading");
  const name = localStorage.getItem("taxusa_cached_name") || "";
  const foto = localStorage.getItem("taxusa_cached_foto") || "";
  const email = localStorage.getItem("taxusa_offline_email") || "";
  document.getElementById("pin-name").innerText = name || email.split("@")[0];
  document.getElementById("pin-email-display").innerText = email;
  if (foto) document.getElementById("pin-avatar").style.backgroundImage = `url('${foto}')`;
  pinBuffer = "";
  const locked = pinLockRemaining();
  document.getElementById("pin-error-offline").innerText = locked ? t("pinLocked") : "";
  updateDots("pin-dots-offline", 0);
  renderKeypad("pin-keypad-offline", onOfflinePinKey);
  showScreen("screen-pin-offline");
}

window.showOnlineLogin = () => showScreen("screen-login");

async function onOfflinePinKey(key) {
  if (pinChecking) return;
  if (pinLockRemaining()) {
    document.getElementById("pin-error-offline").innerText = t("pinLocked");
    return;
  }
  if (key === "del") {
    pinBuffer = pinBuffer.slice(0, -1);
  } else {
    if (pinBuffer.length >= offlinePinLength()) return;
    pinBuffer += key;
  }
  updateDots("pin-dots-offline", pinBuffer.length);
  document.getElementById("pin-error-offline").innerText = "";
  if (pinBuffer.length === offlinePinLength()) {
    const entered = pinBuffer;
    pinBuffer = "";
    updateDots("pin-dots-offline", 0);
    pinChecking = true;
    const stored = localStorage.getItem("taxusa_pin_hash");
    try {
    if (await window.verifyPin(entered, stored)) {
      clearPinFailures();
      if (stored && !stored.startsWith("pbkdf2$")) {
        const upgraded = await window.createPinHash(entered);
        localStorage.setItem("taxusa_pin_hash", upgraded);
        localStorage.setItem("taxusa_pin_pending_sync", upgraded);
      }
      try {
        window.taxflyTouchActivity && window.taxflyTouchActivity();
      } catch (e) {}
      goToApp();
    } else {
      recordPinFailure();
      const remaining = MAX_PIN_ATTEMPTS - pinAttempts;
      if (remaining <= 0) {
        document.getElementById("pin-error-offline").innerText = t("pinLocked");
      } else {
        document.getElementById("pin-error-offline").innerText = remaining < MAX_PIN_ATTEMPTS ? t("pinWrongCount", remaining) : t("pinWrong");
      }
      shakeDotsError("pin-dots-offline");
    }
    } finally { pinChecking = false; }
  }
}

function showCreatePinScreen() {
  pinStep = 1;
  pinFirst = "";
  pinBuffer = "";
  updateStepDots(1);
  updateDots("pin-dots-create", 0);
  document.getElementById("pin-error-create").innerText = "";
  applyTexts();
  renderKeypad("pin-keypad-create", onCreatePinKey);
  showScreen("screen-create-pin");
}

window.showCreatePinScreen = showCreatePinScreen;

async function onCreatePinKey(key) {
  if (key === "del") {
    pinBuffer = pinBuffer.slice(0, -1);
  } else {
    if (pinBuffer.length >= NEW_PIN_LENGTH) return;
    pinBuffer += key;
  }
  updateDots("pin-dots-create", pinBuffer.length);
  document.getElementById("pin-error-create").innerText = "";
  if (pinBuffer.length === NEW_PIN_LENGTH) {
    const entered = pinBuffer;
    pinBuffer = "";
    if (pinStep === 1) {
      pinFirst = entered;
      pinStep = 2;
      updateStepDots(2);
      updateDots("pin-dots-create", 0);
      document.getElementById("create-pin-title").innerText = t("confirmPinTitle");
      document.getElementById("create-pin-sub").innerText = t("confirmPinSub");
    } else {
      if (entered !== pinFirst) {
        document.getElementById("pin-error-create").innerText = t("pinMismatch");
        shakeDotsError("pin-dots-create");
        pinStep = 1;
        pinFirst = "";
        updateStepDots(1);
        updateDots("pin-dots-create", 0);
        document.getElementById("create-pin-title").innerText = t("createPinTitle");
        document.getElementById("create-pin-sub").innerText = t("createPinSub");
      } else {
        await savePinToFirestore(pinFirst);
        showAlert(t("pinSaved"));
        goToApp();
      }
    }
  }
}

async function savePinToFirestore(pin) {
  const hash = await window.createPinHash(pin);
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "usuarios", user.uid), {
        pinHash: hash,
        pinLength: NEW_PIN_LENGTH
      }, {
        merge: true
      });
    } catch (e) {
      console.error("Error saving PIN:", e);
    }
  }
  localStorage.setItem("taxusa_pin_hash", hash);
  localStorage.setItem("taxusa_pin_length", String(NEW_PIN_LENGTH));
  clearPinFailures();
}

window.skipPinCreation = () => goToApp();

function updateStepDots(step) {
  document.getElementById("step-dot-1").className = "pin-step-dot " + (step === 1 ? "active" : "done");
  document.getElementById("step-dot-2").className = "pin-step-dot " + (step === 2 ? "active" : "");
}

window.showChangePinScreen = () => {
  if (!isOnline()) {
    showAlert(t("errNetworkFailed"));
    return;
  }
  changePinStep = "send";
  changePinFirst = "";
  changePinBuffer = "";
  document.getElementById("new-pin-section").style.display = "none";
  document.getElementById("send-verify-btn").style.display = "block";
  document.getElementById("pin-error-change").innerText = "";
  updateDots("pin-dots-change", 0);
  applyTexts();
  showScreen("screen-change-pin");
};

window.sendChangePinEmail = async () => {
  const user = auth.currentUser;
  if (!user) {
    showAlert(t("errDefault"));
    return;
  }
  try {
    await sendEmailVerification(user);
    showAlert(t("verifyEmailSent"));
    document.getElementById("send-verify-btn").style.display = "none";
    const proceedBtn = document.createElement("button");
    proceedBtn.className = "btn btn-primary";
    proceedBtn.innerText = t("iVerified");
    proceedBtn.style.marginBottom = "0";
    proceedBtn.onclick = () => {
      user.reload().then(() => {
        changePinStep = "new_enter";
        document.getElementById("new-pin-section").style.display = "block";
        renderKeypad("pin-keypad-change", onChangePinKey);
        proceedBtn.remove();
      });
    };
    document.getElementById("send-verify-btn").parentNode.insertBefore(proceedBtn, document.getElementById("send-verify-btn"));
  } catch (e) {
    showAlert(t("errDefault"));
  }
};

async function onChangePinKey(key) {
  if (key === "del") {
    changePinBuffer = changePinBuffer.slice(0, -1);
  } else {
    if (changePinBuffer.length >= NEW_PIN_LENGTH) return;
    changePinBuffer += key;
  }
  updateDots("pin-dots-change", changePinBuffer.length);
  document.getElementById("pin-error-change").innerText = "";
  if (changePinBuffer.length === NEW_PIN_LENGTH) {
    const entered = changePinBuffer;
    changePinBuffer = "";
    if (changePinStep === "new_enter") {
      changePinFirst = entered;
      changePinStep = "new_confirm";
      updateDots("pin-dots-change", 0);
      document.getElementById("new-pin-title").innerText = t("confirmPinTitle");
      document.getElementById("new-pin-sub").innerText = t("confirmPinSub");
    } else {
      if (entered !== changePinFirst) {
        document.getElementById("pin-error-change").innerText = t("pinMismatch");
        shakeDotsError("pin-dots-change");
        changePinStep = "new_enter";
        changePinFirst = "";
        updateDots("pin-dots-change", 0);
        document.getElementById("new-pin-title").innerText = t("newPinTitle");
        document.getElementById("new-pin-sub").innerText = t("newPinSub");
      } else {
        await savePinToFirestore(changePinFirst);
        showAlert(t("pinChangedOk"));
        goToApp();
      }
    }
  }
}

window.goBackFromChangePin = () => goToApp();

function updateDots(containerId, filled) {
  const dots = document.querySelectorAll(`#${containerId} .pin-dot`);
  dots.forEach((d, i) => {
    d.classList.toggle("filled", i < filled);
    d.classList.remove("error");
  });
}

function shakeDotsError(containerId) {
  const dots = document.querySelectorAll(`#${containerId} .pin-dot`);
  dots.forEach(d => {
    d.classList.add("error");
  });
  setTimeout(() => dots.forEach(d => {
    d.classList.remove("error");
  }), 600);
}

function renderKeypad(containerId, handler) {
  const keys = [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "empty", "0", "del" ];
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  keys.forEach(k => {
    const btn = document.createElement("button");
    btn.className = "pin-key" + (k === "del" ? " del" : "") + (k === "empty" ? " empty" : "");
    btn.innerText = k === "del" ? "⌫" : k === "empty" ? "" : k;
    if (k !== "empty") btn.onclick = () => handler(k === "del" ? "del" : k);
    container.appendChild(btn);
  });
}

onAuthStateChanged(auth, async user => {
  const action = localStorage.getItem("taxusa_action");
  if (action === "change_pin" && user && user.emailVerified) {
    localStorage.removeItem("taxusa_action");
    window.showChangePinScreen();
  }
});

initScreen();

const _pendingAction = localStorage.getItem("taxusa_action");

if (_pendingAction === "change_pin") {}
