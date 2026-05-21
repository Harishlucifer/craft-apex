import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useSaveScheme,
  useSchemeDetail,
  useSchemeLenders,
  useSchemeLoanTypes,
} from "./lender-scheme-form.api";
import type { LenderSchemeSavePayload } from "./lender-scheme-form.types";

const headerSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  loan_type_id: z.string().min(1, "Loan Type is required"),
  sub_loan_type_id: z.string().optional(),
  lender_id: z.string().min(1, "Lender is required"),
  emi_date: z.coerce.number().int().optional(),
  cutoff_date: z.coerce.number().int().optional(),
  min_loan_amount: z.coerce.number().optional(),
  max_loan_amount: z.coerce.number().optional(),
  min_tenure: z.coerce.number().int().optional(),
  max_tenure: z.coerce.number().int().optional(),
  min_rate_of_interest: z.coerce.number().optional(),
  max_rate_of_interest: z.coerce.number().optional(),
  interest_type: z.string().optional(),
  tenure_type: z.string().optional(),
  repayment_frequency: z.string().optional(),
  terms_and_condition: z.string().optional(),
  sequence: z.coerce.number().int().optional(),
  status: z.coerce.number().int(),
});
type HeaderValues = z.infer<typeof headerSchema>;

const ARRAY_FIELDS = [
  "fees_and_charges",
  "subvention",
  "downpayment",
  "emi_holiday",
  "collateral",
  "repayment_modes",
  "appropriations",
] as const;
type ArrayField = (typeof ARRAY_FIELDS)[number];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function LenderSchemeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: loanTypes = [] } = useSchemeLoanTypes();
  const { data: lenders = [] } = useSchemeLenders();
  const { data: detail } = useSchemeDetail(id);
  const save = useSaveScheme();

  const headerDefaults: HeaderValues = useMemo(
    () => ({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      loan_type_id:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      sub_loan_type_id:
        detail?.sub_loan_type_id != null
          ? String(detail.sub_loan_type_id)
          : "",
      lender_id: detail?.lender_id != null ? String(detail.lender_id) : "",
      emi_date: Number(detail?.emi_date ?? 0),
      cutoff_date: Number(detail?.cutoff_date ?? 0),
      min_loan_amount: Number(detail?.min_loan_amount ?? 0),
      max_loan_amount: Number(detail?.max_loan_amount ?? 0),
      min_tenure: Number(detail?.min_tenure ?? 0),
      max_tenure: Number(detail?.max_tenure ?? 0),
      min_rate_of_interest: Number(detail?.min_rate_of_interest ?? 0),
      max_rate_of_interest: Number(detail?.max_rate_of_interest ?? 0),
      interest_type: detail?.interest_type ?? "",
      tenure_type: detail?.tenure_type ?? "",
      repayment_frequency: detail?.repayment_frequency ?? "",
      terms_and_condition: detail?.terms_and_condition ?? "",
      sequence: Number(detail?.sequence ?? 0),
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
    formState: { errors },
  } = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: headerDefaults,
  });

  useEffect(() => {
    reset(headerDefaults);
  }, [headerDefaults, reset]);

  // Configuration + per-tab JSON state.
  const [configJson, setConfigJson] = useState<string>("{}");
  useEffect(() => {
    setConfigJson(
      detail?.configuration != null
        ? JSON.stringify(detail.configuration, null, 2)
        : "{}"
    );
  }, [detail?.configuration]);

  const [arrays, setArrays] = useState<Record<ArrayField, string>>({
    fees_and_charges: "[]",
    subvention: "[]",
    downpayment: "[]",
    emi_holiday: "[]",
    collateral: "[]",
    repayment_modes: "[]",
    appropriations: "[]",
  });
  const [errorsJson, setErrorsJson] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!detail) return;
    setArrays({
      fees_and_charges: JSON.stringify(detail.fees_and_charges ?? [], null, 2),
      subvention: JSON.stringify(detail.subvention ?? [], null, 2),
      downpayment: JSON.stringify(detail.downpayment ?? [], null, 2),
      emi_holiday: JSON.stringify(detail.emi_holiday ?? [], null, 2),
      collateral: JSON.stringify(detail.collateral ?? [], null, 2),
      repayment_modes: JSON.stringify(detail.repayment_modes ?? [], null, 2),
      appropriations: JSON.stringify(detail.appropriations ?? [], null, 2),
    });
  }, [detail]);

  const [activeTab, setActiveTab] = useState<ArrayField | "configuration">(
    "configuration"
  );

  const validateJson = (raw: string): { ok: boolean; value: unknown; error?: string } => {
    if (!raw) return { ok: true, value: null };
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch (e) {
      return {
        ok: false,
        value: null,
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const newErrors: Record<string, string> = {};
    const config = validateJson(configJson);
    if (!config.ok) newErrors.configuration = config.error ?? "Invalid JSON";
    const parsedArrays: Partial<Record<ArrayField, unknown[] | null>> = {};
    for (const k of ARRAY_FIELDS) {
      const r = validateJson(arrays[k]);
      if (!r.ok) newErrors[k] = r.error ?? "Invalid JSON";
      else parsedArrays[k] = Array.isArray(r.value) ? r.value : null;
    }
    setErrorsJson(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Fix JSON errors before saving");
      return;
    }

    const payload: LenderSchemeSavePayload = {
      ...(detail?.lender_scheme_id
        ? { lender_scheme_id: detail.lender_scheme_id }
        : id
          ? { lender_scheme_id: id }
          : {}),
      code: values.code,
      name: values.name,
      loan_type_id: values.loan_type_id,
      sub_loan_type_id: values.sub_loan_type_id,
      lender_id: values.lender_id,
      emi_date: Number(values.emi_date),
      cutoff_date: Number(values.cutoff_date),
      min_loan_amount: Number(values.min_loan_amount),
      max_loan_amount: Number(values.max_loan_amount),
      min_tenure: Number(values.min_tenure),
      max_tenure: Number(values.max_tenure),
      min_rate_of_interest: Number(values.min_rate_of_interest),
      max_rate_of_interest: Number(values.max_rate_of_interest),
      interest_type: values.interest_type,
      tenure_type: values.tenure_type,
      repayment_frequency: values.repayment_frequency,
      terms_and_condition: values.terms_and_condition || "",
      repayment_day_choice: null,
      configuration: config.value ?? {},
      sequence: Number(values.sequence),
      status: Number(values.status),
      fees_and_charges: parsedArrays.fees_and_charges ?? null,
      subvention: parsedArrays.subvention ?? null,
      downpayment: parsedArrays.downpayment ?? null,
      emi_holiday: parsedArrays.emi_holiday ?? null,
      collateral: parsedArrays.collateral ?? null,
      repayment_modes: parsedArrays.repayment_modes ?? null,
      appropriations: parsedArrays.appropriations ?? null,
    };

    try {
      await save.mutateAsync(payload);
      toast.success(`Scheme ${id ? "Updated" : "Added"} Successfully`);
      navigate("/settings/scheme-list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Lender Scheme" : "Add Lender Scheme"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/scheme-list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Scheme Details
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Code *" error={errors.code?.message}>
              <Input disabled={Boolean(id)} {...register("code")} />
            </Field>
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
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

            <Field
              label="Lender *"
              error={errors.lender_id?.message}
            >
              <select
                className={selectClass}
                value={watch("lender_id")}
                onChange={(e) =>
                  setValue("lender_id", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {lenders.map((l) => (
                  <option
                    key={String(l.lender_id)}
                    value={String(l.lender_id)}
                  >
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Loan Type *"
              error={errors.loan_type_id?.message}
            >
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
                {loanTypes.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sequence">
              <Input type="number" {...register("sequence")} />
            </Field>

            <Field label="EMI Date">
              <Input type="number" {...register("emi_date")} />
            </Field>
            <Field label="Cutoff Date">
              <Input type="number" {...register("cutoff_date")} />
            </Field>
            <Field label="Interest Type">
              <Input {...register("interest_type")} />
            </Field>

            <Field label="Tenure Type">
              <Input {...register("tenure_type")} />
            </Field>
            <Field label="Repayment Frequency">
              <Input {...register("repayment_frequency")} />
            </Field>
            <Field label="">
              <span />
            </Field>

            <Field label="Min Loan Amount">
              <Input type="number" {...register("min_loan_amount")} />
            </Field>
            <Field label="Max Loan Amount">
              <Input type="number" {...register("max_loan_amount")} />
            </Field>
            <Field label="">
              <span />
            </Field>

            <Field label="Min Tenure">
              <Input type="number" {...register("min_tenure")} />
            </Field>
            <Field label="Max Tenure">
              <Input type="number" {...register("max_tenure")} />
            </Field>
            <Field label="">
              <span />
            </Field>

            <Field label="Min Rate of Interest">
              <Input type="number" {...register("min_rate_of_interest")} />
            </Field>
            <Field label="Max Rate of Interest">
              <Input type="number" {...register("max_rate_of_interest")} />
            </Field>
            <Field label="">
              <span />
            </Field>

            <div className="md:col-span-3">
              <Field label="Terms & Conditions">
                <textarea
                  rows={3}
                  {...register("terms_and_condition")}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Configuration &amp; Sub-Components
          </h2>
          <p className="text-xs text-slate-400">
            Legacy SchemeAdd has structured sub-tabs (fees, subvention,
            downpayment, EMI holiday, collateral, repayment modes,
            appropriation, configuration). For now each sub-array is captured
            as JSON; the schema round-trips.
          </p>

          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
            {(["configuration", ...ARRAY_FIELDS] as const).map((tab) => {
              const active = activeTab === tab;
              const hasError = errorsJson[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={
                    active
                      ? "rounded-md bg-[#1E2A6B] px-3 py-1.5 text-xs font-semibold text-white"
                      : hasError
                        ? "rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600"
                        : "rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200"
                  }
                >
                  {tab.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>

          {activeTab === "configuration" ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Configuration (JSON)
              </Label>
              <textarea
                rows={14}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
              {errorsJson.configuration && (
                <p className="text-xs text-rose-500">
                  {errorsJson.configuration}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                {activeTab.replace(/_/g, " ")} (JSON array)
              </Label>
              <textarea
                rows={14}
                value={arrays[activeTab]}
                onChange={(e) =>
                  setArrays((prev) => ({
                    ...prev,
                    [activeTab]: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
              {errorsJson[activeTab] && (
                <p className="text-xs text-rose-500">{errorsJson[activeTab]}</p>
              )}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/scheme-list">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : id ? "Save" : "Create"}
          </Button>
        </div>
      </form>
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
