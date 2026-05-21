// Legacy craft-frontend/src/pages/Builder/{BuilderFlow,AddBuilder}.js
// POST /alpha/v1/master/developer            -> { result: { developer_id } }
// GET  /alpha/v1/master/developer/{id}       -> { data: DeveloperDetail }
// Pincode suggest: GET /alpha/v1/master/pin-code/suggest?pincode=X -> { data: [{ id, pincode }] }
// Pincode details: GET /alpha/v1/master/pin-code?pincode=X -> { data: [{ id, area, coreStateList:{name}, coreCityList:{name} }] }
// Channel list:    GET /alpha/v1/channel?status=3 -> { data: [{ channel_id, name }] }
// Lookups: BINARY_CHOICE, COMPANY_TYPE

export interface BuilderDetail {
  developer_id?: string | number;
  name?: string;
  entity_type?: string;
  contact_name?: string;
  contact_mobile?: string;
  pincode?: string;
  pincode_id?: string | number;
  channel_id?: string | number | null;
  no_of_project?: number | string;
  status?: number;
}

export interface BuilderSavePayload {
  developer_id?: string | number;
  name: string;
  entity_type: string;
  contact_name: string;
  contact_mobile: string;
  pincode: string;
  no_of_project: number;
  channel_id?: string | number;
  status: number;
}

export interface PincodeSuggestion {
  id: string | number;
  pincode: string;
}

export interface PincodeDetail {
  id: string | number;
  area: string;
  pincode?: string;
  coreStateList?: { name?: string };
  coreCityList?: { name?: string };
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface ChannelOption {
  channel_id: string | number;
  name: string;
}
