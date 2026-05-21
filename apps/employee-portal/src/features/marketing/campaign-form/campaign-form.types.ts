// Legacy craft-frontend/src/pages/Marketing/CampaignMgmt/Campaign/AddCampaign/*
// POST /alpha/v1/marketing/campaign                            -> save
// GET  /alpha/v1/marketing/campaign?campaign_id=X[&attribution=Y]   -> { result: [CampaignDetail] }
// Lookups: CAMPAIGN_DATA_SOURCE, CAMPAIGN_ATTRIBUTION
//
// Rules and Campaign Details legacy use a deep audience-rule builder and
// header/schedule/media/link selection sub-steps; for now those are JSON
// textareas so the schema round-trips.

export interface CampaignDetail {
  campaign_id?: string | number;
  name?: string;
  attribution?: string;
  description?: string;
  data_source?: string;
  start_date?: string;
  end_date?: string;
  headers?: unknown[];
  schedule_at?: string;
  uploads?: unknown;
  rules?: unknown;
  status?: number;
}

export interface CampaignSavePayload {
  campaign_id?: string | number;
  name: string;
  attribution: string;
  description: string;
  data_source: string;
  start_date: string;
  end_date: string;
  headers: unknown[];
  schedule_at: string;
  uploads: unknown;
  rules?: unknown;
  status: number;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}
