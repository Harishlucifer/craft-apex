import { useState } from "react";
import { useAuthStore } from "@craft-apex/auth";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { Pencil, Plus, Search } from "lucide-react";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "../../data-table-shell";
import { useChildPartnerList } from "./child-partner-list.api";
import { AddUserModal } from "../../components/add-user-modal";
import type { ChildPartnerListItem } from "./child-partner-list.types";

const PAGE_SIZE = 10;

function statusBadge(s: number) {
  if (s === 1) return <Badge variant="success">Active</Badge>;
  if (s === 2) return <Badge variant="warning">Waiting for Approval</Badge>;
  return <Badge variant="destructive">Inactive</Badge>;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export interface ChildPartnerListPageProps {
  /**
   * "employee" (default) — shows all partners, scoped by RM for non-admins,
   *                         displays Channel/RM fields in the add/edit modal.
   * "partner"             — scopes list to the logged-in partner's channel_id,
   *                         hides Channel/RM fields in the modal.
   */
  mode?: "employee" | "partner";
}

export function ChildPartnerListPage({ mode = "employee" }: ChildPartnerListPageProps) {
  const user = useAuthStore((s) => s.user);
  const isPartnerMode = mode === "partner";

  const employeeId = user?.employee_id as string | undefined;
  const isAdmin = user?.user_role_code === "ADMINISTRATOR";
  const partnerChannelId = String(user?.channel_id ?? "");

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChildPartnerListItem | null>(null);

  const { data, isFetching, refetch } = useChildPartnerList({
    page,
    size: PAGE_SIZE,
    excludeRoleCode: "ADMINISTRATOR",
    keyword: searchTerm,
    ...(isPartnerMode
      ? { channel_id: partnerChannelId }
      : { rm_id: !isAdmin && employeeId ? String(employeeId) : undefined }),
  });

  const rows = data?.data?.data ?? [];
  const total = data?.data?.pagination?.total ?? data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAdd = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (row: ChildPartnerListItem) => {
    setSelectedUser(row);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: search + add button inline */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, mobile, code…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <DataTableShell
        columnCount={isPartnerMode ? 9 : 11}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No child partners found"
        pagination={{
          page,
          totalPages,
          total,
          pageSize: PAGE_SIZE,
          onPageChange: setPage,
        }}
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>S.NO</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>CODE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>NAME</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>EMAIL</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>MOBILE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>ROLE</TableHead>
            {!isPartnerMode && (
              <TableHead className={TABLE_HEAD_CLASS}>PARENT CHANNEL</TableHead>
            )}
            {!isPartnerMode && (
              <TableHead className={TABLE_HEAD_CLASS}>RM NAME</TableHead>
            )}
            <TableHead className={TABLE_HEAD_CLASS}>CREATED DATE</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>STATUS</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>ACTION</TableHead>
          </TableRow>
        }
      >
        {rows.map((r, i) => (
          <TableRow key={r.channel_user_id} className={TABLE_ROW_CLASS}>
            <TableCell className="font-medium">
              {(page - 1) * PAGE_SIZE + i + 1}
            </TableCell>
            <TableCell className="font-semibold text-slate-700">
              {r.code ?? "—"}
            </TableCell>
            <TableCell>{r.name ?? "—"}</TableCell>
            <TableCell>{r.email ?? "—"}</TableCell>
            <TableCell>{r.mobile ?? "—"}</TableCell>
            <TableCell>{r.role_name ?? "—"}</TableCell>
            {!isPartnerMode && <TableCell>{r.channel_name ?? "—"}</TableCell>}
            {!isPartnerMode && <TableCell>{r.employee_name ?? "—"}</TableCell>}
            <TableCell className="text-xs text-slate-500">
              {formatDate(r.created_at)}
            </TableCell>
            <TableCell>{statusBadge(r.status)}</TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => handleEdit(r)}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <AddUserModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        editData={selectedUser}
        onSuccess={() => refetch()}
        mode={mode}
        partnerChannelId={isPartnerMode ? partnerChannelId : undefined}
      />
    </div>
  );
}
