import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
  useChecklistDetail,
  useChecklistLenders,
  useChecklistLoanTypes,
  useChecklistLookups,
  useChecklistRules,
  useDocClassOptions,
  useDocOptions,
  useOcrServiceProviders,
  useSaveChecklist,
} from "./doc-checklist-form.api";
import type {
  ChecklistGroup,
  ChecklistItem,
  ChecklistSavePayload,
  DocumentClassRow,
  DocumentRow,
  RuleRow,
  ServiceProviderRow,
} from "./doc-checklist-form.types";

const headerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  sequence: z.coerce.number().int().min(0),
  status: z.coerce.number().int(),
  applicable_to: z.string().min(1, "Applicable to is required"),
  loan_type: z.string().optional(),
  lender_id: z.string().optional(),
  rule_id: z.string().optional(),
});
type HeaderValues = z.infer<typeof headerSchema>;

const groupSchema = z.object({
  checklist_item_name: z.string().min(1, "Group name is required"),
  group_sequence: z.coerce.number().int(),
  mandatory: z.string().min(1, "Mandatory is required"),
});
type GroupValues = z.infer<typeof groupSchema>;

const itemSchema = z.object({
  doc_class: z.string().min(1, "Document Class is required"),
  doc_name: z.string().min(1, "Document Name is required"),
  rule: z.string().optional(),
  service_provider_id: z.string().optional(),
  allowed_count: z.coerce.number().int().min(0).optional(),
});
type ItemValues = z.infer<typeof itemSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function DocChecklistFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useChecklistLookups();
  const { data: docClasses = [] } = useDocClassOptions();
  const { data: docs = [] } = useDocOptions();
  const { data: loanTypes = [] } = useChecklistLoanTypes();
  const { data: lenders = [] } = useChecklistLenders();
  const { data: rules = [] } = useChecklistRules();
  const { data: providers = [] } = useOcrServiceProviders();
  const { data: detail } = useChecklistDetail(id);
  const save = useSaveChecklist();

  const opts = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      checklistType: filter("CHECKLIST_TYPE"),
      mandatory: filter("CHECKLIST_ITEM_MANDATORY"),
      applicantType: filter("APPLICANT_TYPE"),
      checklistTags: filter("CHECKLIST_TAGS"),
    };
  }, [lookups]);

  // Wizard
  const [step, setStep] = useState<0 | 1>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (id && detail) {
      setCompleted((c) => new Set(c).add(0));
    }
  }, [id, detail]);

  // Step 1 (header)
  const headerDefaults: HeaderValues = useMemo(
    () => ({
      title: detail?.title ?? "",
      type: detail?.type ?? "",
      sequence: Number(detail?.sequence ?? 0),
      status: detail?.status != null ? Number(detail.status) : 1,
      applicable_to: detail?.applicable_to ?? "",
      loan_type:
        detail?.loan_type?.loan_type_id != null
          ? String(detail.loan_type.loan_type_id)
          : "",
      lender_id:
        detail?.lender_id != null ? String(detail.lender_id) : "",
      rule_id: detail?.rule_id != null ? String(detail.rule_id) : "",
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
  } = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: headerDefaults,
  });

  useEffect(() => {
    reset(headerDefaults);
  }, [headerDefaults, reset]);

  // Tags chips
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    setTags(Array.isArray(detail?.tags) ? detail!.tags! : []);
  }, [detail?.tags]);

  // Groups + items
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  useEffect(() => {
    setGroups(
      Array.isArray(detail?.checklist_group) ? detail!.checklist_group! : []
    );
  }, [detail?.checklist_group]);

  // Build payload
  const buildPayload = (values: HeaderValues): ChecklistSavePayload => {
    const lt = loanTypes.find((l) => String(l.id) === values.loan_type);
    return {
      ...(detail?.checklist_id
        ? { checklist_id: detail.checklist_id }
        : id
          ? { checklist_id: id }
          : {}),
      title: values.title,
      type: values.type,
      sequence: Number(values.sequence),
      status: Number(values.status),
      applicable_to: values.applicable_to,
      loan_type: lt
        ? { loan_type_id: lt.id, loan_type_name: lt.name }
        : null,
      lender_id: values.lender_id ? values.lender_id : null,
      rule_id: values.rule_id || null,
      tags,
      checklist_group: groups,
      checklist_field: detail?.checklist_field ?? [],
    };
  };

  const submitCurrent = async (isFinal: boolean): Promise<boolean> => {
    let values: HeaderValues | null = null;
    await handleSubmit((v) => {
      values = v;
    })();
    if (!values) return false;
    try {
      await save.mutateAsync(buildPayload(values));
      toast.success(isFinal ? "Created successfully!" : "Step saved");
      if (isFinal) navigate("/settings/document/checklist");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      return false;
    }
  };

  const goNext = async () => {
    if (step === 0) {
      const ok = await submitCurrent(false);
      if (!ok) return;
      setCompleted((c) => new Set(c).add(0));
      setStep(1);
      return;
    }
    await submitCurrent(true);
  };

  const goBack = () => {
    if (step === 0) navigate("/settings/document/checklist");
    else setStep(0);
  };

  // Tag input
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    setTags((prev) => [...prev, v]);
    setTagInput("");
  };

  // Group modal
  const [groupEditing, setGroupEditing] = useState<
    { initial?: ChecklistGroup; index?: number } | null
  >(null);

  // Item modal
  const [itemEditing, setItemEditing] = useState<
    | { groupIndex: number; initial?: ChecklistItem; index?: number }
    | null
  >(null);

  const upsertGroup = (g: ChecklistGroup, index?: number) => {
    setGroups((prev) =>
      index != null
        ? prev.map((gg, i) => (i === index ? g : gg))
        : [...prev, g]
    );
  };

  const removeGroup = (index: number) =>
    setGroups((prev) => prev.filter((_, i) => i !== index));

  const moveGroup = (index: number, dir: -1 | 1) => {
    setGroups((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const a = next[index]!;
      const b = next[target]!;
      next[index] = b;
      next[target] = a;
      return next;
    });
  };

  const upsertItem = (
    groupIndex: number,
    item: ChecklistItem,
    index?: number
  ) => {
    setGroups((prev) =>
      prev.map((g, gi) => {
        if (gi !== groupIndex) return g;
        if (index != null) {
          return {
            ...g,
            items: g.items.map((it, i) => (i === index ? item : it)),
          };
        }
        return { ...g, items: [...g.items, item] };
      })
    );
  };

  const removeItem = (groupIndex: number, itemIndex: number) =>
    setGroups((prev) =>
      prev.map((g, gi) =>
        gi !== groupIndex
          ? g
          : { ...g, items: g.items.filter((_, i) => i !== itemIndex) }
      )
    );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Document Checklist" : "Add Document Checklist"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/document/checklist">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Checklist Details"
          active={step === 0}
          done={completed.has(0)}
          clickable
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Document Groups"
          active={step === 1}
          done={false}
          clickable={completed.has(0)}
          onClick={() => completed.has(0) && setStep(1)}
        />
      </ol>

      {step === 0 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Title *" error={errors.title?.message}>
              <Input {...register("title")} />
            </Field>
            <Field label="Type *" error={errors.type?.message}>
              <select
                className={selectClass}
                value={watch("type")}
                onChange={(e) =>
                  setValue("type", e.target.value, { shouldValidate: true })
                }
              >
                <option value="">Select</option>
                {opts.checklistType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sequence *" error={errors.sequence?.message}>
              <Input type="number" {...register("sequence")} />
            </Field>
            <Field
              label="Applicable To *"
              error={errors.applicable_to?.message}
            >
              <select
                className={selectClass}
                value={watch("applicable_to")}
                onChange={(e) =>
                  setValue("applicable_to", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.applicantType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Loan Type">
              <select
                className={selectClass}
                value={watch("loan_type") ?? ""}
                onChange={(e) => setValue("loan_type", e.target.value)}
              >
                <option value="">Select</option>
                {loanTypes.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lender">
              <select
                className={selectClass}
                value={watch("lender_id") ?? ""}
                onChange={(e) => setValue("lender_id", e.target.value)}
              >
                <option value="">Select</option>
                {lenders.map((l) => (
                  <option
                    key={String(l.lender_id)}
                    value={String(l.lender_id)}
                  >
                    {l.name}
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

          <div>
            <Label className="text-xs font-medium text-slate-600">Tags</Label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <select
                className={`${selectClass} max-w-xs`}
                value=""
                onChange={(e) => {
                  if (e.target.value && !tags.includes(e.target.value)) {
                    setTags((prev) => [...prev, e.target.value]);
                  }
                  e.target.value = "";
                }}
              >
                <option value="">Add a tag…</option>
                {opts.checklistTags
                  .filter((o) => !tags.includes(o.value))
                  .map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
              </select>
              <span className="text-xs text-slate-400">or</span>
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
                  placeholder="Custom tag"
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
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t, i) => {
                  const label =
                    opts.checklistTags.find((o) => o.value === t)?.label ?? t;
                  return (
                    <button
                      key={`${t}-${i}`}
                      type="button"
                      onClick={() =>
                        setTags((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-[#4C7DF0]/10 px-3 py-1 text-xs font-medium text-[#4C7DF0]"
                    >
                      {label} <X className="h-3 w-3" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Next"}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Checklist Groups
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={() => setGroupEditing({})}
            >
              <Plus className="h-4 w-4" /> Add Group
            </Button>
          </div>

          {groups.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
              No groups yet. Click <strong>Add Group</strong> to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((g, gi) => (
                <GroupCard
                  key={`${g.checklist_item_name}-${gi}`}
                  group={g}
                  canUp={gi > 0}
                  canDown={gi < groups.length - 1}
                  mandatoryOptions={opts.mandatory}
                  docClasses={docClasses}
                  docs={docs}
                  rules={rules}
                  providers={providers}
                  onEditGroup={() =>
                    setGroupEditing({ initial: g, index: gi })
                  }
                  onRemoveGroup={() => removeGroup(gi)}
                  onMoveUp={() => moveGroup(gi, -1)}
                  onMoveDown={() => moveGroup(gi, 1)}
                  onAddItem={() => setItemEditing({ groupIndex: gi })}
                  onEditItem={(item, idx) =>
                    setItemEditing({
                      groupIndex: gi,
                      initial: item,
                      index: idx,
                    })
                  }
                  onRemoveItem={(idx) => removeItem(gi, idx)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Finish"}
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={groupEditing !== null}
        onOpenChange={(o) => !o && setGroupEditing(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {groupEditing?.initial ? "Edit Group" : "Add Group"}
            </DialogTitle>
          </DialogHeader>
          {groupEditing !== null && (
            <GroupForm
              initial={groupEditing.initial}
              mandatoryOptions={opts.mandatory}
              onCancel={() => setGroupEditing(null)}
              onSubmit={(g) => {
                upsertGroup(g, groupEditing.index);
                setGroupEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={itemEditing !== null}
        onOpenChange={(o) => !o && setItemEditing(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {itemEditing?.initial ? "Edit Document" : "Add Document"}
            </DialogTitle>
          </DialogHeader>
          {itemEditing !== null && (
            <ItemForm
              initial={itemEditing.initial}
              docClasses={docClasses}
              docs={docs}
              rules={rules}
              providers={providers}
              onCancel={() => setItemEditing(null)}
              onSubmit={(item) => {
                upsertItem(itemEditing.groupIndex, item, itemEditing.index);
                setItemEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupCard({
  group,
  canUp,
  canDown,
  mandatoryOptions,
  docClasses,
  docs,
  rules,
  providers,
  onEditGroup,
  onRemoveGroup,
  onMoveUp,
  onMoveDown,
  onAddItem,
  onEditItem,
  onRemoveItem,
}: {
  group: ChecklistGroup;
  canUp: boolean;
  canDown: boolean;
  mandatoryOptions: { value: string; label: string }[];
  docClasses: DocumentClassRow[];
  docs: DocumentRow[];
  rules: RuleRow[];
  providers: ServiceProviderRow[];
  onEditGroup: () => void;
  onRemoveGroup: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddItem: () => void;
  onEditItem: (item: ChecklistItem, index: number) => void;
  onRemoveItem: (index: number) => void;
}) {
  const mandatoryLabel =
    mandatoryOptions.find((o) => o.value === group.mandatory)?.label ??
    group.mandatory ??
    "—";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">Group</Badge>
          <p className="text-sm font-semibold text-slate-900">
            {group.checklist_item_name}
          </p>
          <span className="text-xs text-slate-500">
            seq {group.group_sequence ?? 0}
          </span>
          <Badge variant={group.mandatory === "MANDATORY" ? "success" : "secondary"}>
            {mandatoryLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canUp}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canDown}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEditGroup}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Edit group"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemoveGroup}
            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
            aria-label="Delete group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Documents
          </h4>
          <Button type="button" size="sm" variant="outline" onClick={onAddItem}>
            <Plus className="h-3.5 w-3.5" /> Add Document
          </Button>
        </div>
        {group.items.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-4 text-center text-xs text-slate-400">
            No documents yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Document Class</th>
                  <th className="px-3 py-2 text-left">Document</th>
                  <th className="px-3 py-2 text-left">Rule</th>
                  <th className="px-3 py-2 text-left">Provider</th>
                  <th className="px-3 py-2 text-right">Allowed</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, i) => {
                  const ruleLabel = rules.find(
                    (r) => String(r.id) === String(item.rule_id)
                  )?.name;
                  const providerLabel = providers.find(
                    (p) => String(p.id) === String(item.service_provider_id)
                  )?.name;
                  return (
                    <tr
                      key={`${item.checklist_item_id ?? `${item.document.document_id}-${i}`}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-3 py-2">
                        {item.document_class.document_class_name}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {item.document.document_name}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {ruleLabel ?? item.rule_id ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {providerLabel ?? item.service_provider_id ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {item.allowed_count ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditItem(item, i)}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(i)}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                            aria-label="Delete"
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
    </div>
  );
}

function GroupForm({
  initial,
  mandatoryOptions,
  onCancel,
  onSubmit,
}: {
  initial?: ChecklistGroup;
  mandatoryOptions: { value: string; label: string }[];
  onCancel: () => void;
  onSubmit: (g: ChecklistGroup) => void;
}) {
  const defaults: GroupValues = useMemo(
    () => ({
      checklist_item_name: initial?.checklist_item_name ?? "",
      group_sequence: Number(initial?.group_sequence ?? 0),
      mandatory: initial?.mandatory ?? "",
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
  } = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((v) => {
    onSubmit({
      checklist_id: initial?.checklist_id ?? "",
      checklist_item_name: v.checklist_item_name,
      group_sequence: Number(v.group_sequence),
      mandatory: v.mandatory,
      items: initial?.items ?? [],
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field
        label="Group Name *"
        error={errors.checklist_item_name?.message}
      >
        <Input {...register("checklist_item_name")} />
      </Field>
      <Field label="Sequence *" error={errors.group_sequence?.message}>
        <Input type="number" {...register("group_sequence")} />
      </Field>
      <Field label="Mandatory *" error={errors.mandatory?.message}>
        <select
          className={selectClass}
          value={watch("mandatory")}
          onChange={(e) =>
            setValue("mandatory", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select</option>
          {mandatoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
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

function ItemForm({
  initial,
  docClasses,
  docs,
  rules,
  providers,
  onCancel,
  onSubmit,
}: {
  initial?: ChecklistItem;
  docClasses: DocumentClassRow[];
  docs: DocumentRow[];
  rules: RuleRow[];
  providers: ServiceProviderRow[];
  onCancel: () => void;
  onSubmit: (item: ChecklistItem) => void;
}) {
  const defaults: ItemValues = useMemo(
    () => ({
      doc_class:
        initial?.document_class.document_class_id != null
          ? String(initial.document_class.document_class_id)
          : "",
      doc_name:
        initial?.document.document_id != null
          ? String(initial.document.document_id)
          : "",
      rule: initial?.rule_id ?? "",
      service_provider_id: initial?.service_provider_id ?? "",
      allowed_count: initial?.allowed_count ?? 0,
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
  } = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((v) => {
    const cls = docClasses.find(
      (c) => String(c.document_class_id) === v.doc_class
    );
    const doc = docs.find((d) => String(d.document_id) === v.doc_name);
    if (!cls || !doc) return;
    onSubmit({
      checklist_item_id:
        initial?.checklist_item_id ??
        Math.floor(Math.random() * Date.now()).toString(),
      document: {
        document_id: doc.document_id,
        document_name: doc.document_name,
      },
      document_class: {
        document_class_id: cls.document_class_id,
        document_class_name: cls.document_class_name,
      },
      rule_id: v.rule || undefined,
      service_provider_id: v.service_provider_id || undefined,
      allowed_count:
        v.allowed_count != null ? Number(v.allowed_count) : undefined,
      status: initial?.status ?? 1,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Document Class *" error={errors.doc_class?.message}>
          <select
            className={selectClass}
            value={watch("doc_class")}
            onChange={(e) =>
              setValue("doc_class", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select</option>
            {docClasses.map((c) => (
              <option
                key={String(c.document_class_id)}
                value={String(c.document_class_id)}
              >
                {c.document_class_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Document Name *" error={errors.doc_name?.message}>
          <select
            className={selectClass}
            value={watch("doc_name")}
            onChange={(e) =>
              setValue("doc_name", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select</option>
            {docs.map((d) => (
              <option
                key={String(d.document_id)}
                value={String(d.document_id)}
              >
                {d.document_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rule">
          <select
            className={selectClass}
            value={watch("rule") ?? ""}
            onChange={(e) => setValue("rule", e.target.value)}
          >
            <option value="">Select</option>
            {rules.map((r) => (
              <option key={String(r.id)} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="OCR Provider">
          <select
            className={selectClass}
            value={watch("service_provider_id") ?? ""}
            onChange={(e) => setValue("service_provider_id", e.target.value)}
          >
            <option value="">Select</option>
            {providers.map((p) => (
              <option key={String(p.id)} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Allowed Count">
          <Input type="number" {...register("allowed_count")} />
        </Field>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Add"}</Button>
      </div>
    </form>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
  clickable,
  onClick,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        className={
          done
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"
            : active
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A6B] text-white"
              : "flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500"
        }
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </button>
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
