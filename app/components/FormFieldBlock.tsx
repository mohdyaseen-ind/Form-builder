import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormStore, FormField } from "../state/formStore";
import { XCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import React from 'react';

interface FormFieldBlockProps {
  field: FormField;
  isSelected: boolean;
}

export default function FormFieldBlock({ field, isSelected }: FormFieldBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field', // <--- IMPORTANT: Ensure this is set for correct drag-end detection
    },
  });

  const setSelectedFieldId = useFormStore((state) => state.setSelectedFieldId);
  const deleteField = useFormStore((state) => state.deleteField);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleSelectField = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent global listener from firing when a field is clicked
    setSelectedFieldId(field.id);
  };

  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the field block when deleting
    if (confirm(`Are you sure you want to delete "${field.label}"?`)) {
      deleteField(field.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-3 border rounded-lg bg-white shadow-sm flex items-center justify-between gap-4 transition-all duration-200
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-500'
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
        dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500
      `}
    >
      <button
        onClick={handleSelectField}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSelectField(e);
          }
        }}
        className="flex-grow flex flex-col items-start text-left focus:outline-none"
        aria-label={`Select field: ${field.label}`}
        tabIndex={0}
      >
        <label className="block text-base font-medium text-gray-700 dark:text-gray-200">
          {field.label} {field.validation?.required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Type: {field.type} {field.placeholder && ` | Placeholder: ${field.placeholder}`}
        </p>
        {field.helpText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{field.helpText}</p>
        )}
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDeleteField}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Delete Field"
          type="button"
          aria-label={`Delete field: ${field.label}`}
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
        <button
          {...listeners}
          {...attributes}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-grab p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          title="Drag Field"
          type="button"
          aria-label={`Drag field: ${field.label}`}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}