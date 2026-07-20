import { useCallback, useMemo, useState } from "react";
import { toast } from "@craft-apex/ui";
import { saveStepData, type StepSaveResult } from "./workflow-runtime.api";
import type { WorkflowStageDef } from "./workflow-runtime.types";

/**
 * Shared step-navigation state machine over a workflow's stages. This is the
 * one "next / back / go to step" implementation used by BOTH engines:
 * WorkflowRuntime (the vertical stage list of partner/BC/vendor onboarding)
 * and MasterWorkflowPage (the flat horizontal stepper of the settings
 * masters). goNext/goBack cross stage boundaries, so the flat view a stepper
 * needs (`flatSteps` + `flatIndex` + `goToFlatIndex`) falls out of the same
 * nested traversal for free.
 *
 * The hook never auto-selects: `currentStage`/`currentStep` fall back to the
 * first stage/step when nothing is active yet, so a fresh workflow shows step
 * one without an init effect, while callers that resume a server-side flow
 * (WorkflowRuntime) call `setActive` with the backend's last-active ids.
 */
export function useStepNavigation(stages: WorkflowStageDef[]) {
  const [activeStageId, setActiveStageId] = useState<string | number | null>(
    null,
  );
  const [activeStepId, setActiveStepId] = useState<string | number | null>(
    null,
  );

  const currentStage = useMemo(
    () =>
      stages.find((s) => String(s.id) === String(activeStageId)) ?? stages[0],
    [stages, activeStageId],
  );
  const currentStep = useMemo(
    () =>
      currentStage?.steps.find((s) => String(s.id) === String(activeStepId)) ??
      currentStage?.steps?.[0],
    [currentStage, activeStepId],
  );

  const stageIndex = stages.findIndex(
    (s) => String(s.id) === String(currentStage?.id),
  );
  const stepIndex =
    currentStage?.steps.findIndex(
      (s) => String(s.id) === String(currentStep?.id),
    ) ?? -1;

  const flatSteps = useMemo(() => stages.flatMap((s) => s.steps), [stages]);
  const flatIndex = flatSteps.findIndex(
    (s) => String(s.id) === String(currentStep?.id),
  );

  const setActive = useCallback(
    (stageId: string | number | null, stepId: string | number | null) => {
      setActiveStageId(stageId);
      setActiveStepId(stepId);
    },
    [],
  );

  const goBack = useCallback(() => {
    if (!currentStage || stepIndex < 0) return;
    if (stepIndex > 0) {
      setActiveStepId(currentStage.steps[stepIndex - 1]!.id);
      return;
    }
    if (stageIndex > 0) {
      const prev = stages[stageIndex - 1]!;
      setActive(prev.id, prev.steps[prev.steps.length - 1]?.id ?? null);
    }
  }, [currentStage, stepIndex, stageIndex, stages, setActive]);

  const goNext = useCallback(() => {
    if (!currentStage || stepIndex < 0) return;
    if (stepIndex < currentStage.steps.length - 1) {
      setActiveStepId(currentStage.steps[stepIndex + 1]!.id);
      return;
    }
    if (stageIndex < stages.length - 1) {
      const next = stages[stageIndex + 1]!;
      setActive(next.id, next.steps[0]?.id ?? null);
    }
  }, [currentStage, stepIndex, stageIndex, stages, setActive]);

  /** Jump to a step by its position in the flattened step list (the master
   *  stepper's model), resolving which stage owns it. */
  const goToFlatIndex = useCallback(
    (i: number) => {
      const target = flatSteps[i];
      if (!target) return;
      const owner = stages.find((s) =>
        s.steps.some((st) => String(st.id) === String(target.id)),
      );
      if (owner) setActive(owner.id, target.id);
    },
    [flatSteps, stages, setActive],
  );

  const isFirst = stageIndex <= 0 && stepIndex <= 0;
  const isLast =
    stageIndex === stages.length - 1 &&
    stepIndex === (currentStage?.steps.length ?? 0) - 1;

  return {
    activeStageId,
    activeStepId,
    setActiveStageId,
    setActiveStepId,
    setActive,
    currentStage,
    currentStep,
    stageIndex,
    stepIndex,
    flatSteps,
    flatIndex,
    goBack,
    goNext,
    goToFlatIndex,
    isFirst,
    isLast,
  };
}

/**
 * Shared per-step save. The one place both engines POST a step's payload to
 * the workflow's save endpoint (STEP_SAVE_ENDPOINTS via saveStepData): it
 * bakes in the workflow type, toasts on failure, and returns `null` when the
 * save failed so callers branch on the result instead of writing their own
 * try/catch. WorkflowRuntime calls this before /workflow/execution; the
 * settings masters expose it to their controllers via MasterControllerArgs.
 */
export function useStepSave(workflowType: string) {
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (data: object): Promise<StepSaveResult | null> => {
      setSaving(true);
      try {
        return await saveStepData({ workflowType, data });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [workflowType],
  );

  return { save, saving };
}
