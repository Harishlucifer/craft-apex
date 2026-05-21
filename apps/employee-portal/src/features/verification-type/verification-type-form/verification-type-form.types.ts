// Legacy craft-frontend/src/pages/Verification/VerificationType/AddVerificationType.js
// POST /alpha/v1/verification/category/create  -> { data: { result: VerificationCategoryDetail } }
// GET  /alpha/v1/verification/category/{id}    -> { data: { result: VerificationCategoryDetail } }
// Lookups: EMPLOYMENT_TYPE, APPLY_CAPACITY, VERIFICATION_TYPE,
//          VERIFICATION_RELATIONSHIP_TYPE, QUESTIONNAIRE_FIELD_TYPE, CHECKLIST_TYPE
// Loan types: /alpha/v1/master/loan-type
// Rules:     /alpha/v1/rule (filter by .type)
// Lenders:   /alpha/v1/master/lender

export interface VerificationCategoryDetail {
  verification_category_id?: string | number;
  verification_category?: string;
  verification_category_code?: string;
  verification_category_scope?: string;
  apply_capacity?: string;
  loan_type_id?: string | number;
  verification_type?: string;
  employment_type?: string;
  lender_id?: string | number;
  template_rule_id?: string | number;
  eligible_rule_id?: string | number;
  templates?: VerificationTemplate[];
  allocation_rules?: Array<{ allocation_rule_id?: string | number }>;
}

export interface VerificationTemplate {
  rule_id?: string | number;
  relationship_type: string;
  questions: VerificationQuestion[];
}

export interface VerificationQuestion {
  question_id?: string | number;
  question_type: string;
  question_name: string;
  question_category?: string;
  group_label: string;
  group_sequence: number | string;
  group_label_display?: string;
  sequence: number | string;
  is_mandatory?: boolean;
  question_options?: string[] | null;
  question_validation?: unknown;
  question_conditional_on?: unknown;
  question_dependent_on?: unknown;
  question_disabled_on?: unknown;
  question_auto_fill?: unknown;
}

export interface AllocationRuleRow {
  allocation_rule_id: string | number;
  // Cached display fields from the rule master.
  name?: string;
  type?: string;
}

export interface VerificationCategorySavePayload {
  verification_category_id?: string | number;
  verification_category: string;
  apply_capacity: string;
  loan_type_id: string | number | "";
  verification_category_scope: string;
  verification_type: string;
  verification_category_code: string;
  employment_type: string;
  lender_id: string | number | "";
  template_rule_id: string | number | "";
  eligible_rule_id: string | number | "";
  allocation_rules: Array<{ allocation_rule_id: string | number; verification_category_id?: string | number }> | null;
  templates: VerificationTemplate[];
}

export interface RuleRow {
  id: string | number;
  name: string;
  type?: string;
}

export interface LenderRow {
  lender_id: string | number;
  name: string;
}

export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}
