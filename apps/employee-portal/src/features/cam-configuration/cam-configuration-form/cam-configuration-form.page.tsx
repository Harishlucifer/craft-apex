import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useCamConfigDetail } from "./cam-configuration-form.api";
import type { CamConfigSavePayload } from "./cam-configuration-form.types";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * CAM Configuration create/edit — a single-FORM_BUILDER-step master (no
 * stepper), same shape as territory-form.page.tsx. The Type -> Product Code
 * cascade (Product Code options come from the lookup group named by the
 * selected Type value) is expressed entirely in the server-configured
 * form_builder JSON via `dependentOn: ["type"]` +
 * `source.api: "/alpha/v1/lookup?group_code={{type}}"` — no bespoke fetching
 * lives in this controller; every dropdown (type/product_code/applicable_to/
 * apply_capacity/apply_for/rule_id/loan_type_id/template_id) is resolved by
 * the renderer's async-options mechanism, same as Territory's type/parent
 * dropdowns.
 */
export const camConfigMaster: MasterWorkflowPageProps = {
  noun: "CAM Configuration",
  workflowType: WorkflowType.CamConfigurationCreation,
  listPath: "/settings/cam-configuration/list",
  maxWidth: "max-w-5xl",
  emptyLabel: "CAM configuration creation",
  useController: useCamConfigController,
};

function useCamConfigController({
  id,
  advance,
  saving,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useCamConfigDetail(id);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // CamConfigSavePayload's flat JSON keys 1:1 — no dotted-path nesting needed.
  // sequence defaults to 1, never 0 — alpha-api's CamConfigurationParamList.
  // Sequence is `validate:"required"` on a plain int, so a submitted 0 always
  // fails (same trap as ChecklistParams.Sequence).
  useEffect(() => {
    setFormValues({
      title: detail?.title ?? "",
      type: detail?.type ?? "",
      product_code: detail?.product_code ?? "",
      sequence: detail?.sequence != null ? Number(detail.sequence) : 1,
      applicable_to: detail?.applicable_to ?? "",
      apply_capacity: detail?.apply_capacity ?? "",
      apply_for: detail?.apply_for ?? "",
      rule_id: detail?.rule_id != null ? String(detail.rule_id) : "",
      loan_type_id:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      template_id:
        detail?.template_id != null ? String(detail.template_id) : "",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(
      formValues,
    ) as Partial<CamConfigSavePayload>;

    const payload: CamConfigSavePayload = {
      ...(id ? { configuration_id: id } : {}),
      title: String(nested.title ?? ""),
      type: String(nested.type ?? ""),
      product_code: String(nested.product_code ?? ""),
      sequence: Number(nested.sequence ?? 1),
      applicable_to: String(nested.applicable_to ?? ""),
      apply_capacity: String(nested.apply_capacity ?? ""),
      apply_for: String(nested.apply_for ?? ""),
      rule_id: nested.rule_id ? String(nested.rule_id) : undefined,
      loan_type_id: nested.loan_type_id
        ? String(nested.loan_type_id)
        : undefined,
      template_id: nested.template_id ? String(nested.template_id) : undefined,
      status: Number(nested.status ?? 1),
    };

    const res = await advance(payload);
    if (!res) return;
    toast.success(
      `CAM configuration ${id ? "updated" : "created"} successfully`,
    );
    navigate("/settings/cam-configuration/list");
  };

  const stepContext: FormBuilderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save" : "Create",
    cancelHref: "/settings/cam-configuration/list",
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    singleStep: true,
  };
}
