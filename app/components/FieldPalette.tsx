import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldType } from '../state/formStore'; // Adjust path
import { TEMPLATES } from '../templates/templates';

interface DraggableFieldTypeProps {
  type: FormFieldType;
  label: string;
}

function DraggableFieldType({ type, label }: DraggableFieldTypeProps) {
  // We use a unique ID for each palette item to distinguish it from actual form fields
  const id = `palette-${type}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: {
      type: 'palette-item',
      fieldType: type,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 mb-3 bg-blue-500 text-white rounded-md cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors"
    >
      {label}
    </div>
  );
}

export function FieldPalette() {
  const fieldTypes: { type: FormFieldType; label: string }[] = [
    { type: 'text', label: 'Text Input' },
    { type: 'email', label: 'Email Input' },
    { type: 'number', label: 'Number Input' },
    { type: 'textarea', label: 'Text Area' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'select', label: 'Dropdown' },
    { type: 'date', label: 'Date Picker' },
    { type: 'password', label: 'Password' },
  ];

  return (
    <div className="space-y-3">
      {fieldTypes.map((fieldType) => (
        <DraggableFieldType key={fieldType.type} type={fieldType.type} label={fieldType.label} />
      ))}
      {/* NEW: Load Template Dropdown */}
      <select
                onChange={(e) => {
                  const templateId = e.target.value;
                  if (templateId) {
                    const selectedTemplate = TEMPLATES.find(t => t.template.id === templateId)?.template;
                    if (selectedTemplate) {
                      // Prompt user before loading a template to prevent accidental data loss
                      if (confirm("Loading a template will replace your current form. Are you sure you want to proceed?")) {
                        loadForm(selectedTemplate.id); // Re-using loadForm as it handles setting form state
                        alert(`Template "${selectedTemplate.title}" loaded successfully!`);
                      }
                    }
                  }
                  e.target.value = ''; // Reset select to default/placeholder
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                defaultValue="" // Ensures placeholder is shown initially
                aria-label="Load Form Template"
              >
                <option value="" disabled>Load Template...</option>
                {TEMPLATES.map((t) => (
                  <option key={t.template.id} value={t.template.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {/* End NEW: Load Template Dropdown */}
    </div>
  );
}




