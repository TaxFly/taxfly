/* One device-aware behavior for user-facing map links across TaxFly. */
(function () {
  const ios = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(navigator.userAgent);
  function mapsUrl(anchor) {
    try {
      const url = new URL(anchor.href, location.href);
      if (!/^https?:$/.test(url.protocol)) return null;
      const host = url.hostname.toLowerCase();
      if (/^(www\.)?google\.[a-z.]+$/.test(host) && url.pathname.startsWith('/maps')) return url;
      if (host === 'maps.google.com' || host === 'maps.app.goo.gl' || host === 'maps.apple.com') return url;
      if (anchor.matches('.maps-btn,.rs-maps,.s-maps') && /maps/i.test(anchor.textContent)) return url;
    } catch (_) {}
    return null;
  }
  function queryFor(url, anchor) {
    let query = url.searchParams.get('query') || url.searchParams.get('q') || url.searchParams.get('daddr');
    if (!query) {
      const match = url.pathname.match(/\/place\/([^/]+)/);
      if (match) query = decodeURIComponent(match[1].replace(/\+/g, ' '));
    }
    if (!query) query = anchor.closest('.stop-card,.ruta-stop,.stop,.hotel-bar-result,.hotel-bar')?.querySelector('.stop-name,.rs-name,.s-name,.hotel-bar-addr')?.textContent?.trim();
    return query || url.href;
  }
  function dialog(query, google) {
    let box = document.getElementById('taxfly-map-choice');
    if (!box) {
      box = document.createElement('dialog');
      box.id = 'taxfly-map-choice';
      box.style.cssText = 'border:1px solid #64748b;border-radius:16px;padding:22px;background:#1e293b;color:#f8fafc;max-width:min(360px,90vw);box-shadow:0 16px 50px #0008;font:600 15px system-ui';
      box.innerHTML = '<strong style="display:block;margin-bottom:16px"></strong><div style="display:grid;gap:10px"><a data-apple>Apple Maps</a><a data-google>Google Maps</a><button type="button"></button></div>';
      box.querySelectorAll('a,button').forEach(el => { el.style.cssText = 'padding:11px;border-radius:9px;border:1px solid #64748b;background:#273549;color:white;text-align:center;text-decoration:none;cursor:pointer;font:inherit'; el.addEventListener('click', () => box.close()); });
      document.body.append(box);
    }
    const lang = localStorage.getItem('appLang') || 'es';
    box.querySelector('strong').textContent = lang === 'en' ? 'Open in Maps' : lang === 'pt' ? 'Abrir no Maps' : 'Abrir en Maps';
    box.querySelector('button').textContent = lang === 'en' ? 'Cancel' : 'Cancelar';
    box.querySelector('[data-apple]').href = 'https://maps.apple.com/?q=' + encodeURIComponent(query);
    box.querySelector('[data-google]').href = google;
    box.showModal();
  }
  document.addEventListener('click', function (event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.closest('#taxfly-map-choice,#map-choice-dialog')) return;
    const url = mapsUrl(anchor);
    if (!url) return;
    event.preventDefault();
    event.stopPropagation();
    const query = queryFor(url, anchor);
    const google = url.hostname === 'maps.apple.com' ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query) : url.href;
    if (ios) dialog(query, google);
    else if (android) location.href = google;
    else window.open(google, '_blank', 'noopener,noreferrer');
  }, true);
}());
