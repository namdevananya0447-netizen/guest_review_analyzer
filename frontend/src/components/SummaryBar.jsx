import React from 'react';

/**
 * SummaryBar Component
 * Displays statistics cards for Positive, Neutral, and Negative review sentiments.
 * 
 * @param {Object} props
 * @param {number} props.positiveCount
 * @param {number} props.neutralCount
 * @param {number} props.negativeCount
 */
export default function SummaryBar({ positiveCount = 0, neutralCount = 0, negativeCount = 0 }) {
  const stats = [
    {
      label: 'Positive Reviews',
      count: positiveCount,
      dotColor: 'bg-[#4CAF7D]', // accent green
      textColor: 'text-badge-pos-text',
      badgeBg: 'bg-badge-pos-bg',
    },
    {
      label: 'Neutral Reviews',
      count: neutralCount,
      dotColor: 'bg-[#7A6000]', // amber
      textColor: 'text-badge-neu-text',
      badgeBg: 'bg-badge-neu-bg',
    },
    {
      label: 'Negative Reviews',
      count: negativeCount,
      dotColor: 'bg-[#8B1A1A]', // red
      textColor: 'text-badge-neg-text',
      badgeBg: 'bg-badge-neg-bg',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-eco-bg border border-eco-border rounded-[12px] p-5 flex items-center justify-between shadow-xs transition-all hover:shadow-sm"
        >
          <div>
            <div className="text-xs uppercase tracking-wider text-eco-muted font-semibold mb-1">
              {item.label}
            </div>
            <div className="text-3xl font-bold text-eco-dark">
              {item.count}
            </div>
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${item.badgeBg}`}>
            <span className={`w-3.5 h-3.5 rounded-full ${item.dotColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
