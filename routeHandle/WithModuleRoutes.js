import withModule from "../Components/Utility/WithModule";
import DashboardLeads from "../Components/Common/Dashboard";
import Summary from "../Components/Common/Dashboard/Summary"
import LeadDownloads from "../pages/Reports/LeadDownloads";
import PartnerCreate from "../pages/Channel/PartnerMgmt/PartnerCreate";
import VendorCreate from "../pages/Channel/VendorMgmt/VendorCreate";
import ApfCreate from "../pages/Channel/ApfMgmt/ApfCreate";
import ListInProgress from "../pages/Channel/PartnerMgmt/ListInProgress";
import VendorListInProgress from "../pages/Channel/VendorMgmt/ListInProgress";
import ApfListInProgress from "../pages/Channel/ApfMgmt/ListInProgress";
import ApprovalPending from "../pages/Channel/PartnerMgmt/ApprovalPending";
import VendorApprovalPending from "../pages/Channel/VendorMgmt/ApprovalPending";
import ApfApprovalPending from "../pages/Channel/ApfMgmt/ApprovalPending";
import ApprovedList from "../pages/Channel/PartnerMgmt/ApprovedPartnerList";
import VendorApprovedList from "../pages/Channel/VendorMgmt/ApprovedList";
import ApfApprovedList from "../pages/Channel/ApfMgmt/ApprovedList";
import RejectedPartnerList from "../pages/Channel/PartnerMgmt/RejectedPartnerList";
import RejectedVendorList from "../pages/Channel/VendorMgmt/RejectedPartnerList";
import RejectedApfList from "../pages/Channel/ApfMgmt/RejectedApfList";
import EmployeeManagement from "../pages/Configuration/Employee/EmployeeList"
import EmployeeListView from "../pages/HRMgmt/EmployeeListView"
import EmployeeSalaryDetails from "../pages/HRMgmt/EmployeeSalaryDetails"
import LeaveApprovals from "../pages/HRMgmt/LeaveApprovals"
import PayrollBatchList from "../pages/HRMgmt/PayrollBatchList"
import VerificationSummary from "../pages/Verification/Dashboard"
import VerificationQ from "../pages/Verification/VerificationList"
import VerificationView from "../pages/Verification/VerificationTaskList"
import VerificationTransfer from "../pages/Verification/VerificationTransfer"
import fullFillmentList from "../Components/Lead/FullFillmentList";
import PlanListView from "../pages/TargetMgmt/PlanListView";
import AddPlan from "../pages/TargetMgmt/AddPlan";
import ListView from "../pages/PerformanceMgmt/AssgnTarget/ListView";
import TrackPerformance from "../pages/PerformanceMgmt/TrackPerformance";
import AssignTargetSteps from "../pages/PerformanceMgmt/AssgnTarget/AssignTargetSteps";
import ChannelLeadList from "../pages/Channel/ChannelLeadList";
import EmployeeIncentiveListView from "../pages/PerformanceMgmt/AttachIncentives/ListView"
import IncentiveSteps from "../pages/PerformanceMgmt/AttachIncentives/IncentiveSteps";
import ListIndex from "../Components/Collections/Upload";
import ActiveAccounts from "../pages/Lms/ActiveAccounts/index";
import CollectionView from "../Components/Collections/TeleCollect/CollectionView";
import collectionQ from "../Components/Collections/TeleCollect/CollectionQ";
import FieldCollectionQList from "../Components/Collections/FieldCollect/CollectionQ"
import FieldCollectionViewList from "../Components/Collections/FieldCollect/CollectionView"
import CollectionFollowFlow from "../Components/Collections/CollectionFlow";
import RepaymentFlowList from "../Components/RepaymentManagement/RepaymentFlow"
import ClosedAccountList from "../pages/Lms/ClosedAccounts/index";
import SchemeListView from "../pages/PayableReceivableMgmt/SchemeListView";
import PayoutListView from "../pages/PayoutPlan/PayoutListView";
import PayableEstimate from "../pages/PayableReceivableMgmt/Estimate/index";
import SalesEstimate from "../pages/IncentiveModule/Estimate"
import SalesEarnings from "../pages/IncentiveModule/Earnings"
import GstListView from "../pages/PayableReceivableMgmt/GstStatus/ListView"
import IncentiveStatement from "../Components/PayableReceivableManagement/InVoice/IncentiveStatement";
import BCOnboardingFlow from "../Components/BCOnboarding/BCOnboardingFlow";
import PendingApprovalList from "../Components/BCOnboarding/PendingApprovalList";
import AttachFLDG from "../Components/BCOnboarding/PortfolioMgmt/AttachFLDG/AttachFLDG";
import AttachLoanAccount from "../Components/BCOnboarding/PortfolioMgmt/AttachLoanAccount/AttachLoanAccount";
import AttachedFLDGList from "../Components/BCOnboarding/PortfolioMgmt/AttachFLDG/AttachedFLDGList";
import AttachedLoanAccountList
    from "../Components/BCOnboarding/PortfolioMgmt/AttachLoanAccount/AttachedLoanAccountList";
import PartnerEarnings from "../pages/IncentiveModule/ParnterEarnings";
import Invoice from "../Components/PayableReceivableManagement/InVoice/Invoice";
import FormBuilder from "../pages/Workflow/FormBuilderUIComponent/FormBuilder";
import List from "../pages/Workflow/Field and Component Master/list";
import CreateUpdate from "../pages/Workflow/Field and Component Master/CreateUpdate";
import AddScheme from "../pages/PayableReceivableMgmt/AddScheme";
import Estimate from "../pages/IncentiveModule/Estimate";
import LenderInvoice from "../pages/PayableReceivableMgmt/Invoice/LenderInvoice";
import WithHeldInvoice from "../Components/PayableReceivableManagement/InVoice/WithHeldInvoice";
import GSTReverseInvoice from "../Components/PayableReceivableManagement/InVoice/GSTReverseInvoice";
import GSTFiling from "../Components/PayableReceivableManagement/InVoice/VendorGSTFiling";
import InvoiceProcessing from "../pages/PayableReceivableMgmt/Invoice/InvoiceProcessing";
import AddPayoutPlan from "../pages/PayoutPlan/AddPayoutPlan";
import UploadPayoutPlan from "../pages/PayableReceivableMgmt/Lender/UploadPayoutPlan";
import PayoutReconciliationView from "../pages/PayableReceivableMgmt/Lender/PayoutReconciliationView";
import Adjustments from "../Components/PayableReceivableManagement/InVoice/Adjustments";
import TargetReport from "../pages/TargetMgmt/TargetReport/index";
import CdnFileManager from "../pages/Configuration/CDNFileManager/CDNFiles";
import ChartsOfAccounts from "../Components/Accounting/ChartsOfAccounts/ChartsOfAccounts";
import AddChartsOfAccounts from "../Components/Accounting/ChartsOfAccounts/AddChartsOfAccounts";
import AccountingTemplate from "../Components/Accounting/AccountingTemplate/AccountingTemplate";
import AddAccountingTemplate from "../Components/Accounting/AccountingTemplate/AddAccountingTemplate";
import GeneralLedgerView from "../Components/Accounting/GeneralEntry/GeneralLedgerView";
import AddGeneralLedger from "../Components/Accounting/GeneralEntry/AddGeneralLedger";
import CostCenterView from "../Components/Accounting/CostCenter/COSCenterView";
import AddCostCenter from "../Components/Accounting/CostCenter/AddCostCenter";
import GeneralLedgerBalance from "../Components/Accounting/GeneralLeadgerBalance/GeneralLedgerBalance";
import AmortisationView from "../Components/Accounting/AmortView/AmortView";
import BankAccountDetails from "../pages/CompanyDetails/BankAccountDetails";
import JourneyMaster from "../pages/JourneyMaster/JourneyMaster";
import AddJourneyType from "../pages/JourneyMaster/AddJourneyType";
import Campaign from "../pages/Marketing/CampaignMgmt/Campaign";
import AddCampaign from "../pages/Marketing/CampaignMgmt/Campaign/AddCampaign";
import Upload from "../pages/Marketing/CampaignMgmt/Campaign/Upload";
import CampaignUploadList from "../pages/Marketing/CampaignMgmt/Campaign/Upload/List";
import Links from "../pages/Marketing/MarketingAssets/Links";
import AddLinks from "../pages/Marketing/MarketingAssets/Links/addLinks";
import Media from "../pages/Marketing/MarketingAssets/Media";
import AddMedia from "../pages/Marketing/MarketingAssets/Media/addMedia";
import ShareableLink from "../Components/ShareableLinks";
import BuilderList from "../pages/Builder/BuildersList";
import BuilderFlow from "../pages/Builder/BuilderFlow";
import VerificationFlow from "../Components/Verification/VerificationFlow";
import CompanyDetails from "../Components/PayableReceivableManagement/Gst/GstDetails";
import VendorTDSStatus from "../Components/PayableReceivableManagement/TDS/VendorTDSStatus";
import TDSFiling from "../Components/PayableReceivableManagement/TDS/VendorTDSFiling";
import UploadList from "../pages/Configuration/EmployerMgmt/UploadList";
import AddUpload from "../pages/Configuration/EmployerMgmt/AddUpload";
import mcaList from "../pages/Configuration/EmployerMgmt/mcaList";
import VendorGSTListView from "../pages/PayableReceivableMgmt/VendorGSTListView";
import EmployerReview from "../pages/Configuration/EmployerMgmt/EmployerReview";
import MapList from "../pages/Configuration/EmployerMgmt/mapList";
import EmployeeFlow from "../pages/Configuration/Employee";
import LoanTypeList from "../pages/Configuration/LenderOnboarding/LoanType/LoanTypeList";
import LoanTypeFlow from "../pages/Configuration/LenderOnboarding/LoanType";
import LenderList from "../pages/Configuration/LenderOnboarding/Lender/LenderList";
import LenderAdd from "../pages/Configuration/LenderOnboarding/Lender";
import SchemeList from "../pages/Configuration/LenderOnboarding/Lender Scheme/SchemeList";
import SchemeAdd from "../pages/Configuration/LenderOnboarding/Lender Scheme/SchemeAdd";
import TerritoryList from "../pages/Configuration/Territory/TerritoryList";
import TerritoryFlow from "../pages/Configuration/Territory";
import Workflow from "../pages/Workflow/Workflow";
import WorkflowCreate from "../pages/Workflow/WorkflowAdd";
import WorkflowComponent from "../pages/Workflow/WorkflowComponent";
import LookupList from "../pages/Configuration/LookupMaster/LookupList";
import AddLookup from "../pages/Configuration/LookupMaster/AddLookup";
import TemplateList from "../pages/Templates/List";
import TemplateCreate from "../pages/Templates";
import Configtemplates from "../pages/Configuration/templates";
import DocChecklist from "../pages/DocumentChecklist/DocChecklist";
import AddDocChecklist from "../pages/DocumentChecklist/AddDocChecklist";
import VerificationList from "../pages/Verification/VerificationList";
import AddVerification from "../pages/Verification/VerificationType/AddVerificationType";
import AddVerificationAllocationRule from "../pages/Verification/VerificationType/AddVerificationType";
import CamConfigurationList from "../pages/Configuration/CamConfiguration/CamConfigurationList";
import AddCamConfiguration from "../pages/Configuration/CamConfiguration/AddCamConfiguration";
import RuleDefinition from "../pages/Rule/RuleList";
import AddRule from "../pages/Rule/AddRule";
import RuleCategoryList from "../pages/Rule/Rule Category/List";
import AddRuleApply from "../pages/Rule/Rule Category/AddRuleApply";
import ParameterList from "../pages/Parameter/ParameterList";
import AddParameter from "../pages/Parameter/AddParameter";
import UserProfile from "../pages/Authentication/user-profile";
import ChangePassword from "../pages/Authentication/ChangePassword";
import ShareableLinks from "../Components/ShareableLinks/ShareableLinks";
import LenderUpload from "../pages/Configuration/LenderOnboarding/LenderPincode/List";
import LenderApprovalFile from "../pages/Configuration/EmployerMgmt/AddUpload";
import CheckBureauList from "../pages/Channel/CheckBureauList";
import EnquiryList from "../pages/EnquiryMgmt/List";
import FulfillmentList from "../Components/Lead/FullFillmentList";
import FulfilledLead from "../pages/Channel/FulfilledLead";
import ArchivedLead from "../pages/Channel/ArchivedLead";
import LenderView from "../pages/Application/LenderView";
import ChannelAsk from "../pages/Channel/ChannelAsk";
import PartnerLeads from "../pages/Channel/PartnerLeads";
import ChannelList from "../pages/Channel/ChannelList";
import LeadFlow from "../Components/LeadCreation/Leadflow";
import DedupeQ from "../pages/DedupeQ";
import LiveTracking from "../pages/ActivityTracking/LiveTracking";
import DailyActivity from "../pages/ActivityTracking/DailyActivity";
import EnquiryCustomerLeadsFollowUp from "../Components/LeadCreation/EnquiryManagement/EnquiryCustomerLeadsFollowUp";
import CarFlow from "../Components/CarLead/CarFlow";
import ProcessStatus from "../pages/MIS/ProcessStatus";
import BankPerformance from "../pages/MIS/BankPerformance";
import SourceProductivity from "../pages/MIS/SourceProductivity";
import ProductPerformance from "../pages/MIS/ProductPerformance";
import MonthWisePerformance from "../pages/MIS/MonthWisePerformance";
import PendencyReports from "../pages/MIS/PendencyReports";
import ConveyanceReport from "../pages/MIS/ConveyanceReport";
import VerificationTATReport from "../pages/MIS/VerificationTATReport";
import PartnerRenewal from "../pages/Channel/PartnerMgmt/PartnerRenewal";
import PartnerRenewalsListings from "../pages/Channel/PartnerMgmt/PartnerRenewalsListings";
import ArchivedList from "../pages/Channel/PartnerMgmt/ArchivedList";
import ApprovedPartnerView from "../Components/PartnerOnboarding/ApprovedPartnerView";
import PartnerApproval from "../pages/Channel/PartnerMgmt/PartnerApproval";
import PartnerBulkUpload from "../pages/BulkUpload/PartnerBulkUpload";
import NewChannelList from "../pages/Channel/PartnerMgmt/NewChannelList";
import PartnersDownload from "../pages/Reports/PartnersDownload";
import BankAnalyzer from "../pages/Reports/UsageReport/BankAnalyzer";
import BureauAnalyzer from "../pages/Reports/UsageReport/BureauAnalyzer";
import UserImpersonate from "../pages/Channel/PartnerMgmt/UserImpersonate";
import VendorApprovedListEdit from "../pages/Channel/VendorMgmt/ApprovedListEdit";
import CollectionIndex from "../Components/Collections/CollectionIndex";
import UploadCollections from "../Components/Collections/Upload/UploadCollections";
import PayoutDocumentFilter from "../pages/PayoutPlan/PayoutDocumentFilter";
import RoleAndAccessRightsList from "../pages/Configuration/Role/RoleList";
import AddRoleAndRights from "../pages/Configuration/Role/AddRoleAndRights";
import PlatformUsageReport from "../pages/Reports/UsageReport/PlatformUsageReport";
import UserLoginReport from "../pages/Reports/UserLoginReport";
import PincodeEligibility from "../Components/UserUtility/PincodeEligibility";
import Utilityreassign from "../pages/Utility/Utilityreassign";
import LoginQ from "../pages/Application/LoginQ";
import TrackingQ from "../pages/Application/TrackingQ";
import DisbursedQ from "../pages/Application/DisbursedQ";
import RejectedQ from "../pages/Application/RejectedQ";
import LeadBulkUpload from "../pages/BulkUpload/LeadBulkUpload";
import EnquiryBulkUpload from "../pages/BulkUpload/EnquiryBulkUpload";
import Vehicle from "../pages/Vehicle";
import ModuleList from "../pages/Configuration/MenuModule/ModuleList";
import AddModule from "../pages/Configuration/MenuModule/AddModule";
import LenderEligiblePincode from "../pages/Configuration/LenderOnboarding/LenderPincode/LenderEligiblePincode";
import LoanAccountManagement from "../Components/LMS/LoanAccountManagement/LoanAccountDetails";
import NavigationTab from "../Components/LMS/LoanAccountManagement/NavigationTab";
import ScoringEngine from "../pages/ScoringEngine";
import AddScoringCard from "../pages/ScoringEngine/addScoringCard";
import TradeAdvance from "../pages/TradeAdvance";
import AddTradeAdvance from "../pages/TradeAdvance/AddTradeAdvance";
import Tracker from "../pages/TradeAdvance/Tracker";
import ApfApprovedListEdit from "../pages/Channel/ApfMgmt/ApprovedListEdit";
import LeadFlowWithDynamic from "../Components/LeadCreation/LeadFlowWithDynamic";
import CollectionDashboard from "../Components/Collections/CollectionDashboard";
import DisbursementFlow from "../Components/PartDisbursement/DisbursementFlow";
import LOSLoginFlow from "../pages/LOS/LOSLogin/LOSLoginFlow";
import LoginList from "../pages/LOS/LOSLogin/LoginList";
import RescheduleFlow from "../Components/LMS/RescheduleMgmt/RescheduleFlow";
import VerificationTypeList from "../pages/Verification/VerificationType/VerificationTypeList";
import CollectionQ from "../Components/Collections/DigiCollect/CollectionQ"
import CronDetails from "../Components/LMS/CronJobs/CronDetails";
import ChannelSalesReport from "../pages/MIS/ChannelSalesReport";
import NewDisbursementRequest from "../Components/PartDisbursement/NewDisbursementRequest";
import BeneficiaryDetails from "../Components/PartDisbursement/BeneficiaryDetails";
import DailySalesReport from "../pages/MIS/DailySalesReport";
import ConveyanceReportDistance from "../pages/MIS/ConveyanceReportDistance/ConveyanceReportDistance";
import AttendanceReport from "../pages/MIS/AttendanceReport/AttendanceReport";
import LeadDispositionReport from "../pages/MIS/LeadDisposition/LeadDisposition";
import ProviderList from "../pages/Templates/List";
import AddServiceProvider from "../pages/ServiceProvider/AddServiceProvider";
import ServiceProviderList from "../pages/ServiceProvider/ServiceProviderList";
import LenderPincodeFile from "../pages/Configuration/LenderOnboarding/LenderPincode/AddLenderPincode";
import CollectionReport from "../pages/MIS/CollectionReport/CollectionReport";
import OverallActivity from "../pages/OverallActivity/OverallActivity";
import LeadTransfer from "../Components/Lead/LeadTransfer";
import underwritingCreateOrUpdate from "../pages/Configuration/EmployerMgmt/UnderwritingCreateOrUpdate";
import underwritingList from "../pages/Configuration/EmployerMgmt/UnderwritingList";
import BeatPlanView from "../pages/BeatPlan/BeatPlanView";
import BeatVsActual from "../pages/BeatPlan/BeatVsActual";
import BeatPlanStatus from "../pages/BeatPlan/BeatPlanStatus";
import InactiveList from "../pages/Channel/PartnerMgmt/InactiveList";
import LegalView from "../Components/LMS/Legal/LegalView";
import LegalFlow from "../Components/LMS/Legal/LegalFlow";
import LegalApprovalFlow from "../Components/LMS/Legal/LegalApprovalFlow";
import RepossessionFlow from "../Components/LMS/Repossession/RepossessionFlow";
import RepossessionView from "../Components/LMS/Repossession/RepossessionView";
import PreLegalNoticeList from "../Components/LMS/Legal/PreLegalNotice/PreLegalNoticeList";
import Section138List from "../Components/LMS/Legal/LegalActions/Section138/Section138List";
import LokAdalatList from "../Components/LMS/Legal/LegalActions/Lok_Adalat/LokAdalatList";
import SarfaesiList from "../Components/LMS/Legal/LegalActions/Sarfaesi/SarfaesiList";
import CivilList from "../Components/LMS/Legal/LegalActions/Civil/CivilList";
import ArbitrationList from "../Components/LMS/Legal/LegalActions/Arbitrator/ArbitrationList";
import BatchFlow from "../Components/PayableReceivableManagement/paymentProcessingBatch/BatchFlow";
import PaymentProcessing from "../Components/PayableReceivableManagement/paymentProcessingBatch/PaymentProcessing";
import PaymentProcessingList
    from "../Components/PayableReceivableManagement/paymentProcessingBatch/PaymentProcessingList";
import AudienceListView from "../pages/Marketing/CampaignMgmt/Campaign/AudienceListView"
import CampaignDashboard from "../pages/Marketing/CampaignMgmt/CampaignSummary";
import NavigationTabNew from "../Components/LMS/LoanAccountManagement/NavigationTabNew";
import ChildPartner from "../Components/PartnerOnboarding/ChildPartner/Index";
import ChildPartnerApproval from "../Components/PartnerOnboarding/ChildPartner/Approval";
import ServiceRequestQ from "../Components/LMS/ServiceRequestFlow/ServiceRequestQ";
import PartnerDispositionReport from "../pages/MIS/PartnerDisposition/PartnerDispositionReport";
import AccountBalanceView from "../Components/Accounting/GeneralEntry/AccountBalanceView";
import TrialBalanceView from "../Components/Accounting/GeneralEntry/TrailBalanceView";
import RescheduleQ from "../Components/LMS/RescheduleMgmt/RescheduleQ";
import RestructureQ from "../Components/LMS/RestructureMgmt/RestructureQ";
import RestructureFlow from "../Components/LMS/RestructureMgmt/RestructureFlow";
import LoanAccountStatement from "../Components/LMS/LoanAccountStatement/LoanAccountStatement";
import AccountBalanceViewSample from "../Components/Accounting/GeneralEntry/AccountBalanceViewSample";
import BusinessCard from "../Components/Common/BusinessCard";
import ChecklistShare from "../pages/DocumentChecklist/ChecklistShare";
import AddPurchaseOrder from "../pages/PurchaseOrder/AddPurchaseOrder";
import AddCustomerPurchaseOrder from "../pages/PurchaseOrder/AddCustomerPurchaseOrder";
import AddPurchaseInvoice from "../pages/PurchaseOrder/AddPurchaseInvoice";
import PurchaseOrderList from "../pages/PurchaseOrder/PurchaseOrderList";
import PurchaseInvoiceList from "../pages/PurchaseOrder/PurchaseInvoiceList";
import PurchaseRequisition from "../pages/PurchaseOrder/PurchaseRequisition";


import LmsDashboard from "../pages/Reports/LMS/LmsDashboard";
import CollectionEfficiencyReport from "../pages/Reports/LMS/CollectionEfficiencyReport";
import DpdAgingReport from "../pages/Reports/LMS/DpdAgingReport";
import InterestAccrualReport from "../pages/Reports/LMS/InterestAccrualReport";
import NpaMovementReport from "../pages/Reports/LMS/NpaMovementReport";
import PortfolioOverviewReport from "../pages/Reports/LMS/PortfolioOverviewReport";
import TreasuryDashboard from "../pages/Treasury/TreasuryDashboard";
import ALMDashboard from "../pages/Treasury/ALMDashboard";
import TermLoanManagement from "../pages/Treasury/TermLoanManagement";
import FixedDeposit from "../pages/Treasury/FixedDeposit";
import MutualFund from "../pages/Treasury/MutualFund";
import TerritoryTargetList from "../Components/TargetMgmt/TerritoryTarget/TerritoryTargetList"
import CampaignAudienceLeadFollowup from "../Components/LeadCreation/EnquiryManagement/CampaignAudienceLeadFollowup";
import CampaignAudienceList from "../Components/LeadCreation/EnquiryManagement/CampaignAudienceList";
import FieldCollectorBranchDepositList from "../Components/Collections/FieldCollectBranchDeposit/FieldCollectorBranchDepositList";
import FieldCollectWorkflow from "../Components/Collections/FieldCollectBranchDeposit/FieldCollectWorkflow";
import BranchCashDepositList from "../Components/Collections/BranchCashDeposit/BranchCashDepositList";
import BranchCashDepositWorkflow from "../Components/Collections/BranchCashDeposit/BranchCashDepositWorkflow";

// Fixed Assets Module
import {
    FixedAssetsDashboard,
    AssetRegistration,
    AssetDetails,
    AssetTransfer,
    AssetDisposal,
    AssetCapitalize,
    DepreciationRun,
    AssetReports
} from "../pages/FixedAssets";
import VideoRoom from "../Components/Verification/videoPDMeet/VideoCallScreen";

// Wrapping components with withModule
export const DashboardLeadsWithModule = withModule(DashboardLeads);
export const SummaryWithModule = withModule(Summary);
export const LeadStatus = withModule(LeadDownloads);
export const PartnerCreateWithDynamic = withModule(PartnerCreate);
export const VendorCreateWithDynamic = withModule(VendorCreate);
export const ApfCreateWithDynamic = withModule(ApfCreate);
export const PartnerListInProgress = withModule(ListInProgress);
export const VendorInProgress = withModule(VendorListInProgress);
export const ApfInProgress = withModule(ApfListInProgress);
export const PartnerApprovalPending = withModule(ApprovalPending);
export const VendorApprovalPendingWrapped = withModule(VendorApprovalPending);
export const ApfApprovalPendingWrapped = withModule(ApfApprovalPending);
export const PartnerApprovedListWrapped = withModule(ApprovedList);
export const VendorApprovedListWrapped = withModule(VendorApprovedList);
export const VendorApprovedListEditWrapped = withModule(VendorApprovedListEdit);
export const ApfApprovedListWrapped = withModule(ApfApprovedList);
export const ApfApprovedListEditWrapped = withModule(ApfApprovedListEdit)
export const RejectedPartnerListWrapped = withModule(RejectedPartnerList);
export const RejectedVendorListWrapped = withModule(RejectedVendorList);
export const RejectedApfListWrapped = withModule(RejectedApfList);
export const VerificationSummaryWrapped = withModule(VerificationSummary);
export const VerificationQWrapped = withModule(VerificationQ);
export const VerificationViewWrapped = withModule(VerificationView);
export const VerificationTransferWrapped = withModule(VerificationTransfer);
export const EmployeeManagementWrapped = withModule(EmployeeManagement);
export const EmployeeListViewWrapped = withModule(EmployeeListView);
export const EmployeeSalaryDetailsWrapped = withModule(EmployeeSalaryDetails);
export const LeaveApprovalsWrapped = withModule(LeaveApprovals);
export const PayrollBatchListWrapped = withModule(PayrollBatchList);
export const FulfillmentListWrapped = withModule(fullFillmentList)
export const FulfillmentListFresh= withModule(fullFillmentList)
export const TargetPlanListView = withModule(PlanListView);
export const TargetAddPlan = withModule(AddPlan)
export const AssignTargetListView = withModule(ListView);
export const LeadList = withModule(ChannelLeadList)
export const AssignTarget = withModule(AssignTargetSteps);
export const TrackPerformancePage = withModule(TrackPerformance);
export const AttachEmployeeIncentives = withModule(EmployeeIncentiveListView);
export const AssignIncentive = withModule(IncentiveSteps);
export const UploadedCollectionListView = withModule(ListIndex);
export const ActiveAccountsList = withModule(ActiveAccounts);
export const ClosedAccountsList = withModule(ClosedAccountList);
export const TeleCollectionQ = withModule(collectionQ);
export const TeleCollectionView = withModule(CollectionView);
export const FieldCollectionQ = withModule(FieldCollectionQList);
export const FieldCollectionView = withModule(FieldCollectionViewList);
export const CollectionSummary = withModule(CollectionDashboard)

export const CollectionFlow = withModule(CollectionFollowFlow)
export const RepaymentFlow = withModule(RepaymentFlowList)

export const BatchInvoiceFlow = withModule(BatchFlow)

export const SchemeListComponent = withModule(SchemeListView)
//Collection
export const CollectionEmployeePayout = withModule(PayoutListView)
export const CollectionEmployeeEstimate = withModule(SalesEstimate)
export const CollectionEmployeeInvoice = withModule(IncentiveStatement)
export const CollectionPartnerPayout = withModule(PayoutListView)
export const CollectionPartnerEstimate = withModule(PayableEstimate)
export const CollectionPartnerInvoice = withModule(Invoice)

export const CreateScheme = withModule(AddScheme)
export const IncentivePlanList = withModule(PayoutListView)
export const PayoutPlanList = withModule(PayoutListView)
export const PayableEstimateList = withModule(PayableEstimate)
export const SalesEstimateList = withModule(SalesEstimate)
// export const finance
export const SalesIncentiveEarnings = withModule(SalesEarnings)
export const PartnerReceivableEarnings = withModule(PartnerEarnings)
export const GstStatus = withModule(GstListView)
export const BatchList = withModule(PaymentProcessingList)
export const DisbursementBatchList = withModule(PaymentProcessingList)
export const BatchPaymentProcessing = withModule(PaymentProcessing)
export const EmployeeIncentive = withModule(IncentiveStatement)
export const SalesIncentive = withModule(PayoutListView)
export const SalesInvoice = withModule(Invoice)
export const FinanceInvoice = withModule(Invoice)
export const BcOnboarding = withModule(BCOnboardingFlow)
export const BCPendingApproval = withModule(PendingApprovalList)
export const BCFLDGAttach = withModule(AttachFLDG)
export const BCAttachLoanAccount = withModule(AttachLoanAccount)
export const BCFLDGAttachList = withModule(AttachedFLDGList);
export const BCAttachLoanAccountList = withModule(AttachedLoanAccountList);
export const FormBuilderComponent = withModule(FormBuilder)
export const FieldsAndComponentList = withModule(List)
export const FieldsAndComponentCreateUpdate = withModule(CreateUpdate)
export const EstimateComponent = withModule(Estimate)
export const LenderInvoiceComponent = withModule(LenderInvoice)
export const WithHeldInvoiceComponent = withModule(WithHeldInvoice)
export const GSTReverseInvoiceComponent = withModule(GSTReverseInvoice)
export const GSTFilingComponent = withModule(GSTFiling)
export const InvoiceProcessingCreate = withModule(InvoiceProcessing)
export const CreatePayOutPlan = withModule(AddPayoutPlan)
export const PayoutPlanUpload = withModule(UploadPayoutPlan)
export const ViewPayoutReconciliation = withModule(PayoutReconciliationView)
export const AdjustmentsCard = withModule(Adjustments)
export const ViewSalesPerformanceOver = withModule(TargetReport)
export const CdnFile = withModule(CdnFileManager)
export const ChartsOfAccountsView = withModule(ChartsOfAccounts)
export const CreateChartsOfAccounts = withModule(AddChartsOfAccounts)
export const AccountingTemplateList = withModule(AccountingTemplate)
export const CreateAccountingTemplate = withModule(AddAccountingTemplate)
export const GeneralLedgerList = withModule(GeneralLedgerView)
export const CreateGeneralLedger = withModule(AddGeneralLedger)
export const CostCenterList = withModule(CostCenterView)
export const CreateCostCenter = withModule(AddCostCenter)
export const GeneralLedgerBalanceList = withModule(GeneralLedgerBalance)
export const AmortisationList = withModule(AmortisationView)
export const BankAccountDetailsView = withModule(BankAccountDetails)
export const JourneyMasterList = withModule(JourneyMaster)
export const CreateJourneyType = withModule(AddJourneyType)
export const CampaignList = withModule(Campaign)
export const CreateCampaign = withModule(AddCampaign)
export const UploadCampaign = withModule(Upload)
export const CampaignUploadView = withModule(CampaignUploadList)
export const LinksList = withModule(Links)
export const CreateLinks = withModule(AddLinks)
export const MediaList = withModule(Media)
export const CreateMedia = withModule(AddMedia)
export const ShareableLinkComponent = withModule(ShareableLink)
export const BuilderListView = withModule(BuilderList)
export const BuilderCreateUpdate = withModule(BuilderFlow)
export const VerificationInitiate = withModule(VerificationFlow)
export const CompanyDetailsView = withModule(CompanyDetails)
export const VendorGSTList = withModule(VendorGSTListView)
export const VendorTDSStatusView = withModule(VendorTDSStatus)
export const TDSFilingView = withModule(TDSFiling)
export const EmployerUploadView = withModule(UploadList)
export const UploadEmployer = withModule(AddUpload)
export const EmployerListView = withModule(mcaList)
export const EmployerReviewComponent = withModule(EmployerReview)
export const MapListView = withModule(MapList)
export const EmployeeCreateUpdate = withModule(EmployeeFlow)
export const LoanTypeListView = withModule(LoanTypeList)
export const LoanTypeCreateUpdate = withModule(LoanTypeFlow)
export const LenderListView = withModule(LenderList)
export const CreateLender = withModule(LenderAdd)
export const SchemeListViewComponent = withModule(SchemeList)
export const CreateUpdateScheme = withModule(SchemeAdd)
export const TerritoryListView = withModule(TerritoryList)
export const TerritoryCreateUpdate = withModule(TerritoryFlow)
export const WorkflowList = withModule(Workflow)
export const WorkflowCreateUpdate = withModule(WorkflowCreate)
export const WorkflowComponentList = withModule(WorkflowComponent)
export const LookupListView = withModule(LookupList)
export const LookupCreateUpdate = withModule(AddLookup)
export const TemplateListWithModule = withModule(TemplateList);
export const TemplateCreateWithModule = withModule(TemplateCreate);
export const ConfigtemplatesWithModule = withModule(Configtemplates);
export const DocCheckList = withModule(DocChecklist)
export const DocCheckListCreate = withModule(AddDocChecklist)
export const VerificationListView = withModule(VerificationTypeList)
export const VerificationCreateUpdate = withModule(AddVerification)
export const CreateVerificationAllocationRule = withModule(AddVerificationAllocationRule)
export const CamConfigurationListView = withModule(CamConfigurationList)
export const CreateCamConfiguration = withModule(AddCamConfiguration)
//Rule
export const RuleList = withModule(RuleDefinition)
export const RuleCreateUpdate = withModule(AddRule)
export const RuleCategoryListView = withModule(RuleCategoryList)
export const RuleCategoryCreateUpdate = withModule(AddRuleApply)
export const ParameterListView = withModule(ParameterList)
export const ParameterCreateUpdate = withModule(AddParameter)
export const UserProfileView = withModule(UserProfile)
export const ChangePasswordComponent = withModule(ChangePassword)
export const ShareableLinksComponent = withModule(ShareableLinks)
export const UploadLenderList = withModule(LenderUpload)
export const UploadLenderCreate = withModule(LenderPincodeFile)
export const CheckBureauListView = withModule(CheckBureauList)
export const EnquiryListView = withModule(EnquiryList)
export const FulfilledLeadList = withModule(FulfilledLead)
export const ArchivedLeadList = withModule(ArchivedLead)
export const LenderViewComponent = withModule(LenderView)
export const ChannelAskListView = withModule(ChannelAsk)
export const PartnerLeadsList = withModule(PartnerLeads)
export const ChannelListView = withModule(ChannelList)
export const LeadCreate = withModule(LeadFlowWithDynamic)
export const DedupeQList = withModule(DedupeQ)
export const LiveTrackingView = withModule(LiveTracking)
export const DailyActivityView = withModule(DailyActivity)
export const EnquiryCustomerLeadsFollowUpCreate = withModule(EnquiryCustomerLeadsFollowUp)
export const AutoFlow = withModule(CarFlow)
export const ProcessStatusView = withModule(ProcessStatus)
export const BankPerformanceView = withModule(BankPerformance)
export const SourceProductivityView = withModule(SourceProductivity)
export const ProductPerformanceView = withModule(ProductPerformance)
export const MonthWisePerformanceView = withModule(MonthWisePerformance)
export const PendencyReportsView = withModule(PendencyReports)
export const ConveyanceReportView = withModule(ConveyanceReport)
export const VerificationTATReportView = withModule(VerificationTATReport)
export const PartnerRenewalFlow = withModule(PartnerRenewal)
export const PartnerRenewalsList = withModule(PartnerRenewalsListings)
export const PartnerArchivedList = withModule(ArchivedList)
export const PartnerInactiveList = withModule(InactiveList)
export const ApprovedPartner = withModule(ApprovedPartnerView)
export const PartnerApprovalComponent = withModule(PartnerApproval)
export const PartnerUpload = withModule(PartnerBulkUpload)
export const NewChannelListView = withModule(NewChannelList)
export const PartnersReportDownload = withModule(PartnersDownload)
export const BankAnalyzerView = withModule(BankAnalyzer)
export const BureauAnalyzerView = withModule(BureauAnalyzer)
export const UserImpersonateComponent = withModule(UserImpersonate)
export const UploadCollectionsWrapped = withModule(UploadCollections)
export const PayoutDocumentFilterWrapped = withModule(PayoutDocumentFilter)
export const RoleAndAccessRightsListView = withModule(RoleAndAccessRightsList)
export const CreateRoleAndAccessRights = withModule(AddRoleAndRights)
export const PlatformUsageReportView = withModule(PlatformUsageReport)
export const UserLoginReportList = withModule(UserLoginReport)
export const PincodeEligibilityCheck = withModule(PincodeEligibility)
export const UtilityreassignLead = withModule(Utilityreassign)
export const LeadLoginQ = withModule(LoginQ)
export const LeadTrackingQ = withModule(TrackingQ)
export const LeadDisbursedQ = withModule(DisbursedQ)
export const LeadRejectedQ = withModule(RejectedQ)
export const LeadUpload = withModule(LeadBulkUpload)
export const EnquiryUpload = withModule(EnquiryBulkUpload)
export const VehicleView = withModule(Vehicle)
export const ModuleListView = withModule(ModuleList)
export const CreateModule = withModule(AddModule)
export const LenderEligiblePincodeList = withModule(LenderEligiblePincode)
export const LoanAccountManagementView = withModule(LoanAccountManagement)
export const NavigationTabView = withModule(NavigationTab)
export const NavigationTabViewNew = withModule(NavigationTabNew)
export const ScoringEnginelist = withModule(ScoringEngine)
export const ScoringEngineCreate = withModule(AddScoringCard)
export const TradeAdvanceWrapped = withModule(TradeAdvance)
export const AddTradeAdvanceWrapped = withModule(AddTradeAdvance)
export const TrackerWrapped = withModule(Tracker)
export const DisbursementFlowWrapped = withModule(DisbursementFlow)
export const LOSLoginInitiate = withModule(LOSLoginFlow)
export const LoginListView = withModule(LoginList)
export const Reschedule = withModule(RescheduleFlow)
export const ChannelSales = withModule(ChannelSalesReport);
export const MessageView = withModule(CollectionQ)
export const CronView = withModule(CronDetails)
export const DailySalesReports = withModule(DailySalesReport)
export const ConveyanceReportsDistance = withModule(ConveyanceReportDistance)
export const AttendanceReports = withModule(AttendanceReport)
export const LeadDispositionReports = withModule(LeadDispositionReport)
export const DisbursementRequestWrap = withModule(BeneficiaryDetails)
export const NewDisbursementWrap = withModule(NewDisbursementRequest)
export const CollectionReportWithModule = withModule(CollectionReport)
export const OverallActivityView = withModule(OverallActivity)
export const ProviderListView = withModule(ServiceProviderList)
export const ProviderCreate = withModule(AddServiceProvider)
export const LeadTransferQ = withModule(LeadTransfer)
export const UnderwritingAdd = withModule(underwritingCreateOrUpdate)
export const Underwriting = withModule(underwritingList)
export const BeatPlanViewWithModule = withModule(BeatPlanView)
export const BeatPlanActualViewWithModule = withModule(BeatPlanView)
export const BeatPlanManagementWithModule = withModule(BeatPlanStatus)
export const BeatPlanActualWithModule = withModule(BeatVsActual)
export const LegalViewWithModule = withModule(LegalView)
export const LegalApprovalFlowWithModule = withModule(LegalApprovalFlow)
export const LegalFlowWithModule = withModule(LegalFlow);
export const RepossessionFlowWithModule = withModule(RepossessionFlow);
export const RepossessionViewWithModule = withModule(RepossessionView);
export const PreLegalNoticeListWithModule = withModule(PreLegalNoticeList);
export const Section138ListView = withModule(Section138List);
export const LokAdalatListView = withModule(LokAdalatList);
export const CivilListView = withModule(CivilList);
export const SarfaesiListView = withModule(SarfaesiList);
export const ArbitrationListView = withModule(ArbitrationList);
export const AudienceListViewWithModule = withModule(AudienceListView)
export const CampaignDashboardWithModule = withModule(CampaignDashboard)
export const ChildPartnerListWithModule = withModule(ChildPartner)
export const ChildPartnerApprovalWithModule = withModule(ChildPartnerApproval)
export const PartnerDispositionReports = withModule(PartnerDispositionReport)
export const AccountBalanceList = withModule(AccountBalanceView)
export const TrialBalanceList =withModule(TrialBalanceView)
export const AccountBalanceListSample = withModule(AccountBalanceViewSample)
export const ServiceRequestQWithModule = withModule(ServiceRequestQ)
export const RescheduleQWithModule = withModule(RescheduleQ)
export const RestructureFlowWithModule = withModule(RestructureFlow)
export const RestructureQWithModule = withModule(RestructureQ)
export const LoanAccountStatementWithModule = withModule(LoanAccountStatement)

export const BusinessCardWithModule = withModule(BusinessCard)
export const DocChecklistShareWithModule = withModule(ChecklistShare)
export const AddPurchaseOrderWithModule = withModule(AddPurchaseOrder)
export const AddCustomerPurchaseOrderWithModule = withModule(AddCustomerPurchaseOrder)
export const AddPurchaseInvoiceWithModule = withModule(AddPurchaseInvoice)
export const PurchaseOrderListWithModule = withModule(PurchaseOrderList)
export const PurchaseInvoiceListWithModule = withModule(PurchaseInvoiceList)
export const PurchaseRequisitionWithModule = withModule(PurchaseRequisition)



export const LmsDashboardWithModule = withModule(LmsDashboard);
export const CollectionEfficiencyReportWithModule = withModule(CollectionEfficiencyReport);
export const DpdAgingReportWithModule = withModule(DpdAgingReport);
export const InterestAccrualReportWithModule = withModule(InterestAccrualReport);
export const NpaMovementReportWithModule = withModule(NpaMovementReport);
export const PortfolioOverviewReportWithModule = withModule(PortfolioOverviewReport);

// Fixed Assets Module
export const FixedAssetsDashboardWithModule = withModule(FixedAssetsDashboard);
export const AssetRegistrationWithModule = withModule(AssetRegistration);
export const AssetDetailsWithModule = withModule(AssetDetails);
export const AssetTransferWithModule = withModule(AssetTransfer);
export const AssetDisposalWithModule = withModule(AssetDisposal);
export const AssetCapitalizeWithModule = withModule(AssetCapitalize);
export const DepreciationRunWithModule = withModule(DepreciationRun);
export const AssetReportsWithModule = withModule(AssetReports);

export const TreasuryDashboardWithModule = withModule(TreasuryDashboard);
export const ALMDashboardWithModule = withModule(ALMDashboard);
export const TermLoanManagementWithModule = withModule(TermLoanManagement);
export const FixedDepositWithModule = withModule(FixedDeposit);
export const MutualFundWithModule = withModule(MutualFund);
//video pd meet
export const VideoCallRoom = withModule(VideoRoom);
export const FieldCollectorBranchDepositListWithModule = withModule(FieldCollectorBranchDepositList);
export const FieldCollectWorkflowWithModule = withModule(FieldCollectWorkflow);
export const BranchCashDepositListWithModule = withModule(BranchCashDepositList);
export const BranchCashDepositWorkflowWithModule = withModule(BranchCashDepositWorkflow);

export const CampaignAudienceLeadFollowupCreate = withModule(CampaignAudienceLeadFollowup);
export const CampaignAudienceListWithModule = withModule(CampaignAudienceList);

export const WithModuleTerritoryTargetList = withModule(TerritoryTargetList)