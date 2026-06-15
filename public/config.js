// Runtime config (DEV default). Vite serves public/ as-is at the web root.
// In PROD this file is overwritten by nginx (rendered from $TELERAD_CORE_URL).
// Value = telerad-core base INCLUDING the '/services' segment, so that the SPA
// path '/telerad-core/v1/x' resolves to '<this>/telerad-core/v1/x'.
window.__TELERAD_CORE_URL__ = "http://localhost:8101/services";
