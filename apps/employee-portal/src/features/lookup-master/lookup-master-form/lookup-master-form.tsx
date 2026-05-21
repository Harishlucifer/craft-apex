import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { useSaveLookup } from "./lookup-master-form.api";
import type { LookupItem } from "../lookup-master-list/lookup-master-list.types";

// Legacy formik validationSchema → zod
const schema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
  group_code: z.string().min(1, "Group code is required"),
  lu_key: z.string().min(1, "Key is required"),
  lu_name: z.string().min(1, "Name is required"),
  lu_value: z.string().optional(),
  created_by: z.string().optional(),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  /** the existing item when editing; undefined for create */
  initial?: LookupItem;
  /** group_code preset when adding from inside a group */
  defaultGroupCode?: string;
  onCancel: () => void;
  onSaved: () => void;
}

export function LookupMasterForm({
  initial,
  defaultGroupCode,
  onCancel,
  onSaved,
}: Props) {
  const save = useSaveLookup();

  const defaults: FormValues = useMemo(
    () => ({
      id: initial?.id ?? null,
      group_code: initial?.group_code ?? defaultGroupCode ?? "",
      lu_key: initial?.lu_key ?? "",
      lu_name: initial?.lu_name ?? "",
      lu_value: initial?.lu_value ?? initial?.lu_key ?? "",
      created_by: initial?.created_by ?? "",
      status: (initial?.status as number | undefined) ?? 1,
    }),
    [initial, defaultGroupCode]
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
  }, [defaults, reset]);

  const isSystem = watch("created_by") === "SYSTEM";

  // Legacy AddLookup: lu_key auto-uppercases with underscores; lu_value mirrors it as spaces+upper.
  const onKeyChange = (raw: string) => {
    const key = raw.replace(/ /g, "_").toUpperCase();
    setValue("lu_key", key, { shouldValidate: true });
    setValue("lu_value", key.replace(/_/g, " ").toUpperCase());
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      id: (values.id as string | number | null) ?? null,
      group_code: values.group_code,
      lu_key: values.lu_key,
      lu_name: values.lu_name,
      lu_value:
        values.lu_value || values.lu_key.replace(/_/g, " ").toUpperCase(),
      created_by: values.created_by || "USER",
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(`Lookup ${initial?.id ? "updated" : "saved"} successfully`);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {initial?.id ? (
          <div className="space-y-1.5">
            <Label htmlFor="lk-id">Lookup ID</Label>
            <Input id="lk-id" value={String(initial.id)} disabled />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="lk-key">
            Lookup Key <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="lk-key"
            value={watch("lu_key")}
            disabled={isSystem}
            onChange={(e) => onKeyChange(e.target.value)}
          />
          {errors.lu_key && (
            <p className="text-xs text-rose-500">{errors.lu_key.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lk-name">
            Lookup Name <span className="text-rose-500">*</span>
          </Label>
          <Input id="lk-name" {...register("lu_name")} />
          {errors.lu_name && (
            <p className="text-xs text-rose-500">{errors.lu_name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lk-value">Lookup Value</Label>
          <Input
            id="lk-value"
            value={watch("lu_key").replace(/_/g, " ").toUpperCase()}
            disabled
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lk-group">
            Group Code <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="lk-group"
            {...register("group_code")}
            disabled={isSystem}
          />
          {errors.group_code && (
            <p className="text-xs text-rose-500">
              {errors.group_code.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lk-created">Created By</Label>
          <Input
            id="lk-created"
            value={watch("created_by") || "USER"}
            disabled
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lk-status">Status</Label>
          <select
            id="lk-status"
            className={selectClass}
            value={String(watch("status") ?? "")}
            onChange={(e) =>
              setValue("status", Number(e.target.value), {
                shouldValidate: true,
              })
            }
            disabled={isSystem}
          >
            <option value="1">Active</option>
            <option value="-1">Inactive</option>
          </select>
        </div>
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
        <Button type="submit" disabled={save.isPending || isSystem}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
