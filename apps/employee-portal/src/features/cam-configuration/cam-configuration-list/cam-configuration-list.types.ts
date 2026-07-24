// Legacy craft-frontend/src/pages/Configuration/CamConfiguration/CamConfigurationList.js
// GET /alpha/v1/master/cam-configuration -> { result: CamConfigRow[] }

export interface CamConfigRow {
  configuration_id?: string | number;
  title?: string;
  type?: string;
  product_code?: string;
  rule_id?: string | number;
  loan_type_name?: string;
  sequence?: number | string;
  template_name?: string;
  status?: number;
}
