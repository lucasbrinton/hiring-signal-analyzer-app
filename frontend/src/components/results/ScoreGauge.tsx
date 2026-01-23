import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Get score color based on value
 */
function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green-500
  if (score >= 75) return '#84cc16'; // lime-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

/**
 * Get score label based on value
 */
function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent Match';
  if (score >= 75) return 'Strong Match';
  if (score >= 60) return 'Moderate Match';
  if (score >= 40) return 'Weak Match';
  return 'Poor Match';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 'lg' }) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // Size configurations
  const sizes = {
    sm: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-44 h-44', text: 'text-5xl', label: 'text-base' },
  };

  const config = sizes[size];

  // SVG arc calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${config.container}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${config.text} font-bold`}
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-gray-500 -mt-1">/ 100</span>
        </div>
      </div>

      {/* Label below */}
      <span
        className={`mt-3 font-medium ${config.label}`}
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
};
