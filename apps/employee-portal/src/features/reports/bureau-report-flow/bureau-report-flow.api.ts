// Bureau Report Flow — no dedicated API.
//
// Legacy BureauReportingFlow.js calls:
//   - POST /workflow/build  (workflow_type = "BUREAU_REPORTING")
//   - GET  /lms/loan/{id}/details  (when :id is in the route)
//
// Both are handled inside the shared workflow runtime
// (`@/features/workflow-runtime`). The runtime fetches the workflow definition
// and step data automatically, so this feature folder doesn't need its own
// API hooks. This file is intentionally minimal — kept for the
// `.types.ts / .api.ts / .page.tsx` folder contract.
export {};
