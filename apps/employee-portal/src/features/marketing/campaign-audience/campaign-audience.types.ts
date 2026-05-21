// Campaign audience detail — legacy
// /pages/Marketing/CampaignMgmt/Campaign/AudienceListView.js
//
// GET /alpha/v1/marketing/audience?campaign_id={id}[&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD&status=N]
// Response shape (defensive — legacy tries: response.data, response.data.data, response.data.result):
//   AudienceRow[]

export interface AudienceNotification {
  /** Medium identifiers — legacy uses arrays like ["WHATSAPP"]. */
  medium?: string[];
  /** 1 = Sent, -1 = Failed, otherwise Pending. */
  status?: number;
  updated_at?: string;
}

export interface AudienceCampaign {
  id?: string | number;
  name?: string;
  code?: string;
}

export interface AudienceDataPayload {
  name?: string;
  contact_email?: string;
  mobile?: string;
  [key: string]: unknown;
}

export interface AudienceRow {
  audience_id?: string | number;
  /** -1=Failed, 1=Created, 2=Engaging, 3=Completed, 4=Converted. */
  status?: number;
  audience_status?: string;
  /** Top-level fallbacks (legacy reads from either audience_data or row root). */
  name?: string;
  email?: string;
  mobile?: string;
  audience_data?: AudienceDataPayload;
  campaign?: AudienceCampaign;
  notifications?: AudienceNotification[];
  updated_at?: string;
}
