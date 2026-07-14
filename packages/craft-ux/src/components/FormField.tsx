import React from 'react';
import TextField from './TextField';
import DropdownField from './DropdownField';
import RadioButtonField from './RadioButtonField';
import CheckboxField from './CheckboxField';
import CheckboxGroupField from './CheckboxGroupField';
import TextAutoCompleteField from './TextAutoCompleteField';
import DatePickerField from './DatePickerField';
import TextareaField from './TextareaField';
import {Field, DynamicFieldProps} from '../types';  // Adjust the path based on your project structure
import PasswordField from './PasswordField';
import MonthField from './MonthField';
import AmountField from './AmountField';
import DropdownSearchField from './DropdownSearchField';
import DecimalField from './DecimalField';

const FormField: React.FC<DynamicFieldProps> = ({
    fieldKey,
    field,
    options,
    value,
    error,
    onChange,
    disabled,
    componentName
}) => {
    let fieldComponent;

    switch (field.fieldType) {
        case 'text':
            fieldComponent = (
                <TextField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'amount':
            fieldComponent = (
                <AmountField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'decimal':
            fieldComponent = (
                <DecimalField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'password':
            fieldComponent = (
                <PasswordField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'month':
            fieldComponent = (
                <MonthField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'dropdown':
            fieldComponent = (
                <DropdownField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    options={options || []}  // Provide dropdown options
                    onChange={onChange}
                    error={error}  // Pass validation error to DropdownField
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'dropdown-multi-select':
        case 'dropdown-search':
            fieldComponent = (
                <DropdownSearchField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    options={options || []}  // Provide dropdown options
                    onChange={onChange}
                    error={error}  // Pass validation error to DropdownField
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'radio':
            fieldComponent = (
                <RadioButtonField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'checkbox':
            fieldComponent = (
                <CheckboxField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'checkbox-group':
            fieldComponent = (
                <CheckboxGroupField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'text-auto-complete':
            fieldComponent = (
                <TextAutoCompleteField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    error={error}
                    onChange={onChange}
                    options={options || []}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'date-picker':
            fieldComponent = (
                <DatePickerField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        case 'textarea':
            fieldComponent = (
                <TextareaField
                    fieldKey={fieldKey}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    componentName={componentName}
                />
            );
            break;
        default:
            fieldComponent = null;
    }

    return (
        <div key={fieldKey} className="mb-3">
            {fieldComponent}
            {/* {error && <div className="invalid-feedback">{error}</div>} */}
        </div>
    );
};

export default FormField;
