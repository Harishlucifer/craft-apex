import React, { ChangeEvent, useState } from 'react';
import { DynamicFieldProps } from '../types';

const PasswordField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let _value: string | number | undefined = e.target.value;
        onChange(_value);  // Trigger the parent onChange handler
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className="mb-3">
            <label htmlFor={field.name} className="form-label">
                {field.label}
                {field?.validation?.required && <span className="text-danger">*</span>}
            </label>
            <div className="input-group">
                <input
                    type={isPasswordVisible ? "text" : "password"}  // Toggle between text and password
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    id={field.name}
                    value={value || ''}  // Ensure the value is controlled
                    onChange={handleInputChange}  // Call the handler passed from parent
                    placeholder={field.placeholder}
                    disabled={disabled ?? false}
                />
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={togglePasswordVisibility}
                >
                    <i className={isPasswordVisible ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
            </div>
            {error && <div className="invalid-feedback">{error}</div>}  {/* Show validation error message */}
        </div>
    );
};

export default PasswordField;
