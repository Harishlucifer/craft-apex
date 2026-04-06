import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProtected } from "@craft-apex/auth";
import { EmployeeLayout } from "@/components/employee-layout";

/* ------------------------------------------------------------------ */
/*  Lazy-loaded pages                                                  */
/* ------------------------------------------------------------------ */

import { lazy, Suspense } from "react";

const LoginPage = lazy(() => import("@/pages/login"));
const LogoutPage = lazy(() => import("@/pages/logout"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const LeadListPage = lazy(() => import("@/pages/lead/list"));
const LeadCreatePage = lazy(() => import("@/pages/lead/create"));
const LosLoginInitiatePage = lazy(() => import("@/pages/los/login-initiate"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const ChangePasswordPage = lazy(() => import("@/pages/change-password"));
const ShareableLinksPage = lazy(() => import("@/pages/shareable-links"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

/* ------------------------------------------------------------------ */
/*  Suspense fallback                                                  */
/* ------------------------------------------------------------------ */

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout wrappers                                                    */
/* ------------------------------------------------------------------ */

/** Auth layout – no sidebar, just renders the page */
function AuthLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

/** App layout – sidebar + AuthProtected guard */
function AppLayout() {
  return (
    <AuthProtected loginRoute="/login">
      <EmployeeLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </EmployeeLayout>
    </AuthProtected>
  );
}

/* ------------------------------------------------------------------ */
/*  Route definitions                                                  */
/* ------------------------------------------------------------------ */

export function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route index element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes (no sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="logout" element={<LogoutPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* App routes (sidebar + auth guard) */}
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="lead/list" element={<LeadListPage />} />
        <Route path="lead/create" element={<LeadCreatePage />} />
        <Route path="lead/create/:id" element={<LeadCreatePage />} />
        <Route path="los/login-initiate" element={<LosLoginInitiatePage />} />
        <Route path="los/login-initiate/:id" element={<LosLoginInitiatePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="shareable-links" element={<ShareableLinksPage />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
