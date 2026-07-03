import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Called when modal should close
 * @param {string} props.title - Modal header title
 * @param {React.ReactNode} props.children - Modal body content
 */
export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-eco-dark/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md border border-eco-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-eco-border">
          <h2
            id="modal-title"
            className="font-display text-lg font-semibold text-eco-dark"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-eco-muted hover:text-eco-dark hover:bg-eco-bg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-eco-muted leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
