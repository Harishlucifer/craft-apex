import { NavLink, Outlet, Link } from "react-router-dom";
import { FileText, LogOut, User, Wallet } from "lucide-react";
import { useAuthStore } from "@craft-apex/auth";
import { env } from "@/env";

/**
 * The consumer shell.
 *
 * Deliberately NOT @craft-apex/layout: that shell renders a sidebar from the
 * backend module tree, and CUSTOMER_PORTAL users have no role and no module
 * tree (alpha-api skips the role lookup for UserTypeCustomer). So navigation
 * here is a fixed, hand-written set of self-service destinations.
 */
const NAV = [
  { to: "/applications", label: "My applications", icon: FileText },
  { to: "/loans", label: "My loans", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
];

export function ConsumerLayout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/applications"
            className="text-base font-semibold tracking-tight text-slate-900"
          >
            {env.brandName}
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user?.name ?? user?.mobile ?? ""}
            </span>
            <Link
              to="/logout"
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-5xl gap-1 px-4 sm:px-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
