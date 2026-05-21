// Marketing Campaign Summary — legacy
// /pages/Marketing/CampaignMgmt/CampaignSummary.js
// GET /alpha/v1/marketing/campaign/summary?attribution=…[&status=…&data_source=…&from=YYYY-MM-DD&to=YYYY-MM-DD]
// Response: { result: { campaigns: CampaignSummary[], summary?: …, by_status?: … } }

export interface CampaignAudienceLite {
  audience_id?: string | number;
  status?: number;
  [key: string]: unknown;
}

export interface CampaignSummary {
  campaign_id?: string | number;
  name?: string;
  /** -1 = inactive, 1 = active, 2 = published */
  status?: number;
  attribution?: string;
  data_source?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  audiences?: CampaignAudienceLite[];
}

export interface CampaignSummaryResult {
  campaigns: CampaignSummary[];
}

export interface CampaignSummaryFilter {
  /** Legacy collection mode uses just "COLLECTION"; otherwise "APPLICATION|PARTNER". */
  attribution: string;
  status?: string;
  dataSource?: string;
  from?: string;
  to?: string;
}
