import { useMemo, useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import {
  DateRangeFields,
  ReportShell,
  useDateRange,
} from "@/components/report-shell";
import { useReportExport } from "@/components/use-report-export";
import {
  useUserLoginReport,
  type UserLoginReportFilter,
} from "./user-login-report.api";

const PAGE_SIZE = 10;

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

export default function UserLoginReportPage() {
  const [page, setPage] = useState(1);
  const dateRange = useDateRange();
  const [appliedFilter, setAppliedFilter] = useState<UserLoginReportFilter>({});

  const { data, isFetching } = useUserLoginReport(page, appliedFilter);
  const rows = data?.result ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exporter = useReportExport("USER_LOGIN_REPORT", "user-login-report.xlsx");

  const apply = () => {
    setAppliedFilter({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
    setPage(1);
  };

  const reset = () => {
    dateRange.reset();
    setAppliedFilter({});
    setPage(1);
  };

  const exportParams = useMemo(
    () => ({
      start_date: appliedFilter.startDate,
      end_date: appliedFilter.endDate,
    }),
    [appliedFilter]
  );

  return (
    <ReportShell
      title="User Login Report"
      description={`${total} login records`}
      searchLoading={isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      onExport={() => exporter.exportNow(exportParams)}
      exportLoading={exporter.loading}
      filters={
        <DateRangeFields
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartChange={dateRange.setStartDate}
          onEndChange={dateRange.setEndDate}
        />
      }
    >
      <DataTableShell
        columnCount={10}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No login activity"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Branch</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Zone</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Login ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>User Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Staff/DSA ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Role</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Platform</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Login</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Logout</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow
            key={`${String(r.user_id ?? r.employee_code ?? "")}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell>
              <div className="text-sm">{r.territory_name ?? "—"}</div>
              <div className="font-mono text-[11px] text-slate-400">
                {r.territory_code ?? ""}
              </div>
            </TableCell>
            <TableCell>{r.parent_territory_name ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-600">
              {r.email ?? "—"}
            </TableCell>
            <TableCell className="font-medium">{r.username ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.employee_code ?? "—"}
            </TableCell>
            <TableCell>
              <div>{r.role_name ?? "—"}</div>
              <div className="text-[11px] text-slate-400">
                {r.user_type ?? ""}
              </div>
            </TableCell>
            <TableCell>{r.platform ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDateTime(r.login_at)}
            </TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDateTime(r.logout_at)}
            </TableCell>
            <TableCell>
              {r.status ? (
                <Badge variant="secondary">{String(r.status)}</Badge>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </ReportShell>
  );
}
