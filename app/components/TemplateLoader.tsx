// app/components/TemplateLoader.tsx (Create this file)
import React, { useState } from 'react';
import { useFormStore } from '~/app/state/formStore'; // Adjust the path if necessary

export function TemplateLoader() {
  // Get the loadForm action from your Zustand store
  const loadForm = useFormStore(state => state.loadForm);
  // State to hold the ID of the template the user wants to load
  const [templateIdInput, setTemplateIdInput] = useState('');

  // --- IMPORTANT: These are hypothetical template IDs ---
  // For this to work, you MUST have previously saved forms with these exact IDs
  // using your "Save" button in the form builder.
  const availableTemplateIds = [
    'customer-feedback-form',
    'job-application-form',
    'event-registration-form',
  ];

  const handleLoadTemplate = (id: string) => {
    if (id) {
      console.log(`Attempting to load template with ID: "${id}"`);
      // Call the loadForm action from your store
      const loaded = loadForm(id);

      if (loaded) {
        alert(`Template "${id}" loaded successfully!`);
        setTemplateIdInput(''); // Clear input after successful load
      } else {
        alert(`Template "${id}" not found. Please ensure it was saved with this ID.`);
      }
    } else {
      alert("Please enter or select a template ID to load.");
    }
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '15px', margin: '20px 0', borderRadius: '8px', background: '#f9f9f9' }}>
      <h3 style={{ marginTop: '0', color: '#333' }}>Load Existing Form/Template</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <select
          value={templateIdInput}
          onChange={(e) => setTemplateIdInput(e.target.value)}
          style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Select a template ID</option>
          {availableTemplateIds.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>
        <button
          onClick={() => handleLoadTemplate(templateIdInput)}
          disabled={!templateIdInput}
          style={{
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
            opacity: templateIdInput ? 1 : 0.6,
          }}
        >
          Load Template
        </button>
      </div>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        *Remember: You must first 'Save' a form with one of these exact IDs using your Form Builder's 'Save' functionality for them to be available here.
      </p>
    </div>
  );
}