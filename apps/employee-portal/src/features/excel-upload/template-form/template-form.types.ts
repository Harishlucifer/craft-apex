export interface FieldDefinition {
  name: string;
  label: string;
  required: boolean;
  conditional: boolean;
  conditional_note?: string;
  allowed_values?: string[];
  blocked?: boolean;
}

export interface FormDefinitionResponse {
  entity_type: string;
  fields: FieldDefinition[];
}

export interface MappingRowForm {
  excel_column: string;
  excel_header: string;
  form_field_key: string;
  is_mandatory: boolean;
  default_value: string;
}

export interface TemplateSavePayload {
  id?: string;
  template_code: string;
  name: string;
  form_entity_type: string;
  column_mapping: MappingRowForm[];
  dedupe_keys: string[];
}
