// Side-effect imports: each of these calls registerStepComponent() at
// module scope. Importing this ONE file (from main.tsx, before the app
// renders) guarantees every known ui_component is registered regardless of
// which page mounts first — relying on individual pages to import their
// own step files would only register a page's own steps once that page had
// actually been visited, leaving the registry incomplete for anyone else.
//
// FORM_BUILDER registers itself automatically (see
// @craft-apex/workflow-runtime's index.ts) — it's the one step that's
// generic across every portal. Everything below is Employee-portal-specific:
// bespoke step components that need domain data only this app has.
//
// Adding a new workflow-driven feature: create its `*.steps.tsx` (see
// employee-form.steps.tsx / role-form.steps.tsx / loan-type-form.steps.tsx
// for the pattern) and add one import line here. When Partner/Consumer are
// scaffolded, each gets its own copy of this file for its own bespoke steps.
import "@/features/employee/employee-form/employee-form.steps";
import "@/features/role/role-form/role-form.steps";
import "@/features/loan-type/loan-type-form/loan-type-form.steps";
import "@/features/rm-mapping/rm-mapping.steps";
import "@/features/partner/partner-approval-rejection/partner-approval-rejection.steps";
import "@/features/lender/lender-form/lender-form.steps";
import "@/features/lender-pincode/lender-pincode-form/lender-pincode-form.steps";
