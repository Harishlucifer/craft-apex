import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useFieldMasterDetail,
  useSaveFieldMaster,
} from "./field-master-form.api";
import {
  FIELD_MASTER_TYPES,
  type FieldMasterSavePayload,
} from "./field-master-form.types";

const schema = z.object({
  type: z.string().min(1, "Type is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[A-Z0-9_]+$/, "Only uppercase letters, numbers, and underscores"),
  name: z.string().min(1, "Name is required"),
  sequence: z.coerce.number().int(),
  status: z.coerce.number().int(),
  data: z
    .string()
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Data must be valid JSON" }
    ),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function FieldMasterFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: detail } = useFieldMasterDetail(id);
  const save = useSaveFieldMaster();

  const defaults: FormValues = useMemo(
    () => ({
      type: detail?.type ?? "FIELD",
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      sequence: Number(detail?.sequence ?? 0),
      status: detail?.status != null ? Number(detail.status) : 1,
      data:
        detail?.data != null ? JSON.stringify(detail.data, null, 2) : "{}",
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

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  useEffect(() => {
    setTags(Array.isArray(detail?.tags) ? detail!.tags! : []);
  }, [detail?.tags]);

  const onSubmit = handleSubmit(async (values) => {
    if (tags.length === 0) {
      toast.error("At least one tag is required");
      return;
    }
    const payload: FieldMasterSavePayload = {
      ...(id ? { id } : {}),
      type: values.type,
      code: values.code,
      name: values.name,
      sequence: Number(values.sequence),
      status: Number(values.status),
      tags,
      data: values.data ? JSON.parse(values.data) : {},
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Field master ${id ? "updated" : "saved"} successfully`);
      navigate("/field-list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setTags((prev) => [...prev, v]);
    setTagInput("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Field/Component" : "Add Field/Component"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/field-list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Type *" error={errors.type?.message}>
            <select
              className={selectClass}
              value={watch("type")}
              onChange={(e) =>
                setValue("type", e.target.value, { shouldValidate: true })
              }
            >
              {FIELD_MASTER_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Code *" error={errors.code?.message}>
            <Input
              {...register("code")}
              placeholder="UPPER_SNAKE_CASE"
              onChange={(e) =>
                setValue(
                  "code",
                  e.target.value.toUpperCase().replace(/\s+/g, "_"),
                  { shouldValidate: true }
                )
              }
            />
          </Field>
          <Field label="Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Sequence *" error={errors.sequence?.message}>
            <Input type="number" {...register("sequence")} />
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
              <option value="-1">Inactive</option>
            </select>
          </Field>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Tags <span className="text-rose-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag…"
              className="max-w-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((t, i) => (
                <button
                  key={`${t}-${i}`}
                  type="button"
                  onClick={() =>
                    setTags((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-[#4C7DF0]/10 px-3 py-1 text-xs font-medium text-[#4C7DF0]"
                >
                  {t} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
          {tags.length === 0 && (
            <p className="text-xs text-rose-500">
              At least one tag is required
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Field/Component Data (JSON)
          </Label>
          <textarea
            rows={10}
            {...register("data")}
            placeholder='{ "label": "...", "dataType": "string", "fieldType": "TEXT", "validation": {} }'
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
          {errors.data && (
            <p className="text-xs text-rose-500">{errors.data.message}</p>
          )}
          <p className="text-xs text-slate-400">
            Legacy form-builder UI (sections, drag-drop, per-field validation)
            isn't ported yet — for now configure the field schema as JSON.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/field-list">Back</Link>
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
