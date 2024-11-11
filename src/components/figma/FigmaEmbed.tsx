import React from 'react';
import { FileWarning } from 'lucide-react';

interface FigmaEmbedProps {
  fileKey: string;
  onError?: (error: Error) => void;
}

export default function FigmaEmbed({ fileKey, onError }: FigmaEmbedProps) {
  const embedUrl = `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileKey}`;

  return (
    <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 'none', minHeight: '600px' }}
        allowFullScreen
        onError={() => {
          const error = new Error('Failed to load Figma embed');
          onError?.(error);
        }}
      />
    </div>
  );
}