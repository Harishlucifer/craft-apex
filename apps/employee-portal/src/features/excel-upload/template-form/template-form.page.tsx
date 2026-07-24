import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { excelUploadErrorMessage } from "../excel-upload-errors";
import { ExcelUploadNav } from "../excel-upload-nav";
import { useTemplateDetail } from "../template-list/template-list.api";
import { useFormDefinition, useSaveTemplate } from "./template-form.api";

const mappingSchema = z.object({
  excel_column: z.string().min(1, "Required"),
  excel_header: z.string().min(1, "Required"),
  form_field_key: z.string().min(1, "Pick a field"),
  is_mandatory: z.boolean(),
  default_value: z.string(),
});

const schema = z.object({
  template_code: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores only"),
  name: z.string().min(3, "3-80 chars").max(80),
  form_entity_type: z.string().min(1),
  column_mapping: z.array(mappingSchema).min(1, "Map at least one column"),
  dedupe_keys: z.array(z.string()).min(1, "Pick at least one dedupe key"),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function TemplateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: detail } = useTemplateDetail(id);
  const { data: formDef } = useFormDefinition("PARTNER_PROFILE");
  const saveTemplate = useSaveTemplate();

  const defaults: FormValues = useMemo(
    () => ({
      template_code: detail?.template_code ?? "",
      name: detail?.name ?? "",
      form_entity_type: "PARTNER_PROFILE",
      column_mapping: detail?.column_mapping?.length
        ? detail.column_mapping.map((m) => ({
            excel_column: m.excel_column,
            excel_header: m.excel_header,
            form_field_key: m.form_field_key,
            is_mandatory: m.is_mandatory,
            default_value: m.default_value ?? "",
          }))
        : [{ excel_column: "A", excel_header: "", form_field_key: "", is_mandatory: true, default_value: "" }],
      dedupe_keys: detail?.dedupe_keys ?? [],
    }),
    [detail]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "column_mapping" });

  const mapping = watch("column_mapping");
  const dedupeKeys = watch("dedupe_keys");
  const mandatoryMappedKeys = useMemo(
    () => mapping.filter((m) => m.is_mandatory && m.form_field_key).map((m) => m.form_field_key),
    [mapping]
  );

  const fieldByName = useMemo(
    () => Object.fromEntries((formDef?.fields ?? []).map((f) => [f.name, f])),
    [formDef]
  );

  const unmappedMandatory = (formDef?.fields ?? []).filter(
    (f) => f.required && !f.conditional && !mandatoryMappedKeys.includes(f.name)
  );

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await saveTemplate.mutateAsync({
        id,
        template_code: values.template_code,
        name: values.name,
        form_entity_type: values.form_entity_type,
        column_mapping: values.column_mapping,
        dedupe_keys: values.dedupe_keys,
      });
      toast.success(`Template saved as Draft (v${result.version}).`);
      navigate("/settings/excel-upload/templates");
    } catch (err) {
      toast.error(excelUploadErrorMessage(err, "Could not save this template."));
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <ExcelUploadNav />
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <a href="/settings/excel-upload/templates">
            <ArrowLeft className="h-4 w-4" /> Back
          </a>
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Upload Template" : "New Upload Template"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Basics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Template code</Label>
              <Input {...register("template_code")} disabled={Boolean(id)} placeholder="partner_book_std" />
              {errors.template_code && (
                <p className="text-xs text-rose-500">{errors.template_code.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Partner Book Std" />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Column mapping</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                append({ excel_column: "", excel_header: "", form_field_key: "", is_mandatory: false, default_value: "" })
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add row
            </Button>
          </div>

          {unmappedMandatory.length > 0 && (
            <p className="text-xs font-medium text-amber-600">
              ⚠ Mandatory unmapped: {unmappedMandatory.map((f) => f.label).join(", ")}
            </p>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => {
              const selected = fieldByName[mapping[index]?.form_field_key ?? ""];
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    {...register(`column_mapping.${index}.excel_column` as const)}
                    placeholder="A"
                    className="col-span-1"
                  />
                  <Input
                    {...register(`column_mapping.${index}.excel_header` as const)}
                    placeholder="Excel header text"
                    className="col-span-3"
                  />
                  <select
                    {...register(`column_mapping.${index}.form_field_key` as const)}
                    className={`${selectClass} col-span-3`}
                  >
                    <option value="">— choose field —</option>
                    {(formDef?.fields ?? [])
                      .filter((f) => !f.blocked)
                      .map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label}
                          {f.required ? " *" : ""}
                        </option>
                      ))}
                  </select>
                  <Input
                    {...register(`column_mapping.${index}.default_value` as const)}
                    placeholder="Default (optional)"
                    className="col-span-2"
                  />
                  <label className="col-span-2 flex items-center gap-1.5 text-xs text-slate-600">
                    <input type="checkbox" {...register(`column_mapping.${index}.is_mandatory` as const)} />
                    Mandatory
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="col-span-1 text-rose-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {selected?.blocked && (
                    <p className="col-span-12 text-xs text-rose-500">
                      This field is blocked (Aadhaar-type) and cannot be mapped.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {errors.column_mapping && (
            <p className="text-xs text-rose-500">{errors.column_mapping.message as string}</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Dedupe key — pick from mandatory-mapped fields
          </h2>
          <div className="flex flex-wrap gap-2">
            {mandatoryMappedKeys.length === 0 && (
              <p className="text-xs text-slate-400">Map at least one mandatory field first.</p>
            )}
            {mandatoryMappedKeys.map((key) => {
              const active = dedupeKeys.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    const next = active
                      ? dedupeKeys.filter((k) => k !== key)
                      : [...dedupeKeys, key];
                    setValue("dedupe_keys", next, { shouldValidate: true, shouldDirty: true });
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    active
                      ? "border-[#4C7DF0] bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {fieldByName[key]?.label ?? key}
                </button>
              );
            })}
          </div>
          {errors.dedupe_keys && (
            <p className="text-xs text-rose-500">{errors.dedupe_keys.message as string}</p>
          )}
          <p className="text-xs text-slate-400">
            On a dedupe-key match (existing partner or an earlier row in the same file), the row
            is skipped and reported — never updated.
          </p>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting || saveTemplate.isPending}>
            Save Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
