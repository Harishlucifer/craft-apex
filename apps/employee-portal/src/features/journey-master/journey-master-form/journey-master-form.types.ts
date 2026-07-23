// Legacy craft-frontend/src/pages/JourneyMaster/AddJourneyType.js
// POST /alpha/v1/master/journey-type
//   body = { code, name, workflow_type, user_type, partner_category(JSON string),
//            partner_type, loan_type_id, sequence, enable_display, status,
//            journey_type_id? }

export interface JourneyTypeSavePayload {
  journey_type_id?: string | number;
  code: string;
  name: string;
  workflow_type: string;
  user_type: string;
  /** legacy: JSON-stringified array of partner_category lu_keys */
  partner_category: string;
  partner_type?: string;
  loan_type_id: string | null;
  sequence: number;
  enable_display: boolean;
  status: number;
}

/** Single record from GET /alpha/v1/master/journey-type?id=X (data.data[0]). */
export interface JourneyTypeDetail {
  journey_type_id?: string | number | bigint;
  code?: string;
  name?: string;
  workflow_type?: string;
  user_type?: string;
  /** stringified JSON array */
  partner_category?: string;
  partner_type?: string;
  loan_type_id?: string | number | null;
  sequence?: number;
  enable_display?: boolean;
  status?: number | string;
}

