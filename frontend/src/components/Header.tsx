import React from 'react';

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showReset = false }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
              <h1 className="text-xl font-semibold text-gray-900">
                Hiring Signal Analyzer
              </h1>
              <p className="text-sm text-gray-500">
                Understand your resume-job fit
              </p>
            </div>
          </div>

          {showReset && onReset && (
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Start Over
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
