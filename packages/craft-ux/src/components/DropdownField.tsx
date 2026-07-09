import React from "react";
import BaseDropdownField from "./BaseDropdownField";
import { DynamicFieldProps } from "../types";

const DropdownField: React.FC<DynamicFieldProps> = (props) => {
    return (
        <BaseDropdownField
            {...props}
            renderDropdown={() => (
                <select
                    className={`form-control form-select ${props.error ? "is-invalid" : ""}`}
                    id={props.field.name}
                    value={props.value || ""}
                    onChange={(e) => props.onChange(e.target.value)}
                    disabled={props.disabled ?? false}
                    style={{ borderRadius: "0.375rem" }}
                >
                    <option value="">Select an option</option>
                    {props.options?.map((opt, index) => (
                        <option key={`${opt.value}-${index}`} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            )}
        />
    );
};

export default DropdownField;
