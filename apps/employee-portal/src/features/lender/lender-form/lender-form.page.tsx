import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, toast } from "@craft-apex/ui";
import {
  useLenderDetail,
  useLenderLookups,
  useLoanTypeOptions,
  useSaveLender,
} from "./lender-form.api";
import type {
  LenderContractRow,
  LenderLoanTypeRow,
  LenderSavePayload,
} from "./lender-form.types";
import type { LenderStepContext } from "./lender-form.steps";
import {
  buildNestedFormPayload,
  buildWorkflow,
  UiComponentLoader,
  WorkflowType,
  type FormBuilderStepContext,
  type WorkflowStepDef,
} from "@craft-apex/workflow-runtime";

export default function LenderFormPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();

  const [savedLenderId, setSavedLenderId] = useState<string | undefined>(
    routeId
  );
  const id = savedLenderId ?? routeId;
  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["lender-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({ workflowType: WorkflowType.LenderCreation, sourceId: id }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages?.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[activeStep];

  const { data: lookups = [] } = useLenderLookups();
  const { data: loanTypeOptions = [] } = useLoanTypeOptions();
  const { data: detail } = useLenderDetail(id);
  const save = useSaveLender();

  const lookupOptions = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      applyMethod: filter("LENDER_APPLY_METHOD"),
      statusFetchMethod: filter("LENDER_STATUS_FETCH_METHOD"),
      contractType: filter("CONTRACT_TYPE"),
      linkType: filter("LINK_TYPE"),
    };
  }, [lookups]);

  // Steps 2/3 collections held at page level, persisted via full-record POST.
  const [loanTypes, setLoanTypes] = useState<LenderLoanTypeRow[]>([]);
  const [contracts, setContracts] = useState<LenderContractRow[]>([]);
  useEffect(() => {
    setLoanTypes(
      Array.isArray(detail?.lender_loan_type) ? detail!.lender_loan_type! : []
    );
    setContracts(
      Array.isArray(detail?.lender_loan_contract)
        ? detail!.lender_loan_contract!
        : []
    );
  }, [detail?.lender_loan_type, detail?.lender_loan_contract]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // LenderSavePayload's JSON structure exactly (flat — no nested objects
  // in the basic-details step, unlike Employee/Territory).
  useEffect(() => {
    setFormValues({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      sequence: detail?.sequence != null ? Number(detail.sequence) : 0,
      lender_type: detail?.lender_type ?? "",
      gst_type: detail?.gst_type ?? "",
      logo: detail?.logo ?? "",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const buildPayload = (
    fields: Record<string, any>,
    lt: LenderLoanTypeRow[],
    ct: LenderContractRow[]
  ): LenderSavePayload => ({
    ...(id ? { lender_id: id } : {}),
    code: String(fields.code ?? "").toUpperCase(),
    name: String(fields.name ?? ""),
    description: fields.description || undefined,
    sequence: Number(fields.sequence ?? 0),
    lender_type: String(fields.lender_type ?? ""),
    gst_type: String(fields.gst_type ?? ""),
    logo: String(fields.logo ?? ""),
    status: Number(fields.status ?? 1),
    lender_loan_type: lt,
    lender_loan_contract: ct,
  });

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(formValues);
    const payload = buildPayload(nested, loanTypes, contracts);
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.result?.lender_id ?? (res as any)?.data?.lender_id;
      toast.success(`Lender ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        setSavedLenderId(String(newId));
        navigate(`/settings/add-lender/${String(newId)}`, { replace: true });
      }
      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const submitLoanTypesStep = async () => {
    const nested = buildNestedFormPayload(formValues);
    const payload = buildPayload(nested, loanTypes, contracts);
    try {
      await save.mutateAsync(payload);
      toast.success("Loan types saved successfully");
      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const submitContractsStep = async () => {
    const nested = buildNestedFormPayload(formValues);
    const payload = buildPayload(nested, loanTypes, contracts);
    try {
      await save.mutateAsync(payload);
      toast.success("Lender created successfully");
      navigate("/settings/lender");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const canEnterLaterSteps = Boolean(id);

  const stepContext: FormBuilderStepContext & LenderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: save.isPending,
    cancelHref: "/settings/lender",
    lockField: "code",
    lockWhen: id,
    loanTypeOptions,
    loanTypes,
    onLoanTypesChange: setLoanTypes,
    contracts,
    onContractsChange: setContracts,
    applyMethodOptions: lookupOptions.applyMethod,
    statusFetchMethodOptions: lookupOptions.statusFetchMethod,
    contractTypeOptions: lookupOptions.contractType,
    linkTypeOptions: lookupOptions.linkType,
    onSaveLoanTypes: submitLoanTypesStep,
    onSaveContracts: submitContractsStep,
    saving: save.isPending,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {routeId ? "Edit Lender" : "Add Lender"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/lender">
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
          No workflow configured for lender creation yet. Configure a
          workflow with workflow_type &quot;{WorkflowType.LenderCreation}
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
