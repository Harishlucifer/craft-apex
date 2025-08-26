import type { 
  PlatformType, 
  UserData, 
  SystemConfig, 
  TenantConfig, 
  ModuleData, 
  ModulePermissions 
} from './setup';

export interface LoginCredentials {
  mobile: string;
  otp?: string;
  password?: string;
}

export interface AuthResponse {
  status: number;
  message?: string;
  error?: string;
  data?: AuthData;
}

export interface AuthData {
  change_password?: boolean;
  module: ModuleData[] | null;
  privilege: any | null;
  system: SystemConfig;
  tenant: TenantConfig;
  user: UserData;
}

export interface OtpResponse {
  status: number;
  message?: string;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  authData: AuthData | null;
  isLoading: boolean;
  isLoginLoading: boolean;
  error: string | null;
  platform: PlatformType | null;
  tenantDomain: string | null;
}

// Re-export commonly used types from setup for convenience
export type { 
  PlatformType, 
  UserData, 
  SystemConfig, 
  TenantConfig, 
  ModuleData, 
  ModulePermissions 
} from './setup';