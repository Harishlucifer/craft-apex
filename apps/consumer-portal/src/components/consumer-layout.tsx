import { NavLink, Outlet, Link } from "react-router-dom";
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
  { to: "/applications", label: "My applications", icon: "ri-file-text-line" },
  { to: "/loans", label: "My loans", icon: "ri-wallet-3-line" },
  { to: "/profile", label: "Profile", icon: "ri-user-line" },
];

import { useState } from "react";

export function ConsumerLayout() {
  const user = useAuthStore((s) => s.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-blue-50 border-b border-slate-200 shadow-sm z-20">
        <div className="mx-auto flex flex-col w-full max-w-5xl px-4 sm:px-6 pt-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">

            {/* Left side: Logo & Slogan */}
            <div className="flex items-center gap-4">
              <div className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <i className="ri-leaf-line text-3xl"></i>
              </div>
              <div className="flex flex-col justify-center">
                <Link
                  to="/applications"
                  className="text-[1.35rem] leading-tight font-black tracking-tight text-slate-900"
                >
                  {env.brandName}
                </Link>
                <span className="text-[13px] font-medium text-slate-500">
                  Your journey to financial freedom
                </span>
              </div>
            </div>

            {/* Right side: User Profile Card */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex bg-primary items-center gap-4 rounded-2xl border border-slate-100  text-white p-2.5 pr-4 shadow-sm transition-all hover:shadow-md hover:border-slate-200 focus:outline-none"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <i className="ri-user-3-fill text-xl"></i>
                </div>
                <div className="flex flex-col items-start pr-12">
                  <span className="text-[13px] font-extrabold text-slate-900 text-white">Welcome back!</span>
                  <span className="text-[12px] font-semibold  mt-0.5 text-white">
                    {user?.name ?? user?.mobile ?? "Guest"}
                  </span>
                </div>

                {/* Notification Bell */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-600 shadow-sm hover:bg-red-100 transition-all duration-300 cursor-pointer">
                  <i className="ri-notification-3-line text-xl"></i>

                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <i className="ri-user-settings-line text-lg"></i> Profile
                    </Link>
                    <Link
                      to="/logout"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <i className="ri-logout-circle-r-line text-lg"></i> Logout
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Modern Line Tabs) */}
          <nav className="flex w-full gap-8 px-2 mt-4 overflow-x-auto no-scrollbar">
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2.5 pb-4 pt-2 text-[14px] font-bold transition-all whitespace-nowrap ${isActive
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                      <i className={`${icon} text-[1.15rem]`}></i>
                    </div>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-[-1px] left-0 h-[3px] w-full rounded-t-md bg-primary"></span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
