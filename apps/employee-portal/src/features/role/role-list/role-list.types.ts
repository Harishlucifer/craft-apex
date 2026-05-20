// Exact shape from legacy craft-frontend/src/pages/Configuration/Role/RoleList.js
// GET /alpha/v1/master/user-role  -> Role[]  (top-level array, no envelope)

export interface Role {
  /** json-bigint may return BigInt — render via String() */
  id: string | number | bigint;
  userType: string;
  code: string;
  name: string;
  description?: string;
  /** 1 = Active, else Inactive (legacy convention) */
  status: number;
  createdAt?: string;
  updatedAt?: string;
}
