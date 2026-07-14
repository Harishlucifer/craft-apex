import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import { useWorkflowComponents } from "./workflow-form.api";
import {
  DISPLAY_MODES,
  STEP_TYPES,
  type ComponentOption,
  type RuleRow,
  type WorkflowStep,
} from "./workflow-form.types";

const schema = z
  .object({
    code: z.string().optional(),
    name: z.string().min(3, "Name should be more than 3 characters"),
    description: z.string().optional(),
    stepType: z.string().min(1, "Step type is required"),
    displayMode: z.string().min(1, "Display Mode is required"),
    uiComponent: z.string().optional(),
    automaticComponent: z.string().optional(),
    conditionalComponent: z.string().optional(),
    allocationRuleID: z.string().optional(),
    validationRuleID: z.string().optional(),
    preConditionRuleID: z.string().optional(),
    field_master_id: z.string().optional(),
    configuration: z
      .string()
      .optional()
      .refine(
        (v) => {
          if (!v) return true;
          try {
            JSON.parse(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Must be valid JSON" }
      ),
    allocation_configuration: z
      .string()
      .optional()
      .refine(
        (v) => {
          if (!v) return true;
          try {
            JSON.parse(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Must be valid JSON" }
      ),
    status: z.coerce.number().int(),
  })
  .superRefine((v, ctx) => {
    if (v.stepType === "MANUAL" && !v.uiComponent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["uiComponent"],
        message: "UI Component is required",
      });
    }
    if (v.stepType === "AUTOMATIC" && !v.automaticComponent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["automaticComponent"],
        message: "Automatic Component is required",
      });
    }
    if (v.stepType === "CONDITIONAL" && !v.conditionalComponent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["conditionalComponent"],
        message: "Conditional Component is required",
      });
    }
  });
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  open: boolean;
  initial?: WorkflowStep;
  stageId: string | number;
  rules: RuleRow[];
  fieldComponents: ComponentOption[];
  onCancel: () => void;
  onSubmit: (step: WorkflowStep) => void;
}

export function StepModal({
  open,
  initial,
  stageId,
  rules,
  fieldComponents,
  onCancel,
  onSubmit,
}: Props) {
  const defaults: FormValues = useMemo(
    () => ({
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      stepType: initial?.step_type ?? "",
      displayMode: initial?.display_mode ?? "",
      uiComponent: initial?.ui_component ?? "",
      automaticComponent: initial?.automatic_component ?? "",
      conditionalComponent: initial?.conditional_component ?? "",
      allocationRuleID:
        initial?.allocation_rule_id != null
          ? String(initial.allocation_rule_id)
          : "",
      validationRuleID:
        initial?.validation_rule_id != null
          ? String(initial.validation_rule_id)
          : "",
      preConditionRuleID:
        initial?.completion_rule_id != null
          ? String(initial.completion_rule_id)
          : "",
      field_master_id:
        initial?.field_master_id != null
          ? String(initial.field_master_id)
          : "",
      configuration:
        initial?.configuration != null
          ? JSON.stringify(initial.configuration, null, 2)
          : "{}",
      allocation_configuration:
        initial?.allocation_configuration != null
          ? JSON.stringify(initial.allocation_configuration, null, 2)
          : "{}",
      status: initial?.status != null ? Number(initial.status) : 1,
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const stepType = watch("stepType");
  const { data: stepTypeComponents = [] } = useWorkflowComponents(stepType);

  const submit = handleSubmit((v) => {
    onSubmit({
      ...(initial?.id
        ? { id: initial.id }
        : { id: String(Date.now()), isNew: true }),
      stage_id: initial?.stage_id ?? stageId,
      workflow_id: initial?.workflow_id,
      field_master_id: v.field_master_id || null,
      code: v.code,
      name: v.name,
      description: v.description,
      step_type: v.stepType,
      display_mode: v.displayMode,
      ui_component: v.uiComponent,
      automatic_component: v.automaticComponent,
      conditional_component: v.conditionalComponent,
      allocation_rule_id: v.allocationRuleID || undefined,
      validation_rule_id: v.validationRuleID || undefined,
      completion_rule_id: v.preConditionRuleID || undefined,
      configuration: v.configuration ? JSON.parse(v.configuration) : {},
      allocation_configuration: v.allocation_configuration
        ? JSON.parse(v.allocation_configuration)
        : {},
      status: Number(v.status),
    });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Step" : "Add Step"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Code">
              <Input {...register("code")} />
            </Field>
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Step Type *" error={errors.stepType?.message}>
              <select
                className={selectClass}
                value={watch("stepType")}
                onChange={(e) =>
                  setValue("stepType", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {STEP_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Display Mode *" error={errors.displayMode?.message}>
              <select
                className={selectClass}
                value={watch("displayMode")}
                onChange={(e) =>
                  setValue("displayMode", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {DISPLAY_MODES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status *" error={errors.status?.message}>
              <select
                className={selectClass}
                value={String(watch("status") ?? "")}
                onChange={(e) =>
                  setValue("status", Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
              >
                <option value="1">Active</option>
                <option value="-1">Inactive</option>
              </select>
            </Field>

            <Field label="Field Master (UI Component)">
              <select
                className={selectClass}
                value={watch("field_master_id") ?? ""}
                onChange={(e) => setValue("field_master_id", e.target.value)}
              >
                <option value="">— None —</option>
                {fieldComponents.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-3">
              <Field label="Description" error={errors.description?.message}>
                <Input {...register("description")} />
              </Field>
            </div>
          </div>

          {stepType === "MANUAL" && (
            <Field
              label="UI Component *"
              error={errors.uiComponent?.message}
            >
              <select
                className={selectClass}
                value={watch("uiComponent") ?? ""}
                onChange={(e) =>
                  setValue("uiComponent", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {stepTypeComponents.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {stepType === "AUTOMATIC" && (
            <Field
              label="Automatic Component *"
              error={errors.automaticComponent?.message}
            >
              <select
                className={selectClass}
                value={watch("automaticComponent") ?? ""}
                onChange={(e) =>
                  setValue("automaticComponent", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {stepTypeComponents.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {stepType === "CONDITIONAL" && (
            <Field
              label="Conditional Component *"
              error={errors.conditionalComponent?.message}
            >
              <select
                className={selectClass}
                value={watch("conditionalComponent") ?? ""}
                onChange={(e) =>
                  setValue("conditionalComponent", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {stepTypeComponents.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Allocation Rule">
              <select
                className={selectClass}
                value={watch("allocationRuleID") ?? ""}
                onChange={(e) => setValue("allocationRuleID", e.target.value)}
              >
                <option value="">— None —</option>
                {rules.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Validation Rule">
              <select
                className={selectClass}
                value={watch("validationRuleID") ?? ""}
                onChange={(e) => setValue("validationRuleID", e.target.value)}
              >
                <option value="">— None —</option>
                {rules.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pre-condition Rule">
              <select
                className={selectClass}
                value={watch("preConditionRuleID") ?? ""}
                onChange={(e) => setValue("preConditionRuleID", e.target.value)}
              >
                <option value="">— None —</option>
                {rules.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              label="Configuration (JSON)"
              error={errors.configuration?.message}
            >
              <textarea
                rows={3}
                {...register("configuration")}
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
            </Field>
            <Field
              label="Allocation Configuration (JSON)"
              error={errors.allocation_configuration?.message}
            >
              <textarea
                rows={3}
                {...register("allocation_configuration")}
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{initial?.id ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
