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
    if (!field || (!newOptionLabel.trim() && !newOptionValue.trim())) return;

    const newOption: FormFieldOption = {
      label: newOptionLabel.trim() || newOptionValue.trim(), // Use label if present, else value
      value: newOptionValue.trim() || newOptionLabel.trim(), // Use value if present, else label
      id: uuidv4(),
    };

    const updatedOptions = [...(field.options || []), newOption];
    onUpdateField(field.id, { options: updatedOptions });
    setNewOptionLabel('');
    setNewOptionValue('');
  };

  const handleOptionRemove = (optionId: string) => {
    if (!field) return;
    const updatedOptions = field.options?.filter(opt => opt.id !== optionId);
    onUpdateField(field.id, { options: updatedOptions });
  };

  const handleOptionChange = (optionId: string, type: 'label' | 'value', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!field) return;
    const updatedOptions = field.options?.map(opt =>
      opt.id === optionId ? { ...opt, [type]: e.target.value } : opt
    );
    onUpdateField(field.id, { options: updatedOptions });
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        {field ? "Field Configuration" : "Form Configuration"}
      </h2>

      {/* Form Level Configuration */}
      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Form Details</h3>
        <div className="mb-4">
          <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Form Title
          </label>
          <input
            id="form-title"
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="e.g., Customer Feedback Survey"
            aria-label="Form Title"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Form Description
          </label>
          <textarea
            id="form-description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="A brief description of what this form is for."
            aria-label="Form Description"
          ></textarea>
        </div>
      </section>

      {/* Step Management */}
      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Form Steps</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center p-2 rounded-md transition-colors ${
                currentStepIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              <button
                onClick={() => onSetCurrentStep(index)}
                className={`flex-1 text-sm font-medium px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentStepIndex === index ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}
                type="button"
                aria-current={currentStepIndex === index ? "step" : undefined}
                aria-label={`Go to step ${index + 1}: ${step.name}`}
              >
                Step {index + 1}
              </button>
              {steps.length > 1 && ( // Only allow deleting if more than one step
                <button
                  onClick={() => onDeleteStep(step.id)}
                  className={`ml-2 p-1 rounded-full ${currentStepIndex === index ? 'text-white hover:bg-blue-600' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-700'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  title={`Delete step ${index + 1}`}
                  type="button"
                  aria-label={`Delete step ${index + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddStep}
            className="flex items-center px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            type="button"
            aria-label="Add new step"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add Step
          </button>
        </div>
      </section>


      {/* Field Specific Configuration */}
      {field ? (
        <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field Settings
          </h3>

          <div>
            <label htmlFor={`label-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Label
            </label>
            <input
              id={`label-${field.id}`}
              type="text"
              value={field.label}
              onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Your Name"
              aria-label={`Label for ${field.type} field`}
            />
          </div>

          {['text', 'email', 'number', 'password', 'textarea'].includes(field.type) && (
            <div>
              <label htmlFor={`placeholder-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Placeholder
              </label>
              <input
                id={`placeholder-${field.id}`}
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Enter your answer here"
                aria-label={`Placeholder for ${field.label || field.type} field`}
              />
            </div>
          )}

          <div>
            <label htmlFor={`helptext-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Help Text
            </label>
            <input
              id={`helptext-${field.id}`}
              type="text"
              value={field.helpText || ''}
              onChange={(e) => onUpdateField(field.id, { helpText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., This information will be kept confidential."
              aria-label={`Help text for ${field.label || field.type} field`}
            />
          </div>

          <div className="flex items-center">
            <input
              id={`required-${field.id}`}
              type="checkbox"
              checked={field.validation?.required || false}
              onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, required: e.target.checked } })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-500"
              aria-label={`Mark ${field.label || field.type} field as required`}
            />
            <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Required
            </label>
          </div>

          {field.type === 'email' && (
            <div className="flex items-center">
              <input
                id={`email-validation-${field.id}`}
                type="checkbox"
                checked={field.validation?.pattern === 'email'}
                onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, pattern: e.target.checked ? 'email' : undefined } })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-500"
                aria-label={`Enable email format validation for ${field.label || field.type} field`}
              />
              <label htmlFor={`email-validation-${field.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Email Format
              </label>
            </div>
          )}

          {field.type === 'number' && (
            <>
              <div>
                <label htmlFor={`min-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Min Value
                </label>
                <input
                  id={`min-${field.id}`}
                  type="number"
                  value={field.validation?.min !== undefined ? field.validation.min : ''}
                  onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, min: e.target.value === '' ? undefined : Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label={`Minimum value for ${field.label || field.type} field`}
                />
              </div>
              <div>
                <label htmlFor={`max-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Max Value
                </label>
                <input
                  id={`max-${field.id}`}
                  type="number"
                  value={field.validation?.max !== undefined ? field.validation.max : ''}
                  onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, max: e.target.value === '' ? undefined : Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label={`Maximum value for ${field.label || field.type} field`}
                />
              </div>
            </>
          )}

          {['text', 'email', 'password', 'textarea'].includes(field.type) && (
            <>
              <div>
                <label htmlFor={`minlength-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Min Length
                </label>
                <input
                  id={`minlength-${field.id}`}
                  type="number"
                  value={field.validation?.minLength !== undefined ? field.validation.minLength : ''}
                  onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, minLength: e.target.value === '' ? undefined : Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label={`Minimum length for ${field.label || field.type} field`}
                />
              </div>
              <div>
                <label htmlFor={`maxlength-${field.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Max Length
                </label>
                <input
                  id={`maxlength-${field.id}`}
                  type="number"
                  value={field.validation?.maxLength !== undefined ? field.validation.maxLength : ''}
                  onChange={(e) => onUpdateField(field.id, { validation: { ...field.validation, maxLength: e.target.value === '' ? undefined : Number(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  aria-label={`Maximum length for ${field.label || field.type} field`}
                />
              </div>
            </>
          )}

          {(field.type === 'select' || field.type === 'radio') && (
            <div>
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">Options</h4>
              {field.options && field.options.length > 0 ? (
                <ul className="space-y-2 mb-3">
                  {field.options.map((option) => (
                    <li key={option.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => handleOptionChange(option.id, 'label', e)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Label"
                        aria-label={`Option label for ${field.label || field.type} field: ${option.label}`}
                      />
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => handleOptionChange(option.id, 'value', e)}
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Value"
                        aria-label={`Option value for ${field.label || field.type} field: ${option.value}`}
                      />
                      <button
                        onClick={() => handleOptionRemove(option.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Remove option"
                        type="button"
                        aria-label={`Remove option ${option.label || option.value}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No options added yet.</p>
              )}
              <div className="flex space-x-2">
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
        <p className="text-gray-500 dark:text-gray-400 italic">Select a field on the canvas to configure its properties.</p>
      )}
    </div>
  );
}