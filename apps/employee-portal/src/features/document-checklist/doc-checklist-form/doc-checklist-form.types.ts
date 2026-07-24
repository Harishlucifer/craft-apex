// Legacy craft-frontend/src/pages/DocumentChecklist/AddDocChecklist.js
//                     craft-frontend/src/pages/DocumentChecklist/OcrDocumentFieldMaster.js (Field Master step)
// POST /alpha/v1/master/checklist          -> { result: ChecklistDetail }
// GET  /alpha/v1/master/checklist/{id}     -> { result: ChecklistDetail }
// Lookups: CHECKLIST_TYPE, CHECKLIST_ITEM_MANDATORY, APPLICANT_TYPE, CHECKLIST_TAGS,
//          CHECKLIST_FIELD_CATEGORY, CHECKLIST_SOURCE_TYPE, SOURCE_MATCH_TYPE
// Loan types:        /alpha/v1/master/loan-type
// Lenders:           /alpha/v1/master/lender         -> result[]
// Rules (filter type=CHECKLIST_APPLICATION): /alpha/v1/rule
// Document classes:  /alpha/v1/master/document-class
// Document names:    /alpha/v1/master/document
// Service providers: /alpha/v1/master/service-provider?provider_type=OCR
//
// alpha-api (app/handler/master/checklist.go) request/response contract, confirmed:
// - Single shared upsert endpoint for header + checklist_group + checklist_field
//   together (no separate per-step endpoints) — Title/Type/Sequence/ApplicableTo
//   are `validate:"required"` on every save, including step 2/3 saves, so every
//   POST must resend the full header (never partial/empty).
// - Create/update response is `{status, result}` where `result` is the FULL
//   ChecklistParams (same shape as the request), with the (possibly new)
//   `result.checklist_id` — there is no top-level `id`/`checklist_id` outside
//   `result`.

export interface ChecklistItem {
  checklist_item_id?: string;
  document: {
    document_id: string | number;
    document_name: string;
  };
  document_class: {
    document_class_id: string | number;
    document_class_name: string;
  };
  rule_id?: string;
  service_provider_id?: string;
  allowed_count?: number;
  status: number;
}

export interface ChecklistGroup {
  checklist_id?: string | "";
  checklist_item_name: string;
  group_sequence?: number;
  mandatory?: string;
  items: ChecklistItem[];
}

// Field Master step (checklist_field / checklist_source) — legacy
// OcrDocumentFieldMaster.js. No mandatory/required flag on a field; a source
// is what populates/validates a field's value (OCR extraction, API, or manual
// entry). `autofill_configuration` is a freeform JSON blob (edited as raw
// text, same convention as loan-type's `configuration` field).
export interface ChecklistSource {
  checklist_source_id?: string;
  source_type: string;
  document_id?: string | number;
  source_field?: string;
  match_type?: string;
  rule_id?: string;
  sequence?: number;
  status: number;
}

export interface ChecklistField {
  checklist_field_id?: string;
  field_name: string;
  field_category: string;
  target_field?: string;
  sequence?: number;
  status: number;
  autofill_configuration?: unknown;
  checklist_source: ChecklistSource[];
}

export interface ChecklistDetail {
  checklist_id?: string | number;
  title?: string;
  type?: string;
  sequence?: number | string;
  status?: number;
  applicable_to?: string;
  loan_type?: { loan_type_id?: string | number; loan_type_name?: string };
  lender_id?: string | number;
  rule_id?: string | number;
  tags?: string[];
  checklist_group?: ChecklistGroup[];
  checklist_field?: ChecklistField[];
}

export interface ChecklistSavePayload {
  checklist_id?: string | number | "";
  title: string;
  type: string;
  sequence: number;
  status: number;
  applicable_to: string;
  loan_type?: { loan_type_id: string | number; loan_type_name: string } | null;
  lender_id?: string | number | null;
  rule_id?: string | null;
  tags?: string[];
  checklist_group: ChecklistGroup[];
  checklist_field?: ChecklistField[];
}

export interface DocumentClassRow {
  document_class_id: string | number;
  document_class_name: string;
}

export interface DocumentRow {
  document_id: string | number;
  document_name: string;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface RuleRow {
  id: string | number;
  name: string;
  type?: string;
}

export interface ServiceProviderRow {
  id: string | number;
  name: string;
}
