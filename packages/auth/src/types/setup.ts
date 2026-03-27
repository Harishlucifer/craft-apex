/* ------------------------------------------------------------------ */
/*  Types for POST /alpha/v1/setup response                          */
/* ------------------------------------------------------------------ */

export interface SetupOtherData {
  dashboard_banner: string;
  hide_password_reset: boolean;
  default_login_system?: string;
  login_logo?: string;
  login_header?: string;
  login_footer?: string;
  [key: string]: unknown;
}

export interface SetupSystem {
  system: string;
  login_type: string;
  domain_url: string;
  logo_url: string;
  icon_url: string;
  favicon_url: string;
  login_background_url: string;
  register_background_url: string;
  other_data: SetupOtherData;
  terms_and_condition: string;
  privacy_policy: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface SetupTenant {
  [key: string]: unknown;
}

export interface SetupUser {
  username: string;
  employee_code: string;
  employee_id: string;
  email: string;
  mobile: string;
  user_type: string;
  id: number;
  is_admin: boolean;
  access_token: string;
  refresh_token: string;
  partner_sharable_link: string | null;
  application_sharable_link: string | null;
  user_boundaries: unknown[];
  default_route: string;
  user_attendance: unknown | null;
}

export interface SetupData {
  change_password: boolean;
  module: unknown | null;
  privilege: unknown | null;
  system: SetupSystem;
  tenant: SetupTenant;
  user: SetupUser;
}

export interface SetupResponse {
  data: SetupData;
  status: number;
}
