import React, { useEffect, useRef, useState } from "react";
import { Button } from "@craft-apex/ui/components/button";
import { ChevronLeft, ChevronRight, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@craft-apex/ui/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useWorkflowStore } from "../store/workflowStore";
import WorkflowStepComponentLoader from "./WorkflowStepComponentLoader";
import { JourneyTypeModal } from "./JourneyTypeModal";
import type {
  Stage,
  Step,
  StepComponentRef,
  DynamicStagesAndStepsProps,
} from "../types";

/**
 * DynamicStagesAndSteps — The primary workflow orchestrator component.
 *
 * Framework-agnostic: receives `navigate`, `routeId`, and `searchParams`
 * from the host app so it works in both Next.js and React-Router projects.
 */

interface ExtendedDynamicStagesAndStepsProps extends DynamicStagesAndStepsProps {
  axiosInstance?: any;
}

export const DynamicStagesAndSteps: React.FC<ExtendedDynamicStagesAndStepsProps> = ({
  api,
  className,
  sourceId,
  dataInfo,
  dataInfoV1,
  workflowType,
  navigateUrl,
  navigate,
  routeId: id,
  searchParams: externalSearchParams,
  axiosInstance,
}) => {
  const {
    currentStageIndex: currentStage,
    currentStepIndex: currentStep,
    currentStageData,
    currentStepData,
    completedStages,
    progress,
    goToPreviousStep,
    goToStage,
    setCurrentStageIndex,
    setCurrentStepIndex,
  } = useWorkflowStore();

  // Use provided searchParams or create empty ones
  const searchParams = externalSearchParams ?? new URLSearchParams();

  const journey_type = searchParams.get("journey_type");
  const loan_type = searchParams.get("loan_type");

  const [showJourneyModal, setShowJourneyModal] = useState(
    !id && !journey_type && !loan_type
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────

  const workflowQuery = useQuery({
    queryKey: ["workflow", id, workflowType],
    queryFn: () =>
      api.fetchWorkflow({
        source_id: id,
        workflow_type: workflowType ?? "",
      }),
    enabled: !!id,
    retry: 1,
  });

  const workflowByJourneyQuery = useQuery({
    queryKey: ["workflow-by-journey", journey_type, loan_type],
    queryFn: () =>
      api.fetchWorkflow({
        workflow_type: workflowType ?? "",
        data: {
          journey_type: journey_type ?? "",
          loan_type: loan_type ?? "",
        },
      }),
    enabled: !id && (!!journey_type || !!loan_type),
    retry: 1,
  });

  const journeyTypesQuery = useQuery({
    queryKey: ["journeyTypes", workflowType],
    queryFn: () => api.fetchJourneyTypes(workflowType ?? ""),
    enabled: !id && !(journey_type || loan_type) && !!workflowType,
    retry: 1,
  });

  // ── Journey Selection Helpers ────────────────────────────────────────────

  const handleJourneySelection = (journey: any) => {
    const params = new URLSearchParams();
    params.set("journey_type", journey.code);

    const partnerType = searchParams.get("partner_type");
    if (partnerType) {
      params.set("partner_type", partnerType);
    }

    if (journey.loan_type_id) {
      params.set("loan_type", journey.loan_type.code);
    }

    navigate(`?${params.toString()}`);
  };

  useEffect(() => {
    if (journeyTypesQuery.data && !id) {
      const journeyData =
        (journeyTypesQuery.data as any)?.data || (journeyTypesQuery.data as any);
      const allJourneys = Object.values(journeyData).flat();

      if (allJourneys.length === 1) {
        handleJourneySelection(allJourneys[0]);
      } else {
        setShowJourneyModal(true);
      }
    }
  }, [journeyTypesQuery.data]);

  // ── Derived State ────────────────────────────────────────────────────────

  const workflowData =
    workflowQuery.data || workflowByJourneyQuery.data || null;

  const isLoading =
    workflowQuery.isLoading ||
    workflowByJourneyQuery.isLoading ||
    journeyTypesQuery.isLoading;

  const isError =
    workflowQuery.isError ||
    workflowByJourneyQuery.isError ||
    journeyTypesQuery.isError;

  const error =
    workflowQuery.error ||
    workflowByJourneyQuery.error ||
    journeyTypesQuery.error;

  const formRef = useRef<StepComponentRef>(null);

  // ── Mutations ────────────────────────────────────────────────────────────

  const executeWorkflowMutation = useMutation({
    mutationFn: (variables: { step_id: string; id: string; payload?: any }) =>
      api.executeWorkflow(
        variables.step_id,
        sourceId ?? variables.id,
        workflowType ?? ""
      ),
    onSuccess: () => {
      toast.success("Step executed successfully", {
        position: "top-right",
        duration: 1500,
      });

      const {
        workflow,
        currentStageIndex,
        currentStepIndex,
      } = useWorkflowStore.getState();

      if (workflow?.stages) {
        const isLastStage =
          currentStageIndex === workflow.stages.length - 1;
        const currentSt = workflow.stages[currentStageIndex];
        const isLastStep =
          currentSt &&
          currentStepIndex === currentSt.steps.length - 1;

        if (isLastStage && isLastStep) {
          toast.success("Workflow completed successfully! 🎉", {
            position: "top-center",
            duration: 3000,
          });
          setTimeout(() => {
            if (navigateUrl) navigate(navigateUrl);
          }, 2000);
        }
      }
    },
    onError: () =>
      toast.error("Step execution failed", { position: "top-right" }),
  });

  const createUpdateMutation = useMutation({
    mutationFn: (variables: { data: any; version?: string }) =>
      api.createUpdate(variables.data, variables.version),
    onSuccess: () => toast.success("Saved successfully"),
    onError: (err: any) =>
      toast.error(err.message || "Failed to save"),
  });

  // ── Submit Handler ───────────────────────────────────────────────────────

  const triggerSubmit = () => {
    if (formRef.current) {
      formRef.current.submitStepExternally();
    } else if (currentStepData) {
      executeWorkflowMutation.mutateAsync({
        step_id: currentStepData.id,
        id: id!,
      });
    }
  };

  const handleSubmitSuccess = async (data: any) => {
    if (!currentStepData) return;

    try {
      if (data?.isValidForm && data?.data != null) {
        const version = data?.data?.version || data?.version || "v2";
        const createUpdateResponse = await createUpdateMutation.mutateAsync({
          data: data.data,
          version,
        });

        // Extract the application ID from the response
        // The create API returns it as: application_id at top level,
        // or nested in result.application.application_id
        const applicationId =
          id ||
          createUpdateResponse?.application_id ||
          createUpdateResponse?.result?.application?.application_id ||
          createUpdateResponse?.source_id ||
          sourceId;

        if (!applicationId) {
          throw new Error("No valid ID found for workflow execution");
        }

        // Update the URL to include the application ID if this is a new creation
        if (!id && applicationId) {
          const currentPath = window.location.pathname;
          const newPath = currentPath.replace(
            /\/create$/,
            `/create/${applicationId}`
          );
          navigate(newPath + window.location.search, { replace: true });
        }

        // Execute the workflow step using the application ID
        await executeWorkflowMutation.mutateAsync({
          step_id: currentStepData.id,
          id: String(applicationId),
        });
      } else if (data?.isValidForm && data?.data == null) {
        await executeWorkflowMutation.mutateAsync({
          step_id: currentStepData.id,
          id: id ?? "",
        });
      } else {
        toast.error("Please fill all the required fields");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  // ── Status Helpers ───────────────────────────────────────────────────────

  const getStageStatus = (stage: Stage, stageIndex: number) => {
    if (
      stage.task_status === "2" ||
      stage.steps.every((s) => s.task_status === "2")
    )
      return "completed";
    if (stageIndex === currentStage) return "active";
    return "inactive";
  };

  const getStepStatus = (
    step: Step,
    stageIndex: number,
    stepIndex: number
  ) => {
    if (step.task_status === "2") return "completed";
    if (stageIndex === currentStage && stepIndex === currentStep)
      return "active";
    return "inactive";
  };

  const handleStepClick = (stageIndex: number, stepIndex: number) => {
    const targetStage = workflowData?.stages[stageIndex];
    const targetStep = targetStage?.steps[stepIndex];
    if (!targetStage || !targetStep) return;

    const stepStatus = getStepStatus(targetStep, stageIndex, stepIndex);
    const stageStatus = getStageStatus(targetStage, stageIndex);

    const isAccessible =
      stepStatus === "completed" ||
      stepStatus === "active" ||
      (stageStatus === "active" && stepIndex <= currentStep + 1) ||
      stageIndex < currentStage;

    if (isAccessible) {
      setCurrentStageIndex(stageIndex);
      setCurrentStepIndex(stepIndex);
    }
  };

  const handleStageClick = (stageIndex: number) => {
    const targetStage = workflowData?.stages[stageIndex];
    if (!targetStage) return;

    const stageStatus = getStageStatus(targetStage, stageIndex);
    const isAccessible =
      stageStatus === "completed" ||
      stageStatus === "active" ||
      stageIndex <= currentStage + 1;

    if (isAccessible) {
      goToStage(stageIndex);
    }
  };

  // ── Loading / Error States ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Loading workflow…
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-500">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  // Show journey modal
  if (showJourneyModal && journeyTypesQuery.data) {
    const journeyModalData =
      (journeyTypesQuery.data as any)?.data || (journeyTypesQuery.data as any);
    return (
      <JourneyTypeModal
        open={showJourneyModal}
        workflowType={workflowType}
        onClose={() => setShowJourneyModal(false)}
        data={journeyModalData}
        onSelect={(journey: any) => {
          setShowJourneyModal(false);
          handleJourneySelection(journey);
        }}
      />
    );
  }

  // ── Computed Values ──────────────────────────────────────────────────────

  const isLastStage =
    currentStage === (workflowData?.stages.length ?? 0) - 1;
  const isLastStep =
    currentStep === (currentStageData?.steps.length ?? 0) - 1;
  const isFirstStep = currentStage === 0 && currentStep === 0;
  const isSaving = executeWorkflowMutation.isPending;
  const totalStages = workflowData?.stages?.length ?? 0;
  const totalStepsInStage = currentStageData?.steps?.length ?? 0;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn("w-full", className)}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HORIZONTAL STAGE STEPPER — modern connected pipeline             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          className="flex items-center justify-center gap-0 px-3 py-4 overflow-x-auto"
          style={{ minHeight: "72px" }}
        >
          {workflowData?.stages.map((stage: Stage, stageIndex: number) => {
            const stageStatus = getStageStatus(stage, stageIndex);
            const isActive = stageIndex === currentStage;
            const isAccessible =
              stageStatus === "completed" ||
              stageStatus === "active" ||
              stageIndex <= currentStage + 1;
            const isLast = stageIndex === (workflowData?.stages.length ?? 0) - 1;

            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => handleStageClick(stageIndex)}
                  disabled={!isAccessible}
                  className="flex items-center gap-2.5 group shrink-0"
                  style={{
                    cursor: isAccessible ? "pointer" : "not-allowed",
                    opacity: isAccessible ? 1 : 0.45,
                  }}
                >
                  {/* Stage Circle */}
                  <div
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background:
                        stageStatus === "completed"
                          ? "linear-gradient(135deg, #10b981, #059669)"
                          : isActive
                          ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                          : "#e2e8f0",
                      boxShadow:
                        isActive
                          ? "0 0 0 4px rgba(59,130,246,0.15), 0 2px 8px rgba(59,130,246,0.25)"
                          : stageStatus === "completed"
                          ? "0 0 0 4px rgba(16,185,129,0.12), 0 2px 6px rgba(16,185,129,0.18)"
                          : "0 1px 3px rgba(0,0,0,0.06)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {stageStatus === "completed" ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : (
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: isActive ? "#fff" : "#94a3b8",
                        }}
                      >
                        {stageIndex + 1}
                      </span>
                    )}

                    {/* Pulse ring for active stage */}
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          background: "rgba(59,130,246,0.15)",
                          animationDuration: "2s",
                        }}
                      />
                    )}
                  </div>

                  {/* Stage Label */}
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: isActive ? 700 : stageStatus === "completed" ? 600 : 500,
                      color:
                        isActive
                          ? "#1e40af"
                          : stageStatus === "completed"
                          ? "#047857"
                          : "#64748b",
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.01em",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {stage.name}
                  </span>
                </button>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className="mx-3 shrink-0"
                    style={{
                      width: "48px",
                      height: "2px",
                      borderRadius: "1px",
                      background:
                        stageStatus === "completed"
                          ? "linear-gradient(90deg, #10b981, #34d399)"
                          : "#e2e8f0",
                      transition: "background 0.4s ease",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MAIN LAYOUT — sidebar + content                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex" style={{ minHeight: "calc(100vh - 250px)" }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            "hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out"
          )}
          style={{
            width: sidebarCollapsed ? "0px" : "260px",
            overflow: "hidden",
            borderRight: sidebarCollapsed ? "none" : "1px solid #e2e8f0",
            background: "#ffffff",
          }}
        >
          <div
            className="p-5 space-y-5 sticky top-0 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 200px)", minWidth: "260px" }}
          >

            {/* Progress Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #eff6ff, #f0f4ff)",
                borderRadius: "14px",
                padding: "16px",
                border: "1px solid rgba(59,130,246,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Progress
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: "rgba(59,130,246,0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    borderRadius: "3px",
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 0 8px rgba(59,130,246,0.35)",
                  }}
                />
              </div>
            </div>

            {/* Stages & Steps List */}
            <div className="space-y-1.5">
              {workflowData?.stages.map(
                (stage: Stage, stageIndex: number) => {
                  const stageStatus = getStageStatus(stage, stageIndex);
                  const isStageActive = stageIndex === currentStage;
                  const isStageAccessible =
                    stageStatus === "completed" ||
                    stageStatus === "active" ||
                    stageIndex <= currentStage + 1;

                  return (
                    <div key={stage.id}>
                      {/* Stage Header */}
                      <button
                        onClick={() => handleStageClick(stageIndex)}
                        disabled={!isStageAccessible}
                        className="w-full flex items-center gap-3 text-left transition-all"
                        style={{
                          padding: "10px 12px",
                          borderRadius: "10px",
                          background: isStageActive
                            ? "linear-gradient(135deg, #eff6ff, #e8f0fe)"
                            : "transparent",
                          border: isStageActive ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent",
                          cursor: isStageAccessible ? "pointer" : "not-allowed",
                          opacity: isStageAccessible ? 1 : 0.4,
                        }}
                      >
                        <span
                          className="inline-flex items-center justify-center shrink-0"
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background:
                              stageStatus === "completed"
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : isStageActive
                                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                : "#f1f5f9",
                            color:
                              stageStatus === "completed" || isStageActive
                                ? "#fff"
                                : "#94a3b8",
                            boxShadow:
                              isStageActive
                                ? "0 2px 6px rgba(59,130,246,0.3)"
                                : stageStatus === "completed"
                                ? "0 2px 6px rgba(16,185,129,0.25)"
                                : "none",
                            transition: "all 0.25s ease",
                          }}
                        >
                          {stageStatus === "completed" ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          ) : (
                            stageIndex + 1
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: "12.5px",
                            fontWeight: isStageActive ? 700 : 600,
                            color: isStageActive
                              ? "#1e40af"
                              : stageStatus === "completed"
                              ? "#047857"
                              : "#475569",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {stage.name}
                        </span>
                      </button>

                      {/* Steps — show with modern connected list */}
                      <div
                        className="ml-[26px] pl-4 mt-1 mb-2 space-y-0.5"
                        style={{
                          borderLeft: "2px solid",
                          borderColor: isStageActive
                            ? "rgba(59,130,246,0.2)"
                            : stageStatus === "completed"
                            ? "rgba(16,185,129,0.2)"
                            : "#f1f5f9",
                          transition: "border-color 0.3s ease",
                        }}
                      >
                        {stage.steps.map((step, stepIndex) => {
                          const stepStatus = getStepStatus(
                            step,
                            stageIndex,
                            stepIndex
                          );
                          const isStepAccessible =
                            stepStatus === "completed" ||
                            stepStatus === "active" ||
                            (stageIndex === currentStage &&
                              stepIndex <= currentStep + 1) ||
                            stageIndex < currentStage;
                          const isStepActive = stepStatus === "active";

                          return (
                            <button
                              key={step.id}
                              onClick={() =>
                                handleStepClick(stageIndex, stepIndex)
                              }
                              disabled={!isStepAccessible}
                              className="w-full flex items-center gap-2.5 text-left transition-all"
                              style={{
                                padding: "6px 10px",
                                borderRadius: "8px",
                                background: isStepActive
                                  ? "rgba(59,130,246,0.06)"
                                  : "transparent",
                                cursor: isStepAccessible ? "pointer" : "not-allowed",
                                opacity: isStepAccessible ? 1 : 0.35,
                              }}
                            >
                              {/* Step indicator dot / check */}
                              <span
                                className="shrink-0 inline-flex items-center justify-center"
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  background:
                                    stepStatus === "completed"
                                      ? "#10b981"
                                      : isStepActive
                                      ? "#3b82f6"
                                      : "transparent",
                                  border:
                                    stepStatus === "completed" || isStepActive
                                      ? "none"
                                      : "2px solid #d1d5db",
                                  boxShadow: isStepActive
                                    ? "0 0 0 3px rgba(59,130,246,0.15)"
                                    : "none",
                                  transition: "all 0.25s ease",
                                }}
                              >
                                {stepStatus === "completed" ? (
                                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                ) : isStepActive ? (
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: "#fff",
                                    }}
                                  />
                                ) : null}
                              </span>

                              <span
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: isStepActive ? 600 : 500,
                                  color:
                                    isStepActive
                                      ? "#1e40af"
                                      : stepStatus === "completed"
                                      ? "#059669"
                                      : "#64748b",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                {step.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Collapse sidebar button — visible at bottom of sidebar */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-full flex items-center justify-center gap-2 transition-all"
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Collapse
            </button>
          </div>
        </div>

        {/* Expand sidebar strip — shown when sidebar is collapsed */}
        {sidebarCollapsed && (
          <div
            className="hidden md:flex flex-col items-center shrink-0 transition-all"
            style={{
              width: "40px",
              background: "#f8fafc",
              borderRight: "1px solid #e2e8f0",
              cursor: "pointer",
              position: "relative",
            }}
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            {/* Vertical "STEPS" label */}
            <div
              className="flex flex-col items-center gap-3 pt-5"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 2px 6px rgba(59,130,246,0.3)",
                }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Steps
              </span>
            </div>
          </div>
        )}

        {/* ── CONTENT AREA ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col relative" style={{ background: "#fafbfc" }}>

          {/* ── Form Content ────────────────────────────────────────── */}
          <div className="flex-1 p-4 sm:p-5 pb-20 sm:pb-5 overflow-y-auto">
            <WorkflowStepComponentLoader
              step={currentStepData || ({} as Step)}
              ref={formRef}
              handleSubmitSuccess={handleSubmitSuccess}
              data={dataInfo}
              dataV1={dataInfoV1}
              axiosInstance={axiosInstance}
            />
          </div>

          {/* ── Bottom Action Bar ────────────────────────────────────── */}
          <div
            className="sticky bottom-0 z-10"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid #e2e8f0",
              padding: "12px 20px",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousStep}
                disabled={isFirstStep}
                className="gap-1.5 text-xs rounded-lg"
                style={{
                  height: "36px",
                  borderColor: "#e2e8f0",
                  color: "#475569",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              {/* Step / Stage counter (center) */}
              <div className="hidden sm:flex items-center gap-2">
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#94a3b8",
                  }}
                >
                  Step {currentStep + 1}/{totalStepsInStage}
                </span>
                <span style={{ color: "#e2e8f0" }}>|</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#94a3b8",
                  }}
                >
                  Stage {currentStage + 1}/{totalStages}
                </span>
              </div>

              <Button
                size="sm"
                onClick={triggerSubmit}
                disabled={isSaving}
                className="gap-1.5 text-xs text-white border-0"
                style={{
                  height: "36px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  background: isSaving
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: isSaving
                    ? "none"
                    : "0 2px 10px rgba(59,130,246,0.35), 0 1px 3px rgba(99,102,241,0.2)",
                  transition: "all 0.25s ease",
                  paddingLeft: "18px",
                  paddingRight: "18px",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving…
                  </>
                ) : isLastStage && isLastStep ? (
                  <>
                    Complete
                    <Check className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Save & Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
