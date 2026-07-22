import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useEmployeeDetail } from "./employee-form.api";
import type { EmployeeSavePayload } from "./employee-form.types";
import type { EmployeeStepContext } from "./employee-form.steps";
import {
  buildNestedFormPayload,
  WorkflowType,
  type FormBuilderStepContext,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Employee create/edit. Driven by the generic MasterWorkflowPage (see
 * routes.tsx); this module supplies only the bespoke controller (FORM_BUILDER
 * defaults + payload, and the address / territory-map / allocation steps'
 * context).
 */
export const employeeMaster: MasterWorkflowPageProps = {
  noun: "Employee",
  workflowType: WorkflowType.EmployeeCreation,
  listPath: "/settings/employee",
  maxWidth: "max-w-5xl",
  emptyLabel: "employee creation",
  useController: useEmployeeController,
};

function useEmployeeController({
  id,
  advance,
  saving,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useEmployeeDetail(id);

  // Dropdown options (role/hierarchy/reportsTo/office) are no longer fetched
  // here — FormBuilderRenderer resolves each field's options itself via its
  // `source.api` config, which the backend's form_builder JSON should point
  // at the same endpoints employee-form.api.ts used to call directly.

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  // Keys mirror the form_builder field `name`s, which in turn mirror
  // EmployeeSavePayload's JSON structure exactly (e.g. "user_role.role_id",
  // not an alias like "role") — see buildNestedFormPayload below.
  useEffect(() => {
    setFormValues({
      employee_code: detail?.employee_code ?? "",
      name: detail?.name ?? "",
      email: detail?.email ?? "",
      designation: detail?.designation ?? "",
      mobile: detail?.mobile ?? "",
      "user_role.role_id":
        detail?.user_role?.role_id != null
          ? String(detail.user_role.role_id)
          : "",
      hierarchy_level: detail?.hierarchy_level ?? "",
      "supervisor_user.user_id":
        detail?.supervisor_user?.user_id != null
          ? String(detail.supervisor_user.user_id)
          : "",
      "office_detail.office_id":
        detail?.office_detail?.office_id != null
          ? String(detail.office_detail.office_id)
          : "",
      status: detail?.status != null ? Number(detail.status) : 1,
      password: "",
      confirmPassword: "",
    });
  }, [detail]);

  const submitFormBuilderStep = async () => {
    const password = formValues.password ? String(formValues.password) : "";
    const confirmPassword = formValues.confirmPassword
      ? String(formValues.confirmPassword)
      : "";
    if (!id && (!password || !confirmPassword)) {
      toast.error("Password and confirmation are required");
      return;
    }
    if (password && password !== confirmPassword) {
      toast.error("Passwords must match");
      return;
    }

    // Field `name`s already mirror the payload's JSON path, so the nested
    // shape falls out of the flat formValues automatically.
    const { password: _pw, confirmPassword: _cpw, ...fields } = formValues;
    const nested = buildNestedFormPayload(
      fields,
    ) as Partial<EmployeeSavePayload>;

    const payload: EmployeeSavePayload = {
      ...nested,
      employee_code: String(nested.employee_code ?? ""),
      mobile: String(nested.mobile ?? ""),
      email: String(nested.email ?? ""),
      name: String(nested.name ?? ""),
      status: Number(nested.status ?? 1),
      user_role: { role_id: String(nested.user_role?.role_id ?? "") },
      supervisor_user: nested.supervisor_user?.user_id
        ? { user_id: String(nested.supervisor_user.user_id) }
        : undefined,
      office_detail: nested.office_detail?.office_id
        ? { office_id: String(nested.office_detail.office_id) }
        : undefined,
      ...(password ? { password } : {}),
      ...(detail?.employee_id
        ? { employee_id: detail.employee_id }
        : id
          ? { employee_id: id }
          : {}),
      ...(detail?.user_id ? { user_id: detail.user_id } : {}),
      // Preserve nested arrays from detail (territory map / allocation / address)
      // so saves don't drop step-2/3/4 state.
      territory_loan_map: detail?.territory_loan_map,
      user_allocation: detail?.user_allocation,
      user_address: detail?.user_address,
      data: detail?.data,
    };
    const res = await advance(payload);
    if (!res) return;
    // create lands the id at result.sourceId (employee_id); on edit it's
    // preserved. Record it so steps 2–4 and the workflow rebuild pick it up.
    const newId = res.sourceId ?? id;
    if (newId && newId !== id) {
      setSavedId(String(newId));
    }
    toast.success(`Employee ${id ? "updated" : "saved"} successfully`);
    // The server's resume (last_active_step_id) advances the stepper.
  };

  // Steps 2–4 need a saved employee id. Block forward navigation if not set.
  const stepEmployeeId = id ?? "";

  // Union of everything any of this page's registered steps might need —
  // whichever step is active reads only the keys its own adapter expects.
  const stepContext: FormBuilderStepContext & EmployeeStepContext = {
    onSubmit: submitFormBuilderStep,
    submitting: saving,
    submitLabel: id ? "Save & Next" : "Create & Next",
    cancelHref: "/settings/employee",
    lockField: "employee_code",
    lockWhen: id,
    employeeId: stepEmployeeId,
    employeeName: detail?.name,
    employee: {
      username: detail?.name,
      id: detail?.user_id ?? detail?.employee_id,
    },
    // Bespoke steps (address/territory/allocation) call this after their own
    // save so the step executes (creating its Task) and the server resumes.
    advance,
    onAllocationSave: async () => {
      await advance();
      navigate("/settings/employee");
    },
  };

  return {
    formValues,
    setFormValues,
    stepContext,
    canEnterLaterSteps: Boolean(stepEmployeeId),
  };
}
