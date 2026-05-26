import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useEnquiryList } from "./enquiry-list.api";
import type { EnquiryRow } from "./enquiry-list.types";

const PAGE_SIZE = 10;

function fmtAmount(v: unknown): string {
  if (v == null || v === "") return "-";
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹ ${n.toLocaleString("en-IN")}`;
}

function fmtDate(v?: string): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  // Legacy: moment(...).format('DD-MM-YYYY, h:mm:ss A')
  const pad = (n: number) => String(n).padStart(2, "0");
  const hour12 = ((d.getHours() + 11) % 12) + 1;
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}, ${hour12}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
}

// Title varies by path — legacy mounts the same component at two URLs.
function titleForPath(path: string): { title: string; label: string } {
  if (path.startsWith("/enquiry/lead")) {
    return { title: "Enquiry Leads", label: "Enquiry · Lead" };
  }
  return { title: "Customer Enquiries", label: "Enquiry · Customer" };
}

export default function EnquiryListPage() {
  const { pathname } = useLocation();
  const { title, label } = titleForPath(pathname);
  const [page, setPage] = useState(1);

  const { data, isFetching } = useEnquiryList({ page });
  const rows: EnquiryRow[] = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      </div>

      <DataTableShell
        columnCount={6}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No enquiries found"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Details</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lead Details</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Source</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
          </TableRow>
        }
      >
        {rows.map((r) => (
          <TableRow key={String(r.application_id)} className={TABLE_ROW_CLASS}>
            <TableCell className="font-semibold">
              <div>{r.code ?? "-"}</div>
              {r.loan_code && (
                <div className="text-xs text-slate-500">
                  Loan Code: {r.loan_code}
                </div>
              )}
            </TableCell>

            <TableCell>
              <div>
                <b>Loan Type:</b>
                <p className="m-0">{r.loan_type_name ?? "-"}</p>
                <b>Requested Amount:</b>
                <p className="m-0">{fmtAmount(r.loan_amount)}</p>
              </div>
            </TableCell>

            <TableCell>
              <strong>Application Name:</strong>
              <p className="m-0">{r.name ?? "-"}</p>
              {r.apply_capacity === "ENTITY" && (
                <>
                  <strong>Contact Person:</strong>
                  <p className="m-0">{r.contact_name ?? "-"}</p>
                </>
              )}
              <strong>Mobile Number:</strong>
              <p className="m-0">{r.mobile ?? "-"}</p>
            </TableCell>

            <TableCell>
              <Badge variant="secondary">
                {r.sourced_by?.channel_name ??
                  r.sourced_by?.user_name ??
                  "-"}
                {r.sourced_by?.user_role ? ` · ${r.sourced_by.user_role}` : ""}
              </Badge>
              <div className="mt-1 text-xs">
                {r.type && (
                  <>
                    <b>Journey Type:</b> {r.type}
                    <br />
                  </>
                )}
                {r.sourced_by?.user_type && (
                  <>
                    <b>User Type:</b> {r.sourced_by.user_type}
                    <br />
                  </>
                )}
                {r.external_lead_type && (
                  <>
                    <b>Lead Type:</b> {r.external_lead_type}
                  </>
                )}
              </div>
            </TableCell>

            <TableCell>
              {r.active_task?.task_name && (
                <p className="m-0">
                  <strong>Pending in:</strong> {r.active_task.task_name}
                </p>
              )}
              {r.active_task?.user_detail?.username && (
                <p className="m-0">
                  <strong>Pending with:</strong>{" "}
                  {r.active_task.user_detail.username}
                </p>
              )}
              <p className="m-0">
                <strong>Status:</strong>{" "}
                <Badge variant="secondary">
                  {r.loan_status ?? r.application_status ?? "-"}
                </Badge>
              </p>
            </TableCell>

            <TableCell className="whitespace-nowrap text-xs">
              <strong>Created On:</strong>
              <p className="m-0">{fmtDate(r.createdAt)}</p>
              <strong>Updated On:</strong>
              <p className="m-0">{fmtDate(r.updatedAt)}</p>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
