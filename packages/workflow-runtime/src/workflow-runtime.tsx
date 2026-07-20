import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { Badge, Button, Label, toast, cn, Stepper, type StepperStep } from "@craft-apex/ui";
import {
  buildWorkflow,
  executeWorkflow,
  hasStepSaveEndpoint,
  saveStepData,
  useBuildWorkflow,
  useExecuteWorkflow,
  usePartnerDetail,
} from "./workflow-runtime.api";
import { JourneyPicker } from "./journey-picker";
import { StepRenderer, type StepRendererHandle } from "./step-renderer";
import { flattenObject } from "@craft-apex/craft-ux";
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
  const queryClient = useQueryClient();

  const isPartnerOnboarding = workflowType === "PARTNER_ONBOARDING";
  const { data: partnerDetail } = usePartnerDetail(
    isPartnerOnboarding && sourceId ? String(sourceId) : undefined
  );

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

  const sourceName = useMemo(() => {
    const src = workflow?.source as any;
    return (
      src?.application?.name ??
      src?.application?.applicant_name ??
      src?.name ??
      src?.contact_person ??
      undefined
    );
  }, [workflow]);

  const stepIndex = currentStage?.steps.findIndex(
    (s) => String(s.id) === String(currentStep?.id)
  );
  const stageIndex = stages.findIndex(
    (s) => String(s.id) === String(currentStage?.id)
  );

  const stepSteps = useMemo<StepperStep[]>(() => {
    if (!currentStage) return [];
    return currentStage.steps.map((step) => ({
      id: step.id,
      label: step.name,
      description: step.description,
    }));
  }, [currentStage]);

  // Seed step data from the server-collected `step.data` whenever the active
  // step changes, and merge it with prepopulated partner data.
  useEffect(() => {
    let baseData: Record<string, unknown> = {};
    const raw = currentStep?.data;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      baseData = { ...raw as Record<string, unknown> };
    }

    if (isPartnerOnboarding && partnerDetail) {
      try {
        const payloadObj = (partnerDetail as any)?.result ?? (partnerDetail as any)?.data ?? partnerDetail;
        const flatPartner = flattenObject(payloadObj);
        baseData = { ...flatPartner, ...baseData };
      } catch (e) {
        console.error("Error flattening partner details:", e);
      }
    }


    setStepData(baseData);
  }, [currentStep?.id, partnerDetail, isPartnerOnboarding]);

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
        queryClient.invalidateQueries({
          queryKey: ["partner-detail", String(finalSourceId)],
        });
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {workflowType === "PARTNER_ONBOARDING" ? "Partner ID" : "Lead ID"}
            </span>
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-200/50 px-2 py-0.5 rounded">
              {workflow.source_id ? String(workflow.source_id) : "N/A"}
            </span>
            {sourceName && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {sourceName}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Workflow: <span className="font-medium text-slate-700">{title ?? "Onboarding"}</span>
            {workflow.mode && (
              <>
                {" "}· Mode: <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{workflow.mode}</Badge>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose} className="text-slate-600 gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to List
            </Button>
          )}
        </div>
      </div>

      {/* Horizontal Stages Navigation */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <nav className="flex flex-wrap items-center gap-y-3 px-6 py-4 bg-white border-b border-slate-200" aria-label="Stages">
          {stages.map((stage, si) => {
            const stageActive = String(stage.id) === String(currentStage?.id);
            const stageDone = si < stageIndex;
            const isLast = si === stages.length - 1;
            return (
              <div key={String(stage.id)} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setActiveStepId(stage.steps[0]?.id ?? null);
                  }}
                  className="flex items-center gap-2.5 text-left focus:outline-none transition-all group"
                >
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200",
                    stageActive
                      ? "bg-[#1E2A6B] text-white ring-4 ring-[#1E2A6B]/15 scale-105"
                      : stageDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200/80 group-hover:text-slate-600"
                  )}>
                    {si + 1}
                  </span>
                  <span className={cn(
                    "text-sm transition-colors duration-200",
                    stageActive
                      ? "text-slate-900 font-bold"
                      : stageDone
                        ? "text-slate-700 font-semibold"
                        : "text-slate-400 font-medium group-hover:text-slate-600"
                  )}>
                    {stage.name}
                  </span>
                </button>
                {!isLast && (
                  <ChevronRight className="h-4 w-4 text-slate-300 mx-4 shrink-0" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Horizontal Steps Stepper */}
        {currentStage && currentStage.steps.length > 0 && (
          <div className="bg-slate-50/20 border-b border-slate-200 px-6 py-4">
            <Stepper
              steps={stepSteps}
              activeStepId={currentStep?.id ?? ""}
              orientation="horizontal"
              theme="indigo"
              onStepClick={(stepId) => setActiveStepId(stepId)}
            />
          </div>
        )}

        {/* Content body: Single Active Step workspace */}
        {currentStep ? (
          <div className="bg-white">
            <div className="p-6">
              <StepRenderer
                ref={stepRendererRef}
                step={currentStep}
                value={stepData}
                onChange={setStepData}
                onNext={goNextLocal}
                onBack={goPrev}
                context={{
                  workflow,
                  sourceId,
                  onboardingId:
                    (workflow?.source as any)?.application?.onboarding_id ??
                    (workflow?.source as any)?.onboarding_id ??
                    sourceId,
                  workflowType,
                }}
              />
            </div>

            {/* Stepper Buttons inside the card footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPrev}
                  disabled={stageIndex === 0 && stepIndex === 0}
                  className="text-slate-600 hover:text-slate-800 border-slate-200"
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
                  className="text-slate-600 hover:text-slate-800 border-slate-200"
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
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => advance(false)}
                  disabled={execute.isPending}
                  className="bg-[#1E2A6B] text-white hover:bg-[#1E2A6B]/90"
                >
                  <RotateCcw className="h-4 w-4" />{" "}
                  {execute.isPending ? "Submitting…" : "Submit & Next"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          (!currentStage || currentStage.steps.length === 0) && (
            <div className="py-12 text-center text-slate-400 text-sm bg-white">
              No active steps. This stage is empty or completed.
            </div>
          )
        )}
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
