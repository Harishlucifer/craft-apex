import React, { useEffect, useState, ChangeEvent, MouseEvent } from 'react';
import { DynamicFieldProps } from '../types';  // Adjust the import path as needed


const TextAutoCompleteField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, options, disabled }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let _value: string | number = e.target.value;
        
        if (_value.toString().length >= (field.validation?.minLength ?? 0) && (options?.length ?? 0) > 0) {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }

        onChange(_value);
    };

    const autoCompleteSelect = (e: MouseEvent<HTMLLIElement>) => {
        let _value: string | number = e.currentTarget.getAttribute('value') || '';

        setShowDropdown(false);

        switch (field?.dataType) {
            case "int":
                _value = parseInt(_value);
                break;
            case "string":
                _value = _value.toString();
                break;
        }

        onChange(_value);
    };

    return (
        <div className="mb-3 position-relative">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <input
                type="text"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={value ?? ''}
                onChange={handleInputChange}
                disabled={disabled ?? false}
            />
            {error && <div className="invalid-feedback">{error}</div>}

            {showDropdown && (
                <ul className="dropdown-menu show w-100">
                    {options?.map((option) => (
                        <li
                            key={option.value}
                            value={option.value.toString()}
                            className="dropdown-item"
                            onClick={autoCompleteSelect}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TextAutoCompleteField;
