# @craft-apex/workflow-runtime

Generic engine for backend-configured multi-step workflows (`/settings/workflow`
→ `workflow_type` + stages/steps), shared across every portal app (Employee,
Partner, Consumer). Consumed as source (no build step) — same pattern as
`packages/ui`/`api`/`auth`/`craft-ux`.

## What lives here

- `buildWorkflow`/`executeWorkflow`/`saveStepData` (`workflow-runtime.api.ts`) —
  `/alpha/v1/workflow/build|execution` + per-workflow-type save endpoints.
- `WorkflowRuntime`/`StepRenderer`/`OnboardingPage`/`JourneyPicker` — the
  full guided-stepper UI (used by `WorkflowType.LeadCreation` etc via
  `<OnboardingPage/>`).
- `FormBuilderRenderer` — this app's own flat-form renderer for the
  `FORM_BUILDER` `ui_component` (Tailwind-styled, no repeatable rows/arrays).
- `step-component-registry.tsx` (`registerStepComponent`/`getStepComponent`/
  `UiComponentLoader`) — the global step-dispatch registry used by pages like
  `employee-form.page.tsx`/`role-form.page.tsx`/`loan-type-form.page.tsx`.
- `steps/form-builder-step.tsx` — the one step component that's genuinely
  identical across every portal, registered here so it's defined once.

## What does NOT live here (stays in each app)

Each portal's *bespoke* step components (`AccessRights`, `SubLoanTypesPanel`,
Employee's address/territory/allocation steps, …) need domain data only that
app's page has — they can't be meaningfully shared. Each app keeps its own
`*.steps.tsx` registration files and its own `register-all-steps.ts`
(imported once from `main.tsx`, before the app renders) that call
`registerStepComponent()` for its own bespoke steps. See
`apps/employee-portal/src/register-all-steps.ts` for the pattern to copy
when Partner/Consumer are scaffolded.

## The `@/lib/api` decoupling

This package never imports an app's `@/lib/api` directly (Partner/Consumer
each have their own axios instance with different baseURL/tenant config).
It calls `getApiClient()` from `@craft-apex/api` instead — every app already
registers its instance via `setApiClient(api)` in its own `lib/api.ts`, so
this resolves to whichever app is actually running. `getApiClient()` is only
ever called inside function bodies / component render (never at module top
level), since it throws if called before `setApiClient()` has run.
