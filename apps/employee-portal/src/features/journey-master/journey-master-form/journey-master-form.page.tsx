import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useJourneyFormLookups,
  useJourneyTypeDetail,
  useLoanTypeOptions,
  useSaveJourneyType,
} from "./journey-master-form.api";
import type { JourneyTypeSavePayload } from "./journey-master-form.types";

// Legacy AddJourneyType Yup → zod
const schema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  workflow_type: z.string().min(1, "Workflow type is required"),
  user_type: z.string().min(1, "User type is required"),
  partner_category: z.array(z.string()).default([]),
  partner_type: z.string().optional(),
  loan_type_id: z.string().optional(),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence must be a number" })
    .int("Sequence must be an integer")
    .positive("Sequence must be a positive number"),
  enable_display: z.boolean().default(true),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

function parsePartnerCategory(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function JourneyMasterFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useJourneyFormLookups();
  const { data: loanTypes = [] } = useLoanTypeOptions();
  const { data: detail } = useJourneyTypeDetail(id);
  const save = useSaveJourneyType();

  const opts = useMemo(() => {
    const by = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      workflow: by("WORKFLOW_TYPE"),
      partnerCategory: by("PARTNER_CATEGORY"),
      userType: by("USER_TYPE"),
      partnerType: by("PARTNER_TYPE"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      workflow_type: detail?.workflow_type ?? "",
      user_type: detail?.user_type ?? "",
      partner_category: parsePartnerCategory(detail?.partner_category),
      partner_type: detail?.partner_type ?? "",
      loan_type_id: detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      sequence: Number(detail?.sequence ?? 1),
      enable_display: detail?.enable_display ?? true,
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const partnerCategory = watch("partner_category");
  const togglePartnerCategory = (key: string) => {
    const next = partnerCategory.includes(key)
      ? partnerCategory.filter((k) => k !== key)
      : [...partnerCategory, key];
    setValue("partner_category", next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload: JourneyTypeSavePayload = {
      ...(id ? { journey_type_id: id } : {}),
      code: values.code,
      name: values.name,
      workflow_type: values.workflow_type,
      user_type: values.user_type,
      partner_category: JSON.stringify(values.partner_category ?? []),
      partner_type: values.partner_type,
      loan_type_id: values.loan_type_id ? values.loan_type_id : null,
      sequence: Number(values.sequence),
      enable_display: Boolean(values.enable_display),
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Journey type ${id ? "updated" : "created"} successfully`);
      navigate("/settings/journey-type/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {id ? "Edit Journey Type" : "Add Journey Type"}
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/journey-type/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Code *" error={errors.code?.message}>
            <Input {...register("code")} />
          </Field>
          <Field label="Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Sequence *" error={errors.sequence?.message}>
            <Input type="number" {...register("sequence")} />
          </Field>

          <Field label="Workflow Type *" error={errors.workflow_type?.message}>
            <select
              className={selectClass}
              value={watch("workflow_type")}
              onChange={(e) =>
                setValue("workflow_type", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {opts.workflow.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="User Type *" error={errors.user_type?.message}>
            <select
              className={selectClass}
              value={watch("user_type")}
              onChange={(e) =>
                setValue("user_type", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select</option>
              {opts.userType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Partner Type">
            <select
              className={selectClass}
              value={watch("partner_type") ?? ""}
              onChange={(e) => setValue("partner_type", e.target.value)}
            >
              <option value="">— None —</option>
              {opts.partnerType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Loan Type">
            <select
              className={selectClass}
              value={watch("loan_type_id") ?? ""}
              onChange={(e) => setValue("loan_type_id", e.target.value)}
            >
              <option value="">— None —</option>
              {loanTypes.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {l.name}
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

          <Field label="Enable display">
            <label className="flex h-9 items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={watch("enable_display")}
                onChange={(e) =>
                  setValue("enable_display", e.target.checked)
                }
                className="h-4 w-4 accent-[#4C7DF0]"
              />
              Visible
            </label>
          </Field>
        </div>

        <div>
          <Label className="mb-2 block text-xs font-medium text-slate-600">
            Partner Categories
          </Label>
          {opts.partnerCategory.length === 0 ? (
            <p className="text-xs text-slate-400">
              No partner categories available.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 rounded-md border border-slate-200 bg-slate-50/40 p-3">
              {opts.partnerCategory.map((o) => {
                const active = partnerCategory.includes(o.value);
                return (
                  <label
                    key={o.value}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => togglePartnerCategory(o.value)}
                      className="h-3.5 w-3.5 accent-[#4C7DF0]"
                    />
                    {o.label}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/journey-type/list">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
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
