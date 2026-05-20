import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@craft-apex/ui";

const fmt = (d: Date) =>
  `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}, ${d.getFullYear()}`;

interface Props {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  /** legacy DashboardFilter: minDate only when lead_visibility is set */
  minDate?: Date;
  maxDate: Date;
}

/**
 * Shadcn date-range picker with endpoint-aware editing:
 *  - clicking a date BEFORE the current start moves the start, keeps the end
 *  - clicking a date AFTER the current end moves the end, keeps the start
 *  - clicking inside the range starts a fresh range (pick start, then end)
 * Applies only on an explicit, complete range (no single-day collapse).
 */
export function DateRangePicker({ value, onChange, minDate, maxDate }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);

  const handleSelect = (range: DateRange | undefined, day: Date) => {
    setDraft((prev) => {
      if (prev?.from && prev?.to) {
        if (day < prev.from) return { from: day, to: prev.to }; // edit start
        if (day > prev.to) return { from: prev.from, to: day }; // edit end
        return { from: day, to: undefined }; // inside → new range
      }
      return range; // library-built first/second click
    });
  };

  const complete = Boolean(draft?.from && draft?.to);

  const apply = () => {
    if (!draft?.from || !draft?.to) return;
    if (
      draft.from.getTime() !== value.from.getTime() ||
      draft.to.getTime() !== value.to.getTime()
    ) {
      onChange({ from: draft.from, to: draft.to });
    }
    setOpen(false);
  };

  const hint = !draft?.from
    ? "Select start date"
    : !draft?.to
      ? "Select end date"
      : `${fmt(draft.from)} — ${fmt(draft.to)}`;

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(value); // reopen shows the active range; edits discard unless Applied
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          {fmt(value.from)} <span className="text-slate-300">—</span>{" "}
          {fmt(value.to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={value.from}
          selected={draft}
          onSelect={handleSelect}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            { after: maxDate },
          ]}
        />
        <div className="flex items-center justify-between gap-3 border-t p-3">
          <span className="text-xs text-slate-500">{hint}</span>
          <Button size="sm" onClick={apply} disabled={!complete}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
