// Legacy craft-frontend/src/pages/Marketing/CampaignMgmt/Campaign/index.js
// GET /alpha/v1/marketing/campaign?attribution=X -> { result: CampaignRow[] }

export interface CampaignRow {
  campaign_id?: string | number;
  name?: string;
  data_source?: string;
  attribution?: string;
  description?: string;
  status?: number;
}
