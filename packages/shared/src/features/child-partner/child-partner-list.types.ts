export interface ChildPartnerListItem {
  id?: string;
  channel_user_id: string;
  channel_id: string;
  code: string;
  name: string;
  email: string;
  mobile: string;
  role_id: string;
  role_name: string;
  channel_name: string;
  employee_id: string;
  employee_name: string;
  supervisor_user_id?: string;
  supervisor_name?: string;
  territory_id?: string;
  territory_name?: string;
  address?: string;
  pincode_id?: number;
  pincode?: string;
  status: number;
  created_at: string;
}

export interface ChildPartnerListResponse {
  status: number;
  data: {
    data: ChildPartnerListItem[];
    pagination?: {
      total: number;
      page: number;
      size: number;
    };
  };
  pagination?: {
    total: number;
    page: number;
    size: number;
  };
}

export interface ChannelOption {
  channel_id: number;
  name: string;
  partner_category?: string;
}

export interface ChannelRoleOption {
  id: number;
  name: string;
  code: string;
  user_type: string;
}

export interface RMEmployeeOption {
  employee_id: number;
  user_id: number;
  name: string;
}

export interface SupervisorOption {
  channel_user_id: string;
  name: string;
}

export interface TerritoryOption {
  id: string;
  name: string;
}

export interface PincodeOption {
  id: number;
  pincode: string;
  area: string;
  coreCityList: {
    id: number;
    name: string;
  };
  coreStateList: {
    id: number;
    name: string;
  };
  coreCountryList: {
    id: number;
    name: string;
  };
}

export interface DocumentConfig {
  document_id: number;
  document_name: string;
  is_mandatory: boolean;
}

export interface UploadedDocument {
  document_id: string;
  document_name: string;
  file_name?: string;
  file_url?: string;
  is_password_protected?: boolean;
  password?: string;
  file?: File;
}
