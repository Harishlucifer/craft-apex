import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import {
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
import {
  useEmployeeTerritoryLoanMap,
  useLenderMaster,
  useLoanTypeMaster,
  useSaveEmployeeTerritoryMap,
  useTerritoryMaster,
  useTerritoryTypeMaster,
} from "./employee-territory-map.api";
import type { TerritoryLoanMapEntry } from "./employee-territory-map.types";

// Step 3 of the Employee stepper — "Territory Loan-type Mapping".
// Ported from craft-frontend/src/pages/Configuration/Employee/EmployeeLocation.js
// (676 LOC). The legacy file embeds a large "Add/Edit" modal with react-select
// multi pickers, a Yup schema, and a view modal. Here we ship the core list +
// add + delete actions inline. Edit-in-place and the view-only modal are
// deferred — see comments below.

interface Props {
  employeeId: string;
  employeeName?: string;
  onBack: () => void;
  onNext: () => void;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

interface DraftRow {
  territoryType: string;
  territory: string;
  loanTypeIds: string[]; // string ids for native multi-select
  lenderIds: string[];
  allLenderEnabled: "true" | "false";
  status: "1" | "-1" | "";
}

const emptyDraft: DraftRow = {
  territoryType: "",
  territory: "",
  loanTypeIds: [],
  lenderIds: [],
  allLenderEnabled: "false",
  status: "1",
};

export default function EmployeeTerritoryMapStep({
  employeeId,
  employeeName,
  onBack,
  onNext,
}: Props) {
  const { data: territoryTypes = [] } = useTerritoryTypeMaster();
  const { data: territories = [] } = useTerritoryMaster();
  const { data: loanTypes = [] } = useLoanTypeMaster();
  const detailQuery = useEmployeeTerritoryLoanMap(employeeId);
  const save = useSaveEmployeeTerritoryMap();

  const [entries, setEntries] = useState<TerritoryLoanMapEntry[]>([]);
  const [draft, setDraft] = useState<DraftRow>(emptyDraft);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (detailQuery.data?.map) setEntries(detailQuery.data.map);
  }, [detailQuery.data]);

  // Filter territories by selected territory_type (legacy fetchTerritory).
  const territoryOptions = useMemo(
    () =>
      territories.filter(
        (t) => String(t.territory_type_id) === String(draft.territoryType)
      ),
    [territories, draft.territoryType]
  );

  // Lenders are fetched server-side filtered by loan_type_id list (legacy
  // fetchLender). Empty selection => "0" sentinel per legacy.
  const lenderQuery = useLenderMaster(draft.loanTypeIds);
  const lenderOptions = lenderQuery.data ?? [];

  const handleAddClick = () => {
    setDraft(emptyDraft);
    setShowAddForm(true);
  };

  const handleDraftAdd = () => {
    // Legacy Yup: territoryType, territory, loanType (>=1) required; lenderName
    // required iff all_lender_enabled !== "true"; status required.
    if (!draft.territoryType) {
      toast.error("Territory type is required");
      return;
    }
    if (!draft.territory) {
      toast.error("Territory is required");
      return;
    }
    if (draft.loanTypeIds.length < 1) {
      toast.error("Loan Type is required");
      return;
    }
    if (draft.allLenderEnabled !== "true" && draft.lenderIds.length < 1) {
      toast.error("Lender is required");
      return;
    }
    if (!draft.status) {
      toast.error("Status is required");
      return;
    }

    const tType = territoryTypes.find(
      (t) => String(t.territory_type_id) === String(draft.territoryType)
    );
    const t = territories.find(
      (x) => String(x.territory_id) === String(draft.territory)
    );
    const pickedLoanTypes = loanTypes
      .filter((lt) => draft.loanTypeIds.includes(String(lt.id)))
      .map((lt) => ({ loan_type_id: lt.id, loan_type_name: lt.name }));
    const pickedLenders = lenderOptions
      .filter((l) => draft.lenderIds.includes(String(l.lender_id)))
      .map((l) => ({ lender_id: l.lender_id, lender_name: l.name }));

    const entry: TerritoryLoanMapEntry = {
      all_lender_enabled: draft.allLenderEnabled === "true",
      territory_type_name: tType?.territory_type_name ?? "",
      territory_type_id: draft.territoryType,
      territory_name: t?.territory_name ?? "",
      territory_id: draft.territory,
      status: Number(draft.status),
      loan_type_ids: draft.loanTypeIds.map(String),
      loan_types: pickedLoanTypes,
      lenders:
        draft.allLenderEnabled === "true"
          ? []
          : pickedLenders,
      lender_ids:
        draft.allLenderEnabled === "true" ? [] : draft.lenderIds,
    };
    setEntries((prev) => [...prev, entry]);
    setDraft(emptyDraft);
    setShowAddForm(false);
  };

  // Legacy uses a SweetAlert confirm. We just drop the row — keeping parity
  // with the destructive intent. (Defer: confirm dialog.)
  const handleDelete = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Deferred: edit-in-place + view modal. The legacy file has a modal with
  // pre-filled values (editLocation/updateLocation) and a view modal
  // (viewLocation). For the rewrite we ship the list + add + delete; full
  // edit can be a follow-up that reuses the same draft form.

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        detail: detailQuery.data?.detail ?? null,
        fallbackEmployeeId: employeeId,
        entries,
      });
      toast.success("Territory mapping saved");
      onNext();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Territory Loan-type Mapping{employeeName ? ` — ${employeeName}` : ""}
        </h2>
        {!showAddForm && (
          <Button type="button" size="sm" onClick={handleAddClick}>
            <Plus className="h-4 w-4" /> Add Territory Loan-type
          </Button>
        )}
      </div>

      <DataTableShell
        columnCount={6}
        isEmpty={entries.length === 0}
        emptyTitle="No territory mappings"
        emptyDescription="Use 'Add Territory Loan-type' to map this employee."
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>Territory Type</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Territory</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Loan Types</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Lenders</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Status</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>Actions</TableHead>
          </TableRow>
        }
      >
        {entries.map((e, idx) => (
          <TableRow key={`${String(e.territory_id)}-${idx}`} className={TABLE_ROW_CLASS}>
            <TableCell>{e.territory_type_name}</TableCell>
            <TableCell>{e.territory_name}</TableCell>
            <TableCell>
              {(e.loan_types ?? []).map((l) => l.loan_type_name).join(", ")}
            </TableCell>
            <TableCell>
              {e.all_lender_enabled
                ? "All lenders"
                : (e.lenders ?? []).map((l) => l.lender_name).join(", ")}
            </TableCell>
            <TableCell>{e.status === 1 ? "Active" : "Inactive"}</TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(idx)}
                aria-label="Delete mapping"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTableShell>

      {showAddForm && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">
            Add Territory Loan-type{employeeName ? ` for ${employeeName}` : ""}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Territory Type *">
              <select
                className={selectClass}
                value={draft.territoryType}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    territoryType: e.target.value,
                    territory: "",
                  }))
                }
              >
                <option value="">Select</option>
                {territoryTypes.map((t) => (
                  <option
                    key={String(t.territory_type_id)}
                    value={String(t.territory_type_id)}
                  >
                    {t.territory_type_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Territory *">
              <select
                className={selectClass}
                value={draft.territory}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, territory: e.target.value }))
                }
                disabled={!draft.territoryType}
              >
                <option value="">Select</option>
                {territoryOptions.map((t) => (
                  <option
                    key={String(t.territory_id)}
                    value={String(t.territory_id)}
                  >
                    {t.territory_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Loan Type *">
              <select
                multiple
                className={`${selectClass} h-28`}
                value={draft.loanTypeIds}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    loanTypeIds: Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    ),
                    // Reset lender selection when loan types change (legacy
                    // refetches lenders list keyed off loan types).
                    lenderIds: [],
                  }))
                }
              >
                {loanTypes.map((lt) => (
                  <option key={String(lt.id)} value={String(lt.id)}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Access all Lenders">
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    name="all_lender_enabled"
                    value="true"
                    checked={draft.allLenderEnabled === "true"}
                    onChange={() =>
                      setDraft((d) => ({
                        ...d,
                        allLenderEnabled: "true",
                        lenderIds: [],
                      }))
                    }
                    className="h-4 w-4"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    name="all_lender_enabled"
                    value="false"
                    checked={draft.allLenderEnabled === "false"}
                    onChange={() =>
                      setDraft((d) => ({ ...d, allLenderEnabled: "false" }))
                    }
                    className="h-4 w-4"
                  />
                  No
                </label>
              </div>
            </Field>
            {draft.allLenderEnabled !== "true" && (
              <Field label="Lender Name *">
                <select
                  multiple
                  className={`${selectClass} h-28`}
                  value={draft.lenderIds}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      lenderIds: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value
                      ),
                    }))
                  }
                  disabled={draft.loanTypeIds.length === 0}
                >
                  {lenderOptions.map((l) => (
                    <option
                      key={String(l.lender_id)}
                      value={String(l.lender_id)}
                    >
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Status *">
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    name="status"
                    value="1"
                    checked={draft.status === "1"}
                    onChange={() => setDraft((d) => ({ ...d, status: "1" }))}
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Input
                    type="radio"
                    name="status"
                    value="-1"
                    checked={draft.status === "-1"}
                    onChange={() => setDraft((d) => ({ ...d, status: "-1" }))}
                    className="h-4 w-4"
                  />
                  In-Active
                </label>
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraft(emptyDraft);
                setShowAddForm(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleDraftAdd}>
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  );
}
