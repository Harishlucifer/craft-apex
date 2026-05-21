// Legacy craft-frontend/src/pages/Configuration/MenuModule/AddModule.js
// POST /alpha/v1/master/module
//   body = { module_id?, user_type, system, parent_module_id, code, name,
//            description, url, icon, sequence, target, allowed_permission,
//            status, display_mode }

export interface ModuleSavePayload {
  module_id?: string | number;
  user_type: string;
  system: string;
  parent_module_id: string | null;
  code: string;
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  sequence: number;
  target?: string;
  allowed_permission?: Record<string, unknown> | null;
  status: number;
  display_mode?: string;
}

/** Single module detail returned by `GET /alpha/v1/master/module?id=X` (data.data[0]). */
export interface ModuleDetail {
  module_id?: string | number | bigint;
  user_type?: string;
  system?: string;
  parent_module_id?: string | number | bigint | null;
  code?: string;
  name?: string;
  description?: string;
  url?: string;
  icon?: string;
  sequence?: number;
  target?: string;
  allowed_permission?: Record<string, unknown> | null;
  status?: number | string;
  display_mode?: string;
}

export interface LookupItem {
  lu_key: string;
  lu_name: string;
  group_code: string;
}

export interface ParentModuleOption {
  module_id?: string | number | bigint;
  name: string;
  system: string;
}
