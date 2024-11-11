import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useFirestore } from '../../../hooks/useFirestore';
import { Webhook } from '../../../lib/webhooks';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import WebhookForm from './WebhookForm';

export default function WebhookList() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const { data: webhooks = [], loading } = useFirestore<Webhook>('webhooks', {
    where: [['createdBy', '==', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h3 className="text-lg font-medium">{t('settings.integrations.webhooks.title')}</h3>
        <button
          onClick={() => {
            setSelectedWebhook(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>{t('settings.integrations.webhooks.add')}</span>
        </button>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t('settings.integrations.webhooks.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      getStatusColor(webhook.status)
                    }`}>
                      {webhook.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{webhook.url}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t('settings.integrations.webhooks.deleteConfirm'))) {
                        // Delete webhook
                      }
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {webhook.failureCount > 0 && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {t('settings.integrations.webhooks.failures', {
                      count: webhook.failureCount
                    })}
                  </span>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                {webhook.lastTriggered ? (
                  <span>
                    {t('settings.integrations.webhooks.lastTriggered', {
                      time: formatDistanceToNow(webhook.lastTriggered, { addSuffix: true })
                    })}
                  </span>
                ) : (
                  <span>{t('settings.integrations.webhooks.neverTriggered')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <WebhookForm
          webhook={selectedWebhook}
          onClose={() => setShowForm(false)}
          onSubmit={() => {
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}