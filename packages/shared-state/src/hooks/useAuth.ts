import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth";
import { PlatformType } from "@repo/types/setup";

interface LoginCredentials {
  email?: string;
  mobile?: string;
  password?: string;
  otp?: string;
}

interface UseAuthOptions {
  platform?: PlatformType;
  tenantDomain?: string;
}

/**
 * Enhanced authentication hook that combines Zustand store with React Query
 * for optimal caching and persistence
 */
export const useAuth = (options?: UseAuthOptions) => {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    setupData,
    isLoading,
    isLoginLoading,
    error,
    platform,
    tenantDomain,
    loginWithOtp: loginWithOtpAction,
    loginWithPassword: loginWithPasswordAction,
    loginWithMFA: loginWithMFAAction,
    logout: logoutAction,
    clearError,
  } = useAuthStore();

  // Login with OTP mutation (handles both sending OTP and verifying OTP)
  const loginWithOtpMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await loginWithOtpAction({
        mobile: credentials.mobile!,
        otp: credentials.otp,
      });
      return useAuthStore.getState().user;
    },
    onSuccess: (user) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["setup"] });

      // Set user data in cache
      queryClient.setQueryData(["user", user?.id], user);
    },
    onError: (error) => {
      console.error("Login with OTP failed:", error);
    },
  });

  // Login with password mutation
  const loginWithPasswordMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await loginWithPasswordAction({
        email: credentials.email!,
        password: credentials.password!,
      });
      return useAuthStore.getState().user;
    },
    onSuccess: (user) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["setup"] });

      // Set user data in cache
      queryClient.setQueryData(["user", user?.id], user);
    },
    onError: (error) => {
      console.error("Login with password failed:", error);
    },
  });

  // Login with password mutation
  const loginWithMFAMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await loginWithMFAAction({
        email: credentials.email!,
        password: credentials.password!,
        otp: credentials.otp,
      });
      return useAuthStore.getState().user;
    },
    onSuccess: (user) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["setup"] });

      // Set user data in cache
      queryClient.setQueryData(["user", user?.id], user);
    },
    onError: (error) => {
      console.error("Login with password failed:", error);
    },
  });

  // Logout mutation with cleanup
  const logoutMutation = useMutation({
    mutationFn: async () => {
      logoutAction();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();

      // Optionally, you can be more selective:
      // queryClient.removeQueries({ queryKey: ['user'] });
      // queryClient.removeQueries({ queryKey: ['setup'] });
    },
  });

  // Query for current user (useful for refetching user data)
  const userQuery = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => Promise.resolve(user),
    enabled: !!user && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Auto-refresh setup data periodically
  const setupQuery = useQuery({
    queryKey: ["setup", platform, tenantDomain],
    queryFn: () => Promise.resolve(setupData),
    enabled: !!setupData && isAuthenticated,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  return {
    // State
    user: userQuery.data || user,
    isAuthenticated,
    setupData: setupQuery.data || setupData,
    isLoading: isLoading || userQuery.isLoading || setupQuery.isLoading,
    isLoginLoading:
      loginWithOtpMutation.isPending ||
      loginWithPasswordMutation.isPending ||
      loginWithMFAMutation.isPending ||
      isLoginLoading,
    isSendingOtp: loginWithOtpMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    error,
    platform,
    tenantDomain,

    // Actions
    logout: logoutMutation.mutateAsync,
    loginWithOtp: loginWithOtpMutation.mutateAsync,
    loginWithPassword: loginWithPasswordMutation.mutateAsync,
    loginWithMFA: loginWithMFAMutation.mutateAsync,
    clearError,

    // Query controls
    refetchUser: userQuery.refetch,
    refetchSetup: setupQuery.refetch,

    // Status flags
    isError:
      loginWithOtpMutation.isError ||
      loginWithPasswordMutation.isError ||
      userQuery.isError,
    isSuccess:
      loginWithOtpMutation.isSuccess ||
      loginWithPasswordMutation.isSuccess ||
      loginWithMFAMutation.isSuccess,
  };
};

/**
 * Hook for checking authentication status with automatic persistence
 */
export const useAuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isLoading,
    isGuest: !isAuthenticated || user?.user_type === "GUEST",
  };
};

/**
 * Hook for module-specific authentication checks
 */
export const useModuleAuth = (moduleId?: string) => {
  const { setupData, user, isAuthenticated } = useAuthStore();

  const hasModuleAccess = (moduleId: string) => {
    // Allow access if user has access token (including guest users) and setup data exists
    if (!user?.access_token || !setupData?.module) return false;

    return setupData.module.some(
      (module) =>
        module.module_id === moduleId && module.display_mode !== "HIDDEN"
    );
  };

  const getUserPermissions = (moduleId: string) => {
    if (!setupData?.module) return null;

    const module = setupData.module.find((m) => m.module_id === moduleId);
    return module?.allowed_permission || null;
  };

  return {
    hasAccess: moduleId ? hasModuleAccess(moduleId) : true,
    permissions: moduleId ? getUserPermissions(moduleId) : null,
    modules: setupData?.module || [],
  };
};

/**
 * Hook for session management
 */
export const useSession = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const refreshSession = async () => {
    // Invalidate all queries to force refetch
    await queryClient.invalidateQueries();
  };

  const clearSession = async () => {
    await logout();
  };

  return {
    refreshSession,
    clearSession,
  };
};
