import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const convertPDFToImages = async (pdfFile: File): Promise<Blob[]> => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: Blob[] = [];

  const scale = 2.0; // Higher scale for better quality
  const maxDimension = 2048; // Maximum dimension to prevent oversized images

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    // Adjust scale if dimensions are too large
    let finalScale = scale;
    if (viewport.width > maxDimension || viewport.height > maxDimension) {
      const ratio = Math.min(maxDimension / viewport.width, maxDimension / viewport.height);
      finalScale = scale * ratio;
    }

    const finalViewport = page.getViewport({ scale: finalScale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get canvas context');

    canvas.height = finalViewport.height;
    canvas.width = finalViewport.width;

    // Set white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: finalViewport,
      background: 'white'
    }).promise;

    // Convert canvas to blob with optimized settings
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.92); // Slightly reduced quality for better file size
    });

    pages.push(blob);

    // Clean up
    canvas.width = 0;
    canvas.height = 0;
  }

  return pages;
};