import React from 'react';
import { FileWarning } from 'lucide-react';

interface DocumentErrorProps {
  error: string;
  onRetry: () => void;
}

export default function DocumentError({ error, onRetry }: DocumentErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-lg p-8">
      <FileWarning className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-red-600 text-center mb-4 max-w-md">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}