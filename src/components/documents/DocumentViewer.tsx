import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, FileWarning } from 'lucide-react';
import DocumentError from './DocumentError';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
  type: 'pdf' | 'doc' | 'docx';
  onLoad?: () => void;
  className?: string;
}

export default function DocumentViewer({ url, type, onLoad, className = '' }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const retryDelay = 1000;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
  }, [url]);

  const loadDocument = async () => {
    try {
      // Add cache-busting parameter and authorization header
      const timestamp = Date.now();
      const response = await fetch(`${url}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to load document (HTTP ${response.status})`);
      }

      // Create a blob URL from the response
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Update the URL for react-pdf
      setDocumentUrl(blobUrl);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error loading document:', err);
      
      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.min(retryDelay * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadDocument();
        }, delay);
      } else {
        setError('Unable to load the document. Please try again later.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDocument();
    
    // Cleanup function to revoke blob URL
    return () => {
      if (documentUrl && documentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [url, retryCount]);

  const [documentUrl, setDocumentUrl] = useState<string>(url);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    onLoad?.();
  }

  function onDocumentLoadError(error: Error): void {
    console.error('Error loading document:', error);
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      loadDocument();
    } else {
      setError('Failed to load the document. Please try again.');
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    loadDocument();
  };

  if (error) {
    return (
      <DocumentError error={error} onRetry={handleRetry} />
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {loading && (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-sm text-gray-500">
            Loading document{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${maxRetries})` : ''}...
          </p>
        </div>
      )}
      
      {!error && (
        <Document
          file={documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          error={
            <div className="flex flex-col items-center justify-center h-96">
              <FileWarning className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600">Failed to load the document</p>
            </div>
          }
          options={{
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto"
            loading={
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-96">
                <FileWarning className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600">Failed to load page {pageNumber}</p>
              </div>
            }
          />
        </Document>
      )}

      {!loading && !error && numPages > 0 && (
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            Previous
          </button>
          <span className="py-2">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}