import React from 'react';
import { Spot } from '../../types';

interface SpotMarkerProps {
  spot: Spot;
  isSelected: boolean;
  onClick: () => void;
}

export default function SpotMarker({ spot, isSelected, onClick }: SpotMarkerProps) {
  return (
    <button
      onClick={onClick}
      className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center transition-all ${
        isSelected
          ? 'bg-blue-600 text-white scale-125'
          : 'bg-white text-blue-600 border-2 border-blue-600 hover:scale-110'
      }`}
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
      }}
    >
      <span className="text-sm font-medium">{spot.number}</span>
    </button>
  );
}