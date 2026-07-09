import React, { ChangeEvent } from 'react';
import { DynamicFieldProps } from '../types';

const TextareaField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        let _value: string | number | undefined = e.target.value;
        onChange(_value);  // Trigger the parent onChange handler
    };

    return (
        <div className="mb-3">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <textarea
                className={`form-control ${error ? 'is-invalid' : ''}`}
                id={field.name}
                value={value || ''}  // Ensure the value is controlled
                onChange={handleInputChange}  // Call the handler passed from parent
                placeholder={field.placeholder}
                disabled={disabled ?? false}
            />
            {error && <div className="invalid-feedback">{error}</div>}  {/* Show validation error message */}
        </div>
    );
};

export default TextareaField;
