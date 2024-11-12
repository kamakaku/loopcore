// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';

// Debug: Log environment variables (remove in production)
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;

console.log('Environment Variables Check:', {
  hasStripeKey: !!stripeKey,
  keyPrefix: stripeKey?.substring(0, 7),
  source: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'import.meta.env' : process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'process.env' : 'none'
});

// Initialize Stripe with publishable key, with proper validation and error handling
const stripePromise = (() => {
  if (!stripeKey) {
    console.error('Stripe publishable key is missing. Check these potential issues:\n' +
      '1. Environment variable VITE_STRIPE_PUBLISHABLE_KEY is not set\n' +
      '2. Variable is not marked as both Build and Runtime variable in Coolify\n' +
      '3. Application needs to be rebuilt after environment changes');
    return null;
  }

  if (!stripeKey.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format. Key should start with "pk_"');
    return null;
  }

  try {
    return loadStripe(stripeKey);
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
})();

export const PLANS = {
  FREE: {
    id: import.meta.env.VITE_STRIPE_PRICE_FREE || process.env.VITE_STRIPE_PRICE_FREE,
    name: 'Free',
    price: 0,
    limits: {
      projects: 1,
      loopsPerProject: 2,
      spotsPerLoop: 5,
      teamMembers: 0,
      features: ['basic_comments', 'basic_analytics']
    }
  },
  BASIC: {
    id: import.meta.env.VITE_STRIPE_PRICE_BASIC || process.env.VITE_STRIPE_PRICE_BASIC,
    name: 'Basic',
    price: 5,
    limits: {
      projects: 3,
      loopsPerProject: 5,
      spotsPerLoop: 10,
      teamMembers: 0,
      features: ['comments_with_replies', 'basic_analytics', 'export', 'realtime_feedback']
    }
  },
  PRO: {
    id: import.meta.env.VITE_STRIPE_PRICE_PRO || process.env.VITE_STRIPE_PRICE_PRO,
    name: 'Pro',
    price: 15,
    limits: {
      projects: -1,
      loopsPerProject: 10,
      spotsPerLoop: 20,
      teamMembers: 2,
      additionalMemberPrice: 3,
      features: ['advanced_comments', 'advanced_analytics', 'export', 'realtime_feedback']
    }
  },
  TEAM: {
    id: import.meta.env.VITE_STRIPE_PRICE_TEAM || process.env.VITE_STRIPE_PRICE_TEAM,
    name: 'Team',
    price: 25,
    limits: {
      projects: -1,
      loopsPerProject: -1,
      spotsPerLoop: -1,
      teamMembers: 5,
      additionalMemberPrice: 3,
      features: ['all']
    }
  }
} as const;

const API_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

export async function createCheckoutSession(planId: string, additionalTeamMembers: number = 0) {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!stripePromise) {
    throw new Error('Stripe is not properly initialized. Please check your environment configuration.');
  }

  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    const response = await fetch(`${API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-customer-email': auth.currentUser.email || ''
      },
      body: JSON.stringify({
        planId,
        additionalTeamMembers,
        userId: auth.currentUser.uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function cancelSubscription() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_URL}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: auth.currentUser.uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function reactivateSubscription() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_URL}/reactivate-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: auth.currentUser.uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reactivate subscription');
    }
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
}
