// Legacy craft-frontend/src/pages/Configuration/LookupMaster/LookupList.js
// GET /alpha/v1/lookup/group -> { data: { [GROUP_CODE: string]: LookupItem[] } }

export interface LookupItem {
  id?: string | number;
  group_code?: string;
  lu_key?: string;
  lu_name?: string;
  lu_value?: string;
  status?: number;
  created_by?: string;
}

export interface LookupGroup {
  groupCode: string;
  values: LookupItem[];
}
