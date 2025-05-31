// app/components/FormCanvas.tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormStore, FormField } from '../state/formStore'; // Ensure useFormStore is imported
import FormFieldBlock from './FormFieldBlock'; // Import the FormFieldBlock component
import React from 'react'; // Explicitly import React

// This component represents an individual field that can be sorted
interface SortableFieldProps {
  field: FormField;
}

function SortableField({ field }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Added isDragging for visual feedback
  } = useSortable({ id: field.id, data: { type: 'field' } }); // data.type 'field' is crucial for dragEnd logic

  // Get setSelectedFieldId directly from the store
  const setSelectedFieldId = useFormStore((state) => state.setSelectedFieldId);
  const selectedFieldId = useFormStore((state) => state.selectedFieldId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    zIndex: isDragging ? 100 : 0, // Bring dragging item to front
    opacity: isDragging ? 0.8 : 1, // Make dragging item slightly transparent
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Drag listeners and attributes are passed down to FormFieldBlock
      // The onClick handler for selection is now within FormFieldBlock
      className={`relative ${isDragging ? 'shadow-lg' : ''}`} // Add shadow when dragging
    >
      <FormFieldBlock
        field={field}
        isSelected={selectedFieldId === field.id}
        // Pass drag attributes and listeners to the block
        dragAttributes={attributes}
        dragListeners={listeners}
        // Pass the ref to the block for sortable functionality
        innerRef={setNodeRef}
      />
    </div>
  );
}

// Main FormCanvas component
export function FormCanvas() {
  // Use useDroppable to make the canvas a drop target
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: 'field-canvas', // Unique ID for the droppable area
    data: {
      type: 'field-canvas', // data.type 'field-canvas' is crucial for dragEnd logic
    },
  });

  // Get form data directly from the Zustand store
  const currentForm = useFormStore((state) => state.form);

  // Safely get the current step and fields within it
  const currentStep = currentForm?.steps?.[currentForm.currentStepIndex];
  const fieldsInCurrentStep = currentStep
    ? currentForm.fields.filter(field => currentStep.fieldIds.includes(field.id))
                         .sort((a, b) => {
                             const indexA = currentStep.fieldIds.indexOf(a.id);
                             const indexB = currentStep.fieldIds.indexOf(b.id);
                             return indexA - indexB;
                         })
    : [];

  const fieldIds = fieldsInCurrentStep.map(field => field.id);

  return (
    <div
      ref={setDroppableNodeRef} // Assign the droppable ref to the canvas div
      className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg min-h-[300px] bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
    >
      {/* SortableContext for reordering existing fields */}
      <SortableContext
        items={fieldIds} // Provide IDs of sortable items
        strategy={verticalListSortingStrategy}
      >
        {fieldsInCurrentStep.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">Drag fields here to start building your form.</p>
        ) : (
          fieldsInCurrentStep.map((field) => (
            <SortableField key={field.id} field={field} />
          ))
        )}
      </SortableContext>
    </div>
  );
}