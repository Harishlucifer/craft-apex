import { useQuery } from '@tanstack/react-query';
import { PlatformType } from '@repo/types/setup';
import { useAuthStore } from '../stores/auth';

interface UseSetupOptions {
  enabled?: boolean;
}

export const useSetup = ({ enabled = true }: UseSetupOptions = {}) => {
  const { fetchSetup, setupData, isLoading, error, platform, tenantDomain } = useAuthStore();

  const query = useQuery({
    queryKey: ['setup', platform, tenantDomain],
    queryFn: async () => {
      await fetchSetup(platform!, tenantDomain!);
      return useAuthStore.getState().setupData;
    },
    enabled: enabled && !!platform && !!tenantDomain,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    setupData: query.data || setupData,
    isLoading: query.isLoading || isLoading,
    error: query.error?.message || error,
    isError: query.isError,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

// Hook for getting platform-specific configuration
export const usePlatformConfig = (platform: PlatformType) => {
  const { setupData } = useAuthStore();
  
  if (!setupData) {
    return null;
  }

  const { system, tenant } = setupData;
  
  // Get platform-specific URLs from tenant config
  const getPortalUrl = () => {
    switch (platform) {
      case 'PARTNER_PORTAL':
        return tenant.PARTNER_PORTAL_URL;
      case 'EMPLOYEE_PORTAL':
        return tenant.EMPLOYEE_PORTAL_URL;
      case 'CUSTOMER_PORTAL':
        return tenant.CUSTOMER_PORTAL_URL;
      default:
        return system.domain_url;
    }
  };

  return {
    loginType: system.login_type,
    portalUrl: getPortalUrl(),
    branding: {
      logoUrl: system.logo_url,
      iconUrl: system.icon_url,
      faviconUrl: system.favicon_url,
      loginBackgroundUrl: system.login_background_url,
      registerBackgroundUrl: system.register_background_url,
      primaryColor: tenant.PRIMARY_COLOR,
      secondaryColor: tenant.SECONDARY_COLOR,
      tenantName: tenant.TENANT_NAME,
      tenantLogo: tenant.TENANT_LOGO,
      tenantIcon: tenant.TENANT_ICON,
      tenantFavicon: tenant.TENANT_FAVICON,
    },
    tenant: {
      code: tenant.TENANT_CODE,
      name: tenant.TENANT_NAME,
      type: tenant.TENANT_TYPE,
    },
    features: {
      territoryEnabled: tenant.TERRITORY_ENABLED === 'YES',
      mobileMaskEnabled: tenant.APPLICATION_MOBILE_MASK_ENABLED === 'YES',
      spoofOtpCode: tenant.TENANT_SPOOF_OTP_CODE,
    },
  };
};