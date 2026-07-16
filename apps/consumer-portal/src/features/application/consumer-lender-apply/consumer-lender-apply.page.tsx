import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button, toast } from "@craft-apex/ui";
import {
  buildWorkflow,
  UiComponentLoader,
  executeWorkflow,
  saveStepData,
  hasStepSaveEndpoint,
  WorkflowType,
  type FormBuilderStepContext,
  type WorkflowStepDef,
} from "@craft-apex/workflow-runtime";
import { useApplicationDetail } from "../application-detail/application-detail.api";
import type { ConsumerLenderApplyStepContext } from "./consumer-lender-apply.steps";
import { flattenObject, setNestedValue } from "@craft-apex/craft-ux";

export default function ConsumerLenderApply() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["lender-apply-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({ workflowType: WorkflowType.LenderApply, sourceId: id }),
  });

  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[activeStep];

  const { data: applicationDetail, isLoading: appLoading } = useApplicationDetail(id);
  const initialValuesRef = useRef<string>("{}");
  const initialStepSetRef = useRef(false);


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
      const flattened = flattenObject(
        (applicationDetail as unknown) as Record<string, unknown>
      );
      setFormValues((prev) => {
        const next = { ...prev, ...flattened };
        initialValuesRef.current = JSON.stringify(next);
        return next;
      });
    }
  }, [applicationDetail]);

  useEffect(() => {
    if (workflow && allSteps.length > 0 && !initialStepSetRef.current) {
      initialStepSetRef.current = true;
      // @ts-ignore
      if (workflow.last_active_step_id) {
        // @ts-ignore
        const lastStepIndex = allSteps.findIndex(s => String(s.id) === String(workflow.last_active_step_id));
        if (lastStepIndex >= 0) {
           // Move directly to the last active step
           setActiveStep(lastStepIndex);
        }
      }
    }
  }, [workflow, allSteps]);

  const onSubmit = async () => {
    if (!activeStepDef || !id) return;
    setSubmitting(true);
    try {
      const isModified = JSON.stringify(formValues) !== initialValuesRef.current;

      if (isModified && hasStepSaveEndpoint(WorkflowType.LeadCreation)) {
        const nestedPayload: Record<string, any> = {};
        for (const [key, value] of Object.entries(formValues)) {
          setNestedValue(nestedPayload, key, value);
        }

        // Preserve unedited arrays and fields from the original fetch
        const finalPayload = {
          ...applicationDetail,
          ...nestedPayload,
        };

        await saveStepData({
          workflowType: WorkflowType.LeadCreation,
          data: finalPayload,
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
    onSubmit: onSubmit,
    submitting: submitting,
    submitLabel: id ? "Save & Next" : "Create & Next",
    cancelHref: "/applications",
    applicationId: id ?? "",
    applicationDetail,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 lg:p-1">
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col md:flex-row justify-between gap-8 items-center">
        {/* Left Side: Title & Description */}
        <div className="w-full md:w-1/3 space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Application Details
          </h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed pr-4">
            View the key details and progress of your loan application in one place.
          </p>
          <div className="pt-2">
            <Button variant="outline" className="rounded-full px-6 transition-all hover:bg-slate-50 hover:shadow-sm text-blue-600 border-blue-200 hover:border-blue-300" size="sm" onClick={() => navigate(-1)}>
              <i className="ri-arrow-left-line mr-1.5 text-lg"></i> Back
            </Button>
          </div>
        </div>

        {/* Right Side: Data Items */}
        <div className="w-full md:w-2/3 flex flex-wrap md:flex-nowrap justify-between gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">

          {/* Name */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[70px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 mb-3 shadow-sm">
              <i className="ri-user-3-line text-2xl"></i>
            </div>
            <span className="text-sm font-extrabold text-blue-900 text-center truncate w-full px-1" title={applicationDetail?.application?.applicant_name || "Applicant"}>
              {applicationDetail?.application?.applicant_name || "Applicant"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Name
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[70px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 mb-3 shadow-sm">
              <i className="ri-phone-line text-2xl"></i>
            </div>
            <span className="text-sm font-extrabold text-emerald-700 text-center truncate w-full px-1" title={applicationDetail?.application?.mobile || "N/A"}>
              {applicationDetail?.application?.mobile || "N/A"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Contact
            </span>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[70px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-3 shadow-sm">
              <i className="ri-mail-line text-2xl"></i>
            </div>
            <span className="text-sm font-extrabold text-amber-700 text-center truncate w-full px-1" title={applicationDetail?.application?.email || "N/A"}>
              {applicationDetail?.application?.email || "N/A"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Email
            </span>
          </div>

          {/* Loan Amount */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[70px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-3 shadow-sm">
              <i className="ri-money-rupee-circle-line text-2xl"></i>
            </div>
            <span className="text-sm font-extrabold text-rose-700 text-center truncate w-full px-1">
              ₹{applicationDetail?.application?.loan_amount || "0"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Amount
            </span>
          </div>

          {/* Loan Type */}
          <div className="flex flex-col items-center justify-center flex-1 min-w-[70px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-3 shadow-sm">
              <i className="ri-bank-card-line text-2xl"></i>
            </div>
            <span className="text-sm font-extrabold text-indigo-700 text-center truncate w-full px-1" title={applicationDetail?.application?.loan_type_name || "Loan"}>
              {applicationDetail?.application?.loan_type_name || "Loan"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Type
            </span>
          </div>

        </div>
      </div>

      {workflowLoading ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
            <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">Preparing your application...</p>
        </div>
      ) : allSteps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for LENDER_APPLY yet.
        </div>
      ) : (
        <>
          {/* STAGES TAB BAR */}
          {stagesWithGlobalSteps.length > 0 && (
            <div className="flex w-full gap-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner">
              {stagesWithGlobalSteps.map((stage, i) => {
                const isStageActive = i === activeStageIndex;
                return (
                  <div
                    key={String(stage.id)}
                    className={`flex-1 flex items-center justify-center py-3 px-2 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 rounded-xl cursor-default ${isStageActive
                      ? "bg-primary text-white shadow-md transform scale-[1.01]"
                      : "bg-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
                      }`}
                  >
                    {stage.name}
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE STAGE'S STEPS (VERTICAL ACCORDION) */}
          {activeStage && activeStage.stepObjects.length > 0 && (
            <div className="flex flex-col bg-white p-6 pt-8 rounded-2xl shadow-sm border border-slate-100">
              {activeStage.stepObjects.map((stepObj, index) => {
                const isDone = stepObj.globalIndex < activeStep;
                const isActive = stepObj.globalIndex === activeStep;
                const isLast = index === activeStage.stepObjects.length - 1;

                return (
                  <div key={stepObj.label} className="relative flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (stepObj.globalIndex <= activeStep) setActiveStep(stepObj.globalIndex);
                        }}
                        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold transition-all shadow-sm text-[13px] ${isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-600/20"
                            : "bg-slate-100 border border-slate-200 text-slate-400"
                          }`}
                      >
                        {isDone ? <i className="ri-check-line text-base"></i> : stepObj.globalIndex + 1}
                      </button>
                      <span
                        className={`text-[13px] tracking-wide ${isActive || isDone
                          ? "font-semibold text-slate-800"
                          : "font-medium text-slate-500"
                          }`}
                      >
                        {stepObj.label}
                      </span>
                    </div>

                    {/* Connecting Line & Content */}
                    <div className="flex">
                      {/* Left Column (Line) */}
                      <div className="w-8 flex justify-center shrink-0">
                        {!isLast && (
                          <div className={`w-[1.5px] bg-slate-200 ${isActive ? 'h-full mt-2 mb-4' : 'h-8 mt-1 mb-1'}`} />
                        )}
                      </div>

                      {/* Right Column (Content) */}
                      <div className={`flex-1 pl-6 ${isActive ? 'pb-8 pt-4' : 'pb-0'}`}>
                        {isActive && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <UiComponentLoader
                              step={activeStepDef}
                              value={formValues}
                              onChange={setFormValues}
                              onNext={() => setActiveStep(activeStep + 1)}
                              onBack={() => setActiveStep(activeStep - 1)}
                              context={stepContext}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

