import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AxiosProvider, DynamicForm, Provider } from "craft-ux";
import { useAxios } from "@/helper/axiosInstance";

export interface FormDataRef {
    submitFormExternally: () => void;
}

interface FormRendererProps {
    componentName?: string;
    formJson: any;
    existingObject?: any;
    onSubmitSuccess: (data: any) => void;
}

const FormRenderer = forwardRef<FormDataRef, FormRendererProps>(({
    componentName = "DynamicForm",
    formJson,
    existingObject,
    onSubmitSuccess
}, ref) => {
    const formRef = useRef<FormDataRef>(null);

    useImperativeHandle(ref, () => ({
        submitFormExternally: () => {
            if (formRef.current) {
                formRef.current.submitFormExternally();
            }
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
        <Provider>
            <AxiosProvider axiosInstance={useAxios()}>
                <DynamicForm
                    componentName={componentName}
                    formJson={formJson}
                    key="1"
                    ref={formRef}
                    onSubmitSuccess={onSubmitSuccess}
                    existingObject={existingObject}
                />
            </AxiosProvider>
        </Provider>
    );
});

FormRenderer.displayName = 'FormRenderer';

export default FormRenderer;
export type { FormRendererProps };