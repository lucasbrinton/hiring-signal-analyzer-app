import type { AnalysisResult } from "@shared/types";
import React from "react";
import { Accordion, Toast, useToast } from "../ui";
import { CopyableResults } from "./CopyableResults";
import { Disclaimer } from "./Disclaimer";
import { DownloadPDF } from "./DownloadPDF";
import { InsightSection } from "./InsightSection";
import { ScoreGauge } from "./ScoreGauge";

interface AnalysisResultsProps {
  result: AnalysisResult;
  processingTimeMs?: number | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  processingTimeMs,
}) => {
  const { toast, showToast, hideToast } = useToast();

  const handleCopy = () => {
    showToast("Results copied to clipboard", "success");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex justify-center lg:justify-start">
            <ScoreGauge score={result.matchScore} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analysis Complete
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <CopyableResults result={result} onCopy={handleCopy} />
                <DownloadPDF result={result} />
              </div>
            </div>

            {processingTimeMs && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Analysis completed in {(processingTimeMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Accordion
            title="Summary"
            defaultExpanded={true}
            icon={
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
            }
            headerClassName="text-gray-700 dark:text-gray-300"
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.summary}
            </p>
          </Accordion>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <InsightSection
          type="strength"
          title="Strengths"
          items={result.strengths}
          emptyMessage="No specific strengths identified"
          defaultExpanded={true}
        />

        <InsightSection
          type="gap"
          title="Gaps"
          items={result.gaps}
          emptyMessage="No significant gaps identified"
          defaultExpanded={true}
        />

        <InsightSection
          type="improvement"
          title="Improvements"
          items={result.improvements}
          emptyMessage="No specific improvements suggested"
          defaultExpanded={true}
        />

        <InsightSection
          type="risk"
          title="Risk Flags"
          items={result.riskFlags}
          emptyMessage="No risk flags identified"
          defaultExpanded={false}
        />
      </div>

      <Disclaimer />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
};
