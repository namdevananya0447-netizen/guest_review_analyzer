import { Leaf } from 'lucide-react';

/**
 * Loader Component
 * Shows a spinner during data fetching / async operations.
 *
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - Spinner size
 * @param {string} props.label - Accessible label and optional visible text
 * @param {boolean} props.showLabel - Whether to show the label as visible text
 */
export default function Loader({ size = 'md', label = 'Loading…', showLabel = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3"
    >
      {/* Spinning leaf icon */}
      <Leaf
        className={`${sizes[size]} text-eco-primary animate-spin`}
        aria-hidden="true"
      />
      {showLabel && (
        <p className="text-xs text-eco-muted font-medium">{label}</p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
