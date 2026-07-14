import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleDot } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@craft-apex/ui";
import { StatusBadge } from "@/components/status-badge";
import { formatAmount, formatDate, humanize } from "@/lib/format";
import { useApplicationDetail } from "./application-detail.api";
import type { Applicant, ApplicationDetail } from "./application-detail.types";

/**
 * "Application detail" — one application, read-only.
 *
 * The payload is a large nested object that varies by loan product, so every
 * section here is conditional: if the backend didn't send a block, we omit the
 * block rather than render empty scaffolding.
 */
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError, refetch } = useApplicationDetail(id);

  return (
    <div className="space-y-6">
      <Link
        to="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my applications
      </Link>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-slate-600">
              We couldn't load this application.
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DetailBody detail={data ?? {}} />
      )}
    </div>
  );
}

function DetailBody({ detail }: { detail: ApplicationDetail }) {
  const app = detail.application ?? {};
  const task = detail.active_task ?? detail.application_active_task ?? null;
  const status = app.loan_status ?? app.status_string;
  const applicants = detail.applicants ?? [];

  const hasLoanDetails =
    app.loan_type_name ||
    app.loan_type_code ||
    app.loan_amount ||
    app.purpose_of_loan;

  return (
    <>
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Application no.
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-900">
                {app.application_code ?? "—"}
              </p>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Amount requested
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatAmount(app.loan_amount)}
              </p>
              {app.created_timestamp && (
                <p className="mt-1 text-xs text-slate-400">
                  Applied {formatDate(app.created_timestamp)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Where it stands */}
      {task && (task.task_name || task.stage_name) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where it stands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50">
                <CircleDot className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div>
                {task.stage_name && (
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {humanize(task.stage_name)}
                  </p>
                )}
                {task.task_name && (
                  <p className="text-sm font-medium text-slate-900">
                    {task.task_name}
                  </p>
                )}
                {task.assigned_at && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Since {formatDate(task.assigned_at)}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Your application is with our team. We'll get in touch if anything is
              needed from you.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loan details */}
      {hasLoanDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loan details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field
                label="Loan type"
                value={app.loan_type_name ?? app.loan_type_code}
              />
              <Field label="Amount" value={formatAmount(app.loan_amount)} />
              <Field
                label="Purpose"
                value={app.purpose_of_loan && humanize(app.purpose_of_loan)}
              />
              <Field
                label="Employment"
                value={app.employment_type && humanize(app.employment_type)}
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Applicant(s) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {applicants.length > 1 ? "Applicants" : "Applicant"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {applicants.length > 0 ? (
            applicants.map((a, i) => (
              <ApplicantBlock key={a.applicant_id ?? i} applicant={a} />
            ))
          ) : (
            // Fall back to the contact captured on the application itself.
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field
                label="Name"
                value={app.applicant_name ?? app.contact_name}
              />
              <Field label="Mobile" value={app.mobile} />
              <Field label="Email" value={app.email} />
            </dl>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ApplicantBlock({ applicant }: { applicant: Applicant }) {
  const p = applicant.personal;
  const b = applicant.business;

  const name =
    applicant.applicant_name ??
    b?.business_name ??
    b?.name ??
    p?.full_name ??
    p?.name ??
    [p?.first_name, p?.last_name].filter(Boolean).join(" ") ??
    undefined;

  return (
    <div className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
      {applicant.applicant_type && (
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">
          {humanize(applicant.applicant_type)}
        </p>
      )}
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <Field label="Name" value={name || undefined} />
        <Field label="Mobile" value={p?.mobile} />
        <Field label="Email" value={p?.email} />
      </dl>
    </div>
  );
}

/** Renders nothing when there is no value — no empty rows. */
function Field({
  label,
  value,
}: {
  label: string;
  value?: ReactNode | null;
}) {
  if (value === null || value === undefined || value === "" || value === "—") {
    return null;
  }
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
