import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";


import {
  usePayoutEmployeeRoles,
  usePayoutLenders,
  usePayoutLoanTypes,
  usePayoutLookups,
  usePayoutPlanDetail,
  usePayoutTerritories,
  usePayoutTerritoryTypes,
  usePublishedSchemes,
  useSavePayoutPlan,
} from "./payout-plan-form.api";
import {
  PAYOUT_PARTNER_TYPE,
  USER_TYPE,
  type PayoutPlanSavePayload,
  type SchemeRow,
} from "./payout-plan-form.types";

const headerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    user_type: z.string().min(1, "User type is required"),
    partner_type: z.string().optional(),
    partner_category: z.string().optional(),
    user_role_id: z.string().optional(),
    territory_type: z.string().optional(),
    territory_id: z.string().optional(),
    payout_interval: z.string().min(1, "Frequency is required"),
    payout_cutoff_day: z.string().min(1, "CutOff Day is required"),
    payout_category: z.string().min(1, "Payout Category is required"),
    is_standard_plan: z.coerce.number().int(),
    status: z.coerce.number().int(),
  })
  .superRefine((v, ctx) => {
    if (v.user_type === USER_TYPE.CHANNEL && v.partner_type === PAYOUT_PARTNER_TYPE.SOURCING) {
      if (!v.partner_category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["partner_category"],
          message: "Partner category is required for sourcing",
        });
      }
    }
  });
type HeaderValues = z.infer<typeof headerSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

export default function PayoutPlanFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();

  const isIncentive = location.pathname.includes("incentive");
  const defaultUserType = isIncentive ? USER_TYPE.EMPLOYEE : USER_TYPE.CHANNEL;
  const schemeMode: "payable" | "receivable" =
    location.pathname.includes("receivable") ? "receivable" : "payable";

  const listPath = isIncentive
    ? "/finance/incentive-plan-list"
    : "/finance/payout-plan-list";
  const labelPlan = isIncentive ? "Incentive Plan" : "Payout Plan";
  const labelFreq = isIncentive ? "Incentive Frequency" : "Payout Frequency";
  const labelCutOff = isIncentive ? "Incentive Cut Off Day" : "Payout Cut Off Day";

  const { data: lookups = [] } = usePayoutLookups();
  const { data: territories = [] } = usePayoutTerritories();
  const { data: territoryTypes = [] } = usePayoutTerritoryTypes();
  const { data: employeeRoles = [] } = usePayoutEmployeeRoles();
  const { data: lenders = [] } = usePayoutLenders();
  const { data: loanTypes = [] } = usePayoutLoanTypes();
  const { data: schemes = [] } = usePublishedSchemes(schemeMode);
  const { data: detail } = usePayoutPlanDetail(id);
  const save = useSavePayoutPlan();

  const opts = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      partnerCategory: filter("PARTNER_CATEGORY"),
      userType: filter("PAYOUT_USER_TYPE"),
      partnerType: filter("PARTNER_TYPE"),
      scope: filter("PAYOUT_SCOPE"),
      payoutInterval: filter("PAYOUT_INTERVAL"),
      payable: filter("PAYABLE"),
    };
  }, [lookups]);

  // Wizard.
  const [step, setStep] = useState<0 | 1>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (id && detail) setCompleted((c) => new Set(c).add(0));
  }, [id, detail]);

  // Step 1 — header.
  const findTerritoryTypeId = (
    territoryId: string | number | null | undefined
  ) => {
    if (territoryId == null) return "";
    const hit = territories.find(
      (t) => String(t.territory_id) === String(territoryId)
    );
    return hit ? String(hit.territory_type_id) : "";
  };

  const headerDefaults: HeaderValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      user_type: detail?.user_type ?? defaultUserType,
      partner_type: detail?.partner_type ?? "",
      partner_category: detail?.partner_category ?? "",
      user_role_id:
        detail?.user_role_id != null ? String(detail.user_role_id) : "",
      territory_type: findTerritoryTypeId(detail?.territory_id),
      territory_id:
        detail?.territory_id != null ? String(detail.territory_id) : "",
      payout_interval: detail?.payout_interval ?? "",
      payout_cutoff_day:
        detail?.payout_cutoff_day != null
          ? String(detail.payout_cutoff_day)
          : "",
      payout_category: detail?.payout_category ?? "",
      is_standard_plan: Number(detail?.is_standard_plan ?? 0),
      status: detail?.status != null ? Number(detail.status) : 1,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detail, territories.length]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: headerDefaults,
  });

  useEffect(() => {
    reset(headerDefaults);
  }, [headerDefaults, reset]);

  // Step 2 — selected schemes.
  const [selectedSchemes, setSelectedSchemes] = useState<SchemeRow[]>([]);
  useEffect(() => {
    if (!detail?.scheme_id || !schemes.length) return;
    const wantedIds = detail.scheme_id.map((s) => String(s.id));
    const selected = schemes.filter((s) => wantedIds.includes(String(s.id)));
    setSelectedSchemes(selected);
  }, [detail?.scheme_id, schemes]);

  const availableSchemes = useMemo(
    () =>
      schemes.filter(
        (s) => !selectedSchemes.some((sel) => String(sel.id) === String(s.id))
      ),
    [schemes, selectedSchemes]
  );

  const userType = watch("user_type");
  const partnerType = watch("partner_type");
  const territoryType = watch("territory_type");

  const territoryOptions = useMemo(
    () =>
      territories.filter(
        (t) => String(t.territory_type_id) === String(territoryType)
      ),
    [territories, territoryType]
  );

  const buildPayload = (values: HeaderValues): PayoutPlanSavePayload => ({
    ...(id ? { payout_plan_id: id } : {}),
    name: values.name,
    description: values.description,
    user_type: values.user_type,
    partner_type: values.partner_type,
    partner_category:
      values.user_type === USER_TYPE.CHANNEL
        ? values.partner_category
        : undefined,
    user_role_id:
      values.user_type === USER_TYPE.EMPLOYEE
        ? values.user_role_id || null
        : null,
    territory_id: values.territory_id || null,
    payout_interval: values.payout_interval,
    payout_cutoff_day: values.payout_cutoff_day,
    payout_category: values.payout_category,
    scheme_id: selectedSchemes.map((s) => ({ id: s.id })),
    is_standard_plan: Number(values.is_standard_plan),
    status: Number(values.status),
  });

  const onStep1Next = handleSubmit(() => {
    setCompleted((c) => new Set(c).add(0));
    setStep(1);
  });

  const onFinish = async () => {
    if (selectedSchemes.length === 0) {
      toast.error("Please select scheme before save the plan");
      return;
    }
    try {
      await save.mutateAsync(buildPayload(getValues()));
      toast.success("Saved successfully");
      navigate(listPath);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? `Edit ${labelPlan}` : `Add ${labelPlan}`}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to={listPath}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label={`${labelPlan} Details`}
          active={step === 0}
          done={completed.has(0)}
          clickable
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Scheme Mapping"
          active={step === 1}
          done={false}
          clickable={completed.has(0)}
          onClick={() => completed.has(0) && setStep(1)}
        />
      </ol>

      {step === 0 && (
        <form
          onSubmit={onStep1Next}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Input {...register("description")} />
            </Field>
            <Field label="User Type *" error={errors.user_type?.message}>
              <select
                className={selectClass}
                value={watch("user_type")}
                onChange={(e) => {
                  setValue("user_type", e.target.value, {
                    shouldValidate: true,
                  });
                  setValue("partner_type", "");
                  setValue("partner_category", "");
                  setValue("user_role_id", "");
                }}
              >
                {opts.userType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            {userType === USER_TYPE.CHANNEL && (
              <Field label="Partner Type" error={errors.partner_type?.message}>
                <select
                  className={selectClass}
                  value={watch("partner_type") ?? ""}
                  onChange={(e) => {
                    setValue("partner_type", e.target.value);
                    setValue("partner_category", "");
                  }}
                >
                  <option value="">Select</option>
                  {opts.partnerType.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {userType === USER_TYPE.CHANNEL &&
              partnerType === PAYOUT_PARTNER_TYPE.SOURCING && (
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
                    {opts.partnerCategory.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

            {userType === USER_TYPE.EMPLOYEE && (
              <Field label="User Role">
                <select
                  className={selectClass}
                  value={watch("user_role_id") ?? ""}
                  onChange={(e) => setValue("user_role_id", e.target.value)}
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

            <Field label="Territory Type">
              <select
                className={selectClass}
                value={watch("territory_type") ?? ""}
                onChange={(e) => {
                  setValue("territory_type", e.target.value);
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
            <Field label="Territory" error={errors.territory_id?.message}>
              <select
                className={selectClass}
                value={watch("territory_id") ?? ""}
                onChange={(e) => setValue("territory_id", e.target.value)}
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

            <Field label={`${labelFreq} *`} error={errors.payout_interval?.message}>
              <select
                className={selectClass}
                value={watch("payout_interval")}
                onChange={(e) =>
                  setValue("payout_interval", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.payoutInterval.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={`${labelCutOff} *`}
              error={errors.payout_cutoff_day?.message}
            >
              <select
                className={selectClass}
                value={String(watch("payout_cutoff_day") ?? "")}
                onChange={(e) =>
                  setValue("payout_cutoff_day", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Payout Category *"
              error={errors.payout_category?.message}
            >
              <select
                className={selectClass}
                value={watch("payout_category") ?? ""}
                onChange={(e) =>
                  setValue("payout_category", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.payable.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
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

            <div className="md:col-span-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={watch("is_standard_plan") === 1}
                  onChange={(e) =>
                    setValue("is_standard_plan", e.target.checked ? 1 : 0)
                  }
                />
                Is Standard Plan
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button asChild type="button" variant="outline">
              <Link to={listPath}>Back</Link>
            </Button>
            <Button type="submit">Save Next</Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Select Scheme *
            </Label>
            <select
              className={selectClass}
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                const hit = schemes.find((s) => String(s.id) === id);
                if (hit) {
                  setSelectedSchemes((prev) => [...prev, hit]);
                }
                e.target.value = "";
              }}
            >
              <option value="">Add a scheme…</option>
              {availableSchemes.map((s) => {
                const lender = lenders.find(
                  (l) => String(l.lender_id) === String(s.lenderId)
                )?.name;
                const lt = loanTypes.find(
                  (l) => String(l.id) === String(s.loanTypeId)
                )?.name;
                return (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.name} | {s.code ?? "—"} | {lender ?? "N/A"} |{" "}
                    {lt ?? "N/A"} | {s.mode ?? "—"}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Scheme</th>
                  <th className="px-3 py-2 text-left">Lender</th>
                  <th className="px-3 py-2 text-left">Loan Type</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedSchemes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      No schemes selected.
                    </td>
                  </tr>
                ) : (
                  selectedSchemes.map((s, i) => {
                    const lender = lenders.find(
                      (l) => String(l.lender_id) === String(s.lenderId)
                    )?.name;
                    const lt = loanTypes.find(
                      (l) => String(l.id) === String(s.loanTypeId)
                    )?.name;
                    return (
                      <tr
                        key={`${String(s.id)}-${i}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          {s.code ?? "—"}
                        </td>
                        <td className="px-3 py-2 font-medium">{s.name ?? "—"}</td>
                        <td className="px-3 py-2">{lender ?? "N/A"}</td>
                        <td className="px-3 py-2">{lt ?? "N/A"}</td>
                        <td className="px-3 py-2">{s.mode ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={s.status === 1 ? "success" : "destructive"}
                          >
                            {s.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSchemes((prev) =>
                                prev.filter(
                                  (x) => String(x.id) !== String(s.id)
                                )
                              )
                            }
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                            aria-label="Remove scheme"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button type="button" onClick={onFinish} disabled={save.isPending}>
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
