import React from 'react';
import type { AnalysisResult } from '@shared/types';
import { ScoreGauge } from './ScoreGauge';
import { ScoreBreakdown } from './ScoreBreakdown';
import { InsightSection } from './InsightSection';
import { CopyableResults } from './CopyableResults';
import { Disclaimer } from './Disclaimer';

interface AnalysisResultsProps {
  result: AnalysisResult;
  processingTimeMs?: number | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  processingTimeMs,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Score gauge */}
          <div className="flex justify-center lg:justify-start">
            <ScoreGauge score={result.matchScore} />
          </div>

          {/* Summary and metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Analysis Complete</h2>
              <CopyableResults result={result} />
            </div>

            <p className="mt-3 text-gray-700 leading-relaxed">{result.summary}</p>

            {processingTimeMs && (
              <p className="mt-4 text-xs text-gray-500">
                Analysis completed in {(processingTimeMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>

        {/* Score interpretation */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <ScoreBreakdown score={result.matchScore} />
        </div>
      </div>

      {/* Insight sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <InsightSection
          type="strength"
          title="Strengths"
          items={result.strengths}
          emptyMessage="No specific strengths identified"
        />

        <InsightSection
          type="gap"
          title="Gaps"
          items={result.gaps}
          emptyMessage="No significant gaps identified"
        />

        <InsightSection
          type="risk"
          title="Risk Flags"
          items={result.riskFlags}
          emptyMessage="No risk flags identified"
        />

        <InsightSection
          type="improvement"
          title="Improvements"
          items={result.improvements}
          emptyMessage="No specific improvements suggested"
        />
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
};
