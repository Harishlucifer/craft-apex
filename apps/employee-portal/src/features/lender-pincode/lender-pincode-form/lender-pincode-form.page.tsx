import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@craft-apex/ui";
import {
  buildWorkflow,
  UiComponentLoader,
  WorkflowType,
  type WorkflowStepDef,
} from "@craft-apex/workflow-runtime";

export default function LenderPincodeFormPage() {
  const navigate = useNavigate();

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["lender-pincode-workflow"],
    queryFn: () =>
      buildWorkflow({ workflowType: WorkflowType.LenderPincodeUpload }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[0];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Lender Pincode Add
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/lender/pin-code/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading form…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for lender pincode upload yet. Configure a
          workflow with workflow_type &quot;
          {WorkflowType.LenderPincodeUpload}&quot; at{" "}
          <Link to="/settings/workflow" className="underline">
            Settings → Workflow
          </Link>
          .
        </div>
      ) : (
        <UiComponentLoader
          step={activeStepDef}
          value={{}}
          onChange={() => {}}
          onNext={() => navigate("/settings/lender/pin-code/list")}
          onBack={() => {}}
          context={{}}
        />
      )}
    </div>
  );
}
