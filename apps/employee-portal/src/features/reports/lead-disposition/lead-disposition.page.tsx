import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CalendarCheck,
  Info,
  Inbox,
  Phone,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Badge, Input, Label, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { ReportShell } from "@/components/report-shell";
import {
  useEmployeesByTerritory,
  useSalesDisposition,
  useSalesReport,
  useTerritoryOptions,
} from "./lead-disposition.api";
import type {
  DispositionRow,
  LeadDispositionFilter,
  SalesDashboard,
} from "./lead-disposition.types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

const PAGE_SIZE = 10;

// Legacy: keys are SCREAMING_SNAKE; convert "TOTAL_LEADS" -> "Total Leads".
function humanizeKey(k: string): string {
  const lower = k.replace(/_/g, " ").toLowerCase();
  return lower.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

// Mirrors legacy `colorIconPool` (5-entry cycle by index).
const POOL = [
  { tone: "bg-indigo-50 text-indigo-700", Icon: Users },
  { tone: "bg-emerald-50 text-emerald-700", Icon: Phone },
  { tone: "bg-violet-50 text-violet-700", Icon: TrendingUp },
  { tone: "bg-amber-50 text-amber-700", Icon: CalendarCheck },
  { tone: "bg-sky-50 text-sky-700", Icon: Info },
];

function styleForIndex(i: number) {
  return POOL[i % POOL.length]!;
}

function capitalize(s?: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function fmtDate(v?: string): string {
  if (!v) return "-";
  // Legacy `formatDateMMDDYYYY` returns MM/DD/YYYY — keep verbatim.
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

export default function LeadDispositionPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [territoryId, setTerritoryId] = useState("");
  const [userId, setUserId] = useState("");
  const [applied, setApplied] = useState<LeadDispositionFilter>({});

  const territories = useTerritoryOptions();
  // Legacy fetches employees whenever a territory is picked; before that the
  // user select stays empty.
  const employees = useEmployeesByTerritory(territoryId || null);
  const sales = useSalesReport(applied);
  const disposition = useSalesDisposition(applied);

  const dashboard: SalesDashboard = sales.data?.dashboard ?? {};
  const dispositionRows = disposition.data ?? [];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(dispositionRows.length / PAGE_SIZE));
  const pagedRows = useMemo(
    () => dispositionRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [dispositionRows, page]
  );

  const apply = () => {
    setApplied({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      territoryId: territoryId || undefined,
      userId: userId || undefined,
    });
    setPage(1);
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setTerritoryId("");
    setUserId("");
    setApplied({});
    setPage(1);
  };

  const cards = Object.entries(dashboard);

  return (
    <ReportShell
      title="Lead Disposition"
      description="MIS · Lead-flow outcomes + disposition stream"
      searchLoading={sales.isFetching || disposition.isFetching}
      onSearch={apply}
      onReset={reset}
      headerExtras={
        cards.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cards.map(([key, value], i) => {
              const { tone, Icon } = styleForIndex(i);
              return (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {humanizeKey(key)}
                    </p>
                    <span className={`rounded-md p-2 ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {String(value ?? "—")}
                  </p>
                </div>
              );
            })}
          </div>
        )
      }
      filters={
        <>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <Calendar className="h-3 w-3" />
              From
            </Label>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <Calendar className="h-3 w-3" />
              To
            </Label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <Building2 className="h-3 w-3" />
              Branch
            </Label>
            <select
              className={selectClass}
              value={territoryId}
              onChange={(e) => {
                setTerritoryId(e.target.value);
                setUserId(""); // legacy: when branch changes, user list refreshes.
              }}
              disabled={territories.isLoading}
            >
              <option value="">
                {territories.isLoading ? "Loading…" : "Select"}
              </option>
              {(territories.data ?? []).map((t) => (
                <option key={String(t.id)} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-medium uppercase text-slate-500">
              <User className="h-3 w-3" />
              Sales Person
            </Label>
            <select
              className={selectClass}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={employees.isLoading}
            >
              <option value="">
                {employees.isLoading ? "Loading…" : "Select"}
              </option>
              {(employees.data ?? []).map((u) => (
                <option key={String(u.user_id)} value={String(u.user_id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </>
      }
    >
      <DataTableShell
        columnCount={9}
        loading={disposition.isFetching && dispositionRows.length === 0}
        isEmpty={!disposition.isFetching && dispositionRows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No disposition entries"
        pagination={{
          page,
          totalPages,
          total: dispositionRows.length,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Sales Rep</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Action</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Feedback</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Location</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Remarks</TableHead>
          </TableRow>
        }
      >
        {pagedRows.map((r: DispositionRow, i) => (
          <TableRow
            key={`${r.loan_code ?? r.lead_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell>{r.username ?? "-"}</TableCell>
            <TableCell>
              <Badge variant="outline">{r.loan_code ?? r.lead_code ?? "-"}</Badge>
            </TableCell>
            <TableCell className="font-semibold">{r.lead_name ?? "-"}</TableCell>
            <TableCell>{capitalize(r.activity_type) || "-"}</TableCell>
            <TableCell>
              {r.outcome ? (
                <Badge variant="secondary">{capitalize(r.outcome)}</Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{capitalize(r.feedback) || "-"}</TableCell>
            <TableCell>{fmtDate(r.created_at)}</TableCell>
            <TableCell>{r.address ?? "-"}</TableCell>
            <TableCell>{capitalize(r.remark) || "-"}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}
