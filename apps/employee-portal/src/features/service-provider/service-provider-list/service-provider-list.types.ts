// Legacy craft-frontend/src/pages/ServiceProvider/ServiceProviderList.js
// GET /alpha/v1/master/service-provider -> { result: ServiceProviderRow[] }

export interface ServiceProviderRow {
  id?: string | number | bigint;
  name?: string;
  type?: string;
  credentials?: Record<string, unknown>;
  status?: number;
}
