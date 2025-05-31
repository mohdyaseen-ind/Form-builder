import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormStore, FormField } from '../state/formStore'; // Adjust path

interface SortableFieldProps {
  field: FormField;
}

function SortableField({ field }: SortableFieldProps) {
  const setSelectedFieldId = useFormStore(state => state.setSelectedFieldId);
  const selectedFieldId = useFormStore(state => state.selectedFieldId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field', // Custom data to identify this as a draggable form field
      fieldId: field.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab', // Add cursor style for draggable fields
  };

  const isSelected = selectedFieldId === field.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 mb-3 border rounded-md bg-white shadow-sm flex items-center justify-between ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
      }`}
      onClick={() => setSelectedFieldId(field.id)}
    >
      <span>{field.label} ({field.type})</span>
      <div {...listeners} className="p-2 -mr-2 cursor-grab text-gray-500 hover:text-gray-700">
        {/* Drag handle icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

interface FormCanvasProps {
  fields: FormField[];
}

export function FormCanvas({ fields }: FormCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'field-canvas', // ID for the droppable area
    data: {
      type: 'field-canvas', // Custom data to identify this as the canvas
    },
  });

  // Collect the IDs of the fields in the current step for SortableContext
  const fieldIds = fields.map(field => field.id);

  return (
    <div
      ref={setNodeRef}
      className="p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[300px] bg-gray-50"
    >
      <SortableContext
        items={fieldIds}
        strategy={verticalListSortingStrategy}
      >
        {fields.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Drag fields here to start building your form.</p>
        ) : (
          fields.map((field) => (
            <SortableField key={field.id} field={field} />
          ))
        )}
      </SortableContext>
    </div>
  );
}