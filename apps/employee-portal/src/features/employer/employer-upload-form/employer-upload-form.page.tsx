import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileUp, Trash2 } from "lucide-react";
import { Button, Label, toast } from "@craft-apex/ui";
import {
  useLenderLoanTypes,
  useLenderOptions,
  useSaveEmployerUpload,
} from "./employer-upload-form.api";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const ALLOWED = /\.(csv|xlsx)$/i;

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export default function EmployerUploadFormPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lenderId, setLenderId] = useState<string>("");
  const [loanTypeId, setLoanTypeId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: lenders = [] } = useLenderOptions();
  const { data: loanTypes = [] } = useLenderLoanTypes(lenderId || undefined);
  const save = useSaveEmployerUpload();

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files.item(0);
    if (!f) return;
    if (!ALLOWED.test(f.name)) {
      toast.error("You need to upload only .csv or .xlsx file format.");
      return;
    }
    setFile(f);
    setErrors((e) => ({ ...e, file: "" }));
    toast.success("File uploaded successfully");
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!lenderId) errs.lender = "Lender is required";
    if (!loanTypeId) errs.loanType = "LoanType is required";
    if (!file) errs.file = "File is Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await save.mutateAsync({
        lender_id: lenderId,
        loan_type: loanTypeId,
        document: file!,
      });
      toast.success("File uploaded successfully!");
      navigate("/settings/employer/upload");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Lender Approval File
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/employer/upload">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Lender Name *" error={errors.lender}>
            <select
              className={selectClass}
              value={lenderId}
              onChange={(e) => {
                setLenderId(e.target.value);
                setLoanTypeId("");
              }}
            >
              <option value="">Select Lender Name</option>
              {lenders.map((l) => (
                <option key={String(l.lender_id)} value={String(l.lender_id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Loan Type *" error={errors.loanType}>
            <select
              className={selectClass}
              value={loanTypeId}
              onChange={(e) => setLoanTypeId(e.target.value)}
              disabled={!lenderId}
            >
              <option value="">
                {lenderId ? "Select Loan Type" : "Pick a lender first"}
              </option>
              {loanTypes.map((l) => (
                <option
                  key={String(l.loan_type_id)}
                  value={String(l.loan_type_id)}
                >
                  {l.loan_type_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-white p-3 shadow-sm">
              <div className="text-sm">
                <div className="font-medium text-slate-800">{file.name}</div>
                <div className="text-xs text-slate-500">
                  {formatBytes(file.size)}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={removeFile}
                className="text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFiles(e.dataTransfer.files);
              }}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:bg-slate-50"
            >
              <FileUp className="h-8 w-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                Drop files here or click to upload.
              </span>
              <span className="text-xs text-slate-400">.csv or .xlsx</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          )}
          {errors.file && (
            <p className="mt-2 text-xs text-rose-500">{errors.file}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <Button asChild type="button" variant="outline">
            <Link to="/settings/employer/upload">Back</Link>
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Uploading…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
