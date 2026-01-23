import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>

      <h3 className="mt-6 text-lg font-medium text-gray-900">
        Analyzing your match...
      </h3>

      <div className="mt-4 max-w-sm text-center">
        <p className="text-sm text-gray-600">
          Our AI is reviewing your resume against the job requirements.
          This typically takes 5-15 seconds.
        </p>
      </div>

      {/* Progress steps */}
      <div className="mt-8 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Resume processed</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Job requirements extracted</span>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
          </svg>
          <span>Generating analysis...</span>
        </div>
      </div>
    </div>
  );
};
