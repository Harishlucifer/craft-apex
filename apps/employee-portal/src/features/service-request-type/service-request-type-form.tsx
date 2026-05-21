import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import { useSaveServiceRequestType } from "./service-request-type.api";
import type {
  ServiceRequestTypeRow,
  ServiceRequestTypeSavePayload,
} from "./service-request-type.types";

// Legacy validationSchema → zod (code/name/workflow_type required)
const schema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  code: z.string().min(1, "Please Enter Code"),
  name: z.string().min(1, "Please Enter Name"),
  category: z.string().optional(),
  workflow_type: z.string().min(1, "Please Select Workflow Type"),
  require_snapshot: z.boolean().default(false),
  require_proposed_terms: z.boolean().default(false),
  require_approval: z.boolean().default(false),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

// Legacy hard-coded workflow types.
const WORKFLOW_TYPES = [
  { value: "STANDARD", label: "Standard (Direct)" },
  { value: "APPROVAL_BASED", label: "Approval Based" },
  { value: "COMMITTEE_BASED", label: "Committee Based" },
];

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface Props {
  initial?: ServiceRequestTypeRow;
  onCancel: () => void;
  onSaved: () => void;
}

export function ServiceRequestTypeForm({ initial, onCancel, onSaved }: Props) {
  const save = useSaveServiceRequestType();

  const defaults: FormValues = useMemo(
    () => ({
      id: initial?.id != null ? String(initial.id) : undefined,
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      category: initial?.category ?? "",
      workflow_type: initial?.workflow_type ?? "",
      require_snapshot: initial?.require_snapshot === 1,
      require_proposed_terms: initial?.require_proposed_terms === 1,
      require_approval: initial?.require_approval === 1,
      status: initial?.status === 0 ? 0 : 1,
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

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: ServiceRequestTypeSavePayload = {
      ...(values.id ? { id: values.id } : {}),
      code: values.code,
      name: values.name,
      category: values.category,
      workflow_type: values.workflow_type,
      require_snapshot: values.require_snapshot ? 1 : 0,
      require_proposed_terms: values.require_proposed_terms ? 1 : 0,
      require_approval: values.require_approval ? 1 : 0,
      status: Number(values.status),
    };
    try {
      await save.mutateAsync(payload);
      toast.success(
        `Service Request Type ${initial?.id ? "updated" : "saved"} successfully`
      );
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="srt-code">
            Identifier Code <span className="text-rose-500">*</span>
          </Label>
          <Input id="srt-code" placeholder="e.g. WAIVER_REQ" {...register("code")} />
          {errors.code && (
            <p className="text-xs text-rose-500">{errors.code.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="srt-name">
            Display Name <span className="text-rose-500">*</span>
          </Label>
          <Input id="srt-name" placeholder="e.g. Waiver Request" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="srt-category">Category</Label>
          <Input id="srt-category" placeholder="e.g. Financial" {...register("category")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="srt-workflow">
            Workflow Process <span className="text-rose-500">*</span>
          </Label>
          <select
            id="srt-workflow"
            className={selectClass}
            value={watch("workflow_type")}
            onChange={(e) =>
              setValue("workflow_type", e.target.value, {
                shouldValidate: true,
              })
            }
          >
            <option value="">Select Workflow Type</option>
            {WORKFLOW_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.workflow_type && (
            <p className="text-xs text-rose-500">{errors.workflow_type.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Validation Requirements
          </p>
          <div className="grid gap-2 rounded-md bg-slate-50 p-3 sm:grid-cols-3">
            <ToggleField
              label="Capture Snapshot"
              checked={watch("require_snapshot")}
              onChange={(v) => setValue("require_snapshot", v)}
            />
            <ToggleField
              label="Proposed Terms"
              checked={watch("require_proposed_terms")}
              onChange={(v) => setValue("require_proposed_terms", v)}
            />
            <ToggleField
              label="Mandatory Approval"
              checked={watch("require_approval")}
              onChange={(v) => setValue("require_approval", v)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="srt-status">Account Status</Label>
          <select
            id="srt-status"
            className={selectClass}
            value={String(watch("status") ?? "")}
            onChange={(e) =>
              setValue("status", Number(e.target.value), {
                shouldValidate: true,
              })
            }
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={save.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending
            ? "Saving…"
            : initial?.id
              ? "Update Configuration"
              : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#4C7DF0]"
      />
      {label}
    </label>
  );
}
