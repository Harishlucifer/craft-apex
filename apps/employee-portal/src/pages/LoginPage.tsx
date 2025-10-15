import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSetup, usePlatformConfig } from "@repo/shared-state/hooks";
import { useAuthStore } from "@repo/shared-state/stores";
import { LoginForm } from "@repo/ui/components/auth";
import {
  applyTenantBranding,
  extractBrandingFromSetup,
} from "@repo/ui/utils/branding";
import { toast } from "sonner";

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const { setupData, isLoading, error } = useSetup();
  const platformConfig = usePlatformConfig("EMPLOYEE_PORTAL");

  // Apply tenant branding when setup data is available
  useEffect(() => {
    if (setupData) {
      const branding = extractBrandingFromSetup(setupData);
      applyTenantBranding(branding);
    }
  }, [setupData]);

  // Notify setup errors
  useEffect(() => {
    if (error) {
      toast.error(`Setup error: ${error}`);
    }
  }, [error]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading state while fetching setup
  if (isLoading) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if setup failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Setup Error</h1>
          <p className="text-red-600 mb-4">Failed to load application configuration</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show login form if setup is loaded
  if (!setupData || !platformConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No configuration available</p>
        </div>
      </div>
    );
  }

  // Get login type from system configuration
  const loginType = setupData?.system?.login_type || "PASSWORD";

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm
          loginType={loginType}
          setupData={setupData}
          platformConfig={platformConfig}
        />
      </div>
    </div>
  );
}