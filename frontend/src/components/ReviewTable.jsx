import { useState } from 'react';
import { Copy, Check, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Individual Table Row Component to manage copy feedback and loading state.
 */
function ReviewRow({ review, index, onReRun }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Truncate review text to 90 characters
  const truncatedText = review.text.length > 90 
    ? `${review.text.substring(0, 90)}...` 
    : review.text;

  // Determine row background color based on status
  let rowBgClass = 'bg-white odd:bg-[#F9FDF9] hover:bg-eco-row-hover';
  if (review.status === 'error') {
    rowBgClass = 'bg-red-50/70 hover:bg-red-50 border-red-100';
  } else if (review.status === 'loading') {
    rowBgClass = 'bg-[#F2FAF6] animate-pulse';
  }

  return (
    <tr className={`${rowBgClass} transition-colors border-b border-eco-border/40 text-eco-dark text-sm`}>
      {/* Index */}
      <td className="px-4 py-4.5 text-center font-medium text-eco-muted w-12">
        {index + 1}
      </td>

      {/* Review Text with Custom Tooltip */}
      <td className="px-4 py-4.5 max-w-xs md:max-w-md relative group">
        <div className="truncate cursor-pointer font-medium text-eco-dark">
          {truncatedText}
        </div>
        {review.text.length > 90 && (
          <div className="invisible group-hover:visible absolute z-20 left-4 bottom-full mb-2 w-72 md:w-96 p-3 bg-eco-dark text-[#F0F7F0] text-xs rounded-lg shadow-xl pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100">
            <p className="leading-relaxed">{review.text}</p>
            <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-eco-dark"></div>
          </div>
        )}
      </td>

      {/* Sentiment */}
      <td className="px-4 py-4.5 text-center min-w-[110px]">
        {review.status === 'loading' ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-eco-primary" />
          </div>
        ) : review.status === 'error' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Error
          </span>
        ) : review.sentiment ? (
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
            ${review.sentiment === 'positive' ? 'bg-badge-pos-bg text-badge-pos-text' : ''}
            ${review.sentiment === 'neutral' ? 'bg-badge-neu-bg text-badge-neu-text' : ''}
            ${review.sentiment === 'negative' ? 'bg-badge-neg-bg text-badge-neg-text' : ''}
          `}>
            {review.sentiment}
          </span>
        ) : (
          <span className="text-eco-muted/50">—</span>
        )}
      </td>

      {/* Theme */}
      <td className="px-4 py-4.5 text-center min-w-[110px]">
        {review.status === 'loading' ? (
          <span className="inline-block w-8 h-4 bg-eco-primary/10 rounded-sm animate-pulse"></span>
        ) : review.status === 'error' ? (
          <span className="text-red-400">—</span>
        ) : review.theme ? (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border border-eco-border text-eco-muted bg-white">
            {review.theme}
          </span>
        ) : (
          <span className="text-eco-muted/50">—</span>
        )}
      </td>

      {/* Suggested Response / Error Message */}
      <td className="px-4 py-4.5 font-sans">
        {review.status === 'loading' ? (
          <div className="space-y-1.5">
            <div className="h-3 bg-eco-primary/10 rounded-sm w-3/4 animate-pulse"></div>
            <div className="h-3 bg-eco-primary/10 rounded-sm w-1/2 animate-pulse"></div>
          </div>
        ) : review.status === 'error' ? (
          <div className="text-red-600 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>Could not analyse this review — please retry.</span>
          </div>
        ) : review.response ? (
          <div className="flex items-start justify-between gap-3 group/response">
            <p className="italic text-eco-muted leading-relaxed pr-2">
              "{review.response}"
            </p>
            <button
              onClick={() => handleCopy(review.response)}
              className="p-1 rounded-md text-eco-muted hover:text-eco-primary hover:bg-eco-bg transition-colors shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#4CAF7D]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-eco-muted/50">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4.5 text-center w-20">
        <button
          onClick={() => onReRun(index)}
          disabled={review.status === 'loading'}
          className={`p-1.5 rounded-md border border-eco-border text-eco-muted hover:text-eco-primary hover:bg-eco-bg hover:border-eco-primary/50 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
          title={review.status === 'error' ? 'Retry analysis' : 'Re-run analysis'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${review.status === 'loading' ? 'animate-spin' : ''}`} />
        </button>
      </td>
    </tr>
  );
}

/**
 * ReviewTable Component
 */
export default function ReviewTable({ reviews, onReRun }) {
  return (
    <div className="w-full overflow-hidden border border-eco-border rounded-xl bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-left">
          <thead>
            <tr className="bg-[#E8F5EE] border-b border-eco-border text-eco-dark text-[11px] font-bold tracking-wider uppercase">
              <th className="px-4 py-3.5 text-center w-12">#</th>
              <th className="px-4 py-3.5">Review</th>
              <th className="px-4 py-3.5 text-center w-32">Sentiment</th>
              <th className="px-4 py-3.5 text-center w-32">Theme</th>
              <th className="px-4 py-3.5">Suggested Response</th>
              <th className="px-4 py-3.5 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review, index) => (
              <ReviewRow
                key={review.id}
                review={review}
                index={index}
                onReRun={onReRun}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
