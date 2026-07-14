// src/components/DyanmicForm.tsx

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    initializeForm, fetchFieldOptions, validateField, handleAutoFill, handleChange, handleAddMore,
    handleDynamicFormSubmit as reduxFormSubmit, setDisable, removeMore, processFieldLogic,
    shouldRenderField
} from '../redux/formSlice';
import FormField from './FormField';
import { AppDispatch, RootState, store } from '../redux/store'; // Assuming you have RootState type
import { DynamicFormProps, Field, FormDefinition, Section, } from '../types'
import { useAxios } from '../provider/AxiosProvider';


const DynamicForm = forwardRef(({
    componentName,
    formJson,
    existingObject,
    includeSubmit = false,
    onSubmitSuccess,
}: DynamicFormProps, ref) => {
    const axiosInstance = useAxios();
    const formValues = useSelector((state: RootState) => state.form.values[componentName] ?? {});  // Holds current form values
    const formOptions = useSelector((state: RootState) => state.form.options);  // Holds available options
    const formErrors = useSelector((state: RootState) => state.form.errors[componentName] ?? {}); // Hold form errors
    const fields = useSelector((state: RootState) => state.form.allFields);
    const formDefinition = useSelector((state: RootState) => state.form.formDefinitions[componentName]);
    const fieldsDisabled = useSelector((state: RootState) => state.form.fieldsDisabled);
    const formTouched = useSelector((state: RootState) => state.form.touched[componentName] ?? {})
    const dispatch = useDispatch<AppDispatch>();

    // Initialize form fields (with default values and hidden fields)
    useEffect(() => {
        dispatch(initializeForm({ formDefinition: formJson, existingData: existingObject, componentName }));
    }, [dispatch, formJson, existingObject]);

    useEffect(() => {
        fields.forEach((field: Field) => {
            dispatch(processFieldLogic({ axiosInstance, field, formValues }));
        });
    }, [dispatch, fields, formValues, axiosInstance]);

    // UseImperativeHandle allows you to expose functions to parent via ref
    useImperativeHandle(ref, () => ({
        submitFormExternally: async () => {
            try {
                dispatch(reduxFormSubmit());  // Use unwrap to get the payload
                const form = store.getState().form
                const latestFinalData = form.nestedObject;
                const definition = form.formDefinitions[componentName]
                if (onSubmitSuccess) {
                    onSubmitSuccess({
                        "data": latestFinalData,
                        "isValidForm": definition.formValidation === "optional" && !Object.values(form.touched[componentName] ?? {}).some(touch => touch) ? true : !Object.values(form.errors[componentName] ?? {}).some(error => error)
                    });  // Return the constructed data
                }
            } catch (error) {
                console.error('Form submission failed: ', error);
            }
        }
    }));


    const handleSubmit = (e: Event) => {
        e.preventDefault();
        // dispatch(handleDynamicFormSubmit);
    };

    // Conditional rendering logic for fields
    const shouldRenderFieldR = (field: Field): boolean => {
        if (field.hidden) {
            return false; // Skip rendering hidden fields
        }

        if (field.conditionalOn) {
            const { field: conditionalField, values, conditionalValueKey = 'value', operator = 'eq' } = field.conditionalOn;
            const selectedValue = formValues[conditionalField];
            const fieldOptions = formOptions[conditionalField] || [];

            // Find the selected option for the conditional field
            const selectedOption = fieldOptions.find((option: any) => option.value == selectedValue);

            if (selectedOption) {
                const selectedKeyValue = selectedOption.item?.[conditionalValueKey] || selectedOption[conditionalValueKey];

                if (operator === 'eq') {
                    // Show field if selected value matches any value in `values`
                    return values.includes(selectedKeyValue);
                } else if (operator === 'neq') {
                    // Hide field if selected value matches any value in `values`
                    return !values.includes(selectedKeyValue);
                }
            } else {
                if (operator === 'eq') {
                    // Show field if selected value matches any value in `values`
                    return values.includes(selectedValue ?? 'undefined');
                } else if (operator === 'neq') {
                    // Hide field if selected value matches any value in `values`
                    return !values.includes(selectedValue ?? 'undefined');
                }
            }

            return false;
        }

        return true; // Render normally if no conditionalOn or hidden property
    };

    /*const replaceIndexInFields = (fields: Field[], index: number): Field[] => {
        return fields.map((field) => {
            const updatedField: Field = {
                ...field, // Spread original field properties
                name: field.name ? field.name.replace("{index}", index.toString()) : field.name,
                source: field.source
                    ? {
                        ...field.source, // Clone source object
                        api: field.source.api
                            ? field.source.api.replace("{index}", index.toString())
                            : field.source.api,
                    }
                    : undefined,
                conditionalOn: field.conditionalOn?.field?.includes("{index}")
                    ? {
                        ...field.conditionalOn,
                        field: field.conditionalOn.field.replace("{index}", index.toString()),
                    }
                    : field.conditionalOn,
                dependentOn: Array.isArray(field.dependentOn)
                    ? field.dependentOn.map((dependency) =>
                        dependency.includes("{index}")
                            ? dependency.replace("{index}", index.toString())
                            : dependency
                    )
                    : field.dependentOn,
                autoFill: field.autoFill
                    ? field.autoFill.map((autoFill) => ({
                        ...autoFill, // Clone the autoFill object
                        mappings: autoFill.mappings.map((mapping) => ({
                            ...mapping, // Clone each mapping object
                            sourceField: mapping.sourceField?.includes("{index}")
                                ? mapping.sourceField.replace("{index}", index.toString())
                                : mapping.sourceField,
                            targetField: mapping.targetField?.includes("{index}")
                                ? mapping.targetField.replace("{index}", index.toString())
                                : mapping.targetField,
                        })),
                        condition: autoFill.condition?.field?.includes("{index}")
                            ? {
                                ...autoFill.condition, // Clone the condition object
                                field: autoFill.condition.field.replace("{index}", index.toString()),
                            }
                            : autoFill.condition,
                    }))
                    : field.autoFill,
            };

            return updatedField;
        });
    };*/

    const replaceIndexInFields = (fields: Field[], index: number): Field[] => {
        return fields.map((field) => {

            const updatedField: Field = {
                ...field,
                name: field.name ? field.name.replace("{index}", index.toString()) : field.name,

                source: field.source
                    ? {
                        ...field.source,
                        api: field.source.api ? field.source.api.replace("{index}", index.toString()) : field.source.api,
                    }
                    : undefined,

                conditionalOn: field.conditionalOn && typeof field.conditionalOn.field === "string"
                    ? {
                        ...field.conditionalOn,
                        field: field.conditionalOn.field.replace("{index}", index.toString()),
                    }
                    : field.conditionalOn,

                dependentOn: Array.isArray(field.dependentOn)
                    ? field.dependentOn.map((dependency) =>
                        typeof dependency === "string" && dependency.includes("{index}")
                            ? dependency.replace("{index}", index.toString())
                            : dependency
                    )
                    : field.dependentOn,

                autoFill: Array.isArray(field.autoFill)
                    ? field.autoFill.map((autoFill) => ({
                        ...autoFill,
                        mappings: Array.isArray(autoFill.mappings)
                            ? autoFill.mappings.map((mapping) => ({
                                ...mapping,
                                sourceField:
                                    typeof mapping.sourceField === "string" &&
                                    mapping.sourceField.includes("{index}")
                                        ? mapping.sourceField.replace("{index}", index.toString())
                                        : mapping.sourceField,
                                targetField:
                                    typeof mapping.targetField === "string" &&
                                    mapping.targetField.includes("{index}")
                                        ? mapping.targetField.replace("{index}", index.toString())
                                        : mapping.targetField,
                            }))
                            : [],
                        condition:
                            autoFill.condition &&
                            typeof autoFill.condition.field === "string" &&
                            autoFill.condition.field.includes("{index}")
                                ? {
                                    ...autoFill.condition,
                                    field: autoFill.condition.field.replace("{index}", index.toString()),
                                }
                                : autoFill.condition,
                    }))
                    : undefined,
            };

            return updatedField;
        });
    };


    const renderFields = (fields: Field[], index: number | null, sectionStyle?: string, formValidation?: string) => {
        const updatedFields = index !== null ? replaceIndexInFields(fields, index) : fields;

        // console.log("updatedFields :: ", updatedFields)
        return updatedFields?.map((field) => {
            const renderField = shouldRenderFieldR(field);
            if (!renderField) return null;

            return (
                <div key={field.name} className={field.fieldStyle ?? sectionStyle ?? "col-xl-3 col-lg-4 col-md-6 col-sm-12"}>
                    <FormField
                        fieldKey={field.name}
                        field={field}
                        value={formValues[field.name]}
                        options={formOptions[field.name]} // Options as used only for dropdown value for other things like checkbox and radio button its taken from field.options
                        error={formValidation == null ? formErrors[field.name] : formValidation === "optional" && !Object.values(formTouched).some(touch => touch) ? '' : formErrors[field.name]}
                        onChange={(value: any) => dispatch(handleChange({ field, value }))}
                        disabled={fieldsDisabled[field.name]}
                        componentName={componentName}
                    />
                </div>
            );
        });
    };

    const LoadForm = () => {
        let condition = ""
        if (formDefinition && formDefinition.sections && formDefinition.repeatable) {
            condition = "REPEAT_SECTIONS";
        } else if (formDefinition && formDefinition.sections) {
            condition = "SECTIONS";
        } else if (formDefinition && formDefinition.repeatable) {
            condition = "REPEATABLE";
        } else if (formDefinition && formDefinition.fields) {
            condition = "FIELDS";
        }

        switch (condition) {
            case "REPEAT_SECTIONS":
                return <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>{formDefinition.title}</h3>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                                dispatch(
                                    handleAddMore({
                                        componentName,
                                        startWithIndex: formDefinition.startWithIndex ?? 0,
                                    })
                                )
                            }>
                            <i className="bi bi-plus-circle-fill"></i> {formDefinition.title}
                        </button>
                    </div>
                    {Array.from({ length: (formDefinition.startWithIndex ?? 0) + 1 }).map((_, repeatIndex) => (
                        <div key={`section-${repeatIndex}`} className={formDefinition.globalSectionStyle ?? "d-flex card p-4 border mb-3 gap-4"}>
                            {/* <div className="d-flex justify-content-between align-items-center">
                                <h4>{formDefinition.title}</h4>

                            </div> */}
                            {formDefinition?.sections?.map((section: Section, sectionIndex: number) => (
                                <div key={`${repeatIndex}-${sectionIndex}`} className="form-section border rounded py-4 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5>{section.title}</h5>
                                        {sectionIndex === 0 ? <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => dispatch(
                                                removeMore({
                                                    axiosInstance,
                                                    componentName,
                                                    index: repeatIndex,
                                                })
                                            )
                                            }>
                                            <i className="bi bi-trash-fill"></i> {formDefinition.title}
                                        </button> : ""}
                                    </div>
                                    <hr></hr>
                                    <div className="row">
                                        {renderFields(section.fields, repeatIndex, formDefinition.sectionStyle, formDefinition.formValidation)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </>
                break
            case "SECTIONS":
                return formDefinition?.sections?.map((section: Section, sectionIndex: number) => (
                    <div key={sectionIndex} className="form-section mb-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h4>{section.title}</h4>
                        </div>
                        <div className="row border rounded py-4 px-2">
                            {renderFields(section.fields, null, formDefinition.sectionStyle, formDefinition.formValidation)}
                        </div>
                    </div>
                ))
                break
            case "REPEATABLE":
                return <>
                    {Array.from({ length: (formDefinition.startWithIndex ?? 0) + 1 }).map((_, repeatIndex) => (
                        <div key={`fields-${repeatIndex}`} className="card mb-4 p-4 border">
                            <div className="form-fields row">
                                {renderFields(formDefinition?.fields!, repeatIndex, formDefinition.sectionStyle, formDefinition.formValidation)}
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-3"
                        onClick={() =>
                            dispatch(
                                handleAddMore({
                                    componentName,
                                    startWithIndex: formDefinition.startWithIndex ?? 0,
                                })
                            )
                        }
                    >
                        <i className="bi bi-plus-circle-fill"></i> Add More Fields
                    </button>
                </>
                break
            case "FIELDS":
                return <div className="form-fields row">
                    {renderFields(formDefinition.fields!, null, formDefinition.sectionStyle, formDefinition.formValidation)}
                </div>
            default:
                return
        }
    }

    return (
        <div>
            <form key={componentName} className={formDefinition?.formStyle ?? "container row mt-4"} onSubmit={() => handleSubmit}>
                {LoadForm()}
                {includeSubmit && (
                    <button type="submit" className="btn btn-primary mt-4">
                        Submit
                    </button>
                )}
            </form>
        </div>
    );
});

export default DynamicForm;
