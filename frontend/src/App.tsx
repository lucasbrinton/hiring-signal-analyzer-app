/**
 * @fileoverview Main Application Component - Hiring Signal Analyzer
 *
 * This is the root component that orchestrates the entire application flow:
 * 1. Input Collection: Resume (paste/PDF) + Job Description
 * 2. AI Analysis: Sends data to Claude API via backend
 * 3. Results Display: Structured insights with match score
 *
 * Architecture Decision: Uses a state machine pattern (idle → analyzing → success/error)
 * to manage UI states cleanly without complex conditional logic.
 *
 * @author Hiring Signal Analyzer Team
 * @version 1.0.0
 */

import { useState } from "react";

import {
  AnalysisResults,
  AnalyzeButton,
  DisclaimerBanner,
  Header,
  JobDescriptionInput,
  LoadingState,
  ResumeInput,
} from "@/components";
import { Modal } from "@/components/ui";
import { VALIDATION } from "@/constants/validation";
import { useAnalysis, useResumeInput } from "@/hooks";

/**
 * Root application component implementing the resume-job matching workflow.
 *
 * State Management Strategy:
 * - `useResumeInput`: Encapsulates resume state (text, file, loading, errors)
 * - `useAnalysis`: Manages API call lifecycle and results caching
 * - Local state: Job description text and modal visibility
 *
 * Rendering Strategy:
 * - Early returns for loading/success states (cleaner than nested conditionals)
 * - Form validation computed from hook state (derived state pattern)
 *
 * @returns The main application UI based on current analysis status
 */
function App(): JSX.Element {
  // ─────────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /** Resume input state - handles both paste and PDF upload workflows */
  const resume = useResumeInput();

  /** Job description text - simple controlled input */
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  /** Error modal visibility - shown on analysis failure */
  const [showErrorModal, setShowErrorModal] = useState(false);

  /** Analysis state machine - manages API call lifecycle */
  const analysis = useAnalysis();

  // ─────────────────────────────────────────────────────────────────────────────
  // DERIVED STATE (Computed from hook values)
  // ─────────────────────────────────────────────────────────────────────────────

  const isResumeValid = resume.text.length >= VALIDATION.MIN_TEXT_LENGTH;
  const isJobDescriptionValid =
    jobDescriptionText.length >= VALIDATION.MIN_TEXT_LENGTH;
  const canAnalyze =
    isResumeValid && isJobDescriptionValid && !resume.isLoading;

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initiates the resume analysis workflow.
   * Determines whether to use JSON or multipart/form-data based on resume source.
   */
  const handleAnalyze = async (): Promise<void> => {
    const resumeInput = resume.getResumeInput();
    if (!resumeInput) return;

    const jobDescription = { text: jobDescriptionText };
    const file = resume.source === "pdf" ? resume.getFile() : undefined;

    try {
      await analysis.analyze(resumeInput, jobDescription, file ?? undefined);
    } catch {
      setShowErrorModal(true);
    }
  };

  /** Cancels an in-progress analysis and returns to idle state */
  const handleCancelAnalysis = (): void => {
    analysis.reset();
  };

  /** Resets all form state to start a new analysis */
  const handleReset = (): void => {
    resume.clear();
    setJobDescriptionText("");
    analysis.reset();
  };

  /** Closes the error modal and resets analysis state */
  const handleCloseErrorModal = (): void => {
    setShowErrorModal(false);
    analysis.reset();
  };

  // Determine if error modal should be visible
  const shouldShowErrorModal =
    showErrorModal || (analysis.status === "error" && analysis.error);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER LOGIC (State machine pattern with early returns)
  // ─────────────────────────────────────────────────────────────────────────────

  // Loading State: Analysis in progress
  if (analysis.status === "analyzing") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <LoadingState onCancel={handleCancelAnalysis} />
        </main>
      </div>
    );
  }

  // Success State: Display analysis results
  if (analysis.status === "success" && analysis.result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onReset={handleReset} showReset />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <AnalysisResults
            result={analysis.result}
            processingTimeMs={analysis.processingTimeMs}
          />
        </main>
      </div>
    );
  }

  // Idle/Error State: Display input form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          {/* Intro text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              How well does your resume match?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get AI-powered insights on your resume-job fit, including
              strengths, gaps, and actionable improvements.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-8">
            <ResumeInput
              text={resume.text}
              source={resume.source}
              fileName={resume.fileName}
              isLoading={resume.isLoading}
              error={resume.error}
              onTextChange={resume.setText}
              onFileUpload={resume.handleFileUpload}
              onClear={resume.clear}
            />

            <JobDescriptionInput
              value={jobDescriptionText}
              onChange={setJobDescriptionText}
            />

            {/* Disclaimer banner */}
            <DisclaimerBanner />

            {/* Analyze button */}
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={false}
              isDisabled={!canAnalyze}
            />

            {/* Validation hints */}
            {(!isResumeValid || !isJobDescriptionValid) && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {!isResumeValid && !isJobDescriptionValid
                  ? "Add your resume and job description to analyze"
                  : !isResumeValid
                    ? `Resume needs at least ${VALIDATION.MIN_TEXT_LENGTH} characters`
                    : `Job description needs at least ${VALIDATION.MIN_TEXT_LENGTH} characters`}
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          This tool provides informational insights only. Results are
          AI-generated and should not be considered professional career advice.
        </p>
      </main>

      {/* Error Modal */}
      <Modal
        isOpen={!!shouldShowErrorModal}
        onClose={handleCloseErrorModal}
        title="Analysis Failed"
        actions={
          <>
            <button
              onClick={handleCloseErrorModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowErrorModal(false);
                analysis.reset();
                handleAnalyze();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis.error ||
                "Something went wrong while analyzing your resume. Please try again."}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              If the problem persists, try refreshing the page or checking your
              network connection.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
