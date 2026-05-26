import { useMemo, useRef, useState } from "react";
import { FileUp, Plus, Trash2, X } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Label,
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
import { useClientList } from "@/components/use-client-list";
import {
  useLenderLoanTypes,
  useLenderOptions,
  usePayoutDumpList,
  useUploadPayoutDump,
} from "./lender-payout-upload.api";
import type {
  PayoutDumpFilter,
  PayoutDumpRow,
} from "./lender-payout-upload.types";

// Legacy /pages/PayableReceivableMgmt/Lender/UploadPayoutPlan.js
//   - LenderPayoutFilter (lender / loan-type / month) -> refetches list
//   - DumpUploadModal -> PayoutDumpUpload (multipart upload)
//   - TableContainer with the columns mirrored verbatim below.
//
// DEFERRED: the legacy "View" action navigates to
// /finance/payout-reconciliation-view/:id (PayoutReconciliationView.js) — a
// complex reconciliation flow that is out of scope for this port and
// already tracked separately. We render the View button as disabled with a
// TODO comment so the action surface is preserved but no broken nav fires.

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

const ALLOWED_FILE = /\.(csv|xlsx)$/i;
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

function fmtDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

const todayMonth = () => new Date().toISOString().slice(0, 7);

export default function LenderPayoutUploadPage() {
  // ---- Filter (LenderPayoutFilter.js) -------------------------------------
  const [filterLender, setFilterLender] = useState<string>("");
  const [filterLoanType, setFilterLoanType] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<PayoutDumpFilter>({});

  // ---- Upload modal state (PayoutDumpUpload.js) ---------------------------
  const [showModal, setShowModal] = useState(false);
  const [uLender, setULender] = useState("");
  const [uLoanType, setULoanType] = useState("");
  const [uMonth, setUMonth] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Data ---------------------------------------------------------------
  const { data: lenders = [] } = useLenderOptions();
  const { data: filterLoanTypes = [] } = useLenderLoanTypes(
    filterLender || undefined
  );
  const { data: uploadLoanTypes = [] } = useLenderLoanTypes(
    uLender || undefined
  );
  const { data: dumpRows = [], isFetching } = usePayoutDumpList(appliedFilter);
  const upload = useUploadPayoutDump();

  const list = useClientList<PayoutDumpRow>(dumpRows, (r, q) =>
    [r.lender_name, r.loan_type, r.file_name, r.month].some((v) =>
      String(v ?? "").toLowerCase().includes(q)
    )
  );

  const maxMonth = useMemo(() => todayMonth(), []);

  // ---- Filter handlers ----------------------------------------------------
  const onApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterLender) {
      toast.error("Lender Name is required");
      return;
    }
    setAppliedFilter({
      lender_id: filterLender,
      loan_type_id: filterLoanType,
      month: filterMonth,
    });
  };

  const onResetFilter = () => {
    setFilterLender("");
    setFilterLoanType("");
    setFilterMonth("");
    setAppliedFilter({});
  };

  // ---- Upload modal handlers ---------------------------------------------
  const openModal = () => {
    setULender("");
    setULoanType("");
    setUMonth("");
    setFile(null);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files.item(0);
    if (!f) return;
    if (!ALLOWED_FILE.test(f.name)) {
      toast.error("You need to upload only .csv, .xlsx file format.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File size exceeds 2MB limit");
      return;
    }
    setFile(f);
    setErrors((e) => ({ ...e, file: "" }));
    toast.success("File Uploaded successfully");
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!uLender) errs.lender = "Lender Name is required";
    if (!uLoanType) errs.loanType = "Loan Type is required";
    if (!file) errs.file = "Payout Dump file is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      await upload.mutateAsync({
        lender_id: uLender,
        loan_type_id: uLoanType,
        month: uMonth,
        template: file!,
      });
      toast.success("File uploaded successfully!");
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Payout Upload
        </h1>
        <p className="text-sm text-slate-500">Receivable Management</p>
      </div>

      {/* Filter card — mirrors LenderPayoutFilter.js (filterBtnStatus=true) */}
      <form
        onSubmit={onApplyFilter}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Label className="text-xs font-medium text-slate-600">
              Lender Name *
            </Label>
            <select
              className={selectClass}
              value={filterLender}
              onChange={(e) => {
                setFilterLender(e.target.value);
                setFilterLoanType("");
              }}
            >
              <option value="">Select Lender Name</option>
              {lenders.map((l) => (
                <option key={String(l.lender_id)} value={String(l.lender_id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs font-medium text-slate-600">
              Loan Type
            </Label>
            <select
              className={selectClass}
              value={filterLoanType}
              onChange={(e) => setFilterLoanType(e.target.value)}
              disabled={!filterLender}
            >
              <option value="">
                {filterLender ? "Select LoanType" : "Pick a lender first"}
              </option>
              {filterLoanTypes.map((l) => (
                <option
                  key={String(l.loan_type_id)}
                  value={String(l.loan_type_id)}
                >
                  {l.loan_type_name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs font-medium text-slate-600">Month</Label>
            <Input
              type="month"
              max={maxMonth}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-1">
            <Button type="submit" size="sm" className="w-full">
              Filter
            </Button>
          </div>
        </div>
        {(filterLender || filterLoanType || filterMonth) && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onResetFilter}
            >
              Clear
            </Button>
          </div>
        )}
      </form>

      {/* Header row with upload trigger (DumpUploadModal.js button) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Payout Dump List
        </h2>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4" /> Upload Payout Dump
        </Button>
      </div>

      {/* Search + table */}
      <div className="flex max-w-md items-center gap-2">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <DataTableShell
        columnCount={9}
        loading={isFetching && dumpRows.length === 0}
        isEmpty={!isFetching && list.total === 0}
        emptyTitle="No payout dump records"
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
            <TableHead className={TABLE_HEAD_CLASS}>No</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lender Name</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>FileName</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Month</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Created On</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Invoice Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Action</TableHead>
          </TableRow>
        }
      >
        {list.paged.map((r, i) => (
          <TableRow
            key={String(r.id ?? `${r.file_name ?? "row"}-${i}`)}
            className={TABLE_ROW_CLASS}
          >
            <TableCell className="text-xs text-slate-500">
              {(list.page - 1) * list.pageSize + i + 1}
            </TableCell>
            <TableCell>{r.lender_name ?? "-"}</TableCell>
            <TableCell>{r.loan_type ?? "-"}</TableCell>
            <TableCell className="font-mono text-xs">
              {r.file_name ?? "-"}
            </TableCell>
            <TableCell>{r.month ?? "-"}</TableCell>
            <TableCell>{fmtDate(r.created_at)}</TableCell>
            <TableCell>
              <Badge
                className={
                  r.invoice_status === 1
                    ? "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                    : "bg-rose-100 text-[10px] uppercase tracking-wide text-rose-700"
                }
              >
                {r.invoice_status === 1 ? "Active" : "In-Active"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={
                  r.status === 1
                    ? "bg-emerald-100 text-[10px] uppercase tracking-wide text-emerald-700"
                    : "bg-rose-100 text-[10px] uppercase tracking-wide text-rose-700"
                }
              >
                {r.status === 1 ? "Active" : "In-Active"}
              </Badge>
            </TableCell>
            <TableCell>
              {/* TODO(deferred): wire to /finance/payout-reconciliation-view/:id
                  once that page is ported (legacy PayoutReconciliationView.js). */}
              <ViewActionButton id={r.id} />
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      {/* Upload modal — mirrors PayoutDumpUpload.js */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Upload Payout Dump
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={onSubmitUpload} className="mt-4 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Lender Name *" error={errors.lender}>
                  <select
                    className={selectClass}
                    value={uLender}
                    onChange={(e) => {
                      setULender(e.target.value);
                      setULoanType("");
                    }}
                  >
                    <option value="">Select Lender Name</option>
                    {lenders.map((l) => (
                      <option
                        key={String(l.lender_id)}
                        value={String(l.lender_id)}
                      >
                        {l.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Loan Type *" error={errors.loanType}>
                  <select
                    className={selectClass}
                    value={uLoanType}
                    onChange={(e) => setULoanType(e.target.value)}
                    disabled={!uLender}
                  >
                    <option value="">
                      {uLender ? "Select LoanType" : "Pick a lender first"}
                    </option>
                    {uploadLoanTypes.map((l) => (
                      <option
                        key={String(l.loan_type_id)}
                        value={String(l.loan_type_id)}
                      >
                        {l.loan_type_name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Month">
                  <Input
                    type="month"
                    max={maxMonth}
                    value={uMonth}
                    onChange={(e) => setUMonth(e.target.value)}
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-5">
                <Label className="mb-2 block text-xs font-medium text-slate-600">
                  Upload Payout Dump File *
                </Label>
                {file ? (
                  <div className="flex items-center justify-between gap-3 rounded-md bg-white p-3 shadow-sm">
                    <div className="text-sm">
                      <div className="font-medium text-slate-800">
                        {file.name}
                      </div>
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
                      Drop Payout Dump files here or click to upload.
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

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="text-rose-600"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={upload.isPending}>
                  {upload.isPending ? "Uploading…" : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Lightweight wrapper so we don't pull react-router-dom navigate into the
// row map. Legacy navigates to `/finance/payout-reconciliation-view/${id}`,
// which is deferred — see TODO above.
function ViewActionButton({ id }: { id?: string | number }) {
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={id == null}
      onClick={() => {
        // DEFERRED: surface a toast so the action stays discoverable without
        // dead-linking to the unported reconciliation page.
        toast.message("Reconciliation view is not yet available.");
      }}
    >
      View
    </Button>
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

