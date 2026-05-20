// Legacy craft-frontend/src/pages/ServiceProvider/ServiceProviderList.js
// GET /alpha/v1/master/service-provider -> { result: ServiceProviderRow[] }

export interface ServiceProviderRow {
  id?: string | number | bigint;
  name?: string;
  provider_type?: string;
  type?: string;
  credentials?: Record<string, unknown>;
  external_id?: string;
  status?: number;
}
