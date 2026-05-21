import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { OutputList, type GroupCondition } from "@/components/query-builder";
import { parameterToFieldOption } from "@/features/rule/rule-form/rule-form.types";
import {
  fetchLenderSchemeById,
  fetchLinkedScheme,
  fetchRuleById,
  updateLenderScheme,
  useLenderSchemeOptions,
  useLoanTypeOptions,
  useNpaRuleCategoryDetail,
  useNpaRuleParameterList,
  useSaveNpaRuleCategory,
  useSaveRuleForNpa,
} from "./npa-rule-form.api";
import {
  NPA_RULE_TYPES,
  type NpaRuleCategorySavePayload,
  type RuleSaveForNpaPayload,
} from "./npa-rule-form.types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  error_message: z.string().optional(),
  loan_type: z.string().min(1, "Loan Type is required"),
  lender_scheme: z.string().optional(),
  rule_type: z.string().min(1, "Rule Type is required"),
  rule_id: z.string().optional(),
  status: z.coerce.number().int(),
  isRuleRequired: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY_RULE: GroupCondition = {
  operator: "OR",
  output: {},
  conditions: [{ operator: "AND", output: {}, conditions: [] }],
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function NpaRuleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: loanTypes = [] } = useLoanTypeOptions();
  const { data: schemes = [] } = useLenderSchemeOptions();
  const { data: parameters = [] } = useNpaRuleParameterList();
  const { data: detail } = useNpaRuleCategoryDetail(id);
  const saveRule = useSaveRuleForNpa();
  const saveCategory = useSaveNpaRuleCategory();

  const fieldOptions = useMemo(
    () => parameters.map(parameterToFieldOption),
    [parameters]
  );

  const [ruleTree, setRuleTree] = useState<GroupCondition>(EMPTY_RULE);
  const [existingRuleName, setExistingRuleName] = useState("");
  const [originalScheme, setOriginalScheme] = useState("");

  const defaults: FormValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      error_message: detail?.fail_message ?? "",
      loan_type:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      lender_scheme: "",
      rule_type: detail?.rule_type ?? "",
      rule_id: detail?.rule_id != null ? String(detail.rule_id) : "",
      status: detail?.status != null ? Number(detail.status) : 1,
      isRuleRequired: Boolean(detail?.rule_id),
    }),
    [detail]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // On edit: hydrate the rule tree + linked scheme.
  useEffect(() => {
    if (!detail) return;
    const ruleId = detail.rule_id;
    const ruleType = detail.rule_type;
    if (ruleId) {
      fetchRuleById(ruleId).then((r) => {
        if (!r) return;
        setExistingRuleName(r?.name ?? "");
        setRuleTree(r?.rule ?? EMPTY_RULE);
      });
    }
    if (detail.rule_category_id && ruleType) {
      fetchLinkedScheme(detail.rule_category_id, ruleType).then((schemeId) => {
        setOriginalScheme(schemeId);
        setValue("lender_scheme", schemeId);
      });
    }
  }, [detail, setValue]);

  const ruleRequired = watch("isRuleRequired");

  // Legacy lender-scheme echo: fetch the scheme, patch the relevant
  // npa_*_rule_id field, then POST it back. Used on both removal & set.
  const patchLenderSchemeRuleId = async (
    schemeId: string,
    nextRuleCategoryId: string,
    ruleType: string
  ) => {
    const scheme = await fetchLenderSchemeById(schemeId);
    if (!scheme) return;
    const next = {
      ...scheme,
      ...(ruleType === "NPA_MARKING"
        ? { npa_marking_rule_id: nextRuleCategoryId }
        : { npa_provisioning_rule_id: nextRuleCategoryId }),
    };
    await updateLenderScheme(next);
  };

  const onSubmit = handleSubmit(async (values) => {
    let submittedRuleId = values.rule_id ?? "";

    // Step 1 — save the rule if required AND tree has at least one condition.
    const hasCondition =
      (ruleTree.conditions[0] as GroupCondition | undefined)?.conditions
        ?.length ?? 0;
    if (values.isRuleRequired && hasCondition > 0) {
      try {
        const rulePayload: RuleSaveForNpaPayload = {
          ...(values.rule_id ? { rule_id: values.rule_id } : {}),
          rule_name: values.rule_id ? existingRuleName : values.name,
          rule_type: "",
          status: Number(values.status),
          rule: ruleTree,
          validation_params: null,
          output_params: null,
        };
        const res = await saveRule.mutateAsync(rulePayload);
        const newId =
          (res as any)?.data?.rule_id ??
          (res as any)?.result?.rule_id ??
          (res as any)?.data?.data?.rule_id;
        if (!newId) {
          toast.error("Failed to submit rule. Please try again.");
          return;
        }
        submittedRuleId = String(newId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Rule save failed");
        return;
      }
    }

    // Step 2 — save the rule_category record.
    const payload: NpaRuleCategorySavePayload = {
      ...(id ? { rule_category_id: id } : {}),
      name: values.name,
      scope: "APPLICATION_FLOW",
      category_type: "NPA_RULE",
      journey_type: ["FULL_FLEDGED_APPLICATION"],
      rule_type: values.rule_type,
      loan_type_id: values.loan_type || null,
      lender_id: null,
      employment_type: [],
      lender_scheme_id: null,
      rule_id: submittedRuleId,
      applicable_to: "PRIMARY",
      fail_message: values.error_message ?? "",
      status: Number(values.status),
    };

    try {
      await saveCategory.mutateAsync(payload);

      // Step 3 — propagate to linked lender scheme (legacy side effect).
      if (submittedRuleId) {
        if (originalScheme && originalScheme !== values.lender_scheme) {
          await patchLenderSchemeRuleId(
            originalScheme,
            "",
            values.rule_type
          );
        }
        if (values.lender_scheme) {
          await patchLenderSchemeRuleId(
            values.lender_scheme,
            submittedRuleId,
            values.rule_type
          );
        }
      }

      toast.success(`NPA Rule ${id ? "Updated" : "Created"} Successfully`);
      navigate("/settings/npa-rules-list");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Failed to submit NPA rule category. Please try again."
      );
    }
  });

  const isPending = saveRule.isPending || saveCategory.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit NPA Rule" : "Add NPA Rule"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/npa-rules-list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Name *" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Enter Name" />
          </Field>

          <Field label="Error Message" error={errors.error_message?.message}>
            <Input
              {...register("error_message")}
              placeholder="Enter Error Message"
            />
          </Field>

          <Field label="Loan Type *" error={errors.loan_type?.message}>
            <select
              className={selectClass}
              value={watch("loan_type")}
              onChange={(e) =>
                setValue("loan_type", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select Loan Type</option>
              {loanTypes.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Lender Scheme">
            <select
              className={selectClass}
              value={watch("lender_scheme") ?? ""}
              onChange={(e) => setValue("lender_scheme", e.target.value)}
            >
              <option value="">Select Lender Scheme</option>
              {schemes.map((s) => (
                <option
                  key={String(s.lender_scheme_id)}
                  value={String(s.lender_scheme_id)}
                >
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Rule Type *" error={errors.rule_type?.message}>
            <select
              className={selectClass}
              value={watch("rule_type")}
              onChange={(e) =>
                setValue("rule_type", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select Rule Type</option>
              {NPA_RULE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status *" error={errors.status?.message}>
            <select
              className={selectClass}
              value={String(watch("status") ?? "")}
              onChange={(e) =>
                setValue("status", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
            >
              <option value="1">Active</option>
              <option value="-1">In-Active</option>
            </select>
          </Field>

          <div className="md:col-span-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={ruleRequired}
                onChange={(e) => setValue("isRuleRequired", e.target.checked)}
              />
              Is Rule Required
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Rule</Label>
          {ruleRequired ? (
            <OutputList
              value={ruleTree}
              onChange={setRuleTree}
              fieldOptions={fieldOptions}
            />
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center text-sm text-slate-400">
              No Rule Defined
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/npa-rules-list">Back</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
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
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
