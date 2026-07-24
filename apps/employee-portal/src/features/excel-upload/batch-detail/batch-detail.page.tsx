import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Badge, Button, Input, toast } from "@craft-apex/ui";
import { api } from "@/lib/api";
import { excelUploadErrorMessage } from "../excel-upload-errors";
import { ExcelUploadNav } from "../excel-upload-nav";
import {
  useBatchDetail,
  useBatchRows,
  useCommitBatch,
  useUndoBatch,
  errorFileUrl,
} from "./batch-detail.api";

const RESULT_PILL: Record<string, string> = {
  VALID: "bg-emerald-50 text-emerald-700",
  ERROR: "bg-rose-50 text-rose-700",
  SKIP_DUPLICATE: "bg-amber-50 text-amber-700",
};

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: batch } = useBatchDetail(id);
  const [resultFilter, setResultFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data: rowsData } = useBatchRows(id, resultFilter, page);
  const commitBatch = useCommitBatch(id ?? "");
  const undoBatch = useUndoBatch(id ?? "");
  const [typedConfirmation, setTypedConfirmation] = useState("");

  if (!batch) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  const requiresConfirm = Boolean(batch.requires_typed_confirmation);
  const confirmMatches = !requiresConfirm || typedConfirmation === String(batch.valid_rows);

  const handleCommit = async () => {
    try {
      await commitBatch.mutateAsync(typedConfirmation);
      toast.success("Commit started.");
    } catch (err) {
      toast.error(excelUploadErrorMessage(err, "Could not start commit."));
    }
  };

  const handleUndo = async () => {
    try {
      await undoBatch.mutateAsync();
      toast.success("Batch undone.");
    } catch (err) {
      toast.error(
        excelUploadErrorMessage(
          err,
          "Could not undo this batch — it may be outside the undo window or have downstream activity."
        )
      );
    }
  };

  const handleDownloadErrorFile = async () => {
    try {
      const blob = await api.get<unknown, Blob>(errorFileUrl(id ?? ""), { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${batch.file_name.replace(/\.[^.]+$/, "")}-errors.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(excelUploadErrorMessage(err, "Could not download the error file."));
    }
  };

  const isValidating = batch.status === "VALIDATING";
  const isCommitting = batch.status === "COMMITTING";
  const isValidated = batch.status === "VALIDATED";
  const isCommitted = batch.status === "COMMITTED";

  return (
    <div className="space-y-5">
      <ExcelUploadNav />
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/settings/excel-upload/batches">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            {batch.file_name} <Badge className="ml-2">{batch.status.replace("_", " ")}</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Batch {id} &bull; Template: {batch.template_name} v{batch.template_version}
          </p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={handleDownloadErrorFile}>
          <Download className="h-3.5 w-3.5" /> Download error file
        </Button>
      </div>

      {(isValidating || isCommitting) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            {isValidating ? "Validating…" : "Committing…"}
          </p>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: batch.total_rows
                  ? `${Math.min(100, ((batch.rows_processed ?? 0) / batch.total_rows) * 100)}%`
                  : "10%",
              }}
            />
          </div>
          <p className="text-xs text-slate-500">Runs in the background — safe to navigate away.</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <CountCard label="Total rows" value={batch.total_rows} />
        <CountCard label="Valid" value={batch.valid_rows} accent="text-emerald-600" />
        <CountCard label="Errors" value={batch.error_rows} accent="text-rose-600" />
        <CountCard label="Skipped" value={batch.skip_rows} accent="text-amber-600" />
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "VALID", "ERROR", "SKIP_DUPLICATE"].map((r) => (
          <button
            key={r}
            onClick={() => {
              setResultFilter(r);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              resultFilter === r
                ? "border-[#4C7DF0] bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {r === "" ? "All" : r.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Row</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Data</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Result</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-slate-600">Reason</th>
            </tr>
          </thead>
          <tbody>
            {(rowsData?.rows ?? []).map((r) => (
              <tr key={r.row_number} className="border-t border-slate-100">
                <td className="px-4 py-2 font-mono text-xs">{r.row_number}</td>
                <td className="px-4 py-2 text-xs text-slate-600 max-w-md truncate">
                  {Object.values(r.raw_data ?? {}).join(" · ")}
                </td>
                <td className="px-4 py-2">
                  <Badge className={RESULT_PILL[r.result]}>{r.result.replace("_", " ")}</Badge>
                </td>
                <td className="px-4 py-2 text-xs text-slate-500">
                  {r.field_errors?.map((fe) => `${fe.field}: ${fe.reason}`).join("; ") ??
                    (r.dedupe_match_type === "INTRA_FILE"
                      ? `Matches row ${r.dedupe_match_row_number} in this file`
                      : r.dedupe_match_type
                      ? "Matches an existing partner"
                      : "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isValidated && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 border-t-4 border-t-blue-500">
          <h2 className="text-sm font-semibold text-slate-700">Commit preview — read before you commit</h2>
          <p className="text-xs text-slate-500">
            Will create <b>{batch.valid_rows}</b> new partners (valid rows only). {batch.skip_rows} rows
            skipped as duplicates. {batch.error_rows} rows will never import — fix via the error file and
            re-upload as a new batch.
          </p>
          {requiresConfirm && (
            <div className="space-y-1.5">
              <p className="text-xs text-amber-600">
                This batch exceeds {batch.typed_confirmation_threshold} rows — type the number of partners
                to be created to confirm. There is no approval step after this.
              </p>
              <Input
                placeholder={`type ${batch.valid_rows}`}
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                className="max-w-xs"
              />
            </div>
          )}
          <Button disabled={!confirmMatches || commitBatch.isPending} onClick={handleCommit}>
            Commit {batch.valid_rows} partners
          </Button>
        </div>
      )}

      {isCommitted && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 border-t-4 border-t-rose-500">
          <h2 className="text-sm font-semibold text-slate-700">Undo this batch</h2>
          <p className="text-xs text-slate-500">
            Bulk-reverses every record this batch created — blocked if any already has downstream
            activity. All-or-nothing, no partial undo.
          </p>
          <Button variant="destructive" onClick={handleUndo} disabled={undoBatch.isPending}>
            Undo batch
          </Button>
        </div>
      )}
    </div>
  );
}

function CountCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold font-mono ${accent ?? "text-slate-900"}`}>{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
