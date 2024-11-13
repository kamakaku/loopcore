// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';

// Enhanced debugging
const debugEnvVars = () => {
  console.group('Stripe Environment Variables Debug');
  try {
    // Check if import.meta.env exists
    console.log('import.meta.env exists:', !!import.meta.env);

    // Log all VITE_ environment variables
    const envVars = Object.entries(import.meta.env)
      .filter(([key]) => key.startsWith('VITE_'))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value ? `${value.toString().substring(0, 4)}...` : value
      }), {});
    
    console.log('All VITE_ environment variables:', envVars);

    // Specific Stripe key checks
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log('Stripe Key Details:', {
      exists: !!stripeKey,
      type: typeof stripeKey,
      length: stripeKey?.length,
      startsWithPk: stripeKey?.startsWith('pk_'),
      firstChars: stripeKey ? `${stripeKey.substring(0, 4)}...` : 'none'
    });

    // Check other required Stripe variables
    console.log('Required Stripe Variables:', {
      PRICE_FREE: !!import.meta.env.VITE_STRIPE_PRICE_FREE,
      PRICE_BASIC: !!import.meta.env.VITE_STRIPE_PRICE_BASIC,
      PRICE_PRO: !!import.meta.env.VITE_STRIPE_PRICE_PRO,
      PRICE_TEAM: !!import.meta.env.VITE_STRIPE_PRICE_TEAM,
      API_URL: import.meta.env.VITE_API_URL
    });
  } catch (error) {
    console.error('Error during environment variables debug:', error);
  }
  console.groupEnd();
};

// Run debug immediately
debugEnvVars();

// Initialize Stripe with enhanced error handling
const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!key) {
    console.error(`
🔴 Stripe Configuration Error:
----------------------------
Missing publishable key. Please check:

1. Environment Variables:
   - Verify VITE_STRIPE_PUBLISHABLE_KEY is set
   - Check for typos in variable name
   - Ensure no spaces around = in .env

2. Build Configuration:
   - Confirm variable is marked as "Build Variable" in Coolify
   - Verify variable is being injected during build

3. Application State:
   - Try clearing browser cache
   - Rebuild and redeploy the application

For debugging, run:
  console.log(import.meta.env) in your browser console
`);
    return null;
  }

  if (!key.startsWith('pk_')) {
    console.error(`
🔴 Invalid Stripe Key Format:
--------------------------
The provided key does not start with 'pk_'
Received key format: ${key.substring(0, 4)}...
Expected format: pk_test_xxx or pk_live_xxx
`);
    return null;
  }

  try {
    return loadStripe(key);
  } catch (error) {
    console.error(`
🔴 Stripe Initialization Error:
----------------------------
Failed to initialize Stripe client:
${error instanceof Error ? error.message : 'Unknown error'}
`);
    return null;
  }
})();

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

  if (!stripePromise) {
    throw new Error('Stripe is not properly initialized. Please check your environment configuration.');
  }

  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/cancel-subscription`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/reactivate-subscription`, {
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
