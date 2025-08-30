// partner.types.ts
import {
  Applicant,
  ReferenceDetail,
  Empanelment,
  Location,
  AskDetail,
  ActivityDetail,
} from "./onboarding";

export interface ChannelUser {
  channel_user_id: string;
  user_id: string;
}

export interface TerritoryLoanMap {
  all_lender_enabled?: boolean;
  territory_type_id?: string;
  territory_type_name?: string;
  territory_id: string;
  territory_name: string;
  loan_type_ids: string[];
  lender_ids?: string[];
  loan_types?: TerritoryLoanType[];
  lenders?: TerritoryLender[];
  sourcing_territory?: string;
  status?: number;
}

export interface TerritoryLoanType {
  loan_type_id: string;
  loan_type_name: string;
}

export interface TerritoryLender {
  lender_id: string;
  lender_name: string;
}

export interface Allocation {
  workflow_type: string;
  partner_category?: string;
  participant_type: string;
  eligibility_rule_id?: string;
  priority_rule_id?: string;
  status?: number;
}

export interface PartnerApplication {
  channel_id: string;
  name: string;
  contact_person: string;
  mobile: string;
  email: string;
  apply_capacity: "ENTITY" | "PERSON";
  entity_type?: string;
  partner_type?: string;
  category?: string;
  terms_and_conditions?: number;
  onboarding_id?: string;
  onboarding_territory_id?: string;
  dsa_code?: string;
  dsa_status?: string;
  project_name?: string;
  data?: Record<string, any>;
  status?: -1 | 1 | 2 | 3 | 4;
  journey_type?: string;
  utm_tags?: Record<string, any>;
}

export interface Renewal {
  renewal_id: string;
  channel_id: string;
  name: string;
  dsa_code: string;
  start_date: string;
  end_date: string;
  renewed_user_id: number;
  renewed_user_name: string;
  remainder_at: string;
  status: number;
  journey_type: string;
  partner_type: string;
}

export interface RegisterApplication {
  application: PartnerApplication;
  applicants: Applicant[];
  reference_details?: ReferenceDetail[];
  empanelments?: Empanelment[];
  locations?: Location[];
  projects?: any[];
  targets?: any[];
  relationship_managers?: string[];
  payout_plan?: string[];
  is_gst_defaulter?: number;
  gst_registration_status?: string;
  channel_territories?: TerritoryLoanMap[];
  dedupe?: boolean;
  channel_user: ChannelUser;
  ask_details?: Record<string, AskDetail[]>;
  channel_allocation?: Allocation[];
  admin_channel_user?: any;
  activities?: ActivityDetail[];
}

export interface RegisterApplicationV2 {
  application: PartnerApplication;
  primary?: Applicant;
  co_applicant?: Applicant[];
  guarantor?: Applicant[];
  reference_details?: ReferenceDetail[];
  empanelments?: Empanelment[];
  locations?: Location[];
  projects?: any[];
  targets?: any[];
  relationship_managers?: string[];
  payout_plan?: string[];
  channel_territories?: TerritoryLoanMap[];
  dedupe?: boolean;
  channel_user: ChannelUser;
  ask_details?: Record<string, AskDetail[]>;
  channel_allocation?: Allocation[];
  admin_channel_user?: any;
  renewal_details?: Renewal;
  activities?: ActivityDetail[];
}
