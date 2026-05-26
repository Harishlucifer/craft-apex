// Partner Downloads — legacy /pages/Reports/PartnersDownload.js
// Single action: POST /alpha/v1/report/partner?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&status=N
// → response.data is the row list (or null).  Then locally builds XLSX columns.

export interface PartnerStatusOption {
  value: string;
  label: string;
}

// Legacy: PartnersDownload.js lines 40-56.
export const PARTNER_STATUS_OPTIONS: PartnerStatusOption[] = [
  { value: "1", label: "In-Progress" },
  { value: "2", label: "Pending for approval" },
  { value: "3", label: "Approved" },
  { value: "-1", label: "Rejected" },
  { value: "-3", label: "Inactive" },
];

export interface PartnerDateTypeOption {
  value: string;
  label: string;
}

// Legacy: PartnersDownload.js lines 35-38.
export const PARTNER_DATE_TYPE_OPTIONS: PartnerDateTypeOption[] = [
  { value: "Created at", label: "Created at" },
];

export interface PartnerExportFilter {
  dateType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: string;
}

export const DEFAULT_PARTNER_FILTER: PartnerExportFilter = {
  dateType: "",
  startDate: "",
  endDate: "",
  status: "",
};

// Row shape used by legacy CSV writer (lines 109-146).
export interface PartnerRow {
  name?: string;
  entity_type?: string;
  partner_category?: string;
  mobile?: string;
  email?: string;
  pincode?: string;
  state?: string;
  city?: string;
  address?: string;
  area?: string;
  point_of_contact?: string;
  dsa_code?: string;
  onboarding_territory?: { territory_name?: string };
  territory_details?: Record<string, { territory_name?: string } | undefined>;
  relationship_manager?: {
    name?: string;
    code?: string;
    mobile?: string;
    email?: string;
  };
  primary_id?: string;
  secondary_id?: string;
  bank_account?: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    account_holder_name?: string;
  };
  status_name?: string;
  created_date?: string;
  approved_date?: string;
}

export interface PartnerExportPayload {
  startDate: string;
  endDate: string;
  status: string;
}
