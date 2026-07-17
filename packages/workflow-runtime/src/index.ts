export { WorkflowRuntime } from "./workflow-runtime";
export { OnboardingPage } from "./onboarding-page";
export { JourneyPicker } from "./journey-picker";
export { FormBuilderRenderer } from "./form-builder-renderer";
// Side-effect import: registers "FORM_BUILDER" in the step registry as soon
// as anything imports this package. It's the one step that's genuinely
// identical across every portal, so it self-registers rather than requiring
// each app to remember an extra registration line (unlike bespoke steps —
// see each app's own register-all-steps.ts). The `export type` alone
// wouldn't do this: type-only exports are erased at build time and never
// trigger the module's `registerStepComponent(...)` call.
import "./steps/form-builder-step";
import "./steps/esign-document-step";
export type { FormBuilderStepContext } from "./steps/form-builder-step";
export {
  UiComponentLoader,
  registerStepComponent,
  getStepComponent,
  type StepComponentProps,
} from "./step-component-registry";
export {
  useAsyncFieldOptions,
  buildNestedFormPayload,
} from "./form-builder-options";
export type {
  FormDefinition,
  FormFieldDef,
  FormFieldOption,
  FormSection,
} from "./form-builder.types";
export {
  buildWorkflow,
  executeWorkflow,
  hasStepSaveEndpoint,
  saveStepData,
  useBuildWorkflow,
  useExecuteWorkflow,
  useJourneyTypes,
  usePartnerDetail,
  useSavePartner,
  useSaveStepData,
} from "./workflow-runtime.api";
export {
  StepType,
  WorkflowType,
  type JourneyType,
  type WorkflowBuildResponse,
  type WorkflowStageDef,
  type WorkflowStepDef,
  type WorkflowTypeValue,
} from "./workflow-runtime.types";
