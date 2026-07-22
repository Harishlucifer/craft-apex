import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@craft-apex/ui";
import {
  buildWorkflow,
  executeWorkflow,
  saveStepData,
  type StepSaveResult,
} from "./workflow-runtime.api";
import type {
  WorkflowBuildResponse,
  WorkflowStageDef,
} from "./workflow-runtime.types";

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

export interface AdvanceOptions {
  /** Workflow step being executed (usually the current step's id). */
  executeStepId: string | number;
  /** Source id to execute against; defaults to the engine's current source. */
  sourceId?: string | number;
  /** Approval-style rejection (onboarding). Skips the save. */
  reject?: boolean;
  /** When present, POST this as the entity/record body (saveStepData) before
   *  executing — the create/update that yields the source id. */
  savePayload?: object;
}

export interface AdvanceResult {
  /** Effective source id used for execution (from the save, or the passed id). */
  sourceId: string | number;
  /** The saved entity envelope when `savePayload` was provided (else undefined). */
  result?: any;
}

/**
 * The shared workflow engine used by BOTH the onboarding view (WorkflowRuntime)
 * and the master view (MasterWorkflowPage). Owns the workflow build + state,
 * the step-navigation machine, and the one `advance()` that ties save →
 * `/workflow/execution` → rebuild → resume-at-`last_active_step_id` together.
 *
 * `/workflow/execution` is what creates the backend `WorkflowInstance` + per-
 * step `Task` rows (the "who is editing / when" activity) and returns the next
 * `last_active_step_id`, so masters get the same server-tracked lifecycle as
 * onboarding once they call `advance()` per step.
 */
export function useWorkflowEngine(params: {
  workflowType: string;
  /** Existing source id (route/props); reloads the build when it changes. */
  sourceId?: string | number;
  /** With no source: "picker" (onboarding starts a new journey) vs "build"
   *  (masters build the config-only workflow so step one renders for create). */
  noSourceBehavior: "picker" | "build";
}) {
  const { workflowType, sourceId, noSourceBehavior } = params;

  const [workflow, setWorkflow] = useState<WorkflowBuildResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const stages: WorkflowStageDef[] = workflow?.stages ?? [];
  const nav = useStepNavigation(stages);
  const stepSave = useStepSave(workflowType);

  // nav.setActive identity is stable (useCallback []), but keep a ref so the
  // load effect below doesn't need nav in its dep array (which would re-run it
  // every render as stages change).
  const setActiveRef = useRef(nav.setActive);
  setActiveRef.current = nav.setActive;

  const handleBuildResult = useCallback((w: WorkflowBuildResponse | null) => {
    if (!w) return;
    setWorkflow(w);
    // Resume at the backend's last-active step (falls back to step one).
    setActiveRef.current(
      w.last_active_stage_id ?? w.stages?.[0]?.id ?? null,
      w.last_active_step_id ?? w.stages?.[0]?.steps?.[0]?.id ?? null,
    );
  }, []);

  // Load on mount / sourceId change.
  useEffect(() => {
    let alive = true;
    if (sourceId != null && sourceId !== "") {
      setLoading(true);
      buildWorkflow({ workflowType, sourceId }).then((w) => {
        if (!alive) return;
        handleBuildResult(w);
        setLoading(false);
      });
    } else if (noSourceBehavior === "picker") {
      setPickerOpen(true);
    } else {
      // master create — build the config-only workflow so its steps render.
      setLoading(true);
      buildWorkflow({ workflowType }).then((w) => {
        if (!alive) return;
        handleBuildResult(w);
        setLoading(false);
      });
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, workflowType, noSourceBehavior]);

  /** save? → execute → rebuild → resume. Returns the effective source id, or
   *  null when the save/execute failed (each path toasts its own error). */
  const advance = useCallback(
    async (opts: AdvanceOptions): Promise<AdvanceResult | null> => {
      let sid = opts.sourceId;
      let saved: StepSaveResult | null = null;
      if (opts.savePayload && !opts.reject) {
        saved = await stepSave.save(opts.savePayload);
        if (!saved) return null;
        if (saved.sourceId != null) sid = saved.sourceId;
      }
      if (sid == null || sid === "") {
        toast.error("No source id — cannot advance workflow.");
        return null;
      }
      setExecuting(true);
      try {
        const next = await executeWorkflow({
          workflowType,
          executeStepId: opts.executeStepId,
          sourceId: sid,
          reject: opts.reject,
        });
        if (next) handleBuildResult(next);
        // `result` is the saved entity envelope (Role needs it back); undefined
        // when this advance only executed (a bespoke step saved on its own).
        return { sourceId: sid, result: saved?.result };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Execution failed");
        return null;
      } finally {
        setExecuting(false);
      }
    },
    [workflowType, stepSave, handleBuildResult],
  );

  /** Start a new journey (onboarding): build with the chosen journey_type. */
  const startJourney = useCallback(
    async (journeyCode: string, journeyLabel?: string) => {
      setPickerOpen(false);
      setLoading(true);
      try {
        const w = await buildWorkflow({
          workflowType,
          data: { journey_type: journeyCode },
        });
        handleBuildResult(w);
        toast.success(`Started ${journeyLabel ?? journeyCode}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to start workflow",
        );
      } finally {
        setLoading(false);
      }
    },
    [workflowType, handleBuildResult],
  );

  return {
    workflow,
    loading,
    executing,
    saving: stepSave.saving,
    busy: executing || stepSave.saving,
    pickerOpen,
    setPickerOpen,
    nav,
    advance,
    startJourney,
  };
}
