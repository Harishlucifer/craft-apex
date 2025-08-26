import { PlatformType } from '@repo/types/setup';

const AUTH_BASE_URL = 'https://apx-lender.lendingstack.in/alpha/v2';

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
  
  private getAuthHeaders(platform: PlatformType): Record<string, string> {
    return {
      'X-Platform': platform,
      'Content-Type': 'application/json',
    };
  }
  
  async login(credentials: LoginCredentials, platform: PlatformType, tenantDomain: string): Promise<LoginResponse> {
    const headers = this.getAuthHeaders(platform);
    
    try {
      // Use login-with-otp endpoint for OTP verification, otherwise use login endpoint
      const endpoint = '/auth/login-with-otp';
      const response = await fetch(`${AUTH_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      console.log("Login response :: ", data);
      
      if (!response.ok) {
        throw new Error(data.error || `Login API failed: ${response.status} ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    }
  }
  
  async sendOtp(mobile: string, platform: PlatformType, tenantDomain: string): Promise<OtpResponse> {
    const headers = this.getAuthHeaders(platform);
    
    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/login-with-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ mobile }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.status === -1) {
        throw new Error(data.error || `Send OTP API failed: ${response.status} ${response.statusText}`);
      }
      
      // Check for successful OTP send (status 6 indicates success)
      if (data.status !== 6) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      return data;
    } catch (error) {
      console.error('Send OTP API Error:', error);
      throw error;
    }
  }
  
  async logout(): Promise<void> {
    // TODO: Implement logout API call when endpoint is available
    // For now, this is a placeholder for future implementation
    console.log('Logout called - implement when API endpoint is available');
  }
  
  async refreshToken(): Promise<any> {
    // TODO: Implement token refresh when endpoint is available
    // For now, this is a placeholder for future implementation
    console.log('Token refresh called - implement when API endpoint is available');
  }
}

export const authApiService = AuthApiService.getInstance();