import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={null}
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        />
      </Document>

      {!loading && numPages > 0 && (
        <div className="flex items-center justify-center space-x-4 mt-4 p-4 bg-white border-t border-gray-200 w-full">
          <button
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}