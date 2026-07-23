import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@craft-apex/ui";
import { useTemplateDetail } from "./notification-template-form.api";
import { useServiceProviderList } from "@/features/service-provider/service-provider-list/service-provider-list.api";
import type { ServiceProviderRow } from "@/features/service-provider/service-provider-list/service-provider-list.types";
import type {
  ParameterAssociate,
  SelectedProvider,
  TemplateDetail,
  TemplateSavePayload,
} from "./notification-template-form.types";
import type {
  TemplateFieldValues,
  TemplateStepContext,
} from "./notification-template-form.steps";
import {
  WorkflowType,
  type MasterController,
  type MasterControllerArgs,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Communication Template create/edit. Both steps are bespoke ui_components
 * (see .steps.tsx) — "Select Provider Type" then "Template" — matching the
 * legacy 2-step wizard exactly, with no FORM_BUILDER involved.
 *
 * Only the Template step actually persists: alpha-api's CreateOrUpdateTemplate
 * requires the full TemplateParams (name/module/service_type/template/status
 * are all `validate:"required"`) in one POST, and the legacy wizard likewise
 * never saved after step 1 — "Select Provider Type" is purely a client-side
 * selection (its "Save & Next" just calls `onNext()`, no `advance()`), and
 * "Template" bundles the provider choice + all fields + parameter mappings
 * into the one and only `advance()` call.
 *
 * State mirrors doc-checklist-form.page.tsx: a `templateData` snapshot is
 * seeded once from the detail query (edit mode) and thereafter overwritten
 * synchronously from the save's own response.
 */
export const templateMaster: MasterWorkflowPageProps = {
  noun: "Communication Template",
  workflowType: WorkflowType.CommunicationTemplateCreation,
  listPath: "/settings/template/list",
  maxWidth: "max-w-6xl",
  emptyLabel: "communication template creation",
  useController: useCommunicationTemplateController,
};

function useCommunicationTemplateController({
  id,
  advance,
  saving,
  setSavedId,
}: MasterControllerArgs): MasterController {
  const navigate = useNavigate();

  const { data: detail } = useTemplateDetail(id);
  const { data: providers = [] } = useServiceProviderList();

  const [templateData, setTemplateData] = useState<TemplateDetail | null>(
    null,
  );
  useEffect(() => {
    if (detail && !templateData) setTemplateData(detail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const [selectedProvider, setSelectedProvider] =
    useState<SelectedProvider | null>(null);
  useEffect(() => {
    if (templateData?.service_provider) {
      setSelectedProvider(templateData.service_provider);
    }
  }, [templateData?.service_provider]);

  const [fields, setFields] = useState<TemplateFieldValues>({
    name: "",
    module: "",
    template: "",
    templateId: "",
    flowId: "",
    status: 1,
  });
  useEffect(() => {
    setFields({
      name: templateData?.name ?? "",
      module: templateData?.module ?? "",
      template: templateData?.template ?? "",
      templateId:
        templateData?.template_id != null
          ? String(templateData.template_id)
          : "",
      flowId:
        templateData?.flow_id != null ? String(templateData.flow_id) : "",
      status: templateData?.status != null ? Number(templateData.status) : 1,
    });
  }, [templateData]);

  const [parameters, setParameters] = useState<ParameterAssociate[]>([]);
  useEffect(() => {
    setParameters(
      Array.isArray(templateData?.parameter_associate)
        ? templateData!.parameter_associate!
        : [],
    );
  }, [templateData?.parameter_associate]);

  const onSelectProvider = (p: ServiceProviderRow) => {
    if (p.id == null) return;
    setSelectedProvider({
      service_id: String(p.id),
      provider_name: p.name ?? "",
      type: p.type ?? "",
    });
  };

  const onFinish = async () => {
    if (!selectedProvider) {
      toast.error("Please select a Service Provider");
      return;
    }

    const payload: TemplateSavePayload = {
      ...(templateData?.id ? { id: templateData.id } : id ? { id } : {}),
      name: fields.name,
      module: fields.module,
      service_type: selectedProvider.type,
      template: fields.template,
      service_provider: {
        ...selectedProvider,
        // ServiceProviderParams.ServiceId is a plain Go int — must go over
        // the wire as a real unquoted number, not a string. Real provider
        // ids exceed Number.MAX_SAFE_INTEGER, so bigint (which the api
        // client's json-bigint transform serializes correctly) is the only
        // type that survives without precision loss (see SelectedProvider's
        // doc comment in notification-template-form.types.ts).
        service_id:
          typeof selectedProvider.service_id === "bigint"
            ? selectedProvider.service_id
            : BigInt(selectedProvider.service_id),
      },
      template_id: fields.templateId || undefined,
      flow_id: fields.flowId || undefined,
      status: Number(fields.status),
      parameter_associate: parameters,
    };

    const res = await advance(payload);
    if (!res) return;
    if (res.result) setTemplateData(res.result as TemplateDetail);
    const newId = res.sourceId ?? id;
    if (newId && newId !== id) setSavedId(String(newId));
    toast.success(
      `Communication template ${id ? "updated" : "created"} successfully`,
    );
    navigate("/settings/template/list");
  };

  const stepContext: TemplateStepContext = {
    providers,
    selectedProviderId: selectedProvider?.service_id,
    onSelectProvider,
    fields,
    onFieldsChange: (patch) => setFields((f) => ({ ...f, ...patch })),
    providerType: selectedProvider?.type ?? "",
    parameters,
    onParametersChange: setParameters,
    onFinish,
    saving,
  };

  return {
    // Neither bespoke step reads the generic formValues/setFormValues channel
    // (they use `context` exclusively, same as doc-checklist's steps) — these
    // are stubs to satisfy the MasterController shape.
    formValues: {},
    setFormValues: () => {},
    stepContext,
    canEnterLaterSteps: Boolean(id),
  };
}
