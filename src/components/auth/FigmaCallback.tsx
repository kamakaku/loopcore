import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFigmaFile } from '../../lib/figma';
import LoadingScreen from '../common/LoadingScreen';

export default function FigmaCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');

      if (error) {
        console.error('Figma authentication error:', error);
        navigate('/', { replace: true });
        return;
      }

      // Since we're using an access token, just redirect back
      navigate('/', { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen />;
}