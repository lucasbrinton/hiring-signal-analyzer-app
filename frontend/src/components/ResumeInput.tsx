import { VALIDATION } from "@shared/types";
import { DragEvent, useRef, useState } from "react";

type InputMethod = "upload" | "paste";

interface ResumeInputProps {
  text: string;
  fileName: string | null;
  isLoading: boolean;
  error: string | null;
  onTextChange: (text: string) => void;
  onFileUpload: (file: File) => void;
  onClear: () => void;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  text,
  fileName,
  isLoading,
  error,
  onTextChange,
  onFileUpload,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<InputMethod>("upload");
  const [localError, setLocalError] = useState<string | null>(null);

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
    setLocalError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.type !== "application/pdf") {
      setLocalError("Please upload a PDF file");
      return;
    }
    if (file.size > VALIDATION.MAX_PDF_SIZE) {
      setLocalError(
        `PDF too large (max ${VALIDATION.MAX_PDF_SIZE / 1024 / 1024}MB)`,
      );
      return;
    }
    setLocalError(null);
    onFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
    e.target.value = "";
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleTabChange = (tab: InputMethod) => {
    setActiveTab(tab);
    setLocalError(null);
    if (text || fileName) {
      onClear();
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-bold text-gray-900 dark:text-white">
          Your Resume
        </label>
        {(text || fileName) && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Remove Resume
          </button>
        )}
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => handleTabChange("upload")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upload"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload PDF
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("paste")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "paste"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Paste Text
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Choose one method.{" "}
        {activeTab === "upload"
          ? "Uploaded PDF will be parsed automatically."
          : "Paste your resume text directly."}
      </p>

      {activeTab === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"}
            ${isLoading ? "opacity-50 pointer-events-none" : ""}
            ${displayError ? "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload PDF resume"
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
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
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Extracting text from PDF...
              </span>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {text.length.toLocaleString()} characters extracted
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your PDF here, or{" "}
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                PDF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "paste" && (
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={10}
          className={`
            w-full px-4 py-3 border rounded-lg text-sm
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            ${displayError ? "border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-600"}
          `}
          aria-label="Resume text"
        />
      )}

      {displayError && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {displayError}
        </p>
      )}

      {text && !displayError && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {text.length.toLocaleString()} characters
          {text.length < VALIDATION.MIN_TEXT_LENGTH && (
            <span className="text-amber-600 dark:text-amber-400 ml-2">
              (minimum {VALIDATION.MIN_TEXT_LENGTH} required)
            </span>
          )}
        </p>
      )}
    </div>
  );
};
