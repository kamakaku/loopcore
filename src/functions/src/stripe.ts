import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Hardcoded Stripe secret key
const stripe = new Stripe('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', {
  apiVersion: '2023-10-16',
});

// Hardcoded additional member price ID
const ADDITIONAL_MEMBER_PRICE = 'price_1QJvYcJ273McvJiH5f5lAhyY';

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

    if (additionalTeamMembers > 0) {
      lineItems.push({
        price: ADDITIONAL_MEMBER_PRICE,
        quantity: additionalTeamMembers,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: 'https://go.loopcore.app/dashboard?success=true',
      cancel_url: 'https://go.loopcore.app/plans?canceled=true',
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