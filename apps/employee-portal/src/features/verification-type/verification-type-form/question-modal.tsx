import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@craft-apex/ui";
import type { VerificationQuestion } from "./verification-type-form.types";

const schema = z
  .object({
    group_label: z.string().min(1, "Group label is required."),
    group_sequence: z.coerce.number(),
    group_label_display: z.string().min(1, "Group label display is required"),
    question_type: z.string().min(1, "Question type is required."),
    question_name: z.string().min(1, "Question name is required."),
    sequence: z.coerce.number(),
    is_mandatory: z.boolean(),
    question_validation: z.string().optional(),
    question_conditional_on: z.string().optional(),
    question_dependent_on: z.string().optional(),
    question_disabled_on: z.string().optional(),
    question_auto_fill: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const jsonFields = [
      "question_validation",
      "question_conditional_on",
      "question_dependent_on",
      "question_disabled_on",
      "question_auto_fill",
    ] as const;
    for (const f of jsonFields) {
      const raw = v[f];
      if (!raw) continue;
      try {
        JSON.parse(raw);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [f],
          message: "Must be valid JSON",
        });
      }
    }
  });
type FormValues = z.infer<typeof schema>;

const GROUP_DISPLAY_OPTIONS = [
  { value: "SHOW", label: "Show" },
  { value: "HIDE", label: "Hide" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  open: boolean;
  initial?: VerificationQuestion;
  questionTypeOptions: { value: string; label: string }[];
  onCancel: () => void;
  onSubmit: (q: VerificationQuestion) => void;
}

export function QuestionModal({
  open,
  initial,
  questionTypeOptions,
  onCancel,
  onSubmit,
}: Props) {
  const defaults: FormValues = useMemo(
    () => ({
      group_label: initial?.group_label ?? "",
      group_sequence: Number(initial?.group_sequence ?? 0),
      group_label_display: initial?.group_label_display ?? "",
      question_type: initial?.question_type ?? "",
      question_name: initial?.question_name ?? "",
      sequence: Number(initial?.sequence ?? 0),
      is_mandatory: Boolean(initial?.is_mandatory),
      question_validation: initial?.question_validation
        ? JSON.stringify(initial.question_validation)
        : "",
      question_conditional_on: initial?.question_conditional_on
        ? JSON.stringify(initial.question_conditional_on)
        : "",
      question_dependent_on: initial?.question_dependent_on
        ? JSON.stringify(initial.question_dependent_on)
        : "",
      question_disabled_on: initial?.question_disabled_on
        ? JSON.stringify(initial.question_disabled_on)
        : "",
      question_auto_fill: initial?.question_auto_fill
        ? JSON.stringify(initial.question_auto_fill)
        : "",
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const [options, setOptions] = useState<string[]>(
    Array.isArray(initial?.question_options) ? initial!.question_options! : []
  );
  const [optionInput, setOptionInput] = useState("");

  useEffect(() => {
    reset(defaults);
    setOptions(
      Array.isArray(initial?.question_options) ? initial!.question_options! : []
    );
    setOptionInput("");
  }, [defaults, initial, reset]);

  const submit = handleSubmit((v) => {
    onSubmit({
      question_id: initial?.question_id,
      question_type: v.question_type,
      question_name: v.question_name,
      question_category: "QUESTION",
      group_label: v.group_label,
      group_sequence: v.group_sequence,
      group_label_display: v.group_label_display,
      sequence: v.sequence,
      is_mandatory: v.is_mandatory,
      question_options: options.length > 0 ? options : null,
      question_validation: v.question_validation
        ? JSON.parse(v.question_validation)
        : null,
      question_conditional_on: v.question_conditional_on
        ? JSON.parse(v.question_conditional_on)
        : null,
      question_dependent_on: v.question_dependent_on
        ? JSON.parse(v.question_dependent_on)
        : null,
      question_disabled_on: v.question_disabled_on
        ? JSON.parse(v.question_disabled_on)
        : null,
      question_auto_fill: v.question_auto_fill
        ? JSON.parse(v.question_auto_fill)
        : null,
    });
  });

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) return;
    setOptions((prev) => [...prev, trimmed]);
    setOptionInput("");
  };

  const removeOption = (i: number) =>
    setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const isDropdown = watch("question_type") === "DROPDOWN";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {initial?.question_id ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Group Label *" error={errors.group_label?.message}>
              <Input {...register("group_label")} />
            </Field>
            <Field
              label="Group Sequence *"
              error={errors.group_sequence?.message}
            >
              <Input type="number" {...register("group_sequence")} />
            </Field>
            <Field
              label="Group Label Display *"
              error={errors.group_label_display?.message}
            >
              <select
                className={selectClass}
                value={watch("group_label_display")}
                onChange={(e) =>
                  setValue("group_label_display", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {GROUP_DISPLAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Question Type *" error={errors.question_type?.message}>
              <select
                className={selectClass}
                value={watch("question_type")}
                onChange={(e) =>
                  setValue("question_type", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {questionTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Question Name *"
              error={errors.question_name?.message}
            >
              <Input {...register("question_name")} />
            </Field>
            <Field
              label="Question Sequence *"
              error={errors.sequence?.message}
            >
              <Input type="number" {...register("sequence")} />
            </Field>
            <Field label="Mandatory">
              <label className="inline-flex items-center gap-2 pt-2 text-sm">
                <input
                  type="checkbox"
                  checked={watch("is_mandatory")}
                  onChange={(e) => setValue("is_mandatory", e.target.checked)}
                />
                Is mandatory
              </label>
            </Field>
          </div>

          {isDropdown && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Question Options
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && optionInput.trim()) {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Add option…"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addOption}
                  disabled={!optionInput.trim()}
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {options.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {options.map((o, i) => (
                    <button
                      key={`${o}-${i}`}
                      type="button"
                      onClick={() => removeOption(i)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#4C7DF0]/10 px-3 py-1 text-xs font-medium text-[#4C7DF0]"
                    >
                      {o} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <details className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
            <summary className="cursor-pointer text-xs font-medium text-slate-600">
              Advanced (JSON)
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <JsonField
                label="Validation"
                error={errors.question_validation?.message}
                {...register("question_validation")}
              />
              <JsonField
                label="Conditional On"
                error={errors.question_conditional_on?.message}
                {...register("question_conditional_on")}
              />
              <JsonField
                label="Dependent On"
                error={errors.question_dependent_on?.message}
                {...register("question_dependent_on")}
              />
              <JsonField
                label="Disabled On"
                error={errors.question_disabled_on?.message}
                {...register("question_disabled_on")}
              />
              <JsonField
                label="Auto Fill"
                error={errors.question_auto_fill?.message}
                {...register("question_auto_fill")}
              />
            </div>
          </details>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initial?.question_id ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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

const JsonField = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    error?: string;
  }
) => {
  const { label, error, ...textareaProps } = props;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <textarea
        rows={2}
        {...textareaProps}
        className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
