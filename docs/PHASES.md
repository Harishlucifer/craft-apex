# Migration Phases — Status & Pending Work

Tracker for the `craft-apex` rewrite. The original plan had Phases 1–6 + 8
(Phase 7 was unused). **Phase 7 is now active** — it owns the heavy legacy
ports that were deferred out of Phase 4 (each is a 500-1500 LOC page or
multi-step wizard needing its own dedicated session).

Hard rule throughout: every endpoint, query param, request body, and response
field name is read verbatim from `craft-frontend` legacy code — no guessing,
no generic data abstractions, no fallback registries. See
[`docs/MIGRATION.md`](MIGRATION.md) for the per-screen porting recipe.

---

## Status legend

- ✅ Done
- 🟡 Partial / has deferrals
- ⬜ Not started

---

## Phase 1 — Close out wizards already started ✅

Step-2/3 deferrals for forms that previously only saved step-1.

| Sub-phase | Feature | Legacy file | Lines |
|---|---|---|---|
| 1.1 | Loan Type Step 2 (Sub Loan Types) | `AddSubLoanType.js` | 499 |
| 1.2 | Target Plan Step 2 (Target Scheme) | `TargetScheme.js` | medium |
| 1.3 | Lender Step 2 (Lender Loan Types) | `LenderLoanType.js` | — |
| 1.4 | Lender Step 3 (Lender Contract) | `LenderContract.js` | — |
| 1.5 | Builder Step 2 (Add Project) | `AddProject.js` | 1089 |

---

## Phase 2 — Heavy visual / repeater forms ✅

All 7 sub-phases typecheck-clean.

| Sub-phase | Feature | Legacy file(s) | Lines |
|---|---|---|---|
| 2.1 | Rule (+ query-builder primitive) | `AddRule.js` + `QueryOutputList` | 258 + builder |
| 2.2 | Parameter | `AddParameter.js` | 800 |
| 2.3 | NPA Rule | `NpaRuleCreateAndUpdate.js` | 716 |
| 2.4 | Scoring Card (3-step wizard) | `addScoringCard.js` | 335 |
| 2.5 | Verification Type | `AddVerificationType.js` | 1376 |
| 2.6 | Document Checklist | `AddDocChecklist.js` | 2024 |
| 2.7 | Workflow + Field Master form-builder | `WorkflowAdd.js` + `FormBuilder` | 1944 + 800+ |

---

## Phase 3 — Other Add/Edit forms for existing list pages ✅

| Sub-phase | Feature | Status |
|---|---|---|
| 3.1 | Payout Plan wizard | ✅ |
| 3.1a | Incentive Plan variant (`EMPLOYEE` user type) | ✅ — same `PayoutPlanFormPage`; mode toggled by `location.pathname.includes("incentive")`. Wired at `/finance/add-incentive-plan[/:id]` and `/collection/incentive-plan-list`. |
| 3.2 | Marketing Campaign wizard | ✅ |
| 3.3 | Employee (tabbed) | ✅ |
| 3.4 | Lender Scheme wizard | ✅ |
| 3.4a | Receivable Scheme (`PAYABLE` mode flipped) | ✅ — legacy `AddScheme.js` hardcoded `mode="PAYABLE"` (the receivable branch was never live). Mirrored by redirecting `/finance/add-receivable-scheme` → `/settings/add-scheme` in [`routes.tsx`](../apps/employee-portal/src/routes.tsx). |
| 3.5 | Territory | ✅ |
| 3.6 | Partner / Vendor / APF onboarding | ✅ — wired through `OnboardingPage` + workflow runtime in **Phase 8.4**. Legacy `NewChannelList` navigates directly to `/partner/onboarding/:id`; no separate modal-driven Add. |
| 3.7 | BC onboarding | ✅ — wired in **Phase 8.4** (`/bc/onboarding[/:id]` + `/bc/partner/onboarding[/:id]`). |

---

## Phase 4 — Missing list/queue pages ✅ (closed with deferrals)

77 routes originally placeholder-wired. **60 still on `RoutePlaceholder`** —
the rest are real pages now. Phase 4 is **closed**: every remaining
placeholder is in its final-decided state — either a documented legacy
stub/mock (cannot port without backend) or a flagged candidate for the new
**Phase 7 — Heavy legacy ports** queue.

| Sub-phase | Scope | Status |
|---|---|---|
| 4.0 | Shared `RoutePlaceholder` + wire all 77 missing routes | ✅ |
| 4.1 | Verification Queue, Dedupe Q | ✅ |
| 4.2 | Activity tracking, Enquiry, FLDG, Attach Loan, Vehicle | ✅ — Activity dashboards → Phase 7; FLDG / Attach Loan / Vehicle are legacy mocks (won't port); Enquiry → Phase 7 |
| 4.3 | Finance Payable/Receivable estimate + invoice + Sales perf | ⬜ → Phase 5 (each is its own report) |

### Phase 4 pages landed (real ports — 11 total)

- Verification Queue — `/operations/verification/`
- Dedupe Q — `/lead/dedupe-q` (reuses `LeadListPage`)
- Pincode Eligibility — `/utility/pincode-eligibility`
- Marketing Campaign Audience — `/marketing/campaign/:id` (+ `/collection/campaign/:id`)
- Business Card — `/utility/business-card`
- Lender Eligible Pincode List — `/settings/lender/eligible-pincode/list`
- GST Status — `/finance/gst-status`
- Customer 360 — `/customer360-relationship[/:id]` (API-driven sections only)
- Lead Approval Queue — `/lead/list/approval-q`
- **CDN File Manager** — `/cdn-file-manager` (read-only browser; uploads deferred)
- **Marketing Campaign Summary** — `/marketing/campaign/summary` (status tabs + audience filter + clickable cards; uses Phase 6 report scaffold)
- **Lead Reassign** — `/utility/lead-reassign` (Phase 7 landed — see Phase 7 ledger)

### Remaining placeholders (60 routes) — final-state categorization

**A. Legacy stub / mock (no real backend) — won't-port until backend exists:**
- `/attach/fldg[/add[/:id]]`, `/attach/loan-account[/add[/:id]]` — PortfolioList mock data
- `/bc/partner/bulk-upload`, `/partner/bulk-upload`, `/lead/bulk-upload`, `/enquiry/bulk-upload` — 11-line stubs
- `/bc/pending`, `/bc/portfolio/view` — PortfolioList mock data
- `/lead/lender-view` — 11-line stub
- `/los/login-initiate[/:id]` — 12-line stub
- `/operations/verification/summary` — no backing component file
- `/settings/vehicle`, `/settings/vehicle-details`, `/settings/used-vehicle-makes`, vehicle masters — legacy component missing or mock data

**B. Phase 7 — Heavy legacy ports (each warrants its own dedicated session):**
- `/activity/daily-activity`, `/activity/lead-disposition`, `/activity/partner-disposition` — MIS reports (~500 LOC each with 3 sub-components)
- `/activity/live-tracking` — Google Maps + TerritoryTree + EmployeeList
- `/enquiry/customer/list`, `/enquiry/lead/list` — 1474 LOC EnquiryList
- `/enquiry/customer/lead[/:id]` — multi-step intake form
- `/lead/create[/:id]` — LeadCreation multi-step wizard
- `/meet/join` — 1382 LOC WebRTC video call
- `/operations/verification/:id` — 1189 LOC VerificationFlow
- `/operations/verification/transfer` — 774 LOC
- `/utility/doc-checklist-share` — 598 LOC
- `/vehicle/lead/create[/:id]` — AutoFlow vehicle finance wizard

**C. Phase 4.3 finance accounting cluster** (defer to Phase 5 — each fits the
report scaffold once its endpoint is verified against the legacy):
- `/finance/gst/{filing,vendor-gst,withheld}`, `/finance/tds/status`,
  `/setting/lender-gst`, `/settings/company-gst`
- `/finance/{accounting/month-closing, adjustment-card,
  incentive-estimate-list, incentive-statement, invoice-details[/:id],
  lender-payout-upload, payable-estimate, payable-invoice,
  payout-reconciliation-view/:id, receivable-estimate, receivable-invoice}`
- `/finance/sales-{incentive,payable}/earnings`,
  `/finance/sales-performance/overview`,
  `/sales/{incentive-statement, invoice-view, shareable-link}`

---

## Phase 5 — Untouched domain modules ✅ (closed with deferrals)

Phase 5 is **closed**. 7 reports landed against real APIs using the Phase 6
report scaffold; everything else is either a legacy mock (won't-port) or a
large multi-component page deferred to **Phase 7 — Heavy legacy ports**.

### Reports / MIS — landed (7)

- User Login Report — `/reports/user-login-report`
- MIS Pendency — `/reports/mis/pendency-reports`
- MIS Source Productivity — `/reports/mis/source-productivity`
- MIS Bank Performance — `/reports/mis/bank-performance`
- MIS Month-Wise Performance — `/reports/mis/month-wise-performance`
- MIS Process Status — `/reports/mis/process-status`
- **MIS Conveyance Report** — `/reports/mis/conveyance-report` (date input
  YYYY-MM-DD → API DD/MM/YYYY conversion; 5 dashboard cards + 6-col verification table)

### Reports / MIS — deferred to Phase 7 (large)

- **Daily Sales Report** (`/reports/mis/daily-sales-report`,
  `/activity/daily-activity`) — 3 sub-components (PerformanceAnalytics,
  SalesSummaryReport, DispositionDetails); ~500 LOC
- ~~**Attendance Report** (`/reports/mis/attendance-report`)~~ — ✅ landed in Phase 7
- ~~**Verification TAT Report** (`/reports/mis/verification-tat-report`)~~ — ✅ landed in Phase 7 (cards + TAT col deferred — no backend contract)
- ~~**Lead Disposition** (`/activity/lead-disposition`)~~ — ✅ landed in Phase 7
- ~~**Partner Disposition** (`/activity/partner-disposition`)~~ — ✅ landed in Phase 7
- **Channel Sales Report** (`/reports/mis/channel-sales-reports`) — legacy is
  mock-only (no API call), won't-port until backend exists
- ~~**Product Performance** (`/reports/mis/product-performance`)~~ — ✅ landed in Phase 7 (recharts dep added)

### Reports / non-MIS — pending audit

- `/reports/leads` (LeadDownloads / LeadStatus) — date+status+CSV export with
  request-list table
- `/reports/partners` (PartnersDownload) — POST `/alpha/v1/report/partner` with
  date+status filters → CSV download
- `/reports/bureau-reports-list`, `/reports/bureau-report-flow[/:id]` — bureau
  reporting flow
- `/reports/system-usage-report` — platform usage analytics
- `/reports/business-dashboard`, `/reports/portfolio-parameters`,
  `/reports/lms/dashboard`, `/reports/npa/dashboard`, `/reports/pdd-dashboard`
  — per earlier audit, most LMS dashboards in legacy are mock-only

### Untouched domains — won't-port (legacy is mock-only)

Per audit (`grep -l APIENDPOINTS` across each domain dir): no real API
implementation in legacy. These will need fresh backend work before they can
be re-ported.

| Domain | Real API files / total | Disposition |
|---|---|---|
| HR Mgmt (HRMgmt) | 0 / 4 | mock only |
| Incentive Module | 0 / 3 | mock only |
| Industry master | 0 / 1 | mock only |
| Fixed Assets | 0 / 9 | mock only |
| Trade Advance | 0 / 3 | mock only |
| Treasury | 0 / 5 | mock only |
| Decision Queue | 0 / many | mock only |
| LMS Closed Accounts | 0 / 1 | mock only |
| Performance Mgmt | 2 / 5 | → Phase 7 (AssgnTarget + AttachIncentives multi-step flows) |

### Phase 4.3 finance accounting cluster

Stays redirected here from Phase 4. Each fits the `ReportShell` scaffold —
port one when the corresponding endpoint is verified against legacy
(`craft-frontend/src/pages/PayableReceivableMgmt/*` etc.). 21 routes wait,
each independent.

- HR Mgmt — leave, attendance
- Incentive Module — incentive structures
- Industry master
- Fixed Assets — asset master + lifecycle
- Trade Advance — ledger / approvals
- Treasury — operations
- Decision Queue — credit decisions + filters
- Dedupe Q (list page exists; needs its own filter UI)
- Appeal queue
- Customer Status / Offer Details / Company Details
- Auto Consumer — consumer lending
- LOS / LOS Login expansion
- Bulk Upload generic UI
- LMS expansion — Closed Accounts queue
- Reports — Business / Collection / Disbursement / LMS / NPA / PDD / Usage / UserLogin / MdDashboard
- MIS — Attendance / CollectionReport / Conveyance / DailySales / LeadDisposition / MonthWisePerformance / PartnerDisposition / ProcessStatus / ProductPerformance
- Performance Mgmt — AssgnTarget / AttachIncentives / TrackPerformance
- Treasury / Estimate / Invoice — payable/receivable invoicing
- Landing pages — Landing / Job / NFTLanding / OnePage (likely out of scope for employee portal)

---

## Phase 6 — Cross-cutting polish ✅ (closed)

All polish items resolved — three landed as primitives + applied; two
deferred because legacy has no backing implementation to port against.

### Landed

- ✅ **Shared report scaffold** — `ReportShell` + `DateRangeFields` +
  `useReportExport` in
  [`src/components/`](../apps/employee-portal/src/components/). Used by 7
  reports (User Login, Pendency, Source Productivity, Bank Performance,
  Month-Wise Performance, Process Status, Conveyance) + Marketing Campaign
  Summary. `useReportExport(reportType, fileName)` wraps
  `GET /alpha/v1/report/export/:report_type?…` → anchor download.

- ✅ **Permissions / `withModule` parity** — `useModulePermission(action)` +
  `<PermissionGate action="…">` (hide on deny) + `<RouteGuard action="…">`
  (redirect on deny) in
  [`packages/layout/src/permission-gate.tsx`](../packages/layout/src/permission-gate.tsx).
  Applied to **24 list pages** (Add + Edit gated): Builder, Cam Configuration,
  Doc Checklist, Employee, Field Master, Journey Master, Lender, Lender
  Pincode, Lender Scheme, Loan Type, Marketing Campaign, Marketing Links,
  Marketing Media, Module, NPA Rule, Parameter, Payout Plan, Role (inline),
  Rule, Scoring Engine, Target Plan, Template, Territory, Verification Type,
  Workflow. Read-only queues (LeadList, ChannelList, PartnerLeadsList, etc.)
  skipped — no Add/Edit decisions to gate. `<RouteGuard>` is exported but
  not yet wired into `routes.tsx`; can be added incrementally per route.

- ✅ **Active filters strip** —
  [`src/components/active-filters-strip.tsx`](../apps/employee-portal/src/components/active-filters-strip.tsx).
  Removable filter chips + optional Clear-all. Pages assemble an
  `ActiveFilter[]` array and wire each chip's `onClear` to its existing
  filter-state setter. Wired into Campaign Summary as the reference user.
  (Legacy `LeadListFilter` + `CommonListFilter` drawer UIs are larger and
  tied to specific endpoints — those become per-screen ports as the screens
  themselves land. This primitive owns the cross-cutting visualization.)

### Deferred — legacy has no contract to port

- ⬜ **Bulk upload primitive** — won't-build until backend exists. All five
  legacy bulk-upload files (`/pages/BulkUpload/{Lead,Partner,Enquiry}BulkUpload.js`,
  BC partner bulk-upload) are 11-line stubs with no real implementation.
  Routes are placeholder-noted in Phase 4 ledger.

- ⬜ **Channel/Partner approval drawer** — folded into Phase 7. Multi-status
  badges + approval action drawer is part of the partner approval flow,
  which is itself a Phase 7 / future port (the partner approval step uses
  the workflow runtime's `executeWorkflow` reject path). Current partner / BC
  / vendor / APF list pages already render multi-status badges for existing
  onboarding statuses ([channel-list.page.tsx](../apps/employee-portal/src/features/channel/channel-list/channel-list.page.tsx))
  — approval drawer ships when its workflow `ui_component` does.

---

## Phase 7 — Heavy legacy ports ✅ (closed with deferrals)

Pages too large to port in a Phase 4 batch — each needs its own dedicated
session because of multi-component sub-trees, third-party dependencies, or
multi-step wizard state. **All originally-listed Phase 7 routes are now
wired** — each landed entry below documents what is live vs. what is
deferred to a follow-up port (the row entries in the table below show the
"landed + deferred" status per route).

### Landed

- ✅ **Daily Sales Report** — `/reports/mis/daily-sales-report` +
  `/activity/daily-activity`. Two endpoints (`/alpha/v1/report/daily-sales`
  + `/alpha/v1/report/sales-disposition`), outcome cards (auto-derived from
  the dashboard map with per-key icons), Sales Rep summary table (9 cols),
  Disposition Details table (9 cols, badges per outcome). PerformanceAnalysis
  bar/pie charts skipped — would require adding `recharts` (deferred).
  Mirrors legacy's `end_date + 1 day` exclusive-range quirk.
- ✅ **Meet / Join** (LiveKit scaffold) — `/meet/join`. Reads
  `?invitation_token=…&title=…` from the URL (verbatim legacy params). POSTs to
  `/alpha/v1/meet/join {invitation_token, name: title}` → response
  `body.data = {token, livekit_url, participant_name, participant_type,
  session_id, source_id, scheduled_end}`. Mounts `<LiveKitRoom>` with the
  returned token + server URL (falling back to new `VITE_LIVEKIT_URL` env
  var when not supplied). Rendered with LiveKit's prebuilt `GridLayout` +
  `ParticipantTile` + `ControlBar` + `RoomAudioRenderer`. `scheduled_end`
  comparison preserved (space → "T" before `Date.parse`). `onDisconnected`
  POSTs to `/alpha/v1/meet/session/:sessionId/end`, then `window.close()`.
  Added deps: `@livekit/components-react`, `livekit-client`,
  `@livekit/components-styles`. New env var: `VITE_LIVEKIT_URL`.
  **Deferred** (each its own concern from the legacy 1382-LOC file):
  photo-capture with EXIF + signed upload + lightbox; recording start/stop
  (`RECORDING_START`/`RECORDING_STOP` endpoints); HOST role-only controls;
  custom mobile facingMode camera switching (Android-aware); step data
  drawer + verification-metadata binding; data-channel messaging between
  participants; `MEET_LEAVE` leave POST (replaced by `onDisconnected`).
- ✅ **Vehicle Create** (workflow runtime) — `/vehicle/lead/create[/:id]`.
  Same wire-up pattern: legacy `Routes/WithModuleRoutes.js#AutoFlow` mounts
  `CarFlow` which posts `workflow/build` with `workflow_type:
  "CAR_BUYING_JOURNEY"`. Added `WorkflowType.CarBuyingJourney =
  "CAR_BUYING_JOURNEY"` to the enum; routes mount `OnboardingPage` with
  `listPath="/lead/list"`. **No save endpoint configured** — legacy
  `CarFlow.js` itself has no `createUpdate*` call (the `handleSubmit` line
  is commented out), so each step advances via `/alpha/v1/workflow/execution`
  without per-step persistence. When the backend defines a save endpoint
  (e.g. `/alpha/v1/application/create` if reused, or a CAR-specific one),
  add it to `STEP_SAVE_ENDPOINTS`.
- ✅ **Lead Create** (workflow runtime) — `/lead/create[/:id]`. Same wire-up
  as Enquiry Intake — legacy `Routes/WithModuleRoutes.js#LeadCreate` mounts
  `LeadFlowWithDynamic` which dispatches `fetchWorkflow({workflowType:
  workflowType.LeadCreation})`. Reuses Phase 8 runtime: `OnboardingPage`
  with `workflowType="LEAD_CREATION"`, `listPath="/lead/list"`. Save endpoint
  `POST /alpha/v1/application/create` and `result.application.application_id`
  source-id extraction already configured in Phase 7 Enquiry Intake step.
  The bespoke 1892-LOC `LeadCreation.js` step component renders one specific
  `LEAD_CREATION_WITH_CONFIG` ui_component (one of ~200 step components from
  legacy `UIComponents` constant) — same Phase 8.3 deferral as
  Enquiry/Verification: non-FORM_BUILDER ui_components fall back to the raw
  JSON editor until each is ported. `/lead/mobile/create[/:id]` (legacy
  variant without header for the mobile portal) is out of scope here.
- ✅ **Verification Transfer** — `/operations/verification/transfer`. Five
  endpoints verified from legacy `pages/Verification/VerificationTransfer.js`:
  `GET /alpha/v1/master/field-master?code=VERIFICATION_TRANSFER` (returns
  `body.data[0].data[0]` with `form_builder`), `GET /alpha/v1/user/info`
  (for role-code substitution), `GET /alpha/v1/verification/list?download=true
  &self=…&employee_user_id=…&territory_id=…&to_territory_id=…&to_employee_id=…
  &<rest>` (rows at `body.result`), `POST /alpha/v1/verification/transfer
  {from_user_id,to_user_id,from_territory_id,to_territory_id,verification_id[],
  remarks,processor_only}`, `POST /alpha/v1/verification/export?<filter>`
  → `{status:1, download_url}`. The filter form uses Phase 8.3a's structured
  `FormBuilderRenderer` (now async-source-enabled). `{{role_code}}` and
  `{{required_role_code}}` placeholders in field `source.api` URLs are
  substituted at the page level from `user-info` (legacy parity in
  `getFieldList`), with the role-to-required-role mapping kept verbatim
  (BRANCH_INCHARGE → `BRANCH_OFFICER|BRANCH_INCHARGE`; MARKETING_TEAM_LEAD
  → `MARKETING_OFFICER`; else `BRANCH_OFFICER|BRANCH_INCHARGE|MARKETING_OFFICER`).
  Validation order preserved (to_territory → to_employee → selection → not-same
  → remarks). `processor_only` derived from `filterObj.current_to_role ===
  "BRANCH_OFFICER"`. Select-all on page + per-row checkboxes; remarks
  textarea; Export triggers an `<a download>` from `download_url`.
- ✅ **Verification Flow** (workflow runtime) — `/operations/verification/:id`.
  Wired through Phase 8 workflow runtime: `WorkflowType.Verification = "VERIFICATION"`
  was already in the enum; added `VERIFICATION → POST /alpha/v1/verification/create`
  to `STEP_SAVE_ENDPOINTS` (per legacy
  `redux/Verification/verificationThunk.js#createUpdateVerification`). Route
  mounts `OnboardingPage` with `listPath="/operations/verification/"`.
  `saveStepData` source-id extraction extended for `result.verification_id`
  (top-level, per legacy `VerificationFlow.js:698-701` navigation target).
  **Same Phase 8.3 deferrals apply**: only `FORM_BUILDER` ui_components render
  through the structured form; the legacy 1189-LOC file has bespoke ui_components
  for verification scoring, dedupe-status handling (status === -2 retry with
  `dedupe:false`), notes posting (`/alpha/v1/core/note`), score-card config, and
  approval/reject side effects — those still fall back to raw-JSON until each
  ui_component gets a dedicated port.
- ✅ **Enquiry Intake** — `/enquiry/customer/lead[/:id]`. Wired through the
  Phase 8 workflow runtime by adding `WorkflowType.LeadCreation = "LEAD_CREATION"`
  + `LEAD_CREATION → POST /alpha/v1/application/create` to `STEP_SAVE_ENDPOINTS`
  (per legacy `redux/application/applicationThunk.js#createUpdateApplication`).
  Both routes mount `OnboardingPage` with `workflowType="LEAD_CREATION"` and
  `listPath="/enquiry/customer/list"`. New intake (no `:id`) shows the
  journey picker; existing intake (`/lead/:id`) loads the workflow via
  `POST /alpha/v1/workflow/build` with `source_id`. `saveStepData` extended
  to also pull the fresh `sourceId` from `result.application.application_id`
  (legacy navigates to that id post-create). Step rendering reuses Phase 8.3's
  `FormBuilderRenderer` for `FORM_BUILDER` ui_components; other UI components
  (BASIC_DETAILS, LEAD_PERSONAL_DETAILS, PROPERTY_DETAILS, DEDUPE_RESULT, etc.)
  still fall back to the raw-JSON editor — verbatim Phase 8.3 deferral.
- ✅ **Live Tracking** (map + status panel only) — `/activity/live-tracking`.
  Two endpoints: `GET /alpha/v1/user/least/territory` (default territoryId =
  `data[0].id`) and `GET /alpha/v1/report/user-live-location[?territoryId=X
  &role_code=Y]` → `body.data = {user[], user_status, branch[]}`. Google
  Maps via `@react-google-maps/api` (added as a dep) reading the API key
  from new env var `VITE_GOOGLE_MAPS_API_KEY` (legacy reads from tenant
  config `GOOGLE_MAP_API_KEY` — tenant config not wired in craft-apex yet;
  env var stands in). Branch marker + 1-km service circle + employee
  OverlayView markers (initials, color by status: GREEN=active /
  ORANGE=idle / RED=inactive, blue=selected). Verbatim haversine 1-km
  filter that hides users who are "at office". Custom zoom controls + the
  Active/Idle/Inactive status card overlaid in the top-left of the map.
  Missing-key branch renders an in-page amber notice. **Deferred**:
  `TerritoryTree` left sidebar (replaced with a flat select in the header),
  `LiveTrackingFilter` drawer (role-code + multi-territory), `EmployeeList`
  right sidebar — collapsed to a "selected employee" footer card; legacy
  RED/ORANGE/GREEN animation GIFs (no verified assets in repo).
- ✅ **Enquiry List** (list-only) — `/enquiry/customer/list` + `/enquiry/lead/list`.
  Same endpoint as Lead List with the enquiry journey filter:
  `GET /alpha/v1/application?page=N&journey_type=ENQUIRY_APPLICATION` →
  `body.data[]` + `body.pagination.total`. 6 columns: Lead ID (+loan_code),
  Loan Details, Lead Details (with ENTITY contact-person branch),
  Source (channel/user_name + role + journey type + lead type), Status
  (active_task + loan_status badge), Date (DD-MM-YYYY h:mm:ss A). Server
  paginated 10/page. Title varies by path: "/enquiry/customer/list" →
  Customer Enquiries; "/enquiry/lead/list" → Enquiry Leads.
  **Deferred** (each was its own concern in the legacy 1474-LOC file):
  Ask/Partner/Reopen/Summary/AppliedLenders/BankStatement/CreditBureau
  drawers, employee-assign modal, activity stream, CSV export,
  CommonListFilter sidebar, Flexiloans-tenant status-color branch, and
  the application-mobile-mask toggle.
- ✅ **Product Performance** — `/reports/mis/product-performance`. Single endpoint
  `POST /alpha/v1/report/product-performance` (with date-range query string),
  response body `{result: {dashboard[], product_performance_data[],
  loan_amount_chart[], loan_type_chart[]}}` — exact shape from legacy
  index.js. Two charts via **recharts** (added as a dep — legacy uses
  react-apexcharts; recharts chosen for smaller bundle + React-native API):
  3-series bar chart (Total/Sanctioned/Disbursed amounts with y-axis tick
  `value/100000 + "L"` per legacy) + donut chart with verbatim 10-color
  palette and "Total Leads" center label (from `dashboard[0].count`).
  7-column table below. ReportShell with date range filter. **Note**:
  legacy MisFilter modal had a much wider filter set (territory / loan /
  channel / lender / journey type / sourced-by) — only date range wired
  here since the rest of the MIS report ports also stayed simple; legacy's
  POST endpoint accepts the wider set when params are added.
- ✅ **Partner Disposition** — `/activity/partner-disposition`. Three endpoints:
  `GET /alpha/v1/user/least/territory` (branch), `GET /alpha/v1/employee[?territory_id]`
  (employee, refetches on branch change), `GET /alpha/v1/report/partner-disposition`
  called twice on the **same URL**: (1) no `scope` returns `body.data.sales`
  (unused) + `body.summary` (cards — note top-level `summary`, not `data.summary`);
  (2) `scope=PARTNER_FLOW` returns `body.data` as the row stream. Verbatim
  param-casing inconsistency preserved (`start_date`/`end_date` for summary,
  `startDate`/`endDate` for stream). 9-column table: RM Name / Partner Code
  (`dsa_code`) / Partner Name (`partner_name`) + Action / Status / Feedback /
  Date / Location / Remarks.
- ✅ **Lead Disposition** — `/activity/lead-disposition`. Four endpoints:
  `GET /alpha/v1/user/least/territory` (branch list, shared key with other
  reports), `GET /alpha/v1/employee[?territory_id=…]` (sales-person list,
  refreshes on branch change), `GET /alpha/v1/report/daily-sales[?territoryId
  &start_date&end_date&userId]` (dashboard cards from `data.dashboard` map),
  `GET /alpha/v1/report/sales-disposition?scope=APPLICATION_FLOW[&territoryId
  &startDate&endDate&userId]` (disposition stream rows). Mirrors legacy's
  inconsistent param casing (`start_date`/`end_date` for sales vs
  `startDate`/`endDate` for disposition — kept verbatim). Outcome cards
  auto-derive from the dashboard map with cycled icons/tones (mirrors
  legacy's 5-entry `colorIconPool`). 9-column disposition details table
  with badges (Lead ID, Status) and `capitalize` text helpers per legacy.
- ✅ **Doc Checklist Share** — `/utility/doc-checklist-share`. Four endpoints:
  `GET /alpha/v1/user/info` (signer block in PDF + WhatsApp footer),
  `GET /alpha/v1/user/loan-type?status=1` (loan-type chips),
  `GET /alpha/v1/master/checklist/?loanType=ID` (sidebar; legacy filters
  `status === 1`, sorts by `sequence`),
  `GET /alpha/v1/master/checklist/{id}` (`result.checklist_group[]` sorted by
  `sequence`, each with `items[].document.document_name`). WhatsApp share
  uses `https://web.whatsapp.com/send?text=…` with verbatim legacy template
  (Category / Loan Type / numbered groups / note / contact info). PDF
  generated with `jspdf` (added as a dep — legacy uses the same lib) at A4
  portrait with header enquiry box + grouped doc lists + note. **Deferred**:
  the legacy header bitmap logo (embedded as base64) — no verified asset
  ships in this repo, so PDF reserves the space without rendering it.
- ✅ **Verification TAT Report** — `/reports/mis/verification-tat-report`.
  Four lookup endpoints (`GET /alpha/v1/verification/category/list`,
  `/alpha/v1/master/loan-type`, `/alpha/v1/user/least/territory`) + the row
  list (`GET /alpha/v1/verification/list` → `body.result[]`). Columns: 6 of
  the legacy 7 (Verification Details, Loan Details, Applicant, Initiated By,
  Inspected By, Submitted To). Filter dropdowns (Territory / Loan Type /
  Verification Type) + From/To date inputs rendered for parity. **Deferred**
  (no backend contract in legacy): the 5 dashboard summary cards
  (`Total / Completed / Initiation In Process / Inspection In Process /
  Approval In Process` — legacy hard-codes 54/57/4/5/5) and the TAT (Hours)
  column (legacy hard-codes 11h/1h/2h/14h). Filters are inert (legacy never
  sent them either). On-page amber notice explains both deferrals. Verbatim
  `verification_type` → label map (PSIR / PSVR Residence / Property / Self
  Employed / Salaried) preserved.
- ✅ **Attendance Report** — `/reports/mis/attendance-report`. Five endpoints:
  `GET /alpha/v1/master/user-role` (role dropdown — uses `name`/`id`),
  `GET /alpha/v1/user/least/territory` (branch dropdown),
  `GET /alpha/v1/report/attendance?date=YYYY-MM-DD[&role_id=…&territoryId=…]`
  (daily attendance — defaults to today),
  `POST /alpha/v1/report/attendance-summary {start_date,end_date,role_id?,territory_id?}`
  (monthly summary — date range derives from selected date using legacy's
  `new Date(y,m,2)` UTC-correction trick),
  `POST /alpha/v1/user/user-attendance-revert {user_id, punch_type:"PUNCH_OUT"}`
  (revert button shown only when `row.date === today` in "DD-MM-YYYY" form,
  per legacy `toLocaleDateString("en-GB")` comparison). Download buttons
  client-side CSV (legacy used ExportXLSXModal; no backend export endpoint
  exists). Uses ReportShell + DataTableShell.
- ✅ **Lead Reassign** — `/utility/lead-reassign`. Three endpoints:
  `GET /alpha/v1/employee/territory-loantype` (populates Assign From),
  `GET /alpha/v1/application?page=N&ignore_subordinates=true&employee_user_id=…&territory=…&loan_type=…&status=1|2|4[&keyword=…]`
  (server-paginated 10/page, statuses=Created|PendingWithProcess|PendingWithBank),
  `POST /alpha/v1/application/lead-transfer {from_user_id,to_user_id,application_ids}`.
  Assign To list filtered by matching territory+loan_type+role and different
  user_id, deduped by user_id (mirrors legacy `handleSelectSingle`). Selectable
  rows + select-all + server-side keyword filter. Success on `body.status===1`.

### Landed (with deferrals) — status per route

| Route | Legacy file | LOC | Status |
|---|---|---|---|
| `/activity/live-tracking` | `/pages/ActivityTracking/LiveTracking.js` | ~600 | ✅ map+status landed; TerritoryTree + filter drawer + EmployeeList sidebar deferred |
| `/enquiry/customer/list`, `/enquiry/lead/list` | `/pages/EnquiryMgmt/List.js` | 1474 | ✅ list-only landed; action drawers + intake + filter sidebar deferred |
| `/operations/verification/:id` | `/Components/Verification/VerificationFlow.js` | 1189 | ✅ runtime-wired; dedupe retry + notes + scoring + bespoke ui_components deferred |
| `/reports/lms/dashboard` etc. | `/pages/Reports/LMS/*` | mocks | All LMS reports are hard-coded mock data in legacy |

---

## Phase 8 — Workflow Runtime + Partner Onboarding ✅

`apps/employee-portal/src/features/workflow-runtime/` — generic flow engine
loading workflows via `POST /alpha/v1/workflow/build`, executing via
`POST /alpha/v1/workflow/execution`, journey catalog via
`GET /alpha/v1/master/journey-type/group`.

| Sub-phase | Scope | Status |
|---|---|---|
| 8.1 | Scope workflow runtime contracts | ✅ |
| 8.2 | `WorkflowRuntime` component (stepper + step renderer) | ✅ |
| 8.3 | Structured field-master form renderer (replace JSON textarea) | ✅ |
| 8.4 | Wire onboarding routes (partner / BC partner / vendor / collection vendor / APF / BC) | ✅ |

Wired routes (workflow type + partner type taken from legacy
`PartnerFlowWithDynamic.js`, `VendorCreate.js`, `ApfFlowWithDynamic.js`,
`BCOnboardingFlow.js`):

| Route | Workflow type | partner_type |
|---|---|---|
| `/partner/onboarding[/:id]` | `PARTNER_ONBOARDING` | (from URL) |
| `/bc/partner/onboarding[/:id]` | `PARTNER_ONBOARDING` | (from URL) |
| `/vendor/onboarding[/:id]` | `PARTNER_ONBOARDING` | `Servicing` |
| `/collection/vendor/onboarding[/:id]` | `PARTNER_ONBOARDING` | `Servicing` |
| `/apf/onboarding[/:id]` | `PARTNER_ONBOARDING` | `Merchant` |
| `/bc/onboarding[/:id]` | `BC_ONBOARDING` | — |

### Phase 8.3 — landed

Structured renderer lives at
[`form-builder-renderer.tsx`](../apps/employee-portal/src/features/workflow-runtime/form-builder-renderer.tsx)
+ [`form-builder.types.ts`](../apps/employee-portal/src/features/workflow-runtime/form-builder.types.ts).
StepRenderer now switches on `ui_component === "FORM_BUILDER"` and renders the
structured form from `step.configuration.form_builder` (matches legacy
`<DynamicForm formJson={…}/>`). Field type vocabulary mirrors legacy
`craft-formbuilder`: `text`, `textarea`, `password`, `mobile`, `amount`,
`decimal`, `number`, `date`, `datetime-local`, `month`, `checkbox`,
`checkbox-group`, `radio`, `dropdown`, `dropdown-multi-select`,
`dropdown-search`. Honors `conditionalOn` visibility, `disabledOn` disabling,
`validation.required`. Non-FORM_BUILDER ui_components (~200 legacy step
screens like `LEAD_VERIFICATION`, `BASIC_DETAILS`, `BANK_DETAILS`,
`PROPERTY_DETAILS`) fall back to the raw-JSON editor — each one needs its own
port.

Not yet supported in the structured renderer (intentional deferral, no
backend dependency until needed):
- ~~Async option sources (`source.api`)~~ ✅ landed (see Phase 8.3a below)
- `addMore` nested forms
- `autoFill` mappings
- `repeatable` form-level (form-as-list mode)

### Phase 8.3a — async option sources ✅

`form-builder-options.ts` adds `useAsyncFieldOptions(field, allValues)` —
verbatim port of legacy `craft-formbuilder.es.js` `fetchFieldOptions`. When a
dropdown / dropdown-search / dropdown-multi-select / text-auto-complete field
has `source.api`:
- `{{depField}}` placeholders in the URL are substituted from current form
  values (legacy `md(t,n)` helper, including `.keyword` Elasticsearch fallback).
- The fetch is skipped silently when any `dependentOn` value is empty AND the
  URL doesn't include `page=` (legacy invariant).
- Response body is extracted as `result ?? data ?? results ?? []` and each row
  is mapped via `{label: row[labelKey], value: row[valueKey], item: row}` with
  defaults `labelKey="name"`, `valueKey="id"`.
- React Query caches by resolved URL; `source.alwayRefresh` toggles
  `staleTime: 0`.
- Renderer shows an inline "loading…" hint while options stream in.

**Unblocks**: Verification Transfer's filter form (4 dynamic dropdowns) +
removes the "empty dropdown" footgun across all onboarding/intake flows. The
existing **Enquiry Intake**, **Verification Flow**, and **Partner/BC/Vendor/APF
Onboarding** pages now resolve their workflow step async dropdowns when the
step uses `FORM_BUILDER` ui_component.

### Phase 8.5 — per-step data submission ✅

`advance()` now saves the form payload to the workflow's per-type save
endpoint BEFORE calling `/alpha/v1/workflow/execution`. Save endpoint map
(verified against legacy):

| workflow_type | Save endpoint | Legacy thunk |
|---|---|---|
| `PARTNER_ONBOARDING` | `POST /alpha/v1/partner/create` | `partnerThunks.createUpdatePartner` |
| `BC_ONBOARDING` | `POST /alpha/v1/collection` | `CollectionThunk.createUpdateCollection` |

Other workflow types (`VERIFICATION`, `CAMPAIGN`, etc.) still execute without
persisting form data — add their save endpoints to `STEP_SAVE_ENDPOINTS` in
[`workflow-runtime.api.ts`](../apps/employee-portal/src/features/workflow-runtime/workflow-runtime.api.ts)
once verified from the relevant legacy thunk.

Behavior:
- **Submit & Next** — save step data, then advance. If save fails, advance is
  skipped (user keeps their data intact).
- **Reject** — skips save; just advances with `reject=true`. Mirrors legacy
  (`isRejected: true` was always set without save).
- **Skip** — local navigation only (no save, no advance).
- Initial-create flow: when the save response includes
  `result.application.channel_id`, that becomes the new `source_id` for the
  subsequent `workflow/execution` call.

---

## Phase 4.3 + Phase 5 sweep — landed (parallel-agent batch)

A multi-batch parallel sweep using sub-agents — 23 routes ported in three
batches with the no-guessing rule preserved (every endpoint verified from
legacy before write):

**Phase 4.3 finance accounting cluster (landed)**
- ✅ `/finance/gst/filing` — `GSTFiling.js`. `GET /alpha/v1/finance/invoice
  ?gst_settlement_mode=PAID_FULLY` + `POST /alpha/v1/finance/invoice
  /invoice-status-update`.
- ✅ `/finance/gst/withheld` — `WithHeldInvoice.js`. Same endpoints with
  `gst_settlement_mode=PAYMENT_WITHOUT_GST`. `is_gst_released==2` badge.
- ✅ `/finance/gst/vendor-gst` — `VendorGSTListView.js`. `CHANNEL_LIST` with
  `is_gst_defaulter` badge. **Deferred**: "Update GST Status" 3-step modal
  (`PARTNER_DATA_FETCH` → `PARTNER_CREATE` → `POST_NOTE` + GST_STATUS lookup).
- ✅ `/finance/tds/status` — `VendorTDSStatus.js`. CHANNEL_LIST. **Note**:
  legacy hardcodes TDS Status/Rate/Approved/Valid Till as static strings —
  preserved verbatim (no backend fields).
- ✅ `/finance/payable-estimate` — `Estimate.js#moduleName="PARTNER"`. 4
  lookups + `/alpha/v1/finance/estimate?mode=PAYABLE&category=…`.
  **Deferred**: Generate Invoice (`GET_PAYABLE`) button.
- ✅ `/finance/receivable-estimate` — same `Estimate.js` (`mode=PAYABLE`
  hardcoded in legacy even for receivable, preserved verbatim).
- ✅ `/finance/payable-invoice` — `Invoice.js#moduleName="EMPLOYEE_INVOICE"`,
  PAYABLE branch. 11-col table. **Deferred**: Capture Invoice
  (`GENERATE_INVOICE`), `InvoiceFilter` drawer, batch flows.
- ✅ `/finance/receivable-invoice` — `LenderInvoice.js`. Filter form +
  empty list (legacy itself has no list-fetch endpoint — preserved). Submit
  button left disabled (no legacy handler).
- ✅ `/finance/lender-payout-upload` — `UploadPayoutPlan.js`. `GET
  /alpha/v1/finance/payout-dump` + `POST /alpha/v1/finance/payout-dump
  /upload` (multipart). FormData passes through api client unchanged.
- ✅ `/finance/invoice-details/` + `/finance/invoice-details/:id` —
  `InvoiceProcessing.js` → `invoiceWorkFlow.js`. Detail view ports the
  Partner Details + Invoice Details cards via `GET /alpha/v1/finance/invoice
  /{id}` + `GET /alpha/v1/partner/{channelId}`. List route is a deferred
  shell (workflow stepper deferred).
- ✅ `/finance/adjustment-card` — `Adjustments.js`. `GET /alpha/v1/finance
  /invoice/adjustment/list?invoice_id=`. **Deferred**: DynamicForm
  add/edit modal (needs craft-formbuilder host).
- ✅ `/finance/accounting/month-closing` — `MonthClosing.js` is **mock-only**
  (pure UI stub, no backend). Preserved mock layout with explanatory banner.
- ✅ `/finance/incentive-estimate-list` — `SalesEstimateList` → `Estimate.js
  #moduleName="EMPLOYEE"`, INCENTIVE branch with `user_type=EMPLOYEE&
  associate_id={employee_id}`.
- ✅ `/finance/incentive-statement` + `/sales/incentive-statement` —
  `IncentiveStatement.js` → `Invoice.js#moduleName="EMPLOYEE_INCENTIVE"`,
  INCENTIVE branch. Same page mounted at both routes (legacy parity).
- ✅ `/finance/sales-incentive/earnings` — `SalesEarnings.js` →
  `EstimateComponent#moduleName="EMPLOYEE"`. Territory/Employee/Month filters.
- ✅ `/finance/sales-payable/earnings` — `PartnerEarnings.js` →
  `EstimateComponent#moduleName="CHANNEL_ESTIMATE"`. CHANNEL_LIST filter.
- ✅ `/finance/sales-performance/overview` — `TargetReport/index.js`. `POST
  /alpha/v1/report/employee-targets`. SummaryCards + Daily/Weekly/Monthly
  perf tables with verbatim formatters.
- ✅ `/sales/invoice-view` — `SalesInvoice` → `Invoice.js` (PAYABLE+Partner).
  11-col table. **Deferred**: Capture Invoice + InvoiceFilter drawer.
- ✅ `/sales/shareable-link` — `ShareableLinks/index.js`. Three collapsible
  cards: Apply Link, Document Checklist (LOAN_TYPE_MASTER + checklist), Promo
  (`/alpha/v1/marketing/creative?media_tag=PROMO`).
- ✅ `/setting/lender-gst` + `/settings/company-gst` — both render
  `GstDetails.js` branched by `associate_type=TENANT|LENDER` via `GET
  /alpha/v1/finance/gst?status=1&associate_type=…`. **Deferred**: GstModal.
- ✅ `/finance/payout-reconciliation-view/:id` — `PayoutReconciliationView.js`.
  Endpoint `PAYOUT_REVIEW_DETAILS` is referenced in legacy but **not defined**
  in `ApiEndPoint.js` — flagged `LEGACY-TODO` in the api file (the placeholder
  URL must be replaced once the backend contract is confirmed; no fabrication).

**Phase 5 non-MIS reports (landed)**
- ✅ `/reports/leads` — `LeadDownloads`. Request-list pattern: `POST /alpha
  /v1/report/application` to submit; `GET /alpha/v1/report` to poll
  (15s refetch). Loan-type + journey-type dependent selects via
  `/alpha/v1/master/journey-type/group?workflow_type=LEAD_CREATION`.
- ✅ `/reports/partners` — `PartnersDownload`. Single-shot `POST /alpha
  /v1/report/partner?start_date=…&end_date=…&status=…` → preview table +
  31-col CSV export. Verbatim Aadhar masking helper.
- ✅ `/reports/system-usage-report` — `SystemUsageReport.js`. `GET
  /alpha/v1/report/usage-report` + `/alpha/v1/lookup?group_code=PLATFORM` +
  `POST /alpha/v1/user/user-revert` (Revert Lock action). ApexCharts
  replaced with table-only data view (`recharts` available but legacy charts
  were already simple — kept simple data view).
- ✅ `/reports/bureau-reports-list` — `BureauReporsListView.js` (note legacy
  typo). **Mock-only** in legacy (hardcoded 3-row data); mock preserved.
- ✅ `/reports/bureau-report-flow[/:id]` — `BureauReportingFlow.js`. Wired
  through workflow runtime: `OnboardingPage workflowType="BUREAU_REPORTING"`
  + `listPath="/reports/bureau-reports-list"`.
- ✅ `/reports/business-dashboard` — `BusinessDashboard.js`. **Mock-only**
  in legacy. Preserved mock with explanatory banner; all buttons disabled.
- ✅ `/reports/portfolio-parameters` — `PortfolioParameters.js`. **Mock-only**.
  Preserved mock with banner.
- ✅ `/reports/lms/dashboard` — `LmsDashboard.js`. **Mock-only** (static
  landing page; 31 of 35 report tiles have no destination in legacy).
  Preserved mock with banner.
- ✅ `/reports/npa/dashboard` — `NpaDashboard.js`. **Mock-only**. Banner.
- ✅ `/reports/pdd-dashboard` — `PddDashBoard.js`. Legacy partial-mock
  (only `LOAN_TYPE_MASTER` is real; row counts are `Math.random` per legacy
  comment). New port is mock-only with banner; legacy hint preserved.

## Remaining placeholders (18) — won't-port until backend exists

After this sweep, only legacy stubs/mocks with no backend implementation
remain as RoutePlaceholders. Each needs fresh backend work before re-porting:

| Routes | Legacy state |
|---|---|
| `/attach/fldg[/add[/:id]]`, `/attach/loan-account[/add[/:id]]` (6) | PortfolioList uses mock data — no real API |
| `/bc/pending`, `/bc/portfolio/view` (2) | PortfolioList mocks |
| `/bc/partner/bulk-upload`, `/partner/bulk-upload`, `/lead/bulk-upload`, `/enquiry/bulk-upload` (4) | 11-line stubs |
| `/lead/lender-view` (1) | 11-line stub |
| `/los/login-initiate[/:id]` (2) | 12-line stub |
| `/operations/verification/summary` (1) | No backing component file |
| `/settings/vehicle`, `/settings/vehicle-details` (2) | Legacy components missing or mock data |

## Recommended next step

All Phase 4.3, Phase 5, and Phase 7 work is now closed (with documented
deferrals). Productive follow-up directions:

1. **Drill into Phase 7 sub-feature deferrals** — pick one of the
   "landed-with-deferrals" pages and port its specific drawers/modals (e.g.
   Enquiry List action drawers; Live Tracking TerritoryTree sidebar;
   Verification Flow scoring/dedupe; Verification Transfer GstModal).
2. **Port specific workflow `ui_component` step renderers** — replace the
   raw-JSON fallback for high-value bespoke step types like `BASIC_DETAILS`,
   `LEAD_PERSONAL_DETAILS`, `PROPERTY_DETAILS`, `DEDUPE_RESULT`,
   `LEAD_CREATION_WITH_CONFIG`, etc. Each is its own dedicated port.
3. **Phase 8.3b — remaining FormBuilder deferrals**: `addMore` nested forms,
   `autoFill` cross-field mappings, `repeatable` form-as-list mode.
4. **The 18 remaining RoutePlaceholders** need backend implementations
   before they can be ported faithfully.
