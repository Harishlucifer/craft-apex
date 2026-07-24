import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import {
  useChecklistDetail,
  useChecklistLookups,
  useChecklistRules,
  useDocClassOptions,
  useDocOptions,
  useOcrServiceProviders,
} from "./doc-checklist-form.api";
import type {
  ChecklistDetail,
  ChecklistField,
  ChecklistGroup,
  ChecklistSavePayload,
} from "./doc-checklist-form.types";
import type { ChecklistMasterStepContext } from "./doc-checklist-form.steps";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Document Checklist Master create/edit. Driven by the generic
 * MasterWorkflowPage (see routes.tsx); this module supplies only the bespoke
 * controller: the FORM_BUILDER header step's defaults + payload, and the
 * checklist master groups/fields steps' context (editors + their own save).
 *
 * State management deliberately mirrors the legacy
 * craft-frontend/src/pages/DocumentChecklist/AddDocChecklist.js pattern: there
 * is a single `checklistData` snapshot kept in local state, seeded once from
 * the detail query (edit mode) and thereafter overwritten SYNCHRONOUSLY from
 * each save's own response (`res.result`) — never from a query refetch. All
 * three steps share the one `/alpha/v1/master/checklist` upsert endpoint and
 * alpha-api requires the full header (title/type/sequence/applicable_to are
 * `validate:"required"`) on every save, so every step's payload is built from
 * `checklistData`, not from whatever the detail query happens to have loaded.
 */
export const docChecklistMaster: MasterWorkflowPageProps = {
  noun: "Document Checklist Master",
  workflowType: WorkflowType.ChecklistMasterCreation,
  listPath: "/settings/document/checklist",
  maxWidth: "max-w-6xl",
  emptyLabel: "document checklist master creation",
  useController: useDocChecklistController,
};

function useDocChecklistController({
  id,
  advance,
  saving,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useChecklistDetail(id);
  const { data: lookups = [] } = useChecklistLookups();
  const { data: docClasses = [] } = useDocClassOptions();
  const { data: docs = [] } = useDocOptions();
  const { data: rules = [] } = useChecklistRules();
  const { data: providers = [] } = useOcrServiceProviders();

  const mandatoryOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "CHECKLIST_ITEM_MANDATORY")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups],
  );
  const fieldCategoryOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "CHECKLIST_FIELD_CATEGORY")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups],
  );
  const sourceTypeOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "CHECKLIST_SOURCE_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups],
  );
  const matchTypeOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "SOURCE_MATCH_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups],
  );

  // The authoritative snapshot for the whole wizard — see module doc comment.
  const [checklistData, setChecklistData] = useState<ChecklistDetail | null>(
    null,
  );
  useEffect(() => {
    if (detail && !checklistData) setChecklistData(detail);
    // Only ever hydrate from the query once; every save overwrites this
    // directly with the server's own response (see submit* below).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  useEffect(() => {
    setGroups(
      Array.isArray(checklistData?.checklist_group)
        ? checklistData!.checklist_group!
        : [],
    );
  }, [checklistData?.checklist_group]);

  const [fields, setFields] = useState<ChecklistField[]>([]);
  useEffect(() => {
    setFields(
      Array.isArray(checklistData?.checklist_field)
        ? checklistData!.checklist_field!
        : [],
    );
  }, [checklistData?.checklist_field]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // ChecklistSavePayload's JSON structure exactly (e.g. "loan_type.loan_type_id"),
  // per buildNestedFormPayload below. "loan_type.loan_type_name" is expected to
  // be populated by the loan_type field's `autoFill` (type: "option") in the
  // backend's form_builder JSON, since the dropdown itself only carries the id.
  // sequence defaults to 1, never 0 — alpha-api's ChecklistParams.Sequence is
  // `validate:"required"` on a plain int, so a submitted 0 always fails.
  useEffect(() => {
    setFormValues({
      title: checklistData?.title ?? "",
      type: checklistData?.type ?? "",
      sequence:
        checklistData?.sequence != null ? Number(checklistData.sequence) : 1,
      status: checklistData?.status != null ? Number(checklistData.status) : 1,
      applicable_to: checklistData?.applicable_to ?? "",
      "loan_type.loan_type_id":
        checklistData?.loan_type?.loan_type_id != null
          ? String(checklistData.loan_type.loan_type_id)
          : "",
      "loan_type.loan_type_name": checklistData?.loan_type?.loan_type_name ?? "",
      lender_id:
        checklistData?.lender_id != null
          ? String(checklistData.lender_id)
          : "",
      rule_id:
        checklistData?.rule_id != null ? String(checklistData.rule_id) : "",
      tags: Array.isArray(checklistData?.tags) ? checklistData!.tags! : [],
    });
  }, [checklistData]);

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(formValues) as Partial<
      ChecklistSavePayload
    > & {
      loan_type?: { loan_type_id?: string | number; loan_type_name?: string };
    };

    const payload: ChecklistSavePayload = {
      ...(checklistData?.checklist_id
        ? { checklist_id: checklistData.checklist_id }
        : id
          ? { checklist_id: id }
          : {}),
      title: String(nested.title ?? ""),
      type: String(nested.type ?? ""),
      sequence: Number(nested.sequence ?? 1),
      status: Number(nested.status ?? 1),
      applicable_to: String(nested.applicable_to ?? ""),
      loan_type: nested.loan_type?.loan_type_id
        ? {
            loan_type_id: nested.loan_type.loan_type_id,
            loan_type_name: nested.loan_type.loan_type_name ?? "",
          }
        : null,
      lender_id: nested.lender_id ? nested.lender_id : null,
      rule_id: nested.rule_id ? String(nested.rule_id) : null,
      tags: Array.isArray(nested.tags) ? nested.tags : [],
      // Preserve groups/fields from local state so a header-only save
      // doesn't drop step 2/3's data.
      checklist_group: groups,
      checklist_field: fields,
    };

    const res = await advance(payload);
    if (!res) return;
    if (res.result) setChecklistData(res.result as ChecklistDetail);
    const newId = res.sourceId ?? id;
    if (newId && newId !== id) {
      setSavedId(String(newId));
    }
    toast.success(
      `Document checklist master ${id ? "updated" : "saved"} successfully`,
    );
    // The server's resume (last_active_step_id) advances the stepper.
  };

  // Shared by the groups/fields steps — same single upsert endpoint, full
  // header resent every time (see module doc comment), sourced from the
  // synchronously-updated `checklistData`, never the detail query.
  const buildFullPayload = (): ChecklistSavePayload => ({
    ...(checklistData?.checklist_id
      ? { checklist_id: checklistData.checklist_id }
      : id
        ? { checklist_id: id }
        : {}),
    title: checklistData?.title ?? "",
    type: checklistData?.type ?? "",
    sequence: Number(checklistData?.sequence ?? 1),
    status: Number(checklistData?.status ?? 1),
    applicable_to: checklistData?.applicable_to ?? "",
    loan_type: checklistData?.loan_type?.loan_type_id
      ? {
          loan_type_id: checklistData.loan_type.loan_type_id,
          loan_type_name: checklistData.loan_type.loan_type_name ?? "",
        }
      : null,
    lender_id: checklistData?.lender_id ?? null,
    rule_id:
      checklistData?.rule_id != null ? String(checklistData.rule_id) : null,
    tags: Array.isArray(checklistData?.tags) ? checklistData!.tags! : [],
    checklist_group: groups,
    checklist_field: fields,
  });

  const submitGroupsStep = async () => {
    if (!checklistData && !id) return;
    const res = await advance(buildFullPayload());
    if (!res) return;
    if (res.result) setChecklistData(res.result as ChecklistDetail);
    toast.success("Checklist master groups saved successfully");
    // The server's resume (last_active_step_id) advances to Field Master.
  };

  const submitFieldsStep = async () => {
    if (!checklistData && !id) return;
    const res = await advance(buildFullPayload());
    if (!res) return;
    toast.success(
      `Document checklist master ${id ? "updated" : "created"} successfully`,
    );
    navigate("/settings/document/checklist");
  };

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & ChecklistMasterStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save & Next" : "Create & Next",
    cancelHref: "/settings/document/checklist",
    mandatoryOptions,
    docClasses,
    docs,
    rules,
    providers,
    groups,
    onGroupsChange: setGroups,
    onGroupsSave: submitGroupsStep,
    fieldCategoryOptions,
    sourceTypeOptions,
    matchTypeOptions,
    fields,
    onFieldsChange: setFields,
    onFinish: submitFieldsStep,
    saving,
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(id),
  };
}
