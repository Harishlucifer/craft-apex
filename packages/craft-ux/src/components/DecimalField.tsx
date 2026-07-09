import React, { ChangeEvent, useEffect, useState } from 'react';
import { DynamicFieldProps } from '../types';
import { AmountExtractor } from '../utils/utils';

const DecimalField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        if (value !== undefined && value !== null && value !== '') {
            setDisplayValue(value.toString()); // Keep value as a string to allow trailing zeros
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let rawValue = e.target.value.replace(/,/g, ''); // Remove commas

        // Allow only numbers with a single decimal point
        if (!/^\d*\.?\d*$/.test(rawValue)) {
            return;
        }

        // Prevent removing trailing zero after decimal (like 100.90)
        setDisplayValue(rawValue);
        onChange(rawValue);
    };

    const handleBlur = () => {
        // Apply formatting on blur (convert to number format with commas)
        if (displayValue !== '' && !isNaN(Number(displayValue))) {
            setDisplayValue(AmountExtractor(Number(displayValue))); // Format number
        }
    };

    return (
        <div className="mb-3">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <input
                type="text"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                id={field.name}
                value={displayValue}
                onChange={handleInputChange}
                // onBlur={handleBlur} // Format when focus is lost
                placeholder={field.placeholder}
                disabled={disabled ?? false}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default DecimalField;
