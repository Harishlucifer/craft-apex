import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import { useEmployeeDetail, useSaveEmployee } from "./employee-form.api";
import type { EmployeeSavePayload } from "./employee-form.types";
import type { EmployeeStepContext } from "./employee-form.steps";
import {
  buildNestedFormPayload,
  buildWorkflow,
  UiComponentLoader,
  WorkflowType,
  type FormBuilderStepContext,
  type WorkflowStepDef,
} from "@craft-apex/workflow-runtime";

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  // `id` is the active employee id used by steps 2–4. For edit it comes from
  // the URL; for create it's set after the FORM_BUILDER step saves and the
  // backend returns an `employee_id` in the response.
  const [savedEmployeeId, setSavedEmployeeId] = useState<string | undefined>(
    routeId
  );
  const id = savedEmployeeId ?? routeId;
  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["employee-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({ workflowType: WorkflowType.EmployeeCreation, sourceId: id }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[activeStep];

  const { data: detail } = useEmployeeDetail(id);
  const save = useSaveEmployee();

  // Dropdown options (role/hierarchy/reportsTo/office) are no longer fetched
  // here — FormBuilderRenderer resolves each field's options itself via its
  // `source.api` config, which the backend's form_builder JSON should point
  // at the same endpoints employee-form.api.ts used to call directly
  // (see the plan's step-4 backend prerequisite for the exact endpoint list).

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // EmployeeSavePayload's JSON structure exactly (e.g. "user_role.role_id",
  // not an alias like "role") — see buildNestedFormPayload below.
  useEffect(() => {
    setFormValues({
      employee_code: detail?.employee_code ?? "",
      name: detail?.name ?? "",
      email: detail?.email ?? "",
      designation: detail?.designation ?? "",
      mobile: detail?.mobile ?? "",
      "user_role.role_id":
        detail?.user_role?.role_id != null
          ? String(detail.user_role.role_id)
          : "",
      hierarchy_level: detail?.hierarchy_level ?? "",
      "supervisor_user.user_id":
        detail?.supervisor_user?.user_id != null
          ? String(detail.supervisor_user.user_id)
          : "",
      "office_detail.office_id":
        detail?.office_detail?.office_id != null
          ? String(detail.office_detail.office_id)
          : "",
      status: detail?.status != null ? Number(detail.status) : 1,
      password: "",
      confirmPassword: "",
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const password = formValues.password ? String(formValues.password) : "";
    const confirmPassword = formValues.confirmPassword
      ? String(formValues.confirmPassword)
      : "";
    if (!id && (!password || !confirmPassword)) {
      toast.error("Password and confirmation are required");
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error("Passwords must match");
      return;
    }

    // Field `name`s already mirror the payload's JSON path, so the nested
    // shape falls out of the flat formValues automatically.
    const { password: _pw, confirmPassword: _cpw, ...fields } = formValues;
    const nested = buildNestedFormPayload(fields) as Partial<EmployeeSavePayload>;

    const payload: EmployeeSavePayload = {
      ...nested,
      employee_code: String(nested.employee_code ?? ""),
      mobile: String(nested.mobile ?? ""),
      email: String(nested.email ?? ""),
      name: String(nested.name ?? ""),
      status: Number(nested.status ?? 1),
      user_role: { role_id: String(nested.user_role?.role_id ?? "") },
      supervisor_user: nested.supervisor_user?.user_id
        ? { user_id: String(nested.supervisor_user.user_id) }
        : undefined,
      office_detail: nested.office_detail?.office_id
        ? { office_id: String(nested.office_detail.office_id) }
        : undefined,
      ...(password ? { password } : {}),
      ...(detail?.employee_id
        ? { employee_id: detail.employee_id }
        : id
          ? { employee_id: id }
          : {}),
      ...(detail?.user_id ? { user_id: detail.user_id } : {}),
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
      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  // Steps 2–4 need a saved employee id. Block forward navigation if not set.
  const stepEmployeeId = id ?? "";
  const canEnterLaterSteps = Boolean(stepEmployeeId);

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & EmployeeStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: save.isPending,
    submitLabel: id ? "Save & Next" : "Create & Next",
    cancelHref: "/settings/employee",
    lockField: "employee_code",
    lockWhen: id,
    employeeId: stepEmployeeId,
    employeeName: detail?.name,
    employee: {
      username: detail?.name,
      id: detail?.user_id ?? detail?.employee_id,
    },
    onAllocationSave: () => navigate("/settings/employee"),
  };

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

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading steps…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for employee creation yet. Configure a
          workflow with workflow_type &quot;{WorkflowType.EmployeeCreation}
          &quot; at{" "}
          <Link to="/settings/workflow" className="underline">
            Settings → Workflow
          </Link>
          .
        </div>
      ) : (
        <>
          <Stepper
            steps={steps.map((s) => s.name)}
            activeStep={activeStep}
            onStepClick={(i) => {
              // Allow free navigation back; only allow forward when we have an id.
              if (i <= activeStep || canEnterLaterSteps) setActiveStep(i);
            }}
          />

          <UiComponentLoader
            step={activeStepDef}
            value={formValues}
            onChange={setFormValues}
            onNext={() => setActiveStep(activeStep + 1)}
            onBack={() => setActiveStep(activeStep - 1)}
            context={stepContext}
          />
        </>
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
