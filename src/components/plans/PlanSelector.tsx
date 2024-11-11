import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, CheckCircle, Zap, Shield, Gauge } from 'lucide-react';
import { createCheckoutSession, PLANS } from '../../lib/stripe';
import { useAuth } from '../../contexts/AuthContext';

export default function PlanSelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createCheckoutSession(planId);
    } catch (err) {
      console.error('Error selecting plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to select plan');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free plan or upgrade to unlock more features. All plans include a 14-day free trial.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = key === 'FREE' ? Package : key === 'BASIC' ? Zap : key === 'PRO' ? Shield : Gauge;
            const isPopular = key === 'PRO';

            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  isPopular ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="inline-block p-3 rounded-2xl bg-blue-100 mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      €{plan.price}
                    </span>
                    {typeof plan.price === 'number' && (
                      <span className="text-gray-500">/mo</span>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {Object.entries(plan.limits).map(([key, value]) => {
                      if (key === 'features') return null;
                      return (
                        <li key={key} className="flex items-center text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>
                            {value === -1 ? 'Unlimited' : value}{' '}
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </li>
                      );
                    })}
                    {plan.limits.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Processing...' : 'Get Started'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}