// loan_application.types.ts
import {
  Applicant,
  ReferenceDetail,
  ActivityDetail,
  ExistingLoan,
  AskDetail,
  BankAccount,
} from "./onboarding";

export interface Application {
  application_id: string;
  application_code?: string;
  loan_type_code: string;
  type?: string;
  apply_capacity?: "ENTITY" | "PERSON";
  loan_amount?: string;
  salutation?: string;
  applicant_name?: string;
  contact_name?: string;
  mobile?: string;
  email?: string;
  lead_source?: string;
  lead_id?: string;
  purpose_of_loan?: string;
  external_lead_id?: string;
  external_journey_type?: string;
  external_lead_type?: string;
  submission_mode?: string;
  entity_type?: string;
  employment_type?: string;
  loan_code?: string;
  loan_status?: string;
  data_synced?: number;
  origin_platform?: string;
  loan_info?: LoanInfo[];
  partner_code?: string;
  vehicle_details?: VehicleDetail;
  terms_and_conditions?: number;
  data?: Record<string, any>;
  channel_id?: string;
  user_id?: string;
  channel_name?: string;
  territory_id?: string;
  represented_user_id?: string;
  processed_user_id?: string;
  sourced_user_id?: string;
  status: number;
  onboarding_id?: string;
  created_timestamp?: string;
  updated_timestamp?: string;
  utm_tags?: Record<string, any>;
}

export interface VehicleDetail {
  vehicle_id: string;
  make?: string;
  model?: string;
  year?: string;
  price?: number;
  vin?: string;
  estimated_value?: string;
}

export interface LoanInfo {
  application_loan_id: string;
  sub_loan_type: string;
  facility_type: string;
  loan_amount: string;
  tenor: number;
  rate_of_interest: number;
  process_fee_type?: "FLAT" | "PERCENTAGE";
  process_fee_value: number;
}

export interface PropertyDetail {
  application_property_id: string;
  property_identified: number;
  nature_of_property?: string;
  property_type?: string;
  property_sub_type?: string;
  property_category?: string;
  loan_purpose?: string;
  property_ownership?: string;
  property_status?: string;
  property_sub_status?: string;
  transaction_type?: string;
  building_approval?: string;
  record_issued_by?: string;
  no_of_units?: number;
  developer_name?: string;
  developer_id?: string;
  project_name?: string;
  property_address?: string;
  project_id?: string;
  pincode_id?: string;
  state?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  on_east?: string;
  on_west?: string;
  on_north?: string;
  on_south?: string;
  survey_no?: string;
  administrative_area_code?: string;
  administrative_area_name?: string;
  door_no?: string;
  floor_no?: string;
  plot_no?: string;
  shop_no?: string;
  landmark?: string;
  age_of_property?: string;
  plot_sqft?: string;
  built_up_sqft?: string;
  plot_value?: number;
  property_value?: number;
  data?: Record<string, any>;
  property_owners?: PropertyOwner[];
}

export interface PropertyOwner {
  property_owner_id: string;
  entity_type: "ENTITY" | "PERSON";
  person_id?: string;
  entity_id?: string;
}

export interface ParticipantDetail {
  participant_id: string;
  participant_type: "SOURCED_BY" | "PROCESSED_BY" | "REPRESENTED_BY" | "SERVICED_BY";
  user_id: string;
  user_type?: string;
  user_name?: string;
  user_code?: string;
  user_email?: string | null;
  user_mobile?: string;
  user_role_id?: string;
  user_role_name?: string;
  user_role_code?: string;
  reporting_user: {
    user_id: string;
    user_name: string;
    user_type: string;
    user_code: string;
  };
  channel_id?: string;
  channel_code?: string;
  channel_category?: string;
  channel_name?: string;
  channel_mobile?: string;
  territory_id?: string;
  territory_name?: string;
  created_at?: string;
  relationship_manager?: {
    user_id?: string;
    user_name?: string;
    user_type?: string;
    user_code?: string;
    reporting_user?: {
      user_id: string;
      user_name: string;
      user_type: string;
      user_code: string;
    };
  };
}

export interface LoanApplication {
  application: Application;
  applicants: Applicant[];
  reference_details?: ReferenceDetail[];
  activities?: ActivityDetail[];
  property_details?: PropertyDetail[];
  existing_loans?: ExistingLoan[];
  vehicle_detail?: VehicleDetail;
  participant_details?: Record<string, ParticipantDetail>;
  ask_details?: Record<string, AskDetail[]>;
  additional_fields?: Record<string, Record<string, any>>;
  customer_link?: string;
  execute_workflow?: string;
}

export interface LoanApplicationV2 {
  application: Application;
  primary?: Applicant;
  co_applicant?: Applicant[];
  guarantor?: Applicant[];
  existing_loans?: ExistingLoan[];
  reference_details?: ReferenceDetail[];
  activities?: ActivityDetail[];
  property_details?: PropertyDetail[];
  participant_details?: Record<string, ParticipantDetail>;
  ask_details?: Record<string, AskDetail[]>;
  additional_fields?: Record<string, Record<string, any>>;
  customer_link?: string;
  execute_workflow?: string;
}

export interface BankAnalysisList {
  bank_analysis_id: string;
  person_id?: string;
  entity_id?: string;
  name?: string;
  bank_account_details: BankAccount;
}

// Lead Application interface with workflow and task information
export interface LeadApplication {
  application_id: string;
  type: string;
  code: string;
  name: string;
  mobile: string;
  external_lead_id: string;
  external_journey_type: string;
  external_lead_type: string;
  contact_name: string;
  loan_amount: number;
  loan_code: string;
  loan_status: string;
  apply_capacity: string;
  entity_type: string;
  employment_type: string | null;
  pending_ask_count: number;
  resolved_ask_count: number;
  onboarding_id: string;
  data: {
    sub_status_one: string;
    sub_status_two: string;
  };
  origin_platform: string;
  loan_type_name: string;
  loan_type_code: string;
  sourced_by: {
    user_id: number;
    user_type: string;
    user_name: string;
    user_role: string;
    user_mobile_no: string;
    user_associate_id: string;
    relationship_manager: Record<string, any>;
  };
  processed_by: any;
  represented_by: any;
  serviced_by: any;
  data_synced: number;
  status: number;
  application_status: string;
  application_editable: boolean;
  workflow_instance_id: number;
  active_task: {
    task_name: string;
    task_id: string;
    stage_name: string;
    stage_id: string;
    user_detail: {
      username: string;
      email: string;
      mobile: string;
      user_type: string;
      user_role: string;
      user_role_name: string;
      user_id: string;
      employee_id: string;
      employee_code: string;
    };
    assigned_at: string;
    completed_at: string | null;
  };
  completed_task: {
    task_name: string;
    task_id: string;
    stage_name: string;
    stage_id: string;
    user_detail: {
      username: string;
      email: string;
      mobile: string;
      user_type: string;
      user_role: string;
      user_role_name: string;
      user_id: string;
      employee_id: string;
      employee_code: string;
    };
    assigned_at: string;
    completed_at: string;
  };
  activity: {
    activity_id: string;
    activity_type: string;
    outcome: string;
    feedback: string;
    remark: string;
    latitude: number;
    longitude: number;
    engagement_level: string;
    address: string;
    follow_up_date: string;
    current_step: string;
    user_id: string;
    data: any;
    created_at: string;
    status: number;
  };
  territory_id: string;
  territory_name: string;
  territory_type: string;
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces for leads
export interface LeadsApiResponse {
  application_status: Record<string, string>;
  data: LeadApplication[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  status: number;
}

export interface LeadsApiParams {
  page?: number;
  size?: number;
  journey_type?: string;
  status?: string;
  search?: string;
  territory_id?: string;
}
