export type LoginType = 'OTP' | 'PASSWORD' | 'PASSWORD+OTP';

export type PlatformType = 'PARTNER_PORTAL' | 'EMPLOYEE_PORTAL' | 'CUSTOMER_PORTAL';

export interface ModulePermissions {
  add: boolean;
  edit: boolean;
  export: boolean;
  view: boolean;
}

export interface ModuleData {
  map_id: string;
  mapped: string;
  module_id: string;
  code: string;
  name: string;
  system: string;
  icon: string;
  url: string;
  target: string;
  parent_module: string;
  data_access: string;
  allowed_permission: Record<string, any> | null;
  configuration: Record<string, any> | null;
  display_mode: string;
  child_module?: ModuleData[];
}

export interface SystemConfig {
  system: PlatformType;
  login_type: LoginType;
  domain_url: string;
  logo_url: string;
  icon_url: string;
  favicon_url: string;
  login_background_url: string;
  register_background_url: string;
  other_data: Record<string, any>;
  terms_and_condition: string;
  privacy_policy: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface TenantConfig {
  APPLICATION_MOBILE_MASK_ENABLED: string;
  APPLICATION_PROCESSING_ROLE_CODE: string;
  APPLICATION_PSEUDO: string;
  BANK_PARSER_INTEGRATION: string;
  CUSTOMER_PORTAL_URL: string;
  DEFAULT_NOTIFICATION_PROVIDER: string;
  EMPLOYEE_PORTAL_URL: string;
  GOOGLE_MAP_API_KEY: string;
  JOURNAL_ENTRY_PSEUDO: string;
  PARTNER_AGREEMENT_DURATION_MONTHS: string;
  PARTNER_MANAGER_ROLE_CODE: string;
  PARTNER_ONBOARDING_CAPACITY: string;
  PARTNER_PORTAL_URL: string;
  PARTNER_PSEUDO: string;
  PARTNER_RENEWAL_REMINDER_IN_DAYS: string;
  PRIMARY_COLOR: string;
  SECONDARY_COLOR: string;
  TENANT_CODE: string;
  TENANT_CODE_PREFIX: string;
  TENANT_FAVICON: string;
  TENANT_ICON: string;
  TENANT_LOGO: string;
  TENANT_NAME: string;
  TENANT_SHORTENER_DOMAIN: string;
  TENANT_SPOOF_OTP_CODE: string;
  TENANT_TYPE: string;
  TERRITORY_ENABLED: string;
  VERIFICATION_PSEUDO: string;
  VERIFICATION_ROLE_CODE: string;
}

export interface UserData {
  username: string;
  email: string;
  mobile: string;
  user_type: string;
  id: number;
  business_name?: string;
  partner_code?: string;
  is_admin: boolean;
  access_token: string;
  refresh_token: string;
  channel_id?: string;
  partner_category?: string;
  partner_sharable_link: string | null;
  application_sharable_link: string | null;
  default_route: string;
  user_attendance: any | null;
}

export interface SetupData {
  change_password?: boolean;
  module: ModuleData[] | null;
  privilege: any | null;
  system: SystemConfig;
  tenant: TenantConfig;
  user: UserData;
}

export interface SetupResponse {
  data: SetupData;
  status: number;
}

export interface SetupApiHeaders {
  'x-platform': PlatformType;
  'x-tenant-domain': string;
}