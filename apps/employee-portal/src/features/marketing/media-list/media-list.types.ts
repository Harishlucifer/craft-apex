// Legacy craft-frontend/src/pages/Marketing/MarketingAssets/Media/index.js
// GET /alpha/v1/marketing/media -> { result: MediaRow[] }

export interface MediaRow {
  media_id?: string | number;
  title?: string;
  media_type?: string;
  media_tags?: string;
  media_url?: string;
  status?: number;
}
