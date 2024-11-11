import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const SCREENSHOT_TIMEOUT = 60000; // 60 seconds timeout for full page
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

export const captureWebsiteScreenshot = async (url: string, userId: string): Promise<string> => {
  if (!url || !userId) {
    throw new Error('URL and user ID are required');
  }

  // Helper function to upload blob to Firebase Storage
  const uploadScreenshot = async (blob: Blob, suffix: string = ''): Promise<string> => {
    const timestamp = Date.now();
    const filename = `screenshots/${userId}/${timestamp}${suffix}.jpg`;
    const storageRef = ref(storage, filename);
    
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const uploadResult = await uploadBytes(storageRef, blob, {
          contentType: 'image/jpeg',
          customMetadata: {
            sourceUrl: url,
            timestamp: timestamp.toString(),
          }
        });
        return await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error(`Upload attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error('Failed to upload screenshot after multiple attempts');
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    throw new Error('Failed to upload screenshot');
  };

  // Helper function to fetch with timeout
  const fetchWithTimeout = async (fetchUrl: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SCREENSHOT_TIMEOUT);
    
    try {
      const response = await fetch(fetchUrl, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  try {
    // Primary screenshot service (APIFlash)
    const apiKey = import.meta.env.VITE_SCREENSHOT_API_KEY;
    if (!apiKey) {
      throw new Error('Screenshot API key is not configured');
    }

    const proxyUrl = 'https://api.apiflash.com/v1/urltoimage';
    const params = new URLSearchParams({
      access_key: apiKey,
      url: url,
      width: '1280',
      format: 'jpeg',
      quality: '90',
      fresh: 'true',
      full_page: 'true', // Capture full page
      response_type: 'image',
      ttl: '2592000', // Cache for 30 days
      delay: '3', // Wait 3 seconds for dynamic content to load
      no_ads: 'true', // Remove ads
      no_cookie_banners: 'true', // Remove cookie banners
      no_tracking: 'true', // Disable tracking scripts
      wait_until: 'network_idle' // Wait until network is idle
    });

    let retries = 0;
    let lastError: Error | null = null;

    while (retries < MAX_RETRIES) {
      try {
        const response = await fetchWithTimeout(`${proxyUrl}?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Screenshot service error: ${response.statusText}`);
        }

        const imageBlob = await response.blob();
        if (!imageBlob || imageBlob.size === 0) {
          throw new Error('Screenshot service returned empty response');
        }

        return await uploadScreenshot(imageBlob);
      } catch (error) {
        console.error(`Screenshot attempt ${retries + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        retries++;
        
        if (retries < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        // All retries failed, try fallback
        break;
      }
    }

    console.error('All screenshot attempts failed, using fallback:', lastError);
    
    // Generate a fallback image
    try {
      const placeholderUrl = `https://placehold.co/1280x720/f3f4f6/a3a3a3?text=${encodeURIComponent(url)}`;
      const placeholderResponse = await fetchWithTimeout(placeholderUrl);
      
      if (!placeholderResponse.ok) {
        throw new Error('Failed to generate fallback image');
      }
      
      const placeholderBlob = await placeholderResponse.blob();
      return await uploadScreenshot(placeholderBlob, '_fallback');
    } catch (fallbackError) {
      console.error('Fallback image generation failed:', fallbackError);
      throw new Error('Failed to capture screenshot and generate fallback');
    }
  } catch (error) {
    console.error('Screenshot capture failed completely:', error);
    throw error;
  }
};