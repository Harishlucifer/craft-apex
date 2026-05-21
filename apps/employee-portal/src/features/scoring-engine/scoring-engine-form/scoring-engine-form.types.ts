// Legacy craft-frontend/src/pages/ScoringEngine/{addScoringCard,ScoreCardDetails,ScoreRating,ScoreCardRule}.js
// POST /alpha/v1/core/scorecard               -> save scorecard
// GET  /alpha/v1/core/scorecard/{scoreCardId} -> { data: { result: ScorecardDetail } }
// Lookups:
//   Loan types: /alpha/v1/master/loan-type
//   Parameters: /alpha/v1/parameter
// Rules persisted via /alpha/v1/rule/create.

import type { GroupCondition } from "@/components/query-builder";

export const PURPOSE_OPTIONS = [
  { value: "credit_scoring", label: "Credit Scoring" },
  { value: "loan_approval", label: "Loan Approval" },
] as const;

// Legacy modal hardcoded list.
export const CATEGORY_OPTIONS = [
  { value: "credit_history", label: "Credit History" },
  { value: "income_verification", label: "Income Verification" },
  { value: "employment_status", label: "Employment Status" },
  { value: "debt_ratio", label: "Debt Ratio" },
] as const;

export interface ScoreRatingRow {
  scoreFrom: number | null;
  scoreTo: number | null;
  riskLevel: string;
  remarks: string;
  status: number;
}

export interface ScorecardCategoryRow {
  /** Stable id used in the UI (Date.now() for new rows; string id from server). */
  uiId: string;
  categoryName: string;
  weightage: number;
  ruleId?: string | number | null;
  ruleParameters?: GroupCondition;
}

export interface ScorecardDetail {
  id?: string | number;
  code?: string;
  name?: string;
  rule_id?: string | number;
  description?: string;
  purpose?: string;
  effective_from?: string;
  effective_to?: string;
  status?: number;
  loan_type?: { id?: string | number; name?: string };
  scorecardRatings?: Array<{
    scoreFrom: number | null;
    scoreTo: number | null;
    riskLevel: string;
    remarks: string;
  }>;
  scorecardCategories?: Array<{
    id?: string | number;
    categoryName: string;
    weightage: number;
    ruleId?: string | number | null;
    sequenceNo?: number;
    status?: number;
  }>;
}

export interface ScorecardSavePayload {
  id?: string | number;
  code: string;
  name: string;
  description: string;
  purpose: string;
  loan_type_id: string | number;
  status: number;
  effective_from?: string;
  effective_to?: string;
  scorecardRatings: Array<{
    scoreFrom: number | null;
    scoreTo: number | null;
    riskLevel: string;
    remarks: string;
    status: 1;
  }>;
  scorecardCategories: Array<{
    id: string | "";
    categoryName: string;
    weightage: number;
    sequenceNo: number;
    status: 1;
    ruleId: string | number | null;
  }>;
}
