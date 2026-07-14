import React from "react";
import Select from "react-select";
import BaseDropdownField from "./BaseDropdownField";
import { DynamicFieldProps } from "../types";

const DropdownSearchField: React.FC<DynamicFieldProps> = (props) => {
    const formattedOptions = props.options?.map((opt) => ({
        value: opt.value,
        label: opt.label,
    })) ?? [];

    const currentValue = Array.isArray(props.value)
        ? formattedOptions.filter((opt) => props.value.includes(opt.value))
        : formattedOptions.find((opt) => opt.value === props.value);

    return (
        <BaseDropdownField
            {...props}
            renderDropdown={() => (
                <Select
                    id={props.field.name}
                    className={`react-select-container w-75 ${props.error ? 'is-invalid' : ''}`}
                    classNamePrefix="react-select"
                    value={currentValue}
                    onChange={(selectedOption) => {
                        if (props.field.fieldType?.includes("multi-select")) {
                            const values = Array.isArray(selectedOption)
                                ? selectedOption.map((option) => option.value)
                                : [];
                            props.onChange(values); // Convert array to comma-separated string
                        } else {
                            props.onChange((selectedOption as any)?.value || ""); // Single select case
                        }
                    }}
                    options={formattedOptions}
                    isDisabled={props.disabled ?? false}
                    isMulti={props.field.fieldType?.includes( "multi-select")}
                    isClearable
                    placeholder="Select an option"
                />
            )}
        />
    );
};

export default DropdownSearchField;
