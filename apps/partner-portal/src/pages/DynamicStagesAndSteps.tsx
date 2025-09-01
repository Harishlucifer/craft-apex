import React, { useState } from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { ChevronLeft, ChevronRight, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

  interface Step {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  step_type: string;                // e.g. "MANUAL"
  sequence: number;
  ui_component: string;             // e.g. "FORM_BUILDER"
  conditional_component: string;
  automatic_component: string;
  display_mode: string;             // e.g. "ALL"
  allocation_rule_id: string;
  validation_rule_id: string;
  completion_rule_id: string;
  field_master_id: string;
  allocation_configuration: Record<string, any>;
  stage_id: string;
  workflow_id: string;
  status: number;
  task_id: string;
  task_start_date: string;          // ISO datetime
  task_end_date: string;            // ISO datetime
  task_status: string;
  workflow_instance_id: string;
  edit_mode: boolean;
  username: string;
  user_id: string;
  user_type: string;
}

// Stage inside a Workflow
interface Stage {
  id: string;
  name: string;
  description: string;
  sequence: number;
  allocation_rule_id: string;
  validation_rule_id: string;
  configuration: Record<string, any>;
  workflow_id: string;
  status: number;
  task_start_date: string;
  task_end_date: string;
  task_status: string;
  steps: Step[];
}

interface DynamicStagesAndStepsProps {
  stages: Stage[];
  onComplete?: () => void;
  className?: string;
  partnerInfo?: {
    name: string;
    journeyType: string;
    mobile: string;
  };
}

export const DynamicStagesAndSteps: React.FC<DynamicStagesAndStepsProps> = ({
  stages=[],
  onComplete,
  className,
  partnerInfo
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Map<number, Set<number>>>(new Map());

  const currentStageData = stages[currentStage] || { steps: [] };
  const currentStepData = currentStageData?.steps[currentStep];

  const goToNext = () => {
    const stepsInCurrentStage = currentStageData.steps.length;
    
    if (currentStep < stepsInCurrentStage - 1) {
      // Move to next step in current stage
      const stageCompletedSteps = completedSteps.get(currentStage) || new Set();
      stageCompletedSteps.add(currentStep);
      setCompletedSteps(new Map(completedSteps.set(currentStage, stageCompletedSteps)));
      setCurrentStep(prev => prev + 1);
    } else if (currentStage < stages.length - 1) {
      // Move to next stage
      const stageCompletedSteps = completedSteps.get(currentStage) || new Set();
      stageCompletedSteps.add(currentStep);
      setCompletedSteps(new Map(completedSteps.set(currentStage, stageCompletedSteps)));
      setCompletedStages(prev => new Set([...prev, currentStage]));
      setCurrentStage(prev => prev + 1);
      setCurrentStep(0);
    } else {
      // Complete the entire process
      const stageCompletedSteps = completedSteps.get(currentStage) || new Set();
      stageCompletedSteps.add(currentStep);
      setCompletedSteps(new Map(completedSteps.set(currentStage, stageCompletedSteps)));
      setCompletedStages(prev => new Set([...prev, currentStage]));
      onComplete?.();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
      setCurrentStep(stages[currentStage - 1]?.steps.length - 1 || 0);
    }
  };

  const goToStage = (stageIndex: number) => {
    if (stageIndex <= currentStage || completedStages.has(stageIndex)) {
      setCurrentStage(stageIndex);
      setCurrentStep(0);
    }
  };

  const getStageStatus = (stageIndex: number) => {
    if (completedStages.has(stageIndex)) return 'completed';
    if (stageIndex === currentStage) return 'active';
    return 'inactive';
  };

  const getStepStatus = (stageIndex: number, stepIndex: number) => {
    const stageSteps = completedSteps.get(stageIndex);
    if (stageSteps?.has(stepIndex)) return 'completed';
    if (stageIndex === currentStage && stepIndex === currentStep) return 'active';
    return 'inactive';
  };

  const totalSteps = stages.reduce((acc, stage) => acc + stage.steps.length, 0);
  const completedStepsCount = Array.from(completedSteps.values()).reduce(
    (acc, stepSet) => acc + stepSet.size, 0
  );
  const progress = ((completedStepsCount + (currentStepData ? 1 : 0)) / totalSteps) * 100;

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
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage Progress */}
          <div className="space-y-6">
            {stages.map((stage, stageIndex) => (
              <div key={stage.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    getStageStatus(stageIndex) === 'completed' && "bg-step-completed text-white",
                    getStageStatus(stageIndex) === 'active' && "bg-step-active text-white",
                    getStageStatus(stageIndex) === 'inactive' && "bg-step-inactive text-muted-foreground"
                  )}>
                    {getStageStatus(stageIndex) === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      stageIndex + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium text-sm transition-colors",
                      getStageStatus(stageIndex) === 'active' && "text-primary",
                      getStageStatus(stageIndex) === 'completed' && "text-step-completed",
                      getStageStatus(stageIndex) === 'inactive' && "text-muted-foreground"
                    )}>
                      {stage.name}
                    </h4>
                    {stage.description && (
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    )}
                  </div>
                </div>

                {/* Steps within stage */}
                <div className="ml-11 space-y-2">
                  {stage.steps.map((step, stepIndex) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <Circle className={cn(
                        "w-3 h-3 transition-colors",
                        getStepStatus(stageIndex, stepIndex) === 'completed' && "text-step-completed fill-current",
                        getStepStatus(stageIndex, stepIndex) === 'active' && "text-step-active fill-current",
                        getStepStatus(stageIndex, stepIndex) === 'inactive' && "text-step-inactive"
                      )} />
                      <span className={cn(
                        "text-xs transition-colors",
                        getStepStatus(stageIndex, stepIndex) === 'active' && "text-primary font-medium",
                        getStepStatus(stageIndex, stepIndex) === 'completed' && "text-step-completed",
                        getStepStatus(stageIndex, stepIndex) === 'inactive' && "text-muted-foreground"
                      )}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Stage Tabs */}
          <Tabs value={currentStage.toString()} onValueChange={(value) => goToStage(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-3">
              {stages.map((stage, index) => (
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
                      {currentStepData?.ui_component}
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
              onClick={goToPrevious}
              disabled={currentStage === 0 && currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {currentStageData?.steps.length}</span>
              <span>•</span>
              <span>Stage {currentStage + 1} of {stages.length}</span>
            </div>

            <Button
              onClick={goToNext}
              className="flex items-center gap-2 text-black bg-gradient-primary hover:shadow-glow hover:text-white border"
            >
              {currentStage === stages.length - 1 && currentStep === currentStageData?.steps.length - 1 ? (
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