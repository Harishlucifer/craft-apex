// Legacy:
//   Route: /sales/shareable-link → <ShareableLinkComponent />        (allRoutes.js:530)
//   ShareableLinkComponent = withModule(ShareableLink)               (WithModuleRoutes.js:453)
//   ShareableLink default-export from craft-frontend/src/Components/ShareableLinks
//   (index.js — the three-section collapsible: Apply Link / Document Checklist / Promo)
//
//   NB. There is ALSO a ShareableLinks.js (Partner UTM generator) wired at
//   `/shareable-links` (no auth). That is a different screen and not the one
//   targeted here.
//
// Section ↔ endpoint map (all GET, body returned directly by api.get):
//   Apply Link:        no API — reads tenant.user.{partner_sharable_link,
//                                                application_sharable_link}
//   Document Checklist:
//     LOAN_TYPE_MASTER     GET /alpha/v1/master/loan-type
//     LOOKUP_MASTER        GET /alpha/v1/lookup?group_code=APPLICANT_TYPE
//     GET_DOCUMENT_CHECKLIST  GET /alpha/v1/master/checklist?loanType=…&applicantType=…
//                              GET /alpha/v1/master/checklist/{checklist_id}
//   Promo:               GET /alpha/v1/marketing/creative?media_tag=PROMO

// ── Apply Link ────────────────────────────────────────────────────────────────
//
// Legacy reads three fields off the tenant configuration provider:
//   tenant.user.partner_sharable_link
//   tenant.user.application_sharable_link
//   tenant.user.child_partner_sharable_link  (controls whether child-partner UI shows)
//
// craft-apex has no TenantConfigurationProvider yet — we read the same `authUser`
// blob that auth-store persists into localStorage (key: STORAGE_KEYS.authUser).
// The legacy field names are preserved verbatim so a half-migrated tenant payload
// continues to work.
export interface SharableLinkUser {
  partner_sharable_link?: string;
  application_sharable_link?: string;
  child_partner_sharable_link?: string;
}

// ── Document Checklist ────────────────────────────────────────────────────────
export interface LoanTypeRow {
  id: string | number;
  name: string;
}

export interface LookupRow {
  lu_key: string;
  lu_name: string;
}

export interface ChecklistHeader {
  checklist_id?: string | number;
}

export interface ChecklistDocument {
  document_id?: string | number;
  document_name?: string;
}

export interface ChecklistItem {
  document: ChecklistDocument;
}

export interface ChecklistGroup {
  checklist_item_name?: string;
  items?: ChecklistItem[];
}

export interface ChecklistDetail {
  checklist_group?: ChecklistGroup[];
}

// Legacy envelopes (GetCall returns response.data; api.get returns the same body):
//   LOAN_TYPE_MASTER    -> { data: { data: LoanTypeRow[] } }     (legacy reads res.data.data)
//   LOOKUP_MASTER       -> { data: { data: LookupRow[] } }       (legacy reads res.data.data)
//   GET_DOCUMENT_CHECKLIST list:
//                       -> { data: { result: ChecklistHeader[] } }  (legacy reads res.data.result[0])
//   GET_DOCUMENT_CHECKLIST/{id}:
//                       -> { data: { result: ChecklistDetail } }    (legacy reads res.data.result.checklist_group)
export interface LoanTypeResponse {
  data?: { data?: LoanTypeRow[] };
}

export interface LookupResponse {
  data?: { data?: LookupRow[] };
}

export interface ChecklistListResponse {
  data?: { result?: ChecklistHeader[] | null };
}

export interface ChecklistDetailResponse {
  data?: { result?: ChecklistDetail };
}

// ── Promo (marketing creatives) ───────────────────────────────────────────────
export interface PromoCreative {
  media_id?: string | number;
  title?: string;
  description?: string;
  media_url?: string;
  sharable_url?: string;
}

// GetCall returns res.data; legacy reads res.data.result.
export interface PromoCreativeResponse {
  data?: { result?: PromoCreative[] };
}
