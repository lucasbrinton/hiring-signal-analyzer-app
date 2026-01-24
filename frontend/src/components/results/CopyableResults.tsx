import type { AnalysisResult } from "@shared/types";
import React, { useState } from "react";

interface CopyableResultsProps {
  result: AnalysisResult;
  onCopy?: () => void;
}

/**
 * Format results as plain text for copying
 */
function formatResultsAsText(result: AnalysisResult): string {
  let text = `HIRING SIGNAL ANALYSIS\n`;
  text += `${"=".repeat(50)}\n\n`;
  text += `MATCH SCORE: ${result.matchScore}/100\n\n`;
  text += `SUMMARY:\n${result.summary}\n\n`;

  if (result.strengths.length > 0) {
    text += `STRENGTHS:\n`;
    result.strengths.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
    text += "\n";
  }

  if (result.gaps.length > 0) {
    text += `GAPS:\n`;
    result.gaps.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
    text += "\n";
  }

  if (result.improvements.length > 0) {
    text += `IMPROVEMENT SUGGESTIONS:\n`;
    result.improvements.forEach((item, i) => {
      text += `${i + 1}. ${item.headline}\n   ${item.detail}\n`;
    });
    text += "\n";
  }

  if (result.riskFlags.length > 0) {
    text += `RISK FLAGS:\n`;
    result.riskFlags.forEach((item) => {
      text += `⚠ ${item.headline}\n  ${item.detail}\n`;
    });
  }

  return text;
}

export const CopyableResults: React.FC<CopyableResultsProps> = ({
  result,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatResultsAsText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${
        copied
          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
    >
      {copied ? (
        <>
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copy Results</span>
        </>
      )}
    </button>
  );
};
