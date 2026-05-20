// Legacy craft-frontend/src/pages/JourneyMaster/JourneyMaster.js
// GET /alpha/v1/master/journey-type -> { data: JourneyTypeRow[] }

export interface JourneyTypeRow {
  id?: string | number | bigint;
  code?: string;
  name?: string;
  workflow_type?: string;
  loan_type?: { name?: string } | string;
  status?: number;
}
