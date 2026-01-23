import { useState } from 'react';
import { VALIDATION } from '@shared/types';
import { useAnalysis, useResumeInput } from '@/hooks';
import {
  Header,
  ResumeInput,
  JobDescriptionInput,
  AnalyzeButton,
  ErrorMessage,
  LoadingState,
  AnalysisResults,
} from '@/components';

function App() {
  // Resume input state
  const resume = useResumeInput();

  // Job description state
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  // Analysis state
  const analysis = useAnalysis();

  // Form validation
  const isResumeValid = resume.text.length >= VALIDATION.MIN_TEXT_LENGTH;
  const isJobDescriptionValid = jobDescriptionText.length >= VALIDATION.MIN_TEXT_LENGTH;
  const canAnalyze = isResumeValid && isJobDescriptionValid && !resume.isLoading;

  // Handle analyze click
  const handleAnalyze = async () => {
    const resumeInput = resume.getResumeInput();
    if (!resumeInput) return;

    const jobDescription = { text: jobDescriptionText };
    const file = resume.source === 'pdf' ? resume.getFile() : undefined;

    await analysis.analyze(resumeInput, jobDescription, file ?? undefined);
  };

  // Handle reset
  const handleReset = () => {
    resume.clear();
    setJobDescriptionText('');
    analysis.reset();
  };

  // Show loading state
  if (analysis.status === 'analyzing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <LoadingState />
        </main>
      </div>
    );
  }

  // Show results
  if (analysis.status === 'success' && analysis.result) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  // Show input form
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Intro text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              How well does your resume match?
            </h2>
            <p className="mt-2 text-gray-600">
              Get AI-powered insights on your resume-job fit, including strengths,
              gaps, and actionable improvements.
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

            {/* Error message */}
            {analysis.status === 'error' && analysis.error && (
              <ErrorMessage
                message={analysis.error}
                onDismiss={analysis.reset}
              />
            )}

            {/* Analyze button */}
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={analysis.status === 'analyzing'}
              isDisabled={!canAnalyze}
            />

            {/* Validation hints */}
            {(!isResumeValid || !isJobDescriptionValid) && (
              <p className="text-center text-sm text-gray-500">
                {!isResumeValid && !isJobDescriptionValid
                  ? 'Add your resume and job description to analyze'
                  : !isResumeValid
                  ? `Resume needs at least ${VALIDATION.MIN_TEXT_LENGTH} characters`
                  : `Job description needs at least ${VALIDATION.MIN_TEXT_LENGTH} characters`}
              </p>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          This tool provides informational insights only. Results are AI-generated
          and should not be considered professional career advice.
        </p>
      </main>
    </div>
  );
}

export default App;
