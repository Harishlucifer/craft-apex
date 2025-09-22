import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import React from "react";

// Types
export interface Step {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  step_type: string; // e.g. "MANUAL"
  sequence: number;
  ui_component: string; // e.g. "FORM_BUILDER"
  conditional_component: string;
  automatic_component: string;
  display_mode: string; // e.g. "ALL"
  allocation_rule_id: string;
  validation_rule_id: string;
  completion_rule_id: string;
  field_master_id: string;
  allocation_configuration: Record<string, any>;
  stage_id: string;
  workflow_id: string;
  status: number;
  task_id: string;
  task_start_date: string; // ISO datetime
  task_end_date: string; // ISO datetime
  task_status: string;
  workflow_instance_id: string;
  edit_mode: boolean;
  username: string;
  user_id: string;
  user_type: string;
}

export interface Stage {
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

export interface Workflow {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  workflow_type: string;
  allocation_rule_id: string;
  is_default: number;
  configuration: any | null;
  mode: string;
  status: number;
  created_at: string;
  updated_at: string;
  stages: Stage[];
  workflow_instance_id: string;
  workflow_instance: WorkflowInstance | null;
  last_active_stage_id: string;
  last_active_step_id: string;
}

export interface WorkflowInstance {
  workflow_instance_id: string;
  workflow_id: string;
  reference_type: string;
  reference_id: string;
  start_date: string;
  end_date: string;
  source_id: string;
  source_type: string;
  previous_instance_id: string;
  active_task_id: string;
  completed_task_id: string;
  status: string;
}

export interface StepComponentData {
  step: Step;
  ref: React.RefObject<any> | React.MutableRefObject<any>;
  handleSubmit: (values: any) => void;
}


interface WorkflowState {
  // State
  workflowType: string;
  workflow: Workflow | null;
  currentStageIndex: number;
  currentStepIndex: number;
  loading: boolean;
  askAvailableWorkflowStages: any[];
  status: string;
  completedStages: Set<number>;
  completedSteps: Map<string, string>;

  // Computed
  currentStageData: Stage | null;
  currentStepData: Step | null;
  progress: number;

  // Actions
  setWorkflow: (workflow: Workflow | null) => void;
  setWorkflowType: (type: string) => void;
  setCurrentStageIndex: (index: number) => void;
  setCurrentStepIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  markStageCompleted: (stageIndex: number) => void;
  markStepCompleted: (stageIndex: number, stepIndex: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStage: (stageIndex: number) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
    devtools(
        persist(
            (set, get) => ({
              // Initial state
              workflowType: "",
              workflow: null,
              currentStageIndex: 0,
              currentStepIndex: 0,
              loading: false,
              askAvailableWorkflowStages: [],
              status: "",
              completedStages: new Set(),
              completedSteps: new Map(),

              // Computed
              get currentStageData() {
                const { workflow, currentStageIndex } = get() || {} as WorkflowState;
                if (!workflow?.stages) return {}as Stage;
                return workflow.stages[currentStageIndex] ||{} as Stage;
              },

              get currentStepData() {
                const { currentStageData, currentStepIndex } = get()|| {} as WorkflowState;

                if (!currentStageData?.steps) return null;
                return currentStageData.steps[currentStepIndex] || null;
              },

              get progress() {
                const { workflow, completedSteps } = get()|| {} as WorkflowState;
                if (!workflow?.stages?.length) return 0;

                const totalSteps = workflow.stages.reduce(
                    (acc, stage) => acc + (stage.steps?.length || 0),
                    0
                );
                if (totalSteps === 0) return 0;

                // Count completed steps (where value is "2")
                const completedStepsCount = Array.from(completedSteps.values()).filter(
                    (status) => status === "2"
                ).length;

                return (completedStepsCount / totalSteps) * 100;
              },
              setWorkflowType: (workflowType) => set({ workflowType }),

              setCurrentStageIndex: (currentStageIndex) => {
                const state = get();
                if (!state) return;

                const { workflow } = state;


                if (!workflow?.stages?.[currentStageIndex]) {
                  console.log('No stage found at index:', currentStageIndex);
                  return;
                }
                set({
                  currentStageIndex,
                  currentStepIndex: 0,
                });
              },

              setCurrentStepIndex: (currentStepIndex) => {
                const state = get();
                if (!state) return;

                const { workflow, currentStageIndex } = state;


                if (!workflow?.stages?.[currentStageIndex]?.steps) {
                  console.log('No steps found for stage:', currentStageIndex);
                  return;
                }
                set({
                  currentStepIndex,
                });
              },

              setLoading: (loading) => set({ loading }),

              markStageCompleted: (stageIndex) => {
                const { completedStages,workflow } = get()|| {} as WorkflowState;
                const newCompletedStages = new Set(completedStages);
                if (stageIndex >= 0 && workflow?.stages) {
                  const stage = workflow.stages[stageIndex];
                  if (stage) {
                    newCompletedStages.add(stageIndex);
                  }
                }
                set({ completedStages: newCompletedStages });
              },

              markStepCompleted: (stageIndex, stepIndex) => {
                const { completedSteps, workflow } = get()|| {} as WorkflowState;
                const newCompletedSteps = new Map(completedSteps);

                // Get the step ID from the workflow data
                const stepId = workflow?.stages?.[stageIndex]?.steps?.[stepIndex]?.id;

                if (stepId) {
                  // Set the step as completed with task_status "2"
                  newCompletedSteps.set(stepId, "2");
                  set({ completedSteps: newCompletedSteps });
                }
              },

              // Actions
              setWorkflow: (workflow) => {
                if (!workflow) return;
                console.log("workflow", workflow);
                // pick the active stage (last_active_stage_id or first stage)
                const currentStage =
                    workflow.stages?.find((stage) => stage.id === workflow.last_active_stage_id) ??
                    workflow.stages?.[0] ??{}as Stage;

                // pick the active step (last_active_step_id or first step of that stage)
                const currentStep =
                    currentStage?.steps?.find((step) => step.id === workflow.last_active_step_id) ??
                    currentStage?.steps?.[0] ?? {} as Step;

                // find indexes
                const currentStageIndex =
                    workflow.stages?.findIndex((s) => s.id === currentStage?.id) ?? 0;
                const currentStepIndex =
                    currentStage?.steps?.findIndex((s) => s.id === currentStep?.id) ?? 0;

                // derive completed stages & steps
                // derive completed stages & steps
                const completedStages = new Set(
                    workflow.stages
                        ?.filter((s) => s.task_status === "2" || s.task_status === "1")
                        .map((_s, index) => index)
                );

                const completedSteps = new Map();
                workflow.stages?.forEach((stage) => {
                  stage.steps?.forEach((step) => {
                    if (step.task_status === "2") {
                      completedSteps.set(step.id, step.task_status);
                    }
                  });
                });

                // ✅ Calculate progress here
                const totalSteps = workflow.stages?.reduce(
                    (acc, stage) => acc + (stage.steps?.length || 0),
                    0
                ) || 0;

                const completedStepsCount = [...completedSteps.values()].filter(
                    (status) => status === "2" // assuming "2" = completed
                ).length;

                const progress = totalSteps > 0 ? (completedStepsCount / totalSteps)*100 : 0;

                set({
                  workflow,
                  workflowType: workflow.workflow_type || "",
                  currentStageIndex,
                  currentStepIndex,
                  currentStageData:currentStage,
                  currentStepData:currentStep,
                  status: workflow.workflow_instance?.status || "",
                  askAvailableWorkflowStages: workflow.stages?.map((s) => ({
                    id: s.id,
                    name: s.name,
                  })) || [],
                  completedStages:completedStages || new Set(),
                  completedSteps:completedSteps || new Map(),
                  progress
                });

              },
              goToNextStep: () => {
                const {
                  currentStageIndex,
                  currentStepIndex,
                  workflow,
                  markStepCompleted,
                  markStageCompleted,
                  setCurrentStageIndex,
                  setCurrentStepIndex,
                } = get()|| {} as WorkflowState;

                if (!workflow?.stages) return;

                const currentStage = workflow.stages[currentStageIndex];
                if (!currentStage?.steps) return;

                const stepsInCurrentStage = currentStage.steps.length;

                // Mark current step as completed
                markStepCompleted(currentStageIndex, currentStepIndex);

                if (currentStepIndex < stepsInCurrentStage - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                } else if (currentStageIndex < workflow.stages.length - 1) {
                  markStageCompleted(currentStageIndex);
                  setCurrentStageIndex(currentStageIndex + 1);
                } else {
                  markStageCompleted(currentStageIndex); // last stage completed
                }
              },

              goToPreviousStep: () => {
                const state = get();
                if (!state) return;

                const {
                  currentStageIndex,
                  currentStepIndex,
                  workflow,
                } = state;

                if (!workflow?.stages) return;

                if (currentStepIndex > 0) {
                  // Move one step back in the same stage
                  const newStepIndex = currentStepIndex - 1;
                  set({
                    currentStepIndex: newStepIndex,
                    currentStepData: workflow?.stages[currentStageIndex]?.steps[newStepIndex],
                  });

                } else if (currentStageIndex > 0) {
                  // Go to previous stage’s last step
                  const previousStageIndex = currentStageIndex - 1;
                  const previousStage = workflow.stages[previousStageIndex];

                  const lastStepIndex = (previousStage?.steps?.length ?? 0) - 1;

                  set({
                    currentStageIndex: previousStageIndex,
                    currentStageData: previousStage,
                    currentStepIndex: lastStepIndex,
                    currentStepData: previousStage?.steps[lastStepIndex],
                  });
                }
              },

              goToStage: (stageIndex: number) => {
                const { workflow } = get() || {} as WorkflowState;
                if (!workflow?.stages) return;

                if (stageIndex >= 0 && stageIndex < workflow.stages.length) {
                  const targetStage = workflow.stages[stageIndex];
                  const firstStep = targetStage?.steps[0];

                  set({
                    currentStageIndex: stageIndex,
                    currentStageData: targetStage,
                    currentStepIndex: 0,
                    currentStepData: firstStep,
                  });
                }
              },


              reset: () => {
                set({
                  workflowType: "",
                  workflow: null,
                  currentStageIndex: 0,
                  currentStepIndex: 0,
                  completedStages: new Set(),
                  completedSteps: new Map(),
                  status: "",
                });
              },
            }),
            {
              name: "workflow-storage",
              partialize: (state) => ({
                workflowType: state.workflowType,
                workflow: state.workflow,
                currentStageIndex: state.currentStageIndex,
                currentStepIndex: state.currentStepIndex,
                completedStages: Array.from(state.completedStages),
                completedSteps: Array.from(state.completedSteps.entries()),
              }),
              serialize: (state) => JSON.stringify(state),
              deserialize: (storedState) => {
                const parsed = JSON.parse(storedState);

                if (parsed.state.completedStages) {
                  parsed.state.completedStages = new Set(parsed.state.completedStages);
                }
                if (parsed.state.completedSteps) {
                  parsed.state.completedSteps = new Map(parsed.state.completedSteps);
                }
                return parsed;
              },
            }
        ),
        { name: "workflow-store" }
    )
);

export type { WorkflowState };
