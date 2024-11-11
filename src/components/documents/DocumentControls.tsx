import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentControlsProps {
  currentPage: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
}

export default function DocumentControls({
  currentPage,
  numPages,
  scale,
  onPageChange,
  onZoomChange
}: DocumentControlsProps) {
  const handleZoomIn = () => onZoomChange(Math.min(scale + 0.2, 3));
  const handleZoomOut = () => onZoomChange(Math.max(scale - 0.2, 0.5));

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, numPages))}
            disabled={currentPage === numPages}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}