import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  fetchPincodeDetails,
  fetchPincodeSuggestions,
  useApprovedChannels,
  useBuilderDetail,
  useBuilderLookups,
  useSaveBuilder,
} from "./builder-form.api";
import type {
  BuilderSavePayload,
  PincodeSuggestion,
} from "./builder-form.types";
import { ProjectsPanel } from "./projects-panel";

// Legacy AddBuilder Yup → zod.
const schema = z
  .object({
    name: z.string().min(1, "Developer Name is required"),
    companyType: z.string().min(1, "Company Type is required"),
    contactName: z
      .string()
      .min(1, "Contact Person is required")
      .regex(/^[A-Za-z\s]+$/, "Person name can only contain letters and spaces"),
    contactMobile: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
    pincode: z
      .string()
      .min(1, "Pincode is required")
      .regex(/^[0-9]+$/, "Pincode must be a number"),
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    isChannelPartner: z.string().min(1, "Is Channel Partner is required"),
    channelPartner: z.string().optional(),
    numberOfProjectsDone: z.coerce
      .number({ invalid_type_error: "No. of Projects Done must be a number" })
      .int()
      .min(0, "No. of Projects Done is required"),
    status: z.coerce.number().int(),
  })
  .superRefine((val, ctx) => {
    // Legacy: when isChannelPartner === "1" (Yes), channelPartner is required.
    if (val.isChannelPartner === "1" && !val.channelPartner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["channelPartner"],
        message: "Channel Partner is required",
      });
    }
  });
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function BuilderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useBuilderLookups();
  const { data: channels = [] } = useApprovedChannels();
  const { data: detail } = useBuilderDetail(id);
  const save = useSaveBuilder();

  const [step, setStep] = useState<0 | 1>(0);
  useEffect(() => {
    if (id && step === 0 && detail) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.developer_id]);

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      binaryChoice: filter("BINARY_CHOICE"),
      companyType: filter("COMPANY_TYPE"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      name: detail?.name ?? "",
      companyType: detail?.entity_type ?? "",
      contactName: detail?.contact_name ?? "",
      contactMobile: detail?.contact_mobile ?? "",
      pincode: detail?.pincode ?? "",
      state: "",
      district: "",
      isChannelPartner: detail?.channel_id ? "1" : "",
      channelPartner:
        detail?.channel_id != null ? String(detail.channel_id) : "",
      numberOfProjectsDone: Number(detail?.no_of_project ?? 0),
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
  }, [defaults, reset]);

  // When editing, hydrate state/district by resolving the saved pincode.
  useEffect(() => {
    const pc = detail?.pincode;
    if (!pc) return;
    fetchPincodeDetails(pc).then((rows) => {
      const first = rows[0];
      if (!first) return;
      setValue("state", first.coreStateList?.name ?? "", {
        shouldValidate: true,
      });
      setValue("district", first.coreCityList?.name ?? "", {
        shouldValidate: true,
      });
    });
  }, [detail?.pincode, setValue]);

  const [suggestions, setSuggestions] = useState<PincodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const onPincodeChange = async (v: string) => {
    setValue("pincode", v, { shouldValidate: true });
    if (!v) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const list = await fetchPincodeSuggestions(v);
      setSuggestions(list);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPincode = async (pc: string) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setValue("pincode", pc, { shouldValidate: true });
    const rows = await fetchPincodeDetails(pc);
    const first = rows[0];
    if (first) {
      setValue("state", first.coreStateList?.name ?? "", {
        shouldValidate: true,
      });
      setValue("district", first.coreCityList?.name ?? "", {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload: BuilderSavePayload = {
      ...(id ? { developer_id: id } : {}),
      name: values.name,
      no_of_project: Number(values.numberOfProjectsDone),
      contact_name: values.contactName,
      contact_mobile: String(values.contactMobile),
      pincode: String(values.pincode),
      entity_type: values.companyType,
      status: Number(values.status),
      ...(values.isChannelPartner === "1" && values.channelPartner
        ? { channel_id: values.channelPartner }
        : {}),
    };
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.result?.developer_id ?? (res as any)?.data?.developer_id;
      toast.success(`Builder ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        navigate(`/settings/builders/create/${String(newId)}`);
      } else {
        setStep(1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  const isChannel = watch("isChannelPartner") === "1";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Builder" : "Add Builder"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/builders">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Builder Detail"
          active={step === 0}
          done={step > 0}
          clickable={Boolean(id)}
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Project Details"
          active={step === 1}
          done={false}
          clickable={Boolean(id)}
          onClick={() => id && setStep(1)}
        />
      </ol>

      {step === 0 && (
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Developer Name *" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>

          <Field label="Company Type *" error={errors.companyType?.message}>
            <select
              className={selectClass}
              value={watch("companyType")}
              onChange={(e) =>
                setValue("companyType", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              <option value="">Select</option>
              {options.companyType.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Contact Person Name *" error={errors.contactName?.message}>
            <Input {...register("contactName")} />
          </Field>

          <Field label="Contact Person Mobile *" error={errors.contactMobile?.message}>
            <Input
              type="text"
              maxLength={10}
              {...register("contactMobile")}
            />
          </Field>

          <div className="relative space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Pincode *
            </Label>
            <Input
              maxLength={6}
              value={watch("pincode")}
              onChange={(e) => onPincodeChange(e.target.value)}
              onBlur={() =>
                window.setTimeout(() => setShowSuggestions(false), 150)
              }
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow">
                {suggestions.map((s) => (
                  <li
                    key={String(s.id)}
                    className="cursor-pointer px-3 py-1.5 hover:bg-slate-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectPincode(String(s.pincode));
                    }}
                  >
                    {s.pincode}
                  </li>
                ))}
              </ul>
            )}
            {errors.pincode && (
              <p className="text-xs text-rose-500">{errors.pincode.message}</p>
            )}
          </div>

          <Field label="State *" error={errors.state?.message}>
            <Input {...register("state")} />
          </Field>

          <Field label="District *" error={errors.district?.message}>
            <Input {...register("district")} />
          </Field>

          <Field
            label="Is Channel Partner *"
            error={errors.isChannelPartner?.message}
          >
            <select
              className={selectClass}
              value={watch("isChannelPartner")}
              onChange={(e) => {
                setValue("isChannelPartner", e.target.value, {
                  shouldValidate: true,
                });
                if (e.target.value !== "1") {
                  setValue("channelPartner", "");
                }
              }}
            >
              <option value="">Select</option>
              {options.binaryChoice.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {isChannel && (
            <Field
              label="Select Channel Partner *"
              error={errors.channelPartner?.message as string | undefined}
            >
              <select
                className={selectClass}
                value={watch("channelPartner") ?? ""}
                onChange={(e) =>
                  setValue("channelPartner", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {channels.map((c) => (
                  <option key={String(c.channel_id)} value={String(c.channel_id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label="Number of Projects Done *"
            error={errors.numberOfProjectsDone?.message}
          >
            <Input type="number" {...register("numberOfProjectsDone")} />
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
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/builders">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : id ? "Save & Next" : "Save & Next"}
          </Button>
        </div>
      </form>
      )}

      {step === 1 && id && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Project Details
          </h2>
          <ProjectsPanel developerId={id} />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button asChild>
              <Link to="/settings/builders">Close</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
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
