"use client";

import { useRouter } from "next/navigation";
import { ForgotPassword, useSetupStore } from "@craft-apex/auth";
import type { LoginConfig } from "@craft-apex/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { system, tenant } = useSetupStore();

  const config: LoginConfig = {
    version: system?.other_data?.default_login_system ?? "v2",
    platform: "PARTNER_PORTAL",
    brandName: (tenant?.TENANT_NAME as string) ?? "Partner Portal",
    defaultRoute: "/dashboard",
    onNavigate: (path: string) => router.push(path),
  };

  return <ForgotPassword config={config} />;
}
