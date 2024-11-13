import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';

// Initialize Stripe with proper error handling and fallback values
const initializeStripe = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!key) {
    console.warn('Stripe publishable key not found. Running in test mode.');
    return null;
  }

  try {
    return loadStripe(key);
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export const stripePromise = initializeStripe();

export const PLANS = {
  FREE: {
    id: import.meta.env.VITE_STRIPE_PRICE_FREE || 'price_free',
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
    id: import.meta.env.VITE_STRIPE_PRICE_BASIC || 'price_basic',
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
    id: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_pro',
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
    id: import.meta.env.VITE_STRIPE_PRICE_TEAM || 'price_team',
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

export async function createCheckoutSession(planId: string, additionalTeamMembers: number = 0) {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  if (!stripePromise) {
    throw new Error('Stripe is not properly initialized');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/create-checkout-session`, {
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
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

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
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/cancel-subscription`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/reactivate-subscription`, {
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