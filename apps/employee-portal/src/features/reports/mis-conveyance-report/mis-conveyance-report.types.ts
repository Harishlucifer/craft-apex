// MIS Conveyance Report — legacy /pages/MIS/ConveyanceReport.js
// GET /alpha/v1/report/verification-conveyance?startDate=DD/MM/YYYY&endDate=DD/MM/YYYY[&userId=N]
// (Note: legacy uses camelCase startDate/endDate AND DD/MM/YYYY format — different
//  from the other MIS endpoints that take start_date/end_date in YYYY-MM-DD.)
// Response: { data: { dashboard: ConveyanceCard[], report_data: ConveyanceRow[] } }

export interface ConveyanceRow {
  verification_code?: string;
  attempt_date?: string;
  applicant_name?: string;
  verification_category?: string;
  total_distance?: number | string;
  rate_per_kilometer?: number | string;
}

export interface ConveyanceCard {
  label?: string;
  amount?: number | string;
}

export interface ConveyanceResult {
  dashboard: ConveyanceCard[];
  report_data: ConveyanceRow[];
}

export interface ConveyanceFilter {
  /** YYYY-MM-DD (page) — converted to DD/MM/YYYY for the API. */
  startDate?: string;
  endDate?: string;
}

/** Convert YYYY-MM-DD (date input) to DD/MM/YYYY (legacy query param). */
export function toDdMmYyyy(iso?: string): string | undefined {
  if (!iso) return undefined;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Map legacy verification category to a friendlier label.
// (ConveyanceReport.js verificationMap, lines 19-25.)
const VERIFICATION_CATEGORY_LABELS: Record<string, string> = {
  "PSIR_VERIFICATION SALARIED": "PSIR Verification",
  "RESIDENCE_VERIFICATION_SALARIED SALARIED": "PSVR Residence",
  "PROPERTY_VERIFICATION SALARIED": "PSVR Property",
  "BUSINESS_VERIFICATION_SELF_EMPLOYED SELF_EMPLOYED_BUSINESS":
    "PSVR Self Employed",
  "EMPLOYMENT_VERIFICATION_SALARIED SALARIED": "PSVR Salaried",
};

export function verificationCategoryLabel(value?: string): string {
  if (!value) return "—";
  return VERIFICATION_CATEGORY_LABELS[value.trim()] ?? value;
}
