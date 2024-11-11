import React, { useState } from 'react';
import { Plus, Trash2, Key, Eye, EyeOff, Copy } from 'lucide-react';
import { useFirestore } from '../../../hooks/useFirestore';
import { ApiKey } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ApiKeyForm from './ApiKeyForm';

export default function ApiKeyList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: apiKeys = [], loading } = useFirestore<ApiKey>('api-keys', {
    where: [['createdBy', '==', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy key:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('settings.integrations.api.title')}</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>{t('settings.integrations.api.createKey')}</span>
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('settings.integrations.api.noKeys')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex-1 font-mono text-sm bg-gray-50 px-3 py-1 rounded">
                      {showKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                    </div>
                    <button
                      onClick={() => setShowKey(
                        showKey === apiKey.id ? null : apiKey.id
                      )}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title={showKey === apiKey.id ? 'Hide key' : 'Show key'}
                    >
                      {showKey === apiKey.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopyKey(apiKey.key)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copy key"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {apiKey.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(t('settings.integrations.api.revokeConfirm'))) {
                      // Revoke API key
                    }
                  }}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                {apiKey.lastUsed ? (
                  <span>
                    {t('settings.integrations.api.lastUsed', {
                      time: formatDistanceToNow(apiKey.lastUsed, { addSuffix: true })
                    })}
                  </span>
                ) : (
                  <span>{t('settings.integrations.api.neverUsed')}</span>
                )}
                {apiKey.expiresAt && (
                  <span className="ml-3">
                    {t('settings.integrations.api.expires', {
                      time: formatDistanceToNow(apiKey.expiresAt, { addSuffix: true })
                    })}
                  </span>
                )}
              </div>

              {copiedKey === apiKey.key && (
                <div className="mt-2 text-sm text-green-600">
                  {t('settings.integrations.api.copied')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ApiKeyForm
          onClose={() => setShowForm(false)}
          onSubmit={() => setShowForm(false)}
        />
      )}
    </div>
  );
}