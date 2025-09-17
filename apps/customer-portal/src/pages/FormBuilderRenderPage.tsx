import {forwardRef, useEffect, useImperativeHandle, useRef} from "react";
import { AxiosProvider, DynamicForm, Provider } from "craft-ux";
import {StepComponentProps} from "@/pages/WorkflowStepComponentLoader.tsx";
import {useAxios} from "@/pages/helper/axiosInstance.tsx";
import {useWorkflowStore} from "@/stores/workflow.ts";
import "flatpickr/dist/flatpickr.min.css";

export interface FormDataRef {
    submitFormExternally: () => void;
}

const FormBuilderRenderPage = forwardRef((props : StepComponentProps,ref) => {
    const formRef = useRef<FormDataRef>(null);

    const {currentStepData}=useWorkflowStore()

    const handleSubmitSuccess = (data: any) => {
        console.log("submitted data", data);
        props.handleSubmitSuccess(data)
    };

    const triggerSubmit = () => {
        console.log('Form ref',formRef.current)
        if(formRef.current != null){
            formRef.current?.submitFormExternally();
        }else {
            console.log("formRef is null")
        }
    }
//submit the data to parent component
    useImperativeHandle(ref,()=>({
        submitStepExternally:()=>{
            triggerSubmit()
        }
    }))

    useEffect(() => {
        const id = "bootstrap-css";

        if (!document.getElementById(id)) {
            const bootstrapLink = document.createElement("link");
            bootstrapLink.id = id;
            bootstrapLink.rel = "stylesheet";
            bootstrapLink.href =
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
            bootstrapLink.integrity =
                "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH";
            bootstrapLink.crossOrigin = "anonymous";

            document.head.appendChild(bootstrapLink);
        }
    }, []);



    return (
        <div className={""}>
            <Provider>
                <AxiosProvider axiosInstance={useAxios()}>
                    <DynamicForm
                        componentName={currentStepData?.ui_component || "DynamicForm"}
                        formJson={currentStepData?.configuration?.form_builder || {}}
                        key={"1"}
                        ref={formRef}
                        onSubmitSuccess={handleSubmitSuccess}
                        existingObject={props?.data}
                    />
                </AxiosProvider>
            </Provider>
        </div>
    );
});

export default FormBuilderRenderPage;
