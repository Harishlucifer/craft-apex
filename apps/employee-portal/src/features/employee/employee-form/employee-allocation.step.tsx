// Legacy file:
//   craft-frontend/src/pages/Configuration/Employee/DynamicEmployeeAllocation.js (860 LOC)
//
// Step 4 of the employee stepper. Manages a list of allocation rows
// (workflow_type / participant_type / eligibility_rule_id / priority_rule_id /
// status). Each row maps to a card; the "Add Allocation" tile opens an inline
// form below the list. Save returns the working list up via onSave().
//
// PORTED:
//   - Card list of existing allocations + View / Edit buttons
//   - Add Allocation tile that opens the inline form
//   - Workflow Type, Participant Type, Status selects (with the dependent
//     lookup fetch — selecting workflow type triggers
//     /alpha/v1/lookup?group_code=WORKFLOW_TYPE,{workflowType} to repopulate
//     participantOption).
//   - Add/Update of the in-memory allocation list (matches legacy:
//     allocations are kept in component state and only persisted when the
//     parent employee form is saved).
//   - View modal mirroring legacy field order.
//   - Back / Save buttons wiring onBack() / onSave().
//
// DEFERRED (explicit — TODO when porting QueryBuilder / RuleList):
//   - QueryBuilder + QueryOutputList rule editors (Eligibility / Priority).
//     Legacy lines 647-716 plus the rule POST inside formik.onSubmit
//     (lines 209-253) require porting the whole craft-formbuilder /
//     QueryBuilder primitives, which live in craft-frontend/Components/Common.
//     For now the form shows a placeholder per tab and the submit path
//     skips the POST /alpha/v1/rule/create call.
//   - RuleList "Choose / Clone & Edit" picker modal (legacy lines 763-781).
//   - Action dropdown ("Add New / Select & Use / Clone & Edit") per rule tab.
//   - Per-card 1s artificial loading delay (legacy lines 302, 367) — not
//     needed in the new app.
//
// Endpoints used (verified against ApiEndPoint.js):
//   GET  /alpha/v1/employee/{id}                       (employeeAllocation seed)
//   GET  /alpha/v1/rule                                (ruleOption labels for View)
//   GET  /alpha/v1/lookup?group_code=WORKFLOW_TYPE,{participantWorkflow}
//   GET  /alpha/v1/parameter                           (fieldDropdownValues — kept
//                                                       for parity, used by the
//                                                       deferred rule editor)

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Label, toast } from "@craft-apex/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@craft-apex/ui";
import { ArrowLeft, ArrowRight, Pencil, Eye, Plus, X } from "lucide-react";
import {
  fetchAllocationLookup,
  useEmployeeAllocation,
  useRuleList,
  useParameters,
} from "./employee-allocation.api";
import type {
  EmployeeAllocationRow,
  LookupRow,
} from "./employee-allocation.types";

interface Props {
  employeeId: string;
  employee?: { username?: string; id?: string | number };
  onBack: () => void;
  onSave: () => void;
}

interface AllocationFormValues {
  workflowType: string;
  roleCode: string;
  participantType: string;
  // priorityRule / eligibilityRule remain in-state for parity but the rule
  // editors are deferred (see DEFERRED note above).
  priorityRule: string | number | null;
  eligibilityRule: string | number | null;
  status: number;
}

const EMPTY_FORM: AllocationFormValues = {
  workflowType: "",
  roleCode: "",
  participantType: "",
  priorityRule: null,
  eligibilityRule: null,
  status: 1,
};

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20";

export default function EmployeeAllocationStep({
  employeeId,
  employee: _employee,
  onBack,
  onSave,
}: Props) {
  // --- data seeds ---
  const { data: seededAllocation = [] } = useEmployeeAllocation(employeeId);
  const { data: ruleOption = [] } = useRuleList();
  // Kept for parity with legacy (used by the deferred rule editor).
  useParameters();

  const [employeeAllocation, setEmployeeAllocation] = useState<
    EmployeeAllocationRow[]
  >([]);
  useEffect(() => {
    if (seededAllocation.length > 0) setEmployeeAllocation(seededAllocation);
  }, [seededAllocation]);

  // --- modal-style inline form open/edit state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editBtn, setEditBtn] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [activeRuleTab, setActiveRuleTab] = useState<"ELIGIBILITY" | "PRIORITY">(
    "ELIGIBILITY"
  );

  // --- lookups for the two dependent selects ---
  const [workflowOption, setWorkflowOption] = useState<
    { value: string; label: string }[]
  >([]);
  const [participantOption, setParticipantOption] = useState<
    { value: string; label: string }[]
  >([]);

  // --- form values ---
  const [form, setForm] = useState<AllocationFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AllocationFormValues, string>>>(
    {}
  );

  // --- view modal ---
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState<EmployeeAllocationRow | null>(null);

  // Refetch lookup whenever workflowType changes (legacy useEffect line 254).
  useEffect(() => {
    let cancelled = false;
    const wf = form.workflowType;
    fetchAllocationLookup(wf)
      .then((rows: LookupRow[]) => {
        if (cancelled) return;
        const workflowTypeOptions = rows
          .filter((r) => r.group_code === "WORKFLOW_TYPE")
          .map((r) => ({ value: r.lu_key, label: r.lu_name }));
        setWorkflowOption(workflowTypeOptions);
        if (wf) {
          const participantData = rows
            .filter((r) => r.group_code === wf)
            .map((r) => ({ value: r.lu_key, label: r.lu_name }));
          setParticipantOption(participantData);
        } else {
          setParticipantOption([]);
        }
      })
      .catch(() => {
        // legacy: silent (no Swal on lookup failure)
      });
    return () => {
      cancelled = true;
    };
  }, [form.workflowType]);

  const validate = (values: AllocationFormValues) => {
    const next: typeof errors = {};
    if (!values.workflowType)
      next.workflowType = "Workflow Type is Required";
    if (!values.participantType)
      next.participantType = "Participant Type is Required";
    if (values.status == null || Number.isNaN(values.status))
      next.status = "Status is Required";
    return next;
  };

  const openAddForm = () => {
    setEditBtn(false);
    setEditIndex(null);
    setActiveRuleTab("ELIGIBILITY");
    setForm(EMPTY_FORM);
    setErrors({});
    setParticipantOption([]);
    setModalOpen(true);
  };

  const openEditForm = (allocation: EmployeeAllocationRow, idx: number) => {
    setEditBtn(true);
    setEditIndex(idx);
    setActiveRuleTab("ELIGIBILITY");
    setForm({
      workflowType: allocation.workflow_type,
      roleCode: allocation.role_code ?? "",
      participantType: allocation.participant_type,
      priorityRule: allocation.priority_rule_id ?? null,
      eligibilityRule: allocation.eligibility_rule_id ?? null,
      status: allocation.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // DEFERRED: legacy posts to RULE_CREATE here when rule editors have
    // produced conditions (lines 210-244). The new app skips that until the
    // QueryBuilder primitives are ported.

    const row: EmployeeAllocationRow = {
      workflow_type: form.workflowType,
      role_code: form.roleCode,
      participant_type: form.participantType,
      eligibility_rule_id: form.eligibilityRule ?? null,
      priority_rule_id: form.priorityRule ?? null,
      status: form.status,
    };

    if (editBtn && editIndex != null) {
      setEmployeeAllocation((prev) =>
        prev.map((r, i) => (i === editIndex ? row : r))
      );
    } else {
      setEmployeeAllocation((prev) => [...prev, row]);
    }
    setModalOpen(false);
    setEditBtn(false);
    setEditIndex(null);
  };

  const handleSave = () => {
    // Legacy: handleNext(employeeAllocation). Parent owns the persistence call.
    try {
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const ruleLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of ruleOption) map.set(String(r.id), r.name);
    return (id: string | number | null | undefined) =>
      id != null ? map.get(String(id)) ?? "" : "";
  }, [ruleOption]);

  return (
    <div className="space-y-5">
      {/* Card list of existing allocations + Add tile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-row gap-3 overflow-x-auto whitespace-nowrap p-1">
          {employeeAllocation.map((allocation, idx) => (
            <div
              key={idx}
              className="flex w-[22rem] flex-shrink-0 flex-col rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex justify-between">
                <span className="font-semibold text-slate-500">
                  Workflow Type
                </span>
                <span className="font-semibold text-slate-800">
                  {String(allocation.workflow_type ?? "").replace(/_/g, " ")}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="font-semibold text-slate-500">
                  Participant
                </span>
                <span className="font-semibold text-slate-800">
                  {allocation.participant_type}
                </span>
              </div>
              <div className="mb-3 flex justify-between">
                <span className="font-semibold text-slate-500">Status</span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-medium " +
                    (allocation.status === 1
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700")
                  }
                >
                  {allocation.status === 1 ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-auto flex justify-center gap-3 border-t border-slate-100 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setViewData(allocation);
                    setViewOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button
                  size="sm"
                  onClick={() => openEditForm(allocation, idx)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          ))}

          {/* Add Allocation tile */}
          <button
            type="button"
            onClick={openAddForm}
            className="flex w-[22rem] flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#0d6efd] bg-white p-3 shadow-sm hover:bg-slate-50"
          >
            <Plus className="mb-1 h-6 w-6 text-[#0d6efd]" />
            <h6 className="m-0 font-semibold text-[#0d6efd]">
              Add Allocation
            </h6>
          </button>
        </div>

        {/* Inline form (replaces legacy CardBody/CardFooter block) */}
        {modalOpen && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Workflow Type *" error={errors.workflowType}>
                <select
                  className={selectClass}
                  value={form.workflowType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      workflowType: e.target.value,
                      participantType: "",
                    }))
                  }
                >
                  <option value="">Select</option>
                  {workflowOption.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Participant Type *" error={errors.participantType}>
                <select
                  className={selectClass}
                  value={form.participantType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, participantType: e.target.value }))
                  }
                >
                  <option value="">Select</option>
                  {participantOption.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Role Code">
                <Input
                  value={form.roleCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, roleCode: e.target.value }))
                  }
                />
              </Field>
              <Field label="Status">
                <select
                  className={selectClass}
                  value={String(form.status)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: Number(e.target.value) }))
                  }
                >
                  <option value="1">Active</option>
                  <option value="-1">Inactive</option>
                </select>
              </Field>
            </div>

            {/* Rule tab strip — UI shell only; editors are DEFERRED */}
            <div className="mt-5 border-b border-slate-200">
              <div className="flex gap-3 p-1">
                <button
                  type="button"
                  onClick={() => setActiveRuleTab("ELIGIBILITY")}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium " +
                    (activeRuleTab === "ELIGIBILITY"
                      ? "bg-[#0d6efd] text-white"
                      : "bg-slate-100 text-slate-700")
                  }
                >
                  Eligibility Rule
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRuleTab("PRIORITY")}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium " +
                    (activeRuleTab === "PRIORITY"
                      ? "bg-[#0d6efd] text-white"
                      : "bg-slate-100 text-slate-700")
                  }
                >
                  Priority Rule
                </button>
              </div>
            </div>
            <div className="mt-3 rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
              {/* DEFERRED: QueryBuilder / QueryOutputList rule editor (legacy
                  lines 647-716). Will replace this placeholder once those
                  primitives are ported. The currently-selected rule id (if
                  any) is preserved on edit. */}
              Rule editor not yet ported. Existing rule id is preserved on
              save.{" "}
              {activeRuleTab === "ELIGIBILITY"
                ? form.eligibilityRule
                  ? `(Eligibility rule id: ${String(form.eligibilityRule)})`
                  : ""
                : form.priorityRule
                  ? `(Priority rule id: ${String(form.priorityRule)})`
                  : ""}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  setEditBtn(false);
                  setEditIndex(null);
                }}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSubmit}>
                {editBtn ? "Update" : "Add New"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Back / Save */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleSave}>
          <ArrowRight className="h-4 w-4" /> Save
        </Button>
      </div>

      {/* View modal */}
      <Dialog open={viewOpen} onOpenChange={(o) => setViewOpen(o)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocation for Employee</DialogTitle>
          </DialogHeader>
          {viewData && (
            <div className="space-y-2 text-sm">
              <Row label="Workflow Type" value={viewData.workflow_type} />
              <Row label="Participant Type" value={viewData.participant_type} />
              <Row
                label="Eligibility Rule"
                value={ruleLabel(viewData.eligibility_rule_id)}
              />
              <Row
                label="Priority Rule"
                value={ruleLabel(viewData.priority_rule_id)}
              />
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="font-semibold">Status</div>
                <div>:</div>
                <div>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-medium " +
                      (viewData.status === 1
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700")
                    }
                  >
                    {viewData.status === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DEFERRED: Rule Selection modal (legacy lines 763-781). Renders
          RuleList from craft-frontend/src/pages/Rule/RuleList.js — that page
          isn't ported yet. */}
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

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <div className="font-semibold">{label}</div>
      <div>:</div>
      <div>{value ?? ""}</div>
    </div>
  );
}
