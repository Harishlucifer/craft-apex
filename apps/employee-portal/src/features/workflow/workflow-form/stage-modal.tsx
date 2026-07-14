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
import type { RuleRow, WorkflowStage } from "./workflow-form.types";

const schema = z.object({
  name: z.string().min(3, "Name should be more than 3 characters"),
  description: z.string().optional(),
  allocationRuleID: z.string().optional(),
  validationRuleID: z.string().optional(),
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
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  open: boolean;
  initial?: WorkflowStage;
  rules: RuleRow[];
  onCancel: () => void;
  onSubmit: (stage: WorkflowStage) => void;
}

export function StageModal({ open, initial, rules, onCancel, onSubmit }: Props) {
  const defaults: FormValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      allocationRuleID:
        initial?.allocation_rule_id != null
          ? String(initial.allocation_rule_id)
          : "",
      validationRuleID:
        initial?.validation_rule_id != null
          ? String(initial.validation_rule_id)
          : "",
      configuration:
        initial?.configuration != null
          ? JSON.stringify(initial.configuration, null, 2)
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

  const submit = handleSubmit((v) => {
    onSubmit({
      ...(initial?.id
        ? { id: initial.id }
        : { id: String(Date.now()), isNew: true }),
      sequence: initial?.sequence ?? 1,
      name: v.name,
      description: v.description,
      allocation_rule_id: v.allocationRuleID || undefined,
      validation_rule_id: v.validationRuleID || undefined,
      configuration: v.configuration ? JSON.parse(v.configuration) : {},
      status: Number(v.status),
      steps: initial?.steps ?? [],
    });
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial?.id ? "Edit Stage" : "Add Stage"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Input {...register("description")} />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          </div>
          <Field
            label="Configuration (JSON)"
            error={errors.configuration?.message}
          >
            <textarea
              rows={4}
              {...register("configuration")}
              className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            />
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
