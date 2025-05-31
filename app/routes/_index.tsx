import type { MetaFunction } from "@remix-run/node";
import { useState, useRef } from "react"; // Import useRef
import { useFormStore, FormFieldType, FormField } from "../state/formStore";
import {FormCanvas} from "../components/FormCanvas"; // Correct path for your setup
import Sidebar from "../components/Sidebar";     // Correct path for your setup
import FieldConfigPanel from "../components/FieldConfigPanel"; // Correct path for your setup
import PreviewModal from "../components/PreviewModal"; // Correct path for your setup
import { useThemeStore } from "../state/themeStore";
import { SunIcon, MoonIcon, PlayIcon, CodeBracketIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Form Builder" },
    { name: "description", content: "Build dynamic forms with Remix & Zustand!" },
  ];
};

export default function Index() {
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);
  const currentForm = useFormStore((state) => state.currentForm);
  const updateField = useFormStore((state) => state.updateField);
  const addField = useFormStore((state) => state.addField);
  const addStep = useFormStore((state) => state.addStep);
  const deleteStep = useFormStore((state) => state.deleteStep);
  const setCurrentStepIndex = useFormStore((state) => state.setCurrentStepIndex);
  const setFormTitle = useFormStore((state) => state.setFormTitle);
  const setFormDescription = useFormStore((state) => state.setFormDescription);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // --- Ref for the entire interactive builder area ---
  const builderAreaRef = useRef<HTMLDivElement>(null);

  const allFields = currentForm.steps.flatMap(step => step.fieldIds.map(fieldId => {
    const field = currentForm.fields.find(f => f.id === fieldId);
    if (!field) {
      console.warn(`Field with ID ${fieldId} not found.`);
    }
    return field;
  }).filter(Boolean) as FormField[]);

  const selectedField = selectedFieldId
    ? allFields.find((f) => f.id === selectedFieldId)
    : null;

  const currentStep = currentForm.steps[currentForm.currentStepIndex];

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    updateField(id, updates);
  };

  const handleAddField = (type: FormFieldType) => {
    addField(type);
  };

  const handleAddStep = () => {
    addStep();
  };

  const handleDeleteStep = (stepId: string) => {
    deleteStep(stepId);
  };

  const handleSetCurrentStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gray-100 dark:bg-gray-800 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Form Builder</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Preview Form"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Preview
          </button>
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
            aria-label={showJson ? "Hide JSON" : "Show JSON"}
          >
            <CodeBracketIcon className="h-5 w-5 mr-2" />
            {showJson ? "Hide JSON" : "Show JSON"}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Toggle theme: current theme is ${theme}`}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area - Now wrapped with builderAreaRef */}
      <div ref={builderAreaRef} className="flex flex-1 pt-20 pb-4">
        {/* Sidebar */}
        <Sidebar onAddField={handleAddField} />

        {/* Form Canvas */}
        <main className="flex-1 p-4 overflow-hidden">
          <FormCanvas
            currentStep={currentStep}
            allFields={allFields}
            interactiveAreaRef={builderAreaRef}
          />
        </main>

        {/* Field Configuration Panel */}
        <aside className="w-96 bg-gray-100 dark:bg-gray-800 p-4 shadow-lg overflow-y-auto flex-shrink-0">
          <FieldConfigPanel
            field={selectedField}
            onUpdateField={handleUpdateField}
            formTitle={currentForm.title}
            formDescription={currentForm.description}
            setFormTitle={setFormTitle}
            setFormDescription={setFormDescription}
            steps={currentForm.steps}
            currentStepIndex={currentForm.currentStepIndex}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onSetCurrentStep={handleSetCurrentStep}
          />
        </aside>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={currentForm}
      />

      {/* JSON Viewer */}
      {showJson && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 w-full max-w-2xl h-3/4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Form JSON</h2>
            <pre className="flex-1 overflow-auto bg-gray-800 p-4 rounded-md text-sm">
              <code>{JSON.stringify(currentForm, null, 2)}</code>
            </pre>
            <button
              onClick={() => setShowJson(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Close JSON viewer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}