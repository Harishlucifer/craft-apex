import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import type {
  ChecklistGroup,
  ChecklistItem,
  DocumentClassRow,
  DocumentRow,
  RuleRow,
  ServiceProviderRow,
} from "./doc-checklist-form.types";

// alpha-api validates ChecklistItemGroupParams.Sequence as `validate:"required"`
// on a plain int — a 0 default always fails (go-playground/validator treats
// Go's int zero-value as "missing"), so new groups must default to 1, not 0.
const groupSchema = z.object({
  checklist_item_name: z.string().min(1, "Group name is required"),
  group_sequence: z.coerce.number().int().min(1, "Sequence must be at least 1"),
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

interface Props {
  groups: ChecklistGroup[];
  onChange: (next: ChecklistGroup[]) => void;
  mandatoryOptions: { value: string; label: string }[];
  docClasses: DocumentClassRow[];
  docs: DocumentRow[];
  rules: RuleRow[];
  providers: ServiceProviderRow[];
}

export function DocChecklistGroupsPanel({
  groups,
  onChange,
  mandatoryOptions,
  docClasses,
  docs,
  rules,
  providers,
}: Props) {
  const [groupEditing, setGroupEditing] = useState<
    { initial?: ChecklistGroup; index?: number } | null
  >(null);
  const [itemEditing, setItemEditing] = useState<
    { groupIndex: number; initial?: ChecklistItem; index?: number } | null
  >(null);

  const upsertGroup = (g: ChecklistGroup, index?: number) => {
    onChange(
      index != null
        ? groups.map((gg, i) => (i === index ? g : gg))
        : [...groups, g],
    );
  };

  const removeGroup = (index: number) =>
    onChange(groups.filter((_, i) => i !== index));

  const moveGroup = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    const a = next[index]!;
    const b = next[target]!;
    next[index] = b;
    next[target] = a;
    onChange(next);
  };

  const upsertItem = (
    groupIndex: number,
    item: ChecklistItem,
    index?: number,
  ) => {
    onChange(
      groups.map((g, gi) => {
        if (gi !== groupIndex) return g;
        if (index != null) {
          return {
            ...g,
            items: g.items.map((it, i) => (i === index ? item : it)),
          };
        }
        return { ...g, items: [...g.items, item] };
      }),
    );
  };

  const removeItem = (groupIndex: number, itemIndex: number) =>
    onChange(
      groups.map((g, gi) =>
        gi !== groupIndex
          ? g
          : { ...g, items: g.items.filter((_, i) => i !== itemIndex) },
      ),
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Checklist Groups
        </h2>
        <Button type="button" size="sm" onClick={() => setGroupEditing({})}>
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
              mandatoryOptions={mandatoryOptions}
              docClasses={docClasses}
              docs={docs}
              rules={rules}
              providers={providers}
              onEditGroup={() => setGroupEditing({ initial: g, index: gi })}
              onRemoveGroup={() => removeGroup(gi)}
              onMoveUp={() => moveGroup(gi, -1)}
              onMoveDown={() => moveGroup(gi, 1)}
              onAddItem={() => setItemEditing({ groupIndex: gi })}
              onEditItem={(item, idx) =>
                setItemEditing({ groupIndex: gi, initial: item, index: idx })
              }
              onRemoveItem={(idx) => removeItem(gi, idx)}
            />
          ))}
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
              mandatoryOptions={mandatoryOptions}
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
          <Badge
            variant={group.mandatory === "MANDATORY" ? "success" : "secondary"}
          >
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
                    (r) => String(r.id) === String(item.rule_id),
                  )?.name;
                  const providerLabel = providers.find(
                    (p) => String(p.id) === String(item.service_provider_id),
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
      group_sequence: Number(initial?.group_sequence ?? 1),
      mandatory: initial?.mandatory ?? "",
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
      <Field label="Group Name *" error={errors.checklist_item_name?.message}>
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
    [initial],
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
      (c) => String(c.document_class_id) === v.doc_class,
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
