import React, {useEffect, useRef, useState} from "react";
import {Button} from "@repo/ui/components/ui/button";
import {Card} from "@repo/ui/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@repo/ui/components/ui/tabs";
import {ChevronLeft, ChevronRight, Check} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useQuery, useMutation} from "@tanstack/react-query";
import {toast} from "sonner";

import {Stage, Step, useWorkflowStore} from "@/stores/workflow.ts";
import WorkflowStepComponentLoader from "@/pages/WorkflowStepComponentLoader.tsx";
import {WorkflowAPI} from "@/api/WorkflowAPI.ts";
import {JourneyTypeModal} from "@/pages/workflow/JourneyTypeModal";

interface DynamicStagesAndStepsProps {
    api: WorkflowAPI; // API instance to handle create/update
    className?: string;
    dataInfo?: any;
    sourceId?: string;
    workflowType?: string;
    navigateUrl?: string;
}

export interface StepComponentRef {
    submitStepExternally: () => Promise<any>;
}

export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
                                                                                api,
                                                                                className,
                                                                                sourceId,
                                                                                dataInfo,
                                                                                workflowType,
                                                                                navigateUrl
                                                                            }) => {
    const {id} = useParams<{ id: string }>();

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

    const [searchParams] = useSearchParams();

    const journey_type = searchParams.get("journey_type");
    const loan_type = searchParams.get("loan_type");

    const [showJourneyModal, setShowJourneyModal] = useState(false);
    const navigate = useNavigate();

    console.log('dataInfo', dataInfo)

    // 1. Fetch workflow if `id` exists
    const workflowQuery = useQuery({
        queryKey: ["workflow", id, workflowType],
        queryFn: () => api.fetchWorkflow({source_id: id, workflow_type: workflowType ?? ""}),
        enabled: !!id,
        retry: 1,
    });
    console.log("dataInfo", dataInfo)
    // 2. Fetch workflow if `journey_type` & `loan_type` exist
    const workflowByJourneyQuery = useQuery({
        queryKey: ["workflow-by-journey", journey_type, loan_type],
        queryFn: () =>
            api.fetchWorkflow({
                workflow_type: workflowType ?? "",
                data: {"journey_type": journey_type ?? "", "loan_type": loan_type ?? ""}
            }),
        enabled: !id && (!!journey_type || !!loan_type),

        retry: 1,
    });

    // 3. Fetch journey types if nothing provided
    const journeyTypesQuery = useQuery({
        queryKey: ["journeyTypes", workflowType],
        queryFn: () => api.fetchJourneyTypes(workflowType ?? ""),
        enabled: !id && !(journey_type || loan_type) && !!workflowType,
        retry: 1,
    });

    // Helper function to handle journey selection
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
            // Check if there's only one journey type across all categories
            const journeyData = journeyTypesQuery.data.data || journeyTypesQuery.data;
            const allJourneys = Object.values(journeyData).flat();
            console.log("all journey", journeyTypesQuery.data);
            console.log("allJourneys length", allJourneys.length);
            
            if (allJourneys.length === 1) {
                // Automatically select the single journey type
                console.log("Auto-selecting single journey:", allJourneys[0]);
                handleJourneySelection(allJourneys[0]);
            } else {
                // Show modal for multiple options
                console.log("Multiple journeys found, showing modal");
                setShowJourneyModal(true);
            }
        }
    }, [journeyTypesQuery.data]);


    // -------------------------
    // Then you just need to decide which query to use
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

    const executeWorkflowMutation = useMutation({
        mutationFn: (variables: { step_id: string; id: string; payload?: any }) =>
            api.executeWorkflow(variables.step_id, sourceId ?? variables.id, workflowType ?? ""),
        onSuccess: () => {
            toast.success("Step executed successfully✅", {position: "top-right", duration: 1000});
            
            // Check if we're at the last step of the last stage for completion handling
            const { workflow, currentStageIndex, currentStepIndex } = useWorkflowStore.getState();
            
            if (workflow?.stages) {
                 const isLastStage = currentStageIndex === workflow.stages.length - 1;
                 const currentStage = workflow.stages[currentStageIndex];
                 const isLastStep = currentStage && currentStepIndex === currentStage.steps.length - 1;
                 
                 if (isLastStage && isLastStep) {
                    // Show success modal and redirect
                    toast.success("Workflow completed successfully! 🎉", {
                        position: "top-center",
                        duration: 3000,
                        style: {
                            background: "#10b981",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold"
                        }
                    });
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        if (navigateUrl) {
                            navigate(navigateUrl);
                        }
                    }, 2000);
                }
                // Note: Step progression is now handled in the API layer
            }
        },
        onError: () => toast.error("Step execution failed", {position: "top-right"}),
    });

    const triggerSubmit = () => {
        if (formRef.current) {
            formRef.current.submitStepExternally();
        } else if (currentStepData) {
            executeWorkflowMutation.mutateAsync({step_id: currentStepData.id, id: id!});
        }
    };

    const createUpdateMutation = useMutation({
        mutationFn: (payload: any) => api.createUpdate(payload),
        onSuccess: () => {
            toast.success("Step data saved successfully ✅");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to save step data ❌");
        },
    });

    // ✅ Use API class for submission instead of onComplete
    const handleSubmitSuccess = async (data: any) => {
        if (currentStepData) {
            try {
                if (data?.isValidForm && data?.data != null) {
                    // Call createUpdate from API class
                    const createUpdateResponse = await createUpdateMutation.mutateAsync(data.data);
                    
                    // Get source_id from createUpdate response if id is not present in URL
                    const workflowId = id || createUpdateResponse?.source_id || sourceId;
                    
                    if (!workflowId) {
                        throw new Error("No valid ID found for workflow execution");
                    }
                    
                    // Update URL with ID if not present and we got source_id from create operation
                    if (!id && createUpdateResponse?.source_id) {
                        const currentPath = window.location.pathname;
                        const newPath = currentPath.replace(/\/create$/, `/create/${createUpdateResponse.source_id}`);
                        navigate(newPath + window.location.search, { replace: true });
                    }
                    
                    // Execute workflow step after saving
                    await executeWorkflowMutation.mutateAsync({step_id: currentStepData.id, id: workflowId});
                }else if(data?.isValidForm && data?.data == null){
                    await executeWorkflowMutation.mutateAsync({step_id: currentStepData.id, id: id ?? ""});
                } else {
                    toast.error("Please fill all the required fields");
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to save step data ❌");
            }
        }
    };

    const getStageStatus = (stage: Stage, stageIndex: number) => {
        if (stage.task_status === "2" || stage.steps.every((s) => s.task_status === "2")) return "completed";
        if (stageIndex === currentStage) return "active";
        return "inactive";
    };

    const getStepStatus = (step: Step, stageIndex: number, stepIndex: number) => {
        if (step.task_status === "2") return "completed";
        if (stageIndex === currentStage && stepIndex === currentStep) return "active";
        return "inactive";
    };

    // Mobile step navigation handler
    const handleStepClick = (stageIndex: number, stepIndex: number) => {
        const targetStage = workflowData?.stages[stageIndex];
        const targetStep = targetStage?.steps[stepIndex];
        
        if (!targetStage || !targetStep) return;
        
        // Check if step is accessible (completed, active, or next available step)
        const stepStatus = getStepStatus(targetStep, stageIndex, stepIndex);
        const stageStatus = getStageStatus(targetStage, stageIndex);
        
        // Allow navigation to completed steps, active step, or next available step
        const isAccessible = stepStatus === "completed" || 
                           stepStatus === "active" || 
                           (stageStatus === "active" && stepIndex <= currentStep + 1) ||
                           (stageIndex < currentStage);
        
        if (isAccessible) {
            setCurrentStageIndex(stageIndex);
            setCurrentStepIndex(stepIndex);
        }
    };

    // Mobile stage navigation handler
    const handleStageClick = (stageIndex: number) => {
        const targetStage = workflowData?.stages[stageIndex];
        if (!targetStage) return;
        
        const stageStatus = getStageStatus(targetStage, stageIndex);
        
        // Allow navigation to completed stages, active stage, or next available stage
        const isAccessible = stageStatus === "completed" || 
                           stageStatus === "active" || 
                           stageIndex <= currentStage + 1;
        
        if (isAccessible) {
            goToStage(stageIndex);
        }
    };

    if (isLoading) return <p>Loading workflow...</p>;
    if (isError) return <p>Error: {(error as Error).message}</p>;

    // show modal if no workflowData and journey types available
    if (showJourneyModal && journeyTypesQuery.data) {
        return (
            <JourneyTypeModal
                open={showJourneyModal}
                workflowType={workflowType}
                onClose={() => setShowJourneyModal(false)}
                data={journeyTypesQuery.data?.data}
                onSelect={(journey: any) => {
                    setShowJourneyModal(false);
                    handleJourneySelection(journey);
                }}
            />

        );
    }

    return (
        <div className={cn("w-full max-w-screen-2xl mx-auto px-2 sm:px-4", className)}>
    
            {/* Mobile Stages Tabs */}
            <div className="lg:hidden mb-4">
                <div className="relative">
  <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
    {workflowData?.stages.map((stage: Stage, stageIndex: number) => {
      const stageStatus = getStageStatus(stage, stageIndex);
      const isActive = stageIndex === currentStage;
      const isAccessible =
        stageStatus === "completed" ||
        stageStatus === "active" ||
        stageIndex <= currentStage + 1;

      return (
        <button
          key={stage.id}
          onClick={() => handleStageClick(stageIndex)}
          disabled={!isAccessible}
          className={cn(
            "flex-none px-4 py-3 text-sm font-medium transition-all duration-200 relative", // flex-none prevents shrinking
            isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700",
            stageStatus === "completed" && !isActive && "text-green-600",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            {stageStatus === "completed" && !isActive && (
              <Check className="w-4 h-4" />
            )}
            <span className="truncate">{stage.name}</span>
          </div>
          {isActive && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
          )}
        </button>
      );
    })}
  </div>
</div>

                {/* Mobile Steps Navigation */}
                {currentStageData && (
                    <div className="mt-4">    
                        {/* Steps Progress Bar */}
                       <div className="relative mb-4">
  {/* Steps container - make scrollable */}
  <div className="flex items-center justify-start gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
    {currentStageData?.steps?.map((step: Step, stepIndex: number) => {
      const stepStatus = getStepStatus(step, currentStage, stepIndex);
      const isActive = stepIndex === currentStep;
      const isAccessible =
        stepStatus === "completed" ||
        stepStatus === "active" ||
        stepIndex <= currentStep + 1;

      return (
        <div key={step.id} className="flex flex-col items-center flex-none w-20">
          <button
            onClick={() => handleStepClick(currentStage, stepIndex)}
            disabled={!isAccessible}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 mb-2",
              stepStatus === "completed" && "bg-green-500 text-white",
              stepStatus === "active" && "bg-blue-500 text-white",
              stepStatus === "inactive" && "bg-gray-300 text-gray-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {stepStatus === "completed" ? (
              <Check className="w-4 h-4" />
            ) : (
              stepIndex + 1
            )}
          </button>

          {/* Step Name */}
          <span
            className={cn(
              "text-xs text-center leading-tight max-w-18",
              stepStatus === "active" && "text-blue-600 font-medium",
              stepStatus === "completed" && "text-green-600",
              stepStatus === "inactive" && "text-gray-500"
            )}
          >
            {step.name}
          </span>
        </div>
      );
    })}
  </div>

  {/* Progress Line */}
  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 -z-10">
    <div
      className="h-full bg-blue-500 transition-all duration-300"
      style={{
        width: `${
          (currentStep / Math.max(currentStageData?.steps?.length - 1, 1)) * 100
        }%`,
      }}
    />
  </div>
</div>

                         <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">{currentStageData.name}</h4>
                            <span className="text-xs text-gray-500">
                                Step {currentStep + 1} of {currentStageData?.steps?.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="hidden lg:block w-full lg:w-80 bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Progress Overview</h3>
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Overall Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                 style={{width: `${progress}%`}}/>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {workflowData?.stages.map((stage: Stage, stageIndex: number) => {
                            const stageStatus = getStageStatus(stage, stageIndex);
                            return (
                                <div key={stage.id} className="space-y-3">
                                    <button
                                        onClick={() => handleStageClick(stageIndex)}
                                        disabled={!(stageStatus === "completed" || stageStatus === "active" || stageIndex <= currentStage + 1)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-300",
                                            stageStatus === "completed" && "bg-emerald-600 text-white border-emerald-600",
                                            stageStatus === "active" && "bg-blue-500 text-white border-blue-500",
                                            stageStatus === "inactive" && "bg-gray-100 text-gray-500 border-gray-300"
                                        )}>
                                            {stageStatus === "completed" ?
                                                <Check className="w-4 h-4"/> : stageIndex + 1}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className={cn(
                                                "font-medium text-sm transition-colors",
                                                stageStatus === "active" && "text-blue-500",
                                                stageStatus === "completed" && "text-emerald-600",
                                                stageStatus === "inactive" && "text-gray-500"
                                            )}>
                                                {stage.name}
                                            </h4>
                                            {stage.description &&
                                                <p className="text-xs text-muted-foreground">{stage.description}</p>}
                                        </div>
                                    </button>
                                    <div className="ml-11 space-y-2">
                                        {stage.steps.map((step, stepIndex) => {
                                            const stepStatus = getStepStatus(step, stageIndex, stepIndex);
                                            const isAccessible = stepStatus === "completed" || 
                                                               stepStatus === "active" || 
                                                               (stageIndex === currentStage && stepIndex <= currentStep + 1) ||
                                                               (stageIndex < currentStage);
                                            return (
                                                <button
                                                    key={step.id}
                                                    onClick={() => handleStepClick(stageIndex, stepIndex)}
                                                    disabled={!isAccessible}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 p-1 rounded transition-all duration-300"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-3 h-3 rounded-full border transition-colors",
                                                        stepStatus === "completed" && "bg-emerald-600 border-emerald-600",
                                                        stepStatus === "active" && "bg-blue-500 border-blue-500",
                                                        stepStatus === "inactive" && "bg-gray-200 border-gray-300"
                                                    )}/>
                                                    <span className={cn(
                                                        "text-xs transition-colors text-left",
                                                        stepStatus === "active" && "text-blue-500 font-medium",
                                                        stepStatus === "completed" && "text-emerald-600",
                                                        stepStatus === "inactive" && "text-gray-500"
                                                    )}>{step.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <Tabs value={currentStage.toString()} onValueChange={(value) => goToStage(parseInt(value))}>
                        {/* Desktop Tabs - Hidden on mobile */}
                        <TabsList className="hidden lg:grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-3">
                            {workflowData?.stages.map((stage: Stage, index: number) => (
                                <TabsTrigger
                                    key={stage.id}
                                    value={index.toString()}
                                    className={cn(
                                        "relative",
                                        getStageStatus(stage, index) === "completed" && "data-[state=inactive]:bg-step-completed/20 data-[state=inactive]:text-step-completed",
                                        getStageStatus(stage, index) === "active" && "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    )}
                                    disabled={index > currentStage && !completedStages.has(index)}
                                    onClick={() => goToStage(index)}
                                >
                                    {getStageStatus(stage, index) === "completed" && <Check className="w-3 h-3 mr-1"/>}
                                    <span className="hidden sm:inline">{stage.name}</span>
                                    <span className="sm:hidden">{stage.name.slice(0, 8)}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={currentStage.toString()}>
                            <Card className="bg-gradient-secondary border-border/50 shadow-card pt-2">
                                <div className="p-3 sm:p-4 md:p-6">
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

                    {/* Navigation Buttons */}
                    {/* Mobile: Fixed bottom navigation */}
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
                      <div className="flex justify-between items-center gap-4">
                        {/* Back Button */}
                        <Button
                          variant="outline"
                          onClick={goToPreviousStep}
                          disabled={currentStage === 0 && currentStep === 0}
                          className="flex items-center justify-center gap-2 flex-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Back
                        </Button>

                        {/* Save & Next Button */}
                        <Button
                          onClick={triggerSubmit}
                          className="flex items-center justify-center gap-2 flex-1 text-black bg-gradient-primary hover:shadow-glow hover:text-white border"
                          disabled={executeWorkflowMutation.isPending}
                        >
                          {currentStage === (workflowData?.stages.length ?? 0) - 1 &&
                          currentStep === (currentStageData?.steps.length ?? 0) - 1 ? (
                            <>
                              Complete <Check className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              {executeWorkflowMutation.isPending ? "Saving..." : "Save & Next"} 
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Desktop: Original layout */}
                    <div className="hidden sm:flex flex-row justify-between items-center mt-3 gap-4">
                      {/* Back Button */}
                      <Button
                        variant="outline"
                        onClick={goToPreviousStep}
                        disabled={currentStage === 0 && currentStep === 0}
                        className="flex items-center justify-center gap-2 w-auto"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>

                      {/* Overview */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Step {currentStep + 1} of {currentStageData?.steps?.length ?? 0}</span>
                        <span>•</span>
                        <span>Stage {currentStage + 1} of {workflowData?.stages.length}</span>
                      </div>

                      {/* Save & Next Button */}
                      <Button
                        onClick={triggerSubmit}
                        className="flex items-center justify-center gap-2 w-auto text-black bg-gradient-primary hover:shadow-glow hover:text-white border"
                        disabled={executeWorkflowMutation.isPending}
                      >
                        {currentStage === (workflowData?.stages.length ?? 0) - 1 &&
                        currentStep === (currentStageData?.steps.length ?? 0) - 1 ? (
                          <>
                            Complete <Check className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            {executeWorkflowMutation.isPending ? "Saving..." : "Save & Next"} 
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
