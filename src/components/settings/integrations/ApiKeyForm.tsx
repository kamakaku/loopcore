import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createApiKey } from '../../../lib/api';
import { useTranslation } from 'react-i18next';

interface ApiKeyFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

const AVAILABLE_SCOPES = [
  'loops:read',
  'loops:write',
  'spots:read',
  'spots:write',
  'comments:read',
  'comments:write',
  'teams:read',
  'teams:write',
  'projects:read',
  'projects:write'
];

export default function ApiKeyForm({ onClose, onSubmit }: ApiKeyFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || scopes.length === 0 || loading) return;

    setLoading(true);
    setError('');

    try {
      await createApiKey({
        name: name.trim(),
        scopes
      });
      onSubmit();
    } catch (err) {
      console.error('Error creating API key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const toggleScope = (scope: string) => {
    setScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {t('settings.integrations.api.createKey')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.integrations.api.keyName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.integrations.api.scopes')}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={scopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">{scope}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || scopes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>
                {loading
                  ? t('common.creating')
                  : t('settings.integrations.api.create')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}