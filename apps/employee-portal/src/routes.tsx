import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@craft-apex/auth";
import { AppLayout } from "@craft-apex/layout";
import { env } from "@/env";
import LoginPage from "@/features/auth/login/login.page";
import LogoutPage from "@/pages/logout";
import Dashboard from "@/features/dashboard/dashboard.page";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { RoutePlaceholder } from "@/components/route-placeholder";
import VerificationQueuePage from "@/features/verification-ops/verification-queue/verification-queue.page";
import LeadListPage from "@/features/lead/lead-list/lead-list.page";
import LoginQPage from "@/features/application/login-q/login-q.page";
import TrackingQPage from "@/features/application/tracking-q/tracking-q.page";
import DisbursedQPage from "@/features/application/disbursed-q/disbursed-q.page";
import RejectedQPage from "@/features/application/rejected-q/rejected-q.page";
import RoleListPage from "@/features/role/role-list/role-list.page";
import RoleFormPage from "@/features/role/role-form/role-form.page";
import ParameterListPage from "@/features/parameter/parameter-list/parameter-list.page";
import ParameterFormPage from "@/features/parameter/parameter-form/parameter-form.page";
import NpaRuleListPage from "@/features/npa-rule/npa-rule-list/npa-rule-list.page";
import NpaRuleFormPage from "@/features/npa-rule/npa-rule-form/npa-rule-form.page";
import ModuleListPage from "@/features/module/module-list/module-list.page";
import LenderListPage from "@/features/lender/lender-list/lender-list.page";
import LenderFormPage from "@/features/lender/lender-form/lender-form.page";
import LoanTypeListPage from "@/features/loan-type/loan-type-list/loan-type-list.page";
import LoanTypeFormPage from "@/features/loan-type/loan-type-form/loan-type-form.page";
import TerritoryListPage from "@/features/territory/territory-list/territory-list.page";
import TerritoryFormPage from "@/features/territory/territory-form/territory-form.page";
import ServiceProviderListPage from "@/features/service-provider/service-provider-list/service-provider-list.page";
import DocChecklistListPage from "@/features/document-checklist/doc-checklist-list/doc-checklist-list.page";
import DocChecklistFormPage from "@/features/document-checklist/doc-checklist-form/doc-checklist-form.page";
import CamConfigListPage from "@/features/cam-configuration/cam-configuration-list/cam-configuration-list.page";
import VerificationTypeListPage from "@/features/verification-type/verification-type-list/verification-type-list.page";
import VerificationTypeFormPage from "@/features/verification-type/verification-type-form/verification-type-form.page";
import RuleMasterListPage from "@/features/rule/rule-list/rule-list.page";
import RuleFormPage from "@/features/rule/rule-form/rule-form.page";
import RuleCategoryListPage from "@/features/rule/rule-category-list/rule-category-list.page";
import NotificationTemplateListPage from "@/features/templates/notification-template-list/notification-template-list.page";
import NotificationTemplateFormPage from "@/features/templates/notification-template-form/notification-template-form.page";
import EmployeeListPage from "@/features/employee/employee-list/employee-list.page";
import EmployeeFormPage from "@/features/employee/employee-form/employee-form.page";
import ChannelListPage from "@/features/channel/channel-list/channel-list.page";
import ActiveAccountsListPage from "@/features/lms/active-accounts-list/active-accounts-list.page";
import VerificationListPage from "@/features/verification/verification-list/verification-list.page";
import BeatPlanListPage from "@/features/beat-plan/beat-plan-list/beat-plan-list.page";
import TargetPlanListPage from "@/features/target-mgmt/target-plan-list/target-plan-list.page";
import TargetPlanFormPage from "@/features/target-mgmt/target-plan-form/target-plan-form.page";
import UserLoginReportPage from "@/features/reports/user-login-report/user-login-report.page";
import WorkflowListPage from "@/features/workflow/workflow-list/workflow-list.page";
import WorkflowFormPage from "@/features/workflow/workflow-form/workflow-form.page";
import FieldMasterFormPage from "@/features/field-master/field-master-form/field-master-form.page";
import JourneyMasterListPage from "@/features/journey-master/journey-master-list/journey-master-list.page";
import CampaignListPage from "@/features/marketing/campaign-list/campaign-list.page";
import CampaignFormPage from "@/features/marketing/campaign-form/campaign-form.page";
import MarketingLinksListPage from "@/features/marketing/links-list/links-list.page";
import MarketingMediaListPage from "@/features/marketing/media-list/media-list.page";
import MediaFormPage from "@/features/marketing/media-form/media-form.page";
import LenderSchemeListPage from "@/features/lender-scheme/lender-scheme-list/lender-scheme-list.page";
import LenderSchemeFormPage from "@/features/lender-scheme/lender-scheme-form/lender-scheme-form.page";
import ScoringEngineListPage from "@/features/scoring-engine/scoring-engine-list/scoring-engine-list.page";
import ScoringEngineFormPage from "@/features/scoring-engine/scoring-engine-form/scoring-engine-form.page";
import FieldMasterListPage from "@/features/field-master/field-master-list/field-master-list.page";
import CollectionUploadListPage from "@/features/collection/upload-list/upload-list.page";
import SchemeListPage from "@/features/finance/scheme-list/scheme-list.page";
import PayoutPlanListPage from "@/features/payout-plan/payout-plan-list/payout-plan-list.page";
import PayoutPlanFormPage from "@/features/payout-plan/payout-plan-form/payout-plan-form.page";
import LookupMasterListPage from "@/features/lookup-master/lookup-master-list/lookup-master-list.page";
import BuilderListPage from "@/features/builder/builder-list/builder-list.page";
import BuilderFormPage from "@/features/builder/builder-form/builder-form.page";
import EmployerListPage from "@/features/employer/employer-list/employer-list.page";
import EmployerUploadListPage from "@/features/employer/employer-upload-list/employer-upload-list.page";
import EmployerUploadFormPage from "@/features/employer/employer-upload-form/employer-upload-form.page";
import LenderPincodeListPage from "@/features/lender-pincode/lender-pincode-list/lender-pincode-list.page";
import LenderPincodeFormPage from "@/features/lender-pincode/lender-pincode-form/lender-pincode-form.page";
import AskListPage from "@/features/ask/ask-list/ask-list.page";
import FulfillmentListPage from "@/features/lead/fulfillment-list/fulfillment-list.page";
import PartnerLeadsListPage from "@/features/partner/partner-leads-list/partner-leads-list.page";
import NewChannelListPage from "@/features/channel/new-channel-list/new-channel-list.page";
import ModuleFormPage from "@/features/module/module-form/module-form.page";
import JourneyMasterFormPage from "@/features/journey-master/journey-master-form/journey-master-form.page";
import CamConfigFormPage from "@/features/cam-configuration/cam-configuration-form/cam-configuration-form.page";
import ServiceRequestTypePage from "@/features/service-request-type/service-request-type.page";
import { OnboardingPage } from "@/features/workflow-runtime";
import PincodeEligibilityPage from "@/features/utility/pincode-eligibility/pincode-eligibility.page";
import CampaignAudiencePage from "@/features/marketing/campaign-audience/campaign-audience.page";
import BusinessCardPage from "@/features/utility/business-card/business-card.page";
import LenderEligiblePincodeListPage from "@/features/lender-eligible-pincode/lender-eligible-pincode-list/lender-eligible-pincode-list.page";
import GstStatusListPage from "@/features/finance/gst-status-list/gst-status-list.page";
import Customer360Page from "@/features/customer-360/customer-360.page";
import ApprovalQPage from "@/features/application/approval-q/approval-q.page";
import MisPendencyReportPage from "@/features/reports/mis-pendency-report/mis-pendency-report.page";
import MisSourceProductivityPage from "@/features/reports/mis-source-productivity/mis-source-productivity.page";
import MisBankPerformancePage from "@/features/reports/mis-bank-performance/mis-bank-performance.page";
import MisMonthWisePerformancePage from "@/features/reports/mis-month-wise-performance/mis-month-wise-performance.page";
import MisProcessStatusPage from "@/features/reports/mis-process-status/mis-process-status.page";
import MisConveyanceReportPage from "@/features/reports/mis-conveyance-report/mis-conveyance-report.page";
import CdnFileManagerPage from "@/features/cdn-file-manager/cdn-file-manager.page";
import CampaignSummaryPage from "@/features/marketing/campaign-summary/campaign-summary.page";

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
      { path: "/settings/parameter/create", element: <ParameterFormPage /> },
      { path: "/settings/parameter/create/:id", element: <ParameterFormPage /> },
      { path: "/settings/module/list", element: <ModuleListPage /> },
      { path: "/settings/module/create", element: <ModuleFormPage /> },
      { path: "/settings/module/create/:id", element: <ModuleFormPage /> },
      { path: "/settings/lender", element: <LenderListPage /> },
      { path: "/settings/add-lender", element: <LenderFormPage /> },
      { path: "/settings/add-lender/:id", element: <LenderFormPage /> },
      { path: "/settings/loan-types", element: <LoanTypeListPage /> },
      { path: "/settings/add-loan-types", element: <LoanTypeFormPage /> },
      { path: "/settings/add-loan-types/:id", element: <LoanTypeFormPage /> },
      { path: "/settings/territory-management", element: <TerritoryListPage /> },
      { path: "/settings/add-territory", element: <TerritoryFormPage /> },
      { path: "/settings/add-territory/:id", element: <TerritoryFormPage /> },
      { path: "/settings/provider-list", element: <ServiceProviderListPage /> },
      { path: "/settings/document/checklist", element: <DocChecklistListPage /> },
      { path: "/settings/document/checklist/create", element: <DocChecklistFormPage /> },
      { path: "/settings/document/checklist/create/:id", element: <DocChecklistFormPage /> },
      { path: "/settings/cam-configuration/list", element: <CamConfigListPage /> },
      { path: "/settings/cam-configuration/create", element: <CamConfigFormPage /> },
      { path: "/settings/cam-configuration/create/:id", element: <CamConfigFormPage /> },
      { path: "/settings/request-type-master", element: <ServiceRequestTypePage /> },
      { path: "/settings/verification/list", element: <VerificationTypeListPage /> },
      { path: "/settings/verification/add-verification-type", element: <VerificationTypeFormPage /> },
      { path: "/settings/verification/add-verification-type/:id", element: <VerificationTypeFormPage /> },
      { path: "/settings/rule/list", element: <RuleMasterListPage /> },
      { path: "/settings/rule/create", element: <RuleFormPage /> },
      { path: "/settings/rule/create/:id", element: <RuleFormPage /> },
      { path: "/settings/apply-rule/list", element: <RuleCategoryListPage /> },
      { path: "/settings/npa-rules-list", element: <NpaRuleListPage /> },
      { path: "/settings/create-npa-rule", element: <NpaRuleFormPage /> },
      { path: "/settings/npa-rule/:id", element: <NpaRuleFormPage /> },
      { path: "/settings/template/list", element: <NotificationTemplateListPage /> },
      { path: "/settings/template/create", element: <NotificationTemplateFormPage /> },
      { path: "/settings/template/create/:id", element: <NotificationTemplateFormPage /> },
      { path: "/settings/employee", element: <EmployeeListPage /> },
      { path: "/settings/employee/create", element: <EmployeeFormPage /> },
      { path: "/settings/employee/create/:id", element: <EmployeeFormPage /> },

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

      // Onboarding workflows — Phase 8 WorkflowRuntime.
      // Legacy /pages/Channel/{PartnerMgmt,VendorMgmt,ApfMgmt}/{Partner,Vendor,Apf}Create.js
      // all render PartnerFlowWithDynamic — i.e. workflow_type=PARTNER_ONBOARDING,
      // with partner_type varying by route (Servicing for vendors, Merchant for APF).
      // BC onboarding is its own workflow_type (BC_ONBOARDING).
      { path: "/partner/onboarding", element: <OnboardingPage title="Partner Onboarding" workflowType="PARTNER_ONBOARDING" listPath="/partner/onboarding/in-progress" /> },
      { path: "/partner/onboarding/:id", element: <OnboardingPage title="Partner Onboarding" workflowType="PARTNER_ONBOARDING" listPath="/partner/onboarding/in-progress" /> },
      { path: "/bc/partner/onboarding", element: <OnboardingPage title="BC Partner Onboarding" workflowType="PARTNER_ONBOARDING" listPath="/bc/partner/onboarding/in-progress" /> },
      { path: "/bc/partner/onboarding/:id", element: <OnboardingPage title="BC Partner Onboarding" workflowType="PARTNER_ONBOARDING" listPath="/bc/partner/onboarding/in-progress" /> },
      { path: "/vendor/onboarding", element: <OnboardingPage title="Vendor Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Servicing" listPath="/vendor/onboarding/in-progress" /> },
      { path: "/vendor/onboarding/:id", element: <OnboardingPage title="Vendor Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Servicing" listPath="/vendor/onboarding/in-progress" /> },
      { path: "/collection/vendor/onboarding", element: <OnboardingPage title="Collection Vendor Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Servicing" listPath="/collection/vendor/onboarding/in-progress" /> },
      { path: "/collection/vendor/onboarding/:id", element: <OnboardingPage title="Collection Vendor Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Servicing" listPath="/collection/vendor/onboarding/in-progress" /> },
      { path: "/apf/onboarding", element: <OnboardingPage title="APF Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Merchant" listPath="/apf/onboarding/in-progress" /> },
      { path: "/apf/onboarding/:id", element: <OnboardingPage title="APF Onboarding" workflowType="PARTNER_ONBOARDING" partnerType="Merchant" listPath="/apf/onboarding/in-progress" /> },
      { path: "/bc/onboarding", element: <OnboardingPage title="BC Onboarding" workflowType="BC_ONBOARDING" listPath="/dashboard" /> },
      { path: "/bc/onboarding/:id", element: <OnboardingPage title="BC Onboarding" workflowType="BC_ONBOARDING" listPath="/dashboard" /> },

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
      { path: "/target/add-plan", element: <TargetPlanFormPage /> },
      { path: "/target/add-plan/:id", element: <TargetPlanFormPage /> },

      // Reports — User Login (legacy /pages/Reports/UserLoginReport)
      { path: "/reports/user-login-report", element: <UserLoginReportPage /> },
      // MIS reports — all share the ReportShell scaffold (date filter +
      // dashboard cards + funnel table + CSV export).
      { path: "/reports/mis/pendency-reports", element: <MisPendencyReportPage /> },
      { path: "/reports/mis/source-productivity", element: <MisSourceProductivityPage /> },
      { path: "/reports/mis/bank-performance", element: <MisBankPerformancePage /> },
      { path: "/reports/mis/month-wise-performance", element: <MisMonthWisePerformancePage /> },
      { path: "/reports/mis/process-status", element: <MisProcessStatusPage /> },
      { path: "/reports/mis/conveyance-report", element: <MisConveyanceReportPage /> },

      // Workflow + Field/Component Master
      { path: "/settings/workflow", element: <WorkflowListPage /> },
      { path: "/settings/workflow/create", element: <WorkflowFormPage /> },
      { path: "/settings/workflow/create/:id", element: <WorkflowFormPage /> },
      { path: "/field-list", element: <FieldMasterListPage /> },
      { path: "/component-list", element: <FieldMasterListPage /> },
      { path: "/field/create", element: <FieldMasterFormPage /> },
      { path: "/field/create/:id", element: <FieldMasterFormPage /> },
      { path: "/component/create", element: <FieldMasterFormPage /> },
      { path: "/component/create/:id", element: <FieldMasterFormPage /> },

      // Journey Master
      { path: "/settings/journey-type/list", element: <JourneyMasterListPage /> },
      { path: "/settings/journey-type/list/create", element: <JourneyMasterFormPage /> },
      { path: "/settings/journey-type/list/create/:id", element: <JourneyMasterFormPage /> },

      // Marketing
      { path: "/marketing/campaign", element: <CampaignListPage /> },
      { path: "/marketing/campaign/create", element: <CampaignFormPage /> },
      { path: "/marketing/campaign/create/:id", element: <CampaignFormPage /> },
      { path: "/collection/campaign/list", element: <CampaignListPage /> },
      { path: "/marketing/link", element: <MarketingLinksListPage /> },
      { path: "/marketing/media", element: <MarketingMediaListPage /> },
      { path: "/marketing/media/create", element: <MediaFormPage /> },
      { path: "/marketing/media/create/:id", element: <MediaFormPage /> },

      // Lender Schemes (master)
      { path: "/settings/scheme-list", element: <LenderSchemeListPage /> },
      { path: "/settings/add-scheme", element: <LenderSchemeFormPage /> },
      { path: "/settings/add-scheme/:id", element: <LenderSchemeFormPage /> },

      // Scoring Engine
      { path: "/settings/scoring-engine", element: <ScoringEngineListPage /> },
      { path: "/settings/scoring-engine/add", element: <ScoringEngineFormPage /> },
      { path: "/settings/scoring-engine/:id", element: <ScoringEngineFormPage /> },

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
      { path: "/finance/add-payout-plan", element: <PayoutPlanFormPage /> },
      { path: "/finance/add-payout-plan/:id", element: <PayoutPlanFormPage /> },
      { path: "/finance/incentive-plan-list", element: <PayoutPlanListPage /> },
      { path: "/finance/add-incentive-plan", element: <PayoutPlanFormPage /> },
      { path: "/finance/add-incentive-plan/:id", element: <PayoutPlanFormPage /> },
      { path: "/collection/payout-plan-list", element: <PayoutPlanListPage /> },
      { path: "/collection/incentive-plan-list", element: <PayoutPlanListPage /> },

      // Lookup Master (grouped) — legacy /pages/Configuration/LookupMaster/LookupList.js
      { path: "/settings/lookup-list", element: <LookupMasterListPage /> },

      // Builders — legacy /pages/Builder/BuildersList.js
      { path: "/settings/builders", element: <BuilderListPage /> },
      { path: "/settings/builders/create", element: <BuilderFormPage /> },
      { path: "/settings/builders/create/:id", element: <BuilderFormPage /> },

      // Employer master — legacy /pages/Configuration/EmployerMgmt/*
      { path: "/settings/employer/list", element: <EmployerListPage /> },
      { path: "/settings/employer/upload", element: <EmployerUploadListPage /> },
      { path: "/settings/employer/upload/create", element: <EmployerUploadFormPage /> },

      // Lender Pincode uploads — legacy /pages/Configuration/LenderOnboarding/LenderPincode/List.js
      { path: "/settings/lender/pin-code/list", element: <LenderPincodeListPage /> },
      { path: "/settings/lender/pin-code/create", element: <LenderPincodeFormPage /> },

      // Asks queue — legacy /Components/Common/AskList.js
      { path: "/ask/list", element: <AskListPage /> },

      // Channel/Lead wrappers that legacy renders via <LeadList/> (same v2 application list)
      { path: "/channel/lead-list", element: <LeadListPage /> },
      { path: "/check-bureau/lead/list", element: <LeadListPage /> },

      // Fulfillment lists — legacy /Components/Lead/FullFillmentList.js (v1 application endpoint)
      { path: "/fulfillment/list", element: <FulfillmentListPage /> },
      { path: "/fulfillment/fresh-list", element: <FulfillmentListPage /> },

      // Partner leads / view — legacy /pages/Channel/{PartnerLeads,NewChannelList}.js
      { path: "/partner/list", element: <PartnerLeadsListPage /> },
      { path: "/partner-view", element: <NewChannelListPage /> },

      // === Phase 4 — pages pending a full port ===
      // Routes below land on a placeholder so navigation works end-to-end.
      // Each will be upgraded to a real page in Phase 4.1+ iterations.

      // Activity & tracking — large MIS reports (500+ LOC each in legacy with
      // 3-4 sub-components per page; deferred to Phase 5 report scaffold).
      { path: "/activity/daily-activity", element: <RoutePlaceholder title="Daily Activity" backTo="/dashboard" legacyNotes={["Legacy /pages/MIS/DailySalesReport (~500 LOC + 3 sub-cards)"]} /> },
      { path: "/activity/lead-disposition", element: <RoutePlaceholder title="Lead Disposition" backTo="/dashboard" legacyNotes={["Legacy /pages/MIS/LeadDisposition (large dashboard)"]} /> },
      { path: "/activity/live-tracking", element: <RoutePlaceholder title="Live Tracking" backTo="/dashboard" legacyNotes={["Legacy /pages/ActivityTracking/LiveTracking — Google Maps + TerritoryTree + EmployeeList"]} /> },
      { path: "/activity/partner-disposition", element: <RoutePlaceholder title="Partner Disposition" backTo="/dashboard" legacyNotes={["Legacy /pages/MIS/PartnerDisposition (large dashboard)"]} /> },

      // Attach / FLDG / Loan account — legacy uses hard-coded PortfolioList mock
      // data (no real API). Defer until backend portfolio endpoints exist.
      { path: "/attach/fldg", element: <RoutePlaceholder title="FLDG Attachments" legacyNotes={["Legacy PortfolioList uses mock data — no real API"]} /> },
      { path: "/attach/fldg/add", element: <RoutePlaceholder title="Add FLDG Attachment" backTo="/attach/fldg" legacyNotes={["Legacy AttachFLDG — mock data"]} /> },
      { path: "/attach/fldg/add/:id", element: <RoutePlaceholder title="Edit FLDG Attachment" backTo="/attach/fldg" legacyNotes={["Legacy AttachFLDG — mock data"]} /> },
      { path: "/attach/loan-account", element: <RoutePlaceholder title="Loan Account Attachments" legacyNotes={["Legacy PortfolioList uses mock data — no real API"]} /> },
      { path: "/attach/loan-account/add", element: <RoutePlaceholder title="Add Loan Account Attachment" backTo="/attach/loan-account" legacyNotes={["Legacy AttachLoanAccount — mock data"]} /> },
      { path: "/attach/loan-account/add/:id", element: <RoutePlaceholder title="Edit Loan Account Attachment" backTo="/attach/loan-account" legacyNotes={["Legacy AttachLoanAccount — mock data"]} /> },

      // BC additional screens — legacy is mock data or large bulk-upload UI.
      { path: "/bc/partner/bulk-upload", element: <RoutePlaceholder title="BC Partner Bulk Upload" legacyNotes={["Legacy PartnerBulkUpload is an 11-line stub — no real implementation"]} /> },
      { path: "/bc/pending", element: <RoutePlaceholder title="BC Pending Queue" legacyNotes={["Legacy PortfolioList uses mock data — no real API"]} /> },
      { path: "/bc/portfolio/view", element: <RoutePlaceholder title="BC Portfolio" legacyNotes={["Legacy PortfolioList uses mock data — no real API"]} /> },

      // CDN / Customer 360 / Default
      { path: "/cdn-file-manager", element: <CdnFileManagerPage /> },
      { path: "/customer360-relationship", element: <Customer360Page /> },
      { path: "/customer360-relationship/:id", element: <Customer360Page /> },
      { path: "/default/route", element: <Navigate to="/dashboard" replace /> },

      // Collection campaigns — legacy mounts the same AudienceListView component
      // for /collection/campaign/:id as /marketing/campaign/:id.
      { path: "/collection/campaign/:id", element: <CampaignAudiencePage /> },

      // Enquiry — legacy EnquiryList (1474 LOC) is too large for a single-screen
      // port; needs its own dedicated session. Bulk Upload is an 11-line stub.
      { path: "/enquiry/bulk-upload", element: <RoutePlaceholder title="Enquiry Bulk Upload" legacyNotes={["Legacy EnquiryBulkUpload is an 11-line stub"]} /> },
      { path: "/enquiry/customer/list", element: <RoutePlaceholder title="Customer Enquiries" legacyNotes={["Legacy /pages/EnquiryMgmt/List (1474 LOC) — defer to dedicated session"]} /> },
      { path: "/enquiry/customer/lead", element: <RoutePlaceholder title="Convert Enquiry to Lead" backTo="/enquiry/customer/list" legacyNotes={["Legacy EnquiryCustomerLeadsFollowUp — multi-step intake"]} /> },
      { path: "/enquiry/customer/lead/:id", element: <RoutePlaceholder title="Enquiry → Lead Detail" backTo="/enquiry/customer/list" legacyNotes={["Legacy EnquiryCustomerLeadsFollowUp — multi-step intake"]} /> },
      { path: "/enquiry/lead/list", element: <RoutePlaceholder title="Enquiry Leads" legacyNotes={["Legacy /pages/EnquiryMgmt/List (1474 LOC) — defer to dedicated session"]} /> },

      // Finance — GST / TDS. gst-status is ported; remaining filing/withheld
      // /vendor/tds/lender/company pages are Phase 4.3 (deferred — finance
      // accounting sub-area is multi-screen).
      { path: "/finance/gst-status", element: <GstStatusListPage /> },
      { path: "/finance/gst/filing", element: <RoutePlaceholder title="GST Filing" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/gst/vendor-gst", element: <RoutePlaceholder title="Vendor GST" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/gst/withheld", element: <RoutePlaceholder title="GST Withheld" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/tds/status", element: <RoutePlaceholder title="TDS Status" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/setting/lender-gst", element: <RoutePlaceholder title="Lender GST" backTo="/dashboard" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/settings/company-gst", element: <RoutePlaceholder title="Company GST" backTo="/dashboard" legacyNotes={["Phase 4.3 — finance accounting"]} /> },

      // Finance — Payable / Receivable estimates & invoices (Phase 4.3 deferred).
      { path: "/finance/accounting/month-closing", element: <RoutePlaceholder title="Month Closing" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/add-receivable-scheme", element: <Navigate to="/settings/add-scheme" replace /> },
      { path: "/finance/adjustment-card", element: <RoutePlaceholder title="Adjustment Card" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/incentive-estimate-list", element: <RoutePlaceholder title="Incentive Estimate" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/incentive-statement", element: <RoutePlaceholder title="Incentive Statement" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/invoice-details/", element: <RoutePlaceholder title="Invoice Details" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/invoice-details/:id", element: <RoutePlaceholder title="Invoice Detail" backTo="/finance/invoice-details/" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/lender-payout-upload", element: <RoutePlaceholder title="Lender Payout Upload" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/payable-estimate", element: <RoutePlaceholder title="Payable Estimate" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/payable-invoice", element: <RoutePlaceholder title="Payable Invoice" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/payout-reconciliation-view/:id", element: <RoutePlaceholder title="Payout Reconciliation" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/receivable-estimate", element: <RoutePlaceholder title="Receivable Estimate" legacyNotes={["Phase 4.3 — finance accounting"]} /> },
      { path: "/finance/receivable-invoice", element: <RoutePlaceholder title="Receivable Invoice" legacyNotes={["Phase 4.3 — finance accounting"]} /> },

      // Finance — Sales perf (Phase 4.3 deferred — shares a sales-performance scaffold).
      { path: "/finance/sales-incentive/earnings", element: <RoutePlaceholder title="Sales Incentive Earnings" legacyNotes={["Phase 4.3 — sales perf"]} /> },
      { path: "/finance/sales-payable/earnings", element: <RoutePlaceholder title="Sales Payable Earnings" legacyNotes={["Phase 4.3 — sales perf"]} /> },
      { path: "/finance/sales-performance/overview", element: <RoutePlaceholder title="Sales Performance Overview" legacyNotes={["Phase 4.3 — sales perf"]} /> },
      { path: "/sales/incentive-statement", element: <RoutePlaceholder title="Sales Incentive Statement" legacyNotes={["Phase 4.3 — sales perf"]} /> },
      { path: "/sales/invoice-view", element: <RoutePlaceholder title="Sales Invoice" legacyNotes={["Phase 4.3 — sales perf"]} /> },
      { path: "/sales/shareable-link", element: <RoutePlaceholder title="Shareable Link" legacyNotes={["Phase 4.3 — sales perf"]} /> },

      // Lead queues / actions
      { path: "/lead/bulk-upload", element: <RoutePlaceholder title="Lead Bulk Upload" legacyNotes={["Legacy LeadBulkUpload is an 11-line stub — defer until backend bulk endpoint exists"]} /> },
      { path: "/lead/create", element: <RoutePlaceholder title="Create Lead" legacyNotes={["Legacy LeadCreation — large multi-step intake form; needs dedicated session"]} /> },
      { path: "/lead/create/:id", element: <RoutePlaceholder title="Edit Lead" legacyNotes={["Legacy LeadCreation — large multi-step intake form; needs dedicated session"]} /> },
      { path: "/lead/dedupe-q", element: <LeadListPage /> },
      { path: "/lead/lender-view", element: <RoutePlaceholder title="Lender View" legacyNotes={["Legacy /pages/Application/LenderView is an 11-line stub"]} /> },
      { path: "/lead/list/approval-q", element: <ApprovalQPage /> },

      // LOS login initiate — legacy LOSLoginFlow is a 12-line stub.
      { path: "/los/login-initiate", element: <RoutePlaceholder title="LOS Login Initiate" legacyNotes={["Legacy /pages/LOS/LOSLogin/LOSLoginFlow is a 12-line stub"]} /> },
      { path: "/los/login-initiate/:id", element: <RoutePlaceholder title="LOS Login — Detail" legacyNotes={["Legacy /pages/LOS/LOSLogin/LOSLoginFlow is a 12-line stub"]} /> },

      // Marketing campaign detail / summary
      { path: "/marketing/campaign/:id", element: <CampaignAudiencePage /> },
      { path: "/marketing/campaign/summary", element: <CampaignSummaryPage /> },

      // Meet — WebRTC video PD meet (large)
      { path: "/meet/join", element: <RoutePlaceholder title="Join Meeting" legacyNotes={["Legacy /Components/Verification/videoPDMeet/VideoCallScreen (1382 LOC WebRTC)"]} /> },

      // Operations / Verification — detail/summary/transfer are large legacy
      // flows (VerificationFlow 1189 LOC, VerificationTransfer 774 LOC); the
      // Summary route had no backing file in legacy.
      { path: "/operations/verification/", element: <VerificationQueuePage /> },
      { path: "/operations/verification/:id", element: <RoutePlaceholder title="Verification Detail" backTo="/operations/verification/" legacyNotes={["Legacy /Components/Verification/VerificationFlow (1189 LOC) — defer"]} /> },
      { path: "/operations/verification/summary", element: <RoutePlaceholder title="Verification Summary" legacyNotes={["Legacy /pages/Verification/Dashboard not present — likely never shipped"]} /> },
      { path: "/operations/verification/transfer", element: <RoutePlaceholder title="Verification Transfer" legacyNotes={["Legacy /pages/Verification/VerificationTransfer (774 LOC) — defer"]} /> },

      // Partner bulk upload — legacy stub.
      { path: "/partner/bulk-upload", element: <RoutePlaceholder title="Partner Bulk Upload" legacyNotes={["Legacy PartnerBulkUpload is an 11-line stub"]} /> },

      // Misc settings creates
      { path: "/settings/lender/eligible-pincode/list", element: <LenderEligiblePincodeListPage /> },
      { path: "/settings/lookup-master/create", element: <Navigate to="/settings/lookup-master" replace /> },

      // Utility
      { path: "/utility/business-card", element: <BusinessCardPage /> },
      { path: "/utility/doc-checklist-share", element: <RoutePlaceholder title="Share Document Checklist" legacyNotes={["Legacy /pages/DocumentChecklist/ChecklistShare (598 LOC) — defer"]} /> },
      { path: "/utility/lead-reassign", element: <RoutePlaceholder title="Lead Reassign" legacyNotes={["Legacy /pages/Utility/Utilityreassign (446 LOC) — defer"]} /> },
      { path: "/utility/pincode-eligibility", element: <PincodeEligibilityPage /> },

      // Vehicle — legacy /settings/vehicle has no backing component file in
      // craft-frontend; vehicle masters live at /settings/used-vehicle-makes,
      // /vehicle-models, /vehicle-price-matrix (use mock data anyway).
      { path: "/settings/vehicle", element: <RoutePlaceholder title="Vehicle Master" legacyNotes={["Legacy VehicleView component not found; vehicle masters use mock data"]} /> },
      { path: "/settings/vehicle-details", element: <RoutePlaceholder title="Vehicle Details" legacyNotes={["Legacy route commented out in craft-frontend"]} /> },
      { path: "/vehicle/lead/create", element: <RoutePlaceholder title="Create Vehicle Lead" legacyNotes={["Legacy AutoFlow — large vehicle finance wizard"]} /> },
      { path: "/vehicle/lead/create/:id", element: <RoutePlaceholder title="Edit Vehicle Lead" legacyNotes={["Legacy AutoFlow — large vehicle finance wizard"]} /> },
    ],
  },
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <NotFound /> },
]);
