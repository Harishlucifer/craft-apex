// Working-day calendar.
//
// Rules:
//   • Sunday                                  → HOLIDAY
//   • Saturday — 1st / 3rd / 5th of the month → WORK
//   • Saturday — 2nd / 4th of the month       → LEAVE
//   • Monday–Friday                           → WORK

export type DayStatus = "WORK" | "LEAVE" | "HOLIDAY";

/** Default working-hours label shown on the calendars. */
export const DEFAULT_SHIFT_TIMING = "10:00 AM – 6:00 PM";

export interface ScheduleDay {
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string;
  /** Weekday name, e.g. "Saturday". */
  day: string;
  /** 1-based weekday-of-month ordinal (e.g. 2 = the 2nd Saturday). */
  weekdayOrdinal: number;
  status: DayStatus;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** The Nth occurrence of this weekday within its month (1-based). */
export function weekdayOrdinal(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

/** Resolve the working status of a single date. */
export function getDayStatus(date: Date): DayStatus {
  const dow = date.getDay();
  if (dow === 0) return "HOLIDAY"; // Sunday
  if (dow === 6) {
    // 1st/3rd/5th Saturday work, 2nd/4th leave (alternating).
    return weekdayOrdinal(date) % 2 === 1 ? "WORK" : "LEAVE";
  }
  return "WORK"; // Monday–Friday
}

/** Local `YYYY-MM-DD` (avoids the UTC shift of Date.toISOString). */
function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Build the full day-wise schedule for a calendar year. */
export function buildYearSchedule(year: number): ScheduleDay[] {
  const days: ScheduleDay[] = [];
  const cursor = new Date(year, 0, 1);
  while (cursor.getFullYear() === year) {
    days.push({
      date: toLocalISO(cursor),
      day: WEEKDAYS[cursor.getDay()]!,
      weekdayOrdinal: weekdayOrdinal(cursor),
      status: getDayStatus(cursor),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export interface ScheduleSummary {
  total: number;
  work: number;
  leave: number;
  holiday: number;
}

/** Count days by status for a schedule (or any day list). */
export function summarizeSchedule(days: ScheduleDay[]): ScheduleSummary {
  return days.reduce<ScheduleSummary>(
    (acc, d) => {
      acc.total += 1;
      if (d.status === "WORK") acc.work += 1;
      else if (d.status === "LEAVE") acc.leave += 1;
      else acc.holiday += 1;
      return acc;
    },
    { total: 0, work: 0, leave: 0, holiday: 0 }
  );
}
