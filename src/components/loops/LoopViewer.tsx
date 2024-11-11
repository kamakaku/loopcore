import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Loop, Spot } from '../../types';

interface LoopViewerProps {
  loop: Loop;
  spots: Spot[];
  selectedSpot: Spot | null;
  onSpotClick: (spot: Spot) => void;
  onAddSpot?: (position: { x: number; y: number }) => void;
  isAddingSpot?: boolean;
}

export default function LoopViewer({
  loop,
  spots,
  selectedSpot,
  onSpotClick,
  onAddSpot,
  isAddingSpot
}: LoopViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingSpot || !onAddSpot) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddSpot({ x, y });
  };

  const renderContent = () => {
    switch (loop.type) {
      case 'url':
        return (
          <img
            src={loop.screenshot}
            alt={loop.title}
            className="w-full h-auto"
          />
        );
      case 'image':
        return (
          <img
            src={loop.content}
            alt={loop.title}
            className="w-full h-auto"
          />
        );
      case 'pdf':
        if (!loop.pdfPages.length) return null;
        return (
          <>
            <img
              src={loop.pdfPages[currentPage]}
              alt={`${loop.title} - Page ${currentPage + 1}`}
              className="w-full h-auto"
            />
            {loop.pdfPages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center space-x-4 p-4 bg-white bg-opacity-90">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(page => Math.max(0, page - 1));
                  }}
                  disabled={currentPage === 0}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm">
                  Page {currentPage + 1} of {loop.pdfPages.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage(page => Math.min(loop.pdfPages.length - 1, page + 1));
                  }}
                  disabled={currentPage === loop.pdfPages.length - 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm overflow-hidden"
      onClick={handleClick}
      style={{ cursor: isAddingSpot ? 'crosshair' : 'default' }}
    >
      {renderContent()}

      {/* Render spots */}
      {spots.map((spot) => (
        <button
          key={spot.id}
          onClick={(e) => {
            e.stopPropagation();
            onSpotClick(spot);
          }}
          className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all ${
            selectedSpot?.id === spot.id
              ? 'bg-blue-600 text-white scale-125'
              : 'bg-white text-blue-600 border-2 border-blue-600 hover:scale-110'
          }`}
          style={{
            left: `${spot.position.x}%`,
            top: `${spot.position.y}%`,
          }}
        >
          <span className="text-sm font-medium">{spot.number}</span>
        </button>
      ))}

      {/* Adding spot overlay */}
      {isAddingSpot && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
            Click anywhere to add a spot
          </div>
        </div>
      )}
    </div>
  );
}