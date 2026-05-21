import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useAttributionLookups,
  useEmployeeOptions,
  useLinkDetail,
  useSaveLink,
  useTerritoryOptions,
} from "./links-form.api";
import type { LinkSavePayload } from "./links-form.types";

// Legacy AddLinks Yup → zod (+ conditional level fields)
const schema = z
  .object({
    link_id: z.union([z.string(), z.number()]).optional(),
    name: z.string().min(1, "Name is required"),
    attribution: z.string().min(1, "Attribution is required"),
    level: z.string().min(1, "Level is required"),
    territory_id: z.string().optional(),
    user_id: z.string().optional(),
    status: z.coerce.number().int(),
  })
  .superRefine((val, ctx) => {
    if (val.level === "TERRITORY" && !val.territory_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["territory_id"],
        message: "Territory is required",
      });
    }
    if (val.level === "USER" && !val.user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["user_id"],
        message: "User is required",
      });
    }
  });
type FormValues = z.infer<typeof schema>;

const LEVEL_OPTIONS = [
  { value: "TERRITORY", label: "TERRITORY" },
  { value: "USER", label: "USER" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  linkId?: string | number;
  onCancel: () => void;
  onSaved: () => void;
}

export function LinksForm({ linkId, onCancel, onSaved }: Props) {
  const save = useSaveLink();
  const { data: attribution = [] } = useAttributionLookups();
  const { data: territories = [] } = useTerritoryOptions();

  // Legacy: when editing AND user_id is set, fetch with include_user_id to ensure it's in the list.
  const { data: detail } = useLinkDetail(linkId);
  const [employeeQuery, setEmployeeQuery] = useState<string | undefined>();
  useEffect(() => {
    if (detail?.user_id != null) {
      setEmployeeQuery(`include_user_id=${detail.user_id}`);
    }
  }, [detail?.user_id]);
  const { data: employees = [] } = useEmployeeOptions(employeeQuery);

  // utm_tags is an object of key → string; render as an editable list of rows.
  const [utmRows, setUtmRows] = useState<{ id: string; key: string; value: string }[]>(
    []
  );

  const defaults: FormValues = useMemo(
    () => ({
      link_id: detail?.link_id ?? undefined,
      name: detail?.name ?? "",
      attribution: detail?.attribution ?? "",
      level: detail?.level ?? "",
      territory_id:
        detail?.territory_id != null ? String(detail.territory_id) : "",
      user_id: detail?.user_id != null ? String(detail.user_id) : "",
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

  const level = watch("level");

  const onSubmit = handleSubmit(async (values) => {
    const utm_tags: Record<string, string> = {};
    for (const r of utmRows) {
      const k = r.key.trim();
      if (k) utm_tags[k] = r.value;
    }
    const payload: LinkSavePayload = {
      ...(linkId ? { link_id: linkId } : {}),
      name: values.name,
      attribution: values.attribution,
      level: values.level,
      territory_id:
        values.level === "TERRITORY" ? values.territory_id || null : null,
      user_id: values.level === "USER" ? values.user_id || null : null,
      status: Number(values.status),
      utm_tags,
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Link ${linkId ? "updated" : "created"} successfully`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Name *" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Enter name" />
        </Field>

        <Field label="Attribution *" error={errors.attribution?.message}>
          <select
            className={selectClass}
            value={watch("attribution")}
            onChange={(e) =>
              setValue("attribution", e.target.value, { shouldValidate: true })
            }
          >
            <option value="">Select Attribution</option>
            {attribution.map((a) => (
              <option key={a.lu_key} value={a.lu_key}>
                {a.lu_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Level *" error={errors.level?.message}>
          <select
            className={selectClass}
            value={watch("level")}
            onChange={(e) => {
              setValue("level", e.target.value, { shouldValidate: true });
              setValue("territory_id", "");
              setValue("user_id", "");
            }}
          >
            <option value="">Select Level</option>
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {level === "TERRITORY" && (
          <Field
            label="Territory *"
            error={errors.territory_id?.message as string | undefined}
          >
            <select
              className={selectClass}
              value={watch("territory_id") ?? ""}
              onChange={(e) =>
                setValue("territory_id", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select Territory</option>
              {territories.map((t) => (
                <option key={String(t.territory_id)} value={String(t.territory_id)}>
                  {t.territory_name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {level === "USER" && (
          <Field
            label="Select User *"
            error={errors.user_id?.message as string | undefined}
          >
            <select
              className={selectClass}
              value={watch("user_id") ?? ""}
              onChange={(e) =>
                setValue("user_id", e.target.value, { shouldValidate: true })
              }
            >
              <option value="">Select User</option>
              {employees.map((e) => (
                <option key={String(e.user_id)} value={String(e.user_id)}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
        )}

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
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-slate-600">UTM Tags</Label>
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
              <div key={row.id} className="grid grid-cols-12 items-center gap-2">
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

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={save.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Submit"}
        </Button>
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
