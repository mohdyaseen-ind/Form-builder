// app/templates/templates.ts
import { Form } from '../state/formStore'; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is imported if generating IDs within templates

// Example predefined templates
export const TEMPLATES: { id: string; name: string; form: Form }[] = [
  {
    id: 'contact-us-form',
    name: 'Contact Us Form',
    form: {
      id: uuidv4(), // Assign a fresh UUID if this template is loaded as a new form
      title: 'Contact Us',
      description: 'Please use the form below to get in touch with us.',
      fields: [
        { id: uuidv4(), type: 'text', label: 'Your Name', placeholder: 'Enter your name', validation: { required: true } },
        { id: uuidv4(), type: 'email', label: 'Your Email', placeholder: 'Enter your email', validation: { required: true, pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" } },
        { id: uuidv4(), type: 'textarea', label: 'Message', placeholder: 'Your message here...', validation: { required: true, minLength: 10 } },
      ],
      steps: [{ id: uuidv4(), name: 'Contact Details', fieldIds: [] }], // Field IDs will be populated dynamically or pre-set if known
      currentStepIndex: 0,
    },
  },
  {
    id: 'job-application-form',
    name: 'Job Application Form',
    form: {
      id: uuidv4(),
      title: 'Job Application',
      description: 'Apply for a position at our company.',
      fields: [
        { id: uuidv4(), type: 'text', label: 'Full Name', validation: { required: true } },
        { id: uuidv4(), type: 'email', label: 'Email Address', validation: { required: true } },
        { id: uuidv4(), type: 'number', label: 'Phone Number', validation: { required: true } },
        { id: uuidv4(), type: 'select', label: 'Position Applying For', options: [
          { id: uuidv4(), label: 'Software Engineer', value: 'software-engineer' },
          { id: uuidv4(), label: 'Product Manager', value: 'product-manager' },
          { id: uuidv4(), label: 'UX Designer', value: 'ux-designer' },
        ], validation: { required: true } },
        { id: uuidv4(), type: 'textarea', label: 'Cover Letter', validation: { maxLength: 500 } },
      ],
      steps: [{ id: uuidv4(), name: 'Personal Info', fieldIds: [] }],
      currentStepIndex: 0,
    },
  },
  // Add more templates as needed
];

// Helper to populate fieldIds for each step (optional, but good practice)
// You might want to do this dynamically when creating templates or directly in the form object.
TEMPLATES.forEach(template => {
  if (template.form.steps.length > 0) {
    // For simplicity, add all fields to the first step
    template.form.steps[0].fieldIds = template.form.fields.map(field => field.id);
  }
});