// app/components/PreviewModal.tsx
import { useState , useEffect} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Form, FormField, FormFieldValidation, FormStep } from '../state/formStore';
import FormInputRenderer from '../components/FormInputRenderer'; // Re-using the renderer
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ComputerDesktopIcon, DeviceTabletIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export default function PreviewModal({ isOpen, onClose, form }: PreviewModalProps) {
  const [currentPreviewStepIndex, setCurrentPreviewStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop'); // New state for preview mode

  const currentPreviewStep = form.steps[currentPreviewStepIndex];
  const fieldsInCurrentPreviewStep = form.fields.filter(field => currentPreviewStep?.fieldIds.includes(field.id))
                                                 .sort((a, b) => {
                                                     const indexA = currentPreviewStep.fieldIds.indexOf(a.id);
                                                     const indexB = currentPreviewStep.fieldIds.indexOf(b.id);
                                                     return indexA - indexB;
                                                 });

  const isFirstStep = currentPreviewStepIndex === 0;
  const isLastStep = currentPreviewStepIndex === form.steps.length - 1;

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentPreviewStepIndex(0);
      setFormData({});
      setFormErrors({});
      setPreviewMode('desktop'); // Reset preview mode
    }
  }, [isOpen]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.validation?.required && (value === undefined || value === null || value === '')) {
      if (field.type === 'checkbox' && value === false) {
        return `${field.label} is required.`;
      }
      return `${field.label} is required.`;
    }

    // Only validate if value is not empty, unless it's a required field
    if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'email' && field.validation?.pattern) {
            const emailRegex = new RegExp(field.validation.pattern);
            if (!emailRegex.test(value)) {
                return `Please enter a valid email address.`;
            }
        }
        if (field.type === 'number' && field.validation?.pattern) {
            const parts = field.validation.pattern.split(',').map(p => p.trim());
            let min: number | undefined;
            let max: number | undefined;

            for (const part of parts) {
                if (part.startsWith('min:')) {
                    min = parseFloat(part.substring(4));
                } else if (part.startsWith('max:')) {
                    max = parseFloat(part.substring(4));
                }
            }

            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (min !== undefined && numValue < min) {
                    return `${field.label} must be at least ${min}.`;
                }
                if (max !== undefined && numValue > max) {
                    return `${field.label} must be at most ${max}.`;
                }
            } else {
                return `Please enter a valid number for ${field.label}.`;
            }
        }
        // Min/Max Length Validation for text and textarea
        if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
            if (field.validation?.minLength !== undefined && value.length < field.validation.minLength) {
                return `${field.label} must be at least ${field.validation.minLength} characters long.`;
            }
            if (field.validation?.maxLength !== undefined && value.length > field.validation.maxLength) {
                return `${field.label} must be at most ${field.validation.maxLength} characters long.`;
            }
        }
    }

    return null;
  };

  const validateCurrentStep = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fieldsInCurrentPreviewStep.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        // Handle form submission logic here
        console.log("Form Submitted:", formData);
        alert("Form Submitted! Check console for data.");
        onClose();
      } else {
        setCurrentPreviewStepIndex((prev) => prev + 1);
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentPreviewStepIndex((prev) => prev - 1);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for the field as soon as it's changed
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Determine dialog panel width based on preview mode
  const getPanelWidthClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-md'; // Roughly phone width
      case 'tablet':
        return 'max-w-3xl'; // Roughly tablet width
      case 'desktop':
      default:
        return 'max-w-4xl'; // Wider for desktop
    }
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className={`w-full ${getPanelWidthClass()} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {form.title}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentPreviewStep.name || `Step ${currentPreviewStepIndex + 1}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Preview Mode Buttons */}
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded-md ${previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-600 dark:hover:bg-blue-600`}
                      title="Desktop Preview"
                      aria-label="Switch to Desktop Preview"
                    >
                      <ComputerDesktopIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('tablet')}
                      className={`p-2 rounded-md ${previewMode === 'tablet' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-600 dark:hover:bg-blue-600`}
                      title="Tablet Preview"
                      aria-label="Switch to Tablet Preview"
                    >
                      <DeviceTabletIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded-md ${previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'} hover:bg-blue-600 dark:hover:bg-blue-600`}
                      title="Mobile Preview"
                      aria-label="Switch to Mobile Preview"
                    >
                      <DevicePhoneMobileIcon className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                      aria-label="Close Preview"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                {form.steps.length > 1 && (
                  <div className="flex justify-center items-center gap-2 mb-4">
                    {form.steps.map((_step, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentPreviewStepIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        title={`Step ${index + 1}`}
                      ></div>
                    ))}
                  </div>
                )}

                <div className="mt-2 space-y-4">
                  {fieldsInCurrentPreviewStep.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No fields in this step.</p>
                  ) : (
                    fieldsInCurrentPreviewStep.map((field) => (
                      <FormInputRenderer
                        key={field.id}
                        field={field}
                        value={formData[field.id]}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        error={formErrors[field.id]}
                      />
                    ))
                  )}
                </div>

                <div className="mt-4 flex justify-between">
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