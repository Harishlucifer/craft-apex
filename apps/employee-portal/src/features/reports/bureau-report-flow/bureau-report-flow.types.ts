// Bureau Report Flow — legacy
// /Components/Reports/RegulatoryReporting/BureauReporting/BureauReportingFlow.js
//
// This is a workflow-runtime page. Legacy fetches the workflow definition
// via POST /workflow/build with workflow_type=BUREAU_REPORTING and renders
// stages + steps through StepComponentLoader. In craft-apex this is handled
// by the shared OnboardingPage (features/workflow-runtime).
//
// Only the workflow type needs to be defined here; the runtime owns the
// rest (workflow definition, step renderer, navigation).

export const BUREAU_REPORTING_WORKFLOW_TYPE = "BUREAU_REPORTING";
