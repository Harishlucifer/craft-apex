import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@repo/shared-state/store';
import { useSetup, usePlatformConfig } from '@repo/shared-state/hooks';
import { LoginForm } from '@repo/ui/auth/login-form';
import { Card } from '@repo/ui/card';
import { applyTenantBranding } from '../utils/branding';

export function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const { setupData, isLoading: setupLoading, error: setupError } = useSetup({
    platform: 'EMPLOYEE_PORTAL',
    tenantDomain: window.location.hostname
  });
  const platformConfig = usePlatformConfig('EMPLOYEE_PORTAL');
  
  // State for alerts and timer
  const [successAlert, setSuccessAlert] = useState<string>('');
  const [errorAlert, setErrorAlert] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [progress, setProgress] = useState<boolean>(false);

  // Timer effect for OTP resend
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | undefined;
    if (timerSeconds > 0 && resendDisabled) {
      timerInterval = setInterval(() => {
        setTimerSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (timerSeconds === 0 && resendDisabled) {
      if (timerInterval) clearInterval(timerInterval);
      setResendDisabled(false);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerSeconds, resendDisabled]);

  // Apply tenant branding when platform config is loaded
  useEffect(() => {
    if (platformConfig?.branding) {
      applyTenantBranding({
        tenantName: platformConfig.branding.tenantName,
        logoUrl: platformConfig.branding.logoUrl,
        primaryColor: platformConfig.branding.primaryColor,
        loginBackgroundUrl: platformConfig.branding.loginBackgroundUrl,
      });
    }
  }, [platformConfig]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while fetching setup
  if (setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if setup failed
  if (setupError) {
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

  const handleLogin = async (credentials: any) => {
    try {
      setProgress(true);
      setErrorAlert('');
      
      // Simulate API call - in real app, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      login({
        id: '2',
        name: 'Employee User',
        email: credentials.mobile + '@employee.com',
        role: 'employee'
      });
      
      setSuccessAlert('Login successful!');
    } catch (error) {
      setErrorAlert('Login failed. Please try again.');
    } finally {
      setProgress(false);
    }
  };

  const handleSendOtp = async (mobile: string) => {
    try {
      setProgress(true);
      setErrorAlert('');
      
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessAlert('OTP sent successfully!');
      setTimerSeconds(30);
      setResendDisabled(true);
      
      console.log('OTP sent to:', mobile);
    } catch (error) {
      setErrorAlert('Failed to send OTP. Please try again.');
    } finally {
      setProgress(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12">
          <div className="row">
            <div className="col-lg-12" style={{ marginTop: '7vh' }}>
              <Card title="Employee Portal Login" className="overflow-hidden">
                <div className="row g-0">
                  {/* Left side - Auth Slider/Image */}
                  <div className="d-none d-lg-block col-lg-6">
                    <div 
                      className="h-100 bg-cover bg-center position-relative"
                      style={{
                        backgroundImage: platformConfig?.branding?.loginBackgroundUrl 
                          ? `url(${platformConfig.branding.loginBackgroundUrl})` 
                          : 'url("https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
                        minHeight: '500px'
                      }}
                    >
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-40 d-flex flex-column justify-content-between p-4">
                        <div>
                          {platformConfig?.branding?.logoUrl && (
                            <img 
                              src={platformConfig.branding.logoUrl} 
                              alt={platformConfig.branding.tenantName || 'Logo'} 
                              className="img-fluid"
                              style={{ height: '50px' }}
                            />
                          )}
                        </div>
                        <div className="text-white">
                          <h1 className="display-4 fw-bold mb-3">
                            {platformConfig?.branding?.tenantName || 'Welcome'}
                          </h1>
                          <p className="fs-5 opacity-75">
                            Employee Portal Access
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Login Form */}
                  <div className="col-lg-6 min-vh-50 my-auto">
                    <div className="p-lg-5 p-4">
                      <div className="d-flex flex-column justify-content-between align-items-start" style={{ height: '100%' }}>
                        <h5 className="text-primary mb-2">Welcome back to</h5>
                        {platformConfig?.branding?.logoUrl && (
                          <img 
                            height="50vh" 
                            src={platformConfig.branding.logoUrl}
                            alt={platformConfig.branding.tenantName || 'Logo'}
                          />
                        )}
                      </div>

                      <div className="mt-4">
                        <LoginForm
                          loginType={setupData?.system?.login_type || 'OTP'}
                          onSubmit={handleLogin}
                          onSendOtp={handleSendOtp}
                          isLoading={progress}
                          error={errorAlert}
                        />
                        
                        {/* Timer display */}
                        {resendDisabled && (
                          <div
                            className="text-danger mt-4 mb-0 p-3 bg-primary text-white"
                            style={{
                              borderRadius: '50%',
                              width: '50px',
                              height: '50px',
                              textAlign: 'center',
                              lineHeight: '20px',
                              alignItems: 'center',
                              margin: 'auto'
                            }}
                          >
                            {timerSeconds}
                          </div>
                        )}
                        
                        {/* Success/Error alerts */}
                        {successAlert && (
                          <div className="alert alert-success mt-3">{successAlert}</div>
                        )}
                        {errorAlert && (
                          <div className="alert alert-danger mt-3">{errorAlert}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center p-3">
              <p className="mb-0 text-muted">
                © {new Date().getFullYear()} {platformConfig?.branding?.tenantName || 'Employee Portal'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}