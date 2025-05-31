// app/components/SortableItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField } from '../state/formStore';
import { useFormStore } from '../state/formStore';
import { TrashIcon } from '@heroicons/react/24/solid';

interface SortableItemProps {
  field: FormField;
}

export function SortableItem({ field }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { // Add data for identifying this as a field on canvas
      type: 'field',
      fieldId: field.id,
    },
  });

  const selectedFieldId = useFormStore(state => state.selectedFieldId);
  const setSelectedFieldId = useFormStore(state => state.setSelectedFieldId);
  const deleteField = useFormStore(state => state.deleteField);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add z-index for dragging clarity over other elements
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  const isSelected = selectedFieldId === field.id;

  const getFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'password':
      case 'date':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || field.label}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            readOnly // Make read-only for preview
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || field.label}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            rows={3}
            readOnly
          ></textarea>
        );
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" disabled />
            <span>{field.label}</span>
          </label>
        );
      case 'radio':
        return (
          <div className="flex items-center space-x-4">
            {field.options?.map(option => (
              <label key={option.id} className="flex items-center space-x-2">
                <input type="radio" name={field.id} className="form-radio h-4 w-4 text-blue-600" disabled />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled>
            {field.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <p className="text-gray-500 dark:text-gray-400">Unsupported Field Type</p>;
    }
  };

  const handleSelectField = () => {
    setSelectedFieldId(field.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent default scroll for space key
      handleSelectField();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Use onClick for primary selection interaction (mouse/touch)
      onClick={handleSelectField}
      // onMouseDown for nuanced selection behavior to coexist with drag
      onMouseDown={(e) => {
        // Only select on left-click and prevent immediate drag conflict if click is on drag handle
        if (e.button === 0 && !(e.target as HTMLElement).closest('.drag-handle')) {
           setSelectedFieldId(field.id);
        }
      }}
      onKeyDown={handleKeyDown} // Handles keyboard interaction (Enter/Space)
      role="button" // Announce as a button to assistive technologies
      tabIndex={0} // Make it focusable by keyboard
      aria-pressed={isSelected} // Indicate if it's currently selected (like a toggle button)
      className={`relative p-4 mb-3 border cursor-pointer
        ${isSelected ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'}
        bg-white dark:bg-gray-700 rounded-md`}
    >
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {field.label} {field.validation?.required && <span className="text-red-500">*</span>}
        </label>
        {/* Drag handle - now with role="button" and tabIndex={0} for a11y */}
        <div
          {...listeners} // Listeners from useSortable for drag functionality
          {...attributes} // Attributes from useSortable for ARIA and keyboard handling
          className="drag-handle p-1 cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
          aria-label="Drag field" // Provides accessible name for screen readers
          onMouseDown={(e) => e.stopPropagation()} // Prevents parent div's onMouseDown (selection)
          role="button" // Tells assistive technologies this div acts like a button
          tabIndex={0}  // Makes the div focusable via keyboard tabbing
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
        </div>
      </div>

      {getFieldPreview(field)}

      {/* Delete button, visible only if field is selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent re-selecting after deletion
            deleteField(field.id);
          }}
          className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 rounded-full"
          aria-label="Delete field"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}