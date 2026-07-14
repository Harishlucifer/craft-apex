import React, { useEffect, useState, useRef } from "react";
import { DynamicFieldProps, RequestAction } from "../types";
import DynamicForm from "./DynamicForm";
import ReactDOM from "react-dom";
import {fetchFieldOptions, submitAddMore} from "../redux/formSlice";
import { useAxios } from "../provider/AxiosProvider";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../redux/store";

const BaseDropdownField: React.FC<DynamicFieldProps & { renderDropdown: () => React.ReactNode }> = ({
    field,
    value,
    options,
    onChange,
    error,
    disabled,
    componentName,
    renderDropdown,
}) => {
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const dynamicFormRef = useRef<any>(null);
    const axiosInstance = useAxios();
    const dispatch = useDispatch<AppDispatch>();
    const formValues = useSelector((state: RootState) => state.form.values[componentName!] ?? {});  // Holds current form values

    const handleFormSubmitSuccess = async (data: Record<string, any>) => {
        if ((data["isValidForm"] ?? false) == true) {
            try {
                const result = await dispatch<any>(submitAddMore({
                    axiosInstance: axiosInstance,
                    data: data["data"],
                    requestAction: field.addMore?.requestAction!,
                    componentName: componentName!,
                })).unwrap(); // Unwrap the result

                console.log("Success:", result.status, result.message); // Handle success
                setModalOpen(false)

                await dispatch(fetchFieldOptions({ axiosInstance, field, formValues }));

            } catch (error: any) {
                console.error("Error:", error.message || "Something went wrong"); // Handle error
            }
        }
    };

    const triggerFormSubmit = () => {
        if (dynamicFormRef.current) {
            dynamicFormRef.current.submitFormExternally();
        }
    };

    useEffect(() => {
        if (!value && field.defaultValue) {
            onChange(field.defaultValue);
        }
    }, [field.defaultValue, value, onChange]);

    return (
        <>
            <div className="mb-3">
                <label htmlFor={field.name} className="form-label">
                    {field.label}
                    {field?.validation?.required && <span className="text-danger">*</span>}
                </label>
                <div className="input-group">
                    {renderDropdown()} {/* Render-specific dropdown passed as a prop */}
                    {field.addMore && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary ms-1"
                            onClick={() => setModalOpen(true)}
                            style={{ borderRadius: "0.375rem" }}
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                        </button>
                    )}
                    {error && <div className="invalid-feedback">{error}</div>}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen &&
                ReactDOM.createPortal(
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal show d-block">
                            <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
                                <div className="modal-content">
                                    <div className="modal-body">
                                        <DynamicForm
                                            ref={dynamicFormRef}
                                            componentName={"ADD_MORE_DYNAMIC_" + field.name}
                                            formJson={field.addMore!}
                                            onSubmitSuccess={handleFormSubmitSuccess}
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={triggerFormSubmit}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
};

export default BaseDropdownField;
