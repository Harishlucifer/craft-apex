import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useLinkOptions,
  useMediaDetail,
  useMediaLookups,
  useSaveMedia,
} from "./media-form.api";
import type { MediaSavePayload } from "./media-form.types";

// Legacy AddMedia Yup → zod.
const schema = z.object({
  title: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  media_type: z.string().min(1, "Media type is required"),
  media_url: z.string().min(1, "Media URL is required"),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence is required" })
    .int(),
  language: z.string().min(1, "Language is required"),
  media_tags: z.array(z.string()).min(1, "Media Tags is required"),
  platform: z.array(z.string()).min(1, "Platform is required"),
  link_id: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

// Legacy hardcoded values.
const LANGUAGE_OPTIONS = [
  { value: "HINDI", label: "Hindi" },
  { value: "TAMIL", label: "Tamil" },
  { value: "ENGLISH", label: "English" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function MediaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useMediaLookups();
  const { data: links = [] } = useLinkOptions();
  const { data: detail } = useMediaDetail(id);
  const save = useSaveMedia();

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      mediaType: filter("MEDIA_TYPE"),
      mediaTags: filter("MARKETING_CREATIVE"),
      platform: filter("PLATFORM"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      title: detail?.title ?? "",
      description: detail?.description ?? "",
      media_type: detail?.media_type ?? "",
      media_url: detail?.media_url ?? "",
      sequence: Number(detail?.sequence ?? 0),
      language: detail?.language ?? "",
      media_tags: Array.isArray(detail?.media_tags) ? detail!.media_tags! : [],
      platform: Array.isArray(detail?.platform) ? detail!.platform! : [],
      link_id: detail?.link_id != null ? String(detail.link_id) : "",
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // utm_tags rows (legacy stores as object).
  const [utmRows, setUtmRows] = useState<
    { id: string; key: string; value: string }[]
  >([]);

  useEffect(() => {
    reset(defaults);
    const tags = detail?.utm_tags ?? {};
    setUtmRows(
      Object.entries(tags).map(([k, v], i) => ({
        id: `r-${i}`,
        key: k,
        value: String(v ?? ""),
      }))
    );
  }, [defaults, detail, reset]);

  const toggleArrayValue = (
    field: "media_tags" | "platform",
    value: string
  ) => {
    const cur = (watch(field) ?? []) as string[];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    setValue(field, next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    const utm_tags: Record<string, string> = {};
    for (const r of utmRows) {
      const k = r.key.trim();
      if (k) utm_tags[k] = r.value;
    }
    const payload: MediaSavePayload = {
      ...(id ? { media_id: id } : {}),
      title: values.title,
      description: values.description,
      media_type: values.media_type,
      media_url: values.media_url,
      sequence: Number(values.sequence),
      language: values.language,
      media_tags: values.media_tags,
      platform: values.platform,
      link_id: values.link_id || undefined,
      utm_tags,
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(
        `Media ${id ? "updated" : "submitted"} successfully`
      );
      navigate("/marketing/media");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  const mediaTags = watch("media_tags") ?? [];
  const platform = watch("platform") ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Media" : "Add Media"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/marketing/media">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="md:col-span-3">
            <Field label="Media Title *" error={errors.title?.message}>
              <Input {...register("title")} placeholder="Enter media title" />
            </Field>
          </div>

          <Field label="Media Type *" error={errors.media_type?.message}>
            <select
              className={selectClass}
              value={watch("media_type")}
              onChange={(e) =>
                setValue("media_type", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {options.mediaType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Media URL *" error={errors.media_url?.message}>
            <Input
              {...register("media_url")}
              placeholder="https://…"
            />
          </Field>

          <Field label="Sequence *" error={errors.sequence?.message}>
            <Input type="number" {...register("sequence")} />
          </Field>

          <Field label="Language *" error={errors.language?.message}>
            <select
              className={selectClass}
              value={watch("language")}
              onChange={(e) =>
                setValue("language", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Link">
            <select
              className={selectClass}
              value={watch("link_id") ?? ""}
              onChange={(e) => setValue("link_id", e.target.value)}
            >
              <option value="">— None —</option>
              {links.map((l) => (
                <option key={String(l.link_id)} value={String(l.link_id)}>
                  {l.name}
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
              <option value="-1">In-Active</option>
            </select>
          </Field>

          <div className="md:col-span-3">
            <Field label="Description">
              <textarea
                rows={3}
                {...register("description")}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
              />
            </Field>
          </div>
        </div>

        <MultiSelectField
          label="Media Tags *"
          options={options.mediaTags}
          selected={mediaTags}
          onToggle={(v) => toggleArrayValue("media_tags", v)}
          error={errors.media_tags?.message as string | undefined}
        />

        <MultiSelectField
          label="Platform *"
          options={options.platform}
          selected={platform}
          onToggle={(v) => toggleArrayValue("platform", v)}
          error={errors.platform?.message as string | undefined}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-slate-600">
              UTM Tags
            </Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setUtmRows((rs) => [
                  ...rs,
                  { id: `r-${Date.now()}`, key: "", value: "" },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add UTM Tag
            </Button>
          </div>
          {utmRows.length === 0 ? (
            <p className="text-xs text-slate-400">No UTM tags.</p>
          ) : (
            <div className="space-y-2">
              {utmRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-12 items-center gap-2"
                >
                  <Input
                    className="col-span-5"
                    placeholder="Key"
                    value={row.key}
                    onChange={(e) =>
                      setUtmRows((rs) =>
                        rs.map((r) =>
                          r.id === row.id ? { ...r, key: e.target.value } : r
                        )
                      )
                    }
                  />
                  <Input
                    className="col-span-6"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) =>
                      setUtmRows((rs) =>
                        rs.map((r) =>
                          r.id === row.id ? { ...r, value: e.target.value } : r
                        )
                      )
                    }
                  />
                  <button
                    type="button"
                    className="col-span-1 inline-flex items-center justify-center rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                    onClick={() =>
                      setUtmRows((rs) => rs.filter((r) => r.id !== row.id))
                    }
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {detail?.sharable_url && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Sharable URL
            </Label>
            <Input value={detail.sharable_url} readOnly />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/marketing/media">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MultiSelectField({
  label,
  options,
  selected,
  onToggle,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50/40 p-2">
        {options.length === 0 ? (
          <span className="text-xs text-slate-400">No options.</span>
        ) : (
          options.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                className={
                  active
                    ? "inline-flex items-center gap-1.5 rounded-full border border-[#4C7DF0] bg-[#4C7DF0] px-3 py-1 text-xs font-medium text-white"
                    : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-slate-300"
                }
              >
                {o.label}
                {active && <X className="h-3 w-3" />}
              </button>
            );
          })
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
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
