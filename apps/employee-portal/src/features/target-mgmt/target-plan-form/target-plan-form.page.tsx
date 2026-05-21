import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useEmployeeRoles,
  useSaveTargetPlan,
  useTargetPlanDetail,
  useTargetPlanLookups,
  useTerritoryList,
  useTerritoryTypeList,
} from "./target-plan-form.api";
import {
  TARGET_LEVEL,
  type TargetPlanSavePayload,
} from "./target-plan-form.types";
import { TargetSchemesPanel } from "./target-schemes-panel";

const schema = z
  .object({
    target_plan_id: z.union([z.string(), z.number()]).optional(),
    title: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    target_level: z.string().min(1, "Target level is required"),
    territory_type: z.string().optional(),
    territory_id: z.string().optional(),
    partner_category: z.string().optional(),
    user_role: z.string().optional(),
    start_period: z.string().min(1, "Start period is required"),
    end_period: z.string().min(1, "End period is required"),
    status: z.coerce.number().int(),
  })
  .superRefine((v, ctx) => {
    if (v.start_period && v.end_period && v.end_period < v.start_period) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_period"],
        message: "End period must be later than start period",
      });
    }
  });
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function TargetPlanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useTargetPlanLookups();
  const { data: territories = [] } = useTerritoryList();
  const { data: territoryTypes = [] } = useTerritoryTypeList();
  const { data: employeeRoles = [] } = useEmployeeRoles();
  const { data: detail } = useTargetPlanDetail(id);
  const save = useSaveTargetPlan();

  const [step, setStep] = useState<0 | 1>(0);
  useEffect(() => {
    if (id && step === 0 && detail) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.target_plan_id]);

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      userType: filter("USER_TYPE"),
      partnerCategory: filter("PARTNER_CATEGORY"),
    };
  }, [lookups]);

  const findTerritoryType = (territoryId: string | number | null | undefined) => {
    if (territoryId == null) return "";
    const hit = territories.find(
      (t) => String(t.territory_id) === String(territoryId)
    );
    return hit ? String(hit.territory_type_id) : "";
  };

  const defaults: FormValues = useMemo(
    () => ({
      target_plan_id: detail?.target_plan_id ?? undefined,
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      target_level: detail?.target_level ?? "",
      territory_type: findTerritoryType(detail?.territory_id),
      territory_id:
        detail?.territory_id != null ? String(detail.territory_id) : "",
      partner_category: detail?.partner_category ?? "",
      user_role:
        detail?.user_role != null ? String(detail.user_role) : "",
      start_period: detail?.start_period ?? "",
      end_period: detail?.end_period ?? "",
      status: detail?.status != null ? Number(detail.status) : 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detail, territories]
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

  const targetLevel = watch("target_level");
  const territoryType = watch("territory_type");

  const territoryOptions = useMemo(
    () =>
      territories.filter(
        (t) => String(t.territory_type_id) === String(territoryType)
      ),
    [territories, territoryType]
  );

  const onSubmit = handleSubmit(async (values) => {
    const payload: TargetPlanSavePayload = {
      ...(id ? { target_plan_id: id } : {}),
      title: values.title,
      description: values.description,
      target_level: values.target_level,
      territory_id:
        values.target_level === TARGET_LEVEL.TERRITORY
          ? values.territory_id || null
          : null,
      partner_category:
        values.target_level === TARGET_LEVEL.CHANNEL
          ? values.partner_category
          : undefined,
      user_role:
        values.target_level === TARGET_LEVEL.EMPLOYEE
          ? values.user_role
          : undefined,
      start_period: values.start_period,
      end_period: values.end_period,
      status: Number(values.status),
    };
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.data?.target_plan_id ??
        (res as any)?.result?.target_plan_id;
      toast.success(`Target plan ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        navigate(`/target/add-plan/${String(newId)}`);
      } else {
        setStep(1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Target Plan" : "Add Target Plan"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/target/plan-list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Plan Details"
          active={step === 0}
          done={step > 0}
          clickable={Boolean(id)}
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Target Schemes"
          active={step === 1}
          done={false}
          clickable={Boolean(id)}
          onClick={() => id && setStep(1)}
        />
      </ol>

      {step === 0 && (
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Name *" error={errors.title?.message}>
              <Input {...register("title")} />
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <Input {...register("description")} />
            </Field>

            <Field
              label="Target Level *"
              error={errors.target_level?.message}
            >
              <select
                className={selectClass}
                value={watch("target_level")}
                onChange={(e) => {
                  setValue("target_level", e.target.value, {
                    shouldValidate: true,
                  });
                  setValue("user_role", "");
                  setValue("partner_category", "");
                  setValue("territory_type", "");
                  setValue("territory_id", "");
                }}
              >
                <option value="">Select</option>
                {options.userType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            {targetLevel === TARGET_LEVEL.TERRITORY && (
              <>
                <Field label="Territory Type">
                  <select
                    className={selectClass}
                    value={watch("territory_type") ?? ""}
                    onChange={(e) => {
                      setValue("territory_type", e.target.value, {
                        shouldValidate: true,
                      });
                      setValue("territory_id", "");
                    }}
                  >
                    <option value="">Select</option>
                    {territoryTypes.map((t) => (
                      <option
                        key={String(t.territory_type_id)}
                        value={String(t.territory_type_id)}
                      >
                        {t.territory_type_name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Territory">
                  <select
                    className={selectClass}
                    value={watch("territory_id") ?? ""}
                    onChange={(e) =>
                      setValue("territory_id", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    disabled={!territoryType}
                  >
                    <option value="">
                      {territoryType ? "Select" : "Pick a type first"}
                    </option>
                    {territoryOptions.map((t) => (
                      <option
                        key={String(t.territory_id)}
                        value={String(t.territory_id)}
                      >
                        {t.territory_name}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}

            {targetLevel === TARGET_LEVEL.CHANNEL && (
              <Field
                label="Partner Category *"
                error={errors.partner_category?.message}
              >
                <select
                  className={selectClass}
                  value={watch("partner_category") ?? ""}
                  onChange={(e) =>
                    setValue("partner_category", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <option value="">Select</option>
                  {options.partnerCategory.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {targetLevel === TARGET_LEVEL.EMPLOYEE && (
              <Field label="User Role *" error={errors.user_role?.message}>
                <select
                  className={selectClass}
                  value={watch("user_role") ?? ""}
                  onChange={(e) =>
                    setValue("user_role", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <option value="">Select</option>
                  {employeeRoles.map((r) => (
                    <option key={String(r.id)} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field
              label="Start Period *"
              error={errors.start_period?.message}
            >
              <Input type="date" {...register("start_period")} />
            </Field>

            <Field label="End Period *" error={errors.end_period?.message}>
              <Input type="date" {...register("end_period")} />
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
                <option value="-1">In-active</option>
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button asChild type="button" variant="outline">
              <Link to="/target/plan-list">Back</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save Next"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && detail && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Target Schemes
          </h2>
          <TargetSchemesPanel plan={detail} />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button asChild>
              <Link to="/target/plan-list">Close</Link>
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
