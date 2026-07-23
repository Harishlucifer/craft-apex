import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button } from "@craft-apex/ui";
import { StageModal } from "./stage-modal";
import { StepModal } from "./step-modal";
import {
  STEP_TYPES,
  type ComponentOption,
  type RuleRow,
  type WorkflowStage,
  type WorkflowStep,
} from "./workflow-form.types";

interface Props {
  stages: WorkflowStage[];
  onChange: (next: WorkflowStage[]) => void;
  rules: RuleRow[];
  fieldComponents: ComponentOption[];
  disabled?: boolean;
}

/**
 * Stages & Steps editor extracted verbatim from the pre-workflow-conversion
 * workflow-form.page.tsx — same StageModal/StepModal-driven CRUD, now a
 * self-contained rows/onChange panel (like sub-loan-types-panel.tsx) so it
 * can be the bespoke WORKFLOW_STAGES step's body.
 */
export function WorkflowStagesPanel({
  stages,
  onChange,
  rules,
  fieldComponents,
  disabled,
}: Props) {
  const [activeStageId, setActiveStageId] = useState<string | number | null>(
    stages[0]?.id ?? null,
  );
  const [stageEditing, setStageEditing] = useState<
    { initial?: WorkflowStage } | null
  >(null);
  const [stepEditing, setStepEditing] = useState<
    { stageId: string | number; initial?: WorkflowStep } | null
  >(null);

  // `stages` can arrive after mount (edit-mode detail query resolving) — pick
  // the first stage once it does, matching the pre-conversion page's effect.
  useEffect(() => {
    if (activeStageId == null && stages.length > 0) {
      setActiveStageId(stages[0]!.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages]);

  const upsertStage = (stage: WorkflowStage) => {
    const existingIdx = stages.findIndex(
      (s) => String(s.id) === String(stage.id),
    );
    if (existingIdx >= 0) {
      onChange(stages.map((s, i) => (i === existingIdx ? stage : s)));
    } else {
      onChange([...stages, { ...stage, sequence: stages.length + 1 }]);
    }
    setActiveStageId(stage.id ?? null);
  };

  const removeStage = (stageId: string | number) => {
    if (!window.confirm("Remove this stage?")) return;
    onChange(stages.filter((s) => String(s.id) !== String(stageId)));
    if (String(activeStageId) === String(stageId)) {
      const remaining = stages.filter((s) => String(s.id) !== String(stageId));
      setActiveStageId(remaining[0]?.id ?? null);
    }
  };

  const moveStage = (stageId: string | number, dir: -1 | 1) => {
    const idx = stages.findIndex((s) => String(s.id) === String(stageId));
    if (idx < 0) return;
    const target = idx + dir;
    if (target < 0 || target >= stages.length) return;
    const next = [...stages];
    const a = next[idx]!;
    const b = next[target]!;
    next[idx] = b;
    next[target] = a;
    onChange(next);
  };

  const upsertStep = (step: WorkflowStep) => {
    onChange(
      stages.map((s) => {
        if (String(s.id) !== String(step.stage_id)) return s;
        const existingIdx = s.steps.findIndex(
          (st) => String(st.id) === String(step.id),
        );
        if (existingIdx >= 0) {
          return {
            ...s,
            steps: s.steps.map((st, i) => (i === existingIdx ? step : st)),
          };
        }
        return { ...s, steps: [...s.steps, step] };
      }),
    );
  };

  const removeStep = (stageId: string | number, stepId: string | number) => {
    if (!window.confirm("Remove this step?")) return;
    onChange(
      stages.map((s) =>
        String(s.id) !== String(stageId)
          ? s
          : { ...s, steps: s.steps.filter((st) => String(st.id) !== String(stepId)) },
      ),
    );
  };

  const moveStep = (
    stageId: string | number,
    stepId: string | number,
    dir: -1 | 1,
  ) => {
    onChange(
      stages.map((s) => {
        if (String(s.id) !== String(stageId)) return s;
        const idx = s.steps.findIndex((st) => String(st.id) === String(stepId));
        if (idx < 0) return s;
        const target = idx + dir;
        if (target < 0 || target >= s.steps.length) return s;
        const next = [...s.steps];
        const a = next[idx]!;
        const b = next[target]!;
        next[idx] = b;
        next[target] = a;
        return { ...s, steps: next };
      }),
    );
  };

  const activeStage = stages.find(
    (s) => String(s.id) === String(activeStageId),
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {stages.length} stage{stages.length === 1 ? "" : "s"}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => setStageEditing({})}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Add Stage
        </Button>
      </div>

      {stages.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
          No stages yet — add at least one stage to start configuring steps.
        </p>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-2 md:col-span-4">
            {stages.map((s, i) => {
              const active = String(s.id) === String(activeStageId);
              return (
                <div
                  key={String(s.id)}
                  className={
                    active
                      ? "flex items-center justify-between gap-2 rounded-xl border-2 border-[#4C7DF0] bg-[#4C7DF0]/10 p-3"
                      : "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setActiveStageId(s.id ?? null)}
                    className="flex flex-1 items-start text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.steps.length} step{s.steps.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveStage(s.id!, -1)}
                      disabled={i === 0 || disabled}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStage(s.id!, 1)}
                      disabled={i === stages.length - 1 || disabled}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setStageEditing({ initial: s })}
                      disabled={disabled}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Edit stage"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStage(s.id!)}
                      disabled={disabled}
                      className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                      aria-label="Delete stage"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-span-12 md:col-span-8">
            {activeStage ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Steps — {activeStage.name}
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    onClick={() => setStepEditing({ stageId: activeStage.id! })}
                  >
                    <Plus className="h-4 w-4" /> Add Step
                  </Button>
                </div>
                {activeStage.steps.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-4 text-center text-xs text-slate-400">
                    No steps yet.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-md border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Display</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStage.steps.map((step, i) => (
                          <tr key={String(step.id)} className="border-t border-slate-100">
                            <td className="px-3 py-2 font-medium">{step.name}</td>
                            <td className="px-3 py-2">
                              {STEP_TYPES.find((t) => t.value === step.step_type)
                                ?.label ?? step.step_type}
                            </td>
                            <td className="px-3 py-2">{step.display_mode}</td>
                            <td className="px-3 py-2">
                              <Badge
                                variant={step.status === 1 ? "success" : "destructive"}
                              >
                                {step.status === 1 ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveStep(activeStage.id!, step.id!, -1)}
                                  disabled={i === 0 || disabled}
                                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                  aria-label="Move up"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveStep(activeStage.id!, step.id!, 1)}
                                  disabled={
                                    i === activeStage.steps.length - 1 || disabled
                                  }
                                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                  aria-label="Move down"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStepEditing({
                                      stageId: activeStage.id!,
                                      initial: step,
                                    })
                                  }
                                  disabled={disabled}
                                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                  aria-label="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeStep(activeStage.id!, step.id!)}
                                  disabled={disabled}
                                  className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
                Select a stage to view its steps.
              </p>
            )}
          </div>
        </div>
      )}

      <StageModal
        open={stageEditing !== null}
        initial={stageEditing?.initial}
        rules={rules}
        onCancel={() => setStageEditing(null)}
        onSubmit={(stage) => {
          upsertStage(stage);
          setStageEditing(null);
        }}
      />

      <StepModal
        open={stepEditing !== null}
        initial={stepEditing?.initial}
        stageId={stepEditing?.stageId ?? ""}
        rules={rules}
        fieldComponents={fieldComponents}
        onCancel={() => setStepEditing(null)}
        onSubmit={(step) => {
          upsertStep(step);
          setStepEditing(null);
        }}
      />
    </div>
  );
}
