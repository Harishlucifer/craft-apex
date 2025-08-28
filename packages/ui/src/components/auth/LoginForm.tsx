import { LoginType } from "@repo/types/setup";
import { LoginOtpForm } from "./LoginOtp";
import { LoginPasswordForm } from "./LoginPassword";

export interface LoginFormProps {
  loginType: LoginType;
  setupData?: any;
  platformConfig?: any;
}

export const LoginForm = ({
  loginType,
  setupData,
  platformConfig,
}: LoginFormProps) => {
  // If we have setupData and platformConfig, render the appropriate form component
  if (setupData && platformConfig) {
    switch (loginType) {
      case "OTP":
        return (
          <LoginOtpForm setupData={setupData} platformConfig={platformConfig} />
        );
      case "PASSWORD":
        return (
          <LoginPasswordForm
            setupData={setupData}
            platformConfig={platformConfig}
          />
        );
      case "PASSWORD+OTP":
        // For PASSWORD+OTP, continue with the unified form below
        break;
      default:
        return (
          <LoginPasswordForm
            setupData={setupData}
            platformConfig={platformConfig}
          />
        );
    }
  }
};