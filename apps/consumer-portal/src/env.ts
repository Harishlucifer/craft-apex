export const env = {
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT,
  /** Backend maps this to UserTypeCustomer — see alpha-api utility.ValidatePlatform. */
  platform: import.meta.env.VITE_PLATFORM ?? "CUSTOMER_PORTAL",
  /** optional; when unset the api client uses window.location.origin */
  tenantDomain: import.meta.env.VITE_TENANT_DOMAIN || undefined,
  brandName: import.meta.env.VITE_BRAND_NAME ?? "Craft Apex",
};

if (!env.apiEndpoint) {
  console.error("VITE_API_ENDPOINT is not set — copy .env.example to .env");
}
