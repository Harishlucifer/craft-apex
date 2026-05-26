import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";
import {
  Badge,
  Button,
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
  useIncentiveStatementList,
  useTerritoryMaster,
  useTerritoryUser,
} from "./incentive-statement.api";
import {
  INVOICE_STATUS,
  type IncentiveFilters,
  type IncentiveRow,
  type SelectOption,
} from "./incentive-statement.types";

// Legacy: Invoice.js — moduleName="EMPLOYEE_INCENTIVE" branch
// (location.pathname.includes("incentive")). Filters mirrored verbatim:
// Territory Type, Territory, Employee, Month.
//
// Columns (legacy Invoice.js, EMPLOYEE_INCENTIVE branch — Tax columns omitted):
//   S.No, System Invoice Id, Incentive statement no, Employee Name,
//   No of Leads, Total Amount, Net Amount, Status, Actions.
//
// Deferred (kept out of this port for safety — see api file for endpoints):
//  - "Calculate Incentive" button → GET /alpha/v1/finance/employee/incentive
//    (Invoice.js formik.onSubmit, capInvoiceBtnStatus / isIncentive branch).
//  - Invoice detail view target (`/finance/invoice-details/:id`) — link kept,
//    target page port lives elsewhere.

const PAGE_SIZE = 10;

// Mirrors legacy helper/utility.js AmountExtractorWithComma.
const formatINR = (n: number | string | undefined): string => {
  if (n === undefined || n === null || n === "") return "";
  const num = Number(String(n).replace(/,/g, "").trim());
  if (Number.isNaN(num)) return "";
  return num >= 1000 ? new Intl.NumberFormat("en-IN").format(num) : String(num);
};

const employeeNameOf = (r: IncentiveRow): string =>
  // Legacy: `${cellProps?.coreEmployeeList?.name ? … : cellProps?.coreChannelList?.name}`
  r.coreEmployeeList?.name ?? r.coreChannelList?.name ?? "N/A";

export default function IncentiveStatementPage() {
  const navigate = useNavigate();
  const module = useModule();
  const category = (
    (module?.node.configuration as Record<string, unknown> | undefined)?.category as
      | string
      | undefined
  ) ?? undefined;

  const [filters, setFilters] = useState<IncentiveFilters>({
    territory_type_id: "",
    territory_id: "",
    employee_id: "",
    month: "",
  });
  const [submitted, setSubmitted] = useState<IncentiveFilters | null>(null);
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

  // Legacy filterTerritory: master filtered by type, kept iff in user's list.
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

  // Single-option auto-select (mirrors EstimateForm.useEffect helpers).
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
      setFilters((f) => ({ ...f, territory_id: only.value, employee_id: "" }));
    }
  }, [territoryOptions, filters.territory_id]);

  useEffect(() => {
    const only = employeeOptions[0];
    if (
      employeeOptions.length === 1 &&
      only &&
      filters.employee_id !== only.value
    ) {
      setFilters((f) => ({ ...f, employee_id: only.value }));
    }
  }, [employeeOptions, filters.employee_id]);

  // Legacy fires the un-filtered list call on mount whenever `category` exists.
  // Once the user submits filters, we switch to the filtered URL variant.
  const { data: payload, isFetching } = useIncentiveStatementList(
    {
      category,
      territory_id: submitted?.territory_id,
      month: submitted?.month,
    },
    { filtered: Boolean(submitted), enabled: Boolean(category) },
  );

  const rows: IncentiveRow[] = payload?.data ?? [];
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

  const onClear = () => {
    setFilters({
      territory_type_id: "",
      territory_id: "",
      employee_id: "",
      month: "",
    });
    setSubmitted(null);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales Incentive Statement
          </h1>
          <p className="text-sm text-slate-500">
            Employee incentive statements generated under INCENTIVE mode.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {/* Filter bar — labels & params verbatim from EstimateForm.js (INCENTIVE branch). */}
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
                disabled={!filters.territory_id || employeeOptions.length === 1}
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
              <Label>Month</Label>
              <Input
                type="date"
                value={filters.month}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, month: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-end gap-2">
              {/* TODO: port legacy "Calculate Incentive" → GET /alpha/v1/finance/employee/incentive
                  (Invoice.js formik.onSubmit, capInvoiceBtnStatus + isIncentive branch). */}
              {submitted && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                >
                  Clear
                </button>
              )}
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

      <DataTableShell
        columnCount={9}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No incentive statements"
        emptyDescription={
          submitted
            ? "Try a different territory, employee, or month."
            : "Incentive statements for the active module category will appear here."
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
            <TableHead className={TABLE_HEAD_CLASS}>System Invoice Id</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>
              Incentive statement no
            </TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Employee Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>No of Leads</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Total Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Net Amount</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Actions</TableHead>
          </TableRow>
        }
      >
        {paged.map((r, i) => {
          const statusLabel =
            r.status !== undefined ? INVOICE_STATUS[Number(r.status)] : undefined;
          return (
            <TableRow
              key={`${r.id ?? "row"}-${(page - 1) * PAGE_SIZE + i}`}
              className={TABLE_ROW_CLASS}
            >
              <TableCell className="text-xs text-slate-500">
                {(page - 1) * PAGE_SIZE + i + 1}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {r.id !== undefined ? String(r.id) : "-"}
              </TableCell>
              <TableCell>{r.invoiceNo ? r.invoiceNo : "N/A"}</TableCell>
              <TableCell className="font-medium">{employeeNameOf(r)}</TableCell>
              <TableCell>{r.noOfLeads ?? "-"}</TableCell>
              <TableCell>₹{formatINR(r.netAmount)}</TableCell>
              <TableCell>₹{formatINR(r.totalAmount)}</TableCell>
              <TableCell>
                <Badge className="bg-sky-100 text-[10px] uppercase tracking-wide text-sky-700">
                  {statusLabel ?? "-"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/finance/invoice-details/${String(r.id)}`)
                  }
                  disabled={r.id === undefined}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
