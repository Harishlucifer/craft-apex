import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSetup, usePlatformConfig } from '@repo/shared-state/hooks';
import { useAuthStore } from '@repo/shared-state/stores';
import { LoginForm } from '../components/login-form';
import { applyTenantBranding, extractBrandingFromSetup } from '../utils/branding';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Get tenant domain from URL or environment
  const tenantDomain = window.location.hostname;
  
  const { setupData, isLoading, error } = useSetup({
    platform: 'PARTNER_PORTAL',
    tenantDomain,
  });
  
  const platformConfig = usePlatformConfig('PARTNER_PORTAL');
  
  // Apply tenant branding when setup data is available
  useEffect(() => {
    if (setupData) {
      const branding = extractBrandingFromSetup(setupData);
      applyTenantBranding(branding);
    }
  }, [setupData]);
  
  // Handle setup error with toast notification instead of blocking the page
  useEffect(() => {
    if (error) {
      toast.error(`Setup error: ${error}`);
    }
  }, [error]);
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show loading state
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
  
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm setupData={setupData} platformConfig={platformConfig} />
      </div>
    </div>
  );
}