import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions ---
export type FormFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'date'
  | 'password';

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
}

export interface FormStep {
  id: string;
  name: string;
  fieldIds: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  steps: FormStep[];
  currentStepIndex: number;
}

interface FormStoreState {
  currentForm: Form;
  selectedFieldId: string | null;

  // Actions
  setFormTitle: (title: string) => void;
  setFormDescription: (description: string) => void;
  addField: (type: FormFieldType, stepId?: string) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (activeId: string, overId: string) => void;
  setSelectedFieldId: (id: string | null) => void;
  addStep: () => void;
  updateStepName: (stepId: string, name: string) => void;
  deleteStep: (stepId: string) => void;
  setCurrentStepIndex: (index: number) => void;
  resetForm: () => void;

  // Persistence Actions (for localStorage)
  saveFormToLocalStorage: () => void;
  loadFormFromLocalStorage: () => void;
}

const initialFormState: Form = {
  id: uuidv4(),
  title: 'Untitled Form',
  description: 'A brief description of my form.',
  fields: [],
  steps: [{ id: uuidv4(), name: 'Step 1', fieldIds: [] }],
  currentStepIndex: 0,
};

// --- Store ---
export const useFormStore = create<FormStoreState>()(
  // The structure here is crucial:
  // create() takes ONE argument, which is the function that defines your store.
  // If you use middleware, that function is the middleware itself.
  // So, persist() is the first argument to create().
  persist(
    // persist() takes TWO arguments:
    // 1. The actual store logic (which is wrapped by immer).
    // 2. The persist configuration object.
    immer((set, get) => ({ // This is the store logic function, wrapped by immer
      currentForm: initialFormState,
      selectedFieldId: null,

      // --- Persistence Actions ---
      saveFormToLocalStorage: () => {
        const formToSave = get().currentForm;
        try {
          localStorage.setItem('formBuilderData', JSON.stringify(formToSave));
          console.log('Form saved to local storage!');
        } catch (e) {
          console.error('Failed to save form to local storage:', e);
        }
      },
      loadFormFromLocalStorage: () => {
        try {
          const storedForm = localStorage.getItem('formBuilderData');
          if (storedForm) {
            const loadedForm = JSON.parse(storedForm);
            if (loadedForm.id && loadedForm.title && Array.isArray(loadedForm.fields) && Array.isArray(loadedForm.steps)) {
                set(state => {
                    state.currentForm = loadedForm;
                    state.currentForm.currentStepIndex = Math.min(loadedForm.currentStepIndex || 0, loadedForm.steps.length - 1);
                    state.selectedFieldId = null;
                });
                console.log('Form loaded from local storage!');
            } else {
                console.warn("Invalid form data in local storage, loading initial state.");
                set(state => { state.currentForm = initialFormState; state.selectedFieldId = null; });
            }
          } else {
            console.log('No form found in local storage.');
          }
        } catch (e) {
          console.error('Failed to load form from local storage or JSON parsing error:', e);
          set(state => { state.currentForm = initialFormState; state.selectedFieldId = null; });
        }
      },

      // --- Form-level Actions (Directly mutate state with Immer) ---
      setFormTitle: (title) => set((state) => {
        state.currentForm.title = title;
      }),
      setFormDescription: (description) => set((state) => {
        state.currentForm.description = description;
      }),

      // --- Field-level Actions (Directly mutate state with Immer) ---
      addField: (type, stepId) => set((state) => {
        const newField: FormField = {
          id: uuidv4(),
          type,
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
          placeholder: type === 'text' ? 'Enter text...' : undefined,
          helpText: '',
          validation: { required: false },
        };

        if (type === 'select' || type === 'radio' || type === 'checkbox') {
          newField.options = [
            { id: uuidv4(), value: 'option1', label: 'Option 1' },
            { id: uuidv4(), value: 'option2', label: 'Option 2' },
          ];
        }

        state.currentForm.fields.push(newField);
        const targetStep = stepId
          ? state.currentForm.steps.find(s => s.id === stepId)
          : state.currentForm.steps[state.currentForm.currentStepIndex];

        if (targetStep) {
          targetStep.fieldIds.push(newField.id);
        } else {
          console.warn(`Target step with ID ${stepId} not found. Adding to current step.`);
          state.currentForm.steps[state.currentForm.currentStepIndex].fieldIds.push(newField.id);
        }
        state.selectedFieldId = newField.id;
      }),

      updateField: (id, updates) => set((state) => {
        const field = state.currentForm.fields.find((f) => f.id === id);
        if (field) {
          Object.assign(field, updates);
        }
      }),

      deleteField: (fieldId) => set((state) => {
        state.currentForm.steps.forEach((step: FormStep) => {
          step.fieldIds = step.fieldIds.filter(id => id !== fieldId);
        });
        state.currentForm.fields = state.currentForm.fields.filter(f => f.id !== fieldId);
        if (state.selectedFieldId === fieldId) {
          state.selectedFieldId = null;
        }
      }),

      reorderFields: (activeId, overId) => set((state) => {
        const currentStep = state.currentForm.steps[state.currentForm.currentStepIndex];
        const oldIndex = currentStep.fieldIds.indexOf(activeId);
        const newIndex = currentStep.fieldIds.indexOf(overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          const [removed] = currentStep.fieldIds.splice(oldIndex, 1);
          currentStep.fieldIds.splice(newIndex, 0, removed);
        }
      }),

      setSelectedFieldId: (id) => set({ selectedFieldId: id }),

      // --- Step-level Actions (Directly mutate state with Immer) ---
      addStep: () => set((state) => {
        const newStep: FormStep = {
          id: uuidv4(),
          name: `Step ${state.currentForm.steps.length + 1}`,
          fieldIds: [],
        };
        state.currentForm.steps.push(newStep);
        state.currentForm.currentStepIndex = state.currentForm.steps.length - 1;
        state.selectedFieldId = null;
      }),

      updateStepName: (stepId, name) => set((state) => {
        const step = state.currentForm.steps.find(s => s.id === stepId);
        if (step) {
          step.name = name;
        }
      }),

      deleteStep: (stepId) => set((state) => {
        if (state.currentForm.steps.length <= 1) {
          alert("Cannot delete the last step. A form must have at least one step.");
          return;
        }

        const stepToDeleteIndex = state.currentForm.steps.findIndex(s => s.id === stepId);
        if (stepToDeleteIndex === -1) return;

        const fieldsInDeletedStep = state.currentForm.steps[stepToDeleteIndex].fieldIds;

        state.currentForm.fields = state.currentForm.fields.filter(field =>
          !fieldsInDeletedStep.includes(field.id) ||
          state.currentForm.steps.some((s: FormStep) => s.id !== stepId && s.fieldIds.includes(field.id))
        );

        state.currentForm.steps.splice(stepToDeleteIndex, 1);

        if (state.currentForm.currentStepIndex >= state.currentForm.steps.length) {
          state.currentForm.currentStepIndex = Math.max(0, state.currentForm.steps.length - 1);
        }
        state.selectedFieldId = null;
      }),

      setCurrentStepIndex: (index) => set((state) => {
        state.currentForm.currentStepIndex = index;
        state.selectedFieldId = null;
      }),

      resetForm: () => set({ currentForm: initialFormState, selectedFieldId: null }),
    })), // <-- THIS IS THE CRITICAL LINE. It closes immer's function AND separates it from persist's config.
    {
      name: 'form-builder-storage',
      storage: createJSONStorage(() => localStorage),
    }
  ) // <-- This closes the persist middleware
); // <-- This closes the create function, followed by the semicolon