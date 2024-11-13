import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const { planId, additionalTeamMembers = 0, email } = data;

  if (!planId || !email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters'
    );
  }

  try {
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
      success_url: `${process.env.PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.PUBLIC_URL}/plans?canceled=true`,
      customer_email: email,
      metadata: {
        userId: context.auth.uid,
        planId,
        additionalTeamMembers: additionalTeamMembers.toString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create checkout session'
    );
  }
});

export const cancelSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No active subscription found'
      );
    }

    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await userDoc.ref.update({
      'subscription.cancelAtPeriodEnd': true
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to cancel subscription'
    );
  }
});

export const reactivateSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No subscription found'
      );
    }

    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await userDoc.ref.update({
      'subscription.cancelAtPeriodEnd': false
    });

    return { success: true };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to reactivate subscription'
    );
  }
});