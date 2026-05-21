import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Check, Upload } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useLenderDetail,
  useLenderLookups,
  useLoanTypeOptions,
  useSaveLender,
} from "./lender-form.api";
import type {
  LenderContractRow,
  LenderLoanTypeRow,
  LenderSavePayload,
} from "./lender-form.types";
import { LenderLoanTypesPanel } from "./lender-loan-types-panel";
import { LenderContractsPanel } from "./lender-contracts-panel";

const schema = z.object({
  code: z
    .string()
    .min(1, "Lender code is required")
    .max(15, "Too Long! Should be less than 15 characters")
    .regex(/^[a-zA-Z]+$/, "Invalid code, Should contain only alphabets"),
  name: z
    .string()
    .min(1, "Lender name is required")
    .max(30, "Too Long, Should be less than 30 characters"),
  description: z.string().optional(),
  sequence: z.coerce
    .number({ invalid_type_error: "Sequence is required" })
    .int(),
  lendertype: z.string().min(1, "Lender type is required"),
  gstType: z.string().min(1, "GST Type is required"),
  logo: z.string().min(1, "Logo is required"),
  status: z.coerce.number().int(),
});
type FormValues = z.infer<typeof schema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const MAX_LOGO_BYTES = 200 * 1024;

export default function LenderFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: lookups = [] } = useLenderLookups();
  const { data: loanTypeOptions = [] } = useLoanTypeOptions();
  const { data: detail } = useLenderDetail(id);
  const save = useSaveLender();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    if (id && step === 0 && detail) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, detail?.lender_id]);

  const options = useMemo(() => {
    const filter = (g: string) =>
      lookups
        .filter((l) => l.group_code === g)
        .map((l) => ({ value: l.lu_key, label: l.lu_name }));
    return {
      gstType: filter("GST_TYPE"),
      lenderType: filter("LENDER_TYPE"),
      applyMethod: filter("LENDER_APPLY_METHOD"),
      statusFetchMethod: filter("LENDER_STATUS_FETCH_METHOD"),
      contractType: filter("CONTRACT_TYPE"),
      linkType: filter("LINK_TYPE"),
    };
  }, [lookups]);

  const defaults: FormValues = useMemo(
    () => ({
      code: detail?.code ?? "",
      name: detail?.name ?? "",
      description: detail?.description ?? "",
      sequence: Number(detail?.sequence ?? 0),
      lendertype: detail?.lender_type ?? "",
      gstType: detail?.gst_type ?? "",
      logo: detail?.logo ?? "",
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Code auto-uppercase (legacy displayed as upper, kept stored upper too).
  const code = watch("code") ?? "";
  useEffect(() => {
    if (code && code !== code.toUpperCase()) {
      setValue("code", code.toUpperCase(), { shouldValidate: true });
    }
  }, [code, setValue]);

  // Step 2/3 collections held at page level, persisted via full-record POST.
  const [loanTypes, setLoanTypes] = useState<LenderLoanTypeRow[]>([]);
  const [contracts, setContracts] = useState<LenderContractRow[]>([]);
  useEffect(() => {
    setLoanTypes(
      Array.isArray(detail?.lender_loan_type) ? detail!.lender_loan_type! : []
    );
    setContracts(
      Array.isArray(detail?.lender_loan_contract)
        ? detail!.lender_loan_contract!
        : []
    );
  }, [detail?.lender_loan_type, detail?.lender_loan_contract]);

  const [logoError, setLogoError] = useState<string | null>(null);
  const onLogoChange = (files: FileList | null) => {
    setLogoError(null);
    const f = files?.[0];
    if (!f) return;
    if (f.size > MAX_LOGO_BYTES) {
      setLogoError("File size exceeds 200KB limit");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const v = String(reader.result ?? "");
      setValue("logo", v, { shouldValidate: true });
    };
    reader.readAsDataURL(f);
  };

  const buildPayload = (
    values: FormValues,
    lt: LenderLoanTypeRow[],
    ct: LenderContractRow[]
  ): LenderSavePayload => ({
    ...(id ? { lender_id: id } : {}),
    code: values.code.toUpperCase(),
    name: values.name,
    description: values.description,
    sequence: Number(values.sequence),
    lender_type: values.lendertype,
    gst_type: values.gstType,
    logo: values.logo,
    status: Number(values.status),
    lender_loan_type: lt,
    lender_loan_contract: ct,
  });

  // Step 1 save (basic details).
  const onSubmitStep1 = handleSubmit(async (values) => {
    const payload = buildPayload(values, loanTypes, contracts);
    try {
      const res = await save.mutateAsync(payload);
      const newId =
        (res as any)?.result?.lender_id ?? (res as any)?.data?.lender_id;
      toast.success(`Lender ${id ? "updated" : "saved"} successfully`);
      if (!id && newId) {
        navigate(`/settings/add-lender/${String(newId)}`);
      } else {
        setStep(1);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  // Save Step 2 → move to Step 3.
  const onSubmitStep2 = async () => {
    const payload = buildPayload(getValues(), loanTypes, contracts);
    try {
      await save.mutateAsync(payload);
      toast.success("Loan types saved successfully");
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  // Step 3 final save.
  const onSubmitStep3 = async () => {
    const payload = buildPayload(getValues(), loanTypes, contracts);
    try {
      await save.mutateAsync(payload);
      toast.success("Lender created successfully");
      navigate("/settings/lender");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {id ? "Edit Lender" : "Add Lender"}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/lender">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <ol className="flex items-center gap-3 text-sm">
        <StepPill
          n={1}
          label="Lender"
          active={step === 0}
          done={step > 0}
          clickable={Boolean(id)}
          onClick={() => setStep(0)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={2}
          label="Lender Loan Type"
          active={step === 1}
          done={step > 1}
          clickable={Boolean(id)}
          onClick={() => id && setStep(1)}
        />
        <span className="h-px w-8 bg-slate-200" />
        <StepPill
          n={3}
          label="Lender Contract"
          active={step === 2}
          done={false}
          clickable={Boolean(id)}
          onClick={() => id && setStep(2)}
        />
      </ol>

      {step === 0 && (
        <form
          onSubmit={onSubmitStep1}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="Lender Code *" error={errors.code?.message}>
              <Input
                maxLength={15}
                disabled={Boolean(id)}
                {...register("code")}
              />
            </Field>
            <Field label="Lender Name *" error={errors.name?.message}>
              <Input maxLength={30} {...register("name")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Input {...register("description")} />
            </Field>
            <Field label="Sequence *" error={errors.sequence?.message}>
              <Input type="number" {...register("sequence")} />
            </Field>
            <Field label="Lender Type *" error={errors.lendertype?.message}>
              <select
                className={selectClass}
                value={watch("lendertype")}
                onChange={(e) =>
                  setValue("lendertype", e.target.value, {
                    shouldValidate: true,
                  })
                }
              >
                <option value="">Select</option>
                {options.lenderType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GST Type *" error={errors.gstType?.message}>
              <select
                className={selectClass}
                value={watch("gstType")}
                onChange={(e) =>
                  setValue("gstType", e.target.value, { shouldValidate: true })
                }
              >
                <option value="">Select</option>
                {options.gstType.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-medium text-slate-600">
                Logo *
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload (max 200KB)
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onLogoChange(e.target.files)}
                />
                {watch("logo") ? (
                  <img
                    src={watch("logo")}
                    alt="logo preview"
                    className="h-12 rounded border border-slate-200 bg-white object-contain p-1"
                  />
                ) : (
                  <span className="text-xs text-slate-400">
                    No logo selected.
                  </span>
                )}
              </div>
              {(logoError ?? errors.logo?.message) && (
                <p className="text-xs text-rose-500">
                  {logoError ?? errors.logo?.message}
                </p>
              )}
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
                  />
                  Active
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={watch("status") === -1}
                    onChange={() =>
                      setValue("status", -1, { shouldValidate: true })
                    }
                  />
                  In-Active
                </label>
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button asChild type="button" variant="outline">
              <Link to="/settings/lender">Back</Link>
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save & Next"}
            </Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Lender Loan Types
          </h2>
          <LenderLoanTypesPanel
            loanTypeOptions={loanTypeOptions}
            rows={loanTypes}
            onChange={setLoanTypes}
          />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={onSubmitStep2}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save & Next"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Lender Contracts
          </h2>
          <LenderContractsPanel
            loanTypeOptions={loanTypeOptions}
            applyMethodOptions={options.applyMethod}
            statusFetchMethodOptions={options.statusFetchMethod}
            contractTypeOptions={options.contractType}
            linkTypeOptions={options.linkType}
            rows={contracts}
            onChange={setContracts}
          />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={onSubmitStep3}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save"}
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
