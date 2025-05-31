import React from 'react';
import { FormFieldType } from '../state/formStore';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface SidebarProps {
  onAddField: (type: FormFieldType) => void;
}

export default function Sidebar({ onAddField }: SidebarProps) {
  const fieldTypes: { type: FormFieldType; label: string }[] = [
    { type: 'text', label: 'Text Input' },
    { type: 'email', label: 'Email Input' },
    { type: 'number', label: 'Number Input' },
    { type: 'textarea', label: 'Textarea' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'select', label: 'Select Dropdown' },
    { type: 'date', label: 'Date Picker' },
    { type: 'password', label: 'Password' },
  ];

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 shadow-lg overflow-y-auto flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Field Types</h2>
      <ul className="space-y-3">
        {fieldTypes.map((fieldType) => (
          <li key={fieldType.type}>
            <button
              onClick={() => onAddField(fieldType.type)}
              className="w-full flex items-center justify-start px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md shadow-sm hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Add ${fieldType.label} field`}
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              {fieldType.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}