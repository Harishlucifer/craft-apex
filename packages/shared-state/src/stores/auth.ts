import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { UserData, SetupData, PlatformType } from "@repo/types/setup";
import { SetupApiService, AuthApiService } from "../api";

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
  loginWithMFA: (credentials: {
    email: string;
    password: string;
    otp?: string;
  }) => Promise<void>;
  loginWithOtp: (credentials: {
    mobile: string;
    otp?: string;
  }) => Promise<void>;
  loginWithPassword: (credentials: {
    email: string;
    password: string;
  }) => Promise<void>;
  loginWithLink: (token: string, platform?: PlatformType) => Promise<void>;
  logout: () => void;
  fetchSetup: (platform: PlatformType, tenantDomain: string, token?: string) => Promise<void>;
  clearError: () => void;
  setPlatform: (platform: PlatformType) => void;
  setTenantDomain: (domain: string) => void;
  refreshToken: () => Promise<void>;
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
          const {
            setLoading,
            setError,
            setSetupData,
            setPlatform,
            setTenantDomain,
          } = get();

          try {
            setLoading(true);
            setError(null);
            setPlatform(platform);
            setTenantDomain(tenantDomain);

            const response = await SetupApiService.getInstance().fetchSetup(platform, tenantDomain);
            console.log('Setup data fetched successfully', response)
            if (response) {
              setSetupData(response.data);
              console.log('Setup data fetched successfully', response.data)
              // If user is already authenticated (not guest), set user data
              if (response.data.user.user_type !== "GUEST") {
                set({ user: response.data.user, isAuthenticated: true });
              }else {
                console.log('User is guest',response.data)
                set({ user: response.data.user, isAuthenticated: false });
              }
            } else {
              throw new Error("Setup API returned invalid response");
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch setup data";
            setError(errorMessage);
            throw error;
          } finally {
            setLoading(false);
          }
        },
        loginWithMFA: async (credentials: {
          email: string;
          password: string;
          otp?: string;
        }) => {
          const {
            platform,
            tenantDomain,
            setError,
            setUser,
            setSetupData,
            setLoginLoading,
          } = get();

          if (!platform || !tenantDomain) {
            const errorMessage = "Platform or tenant domain not set";
            setError(errorMessage);
            throw new Error(errorMessage);
          }

          try {
            setLoginLoading(true);
            setError(null);

            const response = await AuthApiService.getInstance().loginWithMFA(
              credentials,
              platform,
              tenantDomain
            );
            console.log("loginWithMFA response", response);
            if (!response.status) {
              throw new Error(response.error || "Login failed");
            }
            if (response.status&& response.data) {
              // Store complete setup data including modules, system config, and tenant config
              setSetupData(response.data);
              // Set user data and mark as authenticated
              setUser(response.data.user);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Login failed";
            // Don't modify authentication state on error to prevent navigation loops
            throw error;
          } finally {
            setLoginLoading(false);
          }
        },
        loginWithOtp: async (credentials: { mobile: string; otp?: string }) => {
          const {
            platform,
            tenantDomain,
            setError,
            setUser,
            setSetupData,
            setLoginLoading,
          } = get();

          if (!platform || !tenantDomain) {
            const errorMessage = "Platform or tenant domain not set";
            setError(errorMessage);
            throw new Error(errorMessage);
          }

          try {
            setLoginLoading(true);
            setError(null);

            const response = await AuthApiService.getInstance().loginWithOtp(
              credentials,
              platform,
              tenantDomain
            );
            // status -6 means OTP sent successfully, only treat -1 as error
            if (response.status === -1) {
              throw new Error(response.error || "Login failed");
            }
            if (response.status === 1 && response.data) {
              // Store complete setup data including modules, system config, and tenant config
              setSetupData(response.data);
              // Set user data and mark as authenticated
              setUser(response.data.user);
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Login failed";
            // Don't modify authentication state on error to prevent navigation loops
            throw error;
          } finally {
            setLoginLoading(false);
          }
        },
        loginWithPassword: async (credentials: {
          email: string;
          password: string;
        }) => {
          const {
            platform,
            tenantDomain,
            setError,
            setUser,
            setSetupData,
            setLoginLoading,
          } = get();

          if (!platform || !tenantDomain) {
            const errorMessage = "Platform or tenant domain not set";
            setError(errorMessage);
            throw new Error(errorMessage);
          }

          try {
            setLoginLoading(true);
            setError(null);

            const response = await AuthApiService.getInstance().loginWithPassword(
              credentials,
              platform,
              tenantDomain
            );
            
            if (response.status === 1 && response.data) {
              // Store complete setup data including modules, system config, and tenant config
              setSetupData(response.data);
              // Set user data and mark as authenticated
              setUser(response.data.user);
            } else {
              throw new Error("Login failed");
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Login failed";
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

        refreshToken: async () => {
          const { user, platform, tenantDomain, setUser, setError } = get();

          if (!user?.refresh_token || !platform || !tenantDomain) {
            const errorMessage = "Missing refresh token, platform, or tenant domain";
            setError(errorMessage);
            throw new Error(errorMessage);
          }

          try {
            setError(null);

            const response = await AuthApiService.getInstance().refreshToken(
              user.refresh_token,
              platform,
              tenantDomain
            );

            if (response.status === 1 && response.data?.access_token) {
              // Update user with new access token
              const updatedUser = {
                ...user,
                access_token: response.data.access_token,
              };
              setUser(updatedUser);
            } else {
              throw new Error("Failed to refresh token");
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Token refresh failed";
            setError(errorMessage);
            // On refresh failure, logout user
            set({
              isAuthenticated: false,
              user: null,
              setupData: null,
              error: errorMessage,
            });
            throw error;
          }
        },

        loginWithLink: async (token: string, platform: PlatformType = "EMPLOYEE_PORTAL") => {
          set({ isLoginLoading: true, error: null });

          try {
            const response = await AuthApiService.getInstance().loginWithLink(token, platform);

            if (response.status === 1 && response.data) {
              const { user, setup_data, access_token, refresh_token } = response.data;

              // Store tokens in localStorage
              if (access_token) {
                localStorage.setItem("access_token", access_token);
              }
              if (refresh_token) {
                localStorage.setItem("refresh_token", refresh_token);
              }

              set({
                isAuthenticated: true,
                user: user || null,
                setupData: setup_data || null,
                isLoginLoading: false,
                error: null,
              });
            } else {
              throw new Error(response.error || "Login with link failed");
            }
          } catch (error: any) {
            const errorMessage = error.message || "Login with link failed";
            console.error("Login with link error:", error);
            set({
              isLoginLoading: false,
              isAuthenticated: false,
              user: null,
              setupData: null,
              error: errorMessage,
            });
            throw error;
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          setupData: state.setupData,
          platform: state.platform,
          tenantDomain: state.tenantDomain,
        }),
      }
    ),
    { name: "auth-store" }
  )
);
