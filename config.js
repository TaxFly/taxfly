// ── Config compartido de TaxFly ─────────────────────────────────────────────
// Un solo lugar para la URL del worker y el secreto de la app.
// Ojo: esto lo carga el navegador, así que técnicamente cualquiera que mire
// el código fuente puede verlo. No reemplaza una autenticación real, pero
// frena a scrapers/bots automáticos que solo prueban la URL del worker sin
// mirar el JS de la página. La protección real contra abuso masivo es la
// regla de Rate Limiting que configurás en el dashboard de Cloudflare.
window.TAXFLY_CONFIG = {
    WORKER_URL: 'https://taxfly-claude.juanbria18.workers.dev',
    APP_SECRET: 'PONÉ_ACÁ_EL_MISMO_VALOR_QUE_CARGASTE_CON_WRANGLER_SECRET_PUT_APP_SHARED_SECRET',
};
