// Shareable Links — legacy channel-flexi/src/Components/ShareableLinks/index.js
// (three collapsible sections; each sub-file is its own data source)
//
//   applyLink.js         no API — reads tenant.user.partner_sharable_link and
//                        tenant.user.application_sharable_link
//   doucumentCheckList.js
//                        GET /alpha/v1/master/loan-type?status=1        (LOAN_TYPE_MASTER)
//                        GET /alpha/v1/lookup?group_code=ENTITY_TYPE    (LOOKUP_MASTER)
//                        GET /alpha/v1/lookup?group_code=APPLICANT_TYPE (LOOKUP_MASTER)
//                        GET /alpha/v1/master/checklist?loanType=&applicantType=
//                        GET /alpha/v1/master/checklist/{checklist_id}  (GET_DOCUMENT_CHECKLIST)
//   promoMaterials.js    GET /alpha/v1/marketing/creative?media_tag=PROMO (GET_CREATIVE)

// ── Apply Link ───────────────────────────────────────────────────────────────
//
// Legacy reads these off the TenantConfigurationProvider (`tenant.user.*`), which
// is populated by POST /alpha/v1/setup. partner-portal makes no /setup call yet,
// so we read the same field names off the persisted auth user instead. Field
// names are verbatim from legacy so a half-migrated payload keeps working.
export interface SharableLinkUser {
  partner_sharable_link?: string;
  application_sharable_link?: string;
  child_partner_sharable_link?: string;
}

// ── Document Checklist ───────────────────────────────────────────────────────
export interface LoanTypeRow {
  /** json-bigint: ids are strings end-to-end */
  id: string;
  code?: string;
  name: string;
}

export interface LookupRow {
  lu_key: string;
  lu_name: string;
}

/** GET /alpha/v1/master/checklist?loanType=&applicantType= → result[0].checklist_id */
export interface ChecklistHeader {
  checklist_id?: string;
  title?: string;
}

/** alpha-api app/handler/master/checklist.go — DocumentParam */
export interface ChecklistDocument {
  document_id?: string;
  document_name?: string;
}

/** alpha-api — ChecklistItemParams */
export interface ChecklistItem {
  checklist_item_id?: string;
  document?: ChecklistDocument;
}

/** alpha-api — ChecklistItemGroupParams */
export interface ChecklistGroup {
  checklist_item_name?: string;
  items?: ChecklistItem[];
}

/** GET /alpha/v1/master/checklist/{id} → result (ChecklistParams) */
export interface ChecklistDetail {
  checklist_id?: string;
  title?: string;
  checklist_group?: ChecklistGroup[];
}

// ── Promo ────────────────────────────────────────────────────────────────────
/** alpha-api app/handler/marketing/campaign.go — CampaignMediaParam */
export interface PromoCreative {
  media_id?: string;
  title?: string;
  description?: string;
  media_type?: string;
  media_url?: string;
  sharable_url?: string;
}
