import React, { ChangeEvent } from 'react';
import { DynamicFieldProps } from '../types'; // Adjust the path as per your project structure

const CheckboxField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked ? 1 : 0);  // Trigger the parent onChange handler with boolean-like values
    };

    return (
        <div className="mb-3 mt-4">
            <div className="form-check">
                <input
                    className={`form-check-input ${error ? 'is-invalid' : ''}`}
                    type="checkbox"
                    id={field.name}
                    checked={value === 1}  // Checked if the value is 1
                    onChange={handleInputChange}  // Use the common input handler
                    disabled={disabled ?? false}
                />
                <label className="form-check-label" htmlFor={field.name}>
                    {field.label}
                    {field?.validation?.required && <span className="text-danger">*</span>}
                </label>
                {error && <div className="invalid-feedback">{error}</div>}
            </div>
        </div>
    );
};

export default CheckboxField;
