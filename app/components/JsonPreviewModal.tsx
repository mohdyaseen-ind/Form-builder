// app/components/JsonPreviewModal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { FormDefinition } from '../state/formStore'; // Adjust path if necessary

interface JsonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDefinition; // Pass the entire form object
}

const JsonPreviewModal: React.FC<JsonPreviewModalProps> = ({ isOpen, onClose, formData }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(formData, null, 2); // Pretty print JSON

  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Copy JSON to clipboard
  const copyJsonToClipboard = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(jsonString);
        alert('JSON copied to clipboard!');
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      console.error('Failed to copy JSON: ', err);
      alert('Failed to copy JSON. Please copy it manually.');
    }
  };

  // Ensure modal is rendered using createPortal for better layering
  if (typeof document === 'undefined') return null; // Server-side rendering check

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75 p-4">
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Form JSON Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close JSON preview"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-b-lg">
          <pre>{jsonString}</pre>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={copyJsonToClipboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JsonPreviewModal;