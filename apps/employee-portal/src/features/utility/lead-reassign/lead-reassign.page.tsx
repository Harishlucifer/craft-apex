import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Search } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
  toast,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import {
  useLeadTransfer,
  useReassignLeadList,
  useTerritoryLoanType,
  type ReassignListParams,
} from "./lead-reassign.api";
import type {
  AssignOption,
  Id,
  TerritoryLoanTypeRow,
} from "./lead-reassign.types";

const PAGE_SIZE = 10;

const idEq = (a: Id | undefined, b: Id | undefined) =>
  a !== undefined && b !== undefined && String(a) === String(b);

const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

// Legacy buildAssignFrom: response.result.map(...) keyed by user_id+territory+loanType+role.
function toAssignFromOption(row: TerritoryLoanTypeRow): AssignOption {
  return {
    user_id: row.user_id,
    territory_id: row.territory_id,
    role_id: row.role_id,
    loanType_id: row.loanType_id,
    label: `${row.name} / ${row.territory} / ${row.loanType}`,
  };
}

// Legacy handleSelectSingle: same territory + loan_type + role, different user, deduped by user.
function buildAssignTo(all: AssignOption[], from: AssignOption): AssignOption[] {
  const seen = new Set<string>();
  const out: AssignOption[] = [];
  for (const opt of all) {
    if (seen.has(String(opt.user_id))) continue;
    const match =
      idEq(opt.territory_id, from.territory_id) &&
      idEq(opt.loanType_id, from.loanType_id) &&
      idEq(opt.role_id, from.role_id) &&
      !idEq(opt.user_id, from.user_id);
    if (match) {
      seen.add(String(opt.user_id));
      out.push({ ...opt, label: opt.label.split("/")[0]!.trim() });
    }
  }
  return out;
}

// Legacy getStatusColor — kept verbatim (#505050 / #00007b / #00008b / black).
function statusColor(status?: string): string {
  switch (status) {
    case "Applied To Lender":
      return "#505050";
    case "Dedupe Failed":
      return "#00007b";
    case "Pending with processing":
      return "#00008b";
    default:
      return "black";
  }
}

function journeyLabel(t?: string): string {
  if (t === "FULL_FLEDGED_APPLICATION") return "Hot lead";
  if (t === "SHORT_APPLICATION") return "Cold lead";
  return "N/A";
}

function fmtDate(v?: string): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  // Legacy: moment(...).format('DD-MM-YYYY, h:mm:ss A')
  const pad = (n: number) => String(n).padStart(2, "0");
  const hour12 = ((d.getHours() + 11) % 12) + 1;
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return (
    `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}, ` +
    `${hour12}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`
  );
}

export default function LeadReassignPage() {
  const territory = useTerritoryLoanType();
  const allOptions = useMemo<AssignOption[]>(
    () => (territory.data?.result ?? []).map(toAssignFromOption),
    [territory.data]
  );

  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const from = useMemo(
    () => allOptions.find((o) => String(o.user_id) === fromId) ?? null,
    [allOptions, fromId]
  );
  const assignTo = useMemo(
    () => (from ? buildAssignTo(allOptions, from) : []),
    [allOptions, from]
  );
  const to = useMemo(
    () => assignTo.find((o) => String(o.user_id) === toId) ?? null,
    [assignTo, toId]
  );

  const listParams: ReassignListParams | null = from
    ? {
        user_id: from.user_id,
        territory_id: from.territory_id,
        loanType_id: from.loanType_id,
        page,
        keyword: keyword || undefined,
      }
    : null;

  const list = useReassignLeadList(listParams);
  const rows = list.data?.data ?? [];
  const total = list.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Legacy: reset selection when from changes / rows reload.
  useEffect(() => {
    setSelectedRows(new Set());
  }, [fromId, page, keyword]);

  // Reset page when "from" changes (legacy implicitly via filterData/clickedValue).
  useEffect(() => {
    setPage(1);
    setKeyword("");
    setKeywordInput("");
    setToId("");
  }, [fromId]);

  const transfer = useLeadTransfer();

  const allSelected = rows.length > 0 && rows.every((r) =>
    selectedRows.has(String(r.application_id))
  );

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rows.map((r) => String(r.application_id))));
    } else {
      setSelectedRows(new Set());
    }
  };

  const toggleRow = (id: Id) => {
    const k = String(id);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(1);
  };

  const handleReassign = () => {
    // Legacy ordering: if selection empty AND both selects filled -> "Kindly select a lead".
    if (selectedRows.size === 0 && from && to) {
      toast.error("Kindly select a lead for the lead transfer");
    }
    if (!from?.user_id || !to?.user_id) {
      setSubmitted(true);
      return;
    }
    if (selectedRows.size === 0) return;

    const ids: Id[] = Array.from(selectedRows).map((s) => {
      // Preserve original id type if possible (json-bigint may yield string).
      const r = rows.find((row) => String(row.application_id) === s);
      return r ? r.application_id : s;
    });

    transfer.mutate(
      {
        from_user_id: String(from.user_id),
        to_user_id: String(to.user_id),
        application_ids: ids,
      },
      {
        onSuccess: (res) => {
          if (res?.status === 1) {
            toast.success("Lead transferred Successfully");
            setFromId("");
            setToId("");
            setSelectedRows(new Set());
            setSubmitted(false);
          }
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">Utility</p>
        <h1 className="text-2xl font-semibold text-slate-800">Lead Reassign</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <Label className="text-xs text-slate-500">Assign From</Label>
            <select
              className={selectClass}
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              disabled={territory.isLoading}
            >
              <option value="">
                {territory.isLoading ? "Loading…" : "Select"}
              </option>
              {allOptions.map((o, i) => (
                <option key={`${o.user_id}-${i}`} value={String(o.user_id)}>
                  {o.label}
                </option>
              ))}
            </select>
            {submitted && !fromId && (
              <span className="text-xs text-red-500">Please select an user</span>
            )}
          </div>

          <div className="md:col-span-5">
            <Label className="text-xs text-slate-500">Assign To</Label>
            <select
              className={selectClass}
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              disabled={!from}
            >
              <option value="">Select</option>
              {assignTo.map((o, i) => (
                <option key={`${o.user_id}-${i}`} value={String(o.user_id)}>
                  {o.label}
                </option>
              ))}
            </select>
            {submitted && !toId && (
              <span className="text-xs text-red-500">Please select an user</span>
            )}
          </div>

          <div className="md:col-span-2">
            <Button
              className="w-full"
              onClick={handleReassign}
              disabled={transfer.isPending}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {transfer.isPending ? "Reassigning…" : "Reassign"}
            </Button>
          </div>
        </div>
      </div>

      {from && (
        <>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
            {keyword && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setKeyword("");
                  setKeywordInput("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <DataTableShell
            columnCount={8}
            loading={list.isFetching && rows.length === 0}
            isEmpty={!list.isFetching && rows.length === 0}
            emptyTitle="No leads available for reassignment"
            pagination={{
              page,
              totalPages,
              total,
              pageSize: PAGE_SIZE,
              onPageChange: setPage,
            }}
            header={
              <TableRow className={TABLE_HEADER_ROW_CLASS}>
                <TableHead className={`${TABLE_HEAD_CLASS} w-10`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Lead ID</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Loan Details</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Lead Details</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Journey Type</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
              </TableRow>
            }
          >
            {rows.map((r) => {
              const key = String(r.application_id);
              return (
                <TableRow key={key} className={TABLE_ROW_CLASS}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(key)}
                      onChange={() => toggleRow(r.application_id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{r.code ?? "-"}</TableCell>
                  <TableCell>
                    <div>
                      <b>Loan type:</b>
                      <p className="m-0">{r.loan_type_name ?? "-"}</p>
                      <b>Loan amount:</b>
                      <p className="m-0">{r.loan_amount ?? "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <strong>Application Name:</strong>
                    <p className="m-0">{r.name ?? "-"}</p>
                    <strong>Contact person name:</strong>
                    <p className="m-0">{r.contact_name ?? "-"}</p>
                    <strong>Mobile No:</strong>
                    <p className="m-0">{r.mobile ?? "-"}</p>
                  </TableCell>
                  <TableCell>
                    <strong>Territory Type:</strong>
                    <p className="m-0">{r.territory_type ?? "-"}</p>
                    <strong>Territory name:</strong>
                    <p className="m-0">{r.territory_name ?? "-"}</p>
                  </TableCell>
                  <TableCell>{journeyLabel(r.type)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      style={{ color: statusColor(r.application_status) }}
                    >
                      {r.application_status ?? "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <strong>Created On:</strong>
                    <p className="m-0">{fmtDate(r.createdAt)}</p>
                    <strong>Updated On:</strong>
                    <p className="m-0">{fmtDate(r.updatedAt)}</p>
                  </TableCell>
                </TableRow>
              );
            })}
          </DataTableShell>
        </>
      )}
    </div>
  );
}
