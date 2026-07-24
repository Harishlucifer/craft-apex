import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@craft-apex/ui";
import { useWorkflowEngine, type AdvanceResult } from "./use-step-flow";
import { UiComponentLoader } from "./step-component-registry";

/**
 * Master view over the shared workflow engine (see useWorkflowEngine) — the
 * masters' analog of OnboardingPage's WorkflowRuntime, differing only in the
 * render (horizontal stepper + UiComponentLoader/registry, so bespoke steps
 * keep working) and in who owns the Submit button (each step, not the engine).
 *
 * Like onboarding, each step now runs through the engine's `advance` (save →
 * /workflow/execution → resume at last_active_step_id), so masters get a
 * server-side WorkflowInstance + per-step Task rows (the "who is editing"
 * activity) and resume where the last editor left off. Each master supplies its
 * bespoke state, typed payload, and step context through a `useController` hook.
 */

export interface MasterControllerArgs {
  /** Effective id: the backend-issued id after create ?? the route `:id`.
   *  Drives both the workflow build and the controller's detail query. */
  id: string | undefined;
  /** Raw route `:id` — undefined in create mode. Used for Add/Edit wording
   *  and create-only branches (some masters lock a code field once saved). */
  routeId: string | undefined;
  /** Run the current step: `save?(payload)` → `/workflow/execution` (creates
   *  the WorkflowInstance + Task = activity) → resume at `last_active_step_id`.
   *  Pass the typed record payload for the FORM_BUILDER step; call with no arg
   *  from a bespoke step that already persisted its own sub-entity (just
   *  executes the current step for tracking). Resolves the effective source id,
   *  or `null` when the save/execute failed (each path toasts its own error).
   *  Also exposed on `stepContext.advance` for bespoke steps. */
  advance: (payload?: object) => Promise<AdvanceResult | null>;
  /** Whether a save/execute is in flight (for button spinners). */
  saving: boolean;
  /** Client-side navigation to the previous step (manual Back). */
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

  const engine = useWorkflowEngine({
    workflowType,
    sourceId: id,
    noSourceBehavior: "build",
  });
  const { nav, busy, loading } = engine;
  const steps = nav.flatSteps;

  // save?(payload) → execute the current step → resume. Shared with onboarding.
  const advance = (payload?: object) =>
    engine.advance({
      executeStepId: nav.currentStep?.id ?? "",
      sourceId: id,
      savePayload: payload,
    });

  const {
    formValues,
    setFormValues,
    stepContext,
    singleStep,
    canEnterLaterSteps,
  } = useController({
    id,
    routeId,
    advance,
    saving: busy,
    goBack: nav.goBack,
    setSavedId,
  });

  const workflowLoading = loading;
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
      ) : steps.length === 0 && !workflowType ? (
        // workflowType itself is empty — this is a caller/build bug (e.g. a
        // stale dev bundle after a WorkflowType rename in workflow-runtime),
        // not "unconfigured" — surface it distinctly so it isn't mistaken for
        // the normal not-configured-yet case below.
        <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/40 p-8 text-center text-sm text-rose-600">
          This page&apos;s <code>workflowType</code> prop is empty. That
          usually means a stale dev bundle — fully restart the dev server
          (not just a browser refresh) and reload.
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
