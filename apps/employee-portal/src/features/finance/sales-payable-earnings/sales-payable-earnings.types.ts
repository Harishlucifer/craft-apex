// Legacy:
//   craft-frontend/src/Routes/WithModuleRoutes.js
//     export const PartnerReceivableEarnings = withModule(PartnerEarnings)
//   PartnerEarnings -> craft-frontend/src/pages/IncentiveModule/ParnterEarnings.js
//     <EstimateComponent module={module} moduleName="CHANNEL_ESTIMATE"/>
//   EstimateComponent -> craft-frontend/src/Components/PayableReceivableManagement/Estimate/Estimate.js
//
// fetchEstimateList (moduleName !== "EMPLOYEE" branch — channel-side):
//   GET /alpha/v1/finance/estimate?mode=PAYABLE&category=${module.configuration.category}
//       &user_type=CHANNEL&associate_id=${channel_id}
//       &territory_id=${territory_id||""}&month=${month||""}
//   Body shape (GetCall returns the body directly):
//     { data: { data: EstimateRow[], summary: EstimateSummary } }
// Field names below are verbatim from the legacy columns / summary cards.

export interface EstimateRow {
  // Identity / who
  partner_name?: string;
  employee_name?: string;
  // Loan info
  lead_code?: string;
  lender_name?: string;
  loan_type?: string;
  scheme_name?: string;
  disbursement_date?: string;
  application_name?: string;
  // Amounts
  over_due_amount?: number | string;
  disbursement_amount?: number | string;
  payout_rate?: number | string;
  payout_amount?: number | string;
}

export interface EstimateSummary {
  TotalEarnings?: number | string;
  LeadsCount?: number | string;
}

export interface EstimateListPayload {
  data?: EstimateRow[];
  summary?: EstimateSummary;
}

export interface EstimateListResponse {
  data?: EstimateListPayload;
}

// Lookups used by the verified filter bar.
//   GET /alpha/v1/master/territory               -> { data: { data: TerritoryMaster[] } }
//   GET /alpha/v1/master/territory/user          -> { data: { data: { territory_type, territory } } }
//   GET /alpha/v1/channel?territory_id=…         -> { data: { data: ChannelOption[] } }
export interface TerritoryMaster {
  territory_id: string | number;
  territory_name: string;
  territory_type_id: string | number;
}

export interface TerritoryTypeItem {
  id: string | number;
  name: string;
}

export interface TerritoryUserResponse {
  data?: {
    data?: {
      territory_type?: TerritoryTypeItem[];
      territory?: TerritoryTypeItem[];
    };
  };
}

export interface TerritoryMasterResponse {
  data?: {
    data?: TerritoryMaster[];
  };
}

export interface ChannelOptionRow {
  channel_id: string | number;
  name?: string;
}

export interface ChannelListResponse {
  data?: {
    data?: ChannelOptionRow[];
  };
}

export interface EstimateFilters {
  territory_type_id: string;
  territory_id: string;
  channel_id: string;
  month: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
