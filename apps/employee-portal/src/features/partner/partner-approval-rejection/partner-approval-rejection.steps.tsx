import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Label,
  toast,
  cn,
} from "@craft-apex/ui";
import ReactSelect from "react-select";
import { getApiClient } from "@craft-apex/api";
import { registerStepComponent, type StepComponentProps } from "@craft-apex/workflow-runtime";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maps partner status numeric codes to their semantic key */
const PARTNER_STATUS_OPTIONS = [
  { key: "Reject", value: "-1", statusCode: "REJECTED" },
  { key: "Approve", value: "4", statusCode: "APPROVED" },
] as const;

/** Hard-coded sub-code reasons — mirrors legacy ReasonArr */
const REASON_MAP: Record<string, string[]> = {
  APPROVED: ["MEETS_CRITERIA", "EXCELS_THE_CRITERIA"],
  REJECTED: ["CIBIL_DEFAULT", "OUT_OF_GEO_COVERAGE"],
};

type SelectOption = { value: string; label: string };

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchNote(referenceId: string, childReferenceId: string | number) {
  const res = await getApiClient().get<unknown, any>(
    `/alpha/v1/core/note?reference_id=${referenceId}&child_reference_id=${childReferenceId}`
  );
  return res?.data ?? res;
}

async function saveNote(payload: {
  scope: string;
  reference_id: string;
  child_reference_id: string | number;
  code: string;
  content: string;
  sub_code: string[];
}) {
  const res = await getApiClient().post<unknown, any>("/alpha/v1/core/note", payload);
  return res?.data ?? res;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PartnerApprovalStep = forwardRef<
  { submitFormExternally: () => Promise<boolean> },
  StepComponentProps
>(function PartnerApprovalStep({ step, value, onChange, context }, ref) {
  const cfg = (step?.configuration as any) ?? {};
  const isFinalApproval: boolean = cfg?.is_final_approval ?? false;
  const isViewMode: boolean = (context as any)?.viewMode ?? false;

  // ── State
  const [selectedStatus, setSelectedStatus] = useState<string>("");      // "4" | "-1"
  const [selectedStatusCode, setSelectedStatusCode] = useState<string>("");
  const [selectedReasons, setSelectedReasons] = useState<SelectOption[]>([]);
  const [review, setReview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Derive IDs from flat workflow value
  const channelId = String(value["application.channel_id"] ?? "");
  const stepId = step?.id ?? "";

  useImperativeHandle(ref, () => ({
    submitFormExternally: handleSubmit,
  }));

  // ── Load existing note on mount (if note has been previously saved)
  useEffect(() => {
    if (!channelId || !stepId) return;

    fetchNote(channelId, stepId)
      .then((data) => {
        if (data?.status !== 1 || !data?.notes?.length) return;
        const notes: any[] = [...data.notes].sort((a, b) =>
          String(b.note_id).localeCompare(String(a.note_id))
        );
        const latest = notes[0];
        const opts: SelectOption[] = (latest?.sub_code ?? []).map((s: string) => ({
          value: s,
          label: s.replace(/_/g, " "),
        }));
        if (latest?.code === "APPROVED") {
          setSelectedStatus("4");
          setSelectedStatusCode("APPROVED");
          setSelectedReasons(opts);
          setReview(latest?.content ?? "");
        } else if (latest?.code === "REJECTED") {
          setSelectedStatus("-1");
          setSelectedStatusCode("REJECTED");
          setSelectedReasons(opts);
          setReview(latest?.content ?? "");
        }
      })
      .catch(() => { }); // silent — not a blocker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, stepId]);

  const reasonOptions: SelectOption[] = (REASON_MAP[selectedStatusCode] ?? []).map((r) => ({
    value: r,
    label: r.replace(/_/g, " "),
  }));

  // ── Validate
  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedStatus) e.status = "Please select a partner status to proceed.";
    if (selectedStatus) {
      if (!selectedReasons.length) e.reasons = "Please select at least one reason.";
      if (!review.trim()) e.review = "Review comments are required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit handler — called by parent workflow "Save & Next" context
  const handleSubmit = async () => {
    if (!validate()) return false;

    if (selectedStatus === "-1") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this partner? This action cannot be undone."
      );
      if (!confirmed) return false;
    }

    setSubmitting(true);
    try {
      const res = await saveNote({
        scope: "PARTNER_ONBOARDING",
        reference_id: channelId,
        child_reference_id: stepId,
        code: selectedStatusCode,
        content: review,
        sub_code: selectedReasons.map((r) => r.value),
      });

      if (res?.status !== 1) {
        toast.error(res?.message ?? "Failed to save approval note.");
        return false;
      }

      // Build the updated application payload
      const updatedApp: Record<string, unknown> = {
        ...value,
        "application.status": parseInt(selectedStatus),
        "application.approval_code": selectedStatusCode,
        "application.approval_reasons": selectedReasons.map((r) => r.value),
        "application.approval_review": review,
      };

      if (isFinalApproval && selectedStatus === "4") {
        updatedApp["application.approved_date"] = new Date().toISOString().split("T")[0];
      }

      onChange(updatedApp);
      toast.success(
        selectedStatus === "4" ? "Partner approved successfully." : "Partner rejected."
      );
      return true;
    } catch {
      toast.error("Something went wrong. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const isApprove = selectedStatus === "4";
  const isReject = selectedStatus === "-1";

  return (
    <div className="space-y-5">
      {/* ── Partner Status selector */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Partner Status
            </Label>
            <div className="flex gap-3">
              {PARTNER_STATUS_OPTIONS.map((s) => {
                const isActive = selectedStatus === s.value;
                const isApproveBtn = s.value === "4";
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isViewMode || submitting}
                    onClick={() => {
                      setSelectedStatus(s.value);
                      setSelectedStatusCode(s.statusCode);
                      setSelectedReasons([]);
                      setReview("");
                      setErrors({});
                    }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200",
                      isApproveBtn
                        ? isActive
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                          : "bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        : isActive
                          ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-100"
                          : "bg-white border-rose-500 text-rose-600 hover:bg-rose-50",
                      (isViewMode || submitting) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isApproveBtn ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {s.key}
                  </button>
                );
              })}
            </div>
            {errors.status && (
              <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.status}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Approval / Rejection form */}
      {(isApprove || isReject) && (
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800">
              {isApprove ? "Partner Approval" : "Partner Reject"}
            </h4>

            {/* Reason multi-select */}
            <div className="space-y-1.5 max-w-md">
              <Label className="text-sm font-medium text-slate-600">
                {isApprove ? "Approval Reason" : "Reject Reason"}
                <span className="text-rose-500 ml-0.5">*</span>
              </Label>
              <ReactSelect
                isMulti
                isSearchable
                isClearable
                isDisabled={isViewMode}
                options={reasonOptions}
                value={selectedReasons}
                onChange={(opts) => {
                  setSelectedReasons((opts as SelectOption[]) ?? []);
                  setErrors((e) => ({ ...e, reasons: "" }));
                }}
                placeholder="Select reason(s)..."
                classNamePrefix="rs"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "40px",
                    borderColor: errors.reasons
                      ? "#f43f5e"
                      : state.isFocused
                        ? "#1E2A6B"
                        : "#e2e8f0",
                    boxShadow: state.isFocused ? "0 0 0 2px rgba(30,42,107,0.15)" : "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#EEF2FF",
                    borderRadius: "6px",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#1E2A6B",
                    fontWeight: 600,
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#1E2A6B",
                    ":hover": { backgroundColor: "#C7D2FE", color: "#1E2A6B" },
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#1E2A6B"
                      : state.isFocused
                        ? "#EEF2FF"
                        : "white",
                    color: state.isSelected ? "white" : "#1e293b",
                    fontSize: "14px",
                  }),
                }}
              />
              {errors.reasons && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reasons}
                </p>
              )}
            </div>

            {/* Review textarea */}
            <div className="space-y-1.5 max-w-lg">
              <Label className="text-sm font-medium text-slate-600">
                Review
                <span className="text-rose-500 ml-0.5">*</span>
              </Label>
              <textarea
                rows={5}
                disabled={isViewMode}
                placeholder="Enter review comments..."
                value={review}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setReview(e.target.value);
                  setErrors((er) => ({ ...er, review: "" }));
                }}
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 resize-none text-sm",
                  errors.review && "border-rose-500 focus-visible:ring-rose-500"
                )}
              />
              {errors.review && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.review}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
});

registerStepComponent("PARTNER_APPROVAL_REJECTION", PartnerApprovalStep);
