import type { ComponentType, ReactNode } from "react";
import type { WorkflowStepDef } from "./workflow-runtime.types";

/**
 * Common props every registered step component receives. `value`/`onChange`
 * are only meaningful for form-shaped steps (FORM_BUILDER); bespoke steps
 * (AccessRights, SubLoanTypesPanel, …) ignore them and read their own data
 * out of `context` instead.
 *
 * `context` is deliberately loose (`Record<string, any>`) — it's how a
 * page hands a step whatever domain data it needs (a `RoleData` object, an
 * `employeeId`, a save handler, …) without every step sharing one rigid
 * prop shape. That looseness is the actual cost of a cross-domain registry:
 * nothing here type-checks that a page passed what a given step expects —
 * get it wrong and it's a runtime `undefined`, not a compile error. Steps
 * should destructure defensively and render a clear "missing X" message
 * rather than crash when an expected context key is absent.
 */
export interface StepComponentProps {
  step: WorkflowStepDef;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  /** Advance to the next step. FORM_BUILDER steps call `context.onSubmit`
   * instead (submission is an async save, not just navigation) — plain
   * navigational steps that manage their own save can call this directly. */
  onNext: () => void;
  onBack: () => void;
  context?: Record<string, any>;
  lenderData?: any;
}

const registry: Record<string, ComponentType<StepComponentProps>> = {};

/** Register a component for a `ui_component` code. Call once, at module
 * scope, in a `*.steps.tsx` file — see register-all-steps.ts for why these
 * need a single, explicit import point rather than relying on whichever
 * page happens to load first. Re-registering the same code overwrites the
 * previous entry (last import wins), which is only a problem if two
 * features accidentally claim the same code. */
export function registerStepComponent(
  uiComponent: string,
  Component: ComponentType<StepComponentProps>
) {
  registry[uiComponent] = Component;
}

export function getStepComponent(
  uiComponent: string | undefined
): ComponentType<StepComponentProps> | undefined {
  return uiComponent ? registry[uiComponent] : undefined;
}

interface UiComponentLoaderProps {
  step: WorkflowStepDef | undefined;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
  context?: Record<string, any>;
  lenderData?: any;
}

/** Looks up `step.ui_component` in the global registry and renders it,
 * falling back to a generic "not wired up" message when nothing is
 * registered for that code. This is the only thing that's actually
 * "widely accessible" for free — which component renders, not the data it
 * needs (see StepComponentProps.context doc above). */
export function UiComponentLoader({
  step,
  value,
  onChange,
  onNext,
  onBack,
  context,
  lenderData,
}: UiComponentLoaderProps): ReactNode {
  if (!step) return null;
  const Component = getStepComponent(step.ui_component);
  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
        This step (&quot;{step.name}&quot;) isn&apos;t wired up yet —
        unrecognized ui_component &quot;{step.ui_component ?? "none"}&quot;.
      </div>
    );
  }
  return (
    <Component
      step={step}
      value={value}
      onChange={onChange}
      onNext={onNext}
      onBack={onBack}
      context={context}
      lenderData={lenderData}
    />
  );
}
