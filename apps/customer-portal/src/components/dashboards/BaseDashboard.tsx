import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { 
  Zap, 
  Users, 
  Shield, 
  Loader2,
  Clock,
  CreditCard,
  CheckCircle,
  DollarSign,
  FileText,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { DashboardProps, DashboardConfig } from './types';

interface BaseDashboardProps extends DashboardProps {
  config: DashboardConfig;
  children?: React.ReactNode;
}

export function BaseDashboard({ 
  config, 
  setupData, 
  children,
  onApplyForLoan,
  onContinueApplication
}: BaseDashboardProps) {


  
  // Feature mapping function
  const getFeatureDetails = (featureName: string) => {
    const featureMap: Record<string, { icon: any; title: string; description: string }> = {
      'Instant Approval': {
        icon: Zap,
        title: 'Instant Approval',
        description: 'Get loan approval in minutes with our automated eligibility system'
      },
      'Multiple Lenders': {
        icon: Users,
        title: 'Multiple Lenders',
        description: 'Compare offers from top banks and NBFCs to get the best deal'
      },
      'Secure Process': {
        icon: Shield,
        title: 'Secure Process',
        description: 'Bank-grade security with encrypted data transmission'
      },
      'Quick Disbursement': {
        icon: Clock,
        title: 'Quick Disbursement',
        description: 'Fast loan disbursement directly to your account'
      },
      'Competitive Rates': {
        icon: DollarSign,
        title: 'Competitive Rates',
        description: 'Starting from 8.5% per annum with flexible tenure options up to 6 years'
      },
      'Multiple Loan Types': {
        icon: CreditCard,
        title: 'Multiple Loan Types',
        description: 'Choose from various loan products tailored to your needs'
      },
      'Quick Approval': {
        icon: CheckCircle,
        title: 'Quick Approval',
        description: 'Get approved quickly with minimal documentation'
      },
      'Best Rates': {
        icon: DollarSign,
        title: 'Best Rates',
        description: 'Competitive interest rates across all loan categories'
      },
      'No Collateral': {
        icon: FileText,
        title: 'No Collateral',
        description: 'Unsecured loans with minimal documentation required'
      }
    };
    
    return featureMap[featureName] || {
      icon: CheckCircle,
      title: featureName,
      description: `Experience the benefits of ${featureName.toLowerCase()} with our platform`
    };
  };

  
  if (!setupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d5483]/10 to-[#2d5483]/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2d5483]" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 25px 25px, #2d5483 2px, transparent 0),
              radial-gradient(circle at 75px 75px, #2d5483 2px, transparent 0)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
      </div>

      {/* Geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right geometric shape */}
        <div className="absolute -top-40 -right-40 w-80 h-80 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-60 h-60 border-2 border-[#2d5483]/10 rounded-full"></div>
          <div className="absolute top-20 left-20 w-40 h-40 border border-[#2d5483]/5 rounded-full"></div>
        </div>
        
        {/* Bottom left geometric shape */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 opacity-5">
          <div className="w-full h-full bg-gradient-to-tr from-[#2d5483] to-[#1e3a5f] rounded-full blur-3xl"></div>
          <div className="absolute top-8 left-8 w-48 h-48 border-2 border-[#2d5483]/10 rounded-full"></div>
        </div>
        
        {/* Center floating elements */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#2d5483]/20 rounded-full animate-float"></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-[#2d5483]/15 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-[#2d5483]/25 rounded-full animate-pulse"></div>
      </div>



      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#2d5483]/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-[#2d5483]/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-[#2d5483] to-gray-900 bg-clip-text text-transparent">
                {config.heroTitle}
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up delay-200">
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
              {config.heroDescription}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-16 sm:mb-20 animate-fade-in-up delay-400 px-4 sm:px-0">
            <Button 
              size="lg" 
              onClick={onApplyForLoan}
              className="bg-[#2d5483] hover:bg-[#1e3a5f] text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {config.primaryCTA}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f] to-[#2d5483] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="absolute top-0 left-0 w-full h-0.5 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onContinueApplication}
              className="border-2 border-[#2d5483] text-[#2d5483] hover:bg-[#2d5483] hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {config.secondaryCTA}
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
              </span>
              <span className="absolute inset-0 bg-[#2d5483] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-[#2d5483]/3 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#2d5483]/10 rounded-full mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-[#2d5483] tracking-wide uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight px-4 sm:px-0">
              <span className="bg-gradient-to-r from-gray-900 to-[#2d5483] bg-clip-text text-transparent">
                Why Choose Our Loan Portal?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Experience seamless loan processing with our advanced platform designed for your convenience
            </p>
          </div>

          {/* Features Grid */}
          <div className="space-y-8 sm:space-y-12">
            {/* First Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {config.features.slice(0, 3).map((featureName, index) => {
                const feature = getFeatureDetails(featureName);
                return (
                  <div 
                    key={index} 
                    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-gray-100/50 hover:border-[#2d5483]/20 hover:shadow-2xl hover:shadow-[#2d5483]/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2d5483]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#2d5483]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#2d5483] group-hover:w-full transition-all duration-700 delay-100"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2d5483] group-hover:w-full transition-all duration-700 delay-200"></div>
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#2d5483]/10 to-[#2d5483]/5 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-gradient-to-br group-hover:from-[#2d5483] group-hover:to-[#1e3a5f] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                        <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2d5483] group-hover:text-white transition-all duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-[#2d5483] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Ripple effect on hover */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[#2d5483]/10 rounded-full group-hover:w-96 group-hover:h-96 transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Second Row - Responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {config.features.slice(3, 6).map((featureName, index) => {
                const feature = getFeatureDetails(featureName);
                return (
                  <div 
                    key={index + 3} 
                    className="group bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-gray-100/50 hover:border-[#2d5483]/20 hover:shadow-2xl hover:shadow-[#2d5483]/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    {/* Card background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2d5483]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-[#2d5483]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#2d5483] group-hover:w-full transition-all duration-700 delay-100"></div>
                    <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#2d5483] group-hover:w-full transition-all duration-700 delay-200"></div>
                    
                    <div className="relative z-10">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#2d5483]/10 to-[#2d5483]/5 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-gradient-to-br group-hover:from-[#2d5483] group-hover:to-[#1e3a5f] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                        <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2d5483] group-hover:text-white transition-all duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl"></div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-[#2d5483] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                    
                    {/* Ripple effect on hover */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-[#2d5483]/10 rounded-full group-hover:w-96 group-hover:h-96 transition-all duration-700 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-white via-gray-50/50 to-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#2d5483]/5 rounded-full blur-3xl transform translate-x-16 sm:translate-x-32 -translate-y-16 sm:-translate-y-32"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 animate-fade-in-up">
            <div className="flex items-center space-x-3 sm:space-x-4 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#2d5483] to-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#2d5483] transition-colors duration-300">
                  {config.brandName || 'Lendingstack'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Powering your financial future
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              <div className="flex space-x-4 sm:space-x-6">
                {['Privacy', 'Terms', 'Support'].map((link, index) => (
                  <a 
                    key={index} 
                    href="#" 
                    className="text-xs sm:text-sm text-gray-600 hover:text-[#2d5483] transition-all duration-300 hover:scale-105 relative group"
                  >
                    {link}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2d5483] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </a>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                © 2024 {config.brandName || 'Lendingstack'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}