import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return { statusCode: 400, body: 'No signature found' };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const { userId, planId, additionalTeamMembers } = session.metadata!;

        await db.collection('users').doc(userId).update({
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          'subscription.planId': planId,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': new Date(session.expires_at! * 1000),
          'subscription.cancelAtPeriodEnd': false,
          'subscription.additionalTeamMembers': parseInt(additionalTeamMembers || '0', 10),
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await db.collection('users').doc(subscription.metadata.userId).update({
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.status': subscription.status,
          'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await db.collection('users').doc(subscription.metadata.userId).update({
          'subscription.planId': 'free',
          'subscription.status': 'canceled',
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.cancelAtPeriodEnd': false,
          'subscription.additionalTeamMembers': 0,
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await db.collection('users').doc(subscription.metadata.userId).update({
            'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
            'subscription.status': 'active',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await db.collection('users').doc(subscription.metadata.userId).update({
            'subscription.status': 'past_due',
          });
        }
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
    };
  }
};