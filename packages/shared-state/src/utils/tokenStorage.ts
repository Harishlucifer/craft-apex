/**
 * Secure token storage utility
 * Handles authentication tokens with proper security measures
 */

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type?: string;
}

class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRES_KEY = 'token_expires_at';
  private static readonly TOKEN_TYPE_KEY = 'token_type';

  /**
   * Store authentication tokens securely
   */
  static setTokens(tokenData: Partial<TokenData>): void {
    try {
      if (tokenData.access_token) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.access_token);
      }
      
      if (tokenData.refresh_token) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refresh_token);
      }
      
      if (tokenData.expires_at) {
        localStorage.setItem(this.TOKEN_EXPIRES_KEY, tokenData.expires_at.toString());
      }
      
      if (tokenData.token_type) {
        localStorage.setItem(this.TOKEN_TYPE_KEY, tokenData.token_type);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get all tokens
   */
  static getTokens(): TokenData | null {
    try {
      const access_token = this.getAccessToken();
      const refresh_token = this.getRefreshToken();
      const expires_at = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
      const token_type = localStorage.getItem(this.TOKEN_TYPE_KEY);

      if (!access_token) {
        return null;
      }

      return {
        access_token,
        refresh_token: refresh_token || '',
        expires_at: expires_at ? parseInt(expires_at, 10) : undefined,
        token_type: token_type || 'Bearer'
      };
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
      if (!expiresAt) {
        return false; // If no expiry time, assume not expired
      }
      
      const expiryTime = parseInt(expiresAt, 10);
      const currentTime = Date.now() / 1000; // Convert to seconds
      
      return currentTime >= expiryTime;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return false;
    }
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Validate token format
   */
  static isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
}

export default TokenStorage;