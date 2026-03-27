"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSetupStore, axiosInstance } from "@craft-apex/auth";
import {
  SearchOption,
  FullScreenToggle,
  NotificationDropdown,
  ProfileDropdown,
  setHeaderAxios,
} from "@craft-apex/layout";
import "remixicon/fonts/remixicon.css";

/* ------------------------------------------------------------------ */
/*  Employee Portal – Header Bar                                       */
/* ------------------------------------------------------------------ */

export function EmployeeHeader() {
  const router = useRouter();
  const { user, tenant } = useSetupStore();

  // Inject the shared axios instance so header hooks can make API calls
  useEffect(() => {
    setHeaderAxios(axiosInstance);
  }, []);

  const formatDate = (dateValue: unknown) => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue as string);
      if (isNaN(date.getTime())) return String(dateValue);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(dateValue);
    }
  };

  const handleSearch = (query: string, searchType: string) => {
    console.log("Search:", { query, searchType });
    // TODO: Implement search navigation based on searchType
  };

  return (
    <div className="flex h-full w-full items-center gap-3 px-4">
      {/* ── Back button ── */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* ── Brand logo ── */}
      {tenant?.TENANT_LOGO ? (
        <img
          src={tenant.TENANT_LOGO as string}
          alt="Logo"
          className="h-8 shrink-0 object-contain"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
          <span className="text-sm font-bold">
            {((tenant?.TENANT_NAME as string) ?? "E")[0]}
          </span>
        </div>
      )}

      {/* ── Search bar with dynamic search types ── */}
      <SearchOption onSearch={handleSearch} />

      {/* ── Right section ── */}
      <div className="flex items-center gap-2">
        {/* Business date */}
        {!!tenant?.BUSINESS_DATE && (
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Business Date
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {formatDate(tenant.BUSINESS_DATE as string)}
            </span>
          </div>
        )}

        {/* Fullscreen toggle */}
        <FullScreenToggle />

        {/* Notification dropdown */}
        <NotificationDropdown />

        {/* Profile dropdown */}
        <ProfileDropdown
          username={user?.username}
          email={user?.email}
          userType={user?.user_type}
          isAdmin={user?.is_admin}
          onNavigate={(href) => router.push(href)}
          onLogout={() => router.push("/logout")}
        />
      </div>
    </div>
  );
}
