// app/state/formStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// --- Constants ---
const AUTO_SAVE_KEY = 'formBuilderLastEditedForm';
const SPECIFIC_FORMS_KEY = 'savedSpecificForms';

// --- Interfaces (No changes here, just for context) ---
export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'password';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
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
  saveForm: (formId: string) => boolean;
  loadForm: (formId: string) => boolean;
  resetForm: () => void;
  // NEW ACTION: To set the entire form state from a template
  setEntireForm: (newForm: Form) => void;
}

const getDefaultForm = (): Form => ({
  id: uuidv4(),
  title: 'Untitled Form',
  description: 'A description for your form.',
  fields: [],
  steps: [{ id: uuidv4(), name: 'Step 1', fieldIds: [] }],
  currentStepIndex: 0,
});

export const useFormStore = create<FormState>()(
  persist(
    immer<FormState>(
      (set, get) => ({
        form: getDefaultForm(),
        selectedFieldId: null,

        addField: (type) =>
          set((state) => {
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
            if (state.form.steps.length > 0) {
              state.form.steps[state.form.currentStepIndex].fieldIds.push(newField.id);
            }
            state.selectedFieldId = newField.id;
          }),

        deleteField: (id) =>
          set((state) => {
            state.form.fields = state.form.fields.filter((field) => field.id !== id);
            state.form.steps.forEach(step => {
              step.fieldIds = step.fieldIds.filter(fieldId => fieldId !== id);
            });
            if (state.selectedFieldId === id) {
              state.selectedFieldId = null;
            }
          }),

        updateField: (id, updates) =>
          set((state) => {
            const fieldIndex = state.form.fields.findIndex((field) => field.id === id);
            if (fieldIndex !== -1) {
              state.form.fields[fieldIndex] = { ...state.form.fields[fieldIndex], ...updates };
            }
          }),

        reorderField: (activeId, overId) =>
          set((state) => {
            const currentStep = state.form.steps[state.form.currentStepIndex];
            const oldIndex = currentStep.fieldIds.indexOf(activeId);
            const newIndex = currentStep.fieldIds.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1) {
              const [movedFieldId] = currentStep.fieldIds.splice(oldIndex, 1);
              currentStep.fieldIds.splice(newIndex, 0, movedFieldId);
            }
          }),

        setSelectedFieldId: (id) =>
          set((state) => {
            state.selectedFieldId = id;
          }),

        setFormTitle: (title) =>
          set((state) => {
            state.form.title = title;
          }),

        setFormDescription: (description) =>
          set((state) => {
            state.form.description = description;
          }),

        addStep: () =>
          set((state) => {
            const newStep: FormStep = {
              id: uuidv4(),
              name: `Step ${state.form.steps.length + 1}`,
              fieldIds: [],
            };
            state.form.steps.push(newStep);
            state.form.currentStepIndex = state.form.steps.length - 1;
          }),

        deleteStep: (stepId) =>
          set((state) => {
            if (state.form.steps.length > 1) {
              const deletedStepIndex = state.form.steps.findIndex(step => step.id === stepId);
              if (deletedStepIndex !== -1) {
                const fieldsToReassign = state.form.steps[deletedStepIndex].fieldIds;
                state.form.steps.splice(deletedStepIndex, 1);

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
          set((state) => {
            if (index >= 0 && index < state.form.steps.length) {
              state.form.currentStepIndex = index;
            }
          }),

        saveForm: (formId: string) => {
          try {
            const currentForm = get().form;
            const formToSave = { ...currentForm, id: formId };

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

        loadForm: (formId: string) => {
          try {
            const savedForms = JSON.parse(localStorage.getItem(SPECIFIC_FORMS_KEY) || '{}');
            const loadedForm = savedForms[formId];
            if (loadedForm) {
              set((state) => {
                state.form = loadedForm;
                state.selectedFieldId = null;
                state.form.currentStepIndex = 0;
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

        resetForm: () =>
          set((state) => {
            state.form = getDefaultForm();
            state.selectedFieldId = null;
          }),

        // NEW ACTION: Direct replacement of the form state
        setEntireForm: (newForm: Form) =>
          set((state) => {
            state.form = newForm;
            state.selectedFieldId = null; // Clear any selection
            state.form.currentStepIndex = 0; // Reset to the first step of the new form
          }),
      })
    ),
    {
      name: AUTO_SAVE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ form: state.form }),
      onRehydrateStorage: (state) => {
        console.log('Form store rehydrating...');
      },
    }
  )
);