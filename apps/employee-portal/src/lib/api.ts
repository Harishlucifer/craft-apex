import {
  createApiClient,
  createQueryClient,
  setApiClient,
} from "@craft-apex/api";
import { env } from "@/env";

/** App-wide axios instance. Session-expiry hard-redirects to /login (legacy parity). */
export const api = createApiClient({
  baseURL: env.apiEndpoint,
  platform: env.platform,
  tenantDomain: env.tenantDomain,
  onSessionExpired: () => {
    window.location.assign("/login");
  },
});

// Let shared package components make verified calls (e.g. header search).
setApiClient(api);

export const queryClient = createQueryClient();
