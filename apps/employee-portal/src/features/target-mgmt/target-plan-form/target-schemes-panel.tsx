import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  useLenderOptions,
  useLoanTypeOptions,
  useSaveTargetPlan,
  useTargetPlanLookups,
} from "./target-plan-form.api";
import {
  TARGET_ATTRIBUTE_SUB_TYPE,
  type TargetPlanDetail,
  type TargetSchemeRow,
} from "./target-plan-form.types";

interface Props {
  plan: TargetPlanDetail;
}

const schema = z.object({
  target_scheme_id: z.union([z.string(), z.number()]).optional(),
  target_type: z.string().min(1, "Target Type is required"),
  target_attribute: z.string().min(1, "Target Attribute is required"),
  target_sub_type: z.string().min(1, "Target Sub Type is required"),
  target_period: z.string().min(1, "Target period is required"),
  target_value: z.coerce
    .number({ invalid_type_error: "Target Value is required" })
    .gt(0, "Target Value must be greater than 0"),
  loan_type_id: z.string().optional(),
  lender_id: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

export function TargetSchemesPanel({ plan }: Props) {
  const qc = useQueryClient();
  const save = useSaveTargetPlan();

  const { data: lookups = [] } = useTargetPlanLookups();
  const { data: loanTypes = [] } = useLoanTypeOptions();
  const { data: lenders = [] } = useLenderOptions();

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      targetType: filter("TARGET_TYPE"),
      targetAttributes: filter("TARGET_ATTRIBUTES"),
      targetPeriod: filter("TARGET_PERIOD"),
    };
  }, [lookups]);

  const [editing, setEditing] = useState<TargetSchemeRow | null | undefined>(
    undefined
  );
  // undefined = closed, null = add new, row = edit

  const schemes = plan.target_schemes ?? [];

  const labelFor = (
    list: { value: string; label: string }[],
    value: string | undefined
  ) => list.find((o) => o.value === value)?.label ?? value ?? "—";

  const loanTypeLabel = (id?: string | number | null) => {
    if (id == null) return "—";
    return (
      loanTypes.find((l) => String(l.id) === String(id))?.name ?? String(id)
    );
  };

  const lenderLabel = (id?: string | number | null) => {
    if (id == null) return "—";
    return (
      lenders.find((l) => String(l.lender_id) === String(id))?.name ?? String(id)
    );
  };

  const persist = async (
    row: TargetSchemeRow,
    successMessage: string
  ) => {
    // Legacy posts the WHOLE plan back, replacing target_schemes with a one-item
    // array containing the row being upserted (delete = same row with status -1).
    // Backend treats target_scheme_id as the upsert key.
    const payload = {
      ...plan,
      user_role: plan.user_role != null ? String(plan.user_role) : undefined,
      target_schemes: [row],
    };
    try {
      await save.mutateAsync(payload);
      toast.success(successMessage);
      qc.invalidateQueries({ queryKey: ["target-plan-detail"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const handleDelete = async (row: TargetSchemeRow) => {
    await persist({ ...row, status: -1 }, "Scheme Deleted Successfully");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Assign Targets
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-xs font-medium text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">Attribute</th>
              <th className="px-3 py-2 text-left">Target Type</th>
              <th className="px-3 py-2 text-left">Sub Type</th>
              <th className="px-3 py-2 text-left">Period</th>
              <th className="px-3 py-2 text-right">Value</th>
              <th className="px-3 py-2 text-left">Loan Type</th>
              <th className="px-3 py-2 text-left">Lender</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schemes.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-xs text-slate-400"
                >
                  No targets assigned yet.
                </td>
              </tr>
            ) : (
              schemes.map((r, i) => (
                <tr
                  key={`${String(r.target_scheme_id ?? r.target_attribute)}-${i}`}
                  className="border-t border-slate-100 hover:bg-slate-50/40"
                >
                  <td className="px-3 py-2">
                    {labelFor(options.targetAttributes, r.target_attribute)}
                  </td>
                  <td className="px-3 py-2">
                    {labelFor(options.targetType, r.target_type)}
                  </td>
                  <td className="px-3 py-2">{r.target_sub_type ?? "—"}</td>
                  <td className="px-3 py-2">
                    {labelFor(options.targetPeriod, r.target_period)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {r.target_value ?? "—"}
                  </td>
                  <td className="px-3 py-2">{loanTypeLabel(r.loan_type_id)}</td>
                  <td className="px-3 py-2">{lenderLabel(r.lender_id)}</td>
                  <td className="px-3 py-2">
                    <Badge variant={r.status === 1 ? "success" : "destructive"}>
                      {r.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Target" : "Add Targets"}
            </DialogTitle>
          </DialogHeader>
          {editing !== undefined && (
            <TargetSchemeForm
              initial={editing}
              options={options}
              loanTypes={loanTypes}
              lenders={lenders}
              saving={save.isPending}
              onCancel={() => setEditing(undefined)}
              onSubmit={async (row) => {
                await persist(row, "Target scheme saved successfully");
                setEditing(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TargetSchemeForm({
  initial,
  options,
  loanTypes,
  lenders,
  saving,
  onCancel,
  onSubmit,
}: {
  initial: TargetSchemeRow | null;
  options: {
    targetType: { value: string; label: string }[];
    targetAttributes: { value: string; label: string }[];
    targetPeriod: { value: string; label: string }[];
  };
  loanTypes: { id: string | number; name: string }[];
  lenders: { lender_id: string | number; name: string }[];
  saving: boolean;
  onCancel: () => void;
  onSubmit: (row: TargetSchemeRow) => void;
}) {
  const defaults: FormValues = useMemo(
    () => ({
      target_scheme_id: initial?.target_scheme_id,
      target_type: initial?.target_type ?? "",
      target_attribute: initial?.target_attribute ?? "",
      target_sub_type: initial?.target_sub_type ?? "",
      target_period: initial?.target_period ?? "",
      target_value:
        initial?.target_value != null ? Number(initial.target_value) : 0,
      loan_type_id:
        initial?.loan_type_id != null ? String(initial.loan_type_id) : "",
      lender_id: initial?.lender_id != null ? String(initial.lender_id) : "",
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

  const attribute = watch("target_attribute");
  useEffect(() => {
    const sub = attribute ? TARGET_ATTRIBUTE_SUB_TYPE[attribute] : "";
    setValue("target_sub_type", sub ?? "", { shouldValidate: true });
  }, [attribute, setValue]);

  const submit = handleSubmit((values) => {
    onSubmit({
      target_scheme_id: values.target_scheme_id,
      target_type: values.target_type,
      target_attribute: values.target_attribute,
      target_sub_type: values.target_sub_type,
      target_period: values.target_period,
      target_value: String(values.target_value),
      loan_type_id: values.loan_type_id || null,
      lender_id: values.lender_id || null,
      status: Number(values.status),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Target Type *" error={errors.target_type?.message}>
        <select
          className={selectClass}
          value={watch("target_type")}
          onChange={(e) =>
            setValue("target_type", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select Type</option>
          {options.targetType.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Target Attribute *"
        error={errors.target_attribute?.message}
      >
        <select
          className={selectClass}
          value={watch("target_attribute")}
          onChange={(e) =>
            setValue("target_attribute", e.target.value, {
              shouldValidate: true,
            })
          }
        >
          <option value="">Select Attribute</option>
          {options.targetAttributes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Target Sub Type *"
        error={errors.target_sub_type?.message}
      >
        <Input
          value={watch("target_sub_type") ?? ""}
          disabled
          placeholder="Auto-populated based on attribute"
        />
      </Field>

      <Field label="Target Period *" error={errors.target_period?.message}>
        <select
          className={selectClass}
          value={watch("target_period")}
          onChange={(e) =>
            setValue("target_period", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select Period</option>
          {options.targetPeriod.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Target Value *" error={errors.target_value?.message}>
        <Input type="number" {...register("target_value")} />
      </Field>

      <Field label="Loan Type">
        <select
          className={selectClass}
          value={watch("loan_type_id") ?? ""}
          onChange={(e) => setValue("loan_type_id", e.target.value)}
        >
          <option value="">— Any —</option>
          {loanTypes.map((l) => (
            <option key={String(l.id)} value={String(l.id)}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Lender">
        <select
          className={selectClass}
          value={watch("lender_id") ?? ""}
          onChange={(e) => setValue("lender_id", e.target.value)}
        >
          <option value="">— Any —</option>
          {lenders.map((l) => (
            <option key={String(l.lender_id)} value={String(l.lender_id)}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Status">
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
          <option value="-1">In-active</option>
        </select>
      </Field>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial?.target_scheme_id ? "Save" : "Add Target"}
        </Button>
      </div>
    </form>
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
