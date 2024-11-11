import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFViewerProps {
  pages?: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  renderOverlay?: () => React.ReactNode;
}

export default function PDFViewer({ 
  pages = [], 
  currentPage, 
  onPageChange, 
  renderOverlay 
}: PDFViewerProps) {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Preload adjacent pages
  useEffect(() => {
    const preloadPages = async () => {
      if (!pages || pages.length === 0) return;

      const pagesToLoad = [
        currentPage - 1,
        currentPage,
        currentPage + 1
      ].filter(p => p >= 0 && p < pages.length);

      for (const pageNum of pagesToLoad) {
        if (!loadedPages.has(pageNum)) {
          const img = new Image();
          img.src = pages[pageNum];
          await img.decode();
          setLoadedPages(prev => new Set([...prev, pageNum]));
        }
      }
    };

    preloadPages();
  }, [currentPage, pages, loadedPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || !pages || pages.length === 0) return;
    
    setTransitioning(true);
    onPageChange(newPage);
    
    // Remove transition after animation completes
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No PDF pages available</p>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative overflow-hidden">
        <div 
          className={`transition-opacity duration-300 ${
            loadedPages.has(currentPage) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            key={currentPage}
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            className={`w-full h-auto ${transitioning ? 'transition-transform duration-300' : ''}`}
            style={{
              transform: transitioning ? 'scale(0.98)' : 'scale(1)',
            }}
          />
          {renderOverlay?.()}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="flex items-center justify-center space-x-4 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || transitioning}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1 || transitioning}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}