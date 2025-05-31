// app/components/FieldConfigPanel.tsx
import { useState, useEffect } from 'react';
import { FormField, FormFieldOption, FormStep } from '../state/formStore';
import { v4 as uuidv4 } from 'uuid';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';

interface FieldConfigPanelProps {
  field: FormField | null;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  formTitle: string;
  formDescription: string;
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
  steps: FormStep[];
  currentStepIndex: number;
  onAddStep: () => void;
  onDeleteStep: (stepId: string) => void;
  onSetCurrentStep: (index: number) => void;
}

export default function FieldConfigPanel({
  field,
  onUpdateField,
  formTitle,
  formDescription,
  setFormTitle,
  setFormDescription,
  steps,
  currentStepIndex,
  onAddStep,
  onDeleteStep,
  onSetCurrentStep,
}: FieldConfigPanelProps) {
  // State for temporary option input
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  // Update new option state when field changes
  useEffect(() => {
    setNewOptionLabel('');
    setNewOptionValue('');
  }, [field?.id]);

  const handleOptionAdd = () => {
    if (field && newOptionLabel.trim() !== '' && newOptionValue.trim() !== '') {
      const newOption: FormFieldOption = {
        id: uuidv4(),
        label: newOptionLabel.trim(),
        value: newOptionValue.trim(),
      };
      onUpdateField(field.id, {
        options: [...(field.options || []), newOption],
      });
      setNewOptionLabel('');
      setNewOptionValue('');
    }
  };

  const handleOptionDelete = (optionId: string) => {
    if (field) {
      onUpdateField(field.id, {
        options: field.options?.filter((opt) => opt.id !== optionId),
      });
    }
  };

  const handleStepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSetCurrentStep(Number(e.target.value));
  };

  return (
    <div className="space-y-6">
      {/* Form Details Section */}
      <section className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Form Details</h3>
        <div className="mb-4">
          <label htmlFor="formTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Form Title
          </label>
          <input
            type="text"
            id="formTitle"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Form Description
          </label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </section>

      {/* Form Steps Section */}
      <section className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Form Steps</h3>
        <div className="mb-4">
          <label htmlFor="currentStep" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Current Step
          </label>
          <select
            id="currentStep"
            value={currentStepIndex}
            onChange={handleStepChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {steps.map((step, index) => (
              <option key={step.id} value={index}>
                {step.name || `Step ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={onAddStep}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Add new step"
          >
            Add Step
          </button>
          {steps.length > 1 && (
            <button
              onClick={() => onDeleteStep(steps[currentStepIndex].id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Delete current step"
            >
              Delete Step
            </button>
          )}
        </div>
      </section>


      {field ? (
        <section className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Field Configuration</h3>

          {/* Common Field Properties */}
          <div>
            <label htmlFor="fieldLabel" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Label
            </label>
            <input
              type="text"
              id="fieldLabel"
              value={field.label}
              onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="fieldPlaceholder" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Placeholder
            </label>
            <input
              type="text"
              id="fieldPlaceholder"
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="fieldHelpText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Help Text
            </label>
            <textarea
              id="fieldHelpText"
              value={field.helpText || ''}
              onChange={(e) => onUpdateField(field.id, { helpText: e.target.value })}
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Validation */}
          <div className="flex items-center">
            <input
              id="fieldRequired"
              type="checkbox"
              checked={field.validation?.required || false}
              onChange={(e) =>
                onUpdateField(field.id, {
                  validation: { ...field.validation, required: e.target.checked },
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="fieldRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
              Required
            </label>
          </div>

          {(field.type === 'email' || field.type === 'number') && (
            <div>
              <label htmlFor="fieldPattern" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Pattern (Regex for Email, Min/Max for Number)
              </label>
              <input
                type="text"
                id="fieldPattern"
                value={field.validation?.pattern || ''}
                onChange={(e) =>
                  onUpdateField(field.id, {
                    validation: { ...field.validation, pattern: e.target.value },
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder={field.type === 'email' ? 'e.g., ^.+@.+$' : 'e.g., min:10,max:100'}
              />
            </div>
          )}

          {(field.type === 'text' || field.type === 'textarea') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fieldMinLength" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Min Length
                </label>
                <input
                  type="number"
                  id="fieldMinLength"
                  value={field.validation?.minLength || ''}
                  onChange={(e) =>
                    onUpdateField(field.id, {
                      validation: { ...field.validation, minLength: e.target.value === '' ? undefined : parseInt(e.target.value, 10) },
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="fieldMaxLength" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Max Length
                </label>
                <input
                  type="number"
                  id="fieldMaxLength"
                  value={field.validation?.maxLength || ''}
                  onChange={(e) =>
                    onUpdateField(field.id, {
                      validation: { ...field.validation, maxLength: e.target.value === '' ? undefined : parseInt(e.target.value, 10) },
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min="0"
                />
              </div>
            </div>
          )}


          {/* Options for Select/Radio/Checkbox */}
          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div className="space-y-2">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-200">Options</h4>
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) =>
                      onUpdateField(field.id, {
                        options: field.options?.map((opt) =>
                          opt.id === option.id ? { ...opt, label: e.target.value } : opt
                        ),
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    aria-label={`Option label: ${option.label}`}
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) =>
                      onUpdateField(field.id, {
                        options: field.options?.map((opt) =>
                          opt.id === option.id ? { ...opt, value: e.target.value } : opt
                        ),
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    aria-label={`Option value: ${option.value}`}
                  />
                  <button
                    onClick={() => handleOptionDelete(option.id)}
                    className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    type="button"
                    aria-label="Delete option"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="New option label"
                  aria-label="New option label input"
                />
                <input
                  type="text"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="New option value"
                  aria-label="New option value input"
                />
                <button
                  onClick={handleOptionAdd}
                  className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="button"
                  aria-label="Add option"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Select a field on the canvas to configure its properties.
        </p>
      )}
    </div>
  );
}