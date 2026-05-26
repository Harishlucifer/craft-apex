import { useMemo, useState } from "react";
import { Download, Inbox } from "lucide-react";
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
import { usePartnerExport } from "./partner-downloads.api";
import {
  DEFAULT_PARTNER_FILTER,
  PARTNER_DATE_TYPE_OPTIONS,
  PARTNER_STATUS_OPTIONS,
  type PartnerExportFilter,
  type PartnerRow,
} from "./partner-downloads.types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const PAGE_SIZE = 10;

function maskAadhar(aadhar?: string): string {
  if (!aadhar) return "";
  return `${"*".repeat(8)}${aadhar.slice(-4)}`;
}

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, rows: (string | number | undefined)[][]) {
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Verbatim from legacy PartnersDownload.js (lines 110-146).
const PARTNER_CSV_HEADER = [
  "Partner Name",
  "Partner Type",
  "Partner Category",
  "Mobile No.",
  "Email",
  "Office pincode",
  "Office State",
  "Office City",
  "Address",
  "Area",
  "Point of Contact",
  "DSA Code",
  "Onboarding Territory",
  "Country",
  "Zone",
  "State",
  "Region",
  "Branch",
  "RM Name",
  "RM Code",
  "RM Mobile No.",
  "RM Email",
  "PAN NO.",
  "Aadhar No.",
  "Bank Name",
  "Bank Account No.",
  "IFSC Code",
  "Bank Benificiary Name",
  "DSA Status",
  "Created on",
  "Approved on",
];

function toCsvRow(p: PartnerRow): (string | number | undefined)[] {
  return [
    p.name,
    p.entity_type,
    p.partner_category,
    p.mobile,
    p.email,
    p.pincode,
    p.state,
    p.city,
    p.address,
    p.area,
    p.point_of_contact,
    p.dsa_code,
    p.onboarding_territory?.territory_name,
    p.territory_details?.["1_COUNTRY"]?.territory_name,
    p.territory_details?.["2_ZONE"]?.territory_name,
    p.territory_details?.["3_STATE"]?.territory_name,
    p.territory_details?.["4_REGION"]?.territory_name,
    p.territory_details?.["5_BRANCH"]?.territory_name,
    p.relationship_manager?.name,
    p.relationship_manager?.code,
    p.relationship_manager?.mobile,
    p.relationship_manager?.email,
    p.primary_id,
    p.secondary_id ? maskAadhar(p.secondary_id) : "",
    p.bank_account?.bank_name,
    p.bank_account?.account_number,
    p.bank_account?.ifsc_code,
    p.bank_account?.account_holder_name,
    p.status_name,
    p.created_date,
    p.approved_date,
  ];
}

export default function PartnerDownloadsPage() {
  const [filter, setFilter] = useState<PartnerExportFilter>(
    DEFAULT_PARTNER_FILTER
  );
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerExportFilter, string>>>(
    {}
  );
  const [results, setResults] = useState<PartnerRow[]>([]);
  const [page, setPage] = useState(1);
  const exportMutation = usePartnerExport();
  const dateTypeChosen = !!filter.dateType;

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const paged = useMemo(
    () => results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [results, page]
  );

  const validate = (): boolean => {
    // Legacy Yup: when dateType is chosen, both dates required. status optional.
    const next: Partial<Record<keyof PartnerExportFilter, string>> = {};
    if (dateTypeChosen) {
      if (!filter.startDate) next.startDate = "From Date is required";
      if (!filter.endDate) next.endDate = "To Date is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const runExport = async () => {
    if (!validate()) return;
    try {
      const rows = await exportMutation.mutateAsync({
        startDate: filter.startDate,
        endDate: filter.endDate,
        status: filter.status,
      });
      if (!rows.length) {
        toast.info?.("No data found");
        setResults([]);
        setPage(1);
        return;
      }
      setResults(rows);
      setPage(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fetch partners");
    }
  };

  const reset = () => {
    setFilter(DEFAULT_PARTNER_FILTER);
    setErrors({});
    setResults([]);
    setPage(1);
  };

  const exportCsv = () => {
    if (!results.length) {
      toast.error("No data to export — run a search first");
      return;
    }
    downloadCsv("partner_list.csv", [
      PARTNER_CSV_HEADER,
      ...results.map(toCsvRow),
    ]);
  };

  return (
    <ReportShell
      title="Partner Status"
      description="Reports · Partner onboarding export"
      searchLoading={exportMutation.isPending}
      onSearch={runExport}
      onReset={reset}
      onExport={exportCsv}
      exportLoading={false}
      filters={
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Date Type
            </Label>
            <select
              className={selectClass}
              value={filter.dateType}
              onChange={(e) =>
                setFilter((f) => ({ ...f, dateType: e.target.value }))
              }
            >
              <option value="">Select Date Type</option>
              {PARTNER_DATE_TYPE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {dateTypeChosen && (
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
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase text-slate-500">
              Status
            </Label>
            <select
              className={selectClass}
              value={filter.status}
              onChange={(e) =>
                setFilter((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="">All</option>
              {PARTNER_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

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
        columnCount={7}
        loading={exportMutation.isPending && results.length === 0}
        isEmpty={!exportMutation.isPending && results.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No partner records"
        emptyDescription="Run a search to load partner export data."
        pagination={{
          page,
          totalPages,
          total: results.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Partner</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Type / Category</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Contact</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>DSA Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>RM</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created / Approved</TableHead>
          </TableRow>
        }
      >
        {paged.map((p, i) => (
          <TableRow
            key={`${p.dsa_code ?? p.name ?? "row"}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell>
              <div className="font-medium">{p.name ?? "-"}</div>
              <div className="text-xs text-slate-500">{p.email ?? ""}</div>
            </TableCell>
            <TableCell>
              <div>{p.entity_type ?? "-"}</div>
              <div className="text-xs text-slate-500">{p.partner_category ?? ""}</div>
            </TableCell>
            <TableCell>
              <div>{p.mobile ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {[p.city, p.state, p.pincode].filter(Boolean).join(", ")}
              </div>
            </TableCell>
            <TableCell className="font-medium">{p.dsa_code ?? "-"}</TableCell>
            <TableCell>
              <div>{p.relationship_manager?.name ?? "-"}</div>
              <div className="text-xs text-slate-500">
                {p.relationship_manager?.code ?? ""}
              </div>
            </TableCell>
            <TableCell>{p.status_name ?? "-"}</TableCell>
            <TableCell className="text-xs">
              <div>{p.created_date ?? "-"}</div>
              <div className="text-slate-500">{p.approved_date ?? ""}</div>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      {results.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={exportCsv} variant="outline">
            <Download className="h-3.5 w-3.5" /> Download CSV
          </Button>
        </div>
      )}
    </ReportShell>
  );
}
