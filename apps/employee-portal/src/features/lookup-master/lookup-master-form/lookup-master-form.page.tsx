import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useLookupDetail } from "./lookup-master-form.api";
import type { LookupSavePayload } from "./lookup-master-form.types";
import {
  buildNestedFormPayload,
  saveStepData,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Lookup Master create/edit — a single-FORM_BUILDER-step master (no
 * stepper), same shape as territory-form.page.tsx. `created_by === "SYSTEM"`
 * rows are read-only (legacy AddLookup.js): the form_builder JSON disables
 * group_code/lu_key/status via `disabledOn: { field: "created_by", values:
 * ["SYSTEM"] }`, and submitFormBuilderStep below refuses to save at all for
 * a SYSTEM row (legacy also fully disabled its Save button in that case).
 * `lu_value` has no independent input — legacy always derived it from
 * `lu_key` (spaces + uppercase) and never let the user edit it directly, so
 * it's computed here at submit time instead of being a form field.
 */
export const lookupMasterMaster: MasterWorkflowPageProps = {
  noun: "Lookup Master",
  workflowType: WorkflowType.LookupMasterCreation,
  listPath: "/settings/lookup-master",
  maxWidth: "max-w-3xl",
  emptyLabel: "lookup master creation",
  useController: useLookupMasterController,
};

function useLookupMasterController({
  id,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultGroupCode = searchParams.get("group_code") ?? "";

  const { data: detail } = useLookupDetail(id);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  // Bypasses the generic advance()/executeWorkflow chain (see submitFormBuilderStep
  // below) — tracked locally instead of using MasterControllerArgs.saving.
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues({
      group_code: detail?.group_code ?? defaultGroupCode,
      lu_key: detail?.lu_key ?? "",
      lu_name: detail?.lu_name ?? "",
      created_by: detail?.created_by || "USER",
      status: detail?.status != null ? Number(detail.status) : 1,
    });
    // Only re-seed when the detail query resolves; defaultGroupCode is a
    // one-time create-mode default, not something that should re-trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const submitFormBuilderStep = async () => {
    if (formValues.created_by === "SYSTEM") {
      toast.error("System lookups can't be edited");
      return;
    }

    const nested = buildNestedFormPayload(
      formValues,
    ) as Partial<LookupSavePayload>;

    const luKey = String(nested.lu_key ?? "")
      .trim()
      .replace(/ /g, "_")
      .toUpperCase();

    const payload: LookupSavePayload = {
      ...(id ? { id } : {}),
      group_code: String(nested.group_code ?? ""),
      lu_key: luKey,
      lu_name: String(nested.lu_name ?? ""),
      lu_value: luKey.replace(/_/g, " ").toUpperCase(),
      created_by: String(nested.created_by ?? "USER"),
      status: Number(nested.status ?? 1),
    };

    // POST /alpha/v1/lookup/create's response is `{status, message}` — no
    // id at all, so the generic advance()/executeWorkflow chain (which
    // requires a resolved source id to call /alpha/v1/workflow/execution)
    // can never succeed here even though the save itself did. This is a
    // flat, single-step, no-resume master, so call the save directly and
    // skip workflow-execution tracking entirely (see form-builder-step.tsx's
    // navigate_to, which also fires after this resolves if configured).
    setSaving(true);
    try {
      await saveStepData({
        workflowType: WorkflowType.LookupMasterCreation,
        data: payload,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      return;
    } finally {
      setSaving(false);
    }
    toast.success(`Lookup ${id ? "updated" : "saved"} successfully`);
    navigate("/settings/lookup-master");
  };

  const stepContext: FormBuilderStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save" : "Create",
    cancelHref: "/settings/lookup-master",
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    singleStep: true,
  };
}
