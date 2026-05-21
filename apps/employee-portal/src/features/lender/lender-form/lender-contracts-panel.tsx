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
import {
  LINK_TYPE_STATIC,
  type LenderContractRow,
  type LoanTypeMasterOption,
} from "./lender-form.types";

// Legacy AddLenderContract Yup → zod.
const schema = z
  .object({
    lender_contract_id: z.union([z.string(), z.number()]).optional(),
    loan_type_id: z.string().min(1, "Loan Type is required"),
    loan_type_name: z.string().optional(),
    contract_type: z.string().optional(),
    apply_method: z.string().optional(),
    apply_method_name: z.string().optional(),
    status_fetch_method: z.string().optional(),
    status_fetch_method_name: z.string().optional(),
    payout_cycle_start_date: z.string().optional(),
    payout_cycle_end_date: z.string().optional(),
    payout_dump: z.string().optional(),
    rm: z.string().optional(),
    contact_name: z.string().optional(),
    contact_mobile: z.string().optional(),
    contact_email: z.string().optional(),
    contact_address: z.string().optional(),
    terms_and_condition: z.string().optional(),
    link_type: z.string().optional(),
    link: z.string().optional(),
    pincode_rule: z
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
        { message: "Pincode rule must be valid JSON" }
      ),
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
        { message: "Configuration must be valid JSON" }
      ),
    income_eligible: z
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
        { message: "Income eligible must be valid JSON" }
      ),
    status: z.coerce.number().int(),
  })
  .superRefine((v, ctx) => {
    // Legacy: when link_type === STATIC, link is required.
    if (v.link_type === LINK_TYPE_STATIC && !v.link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["link"],
        message: "Link is required",
      });
    }
  });
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const YES_NO = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

interface Props {
  loanTypeOptions: LoanTypeMasterOption[];
  applyMethodOptions: { value: string; label: string }[];
  statusFetchMethodOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  linkTypeOptions: { value: string; label: string }[];
  rows: LenderContractRow[];
  onChange: (next: LenderContractRow[]) => void;
}

export function LenderContractsPanel({
  loanTypeOptions,
  applyMethodOptions,
  statusFetchMethodOptions,
  contractTypeOptions,
  linkTypeOptions,
  rows,
  onChange,
}: Props) {
  const [editing, setEditing] = useState<{
    row?: LenderContractRow;
    index?: number;
  } | null>(null);
  const [viewing, setViewing] = useState<LenderContractRow | null>(null);

  const loanTypeLabel = (id?: string | number) => {
    if (id == null) return "—";
    return (
      loanTypeOptions.find((l) => String(l.id) === String(id))?.name ?? String(id)
    );
  };

  const applyRow = (data: LenderContractRow) => {
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
            key={`${String(row.lender_contract_id ?? row.loan_type_id)}-${i}`}
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
                  onClick={() => setEditing({ row, index: i })}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">
                {row.loan_type_name ?? loanTypeLabel(row.loan_type_id)}
              </p>
              {row.contact_name && (
                <p className="text-xs text-slate-500">
                  Contact: {row.contact_name}
                </p>
              )}
              {row.contact_mobile && (
                <p className="text-xs text-slate-400">{row.contact_mobile}</p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEditing({})}
          className="flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-4 text-sm font-medium text-slate-600 hover:border-[#4C7DF0] hover:text-[#4C7DF0]"
        >
          <Plus className="h-5 w-5" />
          Add Lender Contract
        </button>
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.row ? "Update Contract" : "Add Lender Contract"}
            </DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <ContractForm
              loanTypeOptions={loanTypeOptions}
              applyMethodOptions={applyMethodOptions}
              statusFetchMethodOptions={statusFetchMethodOptions}
              contractTypeOptions={contractTypeOptions}
              linkTypeOptions={linkTypeOptions}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Lender Contract</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <Row
                label="Loan Type"
                value={viewing.loan_type_name ?? loanTypeLabel(viewing.loan_type_id)}
              />
              <Row label="Contract Type" value={viewing.contract_type ?? "—"} />
              <Row label="Apply Method" value={viewing.apply_method ?? "—"} />
              <Row
                label="Status Fetch Method"
                value={viewing.status_fetch_method ?? "—"}
              />
              <Row label="Link Type" value={viewing.link_type ?? "—"} />
              <Row label="Link" value={viewing.link ?? "—"} />
              <Row label="Contact" value={viewing.contact_name ?? "—"} />
              <Row label="Mobile" value={viewing.contact_mobile ?? "—"} />
              <Row label="Email" value={viewing.contact_email ?? "—"} />
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

function ContractForm({
  loanTypeOptions,
  applyMethodOptions,
  statusFetchMethodOptions,
  contractTypeOptions,
  linkTypeOptions,
  initial,
  onCancel,
  onSubmit,
}: {
  loanTypeOptions: LoanTypeMasterOption[];
  applyMethodOptions: { value: string; label: string }[];
  statusFetchMethodOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  linkTypeOptions: { value: string; label: string }[];
  initial?: LenderContractRow;
  onCancel: () => void;
  onSubmit: (row: LenderContractRow) => void;
}) {
  const defaults: FormValues = useMemo(
    () => ({
      lender_contract_id: initial?.lender_contract_id,
      loan_type_id:
        initial?.loan_type_id != null ? String(initial.loan_type_id) : "",
      loan_type_name: initial?.loan_type_name ?? "",
      contract_type: initial?.contract_type ?? "",
      apply_method: initial?.apply_method ?? "",
      apply_method_name: initial?.apply_method_name ?? "",
      status_fetch_method: initial?.status_fetch_method ?? "",
      status_fetch_method_name: initial?.status_fetch_method_name ?? "",
      payout_cycle_start_date: initial?.payout_cycle_start_date ?? "",
      payout_cycle_end_date: initial?.payout_cycle_end_date ?? "",
      payout_dump:
        initial?.payout_dump != null ? String(initial.payout_dump) : "1",
      rm: initial?.rm ?? "",
      contact_name: initial?.contact_name ?? "",
      contact_mobile: initial?.contact_mobile ?? "",
      contact_email: initial?.contact_email ?? "",
      contact_address: initial?.contact_address ?? "",
      terms_and_condition: initial?.terms_and_condition ?? "",
      link_type: initial?.link_type ?? "",
      link: initial?.link ?? "",
      pincode_rule:
        initial?.pincode_rule != null
          ? JSON.stringify(initial.pincode_rule)
          : "{}",
      configuration:
        initial?.configuration != null
          ? JSON.stringify(initial.configuration)
          : "{}",
      income_eligible:
        initial?.income_eligible != null
          ? JSON.stringify(initial.income_eligible)
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

  const submit = handleSubmit((values) => {
    const loanType = loanTypeOptions.find(
      (l) => String(l.id) === values.loan_type_id
    );
    const apply = applyMethodOptions.find(
      (o) => o.value === values.apply_method
    );
    const statusFetch = statusFetchMethodOptions.find(
      (o) => o.value === values.status_fetch_method
    );
    onSubmit({
      lender_contract_id: values.lender_contract_id,
      loan_type_id: values.loan_type_id,
      loan_type_name: loanType?.name ?? values.loan_type_name,
      contract_type: values.contract_type,
      apply_method: values.apply_method,
      apply_method_name: apply?.label ?? values.apply_method_name,
      status_fetch_method: values.status_fetch_method,
      status_fetch_method_name:
        statusFetch?.label ?? values.status_fetch_method_name,
      payout_cycle_start_date: values.payout_cycle_start_date,
      payout_cycle_end_date: values.payout_cycle_end_date,
      payout_dump: values.payout_dump,
      rm: values.rm,
      contact_name: values.contact_name,
      contact_mobile: values.contact_mobile,
      contact_email: values.contact_email,
      contact_address: values.contact_address,
      terms_and_condition: values.terms_and_condition,
      link_type: values.link_type,
      link: values.link,
      pincode_rule: values.pincode_rule ? JSON.parse(values.pincode_rule) : {},
      configuration: values.configuration ? JSON.parse(values.configuration) : {},
      income_eligible: values.income_eligible
        ? JSON.parse(values.income_eligible)
        : {},
      status: Number(values.status),
    });
  });

  return (
    <form
      onSubmit={submit}
      className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Loan Type *" error={errors.loan_type_id?.message}>
          <select
            className={selectClass}
            value={watch("loan_type_id")}
            onChange={(e) =>
              setValue("loan_type_id", e.target.value, {
                shouldValidate: true,
              })
            }
          >
            <option value="">Select</option>
            {loanTypeOptions.map((o) => (
              <option key={String(o.id)} value={String(o.id)}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Contract Type">
          <select
            className={selectClass}
            value={watch("contract_type") ?? ""}
            onChange={(e) => setValue("contract_type", e.target.value)}
          >
            <option value="">Select</option>
            {contractTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Apply Method">
          <select
            className={selectClass}
            value={watch("apply_method") ?? ""}
            onChange={(e) => setValue("apply_method", e.target.value)}
          >
            <option value="">Select</option>
            {applyMethodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status Fetch Method">
          <select
            className={selectClass}
            value={watch("status_fetch_method") ?? ""}
            onChange={(e) =>
              setValue("status_fetch_method", e.target.value)
            }
          >
            <option value="">Select</option>
            {statusFetchMethodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Payout Cycle Start">
          <Input type="date" {...register("payout_cycle_start_date")} />
        </Field>
        <Field label="Payout Cycle End">
          <Input type="date" {...register("payout_cycle_end_date")} />
        </Field>

        <Field label="Is Payout Dump Available">
          <select
            className={selectClass}
            value={watch("payout_dump") ?? ""}
            onChange={(e) => setValue("payout_dump", e.target.value)}
          >
            {YES_NO.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Relationship Manager">
          <Input {...register("rm")} />
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
            <option value="-1">In-Active</option>
          </select>
        </Field>

        <Field label="Contact Name">
          <Input {...register("contact_name")} />
        </Field>
        <Field label="Contact Mobile">
          <Input {...register("contact_mobile")} />
        </Field>
        <Field label="Contact Email">
          <Input type="email" {...register("contact_email")} />
        </Field>
        <div className="md:col-span-3">
          <Field label="Contact Address">
            <Input {...register("contact_address")} />
          </Field>
        </div>

        <Field label="Link Type">
          <select
            className={selectClass}
            value={watch("link_type") ?? ""}
            onChange={(e) => setValue("link_type", e.target.value)}
          >
            <option value="">Select</option>
            {linkTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field
            label={
              watch("link_type") === LINK_TYPE_STATIC ? "Link *" : "Link"
            }
            error={errors.link?.message}
          >
            <Input {...register("link")} placeholder="https://…" />
          </Field>
        </div>
      </div>

      <Field label="Terms and Condition">
        <textarea
          rows={3}
          {...register("terms_and_condition")}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field
          label="Pincode Rule (JSON)"
          error={errors.pincode_rule?.message}
        >
          <textarea
            rows={3}
            {...register("pincode_rule")}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
        </Field>
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
          label="Income Eligible (JSON)"
          error={errors.income_eligible?.message}
        >
          <textarea
            rows={3}
            {...register("income_eligible")}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
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
