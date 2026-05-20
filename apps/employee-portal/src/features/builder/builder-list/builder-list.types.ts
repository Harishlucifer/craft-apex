// Legacy craft-frontend/src/pages/Builder/BuildersList.js
// GET /alpha/v1/master/developer -> { data: BuilderRow[] }

export interface BuilderRow {
  developer_id?: string | number;
  contact_name?: string;
  contact_mobile?: string;
  no_of_project?: number | string;
  status?: number;
}
