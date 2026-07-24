import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileSpreadsheet } from "lucide-react";
import { ExcelUploadNav } from "../excel-upload-nav";
import { useModule } from "@craft-apex/layout";
import {
  Badge,
  Button,
  Input,
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
import { excelUploadErrorMessage } from "../excel-upload-errors";
import {
  useTemplateList,
  useApproveTemplate,
  useRejectTemplate,
  useSubmitTemplate,
} from "./template-list.api";
import type { TemplateRow, TemplateStatus } from "./template-list.types";

const STATUS_BADGE: Record<TemplateStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  DEPRECATED: "bg-slate-100 text-slate-400",
};

export default function TemplateListPage() {
  const module = useModule();
  const perm = module?.node.allowed_permission ?? {};
  const canAdd = Boolean(perm.add);
  const canEdit = Boolean(perm.edit);

  const { data: templates = [], isFetching } = useTemplateList();
  const submitTemplate = useSubmitTemplate();
  const [search, setSearch] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleSubmit = async (id: string) => {
    try {
      await submitTemplate.mutateAsync(id);
      toast.success("Submitted — sent to a Template Checker for approval.");
    } catch (err) {
      toast.error(
        excelUploadErrorMessage(
          err,
          "Could not submit this template — check that every mandatory field is mapped."
        )
      );
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) =>
      [t.name, t.template_code, t.status].some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }, [templates, search]);

  return (
    <div className="space-y-5">
      <ExcelUploadNav />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Upload Templates
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Masters &bull; Excel Upload &bull; maker-checker on every change
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-64 rounded-full bg-white"
          />
          {canAdd && (
            <Button asChild className="h-10 rounded-full px-5">
              <Link to="/settings/excel-upload/templates/create">
                <Plus className="h-4 w-4" /> New template
              </Link>
            </Button>
          )}
        </div>
      </div>

      <DataTableShell
        columnCount={7}
        loading={isFetching && templates.length === 0}
        isEmpty={!isFetching && filtered.length === 0}
        emptyIcon={<FileSpreadsheet className="h-8 w-8 text-slate-300" />}
        emptyTitle="No upload templates yet"
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Template</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Entity</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Version</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Dedupe key</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Maker</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-end`}>Actions</TableHead>
          </TableRow>
        }
      >
        {filtered.map((t) => (
          <Fragment key={t.id}>
            <TableRow className={TABLE_ROW_CLASS}>
              <TableCell className="font-medium text-slate-900">{t.name}</TableCell>
              <TableCell className="text-slate-500">{t.form_entity_type}</TableCell>
              <TableCell className="font-mono text-xs">v{t.version}</TableCell>
              <TableCell className="font-mono text-xs">{t.dedupe_keys.join(" + ") || "—"}</TableCell>
              <TableCell>
                <Badge className={STATUS_BADGE[t.status]}>{t.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell className="text-slate-500">{t.maker_name ?? "—"}</TableCell>
              <TableCell className="text-end">
                <div className="flex justify-end gap-1.5">
                  {t.status === "PENDING_APPROVAL" && canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReviewingId(reviewingId === t.id ? null : t.id)}
                    >
                      ▼ Review
                    </Button>
                  )}
                  {(t.status === "DRAFT" || t.status === "ACTIVE") && canEdit && (
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/settings/excel-upload/templates/create/${t.id}`}>Edit</Link>
                    </Button>
                  )}
                  {t.status === "DRAFT" && canEdit && (
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(t.id)}
                      disabled={submitTemplate.isPending}
                    >
                      Submit for approval
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
            {reviewingId === t.id && (
              <CheckerPanel
                templateId={t.id}
                onClose={() => setReviewingId(null)}
              />
            )}
          </Fragment>
        ))}
      </DataTableShell>
    </div>
  );
}

// Inline checker panel — no modal, per Fingrid UI standard. A mis-mapped
// template corrupts bulk data (BR-04), so approval is the one gate the
// checker has, since commits themselves have no approval step (BR-13).
function CheckerPanel({
  templateId,
  onClose,
}: {
  templateId: string;
  onClose: () => void;
}) {
  const approve = useApproveTemplate();
  const reject = useRejectTemplate();
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(templateId);
      toast.success("Template approved — now Active for future uploads.");
      onClose();
    } catch (err) {
      toast.error(excelUploadErrorMessage(err, "Could not approve this template."));
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("A comment is required to reject.");
      return;
    }
    try {
      await reject.mutateAsync({ id: templateId, reject_reason: reason });
      toast.success("Rejected — returned to the maker as Draft.");
      onClose();
    } catch (err) {
      toast.error(excelUploadErrorMessage(err, "Could not reject this template."));
    }
  };

  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-slate-50/60 p-5 border-t-2 border-t-amber-400">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Review-only — the mapping cannot be edited here. Approving makes this
            version Active for all future uploads.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleApprove} disabled={approve.isPending}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReject} disabled={reject.isPending}>
              Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
          <Input
            placeholder="Comment (required on reject)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="max-w-md"
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
