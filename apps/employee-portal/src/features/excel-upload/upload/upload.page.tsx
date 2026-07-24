import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { Button, Label, toast, cn } from "@craft-apex/ui";
import { excelUploadErrorMessage } from "../excel-upload-errors";
import { ExcelUploadNav } from "../excel-upload-nav";
import { useActiveTemplates, useUploadBatch } from "./upload.api";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function ExcelUploadPage() {
  const navigate = useNavigate();
  const { data: templates = [], isLoading: templatesLoading } = useActiveTemplates();
  const uploadBatch = useUploadBatch();

  const [templateId, setTemplateId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error("Only .csv or .xlsx files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds the 10 MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!templateId) {
      toast.error("Choose a template first.");
      return;
    }
    if (!selectedFile) {
      toast.error("Choose a file to upload.");
      return;
    }
    try {
      const batchUuid = crypto.randomUUID();
      const result = await uploadBatch.mutateAsync({ templateId, file: selectedFile, batchUuid });
      toast.success("Uploaded — validation is running.");
      navigate(`/settings/excel-upload/batches/${result.id}`);
    } catch (err) {
      toast.error(
        excelUploadErrorMessage(
          err,
          "Upload failed. Check the file gates (type, size, row cap) and try again."
        )
      );
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <ExcelUploadNav />
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Upload File</h1>
        <p className="text-xs font-medium text-slate-500">
          Excel Uploads &bull; pick a template, then drop your file
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <Label>
            Upload template <span className="text-rose-500">*</span>
          </Label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={templatesLoading}
            className={selectClass}
          >
            <option value="">Choose a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — v{t.version} (Active)
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            Only Active templates are selectable — Draft, Pending Approval and Deprecated
            templates reject uploads.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>File</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) validateAndSetFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
              isDragOver
                ? "border-blue-500 bg-blue-50/30"
                : selectedFile
                ? "border-emerald-500 bg-emerald-50/5"
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-50/80"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateAndSetFile(file);
                e.target.value = "";
              }}
              accept=".csv,.xlsx"
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-slate-400">.xlsx, .csv (first sheet only) — max 10 MB, 50,000 rows</p>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="text-rose-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            disabled={uploadBatch.isPending || !selectedFile || !templateId}
            onClick={handleSubmit}
          >
            {uploadBatch.isPending ? "Uploading…" : "Upload & validate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
