// app/components/FieldPalette.tsx
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FormFieldType } from '../state/formStore';
import { useFormStore } from '../state/formStore';
import { TEMPLATES } from '../templates/templates';

interface DraggableFieldProps {
  id: string;
  type: FormFieldType;
  label: string;
}

function DraggableField({ id, type, label }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: {
      type: 'palette-item',
      fieldType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // UPDATED CLASSES: blue, rectangular style
      className={`p-3 border text-center cursor-grab transition-colors duration-200
        text-white font-semibold
        ${isDragging ? 'bg-blue-400 border-blue-500 opacity-75' : 'bg-blue-600 border-blue-700 hover:bg-blue-700'}
        `}
    >
      {label}
    </div>
  );
}

export function FieldPalette() {
  const setEntireForm = useFormStore(state => state.setEntireForm);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const handleLoadTemplate = () => {
    if (selectedTemplateId) {
      const templateToLoad = TEMPLATES.find(t => t.id === selectedTemplateId);
      if (templateToLoad) {
        setEntireForm(templateToLoad.form);
        alert(`Template "${templateToLoad.name}" loaded successfully!`);
        setSelectedTemplateId('');
      } else {
        alert(`Template "${selectedTemplateId}" not found in predefined templates.`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md shadow-inner">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Load Existing Form/Template</h3>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">-- Select a Template --</option>
          {TEMPLATES.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleLoadTemplate}
          disabled={!selectedTemplateId}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Template
        </button>
      </div>

      <div className='flex flex-col gap-3'>
        <DraggableField id="text-field" type="text" label="Text Input" />
        <DraggableField id="email-field" type="email" label="Email Input" />
        <DraggableField id="number-field" type="number" label="Number Input" />
        <DraggableField id="textarea-field" type="textarea" label="Text Area" />
        <DraggableField id="checkbox-field" type="checkbox" label="Checkbox" />
        <DraggableField id="radio-field" type="radio" label="Radio Button" />
        <DraggableField id="select-field" type="select" label="Select Dropdown" />
        <DraggableField id="date-field" type="date" label="Date Picker" />
        <DraggableField id="password-field" type="password" label="Password Input" />
      </div>
    </div>
  );
}