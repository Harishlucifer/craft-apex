import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, Pencil, Plus } from "lucide-react";
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
import type { SubLoanRow } from "./loan-type-form.types";

// Legacy AddSubLoanType Yup → zod (modal form).
const schema = z.object({
  sub_loan_type_id: z.union([z.string(), z.number()]).optional(),
  loan_type_id: z.union([z.string(), z.number()]).optional(),
  sub_loan_type_code: z.string().optional(),
  sub_loan: z
    .string()
    .min(1, "Sub-Loan type name is required")
    .max(30, "Too Long! Should be less than 30 characters"),
  description: z
    .string()
    .max(256, "Too Long! Should be less than 256 characters")
    .optional(),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence is required" })
    .int(),
  facility_code: z.string().min(1, "Facility Code is required"),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

interface Props {
  facilityOptions: { value: string; label: string }[];
  rows: SubLoanRow[];
  onChange: (next: SubLoanRow[]) => void;
}

export function SubLoanTypesPanel({ facilityOptions, rows, onChange }: Props) {
  const [editing, setEditing] = useState<{ row?: SubLoanRow; index?: number } | null>(
    null
  );
  const [viewing, setViewing] = useState<SubLoanRow | null>(null);

  const handleAdd = () => setEditing({});
  const handleEdit = (row: SubLoanRow, index: number) =>
    setEditing({ row, index });

  const applyRow = (data: SubLoanRow) => {
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
            key={`${String(row.sub_loan_type_id ?? row.sub_loan_type_code ?? row.sub_loan)}-${i}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Badge variant={row.status === 1 ? "success" : "destructive"}>
                {row.status === 1 ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewing(row)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                  aria-label="View"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(row, i)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                Code:{" "}
                <span className="font-mono text-[11px] text-slate-700">
                  {row.sub_loan_type_code || "—"}
                </span>
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {row.sub_loan}
              </p>
              {row.description && (
                <p className="line-clamp-2 text-xs text-slate-500">
                  {row.description}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="flex min-h-[6.5rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-4 text-sm font-medium text-slate-600 hover:border-[#4C7DF0] hover:text-[#4C7DF0]"
        >
          <Plus className="h-5 w-5" />
          Add Sub Loan Type
        </button>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.row ? "Update Sub-Loan Type" : "Add Sub-Loan Type"}
            </DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <SubLoanForm
              facilityOptions={facilityOptions}
              initial={editing.row}
              onCancel={() => setEditing(null)}
              onSubmit={applyRow}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewing !== null}
        onOpenChange={(o) => !o && setViewing(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sub-Loan Type</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row label="Code" value={viewing.sub_loan_type_code || "—"} />
              <Row label="Name" value={viewing.sub_loan} />
              <Row label="Description" value={viewing.description || "—"} />
              <Row label="Sequence" value={String(viewing.sequence ?? "—")} />
              <Row
                label="Facility Code"
                value={
                  facilityOptions.find((o) => o.value === viewing.facility_code)
                    ?.label ?? viewing.facility_code
                }
              />
              <Row
                label="Status"
                value={viewing.status === 1 ? "Active" : "Inactive"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubLoanForm({
  facilityOptions,
  initial,
  onCancel,
  onSubmit,
}: {
  facilityOptions: { value: string; label: string }[];
  initial?: SubLoanRow;
  onCancel: () => void;
  onSubmit: (data: SubLoanRow) => void;
}) {
  const defaults: FormValues = useMemo(
    () => ({
      sub_loan_type_id: initial?.sub_loan_type_id,
      loan_type_id: initial?.loan_type_id,
      sub_loan_type_code: initial?.sub_loan_type_code ?? "",
      sub_loan: initial?.sub_loan ?? "",
      description: initial?.description ?? "",
      sequence: Number(initial?.sequence ?? 0),
      facility_code: initial?.facility_code ?? "",
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
      sub_loan_type_id: values.sub_loan_type_id,
      loan_type_id: values.loan_type_id,
      sub_loan_type_code: values.sub_loan_type_code,
      sub_loan: values.sub_loan,
      description: values.description,
      sequence: Number(values.sequence),
      facility_code: values.facility_code,
      status: Number(values.status),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Code">
          <Input disabled {...register("sub_loan_type_code")} />
        </Field>
        <Field label="Name *" error={errors.sub_loan?.message}>
          <Input maxLength={30} {...register("sub_loan")} />
        </Field>
        <Field label="Description" error={errors.description?.message}>
          <Input maxLength={256} {...register("description")} />
        </Field>
        <Field label="Sequence *" error={errors.sequence?.message}>
          <Input type="number" {...register("sequence")} />
        </Field>
        <Field label="Facility Code *" error={errors.facility_code?.message}>
          <select
            className={selectClass}
            value={watch("facility_code")}
            onChange={(e) =>
              setValue("facility_code", e.target.value, {
                shouldValidate: true,
              })
            }
          >
            <option value="">Select</option>
            {facilityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status *" error={errors.status?.message}>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-1.5 last:border-b-0">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-400">:</span>
      <span className="text-slate-800">{value}</span>
    </div>
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
