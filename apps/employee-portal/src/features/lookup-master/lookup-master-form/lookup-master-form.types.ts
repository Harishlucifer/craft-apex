// Legacy craft-frontend/src/pages/Configuration/LookupMaster/{LookupList.js,AddLookup.js}
// POST /alpha/v1/lookup/create
//   body = { id?, group_code, lu_key, lu_name, lu_value, created_by, status }

export interface LookupSavePayload {
  id?: string | number | null;
  group_code: string;
  lu_key: string;
  lu_name: string;
  lu_value: string;
  created_by: string;
  status: number;
}
