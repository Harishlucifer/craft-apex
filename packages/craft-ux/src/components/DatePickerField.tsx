import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { format, parse, parseISO, isValid } from 'date-fns';
import { DynamicFieldProps } from '../types';

const parseDateValue = (dateStr: string, placeholder?: string): Date | null => {
  if (!dateStr) return null;

  // Try ISO first
  let parsed = parseISO(dateStr);
  if (isValid(parsed)) return parsed;

  const formatMap: Record<string, string> = {
    'd-m-Y': 'dd-MM-yyyy',
    'm-d-Y': 'MM-dd-yyyy',
    'Y-m-d': 'yyyy-MM-dd',
  };

  const primaryFormat = placeholder && formatMap[placeholder] ? [formatMap[placeholder]] : [];

  const formatsToTry = [
    ...primaryFormat,
    'yyyy-MM-dd', 'MM-dd-yyyy', 'dd-MM-yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy'
  ];

  for (const fmt of formatsToTry) {
    parsed = parse(dateStr, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }

  return null;
};

const DatePickerField: React.FC<DynamicFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const handleDateChange = (dates: Date[]) => {
    if (dates.length > 0) {
      const selectedDate = dates[0]!;
      // Format date according to the display format
      let formattedDate;
      switch (field.placeholder) {
        case 'd-m-Y':
          formattedDate = format(selectedDate, 'dd-MM-yyyy');
          break;
        case 'm-d-Y':
          formattedDate = format(selectedDate, 'MM-dd-yyyy');
          break;
        case 'Y-m-d':
        default:
          formattedDate = format(selectedDate, 'yyyy-MM-dd');
          break;
      }
      onChange(formattedDate);
    } else {
      onChange(''); // Clear the date if no selection
    }
  };

  // Calculate minDate and maxDate based on disabledOn configuration and current date
  let minDate = null;
  let maxDate = null;

  if (field.validation) {
    const currentDate = new Date();

    minDate = field.validation.min !== undefined
      ? new Date(new Date().setMonth(currentDate.getMonth() - Number(field.validation.min) * 12))
      : new Date('1950-01-01');

    maxDate = field.validation.max !== undefined
      ? new Date(new Date().setMonth(currentDate.getMonth() - Number(field.validation.max) * 12))
      : currentDate;
  }

  const dateFormat = field.placeholder || 'Y-m-d';
  const parsedDate = value ? parseDateValue(value, dateFormat) : null;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={field.name}>
        {field.label}
        {field?.validation?.required && <span className="text-danger">*</span>}
      </label>
      <Flatpickr
        id={field.name}
        value={parsedDate ?? ''}
        onChange={handleDateChange}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        options={{
          dateFormat: dateFormat,
          defaultDate: parsedDate ?? undefined,
          allowInput: true,
          minDate: minDate!,
          maxDate: maxDate!
        }}
        disabled={disabled ?? false}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default DatePickerField;
