import { useAuthStore } from '@repo/shared-state/stores';
import { PlatformType } from '@repo/types/setup';

// Unified OTP request interface that supports send, verify, and resend operations
export interface OtpRequest {
  name: string;
  mobile?: string;
  email?: string;
  notificationType: 'mobile' | 'email';
  template: string;
  type: 'APPLICATION_FLOW' | 'PARTNER_FLOW';
  // For OTP verification: Include the OTP code
  otp?: string;
  // For OTP resend: Include resend flag and retry type
  resend?: boolean;
  retry_type?: 'text';
}

// Legacy interfaces for backward compatibility
export interface OtpSendRequest {
  name: string;
  mobile?: string;
  email?: string;
  notificationType: 'mobile' | 'email';
  template: string;
  type: 'APPLICATION_FLOW' | 'PARTNER_FLOW';
}

export interface OtpVerifyRequest {
  name: string;
  mobile?: string;
  email?: string;
  otp: string;
  template: string;
  notificationType: 'mobile' | 'email';
  type: 'APPLICATION_FLOW' | 'PARTNER_FLOW';
}

// Unified response interface that handles all three operation types
export interface OtpResponse {
  status: number;
  message?: string;
  error?: string;
  data?: {
    reference_id?: string;
    expires_at?: string;
    verified?: boolean; // For verification responses
  };
}

// Legacy response interface for backward compatibility
export interface OtpSendResponse {
  status: number;
  message?: string;
  error?: string;
  data?: {
    reference_id?: string;
    expires_at?: string;
  };
}

// Verification-specific response interface
export interface OtpVerifyResponse {
  status: number;
  message?: string;
  error?: string;
  data?: {
    verified: boolean;
  };
}


export class NotificationAPI {
  private static instance: NotificationAPI;
  private apiUrl: string;
  private user: any;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_ENDPOINT;
    this.user = useAuthStore.getState().user;
  }

  public static getInstance(): NotificationAPI {
    if (!NotificationAPI.instance) {
      NotificationAPI.instance = new NotificationAPI();
    }
    return NotificationAPI.instance;
  }

  /**
   * Unified OTP method that handles send, verify, and resend operations
   * Action is determined based on payload parameters:
   * - For OTP verification: Include the OTP code in the payload
   * - For OTP resend: Include resend: true and retry_type: "text" in the payload
   * - For initial OTP send: Include neither of the above parameters
   */
  async handleOtp(request: OtpRequest): Promise<OtpResponse> {
    try {
      // Validate request
      if (request.notificationType === 'mobile' && !request.mobile) {
        throw new Error('Mobile number is required for mobile OTP');
      }
      if (request.notificationType === 'email' && !request.email) {
        throw new Error('Email is required for email OTP');
      }

      // Validate OTP for verification
      if (request.otp && request.otp.length !== 4) {
        throw new Error('OTP must be 4 digits');
      }

      // Build payload based on operation type
      const payload: any = {
        [request.notificationType]: request.notificationType === 'mobile' ? request.mobile : request.email,
        type: request.type,
        name: request.name,
        template: request.template,
      };

      // Add operation-specific parameters
      if (request.otp) {
        // OTP verification
        payload.otp = request.otp;
      } else if (request.resend && request.retry_type) {
        // OTP resend
        payload.resend = request.resend;
        payload.retry_type = request.retry_type;
      }
      // For initial send, no additional parameters needed

      const response = await fetch(`${this.apiUrl}/alpha/v1/notification/otp`, {
        method: 'POST',
        headers: {
          'X-Platform': 'CUSTOMER_PORTAL',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.user?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process OTP request');
      }

      const jsonResponse = await response.json();
      return {
        ...jsonResponse,
        status: response.status
      } as OtpResponse;
    } catch (error: any) {
      console.error('Error processing OTP request:', error);
      
      return {
        status: 500,
        error: error.message || 'Failed to process OTP request',
        message: 'An error occurred while processing OTP request'
      };
    }
  }

  /**
   * Send OTP to mobile or email (legacy method for backward compatibility)
   */
  async sendOtp(request: OtpSendRequest): Promise<OtpSendResponse> {
    const result = await this.handleOtp(request as OtpRequest);
    return result as OtpSendResponse;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(request: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    const result = await this.handleOtp(request as OtpRequest);
    return result as OtpVerifyResponse;
  }

  /**
   * Resend OTP to mobile or email
   */
  async resendOtp(request: Omit<OtpSendRequest, 'otp'>): Promise<OtpSendResponse> {
    const resendRequest: OtpRequest = {
      ...request,
      resend: true,
      retry_type: 'text'
    };
    const result = await this.handleOtp(resendRequest);
    return result as OtpSendResponse;
  }

}

// Export singleton instance
export const notificationAPI = NotificationAPI.getInstance();