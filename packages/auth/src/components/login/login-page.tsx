"use client";

import Link from "next/link";
import { LoginPassword } from "./login-password";
import { LoginOtp } from "./login-otp";
import { LoginMfa } from "./login-mfa";
import { LoginMfaMobile } from "./login-mfa-mobile";
import { LOGIN_TYPE } from "../../types/login";
import type { LoginConfig, LoginTypeValue } from "../../types/login";

/* ------------------------------------------------------------------ */
/*  LoginPage – full-page login with card layout                       */
/*  Renders the correct login form based on `loginType`.               */
/*                                                                      */
/*  Supported loginType values (from setup API system.login_type):     */
/*    PASSWORD            → email + password                           */
/*    OTP                 → email/mobile + OTP only                    */
/*    PASSWORD+OTP        → email + password → then OTP                */
/*    MOBILE+PASSWORD+OTP → mobile + password → then OTP               */
/* ------------------------------------------------------------------ */

interface LoginPageProps {
  /** Which login method to render */
  loginType: LoginTypeValue;
  /** Configuration passed down to the login form */
  config: LoginConfig;
}

export function LoginPage({ loginType, config }: LoginPageProps) {
  const renderForm = () => {
    switch (loginType) {
      case LOGIN_TYPE.OTP:
        return <LoginOtp config={config} />;
      case LOGIN_TYPE.PASSWORD_AND_OTP:
        return <LoginMfa config={config} />;
      case LOGIN_TYPE.MOBILE_PASSWORD_OTP:
        return <LoginMfaMobile config={config} />;
      case LOGIN_TYPE.PASSWORD:
      default:
        return <LoginPassword config={config} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* ═══════════════════ Left Panel ═══════════════════ */}
          <div className="relative hidden overflow-hidden lg:block m-3 rounded-2xl">
            {/* Background image / gradient */}
            {config.backgroundUrl ? (
              <>
                <div
                  className="absolute inset-0 rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${config.backgroundUrl})` }}
                />
                {/* Dark gradient overlay for text readability */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)",
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                {/* Base dark gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, #0a0a1a 0%, #0f0520 15%, #1a0a3e 30%, #3b0764 50%, #be185d 70%, #7c3aed 85%, #06b6d4 100%)",
                  }}
                />
                {/* Luminous wave overlay */}
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    background:
                      "radial-gradient(ellipse at 20% 100%, rgba(236,72,153,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(56,189,248,0.35) 0%, transparent 45%), radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.3) 0%, transparent 40%)",
                  }}
                />
                {/* Shimmering streaks */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent 20%, rgba(236,72,153,0.2) 35%, rgba(168,85,247,0.15) 50%, rgba(56,189,248,0.2) 65%, transparent 80%)",
                  }}
                />
              </div>
            )}

            {/* Text overlay at bottom */}
            <div className="relative z-10 flex h-full flex-col justify-end p-10 pb-12">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
                A wise quote
                <span className="inline-block h-px w-12 bg-white/30" />
              </p>
              <h2
                className="text-[44px] font-bold leading-[1.05] tracking-tight text-white"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                Get
                <br />
                Everything
                <br />
                You Want
              </h2>
              <p className="mt-5 max-w-[300px] text-[13px] leading-relaxed text-white/50">
                You can get everything you want if you work hard, trust the
                process, and stick to the plan.
              </p>
            </div>
          </div>

          {/* ═══════════════════ Right Panel ═══════════════════ */}
          <div className="flex flex-col px-8 py-8 sm:px-12 lg:px-14">
            {/* ── Top: Logo ── */}
            <div className="flex justify-center">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.brandName ?? "Logo"}
                  className="h-9 object-contain"
                />
              ) : config.brandName ? (
                <span className="text-lg font-bold text-foreground">
                  {config.brandName}
                </span>
              ) : null}
            </div>

            {/* ── Center: Form ── */}
            <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center">
              {/* Heading */}
              <div className="mb-8 text-center">
                <h1
                  className="text-[32px] font-bold italic text-foreground"
                  style={{
                    fontFamily:
                      "'Georgia', 'Times New Roman', 'Palatino', serif",
                  }}
                >
                  Welcome Back
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and password to access your account
                </p>
              </div>

              {/* Dynamic login form */}
              {renderForm()}

              {/* Sign-up link */}
              {config.signupRoute && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={config.signupRoute}
                      className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                    >
                      {config.signupLabel ?? "Sign Up"}
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* ── Bottom: Brand footer ── */}
            <div className="mt-6 space-y-1 text-center">
              <a
                href="https://lendingstack.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
              >
                <span className="text-xs text-muted-foreground">
                  Powered By :
                </span>
                {/* Lendingstack inline brand mark */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="inline-block"
                >
                  <rect
                    x="2"
                    y="4"
                    width="10"
                    height="16"
                    rx="2"
                    fill="#0ea5e9"
                  />
                  <rect
                    x="8"
                    y="8"
                    width="14"
                    height="12"
                    rx="2"
                    fill="#16a34a"
                    opacity="0.85"
                  />
                </svg>
                <span className="text-xs font-bold text-[#1e3a5f]">
                  Lendingstack
                </span>
              </a>
              <p className="text-[11px] text-muted-foreground">
                &copy; {new Date().getFullYear()} Inforvio Technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
