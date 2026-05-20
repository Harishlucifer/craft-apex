import { useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useModule } from "@craft-apex/layout";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useFulfillmentList } from "./fulfillment-list.api";

const PAGE_SIZE = 10;

const fmtDateTime = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "-"
    : `₹ ${Number(v).toLocaleString("en-IN")}`;

export default function FulfillmentListPage() {
  const module = useModule();
  const cfg = module?.node.configuration as Record<string, unknown> | undefined;
  const journeyType = cfg?.include_journey_types as string | undefined;
  const excludeJourneys = cfg?.exclude_journey_types as string | undefined;

  const [page, setPage] = useState(1);
  const { data, isFetching } = useFulfillmentList({
    page,
    journeyType,
    excludeJourneys,
  });
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={8}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle="No applications in this list"
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
          <TableHead className={TABLE_HEAD_CLASS}>Applicant</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Amount</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Sourced By</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>Created</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={`${String(r.application_id ?? r.id ?? r.code ?? "")}-${i}`}
          className={TABLE_ROW_CLASS}
        >
          <TableCell className="font-mono text-xs font-medium">
            {r.code ?? r.application_code ?? "—"}
          </TableCell>
          <TableCell>
            <div>{r.name ?? r.application_name ?? "—"}</div>
            <div className="text-[11px] text-slate-400">{r.mobile ?? ""}</div>
          </TableCell>
          <TableCell>{r.loan_type_name ?? "—"}</TableCell>
          <TableCell>{fmtAmount(r.loan_amount)}</TableCell>
          <TableCell>{r.territory_name ?? "—"}</TableCell>
          <TableCell>
            {r.participant_details?.SOURCED_BY?.user_name ??
              r.participant_details?.CREATED_BY?.user_name ??
              "—"}
          </TableCell>
          <TableCell>
            {r.application_status ? (
              <Badge variant="secondary">{r.application_status}</Badge>
            ) : (
              "—"
            )}
          </TableCell>
          <TableCell className="text-xs text-slate-500">
            {fmtDateTime(r.createdAt)}
          </TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
