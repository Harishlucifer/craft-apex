// Legacy craft-frontend/src/Components/LMS/ServiceRequestFlow/AddServiceRequestType.js
// GET  /alpha/v1/service/type             -> { data: ServiceRequestTypeRow[] }
// POST /alpha/v1/service/type             body = full row (status 0 to deactivate)

export interface ServiceRequestTypeRow {
  id?: string | number | bigint;
  code: string;
  name: string;
  category?: string;
  workflow_type: string;
  /** Booleans persisted as 0/1 in legacy */
  require_snapshot?: 0 | 1;
  require_proposed_terms?: 0 | 1;
  require_approval?: 0 | 1;
  status: number;
}

export interface ServiceRequestTypeSavePayload extends ServiceRequestTypeRow {
  id?: string | number;
}
