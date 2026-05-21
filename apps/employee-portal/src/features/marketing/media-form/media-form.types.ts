// Legacy craft-frontend/src/pages/Marketing/MarketingAssets/Media/addMedia.js
// POST /alpha/v1/marketing/media
// GET  /alpha/v1/marketing/media?media_id=X    -> data.result[0]
// Lookups: MEDIA_TYPE, MARKETING_CREATIVE (media_tags), PLATFORM
// Links list:    GET /alpha/v1/marketing/link  -> data.result

export interface MediaDetail {
  media_id?: string | number;
  title?: string;
  description?: string | null;
  media_type?: string;
  media_url?: string;
  sequence?: number | string;
  language?: string;
  media_tags?: string[];
  platform?: string[];
  link_id?: string | number;
  utm_tags?: Record<string, string> | null;
  status?: number;
  sharable_url?: string;
}

export interface MediaSavePayload {
  media_id?: string | number;
  title: string;
  description?: string;
  media_type: string;
  media_url: string;
  sequence: number;
  language: string;
  media_tags: string[];
  platform: string[];
  link_id?: string | number;
  utm_tags: Record<string, string>;
  status: number;
}

export interface LookupItem {
  group_code: string;
  lu_key: string;
  lu_name: string;
}

export interface LinkOption {
  link_id: string | number;
  name: string;
}
