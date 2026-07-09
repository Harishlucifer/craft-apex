import React, { ChangeEvent, useState, useEffect } from 'react';
import { DynamicFieldProps } from '../types';

const MonthField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const [years, setYears] = useState<number | string>(Math.floor((value || 0) / 12) || "");
    const [months, setMonths] = useState<number | string>((value || 0) % 12 || "");
    const [hasInteracted, setHasInteracted] = useState(false); // Track if user has interacted

    // Update the total months whenever years or months change, but only if the user has interacted
    useEffect(() => {
        if (hasInteracted) {
            const totalMonths = (parseInt(years as string) * 12 || 0) + (parseInt(months as string) || 0);
            onChange(totalMonths);  // Pass the total months value to the parent onChange handler
        }
    }, [years, months, onChange, hasInteracted]);

    const handleYearsChange = (e: ChangeEvent<HTMLInputElement>) => {
        setHasInteracted(true);  // Mark as interacted when the user changes something
        const yearValue = e.target.value === "" ? "" : parseInt(e.target.value);
        setYears(yearValue);
    };

    const handleMonthsChange = (e: ChangeEvent<HTMLInputElement>) => {
        setHasInteracted(true);  // Mark as interacted when the user changes something
        const monthValue = e.target.value === "" ? "" : parseInt(e.target.value);
        setMonths(monthValue);
    };

    return (
        <div className="mb-3">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <div className="d-flex">
                <div className="me-2" style={{ flex: 1 }}>
                    <input
                        type="number"
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        value={years}
                        onChange={handleYearsChange}
                        placeholder="Years"
                        disabled={disabled ?? false}
                        min={0}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        type="number"
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        value={months}
                        onChange={handleMonthsChange}
                        placeholder="Months"
                        disabled={disabled ?? false}
                        min={0}
                        max={11}
                    />
                </div>
            </div>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default MonthField;
