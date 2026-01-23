import React, { useState } from 'react';
import type { AnalysisResult } from '@shared/types';

interface CopyableResultsProps {
  result: AnalysisResult;
}

/**
 * Format results as plain text for copying
 */
function formatResultsAsText(result: AnalysisResult): string {
  let text = `HIRING SIGNAL ANALYSIS\n`;
  text += `${'='.repeat(50)}\n\n`;
  text += `MATCH SCORE: ${result.matchScore}/100\n\n`;
  text += `SUMMARY:\n${result.summary}\n\n`;

  if (result.strengths.length > 0) {
    text += `STRENGTHS:\n`;
    result.strengths.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
    text += '\n';
  }

  if (result.gaps.length > 0) {
    text += `GAPS:\n`;
    result.gaps.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
    text += '\n';
  }

  if (result.riskFlags.length > 0) {
    text += `RISK FLAGS:\n`;
    result.riskFlags.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
    text += '\n';
  }

  if (result.improvements.length > 0) {
    text += `IMPROVEMENT SUGGESTIONS:\n`;
    result.improvements.forEach((item) => {
      text += `• ${item.headline}\n  ${item.detail}\n`;
    });
  }

  return text;
}

export const CopyableResults: React.FC<CopyableResultsProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatResultsAsText(result);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
