import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useFormStore, FormField, FormFieldType, FormStep } from '../state/formStore'; // Adjust path if needed

// --- Component Imports (we'll create these next) ---
import { FieldPalette } from '../components/FieldPalette';
import { FormCanvas } from '../components/FormCanvas';
import  FieldConfigPanel  from '../components/FieldConfigPanel'; // Will be simple for now

export default function FormBuilderPage() {
  const currentForm = useFormStore(state => state.currentForm);
  const selectedFieldId = useFormStore(state => state.selectedFieldId);
  const addField = useFormStore(state => state.addField);
  const reorderFields = useFormStore(state => state.reorderFields);

  // State to manage the currently dragged item for the DragOverlay
  const [activeId, setActiveId] = useState<string | null>(null);

  // Get the fields in the current step (important for reordering scope)
  const currentStep: FormStep | undefined = currentForm.steps[currentForm.currentStepIndex];
  const currentStepFieldIds: string[] = currentStep ? currentStep.fieldIds : [];
  const fieldsInCurrentStep: FormField[] = currentStepFieldIds
    .map(fieldId => currentForm.fields.find(f => f.id === fieldId))
    .filter((f): f is FormField => f !== undefined);


  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null); // Clear activeId

    // Scenario 1: Reordering existing fields within the canvas
    if (active.data.current?.type === 'field' && over?.data.current?.type === 'field-canvas') {
      // Reordering within the current step (same parent)
      if (active.id !== over.id && currentStepFieldIds.includes(active.id as string) && currentStepFieldIds.includes(over.id as string)) {
        reorderFields(active.id as string, over.id as string);
      }
      return; // Handled reorder, exit.
    }

    // Scenario 2: Adding a new field from the palette to the canvas
    if (active.data.current?.type === 'palette-item' && over?.data.current?.type === 'field-canvas') {
      const fieldType = active.id as FormFieldType;
      if (currentStep) {
        addField(fieldType, currentStep.id);
      } else {
        // Fallback if no step exists (shouldn't happen with initial state)
        addField(fieldType);
      }
    }
  }

  // Determine what to show in the drag overlay
  const dragOverlayContent = activeId ? (
    // Check if it's a palette item or an existing field for overlay content
    activeId.startsWith('palette-')
      ? <div className="p-2 bg-blue-500 text-white rounded opacity-80">{activeId.replace('palette-', '')}</div>
      : <div className="p-2 bg-gray-300 border border-dashed rounded opacity-80">Dragging Field</div>
  ) : null;


  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex min-h-screen bg-gray-100">
        {/* Left Sidebar: Field Palette */}
        <div className="w-64 bg-white p-4 shadow-md overflow-y-auto border-r">
          <h2 className="text-xl font-bold mb-4">Field Palette</h2>
          <FieldPalette />
        </div>

        {/* Main Content: Form Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">{currentForm.title}</h1>
          <p className="text-gray-600 mb-8">{currentForm.description}</p>

          <FormCanvas fields={fieldsInCurrentStep} />
        </main>

        {/* Right Sidebar: Field Configuration Panel */}
        <div className="w-80 bg-white p-4 shadow-md overflow-y-auto border-l">
          <h2 className="text-xl font-bold mb-4">Field Configuration</h2>
          <FieldConfigPanel />
        </div>
      </div>
      {/* Drag Overlay for visual feedback during drag */}
      <DragOverlay>{dragOverlayContent}</DragOverlay>
    </DndContext>
  );
}