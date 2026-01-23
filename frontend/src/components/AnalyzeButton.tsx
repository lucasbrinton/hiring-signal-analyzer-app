import React from 'react';

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onClick,
  isLoading,
  isDisabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`
        w-full py-3 px-6 rounded-lg font-medium text-white
        transition-all duration-200
        flex items-center justify-center gap-2
        ${
          isDisabled || isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow'
        }
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
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
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <span>Analyze Match</span>
        </>
      )}
    </button>
  );
};
