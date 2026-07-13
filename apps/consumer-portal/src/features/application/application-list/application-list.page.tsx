import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@craft-apex/ui";
import { StatusBadge } from "@/components/status-badge";
import { formatAmount, formatDate } from "@/lib/format";
import { useApplicationList, PAGE_SIZE } from "./application-list.api";
import type { ApplicationRow } from "./application-list.types";

/**
 * "My applications" — the customer's own loan applications.
 *
 * Cards, not a grid: a borrower typically has a handful of applications and
 * cares about "where is mine at / what happens next", which a dense table
 * communicates poorly.
 */
export default function ApplicationListPage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useApplicationList({ page });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          My applications
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track the loan applications you've submitted and see what's needed next.
        </p>
      </header>

      {isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-slate-600">
              We couldn't load your applications just now.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              You don't have any applications yet.
            </p>
            <p className="max-w-sm text-sm text-slate-500">
              Once you apply for a loan, you'll be able to follow its progress here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ul className="space-y-3">
            {rows.map((row, i) => (
              <ApplicationCard
                key={row.application_id ?? row.code ?? i}
                row={row}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function ApplicationCard({ row }: { row: ApplicationRow }) {
  const status = row.loan_status ?? row.application_status;
  const nextStep = row.active_task?.task_name;

  // Without an id there is nothing to link to — render the card inert rather
  // than routing to /applications/undefined.
  const id = row.application_id;

  const body = (
    <Card className="transition hover:border-slate-300 hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-medium text-slate-900">
                {row.code ?? "—"}
              </span>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 truncate text-sm text-slate-600">
              {row.loan_type_name ?? row.loan_type_code ?? "Loan application"}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold text-slate-900">
              {formatAmount(row.loan_amount)}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Applied {formatDate(row.createdAt)}
            </p>
          </div>
        </div>

        {nextStep && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Next
            </span>
            <span className="text-sm text-slate-700">{nextStep}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!id) return <li>{body}</li>;

  return (
    <li>
      <Link
        to={`/applications/${id}`}
        className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        aria-label={`View application ${row.code ?? id}`}
      >
        {body}
      </Link>
    </li>
  );
}
