import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ 
  children, 
  content, 
  delay = 200,
  position = 'top' 
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setShow(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setShow(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className={`absolute ${positionClasses[position]} z-50`}>
          <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
            {content}
          </div>
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'top-full -translate-x-1/2 -mt-1 left-1/2' :
              position === 'bottom' ? 'bottom-full -translate-x-1/2 -mb-1 left-1/2' :
              position === 'left' ? 'left-full -translate-y-1/2 -ml-1 top-1/2' :
              'right-full -translate-y-1/2 -mr-1 top-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}