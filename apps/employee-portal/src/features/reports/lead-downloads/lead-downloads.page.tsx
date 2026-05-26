import { useMemo, useState } from "react";
import { Download, Inbox, Loader2 } from "lucide-react";
import {
  Button,
  Label,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { DateRangeFields, ReportShell } from "@/components/report-shell";
import {
  useApplicationRequestList,
  useJourneyTypeGroup,
  useLoanTypeUser,
  useSubmitLeadExport,
} from "./lead-downloads.api";
import {
  DATE_TYPE_OPTIONS,
  DEFAULT_LEAD_EXPORT_FILTER,
  type LeadExportFilter,
  type ReportRequestRow,
} from "./lead-downloads.types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const PAGE_SIZE = 10;

function fmtDate(v?: string): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function LeadDownloadsPage() {
  const [filter, setFilter] = useState<LeadExportFilter>(
    DEFAULT_LEAD_EXPORT_FILTER
  );
  const [errors, setErrors] = useState<Partial<Record<keyof LeadExportFilter, string>>>(
    {}
  );
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(
    null
  );

  const loanTypes = useLoanTypeUser();
  const journeyTypes = useJourneyTypeGroup(filter.loanCode);
  const requestList = useApplicationRequestList();
  const submit = useSubmitLeadExport();

  const rows = requestList.data ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  const validate = (): boolean => {
    // Legacy Yup schema — only reportType, dateType, startDate, endDate required.
    const next: Partial<Record<keyof LeadExportFilter, string>> = {};
    if (!filter.reportType) next.reportType = "Report Type is required";
    if (!filter.dateType) next.dateType = "Date Type is required";
    if (!filter.startDate) next.startDate = "From Date is required";
    if (!filter.endDate) next.endDate = "To Date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitExport = async () => {
    if (!validate()) return;
    try {
      await submit.mutateAsync({
        type: filter.reportType,
        date_type: filter.dateType,
        start_date: filter.startDate,
        end_date: filter.endDate,
        loan_type_id: filter.loanType ? String(filter.loanType) : "",
        application_type: filter.journeyType,
        all_data: filter.allData === "yes",
      });
      toast.success("Report request submitted");
      requestList.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit request");
    }
  };

  const reset = () => {
    setFilter(DEFAULT_LEAD_EXPORT_FILTER);
    setErrors({});
    setPage(1);
  };

  const onLoanTypeChange = (id: string) => {
    const opt = (loanTypes.data ?? []).find((l) => String(l.id) === id);
    setFilter((f) => ({
      ...f,
      loanType: id,
      loanCode: opt?.code,
      journeyType: "",
    }));
  };

  const downloadRow = async (row: ReportRequestRow) => {
    if (!row.download) return;
    setDownloadingId(row.report_request_id);
    try {
      // Legacy uses bare axios.get with Authorization header overridden — i.e.
      // download URL is a presigned blob fetched directly.
      const anchor = document.createElement("a");
      anchor.href = row.download;
      anchor.download = `lead_report_${row.report_request_id}.xlsx`;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to download");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ReportShell
      title="Lead Status"
      description="Reports · Lead application export requests"
      searchLoading={submit.isPending}
      onSearch={submitExport}
      onReset={reset}
      filters={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Loan Type
            </Label>
            <select
              className={selectClass}
              value={filter.loanType}
              onChange={(e) => onLoanTypeChange(e.target.value)}
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
              Journey Type
            </Label>
            <select
              className={selectClass}
              value={filter.journeyType}
              onChange={(e) =>
                setFilter((f) => ({ ...f, journeyType: e.target.value }))
              }
              disabled={!filter.loanCode || journeyTypes.isLoading}
            >
              <option value="">
                {journeyTypes.isLoading ? "Loading…" : "Select Journey Type"}
              </option>
              {(journeyTypes.data ?? []).map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Date Type <span className="text-rose-500">*</span>
            </Label>
            <select
              className={selectClass}
              value={filter.dateType}
              onChange={(e) =>
                setFilter((f) => ({
                  ...f,
                  dateType: e.target.value as LeadExportFilter["dateType"],
                }))
              }
            >
              <option value="">Select Date Type</option>
              {DATE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.dateType && (
              <p className="text-xs text-rose-500">{errors.dateType}</p>
            )}
          </div>

          <DateRangeFields
            startDate={filter.startDate}
            endDate={filter.endDate}
            onStartChange={(v) =>
              setFilter((f) => ({ ...f, startDate: v }))
            }
            onEndChange={(v) => setFilter((f) => ({ ...f, endDate: v }))}
            startLabel="From"
            endLabel="To"
            required
          />
          {errors.startDate && (
            <p className="-mt-2 text-xs text-rose-500">{errors.startDate}</p>
          )}
          {errors.endDate && (
            <p className="-mt-2 text-xs text-rose-500">{errors.endDate}</p>
          )}
        </>
      }
    >
      <DataTableShell
        columnCount={6}
        loading={requestList.isFetching && rows.length === 0}
        isEmpty={!requestList.isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No export requests"
        pagination={{
          page,
          totalPages,
          total: rows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Request ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Request</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Start Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>End Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Download</TableHead>
          </TableRow>
        }
      >
        {paged.map((r) => {
          const isLoading = downloadingId === r.report_request_id;
          return (
            <TableRow
              key={String(r.report_request_id)}
              className={TABLE_ROW_CLASS}
            >
              <TableCell className="font-medium">
                {String(r.report_request_id)}
              </TableCell>
              <TableCell className="max-w-[280px] truncate text-xs text-slate-500">
                {r.request ? JSON.stringify(r.request) : "-"}
              </TableCell>
              <TableCell className="text-xs">{fmtDate(r.start_date)}</TableCell>
              <TableCell className="text-xs">{fmtDate(r.end_date)}</TableCell>
              <TableCell>{r.report_status ?? "-"}</TableCell>
              <TableCell>
                {r.status === 2 && r.download ? (
                  <Button
                    size="sm"
                    onClick={() => downloadRow(r)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {isLoading ? "Loading..." : "Download"}
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </ReportShell>
  );
}
