import { useState } from "react";
import { TableCell, TableHead, TableRow } from "@craft-apex/ui";
import { useTranslation } from "@craft-apex/i18n";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useRejectedQ } from "./rejected-q.api";
import type { RejectedParticipant } from "./rejected-q.types";

const PAGE_SIZE = 10;

const fmtDate = (v?: string) =>
  v ? new Date(v).toLocaleString("en-IN") : "-";

const participant = (p?: RejectedParticipant) =>
  !p
    ? "-"
    : [p.channel_name, p.user_name].filter(Boolean).join(" - ") ||
      (p.user_name ?? "-");

export default function RejectedQPage() {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useRejectedQ(page);
  const { t } = useTranslation("application");

  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <DataTableShell
      columnCount={7}
      loading={isFetching && rows.length === 0}
      isEmpty={!isFetching && rows.length === 0}
      emptyTitle={t("rejectedQ.emptyTitle")}
      pagination={{
        page,
        totalPages,
        total,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
      header={
        <TableRow className={TABLE_HEADER_ROW_CLASS}>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colLender")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colLeadId")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colLoanType")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colApplicant")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colSourcedBy")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colProcessedBy")}</TableHead>
          <TableHead className={TABLE_HEAD_CLASS}>{t("colLenderLogin")}</TableHead>
        </TableRow>
      }
    >
      {rows.map((r, i) => (
        <TableRow
          key={r.application_code ?? r.application_id ?? i}
          className={TABLE_ROW_CLASS}
        >
          <TableCell>{r.lender?.lender_name ?? "-"}</TableCell>
          <TableCell className="font-medium">
            {r.application_code ?? "-"}
          </TableCell>
          <TableCell>{r.loan_type_name ?? "-"}</TableCell>
          <TableCell>
            <div>{r.application_name ?? "-"}</div>
            <div className="text-xs text-muted-foreground">
              {r.mobile ?? "-"}
            </div>
          </TableCell>
          <TableCell>
            {participant(
              r.participant_details?.SOURCED_BY ??
                r.participant_details?.CREATED_BY
            )}
          </TableCell>
          <TableCell>
            {participant(r.participant_details?.PROCESSED_BY)}
          </TableCell>
          <TableCell>{fmtDate(r.lender_login_date)}</TableCell>
        </TableRow>
      ))}
    </DataTableShell>
  );
}
