import React, { useEffect, useState } from "react";

interface LoadingStateProps {
  onCancel?: () => void;
}

type LoadingStep = "processing" | "extracting" | "analyzing";

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState<LoadingStep>("processing");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Progressive step simulation
  useEffect(() => {
    const stepTimers = [
      setTimeout(() => setCurrentStep("extracting"), 1500),
      setTimeout(() => setCurrentStep("analyzing"), 3000),
    ];

    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearInterval(timeInterval);
    };
  }, []);

  const steps: { id: LoadingStep; label: string }[] = [
    { id: "processing", label: "Processing resume..." },
    { id: "extracting", label: "Extracting requirements..." },
    { id: "analyzing", label: "Generating analysis..." },
  ];

  const getStepStatus = (
    stepId: LoadingStep,
  ): "complete" | "active" | "pending" => {
    const stepOrder: LoadingStep[] = ["processing", "extracting", "analyzing"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>

      <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white">
        Analyzing your match...
      </h3>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {elapsedTime}s elapsed • Usually takes 5-15 seconds
      </p>

      {/* Progress steps */}
      <div className="mt-8 space-y-3 text-sm">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 transition-colors ${
                status === "complete"
                  ? "text-green-600"
                  : status === "active"
                    ? "text-blue-600"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {status === "complete" ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : status === "active" ? (
                <svg
                  className="w-4 h-4 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-8 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
