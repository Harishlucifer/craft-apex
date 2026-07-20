import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useRoleDetail, useRoleFormLookups } from "./role-form.api";
import type { RoleData } from "./role-form.types";
import type { RoleStepContext } from "./role-form.steps";
import {
  buildNestedFormPayload,
  useSaveStepData,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Role create/edit. Driven by the generic MasterWorkflowPage (see routes.tsx);
 * this module supplies only the bespoke controller (FORM_BUILDER defaults +
 * payload, and the Access Rights step's context).
 */
export const roleMaster: MasterWorkflowPageProps = {
  noun: "Role",
  workflowType: WorkflowType.RoleCreation,
  listPath: "/settings/role",
  maxWidth: "max-w-5xl",
  emptyLabel: "role creation",
  useController: useRoleController,
};

function useRoleController({
  id,
  activeStep,
  setActiveStep,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const hashType = hash.startsWith("#") ? hash.substring(1) : "";
  const isChannel = hashType === "CHANNEL";

  // Lookups.
  const { data: lookups = [] } = useRoleFormLookups();
  const partnerCategories = useMemo(
    () => lookups.filter((l) => l.group_code === "PARTNER_CATEGORY"),
    [lookups],
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

  const save = useSaveStepData();

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
      generate_child_partner_link: role?.generate_child_partner_link ?? "false",
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
      const { result } = await save.mutateAsync({
        workflowType: WorkflowType.RoleCreation,
        data,
      });
      const saved = result as RoleData;
      if (role?.partner_category) {
        saved.partner_category = role.partner_category;
      }
      setRole(saved);

      const isNew = !role?.user_role_id;
      if (isNew && saved.user_role_id != null) {
        setSavedId(String(saved.user_role_id));
        navigate(
          `/settings/role/create/${String(saved.user_role_id)}#${saved.user_type}`,
          { replace: true },
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
      await save.mutateAsync({
        workflowType: WorkflowType.RoleCreation,
        data,
      });
      toast.success("Role Access Rights saved successfully");
      navigate("/settings/role");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & RoleStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: save.isPending,
    cancelHref: "/settings/role",
    role,
    onRoleChange: setRole,
    onSave: submitAccessRightsStep,
    saving: save.isPending,
    partnerCategories,
    partnerCategory,
    onPartnerCategoryChange: setPartnerCategory,
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(role),
  };
}
