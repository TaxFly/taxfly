// ── TaxFly — eliminar cuenta (lógica compartida) ────────────────────────────
// Antes cada página tenía su propia copia de esto, con diferencias reales:
// algunas no borraban el documento de Firestore (quedaba huérfano), otras no
// tenían el chequeo de reCAPTCHA. Acá vive una sola versión con lo mejor de
// cada una. Como cada página es su propio módulo JS (con su propio db,
// currentUser, etc.), se la llama pasándole esas piezas:
//
//   window.confirmAndDeleteAccount({ db, doc, deleteDoc, deleteUser, currentUser, rcCheck: window._rcCheck })
//
// rcCheck es opcional: si la página no tiene _rcCheck definido, se omite ese
// paso en vez de romper.
window.confirmAndDeleteAccount = async function ({ db, doc, deleteDoc, deleteUser, currentUser, rcCheck }) {
    const lang = localStorage.getItem('appLang') || 'es';
    const M = {
        es: { c: '¿Eliminar cuenta permanentemente?', e: 'Reautenticación requerida. Cerrá sesión y volvé a entrar para eliminar tu cuenta.' },
        en: { c: 'Permanently delete account?', e: 'Re-authentication required. Please log out and back in to delete your account.' },
        pt: { c: 'Excluir conta permanentemente?', e: 'Reautenticação necessária. Saia e entre novamente para excluir sua conta.' },
    };
    const t = M[lang] || M.es;

    if (!(await window.showConfirm(t.c))) return;

    if (typeof rcCheck === 'function') {
        const ok = await rcCheck('delete_account');
        if (!ok) { window.showAlert('Verificación de seguridad fallida. Intentá de nuevo.'); return; }
    }

    try {
        if (db && doc && deleteDoc && currentUser) {
            // Si falla el borrado del doc no bloqueamos la eliminación de la
            // cuenta en sí — mejor una cuenta borrada con un doc huérfano que
            // no poder borrar la cuenta.
            await deleteDoc(doc(db, 'usuarios', currentUser.uid)).catch(() => {});
        }
        await deleteUser(currentUser);
        window.location.replace('login.html');
    } catch (e) {
        window.showAlert(t.e);
    }
};

// ── Cambiar correo (lógica compartida) ──────────────────────────────────
// Mismo motivo que arriba: 6 copias casi iguales, con distinta cantidad de
// idiomas y una de ellas usando un toast propio en vez del modal común.
window.confirmAndChangeEmail = async function ({ currentUser, verifyBeforeUpdateEmail }) {
    if (!currentUser) { window.showAlert('No hay sesión activa.'); return; }
    const lang = localStorage.getItem('appLang') || 'es';
    const M = {
        es: { p: 'Ingresá tu nuevo correo:', s: 'Verificación enviada.', e: 'Error: ' },
        en: { p: 'Enter your new email:', s: 'Verification sent.', e: 'Error: ' },
        pt: { p: 'Digite seu novo e-mail:', s: 'Verificação enviada.', e: 'Erro: ' },
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
