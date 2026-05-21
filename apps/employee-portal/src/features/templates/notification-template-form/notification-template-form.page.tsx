import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, Pencil, Plus } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  useCommunicationProviderTypes,
  useParameterOptions,
  useSaveCommunicationProvider,
  useSaveTemplate,
  useServiceProviders,
  useTemplateDetail,
} from "./notification-template-form.api";
import type {
  ParameterAssociate,
  SelectedProvider,
  ServiceProviderRow,
  TemplateSavePayload,
} from "./notification-template-form.types";

const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

// Step 2 template form schema (legacy: name, module, template, status required).
const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  module: z.string().min(1, "Module is required"),
  template: z.string().min(1, "Template is required"),
  templateID: z.string().optional(),
  flowID: z.string().optional(),
  status: z.coerce.number().int(),
});
type TemplateValues = z.infer<typeof templateSchema>;

export default function NotificationTemplateFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { data: detail } = useTemplateDetail(id);
  const { data: providers = [], refetch: refetchProviders } =
    useServiceProviders();
  const { data: parameterOptions = [] } = useParameterOptions();
  const save = useSaveTemplate();

  const [step, setStep] = useState<0 | 1>(0);
  const [selectedProvider, setSelectedProvider] =
    useState<SelectedProvider | null>(null);
  const [parameters, setParameters] = useState<ParameterAssociate[]>([]);
  const [noProviderError, setNoProviderError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      module: "",
      template: "",
      templateID: "",
      flowID: "",
      status: 1,
    },
  });

  // Seed form & provider when editing.
  useEffect(() => {
    if (!detail) return;
    reset({
      name: detail.name ?? "",
      module: detail.module ?? "",
      template: detail.template ?? "",
      templateID:
        detail.template_id != null ? String(detail.template_id) : "",
      flowID: detail.flow_id != null ? String(detail.flow_id) : "",
      status: detail.status != null ? Number(detail.status) : 1,
    });
    if (detail.service_provider) {
      setSelectedProvider(detail.service_provider);
    }
    if (Array.isArray(detail.parameter_associate)) {
      setParameters(detail.parameter_associate);
    }
  }, [detail, reset]);

  // Legacy `handleTextareaChange`: re-derive parameter rows from {{var}} tokens
  // in the template, preserving previously-mapped rule_parameter_id values.
  const onTemplateChange = (text: string) => {
    setValue("template", text, { shouldValidate: true });
    const tokens = Array.from(text.matchAll(/\{\{(.*?)\}\}/g))
      .map((m) => (m[1] ?? "").trim())
      .filter(Boolean);
    setParameters((prev) =>
      tokens.map((variable) => {
        const existing = prev.find((p) => p.variable === variable);
        if (existing) return { ...existing, variable };
        return {
          parameter_associate_id: "",
          variable,
          rule_parameter_id: "",
          status: 1,
        };
      })
    );
  };

  const handleNextStep1 = () => {
    if (!selectedProvider) {
      setNoProviderError(true);
      return;
    }
    setNoProviderError(false);
    setStep(1);
  };

  const onSubmitStep2 = handleSubmit(async (values) => {
    if (!selectedProvider) {
      setStep(0);
      setNoProviderError(true);
      return;
    }
    const payload: TemplateSavePayload = {
      ...(id ? { id } : {}),
      name: values.name,
      module: values.module,
      service_type: selectedProvider.type,
      template: values.template,
      service_provider: selectedProvider,
      template_id: values.templateID || undefined,
      flow_id: values.flowID || undefined,
      status: Number(values.status),
      parameter_associate: parameters,
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Template ${id ? "updated" : "created"} successfully`);
      navigate("/settings/template/list");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Template" : "Add Template"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/template/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Select Provider Type"
          active={step === 0}
          done={step > 0}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill n={2} label="Template" active={step === 1} done={false} />
      </ol>

      {step === 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ProviderPicker
            providers={providers}
            selectedId={selectedProvider?.service_id}
            onSelect={(p) =>
              setSelectedProvider({
                service_id: p.id,
                provider_name: p.name,
                type: p.type,
                credentials: p.credentials,
              })
            }
            onSaved={() => refetchProviders()}
          />
          {noProviderError && (
            <p className="text-sm text-rose-500">Please select the provider.</p>
          )}
          <div className="flex justify-end pt-3">
            <Button onClick={handleNextStep1}>Save &amp; Next</Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <form
          onSubmit={onSubmitStep2}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Module *" error={errors.module?.message}>
              <Input {...register("module")} />
            </Field>
            <Field label="Provider Type *">
              <Input value={selectedProvider?.type ?? ""} disabled />
            </Field>
            <Field label="Template ID">
              <Input {...register("templateID")} />
            </Field>
            <Field label="Flow ID">
              <Input {...register("flowID")} />
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

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Template *{" "}
                <span className="text-slate-400">
                  (Declare variable like {`{{var}}`})
                </span>
              </Label>
              <textarea
                rows={8}
                value={watch("template")}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
              {errors.template && (
                <p className="text-xs text-rose-500">
                  {errors.template.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Variable Mapping
              </Label>
              {parameters.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-400">
                  Variables you reference in the template (e.g. {`{{name}}`})
                  appear here so you can map each to a parameter.
                </p>
              ) : (
                <div className="space-y-2">
                  {parameters.map((p, idx) => (
                    <div
                      key={`${p.variable}-${idx}`}
                      className="grid grid-cols-12 items-center gap-2"
                    >
                      <Input
                        className="col-span-5"
                        value={p.variable}
                        disabled
                      />
                      <select
                        className={`${selectClass} col-span-7`}
                        value={String(p.rule_parameter_id ?? "")}
                        onChange={(e) =>
                          setParameters((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? { ...it, rule_parameter_id: e.target.value }
                                : it
                            )
                          )
                        }
                      >
                        <option value="">Select parameter</option>
                        {parameterOptions.map((opt) => (
                          <option key={String(opt.id)} value={String(opt.id)}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ProviderPicker({
  providers,
  selectedId,
  onSelect,
  onSaved,
}: {
  providers: ServiceProviderRow[];
  selectedId?: string | number;
  onSelect: (p: ServiceProviderRow) => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<ServiceProviderRow | null | undefined>(
    undefined
  );
  // editing: undefined = closed; null = add new; row = edit existing.

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const active = String(selectedId ?? "") === String(p.id);
          return (
            <button
              key={String(p.id)}
              type="button"
              onClick={() => onSelect(p)}
              className={
                active
                  ? "flex flex-col gap-2 rounded-xl border-2 border-[#4C7DF0] bg-[#4C7DF0]/5 p-4 text-left shadow-md"
                  : "flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow"
              }
            >
              <div className="flex items-start justify-between">
                <Badge variant={p.status === 1 ? "success" : "destructive"}>
                  {p.status === 1 ? "Active" : "Inactive"}
                </Badge>
                {active && (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4C7DF0] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  {p.name}
                </p>
                <p className="text-xs text-slate-500">Type: {p.type}</p>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(p);
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setEditing(null)}
          className="flex min-h-[7rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-4 text-sm font-medium text-slate-600 hover:border-[#4C7DF0] hover:text-[#4C7DF0]"
        >
          <Plus className="h-5 w-5" />
          Add Service Provider
        </button>
      </div>

      <Dialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service Provider" : "Add Service Provider"}
            </DialogTitle>
          </DialogHeader>
          {editing !== undefined && (
            <CommunicationProviderForm
              initial={editing}
              onCancel={() => setEditing(undefined)}
              onSaved={() => {
                setEditing(undefined);
                onSaved();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const providerSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Name is required"),
  externalId: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  credentials: z.string().refine(
    (v) => {
      try {
        JSON.parse(v);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Credentials must be valid JSON" }
  ),
  status: z.coerce.number().int(),
});
type ProviderValues = z.infer<typeof providerSchema>;

function CommunicationProviderForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: ServiceProviderRow | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const save = useSaveCommunicationProvider();
  const { data: types = [] } = useCommunicationProviderTypes();

  const defaults: ProviderValues = useMemo(
    () => ({
      id: initial?.id ?? undefined,
      name: initial?.name ?? "",
      externalId: initial?.external_id ?? "",
      type: initial?.type ?? "",
      credentials:
        initial?.credentials != null
          ? JSON.stringify(initial.credentials, null, 2)
          : "",
      status: initial?.status != null ? Number(initial.status) : 1,
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProviderValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        id: values.id,
        name: values.name,
        external_id: values.externalId,
        type: values.type,
        status: Number(values.status),
        credentials: JSON.parse(values.credentials),
      });
      toast.success(
        `Service Provider ${initial?.id ? "updated" : "created"} successfully`
      );
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name *" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="External Id">
          <Input {...register("externalId")} />
        </Field>
        <Field label="Type *" error={errors.type?.message}>
          <select
            className={selectClass}
            value={watch("type")}
            onChange={(e) =>
              setValue("type", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select Type</option>
            {types.map((t) => (
              <option key={t.lu_key} value={t.lu_key}>
                {t.lu_name}
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
            <option value="-1">Inactive</option>
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Credentials * (JSON)" error={errors.credentials?.message}>
            <textarea
              rows={5}
              {...register("credentials")}
              placeholder='{"api_key": "..."}'
              className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            />
          </Field>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={
          done
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
            : active
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
              : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        }
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      <span
        className={
          active || done
            ? "font-semibold text-slate-900"
            : "text-slate-500"
        }
      >
        {label}
      </span>
    </li>
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
