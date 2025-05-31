import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldType } from '../state/formStore'; // Adjust path

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
    </div>
  );
}