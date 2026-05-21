// Legacy craft-frontend/src/pages/Templates/{index,Providers,Templates}.js
// POST /alpha/v1/notification/template
// GET  /alpha/v1/notification/template?id=X    -> data.result[0]
// GET  /alpha/v1/master/service-provider       -> data.result
// GET  /alpha/v1/lookup?group_code=COMMUNICATION_PROVIDER_TYPE
// GET  /alpha/v1/parameter                     -> data.data (parameter list)

export interface ServiceProviderRow {
  id: string | number;
  name: string;
  external_id?: string;
  type: string;
  status: number;
  credentials?: unknown;
}

/**
 * Embedded in the template payload (snapshot of the provider used).
 * Legacy `selectedProvider`.
 */
export interface SelectedProvider {
  service_id: string | number;
  provider_name: string;
  type: string;
  credentials?: unknown;
}

export interface ParameterAssociate {
  parameter_associate_id?: string | number | "";
  variable: string;
  rule_parameter_id: string | number | "";
  status: number;
}

export interface TemplateDetail {
  id?: string | number;
  name?: string;
  module?: string;
  service_type?: string;
  template?: string;
  template_id?: string | number;
  flow_id?: string | number;
  status?: number;
  service_provider?: SelectedProvider;
  parameter_associate?: ParameterAssociate[];
}

export interface TemplateSavePayload {
  id?: string | number;
  name: string;
  module: string;
  service_type: string;
  template: string;
  service_provider: SelectedProvider;
  template_id?: string;
  flow_id?: string;
  status: number;
  parameter_associate: ParameterAssociate[];
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
}

export interface ParameterRow {
  id: string | number;
  name: string;
}
