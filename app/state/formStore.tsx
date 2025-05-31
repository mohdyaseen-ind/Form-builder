// app/state/formStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WritableDraft } from 'immer'; // Import WritableDraft for accurate typing within immer's set
import { v4 as uuidv4 } from 'uuid';

export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'password';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  pattern?: string; // For regex (email, phone) or min/max (number)
  minLength?: number; // For text/textarea
  maxLength?: number; // For text/textarea
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[]; // For select, radio, checkbox
  validation?: FormFieldValidation;
}

export interface FormStep {
  id: string;
  name: string;
  fieldIds: string[]; // Ordered list of field IDs in this step
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  steps: FormStep[];
  currentStepIndex: number;
}

interface FormState {
  form: Form;
  selectedFieldId: string | null;
  addField: (type: FormFieldType) => void;
  deleteField: (id: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  reorderField: (activeId: string, overId: string) => void;
  setSelectedFieldId: (id: string | null) => void;
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
  addStep: () => void;
  deleteStep: (stepId: string) => void;
  setCurrentStep: (index: number) => void;
  // New actions for saving/loading
  saveForm: (formId: string) => boolean;
  loadForm: (formId: string) => boolean;
  resetForm: () => void;
}

const initialFormState: Form = {
  id: uuidv4(), // Assign a new ID when the store is initialized
  title: 'Untitled Form',
  description: 'A description for your form.',
  fields: [],
  steps: [{ id: uuidv4(), name: 'Step 1', fieldIds: [] }],
  currentStepIndex: 0,
};

export const useFormStore = create<FormState>()(
  // Explicitly define middleware types for immer
  immer<FormState, [], [['zustand/immer', never]]>(
    (set, get) => ({
      form: initialFormState,
      selectedFieldId: null,

      addField: (type) =>
        set((state: WritableDraft<FormState>) => { // Ensure state is typed as WritableDraft
          const newField: FormField = {
            id: uuidv4(),
            type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            validation: {},
          };

          if (type === 'select' || type === 'radio' || type === 'checkbox') {
            newField.options = [{ id: uuidv4(), label: 'Option 1', value: 'option1' }];
          }

          state.form.fields.push(newField);
          // Add the new field to the current step's fieldIds
          if (state.form.steps.length > 0) {
            state.form.steps[state.form.currentStepIndex].fieldIds.push(newField.id);
          }
        }),

      deleteField: (id) =>
        set((state: WritableDraft<FormState>) => {
          state.form.fields = state.form.fields.filter((field) => field.id !== id);
          // Also remove from all step fieldIds
          state.form.steps.forEach(step => {
            step.fieldIds = step.fieldIds.filter(fieldId => fieldId !== id);
          });
          if (state.selectedFieldId === id) {
            state.selectedFieldId = null;
          }
        }),

      updateField: (id, updates) =>
        set((state: WritableDraft<FormState>) => {
          const fieldIndex = state.form.fields.findIndex((field) => field.id === id);
          if (fieldIndex !== -1) {
            state.form.fields[fieldIndex] = { ...state.form.fields[fieldIndex], ...updates };
          }
        }),

      reorderField: (activeId, overId) =>
        set((state: WritableDraft<FormState>) => {
          const currentStep = state.form.steps[state.form.currentStepIndex];
          const oldIndex = currentStep.fieldIds.indexOf(activeId);
          const newIndex = currentStep.fieldIds.indexOf(overId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const [movedFieldId] = currentStep.fieldIds.splice(oldIndex, 1);
            currentStep.fieldIds.splice(newIndex, 0, movedFieldId);
          }
        }),

      setSelectedFieldId: (id) =>
        set((state: WritableDraft<FormState>) => {
          state.selectedFieldId = id;
        }),

      setFormTitle: (title) =>
        set((state: WritableDraft<FormState>) => {
          state.form.title = title;
        }),

      setFormDescription: (description) =>
        set((state: WritableDraft<FormState>) => {
          state.form.description = description;
        }),

      addStep: () =>
        set((state: WritableDraft<FormState>) => {
          const newStep: FormStep = {
            id: uuidv4(),
            name: `Step ${state.form.steps.length + 1}`,
            fieldIds: [],
          };
          state.form.steps.push(newStep);
          state.form.currentStepIndex = state.form.steps.length - 1; // Auto-select new step
        }),

      deleteStep: (stepId) =>
        set((state: WritableDraft<FormState>) => {
          if (state.form.steps.length > 1) {
            const deletedStepIndex = state.form.steps.findIndex(step => step.id === stepId);
            if (deletedStepIndex !== -1) {
              // Re-assign fields from deleted step to previous step if it exists, otherwise to first step
              const fieldsToReassign = state.form.steps[deletedStepIndex].fieldIds;
              state.form.steps.splice(deletedStepIndex, 1); // Remove the step

              if (fieldsToReassign.length > 0) {
                const targetStepIndex = Math.max(0, deletedStepIndex - 1);
                state.form.steps[targetStepIndex].fieldIds.push(...fieldsToReassign);
              }

              // Adjust current step index if deleted step was current or after current
              if (state.form.currentStepIndex >= state.form.steps.length) {
                state.form.currentStepIndex = state.form.steps.length - 1;
              }
            }
          } else {
            // If only one step left, clear its fields and rename it
            state.form.steps[0].fieldIds = [];
            state.form.steps[0].name = 'Step 1';
          }
        }),

      setCurrentStep: (index) =>
        set((state: WritableDraft<FormState>) => {
          if (index >= 0 && index < state.form.steps.length) {
            state.form.currentStepIndex = index;
          }
        }),

      // New: Save Form to localStorage
      saveForm: (formId: string) => {
        try {
          const formToSave = get().form;
          const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}');
          savedForms[formId] = formToSave;
          localStorage.setItem('savedForms', JSON.stringify(savedForms));
          console.log(`Form "${formId}" saved successfully to localStorage!`);
          return true;
        } catch (error) {
          console.error("Failed to save form to localStorage:", error);
          return false;
        }
      },

      // New: Load Form from localStorage
      loadForm: (formId: string) => {
        try {
          const savedForms = JSON.parse(localStorage.getItem('savedForms') || '{}');
          const loadedForm = savedForms[formId];
          if (loadedForm) {
            set((state: WritableDraft<FormState>) => {
              state.form = loadedForm;
              state.selectedFieldId = null; // Clear selected field on load
              state.form.currentStepIndex = 0; // Reset to first step on load
            });
            console.log(`Form "${formId}" loaded successfully from localStorage!`);
            return true;
          } else {
            console.warn(`Form "${formId}" not found in localStorage.`);
            return false;
          }
        } catch (error) {
          console.error("Failed to load form from localStorage:", error);
          return false;
        }
      },

      // New: Reset Form to initial state
      resetForm: () =>
        set((state: WritableDraft<FormState>) => {
          state.form = {
            id: uuidv4(),
            title: 'Untitled Form',
            description: 'A description for your form.',
            fields: [],
            steps: [{ id: uuidv4(), name: 'Step 1', fieldIds: [] }],
            currentStepIndex: 0,
          };
          state.selectedFieldId = null;
        }),
    })
  )
);