import { useState, useCallback } from 'react';
import type { AnalysisResult, ResumeInput, JobDescription, AnalysisStatus } from '@shared/types';
import { analyzeResume, analyzePdfResume, ApiError } from '@/api/client';

interface UseAnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  processingTimeMs: number | null;
}

interface UseAnalysisActions {
  analyze: (resume: ResumeInput, jobDescription: JobDescription, file?: File) => Promise<void>;
  reset: () => void;
}

type UseAnalysisReturn = UseAnalysisState & UseAnalysisActions;

/**
 * Hook for managing the analysis workflow
 */
export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    processingTimeMs: null,
  });

  const analyze = useCallback(
    async (resume: ResumeInput, jobDescription: JobDescription, file?: File) => {
      setState({
        status: 'analyzing',
        result: null,
        error: null,
        processingTimeMs: null,
      });

      try {
        // Use PDF upload endpoint if file is provided
        const response = file
          ? await analyzePdfResume(file, jobDescription)
          : await analyzeResume(resume, jobDescription);

        setState({
          status: 'success',
          result: response.result,
          error: null,
          processingTimeMs: response.processingTimeMs,
        });
      } catch (err) {
        let errorMessage = 'An unexpected error occurred';

        if (err instanceof ApiError) {
          errorMessage = err.details ? `${err.message}: ${err.details}` : err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setState({
          status: 'error',
          result: null,
          error: errorMessage,
          processingTimeMs: null,
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      result: null,
      error: null,
      processingTimeMs: null,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
  };
}
