import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-[#FAF3E8] rounded-lg shadow-xl max-w-sm w-full p-6 border border-[#8B7355]/20">
        <h3 className="text-lg font-semibold text-[#2D4A3E] mb-2">
          {title || 'Are you sure?'}
        </h3>
        <p className="text-sm text-gray-700 mb-6">
          {message || 'This action cannot be undone.'}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#C1502E] text-white hover:bg-[#a3421f] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}