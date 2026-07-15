import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import {
  buildWorkflow,
  UiComponentLoader,
  executeWorkflow,
  saveStepData,
  hasStepSaveEndpoint,
  type FormBuilderStepContext,
} from "@craft-apex/workflow-runtime";
import { useApplicationDetail } from "../application-detail/application-detail.api";
import type { ConsumerLenderApplyStepContext } from "./consumer-lender-apply.steps";

export default function ConsumerLenderApply() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["lender-apply-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({ workflowType: "LENDER_APPLY", sourceId: id }),
  });

  const { data: applicationDetail, isLoading: appLoading } = useApplicationDetail(id);

  const { allSteps, stagesWithGlobalSteps } = useMemo(() => {
    const stages = workflow?.stages ?? [];
    let globalCounter = 0;
    const stagesWithGlobalSteps = stages.map((stage) => {
      const stepObjects = stage.steps.map((st) => {
        const gIndex = globalCounter++;
        return { label: st.name, globalIndex: gIndex, id: st.id, originalDef: st };
      });
      return { ...stage, stepObjects };
    });

    const allSteps = stages.flatMap((s) => s.steps);
    return { allSteps, stagesWithGlobalSteps };
  }, [workflow]);

  const activeStepDef = allSteps[activeStep];
  const activeStageIndex = Math.max(
    0,
    stagesWithGlobalSteps.findIndex((s) =>
      s.stepObjects.some((st) => st.globalIndex === activeStep)
    )
  );
  const activeStage = stagesWithGlobalSteps[activeStageIndex];

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (applicationDetail) {
      setFormValues((prev) => ({
        ...prev,
        ...applicationDetail,
      }));
    }
  }, [applicationDetail]);

  const onSubmit = async () => {
    if (!activeStepDef || !id) return;
    setSubmitting(true);
    try {
      if (hasStepSaveEndpoint("LENDER_APPLY")) {
        await saveStepData({
          workflowType: "LENDER_APPLY",
          data: formValues,
        });
      }

      await executeWorkflow({
        workflowType: "LENDER_APPLY",
        executeStepId: activeStepDef.id,
        sourceId: id,
      });

      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save step");
    } finally {
      setSubmitting(false);
    }
  };

  const stepContext: FormBuilderStepContext & ConsumerLenderApplyStepContext = {
    onSubmit,
    submitting,
    submitLabel: "Save & Next",
    cancelHref: "/applications",
    applicationId: id ?? "",
    applicationDetail,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Lender Application
        </h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading steps…
        </div>
      ) : allSteps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for LENDER_APPLY yet.
        </div>
      ) : (
        <>
          {/* STAGES TAB BAR */}
          {stagesWithGlobalSteps.length > 0 && (
            <div className="flex w-full overflow-hidden rounded border border-slate-200 shadow-sm">
              {stagesWithGlobalSteps.map((stage, i) => {
                const isStageActive = i === activeStageIndex;
                return (
                  <div
                    key={String(stage.id)}
                    className={`flex-1 flex items-center justify-center py-3 px-2 text-[13px] font-semibold transition-colors ${isStageActive
                      ? "bg-[#1E2A6B] text-white"
                      : "bg-slate-50 text-slate-500 border-r border-slate-200 last:border-r-0"
                      }`}
                  >
                    {stage.name}
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE STAGE'S STEPS */}
          {activeStage && activeStage.stepObjects.length > 0 && (
            <Stepper
              steps={activeStage.stepObjects}
              activeGlobalStep={activeStep}
              onStepClick={(i) => {
                // Usually forward clicks are blocked until current step is saved,
                // so we only allow clicking backwards or to the currently active step.
                if (i <= activeStep) setActiveStep(i);
              }}
            />
          )}

          <UiComponentLoader
            step={activeStepDef}
            value={formValues}
            onChange={setFormValues}
            onNext={() => setActiveStep(activeStep + 1)}
            onBack={() => setActiveStep(activeStep - 1)}
            context={stepContext}
          />
        </>
      )}
    </div>
  );
}

function Stepper({
  steps,
  activeGlobalStep,
  onStepClick,
}: {
  steps: { label: string; globalIndex: number }[];
  activeGlobalStep: number;
  onStepClick: (globalIndex: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {steps.map((stepObj, i) => {
        const isDone = stepObj.globalIndex < activeGlobalStep;
        const isActive = stepObj.globalIndex === activeGlobalStep;
        return (
          <div key={stepObj.label} className="flex items-center gap-3">
            <li className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onStepClick(stepObj.globalIndex)}
                className={
                  isDone
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
                    : isActive
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
                      : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
                }
              >
                {isDone ? <Check className="h-4 w-4" /> : stepObj.globalIndex + 1}
              </button>
              <span
                className={
                  isActive || isDone
                    ? "font-semibold text-slate-900"
                    : "text-slate-500"
                }
              >
                {stepObj.label}
              </span>
            </li>
            {i < steps.length - 1 && (
              <span className="h-px w-8 bg-slate-200" />
            )}
          </div>
        );
      })}
    </ol>
  );
}
