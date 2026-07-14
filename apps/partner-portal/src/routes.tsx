import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@craft-apex/auth";
import { AppLayout } from "@craft-apex/layout";
import { env } from "@/env";
import LoginPage from "@/features/auth/login/login.page";
import LogoutPage from "@/pages/logout";
import NotFound from "@/pages/not-found";
import { RoutePlaceholder } from "@/components/route-placeholder";
import DashboardPage from "@/features/dashboard/dashboard.page";
import LeadListPage from "@/features/lead/lead-list/lead-list.page";
import AskListPage from "@/features/ask/ask-list/ask-list.page";
import TaskListPage from "@/features/task/task-list/task-list.page";
import ShareableLinksPage from "@/features/shareable-links/shareable-links.page";
import PincodeEligibilityPage from "@/features/utility/pincode-eligibility/pincode-eligibility.page";

/**
 * Routes are static; the backend module tree (stored at login) drives the
 * sidebar, breadcrumbs, permissions and the X-Module header. A path here MUST
 * match the `url` the backend returns for that module, or `useModule()` will
 * not resolve and permissions default-deny.
 *
 * Paths are taken verbatim from legacy channel-flexi/src/Routes/allRoutes.js.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/logout", element: <LogoutPage /> },

  // Partner self-registration is PUBLIC (guest token) — legacy /register.
  {
    path: "/register",
    element: (
      <RoutePlaceholder
        title="Partner Registration"
        description="PARTNER_ONBOARDING workflow — pending port."
        backTo="/login"
        legacyNotes={[
          "Legacy: channel-flexi/src/Components/PartnerOnboarding/PartnerFlowWithDynamic.js (guestMode)",
          "POST /alpha/v1/setup -> guest token; POST /alpha/v1/workflow/build { workflow_type: PARTNER_ONBOARDING }",
          "Needs the workflow-runtime engine graduated into a shared package.",
        ]}
      />
    ),
  },
  {
    path: "/register/:id",
    element: (
      <RoutePlaceholder
        title="Partner Registration"
        description="PARTNER_ONBOARDING workflow — pending port."
        backTo="/login"
      />
    ),
  },
  {
    path: "/child-partner/register",
    element: (
      <RoutePlaceholder
        title="Child Partner Registration"
        description="Channel-user creation form with email/mobile OTP — pending port."
        backTo="/login"
        legacyNotes={[
          "Legacy: channel-flexi/src/pages/PartnerOnboarding/ChildPartnerRegistration.js",
          "POST /alpha/v1/notification/otp then POST /alpha/v1/channel/channel-user",
        ]}
      />
    ),
  },

  {
    element: (
      <AuthGuard>
        <AppLayout brand={env.brandName} />
      </AuthGuard>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },

      // Dashboard — legacy /dashboard and /partner/dashboard render the same component.
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/partner/dashboard", element: <DashboardPage /> },

      // Leads. /lead/list uses the v1 application API, /lead/list-v2 the v2 API.
      { path: "/lead/list", element: <LeadListPage apiVersion="v1" /> },
      { path: "/lead/list-v2", element: <LeadListPage apiVersion="v2" /> },
      {
        path: "/lead/create",
        element: (
          <RoutePlaceholder
            title="Create Lead"
            description="LEAD_CREATION workflow — pending port."
            legacyNotes={[
              "Legacy: channel-flexi/src/Components/LeadCreation/LeadFlowWithDynamic.js",
              "POST /alpha/v1/workflow/build { workflow_type: LEAD_CREATION } -> FormBuilder steps",
              "employee-portal already has this engine at src/features/workflow-runtime — graduate it to a package, then wire it here.",
            ]}
          />
        ),
      },
      {
        path: "/lead/create/:id",
        element: (
          <RoutePlaceholder
            title="Create Lead"
            description="LEAD_CREATION workflow — pending port."
          />
        ),
      },

      { path: "/ask/list", element: <AskListPage /> },

      // Verification tasks — two endpoints, same table shape.
      { path: "/task/task-list", element: <TaskListPage mode="self" /> },
      { path: "/task/task-view", element: <TaskListPage mode="search" /> },

      // Shareable links — legacy maps both paths to the same component.
      { path: "/shareable-links", element: <ShareableLinksPage /> },
      { path: "/sales/shareable-link", element: <ShareableLinksPage /> },

      { path: "/utility/pincode-eligibility", element: <PincodeEligibilityPage /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
