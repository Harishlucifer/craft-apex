import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Download, Filter, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@craft-apex/ui";

/**
 * Shared report scaffold. Most legacy report pages have the same shape:
 *
 *   Header (title + back) → Filter card (date range + extra fields + Submit)
 *                        → Optional Export button
 *                        → Result panel (table / cards / chart)
 *
 * Pages compose what they need; this primitive owns the chrome and the
 * date-range pair (the most-repeated piece) so each report doesn't re-roll
 * those inputs.
 */

interface ReportShellProps {
  title: string;
  description?: string;
  /** Path to navigate back to. Defaults to /dashboard. */
  backTo?: string;
  /** Optional summary cards / extra header content. */
  headerExtras?: ReactNode;
  /** Filter card body — date range fields, dropdowns, etc. */
  filters: ReactNode;
  /** Called when the user clicks Search. */
  onSearch: () => void;
  /** Called when the user clicks Reset. Omit to hide the Reset button. */
  onReset?: () => void;
  /** Wire up to enable a Download CSV / XLSX button. */
  onExport?: () => void;
  exportLoading?: boolean;
  searchLoading?: boolean;
  /** Result panel — table / cards / chart. */
  children: ReactNode;
}

export function ReportShell({
  title,
  description,
  backTo = "/dashboard",
  headerExtras,
  filters,
  onSearch,
  onReset,
  onExport,
  exportLoading,
  searchLoading,
  children,
}: ReportShellProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to={backTo}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </div>

      {headerExtras}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Filter className="h-3.5 w-3.5" /> Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filters}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {onReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              Reset
            </Button>
          )}
          <Button type="submit" size="sm" disabled={searchLoading}>
            {searchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Search
          </Button>
        </div>
      </form>

      {children}
    </div>
  );
}

interface DateRangeFieldsProps {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  /** Optional max date (defaults to today; future dates blocked). */
  maxDate?: string;
  /** Optional min date (e.g. for report-restriction-days). */
  minStart?: string;
  startLabel?: string;
  endLabel?: string;
  required?: boolean;
}

/**
 * The date-range pair used in nearly every legacy report. ISO `YYYY-MM-DD`
 * strings in/out (matches the legacy `start_date` / `end_date` query params).
 */
export function DateRangeFields({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  maxDate,
  minStart,
  startLabel = "From Date",
  endLabel = "To Date",
  required,
}: DateRangeFieldsProps) {
  const today = new Date().toISOString().slice(0, 10);
  const effectiveMax = maxDate ?? today;
  return (
    <>
      <div className="space-y-1.5">
        <Label
          htmlFor="report-start-date"
          className="flex items-center gap-1 text-xs font-medium text-slate-700"
        >
          <Calendar className="h-3 w-3" />
          {startLabel}
          {required && <span className="text-rose-500">*</span>}
        </Label>
        <Input
          id="report-start-date"
          type="date"
          value={startDate}
          max={endDate || effectiveMax}
          min={minStart}
          onChange={(e) => onStartChange(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="report-end-date"
          className="flex items-center gap-1 text-xs font-medium text-slate-700"
        >
          <Calendar className="h-3 w-3" />
          {endLabel}
          {required && <span className="text-rose-500">*</span>}
        </Label>
        <Input
          id="report-end-date"
          type="date"
          value={endDate}
          min={startDate}
          max={effectiveMax}
          onChange={(e) => onEndChange(e.target.value)}
        />
      </div>
    </>
  );
}

/**
 * Hook-friendly state container for the date range pair. Use when the page
 * doesn't already have its own form state.
 */
export function useDateRange(initial?: { startDate?: string; endDate?: string }) {
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const reset = () => {
    setStartDate("");
    setEndDate("");
  };
  return { startDate, endDate, setStartDate, setEndDate, reset };
}
