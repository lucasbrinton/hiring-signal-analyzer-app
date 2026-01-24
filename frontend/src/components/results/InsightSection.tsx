import type { InsightItem } from "@shared/types";
import React, { useState } from "react";

type InsightType = "strength" | "gap" | "risk" | "improvement";

interface InsightSectionProps {
  type: InsightType;
  title: string;
  items: InsightItem[];
  emptyMessage?: string;
  defaultExpanded?: boolean;
}

const typeConfig: Record<
  InsightType,
  {
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    borderColor: string;
    borderStyle?: string;
  }
> = {
  strength: {
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-700",
  },
  gap: {
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-700",
    borderStyle: "border-dashed",
  },
  risk: {
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-700",
  },
  improvement: {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-700",
  },
};

export const InsightSection: React.FC<InsightSectionProps> = ({
  type,
  title,
  items,
  emptyMessage = "No items to display",
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = typeConfig[type];
  const isNumbered = type === "improvement";

  return (
    <div
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} ${
        config.borderStyle || ""
      } overflow-hidden`}
    >
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 border-b ${config.borderColor} flex items-center gap-2 hover:opacity-80 transition-opacity`}
        aria-expanded={isExpanded}
      >
        <span className={config.textColor}>{config.icon}</span>
        <h3 className={`text-lg font-bold ${config.textColor}`}>{title}</h3>
        <span className={`ml-2 text-sm ${config.textColor} opacity-75`}>
          ({items.length})
        </span>
        <svg
          className={`ml-auto w-5 h-5 ${config.textColor} transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {emptyMessage}
            </p>
          ) : isNumbered ? (
            <ol className="space-y-3 list-none">
              {items.map((item, index) => (
                <li key={index} className="group">
                  <div className="flex gap-3">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full ${config.textColor.replace(
                        "text-",
                        "bg-",
                      )} bg-opacity-20 flex items-center justify-center text-sm font-bold ${
                        config.textColor
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.headline}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li key={index} className="group">
                  <div className="flex gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${config.textColor.replace(
                        "text-",
                        "bg-",
                      )}`}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.headline}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
