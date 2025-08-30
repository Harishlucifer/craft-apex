
export interface ActivityDetail {
  activity_id: string;
  activity_type: "CALL" | "VISIT" | "WALK_IN";
  outcome?: string;
  feedback?: string;
  remark?: string;
  latitude?: number;
  longitude?: number;
  engagement_level?: string;
  address?: string;
  follow_up_date?: string;
  current_step?: string;
  user_id?: string;
  data?: Record<string, any>;
  created_at?: string;
  status?: 1 | 2;
}

export interface ReferenceDetail {
  reference_id: string;
  reference_type: string;
  name: string;
  email: string;
  gender: string;
  mobile: string;
  relationship_with_applicant: string;
  address?: Address;
}

export interface Shareholder {
  shareholder_id: string;
  name: string;
  share_percentage: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  mobile: string;
  dob?: string;
  email?: string;
  primary_id_type?: string;
  primary_id_value?: string;
  secondary_id_type?: string;
  secondary_id_value?: string;
  maiden_type?: string;
  maiden_name?: string;
  is_applicant?: number;
  aadhaar_kyc?: number;
  addresses?: Address[];
  profession?: string;
  qualification?: string;
  data?: any;
  work_info?: WorkInformation[];
}

export interface Address {
  address_id: string;
  address_type: string;
  address_line: string;
  locality: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  residing_in_month: number;
  area_id: number;
  residence_type: string;
  premise: string;
  proof_document_id?: string;
  same_as_type?: string;
}

export interface Income {
  income_id: string;
  source_type: string;
  year?: string;
  month?: string;
  amount: string;
  considered_amount?: string;
  income_period: string;
  financial_line_item_id?: string;
  is_tax_filed?: number;
}

export interface BankAccount {
  bank_account_id: string;
  bank_id: string;
  account_holder_name?: string;
  account_type?: string;
  analyser_account_type?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  analyser_bank_name?: string;
  ifsc_code?: string;
  files?: any[];
  bank_statement_analysis?: any;
}

export interface Business {
  business_id: string;
  entity_type: string;
  external_id?: string;
  legal_name: string;
  trade_name?: string;
  nature_of_business?: string;
  primary_id_type?: string;
  primary_id_value?: string;
  secondary_id_type?: string;
  secondary_id_value?: string;
  business_vintage?: number;
  incorporation_date?: string;
  last_year_profit?: number;
  last_year_turnover?: number;
  annual_income?: number;
  monthly_emi?: number;
  monthly_sale?: number;
  industry_type_id?: number;
  industry_product_id?: number;
  industry_type_name?: string;
  industry_product_name?: string;
  shareholders?: Shareholder[];
  addresses?: Address[];
  company_bank_account?: BankAccount[];
  data?: Record<string, any>;
}

export interface Person {
  person_id: string;
  salutation?: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  gender?: string;
  mobile: string;
  email?: string;
  dob?: string;
  external_id?: string;
  share_percentage?: number;
  primary_id_type?: string;
  primary_id_value?: string;
  secondary_id_type?: string;
  secondary_id_value?: string;
  marital_status?: string;
  employment_type?: string;
  monthly_emi?: string;
  relationship_type?: string;
  profession?: string;
  qualification?: string;
  maiden_type?: string;
  maiden_name?: string;
  aadhaar_kyc?: number;
  e_signature?: number;
  is_financial_applicant?: number;
  work_info?: WorkInformation[];
  other_income_info?: Income[];
  addresses?: Address[];
  person_bank_account?: BankAccount;
  data?: Record<string, any>;
}

export interface WorkInformation {
  work_information_id: string;
  company_name: string;
  cin?: string;
  company_type?: string;
  designation?: string;
  current_work_experience?: string;
  total_work_experience?: string;
  epf_deduction?: number;
  salary_mode?: string;
  income_info?: Income[];
  company_address?: Address;
  business_financials?: BusinessFinancial;
  data?: Record<string, any>;
}

export interface BusinessFinancial {
  incorporation_date?: string;
  last_year_profit?: number;
  last_year_turnover?: number;
  annual_income?: number;
  industry_type?: string;
  industry_product?: string;
  nature_of_business?: string;
}

export interface Applicant {
  applicant_type: "PRIMARY" | "CO_APPLICANT" | "GUARANTOR";
  applicant_category: "ENTITY" | "PERSON";
  applicant_id: string;
  applicant_name?: string;
  business?: Business;
  personal?: Person;
}

export interface AskDetail {
  ask_id: string;
  ask_type: string;
  ask_summary_id?: string;
  document_id: string;
  all_document_ids?: string[];
  title: string;
  content: string;
  created_at: string;
  created_by_user: any;
  files: any[];
  lender_apply?: any;
}

export interface Empanelment {
  empanelment_id: string;
  client_name: string;
  nature_of_business: string;
  business_period: string;
  business_volume: number;
  is_activity_continuing: boolean;
  target_volume: number;
  target_period: string;
  actual_volume: number;
  reference_contact_name: string;
  reference_contact_email: string;
  reference_contact_mobile: string;
  is_blacklisted: boolean;
  blacklist_details?: string;
  data?: Record<string, any>;
}

export interface Location {
  location_id: string;
  branch_type: string;
  name: string;
  no_of_staff: number;
  address: Address;
  total_capacity: string;
  allocated_capacity: string;
  data?: Record<string, any>;
  assets?: Asset[];
}

export interface Asset {
  asset_id: string;
  asset_type: string;
  quantity: number;
  asset_condition: string;
  purchase_date: string;
  last_serviced_date: string;
}

export interface ExistingLoan {
  existing_loan_id: string;
  bank_id: string;
  bank_name: string;
  loan_account_no: string;
  loan_account_name: string;
  loan_type: string;
  loan_amount: number;
  loan_status?: string;
  tenure?: string;
  interest_rate: number;
  emi: number;
  applicant_category: string;
  applicant_id: string;
  applicant_name: string;
  outstanding_amount: number;
  outstanding_tenure?: string;
  is_balance_transferred: number;
  emi_match_status?: string;
  emi_match_source?: string;
  data?: Record<string, any>;
  opened_date?: string;
}
