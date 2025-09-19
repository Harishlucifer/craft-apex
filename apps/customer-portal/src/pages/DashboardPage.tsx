import { useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { useAuthStore } from '@repo/shared-state/stores';
import { usePlatformConfig, useSetup } from '@repo/shared-state/hooks';
import { applyTenantBranding } from '../utils/branding';
import { DashboardFactory } from '../components/dashboards';
import { 
  Zap, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export function DashboardPage() {
  const { isAuthenticated, logout } = useAuthStore();
  const platformConfig = usePlatformConfig('CUSTOMER_PORTAL');
  
  // Setup API integration
  const { setupData, isLoading: setupLoading, error: setupError, refetch } = useSetup();
  
  // Apply tenant branding when platform config is loaded
  useEffect(() => {
    if (platformConfig?.branding) {
      applyTenantBranding({
        tenantName: platformConfig.branding.tenantName,
        logoUrl: platformConfig.branding.logoUrl,
        primaryColor: '#2d5483', // Use the specified primary color
        loginBackgroundUrl: platformConfig.branding.loginBackgroundUrl,
      });
    }
  }, [platformConfig]);

  const handleLogout = () => {
    logout();
  };

  // Loading state
  if (setupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2d5483] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (setupError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Setup Error</h1>
          <p className="text-red-600 mb-6">Failed to load dashboard configuration</p>
          <Button 
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="w-full px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {setupData?.tenant?.TENANT_NAME || 'LendingStack'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Loan Facilitation Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              {isAuthenticated && (
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-[#2d5483] text-[#2d5483] hover:bg-[#2d5483] hover:text-white text-xs sm:text-sm px-3 sm:px-4"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Dashboard Content */}
      {setupData && (
        <DashboardFactory 
          setupData={setupData}
          platformConfig={platformConfig}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          onApplyForLoan={() => window.location.href = '/lead/create'}
          onContinueApplication={() => window.location.href = '/lead/create'}
        />
      )}
    </div>
  );
}