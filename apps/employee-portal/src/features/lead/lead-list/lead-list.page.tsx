import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useTranslation } from "@craft-apex/i18n";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useLeadList } from "./lead-list.api";
import type { LeadListScope } from "./lead-list.types";

const PAGE_SIZE = 10; // legacy groupSize

const scopeFromPath = (path: string): LeadListScope =>
  path.endsWith("/fulfilled")
    ? "FULFILLED"
    : path.endsWith("/archived")
      ? "ARCHIVED"
      : path.endsWith("/dedupe-q")
        ? "DEDUPE"
        : "ALL";

const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "-"
    : `₹ ${Number(v).toLocaleString("en-IN")}`;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

export default function LeadListPage() {
  const { pathname } = useLocation();
  const scope = scopeFromPath(pathname);
  const [page, setPage] = useState(1);
  const { t } = useTranslation("lead");

  const { data, isFetching } = useLeadList(page, scope);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={7}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle={t("list.emptyTitle")}
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colLeadRefNo")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colBranch")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colApplicant")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colProduct")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colLoanAmount")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colStatus")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("list.colInitiated")}</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow key={r.code ?? r.id ?? i} className={TABLE_ROW_CLASS}>
          <TableCell>
            <div className="font-medium">{r.code ?? "-"}</div>
            <div className="text-xs text-muted-foreground">
              {r.external_lead_id ?? "-"}
            </div>
          </TableCell>
          <TableCell>
            <div>{r.territory_name ?? "-"}</div>
            <div className="text-xs text-muted-foreground">
              {r.territory_code ?? "-"}
              {r.parent_territory_name ? ` · ${r.parent_territory_name}` : ""}
            </div>
          </TableCell>
          <TableCell>{r.name ?? "-"}</TableCell>
          <TableCell>{r.sub_loan_type_name ?? "-"}</TableCell>
          <TableCell>{fmtAmount(r.loan_amount)}</TableCell>
          <TableCell>
            {r.application_status ? (
              <Badge variant="secondary">{r.application_status}</Badge>
            ) : (
              "-"
            )}
          </TableCell>
          <TableCell>{fmtDate(r.createdAt)}</TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
