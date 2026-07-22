import {
  WorkflowType,
  type MasterController,
  type MasterWorkflowPageProps,
} from "@craft-apex/workflow-runtime";

/**
 * Lender Pincode upload — a single bespoke-step master (no id, no detail).
 * Driven by the generic MasterWorkflowPage (see routes.tsx). The whole screen
 * is the registered LENDER_PINCODE_UPLOAD step (see lender-pincode-form.steps),
 * which owns its own form state, validation, save, and navigation — so this
 * controller carries no form values or context.
 */
export const lenderPincodeMaster: MasterWorkflowPageProps = {
  noun: "Lender Pincode",
  staticHeading: "Lender Pincode Add",
  workflowType: WorkflowType.LenderPincodeUpload,
  listPath: "/settings/lender/pin-code/list",
  maxWidth: "max-w-5xl",
  emptyLabel: "lender pincode upload",
  useController: useLenderPincodeController,
};

function useLenderPincodeController(): MasterController {
  return {
    formValues: {},
    setFormValues: () => {},
    stepContext: {},
    singleStep: true,
  };
}
