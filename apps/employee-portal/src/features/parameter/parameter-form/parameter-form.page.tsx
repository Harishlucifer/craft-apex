import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  ArithmeticBuilder,
  QueryBuilder,
  type ArithmeticGroup,
  type FieldOption,
  type GroupCondition,
} from "@/components/query-builder";
import {
  useJsonStruct,
  useLookupGroupCodes,
  useParameterDetail,
  useParameterLookups,
  useSaveParameter,
  useTableSchema,
} from "./parameter-form.api";
import {
  ParameterRuleType,
  type ParameterSavePayload,
} from "./parameter-form.types";

const schema = z
  .object({
    name: z
      .string()
      .min(3, "Name Should more than 3 characters")
      .max(50, "Maximum 50 characters only allowed"),
    type: z.string().min(1, "Type is required"),
    code: z.string().optional(),
    sourceType: z.string().optional(),
    source: z.string().optional(),
    paramField: z.string().optional(),
    status: z.coerce.number().int(),
    referenceTable: z.string().optional(),
    referenceColumn: z.string().optional(),
    referenceLabel: z.string().optional(),
    referenceCondition: z.string().optional(),
    paramValue: z.string().optional(),
    aggregateOperator: z.string().optional(),
    operation: z.string().optional(),
    condition_type: z.enum(["BUILDER", "QUERY"]),
    query: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type !== ParameterRuleType.Arithmetic) {
      if (!v.sourceType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sourceType"],
          message: "Source Type is required",
        });
      }
      if (!v.source) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source"],
          message: "Source is required",
        });
      }
      if (!v.paramField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paramField"],
          message: "Param Field is required",
        });
      }
    }
    if (v.type?.toUpperCase() === "OBJECT" && !v.paramValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paramValue"],
        message: "Param value is required",
      });
    }
    if (v.type?.toUpperCase().includes("REFERENCE")) {
      if (!v.referenceTable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["referenceTable"],
          message: "Select table",
        });
      }
      if (!v.referenceColumn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["referenceColumn"],
          message: "Select column",
        });
      }
    }
  });
type FormValues = z.infer<typeof schema>;

const SOURCE_TYPES = [
  { value: "JSON", label: "JSON" },
  { value: "TABLE", label: "TABLE" },
];

const STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const EMPTY_BUILDER: GroupCondition = {
  operator: "AND",
  conditions: [],
};

const EMPTY_ARITHMETIC: ArithmeticGroup = {
  operator: "+",
  conditions: [],
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

export default function ParameterFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useParameterLookups();
  const { data: tableSchema = {} } = useTableSchema();
  const { data: jsonStruct = {} } = useJsonStruct();
  const { data: groupCodeMap = {} } = useLookupGroupCodes();
  const { data: detail } = useParameterDetail(id);
  const save = useSaveParameter();

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      parameterType: filter("PARAMETER_TYPE"),
      aggregate: filter("AGGREGATE_OPERATOR"),
      programmed: filter("PROGRAMMED_PARAMETER"),
    };
  }, [lookups]);

  const tableNames = useMemo(
    () => Object.keys(tableSchema).map((k) => ({ value: k, label: k })),
    [tableSchema]
  );
  const groupCodes = useMemo(
    () =>
      Object.keys(groupCodeMap).map((k) => ({
        value: k,
        label: k
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    [groupCodeMap]
  );

  // Builders.
  const [builderTree, setBuilderTree] = useState<GroupCondition>(EMPTY_BUILDER);
  const [arithmeticTree, setArithmeticTree] =
    useState<ArithmeticGroup>(EMPTY_ARITHMETIC);

  // Tags (legacy: text + add button).
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Initial form values from detail.
  // Legacy: when reference_table === "core_lookup_master" the condition is
  // stored as `group_code='<X>'`; we strip the wrap on display, re-wrap on save.
  const unwrapGroupCode = (s?: string) => {
    if (!s) return "";
    const m = /^group_code='(.+)'$/.exec(s);
    return m ? m[1] ?? "" : s;
  };

  const defaults: FormValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      type: detail?.type ?? "",
      code: detail?.code ?? "",
      sourceType: detail?.source_type ?? "",
      source: detail?.source ?? "",
      paramField: detail?.param_field ?? "",
      status: detail?.status != null ? Number(detail.status) : 1,
      referenceTable: detail?.reference_table ?? "",
      referenceColumn: detail?.reference_column ?? "",
      referenceLabel: detail?.reference_label ?? "",
      referenceCondition:
        detail?.reference_table === "core_lookup_master"
          ? unwrapGroupCode(detail.reference_condition)
          : detail?.reference_condition ?? "",
      paramValue: detail?.param_value ?? "",
      aggregateOperator: detail?.aggregate_operator ?? "",
      operation: detail?.operation ?? "",
      condition_type: detail?.query != null ? "QUERY" : "BUILDER",
      query: detail?.query ?? "",
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
    setTags(Array.isArray(detail?.tags) ? detail!.tags! : []);
    // Seed the builder/arithmetic tree from saved conditions.
    if (detail?.conditions && typeof detail.conditions === "object") {
      if (detail.type === ParameterRuleType.Arithmetic) {
        setArithmeticTree(detail.conditions as ArithmeticGroup);
      } else {
        setBuilderTree(detail.conditions as GroupCondition);
      }
    }
  }, [defaults, detail, reset]);

  const type = watch("type");
  const sourceType = watch("sourceType");
  const source = watch("source");
  const referenceTable = watch("referenceTable");
  const conditionType = watch("condition_type");

  // Source options depend on source type.
  const sourceOptions = useMemo(() => {
    const map = sourceType === "JSON" ? jsonStruct : tableSchema;
    return Object.keys(map).map((k) => ({ value: k, label: k }));
  }, [sourceType, jsonStruct, tableSchema]);

  // Field/column options for the current source.
  const fieldOptions = useMemo<FieldOption[]>(() => {
    if (sourceType === "JSON") {
      const cols = jsonStruct[source ?? ""] ?? [];
      return cols.map((c) => ({ label: c, value: c }));
    }
    const cols = tableSchema[source ?? ""] ?? [];
    return cols.map((c) => ({ label: c.column, value: c.column }));
  }, [sourceType, source, jsonStruct, tableSchema]);

  // Reference column options.
  const referenceColumnOptions = useMemo(() => {
    const cols = tableSchema[referenceTable ?? ""] ?? [];
    return cols.map((c) => ({ value: c.column, label: c.field }));
  }, [tableSchema, referenceTable]);

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setTags((prev) => [...prev, v]);
    setTagInput("");
  };

  const removeTag = (i: number) =>
    setTags((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = handleSubmit(async (values) => {
    const isArithmetic = values.type === ParameterRuleType.Arithmetic;
    const isReference = (values.type ?? "").toUpperCase().includes("REFERENCE");
    const isProgrammed = values.type === ParameterRuleType.Programmed;

    const refCondition =
      isReference && values.referenceTable === "core_lookup_master"
        ? `group_code='${values.referenceCondition ?? ""}'`
        : values.referenceCondition;

    const payload: ParameterSavePayload = {
      ...(id ? { id } : {}),
      name: values.name,
      type: values.type,
      code: values.code,
      source_type: values.sourceType,
      source: values.source,
      param_field: values.paramField,
      reference_table: values.referenceTable,
      reference_column: values.referenceColumn,
      reference_label: values.referenceLabel,
      reference_condition: refCondition,
      api_url: "",
      token: "",
      param_value: values.paramValue,
      status: Number(values.status),
      query: values.query,
      conditions: isArithmetic
        ? arithmeticTree
        : values.condition_type === "BUILDER"
          ? builderTree
          : null,
      computed_params: {},
      aggregate_operator: values.aggregateOperator,
      operation: isProgrammed
        ? values.operation
        : values.condition_type === "QUERY"
          ? values.operation
          : null,
    };

    try {
      await save.mutateAsync(payload);
      toast.success(`Parameter ${id ? "updated" : "saved"} successfully`);
      navigate("/settings/parameter/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Parameter" : "Add Parameter"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/parameter/list">
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
            <Input {...register("name")} />
          </Field>

          <Field label="Type *" error={errors.type?.message}>
            <select
              className={selectClass}
              value={watch("type")}
              onChange={(e) => {
                const v = e.target.value;
                setValue("type", v, { shouldValidate: true });
                // Legacy: AGGREGATE auto-pins sourceType to TABLE.
                if (v === ParameterRuleType.Aggregate) {
                  setValue("sourceType", "TABLE", { shouldValidate: true });
                }
              }}
            >
              <option value="">Select</option>
              {options.parameterType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {type !== ParameterRuleType.Arithmetic && (
            <Field label="Source Type *" error={errors.sourceType?.message}>
              <select
                className={selectClass}
                disabled={type === ParameterRuleType.Aggregate}
                value={watch("sourceType") ?? ""}
                onChange={(e) => {
                  setValue("sourceType", e.target.value, {
                    shouldValidate: true,
                  });
                  setValue("source", "");
                  setValue("paramField", "");
                }}
              >
                <option value="">Select</option>
                {SOURCE_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {type !== ParameterRuleType.Arithmetic && (
            <Field label="Source *" error={errors.source?.message}>
              <select
                className={selectClass}
                value={watch("source") ?? ""}
                onChange={(e) => {
                  setValue("source", e.target.value, {
                    shouldValidate: true,
                  });
                  setValue("paramField", "");
                }}
                disabled={!sourceType}
              >
                <option value="">Select</option>
                {sourceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {type !== ParameterRuleType.Arithmetic && (
            <Field
              label={`${sourceType === "TABLE" ? "Column" : "Field"} Name *`}
              error={errors.paramField?.message}
            >
              <select
                className={selectClass}
                value={watch("paramField") ?? ""}
                onChange={(e) =>
                  setValue("paramField", e.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={!source}
              >
                <option value="">Select</option>
                {fieldOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {type === ParameterRuleType.Aggregate && (
            <Field
              label="Aggregate Operator *"
              error={errors.aggregateOperator?.message}
            >
              <select
                className={selectClass}
                value={watch("aggregateOperator") ?? ""}
                onChange={(e) =>
                  setValue("aggregateOperator", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {options.aggregate.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {type === ParameterRuleType.Programmed && (
            <Field
              label="Programmed Operator *"
              error={errors.operation?.message}
            >
              <select
                className={selectClass}
                value={watch("operation") ?? ""}
                onChange={(e) =>
                  setValue("operation", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {options.programmed.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {(type ?? "").toUpperCase() === "OBJECT" && (
            <Field label="Param Value *" error={errors.paramValue?.message}>
              <Input {...register("paramValue")} />
            </Field>
          )}

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
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-3">
            <Label className="text-xs font-medium text-slate-600">Tags</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Enter a value…"
              />
              <Button
                type="button"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <button
                    key={`${t}-${i}`}
                    type="button"
                    onClick={() => removeTag(i)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#4C7DF0]/10 px-3 py-1 text-xs font-medium text-[#4C7DF0]"
                  >
                    {t}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {sourceType === "TABLE" && type !== ParameterRuleType.Arithmetic && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-slate-600">
                {conditionType === "QUERY" ? "Query" : "Conditions"}
              </Label>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={
                    conditionType === "BUILDER"
                      ? "font-semibold text-slate-700"
                      : "text-slate-400"
                  }
                >
                  Builder
                </span>
                <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={conditionType === "QUERY"}
                    onChange={(e) =>
                      setValue(
                        "condition_type",
                        e.target.checked ? "QUERY" : "BUILDER",
                        { shouldValidate: true }
                      )
                    }
                  />
                  <span className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-[#4C7DF0]" />
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                </label>
                <span
                  className={
                    conditionType === "QUERY"
                      ? "font-semibold text-slate-700"
                      : "text-slate-400"
                  }
                >
                  Query
                </span>
              </div>
            </div>

            {conditionType === "BUILDER" ? (
              <QueryBuilder
                condition={builderTree}
                fieldOptions={fieldOptions}
                onChange={setBuilderTree}
              />
            ) : (
              <textarea
                rows={4}
                value={watch("query") ?? ""}
                onChange={(e) => setValue("query", e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
            )}
          </div>
        )}

        {type === ParameterRuleType.Arithmetic && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600">
              Conditions
            </Label>
            <ArithmeticBuilder
              condition={arithmeticTree}
              fieldOptions={[]}
              onChange={setArithmeticTree}
            />
          </div>
        )}

        {(type ?? "").toUpperCase().includes("REFERENCE") && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
            <h4 className="text-sm font-semibold text-slate-700">Reference</h4>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field
                label="Table Name *"
                error={errors.referenceTable?.message}
              >
                <select
                  className={selectClass}
                  value={watch("referenceTable") ?? ""}
                  onChange={(e) => {
                    setValue("referenceTable", e.target.value, {
                      shouldValidate: true,
                    });
                    setValue("referenceColumn", "");
                    setValue("referenceLabel", "");
                    setValue("referenceCondition", "");
                  }}
                >
                  <option value="">Select</option>
                  {tableNames.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Column Value *"
                error={errors.referenceColumn?.message}
              >
                <select
                  className={selectClass}
                  value={watch("referenceColumn") ?? ""}
                  onChange={(e) =>
                    setValue("referenceColumn", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  disabled={!referenceTable}
                >
                  <option value="">Select</option>
                  {referenceColumnOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Column Label *">
                <select
                  className={selectClass}
                  value={watch("referenceLabel") ?? ""}
                  onChange={(e) =>
                    setValue("referenceLabel", e.target.value)
                  }
                  disabled={!referenceTable}
                >
                  <option value="">Select</option>
                  {referenceColumnOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              {referenceTable === "core_lookup_master" ? (
                <Field label="Group Code *">
                  <select
                    className={selectClass}
                    value={watch("referenceCondition") ?? ""}
                    onChange={(e) =>
                      setValue("referenceCondition", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {groupCodes.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <div className="md:col-span-3">
                  <Label className="text-xs font-medium text-slate-600">
                    Condition
                  </Label>
                  <textarea
                    rows={2}
                    {...register("referenceCondition")}
                    className="mt-1.5 w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/parameter/list">Back</Link>
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
