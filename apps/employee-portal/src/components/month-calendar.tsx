import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@craft-apex/ui";
import { getDayStatus, DEFAULT_SHIFT_TIMING } from "@/lib/work-schedule";

const NAVY = "#1E2A6B";
const BLUE = "#2563EB";

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];
// Monday-first week, like the reference poster.
const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Large, poster-style month calendar with shift timing and working/holiday badges. */
export function MonthCalendar({
  initialYear,
  initialMonth,
  shiftTiming = DEFAULT_SHIFT_TIMING,
}: {
  initialYear: number;
  initialMonth: number; // 0-indexed
  shiftTiming?: string;
}) {
  const [cursor, setCursor] = useState({ y: initialYear, m: initialMonth });

  const now = new Date();
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // Monday-indexed leading blanks (JS getDay: Sun=0 → 6, Mon=1 → 0, …).
  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();

  const step = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}
          >
            <CalendarDays className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous month"
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-xl font-extrabold tracking-tight">
                <span style={{ color: NAVY }}>{MONTHS[cursor.m]} </span>
                <span style={{ color: BLUE }}>{cursor.y}</span>
              </h2>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next month"
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Work Calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Clock className="h-5 w-5" style={{ color: BLUE }} />
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Shift Timing
            </p>
            <p className="text-sm font-bold" style={{ color: NAVY }}>
              {shiftTiming}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[640px]">
          {/* Weekday headers */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {DOW.map((d, i) => {
              const bg = i === 6 ? "#DC2626" : i === 5 ? BLUE : NAVY;
              return (
                <div
                  key={d}
                  className="rounded-md py-2 text-center text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: bg }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDow }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const date = new Date(cursor.y, cursor.m, dayNum);
              const iso = `${cursor.y}-${pad(cursor.m + 1)}-${pad(dayNum)}`;
              const status = getDayStatus(date);
              const isSaturday = date.getDay() === 6;
              const working = status === "WORK";
              const isToday = iso === todayISO;

              const numberColor = !working
                ? "#DC2626"
                : isSaturday
                  ? BLUE
                  : "#0F172A";

              return (
                <div
                  key={iso}
                  className="flex min-h-[92px] flex-col justify-between rounded-xl border p-2.5"
                  style={{
                    backgroundColor: working ? "#FFFFFF" : "#FEF2F2",
                    borderColor: isToday
                      ? BLUE
                      : working
                        ? "#DBEAFE"
                        : "#FECACA",
                    boxShadow: isToday ? `0 0 0 1px ${BLUE}` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-lg font-extrabold leading-none"
                      style={{ color: numberColor }}
                    >
                      {dayNum}
                    </span>
                    {!working ? (
                      <Badge bg="#DC2626" text="HOLIDAY" />
                    ) : isSaturday ? (
                      <Badge bg="#16A34A" text="WORKING DAY" />
                    ) : null}
                  </div>

                  {working ? (
                    <span
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold"
                      style={{ color: BLUE }}
                    >
                      <Clock className="h-3 w-3 shrink-0" /> {shiftTiming}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-red-600">
                      <CalendarDays className="h-3 w-3 shrink-0" /> HOLIDAY
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules footer */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 px-5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Calendar Rules
        </p>
        <Rule
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          text="1st, 3rd & 5th Saturdays are Working Days"
        />
        <Rule
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          text="2nd & 4th Saturdays are Holidays"
        />
        <Rule
          icon={<CalendarCheck className="h-4 w-4 text-red-600" />}
          text="Every Sunday is Holiday"
        />
      </div>
    </Card>
  );
}

function Badge({ bg, text }: { bg: string; text: string }) {
  return (
    <span
      className="whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
      style={{ backgroundColor: bg }}
    >
      {text}
    </span>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
      {icon}
      {text}
    </span>
  );
}
