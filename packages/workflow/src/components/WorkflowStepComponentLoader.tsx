import { forwardRef } from "react";
import FormBuilderRenderPage from "./FormBuilderRenderPage";
import { CreditBureau } from "./CreditBureau";
import type { Step, StepComponentProps } from "../types";

/**
 * WorkflowStepComponentLoader — Routes a workflow step to its corresponding
 * UI component based on `step.ui_component`.
 *
 * Currently supports:
 *  - `FORM_BUILDER`  → FormBuilderRenderPage
 *  - `CREDIT_BUREAU` → CreditBureau
 *
 * Add new cases to the switch statement as new step component types are
 * introduced.
 */

interface WorkflowStepComponentLoaderProps extends StepComponentProps {
  axiosInstance?: any;
  /** V1 version of the data (fetched in parallel with V2) */
  dataV1?: any;
}

const WorkflowStepComponentLoader = forwardRef<any, WorkflowStepComponentLoaderProps>(
  (props, ref) => {
    const stepProps = {
      step: props.step,
      handleSubmitSuccess: props.handleSubmitSuccess,
      ref,
      data: props.data,
      dataV1: props.dataV1,
      axiosInstance: props.axiosInstance,
    };

    switch (props.step.ui_component) {
      case "FORM_BUILDER":
        return <FormBuilderRenderPage {...stepProps} />;

      case "CREDIT_BUREAU":
        return <CreditBureau {...stepProps} />;

      default:
        return (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Component Not Found
              </h3>
              <p className="text-sm text-gray-500">
                <code className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {props.step.ui_component}
                </code>{" "}
                is not a recognised step component.
              </p>
            </div>
          </div>
        );
    }
  }
);

WorkflowStepComponentLoader.displayName = "WorkflowStepComponentLoader";

export default WorkflowStepComponentLoader;
