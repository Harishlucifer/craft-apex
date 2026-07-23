// Legacy craft-frontend/src/pages/Templates/List.js
// GET /alpha/v1/notification/template -> { result: TemplateRow[] }

export interface TemplateRow {
  id?: string | number;
  template_id?: string | number;
  flow_id?: string | number;
  name?: string;
  module?: string;
  service_provider?: { provider_name?: string };
  status?: number;
}
