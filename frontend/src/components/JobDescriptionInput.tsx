import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Job Description
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job posting here..."
        rows={8}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="text-xs text-gray-500">
        {value.length.toLocaleString()} characters
      </div>
    </div>
  );
};
