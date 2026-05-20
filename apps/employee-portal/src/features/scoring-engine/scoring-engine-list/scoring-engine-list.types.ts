// Legacy craft-frontend/src/pages/ScoringEngine/index.js
// GET /alpha/v1/core/scorecard/list -> { data: ScoreCardRow[] }

export interface ScoreCardRow {
  scorecard_id?: string | number;
  name?: string;
  description?: string;
  loan_type?: { name?: string } | string;
  status?: number;
  createdAt?: string;
}
