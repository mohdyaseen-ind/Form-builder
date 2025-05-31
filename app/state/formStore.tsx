// app/state/formStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // For mutable state updates
import { persist, createJSONStorage } from 'zustand/middleware'; // NEW: For state persistence
import { v4 as uuidv4 } from 'uuid'; // Using uuidv4 as per your preference

// --- Constants ---
const AUTO_SAVE_KEY = 'formBuilderLastEditedForm'; // Key for the auto-saved form in localStorage
const SPECIFIC_FORMS_KEY = 'savedSpecificForms'; // Key for explicitly saved forms (for save/load actions)

// --- Interfaces (Ensuring consistency with your provided code) ---
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
  saveForm: (formId: string) => boolean; // For explicit save to a specific ID
  loadForm: (formId: string) => boolean; // For explicit load from a specific ID
  resetForm: () => void;
}

// Default initial form state (used if no auto-saved form is found)
const getDefaultForm = (): Form => ({
  id: uuidv4(), // Assign a new ID for a truly new form
  title: 'Untitled Form',
  description: 'A description for your form.',
  fields: [],
  steps: [{ id: uuidv4(), name: 'Step 1', fieldIds: [] }],
  currentStepIndex: 0,
});

export const useFormStore = create<FormState>()(
  // NEW: Wrap the Immer middleware with the Persist middleware
  // The 'persist' middleware automatically handles loading/saving state
  persist(
    // Immer middleware for mutable state updates.
    // We simplify the generic type to just <FormState> as `persist` handles the chaining.
    immer<FormState>(
      (set, get) => ({
        // Initial state for the store. 'persist' will attempt to rehydrate this 'form'
        // from localStorage if data exists under AUTO_SAVE_KEY.
        form: getDefaultForm(), // Initialize with a default form
        selectedFieldId: null,

        // --- Actions ---

        addField: (type) =>
          set((state) => { // Removed explicit WritableDraft typing here
            const newField: FormField = {
              id: uuidv4(), // Using uuidv4
              type,
              label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
              validation: {},
            };

            if (type === 'select' || type === 'radio' || type === 'checkbox') {
              newField.options = [{ id: uuidv4(), label: 'Option 1', value: 'option1' }];
            }

            state.form.fields.push(newField);
            if (state.form.steps.length > 0) {
              state.form.steps[state.form.currentStepIndex].fieldIds.push(newField.id);
            }
            state.selectedFieldId = newField.id; // Select the new field by default
          }),

        deleteField: (id) =>
          set((state) => { // Removed explicit WritableDraft typing here
            state.form.fields = state.form.fields.filter((field) => field.id !== id);
            state.form.steps.forEach(step => {
              step.fieldIds = step.fieldIds.filter(fieldId => fieldId !== id);
            });
            if (state.selectedFieldId === id) {
              state.selectedFieldId = null;
            }
          }),

        updateField: (id, updates) =>
          set((state) => { // Removed explicit WritableDraft typing here
            const fieldIndex = state.form.fields.findIndex((field) => field.id === id);
            if (fieldIndex !== -1) {
              state.form.fields[fieldIndex] = { ...state.form.fields[fieldIndex], ...updates };
            }
          }),

        reorderField: (activeId, overId) =>
          set((state) => { // Removed explicit WritableDraft typing here
            const currentStep = state.form.steps[state.form.currentStepIndex];
            const oldIndex = currentStep.fieldIds.indexOf(activeId);
            const newIndex = currentStep.fieldIds.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1) {
              const [movedFieldId] = currentStep.fieldIds.splice(oldIndex, 1);
              currentStep.fieldIds.splice(newIndex, 0, movedFieldId);
            }
          }),

        setSelectedFieldId: (id) =>
          set((state) => { // Removed explicit WritableDraft typing here
            state.selectedFieldId = id;
          }),

        setFormTitle: (title) =>
          set((state) => { // Removed explicit WritableDraft typing here
            state.form.title = title;
          }),

        setFormDescription: (description) =>
          set((state) => { // Removed explicit WritableDraft typing here
            state.form.description = description;
          }),

        addStep: () =>
          set((state) => { // Removed explicit WritableDraft typing here
            const newStep: FormStep = {
              id: uuidv4(),
              name: `Step ${state.form.steps.length + 1}`,
              fieldIds: [],
            };
            state.form.steps.push(newStep);
            state.form.currentStepIndex = state.form.steps.length - 1; // Auto-select new step
          }),

        deleteStep: (stepId) =>
          set((state) => { // Removed explicit WritableDraft typing here
            if (state.form.steps.length > 1) {
              const deletedStepIndex = state.form.steps.findIndex(step => step.id === stepId);
              if (deletedStepIndex !== -1) {
                const fieldsToReassign = state.form.steps[deletedStepIndex].fieldIds;
                state.form.steps.splice(deletedStepIndex, 1); // Remove the step

                if (fieldsToReassign.length > 0) {
                  const targetStepIndex = Math.max(0, deletedStepIndex - 1);
                  state.form.steps[targetStepIndex].fieldIds.push(...fieldsToReassign);
                }

                if (state.form.currentStepIndex >= state.form.steps.length) {
                  state.form.currentStepIndex = state.form.steps.length - 1;
                }
              }
            } else {
              state.form.steps[0].fieldIds = [];
              state.form.steps[0].name = 'Step 1';
            }
          }),

        setCurrentStep: (index) =>
          set((state) => { // Removed explicit WritableDraft typing here
            if (index >= 0 && index < state.form.steps.length) {
              state.form.currentStepIndex = index;
            }
          }),

        // Explicit Save Form: Saves the current form to localStorage under a specific ID
        saveForm: (formId: string) => {
          try {
            const currentForm = get().form;
            const formToSave = { ...currentForm, id: formId }; // Ensure the saved form gets the ID provided by the user

            // Store specific forms in a nested object keyed by their ID
            const savedForms = JSON.parse(localStorage.getItem(SPECIFIC_FORMS_KEY) || '{}');
            savedForms[formId] = formToSave;
            localStorage.setItem(SPECIFIC_FORMS_KEY, JSON.stringify(savedForms));

            console.log(`Form "${formId}" saved successfully to localStorage!`);
            return true;
          } catch (error) {
            console.error("Failed to save form to localStorage:", error);
            return false;
          }
        },

        // Explicit Load Form: Loads a form from localStorage using a specific ID
        loadForm: (formId: string) => {
          try {
            const savedForms = JSON.parse(localStorage.getItem(SPECIFIC_FORMS_KEY) || '{}');
            const loadedForm = savedForms[formId];
            if (loadedForm) {
              set((state) => { // Removed explicit WritableDraft typing here
                state.form = loadedForm;
                state.selectedFieldId = null; // Clear selected field on load
                state.form.currentStepIndex = 0; // Reset to first step on load for consistency
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

        // Reset Form to its default empty state
        resetForm: () =>
          set((state) => { // Removed explicit WritableDraft typing here
            state.form = getDefaultForm(); // Reset to the default form structure
            state.selectedFieldId = null;
          }),
      })
    ),
    // --- Persist Middleware Options ---
    {
      name: AUTO_SAVE_KEY, // Name of the item in localStorage for auto-save
      storage: createJSONStorage(() => localStorage), // Use standard localStorage for JSON serialization
      // Only persist the 'form' object from the state
      partialize: (state) => ({ form: state.form }),
      // Optional: Add onRehydrateStorage for validation/debugging rehydration
      onRehydrateStorage: (state) => {
        console.log('Form store rehydrating...');
        // You can add logic here to validate the rehydrated 'state' if needed
      },
      // You can add a version property for migrations if your state structure changes significantly
      // version: 1,
      // migrate: (persistedState, version) => { /* migration logic */ },
    }
  )
);