import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import type {
  LenderLoanTypeRow,
  LoanTypeMasterOption,
} from "./lender-form.types";

// Legacy AddLenderLoanType modal — no Yup beyond presence; we mark loan type required.
const schema = z.object({
  loanType: z.string().min(1, "Loan type is required"),
  status_fetch_method: z.string().optional(),
  payout_cycle_start_date: z.string().optional(),
  payout_cycle_end_date: z.string().optional(),
  payout_dump: z.string().optional(),
  rm: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

interface Props {
  loanTypeOptions: LoanTypeMasterOption[];
  rows: LenderLoanTypeRow[];
  onChange: (next: LenderLoanTypeRow[]) => void;
}

export function LenderLoanTypesPanel({
  loanTypeOptions,
  rows,
  onChange,
}: Props) {
  const [editing, setEditing] = useState<{
    row?: LenderLoanTypeRow;
    index?: number;
  } | null>(null);

  const codeLabel = (code?: string) =>
    loanTypeOptions.find((l) => l.code === code)?.name ?? code ?? "—";

  const applyRow = (data: LenderLoanTypeRow) => {
    if (editing?.index != null) {
      onChange(rows.map((r, i) => (i === editing.index ? data : r)));
    } else {
      onChange([...rows, data]);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => (
          <div
            key={`${row.loanType ?? row.loan_type_id ?? "row"}-${i}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Badge variant={row.status === 1 ? "success" : "destructive"}>
                {row.status === 1 ? "Active" : "Inactive"}
              </Badge>
              <button
                type="button"
                onClick={() => setEditing({ row, index: i })}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                aria-label="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">
                {codeLabel(row.loanType)}
              </p>
              {row.payout_cycle_start_date && (
                <p className="text-xs text-slate-500">
                  Cycle: {row.payout_cycle_start_date} →{" "}
                  {row.payout_cycle_end_date || "—"}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEditing({})}
          className="flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-4 text-sm font-medium text-slate-600 hover:border-[#4C7DF0] hover:text-[#4C7DF0]"
        >
          <Plus className="h-5 w-5" />
          Add Lender Loan Type
        </button>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.row ? "Update Loan Type" : "Add Lender Loan-Type"}
            </DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <LenderLoanTypeForm
              loanTypeOptions={loanTypeOptions}
              initial={editing.row}
              onCancel={() => setEditing(null)}
              onSubmit={applyRow}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LenderLoanTypeForm({
  loanTypeOptions,
  initial,
  onCancel,
  onSubmit,
}: {
  loanTypeOptions: LoanTypeMasterOption[];
  initial?: LenderLoanTypeRow;
  onCancel: () => void;
  onSubmit: (row: LenderLoanTypeRow) => void;
}) {
  const defaults: FormValues = useMemo(
    () => ({
      loanType: initial?.loanType ?? "",
      status_fetch_method: initial?.status_fetch_method ?? "",
      payout_cycle_start_date: initial?.payout_cycle_start_date ?? "",
      payout_cycle_end_date: initial?.payout_cycle_end_date ?? "",
      payout_dump:
        initial?.payout_dump != null ? String(initial.payout_dump) : "",
      rm: initial?.rm != null ? String(initial.rm) : "",
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

  const submit = handleSubmit((values) => {
    onSubmit({
      loan_type_id: initial?.loan_type_id,
      loanType: values.loanType,
      status_fetch_method: values.status_fetch_method,
      payout_cycle_start_date: values.payout_cycle_start_date,
      payout_cycle_end_date: values.payout_cycle_end_date,
      payout_dump: values.payout_dump,
      rm: values.rm,
      status: Number(values.status),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Loan Type *" error={errors.loanType?.message}>
          <select
            className={selectClass}
            value={watch("loanType")}
            onChange={(e) =>
              setValue("loanType", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select</option>
            {loanTypeOptions.map((o) => (
              <option key={String(o.code)} value={o.code}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status Fetch Method">
          <Input {...register("status_fetch_method")} />
        </Field>

        <Field label="Payout Cycle Start Date">
          <Input type="date" {...register("payout_cycle_start_date")} />
        </Field>

        <Field label="Payout Cycle End Date">
          <Input type="date" {...register("payout_cycle_end_date")} />
        </Field>

        <Field label="Is Payout Dump Available">
          <select
            className={selectClass}
            value={watch("payout_dump") ?? ""}
            onChange={(e) => setValue("payout_dump", e.target.value)}
          >
            <option value="">Select</option>
            {YES_NO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Is Relationship Manager Needed">
          <select
            className={selectClass}
            value={watch("rm") ?? ""}
            onChange={(e) => setValue("rm", e.target.value)}
          >
            <option value="">Select</option>
            {YES_NO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <div className="flex items-center gap-4 pt-1.5">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={watch("status") === 1}
                onChange={() =>
                  setValue("status", 1, { shouldValidate: true })
                }
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={watch("status") === -1}
                onChange={() =>
                  setValue("status", -1, { shouldValidate: true })
                }
              />
              In-Active
            </label>
          </div>
        </Field>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Add"}</Button>
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
