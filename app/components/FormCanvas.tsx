// app/components/FormCanvas.tsx
import { useDroppable, useDndMonitor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormStore, FormField } from '../state/formStore';

interface SortableFieldProps {
  field: FormField;
  setSelectedFieldId: (id: string | null) => void;
}

function SortableField({ field, setSelectedFieldId }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, data: { type: 'field' }, disabled: false });

  const deleteField = useFormStore(state => state.deleteField);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    position: 'relative',
    zIndex: isDragging ? 999 : undefined,
    backgroundColor: isDragging ? 'white' : undefined,
    pointerEvents: isDragging ? 'none' : undefined, // Prevents clicks on the overlay
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // Only attach listeners to the drag handle if you want a specific handle
      // For now, attaching to the whole div for easier dragging
      // {...listeners} // Removed from here to prevent conflicts with onClick on the whole div
      onClick={() => setSelectedFieldId(field.id)}
      tabIndex={0}
      className="p-3 mb-2 border border-gray-300 rounded-md bg-white shadow-sm hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-all relative"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent selecting the field when deleting
          deleteField(field.id);
        }}
        className="absolute top-1 right-1 text-gray-400 hover:text-red-600 focus:outline-none"
        aria-label="Delete field"
      >
        &#x2715;
      </button>
      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
      {/* Render a simplified representation of the field */}
      {field.type === 'text' && <input type="text" placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.type === 'email' && <input type="email" placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.type === 'number' && <input type="number" placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.type === 'textarea' && <textarea placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.type === 'checkbox' && <div><input type="checkbox" disabled /> Checkbox</div>}
      {field.type === 'radio' && <div><input type="radio" disabled /> Radio</div>}
      {field.type === 'select' && <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled><option>Option 1</option></select>}
      {field.type === 'date' && <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.type === 'password' && <input type="password" placeholder={field.placeholder} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" disabled />}
      {field.helpText && <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>}
      {/* Drag handle - important for accessibility and clear interaction */}
      <div {...listeners} className="absolute bottom-1 right-1 p-1 cursor-grab text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

// REMOVED 'fields: FormField[];' from FormCanvasProps
interface FormCanvasProps {
  // No props needed here as it fetches from store directly
}

export function FormCanvas({}: FormCanvasProps) { // Removed fields from destructuring
  const { setNodeRef } = useDroppable({
    id: 'field-canvas',
    data: {
      type: 'field-canvas',
    },
  });

  const currentForm = useFormStore(state => state.currentForm);
  const setSelectedFieldId = useFormStore(state => state.setSelectedFieldId);
  const reorderFields = useFormStore(state => state.reorderFields);

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over || active.id === over.id) return;

      reorderFields(active.id as string, over.id as string);
    },
  });

  const currentStep = currentForm.steps[currentForm.currentStepIndex];
  // Ensure currentForm.fields is an array before filtering/mapping
  const allFormFields = currentForm.fields ?? [];

  const fieldsInCurrentStep = currentStep.fieldIds
    .map(id => allFormFields.find(f => f.id === id))
    .filter((f): f is FormField => f !== undefined);

  const fieldIds = fieldsInCurrentStep.map(field => field.id);

  return (
    <div
      ref={setNodeRef}
      className="p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[300px] bg-gray-50"
    >
      <SortableContext
        items={fieldIds}
        strategy={verticalListSortingStrategy}
      >
        {fieldsInCurrentStep.length === 0 ? (
          <p className="text-gray-500 text-center py-10">Drag fields here to start building your form.</p>
        ) : (
          fieldsInCurrentStep.map((field) => (
            <SortableField key={field.id} field={field} setSelectedFieldId={setSelectedFieldId} />
          ))
        )}
      </SortableContext>
    </div>
  );
}