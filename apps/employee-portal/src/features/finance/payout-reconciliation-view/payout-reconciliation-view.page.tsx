import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { usePayoutReviewDetails } from "./payout-reconciliation-view.api";
import {
  CATEGORY_AMOUNT_MIS_MATCH,
  CATEGORY_MATCHED,
  CATEGORY_NO_ATTRIBUTE,
  CATEGORY_NO_IN_LOS,
  CATEGORY_TOTAL,
  type PayoutReviewBucket,
  type PayoutReviewRow,
  type ReviewCategory,
} from "./payout-reconciliation-view.types";

// Legacy helper — verbatim: label.toUpperCase().replace(/\s+/g, "_").
function labelToConstant(label: string): string {
  return label.toUpperCase().replace(/\s+/g, "_");
}

// Card definitions — verbatim from legacy `askDashboardList`.
//   "Total Leads"      -> TOTAL
//   "Matched"          -> MATCHED
//   "Amount Mismatch"  -> AMOUNT_MISMATCH (note: legacy bug; see below)
//   "No in LOS"        -> NO_IN_LOS
//   "No Attribute"     -> NO_ATTRIBUTE
// The legacy click handler computes `labelToConstant("Amount Mismatch")` ===
// "AMOUNT_MISMATCH", but the bucket constant is `AMOUNT_MIS_MATCH`. We mirror
// the labels verbatim and key the buckets off the canonical AMOUNT_MIS_MATCH
// constant returned by the API.
const CARD_DEFS: Array<{ name: string; category: ReviewCategory }> = [
  { name: "Total Leads", category: CATEGORY_TOTAL },
  { name: "Matched", category: CATEGORY_MATCHED },
  { name: "Amount Mismatch", category: CATEGORY_AMOUNT_MIS_MATCH },
  { name: "No in LOS", category: CATEGORY_NO_IN_LOS },
  { name: "No Attribute", category: CATEGORY_NO_ATTRIBUTE },
];

function findBucket(
  buckets: PayoutReviewBucket[],
  category: ReviewCategory
): PayoutReviewRow[] {
  return (
    buckets.find((b) => labelToConstant(b.label) === category)?.List ?? []
  );
}

export default function PayoutReconciliationViewPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedCategory, setSelectedCategory] = useState<ReviewCategory>(
    CATEGORY_TOTAL
  );

  const { data, isLoading } = usePayoutReviewDetails(id);
  const buckets = data?.payout_review_list ?? [];

  // Counts — mirror the legacy aggregator verbatim.
  const counts = useMemo(() => {
    return {
      [CATEGORY_TOTAL]: buckets.reduce((sum, b) => sum + (b.List?.length ?? 0), 0),
      [CATEGORY_MATCHED]: findBucket(buckets, CATEGORY_MATCHED).length,
      [CATEGORY_AMOUNT_MIS_MATCH]: findBucket(
        buckets,
        CATEGORY_AMOUNT_MIS_MATCH
      ).length,
      [CATEGORY_NO_IN_LOS]: findBucket(buckets, CATEGORY_NO_IN_LOS).length,
      [CATEGORY_NO_ATTRIBUTE]: findBucket(buckets, CATEGORY_NO_ATTRIBUTE).length,
    } as Record<ReviewCategory, number>;
  }, [buckets]);

  // Selected leads — verbatim switch from legacy getLeadsForCategory.
  const rows: PayoutReviewRow[] = useMemo(() => {
    switch (selectedCategory) {
      case CATEGORY_MATCHED:
        return findBucket(buckets, CATEGORY_MATCHED);
      case CATEGORY_AMOUNT_MIS_MATCH:
        return findBucket(buckets, CATEGORY_AMOUNT_MIS_MATCH);
      case CATEGORY_NO_IN_LOS:
        return findBucket(buckets, CATEGORY_NO_IN_LOS);
      case CATEGORY_NO_ATTRIBUTE:
        return findBucket(buckets, CATEGORY_NO_ATTRIBUTE);
      case CATEGORY_TOTAL:
      default:
        return buckets.reduce<PayoutReviewRow[]>(
          (acc, b) => acc.concat(b.List ?? []),
          []
        );
    }
  }, [buckets, selectedCategory]);

  // Action column for AMOUNT_MISMATCH: legacy renders a "Change Disbursed
  // Amount" button that opens DisbursementAmountUpdateModel. Deferred.
  const showActionColumn = selectedCategory === CATEGORY_AMOUNT_MIS_MATCH;
  const columnCount = showActionColumn ? 10 : 9;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Payout Reconciliation
          </h1>
          <p className="text-sm text-slate-500">
            Lender Payout Upload · Dump #{id ?? "—"}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/finance/lender-payout-upload">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {/* Lender / loan-type / month filter card (legacy LenderPayoutFilter).
          Deferred: in legacy this fetches the dump details and prefills the
          filter form. Wire up once the filter component is ported. */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {CARD_DEFS.map((c) => {
          const active = selectedCategory === c.category;
          return (
            <Card
              key={c.category}
              onClick={() => setSelectedCategory(c.category)}
              className={`cursor-pointer transition ${
                active
                  ? "border-sky-400 bg-sky-50"
                  : "hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <CardContent className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  {c.name}
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {counts[c.category] ?? 0}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No leads in this bucket"
        emptyDescription="Pick another category card above to view its leads."
        columnCount={columnCount}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead>Lead Id</TableHead>
            <TableHead>Application Id</TableHead>
            <TableHead>Loan Code</TableHead>
            <TableHead>Application Name</TableHead>
            <TableHead>Disbursed Amount</TableHead>
            <TableHead>Disbursed Date</TableHead>
            <TableHead>Payout Rate</TableHead>
            <TableHead>Payout Amount</TableHead>
            <TableHead>Subvention</TableHead>
            {showActionColumn && <TableHead>Action</TableHead>}
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow key={`${r.applicationId ?? "row"}-${i}`}>
            <TableCell className="text-sm text-slate-700">
              {r.applicationId ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.internalApplicationId ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.product ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.applicantName ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.disbursedAmount ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.internalDisbursedDate ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.payoutRate ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.payoutAmount ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {r.subvention ?? "—"}
            </TableCell>
            {showActionColumn && (
              <TableCell>
                {/* TODO(modal): port DisbursementAmountUpdateModel — legacy
                    opens it on click to update the disbursed amount for a
                    mismatched row. */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled
                  title="Disbursement amount edit modal — not yet ported"
                >
                  Change Disbursed Amount
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
