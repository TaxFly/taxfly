/* Reboot the current screen after a verified offline-to-online transition.
   All saved queues survive navigation and flush during the fresh initialization. */
(function () {
  let wasOffline = !navigator.onLine;
  let reconnecting = false;
  let timer;
  let attempts = 0;
  function schedule(delay) {
    clearTimeout(timer);
    if (!wasOffline || reconnecting || !navigator.onLine) return;
    timer = setTimeout(check, delay);
  }
  async function check() {
    if (!wasOffline || reconnecting || !navigator.onLine) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      let response;
      try {
        response = await fetch('config.js?connectivity=' + Date.now(), {
          cache: 'no-store', signal: controller.signal
        });
      } finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error('Sin conexión al servidor');
      reconnecting = true;
      window.dispatchEvent(new Event('taxfly:reconnected'));
      // Give in-page queue handlers a chance to start; saved changes are replayed on load.
      setTimeout(() => location.reload(), 1200);
    } catch (_) {
      attempts++;
      schedule(Math.min(30000, 2000 * Math.pow(2, Math.min(attempts, 4))));
    }
  }
  window.addEventListener('offline', () => {
    wasOffline = true;
    reconnecting = false;
    attempts = 0;
    clearTimeout(timer);
  });
  window.addEventListener('online', () => schedule(300));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && wasOffline) schedule(300);
  });
  if (wasOffline) schedule(300);
}());
