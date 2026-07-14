import React, { ChangeEvent } from 'react';
import { DynamicFieldProps } from '../types';  // Adjust the import path as needed


const CheckboxGroupField: React.FC<DynamicFieldProps> = ({ field, value = [], error, onChange, disabled }) => {
    // Ensure the value is always an array
    const currentValue: (string | number)[] = Array.isArray(value) ? value : [];

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value: checkboxValue, checked } = e.target;
        let newValue = [...currentValue]; // Clone the current value array

        if (checked) {
            newValue.push(checkboxValue);
        } else {
            newValue = newValue.filter((v) => v !== checkboxValue);
        }

        // onChange(newValue); // Pass the updated array of selected checkboxes
    };

    return (
        <div className="mb-3">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <div>
                {field.options?.map((option) => (
                    <div key={option.value} className="form-check">
                        <input
                            type="checkbox"
                            id={`${field.name}_${option.value}`}
                            value={option.value}
                            className="form-check-input"
                            checked={currentValue.includes(option.value)}
                            onChange={handleCheckboxChange}
                            disabled={disabled ?? false}
                        />
                        <label className="form-check-label" htmlFor={`${field.name}_${option.value}`}>
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>

            {/* Display validation error for the checkbox group */}
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default CheckboxGroupField;
