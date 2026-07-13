import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import {
  useLoanTypeDetail,
  useLoanTypeLookups,
  useSaveLoanType,
} from "./loan-type-form.api";
import type { LoanTypeSavePayload, SubLoanRow } from "./loan-type-form.types";
import type { LoanTypeStepContext } from "./loan-type-form.steps";
import {
  buildNestedFormPayload,
  buildWorkflow,
  UiComponentLoader,
  WorkflowType,
  type WorkflowStepDef,
} from "@/features/workflow-runtime";
import type { FormBuilderStepContext } from "@/features/workflow-runtime/steps/form-builder-step";

export default function LoanTypeFormPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();

  // `id` is the active loan type id used by the Sub Loan Types step. For
  // edit it comes from the URL; for create it's set after the FORM_BUILDER
  // step saves and the backend returns a `loan_type_id` in the response.
  const [savedLoanTypeId, setSavedLoanTypeId] = useState<string | undefined>(
    routeId
  );
  const id = savedLoanTypeId ?? routeId;
  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["loan-type-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({
        workflowType: WorkflowType.LoanTypeCreation,
        sourceId: id,
      }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[activeStep];

  const { data: lookups = [] } = useLoanTypeLookups();
  // Facility options are only used by SubLoanTypesPanel (step 2) — not part
  // of the FORM_BUILDER step, so kept here rather than in form_builder JSON.
  const facilityOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "FACILITY_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups]
  );

  const { data: detail } = useLoanTypeDetail(id);
  const save = useSaveLoanType();

  // Sub-loan list lives at the page level so step 2 can mutate it, and so
  // step 1 saves preserve it (legacy buildPayload always included sub_loans).
  const [subLoans, setSubLoans] = useState<SubLoanRow[]>([]);
  useEffect(() => {
    setSubLoans(Array.isArray(detail?.sub_loans) ? detail!.sub_loans! : []);
  }, [detail?.sub_loans]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // LoanTypeSavePayload's JSON structure exactly (LoanTypeSavePayload is
  // already flat, so this is a 1:1 passthrough — see buildNestedFormPayload
  // below). `configuration` is a raw JSON-text field, parsed on submit.
  useEffect(() => {
    setFormValues({
      loan_code: detail?.loan_code ?? "",
      loan: detail?.loan ?? "",
      description: detail?.description ?? "",
      loan_category: detail?.loan_category ?? "",
      sequence: detail?.sequence != null ? Number(detail.sequence) : 0,
      apply_capacity: Array.isArray(detail?.apply_capacity)
        ? detail!.apply_capacity!
        : [],
      employment_type: Array.isArray(detail?.employment_type)
        ? detail!.employment_type!
        : [],
      configuration:
        detail?.configuration != null
          ? JSON.stringify(detail.configuration)
          : "{}",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const { configuration: rawConfiguration, ...rest } = formValues;
    let configuration: unknown = {};
    if (typeof rawConfiguration === "string" && rawConfiguration.trim()) {
      try {
        configuration = JSON.parse(rawConfiguration);
      } catch {
        toast.error("Configuration must be valid JSON");
        return;
      }
    }

    const nested = buildNestedFormPayload(rest) as Partial<LoanTypeSavePayload>;
    const payload: LoanTypeSavePayload = {
      ...nested,
      loan_code: String(nested.loan_code ?? ""),
      loan_category: String(nested.loan_category ?? ""),
      loan: String(nested.loan ?? ""),
      sequence: Number(nested.sequence ?? 0),
      apply_capacity: Array.isArray(nested.apply_capacity)
        ? nested.apply_capacity
        : [],
      employment_type: Array.isArray(nested.employment_type)
        ? nested.employment_type
        : [],
      configuration,
      status: Number(nested.status ?? 1),
      ...(id ? { loan_type_id: id } : {}),
      sub_loans: subLoans,
    };
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.result?.loan_type_id ?? (res as any)?.data?.loan_type_id;
      toast.success(`Loan type ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        setSavedLoanTypeId(String(newId));
        navigate(`/settings/add-loan-types/${String(newId)}`, {
          replace: true,
        });
      }
      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const submitSubLoanTypesStep = async () => {
    if (!detail && !id) return;
    const payload: LoanTypeSavePayload = {
      ...(id ? { loan_type_id: id } : {}),
      loan_code: detail?.loan_code ?? "",
      loan_category: detail?.loan_category ?? "",
      loan: detail?.loan ?? "",
      description: detail?.description,
      sequence: Number(detail?.sequence ?? 0),
      apply_capacity: Array.isArray(detail?.apply_capacity)
        ? detail!.apply_capacity!
        : [],
      employment_type: Array.isArray(detail?.employment_type)
        ? detail!.employment_type!
        : [],
      configuration: detail?.configuration ?? {},
      status: Number(detail?.status ?? 1),
      sub_loans: subLoans,
    };
    try {
      await save.mutateAsync(payload);
      toast.success("Sub loan types saved successfully");
      navigate("/settings/loan-types");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const canEnterLaterSteps = Boolean(id);

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & LoanTypeStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: save.isPending,
    cancelHref: "/settings/loan-types",
    lockField: "loan_code",
    lockWhen: id,
    facilityOptions,
    subLoans,
    onSubLoansChange: setSubLoans,
    onSave: submitSubLoanTypesStep,
    saving: save.isPending,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {routeId ? "Edit Loan Type" : "Add Loan Type"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/loan-types">
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
          No workflow configured for loan type creation yet. Configure a
          workflow with workflow_type &quot;
          {WorkflowType.LoanTypeCreation}&quot; at{" "}
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
