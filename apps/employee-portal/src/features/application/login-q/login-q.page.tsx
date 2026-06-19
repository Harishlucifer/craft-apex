import { useState } from "react";
import { Badge, TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useTranslation } from "@craft-apex/i18n";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useLoginQ } from "./login-q.api";

const PAGE_SIZE = 10;

const fmtAmount = (v: unknown) =>
  v === undefined || v === null || v === ""
    ? "-"
    : `₹ ${Number(v).toLocaleString("en-IN")}`;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

export default function LoginQPage() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useLoginQ(page);
  const { t } = useTranslation("application");

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={7}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle={t("loginQ.emptyTitle")}
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colLeadId")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colLoanDetails")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colApplicant")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colSource")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colPending")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colStatus")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("loginQ.colCreated")}</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow key={r.code ?? i} className={TABLE_ROW_CLASS}>
          <TableCell>
            <div className="font-medium">{r.code ?? "-"}</div>
            {r.loan_code && (
              <div className="text-xs text-muted-foreground">
                {t("loginQ.loanCode")}: {r.loan_code}
              </div>
            )}
          </TableCell>
          <TableCell>
            <div>{r.loan_type_name ?? "-"}</div>
            <div className="text-xs text-muted-foreground">
              {fmtAmount(r.loan_amount)}
            </div>
          </TableCell>
          <TableCell>
            <div>{r.name ?? "-"}</div>
            <div className="text-xs text-muted-foreground">
              {r.mobile ?? "-"}
            </div>
          </TableCell>
          <TableCell>
            {r.sourced_by?.channel_name
              ? `${r.sourced_by.channel_name} - ${r.sourced_by?.user_name ?? ""}`
              : (r.sourced_by?.user_name ?? "-")}
            <div className="text-xs text-muted-foreground">
              {r.sourced_by?.user_role ?? ""}
            </div>
          </TableCell>
          <TableCell>{r.active_task?.task_name ?? "-"}</TableCell>
          <TableCell>
            {r.loan_status || r.application_status ? (
              <Badge variant="secondary">
                {r.loan_status ?? r.application_status}
              </Badge>
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
