import { useNavigate } from "react-router-dom";
import { LoginPage, LOGIN_TYPE, useSetupStore } from "@craft-apex/auth";
import type { LoginConfig, LoginTypeValue } from "@craft-apex/auth";

export default function LoginPageRoute() {
  const navigate = useNavigate();
  const { system, tenant } = useSetupStore();

  // Determine login type from setup API response (system.login_type)
  const rawLoginType = system?.login_type ?? "PASSWORD";
  const loginType = (
    Object.values(LOGIN_TYPE).includes(rawLoginType as LoginTypeValue)
      ? rawLoginType
      : LOGIN_TYPE.PASSWORD
  ) as LoginTypeValue;

  const config: LoginConfig = {
    version: system?.other_data?.default_login_system ?? "v2",
    platform: system?.system ?? "EMPLOYEE_PORTAL",
    brandName: (tenant?.TENANT_NAME as string) ?? "Employee Portal",
    logoUrl: (tenant?.TENANT_LOGO as string) ?? undefined,
    backgroundUrl: (system?.login_background_url as string) ?? undefined,
    hidePasswordReset:
      (system?.other_data?.hide_password_reset as boolean) ?? false,
    forgotPasswordRoute: "/forgot-password",
    defaultRoute: "/dashboard",
    onNavigate: (path) => navigate(path),
    onLoginSuccess: (payload) => {
      console.log("Login successful", payload);
    },
  };

  return <LoginPage loginType={loginType} config={config} />;
}
