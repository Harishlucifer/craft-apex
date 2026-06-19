import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Zap,
  LineChart,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { useModuleStore, type ModuleNode } from "@craft-apex/layout";
import { toast } from "@craft-apex/ui";
import { LanguageSwitcher, useTranslation } from "@craft-apex/i18n";
import { env } from "@/env";
import { useLogin } from "./login.api";

// Brand palette taken from the logo mark.
const NAVY = "#1E2A6B";
const NAVY_DEEP = "#141C4A";
const GREEN = "#5FDD98";
const BLUE = "#4C7DF0";

/** The logo mark — recreated as its block grid. */
function BrandMark({ cell = 14, gap = 5 }: { cell?: number; gap?: number }) {
  const layout: (string | null)[] = [
    NAVY, GREEN, GREEN,
    NAVY, BLUE, null,
    BLUE, null, null,
  ];
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(3, ${cell}px)`, gap }}
    >
      {layout.map((c, i) => (
        <div
          key={i}
          style={{
            width: cell,
            height: cell,
            borderRadius: Math.max(2, cell * 0.22),
            backgroundColor: c ?? "transparent",
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const setModules = useModuleStore((s) => s.setModules);
  const { mutateAsync, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const { t } = useTranslation("login");

  const schema = z.object({
    email: z.string().min(1, t("pleaseEnterEmail")),
    password: z.string().min(1, t("pleaseEnterPassword")),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await mutateAsync(values);

      if (res.sessionConflict) {
        toast.error(t("sessionConflict"));
        return;
      }
      if (!res.user?.access_token) {
        toast.error(res.message ?? t("loginFailed"));
        return;
      }

      setSession(res.user);
      if (Array.isArray(res.module)) {
        setModules(res.module as ModuleNode[]);
      }

      const from = (location.state as { from?: { pathname: string } } | null)
        ?.from?.pathname;
      const target = res.change_password
        ? "/change-password"
        : (from ?? res.user.default_route ?? "/dashboard");
      navigate(target, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loginFailed"));
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 py-3 ps-11 pe-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4C7DF0] focus:bg-white focus:ring-4 focus:ring-[#4C7DF0]/15";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — brand panel */}
      <div
        className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -start-32 -top-32 h-[30rem] w-[30rem] rounded-full blur-[120px]"
            style={{ backgroundColor: `${BLUE}55` }}
          />
          <div
            className="absolute -bottom-40 end-0 h-[28rem] w-[28rem] rounded-full blur-[120px]"
            style={{ backgroundColor: `${GREEN}40` }}
          />
          <div
            className="absolute start-1/3 top-1/2 h-72 w-72 rounded-full blur-[110px]"
            style={{ backgroundColor: `${BLUE}33` }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "46px 46px",
            }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <BrandMark cell={14} gap={5} />
          <span className="text-xl font-semibold tracking-tight text-white">
            {env.brandName}
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            {t("tagline")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300/80">
            {t("subTagline")}
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Zap, text: t("feature1") },
              { icon: LineChart, text: t("feature2") },
              { icon: ShieldCheck, text: t("feature3") },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: GREEN }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-slate-200/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-400/70">
          © {new Date().getFullYear()} {env.brandName}. {t("copyright")}
        </p>
      </div>

      {/* Right — form */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        {/* soft brand wash */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -end-24 -top-24 h-72 w-72 rounded-full blur-[110px]"
            style={{ backgroundColor: `${BLUE}14` }}
          />
          <div
            className="absolute -bottom-24 -start-10 h-72 w-72 rounded-full blur-[110px]"
            style={{ backgroundColor: `${GREEN}14` }}
          />
        </div>

        {/* Language switcher — top-right of the form pane */}
        <div className="absolute end-4 top-4 z-10">
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
            {/* accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${NAVY}, ${BLUE}, ${GREEN})`,
              }}
            />

            <div className="px-8 py-9 sm:px-10">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrandMark cell={11} gap={4} />
                  <span className="text-base font-semibold tracking-tight text-slate-900">
                    {env.brandName}
                  </span>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: `${GREEN}1f`, color: "#0f7a4d" }}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {t("secure")}
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t("welcomeBack")}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                {t("signInToContinue")}
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    {t("emailLabel")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      autoComplete="username"
                      placeholder={t("emailPlaceholder")}
                      className={inputClass}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-xs text-rose-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {t("passwordLabel")}
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.message(t("forgotNotConfigured"))}
                      className="text-xs font-medium transition hover:opacity-80"
                      style={{ color: BLUE }}
                    >
                      {t("forgot")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={t("passwordPlaceholder")}
                      className={`${inputClass} pe-11`}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? t("hidePassword") : t("showPassword")
                      }
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-xs text-rose-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                    style={{ accentColor: BLUE }}
                  />
                  {t("rememberMe")}
                </label>

                <button
                  type="submit"
                  disabled={isPending}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
                    boxShadow: `0 14px 26px -12px ${BLUE}90`,
                  }}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  )}
                  {isPending ? t("signingIn") : t("signIn")}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            {t("protectedArea")}
          </p>
        </div>
      </div>
    </div>
  );
}
