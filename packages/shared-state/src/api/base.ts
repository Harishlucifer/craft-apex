import { PlatformType } from '@repo/types/setup';
import { getApiEndpoint } from '../config';
import { useAuthStore } from '../stores/auth';

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
  result?:T
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
}

export class BaseApiService {
  private baseURL: string;
  private defaultTimeout: number;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    originalRequest: () => Promise<any>;
  }> = [];

  constructor() {
    this.baseURL = ''; // Will be set when needed
    this.defaultTimeout = 30000;
  }

  private getBaseURL(): string {
    if (!this.baseURL) {
      this.baseURL = getApiEndpoint();
    }
    return this.baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const authStore = useAuthStore.getState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include bearer token if available
    if (authStore.user?.access_token) {
      headers['Authorization'] = `Bearer ${authStore.user.access_token}`;
    }

    if (authStore.platform) {
      headers['X-Platform'] = authStore.platform;
    }

    if (authStore.tenantDomain) {
      headers['X-Tenant-Domain'] = authStore.tenantDomain;
    }

    return headers;
  }

  private getSetupAuthHeaders(): Record<string, string> {
    const authStore = useAuthStore.getState();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only include bearer token when both conditions are met:
    // 1. The user value is not null
    // 2. The user type is not GUEST
    if (authStore.user !== null && 
        authStore.user?.user_type !== 'GUEST' && 
        authStore.user?.access_token) {
      headers['Authorization'] = `Bearer ${authStore.user.access_token}`;
    }

    if (authStore.platform) {
      headers['X-Platform'] = authStore.platform;
    }

    if (authStore.tenantDomain) {
      headers['X-Tenant-Domain'] = authStore.tenantDomain;
    }

    return headers;
  }

  private async makeRequest<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.getBaseURL()}${url}`;
    const headers = { ...this.getAuthHeaders(), ...config.headers };
    
    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers,
      signal: AbortSignal.timeout(config.timeout || this.defaultTimeout),
    };

    if (config.body && config.method !== 'GET') {
      // Don't stringify FormData, let the browser handle it with the correct Content-Type
      if (config.body instanceof FormData) {
        requestConfig.body = config.body;
        // Remove Content-Type header to let the browser set it with the correct boundary
        if (requestConfig.headers) {
          delete (requestConfig.headers as any)['Content-Type'];
        }
      } else {
        requestConfig.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
      }
    }

    try {
      const response = await fetch(fullUrl, requestConfig);
      
      if (response.status === 401) {
        return this.handleUnauthorized(() => this.makeRequest(url, config));
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async handleUnauthorized<T>(originalRequest: () => Promise<T>): Promise<T> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      await useAuthStore.getState().refreshToken();
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

  // HTTP Methods
  async get<T>(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body: data });
  }

  async put<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body: data });
  }

  async patch<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body: data });
  }

  async delete<T>(url: string, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  async postSetup<T>(url: string, data?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.getBaseURL()}${url}`;
    const headers = { ...this.getSetupAuthHeaders(), ...config.headers };
    
    const requestConfig: RequestInit = {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(config.timeout || this.defaultTimeout),
    };

    if (data) {
      requestConfig.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, requestConfig);
      
      if (response.status === 401) {
        return this.handleUnauthorized(() => this.postSetup(url, data, config));
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error: any) {
      console.error('Setup API request failed:', error);
      throw error;
    }
  }

  private static instance: BaseApiService;

  static getInstance(): BaseApiService {
    if (!BaseApiService.instance) {
      BaseApiService.instance = new BaseApiService();
    }
    return BaseApiService.instance;
  }
}

export const baseApiService = BaseApiService.getInstance();