// Side-effect imports: each of these calls registerStepComponent() at
// module scope. Importing this ONE file (from main.tsx, before the app
// renders) guarantees every known ui_component is registered regardless of
// which page mounts first — relying on individual pages to import their
// own step files would only register a page's own steps once that page had
// actually been visited, leaving the registry incomplete for anyone else.
//
// Adding a new workflow-driven feature: create its `*.steps.tsx` (see
// employee-form.steps.tsx / role-form.steps.tsx / loan-type-form.steps.tsx
// for the pattern) and add one import line here.
import "./steps/form-builder-step";
import "@/features/employee/employee-form/employee-form.steps";
import "@/features/role/role-form/role-form.steps";
import "@/features/loan-type/loan-type-form/loan-type-form.steps";
