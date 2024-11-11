import React, { useState } from 'react';
import { CreditCard, Package, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { PLANS, createCheckoutSession, cancelSubscription, reactivateSubscription } from '../../../lib/stripe';
import { useTranslation } from 'react-i18next';

export default function BillingSettings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = user?.subscription?.planId || 'free';
  const isSubscribed = currentPlan !== 'free';
  const isCanceled = user?.subscription?.cancelAtPeriodEnd;

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setError('');

    try {
      await createCheckoutSession(planId);
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(t('settings.billing.cancelConfirm'))) return;

    setLoading(true);
    setError('');

    try {
      await cancelSubscription();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    setError('');

    try {
      await reactivateSubscription();
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {isSubscribed && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {t('settings.billing.currentPlan', { plan: PLANS[currentPlan].name })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isCanceled
                  ? t('settings.billing.canceledAt', {
                      date: new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                    })
                  : t('settings.billing.renewsAt', {
                      date: new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                    })}
              </p>
            </div>
            {isCanceled ? (
              <button
                onClick={handleReactivate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {t('settings.billing.reactivate')}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                {t('settings.billing.cancel')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PLANS).map(([id, plan]) => (
          <div
            key={id}
            className={`bg-white rounded-lg border ${
              currentPlan === id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            } p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              {currentPlan === id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {t('settings.billing.current')}
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-gray-900">
                €{plan.price}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm text-gray-600">
                <Package className="w-4 h-4 mr-2 text-gray-400" />
                {plan.limits.projects === -1
                  ? t('settings.billing.unlimitedProjects')
                  : t('settings.billing.projectLimit', { count: plan.limits.projects })}
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                {plan.limits.teamMembers === -1
                  ? t('settings.billing.unlimitedMembers')
                  : t('settings.billing.memberLimit', { count: plan.limits.teamMembers })}
              </li>
              {plan.limits.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  {t(`settings.billing.features.${feature}`)}
                </li>
              ))}
            </ul>

            {(!isSubscribed || currentPlan !== id) && (
              <button
                onClick={() => handleSubscribe(id)}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-lg ${
                  plan.price === 0
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {plan.price === 0
                  ? t('settings.billing.startFree')
                  : currentPlan === 'free'
                  ? t('settings.billing.subscribe')
                  : t('settings.billing.switch')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}