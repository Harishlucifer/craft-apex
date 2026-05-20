// Exact shape from legacy craft-frontend/src/pages/Configuration/Role/
//   AddRole.js + AccessRights.js + AddRoleAndRights.js
// Endpoints:
//   GET  /alpha/v1/lookup?group_code=PARTNER_CATEGORY,USER_TYPE -> LookupItem[]
//   GET  /alpha/v1/master/user-role                              -> Role[] (list)
//   GET  /alpha/v1/master/user-role/{id}[?partnerCategory=X]     -> { result }
//   POST /alpha/v1/master/user-role  (body = RoleData)           -> { result }

export interface LookupItem {
  lu_key: string;
  lu_name: string;
  /** legacy: present on PARTNER_CATEGORY items as the display value */
  lu_value?: string;
  group_code: string;
}

export type AllowedPermissionValue = boolean | string | null;
export interface AllowedPermission {
  [key: string]: AllowedPermissionValue;
}

export interface ModuleSystemNode {
  code: string;
  name: string;
  /** legacy: "YES" / "NO" */
  mapped?: string;
  display_mode?: string;
  allowed_permission?: AllowedPermission;
  configuration?: Record<string, unknown> | null;
  child_module?: ModuleSystemNode[];
}

/**
 * Role payload sent on POST + returned in GET `.result`.
 * Field names mirror the legacy AddRole.onSubmit body exactly.
 */
export interface RoleData {
  user_role_id?: number | string;
  user_type: string;
  code: string;
  name: string;
  description?: string;
  data_access?: string;
  status?: number;
  parent_role_id?: string;
  generate_application_link?: string;
  generate_partner_link?: string;
  generate_child_partner_link?: string;
  default_route?: string;
  /** set to null for EMPLOYEE on save (legacy AccessRights.submitData) */
  partner_category?: string | null;
  /** systems[<system_code>] = level-1 modules tree (recursive child_module) */
  systems?: Record<string, ModuleSystemNode[]>;
}

export interface RoleEnvelope {
  result: RoleData;
}

/** Slim row used in the parent-role dropdown (legacy list endpoint shape). */
export interface RoleListItem {
  id: string | number | bigint;
  code: string;
  name: string;
  userType: string;
  user_type?: string;
}
