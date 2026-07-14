import { Wallet } from "lucide-react";
import { Card, CardContent } from "@craft-apex/ui";
import { StatusBadge } from "@/components/status-badge";
import { formatAmount, formatDate } from "@/lib/format";
import { useLoanList } from "./loan-list.api";
import type { LoanAccountRow } from "./loan-list.types";

/**
 * "My loans" — the customer's active / disbursed loan accounts.
 *
 * TODO(endpoint): this screen currently renders an honest "not available yet"
 * state because alpha-api has no customer-scoped loan-account endpoint. The
 * three candidate routes and why each is unusable (none of them filter by the
 * caller — they return every borrower's accounts) are documented at the top of
 * ./loan-list.types.ts. The row rendering below is already wired against the
 * shape those endpoints return, so once the backend ships a scoped route only
 * ./loan-list.api.ts needs to change.
 */
export default function LoanListPage() {
  const { rows, unavailable } = useLoanList();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          My loans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your disbursed loan accounts, balances and upcoming instalments.
        </p>
      </header>

      {rows.length > 0 ? (
        <ul className="space-y-3">
          {rows.map((row, i) => (
            <LoanCard key={row.loan_account_id ?? row.loan_account_no ?? i} row={row} />
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Wallet className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              {unavailable
                ? "Your loans aren't available here yet."
                : "You don't have any loans yet."}
            </p>
            <p className="max-w-sm text-sm text-slate-500">
              {unavailable
                ? "We can't show your loan accounts in the portal at the moment. Please contact us and we'll help you with your balance and instalments."
                : "Once a loan is disbursed to you, you'll be able to track it here."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoanCard({ row }: { row: LoanAccountRow }) {
  const outstanding = row.outstanding_amount ?? row.disbursed_amount;
  const sanctioned = row.sanctioned_amount ?? row.loan_amount;

  return (
    <li>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-medium text-slate-900">
                  {row.loan_account_no ?? "—"}
                </span>
                <StatusBadge status={row.npa_status ?? String(row.status ?? "")} />
              </div>
              <p className="mt-1 truncate text-sm text-slate-600">
                {row.loan_type_name ?? row.loan_type_code ?? "Loan account"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Outstanding
              </p>
              <p className="text-base font-semibold text-slate-900">
                {formatAmount(outstanding)}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Sanctioned
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {formatAmount(sanctioned)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                EMI
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {formatAmount(row.emi)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Next due
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {formatDate(row.next_due_date)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </li>
  );
}
