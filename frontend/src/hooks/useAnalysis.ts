import { useCallback, useRef, useState } from "react";

import { analyzePdfResume, analyzeResume, ApiError } from "@/api/client";
import type {
  AnalysisResult,
  AnalysisStatus,
  JobDescription,
  ResumeInput,
} from "@shared/types";

interface UseAnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  processingTimeMs: number | null;
}

interface UseAnalysisReturn extends UseAnalysisState {
  analyze: (
    resume: ResumeInput,
    jobDescription: JobDescription,
    file?: File,
  ) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    status: "idle",
    result: null,
    error: null,
    processingTimeMs: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const analyze = useCallback(
    async (
      resume: ResumeInput,
      jobDescription: JobDescription,
      file?: File,
    ): Promise<void> => {
      // Abort any in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({
        status: "analyzing",
        result: null,
        error: null,
        processingTimeMs: null,
      });

      try {
        const response = file
          ? await analyzePdfResume(file, jobDescription, controller.signal)
          : await analyzeResume(resume, jobDescription, controller.signal);

        setState({
          status: "success",
          result: response.result,
          error: null,
          processingTimeMs: response.processingTimeMs,
        });
      } catch (err) {
        // Don't update state if the request was intentionally aborted
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        let errorMessage = "An unexpected error occurred";

        if (err instanceof ApiError) {
          errorMessage = err.details
            ? `${err.message}: ${err.details}`
            : err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setState({
          status: "error",
          result: null,
          error: errorMessage,
          processingTimeMs: null,
        });
      }
    },
    [],
  );

  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState({
      status: "idle",
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
