import { Badge } from "@craft-apex/ui";
import { humanize } from "@/lib/format";

/**
 * Renders a backend status string as a calm, plain-language badge.
 *
 * The backend has no fixed enum for `loan_status` / `application_status` (it is
 * a free-form string built per workflow), so we colour by keyword rather than
 * by an exhaustive map — anything unrecognised falls back to neutral instead of
 * being dropped. Borrowers see "Login pending", not "LOGIN_PENDING".
 */
type Variant = "default" | "secondary" | "success" | "warning" | "destructive";

function variantFor(status: string): Variant {
  const s = status.toLowerCase();
  if (/reject|declin|cancel|fail|lapse|npa|overdue|bounce/.test(s)) {
    return "destructive";
  }
  if (/disburse|approve|sanction|complete|active|closed|paid|success/.test(s)) {
    return "success";
  }
  if (/pending|progress|review|hold|await|process|initiat|submit/.test(s)) {
    return "warning";
  }
  return "secondary";
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return <Badge variant={variantFor(status)}>{humanize(status)}</Badge>;
}
