import React from "react";
import { Navigate } from "react-router-dom";
// HOC WithModule Imports
import {
    TemplateListWithModule,
    TemplateCreateWithModule,
    DocCheckList,
    DocCheckListCreate,
    VerificationListView,
    VerificationCreateUpdate,
    CreateVerificationAllocationRule,
    CamConfigurationListView,
    CreateCamConfiguration,
    RuleList,
    RuleCreateUpdate,
    RuleCategoryListView,
    RuleCategoryCreateUpdate,
    ParameterListView,
    ParameterCreateUpdate,
    UserProfileView,
    ChangePasswordComponent,
    ShareableLinksComponent,
    UploadLenderList,
    UploadLenderCreate,
    CheckBureauListView,
    EnquiryListView,
    FulfilledLeadList,
    ArchivedLeadList,
    LenderViewComponent,
    PartnerLeadsList,
    ChannelAskListView,
    ChannelListView,
    LeadCreate,
    DedupeQList,
    LiveTrackingView,
    DailyActivityView,
    EnquiryCustomerLeadsFollowUpCreate,
    AutoFlow,
    ProcessStatusView,
    BankPerformanceView,
    SourceProductivityView,
    ProductPerformanceView,
    MonthWisePerformanceView,
    PendencyReportsView,
    ConveyanceReportView,
    VerificationTATReportView,
    PartnerRenewalFlow,
    PartnerRenewalsList,
    PartnerArchivedList,
    ApprovedPartner,
    PartnerApprovalComponent,
    PartnerUpload,
    NewChannelListView,
    PartnersReportDownload,
    BankAnalyzerView,
    BureauAnalyzerView,
    UserImpersonateComponent,
    UploadCollectionsWrapped,
    CollectionSummary,
    PayoutDocumentFilterWrapped,
    RoleAndAccessRightsListView,
    CreateRoleAndAccessRights,
    VendorApprovedListEditWrapped,
    PlatformUsageReportView,
    PincodeEligibilityCheck,
    UtilityreassignLead,
    LeadLoginQ,
    LeadTrackingQ,
    LeadDisbursedQ,
    LeadRejectedQ,
    LeadUpload,
    EnquiryUpload,
    VehicleView,
    ModuleListView,
    CreateModule,
    LenderEligiblePincodeList,
    LoanAccountManagementView,
    NavigationTabView,
    ScoringEnginelist,
    ScoringEngineCreate,
    TradeAdvanceWrapped,
    AddTradeAdvanceWrapped,
    TrackerWrapped,
    ApfApprovedListEditWrapped,
    ApfApprovalPendingWrapped,
    ApfApprovedListWrapped,
    ApfCreateWithDynamic,
    ApfInProgress,
    DashboardLeadsWithModule,
    LeadStatus,
    LeadList,
    PartnerApprovedListWrapped,
    PartnerCreateWithDynamic,
    PartnerListInProgress,
    RejectedApfListWrapped,
    RejectedPartnerListWrapped,
    RejectedVendorListWrapped,
    VendorApprovalPendingWrapped,
    VendorApprovedListWrapped,
    VendorCreateWithDynamic,
    VendorInProgress,
    PartnerApprovalPending,
    EmployeeManagementWrapped,
    EmployeeListViewWrapped,
    EmployeeSalaryDetailsWrapped,
    LeaveApprovalsWrapped,
    PayrollBatchListWrapped,
    VerificationSummaryWrapped,
    VerificationQWrapped,
    TargetPlanListView,
    TargetAddPlan,
    AssignTargetListView,
    AssignTarget,
    TrackPerformancePage,
    VerificationViewWrapped,
    VerificationTransferWrapped,
    FulfillmentListWrapped,
    UploadedCollectionListView,
    ActiveAccountsList,
    TeleCollectionQ,
    TeleCollectionView,
    FieldCollectionQ,
    FieldCollectionView,
    CollectionFlow,
    ClosedAccountsList,
    AssignIncentive,
    AttachEmployeeIncentives,
    BatchInvoiceFlow,
    SummaryWithModule,
    IncentivePlanList,
    PayoutPlanList,
    PayableEstimateList,
    SalesEstimateList,
    SalesIncentiveEarnings,
    BatchList,
    GstStatus,
    BcOnboarding,
    BCPendingApproval,
    BCFLDGAttach,
    BCAttachLoanAccount,
    BCFLDGAttachList,
    BCAttachLoanAccountList,
    EmployeeIncentive,
    PartnerReceivableEarnings,
    SalesIncentive,
    SalesInvoice,
    FinanceInvoice,
    CollectionEmployeePayout,
    CollectionEmployeeEstimate,
    CollectionEmployeeInvoice,
    CollectionPartnerPayout,
    CollectionPartnerEstimate,
    CollectionPartnerInvoice,
    FormBuilderComponent,
    FieldsAndComponentList,
    FieldsAndComponentCreateUpdate,
    CreateScheme,
    BatchPaymentProcessing,
    SchemeListComponent,
    EstimateComponent,
    LenderInvoiceComponent,
    WithHeldInvoiceComponent,
    GSTReverseInvoiceComponent,
    GSTFilingComponent,
    InvoiceProcessingCreate,
    CreatePayOutPlan,
    PayoutPlanUpload,
    ViewPayoutReconciliation,
    AdjustmentsCard,
    ViewSalesPerformanceOver,
    CdnFile,
    ChartsOfAccountsView,
    CreateChartsOfAccounts,
    AccountingTemplateList,
    CreateAccountingTemplate,
    GeneralLedgerList,
    CreateGeneralLedger,
    CostCenterList,
    CreateCostCenter,
    GeneralLedgerBalanceList,
    AmortisationList,
    BankAccountDetailsView,
    JourneyMasterList,
    CreateJourneyType,
    CampaignList,
    CreateCampaign,
    UploadCampaign,
    CampaignUploadView,
    LinksList,
    CreateLinks,
    MediaList,
    CreateMedia,
    ShareableLinkComponent,
    BuilderListView,
    BuilderCreateUpdate,
    VerificationInitiate,
    CompanyDetailsView,
    VendorGSTList,
    VendorTDSStatusView,
    TDSFilingView,
    EmployerUploadView,
    UploadEmployer,
    EmployerListView,
    EmployerReviewComponent,
    MapListView,
    EmployeeCreateUpdate,
    LoanTypeListView,
    LoanTypeCreateUpdate,
    LenderListView,
    CreateLender,
    SchemeListViewComponent,
    CreateUpdateScheme,
    TerritoryListView,
    TerritoryCreateUpdate,
    WorkflowList,
    WorkflowCreateUpdate,
    WorkflowComponentList,
    LookupListView,
    LookupCreateUpdate,
    DisbursementFlowWrapped,
    ConfigtemplatesWithModule,
    RepaymentFlow,
    LOSLoginInitiate,
    LoginListView,
    Reschedule,
    ProviderListView,
    LeadDispositionReports,
    ChannelSales,
    MessageView,
    CronView,
    DisbursementRequestWrap,
    NewDisbursementWrap,
    UserLoginReportList,
    DailySalesReports,
    ConveyanceReportsDistance,
    AttendanceReports,
    CollectionReportWithModule,
    OverallActivityView,
    UnderwritingAdd,
    LeadTransferQ,
    BeatPlanViewWithModule,
    BeatPlanManagementWithModule,
    BeatPlanActualViewWithModule,
    BeatPlanActualWithModule,
    PartnerInactiveList,
    LegalFlowWithModule,
    LegalViewWithModule,
    LegalApprovalFlowWithModule,
    PreLegalNoticeListWithModule, RepossessionFlowWithModule, RepossessionViewWithModule, Section138ListView,
    LokAdalatListView, CivilListView, SarfaesiListView, ArbitrationListView, DisbursementBatchList,
    AudienceListViewWithModule, CampaignDashboardWithModule,
    NavigationTabViewNew, ChildPartnerListWithModule, ChildPartnerApprovalWithModule,
    ServiceRequestQWithModule,
    PartnerDispositionReports, RescheduleQWithModule,
    RestructureQWithModule,
    RestructureFlowWithModule,
    AccountBalanceList, TrialBalanceList,
    LoanAccountStatementWithModule, AccountBalanceListSample,
    VideoCallRoom,
    Underwriting, InactiveLeadList, BusinessCardWithModule, DefaultRouteWithModule, DocChecklistShareWithModule,
    AddPurchaseOrderWithModule, AddCustomerPurchaseOrderWithModule, AddPurchaseInvoiceWithModule,
    PurchaseOrderListWithModule, PurchaseInvoiceListWithModule, PurchaseRequisitionWithModule, LmsDashboardWithModule,
    CollectionEfficiencyReportWithModule,
    DpdAgingReportWithModule,
    InterestAccrualReportWithModule,
    NpaMovementReportWithModule,
    PortfolioOverviewReportWithModule,
    // Fixed Assets Module
    FixedAssetsDashboardWithModule,
    AssetRegistrationWithModule,
    AssetDetailsWithModule,
    AssetTransferWithModule,
    AssetDisposalWithModule,
    AssetCapitalizeWithModule,
    DepreciationRunWithModule,
    AssetReportsWithModule,
    TreasuryDashboardWithModule,
    ALMDashboardWithModule,
    TermLoanManagementWithModule,
    FixedDepositWithModule,
    MutualFundWithModule,
    CampaignAudienceLeadFollowupCreate,
    CampaignAudienceListWithModule,
    WithModuleTerritoryTargetList,
    MeetJoinWithModule,
    FieldCollectorBranchDepositListWithModule,
    FieldCollectWorkflowWithModule,
    BranchCashDepositListWithModule,
    BranchCashDepositWorkflowWithModule,
    FulfillmentListFresh
} from "./WithModuleRoutes";


import Logout from "../pages/Authentication/Logout";
import LoginMethod from "../pages/Authentication/LoginMethod";
import ForgotPassword from "../pages/Authentication/ForgotPassword";
import ResetPassword from "../pages/Authentication/ResetPassword";
import StepConfigurationFormBuilder from "../Components/Common/StepConfigurationFormBuider";
import TermsConditionsBureau from "../Components/LeadCreation/TermsConditionBureau";
import PartDisbursement from "../Components/PartDisbursement/PartDisbursement";
import SanctionedQ from "../pages/Application/SanctionedQ";
import AttendanceReport from "../pages/MIS/AttendanceReport/AttendanceReport";
import CollectionIndex from "../Components/Collections/CollectionIndex";
import LoanAccountCreationFlow from "../Components/LoanAccount/LoanAccountCreationFlow";
import PendingLoan from "../Components/LoanAccount/PendingLoan";
import LoanAccountUpload from "../Components/LoanAccount/LoanAccountUpload";
import MonthlySummaryAttendance from "../pages/MIS/AttendanceReport/MonthlySummaryAttendance";
import PartnerUserList from "../pages/Channel/PartnerMgmt/PartnerUserList";
import DefaultRoute from "../Components/Common/DefaultRoute";
import UnderwritingList from "../pages/Configuration/EmployerMgmt/UnderwritingList";
import EnachSetup from "../Components/Verification/ENachAssist";
import OTSInitiate from "../Components/Collections/OTS/OTSInitiate";
import OTSWorkflow from "../Components/Collections/OTS/OTSWorkflow";

import Customer360Relationship from "../Components/LOS/Customer360Relationship";
import NpaRulesList from "../pages/Rule/RuleCategoryNpa/NpaRulesList";
import NpaRulesCreateOrUpdate from "../pages/Rule/RuleCategoryNpa/NpaRuleCreateAndUpdate";
import BureauReportListView from "../Components/Reports/RegulatoryReporting/BureauReporting/BureauReporsListView";
import BureauReportingFlow from "../Components/Reports/RegulatoryReporting/BureauReporting/BureauReportingFlow";
import PreLegalNoticeSteps from "../Components/LMS/Legal/PreLegalNotice/PreLegalNoticeSteps";
import ApprovalQ from "../pages/Application/ApprovalQ";
import ServiceRequestFlow from "../Components/LMS/ServiceRequestFlow/ServiceRequestFlow";
import { components } from "react-select";
import PriceMatrixIndex from "../Components/CarLead/UsedVehicleMaster/PriceMatrixIndex";
import PortfolioRuleIndex from "../Components/PortfolioRuleMaster/PortfolioRuleIndex";
import VehicleDetails from "../Components/CarLead/VehicleDetails";
import ReconciliationIndex from "../Components/LMS/BankStatementReconciliation/ReconciliationIndex";
import PortfolioRuleManagement from "../Components/PortfolioRuleMaster/PortfolioRuleManagement";
import VehicleMake from "../Components/CarLead/UsedVehicleMaster/VehicleMake";
import VehicleModel from "../Components/CarLead/UsedVehicleMaster/VehicleModel";
import NewVehiclePrice from "../Components/CarLead/UsedVehicleMaster/NewVehiclePrice";

import RescheduleFlow from "../Components/LMS/RescheduleMgmt/RescheduleFlow";
import BranchCashDeposit from "../Components/Collections/BranchCashDeposit/BranchCashDeposit";
import MonthClosing from "../Components/Accounting/MonthClosing";
import FinanceIndex from "../Components/Accounting/Finance/FinanceIndex";
import FinanceIndexNew from "../Components/Accounting/FinanceNew/FinanceIndexNew";
import LeadFunnelReport from "../pages/Reports/LeadFunnelReport";
import VideoRoom from "../Components/Verification/videoPDMeet/VideoCallScreen";


import TerritoryTargetFlow from "../Components/TargetMgmt/TerritoryTarget/TerritoryTargetFlow";
import RepaymentDateConfig from "../pages/Configuration/RepaymentDateConfig/RepaymentDateConfig";
import RepaymentDateSelector from "../pages/Configuration/RepaymentDateConfig/RepaymentDateSelector";

const authProtectedRoutes = [
    { path: "/dashboard", component: <DashboardLeadsWithModule /> },
    { path: "/summary", component: <SummaryWithModule /> },
    { path: "/treasury/dashboard", component: <TreasuryDashboardWithModule /> },
    { path: "/treasury/alm", component: <ALMDashboardWithModule /> },
    { path: "/liabilities/term-loan", component: <TermLoanManagementWithModule /> },
    { path: "/surplus/fixed-deposit", component: <FixedDepositWithModule /> },
    { path: "/surplus/mutual-fund", component: <MutualFundWithModule /> },
    // form-builder-component
    { path: "/form-builder", component: <FormBuilderComponent /> },
    { path: "/field-list", component: <FieldsAndComponentList /> },
    { path: "/component-list", component: <FieldsAndComponentList /> },
    { path: "/field/create", component: <FieldsAndComponentCreateUpdate /> },
    { path: "/component/create", component: <FieldsAndComponentCreateUpdate /> },
    { path: "/field/create/:id", component: <FieldsAndComponentCreateUpdate /> },
    { path: "/component/create/:id", component: <FieldsAndComponentCreateUpdate /> },

    //payable  management
    { path: "/finance/payable-scheme-list", component: <SchemeListComponent /> },
    { path: "/finance/add-payable-scheme/", component: <CreateScheme /> },
    { path: "/finance/add-payable-scheme/:id", component: <CreateScheme /> },

    //repayment date config
    { path: "/settings/repayment-date-config", component: <RepaymentDateConfig /> },
    { path: "/settings/repayment-date-selector", component: <RepaymentDateSelector /> },

    // payment processing batch
    { path: "/finance/payment-processing", component: <BatchList /> },
    { path: "/finance/payment-processing/add", component: <BatchPaymentProcessing /> },
    { path: "/finance/batch-create", component: <BatchInvoiceFlow /> },
    { path: "/finance/batch-create/:id", component: <BatchInvoiceFlow /> },
    { path: "/verification/enach-setup", component: <EnachSetup /> },

    //receivable  management
    { path: '/finance/receivable-scheme-list', component: <SchemeListComponent /> },
    { path: '/finance/add-receivable-scheme', component: <CreateScheme /> },
    { path: "/finance/add-receivable-scheme/:id", component: <CreateScheme /> },
    //payable receivable processing
    { path: '/finance/receivable-estimate', component: <EstimateComponent /> },
    { path: '/finance/receivable-invoice', component: <LenderInvoiceComponent /> },
    { path: '/sales/invoice-view', component: <SalesInvoice /> },
    { path: '/finance/incentive-statement', component: <EmployeeIncentive /> },
    { path: '/sales/incentive-statement', component: <EmployeeIncentive /> },
    { path: '/finance/gst/withheld', component: <WithHeldInvoiceComponent /> },
    { path: "/finance/gst/reversed-charge", component: <GSTReverseInvoiceComponent /> },
    { path: '/finance/gst/filing', component: <GSTFilingComponent /> },
    { path: '/finance/invoice-details/:id', component: <InvoiceProcessingCreate /> },
    { path: '/finance/invoice-details/', component: <InvoiceProcessingCreate /> },
    //payout plan
    { path: '/finance/payout-plan-list', component: <SalesIncentive /> },
    { path: '/finance/add-payout-plan', component: <CreatePayOutPlan /> },
    { path: '/finance/add-payout-plan/:id', component: <CreatePayOutPlan /> },
    { path: '/finance/lender-payout-upload', component: <PayoutPlanUpload /> },
    { path: '/finance/payout-reconciliation-view/:id', component: <ViewPayoutReconciliation /> },
    { path: '/finance/adjustment-card', component: <AdjustmentsCard /> },
    { path: '/finance/sales-performance/overview', component: <ViewSalesPerformanceOver /> },



    //cdn file manager
    { path: '/cdn-file-manager', component: <CdnFile /> },
    //payable  management
    { path: "/finance/payable-scheme-list", component: <SchemeListComponent /> },
    { path: "/finance/add-payable-scheme", component: <CreateScheme /> },
    { path: "/finance/add-payable-scheme/:id", component: <CreateScheme /> },
    //receivable  management
    { path: '/finance/receivable-scheme-list', component: <SchemeListComponent /> },
    { path: '/finance/add-receivable-scheme', component: <CreateScheme /> },
    { path: "/finance/add-receivable-scheme/:id", component: <CreateScheme /> },
    //payable receivable processing
    { path: '/finance/receivable-estimate', component: <EstimateComponent /> },
    { path: '/finance/payable-estimate', component: <PayableEstimateList /> },
    { path: '/finance/receivable-invoice', component: <LenderInvoiceComponent /> },
    { path: '/finance/payable-invoice', component: <FinanceInvoice /> },
    { path: '/finance/invoice-details/:id', component: <InvoiceProcessingCreate /> },
    { path: '/finance/invoice-details/', component: <InvoiceProcessingCreate /> },

    //payout plan
    { path: '/finance/payout-plan-list', component: <PayoutPlanList /> },
    { path: '/finance/add-payout-plan', component: <CreatePayOutPlan /> },
    { path: '/finance/add-payout-plan/:id', component: <CreatePayOutPlan /> },
    { path: '/finance/lender-payout-upload', component: <PayoutPlanUpload /> },
    { path: '/finance/payout-reconciliation-view/:id', component: <ViewPayoutReconciliation /> },
    { path: '/finance/adjustment-card', component: <AdjustmentsCard /> },
    { path: '/finance/sales-performance/overview', component: <ViewSalesPerformanceOver /> },

    //charts-of-accounts list
    { path: "/finance/accounting/chart-of-accounts", component: <ChartsOfAccountsView /> },
    { path: "/finance/accounting/add-charts-of-accounts", component: <CreateChartsOfAccounts /> },
    { path: "/finance/accounting/add-charts-of-accounts/:id", component: <CreateChartsOfAccounts /> },
    { path: '/finance/accounting/month-closing', component: <MonthClosing /> },

    //Accounting-Template list
    { path: "/finance/accounting/accounting-template", component: <AccountingTemplateList /> },
    { path: "/finance/accounting/add-accounting-template", component: <CreateAccountingTemplate /> },
    { path: "/finance/accounting/add-accounting-template/:id", component: <CreateAccountingTemplate /> },

    //General-Ledger List
    { path: "/finance/accounting/general-ledger", component: <GeneralLedgerList /> },
    { path: "/finance/accounting/add-general-ledger-entries", component: <CreateGeneralLedger /> },
    { path: "/finance/accounting/add-general-ledger-entries/:id", component: <CreateGeneralLedger /> },
    { path: "/finance/account/account-balance/list", component: <AccountBalanceList /> },
    { path: "/finance/account/financials-new", component: <FinanceIndex /> },
    { path: "/finance/account/account-balance/sample", component: <AccountBalanceListSample /> },
    { path: "/finance/account/financials", component: <FinanceIndexNew /> },
    // { path: "/finance/account/balance-sheet", component: <BalanceSheetList/>},


    //COS center List
    { path: "/finance/accounting/cost-center", component: <CostCenterList /> },
    { path: "/finance/accounting/add-cost-center", component: <CreateCostCenter /> },
    { path: "/finance/accounting/add-cost-center/:id", component: <CreateCostCenter /> },

    // general ledger balance
    { path: "/finance/accounting/general-ledger-balance", component: <GeneralLedgerBalanceList /> },

    // Amort view
    { path: "/finance/accounting/amort-view", component: <AmortisationList /> },

    // Bank account List
    { path: "/finance/company-details/bank-account", component: <BankAccountDetailsView /> },

    // Fixed Assets Module
    { path: "/finance/accounting/fixed-assets/dashboard", component: <FixedAssetsDashboardWithModule /> },
    { path: "/finance/accounting/fixed-assets/registration", component: <AssetRegistrationWithModule /> },
    { path: "/finance/accounting/fixed-assets/registration/:id", component: <AssetRegistrationWithModule /> },
    { path: "/finance/accounting/fixed-assets/details/:code", component: <AssetDetailsWithModule /> },
    { path: "/finance/accounting/fixed-assets/transfer/:code", component: <AssetTransferWithModule /> },
    { path: "/finance/accounting/fixed-assets/disposal/:code", component: <AssetDisposalWithModule /> },
    { path: "/finance/accounting/fixed-assets/capitalize/:code", component: <AssetCapitalizeWithModule /> },
    { path: "/finance/accounting/fixed-assets/depreciation-run", component: <DepreciationRunWithModule /> },
    { path: "/finance/accounting/fixed-assets/reports", component: <AssetReportsWithModule /> },



    // journey type
    { path: "/settings/journey-type/list", component: <JourneyMasterList /> },
    { path: "/settings/journey-type/list/create", component: <CreateJourneyType /> },
    { path: "/settings/journey-type/list/create/:id", component: <CreateJourneyType /> },
    // Campaign Module
    { path: "/marketing/campaign", component: <CampaignList /> },
    { path: "/marketing/campaign/create", component: <CreateCampaign /> },
    { path: "/marketing/campaign/create/:id", component: <CreateCampaign /> },
    { path: "/marketing/campaign/upload/create", component: <UploadCampaign /> },
    { path: "/marketing/campaign/upload/create/:id", component: <UploadCampaign /> },
    { path: "/marketing/campaign/upload", component: <CampaignUploadView /> },


    { path: "/marketing/link", component: <LinksList /> },
    { path: "/marketing/link/create", component: <CreateLinks /> },
    { path: "/marketing/link/create/:id", component: <CreateLinks /> },
    { path: "/marketing/media", component: <MediaList /> },
    { path: "/marketing/media/create", component: <CreateMedia /> },
    { path: '/marketing/media/create/:id', component: <CreateMedia /> },
    { path: '/sales/shareable-link', component: <ShareableLinkComponent /> },
    { path: '/marketing/campaign/summary', component: <CampaignDashboardWithModule /> },
    { path: '/marketing/campaign/:id', component: <AudienceListViewWithModule /> },
    { path: "/marketing/audience/create", component: <CampaignAudienceLeadFollowupCreate /> },
    { path: "/marketing/audience/:id", component: <CampaignAudienceLeadFollowupCreate /> },

    { path: "/sales/tele-audience-q", component: <CampaignAudienceListWithModule /> },
    { path: "/sales/tele-audience/create", component: <CampaignAudienceLeadFollowupCreate /> },
    { path: "/sales/tele-audience/create/:id", component: <CampaignAudienceLeadFollowupCreate /> },
    // Builder Management
    { path: "/settings/builders", component: <BuilderListView /> },
    { path: "/settings/builders/create", component: <BuilderCreateUpdate /> },
    { path: "/settings/builders/create/:id", component: <BuilderCreateUpdate /> },

    //verification
    { path: '/operations/verification/', component: <VerificationInitiate /> },
    { path: '/operations/verification/:id', component: <VerificationInitiate /> },
    { path: '/operations/verification/list', component: <VerificationQWrapped /> },
    { path: '/operations/verification/summary', component: <VerificationSummaryWrapped /> },
    { path: '/operations/verification/task/list', component: <VerificationViewWrapped /> },
    { path: '/operations/verification/transfer', component: <VerificationTransferWrapped /> },


    // Gst
    { path: '/settings/company-gst', component: <CompanyDetailsView /> },
    { path: '/setting/lender-gst', component: <CompanyDetailsView /> },
    { path: '/finance/gst-status', component: <GstStatus /> },
    { path: '/finance/gst/vendor-gst', component: <VendorGSTList /> },

    //tds
    { path: '/finance/tds/status', component: <VendorTDSStatusView /> },
    { path: "/finance/tds/filing", component: <TDSFilingView /> },


    //upload
    { path: "/settings/employer/upload", component: <EmployerUploadView /> },
    { path: '/settings/employer/upload/create', component: <UploadEmployer /> },


    ///Employer Module
    { path: "/settings/employer/list", component: <EmployerListView /> },
    { path: "/settings/employer/review/:id", component: <EmployerReviewComponent /> },
    { path: "/settings/map-list", component: <MapListView /> },


    //Employee Management - Index
    { path: "/settings/employee", component: <EmployeeManagementWrapped /> },
    //Employee Management - Add New
    { path: "/settings/add-employee", component: <EmployeeCreateUpdate /> },
    { path: "/settings/add-employee/:id", component: <EmployeeCreateUpdate /> },

    //HR Management - Employee List View with Salary Details
    { path: "/hr-mgmt/employee/salary-details/list", component: <EmployeeListViewWrapped /> },
    //HR Management - Employee Salary Details
    { path: "/hr-mgmt/employee/salary-details", component: <EmployeeSalaryDetailsWrapped /> },
    //HR Management - Leave Approvals
    { path: "/hr-mgmt/leave-mgmt/leave-requests", component: <LeaveApprovalsWrapped /> },
    //HR Management - Payroll Batch Process
    { path: "/hr-mgmt/payroll/batch-process", component: <BatchInvoiceFlow /> },
    { path: "/hr-mgmt/payroll/batch-process/:id", component: <BatchInvoiceFlow /> },
    //HR Management - Payroll Batch List
    { path: "/hr-mgmt/payroll/batch/list", component: <PayrollBatchListWrapped /> },

    { path: "/settings/delegation-matrix", component: <UnderwritingAdd /> },
    { path: "/settings/delegation-matrix/:id", component: <UnderwritingAdd /> },
    { path: "/settings/delegation-list", component: <UnderwritingList /> },


    //Provider
    { path: "/settings/provider-list", component: <ProviderListView /> },

    // Lender Onboarding - Loan Types List
    { path: "/settings/loan-types", component: <LoanTypeListView /> },

    // Lender Onboarding - Add Loan Types
    { path: "/settings/add-loan-types", component: <LoanTypeCreateUpdate /> },
    { path: "/settings/add-loan-types/:id", component: <LoanTypeCreateUpdate /> },
    // Lender Onboarding - lender list
    { path: "/settings/lender", component: <LenderListView /> },

    // Lender Onboarding - Add Lender
    { path: "/settings/add-lender", component: <CreateLender /> },
    { path: "/settings/add-lender/:id", component: <CreateLender /> },

    // Lender scheme
    { path: "/settings/scheme-list", component: <SchemeListViewComponent /> },
    { path: "/settings/add-scheme", component: <CreateUpdateScheme /> },
    { path: "/settings/add-scheme/:id", component: <CreateUpdateScheme /> },

    //Territory management
    { path: "/settings/territory-management", component: <TerritoryListView /> },
    { path: "/settings/add-territory", component: <TerritoryCreateUpdate /> },
    { path: "/settings/add-territory/:id", component: <TerritoryCreateUpdate /> },

    //Work flow
    { path: "/settings/workflow", component: <WorkflowList /> },
    { path: "/settings/workflow/create", component: <WorkflowCreateUpdate /> },
    { path: "/settings/workflow/create/:id", component: <WorkflowCreateUpdate /> },
    { path: "/settings/workflow/component", component: <WorkflowComponentList /> },
    //Lookup
    { path: '/settings/lookup-list', component: <LookupListView /> },
    { path: '/settings/lookup-master/create', component: <LookupCreateUpdate /> },

    //Configuration Providers
    { path: "/settings/template/list", component: <TemplateListWithModule /> },
    { path: "/settings/template/create", component: <TemplateCreateWithModule /> },
    { path: "/settings/template/create/:id", component: <TemplateCreateWithModule /> },

    //Configuration Templates
    { path: "/settings/templates", component: <ConfigtemplatesWithModule /> },

    //Doc Checklist
    { path: "/settings/document/checklist", component: <DocCheckList /> },
    { path: "/settings/document/checklist/create", component: <DocCheckListCreate /> },
    { path: "/settings/document/checklist/create/:id", component: <DocCheckListCreate /> },

    //Verification
    { path: "/settings/verification/list", component: <VerificationListView /> },
    { path: "/settings/verification/add-verification-type", component: <VerificationCreateUpdate /> },
    { path: "/settings/verification/add-verification-type/:id", component: <VerificationCreateUpdate /> },
    { path: "/verification/add-verification-allocation", component: <CreateVerificationAllocationRule /> },

    //Cam Configuration
    { path: "/settings/cam-configuration/list", component: <CamConfigurationListView /> },
    { path: "/settings/cam-configuration/create", component: <CreateCamConfiguration /> },
    { path: "/settings/cam-configuration/create/:id", component: <CreateCamConfiguration /> },

    //Rule Master
    { path: "/settings/rule/list", component: <RuleList /> },
    { path: "/settings/rule/create", component: <RuleCreateUpdate /> },
    { path: "/settings/rule/create/:id", component: <RuleCreateUpdate /> },
    { path: "/settings/apply-rule/list", component: <RuleCategoryListView /> },
    { path: "/settings/apply-rule/create", component: <RuleCategoryCreateUpdate /> },
    { path: "/settings/apply-rule/create/:id", component: <RuleCategoryCreateUpdate /> },
    { path: "/settings/portfolio-rule-master", component: <PortfolioRuleManagement /> },



    //Parameters
    { path: '/settings/parameter/list', component: <ParameterListView /> },
    { path: '/settings/parameter/create', component: <ParameterCreateUpdate /> },
    { path: '/settings/parameter/create/:id', component: <ParameterCreateUpdate /> },

    //User Profile
    { path: "/profile", withoutAuth: true, component: <UserProfileView /> },
    { path: "/change-password", withoutAuth: false, component: <ChangePasswordComponent /> },
    { path: "/shareable-links", withoutAuth: true, component: <ShareableLinksComponent /> },

    //channel Sales,
    //lender list route
    { path: '/settings/lender/pin-code/list', component: <UploadLenderList /> },
    { path: '/settings/lender/pin-code/create', component: <UploadLenderCreate /> },
    { path: '/lead/list', component: <LeadList /> },
    { path: '/fulfillment/list', component: <FulfillmentListWrapped /> },
    { path: '/fulfillment/fresh-list', component: <FulfillmentListFresh/>},
    { path: '/check-bureau/lead/list', component: <CheckBureauListView /> },
    { path: '/enquiry/lead/list', component: <EnquiryListView /> },
    { path: '/lead/list/fulfilled', component: <FulfilledLeadList /> },
    { path: '/lead/list/archived', component: <ArchivedLeadList /> },
    { path: '/lead/lender-view', component: <LenderViewComponent /> },
    { path: '/ask/list', component: <ChannelAskListView /> },
    { path: '/partner/list', component: <PartnerLeadsList /> },
    { path: '/ask/list', component: <ChannelAskListView /> },
    { path: '/partner/list', component: <ChannelListView /> },
    { path: '/lead/create', component: <LeadCreate /> },
    { path: '/lead/create/:id', component: <LeadCreate /> },
    { path: '/lead/dedupe-q', component: <DedupeQList /> },
    { path: '/activity/live-tracking', component: <LiveTrackingView /> },
    { path: '/activity/daily-activity', component: <DailyActivityView /> },
    { path: '/activity/lead-disposition', component: <LeadDispositionReports /> },
    { path: '/activity/partner-disposition', component: <PartnerDispositionReports /> },
    { path: "/activity/overall-activity", component: <OverallActivityView /> },


    { path: "/market-place/manual/list", component: <LeadList /> },
    { path: "/market-place/stp/list", component: <LeadList /> },


    { path: "/lead/transfer", component: <LeadTransferQ /> },

    //LOS
    { path: '/los/login-initiate', component: <LOSLoginInitiate /> },
    { path: '/los/login-initiate/:id', component: <LOSLoginInitiate /> },
    { path: '/los/login-q', component: <LoginListView /> },
    { path: '/los/login-view', component: <LoginListView /> },
    { path: '/los/appraisal-q', component: <LoginListView /> },
    { path: '/los/appraisal-view', component: <LoginListView /> },
    { path: '/los/underwriting-q', component: <LoginListView /> },
    { path: '/los/underwriting-view', component: <LoginListView /> },
    { path: '/los/acceptance-q', component: <LoginListView /> },
    { path: '/los/acceptance-view', component: <LoginListView /> },
    { path: '/los/appeal-q', component: <LoginListView /> },
    { path: '/los/appeal-view', component: <LoginListView /> },

    //enquiry mgmt
    { path: '/enquiry/customer/list', component: <EnquiryListView /> },
    { path: '/enquiry/customer/lead', component: <EnquiryCustomerLeadsFollowUpCreate /> },
    { path: '/enquiry/customer/lead/:id', component: <EnquiryCustomerLeadsFollowUpCreate /> },

    //car Journey --POC
    { path: '/vehicle/lead/create', component: <AutoFlow /> },
    { path: '/vehicle/lead/create/:id', component: <AutoFlow /> },
    { path: "/settings/trade-advance", component: <TradeAdvanceWrapped /> },
    { path: "/settings/trade-advance/list", component: <AddTradeAdvanceWrapped /> },
    { path: "/settings/trade-advance-tracker", component: <TrackerWrapped /> },
    { path: "/settings/used-vehicle-makes", component: <VehicleMake /> },
    { path: "/settings/vehicle-models", component: <VehicleModel /> },
    { path: "/settings/vehicle-price-matrix", component: <PriceMatrixIndex /> },
    { path: "/settings/new-vehicle-price", component: <NewVehiclePrice /> },

    //Reports MIS
    { path: "/reports/mis/process-status", component: <ProcessStatusView /> },
    { path: "/mobile/reports/mis/process-status", withOutHeader: true, component: <ProcessStatusView /> },
    { path: "/reports/mis/bank-performance", component: <BankPerformanceView /> },
    { path: "/mobile/reports/mis/bank-performance", withOutHeader: true, component: <BankPerformanceView /> },
    { path: "/reports/mis/source-productivity", component: <SourceProductivityView /> },
    { path: "/mobile/reports/mis/source-productivity", withOutHeader: true, component: <SourceProductivityView /> },
    { path: "/reports/mis/product-performance", component: <ProductPerformanceView /> },
    { path: "/mobile/reports/mis/product-performance", withOutHeader: true, component: <ProductPerformanceView /> },
    { path: "/reports/mis/month-wise-performance", component: <MonthWisePerformanceView /> },
    { path: "/mobile/reports/mis/month-wise-performance", withOutHeader: true, component: <MonthWisePerformanceView /> },
    { path: "/reports/mis/pendency-reports", component: <PendencyReportsView /> },
    { path: "/mobile/reports/mis/pendency-reports", withOutHeader: true, component: <PendencyReportsView /> },
    { path: "/reports/mis/channel-sales-reports", component: <ChannelSales /> },

    // Scoring Engine
    //UI only
    { path: "/settings/scoring-engine", component: <ScoringEnginelist /> },
    { path: "/settings/scoring-engine/add", component: <ScoringEngineCreate /> },
    { path: "/settings/scoring-engine/:id", component: <ScoringEngineCreate /> },

    // Purchase Order
    { path: "/purchase/purchase-order-list", component: <PurchaseOrderListWithModule /> },
    { path: "/purchase/purchase-order-add", component: <AddPurchaseOrderWithModule /> },
    { path: "/purchase/customer-purchase-order", component: <AddCustomerPurchaseOrderWithModule /> },
    { path: "/purchase/purchase-invoice-add", component: <AddPurchaseInvoiceWithModule /> },
    { path: "/purchase/purchase-invoice-list", component: <PurchaseInvoiceListWithModule /> },
    { path: "/purchase/purchase-requisition", component: <PurchaseRequisitionWithModule /> },

    { path: "/reports/mis/conveyance-report", component: <ConveyanceReportView /> },
    { path: "/reports/mis/attendance-report", component: <AttendanceReports /> },
    { path: "/reports/mis/attendance-monthly-summary", component: <MonthlySummaryAttendance /> },
    { path: "/reports/mis/daily-sales-report", component: <DailySalesReports /> },
    { path: "/reports/mis/collection", component: <CollectionReportWithModule /> },
    { path: "/reports/mis/verification-tat-report", component: <VerificationTATReportView /> },
    { path: "/reports/mis/conveyance-distance-report", component: <ConveyanceReportsDistance /> },
    { path: "/partner/renewal/:id", component: <PartnerRenewalFlow /> },
    { path: "/partner/renewal/list/:Status", component: <PartnerRenewalsList /> },
    //Channel Partner Management
    { path: "/partner/onboarding/archived", component: <PartnerArchivedList /> },
    { path: '/partner/onboarding/inactive', component: <PartnerInactiveList /> },
    { path: "/partner/onboarding/in-progress", component: <PartnerListInProgress /> },
    { path: "/partner/onboarding/pending", component: <PartnerApprovalPending /> },
    { path: "/partner/onboarding/rejected", component: <RejectedPartnerListWrapped /> },
    { path: "/partner/onboarding/approved", component: <PartnerApprovedListWrapped /> },
    { path: "/partner/onboarding/child-partner", component: <ChildPartnerListWithModule /> },
    { path: "/partner/onboarding/child-partner/approval", component: <ChildPartnerApprovalWithModule /> },
    { path: "/partner/onboarding/approved/:id", component: <ApprovedPartner /> },
    { path: "/partner/onboarding", component: <PartnerCreateWithDynamic /> },
    { path: "/partner/mobile/onboarding", withOutHeader: true, component: <PartnerCreateWithDynamic /> },
    { path: "/partner/onboarding/:id", component: <PartnerCreateWithDynamic /> },
    { path: "/partner/user/list", component: <PartnerUserList /> },

    //BC partner onboarding
    { path: "/bc/partner/onboarding", component: <PartnerCreateWithDynamic /> },
    { path: "/bc/partner/onboarding/:id", component: <PartnerCreateWithDynamic /> },
    { path: "/bc/partner/onboarding/in-progress", component: <PartnerListInProgress /> },
    { path: "/bc/partner/onboarding/pending", component: <PartnerApprovalPending /> },
    { path: "/bc/partner/onboarding/approved", component: <PartnerApprovedListWrapped /> },
    { path: "/bc/partner/onboarding/approved/:id", component: <ApprovedPartner /> },
    { path: "/bc/partner/onboarding/rejected", component: <RejectedPartnerListWrapped /> },
    { path: "/bc/partner/onboarding", component: <PartnerApprovalComponent /> },
    { path: "/bc/partner/onboarding/:id", component: <PartnerApprovalComponent /> },
    { path: "/bc/partner/renewal/list/:Status", component: <PartnerRenewalsList /> },
    { path: "/bc/partner-view", component: <ChannelListView /> },
    { path: '/bc/partner/bulk-upload', component: <PartnerUpload /> },


    { path: "/partner/mobile/onboarding/:id", withOutHeader: true, component: <PartnerCreateWithDynamic /> },
    // { path: "/partner-view", component: <ChannelListView /> }
    { path: "/partner/onboarding", component: <PartnerApprovalComponent /> },
    { path: "/partner/mobile/onboarding", withOutHeader: true, component: <PartnerApprovalComponent /> },
    { path: "/partner/onboarding/:id", component: <PartnerApprovalComponent /> },
    { path: "/partner/mobile/onboarding/:id", withOutHeader: true, component: <PartnerApprovalComponent /> },
    // {path: "/partner-view", component: <ChannelList/>},
    { path: "/partner-view", component: <NewChannelListView /> },
    { path: '/customer360-relationship', component: <Customer360Relationship /> },
    { path: '/customer360-relationship/:id', component: <Customer360Relationship /> },
    { path: "/reports/leads", component: <LeadStatus /> },
    { path: "/reports/partners", component: <PartnersReportDownload /> },
    { path: "/reports/bank-analyser", component: <BankAnalyzerView /> },
    { path: "/mobile/reports/bank-analyser", withOutHeader: true, component: <BankAnalyzerView /> },
    { path: "/reports/bureau-analyser", component: <BureauAnalyzerView /> },
    { path: "/mobile/reports/bureau-analyser", withOutHeader: true, component: <BureauAnalyzerView /> },
    { path: "/partner/impersonate", component: <UserImpersonateComponent /> },

    //Vendor Management
    { path: "/vendor/onboarding", component: <VendorCreateWithDynamic /> },
    { path: "/vendor/onboarding/:id", component: <VendorCreateWithDynamic /> },
    { path: "/vendor/onboarding/in-progress", component: <VendorInProgress /> },
    { path: "/vendor/onboarding/pending", component: <VendorApprovalPendingWrapped /> },
    { path: "/vendor/onboarding/rejected", component: <RejectedVendorListWrapped /> },
    { path: "/vendor/onboarding/approved", component: <VendorApprovedListWrapped /> },
    { path: "/vendor/onboarding/approved/:id", component: <VendorApprovedListEditWrapped /> },
    { path: "/vendor/mobile/onboarding", withOutHeader: true, component: <VendorCreateWithDynamic /> },
    { path: "/vendor/onboarding/:id", component: <VendorCreateWithDynamic /> },
    { path: "/vendor/mobile/onboarding/:id", withOutHeader: true, component: <VendorCreateWithDynamic /> },

    //collection vendor onboarding
    { path: "/collection/vendor/onboarding", component: <VendorCreateWithDynamic /> },
    { path: "/collection/vendor/onboarding/:id", component: <VendorCreateWithDynamic /> },
    { path: "/collection/vendor/onboarding/in-progress", component: <VendorInProgress /> },
    { path: "/collection/vendor/onboarding/pending", component: <VendorApprovalPendingWrapped /> },
    { path: "/collection/vendor/onboarding/rejected", component: <RejectedVendorListWrapped /> },
    { path: "/collection/vendor/onboarding/approved", component: <VendorApprovedListWrapped /> },
    { path: "/collection/vendor/onboarding/approved/:id", component: <VendorApprovedListEditWrapped /> },
    { path: "/collection/vendor/mobile/onboarding", withOutHeader: true, component: <VendorCreateWithDynamic /> },
    { path: "/collection/vendor/onboarding/:id", component: <VendorCreateWithDynamic /> },
    { path: "/collection/vendor/mobile/onboarding/:id", withOutHeader: true, component: <VendorCreateWithDynamic /> },

    // Legal Action Flow Module Routes
    { path: "/legal/action-view", component: <LegalFlowWithModule /> },
    { path: "/legal/approval-view", component: <LegalViewWithModule /> },
    { path: "/legal/action-view/:id", component: <LegalApprovalFlowWithModule /> },
    { path: "/legal/view", component: <LegalViewWithModule /> },
    { path: "/legal/workflow", component: <LegalFlowWithModule /> },
    { path: "/legal/workflow/:id", component: <LegalFlowWithModule /> },
    { path: "/legal/pre-notice-list", component: <PreLegalNoticeListWithModule /> },
    { path: "/legal/pre-notice/:id", component: <PreLegalNoticeSteps /> },
    { path: "/collection/repossession/:id", component: <RepossessionFlowWithModule /> },
    { path: "/collection/repossession/view", component: <RepossessionViewWithModule /> },

    { path: "/legal/section-138-list", component: <Section138ListView /> },
    { path: "/legal/lok-adalat-list", component: <LokAdalatListView /> },
    { path: "/legal/civil-list", component: <CivilListView /> },
    { path: "/legal/sarfaesi-list", component: <SarfaesiListView /> },
    { path: "/legal/arbitration-list", component: <ArbitrationListView /> },


    //Collections
    { path: "/collection/field/add-recovery", component: <CollectionFlow /> },
    { path: "/collection/field/add-recovery/:id", component: <CollectionFlow /> },
    { path: "/collection/follow-up/:id", component: <CollectionFlow /> },
    { path: "/collection/follow-up", component: <CollectionFlow /> },
    { path: "/collection/upload/list", component: <UploadedCollectionListView /> },
    { path: "/upload/collection", component: <UploadCollectionsWrapped /> },
    { path: "/active/accounts", component: <ActiveAccountsList /> },
    { path: "/closed/accounts", component: <ClosedAccountsList /> },
    { path: "/tele/collect/list-q", component: <TeleCollectionQ /> },
    { path: "/tele/collect/list/view", component: <TeleCollectionView /> },
    { path: "/collection/field/collection-q", component: <FieldCollectionQ /> },
    { path: "/collection/field/collection-view", component: <FieldCollectionView /> },
    { path: "/collection/summary", component: <CollectionSummary /> },
    { path: "/collection/digi-collect/list/view", component: <MessageView /> },
    { path: "/collection/campaign/list", component: <CampaignList /> },
    { path: "/collection/campaign/summary", component: <CampaignDashboardWithModule /> },
    { path: '/collection/campaign/:id', component: <AudienceListViewWithModule /> },
    { path: "/collection/campaign/create", component: <CreateCampaign /> },
    { path: "/collection/campaign/create/:id", component: <CreateCampaign /> },
    { path: "/collection/campaign/upload/create", component: <UploadCampaign /> },
    { path: "/collection/campaign/upload/create/:id", component: <UploadCampaign /> },
    { path: "/collection/campaign/upload", component: <CampaignUploadView /> },

    //OTS collection

    { path: "/collection/ots-initiate", component: <OTSInitiate /> },
    { path: "/collection/ots-initiate/:id", component: <OTSWorkflow /> },


    { path: "/cron/jobs", component: <CronView /> },

    // Disbursement
    { path: "/part-disbursement/flow", component: <DisbursementFlowWrapped /> },
    { path: "/part-disbursement/flow/:id", component: <DisbursementFlowWrapped /> },
    { path: "/disbursement/batch-process", component: <DisbursementBatchList /> },

    //repayment flow
    { path: "/repayment/follow-up", component: <RepaymentFlow /> },
    { path: "/repayment/follow-up/:id", component: <RepaymentFlow /> },

    { path: "/collection/summary", component: <CollectionIndex /> },
    { path: "/loan/account/create", component: <LoanAccountCreationFlow /> },
    { path: "/loan/account/create/:id", component: <LoanAccountCreationFlow /> },
    { path: "/loan/account/pending", component: <PendingLoan /> },
    { path: "/loan/account/upload", component: <LoanAccountUpload /> },
    //APF Management
    { path: "/apf/onboarding", component: <ApfCreateWithDynamic /> },
    { path: "/apf/onboarding/:id", component: <ApfCreateWithDynamic /> },
    { path: "/apf/onboarding/in-progress", component: <ApfInProgress /> },
    { path: "/apf/onboarding/pending", component: <ApfApprovalPendingWrapped /> },
    { path: "/apf/onboarding/rejected", component: <RejectedApfListWrapped /> },
    { path: "/apf/onboarding/approved", component: <ApfApprovedListWrapped /> },
    { path: "/apf/onboarding/approved/:id", component: <ApfApprovedListEditWrapped /> },
    { path: "/apf/mobile/onboarding", withOutHeader: true, component: <ApfCreateWithDynamic /> },
    { path: "/apf/onboarding/:id", component: <ApfCreateWithDynamic /> },
    { path: "/apf/mobile/onboarding/:id", withOutHeader: true, component: <ApfCreateWithDynamic /> },

    // NPA Rules Management
    { path: "/settings/npa-rules-list", component: <NpaRulesList /> },
    { path: "/settings/create-npa-rule", component: <NpaRulesCreateOrUpdate /> },
    { path: "/settings/npa-rule/:id", component: <NpaRulesCreateOrUpdate /> },



    //payout document filter
    { path: "/sales/payout-document", component: <PayoutDocumentFilterWrapped /> },
    { path: "/finance/payout-document", component: <PayoutDocumentFilterWrapped /> },


    //Roles and rights
    { path: '/settings/role', component: <RoleAndAccessRightsListView /> },
    { path: '/settings/role/create', component: <CreateRoleAndAccessRights /> },
    { path: '/settings/role/create/:id', component: <CreateRoleAndAccessRights /> },

    // Usage Report
    { path: "/reports/system-usage-report", component: <PlatformUsageReportView /> },
    { path: "/reports/user-login-report", component: <UserLoginReportList /> },
    { path: "/reports/lead-journey", component: <LeadFunnelReport /> },
    //beat plan
    { path: "/beat-plan/list", component: <BeatPlanViewWithModule /> },
    { path: "/beat-plan/:id", component: <BeatPlanManagementWithModule /> },
    { path: "/beat-actual/:id", component: <BeatPlanActualWithModule /> },
    { path: "/beat-actual/view", component: <BeatPlanActualViewWithModule /> },
    //user Utility
    { path: '/utility/pincode-eligibility', component: <PincodeEligibilityCheck /> },
    { path: '/utility/lead-reassign', component: <UtilityreassignLead /> },
    { path: '/utility/business-card', component: <BusinessCardWithModule /> },

    { path: '/utility/doc-checklist-share', component: <DocChecklistShareWithModule /> },

    { path: '/lead/list/login-q', component: <LeadLoginQ /> },
    { path: '/lead/list/tracking-q', component: <LeadTrackingQ /> },
    { path: '/lead/list/disbursed-q', component: <LeadDisbursedQ /> },
    { path: '/lead/list/rejected-q', component: <LeadRejectedQ /> },
    { path: '/lead/list/approval-q', component: <ApprovalQ /> },

    //Bulk Upload
    { path: '/partner/bulk-upload', component: <PartnerUpload /> },
    { path: '/lead/bulk-upload', component: <LeadUpload /> },
    { path: '/enquiry/bulk-upload', component: <EnquiryUpload /> },

    //Vehicle Master
    { path: '/settings/vehicle', component: <VehicleView /> },
    // { path: '/settings/vehicle-details', component: <VehicleDetails /> },

    //Bc onboarding
    { path: '/bc/onboarding', component: <BcOnboarding /> },
    { path: '/bc/onboarding/:id', component: <BcOnboarding /> },
    { path: '/bc/pending', component: <BCPendingApproval /> },
    { path: '/bc/portfolio/view', component: <BCPendingApproval /> },
    { path: '/attach/fldg/add', component: <BCFLDGAttach /> },
    { path: '/attach/fldg/add/:id', component: <BCFLDGAttach /> },
    { path: '/attach/loan-account/add', component: <BCAttachLoanAccount /> },
    { path: '/attach/loan-account/add/:id', component: <BCAttachLoanAccount /> },
    { path: '/attach/fldg', component: <BCFLDGAttachList /> },
    { path: '/attach/loan-account', component: <BCAttachLoanAccountList /> },

    //Modules
    { path: '/settings/module/list', component: <ModuleListView /> },
    { path: '/settings/module/create', component: <CreateModule /> },
    { path: '/settings/module/create/:id', component: <CreateModule /> },
    { path: '/settings/lender/eligible-pincode/list', component: <LenderEligiblePincodeList /> },
    {
        path: "/",
        exact: true,
        component: <Navigate to="/default/route" />,
    },
    { path: "*", component: <Navigate to="/default/route" /> },

    // Bureau Reporting Routes
    { path: "/reports/bureau-reports-list", component: <BureauReportListView /> },
    { path: "/reports/bureau-report-flow/:id", component: <BureauReportingFlow /> },
    { path: "/reports/bureau-report-flow", component: <BureauReportingFlow /> },


    // Target Management Routes

    { path: "/target/plan-list", component: <TargetPlanListView /> },
    { path: "/target/add-plan", component: <TargetAddPlan /> },
    { path: "/target/add-plan/:id", component: <TargetAddPlan /> },
    // {path: "/target/add-plan/:id", component: <CreateScheme/>},

    { path: "/assign-target/list-view", component: <AssignTargetListView /> },
    { path: "/assign-target", component: <AssignTarget /> },
    { path: "/track-performance", component: <TrackPerformancePage /> },
    { path: "/incentive/attached-employees/list", component: <AttachEmployeeIncentives /> },
    { path: "/assign-incentive", component: <AssignIncentive /> },


    // Sales Planning/Territory Target

    { path: "/territory-target/list", component: <WithModuleTerritoryTargetList /> },
    { path: "/territory-target/create", component: <TerritoryTargetFlow /> },
    { path: "/territory-target/create/:id", component: <TerritoryTargetFlow /> },

    //Collection payable
    { path: "/collection/partner-scheme-list", component: <SchemeListComponent /> },
    { path: "/collection/incentive-scheme-list", component: <SchemeListComponent /> },
    { path: "/collection/incentive-plan-list", component: <CollectionEmployeePayout /> },
    { path: "/collection/incentive-estimate-list", component: <CollectionEmployeeEstimate /> },
    { path: "/collection/payable/estimate-list", component: <CollectionPartnerEstimate /> },
    { path: "/collection/incentive-invoice-list", component: <CollectionEmployeeInvoice /> },
    { path: "/collection/payout-plan-list", component: <CollectionPartnerPayout /> },
    { path: "/collection/invoice", component: <CollectionPartnerInvoice /> },

    //Incentive Mgmt
    //Scheme Definition
    { path: "/finance/incentive-scheme-list", component: <SchemeListComponent /> },
    { path: "/finance/add-incentive-scheme", component: <CreateScheme /> },
    { path: "/finance/add-incentive-scheme/:id", component: <CreateScheme /> },

    //Payout plan
    { path: '/finance/incentive-plan-list', component: <IncentivePlanList /> },
    { path: '/finance/add-incentive-plan', component: <CreatePayOutPlan /> },
    { path: '/finance/add-incentive-plan/:id', component: <CreatePayOutPlan /> },

    //Estimate
    { path: '/finance/incentive-estimate-list', component: <SalesEstimateList /> },

    //Earnings
    { path: '/finance/sales-incentive/earnings', component: <SalesIncentiveEarnings /> },
    { path: '/finance/sales-payable/earnings', component: <PartnerReceivableEarnings /> },

    //LMS
    { path: "/loan-management/view", component: <LoanAccountManagementView /> },
    { path: "/loan-management/repayment/:id", component: <NavigationTabView /> },
    { path: "/loan-management/repayment-new/:id", component: <NavigationTabViewNew /> },
    { path: "/reschedule/simulate", component: <Reschedule /> },
    { path: "/add-service-request", component: <ServiceRequestFlow /> },
    { path: "/service-request/queue", component: <ServiceRequestQWithModule /> },
    { path: "/add-service-request", component: <ServiceRequestFlow /> },
    { path: "/service-request/queue", component: <ServiceRequestQWithModule /> },
    { path: "/loan-management/reschedule-request", component: <Reschedule /> },
    { path: "/add-service-request", component: <ServiceRequestFlow /> },
    { path: "/add-service-request/:id", component: <ServiceRequestFlow /> },
    { path: "/service-request/queue", component: <ServiceRequestQWithModule /> },
    { path: "/add-reschedule", component: <RescheduleFlow /> },
    { path: "/add-reschedule/:id", component: <RescheduleFlow /> },
    { path: "/loan-management/reschedule-queue", component: <RescheduleQWithModule /> },
    { path: "/reschedule/details/:id", component: <RescheduleQWithModule /> },
    { path: "/field-collect-branch-list", component: <FieldCollectorBranchDepositListWithModule /> },
    { path: "/field-collect-branch-deposit/new", component: <FieldCollectWorkflowWithModule /> },
    { path: "/field-collect-branch-deposit/:id", component: <FieldCollectWorkflowWithModule /> },
    { path: "/branch-cash-deposit/list", component: <BranchCashDepositListWithModule /> },
    { path: "/branch-cash-deposit/new", component: <BranchCashDepositWorkflowWithModule /> },
    { path: "/branch-cash-deposit/:id", component: <BranchCashDepositWorkflowWithModule /> },
    { path: "/loan-management/loan-account-statement", component: <LoanAccountStatementWithModule /> },


    // Restructure Management Routes
    { path: "/loan-management/restructure-request", component: < RestructureFlowWithModule /> },
    { path: "/loan-management/restructure-queue", component: < RestructureQWithModule /> },
    { path: "/loan-management/restructure-request/:id", component: < RestructureFlowWithModule /> },

    //bank statement reconciliation system
    { path: "/lms/bank-statement-reconciliation", component: <ReconciliationIndex /> },

    { path: "/part-disbursement", component: <PartDisbursement /> },
    { path: "/beneficiary-credit", component: <DisbursementRequestWrap /> },
    { path: "/new-beneficiary-credit", component: <NewDisbursementWrap /> },
    { path: "/part-disbursement/flow/list", component: <SanctionedQ /> },

    // LMS Reports
    { path: "/reports/lms/dashboard", component: <LmsDashboardWithModule /> },
    { path: "/reports/lms/collection-efficiency", component: <CollectionEfficiencyReportWithModule /> },
    { path: "/reports/lms/dpd-aging", component: <DpdAgingReportWithModule /> },
    { path: "/reports/lms/interest-accrual", component: <InterestAccrualReportWithModule /> },
    { path: "/reports/lms/npa-movement", component: <NpaMovementReportWithModule /> },
    { path: "/reports/lms/portfolio-overview", component: <PortfolioOverviewReportWithModule /> },


];

const publicRoutes = [
    // Authentication Page
    { path: "/logout", component: <Logout /> },
    { path: "/login", component: <LoginMethod /> },
    { path: "/forgot-password", component: <ForgotPassword /> },
    { path: "/reset-password/:id", component: <ResetPassword /> },
    { path: "/lead/mobile/create/:id", withOutHeader: true, component: <LeadCreate /> },
    { path: "/lead/mobile/create", withOutHeader: true, component: <LeadCreate /> },
    { path: "/form-ui-builder/", withOutHeader: true, component: <StepConfigurationFormBuilder /> },
    { path: "/form-ui-builder/:id", withOutHeader: true, component: <StepConfigurationFormBuilder /> },
    { path: "/terms-conditions", component: <TermsConditionsBureau /> },
    { path: '/default/route', component: <DefaultRoute /> },
    { path: '/meet/join', withOutHeader: true, withoutAuth: true, component: <VideoCallRoom /> }


];

export { authProtectedRoutes, publicRoutes };