import React from 'react';
import type { InsightItem } from '@shared/types';

type InsightType = 'strength' | 'gap' | 'risk' | 'improvement';

interface InsightSectionProps {
  type: InsightType;
  title: string;
  items: InsightItem[];
  emptyMessage?: string;
}

const typeConfig: Record<
  InsightType,
  { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }
> = {
  strength: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  gap: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  risk: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  improvement: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
};

export const InsightSection: React.FC<InsightSectionProps> = ({
  type,
  title,
  items,
  emptyMessage = 'No items to display',
}) => {
  const config = typeConfig[type];

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${config.borderColor} flex items-center gap-2`}>
        <span className={config.textColor}>{config.icon}</span>
        <h3 className={`font-semibold ${config.textColor}`}>{title}</h3>
        <span className={`ml-auto text-sm ${config.textColor} opacity-75`}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="group">
                <div className="flex gap-3">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.textColor.replace('text-', 'bg-')}`} />
                  <div>
                    <p className={`font-medium text-gray-900`}>{item.headline}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
