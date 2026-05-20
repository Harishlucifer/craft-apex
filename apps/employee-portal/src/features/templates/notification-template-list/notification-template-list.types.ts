// Legacy craft-frontend/src/pages/Templates/List.js
// GET /alpha/v1/notification/template -> { result: TemplateRow[] }

export interface TemplateRow {
  template_id?: string | number;
  flow_id?: string | number;
  name?: string;
  module?: string;
  provider_name?: string;
  status?: number;
}
