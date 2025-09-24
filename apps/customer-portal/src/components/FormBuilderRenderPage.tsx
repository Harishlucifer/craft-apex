import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { AxiosProvider, DynamicForm, Provider } from "craft-ux";
import { StepComponentProps } from "./WorkflowStepComponentLoader";
import { useAxios } from "@/helper/axiosInstance";
import { useWorkflowStore } from "@/stores/workflow.ts";
import "flatpickr/dist/flatpickr.min.css";
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export interface FormDataRef {
    submitFormExternally: () => void;
}

const FormBuilderRenderPage = forwardRef((props: StepComponentProps, ref) => {
    const formRef = useRef<FormDataRef>(null);
    const { currentStepData } = useWorkflowStore();

    const handleSubmitSuccess = (data: any) => {
        console.log("submitted data", data);
        props.handleSubmitSuccess(data);
    };

    const triggerSubmit = () => {
        console.log('Form ref', formRef.current);
        if (formRef.current != null) {
            formRef.current?.submitFormExternally();
        } else {
            console.log("formRef is null");
        }
    };

    const handleBackClick = () => {
        if (props.handleBack) {
            props.handleBack();
        } else if (props.onBack) {
            props.onBack();
        }
    };

    // Submit the data to parent component
    useImperativeHandle(ref, () => ({
        submitStepExternally: () => {
            triggerSubmit();
        }
    }));

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
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-lg border-0 bg-white">
                    <CardContent className="p-6 md:p-8 lg:p-10">
                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {currentStepData?.name || 'Form'}
                            </h1>
                            {currentStepData?.description && (
                                <p className="text-gray-600 text-sm md:text-base">
                                    {currentStepData.description}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        <div className="mb-8">
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

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                            {/* Back Button - Left Corner */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBackClick}
                                className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                disabled={!props.handleBack && !props.onBack}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>

                            {/* Save & Next Button - Right Corner */}
                            <Button
                                onClick={triggerSubmit}
                                type="button"
                                className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                            >
                                Save & Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

export default FormBuilderRenderPage;
