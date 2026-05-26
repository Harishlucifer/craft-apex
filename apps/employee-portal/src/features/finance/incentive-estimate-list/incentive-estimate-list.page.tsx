import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { useModule } from "@craft-apex/layout";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import {
  useEmployeeList,
  useIncentiveEstimate,
  useTerritoryMaster,
  useTerritoryUser,
} from "./incentive-estimate-list.api";
import type {
  EstimateFilters,
  EstimateRow,
  SelectOption,
} from "./incentive-estimate-list.types";

// Legacy: Estimate.js — INCENTIVE mode, moduleName === "EMPLOYEE" (Sales/Employee flow).
// Filters mirrored verbatim from EstimateForm.js INCENTIVE branch:
//   Territory Type, Territory, Employee*, Month*.
// Columns mirrored verbatim from Estimate.js useMemo(columns, …) — non-collection branch:
//   S.No, Employee Name, Loan Code, Lender Name, Loan Type, Scheme Name / Type,
//   Disbursement Date, Applicant Name, Disbursed Amount, Payout Rate, Payout Amount.
// Summary cards mirrored verbatim from non-Earnings variant:
//   Earnings To Date, Lead Count, Payable Count.
// Deferred: legacy EstimateForm "Calculate Incentive" submit (POST-like GET to GET_PAYABLE
// + Calculate Earnings flow) — see // TODO below.

const PAGE_SIZE = 10;

const formatINR = (n: number | string | undefined): string => {
  if (n === undefined || n === null || n === "") return "-";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat("en-IN").format(num);
};

const labelFromRow = (r: EstimateRow): string =>
  r.employee_name ?? r.partner_name ?? "-";

export default function IncentiveEstimateListPage() {
  const module = useModule();
  const category = (
    (module?.node.configuration as Record<string, unknown> | undefined)?.category as
      | string
      | undefined
  ) ?? undefined;

  const [filters, setFilters] = useState<EstimateFilters>({
    territory_type_id: "",
    territory_id: "",
    employee_id: "",
    month: "",
  });
  const [submitted, setSubmitted] = useState<EstimateFilters | null>(null);
  const [page, setPage] = useState(1);

  const { data: territoryMaster = [] } = useTerritoryMaster();
  const { data: territoryUser } = useTerritoryUser();
  const { data: employeeRows = [] } = useEmployeeList(filters.territory_id);

  const territoryTypeOptions: SelectOption[] = useMemo(
    () =>
      (territoryUser?.territory_type ?? []).map((t) => ({
        value: String(t.id),
        label: t.name,
      })),
    [territoryUser],
  );

  const userTerritoryIds = useMemo(
    () => new Set((territoryUser?.territory ?? []).map((t) => String(t.id))),
    [territoryUser],
  );

  // Mirror legacy filterTerritory: filter master by selected type, then keep
  // only those present in the user's territory list.
  const territoryOptions: SelectOption[] = useMemo(() => {
    if (!filters.territory_type_id) return [];
    return territoryMaster
      .filter(
        (t) => String(t.territory_type_id) === String(filters.territory_type_id),
      )
      .map((t) => ({
        value: String(t.territory_id),
        label: t.territory_name,
      }))
      .filter((o) => userTerritoryIds.has(o.value));
  }, [territoryMaster, filters.territory_type_id, userTerritoryIds]);

  const employeeOptions: SelectOption[] = useMemo(
    () =>
      employeeRows.map((e) => ({
        value: String(e.employee_id),
        label: e.name ?? "",
      })),
    [employeeRows],
  );

  // Auto-pick when there's a single option (matches EstimateForm.useEffect).
  useEffect(() => {
    const only = territoryTypeOptions[0];
    if (
      territoryTypeOptions.length === 1 &&
      only &&
      filters.territory_type_id !== only.value
    ) {
      setFilters((f) => ({
        ...f,
        territory_type_id: only.value,
        territory_id: "",
        employee_id: "",
      }));
    }
  }, [territoryTypeOptions, filters.territory_type_id]);

  useEffect(() => {
    const only = territoryOptions[0];
    if (
      territoryOptions.length === 1 &&
      only &&
      filters.territory_id !== only.value
    ) {
      setFilters((f) => ({
        ...f,
        territory_id: only.value,
        employee_id: "",
      }));
    }
  }, [territoryOptions, filters.territory_id]);

  const { data: payload, isFetching } = useIncentiveEstimate(
    {
      category,
      territory_id: submitted?.territory_id,
      employee_id: submitted?.employee_id,
      month: submitted?.month,
    },
    { enabled: Boolean(submitted && category) },
  );

  const rows: EstimateRow[] = payload?.data ?? [];
  const summary = payload?.summary;
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterValid =
    Boolean(filters.territory_type_id) &&
    Boolean(filters.territory_id) &&
    Boolean(filters.employee_id);

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterValid) return;
    setSubmitted({ ...filters });
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Incentive Estimate
        </h1>
        <p className="text-sm text-slate-500">
          Estimate incentive payouts for an employee by territory and month.
        </p>
      </div>

      {/* Filter bar — verbatim labels from EstimateForm.js (INCENTIVE branch). */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onFilter}
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
          >
            <div className="space-y-1">
              <Label>Territory Type</Label>
              <select
                value={filters.territory_type_id}
                onChange={(e) =>
                  setFilters({
                    territory_type_id: e.target.value,
                    territory_id: "",
                    employee_id: "",
                    month: filters.month,
                  })
                }
                disabled={territoryTypeOptions.length === 1}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select…</option>
                {territoryTypeOptions.map((o) => (
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
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    territory_id: e.target.value,
                    employee_id: "",
                  }))
                }
                disabled={
                  !filters.territory_type_id || territoryOptions.length === 1
                }
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select…</option>
                {territoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Employee *</Label>
              <select
                value={filters.employee_id}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, employee_id: e.target.value }))
                }
                disabled={!filters.territory_id}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select…</option>
                {employeeOptions.map((o) => (
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
                onChange={(e) =>
                  setFilters((f) => ({ ...f, month: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-end gap-2">
              {/* TODO: port legacy "Calculate Incentive" / "Calculate Earnings" submit
                  flow (Estimate.js onSubmit → GET_PAYABLE → Swal). For now this button
                  re-runs GET_ESTIMATE with the selected filters. */}
              <button
                type="submit"
                disabled={!filterValid}
                className="inline-flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                Filter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary cards — legacy non-Earnings variant: Earnings To Date, Lead Count, Payable Count.
          (The "Earnings" variant only shows 2 cards; deferred per moduleName branching.) */}
      {submitted && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            title="Earnings To Date"
            value={`₹${formatINR(summary?.TotalEarnings)}`}
          />
          <SummaryCard
            title="Lead Count"
            value={formatINR(summary?.LeadsCount)}
          />
          <SummaryCard
            title="Payable Count"
            value={formatINR(summary?.LeadsCount)}
          />
        </div>
      )}

      <DataTableShell
        columnCount={11}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle={
          submitted
            ? "No estimate records"
            : "Apply filters to load estimate"
        }
        emptyDescription={
          submitted
            ? "Try a different territory, employee, or month."
            : "Select Territory Type, Territory, and Employee, then click Filter."
        }
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={`${TABLE_HEAD_CLASS} w-12`}>S.No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Employee Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>
              Scheme Name / Type
            </TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursement Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Disbursed Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Payout Rate</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Payout Amount</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => (
          <TableRow
            key={`${r.lead_code ?? "row"}-${(page - 1) * PAGE_SIZE + i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="font-medium">{labelFromRow(r)}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.lead_code ?? "-"}
            </TableCell>
            <TableCell>{r.lender_name ?? "-"}</TableCell>
            <TableCell>{r.loan_type ?? "-"}</TableCell>
            <TableCell>{r.scheme_name ?? "-"}</TableCell>
            <TableCell>{r.disbursement_date ?? "-"}</TableCell>
            <TableCell>{r.application_name ?? "-"}</TableCell>
            <TableCell>₹{formatINR(r.disbursement_amount)}</TableCell>
            <TableCell>{r.payout_rate ?? "-"}</TableCell>
            <TableCell>₹{formatINR(r.payout_amount)}</TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <div className="h-1 rounded-t-md bg-sky-500" />
      <CardContent className="pt-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold text-slate-800">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
