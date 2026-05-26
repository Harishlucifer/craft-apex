import { useMemo, useState } from "react";
import { Calendar, Inbox, Info } from "lucide-react";
import { Input, Label, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { ReportShell } from "@/components/report-shell";
import {
  useLeastTerritory,
  useLoanTypeMaster,
  useVerificationCategoryList,
  useVerificationList,
} from "./mis-verification-tat-report.api";
import {
  VERIFICATION_TYPE_LABEL,
  verificationLabel,
  type VerificationRow,
} from "./mis-verification-tat-report.types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const PAGE_SIZE = 10;

function statusClass(status?: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "text-emerald-600";
    case "pending":
      return "text-amber-600";
    case "rejected":
      return "text-rose-600";
    default:
      return "text-slate-500";
  }
}

export default function MisVerificationTatReportPage() {
  // Filters are rendered for parity with legacy but are inert — see api.ts
  // comment. State is kept local; no apply, no requery.
  const [territoryId, setTerritoryId] = useState("");
  const [loanTypeId, setLoanTypeId] = useState("");
  const [verificationType, setVerificationType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const categories = useVerificationCategoryList();
  const loanTypes = useLoanTypeMaster();
  const territories = useLeastTerritory();
  const list = useVerificationList();

  const rows = list.data ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  // Dedupe categories on the humanized label so the legacy mapping doesn't
  // present "PSIR Verification" twice if the backend returns variants.
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const c of categories.data ?? []) {
      const label = verificationLabel(c.verification_type);
      if (!label || label === "-" || seen.has(label)) continue;
      seen.add(label);
      out.push({ value: c.verification_type, label });
    }
    return out;
  }, [categories.data]);

  const today = new Date().toISOString().slice(0, 10);

  const reset = () => {
    setTerritoryId("");
    setLoanTypeId("");
    setVerificationType("");
    setFromDate("");
    setToDate("");
  };

  return (
    <ReportShell
      title="Verification TAT Report"
      description="MIS · Verification turnaround tracking"
      // Filters are inert in legacy; "Search" just resets pagination so the
      // user still has a visible action.
      onSearch={() => setPage(1)}
      onReset={reset}
      filters={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Territory
            </Label>
            <select
              className={selectClass}
              value={territoryId}
              onChange={(e) => setTerritoryId(e.target.value)}
              disabled={territories.isLoading}
            >
              <option value="">
                {territories.isLoading ? "Loading…" : "Select Territory"}
              </option>
              {(territories.data ?? []).map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Loan Type
            </Label>
            <select
              className={selectClass}
              value={loanTypeId}
              onChange={(e) => setLoanTypeId(e.target.value)}
              disabled={loanTypes.isLoading}
            >
              <option value="">
                {loanTypes.isLoading ? "Loading…" : "Select Loan Type"}
              </option>
              {(loanTypes.data ?? []).map((lt) => (
                <option key={String(lt.id)} value={String(lt.id)}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Verification Type
            </Label>
            <select
              className={selectClass}
              value={verificationType}
              onChange={(e) => setVerificationType(e.target.value)}
              disabled={categories.isLoading}
            >
              <option value="">
                {categories.isLoading ? "Loading…" : "Select Verification"}
              </option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <Calendar className="h-3 w-3" />
              From
            </Label>
            <Input
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <Calendar className="h-3 w-3" />
              To
            </Label>
            <Input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </>
      }
    >
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          TAT-per-stage values and dashboard summary cards are pending backend
          support — legacy hard-codes both, so they are deferred until the API
          surfaces real data. Filters are kept for visual parity but do not
          currently filter the list.
        </div>
      </div>

      <DataTableShell
        columnCount={6}
        loading={list.isFetching && rows.length === 0}
        isEmpty={!list.isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No verifications"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Verification Details</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Details</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Initiated By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Inspected By</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Submitted To</TableHead>
          </TableRow>
        }
      >
        {paged.map((r: VerificationRow, i) => (
          <TableRow
            key={`${r.verification_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell>
              <div className="font-semibold">{r.verification_code ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {verificationLabel(r.verification_type)}
              </div>
              <div className={`text-xs font-semibold ${statusClass(r.verification_status)}`}>
                {r.verification_status ?? "-"}
              </div>
            </TableCell>
            <TableCell>{r.loan_amount ?? "-"}</TableCell>
            <TableCell>{r.name ?? "-"}</TableCell>
            <TableCell>
              <div className="font-medium">{r.created_by?.user_name ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {r.created_by?.territory_name ?? "-"}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{r.assigned_to?.user_name ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {r.assigned_to?.territory_name ?? "-"}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{r.submitted_to?.user_name ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {r.submitted_to?.territory_name ?? "-"}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}

// Re-export for any future consumer.
export { VERIFICATION_TYPE_LABEL };
