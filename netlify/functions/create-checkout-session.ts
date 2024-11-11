import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { planId, additionalTeamMembers = 0, userId } = JSON.parse(event.body || '{}');

    if (!planId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Create the session with the correct price ID
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
        ...(additionalTeamMembers > 0 ? [{
          price: process.env.VITE_STRIPE_PRICE_ADDITIONAL_MEMBER,
          quantity: additionalTeamMembers,
        }] : []),
      ],
      success_url: `${process.env.URL}/dashboard?success=true`,
      cancel_url: `${process.env.URL}/plans?canceled=true`,
      metadata: {
        userId,
        planId,
        additionalTeamMembers: additionalTeamMembers.toString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: event.headers['x-customer-email'],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
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