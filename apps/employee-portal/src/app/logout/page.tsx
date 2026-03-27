"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@craft-apex/auth/axios";
import { useSetupStore } from "@craft-apex/auth";

/* ------------------------------------------------------------------ */
/*  Logout Page                                                         */
/*                                                                      */
/*  1. Calls the logout API to invalidate the token on the server       */
/*  2. Clears all localStorage items                                    */
/*  3. Resets the Zustand store                                         */
/*  4. Calls setup API to get a fresh guest token                       */
/*  5. Redirects to /login                                              */
/* ------------------------------------------------------------------ */

export default function LogoutPage() {
  const router = useRouter();
  const { reset } = useSetupStore();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      // Call server logout API to invalidate the token
      await axiosInstance.get("/alpha/v2/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    }

    // Clear all auth-related data from localStorage
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("module");
    localStorage.removeItem("privilege");
    localStorage.removeItem("guestToken");
    localStorage.removeItem("tenant");

    // Reset Zustand store
    reset();

    // Remove Authorization header from axios defaults
    delete axiosInstance.defaults.headers.common["Authorization"];

    // Re-call setup to get a fresh guest token
    try {
      const response = await axiosInstance.post("/alpha/v1/setup", {});
      const data = response?.data?.data;
      if (data?.user?.user_type === "GUEST") {
        localStorage.setItem("guestToken", data.user.access_token);
      }
      console.log("Setup re-initialized after logout");
    } catch (err) {
      console.error("Setup call failed after logout:", err);
    }

    // Redirect to login
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#2d5483]" />
        <span className="text-sm text-slate-500">Logging out…</span>
      </div>
    </div>
  );
}
