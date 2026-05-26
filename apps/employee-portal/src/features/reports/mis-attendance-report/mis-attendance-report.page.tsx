import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Download, Inbox } from "lucide-react";
import {
  Button,
  Input,
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
import { ReportShell } from "@/components/report-shell";
import {
  buildSummaryDateRange,
  useAttendanceList,
  useAttendanceSummary,
  useLeastTerritory,
  useRevertPunchOut,
  useUserRoles,
} from "./mis-attendance-report.api";
import type {
  AttendanceFilter,
  AttendanceRow,
  AttendanceSummaryPayload,
  AttendanceSummaryRow,
} from "./mis-attendance-report.types";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

// Legacy compares row.date to today via toLocaleDateString("en-GB") → "DD/MM/YYYY"
// then "/" → "-" → "DD-MM-YYYY". Today-row shows the Revert button.
function todayDDMMYYYY(): string {
  return new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
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

const PAGE_SIZE = 10;

export default function MisAttendanceReportPage() {
  const [date, setDate] = useState("");
  const [roleId, setRoleId] = useState("");
  const [branchId, setBranchId] = useState("");

  const [appliedAttendance, setAppliedAttendance] = useState<AttendanceFilter>(
    {}
  );
  const [appliedSummary, setAppliedSummary] =
    useState<AttendanceSummaryPayload | null>(buildSummaryDateRange());

  const roles = useUserRoles();
  const branches = useLeastTerritory();
  const attendance = useAttendanceList(appliedAttendance);
  const summary = useAttendanceSummary(appliedSummary);
  const revert = useRevertPunchOut();
  const qc = useQueryClient();

  const rows = attendance.data ?? [];
  const summaryRows = summary.data ?? [];
  const today = todayDDMMYYYY();

  const [page, setPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const summaryTotalPages = Math.max(
    1,
    Math.ceil(summaryRows.length / PAGE_SIZE)
  );
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );
  const summaryPaged = useMemo(
    () => summaryRows.slice((summaryPage - 1) * PAGE_SIZE, summaryPage * PAGE_SIZE),
    [summaryRows, summaryPage]
  );

  const apply = () => {
    setAppliedAttendance({
      date: date || undefined,
      role_id: roleId || undefined,
      territoryId: branchId || undefined,
    });
    const range = buildSummaryDateRange(date || undefined);
    setAppliedSummary({
      ...range,
      role_id: roleId || undefined,
      territory_id: branchId || undefined,
    });
    setPage(1);
    setSummaryPage(1);
  };

  const reset = () => {
    setDate("");
    setRoleId("");
    setBranchId("");
    setAppliedAttendance({});
    setAppliedSummary(buildSummaryDateRange());
    setPage(1);
    setSummaryPage(1);
  };

  const handleRevert = (row: AttendanceRow) => {
    revert.mutate(
      { user_id: row.user_id, punch_type: "PUNCH_OUT" },
      {
        onSuccess: (res) => {
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Punch out reverted successfully");
            qc.invalidateQueries({ queryKey: ["attendance-list"] });
            qc.invalidateQueries({ queryKey: ["attendance-summary"] });
          }
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Failed to revert"),
      }
    );
  };

  const downloadAttendance = () => {
    if (rows.length === 0) {
      toast.error("No attendance data to download");
      return;
    }
    downloadCsv("Attendance_Report.csv", [
      [
        "Date",
        "Employee Name",
        "Employee ID",
        "Branch",
        "Punch In",
        "Punch Out",
        "Working Hours",
        "Status",
        "Notes",
      ],
      ...rows.map((r) => [
        r.date,
        r.employee_name,
        r.employee_id,
        r.branch,
        r.punch_in || "--",
        r.punch_out || "--",
        r.working_hours || "--",
        r.status,
        r.note || "",
      ]),
    ]);
  };

  const downloadSummary = () => {
    if (summaryRows.length === 0) {
      toast.error("No summary data to download");
      return;
    }
    downloadCsv("Attendance_Monthly_Summary.csv", [
      [
        "Month",
        "Employee Name",
        "Total Present",
        "Late Logins",
        "Total Absent",
        "Total Working Hours",
      ],
      ...summaryRows.map((r: AttendanceSummaryRow) => [
        r.month,
        r.employee_name,
        r.total_present,
        r.late_logins,
        r.total_absent ?? "--",
        r.total_working_hours ?? "--",
      ]),
    ]);
  };

  return (
    <ReportShell
      title="Attendance Report"
      description="MIS · Daily attendance + monthly summary"
      searchLoading={attendance.isFetching && rows.length === 0}
      onSearch={apply}
      onReset={reset}
      filters={
        <>
          <div className="space-y-1.5">
            <Label
              htmlFor="att-date"
              className="flex items-center gap-1 text-xs font-medium text-slate-700"
            >
              <Calendar className="h-3 w-3" />
              Date
            </Label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-branch" className="text-xs font-medium text-slate-700">
              Branch
            </Label>
            <select
              id="att-branch"
              className={selectClass}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={branches.isLoading}
            >
              <option value="">
                {branches.isLoading ? "Loading…" : "Select Branch"}
              </option>
              {(branches.data ?? []).map((b) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-role" className="text-xs font-medium text-slate-700">
              Role
            </Label>
            <select
              id="att-role"
              className={selectClass}
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={roles.isLoading}
            >
              <option value="">
                {roles.isLoading ? "Loading…" : "Select Role"}
              </option>
              {(roles.data ?? []).map((r) => (
                <option key={String(r.id)} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </>
      }
    >
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Attendance Report
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadAttendance}
            disabled={rows.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <DataTableShell
          columnCount={9}
          loading={attendance.isFetching && rows.length === 0}
          isEmpty={!attendance.isFetching && rows.length === 0}
          emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
          emptyTitle="No attendance entries"
          pagination={{
            page,
            totalPages,
            total: rows.length,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
          header={
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Employee Name</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Employee ID</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Branch</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Punch In Time</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Punch Out Time</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Working Hours</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Notes</TableHead>
            </TableRow>
          }
        >
          {paged.map((r, i) => {
            const isToday = r.date === today;
            return (
              <TableRow key={`${r.user_id}-${i}`} className={TABLE_ROW_CLASS}>
                <TableCell>{r.date ?? "-"}</TableCell>
                <TableCell>{r.employee_name ?? "-"}</TableCell>
                <TableCell>{r.employee_id ?? "-"}</TableCell>
                <TableCell>{r.branch ?? "-"}</TableCell>
                <TableCell>{r.punch_in ?? "-"}</TableCell>
                <TableCell>
                  <div>{r.punch_out ?? "-"}</div>
                  {r.punch_out && isToday && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-1"
                      onClick={() => handleRevert(r)}
                      disabled={revert.isPending}
                    >
                      Revert
                    </Button>
                  )}
                </TableCell>
                <TableCell>{r.working_hours ?? "-"}</TableCell>
                <TableCell>
                  <b>{r.status ?? "-"}</b>
                </TableCell>
                <TableCell>{r.note ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </DataTableShell>
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Monthly Summary View
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSummary}
            disabled={summaryRows.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        <DataTableShell
          columnCount={6}
          loading={summary.isFetching && summaryRows.length === 0}
          isEmpty={!summary.isFetching && summaryRows.length === 0}
          emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
          emptyTitle="No summary entries"
          pagination={{
            page: summaryPage,
            totalPages: summaryTotalPages,
            total: summaryRows.length,
            pageSize: PAGE_SIZE,
            onPageChange: setSummaryPage,
          }}
          header={
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead className={TABLE_HEAD_CLASS}>Employee Name</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Month</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Total Present Days</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Late Logins</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Absent Days</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Total Hours Worked</TableHead>
            </TableRow>
          }
        >
          {summaryPaged.map((r, i) => (
            <TableRow key={`s-${i}`} className={TABLE_ROW_CLASS}>
              <TableCell>{r.employee_name ?? "-"}</TableCell>
              <TableCell>{r.month ?? "-"}</TableCell>
              <TableCell>{r.total_present ?? "-"}</TableCell>
              <TableCell>{r.late_logins ?? "-"}</TableCell>
              <TableCell>{r.total_absent ?? "-"}</TableCell>
              <TableCell>{r.total_working_hours ?? "-"}</TableCell>
            </TableRow>
          ))}
        </DataTableShell>
      </section>
    </ReportShell>
  );
}
