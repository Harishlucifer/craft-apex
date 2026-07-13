import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check } from "lucide-react";
import { Button, Label, toast } from "@craft-apex/ui";
import { useRoleDetail, useRoleFormLookups, useSaveRole } from "./role-form.api";
import type { RoleData } from "./role-form.types";
import { AccessRights } from "./access-rights";
import {
  buildNestedFormPayload,
  buildWorkflow,
  FormBuilderRenderer,
  WorkflowType,
  type FormDefinition,
  type WorkflowStepDef,
} from "@/features/workflow-runtime";

// `ui_component` codes the /settings/workflow admin screen must assign to
// this workflow's steps. FORM_BUILDER renders the basic-details fields
// below; ACCESS_RIGHTS maps straight onto the existing AccessRights
// component (menu/permission tree) — that UI stays hand-rolled since it
// isn't expressible as a flat form_builder JSON.
const FORM_BUILDER_UI = "FORM_BUILDER";
const ACCESS_RIGHTS_UI = "ACCESS_RIGHTS";

export default function RoleFormPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  const { hash } = useLocation();
  const hashType = hash.startsWith("#") ? hash.substring(1) : "";
  const isChannel = hashType === "CHANNEL";

  // `id` is the active role id used by the Access Rights step. For edit it
  // comes from the URL; for create it's set after the FORM_BUILDER step
  // saves and the backend returns a `user_role_id` in the response.
  const [savedRoleId, setSavedRoleId] = useState<string | undefined>(routeId);
  const id = savedRoleId ?? routeId;
  const [activeStep, setActiveStep] = useState(0);

  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ["role-workflow", id ?? ""],
    queryFn: () =>
      buildWorkflow({ workflowType: WorkflowType.RoleCreation, sourceId: id }),
  });
  const steps: WorkflowStepDef[] = useMemo(
    () => workflow?.stages.flatMap((s) => s.steps) ?? [],
    [workflow]
  );
  const activeStepDef = steps[activeStep];

  // Lookups.
  const { data: lookups = [] } = useRoleFormLookups();
  const partnerCategories = useMemo(
    () => lookups.filter((l) => l.group_code === "PARTNER_CATEGORY"),
    [lookups]
  );

  // CHANNEL partner-category param (legacy default = first PC's lu_key).
  const [partnerCategory, setPartnerCategory] = useState("");
  useEffect(() => {
    if (!partnerCategory && partnerCategories[0]) {
      setPartnerCategory(partnerCategories[0].lu_key);
    }
  }, [partnerCategories, partnerCategory]);

  // Role on the server (edit mode).
  const { data: fetchedRole } = useRoleDetail(id, partnerCategory, isChannel);

  // The role we're editing (server snapshot + step-1 save response + step-2 mutations).
  const [role, setRole] = useState<RoleData | null>(null);
  useEffect(() => {
    if (fetchedRole) setRole(fetchedRole);
  }, [fetchedRole]);

  const save = useSaveRole();

  const formBuilderStep = useMemo(
    () => steps.find((s) => s.ui_component === FORM_BUILDER_UI),
    [steps]
  );
  const formJson = (
    formBuilderStep?.configuration as
      | { form_builder?: FormDefinition }
      | undefined
  )?.form_builder;

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // RoleData's JSON structure exactly (RoleData is already flat, so this
  // is a 1:1 passthrough — see buildNestedFormPayload below).
  useEffect(() => {
    setFormValues({
      code: role?.code ?? "",
      name: role?.name ?? "",
      description: role?.description ?? "",
      user_type: role?.user_type ?? "",
      parent_role_id: role?.parent_role_id ?? "",
      data_access: role?.data_access ?? "",
      generate_application_link: role?.generate_application_link ?? "false",
      generate_partner_link: role?.generate_partner_link ?? "false",
      generate_child_partner_link:
        role?.generate_child_partner_link ?? "false",
      default_route: role?.default_route ?? "",
      status: role?.status ?? 1,
    });
  }, [role]);

  const submitFormBuilderStep = async () => {
    const nested = buildNestedFormPayload(formValues) as Partial<RoleData>;
    const data: RoleData = {
      ...nested,
      user_type: String(nested.user_type ?? ""),
      code: String(nested.code ?? ""),
      name: String(nested.name ?? ""),
      status: Number(nested.status ?? 1),
      ...(role?.user_role_id ? { user_role_id: role.user_role_id } : {}),
      // Preserve partner_category across saves (legacy AddRoleAndRights parity).
      ...(role?.partner_category
        ? { partner_category: role.partner_category }
        : {}),
    };
    try {
      const saved = await save.mutateAsync(data);
      if (role?.partner_category) {
        saved.partner_category = role.partner_category;
      }
      setRole(saved);

      const isNew = !role?.user_role_id;
      if (isNew && saved.user_role_id != null) {
        setSavedRoleId(String(saved.user_role_id));
        navigate(
          `/settings/role/create/${String(saved.user_role_id)}#${saved.user_type}`,
          { replace: true }
        );
      }
      setActiveStep(activeStep + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save role");
    }
  };

  const submitAccessRightsStep = async () => {
    if (!role) return;
    const data: RoleData = { ...role };
    // Legacy AccessRights.submitData: blank partner_category for EMPLOYEE.
    if (data.user_type === "EMPLOYEE") data.partner_category = null;
    try {
      await save.mutateAsync(data);
      toast.success("Role Access Rights saved successfully");
      navigate("/settings/role");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  // Steps after the first need a saved role. Block forward navigation if not set.
  const canEnterLaterSteps = Boolean(role);
  const heading = routeId ? "Edit Role" : "Add Role";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {heading}
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/settings/role">
            <ArrowLeft className="h-4 w-4" /> Back to roles
          </Link>
        </Button>
      </div>

      {workflowLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading steps…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          No workflow configured for role creation yet. Configure a workflow
          with workflow_type &quot;{WorkflowType.RoleCreation}&quot; at{" "}
          <Link to="/settings/workflow" className="underline">
            Settings → Workflow
          </Link>
          .
        </div>
      ) : (
        <>
          <Stepper
            steps={steps.map((s) => s.name)}
            activeStep={activeStep}
            onStepClick={(i) => {
              if (i <= activeStep || canEnterLaterSteps) setActiveStep(i);
            }}
          />

          {activeStepDef?.ui_component === FORM_BUILDER_UI && (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {formJson ? (
                <FormBuilderRenderer
                  formJson={formJson}
                  value={formValues}
                  onChange={setFormValues}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  This step has no form_builder configuration.
                </p>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Button asChild type="button" variant="outline">
                  <Link to="/settings/role">Cancel</Link>
                </Button>
                <Button
                  type="button"
                  onClick={submitFormBuilderStep}
                  disabled={save.isPending}
                >
                  {save.isPending ? "Saving…" : "Save & Next"}
                </Button>
              </div>
            </div>
          )}

          {activeStepDef?.ui_component === ACCESS_RIGHTS_UI && role && (
            <div className="space-y-4">
              {role.user_type === "CHANNEL" && partnerCategories.length > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <Label className="text-sm">Partner Category</Label>
                  <NativeSelect
                    value={partnerCategory}
                    onChange={(v) => setPartnerCategory(v)}
                    options={partnerCategories.map((p) => ({
                      value: p.lu_key,
                      label: p.lu_value ?? p.lu_name,
                    }))}
                    placeholder="Select"
                  />
                </div>
              )}
              <AccessRights
                role={role}
                onChange={setRole}
                onBack={() => setActiveStep(activeStep - 1)}
                onSave={submitAccessRightsStep}
                saving={save.isPending}
              />
            </div>
          )}

          {activeStepDef &&
            ![FORM_BUILDER_UI, ACCESS_RIGHTS_UI].includes(
              activeStepDef.ui_component ?? ""
            ) && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
                This step (&quot;{activeStepDef.name}&quot;) isn&apos;t wired
                up yet — unrecognized ui_component &quot;
                {activeStepDef.ui_component ?? "none"}&quot;.
              </div>
            )}
        </>
      )}
    </div>
  );
}

function Stepper({
  steps,
  activeStep,
  onStepClick,
}: {
  steps: string[];
  activeStep: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {steps.map((label, i) => {
        const isDone = i < activeStep;
        const isActive = i === activeStep;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onStepClick(i)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? "bg-[#4C7DF0] text-white"
                : isDone
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                isActive
                  ? "bg-white/20 text-white"
                  : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {isDone ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-slate-800 outline-none focus:border-[#4C7DF0] focus:ring-2 focus:ring-[#4C7DF0]/20"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
