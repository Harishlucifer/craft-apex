import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, XCircle } from "lucide-react";
import { Badge, Button, Label, toast } from "@craft-apex/ui";
import {
  buildWorkflow,
  executeWorkflow,
  hasStepSaveEndpoint,
  saveStepData,
  useBuildWorkflow,
  useExecuteWorkflow,
} from "./workflow-runtime.api";
import { JourneyPicker } from "./journey-picker";
import { StepRenderer, type StepRendererHandle } from "./step-renderer";
import type {
  JourneyType,
  WorkflowBuildResponse,
  WorkflowStageDef,
  WorkflowStepDef,
} from "./workflow-runtime.types";

interface Props {
  workflowType: string;
  /** Existing source id (partner_id / campaign_id / etc.). */
  sourceId?: string;
  /** Optional partner-type pre-filter for journey picker. */
  partnerType?: string;
  /** Title shown above the stepper. */
  title?: string;
  /** Optional back link. */
  onClose?: () => void;
}

/**
 * Generic workflow runtime. Loads a workflow definition + state from the
 * backend, renders a vertical stepper, and drives the executeStep cycle.
 */
export function WorkflowRuntime({
  workflowType,
  sourceId,
  partnerType,
  title,
  onClose,
}: Props) {
  const build = useBuildWorkflow();
  const execute = useExecuteWorkflow();

  const [workflow, setWorkflow] = useState<WorkflowBuildResponse | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | number | null>(
    null
  );
  const [activeStepId, setActiveStepId] = useState<string | number | null>(
    null
  );
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const stepRendererRef = useRef<StepRendererHandle>(null);

  // Load on mount / sourceId change.
  useEffect(() => {
    let alive = true;
    if (sourceId) {
      // Existing source — load directly.
      buildWorkflow({ workflowType, sourceId }).then((w) => {
        if (alive) handleBuildResult(w);
      });
    } else {
      // No source — show journey picker so the user can start a new flow.
      setPickerOpen(true);
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, workflowType]);

  const handleBuildResult = (w: WorkflowBuildResponse | null) => {
    if (!w) return;
    setWorkflow(w);
    setActiveStageId(w.last_active_stage_id ?? w.stages?.[0]?.id ?? null);
    setActiveStepId(
      w.last_active_step_id ?? w.stages?.[0]?.steps?.[0]?.id ?? null
    );
  };

  const stages: WorkflowStageDef[] = workflow?.stages ?? [];
  const currentStage = useMemo<WorkflowStageDef | undefined>(
    () =>
      stages.find((s) => String(s.id) === String(activeStageId)) ?? stages[0],
    [stages, activeStageId]
  );
  const currentStep = useMemo<WorkflowStepDef | undefined>(
    () =>
      currentStage?.steps.find(
        (s) => String(s.id) === String(activeStepId)
      ) ?? currentStage?.steps?.[0],
    [currentStage, activeStepId]
  );

  const stepIndex = currentStage?.steps.findIndex(
    (s) => String(s.id) === String(currentStep?.id)
  );
  const stageIndex = stages.findIndex(
    (s) => String(s.id) === String(currentStage?.id)
  );

  // Seed step data from the server-collected `step.data` whenever the active
  // step changes. Mirrors legacy <DynamicForm existingObject={…}/> behavior.
  useEffect(() => {
    const raw = currentStep?.data;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      setStepData(raw as Record<string, unknown>);
    } else {
      setStepData({});
    }
  }, [currentStep?.id]);

  const goPrev = () => {
    if (!currentStage || stepIndex == null) return;
    if (stepIndex > 0) {
      setActiveStepId(currentStage.steps[stepIndex - 1]!.id);
      return;
    }
    if (stageIndex > 0) {
      const prevStage = stages[stageIndex - 1]!;
      setActiveStageId(prevStage.id);
      setActiveStepId(prevStage.steps[prevStage.steps.length - 1]?.id ?? null);
    }
  };

  const goNextLocal = () => {
    if (!currentStage || stepIndex == null) return;
    if (stepIndex < currentStage.steps.length - 1) {
      setActiveStepId(currentStage.steps[stepIndex + 1]!.id);
      return;
    }
    if (stageIndex < stages.length - 1) {
      const nextStage = stages[stageIndex + 1]!;
      setActiveStageId(nextStage.id);
      setActiveStepId(nextStage.steps[0]?.id ?? null);
    }
  };

  // Phase 8.5 — per-step save before execute. Legacy
  // PartnerFlowWithDynamic.moveForward POSTs the form data to the workflow's
  // save endpoint (partner/create, collection, …) BEFORE calling
  // workflow/execution. We mirror that here for any workflow_type that has a
  // verified save endpoint; rejection skips the save (no point persisting a
  // payload that's about to be rejected).
  const advance = async (reject = false) => {
    if (!workflow || !currentStep) return;
    let finalSourceId = workflow.source_id ?? sourceId;

    if (!reject && hasStepSaveEndpoint(workflowType)) {
      // For DYNAMIC_FORM (craft-ux) steps, this triggers the form's internal
      // submit/validation and resolves the nested payload it builds; other
      // step renderers are plain controlled components and resolve
      // immediately with the current `stepData`. `null` means the step
      // blocked submission (e.g. required-field validation failed).
      const payload = await stepRendererRef.current?.getPayload();
      if (payload === null) {
        toast.error("Please complete the required fields before continuing.");
        return;
      }
      try {
        const saved = await saveStepData({
          workflowType,
          data: payload ?? stepData,
        });
        if (saved.sourceId != null) {
          finalSourceId = saved.sourceId;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
        return;
      }
    }

    if (!finalSourceId) {
      toast.error("No source ID — cannot advance workflow.");
      return;
    }
    try {
      const next = await executeWorkflow({
        workflowType,
        executeStepId: currentStep.id,
        sourceId: finalSourceId,
        reject,
      });
      if (next) {
        handleBuildResult(next);
        toast.success(reject ? "Step rejected" : "Step submitted");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Execution failed");
    }
  };

  const startNewJourney = async (journey: JourneyType) => {
    setPickerOpen(false);
    try {
      const w = await build.mutateAsync({
        workflowType,
        data: { journey_type: journey.code },
      });
      handleBuildResult(w);
      toast.success(`Started ${journey.name ?? journey.code}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start workflow");
    }
  };

  // Empty state — no workflow loaded yet.
  if (!workflow && !pickerOpen && !build.isPending && !sourceId) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
        Pick a journey to start the workflow.
        <div className="mt-3">
          <Button type="button" onClick={() => setPickerOpen(true)}>
            Choose journey
          </Button>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading workflow…
        <JourneyPicker
          open={pickerOpen}
          workflowType={workflowType}
          partnerType={partnerType}
          onCancel={() => setPickerOpen(false)}
          onPick={startNewJourney}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            {title ?? "Workflow"}
          </h2>
          <p className="text-xs text-slate-400">
            type: <span className="font-mono">{workflowType}</span>
            {workflow.source_id && (
              <>
                {" "}
                · source:{" "}
                <span className="font-mono">{String(workflow.source_id)}</span>
              </>
            )}
            {workflow.mode && (
              <>
                {" "}
                · mode: <Badge variant="secondary">{workflow.mode}</Badge>
              </>
            )}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <aside className="col-span-12 md:col-span-4">
          <ol className="space-y-3">
            {stages.map((stage, si) => {
              const stageActive =
                String(stage.id) === String(currentStage?.id);
              const stageDone = si < stageIndex;
              return (
                <li
                  key={String(stage.id)}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStageId(stage.id);
                      setActiveStepId(stage.steps[0]?.id ?? null);
                    }}
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span
                      className={
                        stageDone
                          ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
                          : stageActive
                            ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
                            : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
                      }
                    >
                      {stageDone ? <Check className="h-4 w-4" /> : si + 1}
                    </span>
                    <span
                      className={
                        stageActive || stageDone
                          ? "font-semibold text-slate-900"
                          : "text-slate-600"
                      }
                    >
                      {stage.name}
                    </span>
                  </button>
                  {stageActive && (
                    <ul className="mt-3 space-y-1 border-l-2 border-slate-100 pl-3">
                      {stage.steps.map((step) => {
                        const active =
                          String(step.id) === String(currentStep?.id);
                        return (
                          <li key={String(step.id)}>
                            <button
                              type="button"
                              onClick={() => setActiveStepId(step.id)}
                              className={
                                active
                                  ? "flex w-full items-center gap-2 rounded-md bg-[#4C7DF0]/10 px-2 py-1 text-left text-xs font-medium text-[#4C7DF0]"
                                  : "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-slate-600 hover:bg-slate-50"
                              }
                            >
                              <span className="font-mono text-[10px] text-slate-400">
                                {step.step_type}
                              </span>
                              {step.name}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </aside>

        <main className="col-span-12 space-y-4 md:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {!currentStep ? (
              <p className="text-sm text-slate-500">
                No active step. Workflow is complete or has no steps yet.
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {currentStep.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Stage:{" "}
                      <span className="font-medium text-slate-600">
                        {currentStage?.name}
                      </span>
                    </p>
                  </div>
                </div>

                <StepRenderer
                  ref={stepRendererRef}
                  step={currentStep}
                  value={stepData}
                  onChange={setStepData}
                />

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goPrev}
                      disabled={stageIndex === 0 && stepIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goNextLocal}
                      disabled={
                        stageIndex === stages.length - 1 &&
                        stepIndex === (currentStage?.steps.length ?? 0) - 1
                      }
                    >
                      Skip <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => advance(true)}
                      disabled={execute.isPending}
                      className="text-rose-600"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={() => advance(false)}
                      disabled={execute.isPending}
                    >
                      <RotateCcw className="h-4 w-4" />{" "}
                      {execute.isPending ? "Submitting…" : "Submit & Next"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <JourneyPicker
        open={pickerOpen}
        workflowType={workflowType}
        partnerType={partnerType}
        onCancel={() => setPickerOpen(false)}
        onPick={startNewJourney}
      />
    </div>
  );
}
