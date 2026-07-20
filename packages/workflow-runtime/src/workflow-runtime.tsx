import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, XCircle } from "lucide-react";
import { Badge, Button, toast } from "@craft-apex/ui";
import { hasStepSaveEndpoint } from "./workflow-runtime.api";
import { useWorkflowEngine } from "./use-step-flow";
import { JourneyPicker } from "./journey-picker";
import { StepRenderer, type StepRendererHandle } from "./step-renderer";

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
 * Onboarding view over the shared workflow engine (see useWorkflowEngine).
 * Renders the vertical stage list + StepRenderer and owns the central
 * Submit&Next / Reject buttons; the engine owns build + navigation + the
 * save→execute→resume advance that the master view shares.
 */
export function WorkflowRuntime({
  workflowType,
  sourceId,
  partnerType,
  title,
  onClose,
}: Props) {
  const engine = useWorkflowEngine({
    workflowType,
    sourceId,
    noSourceBehavior: "picker",
  });
  const { workflow, nav, pickerOpen, setPickerOpen, busy, loading } = engine;
  const { currentStage, currentStep, stageIndex } = nav;
  const stages = workflow?.stages ?? [];

  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const stepRendererRef = useRef<StepRendererHandle>(null);

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

  // Per-step save before execute (legacy PartnerFlowWithDynamic.moveForward):
  // POST the form data to the workflow's save endpoint BEFORE /workflow/execution
  // for any workflow_type that has one. Rejection skips the save. The engine's
  // advance() does save→execute→resume; we just resolve the payload here.
  const advance = async (reject = false) => {
    if (!workflow || !currentStep) return;
    let savePayload: object | undefined;
    if (!reject && hasStepSaveEndpoint(workflowType)) {
      // For DYNAMIC_FORM (craft-ux) steps, getPayload triggers the form's
      // internal submit/validation; plain controlled steps resolve immediately
      // with the current stepData. `null` means the step blocked submission.
      const payload = await stepRendererRef.current?.getPayload();
      if (payload === null) {
        toast.error("Please complete the required fields before continuing.");
        return;
      }
      savePayload = payload ?? stepData;
    }
    const res = await engine.advance({
      executeStepId: currentStep.id,
      sourceId: workflow.source_id ?? sourceId,
      reject,
      savePayload,
    });
    if (res) toast.success(reject ? "Step rejected" : "Step submitted");
  };

  // Empty state — no workflow loaded yet.
  if (!workflow && !pickerOpen && !loading && !sourceId) {
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
          onPick={(j) => engine.startJourney(j.code, j.name)}
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
              const stageActive = String(stage.id) === String(currentStage?.id);
              const stageDone = si < stageIndex;
              return (
                <li
                  key={String(stage.id)}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      nav.setActive(stage.id, stage.steps[0]?.id ?? null)
                    }
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
                              onClick={() => nav.setActive(stage.id, step.id)}
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
                      onClick={nav.goBack}
                      disabled={nav.isFirst}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={nav.goNext}
                      disabled={nav.isLast}
                    >
                      Skip <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => advance(true)}
                      disabled={busy}
                      className="text-rose-600"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={() => advance(false)}
                      disabled={busy}
                    >
                      <RotateCcw className="h-4 w-4" />{" "}
                      {busy ? "Submitting…" : "Submit & Next"}
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
        onPick={(j) => engine.startJourney(j.code, j.name)}
      />
    </div>
  );
}
