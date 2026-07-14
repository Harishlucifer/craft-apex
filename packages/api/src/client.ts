import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import JSONbig from "json-bigint";
import { tokenStore } from "./storage";
import { getActiveModuleId } from "./module-context";

const BIG = JSONbig({ useNativeBigInt: true, storeAsString: true });

export interface ApiClientOptions {
  baseURL: string;
  /** X-Platform header value, e.g. "EMPLOYEE_PORTAL" */
  platform: string;
  /**
   * X-Tenant-Domain header. Multi-tenant backend resolves the tenant from
   * this. Falls back to window.location.origin (legacy behavior) when unset.
   */
  tenantDomain?: string;
  /** called when refresh fails / session is unrecoverable */
  onSessionExpired: () => void;
}

export interface ApiEnvelope<T = unknown> {
  status: boolean;
  message?: string;
  data: T;
}

let refreshing: Promise<string | null> | null = null;

/**
 * Builds the shared axios instance, preserving legacy behavior:
 * - tenant headers (X-Platform, X-Tenant-Domain), bearer token
 * - json-bigint safe transforms (loan/account ids exceed 2^53)
 * - single-flight 401 -> /auth/refresh -> retry, else session-expired
 */
export function createApiClient(opts: ApiClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: opts.baseURL,
    headers: { "Content-Type": "application/json" },
    transformRequest: [
      (data, headers) => {
        if (data == null) return data;
        // FormData / Blob must pass through untouched so the browser sets the
        // multipart boundary and binary parts are preserved.
        if (
          typeof FormData !== "undefined" && data instanceof FormData
        ) {
          if (headers && typeof headers.delete === "function") {
            headers.delete("Content-Type");
          }
          return data;
        }
        if (typeof Blob !== "undefined" && data instanceof Blob) return data;
        return BIG.stringify(data);
      },
    ],
    transformResponse: [
      (data) => {
        if (typeof data !== "string" || data.length === 0) return data;
        try {
          return BIG.parse(data);
        } catch {
          return data;
        }
      },
    ],
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set("X-Platform", opts.platform);
    config.headers.set(
      "X-Tenant-Domain",
      opts.tenantDomain || window.location.origin
    );
    const token = tokenStore.access;
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    const moduleId = getActiveModuleId();
    if (moduleId) config.headers.set("X-Module", moduleId);
    return config;
  });

  const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = tokenStore.refresh;
    if (!refresh) return null;
    try {
      const res = await axios.post(
        `${opts.baseURL}/alpha/v1/auth/refresh`,
        { refresh_token: refresh },
        { headers: { "X-Platform": opts.platform } }
      );
      const access: string | undefined =
        res.data?.data?.access_token ?? res.data?.user?.access_token;
      if (!access) return null;
      tokenStore.setTokens(access, res.data?.data?.refresh_token);
      return access;
    } catch {
      return null;
    }
  };

  instance.interceptors.response.use(
    (response) => response.data ?? response,
    async (error: AxiosError) => {
      const original = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const url = original?.url ?? "";
      const status = error.response?.status;

      const isAuthEndpoint =
        url.includes("/auth/refresh") || url.includes("/logout");

      if (status === 401 && original && !isAuthEndpoint && !original._retry) {
        original._retry = true;
        refreshing = refreshing ?? refreshAccessToken();
        const newToken = await refreshing;
        refreshing = null;

        if (newToken) {
          original.headers.set("Authorization", `Bearer ${newToken}`);
          return instance(original);
        }
        tokenStore.clear();
        opts.onSessionExpired();
        return Promise.reject(error);
      }
      if (status === 401 && isAuthEndpoint) {
        tokenStore.clear();
        opts.onSessionExpired();
      }

      const responseData = error.response?.data as any;
      if (responseData) {
        const serverMessage = responseData.error || responseData.message;
        if (serverMessage && typeof serverMessage === "string") {
          error.message = serverMessage;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

/** Replace `{{KEY}}` tokens in endpoint templates (legacy convention). */
export function buildUrl(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    String(params[k] ?? `{{${k}}}`)
  );
}
