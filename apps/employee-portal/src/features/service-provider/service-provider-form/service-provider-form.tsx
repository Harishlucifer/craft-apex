import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useSaveServiceProvider,
  useServiceProviderLookups,
} from "./service-provider-form.api";
import type {
  ServiceProviderForm as FormShape,
  ServiceProviderPayload,
} from "./service-provider-form.types";
import type { ServiceProviderRow } from "../service-provider-list/service-provider-list.types";

// Legacy AddServiceProvider Yup → zod
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  provider_type: z.string().min(1, "Service Provider Type is required"),
  type: z.string().min(1, "Type is required"),
  credentials: z
    .string()
    .min(1, "Credentials JSON is required")
    .refine(
      (v) => {
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid JSON format" }
    ),
  external_id: z.string().optional(),
  status: z.coerce.number().int(),
});

interface Props {
  /** the row when editing; undefined for create */
  initial?: ServiceProviderRow;
  onCancel: () => void;
  onSaved: () => void;
}

export function ServiceProviderForm({ initial, onCancel, onSaved }: Props) {
  const { data: lookups = [] } = useServiceProviderLookups();
  const save = useSaveServiceProvider();

  const serviceProviderTypes = useMemo(
    () => lookups.filter((l) => l.group_code === "SERVICE_PROVIDER_TYPE"),
    [lookups]
  );

  const defaults: FormShape = useMemo(
    () => ({
      id: initial?.id,
      name: initial?.name ?? "",
      provider_type: (initial as { provider_type?: string } | undefined)
        ?.provider_type ?? "",
      type: initial?.type ?? "",
      credentials: initial?.credentials
        ? JSON.stringify(initial.credentials)
        : "",
      external_id:
        (initial as { external_id?: string } | undefined)?.external_id ?? "",
      status: (initial?.status as number | undefined) ?? 1,
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
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  // Re-seed the form when the row to edit changes.
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const providerType = watch("provider_type");
  // Legacy: type select filters lookups where group_code === `${provider_type}_PROVIDER_TYPE`
  const subTypes = useMemo(
    () =>
      lookups.filter(
        (l) =>
          l.group_code !== "SERVICE_PROVIDER_TYPE" &&
          l.group_code === `${providerType}_PROVIDER_TYPE`
      ),
    [lookups, providerType]
  );

  const onSubmit = handleSubmit(async (values) => {
    const payload: ServiceProviderPayload = {
      ...(initial?.id ? { id: initial.id } : {}),
      name: values.name,
      provider_type: values.provider_type,
      type: values.type,
      credentials: values.credentials ? JSON.parse(values.credentials) : null,
      external_id: values.external_id,
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(
        `Service Provider ${initial ? "updated" : "saved"} successfully`
      );
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sp-name">
            Name <span className="text-rose-500">*</span>
          </Label>
          <Input id="sp-name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp-provider-type">
            Service Provider Type <span className="text-rose-500">*</span>
          </Label>
          <select
            id="sp-provider-type"
            className={selectClass}
            value={watch("provider_type")}
            onChange={(e) => {
              setValue("provider_type", e.target.value, {
                shouldValidate: true,
              });
              setValue("type", "", { shouldValidate: true }); // reset dependent select
            }}
          >
            <option value="">Select Type</option>
            {serviceProviderTypes.map((l) => (
              <option key={l.lu_key} value={l.lu_key}>
                {l.lu_name}
              </option>
            ))}
          </select>
          {errors.provider_type && (
            <p className="text-xs text-rose-500">
              {errors.provider_type.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp-type">
            Type <span className="text-rose-500">*</span>
          </Label>
          <select
            id="sp-type"
            className={selectClass}
            value={watch("type")}
            onChange={(e) =>
              setValue("type", e.target.value, { shouldValidate: true })
            }
            disabled={!providerType}
          >
            <option value="">Select Type</option>
            {subTypes.map((l) => (
              <option key={l.lu_key} value={l.lu_key}>
                {l.lu_name}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-rose-500">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp-status">Status</Label>
          <select
            id="sp-status"
            className={selectClass}
            value={String(watch("status") ?? "")}
            onChange={(e) =>
              setValue("status", Number(e.target.value) as 1 | -1, {
                shouldValidate: true,
              })
            }
          >
            <option value="1">Active</option>
            <option value="-1">Inactive</option>
          </select>
          {errors.status && (
            <p className="text-xs text-rose-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sp-credentials">
            Credentials (JSON) <span className="text-rose-500">*</span>
          </Label>
          <textarea
            id="sp-credentials"
            rows={5}
            className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            placeholder='{"key": "value"}'
            {...register("credentials")}
          />
          {errors.credentials && (
            <p className="text-xs text-rose-500">
              {errors.credentials.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sp-external">External ID</Label>
          <Input id="sp-external" {...register("external_id")} />
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
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
