// Legacy craft-frontend/src/pages/ServiceProvider/AddServiceProvider.js
// POST /alpha/v1/master/service-provider
//   body = { id?, name, provider_type, type, credentials (JSON object), external_id, status }

export interface ServiceProviderPayload {
  id?: string | number | bigint;
  name: string;
  provider_type: string;
  type: string;
  credentials: Record<string, unknown> | null;
  external_id?: string;
  status: number;
}

export interface ServiceProviderForm {
  id?: string | number | bigint;
  name: string;
  provider_type: string;
  type: string;
  /** raw JSON text — parsed before POST */
  credentials: string;
  external_id?: string;
  status: number;
}

/** Legacy fetchListData GET /alpha/v1/lookup?group_code=SERVICE_PROVIDER_TYPE,…_PROVIDER_TYPE */
export interface LookupItem {
  lu_key: string;
  lu_name: string;
  group_code: string;
}
