/* ------------------------------------------------------------------ */
/*  Dynamic Table Types                                                */
/*  Configurable column definitions & action items                    */
/* ------------------------------------------------------------------ */

import type { ReactNode } from "react";

/** A single key-value pair rendered inside a table cell */
export interface ColumnKeyValue {
  /** Label displayed (e.g. "Loan Type") */
  label: string;
  /** Dot-path accessor into the row data (e.g. "loan_type_name") */
  accessor: string;
  /** Optional formatter – receives the raw value and returns display content */
  format?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  /** If true, the label is hidden and only the value is shown */
  hideLabel?: boolean;
  /** Optional CSS class for value styling */
  valueClassName?: string;
  /** If true, render as a Badge component */
  badge?: boolean;
  /** Badge variant when badge = true */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

/** Column configuration for the dynamic table */
export interface DynamicColumn {
  /** Column header text */
  header: string;
  /** Unique key for this column */
  key: string;
  /** Multiple key-value entries displayed vertically in the cell */
  fields: ColumnKeyValue[];
  /** Minimum width for the column */
  minWidth?: string;
  /** Maximum width for the column */
  maxWidth?: string;
  /** Whether the column should be sticky */
  sticky?: boolean;
  /** Custom cell renderer – overrides the default key-value renderer */
  render?: (row: Record<string, unknown>, index: number) => ReactNode;
}

/** A single action item in the row action dropdown */
export interface DynamicAction {
  /** Unique key for the action */
  key: string;
  /** Display label */
  label: string;
  /** Lucide icon name or a ReactNode */
  icon?: ReactNode;
  /** Callback fired when action is clicked */
  onClick: (row: Record<string, unknown>, index: number) => void;
  /** Whether to show this action for a given row */
  visible?: (row: Record<string, unknown>) => boolean;
  /** Visual variant */
  variant?: "default" | "destructive";
  /** Whether to show a separator before this action */
  separator?: boolean;
}

/** Pagination state */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** Props for the DynamicTable component */
export interface DynamicTableProps {
  /** Array of column configurations */
  columns: DynamicColumn[];
  /** Array of data rows */
  data: Record<string, unknown>[];
  /** Array of action items for each row */
  actions?: DynamicAction[];
  /** Whether data is currently loading */
  loading?: boolean;
  /** Pagination info */
  pagination?: PaginationInfo;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Global search value */
  searchValue?: string;
  /** Called when search value changes */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Whether to show the search bar */
  showSearch?: boolean;
  /** Toolbar actions (e.g. filters, export buttons) */
  toolbarActions?: ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Row unique key accessor */
  rowKey?: string;
  /** Called when a row is clicked */
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
}
