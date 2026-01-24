/**
 * @fileoverview Job Description Input Component
 *
 * Simple textarea component for entering job description text.
 * Displays character count for user feedback.
 *
 * Design Decision:
 * Kept intentionally simple (no PDF upload) because job descriptions
 * are typically copy-pasted from job postings, not attached as documents.
 */

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Props for the JobDescriptionInput component */
interface JobDescriptionInputProps {
  /** Current job description text */
  value: string;
  /** Callback when text changes */
  onChange: (value: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-lg font-bold text-gray-900 dark:text-white">
        Job Description
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job posting here..."
        rows={8}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      />

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {value.length.toLocaleString()} characters
      </div>
    </div>
  );
};
