import {useEffect } from 'react';
import { Card } from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { useAuthStore } from '@repo/shared-state/stores';
import { usePlatformConfig, useSetup } from '@repo/shared-state/hooks';
import { applyTenantBranding } from '../utils/branding';
import { 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Star,
  TrendingUp,
  Award,
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

  // Allow access without authentication for demo purposes

  const handleApplyForLoan = () => {
    // Navigate to partner portal for loan application
    window.location.href = '/lead/create';
  };

  const handleContinueApplication = () => {
    // Navigate to continue existing application
    window.location.href = '/lead/create';
  };

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
      <div className="min-h-screen max-w-sm bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
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
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="w-full px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {setupData?.tenant?.TENANT_NAME || 'Ather Energy'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">EV Loan Facilitation Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Instant Approval
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Best Rates
                </span>
              </div>
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

      {/* Main Content */}
      <main className="w-full px-2 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#2d5483] via-[#3d6ba3] to-[#4d7bc3] bg-clip-text text-transparent mb-4 sm:mb-6">
              Finance Your Dream EV
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
              Get instant loan approval from multiple lenders with competitive rates. Start your 
              journey towards sustainable mobility with our streamlined application process.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto px-4">
              <Button 
                onClick={handleApplyForLoan}
                className="bg-gradient-to-r from-[#2d5483] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d5483] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex-1 group"
              >
                <span className="flex items-center justify-center gap-2">
                  💳 Apply for Loan
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                onClick={handleContinueApplication}
                variant="outline"
                className="border-2 border-[#2d5483] text-[#2d5483] hover:bg-[#2d5483] hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
              >
                🔄 Continue My Application
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12 lg:mb-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose Our Loan Portal?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto px-4">
              Experience the future of EV financing with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Instant Approval */}
            <Card className="p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Approval</h3>
              <p className="text-gray-600 leading-relaxed">
                Get loan approval in minutes with our AI-powered automated eligibility system. 
                No waiting, no hassle.
              </p>
            </Card>

            {/* Multiple Lenders */}
            <Card className="p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Lenders</h3>
              <p className="text-gray-600 leading-relaxed">
                Compare offers from 50+ top banks and NBFCs to get the best deal. 
                Maximum choice, minimum effort.
              </p>
            </Card>

            {/* Secure Process */}
            <Card className="p-8 text-center bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Process</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-grade security with 256-bit encryption and secure data transmission. 
                Your information is always protected.
              </p>
            </Card>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            <Card className="p-8 bg-gradient-to-br from-[#2d5483]/5 to-[#1e3a5f]/10 border-0 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Award-Winning Platform</h3>
                  <p className="text-gray-600">
                    Recognized as the best EV financing platform with over 95% customer satisfaction rate.
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 bg-gradient-to-br from-green-500/5 to-green-600/10 border-0 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Growing Community</h3>
                  <p className="text-gray-600">
                    Join thousands of satisfied customers who have financed their dream EVs through our platform.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-12 mt-16">
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {setupData?.tenant?.TENANT_NAME || 'Ather Energy'}
                </span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Leading the future of sustainable mobility with innovative EV financing solutions. 
                Making electric vehicles accessible to everyone.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>© 2024 All rights reserved</span>
                <span>•</span>
                <span>Made with ❤️ for a sustainable future</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-[#2d5483] transition-colors">Apply for Loan</a></li>
                <li><a href="#" className="hover:text-[#2d5483] transition-colors">Check Status</a></li>
                <li><a href="#" className="hover:text-[#2d5483] transition-colors">EMI Calculator</a></li>
                <li><a href="#" className="hover:text-[#2d5483] transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-600">
                <li>📞 1800-123-4567</li>
                <li>📧 support@atherenergy.com</li>
                <li>🕒 Mon-Fri 9AM-6PM</li>
                <li>📍 Bangalore, India</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}