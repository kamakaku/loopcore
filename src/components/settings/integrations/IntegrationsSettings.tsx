import React from 'react';
import { useTranslation } from 'react-i18next';
import ApiKeyList from './ApiKeyList';
import WebhookList from './WebhookList';

export default function IntegrationsSettings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="space-y-8">
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