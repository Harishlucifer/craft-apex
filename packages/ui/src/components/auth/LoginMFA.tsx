import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { SetupData } from "@repo/types/setup"
import { useState, useEffect } from "react"
import { useAuthStore } from "@repo/shared-state/stores"
import { toast } from "sonner"

interface LoginFormProps extends React.ComponentProps<"div"> {
  setupData?: SetupData | null;
  platformConfig?: any;
}

type LoginStep = 'email' | 'otp';

interface LoginState {
  email: string;
  password: string;
  otp: string;
  step: LoginStep;
  isLoading: boolean;
}

export function LoginMFAForm({
  className,
  setupData,
  platformConfig,
  ...props
}: LoginFormProps) {
  const [loginState, setLoginState] = useState<LoginState>({
    email: '',
    otp: '',
    step: 'email',
    isLoading: false,
    password: ''
  });
  
  const { loginWithMFA, clearError, isLoginLoading } = useAuthStore();
  
  // Clear any existing errors when component mounts or step changes
  useEffect(() => {
    clearError();
  }, [loginState.step, clearError]);
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginState.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoginState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await loginWithMFA({ email: loginState.email, password: loginState.password });
      toast.success('OTP sent successfully');
      setLoginState(prev => ({ ...prev, step: 'otp', isLoading: false }));
    } catch (error: any) {
      console.error('Send OTP Error:', error);
      toast.error(error.message || 'Failed to send OTP');
      setLoginState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginState.otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }
    
    try {
      await loginWithMFA({
        email: loginState.email,
        password: loginState.password,
        otp: loginState.otp
      });
      
      toast.success('Login successful');
      
      // Navigate to dashboard using React Router
      // navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Login Error:', error);
      toast.error(error.message || 'Invalid OTP');
      // Clear OTP field but stay on OTP step for better UX
      setLoginState(prev => ({ ...prev, otp: '' }));
    }
  };
  
  const handleBackToMobile = () => {
    setLoginState(prev => ({ ...prev, step: 'email', otp: '', isLoading: false }));
  };
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="bg-muted relative hidden md:block">
            <img
              src={platformConfig?.branding?.loginBackgroundUrl || "/placeholder.svg"}
              alt="Login Background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <form className="p-6 md:p-8" onSubmit={loginState.step === 'email' ? handleSendOtp : handleVerifyOtp}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start text-center">
                {platformConfig?.branding?.logoUrl && (
                  <img 
                    src={platformConfig.branding.logoUrl} 
                    alt={setupData?.tenant?.TENANT_NAME || 'Company'} 
                    className="h-12 w-auto mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  {loginState.step === 'email' 
                    ? `Login to your ${setupData?.tenant?.TENANT_NAME || 'Lendingstack'} account`
                    : `Enter the OTP send to registered mobile`
                  }
                </p>
              </div>
              
              {loginState.step === 'email' ? (
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginState.email}
                    onChange={(e) => setLoginState(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={loginState.isLoading || isLoginLoading}
                  />

                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginState.password}
                    onChange={(e) => setLoginState(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={loginState.isLoading || isLoginLoading}
                  />
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={loginState.otp}
                      onChange={(e) => setLoginState(prev => ({ ...prev, otp: e.target.value }))}
                      maxLength={4}
                      required
                      disabled={loginState.isLoading || isLoginLoading}
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToMobile}
                      className="text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                      disabled={loginState.isLoading || isLoginLoading}
                    >
                      Change mobile number
                    </button>
                  </div>
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={loginState.isLoading || isLoginLoading}>
                {(loginState.isLoading || isLoginLoading) 
                  ? (loginState.step === 'email' ? 'Sending OTP...' : 'Verifying...')
                  : (loginState.step === 'email' ? 'Send OTP' : 'Verify OTP')
                }
              </Button>
              
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/partner/create?partner_type=SOURCING" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
