import { useMemo } from "react";
import { Button } from "@craft-apex/ui";
import { FormBuilderRenderer } from "../form-builder-renderer";
import type { FormDefinition } from "../form-builder.types";
import { registerStepComponent, type StepComponentProps } from "../step-component-registry";

export interface FormBuilderStepContext {
  /** Called instead of `onNext` — submission is an async save with a
   * domain-specific payload shape, so the page owns that logic and is
   * responsible for advancing the step itself once the save succeeds. */
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  cancelHref?: string;
  /** Force `disabled: true` on this field once `lockWhen` is truthy (e.g.
   * an id-once-editing field like employee_code/loan_code). FormFieldDef
   * has no "disabled on edit" concept in the schema itself. */
  lockField?: string;
  lockWhen?: unknown;
}

function FormBuilderStep({ step, value, onChange, onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<FormBuilderStepContext>;
  const base = (
    step.configuration as { form_builder?: FormDefinition } | undefined
  )?.form_builder;

  const formJson = useMemo<FormDefinition | undefined>(() => {
    if (!base) return undefined;
    if (!ctx.lockField || !ctx.lockWhen) return base;
    const lockField = ctx.lockField;
    const lock = (fields: FormDefinition["fields"]) =>
      fields?.map((f) => (f.name === lockField ? { ...f, disabled: true } : f));
    return {
      ...base,
      fields: lock(base.fields),
      sections: base.sections?.map((s) => ({
        ...s,
        fields: lock(s.fields) ?? s.fields,
      })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, ctx.lockField, ctx.lockWhen]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {formJson ? (
        <FormBuilderRenderer formJson={formJson} value={value} onChange={onChange} />
      ) : (
        <p className="text-sm text-slate-500">
          This step has no form_builder configuration.
        </p>
      )}

    </div>
  );
}

registerStepComponent("FORM_BUILDER", FormBuilderStep);
