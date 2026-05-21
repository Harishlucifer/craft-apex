import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Trash2,
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
  useSaveVerificationCategory,
  useVcDetail,
  useVcLenders,
  useVcLoanTypes,
  useVcLookups,
  useVcRules,
} from "./verification-type-form.api";
import type {
  AllocationRuleRow,
  VerificationCategorySavePayload,
  VerificationQuestion,
  VerificationTemplate,
} from "./verification-type-form.types";
import { QuestionModal } from "./question-modal";

const headerSchema = z.object({
  code: z.string().optional(),
  scope: z.string().min(1, "Scope is required"),
  applyCapacity: z.string().min(1, "Apply capacity is required"),
  loanType: z.string().optional(),
  verificationType: z.string().min(1, "Verification Type is required"),
  employmentType: z.string().optional(),
  lender: z.string().optional(),
  eligibleRule: z.string().optional(),
  templateRule: z.string().optional(),
});
type HeaderValues = z.infer<typeof headerSchema>;

const allocationSchema = z.object({
  allocateRule: z.string().min(1, "Allocation Rule is required"),
  allocateTo: z.string().min(1, "Allocation To is required"),
});
type AllocationValues = z.infer<typeof allocationSchema>;

const relationshipSchema = z.object({
  relationship_type: z.string().min(1, "Relationship Type is required"),
});
type RelationshipValues = z.infer<typeof relationshipSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function VerificationTypeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useVcLookups();
  const { data: loanTypes = [] } = useVcLoanTypes();
  const { data: lenders = [] } = useVcLenders();
  const { data: rules = [] } = useVcRules();
  const { data: detail } = useVcDetail(id);
  const save = useSaveVerificationCategory();

  const opts = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      employmentType: filter("EMPLOYMENT_TYPE"),
      applyCapacity: filter("APPLY_CAPACITY"),
      verificationType: filter("VERIFICATION_TYPE"),
      relationship: filter("VERIFICATION_RELATIONSHIP_TYPE"),
      questionType: filter("QUESTIONNAIRE_FIELD_TYPE"),
      scope: filter("CHECKLIST_TYPE"),
    };
  }, [lookups]);

  const ruleOptions = useMemo(() => {
    const filter = (t: string) =>
      rules
        .filter((r) => r.type === t)
        .map((r) => ({ value: String(r.id), label: r.name, type: r.type }));
    return {
      allocation: filter("ALLOCATION_RULE"),
      eligible: filter("VERIFICATION_CATEGORY"),
      template: filter("VERIFICATION_TEMPLATE"),
    };
  }, [rules]);

  // Wizard.
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (id && step === 0 && detail) {
      setCompleted(new Set([0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.verification_category_id]);

  // Header form.
  const headerDefaults: HeaderValues = useMemo(
    () => ({
      code: detail?.verification_category_code ?? "",
      scope: detail?.verification_category_scope ?? "",
      applyCapacity: detail?.apply_capacity ?? "",
      loanType:
        detail?.loan_type_id != null ? String(detail.loan_type_id) : "",
      verificationType: detail?.verification_type ?? "",
      employmentType: detail?.employment_type ?? "",
      lender: detail?.lender_id != null ? String(detail.lender_id) : "",
      eligibleRule:
        detail?.eligible_rule_id != null
          ? String(detail.eligible_rule_id)
          : "",
      templateRule:
        detail?.template_rule_id != null
          ? String(detail.template_rule_id)
          : "",
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

  // Step-2 allocation list + step-3 templates kept at page level.
  const [allocation, setAllocation] = useState<AllocationRuleRow[]>([]);
  const [templates, setTemplates] = useState<VerificationTemplate[]>([]);
  const [activeRelationship, setActiveRelationship] = useState<string>("");

  useEffect(() => {
    if (!detail) return;
    if (Array.isArray(detail.templates)) {
      setTemplates(detail.templates);
      if (detail.templates.length > 0 && !activeRelationship) {
        setActiveRelationship(detail.templates[0]!.relationship_type);
      }
    }
    if (Array.isArray(detail.allocation_rules)) {
      const seeded = detail.allocation_rules
        .filter((r): r is { allocation_rule_id: string | number } =>
          r?.allocation_rule_id != null
        )
        .map((r) => {
          const hit = ruleOptions.allocation.find(
            (o) => o.value === String(r.allocation_rule_id)
          );
          return {
            allocation_rule_id: String(r.allocation_rule_id),
            name: hit?.label,
            type: hit?.type,
          };
        });
      setAllocation(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, ruleOptions.allocation.length]);

  // Display helpers.
  const loanTypeName = useMemo(() => {
    const id = watch("loanType");
    const hit = loanTypes.find((l) => String(l.id) === id);
    return hit?.name?.toUpperCase().replace(/\s/g, "_") ?? "";
  }, [loanTypes, watch]);

  const lenderName = useMemo(() => {
    const id = watch("lender");
    const hit = lenders.find((l) => String(l.lender_id) === id);
    return hit?.name?.toUpperCase().replace(/\s/g, "_") ?? "";
  }, [lenders, watch]);

  const verificationCategoryDerived = `${watch("verificationType") ?? ""} ${watch("employmentType") ?? ""} ${loanTypeName} ${lenderName}`.trim();

  // Build the save payload from current form values + lists.
  const buildPayload = (values: HeaderValues): VerificationCategorySavePayload => ({
    ...(detail?.verification_category_id
      ? { verification_category_id: detail.verification_category_id }
      : id
        ? { verification_category_id: id }
        : {}),
    verification_category: verificationCategoryDerived,
    apply_capacity: values.applyCapacity,
    loan_type_id: values.loanType ?? "",
    verification_category_scope: values.scope ?? "",
    verification_type: values.verificationType,
    verification_category_code: values.code ?? "",
    employment_type: values.employmentType ?? "",
    lender_id: values.lender ?? "",
    template_rule_id: values.templateRule ?? "",
    eligible_rule_id: values.eligibleRule ?? "",
    allocation_rules:
      allocation.length > 0
        ? allocation.map((a) => ({
            allocation_rule_id: a.allocation_rule_id,
            ...(detail?.verification_category_id
              ? { verification_category_id: detail.verification_category_id }
              : {}),
          }))
        : null,
    templates,
  });

  const submitCurrent = async (isFinal: boolean): Promise<boolean> => {
    let values: HeaderValues | null = null;
    await handleSubmit((v) => {
      values = v;
    })();
    if (!values) return false;
    const payload = buildPayload(values);
    try {
      await save.mutateAsync(payload);
      toast.success(
        isFinal
          ? `${id ? "Updated" : "Saved"} successfully!`
          : "Step saved"
      );
      if (isFinal) {
        navigate("/settings/verification/list");
      }
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
    if (step === 1) {
      const ok = await submitCurrent(false);
      if (!ok) return;
      setCompleted((c) => new Set(c).add(1));
      setStep(2);
      return;
    }
    await submitCurrent(true);
  };

  const goBack = () => {
    if (step === 0) {
      navigate("/settings/verification/list");
    } else {
      setStep((s) => (s - 1) as 0 | 1 | 2);
    }
  };

  // Allocation rule modal.
  const [allocationEditing, setAllocationEditing] = useState<
    { initial?: AllocationRuleRow; index?: number } | null
  >(null);

  // Relationship modal (add new tab).
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);

  // Question modal state — operates on the active relationship's questions.
  const [questionModal, setQuestionModal] = useState<
    { initial?: VerificationQuestion; index?: number } | null
  >(null);

  // Mutations for templates state.
  const addOrUpdateQuestion = (q: VerificationQuestion, index?: number) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.relationship_type !== activeRelationship) return t;
        if (index != null) {
          return {
            ...t,
            questions: t.questions.map((qq, i) => (i === index ? q : qq)),
          };
        }
        const nextId =
          q.question_id ??
          `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        return {
          ...t,
          questions: [...t.questions, { ...q, question_id: nextId }],
        };
      })
    );
  };

  const removeQuestion = (index: number) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.relationship_type !== activeRelationship
          ? t
          : { ...t, questions: t.questions.filter((_, i) => i !== index) }
      )
    );
  };

  const addRelationship = (relationship_type: string) => {
    if (templates.some((t) => t.relationship_type === relationship_type)) {
      toast.error("Relationship already exists");
      return;
    }
    setTemplates((prev) => [...prev, { relationship_type, questions: [] }]);
    setActiveRelationship(relationship_type);
    setRelationshipModalOpen(false);
  };

  const activeTemplate = templates.find(
    (t) => t.relationship_type === activeRelationship
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Verification Type" : "Add Verification Type"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/verification/list">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Verification Type"
          active={step === 0}
          done={completed.has(0)}
          clickable
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Allocation Rule"
          active={step === 1}
          done={completed.has(1)}
          clickable={completed.has(0)}
          onClick={() => completed.has(0) && setStep(1)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={3}
          label="Template"
          active={step === 2}
          done={false}
          clickable={completed.has(1)}
          onClick={() => completed.has(1) && setStep(2)}
        />
      </ol>

      {step === 0 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Verification Category">
              <Input value={verificationCategoryDerived} disabled />
            </Field>
            <Field
              label="Verification Category Code *"
              error={errors.code?.message}
            >
              <Input type="number" {...register("code")} />
            </Field>
            <Field label="Scope *" error={errors.scope?.message}>
              <select
                className={selectClass}
                value={watch("scope")}
                onChange={(e) =>
                  setValue("scope", e.target.value, { shouldValidate: true })
                }
              >
                <option value="">Select</option>
                {opts.scope.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Apply Capacity *"
              error={errors.applyCapacity?.message}
            >
              <select
                className={selectClass}
                value={watch("applyCapacity")}
                onChange={(e) =>
                  setValue("applyCapacity", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.applyCapacity.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Loan Type" error={errors.loanType?.message}>
              <select
                className={selectClass}
                value={watch("loanType") ?? ""}
                onChange={(e) => setValue("loanType", e.target.value)}
              >
                <option value="">Select</option>
                {loanTypes.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Verification Type *"
              error={errors.verificationType?.message}
            >
              <select
                className={selectClass}
                value={watch("verificationType")}
                onChange={(e) =>
                  setValue("verificationType", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.verificationType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Employment Type">
              <select
                className={selectClass}
                value={watch("employmentType") ?? ""}
                onChange={(e) => setValue("employmentType", e.target.value)}
              >
                <option value="">Select</option>
                {opts.employmentType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lender">
              <select
                className={selectClass}
                value={watch("lender") ?? ""}
                onChange={(e) => setValue("lender", e.target.value)}
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
            <Field label="Eligible Rule">
              <select
                className={selectClass}
                value={watch("eligibleRule") ?? ""}
                onChange={(e) => setValue("eligibleRule", e.target.value)}
              >
                <option value="">Select</option>
                {ruleOptions.eligible.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Template Verification Rule">
              <select
                className={selectClass}
                value={watch("templateRule") ?? ""}
                onChange={(e) => setValue("templateRule", e.target.value)}
              >
                <option value="">Select</option>
                {ruleOptions.template.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
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
          <div className="flex flex-wrap gap-4">
            {allocation.map((rule, i) => (
              <div
                key={`${rule.allocation_rule_id}-${i}`}
                className="flex w-64 flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Allocation Rule:
                  </span>{" "}
                  {rule.type ?? "—"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-slate-700">
                    Allocated To:
                  </span>{" "}
                  {rule.name ?? "—"}
                </p>
                <div className="mt-1 flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setAllocationEditing({ initial: rule, index: i })
                    }
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAllocation((rs) => rs.filter((_, idx) => idx !== i))
                    }
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setAllocationEditing({})}
              className="flex min-h-[8rem] w-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 p-4 text-sm font-medium text-slate-600 hover:border-[#4C7DF0] hover:text-[#4C7DF0]"
            >
              <Plus className="h-5 w-5" />
              Add Allocation Rule
            </button>
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

      {step === 2 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Template</h2>
            <Button
              type="button"
              size="sm"
              onClick={() => setRelationshipModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add New Relationship
            </Button>
          </div>

          {templates.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
              No relationships yet — add one to start configuring questions.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                {templates.map((t) => (
                  <button
                    key={t.relationship_type}
                    type="button"
                    onClick={() => setActiveRelationship(t.relationship_type)}
                    className={
                      activeRelationship === t.relationship_type
                        ? "rounded-md bg-[#1E2A6B] px-3 py-1.5 text-sm font-medium text-white"
                        : "rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200"
                    }
                  >
                    {t.relationship_type}
                  </button>
                ))}
              </div>

              {activeTemplate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Questions — {activeTemplate.relationship_type}
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setQuestionModal({})}
                    >
                      <Plus className="h-4 w-4" /> Add Question
                    </Button>
                  </div>
                  <QuestionsByGroup
                    questions={activeTemplate.questions}
                    onEdit={(q, idx) =>
                      setQuestionModal({ initial: q, index: idx })
                    }
                    onDelete={removeQuestion}
                  />
                </div>
              )}
            </>
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

      {/* Allocation rule modal */}
      <Dialog
        open={allocationEditing !== null}
        onOpenChange={(o) => !o && setAllocationEditing(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {allocationEditing?.initial ? "Edit Allocation Rule" : "Add Allocation Rule"}
            </DialogTitle>
          </DialogHeader>
          {allocationEditing !== null && (
            <AllocationForm
              ruleOptions={ruleOptions.allocation}
              initial={allocationEditing.initial}
              onCancel={() => setAllocationEditing(null)}
              onSubmit={(row) => {
                setAllocation((rs) =>
                  allocationEditing.index != null
                    ? rs.map((r, i) =>
                        i === allocationEditing.index ? row : r
                      )
                    : [...rs, row]
                );
                setAllocationEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Relationship modal */}
      <Dialog
        open={relationshipModalOpen}
        onOpenChange={(o) => !o && setRelationshipModalOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>
          <RelationshipForm
            options={opts.relationship}
            existing={templates.map((t) => t.relationship_type)}
            onCancel={() => setRelationshipModalOpen(false)}
            onSubmit={(v) => addRelationship(v)}
          />
        </DialogContent>
      </Dialog>

      <QuestionModal
        open={questionModal !== null}
        initial={questionModal?.initial}
        questionTypeOptions={opts.questionType}
        onCancel={() => setQuestionModal(null)}
        onSubmit={(q) => {
          addOrUpdateQuestion(q, questionModal?.index);
          setQuestionModal(null);
        }}
      />
    </div>
  );
}

function QuestionsByGroup({
  questions,
  onEdit,
  onDelete,
}: {
  questions: VerificationQuestion[];
  onEdit: (q: VerificationQuestion, idx: number) => void;
  onDelete: (idx: number) => void;
}) {
  // Preserve insertion order, group by group_label.
  const groups = useMemo(() => {
    const map = new Map<string, { question: VerificationQuestion; index: number }[]>();
    questions.forEach((q, i) => {
      const key = q.group_label || "(Ungrouped)";
      const arr = map.get(key) ?? [];
      arr.push({ question: q, index: i });
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [questions]);

  if (groups.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
        No questions yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(([groupLabel, items]) => (
        <div key={groupLabel} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {groupLabel}
          </h4>
          <div className="overflow-hidden rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">S.no</th>
                  <th className="px-3 py-2 text-left">Field Type</th>
                  <th className="px-3 py-2 text-left">Sequence</th>
                  <th className="px-3 py-2 text-left">Field Name</th>
                  <th className="px-3 py-2 text-left">Mandatory</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ question, index }, sNo) => (
                  <tr
                    key={String(question.question_id ?? `${groupLabel}-${index}`)}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2">{sNo + 1}</td>
                    <td className="px-3 py-2">{question.question_type}</td>
                    <td className="px-3 py-2">{question.sequence}</td>
                    <td className="px-3 py-2 font-medium">
                      {question.question_name}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={question.is_mandatory ? "success" : "destructive"}
                      >
                        {question.is_mandatory ? "true" : "false"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(question, index)}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(index)}
                          className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
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
        </div>
      ))}
    </div>
  );
}

function AllocationForm({
  ruleOptions,
  initial,
  onCancel,
  onSubmit,
}: {
  ruleOptions: { value: string; label: string; type?: string }[];
  initial?: AllocationRuleRow;
  onCancel: () => void;
  onSubmit: (row: AllocationRuleRow) => void;
}) {
  const defaults: AllocationValues = useMemo(
    () => ({
      allocateRule: initial?.type ?? "ALLOCATION_RULE",
      allocateTo:
        initial?.allocation_rule_id != null
          ? String(initial.allocation_rule_id)
          : "",
    }),
    [initial]
  );

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AllocationValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((v) => {
    const hit = ruleOptions.find((r) => r.value === v.allocateTo);
    onSubmit({
      allocation_rule_id: v.allocateTo,
      name: hit?.label,
      type: hit?.type ?? "ALLOCATION_RULE",
    });
  });

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Allocation Rule *" error={errors.allocateRule?.message}>
        <select
          className={selectClass}
          value={watch("allocateRule")}
          onChange={(e) =>
            setValue("allocateRule", e.target.value, { shouldValidate: true })
          }
        >
          <option value="ALLOCATION_RULE">Allocation Rule</option>
        </select>
      </Field>
      <Field label="Allocate To *" error={errors.allocateTo?.message}>
        <select
          className={selectClass}
          value={watch("allocateTo")}
          onChange={(e) =>
            setValue("allocateTo", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select Rule</option>
          {ruleOptions.map((o) => (
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

function RelationshipForm({
  options,
  existing,
  onCancel,
  onSubmit,
}: {
  options: { value: string; label: string }[];
  existing: string[];
  onCancel: () => void;
  onSubmit: (v: string) => void;
}) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RelationshipValues>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: { relationship_type: "" },
  });

  const submit = handleSubmit((v) => onSubmit(v.relationship_type));

  const filtered = options.filter((o) => !existing.includes(o.value));

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field
        label="Relationship Type *"
        error={errors.relationship_type?.message}
      >
        <select
          className={selectClass}
          value={watch("relationship_type")}
          onChange={(e) =>
            setValue("relationship_type", e.target.value, {
              shouldValidate: true,
            })
          }
        >
          <option value="">Select</option>
          {filtered.map((o) => (
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
        <Button type="submit">Add</Button>
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
