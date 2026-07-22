import { useState } from "react";
import {
  Badge,
  Button,
  Input,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import { CheckSquare, Search } from "lucide-react";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "../../data-table-shell";
import { useChildPartnerApprovalList } from "./child-partner-list.api";
import { AddUserModal } from "../../components/add-user-modal";
import type { ChildPartnerListItem } from "./child-partner-list.types";

const PAGE_SIZE = 10;

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

export function ChildPartnerApprovalPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChildPartnerListItem | null>(null);

  const { data, isFetching, refetch } = useChildPartnerApprovalList({
    page,
    size: PAGE_SIZE,
    excludeRoleCode: "ADMINISTRATOR",
    keyword: searchTerm,
  });

  const rows: ChildPartnerListItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.data?.data)
    ? (data as any).data.data
    : Array.isArray(data)
    ? (data as any)
    : [];
  const total = data?.pagination?.total ?? (data as any)?.data?.pagination?.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Toolbar: search only (no add button for approval queue) */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search pending approvals…"
            className="h-10 rounded-full bg-white pl-9"
          />
        </div>
      </div>

      <DataTableShell
        columnCount={11}
        loading={isFetching && rows.length === 0}
        isEmpty={!isFetching && rows.length === 0}
        emptyTitle="No child partners pending approval"
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
            <TableHead className={TABLE_HEAD_CLASS}>PARENT CHANNEL</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>RM NAME</TableHead>
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
            <TableCell>{r.channel_name ?? "—"}</TableCell>
            <TableCell>{r.employee_name ?? "—"}</TableCell>
            <TableCell className="text-xs text-slate-500">
              {formatDate(r.created_at)}
            </TableCell>
            <TableCell>
              <Badge variant="warning">Waiting for Approval</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => {
                  setSelectedUser(r);
                  setModalOpen(true);
                }}
              >
                <CheckSquare className="h-3.5 w-3.5" /> Approve
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
        approvalMode={true}
        mode="employee"
      />
    </div>
  );
}
