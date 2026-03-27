import type { ApiResponse, RequestConfig } from "../types";

/**
 * Provides auth state for API headers.
 * The consuming app must call `setAuthProvider` to wire this up.
 */
export interface AuthProvider {
  getAccessToken: () => string | null;
  getPlatform: () => string | null;
  getTenantDomain: () => string | null;
  refreshToken: () => Promise<void>;
}

let _authProvider: AuthProvider | null = null;
let _apiEndpoint: string = "";

/**
 * Wire up the auth provider once at app bootstrap.
 */
export function setAuthProvider(provider: AuthProvider) {
  _authProvider = provider;
}

/**
 * Set the API base URL once at app bootstrap.
 */
export function setApiEndpoint(endpoint: string) {
  _apiEndpoint = endpoint;
}

function getAuthProvider(): AuthProvider {
  if (!_authProvider) {
    console.warn("[WorkflowAPI] AuthProvider not set — call setAuthProvider() at app init.");
    return {
      getAccessToken: () => null,
      getPlatform: () => null,
      getTenantDomain: () => null,
      refreshToken: async () => {},
    };
  }
  return _authProvider;
}

// ─────────────────────────────────────────────────────────────────────────────
// BaseApiService — mirrors Lead/api/base.ts but is self-contained
// ─────────────────────────────────────────────────────────────────────────────

export class BaseApiService {
  private defaultTimeout: number;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    originalRequest: () => Promise<any>;
  }> = [];

  constructor() {
    this.defaultTimeout = 30_000;
  }

  // ── Request Helpers ──────────────────────────────────────────────────────

  private getBaseURL(): string {
    return _apiEndpoint;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const auth = getAuthProvider();

    const token = auth.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const platform = auth.getPlatform();
    if (platform) headers["X-Platform"] = platform;

    const tenant = auth.getTenantDomain();
    if (tenant) headers["X-Tenant-Domain"] = tenant;

    return headers;
  }

  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith("http")
      ? url
      : `${this.getBaseURL()}${url}`;
    const headers = { ...this.getAuthHeaders(), ...config.headers };

    const requestConfig: RequestInit = {
      method: config.method || "GET",
      headers,
      signal: AbortSignal.timeout(config.timeout || this.defaultTimeout),
    };

    if (config.body && config.method !== "GET") {
      if (config.body instanceof FormData) {
        requestConfig.body = config.body;
        delete (requestConfig.headers as any)["Content-Type"];
      } else {
        requestConfig.body =
          typeof config.body === "string"
            ? config.body
            : JSON.stringify(config.body);
      }
    }

    try {
      const response = await fetch(fullUrl, requestConfig);

      if (response.status === 401) {
        return this.handleUnauthorized(() =>
          this.makeRequest(url, config)
        );
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }
      return data;
    } catch (error: any) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private async handleUnauthorized<T>(
    originalRequest: () => Promise<T>
  ): Promise<T> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      const auth = getAuthProvider();
      await auth.refreshToken();
      this.processQueue(null);
      return originalRequest();
    } catch (error) {
      this.processQueue(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject, originalRequest }) => {
      if (error) {
        reject(error);
      } else {
        resolve(originalRequest());
      }
    });
    this.failedQueue = [];
  }

  // ── HTTP Methods ─────────────────────────────────────────────────────────

  async get<T>(
    url: string,
    config: Omit<RequestConfig, "method" | "body"> = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: "GET" });
  }

  async post<T>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, "method"> = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "POST",
      body: data,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, "method"> = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "PUT",
      body: data,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, "method"> = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      ...config,
      method: "PATCH",
      body: data,
    });
  }

  async delete<T>(
    url: string,
    config: Omit<RequestConfig, "method"> = {}
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: "DELETE" });
  }
}
