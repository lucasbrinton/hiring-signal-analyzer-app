/**
 * @fileoverview Analysis State Management Hook
 *
 * Encapsulates the complete analysis workflow state machine:
 * idle → analyzing → success | error
 *
 * Design Decisions:
 * - Uses a single state object for atomic updates (prevents race conditions)
 * - Exposes immutable state + action functions (separation of concerns)
 * - Handles both JSON and multipart/form-data API calls transparently
 *
 * @example
 * ```tsx
 * const { status, result, error, analyze, reset } = useAnalysis();
 *
 * // Trigger analysis
 * await analyze(resumeInput, jobDescription, optionalFile);
 *
 * // Check results
 * if (status === 'success') console.log(result.matchScore);
 * ```
 */

import { useCallback, useState } from "react";

import { analyzePdfResume, analyzeResume, ApiError } from "@/api/client";
import type {
  AnalysisResult,
  AnalysisStatus,
  JobDescription,
  ResumeInput,
} from "@shared/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Internal state shape for the analysis hook */
interface UseAnalysisState {
  /** Current status in the analysis state machine */
  status: AnalysisStatus;
  /** Analysis result from Claude (null until success) */
  result: AnalysisResult | null;
  /** Human-readable error message (null unless status is 'error') */
  error: string | null;
  /** API call duration in milliseconds (for performance display) */
  processingTimeMs: number | null;
}

/** Actions exposed by the hook for controlling analysis flow */
interface UseAnalysisActions {
  /**
   * Initiates resume analysis via the backend API.
   * @param resume - Resume text/metadata from user input
   * @param jobDescription - Job posting text to match against
   * @param file - Optional PDF file for multipart upload
   */
  analyze: (
    resume: ResumeInput,
    jobDescription: JobDescription,
    file?: File,
  ) => Promise<void>;

  /** Resets all state to initial values (idle status) */
  reset: () => void;
}

/** Combined return type exposing both state and actions */
type UseAnalysisReturn = UseAnalysisState & UseAnalysisActions;

// ─────────────────────────────────────────────────────────────────────────────
// HOOK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manages the complete analysis workflow state.
 *
 * Implements a finite state machine pattern for predictable UI states:
 * - `idle`: Initial state, ready for user input
 * - `analyzing`: API call in progress, show loading UI
 * - `success`: Results available, display analysis
 * - `error`: Request failed, show error message
 *
 * @returns State object and action functions for analysis control
 */
export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    status: "idle",
    result: null,
    error: null,
    processingTimeMs: null,
  });

  /**
   * Executes the analysis API call and updates state accordingly.
   * Uses useCallback to maintain referential equality across renders.
   */
  const analyze = useCallback(
    async (
      resume: ResumeInput,
      jobDescription: JobDescription,
      file?: File,
    ): Promise<void> => {
      // Transition to analyzing state
      setState({
        status: "analyzing",
        result: null,
        error: null,
        processingTimeMs: null,
      });

      try {
        // Route to appropriate API based on whether file is provided
        // PDF uploads use multipart/form-data, text uses JSON
        const response = file
          ? await analyzePdfResume(file, jobDescription)
          : await analyzeResume(resume, jobDescription);

        // Transition to success state with results
        setState({
          status: "success",
          result: response.result,
          error: null,
          processingTimeMs: response.processingTimeMs,
        });
      } catch (err) {
        // Normalize error message for display
        let errorMessage = "An unexpected error occurred";

        if (err instanceof ApiError) {
          errorMessage = err.details
            ? `${err.message}: ${err.details}`
            : err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        // Transition to error state
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

  /** Resets all state to initial values */
  const reset = useCallback((): void => {
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
