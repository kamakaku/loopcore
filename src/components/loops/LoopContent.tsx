import React from 'react';
import { Loop, Spot } from '../../types';
import { extractFigmaKeyFromUrl } from '../../lib/figma';
import PDFViewer from './PDFViewer';
import SpotMarker from '../spots/SpotMarker';

interface LoopContentProps {
  loop: Loop;
  spots: Spot[];
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedSpot: Spot | null;
  onSpotSelect: (spot: Spot | null) => void;
  isOwner: boolean;
  loading: boolean;
}

export default function LoopContent({
  loop,
  spots,
  currentPage,
  onPageChange,
  selectedSpot,
  onSpotSelect,
  isOwner,
  loading
}: LoopContentProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (loop.type) {
      case 'url':
        return (
          <div className="relative">
            <img
              src={loop.screenshot}
              alt={loop.title}
              className="w-full h-auto"
            />
            {renderSpots()}
          </div>
        );
      case 'image':
        return (
          <div className="relative">
            <img
              src={loop.content}
              alt={loop.title}
              className="w-full h-auto"
            />
            {renderSpots()}
          </div>
        );
      case 'pdf':
        return (
          <div className="relative">
            <PDFViewer
              pages={loop.pdfPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
              renderOverlay={renderSpots}
            />
          </div>
        );
      case 'figma':
        return (
          <div className="relative">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
                <img 
                  src={loop.screenshot}
                  alt={loop.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
                <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Figma Design</h3>
                  <p className="text-gray-600 mb-4">
                    This is a Figma design. To view and interact with it:
                  </p>
                  <a 
                    href={loop.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open in Figma
                  </a>
                </div>
              </div>
            </div>
            {renderSpots()}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSpots = () => (
    <>
      {spots.map(spot => (
        <SpotMarker
          key={spot.id}
          spot={spot}
          isSelected={selectedSpot?.id === spot.id}
          onClick={() => onSpotSelect(spot)}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          containerRef={{ current: null }}
        />
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {renderContent()}
    </div>
  );
}