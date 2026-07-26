import React from 'react';

export default function EmptyState({ message, subMessage }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">📝</div>
      <p className="text-lg font-medium text-[#2D4A3E] mb-1">
        {message || 'No reviews yet'}
      </p>
      <p className="text-sm text-gray-500">
        {subMessage || 'Reviews you add will show up here.'}
      </p>
    </div>
  );
}