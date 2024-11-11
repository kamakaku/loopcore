import React from 'react';
import { useTranslation } from 'react-i18next';
import ApiKeyList from './ApiKeyList';
import WebhookList from './WebhookList';

export default function IntegrationsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t('settings.integrations.title')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('settings.integrations.description')}
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <ApiKeyList />
        </section>

        <section>
          <WebhookList />
        </section>
      </div>
    </div>
  );
}