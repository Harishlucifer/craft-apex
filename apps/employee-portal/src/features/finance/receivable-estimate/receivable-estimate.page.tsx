import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import {
  useReceivableEstimate,
  useReceivableEstimateLookups,
} from "./receivable-estimate.api";
import type {
  LookupOption,
  ReceivableEstimateFilters,
} from "./receivable-estimate.types";

// Legacy:
//   craft-frontend/src/Components/PayableReceivableManagement/Estimate/Estimate.js
//   (mounted via withModule for the "Receivable Estimate" module with moduleName="PARTNER")
//
// Receivable mode form (legacy EstimateForm "RECEIVABLE" branch) collects:
//   Lender Name *, Loan Type *, Territory Type, Territory, Month *
//
// NOTE — Deferred items (modal/extra UI from legacy):
//   1. "Calculate Estimate" button — legacy posts to GET_ESTIMATE without filters
//      (line 265: GetCall(APIENDPOINTS.GET_ESTIMATE)) and shows a Swal modal.
//      Deferred: needs the Swal alert/modal layer + side-effect job tracking.
//   2. "Generate Invoice" button — only shown when moduleName !== PARTNER_ESTIMATE/
//      PARTNER_INVOICE, but legacy receivable page uses moduleName="PARTNER".
//      Deferred behavior: posts to GET_PAYABLE then GET_ESTIMATE chain.
//   3. Summary cards: legacy reads estimateList?.summary.{TotalEarnings,LeadsCount}
//      — preserved here but UI cards intentionally minimal vs legacy reactstrap Cards.
//   4. Auto-select-when-single-option behavior from legacy EstimateForm useEffect
//      is deferred — left to the user to pick from the dropdown.

const PAGE_SIZE = 10;

// Legacy module wiring: Receivable page passes module.configuration.category="RECEIVABLE"
const CATEGORY = "RECEIVABLE";

const formatINR = (v?: number | string) => {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `₹${n.toLocaleString("en-IN")}`;
};

const INITIAL_FILTERS: ReceivableEstimateFilters = {
  lender_id: "",
  loan_type_id: "",
  territoryType: "",
  territory_id: "",
  month: "",
};

export default function ReceivableEstimatePage() {
  const [filters, setFilters] = useState<ReceivableEstimateFilters>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<ReceivableEstimateFilters | null>(null);
  const [page, setPage] = useState(1);

  const lookups = useReceivableEstimateLookups();
  const lenders: LookupOption[] = lookups.data?.lenders ?? [];
  const loanTypes: LookupOption[] = lookups.data?.loanTypes ?? [];
  const territoryTypes: LookupOption[] = lookups.data?.territoryTypes ?? [];
  const userTerritory: LookupOption[] = lookups.data?.userTerritory ?? [];
  const territoryRows = lookups.data?.territoryRows ?? [];

  // Legacy filterTerritory(): rows where territory_type_id === selected,
  //   intersected with userTerritory ids.
  const territoryOptions: LookupOption[] = useMemo(() => {
    if (!filters.territoryType) return [];
    const userSet = new Set(userTerritory.map((u) => u.value));
    return territoryRows
      .filter((t) => String(t.territory_type_id) === filters.territoryType)
      .map((t) => ({
        value: String(t.territory_id),
        label: t.territory_name,
      }))
      .filter((t) => userSet.has(t.value));
  }, [filters.territoryType, territoryRows, userTerritory]);

  const { data, isLoading, isFetching } = useReceivableEstimate(
    applied ?? INITIAL_FILTERS,
    { category: CATEGORY, enabled: applied !== null },
  );

  const rows = data?.data ?? [];
  const summary = data?.summary ?? {};
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onChange = <K extends keyof ReceivableEstimateFilters>(
    key: K,
    value: ReceivableEstimateFilters[K],
  ) => {
    setFilters((f) => {
      // Resetting territoryType clears territory_id (legacy handleTerritoryTypeChange)
      if (key === "territoryType") {
        return { ...f, territoryType: value as string, territory_id: "" };
      }
      return { ...f, [key]: value };
    });
  };

  // Legacy validation (Yup) for RECEIVABLE: lender_id, loan_type_id, territoryType,
  //   territory_id are required; month is a date (optional). Mirror that gate.
  const canFilter =
    !!filters.lender_id &&
    !!filters.loan_type_id &&
    !!filters.territoryType &&
    !!filters.territory_id;

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canFilter) return;
    setApplied({ ...filters });
    setPage(1);
  };

  const onClear = () => {
    setFilters(INITIAL_FILTERS);
    setApplied(null);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Receivable Estimate
          </h1>
          <p className="text-sm text-slate-500">
            Filter receivable estimates by lender, loan type, territory and month.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={onFilter}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="space-y-1">
              <Label>Lender Name *</Label>
              <select
                value={filters.lender_id}
                onChange={(e) => onChange("lender_id", e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
                disabled={lookups.isLoading}
              >
                <option value="">Select lender</option>
                {lenders.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Loan Type *</Label>
              <select
                value={filters.loan_type_id}
                onChange={(e) => onChange("loan_type_id", e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
                disabled={lookups.isLoading}
              >
                <option value="">Select loan type</option>
                {loanTypes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Territory Type</Label>
              <select
                value={filters.territoryType}
                onChange={(e) => onChange("territoryType", e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
                disabled={lookups.isLoading}
              >
                <option value="">Select type</option>
                {territoryTypes.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Territory</Label>
              <select
                value={filters.territory_id}
                onChange={(e) => onChange("territory_id", e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-slate-300"
                disabled={!filters.territoryType}
              >
                <option value="">Select territory</option>
                {territoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Month *</Label>
              <Input
                type="date"
                value={filters.month}
                onChange={(e) => onChange("month", e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-5">
              <Button type="submit" size="sm" disabled={!canFilter || isFetching}>
                Filter
              </Button>
              {applied && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                >
                  Clear
                </Button>
              )}
              {/*
                Deferred: legacy second button "Calculate Estimate" / "Generate Invoice"
                triggers GET_ESTIMATE / GET_PAYABLE side-effects + Swal modal.
                Needs a confirm modal + toast wiring before reinstating.
              */}
            </div>
          </form>
        </CardContent>
      </Card>

      {applied && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Earnings To Date
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatINR(summary?.TotalEarnings)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Lead Count
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {summary?.LeadsCount ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Receivable Count
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {summary?.LeadsCount ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTableShell
        loading={isLoading && applied !== null}
        isEmpty={applied !== null && !isLoading && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle={applied === null ? "Apply filters" : "No estimate records"}
        emptyDescription={
          applied === null
            ? "Pick a lender, loan type, territory and month, then click Filter."
            : "No leads matched the selected filters."
        }
        columnCount={10}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead className="w-12">S.No</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>Loan Code</TableHead>
            <TableHead>Lender Name</TableHead>
            <TableHead>Loan Type</TableHead>
            <TableHead>Scheme Name / Type</TableHead>
            <TableHead>Disbursement Date</TableHead>
            <TableHead>Applicant Name</TableHead>
            <TableHead>Disbursed Amount</TableHead>
            <TableHead>Payout Rate</TableHead>
            <TableHead>Payout Amount</TableHead>
          </TableRow>
        }
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
      >
        {pageRows.map((row, i) => (
          <TableRow key={`${row.lead_code ?? "row"}-${i}`}>
            <TableCell className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.partner_name ?? row.employee_name ?? "-"}
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-700">
              {row.lead_code ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.lender_name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.loan_type ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.scheme_name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.disbursement_date ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.application_name ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {formatINR(row.disbursement_amount)}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {row.payout_rate ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-slate-700">
              {formatINR(row.payout_amount)}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
