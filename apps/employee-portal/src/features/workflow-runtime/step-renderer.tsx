import { useEffect, useMemo, useState } from "react";
import { Cog, Sparkles, ListChecks } from "lucide-react";
import { Badge, Label } from "@craft-apex/ui";
import { FormBuilderRenderer } from "./form-builder-renderer";
import type { FormBuilderStepConfiguration } from "./form-builder.types";
import { StepType, type WorkflowStepDef } from "./workflow-runtime.types";

interface Props {
  step: WorkflowStepDef;
  /** Step output (sent into executeWorkflow / saved per step). */
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

/**
 * Step renderer.
 *
 * When `step.ui_component === "FORM_BUILDER"` and the step ships a
 * `configuration.form_builder` definition, render the structured form
 * (matches legacy <DynamicForm formJson={…}/> behavior — see
 * craft-frontend/src/Components/Common/StepComponentLoader.js, case "FORM_BUILDER").
 *
 * Other ui_component values map to ~200 specialized step screens in legacy
 * (LEAD_VERIFICATION, BASIC_DETAILS, BANK_DETAILS, PROPERTY_DETAILS, etc.).
 * Those each need their own port; for now they fall back to a raw-JSON editor
 * so the workflow stays round-trippable.
 */
export function StepRenderer({ step, value, onChange }: Props) {
  const formBuilder = useMemo<
    FormBuilderStepConfiguration["form_builder"] | undefined
  >(() => {
    const config = step.configuration as FormBuilderStepConfiguration | null;
    return config?.form_builder;
  }, [step]);

  const useStructured =
    step.ui_component === "FORM_BUILDER" && formBuilder != null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <StepTypeBadge step={step} />
        {step.code && (
          <span className="font-mono text-xs text-slate-500">{step.code}</span>
        )}
        {step.display_mode && (
          <Badge variant="secondary">{step.display_mode}</Badge>
        )}
      </div>

      {step.description && (
        <p className="text-sm text-slate-600">{step.description}</p>
      )}

      <ComponentMeta step={step} />

      {useStructured ? (
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
