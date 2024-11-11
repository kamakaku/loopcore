import React, { useEffect } from 'react';
import { handleLinkedInCallback } from '../../lib/firebase';

export default function AuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleLinkedInCallback(code)
        .catch(error => {
          console.error('Error during LinkedIn callback:', error);
        });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}