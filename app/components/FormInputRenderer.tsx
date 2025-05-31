import React from 'react';
import { FormField, FormFieldOption } from '../state/formStore';

interface FormInputRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string | null;
  // onBlur?: (fieldId: string) => void; // Optional: for client-side validation on blur
}

export default function FormInputRenderer({ field, value, onChange, error }: FormInputRendererProps) {
  const commonClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
  const errorClasses = error ? "border-red-500 ring-red-500" : "";
  const inputId = `form-field-${field.id}`;
  const errorId = error ? `${field.id}-error` : undefined;

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
      case 'date':
        return (
          <input
            id={inputId}
            type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            // onBlur={() => onBlur?.(field.id)}
            placeholder={field.placeholder || ''}
            required={field.validation?.required}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            className={`${commonClasses} ${errorClasses}`}
            aria-invalid={!!error}
            aria-describedby={errorId}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={inputId}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            // onBlur={() => onBlur?.(field.id)}
            placeholder={field.placeholder || ''}
            required={field.validation?.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            rows={4}
            className={`${commonClasses} ${errorClasses}`}
            aria-invalid={!!error}
            aria-describedby={errorId}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={inputId}
              type="checkbox"
              checked={!!value} // Convert to boolean
              onChange={(e) => onChange(e.target.checked)}
              // onBlur={() => onBlur?.(field.id)}
              required={field.validation?.required}
              className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-500 ${errorClasses}`}
              aria-invalid={!!error}
              aria-describedby={errorId}
            />
            <label htmlFor={inputId} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              {field.label}
            </label>
          </div>
        );
      case 'radio':
      case 'select':
        if (!field.options || field.options.length === 0) {
          return <p className="text-red-500 dark:text-red-400 text-sm">No options defined for this field.</p>;
        }
        if (field.type === 'radio') {
          return (
            <div role="radiogroup" aria-labelledby={`${inputId}-label`}>
              <p id={`${inputId}-label`} className="sr-only">{field.label}</p>
              {field.options.map((option: FormFieldOption) => (
                <div key={option.id} className="flex items-center mb-2">
                  <input
                    id={`${inputId}-${option.id}`}
                    type="radio"
                    name={field.id} // Group radio buttons
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => onChange(e.target.value)}
                    // onBlur={() => onBlur?.(field.id)}
                    required={field.validation?.required}
                    className={`h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-500 ${errorClasses}`}
                    aria-invalid={!!error}
                    aria-describedby={errorId}
                  />
                  <label htmlFor={`${inputId}-${option.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
        } else { // select
          return (
            <select
              id={inputId}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              // onBlur={() => onBlur?.(field.id)}
              required={field.validation?.required}
              className={`${commonClasses} ${errorClasses}`}
              aria-invalid={!!error}
              aria-describedby={errorId}
            >
              <option value="" disabled>Select an option</option>
              {field.options.map((option: FormFieldOption) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
      default:
        return <p className="text-red-500 dark:text-red-400 text-sm">Unsupported field type: {field.type}</p>;
    }
  };

  return (
    <div>
      {field.type !== 'checkbox' && field.type !== 'radio' && ( // Checkboxes and radio have label integrated
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {field.label} {field.validation?.required && <span className="text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {field.helpText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" id={`${inputId}-help`}>
          {field.helpText}
        </p>
      )}
      {/* Error message is rendered in the parent component (PreviewModal) to ensure consistent placement */}
    </div>
  );
}