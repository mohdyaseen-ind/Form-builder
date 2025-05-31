// app/routes/form.$formId.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { FormDefinition, FormField } from "../state/formStore"; // Adjust path if necessary

// This loader function runs on the server (and client on navigation)
export async function loader({ params }: LoaderFunctionArgs) {
  const formId = params.formId;

  // In a real application, you would fetch this from a database.
  // For now, we'll simulate client-side loading from localStorage.
  // We can't directly access localStorage in the loader (server-side).
  // So, we'll just pass the formId and load on the client.
  return json({ formId });
}

// This component will render the form for filling
export default function FormFillerPage() {
  const { formId } = useLoaderData<typeof loader>();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false); // To show submission message

  useEffect(() => {
    if (typeof window !== 'undefined' && formId) {
      const storedForm = localStorage.getItem(`form-builder-${formId}`);
      if (storedForm) {
        setForm(JSON.parse(storedForm));
      } else {
        setForm(null); // Form not found
      }
    }
  }, [formId]);

  // Helper function to validate a single field
  const validateField = (field: FormField, value: any): string => {
    if (field.required && !value) {
      return `${field.label || field.type} is required.`;
    }
    if (field.type === 'text' || field.type === 'textarea') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        return `${field.label} must be at least ${field.validation.minLength} characters.`;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        return `${field.label} cannot exceed ${field.validation.maxLength} characters.`;
      }
      if (field.validation?.pattern === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `Please enter a valid email address.`;
      }
      if (field.validation?.pattern === 'phone' && value && !/^\+?[0-9\s-()]{7,20}$/.test(value)) {
        return `Please enter a valid phone number.`;
      }
    }
    // Add more validation logic for other field types if needed (e.g., date format)
    return "";
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    if (!form) return false;

    const stepFields = form.steps[currentStepIndex]?.fieldIds.map(fieldId =>
      form.fields.find(f => f.id === fieldId)
    ).filter(Boolean) as FormField[]; // Filter out undefined/null and assert type

    let stepHasErrors = false;
    const newErrors: Record<string, string> = { ...errors }; // Start with existing errors

    stepFields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        stepHasErrors = true;
      } else {
        delete newErrors[field.id]; // Clear error if fixed
      }
    });

    setErrors(newErrors);
    return !stepHasErrors;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < form!.steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error immediately if user starts typing in a field with an error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      // If this is the last step and valid, submit
      if (currentStepIndex === form!.steps.length - 1) {
        if (typeof window !== 'undefined') {
            const submissions = JSON.parse(localStorage.getItem(`form-submissions-${formId}`) || '[]');
            submissions.push({
                timestamp: new Date().toISOString(),
                data: formData,
            });
            localStorage.setItem(`form-submissions-${formId}`, JSON.stringify(submissions));
        }
        setSubmitted(true);
        console.log("Form Submitted:", formData);
        // Optionally, reset form or redirect
      } else {
        handleNextStep(); // Go to next step if not last
      }
    }
  };

  if (form === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl">Form not found or invalid ID.</h1>
      </div>
    );
  }

  if (submitted) {
      return (
          <div className="flex flex-col justify-center items-center h-screen bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100">
              <h1 className="text-3xl font-bold mb-4">Form Submitted Successfully!</h1>
              <p className="text-lg">Thank you for your submission.</p>
              <button
                onClick={() => { setSubmitted(false); setFormData({}); setCurrentStepIndex(0); setErrors({}); }}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Fill Again
              </button>
          </div>
      );
  }

  const currentStep = form.steps[currentStepIndex];
  const fieldsInCurrentStep = currentStep.fieldIds.map(fieldId =>
    form.fields.find(f => f.id === fieldId)
  ).filter(Boolean) as FormField[];

  const progressPercentage = (currentStepIndex / (form.steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">{form.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{form.description}</p>

        {form.steps.length > 1 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Step {currentStepIndex + 1} of {form.steps.length}: {currentStep.name || `Untitled Step`}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {fieldsInCurrentStep.map((field) => (
            <div key={field.id} className="mb-4">
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'text' && (
                <input
                  type={field.inputType || 'text'}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
              {field.type === 'textarea' && (
                <textarea
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                ></textarea>
              )}
              {field.type === 'dropdown' && (
                <select
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{field.placeholder || "Select an option"}</option>
                  {field.options?.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === 'checkbox' && (
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id={field.id}
                    name={field.id}
                    checked={!!formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor={field.id} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    {field.checkboxLabel || "Check this box"}
                  </label>
                </div>
              )}
              {field.type === 'date' && (
                <input
                  type="date"
                  id={field.id}
                  name={field.id}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              )}
              {field.helpText && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
              )}
              {errors[field.id] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-between mt-6">
            {form.steps.length > 1 && currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Previous
              </button>
            )}
            {form.steps.length > 1 && currentStepIndex < form.steps.length - 1 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
              >
                Next
              </button>
            )}
            {(form.steps.length === 1 || currentStepIndex === form.steps.length - 1) && (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}