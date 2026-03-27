import { create } from "zustand";
import type { Workflow, WorkflowState, Stage, Step } from "../types";

// ─── Workflow Zustand Store ──────────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflow: null,
  workflowType: "",
  currentStageIndex: 0,
  currentStepIndex: 0,
  currentStageData: null,
  currentStepData: null,
  completedStages: new Set<number>(),
  progress: 0,
  isLoading: false,

  setWorkflow: (workflow: Workflow) => {
    const stages = workflow.stages || [];

    // Calculate which stages are completed
    const completedStages = new Set<number>();
    let currentStageIndex = 0;
    let currentStepIndex = 0;
    let foundActive = false;

    stages.forEach((stage: Stage, sIndex: number) => {
      const allStepsCompleted = stage.steps.every(
        (step: Step) => step.task_status === "2"
      );
      if (allStepsCompleted) {
        completedStages.add(sIndex);
      }
      if (!foundActive && !allStepsCompleted) {
        currentStageIndex = sIndex;
        // Find first non-completed step in this stage
        const firstIncomplete = stage.steps.findIndex(
          (step: Step) => step.task_status !== "2"
        );
        currentStepIndex = firstIncomplete >= 0 ? firstIncomplete : 0;
        foundActive = true;
      }
    });

    const currentStage = stages[currentStageIndex] || null;
    const currentStep = currentStage?.steps?.[currentStepIndex] || null;

    // Calculate progress
    const totalSteps = stages.reduce(
      (acc: number, s: Stage) => acc + s.steps.length,
      0
    );
    const completedSteps = stages.reduce(
      (acc: number, s: Stage) =>
        acc + s.steps.filter((step: Step) => step.task_status === "2").length,
      0
    );
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    set({
      workflow,
      currentStageIndex,
      currentStepIndex,
      currentStageData: currentStage,
      currentStepData: currentStep,
      completedStages,
      progress,
    });
  },

  setWorkflowType: (type: string) => set({ workflowType: type }),

  setCurrentStageIndex: (index: number) => {
    const { workflow } = get();
    if (!workflow) return;
    const stage = workflow.stages[index] || null;
    set({
      currentStageIndex: index,
      currentStepIndex: 0,
      currentStageData: stage,
      currentStepData: stage?.steps?.[0] || null,
    });
  },

  setCurrentStepIndex: (index: number) => {
    const { workflow, currentStageIndex } = get();
    if (!workflow) return;
    const stage = workflow.stages[currentStageIndex];
    const step = stage?.steps?.[index] || null;
    set({
      currentStepIndex: index,
      currentStepData: step,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  goToNextStep: () => {
    const { workflow, currentStageIndex, currentStepIndex, completedStages } =
      get();
    if (!workflow) return;

    const currentStage = workflow.stages[currentStageIndex];
    if (!currentStage) return;

    if (currentStepIndex < currentStage.steps.length - 1) {
      // Move to next step within the same stage
      const nextStepIndex = currentStepIndex + 1;
      set({
        currentStepIndex: nextStepIndex,
        currentStepData: currentStage.steps[nextStepIndex] || null,
      });
    } else if (currentStageIndex < workflow.stages.length - 1) {
      // Move to the first step of the next stage
      const nextStageIndex = currentStageIndex + 1;
      const nextStage = workflow.stages[nextStageIndex];
      const newCompletedStages = new Set(completedStages);
      newCompletedStages.add(currentStageIndex);

      set({
        currentStageIndex: nextStageIndex,
        currentStepIndex: 0,
        currentStageData: nextStage || null,
        currentStepData: nextStage?.steps?.[0] || null,
        completedStages: newCompletedStages,
      });
    }

    // Recalculate progress
    const { workflow: w } = get();
    if (w) {
      const totalSteps = w.stages.reduce(
        (acc: number, s: Stage) => acc + s.steps.length,
        0
      );
      const completedSteps = w.stages.reduce(
        (acc: number, s: Stage) =>
          acc + s.steps.filter((step: Step) => step.task_status === "2").length,
        0
      );
      set({ progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0 });
    }
  },

  goToPreviousStep: () => {
    const { workflow, currentStageIndex, currentStepIndex } = get();
    if (!workflow) return;

    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      const currentStage = workflow.stages[currentStageIndex];
      set({
        currentStepIndex: prevStepIndex,
        currentStepData: currentStage?.steps?.[prevStepIndex] || null,
      });
    } else if (currentStageIndex > 0) {
      const prevStageIndex = currentStageIndex - 1;
      const prevStage = workflow.stages[prevStageIndex];
      const lastStepIndex = prevStage ? prevStage.steps.length - 1 : 0;

      set({
        currentStageIndex: prevStageIndex,
        currentStepIndex: lastStepIndex,
        currentStageData: prevStage || null,
        currentStepData: prevStage?.steps?.[lastStepIndex] || null,
      });
    }
  },

  goToStage: (stageIndex: number) => {
    const { workflow } = get();
    if (!workflow) return;
    const stage = workflow.stages[stageIndex];
    if (!stage) return;

    set({
      currentStageIndex: stageIndex,
      currentStepIndex: 0,
      currentStageData: stage,
      currentStepData: stage.steps?.[0] || null,
    });
  },

  reset: () =>
    set({
      workflow: null,
      workflowType: "",
      currentStageIndex: 0,
      currentStepIndex: 0,
      currentStageData: null,
      currentStepData: null,
      completedStages: new Set<number>(),
      progress: 0,
      isLoading: false,
    }),
}));
