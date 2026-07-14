import { useMemo, useState } from "react";
import { ArrowRightLeft, Download, Inbox, Loader2, Search } from "lucide-react";
import {
  Button,
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
import {
  FormBuilderRenderer,
  type FormDefinition,
} from "@craft-apex/workflow-runtime";
import {
  fetchVerificationList,
  useUserInfo,
  useVerificationExportMutation,
  useVerificationTransferForm,
  useVerificationTransferMutation,
} from "./verification-transfer.api";
import type {
  FilterValues,
  Id,
  VerificationRow,
} from "./verification-transfer.types";

const PAGE_SIZE = 10;

/**
 * Substitute the user-role placeholders into a FormDefinition's field
 * `source.api` URLs. Legacy `getFieldList`:
 *   {{role_code}}          -> user.user_role_code
 *   {{required_role_code}} -> derived from user role
 */
function applyRoleSubstitution(
  form: FormDefinition,
  roleCode: string | undefined
): FormDefinition {
  if (!form) return form;
  const required =
    roleCode === "BRANCH_INCHARGE"
      ? "BRANCH_OFFICER|BRANCH_INCHARGE"
      : roleCode === "MARKETING_TEAM_LEAD"
        ? "MARKETING_OFFICER"
        : "BRANCH_OFFICER|BRANCH_INCHARGE|MARKETING_OFFICER";

  const substituteFields = (fields: NonNullable<FormDefinition["fields"]>) =>
    fields.map((f) => {
      const apiUrl = f.source?.api;
      if (!apiUrl) return f;
      let nextApi = apiUrl;
      if (roleCode && nextApi.includes("{{role_code}}")) {
        nextApi = nextApi.replaceAll("{{role_code}}", roleCode);
      }
      if (nextApi.includes("{{required_role_code}}")) {
        nextApi = nextApi.replaceAll("{{required_role_code}}", required);
      }
      if (nextApi === apiUrl) return f;
      return { ...f, source: { ...f.source, api: nextApi } };
    });

  if (form.sections && form.sections.length > 0) {
    return {
      ...form,
      sections: form.sections.map((s) => ({
        ...s,
        fields: substituteFields(s.fields),
      })),
    };
  }
  if (form.fields) return { ...form, fields: substituteFields(form.fields) };
  return form;
}

export default function VerificationTransferPage() {
  const formQuery = useVerificationTransferForm();
  const userQuery = useUserInfo();

  const userRoleCode = useMemo(() => {
    const u = userQuery.data;
    if (!u) return undefined;
    return u.user_type === "CHANNEL" ? u.partner_category : u.user_role_code;
  }, [userQuery.data]);

  const formBuilder = useMemo(() => {
    const fb = formQuery.data?.form_builder;
    if (!fb) return null;
    return applyRoleSubstitution(fb, userRoleCode);
  }, [formQuery.data, userRoleCode]);

  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [remarks, setRemarks] = useState("");
  const [page, setPage] = useState(1);

  const transfer = useVerificationTransferMutation();
  const exporter = useVerificationExportMutation();

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );
  const allOnPageSelected =
    paged.length > 0 &&
    paged.every((r) => selected.has(String(r.verification_id)));

  const handleSearch = async () => {
    setSearching(true);
    try {
      const result = await fetchVerificationList({ filterObj: filterValues });
      setRows(result);
      setSelected(new Set());
      setPage(1);
      if (result.length === 0) {
        toast.message?.("No verifications found for the selected filters") ??
          toast("No verifications found for the selected filters");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load verifications");
      setRows([]);
    } finally {
      setSearching(false);
    }
  };

  const togglePage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const r of paged) {
        const k = String(r.verification_id);
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const toggleRow = (id: Id) => {
    const k = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleSubmit = () => {
    // Legacy validation order (handleSubmitTransfer):
    //   1) to_territory_id present
    //   2) to_employee_id present
    //   3) at least one row selected
    //   4) from_employee_id !== to_employee_id
    //   5) remarks non-empty
    const f = filterValues;
    if (!f.to_territory_id || f.to_territory_id === "") {
      toast.error("Please select To Territory");
      return;
    }
    if (!f.to_employee_id || f.to_employee_id === "") {
      toast.error("Please select To Employee");
      return;
    }
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error("Please select at least one task to transfer");
      return;
    }
    if (f.from_employee_id === f.to_employee_id) {
      toast.error("From and To Employee should not be same");
      return;
    }
    if (remarks.trim() === "") {
      toast.error("Please enter remarks");
      return;
    }

    // Preserve original ids (json-bigint may surface strings for large ints).
    const verificationIds: Id[] = ids.map((s) => {
      const r = rows.find((row) => String(row.verification_id) === s);
      return r ? r.verification_id : s;
    });

    transfer.mutate(
      {
        from_user_id: String(f.from_employee_id ?? ""),
        to_user_id: String(f.to_employee_id ?? ""),
        from_territory_id: String(f.territory_id ?? ""),
        to_territory_id: String(f.to_territory_id ?? ""),
        verification_id: verificationIds,
        remarks,
        // Legacy: only set processor_only=true when current_to_role==="BRANCH_OFFICER".
        processor_only: f.current_to_role === "BRANCH_OFFICER",
      },
      {
        onSuccess: async (res) => {
          if (res?.status) {
            toast.success("Verification transferred successfully");
            setRemarks("");
            setSelected(new Set());
            // Refresh list with current filters.
            await handleSearch();
          } else {
            toast.error("Transfer failed");
          }
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Transfer failed"),
      }
    );
  };

  const handleExport = () => {
    exporter.mutate(filterValues, {
      onSuccess: (res) => {
        if (res?.status === 1 && res.download_url) {
          const a = document.createElement("a");
          a.href = res.download_url;
          a.download = "verification_transfer.xlsx";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          toast.error(res?.message ?? "Export API did not return a download URL");
        }
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Failed to export data"),
    });
  };

  return (
    <div className="space-y-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Verification Transfer List
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">
          Verification Transfer
        </h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {formQuery.isLoading || userQuery.isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading form configuration…
          </div>
        ) : formBuilder ? (
          <>
            <FormBuilderRenderer
              formJson={formBuilder}
              value={filterValues as Record<string, unknown>}
              onChange={(next) => setFilterValues(next as FilterValues)}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Verification
              </Button>
            </div>
          </>
        ) : (
          <p className="py-3 text-sm text-rose-600">
            Failed to load form configuration. Reload the page to retry.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={(e) => togglePage(e.target.checked)}
              disabled={paged.length === 0}
              className="h-4 w-4 rounded border-slate-300"
            />
            Select all on page
            {selected.size > 0 && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {selected.size} selected
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            {rows.length > 0 && (
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={exporter.isPending}
              >
                {exporter.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={transfer.isPending || rows.length === 0}
            >
              {transfer.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="mr-2 h-4 w-4" />
              )}
              Submit Transfer
            </Button>
          </div>
        </div>

        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter Your Remarks"
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
        />

        <DataTableShell
          columnCount={7}
          loading={searching && rows.length === 0}
          isEmpty={!searching && rows.length === 0}
          emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
          emptyTitle="No verifications loaded yet"
          emptyDescription="Set filters and run Search Verification to load tasks."
          pagination={{
            page,
            totalPages,
            total: rows.length,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
          header={
            <TableRow className={TABLE_HEADER_ROW_CLASS}>
              <TableHead className={`${TABLE_HEAD_CLASS} w-10`}> </TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Verification Details</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Task No</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Applicant Name</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Task Executor</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Task Approver</TableHead>
              <TableHead className={TABLE_HEAD_CLASS}>Task Status</TableHead>
            </TableRow>
          }
        >
          {paged.map((r) => {
            const key = String(r.verification_id);
            return (
              <TableRow key={key} className={TABLE_ROW_CLASS}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggleRow(r.verification_id)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">Loan/File No:</div>
                  <div>{r.external_lead_id || r.loan_code || "-"}</div>
                  <div className="mt-1 font-medium">Type:</div>
                  <div>{r.verification_type ?? "-"}</div>
                </TableCell>
                <TableCell>{r.verification_code ?? "-"}</TableCell>
                <TableCell>{r.name ?? "-"}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    <strong>Branch:</strong> {r.assigned_to?.territory_name ?? "-"}
                  </div>
                  <div className="text-xs">
                    <strong>Executor:</strong> {r.assigned_to?.user_name ?? "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <strong>Branch:</strong> {r.submitted_to?.territory_name ?? "-"}
                  </div>
                  <div className="text-xs">
                    <strong>Approver:</strong> {r.submitted_to?.user_name ?? "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <strong>Status:</strong> {r.verification_status ?? "-"}
                  </div>
                  <div className="text-xs">
                    <strong>Initiated:</strong>{" "}
                    {r.created_at ? formatDateDDMMYYYY(r.created_at) : "-"}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTableShell>
      </section>
    </div>
  );
}

// Legacy `formatDateDDMMYYYY`: parses "YYYY-MM-DD ..." → "DD-MM-YYYY".
function formatDateDDMMYYYY(input: string): string {
  const day = input.split(" ")[0]!.split("-");
  if (day.length !== 3) return "-";
  const [year, month, date] = day;
  return `${date}-${month}-${year}`;
}
