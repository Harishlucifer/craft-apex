import React, { ChangeEvent, useEffect, useState } from 'react';
import { DynamicFieldProps } from '../types';
import { AmountExtractor } from '../utils/utils';

const AmountField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        if (value !== undefined && value !== null && value !== '' && !isNaN(Number(value))) {
            setDisplayValue(AmountExtractor(Number(value))); // Format value with commas
        } else {
            setDisplayValue(''); // Allow empty input
        }
    }, [value]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let rawValue = e.target.value.replace(/,/g, ''); // Remove commas

        // Allow only numbers with an optional decimal (single decimal point allowed)
        if (!/^\d*$/.test(rawValue)) {
            return; // Prevent invalid input
        }

        onChange(rawValue);
        setDisplayValue(rawValue); // Keep rawValue to allow in-progress decimal entry
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
                placeholder={field.placeholder}
                disabled={disabled ?? false}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default AmountField;
