// ─── Workflow Types ───────────────────────────────────────────────────────────

export interface StepConfiguration {
  form_builder?: Record<string, any>;
  [key: string]: any;
}

export interface Step {
  id: string;
  name: string;
  description?: string;
  ui_component: string;
  task_status: string;
  configuration?: StepConfiguration;
  [key: string]: any;
}

export interface Stage {
  id: string;
  name: string;
  description?: string;
  task_status: string;
  steps: Step[];
  [key: string]: any;
}

export interface WorkflowInstance {
  id: string;
  workflow_type: string;
  source_id: string;
  status: string;
  [key: string]: any;
}

export interface Workflow {
  stages: Stage[];
  workflow_instance?: WorkflowInstance;
  [key: string]: any;
}

// ─── Workflow State (Zustand Store) ──────────────────────────────────────────

export interface WorkflowState {
  workflow: Workflow | null;
  workflowType: string;
  currentStageIndex: number;
  currentStepIndex: number;
  currentStageData: Stage | null;
  currentStepData: Step | null;
  completedStages: Set<number>;
  progress: number;
  isLoading: boolean;

  // Actions
  setWorkflow: (workflow: Workflow) => void;
  setWorkflowType: (type: string) => void;
  setCurrentStageIndex: (index: number) => void;
  setCurrentStepIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStage: (stageIndex: number) => void;
  reset: () => void;
}

// ─── Journey Types ───────────────────────────────────────────────────────────

export interface Journey {
  id: number;
  code: string;
  name: string;
  workflow_type: string;
  partner_type: string;
  loan_type_id?: number;
  loan_type?: {
    code: string;
    name: string;
  };
}

export interface LoanType {
  code: string;
  name: string;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  message?: string;
  error?: string;
  result?: T;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
}

export interface WorkflowPayload {
  source_id?: string;
  workflow_instance_id?: string;
  workflow_type: string;
  data?: {
    journey_type?: string;
    loan_type?: string;
    application?: {
      type?: string;
      partner_type?: string;
    };
  };
}

export interface ExecutionResult {
  success: boolean;
  data: Workflow | null;
}

export type InvalidateFn = (queryKey: unknown[]) => void;

// ─── Component Props ─────────────────────────────────────────────────────────

export interface StepComponentRef {
  submitStepExternally: () => Promise<any>;
}

export interface StepComponentProps {
  step: Step;
  handleSubmitSuccess: (data: any) => any;
  data: any;
}

export interface FormDataRef {
  submitFormExternally: () => void;
}

export interface DynamicStagesAndStepsProps {
  api: WorkflowAPI;
  className?: string;
  dataInfo?: any;
  /** V1 version of the data (fetched in parallel with V2 dataInfo) */
  dataInfoV1?: any;
  sourceId?: string;
  workflowType?: string;
  navigateUrl?: string;
  /** Navigation adapter — the host app provides its own navigate function */
  navigate: (url: string, options?: { replace?: boolean }) => void;
  /** The current route ID parameter (e.g. from useParams or Next.js params) */
  routeId?: string;
  /** The current URL search params */
  searchParams?: URLSearchParams;
}

export interface JourneyTypeModalProps {
  open: boolean;
  workflowType?: string;
  onClose: () => void;
  data?: Record<string, Journey[]>;
  onSelect: (journey: Journey) => void;
}

// Forward declare WorkflowAPI type for use in props
import type { WorkflowAPI } from "../api/WorkflowAPI";
