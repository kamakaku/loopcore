import { Loop } from '../types';
import { createLoop } from './loops';

export const isFigmaUrl = (url: string): boolean => {
  return url.includes('figma.com/file/') || 
         url.includes('figma.com/proto/') ||
         url.includes('figma.com/design/');
};

export const extractFigmaKeyFromUrl = (url: string): string | null => {
  const patterns = [
    /figma\.com\/file\/([a-zA-Z0-9]+)/,
    /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    /figma\.com\/design\/([a-zA-Z0-9]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

export const createFigmaLoop = async (url: string): Promise<Loop> => {
  if (!url) {
    throw new Error('Figma URL is required');
  }

  if (!isFigmaUrl(url)) {
    throw new Error('Invalid Figma URL. Please use a URL from a Figma file, prototype, or design.');
  }

  // Extract title from URL
  const title = url.split('/').pop()?.split('?')[0]?.replace(/-/g, ' ') || 'Figma Design';

  // Create the loop with a simple preview
  return await createLoop({
    title,
    type: 'figma',
    content: url,
    screenshot: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?auto=format&fit=crop&q=80&w=2000&h=1000'
  });
};