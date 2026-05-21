// Legacy craft-frontend/src/pages/Configuration/CamConfiguration/AddCamConfiguration.js
// POST /alpha/v1/master/cam-configuration
//   body = { configuration_id?, title, type, product_code, sequence,
//            applicable_to, apply_capacity, apply_for, rule_id,
//            loan_type_id, template_id, status }

export interface CamConfigSavePayload {
  configuration_id?: string | number;
  title: string;
  type: string;
  product_code: string;
  sequence: number;
  applicable_to: string;
  apply_capacity: string;
  apply_for: string;
  rule_id?: string | number;
  loan_type_id?: string | number;
  template_id?: string | number;
  status: number;
}

/** GET /alpha/v1/master/cam-configuration/{id} → body.result */
export interface CamConfigDetail {
  configuration_id?: string | number | bigint;
  title?: string;
  type?: string;
  product_code?: string;
  sequence?: number;
  applicable_to?: string;
  apply_capacity?: string;
  apply_for?: string;
  rule_id?: string | number | bigint;
  loan_type_id?: string | number | bigint;
  template_id?: string | number | bigint;
  status?: number;
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
  group_code: string;
}

export interface IdNameRow {
  id?: string | number | bigint;
  name?: string;
}

export interface NotificationTemplateRow {
  id?: string | number | bigint;
  name?: string;
}
