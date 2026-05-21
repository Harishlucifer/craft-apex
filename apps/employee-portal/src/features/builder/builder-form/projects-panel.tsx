import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@craft-apex/ui";
import {
  fetchPincodeDetails,
  fetchPincodeSuggestions,
} from "./builder-form.api";
import type { PincodeSuggestion } from "./builder-form.types";
import {
  searchBanks,
  useProjectTypeLookups,
  useProjectsByDeveloper,
  useSaveProject,
} from "./projects-panel.api";
import type {
  ApprovedLenderRow,
  BankRow,
  ProjectRow,
  ProjectSavePayload,
} from "./projects-panel.types";

const projectSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  project_id: z.union([z.string(), z.number()]).optional(),
  code: z.string().optional(),
  name: z.string().min(1, "Project Name is required"),
  projectType: z.string().min(1, "Project Type is required"),
  noOfPhase: z.coerce.number().min(1, "Must be at least 1"),
  noOfTower: z.coerce.number().min(1, "Must be at least 1"),
  noOfUnits: z.coerce.number().min(1, "Must be at least 1"),
  possessionDate: z.string().min(1, "Possession Date is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  area_id: z.string().optional(),
  area: z.string().optional(),
  contactName: z.string().min(1, "Contact Name is required"),
  contactMobile: z
    .string()
    .min(1, "Contact Mobile is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  otherDetail: z.string().min(1, "Other Detail is required"),
  status: z.coerce.number().int(),
});
type ProjectValues = z.infer<typeof projectSchema>;

const lenderSchema = z.object({
  lenderId: z.string().min(1, "Lender is required"),
  lenderName: z.string().optional(),
  approvedDate: z.string().min(1, "Approved date is required"),
  approvalCode: z.string().min(1, "Approval code is required"),
});
type LenderValues = z.infer<typeof lenderSchema>;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20 disabled:bg-slate-50 disabled:text-slate-400";

interface Props {
  developerId: string | number;
}

const NEW_KEY = "__new__";

export function ProjectsPanel({ developerId }: Props) {
  const qc = useQueryClient();
  const { data: projects = [] } = useProjectsByDeveloper(developerId);
  const { data: lookups = [] } = useProjectTypeLookups();
  const save = useSaveProject();

  const projectTypeOptions = useMemo(
    () =>
      lookups.map((l) => ({ value: l.lu_key, label: l.lu_name })),
    [lookups]
  );

  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    if (projects.length > 0 && !activeKey) {
      const first = projects[0]!;
      setActiveKey(String(first.project_id ?? first.id ?? "0"));
    }
  }, [projects, activeKey]);

  const activeProject: ProjectRow | undefined = useMemo(() => {
    if (activeKey === NEW_KEY) {
      return {
        developer_id: developerId,
        apf_status: 1,
        status: 1,
        approved_lenders: [],
      };
    }
    return projects.find(
      (p) => String(p.project_id ?? p.id) === activeKey
    );
  }, [activeKey, projects, developerId]);

  const isNew = activeKey === NEW_KEY;

  const handleDelete = async (project: ProjectRow) => {
    if (!project.project_id && !project.id) {
      // Draft only — just clear the new state.
      const first = projects[0];
      setActiveKey(first ? String(first.project_id ?? first.id ?? "0") : "");
      return;
    }
    try {
      await save.mutateAsync({
        ...(project as unknown as ProjectSavePayload),
        status: -1,
      });
      toast.success("Project deleted successfully");
      qc.invalidateQueries({ queryKey: ["projects-by-developer"] });
      const next = projects[1];
      setActiveKey(next ? String(next.project_id ?? next.id ?? "0") : "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {projects.map((p) => {
          const key = String(p.project_id ?? p.id);
          const active = key === activeKey;
          return (
            <div
              key={key}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-md border border-[#4C7DF0] bg-[#4C7DF0]/10 px-3 py-1.5 text-sm font-medium text-[#4C7DF0]"
                  : "inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300"
              }
            >
              <button type="button" onClick={() => setActiveKey(key)}>
                {p.name || "Untitled project"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p)}
                aria-label="Delete project"
                className="text-rose-500 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <Button
          type="button"
          size="sm"
          className="ml-auto whitespace-nowrap"
          onClick={() => setActiveKey(NEW_KEY)}
        >
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      {activeProject ? (
        <ProjectForm
          key={
            isNew ? "__draft__" : String(activeProject.project_id ?? activeProject.id ?? "")
          }
          project={activeProject}
          developerId={developerId}
          projectTypeOptions={projectTypeOptions}
          saving={save.isPending}
          onSaved={(saved) => {
            qc.invalidateQueries({ queryKey: ["projects-by-developer"] });
            if (saved?.project_id != null) {
              setActiveKey(String(saved.project_id));
            }
          }}
        />
      ) : (
        <p className="rounded-md border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center text-sm text-slate-400">
          No projects yet. Click <strong>Add Project</strong> to create one.
        </p>
      )}
    </div>
  );
}

function ProjectForm({
  project,
  developerId,
  projectTypeOptions,
  saving,
  onSaved,
}: {
  project: ProjectRow;
  developerId: string | number;
  projectTypeOptions: { value: string; label: string }[];
  saving: boolean;
  onSaved: (saved: ProjectRow | null) => void;
}) {
  const save = useSaveProject();
  const [approvedLenders, setApprovedLenders] = useState<ApprovedLenderRow[]>(
    project.approved_lenders ?? []
  );
  useEffect(() => {
    setApprovedLenders(project.approved_lenders ?? []);
  }, [project.approved_lenders]);

  // Legacy stores possession_date as ISO; UI display format is DD-MM-YYYY.
  const initialPossession = useMemo(() => {
    const pd = project.possession_date;
    if (!pd) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(pd)) return pd.split("T")[0] ?? "";
    return pd;
  }, [project.possession_date]);

  const defaults: ProjectValues = useMemo(
    () => ({
      id: project.id,
      project_id: project.project_id,
      code: project.apf_code ?? "",
      name: project.name ?? "",
      projectType: project.project_type ?? "",
      noOfPhase: Number(project.no_of_phase ?? 0),
      noOfTower: Number(project.no_of_tower ?? 0),
      noOfUnits: Number(project.no_of_units ?? 0),
      possessionDate: initialPossession,
      pincode: project.pincode ?? "",
      state: "",
      district: "",
      area_id:
        project.pincode_id != null ? String(project.pincode_id) : "",
      area: "",
      contactName: project.contact_name ?? "",
      contactMobile: project.contact_mobile ?? "",
      otherDetail: project.data?.other_detail ?? "",
      status: project.status != null ? Number(project.status) : 1,
    }),
    [project, initialPossession]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  // Resolve state/district + area list on mount when pincode exists.
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    const pc = project.pincode;
    if (!pc) return;
    fetchPincodeDetails(pc).then((rows) => {
      const first = rows[0];
      if (!first) return;
      setValue("state", first.coreStateList?.name ?? "", {
        shouldValidate: true,
      });
      setValue("district", first.coreCityList?.name ?? "", {
        shouldValidate: true,
      });
      const list = rows.map((r) => ({
        value: String(r.id),
        label: r.area,
      }));
      setAreaOptions(list);
      if (project.pincode_id != null) {
        const hit = list.find((r) => r.value === String(project.pincode_id));
        if (hit) setValue("area", hit.label);
      }
    });
  }, [project.pincode, project.pincode_id, setValue]);

  // Pincode autocomplete
  const [suggestions, setSuggestions] = useState<PincodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const onPincodeChange = async (v: string) => {
    setValue("pincode", v, { shouldValidate: true });
    if (!v) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const list = await fetchPincodeSuggestions(v);
      setSuggestions(list);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectPincode = async (pc: string) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setValue("pincode", pc, { shouldValidate: true });
    const rows = await fetchPincodeDetails(pc);
    const first = rows[0];
    if (first) {
      setValue("state", first.coreStateList?.name ?? "", {
        shouldValidate: true,
      });
      setValue("district", first.coreCityList?.name ?? "", {
        shouldValidate: true,
      });
      setAreaOptions(
        rows.map((r) => ({ value: String(r.id), label: r.area }))
      );
    }
  };

  // Approved Lender modal
  const [lenderEditing, setLenderEditing] = useState<{
    row?: ApprovedLenderRow;
    index?: number;
  } | null>(null);
  const [viewingLender, setViewingLender] = useState<ApprovedLenderRow | null>(
    null
  );

  const onSubmit = handleSubmit(async (values) => {
    const payload: ProjectSavePayload = {
      ...(values.id != null ? { id: values.id } : {}),
      ...(values.project_id != null
        ? { project_id: values.project_id }
        : {}),
      developer_id: developerId,
      name: values.name,
      project_type: values.projectType,
      apf_code: values.code,
      pincode: String(values.pincode),
      pincode_id: String(values.area_id ?? ""),
      no_of_phase: String(values.noOfPhase),
      no_of_tower: String(values.noOfTower),
      no_of_units: String(values.noOfUnits),
      // Legacy converts DD-MM-YYYY → ISO; we already store yyyy-mm-dd from <input type="date">.
      possession_date: values.possessionDate
        ? new Date(values.possessionDate).toISOString()
        : null,
      contact_name: values.contactName,
      contact_mobile: String(values.contactMobile),
      apf_status: 1,
      approved_by: "1",
      status: Number(values.status),
      data: { other_detail: values.otherDetail },
      approved_lenders: approvedLenders,
    };
    try {
      const res = await save.mutateAsync(payload);
      const data =
        ((res as any)?.data?.data ?? (res as any)?.result ?? null) as
          | ProjectRow
          | null;
      toast.success(
        `Project ${values.project_id ? "updated" : "created"} successfully`
      );
      onSaved(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-700">Project Details</h3>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Field label="Project Name *" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>

        <Field label="Project Type *" error={errors.projectType?.message}>
          <select
            className={selectClass}
            value={watch("projectType")}
            onChange={(e) =>
              setValue("projectType", e.target.value, {
                shouldValidate: true,
              })
            }
          >
            <option value="">Select</option>
            {projectTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="APF Code">
          <Input {...register("code")} />
        </Field>

        <Field label="No. of Phases *" error={errors.noOfPhase?.message}>
          <Input type="number" min={1} {...register("noOfPhase")} />
        </Field>
        <Field label="No. of Tower *" error={errors.noOfTower?.message}>
          <Input type="number" min={1} {...register("noOfTower")} />
        </Field>
        <Field label="No. of Units *" error={errors.noOfUnits?.message}>
          <Input type="number" min={1} {...register("noOfUnits")} />
        </Field>

        <Field
          label="Possession Date *"
          error={errors.possessionDate?.message}
        >
          <Input type="date" {...register("possessionDate")} />
        </Field>

        <div className="relative space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Pincode *
          </Label>
          <Input
            maxLength={6}
            value={watch("pincode")}
            onChange={(e) => onPincodeChange(e.target.value)}
            onBlur={() =>
              window.setTimeout(() => setShowSuggestions(false), 150)
            }
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow">
              {suggestions.map((s) => (
                <li
                  key={String(s.id)}
                  className="cursor-pointer px-3 py-1.5 hover:bg-slate-50"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectPincode(String(s.pincode));
                  }}
                >
                  {s.pincode}
                </li>
              ))}
            </ul>
          )}
          {errors.pincode && (
            <p className="text-xs text-rose-500">{errors.pincode.message}</p>
          )}
        </div>

        <Field label="State *" error={errors.state?.message}>
          <Input {...register("state")} />
        </Field>
        <Field label="District *" error={errors.district?.message}>
          <Input {...register("district")} />
        </Field>

        <Field label="Area">
          <select
            className={selectClass}
            value={watch("area_id") ?? ""}
            onChange={(e) => {
              setValue("area_id", e.target.value);
              const hit = areaOptions.find((o) => o.value === e.target.value);
              setValue("area", hit?.label ?? "");
            }}
            disabled={areaOptions.length === 0}
          >
            <option value="">
              {areaOptions.length === 0 ? "Pick a pincode first" : "Select area"}
            </option>
            {areaOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Contact Name *" error={errors.contactName?.message}>
          <Input {...register("contactName")} />
        </Field>
        <Field
          label="Contact Mobile *"
          error={errors.contactMobile?.message}
        >
          <Input maxLength={10} {...register("contactMobile")} />
        </Field>
        <Field label="Status *" error={errors.status?.message}>
          <select
            className={selectClass}
            value={String(watch("status") ?? "")}
            onChange={(e) =>
              setValue("status", Number(e.target.value), {
                shouldValidate: true,
              })
            }
          >
            <option value="1">Active</option>
            <option value="-1">In-Active</option>
          </select>
        </Field>

        <div className="md:col-span-3">
          <Field label="Other Detail *" error={errors.otherDetail?.message}>
            <textarea
              rows={3}
              {...register("otherDetail")}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">
            Approved Lenders
          </h4>
          <Button
            type="button"
            size="sm"
            onClick={() => setLenderEditing({})}
          >
            <Plus className="h-3.5 w-3.5" /> Add Lender
          </Button>
        </div>
        {approvedLenders.length === 0 ? (
          <p className="text-xs text-slate-400">No approved lenders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-3 py-1.5 text-left">Bank</th>
                  <th className="px-3 py-1.5 text-left">Approval Date</th>
                  <th className="px-3 py-1.5 text-left">Approval Code</th>
                  <th className="px-3 py-1.5 text-left">Status</th>
                  <th className="px-3 py-1.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedLenders.map((l, i) => (
                  <tr
                    key={`${l.bank_id}-${i}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-1.5">{l.bank_name}</td>
                    <td className="px-3 py-1.5">{l.approval_date}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px]">
                      {l.approval_code}
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge variant={l.status === 1 ? "success" : "destructive"}>
                        {l.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingLender(l)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100"
                          aria-label="View"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLenderEditing({ row: l, index: i })}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setApprovedLenders((rs) =>
                              rs.filter((_, idx) => idx !== i)
                            )
                          }
                          className="rounded p-1 text-rose-500 hover:bg-rose-50"
                          aria-label="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-slate-100 pt-4">
        <Button type="submit" disabled={saving || save.isPending}>
          {saving || save.isPending
            ? "Saving…"
            : project.project_id
              ? "Save Project"
              : "Create Project"}
        </Button>
      </div>

      <Dialog
        open={lenderEditing !== null}
        onOpenChange={(o) => !o && setLenderEditing(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {lenderEditing?.row ? "Edit Approved Lender" : "Add Approved Lender"}
            </DialogTitle>
          </DialogHeader>
          {lenderEditing !== null && (
            <LenderForm
              initial={lenderEditing.row}
              onCancel={() => setLenderEditing(null)}
              onSubmit={(row) => {
                setApprovedLenders((rs) =>
                  lenderEditing.index != null
                    ? rs.map((r, idx) =>
                        idx === lenderEditing.index ? row : r
                      )
                    : [...rs, row]
                );
                setLenderEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingLender !== null}
        onOpenChange={(o) => !o && setViewingLender(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approved Lender</DialogTitle>
          </DialogHeader>
          {viewingLender && (
            <div className="space-y-2 text-sm">
              <Row label="Bank" value={viewingLender.bank_name} />
              <Row label="Bank ID" value={String(viewingLender.bank_id)} />
              <Row label="Approval Date" value={viewingLender.approval_date} />
              <Row label="Approval Code" value={viewingLender.approval_code} />
              <Row
                label="Status"
                value={viewingLender.status === 1 ? "Active" : "Inactive"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}

function LenderForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: ApprovedLenderRow;
  onCancel: () => void;
  onSubmit: (row: ApprovedLenderRow) => void;
}) {
  const [banks, setBanks] = useState<BankRow[]>([]);
  const [query, setQuery] = useState("");

  // Debounced bank search.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      searchBanks(query)
        .then((list: BankRow[]) => {
          let merged = list;
          if (
            initial?.bank_id &&
            !list.some((b: BankRow) => String(b.id) === String(initial.bank_id))
          ) {
            merged = [
              {
                id: initial.bank_id,
                bankName: initial.bank_name,
              },
              ...list,
            ];
          }
          setBanks(merged);
        })
        .catch(() => setBanks([]));
    }, 500);
    return () => window.clearTimeout(handle);
  }, [query, initial?.bank_id, initial?.bank_name]);

  const defaults: LenderValues = useMemo(
    () => ({
      lenderId: initial?.bank_id != null ? String(initial.bank_id) : "",
      lenderName: initial?.bank_name ?? "",
      approvedDate: initial?.approval_date ?? "",
      approvalCode: initial?.approval_code ?? "",
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LenderValues>({
    resolver: zodResolver(lenderSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const submit = handleSubmit((values) => {
    const bank = banks.find((b) => String(b.id) === values.lenderId);
    onSubmit({
      bank_id: values.lenderId,
      bank_name: bank?.bankName ?? values.lenderName ?? "",
      approval_date: values.approvedDate,
      approval_code: values.approvalCode,
      status: 1,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Lender *" error={errors.lenderId?.message}>
        <Input
          placeholder="Type to search bank…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={`${selectClass} mt-2`}
          value={watch("lenderId")}
          onChange={(e) => setValue("lenderId", e.target.value)}
        >
          <option value="">Select Lender</option>
          {banks.map((b) => (
            <option key={String(b.id)} value={String(b.id)}>
              {b.bankName}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Approved Date *" error={errors.approvedDate?.message}>
        <Input type="date" {...register("approvedDate")} />
      </Field>

      <Field label="Approval Code *" error={errors.approvalCode?.message}>
        <Input {...register("approvalCode")} />
      </Field>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Update" : "Add"}</Button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-slate-100 py-1.5 last:border-b-0">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-400">:</span>
      <span className="text-slate-800">{value}</span>
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
