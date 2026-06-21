import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

/**
 * Toast Component
 * Self-dismisses after `duration` ms.
 *
 * @param {Object} props
 * @param {string} props.message - Text to display
 * @param {'success' | 'error' | 'info'} props.type - Toast style
 * @param {number} props.duration - Auto-dismiss delay in ms (default 3000)
 * @param {Function} props.onClose - Called when toast closes
 */
export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const styles = {
    success: {
      bg: 'bg-badge-pos-bg border-[#4CAF7D]',
      text: 'text-badge-pos-text',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-badge-neg-bg border-red-300',
      text: 'text-badge-neg-text',
      Icon: XCircle,
    },
    info: {
      bg: 'bg-eco-bg border-eco-border',
      text: 'text-eco-dark',
      Icon: Info,
    },
  };

  const { bg, text, Icon } = styles[type];

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md text-sm font-medium max-w-xs ${bg} ${text}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); onClose?.(); }}
        className="p-0.5 hover:opacity-60 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
