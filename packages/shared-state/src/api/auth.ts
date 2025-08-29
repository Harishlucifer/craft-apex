import { PlatformType } from "@repo/types/setup";
import { getApiEndpoint } from "../config";

export interface LoginCredentials {
  mobile: string;
  otp?: string;
  password?: string;
}

export interface LoginResponse {
  status: number;
  message?: string;
  error?: string;
  data?: any;
}

export interface OtpResponse {
  status: number;
  message?: string;
  error?: string;
}

export class AuthApiService {
  private static instance: AuthApiService;

  private constructor() {}

  public static getInstance(): AuthApiService {
    if (!AuthApiService.instance) {
      AuthApiService.instance = new AuthApiService();
    }
    return AuthApiService.instance;
  }

  private getAuthHeaders(platform: PlatformType, tenantDomain: string): Record<string, string> {
    return {
      "X-Platform": platform,
      "X-Tenant-Domain": tenantDomain,
      "Content-Type": "application/json",
    };
  }
  async loginWithMFA(
    requestPayload: Record<string, any>,
    platform: PlatformType,
    tenantDomain: string
  ): Promise<LoginResponse> {
    const headers = this.getAuthHeaders(platform, tenantDomain);

    try {
      const response = await fetch(`${getApiEndpoint()}/alpha/v2/auth/login-with-mfa`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      console.log("Login with OTP response :: ", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Login with OTP API failed: ${response.status} ${response.statusText}`
        );
      }

      // Handle different response scenarios based on payload content
      if (requestPayload.otp) {
        // OTP verification - expect successful login
        return data;
      } else {
        // OTP send - check for successful OTP send (status 6 indicates success)
        if (data.status < 0) {
          throw new Error(data.error || "Failed to send OTP");
        }
        if (data.status !== 6) {
          throw new Error(data.message || "Failed to send OTP");
        }
        return data;
      }
    } catch (error) {
      console.error("Login with OTP API Error:", error);
      throw error;
    }
  }
  async loginWithOtp(
    requestPayload: Record<string, any>,
    platform: PlatformType,
    tenantDomain: string
  ): Promise<LoginResponse> {
    const headers = this.getAuthHeaders(platform, tenantDomain);

    try {
      const response = await fetch(`${getApiEndpoint()}/alpha/v2/auth/login-with-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
      console.log("Login with OTP response :: ", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Login with OTP API failed: ${response.status} ${response.statusText}`
        );
      }

      // Handle different response scenarios based on payload content
      if (requestPayload.otp) {
        // OTP verification - expect successful login
        return data;
      } else {
        // OTP send - check for successful OTP send (status 6 indicates success)
        if (data.status === -1) {
          throw new Error(data.error || "Failed to send OTP");
        }
        if (data.status !== 6) {
          throw new Error(data.message || "Failed to send OTP");
        }
        return data;
      }
    } catch (error) {
      console.error("Login with OTP API Error:", error);
      throw error;
    }
  }

  async loginWithPassword(
    requestPayload: Record<string, any>,
    platform: PlatformType,
    tenantDomain: string
  ): Promise<LoginResponse> {
    const headers = this.getAuthHeaders(platform, tenantDomain);

    try {
      const response = await fetch(
        `${getApiEndpoint()}/alpha/v2/auth/login-with-password`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestPayload),
        }
      );

      const data = await response.json();
      console.log("Login with Password response :: ", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Login with Password API failed: ${response.status} ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("Login with Password API Error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // TODO: Implement logout API call when endpoint is available
    // For now, this is a placeholder for future implementation
    console.log("Logout called - implement when API endpoint is available");
  }

  async refreshToken(
    refreshToken: string,
    platform: PlatformType,
    tenantDomain: string
  ): Promise<LoginResponse> {
    const headers = this.getAuthHeaders(platform, tenantDomain);

    try {
      const response = await fetch(`${getApiEndpoint()}/alpha/v1/auth/refresh`, {
        method: "POST",
        headers,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      console.log("Refresh token response :: ", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Refresh token API failed: ${response.status} ${response.statusText}`
        );
      }

      if (data.status !== 1) {
        throw new Error(data.error || "Failed to refresh token");
      }

      return data;
    } catch (error) {
      console.error("Refresh token API Error:", error);
      throw error;
    }
  }
}

export const authApiService = AuthApiService.getInstance();
