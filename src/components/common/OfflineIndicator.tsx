import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { goOnline } from '../../lib/firebase/db';

interface OfflineIndicatorProps {
  isOffline: boolean;
}

export default function OfflineIndicator({ isOffline }: OfflineIndicatorProps) {
  const { t } = useTranslation();

  if (!isOffline) return null;

  const handleRetryConnection = async () => {
    try {
      await goOnline();
    } catch (error) {
      console.error('Error reconnecting:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-fade-in">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">{t('common.workingOffline')}</span>
      <button
        onClick={handleRetryConnection}
        className="p-1 hover:bg-yellow-100 rounded-full transition-colors"
        title={t('common.retry')}
      >
        <RefreshCcw className="w-4 h-4" />
      </button>
    </div>
  );
}