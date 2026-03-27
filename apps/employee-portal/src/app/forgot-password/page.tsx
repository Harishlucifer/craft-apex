"use client";

import { ForgotPassword } from "@craft-apex/auth";
import type { LoginConfig } from "@craft-apex/auth";

export default function ForgotPasswordPage() {
  const config: LoginConfig = {
    platform: "EMPLOYEE_PORTAL",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xl">
        <ForgotPassword config={config} />
      </div>
    </div>
  );
}
