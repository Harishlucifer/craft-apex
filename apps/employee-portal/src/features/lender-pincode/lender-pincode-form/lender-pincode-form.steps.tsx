import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileUp, Trash2 } from "lucide-react";
import { Button, Label, toast } from "@craft-apex/ui";
import {
  registerStepComponent,
  useSaveStepData,
  WorkflowType,
} from "@craft-apex/workflow-runtime";
import {
  useConfigurationMethods,
  useLenderLoanTypes,
  useLenderOptions,
  useTemplateLink,
} from "./lender-pincode-form.api";

// Kept as a bespoke registered step (not FORM_BUILDER) because this screen
// needs three things the generic FormBuilderRenderer doesn't model:
// dependent-dropdown options extracted from a nested detail response
// (loan types come from `lender.lender_loan_type`, filtered + deduped
// client-side, not a flat list endpoint), a template-download side panel
// driven by the selected config method (not a form field), and a real
// multipart `File` upload (the renderer's `file` fieldType embeds a base64
// data URI as a JSON field, which this endpoint doesn't accept).

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const ALLOWED = /\.(csv|xlsx)$/i;
const MAX_BYTES = 2 * 1024 * 1024;

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function LenderPincodeUploadStep() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lenderId, setLenderId] = useState<string>("");
  const [loanTypeId, setLoanTypeId] = useState<string>("");
  const [configMethod, setConfigMethod] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: lenders = [] } = useLenderOptions();
  const { data: loanTypes = [] } = useLenderLoanTypes(lenderId || undefined);
  const { data: configs = [] } = useConfigurationMethods();
  const { data: templateLink } = useTemplateLink(configMethod || undefined);
  const save = useSaveStepData();

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files.item(0);
    if (!f) return;
    if (!ALLOWED.test(f.name)) {
      toast.error("You need to upload only .csv or .xlsx file format.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File size exceeds 2MB limit");
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
    if (!configMethod) errs.config = "ConfigurationMethod is required";
    if (!file) errs.file = "File is Required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      // Real multipart upload — build FormData and hand it to the common save
      // flow as the request body (the api client forwards FormData untouched).
      const fd = new FormData();
      fd.append("lender_id", lenderId);
      fd.append("lender_template_type", configMethod);
      fd.append("loan_type_id", loanTypeId);
      fd.append("template", file!);
      await save.mutateAsync({
        workflowType: WorkflowType.LenderPincodeUpload,
        data: fd,
      });
      toast.success("Pincode uploaded successfully");
      navigate("/settings/lender/pin-code/list");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const templateFileName = (() => {
    if (!templateLink?.link) return "";
    try {
      const url = templateLink.link;
      const last = url.split("/").pop() ?? "";
      return last.split("?")[0];
    } catch {
      return "";
    }
  })();

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Field label="Lender Name" error={errors.lender}>
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

        <Field label="Loan Type" error={errors.loanType}>
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

        <Field label="Configured Method" error={errors.config}>
          <select
            className={selectClass}
            value={configMethod}
            onChange={(e) => setConfigMethod(e.target.value)}
          >
            <option value="">Select Configured Method</option>
            {configs.map((c) => (
              <option key={c.lu_key} value={c.lu_key}>
                {c.lu_name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-center">
        {templateLink?.link ? (
          <>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Please download and follow the file structure of upload pincodes
              (.csv / .xlsx)
            </p>
            <a
              href={templateLink.link}
              download
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              File Structure <Download className="h-4 w-4" />
            </a>
            {templateFileName && (
              <p className="mt-2 text-xs text-slate-400">{templateFileName}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Select Configured Method to get file structure
          </p>
        )}
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
            <span className="text-xs text-slate-400">
              .csv or .xlsx (max 2MB)
            </span>
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

      <div className="flex items-center justify-end border-t border-slate-100 pt-4">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Uploading…" : "Save"}
        </Button>
      </div>
    </form>
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

registerStepComponent("LENDER_PINCODE_UPLOAD", LenderPincodeUploadStep);
