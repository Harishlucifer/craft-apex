import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@craft-apex/ui";
import { buildWorkflow, type StepSaveResult } from "./workflow-runtime.api";
import { useStepNavigation, useStepSave } from "./use-step-flow";
import { UiComponentLoader } from "./step-component-registry";
import type { WorkflowStageDef } from "./workflow-runtime.types";

/**
 * Generic settings-master form page — the masters' analog of OnboardingPage.
 *
 * OnboardingPage mounts WorkflowRuntime (backend-lifecycle driven: journey
 * picker + /workflow/execution). The settings masters are a different model:
 * a workflow only supplies the step/field *config*, there is no server-side
 * workflow instance, and steps advance locally while each FORM_BUILDER step
 * saves the record via saveStepData. This component owns everything those six
 * pages had in common — buildWorkflow, the stepper, UiComponentLoader wiring,
 * loading / not-configured states, and the Add/Edit header — while each master
 * supplies its bespoke state, payload transform, context, and save through a
 * `useController` hook (see MasterController). Bespoke steps (access-rights,
 * sub-loans, lender contracts, employee address/allocation, …) keep working
 * because rendering still goes through the registry, not StepRenderer.
 */

export interface MasterControllerArgs {
  /** Effective id: the backend-issued id after create ?? the route `:id`.
   *  Drives both the workflow build and the controller's detail query. */
  id: string | undefined;
  /** Raw route `:id` — undefined in create mode. Used for Add/Edit wording
   *  and create-only branches (some masters lock a code field once saved). */
  routeId: string | undefined;
  /** Save the current step's payload through the common flow (shared with
   *  WorkflowRuntime — see useStepSave). Bakes in the workflow type, toasts on
   *  failure, and resolves `null` when the save failed so the caller can just
   *  `if (!res) return;` instead of writing its own try/catch. */
  saveStep: (data: object) => Promise<StepSaveResult | null>;
  /** Whether a saveStep call is in flight (for button spinners). */
  saving: boolean;
  /** Advance to / retreat from the next / previous step (shared navigation). */
  goNext: () => void;
  goBack: () => void;
  /** Record the backend-issued id after the first create save, so later steps
   *  and the workflow rebuild pick it up. */
  setSavedId: (id: string) => void;
}

export interface MasterController {
  formValues: Record<string, unknown>;
  setFormValues: (v: Record<string, unknown>) => void;
  /** Context handed to every step via UiComponentLoader — carries the
   *  FORM_BUILDER step's `onSubmit` plus any bespoke-step domain data. */
  stepContext: Record<string, any>;
  /** Single-step masters (territory, lender-pincode) render without a stepper. */
  singleStep?: boolean;
  /** Whether the stepper may jump to not-yet-reached steps (needs a saved id). */
  canEnterLaterSteps?: boolean;
}

export type UseMasterController = (
  args: MasterControllerArgs,
) => MasterController;

export interface MasterWorkflowPageProps {
  /** Entity noun for the header, e.g. "Loan Type" → "Add Loan Type". */
  noun: string;
  /** Full heading override (for masters without an Add/Edit distinction). */
  staticHeading?: string;
  workflowType: string;
  /** List page the Back link returns to. */
  listPath: string;
  /** Container width utility, e.g. "max-w-5xl" (default) / "max-w-6xl". */
  maxWidth?: string;
  /** Human label for the not-configured placeholder, e.g. "loan type creation". */
  emptyLabel: string;
  useController: UseMasterController;
}

export function MasterWorkflowPage({
  noun,
  staticHeading,
  workflowType,
  listPath,
  maxWidth = "max-w-5xl",
  emptyLabel,
  useController,
}: MasterWorkflowPageProps) {
  const { id: routeId } = useParams<{ id?: string }>();
  const [savedId, setSavedId] = useState<string | undefined>(routeId);
  const id = savedId ?? routeId;

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: [`${workflowType}-workflow`, id ?? ""],
    queryFn: () => buildWorkflow({ workflowType, sourceId: id }),
  });

  // Shared "next" (navigation) and "API save" — the same primitives
  // WorkflowRuntime uses, so the two engines don't reimplement either.
  const stages: WorkflowStageDef[] = workflow?.stages ?? [];
  const nav = useStepNavigation(stages);
  const stepSave = useStepSave(workflowType);
  const steps = nav.flatSteps;

  const {
    formValues,
    setFormValues,
    stepContext,
    singleStep,
    canEnterLaterSteps,
  } = useController({
    id,
    routeId,
    saveStep: stepSave.save,
    saving: stepSave.saving,
    goNext: nav.goNext,
    goBack: nav.goBack,
    setSavedId,
  });

  const activeStepDef = singleStep ? steps[0] : nav.currentStep;
  const heading = staticHeading ?? `${routeId ? "Edit" : "Add"} ${noun}`;

  return (
    <div className={`mx-auto ${maxWidth} space-y-5`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {heading}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to={listPath}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading steps…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for {emptyLabel} yet. Configure a workflow with
          workflow_type &quot;{workflowType}&quot; at{" "}
          <Link to="/settings/workflow" className="underline">
            Settings → Workflow
          </Link>
          .
        </div>
      ) : singleStep ? (
        <UiComponentLoader
          step={activeStepDef}
          value={formValues}
          onChange={setFormValues}
          onNext={() => {}}
          onBack={() => {}}
          context={stepContext}
        />
      ) : (
        <>
          <Stepper
            steps={steps.map((s) => s.name)}
            activeStep={nav.flatIndex}
            onStepClick={(i) => {
              if (i <= nav.flatIndex || canEnterLaterSteps)
                nav.goToFlatIndex(i);
            }}
          />

          <UiComponentLoader
            step={activeStepDef}
            value={formValues}
            onChange={setFormValues}
            onNext={nav.goNext}
            onBack={nav.goBack}
            context={stepContext}
          />
        </>
      )}
    </div>
  );
}

function Stepper({
  steps,
  activeStep,
  onStepClick,
}: {
  steps: string[];
  activeStep: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {steps.map((label, i) => {
        const isDone = i < activeStep;
        const isActive = i === activeStep;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? "bg-[#4C7DF0] text-white"
                : isDone
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                isActive
                  ? "bg-white/20 text-white"
                  : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {isDone ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
