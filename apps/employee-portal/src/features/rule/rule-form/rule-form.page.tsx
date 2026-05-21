import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { OutputList, type GroupCondition } from "@/components/query-builder";
import {
  useRuleDetail,
  useRuleParameterList,
  useSaveRule,
} from "./rule-form.api";
import { parameterToFieldOption } from "./rule-form.types";
import type { RuleSavePayload } from "./rule-form.types";

// Legacy RuleDefinition Yup → zod.
const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  type: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const EMPTY_RULE: GroupCondition = {
  operator: "OR",
  output: {},
  conditions: [{ operator: "AND", output: {}, conditions: [] }],
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function RuleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  // Legacy supports cloning via location.state — same fetch shape.
  const cloneState = location.state as
    | {
        rule?: GroupCondition;
        name?: string;
        type?: string;
        status?: number;
      }
    | null;

  const { data: detail } = useRuleDetail(id);
  const { data: parameters = [] } = useRuleParameterList();
  const save = useSaveRule();

  const fieldOptions = useMemo(
    () => parameters.map(parameterToFieldOption),
    [parameters]
  );

  const [ruleTree, setRuleTree] = useState<GroupCondition>(EMPTY_RULE);

  const defaults: FormValues = useMemo(
    () => ({
      name: detail?.name ?? cloneState?.name ?? "",
      type: detail?.type ?? cloneState?.type ?? "",
      status: Number(detail?.status ?? cloneState?.status ?? 1),
    }),
    [detail, cloneState]
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

  useEffect(() => {
    const source = detail?.rule ?? cloneState?.rule;
    if (source) setRuleTree(source);
  }, [detail?.rule, cloneState?.rule]);

  // Legacy: root-level error_message is held under rule.output.error_message.
  const errorMessage =
    typeof ruleTree.output?.error_message === "string"
      ? ruleTree.output.error_message
      : "";

  const setErrorMessage = (v: string) => {
    setRuleTree((prev) => ({
      ...prev,
      output: { ...(prev.output ?? {}), error_message: v },
    }));
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload: RuleSavePayload = {
      ...(id ? { rule_id: id } : {}),
      rule_name: values.name,
      rule_type: values.type ?? "",
      status: Number(values.status),
      rule: ruleTree,
      validation_params: null,
      output_params: null,
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Rule ${id ? "updated" : "created"} successfully`);
      navigate("/settings/rule/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Rule" : "Add Rule"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/rule/list">
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
            <Input {...register("name")} placeholder="Name" />
          </Field>

          <Field label="Type">
            <Input {...register("type")} placeholder="Type" />
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
            <Field label="Error Message">
              <Input
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Default message"
              />
            </Field>
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-xs font-medium text-slate-600">
            Input Parameters *
          </Label>
          <OutputList
            value={ruleTree}
            onChange={setRuleTree}
            fieldOptions={fieldOptions}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/rule/list">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
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
