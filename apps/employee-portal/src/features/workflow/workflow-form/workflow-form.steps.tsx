import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";
import { Button } from "@craft-apex/ui";
import { WorkflowStagesPanel } from "./workflow-stages-panel";
import type { ComponentOption, RuleRow, WorkflowStage } from "./workflow-form.types";

export interface WorkflowStepContext {
  rules: RuleRow[];
  fieldComponents: ComponentOption[];
  stages: WorkflowStage[];
  onStagesChange: (next: WorkflowStage[]) => void;
  isLocked: boolean;
  onSave: () => void;
  saving: boolean;
}

function WorkflowStagesStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<WorkflowStepContext>;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">Stages &amp; Steps</h2>
      <WorkflowStagesPanel
        stages={ctx.stages ?? []}
        onChange={ctx.onStagesChange ?? (() => {})}
        rules={ctx.rules ?? []}
        fieldComponents={ctx.fieldComponents ?? []}
        disabled={ctx.isLocked}
      />
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => ctx.onSave?.()}
          disabled={ctx.saving || ctx.isLocked}
        >
          {ctx.saving ? "Saving…" : "Save Workflow"}
        </Button>
      </div>
    </div>
  );
}

registerStepComponent("WORKFLOW_STAGES", WorkflowStagesStep);
