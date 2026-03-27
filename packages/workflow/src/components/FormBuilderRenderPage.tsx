import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { AxiosProvider, DynamicForm, Provider } from "craft-formbuilder";
import { useWorkflowStore } from "../store/workflowStore";
import type { StepComponentProps, FormDataRef } from "../types";
import "flatpickr/dist/flatpickr.min.css";

/**
 * FormBuilderRenderPage — Renders a dynamic form for a workflow step.
 *
 * Uses `craft-formbuilder` to render the form configuration attached to the
 * current workflow step.  Exposes `submitStepExternally` via ref so that
 * parent components can trigger submission from outside (e.g. the "Save & Next"
 * button in DynamicStagesAndSteps).
 *
 * Props:
 *  - step: the current Step object
 *  - handleSubmitSuccess: callback invoked with form data on successful submit
 *  - data: existing data to pre-fill the form
 *  - axiosInstance: (optional) axios instance for the form builder's API calls
 */

interface FormBuilderRenderPageProps extends StepComponentProps {
  axiosInstance?: any;
}

const FormBuilderRenderPage = forwardRef<any, FormBuilderRenderPageProps>(
  (props, ref) => {
    const formRef = useRef<FormDataRef>(null);
    const { currentStepData } = useWorkflowStore();

    const handleSubmitSuccess = (data: any) => {
      props.handleSubmitSuccess(data);
    };

    const triggerSubmit = () => {
      if (formRef.current != null) {
        formRef.current.submitFormExternally();
      } else {
        console.warn("[FormBuilderRenderPage] formRef is null — cannot submit");
      }
    };

    // Expose submitStepExternally to parent via ref
    useImperativeHandle(ref, () => ({
      submitStepExternally: () => {
        triggerSubmit();
      },
    }));

    // Inject Bootstrap CSS for the form builder (required by craft-formbuilder)
    useEffect(() => {
      const id = "bootstrap-css";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
        link.integrity =
          "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    }, []);

    return (
      <div>
        <Provider>
          <AxiosProvider axiosInstance={props.axiosInstance}>
            <DynamicForm
              componentName={currentStepData?.ui_component || "DynamicForm"}
              formJson={currentStepData?.configuration?.form_builder || {}}
              key={currentStepData?.id || "1"}
              ref={formRef}
              onSubmitSuccess={handleSubmitSuccess}
              existingObject={props?.data}
            />
          </AxiosProvider>
        </Provider>
      </div>
    );
  }
);

FormBuilderRenderPage.displayName = "FormBuilderRenderPage";

export default FormBuilderRenderPage;
