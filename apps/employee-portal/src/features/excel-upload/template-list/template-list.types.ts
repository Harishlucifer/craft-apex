export interface ColumnMapping {
  excel_column: string;
  excel_header: string;
  form_field_key: string;
  is_mandatory: boolean;
  default_value?: string;
}

export type TemplateStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "DEPRECATED";

export interface TemplateRow {
  id: string;
  template_code: string;
  version: number;
  name: string;
  form_entity_type: string;
  dedupe_keys: string[];
  status: TemplateStatus;
  maker_name?: string;
  checker_name?: string;
  created_at: string;
}

export interface TemplateDetail extends TemplateRow {
  column_mapping: ColumnMapping[];
  maker_user_id: string;
  checker_user_id?: string;
  submitted_at?: string;
}
