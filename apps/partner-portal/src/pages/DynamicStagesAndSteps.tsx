import React, {useRef } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Stage, Step } from "@/stores/workflow";
import WorkflowStepComponentLoader from "@/pages/WorkflowStepComponentLoader.tsx";
import { useWorkflow} from "../hooks/workflow";

interface DynamicStagesAndStepsProps {
  onComplete?: (data: any) => any;
  className?: string;
  dataInfo?: any;
  workflowType?: string;
}

export interface StepComponentRef {
  submitStepExternally: () => Promise<any>;
}



// --- Component --- //
export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
                                                                              onComplete,
                                                                              className,
                                                                              dataInfo,
                                                                              workflowType
                                                                            }) => {
  const { id } = useParams<{ id: string }>();

  // Hook for local workflow navigation state
  const {
    currentStageIndex: currentStage,
    currentStepIndex: currentStep,
    currentStageData,
    currentStepData,
    completedStages,
    progress,
    goToPreviousStep,
    goToStage,
      fetchWorkflow,
      executeWorkflow,
  } = useWorkflow(id);

  // Fetch workflow
  const {
    data: workflowData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workflow", id,workflowType],
    queryFn: () => fetchWorkflow(id!,workflowType),
    enabled: !!id,
    retry: 1,
  });

  // ref for step submission
  const formRef = useRef<StepComponentRef>(null);

  const triggerSubmit = () => {
    console.log(formRef.current)
    if (formRef.current) {
      formRef.current.submitStepExternally();
    }else {
      if(currentStepData){
      executeWorkflowMutation.mutateAsync({
        stepData: currentStepData,
        id: id!,
      });
      }
    }
  };


  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: (variables: { stepData: Step; id: string; payload?: any }) =>
        executeWorkflow(variables.stepData, variables.id, workflowType ?? ""),
    onSuccess: () =>
        toast.success("Step executed successfully", {
          position: "top-right",
          duration: 1500,
        }),
    onError: () =>
        toast.error("Step execution failed", {
          position: "top-right",
        }),
  });

// Success handler for child form
  const handleSubmitSuccess = async (data: any) => {
    if (onComplete && data?.data != null && data?.isValidForm) {
      const processComplete = await onComplete(data);
      if (processComplete && currentStepData) {
        await executeWorkflowMutation.mutateAsync({
          stepData: currentStepData,
          id: id!,
        });
      }
    } else if (currentStepData && ((data?.isValidForm && data?.data == null) || data?.optional)) {
      await executeWorkflowMutation.mutateAsync({
        stepData: currentStepData,
        id: id!,
      });
    } else {
      toast.error("Please fill all the required fields");
    }
  };



  // Helpers
  const getStageStatus = (stage: Stage, stageIndex: number) => {
    if (stage.task_status === "2" || stage.steps.every((s) => s.task_status === "2")) {
      return "completed";
    }
    if (stageIndex === currentStage) {
      return "active";
    }
    return "inactive";
  };

  const getStepStatus = (step: Step, stageIndex: number, stepIndex: number) => {
    if (step.task_status === "2") return "completed";
    if (stageIndex === currentStage && stepIndex === currentStep) return "active";
    return "inactive";
  };

  if (isLoading) return <p>Loading workflow...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
      <div className={cn("w-full max-w-screen-2xl mx-auto", className)}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Progress Overview
            </h3>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stages + Steps */}
            <div className="space-y-6">
              {workflowData?.stages.map((stage: Stage, stageIndex: number) => {
                const stageStatus = getStageStatus(stage, stageIndex);

                return (
                    <div key={stage.id} className="space-y-3">
                      {/* Stage Row */}
                      <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-300",
                                stageStatus === "completed" &&
                                "bg-emerald-600 text-white border-emerald-600",
                                stageStatus === "active" &&
                                "bg-blue-600 text-white border-blue-600",
                                stageStatus === "inactive" &&
                                "bg-gray-100 text-gray-500 border-gray-300"
                            )}
                        >
                          {stageStatus === "completed" ? (
                              <Check className="w-4 h-4" />
                          ) : (
                              stageIndex + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <h4
                              className={cn(
                                  "font-medium text-sm transition-colors",
                                  stageStatus === "active" && "text-blue-600",
                                  stageStatus === "completed" && "text-emerald-600",
                                  stageStatus === "inactive" && "text-gray-500"
                              )}
                          >
                            {stage.name}
                          </h4>
                          {stage.description && (
                              <p className="text-xs text-muted-foreground">
                                {stage.description}
                              </p>
                          )}
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="ml-11 space-y-2">
                        {stage.steps.map((step, stepIndex) => {
                          const stepStatus = getStepStatus(
                              step,
                              stageIndex,
                              stepIndex
                          );

                          return (
                              <div key={step.id} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-3 h-3 rounded-full border transition-colors",
                                        stepStatus === "completed" &&
                                        "bg-emerald-600 border-emerald-600",
                                        stepStatus === "active" &&
                                        "bg-blue-600 border-blue-600",
                                        stepStatus === "inactive" &&
                                        "bg-gray-200 border-gray-300"
                                    )}
                                />
                                <span
                                    className={cn(
                                        "text-xs transition-colors",
                                        stepStatus === "active" &&
                                        "text-blue-600 font-medium",
                                        stepStatus === "completed" &&
                                        "text-emerald-600",
                                        stepStatus === "inactive" &&
                                        "text-gray-500"
                                    )}
                                >
                            {step.name}
                          </span>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                );
              })}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1">
            <Tabs
                value={currentStage.toString()}
                onValueChange={(value) => goToStage(parseInt(value))}
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-3">
                {workflowData?.stages.map((stage: Stage, index: number) => (
                    <TabsTrigger
                        key={stage.id}
                        value={index.toString()}
                        className={cn(
                            "relative",
                            getStageStatus(stage, index) === "completed" &&
                            "data-[state=inactive]:bg-step-completed/20 data-[state=inactive]:text-step-completed",
                            getStageStatus(stage, index) === "active" &&
                            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        )}
                        disabled={index > currentStage && !completedStages.has(index)}
                        onClick={() => goToStage(index)}
                    >
                      {getStageStatus(stage, index) === "completed" && (
                          <Check className="w-3 h-3 mr-1" />
                      )}
                      <span className="hidden sm:inline">{stage.name}</span>
                      <span className="sm:hidden">{stage.name.slice(0, 8)}</span>
                    </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={currentStage.toString()}>
                <Card className="bg-gradient-secondary border-border/50 shadow-card pt-2">
                  <div className="p-2 md:p-3">
                    <WorkflowStepComponentLoader
                        step={currentStepData || ({} as Step)}
                        ref={formRef}
                        handleSubmitSuccess={handleSubmitSuccess}
                        data={dataInfo}
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-3 gap-4">
              <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStage === 0 && currentStep === 0}
                  className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of{" "}
                {currentStageData?.steps ? currentStageData.steps.length : 0}
              </span>
                <span>•</span>
                <span>
                Stage {currentStage + 1} of {workflowData?.stages.length}
              </span>
              </div>

              <Button
                  onClick={triggerSubmit}
                  className="flex items-center gap-2 text-black bg-gradient-primary hover:shadow-glow hover:text-white border"
                  disabled={executeWorkflowMutation.isPending}
              >
                {currentStage === (workflowData?.stages.length ?? 0) - 1 &&
                currentStep === (currentStageData?.steps.length ?? 0) - 1 ? (
                    <>
                      Complete <Check className="w-4 h-4" />
                    </>
                ) : (
                    <>
                      {executeWorkflowMutation.isPending ? "Saving..." : "Save & Next"}{" "}
                      <ChevronRight className="w-4 h-4" />
                    </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};
