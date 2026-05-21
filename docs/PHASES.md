# Migration Phases — Status & Pending Work

Tracker for the `craft-apex` rewrite. The original plan had Phases 1–6; Phase 8
was added later for the workflow runtime deferral from Phase 3. **There is no
Phase 7** (gap left in numbering).

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

## Phase 3 — Other Add/Edit forms for existing list pages 🟡

5 of 7 done. Sub-phases 3.6/3.7 were deferred to **Phase 8** because they all
sit on top of `PartnerFlowWithDynamic` + the dynamic flow engine.

| Sub-phase | Feature | Status |
|---|---|---|
| 3.1 | Payout Plan wizard (+ Incentive Plan variant) | ✅ |
| 3.2 | Marketing Campaign wizard | ✅ |
| 3.3 | Employee (tabbed) | ✅ |
| 3.4 | Lender Scheme wizard | ✅ |
| 3.5 | Territory | ✅ |
| 3.6 | New Channel / Partner / Vendor / APF onboarding | → Phase 8 |
| 3.7 | BC onboarding | → Phase 8 |

---

## Phase 4 — Missing list/queue pages 🟡

77 routes originally placeholder-wired. **62 still on `RoutePlaceholder`** —
the rest are real pages now. Remaining placeholders are either legacy stubs
(no real implementation in `craft-frontend`), legacy mock-data pages (no
backend), or large multi-component flows deferred to Phase 4.3 / Phase 5.

| Sub-phase | Scope | Status |
|---|---|---|
| 4.0 | Shared `RoutePlaceholder` + wire all 77 missing routes | ✅ |
| 4.1 | Verification Queue, Dedupe Q | ✅ |
| 4.2 | Activity tracking, Enquiry, FLDG, Attach Loan, Vehicle | 🟡 — most legacy files are mocks or 1000+ LOC; deferred |
| 4.3 | Finance Payable/Receivable estimate + invoice + Sales perf | ⬜ deferred (Phase 5 report scaffold will help) |

### Phase 4 pages landed (real ports)

- Verification Queue — `/operations/verification/`
- Dedupe Q — `/lead/dedupe-q` (reuses `LeadListPage`)
- **Pincode Eligibility** — `/utility/pincode-eligibility`
- **Marketing Campaign Audience** — `/marketing/campaign/:id` (+ `/collection/campaign/:id` reuses it)
- **Business Card** — `/utility/business-card`
- **Lender Eligible Pincode List** — `/settings/lender/eligible-pincode/list`
- **GST Status (Approved channels)** — `/finance/gst-status`
- **Customer 360** — `/customer360-relationship[/:id]` (API-driven sections only; FD / Credit Cards / Insurance tabs were legacy mocks, skipped)
- **Lead Approval Queue** — `/lead/list/approval-q` (reuses tracking-q types)

### Remaining placeholders (62 routes) — categorized

**Legacy mock-data or stub (no backend) — defer until real API exists:**
- `/attach/fldg[/add[/:id]]`, `/attach/loan-account[/add[/:id]]` — PortfolioList mock
- `/bc/partner/bulk-upload`, `/partner/bulk-upload`, `/lead/bulk-upload`, `/enquiry/bulk-upload` — 11-line stubs
- `/bc/pending`, `/bc/portfolio/view` — PortfolioList mock
- `/lead/lender-view` — 11-line stub
- `/los/login-initiate[/:id]` — 12-line stub
- `/operations/verification/summary` — no backing component
- `/settings/vehicle`, `/settings/vehicle-details` — legacy component missing / commented
- Vehicle masters (`/settings/used-vehicle-makes`, etc.) — mock data in legacy

**Large legacy port (500+ LOC), warrants dedicated session:**
- `/activity/daily-activity`, `/activity/lead-disposition`, `/activity/partner-disposition` — MIS reports
- `/activity/live-tracking` — Google Maps + TerritoryTree + EmployeeList
- `/cdn-file-manager` — CDN file manager
- `/enquiry/customer/list`, `/enquiry/lead/list` — 1474 LOC EnquiryList
- `/enquiry/customer/lead[/:id]` — multi-step intake
- `/lead/create[/:id]` — LeadCreation multi-step wizard
- `/marketing/campaign/summary` — chart-heavy campaign dashboard
- `/meet/join` — 1382 LOC WebRTC video call
- `/operations/verification/:id` — 1189 LOC VerificationFlow
- `/operations/verification/transfer` — 774 LOC
- `/utility/doc-checklist-share` — 598 LOC
- `/utility/lead-reassign` — 446 LOC (selectable rows + employee territory)
- `/vehicle/lead/create[/:id]` — AutoFlow vehicle finance wizard

**Phase 4.3 — finance accounting cluster (deferred together):**
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

## Phase 5 — Untouched domain modules 🟡

Each is one or more list pages plus its own forms. Pick one module per session.
Reports/MIS work is well underway — 6 reports landed using the Phase 6 report
scaffold (User Login, Pendency, Source Productivity, Bank Performance,
Month-Wise Performance, Process Status). Template is in place for the
remaining ~14 Reports + MIS pages — each new report is ~3 files (types + api
+ page) + 1 route wiring.

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

## Phase 6 — Cross-cutting polish 🟡

- ⬜ Permissions / `withModule` parity — currently routes are public; legacy
  uses module-driven privileges (`useModule().allowed_permission.{add,edit,view}`).
- ⬜ Common queue filter strip (PartnerDisposition, ProcessStatus, etc.).
- ⬜ Bulk upload primitive (reused by Lead, Partner, BC, Enquiry, Lender Payout).
- ✅ **Shared report scaffold** — `ReportShell` + `DateRangeFields` +
  `useReportExport` in
  [`src/components/`](../apps/employee-portal/src/components/). Owns:
  header (title + back + Export button), filter card (grid body + Search /
  Reset footer), table-area children. `useReportExport(reportType, fileName)`
  wraps `GET /alpha/v1/report/export/:report_type?…` → triggers anchor
  download (legacy contract). Used by `user-login-report`,
  `mis-pendency-report`, `mis-source-productivity`, `mis-bank-performance`.
- ⬜ Channel/Partner approval queue — multi-status badges + approval drawer.

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
