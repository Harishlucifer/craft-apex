import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useEmployeeDetail,
  useEmployeeHierarchy,
  useEmployeeReportsTo,
  useEmployeeRoles,
  useOffices,
  useSaveEmployee,
} from "./employee-form.api";
import type { EmployeeSavePayload } from "./employee-form.types";
import EmployeeAddressStep from "./employee-address.step";
import EmployeeTerritoryMapStep from "./employee-territory-map.step";
import EmployeeAllocationStep from "./employee-allocation.step";

const STEPS = [
  "Employee Details",
  "Employee Address",
  "Territory Loan-type Mapping",
  "Employee Allocation",
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const baseSchema = z
  .object({
    employeeCode: z
      .string()
      .min(1, "EmployeeId is required")
      .max(100, "Too long! Should be less than 100 characters"),
    username: z
      .string()
      .min(3, "Should be more than 3 characters")
      .max(100, "Too long! Should be less than 100 characters")
      .regex(/^[A-Za-z\s]+$/, "Invalid name"),
    email: z
      .string()
      .email("Invalid Email address")
      .max(120, "Too Long! Should be less than 120 characters"),
    designation: z.string().optional(),
    mobile: z.string().regex(/^\d{10}$/, "Invalid Mobile Number"),
    role: z.string().min(1, "Role is required"),
    hierarchy: z.string().optional(),
    reportsTo: z.string().optional(),
    office: z.string().min(1, "Office is required"),
    status: z.coerce.number().int(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.password && !v.confirmPassword) return; // edit: optional
    if (v.password && v.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Should be minimum 8 characters long",
      });
    }
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords must match",
      });
    }
  });
type FormValues = z.infer<typeof baseSchema>;

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  // `id` is the active employee id used by steps 2–4. For edit it comes from
  // the URL; for create it's set after step 1 saves and the backend returns
  // an `employee_id` in the response.
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | undefined>(
    routeId
  );
  const id = savedEmployeeId ?? routeId;
  const [activeStep, setActiveStep] = useState(0);

  const { data: hierarchy = [] } = useEmployeeHierarchy();
  const { data: roles = [] } = useEmployeeRoles();
  const { data: reportsToList = [] } = useEmployeeReportsTo();
  const { data: offices = [] } = useOffices();
  const { data: detail } = useEmployeeDetail(id);
  const save = useSaveEmployee();

  const hierarchyOptions = useMemo(
    () => hierarchy.map((h) => ({ value: h.lu_key, label: h.lu_name })),
    [hierarchy]
  );

  const defaults: FormValues = useMemo(
    () => ({
      employeeCode: detail?.employee_code ?? "",
      username: detail?.name ?? "",
      email: detail?.email ?? "",
      designation: detail?.designation ?? "",
      mobile: detail?.mobile ?? "",
      role:
        detail?.user_role?.role_id != null
          ? String(detail.user_role.role_id)
          : "",
      hierarchy: detail?.hierarchy_level ?? "",
      reportsTo:
        detail?.supervisor_user?.user_id != null
          ? String(detail.supervisor_user.user_id)
          : "",
      office:
        detail?.office_detail?.office_id != null
          ? String(detail.office_detail.office_id)
          : "",
      status: detail?.status != null ? Number(detail.status) : 1,
      password: "",
      confirmPassword: "",
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
    resolver: zodResolver(baseSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    // On create the password is required.
    if (!id && (!values.password || !values.confirmPassword)) {
      toast.error("Password and confirmation are required");
      return;
    }
    const payload: EmployeeSavePayload = {
      ...(detail?.employee_id
        ? { employee_id: detail.employee_id }
        : id
          ? { employee_id: id }
          : {}),
      ...(detail?.user_id ? { user_id: detail.user_id } : {}),
      employee_code: String(values.employeeCode),
      mobile: String(values.mobile),
      email: values.email,
      name: values.username,
      designation: values.designation,
      ...(values.password ? { password: values.password } : {}),
      hierarchy_level: values.hierarchy,
      user_role: { role_id: String(values.role) },
      ...(values.reportsTo
        ? { supervisor_user: { user_id: values.reportsTo } }
        : {}),
      ...(values.office
        ? { office_detail: { office_id: values.office } }
        : {}),
      status: Number(values.status),
      // Preserve nested arrays from detail (territory map / allocation / address)
      // so saves don't drop step-2/3/4 state.
      territory_loan_map: detail?.territory_loan_map,
      user_allocation: detail?.user_allocation,
      user_address: detail?.user_address,
      data: detail?.data,
    };
    try {
      const res = await save.mutateAsync(payload);
      // Legacy `index.js` reads `response?.data?.result?.employee_id` after
      // create; on edit the existing id is preserved.
      const newId =
        (res as any)?.result?.employee_id ??
        (res as any)?.data?.result?.employee_id ??
        (res as any)?.result?.user?.employee_id ??
        (res as any)?.employee_id ??
        id;
      if (newId && newId !== savedEmployeeId) {
        setSavedEmployeeId(String(newId));
      }
      toast.success(`Employee ${id ? "updated" : "saved"} successfully`);
      // Advance to step 2 instead of navigating away (legacy stepper parity).
      setActiveStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

  // Steps 2–4 need a saved employee id. Block forward navigation if not set.
  const stepEmployeeId = id ?? "";
  const canEnterLaterSteps = Boolean(stepEmployeeId);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {routeId ? "Edit Employee" : "Add Employee"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/employee">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Stepper
        steps={STEPS}
        activeStep={activeStep}
        onStepClick={(i) => {
          // Allow free navigation back; only allow forward when we have an id.
          if (i <= activeStep || canEnterLaterSteps) setActiveStep(i);
        }}
      />

      {activeStep === 1 && (
        <EmployeeAddressStep
          employeeId={stepEmployeeId}
          onBack={() => setActiveStep(0)}
          onNext={() => setActiveStep(2)}
        />
      )}

      {activeStep === 2 && (
        <EmployeeTerritoryMapStep
          employeeId={stepEmployeeId}
          employeeName={detail?.name}
          onBack={() => setActiveStep(1)}
          onNext={() => setActiveStep(3)}
        />
      )}

      {activeStep === 3 && (
        <EmployeeAllocationStep
          employeeId={stepEmployeeId}
          employee={{
            username: detail?.name,
            id: detail?.user_id ?? detail?.employee_id,
          }}
          onBack={() => setActiveStep(2)}
          onSave={() => navigate("/settings/employee")}
        />
      )}

      {activeStep !== 0 && null /* steps 2–4 above; step 0 below */}

      {activeStep === 0 && (
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Employee Code *" error={errors.employeeCode?.message}>
            <Input
              maxLength={100}
              disabled={Boolean(id)}
              {...register("employeeCode")}
            />
          </Field>
          <Field label="Name *" error={errors.username?.message}>
            <Input {...register("username")} />
          </Field>
          <Field label="Designation" error={errors.designation?.message}>
            <Input {...register("designation")} />
          </Field>
          <Field label="Email *" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Mobile *" error={errors.mobile?.message}>
            <Input maxLength={10} {...register("mobile")} />
          </Field>
          <Field label="Role *" error={errors.role?.message}>
            <select
              className={selectClass}
              value={watch("role")}
              onChange={(e) =>
                setValue("role", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select</option>
              {roles.map((r) => (
                <option key={String(r.id)} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hierarchy">
            <select
              className={selectClass}
              value={watch("hierarchy") ?? ""}
              onChange={(e) => setValue("hierarchy", e.target.value)}
            >
              <option value="">Select</option>
              {hierarchyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reports To">
            <select
              className={selectClass}
              value={watch("reportsTo") ?? ""}
              onChange={(e) => setValue("reportsTo", e.target.value)}
            >
              <option value="">— None —</option>
              {reportsToList
                .filter((r) => String(r.user_id) !== String(detail?.user_id))
                .map((r) => (
                  <option key={String(r.user_id)} value={String(r.user_id)}>
                    {r.name}
                    {r.employee_code ? ` (${r.employee_code})` : ""}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Office *" error={errors.office?.message}>
            <select
              className={selectClass}
              value={watch("office")}
              onChange={(e) =>
                setValue("office", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select</option>
              {offices.map((o) => (
                <option key={String(o.id)} value={String(o.id)}>
                  {o.name ?? String(o.id)}
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

          {!id && (
            <>
              <Field label="Password *" error={errors.password?.message}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field
                label="Confirm Password *"
                error={errors.confirmPassword?.message}
              >
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/employee">Cancel</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending
              ? "Saving…"
              : id
                ? "Save & Next"
                : "Create & Next"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}

function Stepper({
  steps,
  activeStep,
  onStepClick,
}: {
  steps: string[];
  activeStep: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {steps.map((label, i) => {
        const isDone = i < activeStep;
        const isActive = i === activeStep;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? "bg-[#4C7DF0] text-white"
                : isDone
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                isActive
                  ? "bg-white/20 text-white"
                  : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {isDone ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
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
