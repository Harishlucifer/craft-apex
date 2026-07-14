/**
 * Display formatters shared by the consumer screens.
 *
 * Everything here is defensive: the backend sends amounts as `string` on some
 * payloads (json-bigint) and `float64` on others, and dates in several shapes
 * (RFC3339 `createdAt`, `created_timestamp`). Never throw on bad input — a
 * borrower-facing screen should degrade to a dash, not a blank page.
 */

/** Amount → "₹12,50,000". Returns "—" when there is nothing meaningful to show. */
export function formatAmount(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** ISO-ish timestamp → "12 Jul 2026". Returns "—" when unparseable. */
export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * SNAKE_CASE / lowercase backend enums → "Snake case".
 * The backend sends statuses like `LOGIN_PENDING`; borrowers should not.
 */
export function humanize(value?: string | null): string {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
