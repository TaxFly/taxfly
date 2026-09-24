/* ── Taxfly UI — íconos y detalles visuales compartidos ────────────────────
   Reemplaza los emojis "de sistema" de la barra de navegación, los accesos
   del inicio, las pestañas y los títulos por íconos de línea (los mismos
   trazos que usa Orlando Planning), para que se vean igual en iPhone,
   Android y Windows y las dos apps se sientan una sola.

   No toca el contenido que carga el usuario (categorías de gastos, nombres,
   etc.). Funciona con un MutationObserver porque varias pantallas escriben
   sus textos por JavaScript (traducciones, tip que rota, próximo evento).
   Los estilos viven en assets/ui.css. */
(function () {
    'use strict';

    const ICONS = {
        home:       '<path d="M3 11 12 3l9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>',
        calculator: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 7h7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
        chart:      '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
        pin:        '<path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
        map:        '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
        bag:        '<path d="M6 2 4 8v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-2-6Z"/><path d="M4 8h16"/><path d="M9 12a3 3 0 0 0 6 0"/>',
        bulb:       '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7h6c0-.7.3-1.3.8-1.7A6.5 6.5 0 0 0 12 2.5Z"/>',
        file:       '<path d="M7 2h7l5 5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5.5 20V3.5A1.5 1.5 0 0 1 7 2Z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/>',
        folder:     '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z"/>',
        users:      '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
        calendar:   '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>',
        exchange:   '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
        receipt:    '<path d="M5 2.5v19l2.3-1.6 2.2 1.6 2.5-1.6 2.5 1.6 2.2-1.6L19 21.5v-19l-2.3 1.6L14.5 2.5 12 4.1 9.5 2.5 7.3 4.1Z"/><path d="M9 9h6M9 13h6"/>',
        plane:      '<path d="M3.5 19 21 12 3.5 5l1.5 6.2L14 12l-9 .8Z"/>',
        bed:        '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="1.8"/>',
        ferris:     '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/><path d="M12 20v2M8 22h8"/>',
        utensils:   '<path d="M7 2v6a2 2 0 0 0 4 0V2"/><path d="M9 8v14"/><path d="M17 2c-1.5 0-3 1.5-3 4v4a2 2 0 0 0 2 2h1v10"/>',
        car:        '<path d="M5 13 6.6 8.2A2 2 0 0 1 8.5 7h7a2 2 0 0 1 1.9 1.2L19 13"/><path d="M4 13h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/><circle cx="7.5" cy="18.5" r="1.4"/><circle cx="16.5" cy="18.5" r="1.4"/>',
        masks:      '<path d="M4 5c3 0 4 2 4 4s-1 3-2 3-3-1.5-3-4a5 5 0 0 1 1-3Z"/><path d="M20 5c-3 0-4 2-4 4s1 3 2 3 3-1.5 3-4a5 5 0 0 0-1-3Z"/><path d="M8 13c1.3 3 3 5 4 5s2.7-2 4-5"/>',
        checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16 9.5"/>',
        notes:      '<path d="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z"/><path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5"/>',
        scale:      '<path d="M12 3v18M6 21h12"/><path d="M5 7h14"/><path d="m5 7-3 7a3.2 3.2 0 0 0 6 0Zm14 0-3 7a3.2 3.2 0 0 0 6 0Z"/>',
        wallet:     '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 13.5h.01"/>',
        pencil:     '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/>',
        sparkles:   '<path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/>',
        camera:     '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
        image:      '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/>',
        globe:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18Z"/>',
        card:       '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
        box:        '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
        alert:      '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4M12 17h.01"/>',
        check:      '<path d="M20 6 9 17l-5-5"/>',
        x:          '<path d="M18 6 6 18M6 6l12 12"/>',
        xCircle:    '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
        pill:       '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>',
        clipboard:  '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6"/>',
        shield:     '<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
        trash:      '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
        phone:      '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
        ticket:     '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4Z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
        pulse:      '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
        castle:     '<path d="M3 21V9l3-2v3l3-2v-2l3 3 3-3v2l3-2v3l3 2v10Z"/><path d="M3 21h18"/><path d="M10 21v-5a2 2 0 0 1 4 0v5"/>',
        cart:       '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 3h2l2.6 12.4A2 2 0 0 0 9.55 17H18a2 2 0 0 0 1.96-1.6L21.5 8H6"/>',
        bell:       '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4Z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
        bellOff:    '<path d="M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H8"/><path d="M10 21a2 2 0 0 0 4 0M3 3l18 18"/>',
        film:       '<path d="M3 8.5 5 3l3.3 3-2 5.5Z"/><path d="M8.3 6 11.6 9l6.7-3.5-3.3-3Z"/><path d="M3 11h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/>',
        plug:       '<path d="M9 3v4M15 3v4M6.5 7h11l-1 6a6 6 0 0 1-9 0Z"/><path d="M12 17v4"/>',
        cash:       '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
        download:   '<path d="M12 3v13m0 0-4-4m4 4 4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
        upload:     '<path d="M12 16V3m0 0 4 4m-4-4-4 4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
        refresh:    '<path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"/>',
        idcard:     '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 5.5-1.5 6 0M14.5 10h4M14.5 14h3"/>',
        briefcase:  '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
        medical:    '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M12 8v8M8 12h8"/>',
        laptop:     '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
        hash:       '<path d="M5 9h15M4 15h15M10 4 8 20M16 4l-2 16"/>',
        bus:        '<rect x="4" y="3.5" width="16" height="14" rx="3"/><path d="M4 11h16M8 21v-3.5M16 21v-3.5M8 14.5h.01M16 14.5h.01"/>',
        thermo:     '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/>',
        rain:       '<path d="M7 16a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8a4 4 0 0 1-1 8Z"/><path d="M8 19v2M12 19v2M16 19v2"/>',
        sun:        '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        landmark:   '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2.5 10 12 4l9.5 6Z"/>',
        plus:       '<path d="M12 5v14M5 12h14"/>',
        link:       '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
        tag:        '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V4a1 1 0 0 1 1-1h9l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="8" cy="8" r="1.4"/>',
        save:       '<path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
        trophy:     '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
        search:     '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
        mail:       '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        printer:    '<path d="M7 9V3h10v6M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>',
        lock:       '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
        headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
        zap:        '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
        cloud:      '<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 10a4 4 0 0 1-1 8Z"/>',
        volume:     '<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
        dot:        '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
        message:    '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z"/>',
        ruler:      '<path d="m3 15 12-12 6 6L9 21Z"/><path d="m7 11 2 2M10 8l2 2M13 5l2 2"/>',
        droplet:    '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
        logout:     '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9"/>',
        key:        '<circle cx="8" cy="14" r="4"/><path d="m11 11 9-9M17 5l3 3M14 8l2 2"/>',
        play:       '<path d="M7 4v16l13-8Z"/>',
        user:       '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
        syringe:    '<path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2 2 0 0 1-1.4.6H4v-3.3a2 2 0 0 1 .6-1.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6"/>',
        leaf:       '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.6-6.5C12 13.2 14 11 15 9"/>',
        gift:       '<path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/>',
        paw:        '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
        scissors:   '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
        pointer:    '<path d="m4 4 7.5 17 2.4-7.1L21 11.5Z"/>',
        wifi:       '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".6"/><path d="M2 9a14 14 0 0 1 20 0"/>',
        chevDown:   '<path d="m6 9 6 6 6-6"/>',
        chevUp:     '<path d="m6 15 6-6 6 6"/>',
        apple:      '<path d="M12 7c-2-2-6-1-6 4 0 4 2 9 4 9 1 0 1-.5 2-.5s1 .5 2 .5c2 0 4-5 4-9 0-5-4-6-6-4Z"/><path d="M12 7c0-2 1-3 3-3"/>',
        shirt:      '<path d="M8 3 3 6l2 3 3-1.2V21h8V7.8L19 9l2-3-5-3-2 2h-4Z"/>',
        tooth:      '<path d="M7 3.5c-2.5 0-4 2-4 4.5 0 2 1 3 1.5 5S5.5 20 7.5 20c1.8 0 1.5-4 4.5-4s2.7 4 4.5 4c2 0 2-4.5 3-6.5S21 10 21 8c0-2.5-1.5-4.5-4-4.5-2 0-3 1-5 1s-3-1-5-1Z"/>'
    };
    window.UI_ICONS = ICONS;
    const svg = (name, size) => `<svg class="ui-ic" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
    window.uiIcon = svg;

    // emoji → ícono (se compara sin el selector de variación U+FE0F ni tonos de piel)
    const EMOJI = {
        '🏠': 'home', '📊': 'chart', '📍': 'pin', '🗺': 'map', '🛍': 'bag', '💡': 'bulb',
        '📄': 'file', '👥': 'users', '📅': 'calendar', '💱': 'exchange', '🧾': 'receipt',
        '✈': 'plane', '🏨': 'bed', '🎡': 'ferris', '🍔': 'utensils', '🚗': 'car', '🎭': 'masks',
        '✅': 'checkCircle', '📝': 'notes', '⚖': 'scale', '💸': 'wallet', '🗂': 'folder',
        '✍': 'pencil', '📷': 'camera', '🖼': 'image', '🌍': 'globe', '✨': 'sparkles',
        '💳': 'card', '📦': 'box', '⚠': 'alert', '❌': 'xCircle', '✕': 'x', '✓': 'check', '💊': 'pill', '📋': 'clipboard',
        '🛡': 'shield', '🗑': 'trash', '📱': 'phone', '🎟': 'ticket', '🩺': 'pulse', '🚇': 'bus', '🚌': 'bus', '🚕': 'car',
        '🏰': 'castle', '🛒': 'cart', '🎢': 'ferris', '➕': 'plus', '✏': 'pencil', '🍽': 'utensils', '🌡': 'thermo',
        '🔔': 'bell', '🔕': 'bellOff', '🎬': 'film', '🔌': 'plug', '💵': 'cash', '💰': 'cash', '📥': 'download',
        '📤': 'upload', '🔄': 'refresh', '🚀': 'sparkles', '🛂': 'idcard', '🧳': 'briefcase', '🏥': 'medical', '🚨': 'alert',
        '📌': 'pin', '🦷': 'tooth', '💻': 'laptop', '📂': 'folder', '🔢': 'hash', '🌧': 'rain', '🏖': 'sun', '🗽': 'landmark',
        '🏛': 'landmark', '🔗': 'link',
        '🌤': 'sun', '🌞': 'sun', '📵': 'phone', '📲': 'phone', '🏷': 'tag', '💾': 'save', '⚕': 'medical', '📸': 'camera',
        '🏆': 'trophy', '🔍': 'search', '🤖': 'sparkles', '🏪': 'bag', '📧': 'mail', '🖨': 'printer', '🅿': 'car', '🚂': 'bus',
        '🔒': 'lock', '🎧': 'headphones', '📁': 'folder', '💉': 'syringe', '⚡': 'zap', '🌐': 'globe', '☁': 'cloud', '🔊': 'volume',
        '🔤': 'notes', '⛔': 'xCircle', '🔴': 'dot', '🥤': 'droplet', '📐': 'ruler', '📏': 'ruler', '⛽': 'droplet', '🥨': 'box',
        '💬': 'message', '🚪': 'logout', '🔑': 'key', '▶': 'play', '⬇': 'download', '🗓': 'calendar', '📆': 'calendar', '🧭': 'map', '🍎': 'apple', '👕': 'shirt', '👟': 'shirt', '👤': 'user', '🧮': 'calculator', '✂': 'scissors', '👆': 'pointer', '🔎': 'search', '⬆': 'upload', '📶': 'wifi', '🥦': 'leaf', '🍬': 'gift', '🦁': 'paw', '🦖': 'paw', '💛': 'zap', '🎥': 'film', '🖥': 'laptop', '👗': 'shirt', '⭐': 'sparkles', '👠': 'tag', '💄': 'sparkles', '💅': 'sparkles', '🏕': 'pin', '🔨': 'plug', '🪑': 'bed', '🎮': 'play', '🎯': 'search', '🏬': 'landmark'
    };
    // Si el ícono vive dentro de un link, manda el destino (así 📊 en "TAXES" es la calculadora y no un gráfico)
    const BY_HREF = [
        [/tax\.html/, 'calculator', 'blue'], [/compras\.html/, 'bag', 'violet'],
        [/itinerario\.html/, 'pin', 'green'], [/unidades\.html/, 'bulb', 'amber'],
        [/tickets\.html/, 'file', 'cyan'], [/grupo\.html/, 'users', 'indigo'],
        [/rutas\.html/, 'map', 'red'], [/Maps\//, 'ferris', 'teal'],
        [/index\.html|^\.?\/?$/, 'home', 'blue']
    ];
    const norm = s => (s || '').replace(/[️‍]|\uD83C[\uDFFB-\uDFFF]/g, '').trim();

    function pick(el, text) {
        const a = el.matches('.ni, .dd-icon, .sc-emoji') ? el.closest('a[href]') : null;
        if (a) {
            const href = a.getAttribute('href') || '';
            for (const [re, icon, tone] of BY_HREF) if (re.test(href)) return { icon, tone };
        }
        const k = norm(text);
        return EMOJI[k] ? { icon: EMOJI[k], tone: null } : null;
    }

    // selectores cuyo contenido es SOLO un emoji de "chrome"
    const ICON_SLOTS = '.btn-nav .ni, .dd-icon, .sc-emoji, .w-icon, #ne-dot, .tip-icon, .tab-btn .ti, .ui-emoji';
    function swapSlots(root) {
        root.querySelectorAll(ICON_SLOTS).forEach(el => {
            if (el.querySelector(':scope > svg')) return;
            const txt = el.textContent;
            if (!txt || norm(txt).length > 4) return;
            const hit = pick(el, txt);
            if (!hit) return;
            const size = el.matches('.btn-nav .ni') ? 21 : el.matches('.sc-emoji') ? 22 : el.matches('.tab-btn .ti') ? 16 : el.matches('#ne-dot') ? 22 : el.matches('.tip-icon') ? 20 : 16;
            el.innerHTML = svg(hit.icon, size);
            el.classList.add('ui-slot');
            if (hit.tone) el.setAttribute('data-tone', hit.tone);
        });
    }

    // títulos de pantalla que arrancan con emoji ("🗺️ Generador de Ruta", "🗂️ Mis Documentos")
    function swapHeadings(root) {
        root.querySelectorAll('h1[data-i18n], h2[data-i18n]').forEach(el => {
            if (el.querySelector('svg.ui-ic')) return;
            const txt = el.textContent || '';
            const m = txt.match(/^\s*(\p{Extended_Pictographic}[️‍\u{1F3FB}-\u{1F3FF}]*)\s*/u);
            if (!m) return;
            const name = EMOJI[norm(m[1])];
            if (!name) return;
            el.textContent = txt.slice(m[0].length);
            el.insertAdjacentHTML('afterbegin', svg(name, 20) + ' ');
            el.classList.add('ui-title');
        });
    }


    // ── Barra de navegación única ─────────────────────────────────────────
    // Antes cada pantalla armaba su propia barra y se "saltaba" a sí misma
    // (así nunca se podía ver en cuál estabas y los botones cambiaban de
    // lugar). Ahora es la misma en todas: 4 destinos + "Más", con la página
    // actual resaltada. Los textos los maneja este archivo (es/en/pt) porque
    // la barra ya no es parte del diccionario de cada página.
    const NAV_T = {
        es: { home: 'INICIO', taxes: 'TAXES', shopping: 'GASTOS', itinerary: 'ITINERARIO', more: 'MÁS',
              routes: 'Rutas', routes_d: 'Planificá tus recorridos', units: 'Ayuda y referencias', units_d: 'Conversor de unidades y ayudas varias',
              tickets: 'Documentos', tickets_d: 'ESTA, seguros, check-in', group: 'Grupo', group_d: 'Gastos compartidos' },
        en: { home: 'HOME', taxes: 'TAXES', shopping: 'EXPENSES', itinerary: 'ITINERARY', more: 'MORE',
              routes: 'Routes', routes_d: 'Plan your routes', units: 'Help & references', units_d: 'Unit converter & utilities',
              tickets: 'Documents', tickets_d: 'ESTA, insurance, check-in', group: 'Group', group_d: 'Shared expenses' },
        pt: { home: 'INÍCIO', taxes: 'TAXES', shopping: 'GASTOS', itinerary: 'ITINERÁRIO', more: 'MAIS',
              routes: 'Rotas', routes_d: 'Planeje seus roteiros', units: 'Ajuda e referências', units_d: 'Conversor de unidades e utilidades',
              tickets: 'Documentos', tickets_d: 'ESTA, seguros, check-in', group: 'Grupo', group_d: 'Gastos compartilhados' }
    };
    const curLang = () => { let l = 'es'; try { l = localStorage.getItem('appLang') || 'es'; } catch (e) {} return NAV_T[l] ? l : 'es'; };
    const NAV_MAIN = [['index.html', 'home', 'home', 'home'], ['tax.html', 'calculator', 'taxes', 'blue'], ['compras.html', 'bag', 'shopping', 'violet'], ['itinerario.html', 'pin', 'itinerary', 'green']];
    const NAV_MORE = [['rutas.html', 'map', 'routes', 'red'], ['unidades.html', 'bulb', 'units', 'amber'], ['tickets.html', 'file', 'tickets', 'cyan'], ['grupo.html', 'users', 'group', 'indigo']];

    function buildNav() {
        const nav = document.querySelector('.nav-bar');
        if (!nav || !nav.querySelector('.btn-nav')) return;   // el inicio no lleva barra
        const lang = curLang();
        if (nav.getAttribute('data-ui-nav') === lang) return;
        const T = NAV_T[lang];
        const set = nav.querySelector('#btnSettings');
        const main = NAV_MAIN.map(([href, icon, key]) =>
            `<a href="${href}" class="btn-nav"><span class="ni">${svg(icon, 21)}</span><span>${T[key]}</span></a>`).join('');
        const more = NAV_MORE.map(([href, icon, key, tone]) =>
            `<a href="${href}" class="dd-item"><span class="dd-icon ui-slot" data-tone="${tone}">${svg(icon, 18)}</span><div><div class="dd-name">${T[key]}</div><div class="dd-desc">${T[key + '_d']}</div></div></a>`).join('');
        nav.innerHTML = main +
            `<button class="btn-nav-more" id="btnMore" onclick="toggleMoreMenu(event)" aria-label="${T.more}">
                <div class="more-dots"><div class="more-dot"></div><div class="more-dot"></div><div class="more-dot"></div></div>
                <span class="more-lbl">${T.more}</span>
                <div class="nav-dropdown" id="navDropdown"><div class="dd-arrow"></div>${more}</div>
            </button>`;
        if (set) nav.appendChild(set);
        nav.setAttribute('data-ui-nav', lang);
    }


    // Emoji al INICIO de un texto ("📍 PUNTO DE PARTIDA", "📷 CÁMARA", "✨ Generar ruta").
    // Solo textos fijos de la pantalla (los que ya estaban al cargar o los que
    // traen data-i18n): lo que el usuario carga (gastos, documentos, lugares…)
    // conserva sus emojis de categoría.
    const LEAD_RE = /^(\s*)(\p{Extended_Pictographic}[️‍\u{1F3FB}-\u{1F3FF}]*|[✓✕])(\s*)/u;
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'SELECT', 'TITLE', 'INPUT', 'NOSCRIPT']);
    const ALWAYS = '.ios-step-icon,.crop-zoom-icon,.pc-emoji,.tip-icon,.btn-label,.sync-banner,.offlineBannerBody,.park-emoji,.filter-btn,.subcat-btn,.member-chip,.comp-store-emoji,.ai-chip,.t-icon,.group-emoji,.source-btn,.cam-capture,.viewer-btn,.action-btn,.cl-label,.frase-fonetica,.farma-tip,.badge-rx,.frases-tab,.stat-icon,.sheet-tag,.ocr-store-badge,.capture-btn,.cart-btn,.poo-badge,.code-badge,.slabel,.demo-chip,.calc-tab,.med-cat,.cat-icon,.h-thumb-placeholder,.cat-bar-name,.h-del,.act-del,.note-del,.member-del,.stop-row-del,.cart-item-del,.preview-remove,.close-scanner,.cam-close,.viewer-close,#ai-close,.ocr-btn-cancel,.rv-btn-close,.preview-pdf span';
    let staticEls = new WeakSet();
    const isStaticZone = el => {
        for (let n = el; n && n !== document.body; n = n.parentElement) {
            if (staticEls.has(n) || (n.hasAttribute && n.hasAttribute('data-i18n'))) return true;
        }
        return false;
    };
    function swapText(root) {
        const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT, null);
        const hits = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const v = n.nodeValue;
            if (!v || v.length > 400) continue;
            const m = v.match(LEAD_RE);
            if (!m) continue;
            const el = n.parentElement;
            if (!el || SKIP_TAGS.has(el.tagName) || el.closest('[data-keep-emoji], svg, [contenteditable="true"], option')) continue;
            // debe ser el primer contenido "visible" del elemento
            let prev = n.previousSibling;
            while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) prev = prev.previousSibling;
            if (prev) continue;
            if (!isStaticZone(el) && !el.closest(ALWAYS)) continue;
            const name = EMOJI[norm(m[2])];
            if (!name) continue;
            hits.push([n, m, name, el]);
        }
        hits.forEach(([n, m, name, el]) => {
            const rest = n.nodeValue.slice(m[0].length);
            const fs = parseFloat(getComputedStyle(el).fontSize) || 14;
            const size = /^H[12]$/.test(el.tagName) ? 20 : fs >= 24 ? Math.round(fs) : fs >= 18 ? Math.round(fs * 0.95) : 16;
            // OJO: un <svg> suelto, no un <span>: varias pantallas buscan "los spans del
            // botón" por posición para traducirlos y un span extra las desordenaría.
            const tpl = document.createElement('template');
            tpl.innerHTML = svg(name, size).replace('class="ui-ic"', 'class="ui-ic ui-lead' + (rest.trim() ? ' has-text' : '') + (fs >= 24 ? ' big' : '') + '"');
            const wrap = tpl.content.firstChild;
            n.nodeValue = rest;
            n.parentNode.insertBefore(wrap, n);
        });
    }
    const swapLeading = swapText;


    // ▼ VER / ▲ CERRAR de los desplegables → chevron de línea (mismo trazo que el resto)
    const ARROW_SEL = '#act-form-toggle,#adaptador-toggle,[id$="chevron-a"],[id$="chevron-b"],#ip-chevron,.tip-toggle-lbl,.split-toggle,.med-toggle,.cart-toggle,.collapsible-toggle,.group-arrow,.chevron,.arr,.arrow';
    const ARROW_RE = /^(\s*)([▼▲▾▴])(\s*)/;
    function swapArrows(root) {
        (root.querySelectorAll ? root : document).querySelectorAll('.conv-divider,.rate-divider').forEach(el => {
            if (el.children.length || el.textContent.trim() !== '⇅') return;
            el.innerHTML = svg('exchange', 14).replace('class="ui-ic"', 'class="ui-ic ui-swap"');
        });
        (root.querySelectorAll ? root : document).querySelectorAll(ARROW_SEL).forEach(el => {
            let n = el.firstChild;
            while (n && n.nodeType === 3 && !n.nodeValue.trim() && n.nextSibling) n = n.nextSibling;
            if (!n || n.nodeType !== 3) return;
            const m = n.nodeValue.match(ARROW_RE);
            if (!m) return;
            const rest = n.nodeValue.slice(m[0].length);
            const up = m[2] === '▲' || m[2] === '▴';
            const tpl = document.createElement('template');
            tpl.innerHTML = svg(up ? 'chevUp' : 'chevDown', 14).replace('class="ui-ic"', 'class="ui-ic ui-arw"');
            n.nodeValue = rest;
            el.insertBefore(tpl.content.firstChild, n);
        });
    }

    // Página actual → resaltar en la barra de navegación
    function markActive() {
        const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        document.querySelectorAll('.nav-bar .btn-nav[href]').forEach(a => {
            const h = (a.getAttribute('href') || '').toLowerCase();
            a.classList.toggle('active', h === file || (file === '' && h === 'index.html'));
        });
        const dd = document.querySelector('.nav-bar .btn-nav-more');
        if (dd) {
            const inMore = NAV_MORE.some(m => m[0] === file);
            dd.classList.toggle('is-current', inMore);
            dd.querySelectorAll('a.dd-item[href]').forEach(a => a.classList.toggle('current', (a.getAttribute('href') || '').toLowerCase() === file));
        }
    }

    function run() {
        buildNav();
        swapSlots(document);
        swapHeadings(document);
        swapLeading(document);
        swapArrows(document);
        markActive();
    }

    let queued = false;
    const schedule = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; run(); });
    };

    function start() {
        document.querySelectorAll('body *').forEach(e => staticEls.add(e));
        run();
        // ui.js se carga arriba de todo: lo que el HTML declara más abajo (modales,
        // botones, avisos) recién existe al terminar de leer la página.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('body *').forEach(e => staticEls.add(e));
                run();
            });
        }
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
})();
