// Legacy craft-frontend/src/pages/Parameter/ParameterList.js
// GET /alpha/v1/parameter -> { data: ParameterRow[] }

export interface ParameterRow {
  parameter_id?: string | number;
  code?: string;
  name?: string;
  type?: string;
  source_type?: string;
  source?: string;
  param_field?: string;
  status?: number;
}
