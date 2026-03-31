import React, { useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

interface ScoreBand {
  min: number;
  max: number;
  label: string;
  description: string;
  color: string;
}

const scoreBands: ScoreBand[] = [
  {
    min: 90,
    max: 100,
    label: "Excellent",
    description: "Exceeds most requirements. High interview likelihood.",
    color: "#22c55e",
  },
  {
    min: 75,
    max: 89,
    label: "Strong",
    description: "Meets core requirements. Likely to pass initial screen.",
    color: "#84cc16",
  },
  {
    min: 60,
    max: 74,
    label: "Moderate",
    description: "Might pass initial screen but needs tailoring to stand out.",
    color: "#eab308",
  },
  {
    min: 40,
    max: 59,
    label: "Weak",
    description: "Significant gaps. Consider addressing before applying.",
    color: "#f97316",
  },
  {
    min: 0,
    max: 39,
    label: "Poor",
    description: "Major misalignment. Role may not be a good fit.",
    color: "#ef4444",
  },
];

function getScoreColor(score: number): string {
  const band = scoreBands.find((b) => score >= b.min && score <= b.max);
  return band?.color || "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent Match";
  if (score >= 75) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  if (score >= 40) return "Weak Match";
  return "Poor Match";
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = "lg",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizes = {
    sm: { container: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    md: { container: "w-32 h-32", text: "text-3xl", label: "text-sm" },
    lg: { container: "w-44 h-44", text: "text-5xl", label: "text-base" },
  };

  const sizeConfig = sizes[size];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center relative">
      <button
        type="button"
        className={`relative ${sizeConfig.container} cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full`}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Match score: ${score} out of 100. ${label}. Click for details.`}
      >
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
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
              transition: "stroke-dashoffset 1s ease-out, stroke 0.3s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${sizeConfig.text} font-bold`} style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-gray-500 -mt-1">/ 100</span>
        </div>
      </button>

      <span className={`mt-3 font-bold ${sizeConfig.label}`} style={{ color }}>
        {label}
      </span>
      <span className="text-xs text-gray-500 mt-1">Click for score guide</span>

      {showTooltip && (
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-50 w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Score Interpretation
            </h4>
            <div className="space-y-2">
              {scoreBands.map((band) => {
                const isActive = score >= band.min && score <= band.max;
                return (
                  <div
                    key={band.min}
                    className={`flex items-start gap-3 p-2 rounded transition-colors ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600"
                        : ""
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: band.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs ${isActive ? "font-bold" : ""}`}
                        >
                          {band.min}-{band.max}
                        </span>
                        <span
                          className={`text-sm ${isActive ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                        >
                          {band.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {band.description}
                      </p>
                    </div>
                    {isActive && (
                      <svg
                        className="w-4 h-4 text-blue-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};
