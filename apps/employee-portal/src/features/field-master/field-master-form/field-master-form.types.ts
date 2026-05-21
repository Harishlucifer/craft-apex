// Legacy craft-frontend/src/pages/Workflow/Field and Component Master/CreateUpdate.js
// POST /alpha/v1/master/field-master    -> save (body = { ...header, data: <field config> })
// GET  /alpha/v1/master/field-master?type=FIELD|COMPONENT -> { data: FieldMasterRow[] }
//
// The legacy visual builder for the inner `data` is huge (drag-drop sections,
// per-field validation, conditional/dependent rules). We expose it as a JSON
// textarea here — the schema round-trips cleanly and a future iteration can
// add the visual builder on top.

export const FIELD_MASTER_TYPES = [
  { value: "FIELD", label: "Field" },
  { value: "COMPONENT", label: "Component" },
] as const;

export interface FieldMasterDetail {
  id?: string | number;
  type?: string;
  sequence?: number | string;
  code?: string;
  name?: string;
  tags?: string[];
  status?: number;
  data?: unknown;
}

export interface FieldMasterSavePayload {
  id?: string | number;
  type: string;
  sequence: number;
  code: string;
  name: string;
  tags: string[];
  status: number;
  data: unknown;
}
