import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Pencil } from "lucide-react";
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
  registerStepComponent,
  type StepComponentProps,
} from "@craft-apex/workflow-runtime";
import {
  useCommunicationProviderTypes,
  useParameterOptions,
  useSaveCommunicationProvider,
} from "./notification-template-form.api";
import type { ServiceProviderRow } from "@/features/service-provider/service-provider-list/service-provider-list.types";
import type {
  ParameterAssociate,
  ParameterRow,
} from "./notification-template-form.types";

export interface TemplateFieldValues {
  name: string;
  module: string;
  template: string;
  templateId: string;
  flowId: string;
  status: number;
}

export interface TemplateStepContext {
  // Select Provider Type step
  providers: ServiceProviderRow[];
  selectedProviderId: string | number | bigint | undefined;
  onSelectProvider: (p: ServiceProviderRow) => void;

  // Template step
  fields: TemplateFieldValues;
  onFieldsChange: (patch: Partial<TemplateFieldValues>) => void;
  providerType: string;
  parameters: ParameterAssociate[];
  onParametersChange: (next: ParameterAssociate[]) => void;

  /** Final save (Template is the last step) + navigate to the list. */
  onFinish: () => void;
  saving: boolean;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const selectVariableClass =
  "col-span-7 h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

function extractTokens(text: string): string[] {
  return Array.from(text.matchAll(/\{\{(.*?)\}\}/g))
    .map((m) => (m[1] ?? "").trim())
    .filter(Boolean);
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

function ProviderTypeStep({ onNext, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<TemplateStepContext>;
  const providers = ctx.providers ?? [];
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<ServiceProviderRow | undefined>(
    undefined,
  );
  const qc = useQueryClient();

  const handleNext = () => {
    if (!ctx.selectedProviderId) {
      setError(true);
      return;
    }
    setError(false);
    onNext();
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const active = String(ctx.selectedProviderId ?? "") === String(p.id);
          return (
            <div
              key={String(p.id)}
              role="button"
              tabIndex={0}
              onClick={() => ctx.onSelectProvider?.(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") ctx.onSelectProvider?.(p);
              }}
              className={
                active
                  ? "flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-[#4C7DF0] bg-[#4C7DF0]/5 p-4 text-left shadow-md"
                  : "flex cursor-pointer flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow"
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
                <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">Type: {p.type}</p>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(p);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-rose-500">Please select the provider.</p>
      )}
      <div className="flex justify-end pt-3">
        <Button onClick={handleNext}>Save &amp; Next</Button>
      </div>

      <Dialog
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit Service Provider" : "Add Service Provider"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <CommunicationProviderForm
              initial={editing}
              onCancel={() => setEditing(undefined)}
              onSaved={() => {
                setEditing(undefined);
                qc.invalidateQueries({ queryKey: ["service-provider-list"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Legacy craft-frontend/src/pages/Templates/Providers.js — the lightweight
// in-wizard provider editor. Deliberately simpler than the standalone
// Service Provider master's own form: a single Type dropdown sourced from
// COMMUNICATION_PROVIDER_TYPE, not that screen's Service-Provider-Type ->
// Type cascade.
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
    { message: "Credentials must be valid JSON" },
  ),
  status: z.coerce.number().int(),
});
type ProviderValues = z.infer<typeof providerSchema>;

function CommunicationProviderForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: ServiceProviderRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const save = useSaveCommunicationProvider();
  const { data: types = [] } = useCommunicationProviderTypes();

  const defaults: ProviderValues = useMemo(
    () => ({
      id: initial.id != null ? String(initial.id) : undefined,
      name: initial.name ?? "",
      externalId: initial.external_id ?? "",
      type: initial.type ?? "",
      credentials:
        initial.credentials != null
          ? JSON.stringify(initial.credentials, null, 2)
          : "",
      status: initial.status != null ? Number(initial.status) : 1,
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
        `Service Provider ${initial.id ? "updated" : "created"} successfully`,
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
          <Field
            label="Credentials * (JSON)"
            error={errors.credentials?.message}
          >
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

function TemplateDetailsStep({ onBack, context }: StepComponentProps) {
  const ctx = (context ?? {}) as Partial<TemplateStepContext>;
  const { data: parameterOptions = [] } = useParameterOptions();
  const fields = ctx.fields ?? {
    name: "",
    module: "",
    template: "",
    templateId: "",
    flowId: "",
    status: 1,
  };
  const parameters = ctx.parameters ?? [];
  const tokens = useMemo(() => extractTokens(fields.template), [fields.template]);

  // Re-derive the mapping list whenever the template's variables change,
  // preserving any rule_parameter_id already chosen for a variable that's
  // still present (legacy `handleTextareaChange`).
  useEffect(() => {
    const next = tokens.map((variable) => {
      const existing = parameters.find((p) => p.variable === variable);
      if (existing) return existing;
      return {
        parameter_associate_id: "" as const,
        variable,
        rule_parameter_id: "" as const,
        status: 1,
      };
    });
    const changed =
      next.length !== parameters.length ||
      next.some((p, i) => p.variable !== parameters[i]?.variable);
    if (changed) ctx.onParametersChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Field label="Name *">
          <Input
            value={fields.name}
            onChange={(e) => ctx.onFieldsChange?.({ name: e.target.value })}
          />
        </Field>
        <Field label="Module *">
          <Input
            value={fields.module}
            onChange={(e) => ctx.onFieldsChange?.({ module: e.target.value })}
          />
        </Field>
        <Field label="Provider Type *">
          <Input value={ctx.providerType ?? ""} disabled />
        </Field>
        <Field label="Template ID">
          <Input
            value={fields.templateId}
            onChange={(e) =>
              ctx.onFieldsChange?.({ templateId: e.target.value })
            }
          />
        </Field>
        <Field label="Flow ID">
          <Input
            value={fields.flowId}
            onChange={(e) => ctx.onFieldsChange?.({ flowId: e.target.value })}
          />
        </Field>
        <Field label="Status *">
          <select
            className={selectClass}
            value={String(fields.status ?? "")}
            onChange={(e) =>
              ctx.onFieldsChange?.({ status: Number(e.target.value) })
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
            value={fields.template}
            onChange={(e) => ctx.onFieldsChange?.({ template: e.target.value })}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
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
                  <Input className="col-span-5" value={p.variable} disabled />
                  <select
                    className={selectVariableClass}
                    value={String(p.rule_parameter_id ?? "")}
                    onChange={(e) =>
                      ctx.onParametersChange?.(
                        parameters.map((it, i) =>
                          i === idx
                            ? { ...it, rule_parameter_id: e.target.value }
                            : it,
                        ),
                      )
                    }
                  >
                    <option value="">Select parameter</option>
                    {parameterOptions.map((opt: ParameterRow) => (
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
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={() => ctx.onFinish?.()} disabled={ctx.saving}>
          {ctx.saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

registerStepComponent("COMMUNICATION_TEMPLATE_PROVIDER", ProviderTypeStep);
registerStepComponent("COMMUNICATION_TEMPLATE_DETAILS", TemplateDetailsStep);
