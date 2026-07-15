import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Cog, Sparkles, ListChecks } from "lucide-react";
import { Badge, Label } from "@craft-apex/ui";
import {
  AxiosProvider,
  DynamicForm,
  Provider as CraftUxProvider,
} from "@craft-apex/craft-ux";
import { getApiClient } from "@craft-apex/api";
import { getStepComponent } from "./step-component-registry";
import { FormBuilderRenderer } from "./form-builder-renderer";
import type { FormBuilderStepConfiguration } from "./form-builder.types";
import { StepType, type WorkflowStepDef } from "./workflow-runtime.types";

interface Props {
  step: WorkflowStepDef;
  /** Step output (sent into executeWorkflow / saved per step). */
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  onNext?: () => void;
  onBack?: () => void;
  context?: Record<string, any>;
}

/** Imperative handle so the parent can pull a step's final payload on submit
 * without every renderer needing to be a live-controlled `value`/`onChange`
 * component (DYNAMIC_FORM's craft-ux engine owns its own Redux state and
 * only exposes data via an internal-submit callback — see below). */
export interface StepRendererHandle {
  /** Resolves the payload to save, or `null` if the step blocked submission
   * (e.g. required-field validation failed). Steps that are plain
   * controlled components (FormBuilderRenderer/JsonFallback) resolve
   * immediately with the current `value`. */
  getPayload: () => Promise<Record<string, unknown> | null>;
}

/**
 * Step renderer.
 *
 * `ui_component` values:
 * - "FORM_BUILDER": this app's own structured renderer (FormBuilderRenderer)
 *   — flat fields only, no repeatable rows / autoFill / requestAction.
 * - "DYNAMIC_FORM": the real @craft-apex/craft-ux engine (matches legacy
 *   <DynamicForm formJson={…}/> — see
 *   craft-frontend/src/Components/Common/StepComponentLoader.js, case
 *   "FORM_BUILDER") — use this when a step's form_builder JSON needs
 *   repeatable sections (`[{index}]`), nested array paths (`[0]`), autoFill,
 *   or requestAction (e.g. the Lead Creation shareholder/co-applicant step).
 *
 * Other ui_component values map to ~200 specialized step screens in legacy
 * (LEAD_VERIFICATION, BASIC_DETAILS, BANK_DETAILS, PROPERTY_DETAILS, etc.).
 * Those each need their own port; for now they fall back to a raw-JSON editor
 * so the workflow stays round-trippable.
 */
export const StepRenderer = forwardRef<StepRendererHandle, Props>(
  function StepRenderer({ step, value, onChange, onNext, onBack, context }, ref) {
    const formBuilder = useMemo<
      FormBuilderStepConfiguration["form_builder"] | undefined
    >(() => {
      const config = step.configuration as FormBuilderStepConfiguration | null;
      return config?.form_builder;
    }, [step]);

    const useStructured =
      step.ui_component === "FORM_BUILDER" && formBuilder != null;
    const useDynamicForm =
      step.ui_component === "DYNAMIC_FORM" && formBuilder != null;

    const dynamicFormRef = useRef<{ submitFormExternally: () => void } | null>(
      null
    );
    const resolvePayload = useRef<
      ((v: Record<string, unknown> | null) => void) | null
    >(null);

    useImperativeHandle(
      ref,
      (): StepRendererHandle => ({
        getPayload: async () => {
          if (!useDynamicForm) return value;
          return new Promise((resolve) => {
            resolvePayload.current = resolve;
            dynamicFormRef.current?.submitFormExternally();
          });
        },
      }),
      [useDynamicForm, value]
    );

    const Component = getStepComponent(step.ui_component);

    return (
      <div className="space-y-3">
        {Component ? (
          <Component
            step={step}
            value={value}
            onChange={onChange}
            onNext={onNext ?? (() => {})}
            onBack={onBack ?? (() => {})}
            context={context}
          />
        ) : useDynamicForm ? (
          <CraftUxProvider>
            <AxiosProvider axiosInstance={getApiClient()}>
              <DynamicForm
                ref={dynamicFormRef}
                componentName={String(step.id)}
                formJson={formBuilder as any}
                existingObject={value}
                onSubmitSuccess={(result: {
                  data: Record<string, unknown> | null;
                  isValidForm: boolean;
                }) => {
                  resolvePayload.current?.(
                    result.isValidForm ? result.data : null
                  );
                  resolvePayload.current = null;
                }}
              />
            </AxiosProvider>
          </CraftUxProvider>
        ) : useStructured ? (
          <FormBuilderRenderer
            formJson={formBuilder!}
            value={value}
            onChange={onChange}
          />
        ) : (
          <JsonFallback step={step} value={value} onChange={onChange} />
        )}
      </div>
    );
  }
);

interface FallbackProps {
  step: WorkflowStepDef;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

/**
 * Raw JSON editor for steps whose ui_component doesn't have a structured
 * renderer yet. The textarea holds a stringified copy of the parsed value;
 * we only propagate upward when it parses cleanly.
 */
function JsonFallback({ step, value, onChange }: FallbackProps) {
  const [text, setText] = useState<string>(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Reset text whenever the active step changes — pick up fresh server data.
  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">
        Step data (JSON)
      </Label>
      <textarea
        rows={12}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value || "{}");
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              onChange(parsed as Record<string, unknown>);
              setError(null);
            } else {
              setError("Expected a JSON object.");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
          }
        }}
        className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-400">
          No structured form available for{" "}
          <span className="font-mono">{step.ui_component ?? "this step"}</span>{" "}
          yet — edit the JSON payload directly.
        </p>
      )}
    </div>
  );
}

function StepTypeBadge({ step }: { step: WorkflowStepDef }) {
  if (step.step_type === StepType.Manual) {
    return (
      <Badge variant="secondary" className="gap-1">
        <ListChecks className="h-3 w-3" /> Manual
      </Badge>
    );
  }
  if (step.step_type === StepType.Automatic) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Sparkles className="h-3 w-3" /> Automatic
      </Badge>
    );
  }
  if (step.step_type === StepType.Conditional) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Cog className="h-3 w-3" /> Conditional
      </Badge>
    );
  }
  return <Badge variant="secondary">{step.step_type}</Badge>;
}

function ComponentMeta({ step }: { step: WorkflowStepDef }) {
  const items: { label: string; value?: string }[] = [
    { label: "UI Component", value: step.ui_component },
    { label: "Automatic Component", value: step.automatic_component },
    { label: "Conditional Component", value: step.conditional_component },
  ];
  const visible = items.filter((i) => i.value);
  if (visible.length === 0) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3 text-xs">
      <p className="mb-1 font-medium text-slate-600">Component bindings</p>
      <dl className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        {visible.map((i) => (
          <div key={i.label} className="flex flex-col">
            <dt className="text-slate-400">{i.label}</dt>
            <dd className="font-mono text-slate-800">{i.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
