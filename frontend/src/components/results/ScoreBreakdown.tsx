import React from 'react';

interface ScoreBreakdownProps {
  score: number;
}

const scoreBands = [
  { min: 90, max: 100, label: 'Exceptional', description: 'Exceeds most requirements' },
  { min: 75, max: 89, label: 'Strong', description: 'Meets core requirements' },
  { min: 60, max: 74, label: 'Moderate', description: 'Has notable gaps' },
  { min: 40, max: 59, label: 'Weak', description: 'Significant gaps' },
  { min: 0, max: 39, label: 'Poor', description: 'Fundamental misalignment' },
];

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Score Interpretation</h4>
      <div className="space-y-2">
        {scoreBands.map((band) => {
          const isActive = score >= band.min && score <= band.max;
          return (
            <div
              key={band.min}
              className={`flex items-center gap-3 text-sm py-1.5 px-2 rounded transition-colors ${
                isActive ? 'bg-white shadow-sm border border-gray-200' : ''
              }`}
            >
              <span className={`w-16 font-mono text-xs ${isActive ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                {band.min}-{band.max}
              </span>
              <span className={`w-20 ${isActive ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                {band.label}
              </span>
              <span className={`${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                {band.description}
              </span>
              {isActive && (
                <span className="ml-auto text-blue-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
