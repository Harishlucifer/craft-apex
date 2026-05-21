import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  Eye,
  Pencil,
  Plus,
  Save,
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
import { OutputList, type GroupCondition } from "@/components/query-builder";
import { parameterToFieldOption } from "@/features/rule/rule-form/rule-form.types";
import {
  fetchRuleById,
  saveScoringRule,
  useLoanTypeOptions,
  useSaveScorecard,
  useScorecardDetail,
  useScoringParameterList,
} from "./scoring-engine-form.api";
import {
  CATEGORY_OPTIONS,
  PURPOSE_OPTIONS,
  type ScoreRatingRow,
  type ScorecardCategoryRow,
  type ScorecardSavePayload,
} from "./scoring-engine-form.types";

const detailsSchema = z.object({
  scoreCardCode: z.string().min(1, "Score Card Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  loanType: z.string().min(1, "Loan Type is required"),
  purpose: z.string().min(1, "Purpose is required"),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
  status: z.coerce.number().int(),
});
type DetailsValues = z.infer<typeof detailsSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const EMPTY_RATING: ScoreRatingRow = {
  scoreFrom: null,
  scoreTo: null,
  riskLevel: "",
  remarks: "",
  status: 1,
};

const EMPTY_RULE_TREE: GroupCondition = {
  operator: "OR",
  output: {},
  conditions: [{ operator: "OR", output: {}, conditions: [] }],
};

export default function ScoringEngineFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isViewMode =
    (location.state as { mode?: string } | null)?.mode === "view";

  const { data: loanTypes = [] } = useLoanTypeOptions();
  const { data: parameters = [] } = useScoringParameterList();
  const { data: detail } = useScorecardDetail(id);
  const save = useSaveScorecard();

  const fieldOptions = useMemo(
    () => parameters.map(parameterToFieldOption),
    [parameters]
  );

  // Wizard state
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  // Step 1 form (Basic Details).
  const detailsDefaults: DetailsValues = useMemo(
    () => ({
      scoreCardCode: detail?.code ?? "",
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      loanType:
        detail?.loan_type?.id != null ? String(detail.loan_type.id) : "",
      purpose: detail?.purpose ?? "",
      effective_from: detail?.effective_from ?? "",
      effective_to: detail?.effective_to ?? "",
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
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: detailsDefaults,
  });

  useEffect(() => {
    reset(detailsDefaults);
  }, [detailsDefaults, reset]);

  // Step 2 — score ratings.
  const [ratings, setRatings] = useState<ScoreRatingRow[]>([EMPTY_RATING]);
  // Step 3 — rule categories.
  const [categories, setCategories] = useState<ScorecardCategoryRow[]>([]);

  // Seed from detail.
  useEffect(() => {
    if (!detail) return;
    if (Array.isArray(detail.scorecardRatings)) {
      setRatings(
        detail.scorecardRatings.length > 0
          ? detail.scorecardRatings.map((r) => ({
              scoreFrom: r.scoreFrom ?? null,
              scoreTo: r.scoreTo ?? null,
              riskLevel: r.riskLevel ?? "",
              remarks: r.remarks ?? "",
              status: 1,
            }))
          : [EMPTY_RATING]
      );
    }
    if (Array.isArray(detail.scorecardCategories)) {
      setCategories(
        detail.scorecardCategories.map((c) => ({
          uiId: String(c.id ?? `${Date.now()}-${Math.random()}`),
          categoryName: c.categoryName,
          weightage: Number(c.weightage ?? 0),
          ruleId: c.ruleId ?? null,
        }))
      );
    }
  }, [detail]);

  // Category modal state.
  const [modalCategory, setModalCategory] = useState<
    | { initial?: ScorecardCategoryRow; index?: number }
    | null
  >(null);

  const addCategory = () => setModalCategory({});
  const editCategory = (c: ScorecardCategoryRow, index: number) =>
    setModalCategory({ initial: c, index });

  const removeCategory = (index: number) => {
    setCategories((rs) => rs.filter((_, i) => i !== index));
    if (ruleEditing?.index === index) setRuleEditing(null);
  };

  // Inline rule editor for a category.
  const [ruleEditing, setRuleEditing] = useState<
    | { index: number; mode: "EDIT" | "CHOOSE"; tree: GroupCondition }
    | null
  >(null);

  const openRuleForCategory = async (
    index: number,
    mode: "EDIT" | "CHOOSE"
  ) => {
    const cat = categories[index];
    if (!cat) return;
    let tree: GroupCondition = cat.ruleParameters ?? EMPTY_RULE_TREE;
    if (cat.ruleId) {
      const r = await fetchRuleById(cat.ruleId);
      if (r?.rule) tree = r.rule as GroupCondition;
    }
    setRuleEditing({ index, mode, tree });
  };

  const saveRule = async () => {
    if (!ruleEditing) return;
    const cat = categories[ruleEditing.index];
    if (!cat) return;
    const firstGroup = ruleEditing.tree.conditions[0] as
      | GroupCondition
      | undefined;
    if (!firstGroup || firstGroup.conditions.length === 0) {
      toast.error("Please add at least one condition to the rule.");
      return;
    }
    try {
      const res = await saveScoringRule({
        ...(cat.ruleId ? { rule_id: cat.ruleId } : {}),
        rule_name: cat.categoryName,
        rule_type: "",
        status: 1,
        rule: ruleEditing.tree,
        validation_params: null,
        output_params: null,
      });
      const newRuleId =
        (res as any)?.data?.rule_id ??
        (res as any)?.result?.rule_id ??
        (res as any)?.data?.data?.rule_id;
      setCategories((rs) =>
        rs.map((r, i) =>
          i === ruleEditing.index
            ? { ...r, ruleId: newRuleId, ruleParameters: ruleEditing.tree }
            : r
        )
      );
      toast.success("Rule saved successfully");
      setRuleEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save rule");
    }
  };

  const next = handleSubmit(async () => {
    if (step === 0) {
      setCompleted((c) => new Set(c).add(0));
      setStep(1);
      return;
    }
    if (step === 1) {
      setCompleted((c) => new Set(c).add(1));
      setStep(2);
      return;
    }
    // Step 2 — final save.
    if (categories.length === 0) {
      toast.error("Please add at least one rule category");
      return;
    }
    const values = getValues();
    const payload: ScorecardSavePayload = {
      ...(id ? { id } : {}),
      code: values.scoreCardCode,
      name: values.name,
      description: values.description,
      purpose: values.purpose,
      loan_type_id: values.loanType,
      status: Number(values.status),
      effective_from: values.effective_from || undefined,
      effective_to: values.effective_to || undefined,
      scorecardRatings: ratings
        .filter((r) => r.scoreFrom || r.scoreTo || r.riskLevel || r.remarks)
        .map((r) => ({
          scoreFrom: r.scoreFrom != null ? Number(r.scoreFrom) : null,
          scoreTo: r.scoreTo != null ? Number(r.scoreTo) : null,
          riskLevel: r.riskLevel,
          remarks: r.remarks,
          status: 1,
        })),
      scorecardCategories: categories.map((c, index) => ({
        // Numeric uiId means client-side new row → empty string per legacy.
        id: /^\d+$/.test(c.uiId) ? "" : c.uiId,
        categoryName: c.categoryName,
        weightage: Number(c.weightage),
        sequenceNo: index + 1,
        status: 1,
        ruleId: c.ruleId ?? null,
      })),
    };

    try {
      await save.mutateAsync(payload);
      toast.success("Scoring card saved successfully");
      navigate("/settings/scoring-engine");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save scoring card");
    }
  });

  const goBack = () => {
    if (step === 0) {
      navigate("/settings/scoring-engine");
    } else {
      setStep((s) => (s - 1) as 0 | 1 | 2);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Scoring Card" : "Add Scoring Card"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/scoring-engine">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Basic Details"
          active={step === 0}
          done={completed.has(0)}
          clickable
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Score Rating"
          active={step === 1}
          done={completed.has(1)}
          clickable={completed.has(0)}
          onClick={() => completed.has(0) && setStep(1)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={3}
          label="Rule Definition"
          active={step === 2}
          done={false}
          clickable={completed.has(1)}
          onClick={() => completed.has(1) && setStep(2)}
        />
      </ol>

      {step === 0 && (
        <form
          onSubmit={next}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Score Card Code *"
              error={errors.scoreCardCode?.message}
            >
              <Input
                value={watch("scoreCardCode")}
                onChange={(e) =>
                  setValue(
                    "scoreCardCode",
                    e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    { shouldValidate: true }
                  )
                }
                disabled={isViewMode}
                placeholder="Enter score card code"
              />
            </Field>
            <Field label="Name *" error={errors.name?.message}>
              <Input
                {...register("name")}
                disabled={isViewMode}
                placeholder="Enter score card name"
              />
            </Field>
            <Field label="Purpose *" error={errors.purpose?.message}>
              <select
                className={selectClass}
                value={watch("purpose")}
                onChange={(e) =>
                  setValue("purpose", e.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={isViewMode}
              >
                <option value="">Select purpose</option>
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Loan Type *" error={errors.loanType?.message}>
              <select
                className={selectClass}
                value={watch("loanType")}
                onChange={(e) =>
                  setValue("loanType", e.target.value, {
                    shouldValidate: true,
                  })
                }
                disabled={isViewMode}
              >
                <option value="">Select loan type</option>
                {loanTypes.map((l) => (
                  <option key={String(l.id)} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description *" error={errors.description?.message}>
                <textarea
                  rows={3}
                  {...register("description")}
                  disabled={isViewMode}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
            <Field label="Status *" error={errors.status?.message}>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={watch("status") === 1}
                    onChange={() =>
                      setValue("status", 1, { shouldValidate: true })
                    }
                    disabled={isViewMode}
                  />
                  Active
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={watch("status") === 0}
                    onChange={() =>
                      setValue("status", 0, { shouldValidate: true })
                    }
                    disabled={isViewMode}
                  />
                  Inactive
                </label>
              </div>
            </Field>
            <Field label="Effective From">
              <Input
                type="date"
                {...register("effective_from")}
                disabled={isViewMode}
              />
            </Field>
            <Field label="Effective To">
              <Input
                type="date"
                {...register("effective_to")}
                disabled={isViewMode}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
            {!isViewMode && <Button type="submit">Save &amp; Next</Button>}
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Score Rating Configuration
          </h2>
          <div className="space-y-3">
            {ratings.map((row, i) => (
              <div
                key={i}
                className="rounded-md border border-slate-200 bg-slate-50/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="secondary">Rating #{i + 1}</Badge>
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setRatings((rs) => rs.filter((_, idx) => idx !== i))
                      }
                      className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Field label="From Score *">
                    <Input
                      type="number"
                      value={row.scoreFrom ?? ""}
                      onChange={(e) =>
                        setRatings((rs) =>
                          rs.map((r, idx) =>
                            idx === i
                              ? {
                                  ...r,
                                  scoreFrom:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      disabled={isViewMode}
                    />
                  </Field>
                  <Field label="To Score *">
                    <Input
                      type="number"
                      value={row.scoreTo ?? ""}
                      onChange={(e) =>
                        setRatings((rs) =>
                          rs.map((r, idx) =>
                            idx === i
                              ? {
                                  ...r,
                                  scoreTo:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      disabled={isViewMode}
                    />
                  </Field>
                  <Field label="Risk Level *">
                    <Input
                      value={row.riskLevel}
                      onChange={(e) =>
                        setRatings((rs) =>
                          rs.map((r, idx) =>
                            idx === i ? { ...r, riskLevel: e.target.value } : r
                          )
                        )
                      }
                      disabled={isViewMode}
                    />
                  </Field>
                  <Field label="Remarks *">
                    <Input
                      value={row.remarks}
                      onChange={(e) =>
                        setRatings((rs) =>
                          rs.map((r, idx) =>
                            idx === i ? { ...r, remarks: e.target.value } : r
                          )
                        )
                      }
                      disabled={isViewMode}
                    />
                  </Field>
                </div>
              </div>
            ))}
            {!isViewMode && (
              <div className="text-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRatings((rs) => [...rs, EMPTY_RATING])}
                >
                  <Plus className="h-4 w-4" /> Add Score Rating
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            {!isViewMode && (
              <Button type="button" onClick={next}>
                Save &amp; Next
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Rule Categories
            </h2>
            {!isViewMode && (
              <Button type="button" size="sm" onClick={addCategory}>
                <Plus className="h-4 w-4" /> Add Category
              </Button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.length === 0 ? (
              <p className="w-full rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center text-sm text-slate-400">
                No categories yet.
              </p>
            ) : (
              categories.map((c, i) => (
                <div
                  key={c.uiId}
                  className="flex min-w-[280px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="rounded-t-xl bg-[#1E2A6B] px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {c.categoryName}
                    </p>
                  </div>
                  <div className="flex flex-1 items-center justify-center px-4 py-6">
                    <div className="rounded-full bg-[#4C7DF0]/10 px-4 py-2 text-sm font-semibold text-[#4C7DF0]">
                      {c.weightage}% Weightage
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-b-xl bg-slate-50 p-2">
                    <button
                      type="button"
                      onClick={() => editCategory(c, i)}
                      className="rounded-full bg-slate-200/50 p-1.5 text-slate-600 hover:bg-slate-200"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(i)}
                      className="rounded-full bg-rose-100 p-1.5 text-rose-600 hover:bg-rose-200"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openRuleForCategory(i, "CHOOSE")}
                      className="rounded-full bg-sky-100 p-1.5 text-sky-600 hover:bg-sky-200"
                      aria-label="View Rules"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openRuleForCategory(i, "EDIT")}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                    >
                      <Plus className="h-3 w-3" /> Add Rule
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {ruleEditing && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Rule Builder:{" "}
                  {categories[ruleEditing.index]?.categoryName ?? ""}
                </h3>
                <button
                  type="button"
                  onClick={() => setRuleEditing(null)}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <OutputList
                value={ruleEditing.tree}
                onChange={(tree) =>
                  setRuleEditing((prev) => (prev ? { ...prev, tree } : prev))
                }
                fieldOptions={fieldOptions}
                mode={ruleEditing.mode}
              />
              {ruleEditing.mode === "EDIT" && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRuleEditing(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={saveRule}>
                    <Save className="h-4 w-4" /> Save Rule
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            {!isViewMode && (
              <Button type="button" onClick={next} disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save & Finish"}
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={modalCategory !== null}
        onOpenChange={(o) => !o && setModalCategory(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalCategory?.initial ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          {modalCategory !== null && (
            <CategoryForm
              initial={modalCategory.initial}
              onCancel={() => setModalCategory(null)}
              onSubmit={(row) => {
                setCategories((rs) =>
                  modalCategory.index != null
                    ? rs.map((r, i) =>
                        i === modalCategory.index
                          ? { ...row, uiId: r.uiId, ruleId: r.ruleId }
                          : r
                      )
                    : [...rs, row]
                );
                setModalCategory(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const categorySchema = z.object({
  categoryName: z.string().min(1, "Category name is required"),
  weightage: z.coerce
    .number()
    .min(0, "Min 0")
    .max(100, "Max 100"),
});
type CategoryValues = z.infer<typeof categorySchema>;

function CategoryForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: ScorecardCategoryRow;
  onCancel: () => void;
  onSubmit: (row: ScorecardCategoryRow) => void;
}) {
  const defaults: CategoryValues = useMemo(
    () => ({
      categoryName: initial?.categoryName ?? "",
      weightage: initial?.weightage ?? 0,
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
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((values) => {
    onSubmit({
      uiId: initial?.uiId ?? String(Date.now()),
      categoryName: values.categoryName,
      weightage: Number(values.weightage),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Category Name *" error={errors.categoryName?.message}>
        <select
          className={selectClass}
          value={watch("categoryName")}
          onChange={(e) =>
            setValue("categoryName", e.target.value, { shouldValidate: true })
          }
        >
          <option value="">Select or create category</option>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Weightage (%) *" error={errors.weightage?.message}>
        <Input
          type="number"
          min={0}
          max={100}
          {...register("weightage")}
          placeholder="Enter weightage percentage"
        />
      </Field>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Check className="h-4 w-4" />
          {initial ? "Save Changes" : "Add Category"}
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
