// Legacy craft-frontend/src/pages/Marketing/MarketingAssets/Links/index.js
// GET /alpha/v1/marketing/link -> { result: LinkRow[] }

export interface LinkRow {
  link_id?: string | number;
  name?: string;
  attribution?: string;
  url?: string;
  status?: number;
}
