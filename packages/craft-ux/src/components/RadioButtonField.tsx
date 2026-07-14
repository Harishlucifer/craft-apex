import React, { ChangeEvent } from 'react';
import { DynamicFieldProps } from '../types';  // Adjust the path as needed

const RadioButtonField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let _value: string | number = e.target.value;
    onChange(_value);
  };

  return (
    <div className="mb-3">
      <label className="form-label">
        {field.label}
        {field?.validation?.required && <span className="text-danger">*</span>}
      </label>
      <div>
        {field.options?.map((option, index) => (
          <div key={index} className="form-check form-check-inline">
            <input
              className={`form-check-input ${error ? 'is-invalid' : ''}`}
              type="radio"
              id={`${field.name}-${index}`}
              name={field.name}
              value={option.value}
              checked={value == option.value}
              onChange={handleInputChange}
              disabled={disabled ?? false}
            />
            <label className="form-check-label" htmlFor={`${field.name}-${index}`}>
              {option.label}
            </label>
          </div>
        ))}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    </div>
  );
};

export default RadioButtonField;
