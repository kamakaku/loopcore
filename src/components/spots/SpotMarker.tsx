import React, { useEffect } from 'react';
import { Spot } from '../../types';

interface SpotMarkerProps {
  spot: Spot;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export default function SpotMarker({
  spot,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  containerRef,
  disabled = false
}: SpotMarkerProps) {
  // Create a ref for the spot marker
  const spotRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // If this spot is selected, scroll it into view
    if (isSelected && spotRef.current) {
      spotRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isSelected]);

  const baseSize = isSelected || isHovered ? 'w-6 h-6' : 'w-5 h-5';
  const baseTextSize = isSelected || isHovered ? 'text-xs' : 'text-[10px]';

  return (
    <button
      ref={spotRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${baseSize} rounded-full flex items-center justify-center transition-all duration-200 ${
        isSelected
          ? 'bg-blue-600 text-white scale-125 ring-4 ring-blue-100'
          : isHovered
          ? 'bg-blue-500 text-white scale-110'
          : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        left: `${spot.position.x}%`,
        top: `${spot.position.y}%`,
        zIndex: isSelected ? 40 : isHovered ? 30 : 20
      }}
      disabled={disabled}
    >
      <span className={`font-semibold ${baseTextSize}`}>{spot.number}</span>
    </button>
  );
}