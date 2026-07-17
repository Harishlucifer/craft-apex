import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Coffee,
  Sun,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button, Card, CardContent } from "@craft-apex/ui";
import {
  buildYearSchedule,
  summarizeSchedule,
  DEFAULT_SHIFT_TIMING,
  type DayStatus,
  type ScheduleDay,
} from "@/lib/work-schedule";

const NAVY = "#1E2A6B";
const BLUE = "#2563EB";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// Monday-first single-letter headers (Sat/Sun get accent colours).
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; border: string }> = {
  WORK: { bg: "#FFFFFF", color: "#0F172A", border: "#DBEAFE" },
  LEAVE: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  HOLIDAY: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export default function WorkSchedule() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const days = useMemo(() => buildYearSchedule(year), [year]);
  const summary = useMemo(() => summarizeSchedule(days), [days]);

  const byMonth = useMemo(() => {
    const groups: ScheduleDay[][] = Array.from({ length: 12 }, () => []);
    for (const d of days) groups[Number(d.date.slice(5, 7)) - 1]!.push(d);
    return groups;
  }, [days]);

  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}
            >
              <CalendarDays className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                <span style={{ color: NAVY }}>WORK CALENDAR </span>
                <span style={{ color: BLUE }}>{year}</span>
              </h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Full Year Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Clock className="h-5 w-5" style={{ color: BLUE }} />
              <div className="leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Shift Timing
                </p>
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  {DEFAULT_SHIFT_TIMING}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
              <Button variant="ghost" size="sm" onClick={() => setYear((y) => y - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[3.5rem] text-center text-sm font-semibold text-slate-900">
                {year}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setYear((y) => y + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard icon={<Briefcase className="h-5 w-5" />} count={summary.work} label="Working days" bg="#4C7DF014" color="#2C53B0" />
        <SummaryCard icon={<Coffee className="h-5 w-5" />} count={summary.leave} label="Saturday offs" bg="#F59E0B1f" color="#B45309" />
        <SummaryCard icon={<Sun className="h-5 w-5" />} count={summary.holiday} label="Sunday holidays" bg="#F43F5E1a" color="#BE123C" />
      </div>

      {/* 12-month grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {byMonth.map((monthDays, mi) => (
          <MonthCard key={mi} title={MONTHS[mi]!} days={monthDays} todayISO={todayISO} />
        ))}
      </div>

      {/* Rules footer */}
      <Card className="p-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Calendar Rules
          </p>
          <Rule icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} text="1st, 3rd & 5th Saturdays are Working Days" />
          <Rule icon={<XCircle className="h-4 w-4 text-red-600" />} text="2nd & 4th Saturdays are Holidays" />
          <Rule icon={<CalendarCheck className="h-4 w-4 text-red-600" />} text="Every Sunday is Holiday" />
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon, count, label, bg, color,
}: {
  icon: React.ReactNode; count: number; label: string; bg: string; color: string;
}) {
  return (
    <Card className="p-0">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: bg, color }}>
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthCard({
  title, days, todayISO,
}: {
  title: string; days: ScheduleDay[]; todayISO: string;
}) {
  // Monday-indexed leading blanks.
  const firstDow =
    days.length > 0 ? (new Date(days[0]!.date + "T00:00:00").getDay() + 6) % 7 : 0;

  return (
    <Card className="p-0">
      <div
        className="rounded-t-xl px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}
      >
        {title}
      </div>
      <CardContent className="p-3">
        <div className="grid grid-cols-7 gap-1 text-center">
          {DOW.map((d, i) => (
            <span
              key={i}
              className="pb-1 text-[10px] font-bold uppercase"
              style={{ color: i === 6 ? "#DC2626" : i === 5 ? BLUE : "#94A3B8" }}
            >
              {d}
            </span>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {days.map((d) => {
            const dayNum = Number(d.date.slice(8, 10));
            const style = STATUS_STYLE[d.status];
            const isWorkingSat = d.status === "WORK" && d.day === "Saturday";
            const isToday = d.date === todayISO;
            return (
              <span
                key={d.date}
                title={`${d.date} · ${d.status}`}
                className="relative flex h-7 items-center justify-center rounded-md border text-xs font-semibold"
                style={{
                  backgroundColor: style.bg,
                  color: isWorkingSat ? BLUE : style.color,
                  borderColor: isToday ? BLUE : style.border,
                  boxShadow: isToday ? `0 0 0 1px ${BLUE}` : undefined,
                }}
              >
                {dayNum}
                {isWorkingSat && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
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
