import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import { useEmployeeDetail, useSaveEmployee } from "./employee-form.api";
import type { EmployeeSavePayload } from "./employee-form.types";
import EmployeeAddressStep from "./employee-address.step";
import EmployeeTerritoryMapStep from "./employee-territory-map.step";
import EmployeeAllocationStep from "./employee-allocation.step";
import {
  buildWorkflow,
  FormBuilderRenderer,
  WorkflowType,
  type FormDefinition,
  type WorkflowStepDef,
} from "@/features/workflow-runtime";

// `ui_component` codes the /settings/workflow admin screen must assign to
// this workflow's steps. FORM_BUILDER is the only one with a structured
// renderer; the other three map straight onto the existing step components
// below (unchanged behavior — only the step list/order/labels are
// workflow-driven, per the "don't touch the shared WorkflowRuntime engine"
// decision — see the plan for full context).
const ADDRESS_UI = "EMPLOYEE_ADDRESS";
const TERRITORY_UI = "TERRITORY_LOAN_MAP";
const ALLOCATION_UI = "EMPLOYEE_ALLOCATION";
const FORM_BUILDER_UI = "FORM_BUILDER";

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
    () => workflow?.stages.flatMap((s) => s.steps) ?? [],
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

  const formBuilderStep = useMemo(
    () => steps.find((s) => s.ui_component === FORM_BUILDER_UI),
    [steps]
  );

  // Lock Employee Code once the record exists — FormFieldDef.disabled is a
  // static boolean (no "disabled on edit" concept in the schema), so patch
  // it in locally rather than requiring the backend config to know about it.
  const formJson = useMemo<FormDefinition | undefined>(() => {
    const base = (
      formBuilderStep?.configuration as { form_builder?: FormDefinition } | undefined
    )?.form_builder;
    if (!base) return undefined;
    if (!id) return base;
    const lockCode = (f: FormDefinition["fields"]) =>
      f?.map((field) =>
        field.name === "employeeCode" ? { ...field, disabled: true } : field
      );
    return {
      ...base,
      fields: lockCode(base.fields),
      sections: base.sections?.map((section) => ({
        ...section,
        fields: lockCode(section.fields) ?? section.fields,
      })),
    };
  }, [formBuilderStep, id]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setFormValues({
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
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    if (!id && (!formValues.password || !formValues.confirmPassword)) {
      toast.error("Password and confirmation are required");
      return;
    }
    if (
      formValues.password &&
      formValues.password !== formValues.confirmPassword
    ) {
      toast.error("Passwords must match");
      return;
    }
    const payload: EmployeeSavePayload = {
      ...(detail?.employee_id
        ? { employee_id: detail.employee_id }
        : id
          ? { employee_id: id }
          : {}),
      ...(detail?.user_id ? { user_id: detail.user_id } : {}),
      employee_code: String(formValues.employeeCode ?? ""),
      mobile: String(formValues.mobile ?? ""),
      email: String(formValues.email ?? ""),
      name: String(formValues.username ?? ""),
      designation: formValues.designation
        ? String(formValues.designation)
        : undefined,
      ...(formValues.password ? { password: String(formValues.password) } : {}),
      hierarchy_level: formValues.hierarchy
        ? String(formValues.hierarchy)
        : undefined,
      user_role: { role_id: String(formValues.role ?? "") },
      ...(formValues.reportsTo
        ? { supervisor_user: { user_id: String(formValues.reportsTo) } }
        : {}),
      ...(formValues.office
        ? { office_detail: { office_id: String(formValues.office) } }
        : {}),
      status: Number(formValues.status ?? 1),
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
  };

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

          {activeStepDef?.ui_component === ADDRESS_UI && (
            <EmployeeAddressStep
              employeeId={stepEmployeeId}
              onBack={() => setActiveStep(activeStep - 1)}
              onNext={() => setActiveStep(activeStep + 1)}
            />
          )}

          {activeStepDef?.ui_component === TERRITORY_UI && (
            <EmployeeTerritoryMapStep
              employeeId={stepEmployeeId}
              employeeName={detail?.name}
              onBack={() => setActiveStep(activeStep - 1)}
              onNext={() => setActiveStep(activeStep + 1)}
            />
          )}

          {activeStepDef?.ui_component === ALLOCATION_UI && (
            <EmployeeAllocationStep
              employeeId={stepEmployeeId}
              employee={{
                username: detail?.name,
                id: detail?.user_id ?? detail?.employee_id,
              }}
              onBack={() => setActiveStep(activeStep - 1)}
              onSave={() => navigate("/settings/employee")}
            />
          )}

          {activeStepDef?.ui_component === FORM_BUILDER_UI && (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {formJson ? (
                <FormBuilderRenderer
                  formJson={formJson}
                  value={formValues}
                  onChange={setFormValues}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  This step has no form_builder configuration.
                </p>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Button asChild type="button" variant="outline">
                  <Link to="/settings/employee">Cancel</Link>
                </Button>
                <Button
                  type="button"
                  onClick={submitFormBuilderStep}
                  disabled={save.isPending}
                >
                  {save.isPending
                    ? "Saving…"
                    : id
                      ? "Save & Next"
                      : "Create & Next"}
                </Button>
              </div>
            </div>
          )}

          {activeStepDef &&
            ![ADDRESS_UI, TERRITORY_UI, ALLOCATION_UI, FORM_BUILDER_UI].includes(
              activeStepDef.ui_component ?? ""
            ) && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
                This step (&quot;{activeStepDef.name}&quot;) isn&apos;t wired
                up yet — unrecognized ui_component &quot;
                {activeStepDef.ui_component ?? "none"}&quot;.
              </div>
            )}
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
