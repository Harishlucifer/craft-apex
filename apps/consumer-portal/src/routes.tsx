import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@craft-apex/auth";
import { ConsumerLayout } from "@/components/consumer-layout";
import LoginPage from "@/features/auth/login/login.page";
import LogoutPage from "@/pages/logout";
import NotFound from "@/pages/not-found";
import ApplicationListPage from "@/features/application/application-list/application-list.page";
import ApplicationDetailPage from "@/features/application/application-detail/application-detail.page";
import { LenderApply } from "@craft-apex/workflow-runtime";
import LoanListPage from "@/features/loan/loan-list/loan-list.page";
import ProfilePage from "@/features/profile/profile.page";

/**
 * Unlike the employee/partner portals there is no module tree here, so there
 * is no `useModule()` route matching and no PermissionGate — the backend
 * scopes every list to the signed-in customer. Routes are just routes.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/logout", element: <LogoutPage /> },

  {
    element: (
      <AuthGuard>
        <ConsumerLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/", element: <Navigate to="/applications" replace /> },
      { path: "/applications", element: <ApplicationListPage /> },
      { path: "/applications/:id", element: <ApplicationDetailPage /> },
      { path: "/applications/lender-apply/:id", element: <LenderApply title="Customer Lender Apply" workflowType="LENDER_APPLY" listPath="/applications" /> },
      { path: "/loans", element: <LoanListPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
