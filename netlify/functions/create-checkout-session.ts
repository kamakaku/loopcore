import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { planId, additionalTeamMembers = 0, userId } = JSON.parse(event.body || '{}');
    const customerEmail = event.headers['x-customer-email'];

    if (!planId || !userId || !customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required parameters' 
        })
      };
    }

    const lineItems = [
      {
        price: planId,
        quantity: 1,
      }
    ];

    if (additionalTeamMembers > 0 && process.env.VITE_STRIPE_PRICE_ADDITIONAL_MEMBER) {
      lineItems.push({
        price: process.env.VITE_STRIPE_PRICE_ADDITIONAL_MEMBER,
        quantity: additionalTeamMembers,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.URL || event.headers.origin}/dashboard?success=true`,
      cancel_url: `${process.env.URL || event.headers.origin}/plans?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        userId,
        planId,
        additionalTeamMembers: additionalTeamMembers.toString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        sessionId: session.id,
        publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY
      }),
    };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Failed to create checkout session'
      }),
    };
  }
};