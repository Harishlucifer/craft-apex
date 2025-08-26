import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserData, SetupData, PlatformType } from '@repo/types/setup';
import { setupApiService, authApiService } from '../api';

interface LoginCredentials {
  mobile: string;
  otp?: string;
  password?: string;
}

interface AuthStore {
  // State
  isAuthenticated: boolean;
  user: UserData | null;
  setupData: SetupData | null;
  isLoading: boolean;
  isLoginLoading: boolean;
  error: string | null;
  platform: PlatformType | null;
  tenantDomain: string | null;
  
  // Actions
  setSetupData: (data: SetupData) => void;
  setUser: (user: UserData) => void;
  setLoading: (loading: boolean) => void;
  setLoginLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: { mobile: string; password?: string; otp?: string }) => Promise<void>;
  logout: () => void;
  fetchSetup: (platform: PlatformType, tenantDomain: string) => Promise<void>;
  sendOtp: (mobile: string) => Promise<void>;
  clearError: () => void;
  setPlatform: (platform: PlatformType) => void;
  setTenantDomain: (domain: string) => void;
}

export const useAuthStore = create<AuthStore>()(  
  devtools(
    persist(
      (set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  setupData: null,
  isLoading: false,
  isLoginLoading: false,
  error: null,
  platform: null,
  tenantDomain: null,
  
  // Actions
  setSetupData: (data: SetupData) => {
    set({ setupData: data });
  },
  
  setUser: (user: UserData) => {
    set({ user, isAuthenticated: true });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setLoginLoading: (loading: boolean) => {
    set({ isLoginLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  setPlatform: (platform: PlatformType) => {
    set({ platform });
  },
  
  setTenantDomain: (domain: string) => {
    set({ tenantDomain: domain });
  },
  
  fetchSetup: async (platform: PlatformType, tenantDomain: string) => {
    const { setLoading, setError, setSetupData, setPlatform, setTenantDomain } = get();
    
    try {
      setLoading(true);
      setError(null);
      setPlatform(platform);
      setTenantDomain(tenantDomain);
      
      const response = await setupApiService.fetchSetup(platform, tenantDomain);
      
      if (response.status === 1 && response.data) {
        setSetupData(response.data);
        
        // If user is already authenticated (not guest), set user data
        if (response.data.user.user_type !== 'GUEST') {
          set({ user: response.data.user, isAuthenticated: true });
        }
      } else {
        throw new Error('Setup API returned invalid response');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch setup data';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },
  
  sendOtp: async (mobile: string) => {
    const { platform, tenantDomain, setError } = get();
    
    if (!platform || !tenantDomain) {
      throw new Error('Platform or tenant domain not set');
    }
    
    try {
      setError(null);
      
      await authApiService.sendOtp(mobile, platform, tenantDomain);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
      throw error;
    }
  },
  
  login: async (credentials: { mobile: string; password?: string; otp?: string }) => {
    const { platform, tenantDomain, setError, setUser, setSetupData, setLoginLoading } = get();
    
    if (!platform || !tenantDomain) {
      const errorMessage = 'Platform or tenant domain not set';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    
    try {
      setLoginLoading(true);
      setError(null);
      
      const response = await authApiService.login(credentials, platform, tenantDomain);
      
      if (response.status === 1 && response.data) {
        // Store complete setup data including modules, system config, and tenant config
        setSetupData(response.data);
        // Set user data and mark as authenticated
        setUser(response.data.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      // Don't modify authentication state on error to prevent navigation loops
      throw error;
    } finally {
      setLoginLoading(false);
    }
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      setupData: null,
      error: null,
    });
  },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          setupData: state.setupData,
          platform: state.platform,
          tenantDomain: state.tenantDomain,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);