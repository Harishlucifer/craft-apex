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
- `/utility/lead-reassign` — 446 LOC (selectable rows + employee territory pickers)
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
- **Attendance Report** (`/reports/mis/attendance-report`) — 363 LOC, 8 API
  refs (employee role + attendance + summary + punch-out revert + territory)
- **Verification TAT Report** (`/reports/mis/verification-tat-report`) — 451 LOC,
  4 lookup endpoints + complex filter structure
- **Lead Disposition** (`/activity/lead-disposition`) — disposition stream
- **Partner Disposition** (`/activity/partner-disposition`) — partner-flow
  disposition aggregation
- **Channel Sales Report** (`/reports/mis/channel-sales-reports`) — legacy is
  mock-only (no API call), won't-port until backend exists
- **Product Performance** (`/reports/mis/product-performance`) — chart-heavy
  (loan_amount_chart + loan_type_chart Apex chart sub-components)

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

## Phase 7 — Heavy legacy ports 🟡

Pages too large to port in a Phase 4 batch — each needs its own dedicated
session because of multi-component sub-trees, third-party dependencies, or
multi-step wizard state.

### Landed

- ✅ **Daily Sales Report** — `/reports/mis/daily-sales-report` +
  `/activity/daily-activity`. Two endpoints (`/alpha/v1/report/daily-sales`
  + `/alpha/v1/report/sales-disposition`), outcome cards (auto-derived from
  the dashboard map with per-key icons), Sales Rep summary table (9 cols),
  Disposition Details table (9 cols, badges per outcome). PerformanceAnalysis
  bar/pie charts skipped — would require adding `recharts` (deferred).
  Mirrors legacy's `end_date + 1 day` exclusive-range quirk.

### Pending

| Route | Legacy file | LOC | Why heavy |
|---|---|---|---|
| `/activity/lead-disposition` | `/pages/MIS/LeadDisposition/LeadDisposition.js` | ~500 | Disposition stream rendering |
| `/activity/partner-disposition` | `/pages/MIS/PartnerDisposition/PartnerDispositionReport.js` | ~500 | Partner-flow disposition |
| `/activity/live-tracking` | `/pages/ActivityTracking/LiveTracking.js` | ~600 | Google Maps + TerritoryTree + EmployeeList |
| `/enquiry/customer/list`, `/enquiry/lead/list` | `/pages/EnquiryMgmt/List.js` | 1474 | Enquiry list with intake actions |
| `/enquiry/customer/lead[/:id]` | `EnquiryCustomerLeadsFollowUp.js` | ~600 | Multi-step intake |
| `/lead/create[/:id]` | `LeadCreation/LeadCreation.js` | very large | Multi-step lead intake wizard |
| `/meet/join` | `/Components/Verification/videoPDMeet/VideoCallScreen.js` | 1382 | WebRTC video call |
| `/operations/verification/:id` | `/Components/Verification/VerificationFlow.js` | 1189 | Verification step flow |
| `/operations/verification/transfer` | `/pages/Verification/VerificationTransfer.js` | 774 | Reassignment wizard |
| `/utility/doc-checklist-share` | `/pages/DocumentChecklist/ChecklistShare.js` | 598 | Share link generation |
| `/utility/lead-reassign` | `/pages/Utility/Utilityreassign.js` | 446 | Selectable rows + employee territory pickers |
| `/vehicle/lead/create[/:id]` | `AutoFlow` (CarLead) | very large | Vehicle finance wizard |
| `/reports/mis/attendance-report` | `AttendanceReport.js` | 363 + 5 endpoints | Employee role + attendance + summary + punch revert + territory |
| `/reports/mis/verification-tat-report` | `VerificationTATReport.js` | 451 | Multi-lookup filter (category + loan type + territory + verification list) |
| `/reports/mis/product-performance` | `ProductPerformance/index.js` | 302 + charts | Apex `loan_amount_chart` + `loan_type_chart` sub-components |
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
- Async option sources (`source.api`)
- `addMore` nested forms
- `autoFill` mappings
- `repeatable` form-level (form-as-list mode)

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

## Recommended next step

Phase 8 is fully landed (incl. 8.3 structured renderer). Remaining options:

1. **Phase 8.5** — per-step data submission. The structured form now collects
   data into `stepData` but `advance()` only advances stages; it does not POST
   the form payload to the per-step endpoint (e.g. `/alpha/v1/partner/create`).
   Highest payoff to make onboarding actually persist what the user enters.
2. **Continue Phase 4 leftovers** — pick off single screens that have real API
   contracts (skip the legacy mock-only pages). Recent: Pincode Eligibility,
   Marketing Campaign Audience. Good next candidates: Enquiry list (5),
   Finance GST status, Customer 360 (partial — most tabs are legacy mockups).
3. **Phase 5 domains** — pick a module per session (e.g. start with one Reports
   page since they share a date-range + table scaffold reusable across the
   whole Reports/MIS surface).

Phase 6 is deliberately last — it assumes the surface area from earlier
phases is in place.
