import React, { useState, useEffect } from 'react';
import { useFormStore, FormFieldType, FormField } from '../state/formStore';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { createPortal } from 'react-dom';

// Import UI components
import Sidebar from '../components/Sidebar';
import { FormCanvas } from '../components/FormCanvas';
import FieldConfigPanel from '../components/FieldConfigPanel';
import PreviewModal from '../components/PreviewModal'; // Existing Preview Modal
import JsonPreviewModal from '../components/JsonPreviewModal'; // NEW: JSON Preview Modal
import { FieldPalette } from '../components/FieldPalette';

// Import Heroicons for buttons
import { PlayIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, PlusIcon, TrashIcon, ArrowPathIcon, SunIcon, MoonIcon, CodeBracketIcon } from '@heroicons/react/24/solid'; // NEW: CodeBracketIcon for JSON
import { useThemeStore } from '../state/themeStore';

export default function Index() {
  // Destructure state and actions from your Zustand form store
  const {
    form, selectedFieldId,
    addField, deleteField, updateField, reorderField,
    setSelectedFieldId, setFormTitle, setFormDescription,
    addStep, deleteStep, setCurrentStep,
    saveForm, loadForm, resetForm
  } = useFormStore();

  // Destructure state and actions from your Zustand theme store
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Dnd-Kit sensors for better drag-and-drop interaction
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px minimum movement to activate drag
      },
    })
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonPreviewOpen, setIsJsonPreviewOpen] = useState(false); // NEW: State for JSON preview modal
  const [formIdInput, setFormIdInput] = useState(''); // State for the input field to save/load forms
  const [shareLink, setShareLink] = useState(''); // State to hold the shareable link

  // Define togglePreview function
  const togglePreview = () => setIsPreviewOpen(!isPreviewOpen);
  const toggleJsonPreview = () => setIsJsonPreviewOpen(!isJsonPreviewOpen); // NEW: Toggle JSON preview

  // Derive the field currently being dragged for the DragOverlay
  const activeFieldBeingDragged = activeId ? form.fields.find(f => f.id === activeId) : null;

  // Safely get the current step object and fields within it
  const currentStep = form?.steps?.[form.currentStepIndex];

  // Select the appropriate field object for the configuration panel based on selectedFieldId
  const selectedField = selectedFieldId ? form.fields.find(field => field.id === selectedFieldId) : null;

  // Handle Dnd-Kit drag start event
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
    setSelectedFieldId(null); // Deselect any field when dragging starts
  }

  // Handle Dnd-Kit drag end event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null); // Clear active ID immediately after drag ends

    if (!over) return; // Dropped outside of any droppable area

    const activeData = active.data.current;
    const overData = over.data.current;

    // Logic for adding a new field from the palette to the canvas
    if (activeData?.type === 'palette-item' && overData?.type === 'field-canvas') {
      const fieldType = activeData.fieldType as FormFieldType;
      addField(fieldType);
      return;
    }

    // Logic for reordering existing fields within the canvas
    if (activeData?.type === 'field' && overData?.type === 'field') {
      // Ensure both active and over IDs are valid field IDs in the current step
      const freshStep = form.steps[form.currentStepIndex];
      const freshFieldIds = freshStep?.fieldIds ?? [];

      if (
        active.id !== over.id &&
        freshFieldIds.includes(active.id as string) &&
        freshFieldIds.includes(over.id as string)
      ) {
        reorderField(active.id as string, over.id as string);
      }
      return;
    }
  }

  // Handle saving the form to local storage
  const handleSaveForm = () => {
    if (formIdInput.trim()) {
      saveForm(formIdInput.trim());
      alert(`Form "${formIdInput.trim()}" saved successfully!`);
    } else {
      alert("Please enter a Form ID to save.");
    }
  };

  // Handle loading a form from local storage
  const handleLoadForm = () => {
    if (formIdInput.trim()) {
      const success = loadForm(formIdInput.trim());
      if (!success) {
        alert(`Form with ID "${formIdInput.trim()}" not found.`);
      } else {
        alert(`Form "${formIdInput.trim()}" loaded successfully!`);
      }
    } else {
      alert("Please enter a Form ID to load.");
    }
  };

  // Handle starting a new form
  const handleNewForm = () => {
    if (confirm("Are you sure you want to start a new form? Any unsaved changes will be lost.")) {
      resetForm();
      setFormIdInput(form.id); // Reset input to new form's ID
    }
  };

  // Set the formIdInput to the current form's ID when the component mounts or form.id changes
  useEffect(() => {
    if (form.id) {
      setFormIdInput(form.id);
    }
  }, [form.id]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left Sidebar: Contains Field Palette */}
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 shadow-lg overflow-y-auto flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Field Types</h2>
          <FieldPalette />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto"> {/* Changed to overflow-y-auto */}
          {/* Form Header: Title, Description, and Action Buttons */}
          <div className="flex justify-between items-start mb-6 flex-shrink-0 flex-wrap gap-4">
            {/* Form Title and Description */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full mb-1"
                value={form.title}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Untitled Form"
                aria-label="Form Title"
              />
              <textarea
                className="text-gray-600 dark:text-gray-400 bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full"
                value={form.description}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="A description for your form..."
                rows={2}
                aria-label="Form Description"
              />
            </div>

            {/* Save/Load/Reset/Preview/Theme Toggle Buttons */}
            <div className="flex space-x-2 items-center flex-shrink-0">
              <input
                type="text"
                value={formIdInput}
                onChange={(e) => setFormIdInput(e.target.value)}
                placeholder="Form ID"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                aria-label="Form ID for Save/Load"
              />
              <button
                onClick={handleSaveForm}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Save Form"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-1" /> Save
              </button>
              <button
                onClick={handleLoadForm}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-label="Load Form"
              >
                <DocumentArrowUpIcon className="h-5 w-5 mr-1" /> Load
              </button>
              <button
                onClick={handleNewForm}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Reset Form"
              >
                <ArrowPathIcon className="h-5 w-5 mr-1" /> Reset
              </button>
              <button
                onClick={togglePreview}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Preview Form"
              >
                <PlayIcon className="h-5 w-5 mr-1" /> Preview
              </button>
              <button
                onClick={() => {
                  setShareLink(`${window.location.origin}/form/${form.id}`);
                }}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Share Form
              </button>
              {/* NEW: View JSON Button */}
              <button
                onClick={toggleJsonPreview}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="View Form JSON"
              >
                <CodeBracketIcon className="h-5 w-5 mr-1" /> View JSON
              </button>
              {/* Theme Toggle Button */}
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
          </div>

          {shareLink && (
            <div className="bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-100 px-4 py-3 rounded relative mb-6 flex items-center justify-between" role="alert">
              <strong className="font-bold mr-2">Shareable Link:</strong>
              <span className="block sm:inline overflow-auto whitespace-nowrap mr-4 flex-grow">{shareLink}</span>
              <button
                onClick={() => {
                  // FIX: Added try...catch for robust clipboard copying
                  try {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(shareLink);
                      alert('Link copied to clipboard!');
                    } else {
                      throw new Error('Clipboard API not available');
                    }
                  } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy link. Please copy it manually: ' + shareLink);
                  }
                }}
                className="flex-shrink-0 bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded"
              >
                Copy
              </button>
              <button onClick={() => setShareLink('')} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-blue-500 dark:text-blue-200" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 1 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 1 1 1.697-1.697l2.651 3.746 2.651-3.746a1.2 1.2 0 1 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </button>
            </div>
          )}

          {/* Main Content Area: Form Canvas and Field Configuration Panel */}
          <div className="flex-1 grid grid-cols-3 gap-6">
            {/* Form Canvas */}
            <section className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Form Canvas - Step {currentStep?.name || 'Loading...'}
              </h2>
              <FormCanvas />
            </section>

            {/* Field Configuration Panel */}
            <section className="col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Field Configuration</h2>
              <FieldConfigPanel
                field={selectedField}
                onUpdateField={updateField}
                formTitle={form.title}
                formDescription={form.description}
                setFormTitle={setFormTitle}
                setFormDescription={setFormDescription}
                steps={form.steps}
                currentStepIndex={form.currentStepIndex}
                onAddStep={addStep}
                onDeleteStep={deleteStep}
                onSetCurrentStep={setCurrentStep}
              />
            </section>
          </div>
        </main>

        {/* DragOverlay: Renders the item being dragged for visual feedback */}
        {typeof document !== 'undefined' && createPortal(
          <DragOverlay>
            {activeId && activeFieldBeingDragged ? (
              <div className="p-3 bg-blue-500 text-white rounded-md cursor-grabbing opacity-80">
                {activeFieldBeingDragged.label}
              </div>
            ) : activeId?.toString().startsWith('palette-') ? (
              <div className="p-3 bg-blue-500 text-white rounded-md cursor-grabbing opacity-80">
                {activeId.toString().replace('palette-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Preview Modal (Existing) */}
      {isPreviewOpen && (
        <PreviewModal isOpen={isPreviewOpen} onClose={togglePreview} form={form} />
      )}

      {/* NEW: JSON Preview Modal */}
      {isJsonPreviewOpen && (
        <JsonPreviewModal isOpen={isJsonPreviewOpen} onClose={toggleJsonPreview} formData={form} />
      )}
    </div>
  );
}