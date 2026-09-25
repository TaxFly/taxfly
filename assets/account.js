window.confirmAndDeleteAccount = async function({db: db, doc: doc, deleteDoc: deleteDoc, deleteUser: deleteUser, currentUser: currentUser, rcCheck: rcCheck}) {
  const lang = localStorage.getItem("appLang") || "es";
  const M = {
    es: {
      c: "¿Eliminar cuenta permanentemente?",
      e: "Reautenticación requerida. Cerrá sesión y volvé a entrar para eliminar tu cuenta."
    },
    en: {
      c: "Permanently delete account?",
      e: "Re-authentication required. Please log out and back in to delete your account."
    },
    pt: {
      c: "Excluir conta permanentemente?",
      e: "Reautenticação necessária. Saia e entre novamente para excluir sua conta."
    }
  };
  const t = M[lang] || M.es;
  if (!await window.showConfirm(t.c)) return;
  if (typeof rcCheck === "function") {
    const ok = await rcCheck("delete_account");
    if (!ok) {
      window.showAlert("Verificación de seguridad fallida. Intentá de nuevo.");
      return;
    }
  }
  try {
    if (db && doc && deleteDoc && currentUser) {
      await deleteDoc(doc(db, "usuarios", currentUser.uid)).catch(() => {});
    }
    await deleteUser(currentUser);
    window.location.replace("login.html");
  } catch (e) {
    window.showAlert(t.e);
  }
};

window.confirmAndChangeEmail = async function({currentUser: currentUser, verifyBeforeUpdateEmail: verifyBeforeUpdateEmail}) {
  if (!currentUser) {
    window.showAlert("No hay sesión activa.");
    return;
  }
  const lang = localStorage.getItem("appLang") || "es";
  const M = {
    es: {
      p: "Ingresá tu nuevo correo:",
      s: "Verificación enviada.",
      e: "Error: "
    },
    en: {
      p: "Enter your new email:",
      s: "Verification sent.",
      e: "Error: "
    },
    pt: {
      p: "Digite seu novo e-mail:",
      s: "Verificação enviada.",
      e: "Erro: "
    }
  };
  const t = M[lang] || M.es;
  const email = await window.showPrompt(t.p);
  if (!email) return;
  try {
    await verifyBeforeUpdateEmail(currentUser, email);
    window.showAlert(t.s);
  } catch (er) {
    window.showAlert(t.e + er.message);
  }
};