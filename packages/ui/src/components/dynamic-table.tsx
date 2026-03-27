"use client";

/* ------------------------------------------------------------------ */
/*  DynamicTable – A premium, fully configurable data table            */
/*  Supports multi-key-value columns, dynamic actions, pagination      */
/* ------------------------------------------------------------------ */

import React, { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { cn } from "../lib/utils";
import type {
  DynamicTableProps,
  DynamicColumn,
  DynamicAction,
  ColumnKeyValue,
} from "./dynamic-table-types";

/* ------------------------------------------------------------------ */
/*  Utility – get nested value from dot-path                           */
/* ------------------------------------------------------------------ */

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/* ------------------------------------------------------------------ */
/*  Cell Value Renderer                                                */
/* ------------------------------------------------------------------ */

function CellValue({
  field,
  row,
}: {
  field: ColumnKeyValue;
  row: Record<string, unknown>;
}) {
  const rawValue = getNestedValue(row, field.accessor);

  let displayValue: React.ReactNode;
  if (field.format) {
    displayValue = field.format(rawValue, row);
  } else if (rawValue === null || rawValue === undefined || rawValue === "") {
    displayValue = <span className="text-slate-300">—</span>;
  } else {
    displayValue = String(rawValue);
  }

  if (field.badge) {
    return (
      <div className="flex items-start gap-1.5 py-0.5">
        {!field.hideLabel && (
          <span className="text-[11px] font-medium text-slate-400 shrink-0 mt-0.5">
            {field.label} :
          </span>
        )}
        <Badge
          variant={field.badgeVariant ?? "secondary"}
          className={cn("text-[10px] font-semibold", field.valueClassName)}
        >
          {displayValue}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5 py-0.5">
      {!field.hideLabel && (
        <span className="text-[11px] font-medium text-slate-400 shrink-0">
          {field.label} :
        </span>
      )}
      <span
        className={cn(
          "text-[12px] text-slate-700 font-medium",
          field.valueClassName
        )}
      >
        {displayValue}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column Cell                                                        */
/* ------------------------------------------------------------------ */

function ColumnCell({
  column,
  row,
  rowIndex,
}: {
  column: DynamicColumn;
  row: Record<string, unknown>;
  rowIndex: number;
}) {
  if (column.render) {
    return <>{column.render(row, rowIndex)}</>;
  }

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {column.fields.map((field, idx) => (
        <CellValue key={`${column.key}-${field.accessor}-${idx}`} field={field} row={row} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Action Cell                                                        */
/* ------------------------------------------------------------------ */

function ActionCell({
  actions,
  row,
  rowIndex,
}: {
  actions: DynamicAction[];
  row: Record<string, unknown>;
  rowIndex: number;
}) {
  const visibleActions = actions.filter(
    (action) => !action.visible || action.visible(row)
  );

  if (visibleActions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-lg",
          "h-9 w-9 border border-slate-200 bg-white",
          "text-slate-500 shadow-sm transition-all duration-200",
          "hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700",
          "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "active:scale-95"
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-auto min-w-[200px] bg-white border border-slate-200 shadow-xl"
      >
        {visibleActions.map((action, idx) => (
          <Fragment key={action.key}>
            {action.separator && idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.variant === "destructive" ? "destructive" : "default"}
              onClick={() => action.onClick(row, rowIndex)}
              className="gap-2 cursor-pointer"
            >
              {action.icon && (
                <span className="shrink-0 text-slate-400">
                  {action.icon}
                </span>
              )}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

function TablePagination({
  pagination,
  onPageChange,
}: {
  pagination: DynamicTableProps["pagination"];
  onPageChange?: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems, pageSize } = pagination;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
      <p className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-600">{startItem}</span>
        –<span className="font-semibold text-slate-600">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-600">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-1">
        {/* First & Prev */}
        <button
          onClick={() => onPageChange?.(1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-300">
              •••
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all duration-200",
                currentPage === page
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next & Last */}
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange?.(totalPages)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DynamicTable Component                                        */
/* ------------------------------------------------------------------ */

export function DynamicTable({
  columns,
  data,
  actions,
  loading = false,
  pagination,
  onPageChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = true,
  toolbarActions,
  emptyMessage = "No data found",
  rowKey = "id",
  onRowClick,
}: DynamicTableProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* ═══════════════ Toolbar ═══════════════ */}
      {(showSearch || toolbarActions) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          {showSearch && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "h-9 w-full rounded-lg border border-slate-200 bg-white",
                  "pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400",
                  "shadow-sm transition-all duration-200",
                  "focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>
          )}
          {toolbarActions && (
            <div className="flex items-center gap-2 shrink-0">
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ Table ═══════════════ */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200/80">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider text-slate-500",
                    "bg-slate-50/80 py-3 px-4",
                    col.sticky && "sticky left-0 z-10"
                  )}
                  style={{
                    minWidth: col.minWidth || "auto",
                    maxWidth: col.maxWidth || "none",
                  }}
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80 py-3 px-4 text-center w-[80px]">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading State */}
            {loading && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={(columns.length) + (actions ? 1 : 0)}
                  className="h-64"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-slate-200" />
                      <Loader2 className="absolute inset-0 h-10 w-10 animate-spin text-blue-500" />
                    </div>
                    <p className="text-sm text-slate-400">Loading data…</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={(columns.length) + (actions ? 1 : 0)}
                  className="h-64"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                      <Inbox className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {!loading &&
              data.map((row, rowIndex) => {
                const key = row[rowKey] ? String(row[rowKey]) : `row-${rowIndex}`;
                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    className={cn(
                      "group/row border-b border-slate-100 transition-colors duration-150",
                      "hover:bg-blue-50/30",
                      onRowClick && "cursor-pointer",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    )}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={`${key}-${col.key}`}
                        className={cn(
                          "px-4 py-3 align-top",
                          col.sticky && "sticky left-0 z-10 bg-inherit"
                        )}
                        style={{
                          minWidth: col.minWidth || "auto",
                          maxWidth: col.maxWidth || "none",
                        }}
                      >
                        <ColumnCell
                          column={col}
                          row={row}
                          rowIndex={rowIndex}
                        />
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="px-4 py-3 text-center align-middle">
                        <ActionCell
                          actions={actions}
                          row={row}
                          rowIndex={rowIndex}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* ═══════════════ Pagination ═══════════════ */}
      <TablePagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}
