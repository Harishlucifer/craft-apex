// Legacy craft-frontend/src/pages/DocumentChecklist/AddDocChecklist.js
// POST /alpha/v1/master/checklist          -> { result: ChecklistDetail }
// GET  /alpha/v1/master/checklist/{id}     -> { result: ChecklistDetail }
// Lookups: CHECKLIST_TYPE, CHECKLIST_ITEM_MANDATORY, APPLICANT_TYPE, CHECKLIST_TAGS
// Loan types:        /alpha/v1/master/loan-type
// Lenders:           /alpha/v1/master/lender         -> result[]
// Rules (filter type=CHECKLIST_APPLICATION): /alpha/v1/rule
// Document classes:  /alpha/v1/master/document-class
// Document names:    /alpha/v1/master/document
// Service providers: /alpha/v1/master/service-provider?provider_type=OCR

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
  checklist_field?: unknown[];
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
  checklist_field?: unknown[];
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

export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LenderRow {
  lender_id: string | number;
  name: string;
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
