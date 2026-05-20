// Legacy craft-frontend/src/pages/Workflow/Field and Component Master/list.js
// GET /alpha/v1/master/field-master?type=FIELD|COMPONENT -> { data: FieldMasterRow[] }

export interface FieldMasterRow {
  field_master_id?: string | number;
  sequence?: number;
  name?: string;
  type?: string;
  tags?: string;
  status?: number;
}
