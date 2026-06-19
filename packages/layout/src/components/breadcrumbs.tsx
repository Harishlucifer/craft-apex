import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useMenuLabel, useTranslation } from "@craft-apex/i18n";
import { useModule } from "../use-module";

/**
 * Breadcrumbs driven by the resolved backend module:
 *   Home / <trail[0]> / <trail[1]> / … / <node.name>
 * Renders nothing if the current route isn't in the module tree (e.g. /profile),
 * except on /dashboard where it shows just "Home".
 */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const resolved = useModule();
  const { t } = useTranslation("layout");
  const ml = useMenuLabel();

  if (!resolved && pathname !== "/dashboard") return null;

  const crumbs: string[] = resolved
    ? [...resolved.trail, resolved.node.name]
    : [];

  return (
    <nav
      aria-label={t("breadcrumb")}
      className="flex items-center gap-1.5 text-sm text-slate-500"
    >
      <Link
        to="/dashboard"
        className="flex items-center gap-1 transition hover:text-slate-800"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{t("home")}</span>
      </Link>
      {crumbs.map((label, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${label}-${i}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 rtl:rotate-180" />
            <span
              className={
                last ? "font-semibold text-slate-800" : "text-slate-500"
              }
            >
              {ml(label)}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
