import { useState , useEffect} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Form, FormField, FormFieldValidation, FormStep } from '../state/formStore';
import FormInputRenderer from '../components/FormInputRenderer'; // Re-using the renderer
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
}

export default function PreviewModal({ isOpen, onClose, form }: PreviewModalProps) {
  const [currentPreviewStepIndex, setCurrentPreviewStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const currentPreviewStep = form.steps[currentPreviewStepIndex];
  const fieldsInCurrentPreviewStep = form.fields.filter(field => currentPreviewStep?.fieldIds.includes(field.id))
                                                 .sort((a, b) => {
                                                     const indexA = currentPreviewStep.fieldIds.indexOf(a.id);
                                                     const indexB = currentPreviewStep.fieldIds.indexOf(b.id);
                                                     return indexA - indexB;
                                                 });

  const isFirstStep = currentPreviewStepIndex === 0;
  const isLastStep = currentPreviewStepIndex === form.steps.length - 1;

  // Reset form data and errors when modal opens/closes or form changes
  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setFormErrors({});
      setCurrentPreviewStepIndex(0);
    }
  }, [isOpen, form]);

  const validateField = (field: FormField, value: any): string | null => {
    const validation = field.validation;

    if (!validation) return null;

    // Required validation
    if (validation.required) {
      if (typeof value === 'string' && value.trim() === '') {
        return 'This field is required.';
      }
      if (Array.isArray(value) && value.length === 0) { // For multi-select or checkboxes
        return 'Please select at least one option.';
      }
      if (value === null || value === undefined) {
        return 'This field is required.';
      }
    }

    // Pattern validation (e.g., email)
    if (validation.pattern === 'email' && typeof value === 'string' && value.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address.';
      }
    }

    // Min/Max for numbers
    if (field.type === 'number' && typeof value === 'number' && !isNaN(value)) {
      if (validation.min !== undefined && value < validation.min) {
        return `Value must be at least ${validation.min}.`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return `Value must be at most ${validation.max}.`;
      }
    }

    // MinLength/MaxLength for text-based inputs
    if (typeof value === 'string' && value.trim() !== '') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters long.`;
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return `Cannot exceed ${validation.maxLength} characters.`;
      }
    }

    return null; // No errors
  };

  const validateCurrentStep = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fieldsInCurrentPreviewStep.forEach(field => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setFormErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (!isLastStep) {
        setCurrentPreviewStepIndex(prev => prev + 1);
        setFormErrors({}); // Clear errors when moving to next step
      } else {
        // This is the last step, form is complete.
        // In a real app, you'd submit formData to a backend.
        alert('Form submitted successfully!\n' + JSON.stringify(formData, null, 2));
        onClose(); // Close modal on successful submission
      }
    }
  };

  const handlePreviousStep = () => {
    if (!isFirstStep) {
      setCurrentPreviewStepIndex(prev => prev - 1);
      setFormErrors({}); // Clear errors when moving back
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error for this field immediately on change
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close form preview"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100 mb-2"
                >
                  {form.title || "Untitled Form"}
                </Dialog.Title>
                {form.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{form.description}</p>
                )}

                {form.steps.length > 1 && (
                  <div className="mb-6 flex items-center justify-between text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">
                      Step {currentPreviewStepIndex + 1} of {form.steps.length}: {currentPreviewStep?.name}
                    </span>
                  </div>
                )}


                <div className="mt-2 space-y-5">
                  {fieldsInCurrentPreviewStep.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">This step has no fields.</p>
                  ) : (
                    fieldsInCurrentPreviewStep.map((field) => (
                      <div key={field.id} className="relative">
                        <FormInputRenderer
                          field={field}
                          value={formData[field.id]}
                          onChange={(val) => handleChange(field.id, val)}
                          error={formErrors[field.id]}
                          // No onBlur in preview to simplify, validation happens on next/submit
                        />
                         {formErrors[field.id] && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${field.id}-error`}>
                            {formErrors[field.id]}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    disabled={isFirstStep}
                    className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    type="button"
                    aria-label="Go to previous step"
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-2" />
                    Previous
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    type="button"
                    aria-label={isLastStep ? "Submit Form" : "Go to next step"}
                  >
                    {isLastStep ? "Submit" : "Next"}
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}