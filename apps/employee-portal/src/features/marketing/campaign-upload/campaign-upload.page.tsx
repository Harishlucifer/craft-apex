import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Inbox,
  FileText,
  ExternalLink,
  Clock,
  UserRound,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useModule } from "@craft-apex/layout";
import {
  Badge,
  Button,
  Input,
  Label,
  toast,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@craft-apex/ui";
import { DataTableShell } from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import { useCampaignList } from "@/features/marketing/campaign-list/campaign-list.api";
import { useCampaignUploads, useUploadCampaign } from "./campaign-upload.api";
import type { CampaignUploadRow } from "./campaign-upload.types";

const STATUS_STYLE: Record<string, string> = {
  QUEUED: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
};

/** Descending compare of big numeric id strings (snowflake ids exceed 2^53). */
function cmpIdDesc(a?: string, b?: string): number {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  if (sa.length !== sb.length) return sb.length - sa.length;
  return sb.localeCompare(sa);
}

function formatDateTime(s?: string): string {
  if (!s) return "—";
  const d = new Date(s.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CampaignUploadPage() {
  const module = useModule();
  const location = useLocation();
  const isCollection =
    (module?.node.url ?? "").toLowerCase().includes("collection") ||
    location.pathname.toLowerCase().includes("collection");
  const attribution = isCollection ? "COLLECTION" : "APPLICATION|PARTNER";

  const { data: rows = [], isLoading } = useCampaignUploads(attribution);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Most recent first: by uploaded_at, falling back to the (time-ordered) id.
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = a.uploaded_at ? Date.parse(a.uploaded_at.replace(" ", "T")) : 0;
      const tb = b.uploaded_at ? Date.parse(b.uploaded_at.replace(" ", "T")) : 0;
      if (tb !== ta) return tb - ta;
      return cmpIdDesc(a.upload_id, b.upload_id);
    });
  }, [rows]);

  const filterFn = useMemo(
    () => (row: CampaignUploadRow, q: string) =>
      String(row.campaign_id ?? "").toLowerCase().includes(q) ||
      (row.uploaded_by ?? "").toLowerCase().includes(q) ||
      (row.status ?? "").toLowerCase().includes(q),
    []
  );
  const list = useClientList(sorted, filterFn);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campaign Upload
          </h1>
          <p className="text-sm text-slate-500">
            {list.total} {list.total === 1 ? "upload" : "uploads"}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Upload Campaign
        </Button>
      </div>

      <Input
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
        placeholder="Search by campaign ID, uploaded by, status…"
        className="max-w-xs"
      />

      <DataTableShell
        loading={isLoading}
        isEmpty={!isLoading && list.total === 0}
        emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
        emptyTitle="No uploads yet"
        emptyDescription="Uploaded campaign files will appear here."
        columnCount={6}
        skeletonRows={6}
        header={
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Data Source</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Uploaded At</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        }
        pagination={{
          page: list.page,
          totalPages: list.totalPages,
          total: list.total,
          pageSize: list.pageSize,
          onPageChange: list.setPage,
          onPageSizeChange: list.setPageSize,
        }}
      >
        {list.paged.map((row, i) => (
          <TableRow key={String(row.upload_id ?? `${row.campaign_id}-${i}`)}>
            <TableCell className="font-mono text-xs text-slate-700">
              {row.campaign_id ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-[10px] uppercase">
                {row.data_source ?? "—"}
              </Badge>
            </TableCell>
            <TableCell>
              {row.uploaded_file ? (
                <a
                  href={row.uploaded_file}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" /> View file
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-slate-400">—</span>
              )}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                <UserRound className="h-3.5 w-3.5 text-slate-400" />
                {row.uploaded_by || "—"}
              </span>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {formatDateTime(row.uploaded_at)}
              </span>
            </TableCell>
            <TableCell>
              <Badge
                className={`text-[10px] uppercase tracking-wide ${
                  STATUS_STYLE[row.status ?? ""] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {(row.status ?? "—").replace(/_/g, " ")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        attribution={attribution}
      />
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  attribution,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  attribution: string;
}) {
  const { data: campaigns = [] } = useCampaignList(attribution);
  const uploadCampaigns = useMemo(
    () => campaigns.filter((c) => (c.data_source ?? "").toUpperCase() === "UPLOAD"),
    [campaigns]
  );
  const upload = useUploadCampaign();

  const [campaignId, setCampaignId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const reset = () => {
    setCampaignId("");
    setFile(null);
  };

  const onSubmit = async () => {
    if (!campaignId) {
      toast.error("Please select a campaign.");
      return;
    }
    if (!file) {
      toast.error("Please choose a file to upload.");
      return;
    }
    try {
      await upload.mutateAsync({ campaignId, file });
      toast.success("File uploaded. Processing queued.");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#2563EB]" /> Upload Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="upload-campaign">Campaign</Label>
            <select
              id="upload-campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            >
              <option value="">Select a campaign…</option>
              {uploadCampaigns.map((c) => (
                <option key={String(c.campaign_id)} value={String(c.campaign_id)}>
                  {c.name ?? `#${c.campaign_id}`}
                </option>
              ))}
            </select>
            {uploadCampaigns.length === 0 && (
              <p className="text-xs text-amber-600">
                No upload-type campaigns found.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-file">File</Label>
            <Input
              id="upload-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-400">CSV or Excel file.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={upload.isPending}>
            {upload.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" /> Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
