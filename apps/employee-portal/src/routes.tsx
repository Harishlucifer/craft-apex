import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@craft-apex/auth";
import { AppLayout } from "@craft-apex/layout";
import { env } from "@/env";
import LoginPage from "@/features/auth/login/login.page";
import LogoutPage from "@/pages/logout";
import Dashboard from "@/features/dashboard/dashboard.page";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import LeadListPage from "@/features/lead/lead-list/lead-list.page";
import LoginQPage from "@/features/application/login-q/login-q.page";
import TrackingQPage from "@/features/application/tracking-q/tracking-q.page";
import DisbursedQPage from "@/features/application/disbursed-q/disbursed-q.page";
import RejectedQPage from "@/features/application/rejected-q/rejected-q.page";
import RoleListPage from "@/features/role/role-list/role-list.page";
import RoleFormPage from "@/features/role/role-form/role-form.page";
import ParameterListPage from "@/features/parameter/parameter-list/parameter-list.page";
import ModuleListPage from "@/features/module/module-list/module-list.page";
import LenderListPage from "@/features/lender/lender-list/lender-list.page";
import LoanTypeListPage from "@/features/loan-type/loan-type-list/loan-type-list.page";
import TerritoryListPage from "@/features/territory/territory-list/territory-list.page";
import ServiceProviderListPage from "@/features/service-provider/service-provider-list/service-provider-list.page";
import DocChecklistListPage from "@/features/document-checklist/doc-checklist-list/doc-checklist-list.page";
import CamConfigListPage from "@/features/cam-configuration/cam-configuration-list/cam-configuration-list.page";
import VerificationTypeListPage from "@/features/verification-type/verification-type-list/verification-type-list.page";
import RuleMasterListPage from "@/features/rule/rule-list/rule-list.page";
import RuleCategoryListPage from "@/features/rule/rule-category-list/rule-category-list.page";
import NotificationTemplateListPage from "@/features/templates/notification-template-list/notification-template-list.page";
import EmployeeListPage from "@/features/employee/employee-list/employee-list.page";
import ChannelListPage from "@/features/channel/channel-list/channel-list.page";
import ActiveAccountsListPage from "@/features/lms/active-accounts-list/active-accounts-list.page";
import VerificationListPage from "@/features/verification/verification-list/verification-list.page";
import BeatPlanListPage from "@/features/beat-plan/beat-plan-list/beat-plan-list.page";
import TargetPlanListPage from "@/features/target-mgmt/target-plan-list/target-plan-list.page";
import UserLoginReportPage from "@/features/reports/user-login-report/user-login-report.page";
import WorkflowListPage from "@/features/workflow/workflow-list/workflow-list.page";
import JourneyMasterListPage from "@/features/journey-master/journey-master-list/journey-master-list.page";
import CampaignListPage from "@/features/marketing/campaign-list/campaign-list.page";
import MarketingLinksListPage from "@/features/marketing/links-list/links-list.page";
import MarketingMediaListPage from "@/features/marketing/media-list/media-list.page";
import LenderSchemeListPage from "@/features/lender-scheme/lender-scheme-list/lender-scheme-list.page";
import ScoringEngineListPage from "@/features/scoring-engine/scoring-engine-list/scoring-engine-list.page";
import FieldMasterListPage from "@/features/field-master/field-master-list/field-master-list.page";
import CollectionUploadListPage from "@/features/collection/upload-list/upload-list.page";
import SchemeListPage from "@/features/finance/scheme-list/scheme-list.page";
import PayoutPlanListPage from "@/features/payout-plan/payout-plan-list/payout-plan-list.page";
import LookupMasterListPage from "@/features/lookup-master/lookup-master-list/lookup-master-list.page";
import BuilderListPage from "@/features/builder/builder-list/builder-list.page";
import EmployerListPage from "@/features/employer/employer-list/employer-list.page";
import EmployerUploadListPage from "@/features/employer/employer-upload-list/employer-upload-list.page";
import LenderPincodeListPage from "@/features/lender-pincode/lender-pincode-list/lender-pincode-list.page";
import AskListPage from "@/features/ask/ask-list/ask-list.page";

/**
 * Explicit route tree. Every path is a real legacy path (verified against
 * craft-frontend/src/Routes/allRoutes.js). One entry per migrated screen —
 * no registry, no generated tables, no placeholder fallback.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/logout", element: <LogoutPage /> },
  {
    element: (
      <AuthGuard>
        <AppLayout brand={env.brandName} />
      </AuthGuard>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },

      // Lead lists — legacy /lead/list (DynamicLeadList)
      { path: "/lead/list", element: <LeadListPage /> },
      { path: "/lead/list/fulfilled", element: <LeadListPage /> },
      { path: "/lead/list/archived", element: <LeadListPage /> },

      // Application queues — legacy /pages/Application/*Q.js
      { path: "/lead/list/login-q", element: <LoginQPage /> },
      { path: "/lead/list/tracking-q", element: <TrackingQPage /> },
      { path: "/lead/list/disbursed-q", element: <DisbursedQPage /> },
      { path: "/lead/list/rejected-q", element: <RejectedQPage /> },

      // LOS stage queues — legacy LoginListView just wraps <LeadList navigateUrl="/los/login-initiate"/>,
      // i.e. the same application list endpoint (DynamicLeadList).
      { path: "/los/login-q", element: <LeadListPage /> },
      { path: "/los/login-view", element: <LeadListPage /> },
      { path: "/los/appraisal-q", element: <LeadListPage /> },
      { path: "/los/appraisal-view", element: <LeadListPage /> },
      { path: "/los/underwriting-q", element: <LeadListPage /> },
      { path: "/los/underwriting-view", element: <LeadListPage /> },
      { path: "/los/acceptance-q", element: <LeadListPage /> },
      { path: "/los/acceptance-view", element: <LeadListPage /> },
      { path: "/los/appeal-q", element: <LeadListPage /> },
      { path: "/los/appeal-view", element: <LeadListPage /> },

      // Role management — legacy /pages/Configuration/Role/*
      { path: "/settings/role", element: <RoleListPage /> },
      { path: "/settings/role/create", element: <RoleFormPage /> },
      { path: "/settings/role/create/:id", element: <RoleFormPage /> },

      // Settings: master lists (legacy /pages/...) — list views only.
      { path: "/settings/parameter/list", element: <ParameterListPage /> },
      { path: "/settings/module/list", element: <ModuleListPage /> },
      { path: "/settings/lender", element: <LenderListPage /> },
      { path: "/settings/loan-types", element: <LoanTypeListPage /> },
      { path: "/settings/territory-management", element: <TerritoryListPage /> },
      { path: "/settings/provider-list", element: <ServiceProviderListPage /> },
      { path: "/settings/document/checklist", element: <DocChecklistListPage /> },
      { path: "/settings/cam-configuration/list", element: <CamConfigListPage /> },
      { path: "/settings/verification/list", element: <VerificationTypeListPage /> },
      { path: "/settings/rule/list", element: <RuleMasterListPage /> },
      { path: "/settings/apply-rule/list", element: <RuleCategoryListPage /> },
      { path: "/settings/template/list", element: <NotificationTemplateListPage /> },
      { path: "/settings/employee", element: <EmployeeListPage /> },

      // Channel onboarding (Partner / Vendor / APF) — legacy /pages/Channel/*Mgmt
      // All routes hit the same /alpha/v1/channel endpoint with different status +
      // journey_type filters (see PATH_FILTERS in channel-list.page.tsx).
      { path: "/partner/onboarding/in-progress", element: <ChannelListPage /> },
      { path: "/partner/onboarding/pending", element: <ChannelListPage /> },
      { path: "/partner/onboarding/approved", element: <ChannelListPage /> },
      { path: "/partner/onboarding/rejected", element: <ChannelListPage /> },
      { path: "/partner/onboarding/archived", element: <ChannelListPage /> },
      { path: "/partner/onboarding/inactive", element: <ChannelListPage /> },
      { path: "/bc/partner/onboarding/in-progress", element: <ChannelListPage /> },
      { path: "/bc/partner/onboarding/pending", element: <ChannelListPage /> },
      { path: "/bc/partner/onboarding/approved", element: <ChannelListPage /> },
      { path: "/bc/partner/onboarding/rejected", element: <ChannelListPage /> },
      { path: "/vendor/onboarding/in-progress", element: <ChannelListPage /> },
      { path: "/vendor/onboarding/pending", element: <ChannelListPage /> },
      { path: "/vendor/onboarding/approved", element: <ChannelListPage /> },
      { path: "/vendor/onboarding/rejected", element: <ChannelListPage /> },
      { path: "/collection/vendor/onboarding/in-progress", element: <ChannelListPage /> },
      { path: "/collection/vendor/onboarding/pending", element: <ChannelListPage /> },
      { path: "/collection/vendor/onboarding/approved", element: <ChannelListPage /> },
      { path: "/collection/vendor/onboarding/rejected", element: <ChannelListPage /> },
      { path: "/apf/onboarding/in-progress", element: <ChannelListPage /> },
      { path: "/apf/onboarding/pending", element: <ChannelListPage /> },
      { path: "/apf/onboarding/approved", element: <ChannelListPage /> },
      { path: "/apf/onboarding/rejected", element: <ChannelListPage /> },

      // LMS — legacy /pages/Lms/ActiveAccounts
      { path: "/active/accounts", element: <ActiveAccountsListPage /> },

      // Verification — legacy /pages/Verification/{VerificationList,VerificationTaskList}.js
      { path: "/operations/verification/list", element: <VerificationListPage /> },
      { path: "/operations/verification/task/list", element: <VerificationListPage /> },

      // Beat Plan — legacy /pages/BeatPlan/BeatPlanView.js
      { path: "/beat-plan/list", element: <BeatPlanListPage /> },
      { path: "/beat-actual/view", element: <BeatPlanListPage /> },

      // Target Mgmt — legacy /pages/TargetMgmt/PlanListView.js
      { path: "/target/plan-list", element: <TargetPlanListPage /> },

      // Reports — User Login (legacy /pages/Reports/UserLoginReport)
      { path: "/reports/user-login-report", element: <UserLoginReportPage /> },

      // Workflow + Field/Component Master
      { path: "/settings/workflow", element: <WorkflowListPage /> },
      { path: "/field-list", element: <FieldMasterListPage /> },
      { path: "/component-list", element: <FieldMasterListPage /> },

      // Journey Master
      { path: "/settings/journey-type/list", element: <JourneyMasterListPage /> },

      // Marketing
      { path: "/marketing/campaign", element: <CampaignListPage /> },
      { path: "/collection/campaign/list", element: <CampaignListPage /> },
      { path: "/marketing/link", element: <MarketingLinksListPage /> },
      { path: "/marketing/media", element: <MarketingMediaListPage /> },

      // Lender Schemes (master)
      { path: "/settings/scheme-list", element: <LenderSchemeListPage /> },

      // Scoring Engine
      { path: "/settings/scoring-engine", element: <ScoringEngineListPage /> },

      // Collection Upload
      { path: "/collection/upload/list", element: <CollectionUploadListPage /> },

      // Finance schemes — legacy /pages/PayableReceivableMgmt/SchemeListView.js
      { path: "/finance/payable-scheme-list", element: <SchemeListPage /> },
      { path: "/finance/receivable-scheme-list", element: <SchemeListPage /> },
      { path: "/finance/incentive-scheme-list", element: <SchemeListPage /> },
      { path: "/collection/partner-scheme-list", element: <SchemeListPage /> },
      { path: "/collection/incentive-scheme-list", element: <SchemeListPage /> },

      // Payout plans — legacy /pages/PayoutPlan/PayoutListView.js
      { path: "/finance/payout-plan-list", element: <PayoutPlanListPage /> },
      { path: "/finance/incentive-plan-list", element: <PayoutPlanListPage /> },
      { path: "/collection/payout-plan-list", element: <PayoutPlanListPage /> },
      { path: "/collection/incentive-plan-list", element: <PayoutPlanListPage /> },

      // Lookup Master (grouped) — legacy /pages/Configuration/LookupMaster/LookupList.js
      { path: "/settings/lookup-list", element: <LookupMasterListPage /> },

      // Builders — legacy /pages/Builder/BuildersList.js
      { path: "/settings/builders", element: <BuilderListPage /> },

      // Employer master — legacy /pages/Configuration/EmployerMgmt/*
      { path: "/settings/employer/list", element: <EmployerListPage /> },
      { path: "/settings/employer/upload", element: <EmployerUploadListPage /> },

      // Lender Pincode uploads — legacy /pages/Configuration/LenderOnboarding/LenderPincode/List.js
      { path: "/settings/lender/pin-code/list", element: <LenderPincodeListPage /> },

      // Asks queue — legacy /Components/Common/AskList.js
      { path: "/ask/list", element: <AskListPage /> },

      // Channel/Lead wrappers that legacy renders via <LeadList/> (same v2 application list)
      { path: "/channel/lead-list", element: <LeadListPage /> },
      { path: "/check-bureau/lead/list", element: <LeadListPage /> },
    ],
  },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <NotFound /> },
]);
