const CONTACT_US_TEMPLATE = {
  id: 'contact-us-template', // Unique ID for the template
  title: 'Contact Us Form',
  description: 'A standard form for website visitors to get in touch.',
  currentStepIndex: 0,
  steps: [
    {
      id: 'contact-step-1',
      name: 'Contact Info',
      fieldIds: ['fullName', 'email', 'message'] // IDs of fields in this step
    }
  ],
  fields: [
    {
      id: 'fullName',
      type: 'text',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true,
      minLength: 2,
      maxLength: 50,
      helpText: 'Please provide your full name.'
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      pattern: 'email',
      helpText: 'We will use this to reply to you.'
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'Your Message',
      placeholder: 'Type your message here...',
      required: true,
      minLength: 10,
      maxLength: 500,
      helpText: 'What can we help you with?'
    }
  ]
};

const SIMPLE_SURVEY_TEMPLATE = {
  id: 'simple-survey-template',
  title: 'Quick Feedback Survey',
  description: 'Help us improve by providing quick feedback.',
  currentStepIndex: 0,
  steps: [
    {
      id: 'survey-step-1',
      name: 'Your Experience',
      fieldIds: ['rating', 'feedbackMessage']
    }
  ],
  fields: [
    {
      id: 'rating',
      type: 'dropdown',
      label: 'How would you rate your experience?',
      required: true,
      options: [
        { value: '', label: 'Select an option' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'average', label: 'Average' },
        { value: 'poor', label: 'Poor' }
      ],
      helpText: 'Your honest feedback is appreciated.'
    },
    {
      id: 'feedbackMessage',
      type: 'textarea',
      label: 'Any additional comments?',
      placeholder: 'Enter your comments here...',
      required: false,
      helpText: 'Optional comments.'
    }
  ]
};

export const TEMPLATES = [
  { name: 'Contact Us', template: CONTACT_US_TEMPLATE },
  { name: 'Simple Survey', template: SIMPLE_SURVEY_TEMPLATE }
];