import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useCamConfigDetail,
  useCamFormLookups,
  useLoanTypeOptions,
  useNotificationTemplateOptions,
  useProductCodeLookups,
  useRuleOptions,
  useSaveCamConfig,
} from "./cam-configuration-form.api";
import type { CamConfigSavePayload } from "./cam-configuration-form.types";

// Legacy AddCamConfiguration Yup → zod
const schema = z.object({
  configuration_id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(3, "Title must be 3 or more characters."),
  type: z.string().min(1, "Type is required."),
  productCode: z.string().min(1, "Product Code is required."),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence must be a number" })
    .gt(0, "Sequence must be 1 or more."),
  applicableTo: z.string().min(1, "Applicable To is required."),
  applyCapacity: z.string().min(1, "Apply capacity is required."),
  applyFor: z.string().min(1, "Apply For is required."),
  rule: z.string().optional(),
  loanType: z.string().optional(),
  templateId: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function CamConfigurationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const save = useSaveCamConfig();

  const { data: lookups = [] } = useCamFormLookups();
  const { data: loanTypes = [] } = useLoanTypeOptions();
  const { data: rules = [] } = useRuleOptions();
  const { data: templates = [] } = useNotificationTemplateOptions();
  const { data: detail } = useCamConfigDetail(id);

  const opts = useMemo(() => {
    const by = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      camType: by("CAM_TYPE"),
      applicableTo: by("APPLICANT_TYPE"),
      applyCapacity: by("APPLY_CAPACITY"),
      applyFor: by("CONFIGURATION_APPLY_FOR"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      configuration_id:
        detail?.configuration_id != null
          ? String(detail.configuration_id)
          : undefined,
      title: detail?.title ?? "",
      type: detail?.type ?? "",
      productCode: detail?.product_code ?? "",
      sequence: Number(detail?.sequence ?? 1),
      applicableTo: detail?.applicable_to ?? "",
      applyCapacity: detail?.apply_capacity ?? "",
      applyFor: detail?.apply_for ?? "",
      rule: detail?.rule_id != null ? String(detail.rule_id) : "",
      loanType:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      templateId:
        detail?.template_id != null ? String(detail.template_id) : "",
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

  // Legacy: product-code list is loaded from the lookup whose group_code === selected `type`.
  const camType = watch("type");
  const { data: productCodes = [] } = useProductCodeLookups(camType);

  const onSubmit = handleSubmit(async (values) => {
    const payload: CamConfigSavePayload = {
      ...(id ? { configuration_id: id } : {}),
      title: values.title,
      type: values.type,
      product_code: values.productCode,
      sequence: Number(values.sequence),
      applicable_to: values.applicableTo,
      apply_capacity: values.applyCapacity,
      apply_for: values.applyFor,
      rule_id: values.rule || undefined,
      loan_type_id: values.loanType || undefined,
      template_id: values.templateId || undefined,
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Configuration ${id ? "updated" : "created"} successfully`);
      navigate("/settings/cam-configuration/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit CAM Configuration" : "Add CAM Configuration"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/cam-configuration/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Title *" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>

          <Field label="Type *" error={errors.type?.message}>
            <select
              className={selectClass}
              value={watch("type")}
              onChange={(e) => {
                setValue("type", e.target.value, { shouldValidate: true });
                setValue("productCode", "", { shouldValidate: true });
              }}
            >
              <option value="">Select</option>
              {opts.camType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Product Code *" error={errors.productCode?.message}>
            <select
              className={selectClass}
              value={watch("productCode")}
              onChange={(e) =>
                setValue("productCode", e.target.value, {
                  shouldValidate: true,
                })
              }
              disabled={!camType}
            >
              <option value="">{camType ? "Select" : "Pick a type first"}</option>
              {productCodes.map((p) => (
                <option key={p.lu_key} value={p.lu_key}>
                  {p.lu_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sequence *" error={errors.sequence?.message}>
            <Input type="number" {...register("sequence")} />
          </Field>

          <Field label="Applicable To *" error={errors.applicableTo?.message}>
            <select
              className={selectClass}
              value={watch("applicableTo")}
              onChange={(e) =>
                setValue("applicableTo", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {opts.applicableTo.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Apply Capacity *" error={errors.applyCapacity?.message}>
            <select
              className={selectClass}
              value={watch("applyCapacity")}
              onChange={(e) =>
                setValue("applyCapacity", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {opts.applyCapacity.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Apply For *" error={errors.applyFor?.message}>
            <select
              className={selectClass}
              value={watch("applyFor")}
              onChange={(e) =>
                setValue("applyFor", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select</option>
              {opts.applyFor.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rule">
            <select
              className={selectClass}
              value={watch("rule") ?? ""}
              onChange={(e) => setValue("rule", e.target.value)}
            >
              <option value="">— None —</option>
              {rules.map((r) => (
                <option key={String(r.id)} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Loan Type">
            <select
              className={selectClass}
              value={watch("loanType") ?? ""}
              onChange={(e) => setValue("loanType", e.target.value)}
            >
              <option value="">— None —</option>
              {loanTypes.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Template">
            <select
              className={selectClass}
              value={watch("templateId") ?? ""}
              onChange={(e) => setValue("templateId", e.target.value)}
            >
              <option value="">— None —</option>
              {templates.map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  {t.name}
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
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/cam-configuration/list">Back</Link>
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
