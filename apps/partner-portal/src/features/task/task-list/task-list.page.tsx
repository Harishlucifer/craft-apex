import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Badge,
  Button,
  Input,
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
} from "@craft-apex/shared";
import { useTaskList } from "./task-list.api";
import {
  TASK_STATUS_BY_PERMISSION,
  type TaskFilters,
  type TaskListMode,
} from "./task-list.types";

/**
 * Legacy channel-flexi/src/pages/Verification/VerificationList.js (self queue)
 * and VerificationTaskList.js (searchable all-tasks view) — one component,
 * parameterized by `mode`.
 *
 * Deferred: the summary cards, VerificationListFilter side panel (territory
 * tree picker, journey/category selects), task transfer, and the XLSX export.
 * The row action links to /task/verification/:id, a route not yet ported.
 */

const PAGE_SIZE = 10;

const EMPTY_FILTERS: TaskFilters = {};

const fmtDateTime = (v?: string) =>
  v ? new Date(v.replace(" ", "T")).toLocaleString("en-IN") : "—";

export interface TaskListPageProps {
  mode: TaskListMode;
}

export default function TaskListPage({ mode }: TaskListPageProps) {
  const module = useModule();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<TaskFilters>(EMPTY_FILTERS);

  /**
   * VerificationList.js:72-95 — the queue is scoped to the statuses the module
   * grants. `all` means no status filter; otherwise pipe-join the granted codes.
   */
  const status = useMemo(() => {
    const permissions = module?.node.allowed_permission ?? {};
    if (permissions["all"]) return undefined;
    const codes = TASK_STATUS_BY_PERMISSION.filter(
      ([permission]) => permissions[permission],
    ).map(([, code]) => code);
    return codes.length > 0 ? codes.join("|") : undefined;
  }, [module]);

  const { data, isFetching } = useTaskList({
    mode,
    page,
    ...(status ? { status } : {}),
    filters,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-9 w-56 pl-8"
              placeholder="Task no, applicant…"
              value={draft.keyword ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, keyword: e.target.value }))
              }
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Territory</span>
          <Input
            className="h-9 w-44"
            placeholder="Territory id"
            value={draft.territory ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, territory: e.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">From</span>
          <Input
            type="date"
            className="h-9 w-40"
            value={draft.from_date ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, from_date: e.target.value }))
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">To</span>
          <Input
            type="date"
            className="h-9 w-40"
            value={draft.to_date ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, to_date: e.target.value }))
            }
          />
        </label>

        <Button type="submit" size="sm" className="h-9">
          Apply
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9"
          onClick={() => {
            setDraft(EMPTY_FILTERS);
            setFilters(EMPTY_FILTERS);
            setPage(1);
          }}
        >
          Reset
        </Button>
      </form>

      <DataTableShell
        columnCount={9}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle={
          mode === "self" ? "Your task queue is empty" : "No tasks found"
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
            <TableHead className={TABLE_HEAD_CLASS}>Loan No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Task No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Branch Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Applicant Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Initiated Date</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Task Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Task Executor</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Task Approver</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Action</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow
            key={r.verification_id ?? `${r.verification_code ?? ""}-${i}`}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="font-mono text-xs font-medium">
              {r.application_code ?? "—"}
            </TableCell>
            <TableCell className="font-mono text-xs font-medium">
              {r.verification_code ?? "—"}
            </TableCell>
            <TableCell>{r.created_by?.territory_name ?? "—"}</TableCell>
            <TableCell>{r.name ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {fmtDateTime(r.created_by?.created_at)}
            </TableCell>
            <TableCell>
              {r.verification_status ? (
                <Badge variant="secondary">{r.verification_status}</Badge>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              <div>{r.assigned_to?.user_name ?? "—"}</div>
              {r.assigned_to?.territory_name ? (
                <div className="text-[11px] text-slate-400">
                  {r.assigned_to.territory_name}
                </div>
              ) : null}
            </TableCell>
            <TableCell>
              <div>{r.submitted_to?.user_name ?? "—"}</div>
              {r.submitted_to?.territory_name ? (
                <div className="text-[11px] text-slate-400">
                  {r.submitted_to.territory_name}
                </div>
              ) : null}
            </TableCell>
            <TableCell>
              {r.verification_id ? (
                <Link
                  to={`/task/verification/${r.verification_id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </Link>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}
