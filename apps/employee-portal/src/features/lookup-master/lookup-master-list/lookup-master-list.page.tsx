import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@craft-apex/ui";
import {
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useLookupGroups } from "./lookup-master-list.api";
import type { LookupGroup, LookupItem } from "./lookup-master-list.types";

const PAGE_SIZE = 10;

export default function LookupMasterListPage() {
  const { data: groups = [], isFetching } = useLookupGroups();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    // Legacy LookupList.js matches at the group level only — a matching
    // group keeps its full, unfiltered values array. Filtering the values
    // array itself (as this used to) hides a group's existing items
    // whenever it only matched by group code, making a successful add look
    // like it wiped out everything else in that group.
    return groups.filter(
      (g) =>
        g.groupCode.toLowerCase().includes(q) ||
        g.values.some((v) =>
          [v.lu_key, v.lu_name, v.lu_value]
            .filter(Boolean)
            .some((s) => String(s).toLowerCase().includes(q))
        )
    );
  }, [groups, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search group or item…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button asChild>
          <Link to="/settings/lookup-master/create">
            <Plus className="h-4 w-4" /> Add Lookup
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isFetching && groups.length === 0 ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No lookup groups found.
          </div>
        ) : (
          paged.map((g) => (
            <GroupSection
              key={g.groupCode}
              group={g}
              open={openGroup === g.groupCode}
              onToggle={() =>
                setOpenGroup((cur) =>
                  cur === g.groupCode ? null : g.groupCode
                )
              }
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {total === 0
            ? "0 groups"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                page * PAGE_SIZE,
                total
              )} of ${total} groups`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-xs">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function GroupSection({
  group,
  open,
  onToggle,
}: {
  group: LookupGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="flex w-full items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
          <span className="font-mono text-sm font-semibold uppercase tracking-wider text-slate-800">
            {group.groupCode}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{group.values.length} items</Badge>
          <Button asChild type="button" size="sm" variant="ghost">
            <Link
              to={`/settings/lookup-master/create?group_code=${encodeURIComponent(group.groupCode)}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Link>
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/40">
          <Table>
            <TableHeader>
              <TableRow className={TABLE_HEADER_ROW_CLASS}>
                <TableHead className={TABLE_HEAD_CLASS}>Key</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Name</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Value</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Created By</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
                <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.values.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-16 text-center text-xs text-slate-400"
                  >
                    No items in this group.
                  </TableCell>
                </TableRow>
              ) : (
                group.values.map((v: LookupItem, i) => (
                  <TableRow
                    key={`${v.id ?? v.lu_key ?? ""}-${i}`}
                    className={TABLE_ROW_CLASS}
                  >
                    <TableCell className="font-mono text-xs">
                      {v.lu_key ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {v.lu_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {v.lu_value ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {v.created_by ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={v.status === 1 ? "success" : "destructive"}
                      >
                        {v.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {v.created_by === "SYSTEM" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                          disabled
                          title="System lookups can't be edited"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      ) : (
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                        >
                          <Link
                            to={`/settings/lookup-master/create/${String(v.id ?? "")}`}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
