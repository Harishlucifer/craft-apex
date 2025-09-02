import React, { useEffect } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import { useWorkflow } from '../hooks/workflow';
import { Step } from '@/stores/workflow';


interface DynamicStagesAndStepsProps {
  onComplete?: (data: any) => any;
  className?: string;
  partnerInfo?: {
    name: string;
    journeyType: string;
    mobile: string;
  };
  executeWorkflow?: (currentStepData: Step) => Promise<boolean>;
}



export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
  // onComplete,
  className,
  partnerInfo,
}) => {
  const { id } = useParams<{id: string}>();
  
  // Use our custom workflow hook instead of local state
  const {
    workflow: workflowData,
    currentStageIndex: currentStage,
    currentStepIndex: currentStep,
    currentStageData,
    currentStepData,
    completedStages,
    completedSteps,
    progress,
    fetchWorkflow,
    handleNextStep,
    goToPreviousStep,
    goToStage
  } = useWorkflow(id);

  // Fetch workflow data when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchWorkflow(id, "LEAD_CREATION");
    }
  }, [id]);


  // Use handleNextStep from our hook instead of local implementation
  const goToNext = () => {
      handleNextStep()
  };
  
  // These functions are now handled by the workflow hook

  // Helper functions for UI state
  const getStageStatus = (stageIndex: number) => {
    if (completedStages.has(stageIndex)) return 'completed';
    if (stageIndex === currentStage) return 'active';
    return 'inactive';
  };

  const getStepStatus = (stageIndex: number, stepIndex: number) => {
    const stage = workflowData?.stages?.[stageIndex];
    const step = stage?.steps?.[stepIndex];
    if (!step) return 'inactive';

    // step.id is a string, and completedSteps is a Map<string, string>
    const stepStatus = step.id ? completedSteps.get(step.id) : undefined;

    if (stepStatus && stepStatus === "2") return "completed"; // task_status = 2 means completed
    if (stageIndex === currentStage && stepIndex === currentStep) return "active";

    return "inactive";
  };

  console.log('progress: ', progress)
  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      {/* Header with Partner Info */}
      {partnerInfo && (
        <div className="bg-card border-b border-border p-2 mb-2 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Partner Name:</span>
                <span className="ml-2 font-medium text-foreground">{partnerInfo.name}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Journey Type:</span>
                <span className="ml-2 font-medium text-foreground">{partnerInfo.journeyType}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Mobile No:</span>
                <span className="ml-2 font-medium text-foreground">{partnerInfo.mobile}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">Action</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Step Progress */}
        <div className="w-full lg:w-80 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Progress Overview</h3>
          
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

          {/* Stage Progress */}
          <div className="space-y-6">
            {workflowData?.stages.map((stage, stageIndex) => {
              const stageStatus = getStageStatus(stageIndex);

              return (
                  <div key={stage.id} className="space-y-3">
                    {/* Stage Row */}
                    <div className="flex items-center gap-3">
                      <div
                          className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-all duration-300",
                              stageStatus === "completed" && "bg-emerald-600 text-white border-emerald-600",
                              stageStatus === "active" && "bg-blue-600 text-white border-blue-600",
                              stageStatus === "inactive" && "bg-gray-100 text-gray-500 border-gray-300"
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
                            <p className="text-xs text-muted-foreground">{stage.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Steps inside stage */}
                    <div className="ml-11 space-y-2">
                      {stage.steps.map((step, stepIndex) => {
                        const stepStatus = getStepStatus(stageIndex, stepIndex);

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

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Stage Tabs */}
          <Tabs value={currentStage.toString()} onValueChange={(value) => goToStage(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-3">
              {workflowData?.stages.map((stage, index) => (
                <TabsTrigger 
                  key={stage.id} 
                  value={index.toString()}
                  className={cn(
                    "relative",
                    getStageStatus(index) === 'completed' && "data-[state=inactive]:bg-step-completed/20 data-[state=inactive]:text-step-completed",
                    getStageStatus(index) === 'active' && "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  )}
                  disabled={index > currentStage && !completedStages.has(index)}
                >
                  {getStageStatus(index) === 'completed' && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  <span className="hidden sm:inline">{stage.name}</span>
                  <span className="sm:hidden">{stage.name.slice(0, 8)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={currentStage.toString()}>
              <Card className="bg-gradient-secondary border-border/50 shadow-card">
                <div className="p-6 md:p-8">
                  {/* Step Content */}
                  <div className="min-h-[400px] md:min-h-[500px]">
                    <div className="animate-fade-in" key={`${currentStage}-${currentStep}`}>
                      {currentStepData?.ui_component} - {currentStepData?.name}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                console.log('Back button clicked, calling goToPreviousStep');
                goToPreviousStep();
              }}
              disabled={currentStage === 0 && currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {currentStageData?.steps != null ?currentStageData?.steps.length : 0}</span>
              <span>•</span>
              <span>Stage {currentStage + 1} of {workflowData?.stages.length}</span>
            </div>

            <Button
              onClick={goToNext}
              className="flex items-center gap-2 text-black bg-gradient-primary hover:shadow-glow hover:text-white border"
            >
              {currentStage === (workflowData?.stages.length ?? 0 - 1) && currentStep === (currentStageData?.steps.length ?? 0 - 1) ? (
                <>Complete <Check className="w-4 h-4" /></>
              ) : (
                <>Save & Next <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};