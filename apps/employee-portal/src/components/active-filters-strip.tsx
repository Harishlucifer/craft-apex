import { X } from "lucide-react";
import { Badge, Button } from "@craft-apex/ui";

export interface ActiveFilter {
  /** Optional kind label (e.g. "Status"). Rendered as "Status: Active". */
  label?: string;
  /** Display value (e.g. "Active", "2025-01-01"). */
  value: string;
  /** Called when the user clicks the X. */
  onClear: () => void;
}

interface Props {
  filters: ActiveFilter[];
  /** Optional clear-all callback. Hidden when omitted. */
  onClearAll?: () => void;
}

/**
 * Inline strip of removable chips representing the active filter state on a
 * list/queue page. Legacy `LeadListFilter` + `CommonListFilter` open a
 * drawer; we keep the actual filter inputs in a card / popover and surface
 * the *applied* state here so the user can see (and dismiss) each filter at
 * a glance.
 *
 * Pages assemble their own filters array and wire the `onClear` callbacks
 * to their existing filter state setters.
 */
export function ActiveFiltersStrip({ filters, onClearAll }: Props) {
  if (filters.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f, i) => (
        <Badge
          key={`${f.label ?? ""}-${f.value}-${i}`}
          variant="secondary"
          className="gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          {f.label && (
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              {f.label}:
            </span>
          )}
          <span>{f.value}</span>
          <button
            type="button"
            onClick={f.onClear}
            className="ml-0.5 rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label={`Clear ${f.label ?? "filter"}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-slate-500"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
