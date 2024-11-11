import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Webhook, createWebhook, updateWebhook } from '../../../lib/webhooks';
import { useTranslation } from 'react-i18next';

interface WebhookFormProps {
  webhook?: Webhook | null;
  onClose: () => void;
  onSubmit: () => void;
}

const AVAILABLE_EVENTS = [
  'loop.created',
  'loop.updated',
  'loop.deleted',
  'spot.created',
  'spot.updated',
  'spot.deleted',
  'comment.created',
  'comment.updated',
  'comment.deleted',
  'team.member_added',
  'team.member_removed',
  'project.created',
  'project.updated',
  'project.deleted'
];

export default function WebhookForm({ webhook, onClose, onSubmit }: WebhookFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(webhook?.name || '');
  const [url, setUrl] = useState(webhook?.url || '');
  const [events, setEvents] = useState<string[]>(webhook?.events || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || events.length === 0 || loading) return;

    setLoading(true);
    setError('');

    try {
      if (webhook) {
        await updateWebhook(webhook.id, {
          name: name.trim(),
          url: url.trim(),
          events,
          enabled: true,
          status: 'active'
        });
      } else {
        await createWebhook({
          name: name.trim(),
          url: url.trim(),
          events
        });
      }
      onSubmit();
    } catch (err) {
      console.error('Error saving webhook:', err);
      setError(err instanceof Error ? err.message : 'Failed to save webhook');
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    setEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {webhook 
              ? t('settings.integrations.webhooks.edit')
              : t('settings.integrations.webhooks.create')
            }
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
              {t('settings.integrations.webhooks.name')}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.integrations.webhooks.url')}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
              disabled={loading}
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.integrations.webhooks.events')}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700">{event}</span>
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
              disabled={loading || !name.trim() || !url.trim() || events.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>
                {loading
                  ? t('common.saving')
                  : webhook
                  ? t('common.save')
                  : t('common.create')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}