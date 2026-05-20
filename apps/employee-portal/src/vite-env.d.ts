/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string;
  readonly VITE_PLATFORM: string;
  readonly VITE_TENANT_DOMAIN?: string;
  readonly VITE_BRAND_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
