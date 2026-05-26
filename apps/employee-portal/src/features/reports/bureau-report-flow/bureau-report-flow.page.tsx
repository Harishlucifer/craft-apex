// Bureau Report Flow — port of /Components/Reports/RegulatoryReporting/
// BureauReporting/BureauReportingFlow.js.
//
// Legacy mounts a workflow runtime (PostCall WORKFLOW_BUILD with
// workflow_type=BUREAU_REPORTING) and walks the user through stages/steps via
// StepComponentLoader. The craft-apex equivalent is the shared OnboardingPage
// from features/workflow-runtime — we just wire the workflow type and the
// list path the runtime should fall back to on close/completion.

import { OnboardingPage } from "@/features/workflow-runtime";
import { BUREAU_REPORTING_WORKFLOW_TYPE } from "./bureau-report-flow.types";

export default function BureauReportFlowPage() {
  return (
    <OnboardingPage
      title="Bureau Reporting"
      workflowType={BUREAU_REPORTING_WORKFLOW_TYPE}
      listPath="/reports/bureau-reports-list"
    />
  );
}
