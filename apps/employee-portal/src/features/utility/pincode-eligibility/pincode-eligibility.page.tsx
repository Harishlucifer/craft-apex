import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  useEligibleLenders,
  useLoanTypeOptions,
} from "./pincode-eligibility.api";
import type {
  AddressEntry,
  EligibilityResult,
  LenderResult,
} from "./pincode-eligibility.types";

// Legacy address fields:
//   [{value: "", label: "Residence Pincode", code: "CURRENT_RESIDENCE"},
//    {value: "", label: "Business Pincode",  code: "BUSINESS_OFFICE"}]
// On submit, BUSINESS_OFFICE is rewritten to BUSINESS_ADDRESS (legacy index.js:86-91).
const ADDRESS_FIELDS = [
  { label: "Residence Pincode", code: "CURRENT_RESIDENCE" },
  { label: "Business Pincode", code: "BUSINESS_OFFICE" },
] as const;

const schema = z.object({
  loan_type_id: z.string().min(1, "Loan type is required"),
  residence: z
    .string()
    .regex(/^\d{6}$|^$/, "Pincode must be 6 digits")
    .optional()
    .default(""),
  business: z
    .string()
    .regex(/^\d{6}$|^$/, "Pincode must be 6 digits")
    .optional()
    .default(""),
});

type FormValues = z.infer<typeof schema>;

export default function PincodeEligibilityPage() {
  const { data: loanTypes = [], isLoading: loanTypesLoading } =
    useLoanTypeOptions();
  const eligibility = useEligibleLenders();
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { loan_type_id: "", residence: "", business: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!values.residence && !values.business) {
      toast.warning("Please enter at least one pincode.");
      return;
    }
    const address_type: AddressEntry[] = [];
    if (values.residence) {
      address_type.push({ type: "CURRENT_RESIDENCE", pincode: values.residence });
    }
    if (values.business) {
      // Legacy renames BUSINESS_OFFICE → BUSINESS_ADDRESS on submit.
      address_type.push({ type: "BUSINESS_ADDRESS", pincode: values.business });
    }
    try {
      const res = await eligibility.mutateAsync({
        address_type,
        loan_type_id: String(values.loan_type_id),
      });
      setResult(res);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not check pincode eligibility."
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pincode Eligibility
          </h1>
          <p className="text-sm text-slate-500">
            Check which lenders serve a given pincode for a loan type.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="loan_type_id" className="text-xs font-medium text-slate-700">
              Loan Type <span className="text-rose-500">*</span>
            </Label>
            <select
              id="loan_type_id"
              {...register("loan_type_id")}
              disabled={loanTypesLoading}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-100"
            >
              <option value="">
                {loanTypesLoading ? "Loading…" : "Select loan type"}
              </option>
              {loanTypes.map((lt) => (
                <option key={String(lt.id)} value={String(lt.id)}>
                  {lt.name}
                </option>
              ))}
            </select>
            {errors.loan_type_id && (
              <p className="text-xs text-rose-600">{errors.loan_type_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="residence" className="text-xs font-medium text-slate-700">
              {ADDRESS_FIELDS[0].label}
            </Label>
            <Input
              id="residence"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit pincode"
              {...register("residence")}
            />
            {errors.residence && (
              <p className="text-xs text-rose-600">{errors.residence.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="business" className="text-xs font-medium text-slate-700">
              {ADDRESS_FIELDS[1].label}
            </Label>
            <Input
              id="business"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit pincode"
              {...register("business")}
            />
            {errors.business && (
              <p className="text-xs text-rose-600">{errors.business.message}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={eligibility.isPending}>
            {eligibility.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Check eligibility
          </Button>
        </div>
      </form>

      {result && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <LenderResultPanel
            title="Eligible Lenders"
            lenders={result.eligible_lenders}
            emptyMessage="No eligible lenders for this pincode."
            tone="success"
          />
          <LenderResultPanel
            title="Rejected Lenders"
            lenders={result.non_eligible_lenders}
            emptyMessage="No rejected lenders for this pincode."
            tone="muted"
          />
        </div>
      )}
    </div>
  );
}

interface PanelProps {
  title: string;
  lenders: LenderResult[];
  emptyMessage: string;
  tone: "success" | "muted";
}

function LenderResultPanel({ title, lenders, emptyMessage, tone }: PanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">{title}</h2>
      {lenders.length === 0 ? (
        <div
          className={
            tone === "success"
              ? "rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-700"
              : "rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500"
          }
        >
          {emptyMessage}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {lenders.map((lender, i) => (
            <li
              key={lender.id ?? lender.code ?? lender.name ?? i}
              className="flex flex-col items-center gap-2 rounded-md border border-slate-100 bg-slate-50/40 p-3"
            >
              {lender.logo ? (
                <img
                  src={lender.logo}
                  alt={lender.name ?? "Lender"}
                  className="h-12 w-full object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <MapPin className="h-5 w-5" />
                </div>
              )}
              <span className="line-clamp-1 text-center text-xs font-medium text-slate-700">
                {lender.name ?? lender.code ?? "—"}
              </span>
              {lender.reason && (
                <span className="line-clamp-2 text-center text-[10px] text-slate-500">
                  {lender.reason}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
