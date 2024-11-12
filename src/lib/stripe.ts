import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const PLANS = {
  FREE: {
    id: import.meta.env.VITE_STRIPE_PRICE_FREE,
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
    id: import.meta.env.VITE_STRIPE_PRICE_BASIC,
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
    id: import.meta.env.VITE_STRIPE_PRICE_PRO,
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
    id: import.meta.env.VITE_STRIPE_PRICE_TEAM,
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

  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-customer-email': auth.currentUser.email || '',
      },
      body: JSON.stringify({
        planId,
        additionalTeamMembers,
        userId: auth.currentUser.uid,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId, publishableKey } = await response.json();
    
    const stripe = await loadStripe(publishableKey);
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
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