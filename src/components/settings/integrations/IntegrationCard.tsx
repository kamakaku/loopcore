import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  onConnect: () => void;
  onDisconnect: () => void;
  onConfigure?: () => void;
}

export default function IntegrationCard({
  title,
  description,
  icon,
  status,
  onConnect,
  onDisconnect,
  onConfigure
}: IntegrationCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'connected' ? (
            <>
              {onConfigure && (
                <button
                  onClick={onConfigure}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
                >
                  {t('settings.integrations.configure')}
                </button>
              )}
              <button
                onClick={onDisconnect}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700"
              >
                {t('settings.integrations.disconnect')}
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('settings.integrations.connect')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}