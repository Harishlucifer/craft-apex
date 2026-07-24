import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useJourneyTypeDetail } from "./journey-master-form.api";
import type { JourneyTypeSavePayload } from "./journey-master-form.types";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Journey Type create/edit — a single-FORM_BUILDER-step master (no
 * stepper), same shape as cam-configuration-form.page.tsx. Every dropdown
 * (Workflow Type, User Type, Partner Category, Partner Type, Loan Type) is
 * resolved by the server-configured form_builder JSON's `source.api` —
 * legacy AddJourneyType.js's four-lookup-group fetch + loan-type fetch are
 * expressed there instead of bespoke hooks in this controller.
 */
export const journeyTypeMaster: MasterWorkflowPageProps = {
  noun: "Journey Type",
  workflowType: WorkflowType.JourneyTypeCreation,
  listPath: "/settings/journey-type/list",
  maxWidth: "max-w-5xl",
  emptyLabel: "journey type creation",
  useController: useJourneyTypeController,
};

function parsePartnerCategory(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function useJourneyTypeController({
  id,
  advance,
  saving,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useJourneyTypeDetail(id);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setFormValues({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      workflow_type: detail?.workflow_type ?? "",
      user_type: detail?.user_type ?? "",
      partner_category: parsePartnerCategory(detail?.partner_category),
      partner_type: detail?.partner_type ?? "",
      loan_type_id:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      sequence: detail?.sequence != null ? Number(detail.sequence) : 1,
      enable_display: detail?.enable_display ?? true,
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(
      formValues,
    ) as Partial<JourneyTypeSavePayload> & {
      partner_category?: string[];
    };

    const payload: JourneyTypeSavePayload = {
      ...(id ? { journey_type_id: id } : {}),
      code: String(nested.code ?? ""),
      name: String(nested.name ?? ""),
      workflow_type: String(nested.workflow_type ?? ""),
      user_type: String(nested.user_type ?? ""),
      partner_category: JSON.stringify(
        Array.isArray(nested.partner_category) ? nested.partner_category : [],
      ),
      partner_type: nested.partner_type ? String(nested.partner_type) : undefined,
      loan_type_id: nested.loan_type_id ? String(nested.loan_type_id) : null,
      sequence: Number(nested.sequence ?? 1),
      enable_display: Boolean(nested.enable_display ?? true),
      status: Number(nested.status ?? 1),
    };

    const res = await advance(payload);
    if (!res) return;
    toast.success(`Journey type ${id ? "updated" : "created"} successfully`);
    navigate("/settings/journey-type/list");
  };

  const stepContext: FormBuilderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save" : "Create",
    cancelHref: "/settings/journey-type/list",
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    singleStep: true,
  };
}
