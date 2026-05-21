import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useLoanTypeDetail,
  useLoanTypeLookups,
  useSaveLoanType,
} from "./loan-type-form.api";
import type {
  LoanTypeSavePayload,
  SubLoanRow,
} from "./loan-type-form.types";
import { SubLoanTypesPanel } from "./sub-loan-types-panel";

// Legacy AddLoanType Yup → zod (step 1 only — step 2 is the sub-loan editor).
const schema = z.object({
  loanTypeCode: z.string().optional(),
  loanTypeName: z
    .string()
    .min(1, "Loan type name is required")
    .max(30, "Too Long! Should be less than 30 characters"),
  loanCategory: z.string().min(1, "Loan category is required"),
  description: z
    .string()
    .max(256, "Too Long! Should be less than 256 characters")
    .optional(),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence is required" })
    .int(),
  applyCapacity: z.array(z.string()).min(1, "Apply Capacity is required"),
  employmentType: z.array(z.string()).min(1, "Employment Type is required"),
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
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function LoanTypeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useLoanTypeLookups();
  const { data: detail } = useLoanTypeDetail(id);
  const save = useSaveLoanType();

  // Stepper. Step 2 is only available once a loan_type_id exists.
  const [step, setStep] = useState<0 | 1>(0);
  useEffect(() => {
    // Move to step 2 automatically after the first save lands on /:id.
    if (id && step === 0 && detail) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.loan_type_id]);

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      loanCategory: filter("LOAN_CATEGORY"),
      applyCapacity: filter("APPLY_CAPACITY"),
      employmentType: filter("EMPLOYMENT_TYPE"),
      facility: filter("FACILITY_TYPE"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      loanTypeCode: detail?.loan_code ?? "",
      loanTypeName: detail?.loan ?? "",
      description: detail?.description ?? "",
      loanCategory: detail?.loan_category ?? "",
      sequence: Number(detail?.sequence ?? 0),
      applyCapacity: Array.isArray(detail?.apply_capacity)
        ? detail!.apply_capacity!
        : [],
      employmentType: Array.isArray(detail?.employment_type)
        ? detail!.employment_type!
        : [],
      configuration:
        detail?.configuration != null
          ? JSON.stringify(detail.configuration)
          : "{}",
      status: detail?.status != null ? Number(detail.status) : 1,
    }),
    [detail]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Sub-loan list lives at the page level so step 2 can mutate it before save.
  const [subLoans, setSubLoans] = useState<SubLoanRow[]>([]);
  useEffect(() => {
    setSubLoans(Array.isArray(detail?.sub_loans) ? detail!.sub_loans! : []);
  }, [detail?.sub_loans]);

  const applyCapacity = watch("applyCapacity") ?? [];
  const employmentType = watch("employmentType") ?? [];

  const toggleArrayValue = (
    field: "applyCapacity" | "employmentType",
    value: string
  ) => {
    const cur = (watch(field) ?? []) as string[];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    setValue(field, next, { shouldValidate: true });
  };

  const buildPayload = (
    values: FormValues,
    subs: SubLoanRow[]
  ): LoanTypeSavePayload => ({
    ...(id ? { loan_type_id: id } : {}),
    loan_code: values.loanTypeCode ?? "",
    loan_category: values.loanCategory,
    loan: values.loanTypeName,
    description: values.description,
    sequence: Number(values.sequence),
    apply_capacity: values.applyCapacity,
    employment_type: values.employmentType,
    configuration: values.configuration ? JSON.parse(values.configuration) : {},
    status: Number(values.status),
    sub_loans: subs,
  });

  // Step 1: save loan type + preserved sub_loans → on create, move to step 2.
  const onSubmitStep1 = handleSubmit(async (values) => {
    const payload = buildPayload(values, subLoans);
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.result?.loan_type_id ??
        (res as any)?.data?.loan_type_id;
      toast.success(`Loan type ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        navigate(`/settings/add-loan-types/${String(newId)}`);
      } else {
        setStep(1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  // Step 2: post the full record with the edited sub_loans.
  const onSaveStep2 = async () => {
    const payload = buildPayload(getValues(), subLoans);
    try {
      await save.mutateAsync(payload);
      toast.success("Sub loan types saved successfully");
      navigate("/settings/loan-types");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Loan Type" : "Add Loan Type"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/loan-types">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Loan Type"
          active={step === 0}
          done={step > 0}
          clickable={Boolean(id)}
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Sub Loan Types"
          active={step === 1}
          done={false}
          clickable={Boolean(id)}
          onClick={() => id && setStep(1)}
        />
      </ol>

      {step === 0 && (
        <form
          onSubmit={onSubmitStep1}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-slate-700">
            Basic Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Loan Type Code" error={errors.loanTypeCode?.message}>
              <Input {...register("loanTypeCode")} disabled={Boolean(id)} />
            </Field>

            <Field
              label="Loan Type Name *"
              error={errors.loanTypeName?.message}
            >
              <Input maxLength={30} {...register("loanTypeName")} />
            </Field>

            <Field label="Loan Category *" error={errors.loanCategory?.message}>
              <select
                className={selectClass}
                value={watch("loanCategory")}
                onChange={(e) =>
                  setValue("loanCategory", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {options.loanCategory.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <Input maxLength={256} {...register("description")} />
            </Field>

            <Field label="Sequence *" error={errors.sequence?.message}>
              <Input type="number" {...register("sequence")} />
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
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="-1">Inactive</option>
              </select>
            </Field>
          </div>

          <MultiSelectField
            label="Apply Capacity *"
            options={options.applyCapacity}
            selected={applyCapacity}
            onToggle={(v) => toggleArrayValue("applyCapacity", v)}
            error={errors.applyCapacity?.message as string | undefined}
          />

          <MultiSelectField
            label="Employment Type *"
            options={options.employmentType}
            selected={employmentType}
            onToggle={(v) => toggleArrayValue("employmentType", v)}
            error={errors.employmentType?.message as string | undefined}
          />

          <div>
            <Label className="text-xs font-medium text-slate-600">
              Configuration (JSON)
            </Label>
            <textarea
              rows={3}
              {...register("configuration")}
              placeholder="{}"
              className="mt-1.5 w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            />
            {errors.configuration && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.configuration.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button asChild type="button" variant="outline">
              <Link to="/settings/loan-types">Back</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : id ? "Save & Next" : "Save & Next"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Sub Loan Types
          </h2>
          <SubLoanTypesPanel
            facilityOptions={options.facility}
            rows={subLoans}
            onChange={setSubLoans}
          />

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onSaveStep2}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
  clickable,
  onClick,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        className={
          done
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
            : active
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
              : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        }
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </button>
      <span
        className={
          active || done
            ? "font-semibold text-slate-900"
            : "text-slate-500"
        }
      >
        {label}
      </span>
    </li>
  );
}

function MultiSelectField({
  label,
  options,
  selected,
  onToggle,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50/40 p-2">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              className={
                active
                  ? "inline-flex items-center gap-1.5 rounded-full border border-[#4C7DF0] bg-[#4C7DF0] px-3 py-1 text-xs font-medium text-white"
                  : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-slate-300"
              }
            >
              {o.label}
              {active && <X className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
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
