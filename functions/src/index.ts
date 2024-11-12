import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { planId, additionalTeamMembers = 0 } = data;

  if (!planId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Plan ID is required'
    );
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.email) {
      throw new Error('User email not found');
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
      success_url: `${process.env.PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.PUBLIC_URL}/plans?canceled=true`,
      customer_email: userData.email,
      metadata: {
        userId: context.auth.uid,
        planId,
        additionalTeamMembers: additionalTeamMembers.toString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return {
      sessionId: session.id,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY
    };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw new functions.https.HttpsError(
      'internal',
      err instanceof Error ? err.message : 'Failed to create checkout session'
    );
  }
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature found');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId, additionalTeamMembers } = session.metadata!;

        await admin.firestore().collection('users').doc(userId).update({
          'subscription.planId': planId,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(session.expires_at! * 1000),
          'subscription.cancelAtPeriodEnd': false,
          'subscription.additionalTeamMembers': parseInt(additionalTeamMembers || '0', 10),
          'subscription.stripeCustomerId': session.customer,
          'subscription.stripeSubscriptionId': session.subscription,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await admin.firestore().collection('users').doc(subscription.metadata.userId).update({
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.status': subscription.status,
          'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await admin.firestore().collection('users').doc(subscription.metadata.userId).update({
          'subscription.planId': 'free',
          'subscription.status': 'canceled',
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': false,
          'subscription.additionalTeamMembers': 0,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await admin.firestore().collection('users').doc(subscription.metadata.userId).update({
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.status': 'active',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await admin.firestore().collection('users').doc(subscription.metadata.userId).update({
            'subscription.status': 'past_due',
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
  }
});

export const cancelSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    await stripe.subscriptions.update(userData.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await userDoc.ref.update({
      'subscription.cancelAtPeriodEnd': true
    });

    return { success: true };
  } catch (err) {
    console.error('Error canceling subscription:', err);
    throw new functions.https.HttpsError(
      'internal',
      err instanceof Error ? err.message : 'Failed to cancel subscription'
    );
  }
});

export const reactivateSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.subscription?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    await stripe.subscriptions.update(userData.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await userDoc.ref.update({
      'subscription.cancelAtPeriodEnd': false
    });

    return { success: true };
  } catch (err) {
    console.error('Error reactivating subscription:', err);
    throw new functions.https.HttpsError(
      'internal',
      err instanceof Error ? err.message : 'Failed to reactivate subscription'
    );
  }
});