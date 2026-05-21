import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useModuleDetail,
  useParentModuleOptions,
  useSaveModule,
  useUserTypeLookups,
} from "./module-form.api";
import type { ModuleSavePayload } from "./module-form.types";

// Legacy AddModule fields (no Yup schema in legacy — only required UI markers).
// Mirror those required markers as zod constraints.
const schema = z.object({
  module_id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  parent_module_id: z.string().optional(),
  user_type: z.string().min(1, "User type is required"),
  system: z.string().min(1, "System is required"),
  url: z.string().optional(),
  sequence: z.coerce.number().int().min(0),
  target: z.string().optional(),
  icon: z.string().optional(),
  allowed_permission: z
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
      { message: "Invalid JSON" }
    ),
  display_mode: z.string().min(1, "Display mode is required"),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const STATUS = [
  { value: 1, label: "Active" },
  { value: -1, label: "Inactive" },
];
const DISPLAY_MODE = [
  { value: "SHOW", label: "Show" },
  { value: "HIDE", label: "Hide" },
];
const TARGET = [
  { value: "self", label: "Self" },
  { value: "blank", label: "Blank" },
];

export default function ModuleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: userTypes = [] } = useUserTypeLookups();
  const { data: parents = [] } = useParentModuleOptions();
  const { data: detail } = useModuleDetail(id);
  const save = useSaveModule();

  const defaults: FormValues = useMemo(
    () => ({
      module_id: detail?.module_id != null ? String(detail.module_id) : undefined,
      name: detail?.name ?? "",
      code: detail?.code ?? "",
      description: detail?.description ?? "",
      parent_module_id:
        detail?.parent_module_id != null
          ? String(detail.parent_module_id)
          : "",
      user_type: detail?.user_type ?? "",
      system: detail?.system ?? "",
      url: detail?.url ?? "",
      sequence: Number(detail?.sequence ?? 0),
      target: detail?.target ?? "",
      icon: detail?.icon ?? "",
      allowed_permission:
        detail?.allowed_permission != null
          ? JSON.stringify(detail.allowed_permission)
          : "",
      display_mode: detail?.display_mode ?? "SHOW",
      status:
        detail?.status != null
          ? Number(detail.status)
          : 1,
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

  const onSubmit = handleSubmit(async (values) => {
    const payload: ModuleSavePayload = {
      ...(id ? { module_id: id } : {}),
      user_type: values.user_type,
      system: values.system,
      parent_module_id: values.parent_module_id ? values.parent_module_id : null,
      code: values.code,
      name: values.name,
      description: values.description,
      url: values.url,
      icon: values.icon,
      sequence: Number(values.sequence),
      target: values.target,
      allowed_permission: values.allowed_permission
        ? JSON.parse(values.allowed_permission)
        : null,
      status: Number(values.status),
      display_mode: values.display_mode,
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Module ${id ? "updated" : "saved"} successfully`);
      navigate("/settings/module/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {id ? "Edit Module" : "Add Module"}
          </h1>
          <p className="text-xs text-slate-400">Menu module configuration</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/module/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Code *" error={errors.code?.message}>
            <Input {...register("code")} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Input {...register("description")} />
          </Field>

          <Field label="Parent Module">
            <select
              className={selectClass}
              value={watch("parent_module_id") ?? ""}
              onChange={(e) => setValue("parent_module_id", e.target.value)}
            >
              <option value="">— None —</option>
              {parents.map((p) => (
                <option key={String(p.module_id)} value={String(p.module_id)}>
                  {p.name} ({p.system})
                </option>
              ))}
            </select>
          </Field>
          <Field label="User Type *" error={errors.user_type?.message}>
            <select
              className={selectClass}
              value={watch("user_type")}
              onChange={(e) =>
                setValue("user_type", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select</option>
              {userTypes.map((u) => (
                <option key={u.lu_key} value={u.lu_key}>
                  {u.lu_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="System *" error={errors.system?.message}>
            <Input {...register("system")} />
          </Field>

          <Field label="URL">
            <Input {...register("url")} />
          </Field>
          <Field label="Sequence *" error={errors.sequence?.message}>
            <Input type="number" {...register("sequence")} />
          </Field>
          <Field label="Target">
            <select
              className={selectClass}
              value={watch("target") ?? ""}
              onChange={(e) => setValue("target", e.target.value)}
            >
              <option value="">— None —</option>
              {TARGET.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Icon">
            <Input {...register("icon")} />
          </Field>
          <Field label="Display Mode *" error={errors.display_mode?.message}>
            <select
              className={selectClass}
              value={watch("display_mode")}
              onChange={(e) =>
                setValue("display_mode", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              {DISPLAY_MODE.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
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
              {STATUS.map((s) => (
                <option key={s.value} value={String(s.value)}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2 lg:col-span-3">
            <Label className="mb-1.5 block text-xs font-medium text-slate-600">
              Allowed Permissions (JSON)
            </Label>
            <textarea
              rows={4}
              {...register("allowed_permission")}
              placeholder='{"view": true, "add": true, "edit": true}'
              className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            />
            {errors.allowed_permission && (
              <p className="mt-1.5 text-xs text-rose-500">
                {errors.allowed_permission.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/module/list">Back</Link>
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
