// Legacy craft-frontend/src/pages/Templates/{index,Providers,Templates}.js
// POST /alpha/v1/notification/template
// GET  /alpha/v1/notification/template?id=X    -> data.result[0]
// GET  /alpha/v1/master/service-provider       -> data.result
// GET  /alpha/v1/lookup?group_code=COMMUNICATION_PROVIDER_TYPE
// GET  /alpha/v1/parameter                     -> data.data (parameter list)
//
// The Service Provider *picker* (see .steps.tsx) reads the canonical
// ServiceProviderRow list (features/service-provider), but its Edit dialog
// is this feature's OWN lightweight form (Name/External Id/Type/Status/
// Credentials, Type sourced from COMMUNICATION_PROVIDER_TYPE) — matching
// legacy Templates/Providers.js exactly, which is a different, simpler
// legacy page than the standalone Service Provider master's own
// ServiceProviderList.js/AddServiceProvider.js (that one has an extra
// Service-Provider-Type -> Type cascade this feature never had).

export interface LookupItem {
  lu_key: string;
  lu_name: string;
}

/**
 * Embedded in the template payload (snapshot of the provider used).
 * Legacy `selectedProvider`. `service_id` must round-trip as a genuine
 * unquoted JSON number — alpha-api's ServiceProviderParams.ServiceId is a
 * plain Go `int` (unlike almost every other referenced-entity id field in
 * this codebase, which is `string`), and real service-provider ids are
 * utility.UniqueId() values that exceed Number.MAX_SAFE_INTEGER, so a JS
 * `number` would silently lose precision — `bigint` (sent through the api
 * client's json-bigint `useNativeBigInt` transform) is the only type that
 * survives the round trip intact.
 */
export interface SelectedProvider {
  service_id: string | number | bigint;
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

export interface ParameterRow {
  id: string | number;
  name: string;
}
