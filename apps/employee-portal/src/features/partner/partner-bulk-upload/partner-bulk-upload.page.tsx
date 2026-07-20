import { useState, useRef } from "react";
import Select from "react-select";
import {
  Download,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  TableCell,
  TableHead,
  TableRow,
  toast,
  cn,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useClientList } from "@/components/use-client-list";
import {
  useJourneyTypes,
  useUploadTemplateLink,
  useBulkUploadList,
  useUploadPartnerFile,
  type BulkUploadRow,
} from "./partner-bulk-upload.api";

export default function PartnerBulkUploadPage() {
  const { data: journeyTypes = [], isLoading: journeyLoading } = useJourneyTypes();
  const { data: templateLink } = useUploadTemplateLink();
  const { data: uploadHistory = [], isLoading: historyLoading } = useBulkUploadList();
  const uploadMutation = useUploadPartnerFile();

  // ── Form State
  const [selectedJourney, setSelectedJourney] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Table Search & Pagination State using useClientList
  const list = useClientList<BulkUploadRow>(uploadHistory, (r, q) =>
    [String(r.id), String(r.file_name), String(r.status_string ?? "")].some((v) =>
      v.toLowerCase().includes(q)
    )
  );

  // ── Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]!);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]!);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedExtensions = /\.(csv|xlsx)$/i;
    if (!allowedExtensions.test(file.name)) {
      toast.error("Invalid file format. Please upload only .csv or .xlsx files.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds the 2MB limit.");
      return;
    }
    setSelectedFile(file);
    toast.success("File uploaded successfully.");
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit File
  const handleSubmit = async () => {
    if (!selectedJourney) {
      toast.error("Please select a Journey Type.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const res = await uploadMutation.mutateAsync({
        file: selectedFile,
        journeyType: selectedJourney,
      });

      if (res?.status === true || res?.status === 1) {
        toast.success(res?.message || "File uploaded successfully!");
        removeFile();
        setSelectedJourney("");
      } else {
        toast.error(res?.message || "File upload failed.");
      }
    } catch {
      toast.error("Something went wrong during file upload.");
    }
  };



  const getStatusBadge = (status?: string) => {
    const label = status || "In Progress";
    switch (label.toUpperCase()) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Success
          </span>
        );
      case "REJECTED":
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            In Progress
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Bulk Upload</h1>
        <p className="text-xs font-medium text-slate-500">
          Partner Management &bull; Bulk Upload
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Steps Card */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm h-full flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Steps to Bulk Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm text-slate-600">
              <p>
                <strong className="text-slate-800">Step 1:</strong> Download the Excel Format File.
              </p>
              <p>
                <strong className="text-slate-800">Step 2:</strong> Fill in the partner onboarding details in the downloaded Excel template.
              </p>
              <p>
                <strong className="text-slate-800">Step 3:</strong> Choose the Journey Type, drop your file in the upload zone, and submit.
              </p>
            </CardContent>
          </div>
          <div className="p-5 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl flex justify-center">
            {templateLink ? (
              <a
                href={templateLink}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
              >
                <Download className="h-4 w-4" /> Download Format
              </a>
            ) : (
              <Button disabled variant="outline" className="w-full">
                Template Loading...
              </Button>
            )}
          </div>
        </Card>

        {/* Upload Form Card */}
        <Card className="md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 space-y-5">
            {/* Journey Type Select */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Journey Type <span className="text-rose-500">*</span>
              </Label>
              {journeyLoading ? (
                <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                <Select
                  isSearchable
                  isClearable
                  options={journeyTypes.map((t) => ({ value: t.code, label: t.name }))}
                  value={
                    journeyTypes
                      .map((t) => ({ value: t.code, label: t.name }))
                      .find((o) => o.value === selectedJourney) ?? null
                  }
                  onChange={(val) => setSelectedJourney(val ? val.value : "")}
                  placeholder="Select Journey Type..."
                  classNamePrefix="rs"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: "40px",
                      borderColor: state.isFocused ? "#1E2A6B" : "#e2e8f0",
                      boxShadow: state.isFocused ? "0 0 0 2px rgba(30,42,107,0.15)" : "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#1E2A6B"
                        : state.isFocused
                          ? "#EEF2FF"
                          : "white",
                      color: state.isSelected ? "white" : "#1e293b",
                      fontSize: "14px",
                    }),
                  }}
                />
              )}
            </div>

            {/* Drag & Drop File Zone */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Upload File</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
                  isDragOver
                    ? "border-blue-500 bg-blue-50/30"
                    : selectedFile
                    ? "border-emerald-500 bg-emerald-50/5"
                    : "border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 hover:border-slate-300"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv, .xlsx"
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-slate-400">
                    Supported format: .csv, .xlsx (Max size: 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                disabled={uploadMutation.isPending || !selectedFile || !selectedJourney}
                onClick={handleSubmit}
                className="bg-[#1E2A6B] hover:bg-[#16255C] text-white px-6 h-10 font-medium"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={list.search}
              onChange={(e) => list.setSearch(e.target.value)}
              placeholder="Search upload history..."
              className="h-10 rounded-full bg-white pl-9 border-slate-200"
            />
          </div>
        </div>

        <DataTableShell
          columnCount={5}
          loading={historyLoading && uploadHistory.length === 0}
          isEmpty={!historyLoading && list.total === 0}
          emptyTitle="No bulk upload history records found."
          pagination={{
            page: list.page,
            totalPages: list.totalPages,
            total: list.total,
            pageSize: list.pageSize,
            onPageChange: list.setPage,
            onPageSizeChange: list.setPageSize,
          }}
          header={
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead className={TABLE_HEAD_CLASS}>S.No</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>File Number</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>File Name</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Date</TableHead>
            </TableRow>
          }
        >
          {list.paged.map((r, i) => (
            <TableRow
              key={`${String(r.id)}-${i}`}
              className={TABLE_ROW_CLASS}
            >
              <TableCell className="font-medium">
                {(list.page - 1) * list.pageSize + i + 1}
              </TableCell>
              <TableCell className="font-semibold text-slate-700">
                #{r.id}
              </TableCell>
              <TableCell className="font-medium text-slate-700 max-w-xs truncate">
                {r.file_name}
              </TableCell>
              <TableCell>
                {getStatusBadge(r.status_string)}
              </TableCell>
              <TableCell className="text-slate-500 text-xs">
                {formatDate(r.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </DataTableShell>
      </div>
    </div>
  );
}
