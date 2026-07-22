import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useLoanTypeDetail, useLoanTypeLookups } from "./loan-type-form.api";
import type { LoanTypeSavePayload, SubLoanRow } from "./loan-type-form.types";
import type { LoanTypeStepContext } from "./loan-type-form.steps";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Loan Type create/edit. Driven by the generic MasterWorkflowPage (see
 * routes.tsx) — this module only supplies the bespoke controller: the
 * FORM_BUILDER step's default values + payload transform, the Sub Loan Types
 * step's context, and the saves.
 */
export const loanTypeMaster: MasterWorkflowPageProps = {
  noun: "Loan Type",
  workflowType: WorkflowType.LoanTypeCreation,
  listPath: "/settings/loan-types",
  maxWidth: "max-w-5xl",
  emptyLabel: "loan type creation",
  useController: useLoanTypeController,
};

function useLoanTypeController({
  id,
  advance,
  saving,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: lookups = [] } = useLoanTypeLookups();
  // Facility options are only used by SubLoanTypesPanel (step 2) — not part
  // of the FORM_BUILDER step, so kept here rather than in form_builder JSON.
  const facilityOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "FACILITY_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups],
  );

  const { data: detail } = useLoanTypeDetail(id);

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
    const res = await advance(payload);
    if (!res) return;
    const newId = res.sourceId;
    toast.success(`Loan type ${id ? "updated" : "saved"} successfully`);
    if (!id && newId) {
      setSavedId(String(newId));
      navigate(`/settings/add-loan-types/${String(newId)}`, {
        replace: true,
      });
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
    const res = await advance(payload);
    if (!res) return;
    toast.success("Sub loan types saved successfully");
    navigate("/settings/loan-types");
  };

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & LoanTypeStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    cancelHref: "/settings/loan-types",
    lockField: "loan_code",
    lockWhen: id,
    facilityOptions,
    subLoans,
    onSubLoansChange: setSubLoans,
    onSave: submitSubLoanTypesStep,
    saving,
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(id),
  };
}
