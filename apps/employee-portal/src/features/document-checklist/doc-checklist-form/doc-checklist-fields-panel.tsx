import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import type {
  ChecklistField,
  ChecklistSource,
  DocumentRow,
  RuleRow,
} from "./doc-checklist-form.types";

// Legacy craft-frontend/src/pages/DocumentChecklist/OcrDocumentFieldMaster.js.
// alpha-api validates ChecklistFieldParams.Sequence / ChecklistSourceParams.Sequence
// as `validate:"required"` on a plain int — a 0 default always fails, so new
// rows default to sequence 1, never 0 (see doc-checklist-groups-panel.tsx for
// the same trap on group_sequence).
const fieldSchema = z.object({
  field_name: z.string().min(1, "Field name is required"),
  field_category: z.string().min(1, "Category is required"),
  target_field: z.string().optional(),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  status: z.coerce.number().int(),
  autofill_configuration: z.string().optional(),
});
type FieldValues = z.infer<typeof fieldSchema>;

const sourceSchema = z.object({
  source_type: z.string().min(1, "Source type is required"),
  document_id: z.string().optional(),
  source_field: z.string().optional(),
  match_type: z.string().optional(),
  rule_id: z.string().optional(),
  sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
  status: z.coerce.number().int(),
});
type SourceValues = z.infer<typeof sourceSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  fields: ChecklistField[];
  onChange: (next: ChecklistField[]) => void;
  fieldCategoryOptions: { value: string; label: string }[];
  sourceTypeOptions: { value: string; label: string }[];
  matchTypeOptions: { value: string; label: string }[];
  docs: DocumentRow[];
  rules: RuleRow[];
}

export function DocChecklistFieldsPanel({
  fields,
  onChange,
  fieldCategoryOptions,
  sourceTypeOptions,
  matchTypeOptions,
  docs,
  rules,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fieldEditing, setFieldEditing] = useState<
    { initial?: ChecklistField; index?: number } | null
  >(null);
  const [sourceEditing, setSourceEditing] = useState<
    { initial?: ChecklistSource; index?: number } | null
  >(null);

  const selectedField = selectedIndex != null ? fields[selectedIndex] : undefined;

  const upsertField = (f: ChecklistField, index?: number) => {
    if (index != null) {
      onChange(fields.map((ff, i) => (i === index ? f : ff)));
    } else {
      onChange([...fields, f]);
      setSelectedIndex(fields.length);
    }
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
    setSelectedIndex((prev) => {
      if (prev === index) return null;
      if (prev != null && prev > index) return prev - 1;
      return prev;
    });
  };

  const upsertSource = (s: ChecklistSource, index?: number) => {
    if (selectedIndex == null) return;
    onChange(
      fields.map((f, i) => {
        if (i !== selectedIndex) return f;
        const sources =
          index != null
            ? f.checklist_source.map((ss, si) => (si === index ? s : ss))
            : [...f.checklist_source, s];
        return { ...f, checklist_source: sources };
      }),
    );
  };

  const removeSource = (index: number) => {
    if (selectedIndex == null) return;
    onChange(
      fields.map((f, i) =>
        i !== selectedIndex
          ? f
          : {
              ...f,
              checklist_source: f.checklist_source.filter(
                (_, si) => si !== index,
              ),
            },
      ),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Checklist Fields
          </h3>
          <Button type="button" size="sm" onClick={() => setFieldEditing({})}>
            <Plus className="h-4 w-4" /> Add Field
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
            No fields added yet.
            <br />
            Click on &quot;Add Field&quot; button to add a new field.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {fields.map((f, i) => (
              <li
                key={f.checklist_field_id ?? `${f.field_name}-${i}`}
                onClick={() => setSelectedIndex(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2.5 ${
                  selectedIndex === i ? "bg-[#4C7DF0]/10" : "hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {f.field_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {fieldCategoryOptions.find(
                      (o) => o.value === f.field_category,
                    )?.label ?? f.field_category}
                    {" · seq "}
                    {f.sequence ?? 0}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFieldEditing({ initial: f, index: i });
                    }}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label="Edit field"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(i);
                    }}
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    aria-label="Delete field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Checklist Sources
          </h3>
          {selectedField && (
            <Button
              type="button"
              size="sm"
              onClick={() => setSourceEditing({})}
            >
              <Plus className="h-4 w-4" /> Add Source
            </Button>
          )}
        </div>
        {!selectedField ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
            No field selected.
            <br />
            Select a field from the left panel to view or add sources.
          </p>
        ) : selectedField.checklist_source.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
            No sources yet for &quot;{selectedField.field_name}&quot;.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Document</th>
                  <th className="px-3 py-2 text-left">Source Field</th>
                  <th className="px-3 py-2 text-left">Match</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedField.checklist_source.map((s, i) => {
                  const docLabel = docs.find(
                    (d) => String(d.document_id) === String(s.document_id),
                  )?.document_name;
                  return (
                    <tr
                      key={s.checklist_source_id ?? i}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {sourceTypeOptions.find((o) => o.value === s.source_type)
                          ?.label ?? s.source_type}
                      </td>
                      <td className="px-3 py-2">
                        {docLabel ?? s.document_id ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {s.source_field ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {matchTypeOptions.find((o) => o.value === s.match_type)
                          ?.label ??
                          s.match_type ??
                          "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSourceEditing({ initial: s, index: i })
                            }
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Edit source"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSource(i)}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                            aria-label="Delete source"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={fieldEditing !== null}
        onOpenChange={(o) => !o && setFieldEditing(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {fieldEditing?.initial ? "Edit Field" : "Add Field"}
            </DialogTitle>
          </DialogHeader>
          {fieldEditing !== null && (
            <FieldForm
              initial={fieldEditing.initial}
              categoryOptions={fieldCategoryOptions}
              onCancel={() => setFieldEditing(null)}
              onSubmit={(f) => {
                upsertField(f, fieldEditing.index);
                setFieldEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={sourceEditing !== null}
        onOpenChange={(o) => !o && setSourceEditing(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {sourceEditing?.initial ? "Edit Source" : "Add Source"}
            </DialogTitle>
          </DialogHeader>
          {sourceEditing !== null && (
            <SourceForm
              initial={sourceEditing.initial}
              sourceTypeOptions={sourceTypeOptions}
              matchTypeOptions={matchTypeOptions}
              docs={docs}
              rules={rules}
              onCancel={() => setSourceEditing(null)}
              onSubmit={(s) => {
                upsertSource(s, sourceEditing.index);
                setSourceEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldForm({
  initial,
  categoryOptions,
  onCancel,
  onSubmit,
}: {
  initial?: ChecklistField;
  categoryOptions: { value: string; label: string }[];
  onCancel: () => void;
  onSubmit: (f: ChecklistField) => void;
}) {
  const defaults: FieldValues = useMemo(
    () => ({
      field_name: initial?.field_name ?? "",
      field_category: initial?.field_category ?? "",
      target_field: initial?.target_field ?? "",
      sequence: Number(initial?.sequence ?? 1),
      status: initial?.status != null ? Number(initial.status) : 1,
      autofill_configuration:
        initial?.autofill_configuration != null
          ? JSON.stringify(initial.autofill_configuration)
          : "",
    }),
    [initial],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((v) => {
    let autofillConfiguration: unknown;
    if (v.autofill_configuration?.trim()) {
      try {
        autofillConfiguration = JSON.parse(v.autofill_configuration);
      } catch {
        toast.error("Autofill configuration must be valid JSON");
        return;
      }
    }
    onSubmit({
      checklist_field_id: initial?.checklist_field_id,
      field_name: v.field_name,
      field_category: v.field_category,
      target_field: v.target_field || undefined,
      sequence: Number(v.sequence),
      status: Number(v.status),
      autofill_configuration: autofillConfiguration,
      checklist_source: initial?.checklist_source ?? [],
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Field Name *" error={errors.field_name?.message}>
        <Input {...register("field_name")} />
      </Field>
      <Field label="Category *" error={errors.field_category?.message}>
        <select
          className={selectClass}
          value={watch("field_category")}
          onChange={(e) =>
            setValue("field_category", e.target.value, {
              shouldValidate: true,
            })
          }
        >
          <option value="">Select</option>
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Target Field">
        <Input {...register("target_field")} placeholder="e.g. applicant.pan_number" />
      </Field>
      <Field label="Sequence *" error={errors.sequence?.message}>
        <Input type="number" {...register("sequence")} />
      </Field>
      <Field label="Status *">
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
          <option value="-1">Inactive</option>
        </select>
      </Field>
      <Field label="Autofill Configuration (JSON)">
        <textarea
          className="min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          {...register("autofill_configuration")}
        />
      </Field>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Add"}</Button>
      </div>
    </form>
  );
}

function SourceForm({
  initial,
  sourceTypeOptions,
  matchTypeOptions,
  docs,
  rules,
  onCancel,
  onSubmit,
}: {
  initial?: ChecklistSource;
  sourceTypeOptions: { value: string; label: string }[];
  matchTypeOptions: { value: string; label: string }[];
  docs: DocumentRow[];
  rules: RuleRow[];
  onCancel: () => void;
  onSubmit: (s: ChecklistSource) => void;
}) {
  const defaults: SourceValues = useMemo(
    () => ({
      source_type: initial?.source_type ?? "",
      document_id:
        initial?.document_id != null ? String(initial.document_id) : "",
      source_field: initial?.source_field ?? "",
      match_type: initial?.match_type ?? "",
      rule_id: initial?.rule_id ?? "",
      sequence: Number(initial?.sequence ?? 1),
      status: initial?.status != null ? Number(initial.status) : 1,
    }),
    [initial],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SourceValues>({
    resolver: zodResolver(sourceSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((v) => {
    onSubmit({
      checklist_source_id: initial?.checklist_source_id,
      source_type: v.source_type,
      document_id: v.document_id || undefined,
      source_field: v.source_field || undefined,
      match_type: v.match_type || undefined,
      rule_id: v.rule_id || undefined,
      sequence: Number(v.sequence),
      status: Number(v.status),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Source Type *" error={errors.source_type?.message}>
        <select
          className={selectClass}
          value={watch("source_type")}
          onChange={(e) =>
            setValue("source_type", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select</option>
          {sourceTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Document">
        <select
          className={selectClass}
          value={watch("document_id") ?? ""}
          onChange={(e) => setValue("document_id", e.target.value)}
        >
          <option value="">Select</option>
          {docs.map((d) => (
            <option key={String(d.document_id)} value={String(d.document_id)}>
              {d.document_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Source Field">
        <Input {...register("source_field")} placeholder="e.g. pan" />
      </Field>
      <Field label="Match Type">
        <select
          className={selectClass}
          value={watch("match_type") ?? ""}
          onChange={(e) => setValue("match_type", e.target.value)}
        >
          <option value="">Select</option>
          {matchTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Rule">
        <select
          className={selectClass}
          value={watch("rule_id") ?? ""}
          onChange={(e) => setValue("rule_id", e.target.value)}
        >
          <option value="">Select</option>
          {rules.map((r) => (
            <option key={String(r.id)} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sequence *" error={errors.sequence?.message}>
        <Input type="number" {...register("sequence")} />
      </Field>
      <Field label="Status *">
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
          <option value="-1">Inactive</option>
        </select>
      </Field>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Add"}</Button>
      </div>
    </form>
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
