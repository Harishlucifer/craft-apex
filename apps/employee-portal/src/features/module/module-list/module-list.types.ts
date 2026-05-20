// Legacy craft-frontend/src/pages/Configuration/MenuModule/ModuleList.js
// GET /alpha/v1/master/module -> { data: ModuleRow[] }

export interface ModuleRow {
  module_id?: string | number;
  code?: string;
  system?: string;
  name?: string;
  url?: string;
  status?: number;
  parent_module?: { name?: string } | null;
}
