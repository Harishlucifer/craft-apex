import {
  createApiClient,
  createQueryClient,
  setApiClient,
} from "@craft-apex/api";
import { env } from "@/env";

/**
 * App-wide axios instance.
 *
 * There is no module tree for CUSTOMER_PORTAL, so `getActiveModuleId()` stays
 * null and no X-Module header is sent — which is correct: the backend scopes
 * customer requests by the authenticated user, not by module.
 */
export const api = createApiClient({
  baseURL: env.apiEndpoint,
  platform: env.platform,
  tenantDomain: env.tenantDomain,
  onSessionExpired: () => {
    window.location.assign("/login");
  },
});

setApiClient(api);

export const queryClient = createQueryClient();
