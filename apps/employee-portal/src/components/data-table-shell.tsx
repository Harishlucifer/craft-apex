import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@craft-apex/ui";

export interface DataTablePagination {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  /** present → render a Rows-per-page selector */
  onPageSizeChange?: (n: number) => void;
}

export interface DataTableShellProps {
  /** A single <TableRow> containing the <TableHead> cells. */
  header: ReactNode;
  /** Body rows for the current page. */
  children: ReactNode;
  /** colSpan used for skeleton + empty rows. */
  columnCount: number;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Optional icon shown in the empty state. */
  emptyIcon?: ReactNode;
  /** Skeleton row count while loading. */
  skeletonRows?: number;
  pagination?: DataTablePagination;
}

/**
 * Presentational table shell: the rounded card, styled header row, loading
 * skeletons, empty state, and pagination footer. Each page still writes its
 * own columns/rows inline — this just owns the chrome.
 */
export function DataTableShell({
  header,
  children,
  columnCount,
  loading,
  isEmpty,
  emptyTitle = "No records found",
  emptyDescription,
  emptyIcon,
  skeletonRows = 6,
  pagination,
}: DataTableShellProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>{header}</TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, r) => (
              <TableRow key={`s-${r}`}>
                {Array.from({ length: columnCount }).map((_, c) => (
                  <TableCell key={c}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isEmpty ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="h-32 text-center text-sm text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  {emptyIcon}
                  <p className="font-medium text-slate-600">{emptyTitle}</p>
                  {emptyDescription && (
                    <p className="text-xs">{emptyDescription}</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>

      {pagination && <PaginationFooter {...pagination} />}
    </div>
  );
}

function PaginationFooter({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTablePagination) {
  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-500">
      <div className="flex items-center gap-3">
        <span>
          {total === 0
            ? "0 records"
            : `Showing ${rangeFrom}–${rangeTo} of ${total}`}
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[5rem] text-center text-xs font-medium text-slate-600">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Consistent dark header row used by every list. */
export const TABLE_HEADER_ROW_CLASS =
  "border-slate-200 bg-slate-100 hover:bg-slate-100";

/** Consistent header cell class used by every list. */
export const TABLE_HEAD_CLASS =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-700";

/** Consistent body row class used by every list. */
export const TABLE_ROW_CLASS =
  "border-slate-100 transition hover:bg-slate-50/60";
