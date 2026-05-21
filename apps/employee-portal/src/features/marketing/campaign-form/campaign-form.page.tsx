import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useCampaignDetail,
  useCampaignLookups,
  useSaveCampaign,
} from "./campaign-form.api";
import type { CampaignSavePayload } from "./campaign-form.types";

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be greater than 3 letters"),
  attribution: z.string().min(1, "Attribution is required"),
  description: z.string().min(1, "Description is required"),
  data_source: z.string().min(1, "Data source is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  schedule_at: z.string().optional(),
  headers: z
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
      { message: "Headers must be valid JSON" }
    ),
  status: z.coerce.number().int(),
});
type HeaderValues = z.infer<typeof schema>;

const rulesSchema = z
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
    { message: "Rules must be valid JSON" }
  );

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function CampaignFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useCampaignLookups();
  const { data: detail } = useCampaignDetail(id);
  const save = useSaveCampaign();

  const opts = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      attribution: filter("CAMPAIGN_ATTRIBUTION"),
      dataSource: filter("CAMPAIGN_DATA_SOURCE"),
    };
  }, [lookups]);

  // Wizard
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (id && detail) setCompleted((c) => new Set(c).add(0));
  }, [id, detail]);

  // Step 1 defaults
  const defaults: HeaderValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      attribution: detail?.attribution ?? "",
      description: detail?.description ?? "",
      data_source: detail?.data_source ?? "",
      start_date: detail?.start_date
        ? detail.start_date.split("T")[0] ?? ""
        : "",
      end_date: detail?.end_date ? detail.end_date.split("T")[0] ?? "" : "",
      schedule_at: detail?.schedule_at ?? "0 9 * * *",
      headers:
        Array.isArray(detail?.headers) && detail!.headers!.length > 0
          ? JSON.stringify(detail!.headers, null, 2)
          : "[]",
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
  } = useForm<HeaderValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Step 2 — rules (JSON)
  const [rulesJson, setRulesJson] = useState<string>("{}");
  const [rulesError, setRulesError] = useState<string | null>(null);
  useEffect(() => {
    setRulesJson(
      detail?.rules != null ? JSON.stringify(detail.rules, null, 2) : "{}"
    );
  }, [detail?.rules]);

  // Step 3 — uploads (JSON)
  const [uploadsJson, setUploadsJson] = useState<string>("{}");
  const [uploadsError, setUploadsError] = useState<string | null>(null);
  useEffect(() => {
    setUploadsJson(
      detail?.uploads != null ? JSON.stringify(detail.uploads, null, 2) : "{}"
    );
  }, [detail?.uploads]);

  const buildPayload = (values: HeaderValues): CampaignSavePayload => ({
    ...(detail?.campaign_id ? { campaign_id: detail.campaign_id } : id ? { campaign_id: id } : {}),
    name: values.name,
    attribution: values.attribution,
    description: values.description,
    data_source: values.data_source,
    start_date: values.start_date,
    end_date: values.end_date,
    headers: values.headers ? JSON.parse(values.headers) : [],
    schedule_at: values.schedule_at ?? "0 9 * * *",
    uploads: uploadsJson ? safeParse(uploadsJson) : null,
    rules: rulesJson ? safeParse(rulesJson) : null,
    status: Number(values.status),
  });

  const submitCurrent = async (
    isFinal: boolean,
    advance: () => void
  ): Promise<void> => {
    let values: HeaderValues | null = null;
    await handleSubmit((v) => {
      values = v;
    })();
    if (!values) return;
    try {
      await save.mutateAsync(buildPayload(values));
      toast.success(isFinal ? "Data saved successfully!" : "Step saved");
      if (isFinal) {
        navigate("/marketing/campaign");
      } else {
        advance();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const goNext = async () => {
    if (step === 0) {
      await submitCurrent(false, () => {
        setCompleted((c) => new Set(c).add(0));
        setStep(1);
      });
      return;
    }
    if (step === 1) {
      // Validate rules JSON before advancing.
      const r = rulesSchema.safeParse(rulesJson);
      if (!r.success) {
        setRulesError(r.error.errors[0]?.message ?? "Invalid JSON");
        return;
      }
      setRulesError(null);
      await submitCurrent(false, () => {
        setCompleted((c) => new Set(c).add(1));
        setStep(2);
      });
      return;
    }
    // Final
    const u = rulesSchema.safeParse(uploadsJson);
    if (!u.success) {
      setUploadsError(u.error.errors[0]?.message ?? "Invalid JSON");
      return;
    }
    setUploadsError(null);
    await submitCurrent(true, () => {});
  };

  const goBack = () => {
    if (step === 0) navigate("/marketing/campaign");
    else setStep((s) => (s - 1) as 0 | 1 | 2);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Campaign" : "Add Campaign"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/marketing/campaign">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Campaign Definition"
          active={step === 0}
          done={completed.has(0)}
          clickable
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Rules"
          active={step === 1}
          done={completed.has(1)}
          clickable={completed.has(0)}
          onClick={() => completed.has(0) && setStep(1)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={3}
          label="Campaign Details"
          active={step === 2}
          done={false}
          clickable={completed.has(1)}
          onClick={() => completed.has(1) && setStep(2)}
        />
      </ol>

      {step === 0 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field
              label="Attribution *"
              error={errors.attribution?.message}
            >
              <select
                className={selectClass}
                value={watch("attribution")}
                onChange={(e) =>
                  setValue("attribution", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.attribution.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Data Source *"
              error={errors.data_source?.message}
            >
              <select
                className={selectClass}
                value={watch("data_source")}
                onChange={(e) =>
                  setValue("data_source", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {opts.dataSource.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start Date *" error={errors.start_date?.message}>
              <Input type="date" {...register("start_date")} />
            </Field>
            <Field label="End Date *" error={errors.end_date?.message}>
              <Input type="date" {...register("end_date")} />
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
            <Field label="Schedule (cron)">
              <Input
                {...register("schedule_at")}
                placeholder="0 9 * * *"
                className="font-mono text-xs"
              />
            </Field>
            <div className="md:col-span-3">
              <Field label="Description *" error={errors.description?.message}>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field
                label="Headers (JSON)"
                error={errors.headers?.message}
              >
                <textarea
                  rows={4}
                  {...register("headers")}
                  placeholder="[]"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save Next"}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Audience Rules
          </h2>
          <p className="text-xs text-slate-400">
            Legacy audience-rule builder isn't ported yet — capture the rules
            schema as JSON for now.
          </p>
          <textarea
            rows={10}
            value={rulesJson}
            onChange={(e) => setRulesJson(e.target.value)}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
          {rulesError && (
            <p className="text-xs text-rose-500">{rulesError}</p>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save Next"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Campaign Details
          </h2>
          <p className="text-xs text-slate-400">
            Headers / Schedule / Media / Link sub-tabs aren't ported yet — for
            now capture uploads (selected media/link bundle) as JSON.
          </p>
          <textarea
            rows={12}
            value={uploadsJson}
            onChange={(e) => setUploadsJson(e.target.value)}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
          />
          {uploadsError && (
            <p className="text-xs text-rose-500">{uploadsError}</p>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={goBack}>
              Back
            </Button>
            <Button type="button" onClick={goNext} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
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
