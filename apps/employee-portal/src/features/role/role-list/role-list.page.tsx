import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useModule } from "@craft-apex/layout";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useRoleList } from "./role-list.api";
import type { Role } from "./role-list.types";

const NAVY = "#1E2A6B";
const BLUE = "#4C7DF0";

export default function RoleListPage() {
  const module = useModule();
  const perm = module?.node.allowed_permission ?? {};
  const canAdd = Boolean(perm.add);
  const canView = Boolean(perm.view);
  const canEdit = Boolean(perm.edit);

  const { data: roles = [], isFetching } = useRoleList();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) =>
      [r.name, r.code, r.userType, r.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [roles, search]);

  // Client-side pagination — the legacy endpoint returns the full array.
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const activeCount = roles.filter((r) => r.status === 1).length;
  const showAction = canView && canEdit;
  const columnCount = showAction ? 7 : 6;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Total roles"
          value={String(roles.length)}
        />
        <SummaryCard
          icon={<Users className="h-4 w-4" />}
          label="Active"
          value={String(activeCount)}
          accent="#10B981"
        />
        <SummaryCard
          icon={<Users className="h-4 w-4" />}
          label="Inactive"
          value={String(roles.length - activeCount)}
          accent="#EF4444"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, code, user type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        {canAdd && (
          <Button
            asChild
            className="h-10 rounded-full px-5 text-white shadow-sm hover:opacity-95"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}
          >
            <Link to="/settings/role/create">
              <Plus className="h-4 w-4" /> Add Role
            </Link>
          </Button>
        )}
      </div>

      <DataTableShell
        columnCount={columnCount}
        loading={isFetching && roles.length === 0}
        isEmpty={!isFetching && filtered.length === 0}
        emptyIcon={<ShieldCheck className="h-8 w-8 text-slate-300" />}
        emptyTitle="No roles found"
        emptyDescription="Try a different search or add a new role."
        pagination={{
          page,
          totalPages,
          total,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Role ID</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>User Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Code</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Description</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            {showAction && (
              <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
                Action
              </TableHead>
            )}
          </TableRow>
        }
      >
        {paged.map((r: Role) => (
          <TableRow key={String(r.id)} className={TABLE_ROW_CLASS}>
            <TableCell className="font-mono text-xs text-slate-500">
              {String(r.id)}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium">
                {r.userType ?? "—"}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs text-slate-600">
              {r.code ?? "—"}
            </TableCell>
            <TableCell className="font-medium text-slate-900">
              {r.name ?? "—"}
            </TableCell>
            <TableCell
              className="max-w-[280px] truncate text-slate-500"
              title={r.description ?? ""}
            >
              {r.description ?? "—"}
            </TableCell>
            <TableCell>
              <StatusPill active={r.status === 1} />
            </TableCell>
            {showAction && (
              <TableCell className="text-right">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Link
                    to={`/settings/role/create/${String(r.id)}#${r.userType ?? ""}`}
                    title="View & edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </DataTableShell>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent = NAVY,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
          : "inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700"
      }
    >
      <span
        className={
          active
            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
            : "h-1.5 w-1.5 rounded-full bg-rose-500"
        }
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
