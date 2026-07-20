import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import {
  useLenderDetail,
  useLenderLookups,
  useLoanTypeOptions,
} from "./lender-form.api";
import type {
  LenderContractRow,
  LenderLoanTypeRow,
  LenderSavePayload,
} from "./lender-form.types";
import type { LenderStepContext } from "./lender-form.steps";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Lender create/edit. Driven by the generic MasterWorkflowPage (see
 * routes.tsx); this module supplies only the bespoke controller (FORM_BUILDER
 * defaults + payload, and the loan-types / contracts panels' context).
 */
export const lenderMaster: MasterWorkflowPageProps = {
  noun: "Lender",
  workflowType: WorkflowType.LenderCreation,
  listPath: "/settings/lender",
  maxWidth: "max-w-6xl",
  emptyLabel: "lender creation",
  useController: useLenderController,
};

function useLenderController({
  id,
  saveStep,
  saving,
  goNext,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: lookups = [] } = useLenderLookups();
  const { data: loanTypeOptions = [] } = useLoanTypeOptions();
  const { data: detail } = useLenderDetail(id);

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
      Array.isArray(detail?.lender_loan_type) ? detail!.lender_loan_type! : [],
    );
    setContracts(
      Array.isArray(detail?.lender_loan_contract)
        ? detail!.lender_loan_contract!
        : [],
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
    ct: LenderContractRow[],
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
    const res = await saveStep(payload);
    if (!res) return;
    const newId = res.sourceId;
    toast.success(`Lender ${id ? "updated" : "saved"} successfully`);
    if (!id && newId) {
      setSavedId(String(newId));
      navigate(`/settings/add-lender/${String(newId)}`, { replace: true });
    }
    goNext();
  };

  const submitLoanTypesStep = async () => {
    const nested = buildNestedFormPayload(formValues);
    const payload = buildPayload(nested, loanTypes, contracts);
    const res = await saveStep(payload);
    if (!res) return;
    toast.success("Loan types saved successfully");
    goNext();
  };

  const submitContractsStep = async () => {
    const nested = buildNestedFormPayload(formValues);
    const payload = buildPayload(nested, loanTypes, contracts);
    const res = await saveStep(payload);
    if (!res) return;
    toast.success("Lender created successfully");
    navigate("/settings/lender");
  };

  const stepContext: FormBuilderStepContext & LenderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
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
    saving,
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(id),
  };
}
