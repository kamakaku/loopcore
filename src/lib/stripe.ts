import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';

// Hardcoded Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51OPlIKJ273McvJiHuRro0Z8BJOUrwO9iPJJSuw2JTkH6ow2QS6S7ZjfR6syftnPCE4QAl6R9fsPRyqjGcRdDxnqV004GWB6wam';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Hardcoded plan IDs
export const PLANS = {
  FREE: {
    id: 'price_1QJvT0J273McvJiHfJGmDU1u',
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
    id: 'price_1QJvTNJ273McvJiH5noToO96',
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
    id: 'price_1QJvToJ273McvJiH1B5VUteZ',
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
    id: 'price_1QJvU3J273McvJiHJFONzwuz',
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
    const createCheckoutSessionFn = httpsCallable(functions, 'createCheckoutSession');
    const { data } = await createCheckoutSessionFn({
      planId,
      additionalTeamMembers,
      email: auth.currentUser.email
    });

    const { sessionId } = data as { sessionId: string };
    const stripe = await stripePromise;
    
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

export async function cancelSubscription() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  try {
    const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription');
    await cancelSubscriptionFn();
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
    const reactivateSubscriptionFn = httpsCallable(functions, 'reactivateSubscription');
    await reactivateSubscriptionFn();
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw error;
  }
}