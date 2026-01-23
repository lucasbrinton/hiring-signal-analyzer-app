import React, { useRef, useState, DragEvent } from 'react';

interface ResumeInputProps {
  text: string;
  source: 'paste' | 'pdf';
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
  onTextChange: (text: string) => void;
  onFileUpload: (file: File) => void;
  onClear: () => void;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  text,
  source,
  fileName,
  isLoading,
  error,
  onTextChange,
  onFileUpload,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Your Resume
        </label>
        {text && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* File upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-gray-600">Extracting text from PDF...</span>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-2 py-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-700">{fileName}</span>
          </div>
        ) : (
          <div className="py-2">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drop PDF here or{' '}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF up to 5MB</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-500">or paste text</span>
        </div>
      </div>

      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste your resume text here..."
        rows={8}
        className={`
          w-full px-4 py-3 border rounded-lg text-sm
          placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${source === 'pdf' ? 'bg-gray-50 text-gray-600' : 'bg-white'}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        readOnly={source === 'pdf'}
      />

      {/* Character count */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {source === 'pdf' && 'Extracted from PDF • '}
          {text.length.toLocaleString()} characters
        </span>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
};
