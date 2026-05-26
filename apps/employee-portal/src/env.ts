export const env = {
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT,
  platform: import.meta.env.VITE_PLATFORM ?? "EMPLOYEE_PORTAL",
  /** optional; when unset the api client uses window.location.origin */
  tenantDomain: import.meta.env.VITE_TENANT_DOMAIN || undefined,
  brandName: import.meta.env.VITE_BRAND_NAME ?? "Craft Apex",
  /** Live Tracking map provider. Empty string => map renders an inline notice. */
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
  /**
   * LiveKit WebSocket URL used by /meet/join. The `meet/join` API response
   * usually carries the URL itself; this env var is a fallback for setups
   * where the backend doesn't supply one.
   */
  liveKitUrl: import.meta.env.VITE_LIVEKIT_URL ?? "",
};

if (!env.apiEndpoint) {
  // Fail fast in dev rather than firing requests at undefined
  console.error("VITE_API_ENDPOINT is not set — copy .env.example to .env");
}
