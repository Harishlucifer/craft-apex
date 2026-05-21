import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  useFieldMasterComponents,
  useSaveWorkflow,
  useWorkflowDetail,
  useWorkflowRules,
  useWorkflowTypes,
} from "./workflow-form.api";
import {
  STEP_TYPES,
  WORKFLOW_MODES,
  type WorkflowSavePayload,
  type WorkflowStage,
  type WorkflowStep,
} from "./workflow-form.types";
import { StageModal } from "./stage-modal";
import { StepModal } from "./step-modal";

const schema = z.object({
  name: z
    .string()
    .min(4, "Name should be more than 4 characters"),
  description: z.string().optional(),
  workflowType: z.string().min(1, "Type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  mode: z.string().min(1, "Mode required"),
  is_default: z.string().min(1, "Is default is required"),
  allocationRuleID: z.string().optional(),
  workflowConfig: z
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
      { message: "Must be valid JSON" }
    ),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function WorkflowFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: workflowTypes = [] } = useWorkflowTypes();
  const { data: rules = [] } = useWorkflowRules();
  const { data: fieldComponents = [] } = useFieldMasterComponents();
  const { data: detail } = useWorkflowDetail(id);
  const save = useSaveWorkflow();

  const defaults: FormValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      workflowType: detail?.workflow_type ?? "",
      startDate: detail?.start_date ? detail.start_date.split("T")[0] ?? "" : "",
      endDate: detail?.end_date ? detail.end_date.split("T")[0] ?? "" : "",
      mode: detail?.mode ?? "",
      is_default: detail?.is_default != null ? String(detail.is_default) : "",
      allocationRuleID:
        detail?.allocation_rule_id != null
          ? String(detail.allocation_rule_id)
          : "",
      workflowConfig:
        detail?.configuration != null
          ? JSON.stringify(detail.configuration, null, 2)
          : "{}",
      status: detail?.status != null ? Number(detail.status) : 1,
    }),
    [detail]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [activeStageId, setActiveStageId] = useState<string | number | null>(
    null
  );

  useEffect(() => {
    if (!detail) return;
    const list = Array.isArray(detail.stages) ? detail.stages : [];
    setStages(list);
    if (list.length > 0 && !activeStageId) {
      setActiveStageId(list[0]!.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.stages]);

  // Stage modal
  const [stageEditing, setStageEditing] = useState<
    { initial?: WorkflowStage } | null
  >(null);

  // Step modal
  const [stepEditing, setStepEditing] = useState<
    { stageId: string | number; initial?: WorkflowStep } | null
  >(null);

  const upsertStage = (stage: WorkflowStage) => {
    setStages((prev) => {
      const existingIdx = prev.findIndex(
        (s) => String(s.id) === String(stage.id)
      );
      if (existingIdx >= 0) {
        return prev.map((s, i) => (i === existingIdx ? stage : s));
      }
      return [...prev, { ...stage, sequence: prev.length + 1 }];
    });
    setActiveStageId(stage.id ?? null);
  };

  const removeStage = (stageId: string | number) => {
    if (!window.confirm("Remove this stage?")) return;
    setStages((prev) => prev.filter((s) => String(s.id) !== String(stageId)));
    if (String(activeStageId) === String(stageId)) {
      const remaining = stages.filter((s) => String(s.id) !== String(stageId));
      setActiveStageId(remaining[0]?.id ?? null);
    }
  };

  const moveStage = (stageId: string | number, dir: -1 | 1) => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => String(s.id) === String(stageId));
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const a = next[idx]!;
      const b = next[target]!;
      next[idx] = b;
      next[target] = a;
      return next;
    });
  };

  const upsertStep = (step: WorkflowStep) => {
    setStages((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(step.stage_id)) return s;
        const existingIdx = s.steps.findIndex(
          (st) => String(st.id) === String(step.id)
        );
        if (existingIdx >= 0) {
          return {
            ...s,
            steps: s.steps.map((st, i) => (i === existingIdx ? step : st)),
          };
        }
        return { ...s, steps: [...s.steps, step] };
      })
    );
  };

  const removeStep = (stageId: string | number, stepId: string | number) => {
    if (!window.confirm("Remove this step?")) return;
    setStages((prev) =>
      prev.map((s) =>
        String(s.id) !== String(stageId)
          ? s
          : {
              ...s,
              steps: s.steps.filter((st) => String(st.id) !== String(stepId)),
            }
      )
    );
  };

  const moveStep = (
    stageId: string | number,
    stepId: string | number,
    dir: -1 | 1
  ) => {
    setStages((prev) =>
      prev.map((s) => {
        if (String(s.id) !== String(stageId)) return s;
        const idx = s.steps.findIndex((st) => String(st.id) === String(stepId));
        if (idx < 0) return s;
        const target = idx + dir;
        if (target < 0 || target >= s.steps.length) return s;
        const next = [...s.steps];
        const a = next[idx]!;
        const b = next[target]!;
        next[idx] = b;
        next[target] = a;
        return { ...s, steps: next };
      })
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload: WorkflowSavePayload = {
      ...(detail?.id ? { id: detail.id } : id ? { id } : {}),
      name: values.name,
      description: values.description,
      workflow_type: values.workflowType,
      start_date: values.startDate,
      end_date: values.endDate,
      mode: values.mode,
      is_default: Number(values.is_default),
      allocation_rule_id: values.allocationRuleID || null,
      configuration: values.workflowConfig
        ? JSON.parse(values.workflowConfig)
        : {},
      status: Number(values.status),
      stages,
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Workflow ${id ? "updated" : "created"} successfully`);
      navigate("/settings/workflow");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  });

  const activeStage = stages.find(
    (s) => String(s.id) === String(activeStageId)
  );

  // For lock-down once Published/Deactivated.
  const isLocked =
    watch("mode") === "PUBLISHED" || watch("mode") === "DEACTIVATED";

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Workflow" : "Add Workflow"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/workflow">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Workflow Definition
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Name *" error={errors.name?.message}>
              <Input disabled={isLocked} {...register("name")} />
            </Field>
            <Field label="Type *" error={errors.workflowType?.message}>
              <select
                className={selectClass}
                disabled={isLocked}
                value={watch("workflowType")}
                onChange={(e) =>
                  setValue("workflowType", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {workflowTypes.map((t) => (
                  <option key={t.lu_key} value={t.lu_key}>
                    {t.lu_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mode *" error={errors.mode?.message}>
              <select
                className={selectClass}
                value={watch("mode")}
                onChange={(e) =>
                  setValue("mode", e.target.value, { shouldValidate: true })
                }
              >
                <option value="">Select</option>
                {WORKFLOW_MODES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Start Date *" error={errors.startDate?.message}>
              <Input
                type="date"
                disabled={isLocked}
                {...register("startDate")}
              />
            </Field>
            <Field label="End Date" error={errors.endDate?.message}>
              <Input
                type="date"
                disabled={isLocked}
                {...register("endDate")}
              />
            </Field>
            <Field label="Is Default *" error={errors.is_default?.message}>
              <select
                className={selectClass}
                value={watch("is_default")}
                onChange={(e) =>
                  setValue("is_default", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
            </Field>

            <Field label="Allocation Rule">
              <select
                className={selectClass}
                disabled={isLocked}
                value={watch("allocationRuleID") ?? ""}
                onChange={(e) =>
                  setValue("allocationRuleID", e.target.value)
                }
              >
                <option value="">— None —</option>
                {rules.map((r) => (
                  <option key={String(r.id)} value={String(r.id)}>
                    {r.name}
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
            <div className="md:col-span-3">
              <Field label="Description" error={errors.description?.message}>
                <Input disabled={isLocked} {...register("description")} />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field
                label="Configuration (JSON)"
                error={errors.workflowConfig?.message}
              >
                <textarea
                  rows={3}
                  disabled={isLocked}
                  {...register("workflowConfig")}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Stages &amp; Steps
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={() => setStageEditing({})}
              disabled={isLocked}
            >
              <Plus className="h-4 w-4" /> Add Stage
            </Button>
          </div>

          {stages.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
              No stages yet — add at least one stage to start configuring steps.
            </p>
          ) : (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 space-y-2 md:col-span-4">
                {stages.map((s, i) => {
                  const active = String(s.id) === String(activeStageId);
                  return (
                    <div
                      key={String(s.id)}
                      className={
                        active
                          ? "flex items-center justify-between gap-2 rounded-xl border-2 border-[#4C7DF0] bg-[#4C7DF0]/10 p-3"
                          : "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300"
                      }
                    >
                      <button
                        type="button"
                        onClick={() => setActiveStageId(s.id ?? null)}
                        className="flex flex-1 items-start text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {s.steps.length} step
                            {s.steps.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </button>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveStage(s.id!, -1)}
                          disabled={i === 0 || isLocked}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStage(s.id!, 1)}
                          disabled={i === stages.length - 1 || isLocked}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setStageEditing({ initial: s })}
                          disabled={isLocked}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Edit stage"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStage(s.id!)}
                          disabled={isLocked}
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                          aria-label="Delete stage"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="col-span-12 md:col-span-8">
                {activeStage ? (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Steps — {activeStage.name}
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isLocked}
                        onClick={() =>
                          setStepEditing({ stageId: activeStage.id! })
                        }
                      >
                        <Plus className="h-4 w-4" /> Add Step
                      </Button>
                    </div>
                    {activeStage.steps.length === 0 ? (
                      <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-4 text-center text-xs text-slate-400">
                        No steps yet.
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-md border border-slate-200">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                            <tr>
                              <th className="px-3 py-2 text-left">Name</th>
                              <th className="px-3 py-2 text-left">Type</th>
                              <th className="px-3 py-2 text-left">Display</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeStage.steps.map((step, i) => (
                              <tr
                                key={String(step.id)}
                                className="border-t border-slate-100"
                              >
                                <td className="px-3 py-2 font-medium">
                                  {step.name}
                                </td>
                                <td className="px-3 py-2">
                                  {STEP_TYPES.find(
                                    (t) => t.value === step.step_type
                                  )?.label ?? step.step_type}
                                </td>
                                <td className="px-3 py-2">{step.display_mode}</td>
                                <td className="px-3 py-2">
                                  <Badge
                                    variant={
                                      step.status === 1 ? "success" : "destructive"
                                    }
                                  >
                                    {step.status === 1 ? "Active" : "Inactive"}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveStep(activeStage.id!, step.id!, -1)
                                      }
                                      disabled={i === 0 || isLocked}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                      aria-label="Move up"
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        moveStep(activeStage.id!, step.id!, 1)
                                      }
                                      disabled={
                                        i === activeStage.steps.length - 1 ||
                                        isLocked
                                      }
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                      aria-label="Move down"
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setStepEditing({
                                          stageId: activeStage.id!,
                                          initial: step,
                                        })
                                      }
                                      disabled={isLocked}
                                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                      aria-label="Edit"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeStep(activeStage.id!, step.id!)
                                      }
                                      disabled={isLocked}
                                      className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                                      aria-label="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
                    Select a stage to view its steps.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center justify-between">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/workflow">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending || isLocked}>
            {save.isPending ? "Saving…" : "Save Workflow"}
          </Button>
        </div>
      </form>

      <StageModal
        open={stageEditing !== null}
        initial={stageEditing?.initial}
        rules={rules}
        onCancel={() => setStageEditing(null)}
        onSubmit={(stage) => {
          upsertStage(stage);
          setStageEditing(null);
        }}
      />

      <StepModal
        open={stepEditing !== null}
        initial={stepEditing?.initial}
        stageId={stepEditing?.stageId ?? ""}
        rules={rules}
        fieldComponents={fieldComponents}
        onCancel={() => setStepEditing(null)}
        onSubmit={(step) => {
          upsertStep(step);
          setStepEditing(null);
        }}
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
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
