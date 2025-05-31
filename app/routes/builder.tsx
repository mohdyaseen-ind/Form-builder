import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'; // Added DragStartEvent type
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect, useMemo } from 'react';
import { useFormStore, FormField, FormFieldType, FormStep } from '../state/formStore';
import type { LoaderFunctionArgs } from "@remix-run/node";

// --- Component Imports ---
import { FieldPalette } from '../components/FieldPalette';
import { FormCanvas } from '../components/FormCanvas';
import FieldConfigPanel from '../components/FieldConfigPanel'; 

// Add this loader function
export async function loader({ request }: LoaderFunctionArgs) {
  // This loader ensures the route can be accessed via GET requests
  return {};
}

export default function FormBuilderPage() {
  const storeState = useFormStore();

  const currentForm = useMemo(() => {
    return storeState.currentForm || {
      id: 'temp_form',
      title: 'Loading Form...',
      description: '',
      fields: [],
      steps: [{ id: 'temp_step', name: 'Loading Step', fieldIds: [] }],
      currentStepIndex: 0,
    };
  }, [storeState.currentForm]);

  const selectedFieldId = storeState.selectedFieldId;
  const addField = storeState.addField;
  const reorderFields = storeState.reorderFields;
  const setSelectedFieldId = storeState.setSelectedFieldId;
  const setFormTitle = storeState.setFormTitle;
  const setFormDescription = storeState.setFormDescription;
  const addStep = storeState.addStep;
  const deleteStep = storeState.deleteStep;
  const setCurrentStepIndex = storeState.setCurrentStepIndex;
  const updateField = storeState.updateField;

  const [activeId, setActiveId] = useState<string | null>(null);

  // --- Defensive checks for data access ---
  const currentStep: FormStep | undefined = currentForm.steps?.[currentForm.currentStepIndex];
  const currentStepFieldIds: string[] = currentStep?.fieldIds ?? [];

  const allFormFields = currentForm.fields ?? []; 

  const fieldsInCurrentStep: FormField[] = currentStepFieldIds
    .map(fieldId => allFormFields.find(f => f.id === fieldId))
    .filter((f): f is FormField => f !== undefined);

  const currentlySelectedField: FormField | null = selectedFieldId
    ? allFormFields.find(field => field.id === selectedFieldId) ?? null
    : null;
  // --- End of Defensive checks ---

  // --- DEBUGGING LOGS (keep these, they are crucial) ---
  useEffect(() => {
    console.log("Builder Page - currentForm:", currentForm);
    console.log("Builder Page - currentForm.fields:", currentForm.fields);
    console.log("Builder Page - fieldsInCurrentStep:", fieldsInCurrentStep);
    console.log("Builder Page - selectedFieldId:", selectedFieldId);
    console.log("Builder Page - currentlySelectedField:", currentlySelectedField);
  }, [currentForm, fieldsInCurrentStep, selectedFieldId, currentlySelectedField]);
  // --- END DEBUGGING LOGS ---


  function handleDragStart(event: DragStartEvent) { // Use DragStartEvent type
    setActiveId(event.active.id);
    console.log("Drag Started:", event.active.id); // New log for drag start
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null); // Clear activeId after drag ends

    // --- NEW DEBUGGING LOGS FOR DRAG EVENTS ---
    console.log("Drag End Event:", event);
    console.log("Active item:", active);
    console.log("Over target:", over);
    console.log("Active item type:", active.data.current?.type);
    console.log("Over target type:", over?.data.current?.type);
    // --- END NEW DEBUGGING LOGS ---


    // Scenario 1: Reordering existing fields within the canvas
    if (active.data.current?.type === 'field' && over?.data.current?.type === 'field') {
      console.log("Scenario: Reordering existing field on canvas.");
      // Fetch fresh field IDs from storeState before reordering
      const freshStep = storeState.currentForm.steps[storeState.currentForm.currentStepIndex];
      const freshFieldIds = freshStep?.fieldIds ?? [];

      if (
        active.id !== over.id &&
        freshFieldIds.includes(active.id as string) &&
        freshFieldIds.includes(over.id as string)
      ) {
        reorderFields(active.id as string, over.id as string);
      }
      return;
    }

    // Scenario 2: Adding a new field from the palette to the canvas
    if (active.data.current?.type === 'palette-item' && over?.data.current?.type === 'field-canvas') {
      console.log("Scenario: Adding new field from palette to canvas.");
      const fieldType = active.id.toString().replace('palette-', '') as FormFieldType;
      console.log("Attempting to add field of type:", fieldType);

      if (currentStep) {
        console.log("Adding field to current step with ID:", currentStep.id);
        addField(fieldType, currentStep.id);
      } else {
        console.warn("No current step found, adding field to default step.");
        addField(fieldType); // Fallback
      }
      // Log the form state AFTER adding the field
      console.log("Form state after addField - currentForm.fields:", currentForm.fields);
      console.log("Form state after addField - fieldsInCurrentStep:", fieldsInCurrentStep);
    }
  }

  const dragOverlayContent = activeId ? (
    activeId.toString().startsWith('palette-')
      ? <div className="p-2 bg-blue-500 text-white rounded opacity-80">{activeId.toString().replace('palette-', '')}</div>
      : <div className="p-2 bg-gray-300 border border-dashed rounded opacity-80">Dragging Field</div>
  ) : null;


  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Left Sidebar: Field Palette */}
        <div className="w-64 bg-white p-4 shadow-md overflow-y-auto border-r">
          <h2 className="text-xl font-bold mb-4">Field Types</h2>
          <FieldPalette />
        </div>

        {/* Main Content: Form Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">{currentForm.title}</h1>
          <p className="text-gray-600 mb-8">{currentForm.description}</p>

          <FormCanvas />
        </main>

        {/* Right Sidebar: Field Configuration Panel */}
        <div className="w-80 bg-white p-4 shadow-md overflow-y-auto border-l">
          <h2 className="text-xl font-bold mb-4">Field Configuration</h2>
          <FieldConfigPanel
            field={currentlySelectedField}
            onUpdateField={updateField}
            formTitle={currentForm.title}
            formDescription={currentForm.description}
            setFormTitle={setFormTitle}
            setFormDescription={setFormDescription}
            steps={currentForm.steps ?? []}
            currentStepIndex={currentForm.currentStepIndex}
            onAddStep={addStep}
            onDeleteStep={deleteStep}
            onSetCurrentStep={setCurrentStepIndex}
          />
        </div>
      </div>
      {/* Drag Overlay for visual feedback during drag */}
      <DragOverlay>{dragOverlayContent}</DragOverlay>
    </DndContext>
  );
}