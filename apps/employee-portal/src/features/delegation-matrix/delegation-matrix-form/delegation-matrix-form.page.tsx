import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { OutputList, type GroupCondition } from "@/components/query-builder";
import {
  useUnderwritingMatrixDetail,
  useSaveUnderwritingMatrix,
  useDelegationFormLookups,
  useRuleDetail,
  useSaveRule,
  useParameterList,
} from "./delegation-matrix-form.api";
import {
  underwritingMatrixSchema,
  type UnderwritingMatrixFormValues,
  type UnderwritingMatrixSavePayload,
} from "./delegation-matrix-form.types";
import { RuleSelectModal } from "./rule-select-modal";
import type { RuleRow } from "@/features/rule/rule-list/rule-list.types";
import type { RuleSavePayload } from "../../rule/rule-form/rule-form.types";

const EMPTY_RULE: GroupCondition = {
  operator: "OR",
  output: {},
  conditions: [{ operator: "AND", output: {}, conditions: [] }],
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function DelegationMatrixFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  // --- API queries & mutations ---
  const { data: detail } = useUnderwritingMatrixDetail(id);
  const { data: lookups = [] } = useDelegationFormLookups();
  const { data: parameters = [] } = useParameterList();
  const saveMatrix = useSaveUnderwritingMatrix();
  const saveRule = useSaveRule();

  // --- options mapping ---
  const workflowTypeOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "WORKFLOW_TYPE")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups]
  );

  const hierarchyOptions = useMemo(
    () =>
      lookups
        .filter((l) => l.group_code === "HIERARCHY")
        .map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups]
  );

  const fieldOptions = useMemo(
    () =>
      parameters.map((p) => ({
        label: p.name,
        value: p.code,
        type: p.type,
        param_name: p.param_field,
        reference_table: p.reference_table,
        reference_column: p.reference_column,
        reference_label: p.reference_label,
        reference_condition: p.reference_condition,
      })),
    [parameters]
  );

  // --- states for rule and select-modal ---
  const [ruleCheck, setRuleCheck] = useState(false);
  const [ruleMode, setRuleMode] = useState<"ADD" | "CHOOSE" | "EDIT" | "">("");
  const [ruleTree, setRuleTree] = useState<GroupCondition>(EMPTY_RULE);
  const [ruleName, setRuleName] = useState("");
  const [existingRuleName, setExistingRuleName] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [reviewerLevels, setReviewerLevels] = useState<string[]>([]);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // --- form setup ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UnderwritingMatrixFormValues>({
    resolver: zodResolver(underwritingMatrixSchema),
    defaultValues: {
      workflow_type: "",
      approver_level: "",
      reviewer_levels: [],
      priority_order: 1,
      status: 1,
      rule_id: "",
    },
  });

  const watchWorkflowType = watch("workflow_type");
  const watchApproverLevel = watch("approver_level");

  // Sync reviewer levels with hook form values
  useEffect(() => {
    setValue("reviewer_levels", reviewerLevels, { shouldValidate: true });
  }, [reviewerLevels, setValue]);

  // Set default values from loaded detail
  useEffect(() => {
    if (detail) {
      reset({
        workflow_type: detail.workflow_type,
        approver_level: detail.approver_level,
        reviewer_levels: detail.reviewer_levels,
        priority_order: Number(detail.priority_order),
        status: Number(detail.status),
        rule_id: detail.rule_id || "",
      });
      setReviewerLevels(detail.reviewer_levels);
      if (detail.rule_id) {
        setRuleCheck(true);
        setSelectedRuleId(String(detail.rule_id));
        setRuleMode("EDIT");
      }
    }
  }, [detail, reset]);

  // Fetch selected rule details when selectedRuleId is loaded/selected
  const { data: ruleDetail } = useRuleDetail(selectedRuleId ?? undefined);

  useEffect(() => {
    if (ruleDetail) {
      setExistingRuleName(ruleDetail.name ?? "");
      if (ruleDetail.rule) {
        setRuleTree(ruleDetail.rule);
      }
    }
  }, [ruleDetail]);

  // Generate dynamic rule name: WORKFLOWTYPE_APPROVERLEVEL
  useEffect(() => {
    if (watchWorkflowType && watchApproverLevel) {
      const wfLabel =
        workflowTypeOptions.find((o) => o.value === watchWorkflowType)?.label ||
        "";
      const appLabel =
        hierarchyOptions.find((o) => o.value === watchApproverLevel)?.label ||
        "";
      if (wfLabel && appLabel) {
        const generated = `${wfLabel}_${appLabel}`
          .toUpperCase()
          .replace(/\s+/g, "_");
        setRuleName(generated);
      }
    } else {
      setRuleName("");
    }
  }, [watchWorkflowType, watchApproverLevel, workflowTypeOptions, hierarchyOptions]);

  // Handle selected rule from modal
  const handleSelectRule = (rule: RuleRow) => {
    setSelectedRuleId(String(rule.id));
    setValue("rule_id", String(rule.id));
    if (rule.rule) {
      setRuleTree(rule.rule as GroupCondition);
    }
    setExistingRuleName(rule.name ?? "");
    setRuleCheck(true);
  };

  // Submit flow
  const onSubmit = handleSubmit(async (values) => {
    let finalRuleId = values.rule_id || "";

    if (ruleCheck) {
      // Save rule first
      const firstCond = ruleTree.conditions?.[0] as GroupCondition | undefined;
      if (firstCond?.conditions && firstCond.conditions.length > 0) {
        const rulePayload: RuleSavePayload = {
          ...(finalRuleId ? { rule_id: finalRuleId } : {}),
          rule_name: finalRuleId ? existingRuleName : ruleName,
          rule_type: "",
          status: Number(values.status),
          rule: ruleTree,
          validation_params: null,
          output_params: null,
        };

        try {
          const ruleRes = (await saveRule.mutateAsync(rulePayload)) as any;
          // extract the saved rule_id
          const newId = ruleRes?.rule_id ?? ruleRes?.data?.rule_id ?? ruleRes?.data?.data?.rule_id;
          if (newId) {
            finalRuleId = String(newId);
          }
        } catch (err) {
          toast.error("Failed to save rule. Please verify rule conditions.");
          return;
        }
      }
    } else {
      finalRuleId = "";
    }

    const payload: UnderwritingMatrixSavePayload = {
      ...(id ? { underwriting_matrix_id: id } : {}),
      workflow_type: values.workflow_type,
      rule_id: finalRuleId,
      approver_level: values.approver_level,
      priority_order: Number(values.priority_order),
      reviewer_levels: values.reviewer_levels,
      status: Number(values.status),
    };

    try {
      await saveMatrix.mutateAsync(payload);
      toast.success(`Underwriting Matrix ${id ? "updated" : "created"} successfully`);
      navigate("/settings/delegation-list");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save underwriting matrix");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Delegation Matrix" : "Add Delegation Matrix"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/delegation-list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Workflow Type *" error={errors.workflow_type?.message}>
            <select
              className={selectClass}
              value={watch("workflow_type")}
              onChange={(e) =>
                setValue("workflow_type", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select Workflow Type</option>
              {workflowTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Approve Level *" error={errors.approver_level?.message}>
            <select
              className={selectClass}
              value={watch("approver_level")}
              onChange={(e) =>
                setValue("approver_level", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select Approve Level</option>
              {hierarchyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority Order *" error={errors.priority_order?.message}>
            <Input {...register("priority_order")} placeholder="Priority Order" />
          </Field>

          <Field label="Status *" error={errors.status?.message}>
            <select
              className={selectClass}
              value={String(watch("status") ?? "1")}
              onChange={(e) =>
                setValue("status", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
            >
              <option value="1">Active</option>
              <option value="-1">Inactive</option>
            </select>
          </Field>
        </div>

        {/* Reviewer levels grid of checkboxes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-600 block">
            Reviewer Levels *
          </Label>
          {errors.reviewer_levels && (
            <p className="text-xs text-rose-500">{errors.reviewer_levels.message}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            {hierarchyOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-white bg-white shadow-sm hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={reviewerLevels.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setReviewerLevels([...reviewerLevels, opt.value]);
                    } else {
                      setReviewerLevels(reviewerLevels.filter((x) => x !== opt.value));
                    }
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rule inclusion toggle */}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
          <input
            type="checkbox"
            id="ruleCheck"
            checked={ruleCheck}
            onChange={(e) => {
              setRuleCheck(e.target.checked);
              if (e.target.checked && ruleMode === "") {
                setRuleMode("ADD");
                setRuleTree(EMPTY_RULE);
              }
            }}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <Label htmlFor="ruleCheck" className="text-sm font-semibold text-slate-700 cursor-pointer">
            Is Rule Required
          </Label>
        </div>

        {/* Rule builder section */}
        {ruleCheck && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Rule Configuration
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {selectedRuleId ? `Editing existing rule: ${existingRuleName}` : `Generating new rule: ${ruleName || "..."}`}
                </span>
              </div>

              {/* Actions dropdown */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="gap-1.5"
                >
                  <Settings className="h-4 w-4" /> Action
                </Button>
                {isActionsOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRuleId(null);
                        setValue("rule_id", "");
                        setRuleMode("ADD");
                        setRuleTree(EMPTY_RULE);
                        setIsActionsOpen(false);
                      }}
                      className="w-full text-left rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Add New Rule
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRuleModalOpen(true);
                        setRuleMode("CHOOSE");
                        setIsActionsOpen(false);
                      }}
                      className="w-full text-left rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Select & Use
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRuleId(null);
                        setValue("rule_id", "");
                        setRuleMode("ADD");
                        setIsActionsOpen(false);
                      }}
                      className="w-full text-left rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Clone & Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <OutputList
                value={ruleTree}
                onChange={setRuleTree}
                fieldOptions={fieldOptions}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/delegation-list">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saveMatrix.isPending || saveRule.isPending}>
            {saveMatrix.isPending || saveRule.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>

      {/* Select Rule modal */}
      <RuleSelectModal
        open={ruleModalOpen}
        onClose={() => setRuleModalOpen(false)}
        onSelect={handleSelectRule}
      />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
