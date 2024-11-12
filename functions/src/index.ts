import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Create checkout session
app.post('/create-checkout-session', async (req: Request, res: Response): Promise<void> => {
  const { planId, additionalTeamMembers = 0, userId, customerEmail } = req.body;

  if (!planId || !userId || !customerEmail) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    // Create line items
    const lineItems = [
      {
        price: planId,
        quantity: 1,
      }
    ];

    if (additionalTeamMembers > 0 && process.env.STRIPE_PRICE_ADDITIONAL_MEMBER) {
      lineItems.push({
        price: process.env.STRIPE_PRICE_ADDITIONAL_MEMBER,
        quantity: additionalTeamMembers,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.PUBLIC_URL}/plans?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        userId,
        planId,
        additionalTeamMembers: additionalTeamMembers.toString(),
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    res.json({ 
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to create checkout session'
    });
  }
});

// Cancel subscription
app.post('/cancel-subscription', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      res.status(404).json({ error: 'No active subscription found' });
      return;
    }

    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await admin.firestore().collection('users').doc(userId).update({
      'subscription.cancelAtPeriodEnd': true
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error canceling subscription:', err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to cancel subscription'
    });
  }
});

// Reactivate subscription
app.post('/reactivate-subscription', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeSubscriptionId) {
      res.status(404).json({ error: 'No subscription found' });
      return;
    }

    await stripe.subscriptions.update(userData.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    await admin.firestore().collection('users').doc(userId).update({
      'subscription.cancelAtPeriodEnd': false
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error reactivating subscription:', err);
    res.status(500).json({ 
      error: err instanceof Error ? err.message : 'Failed to reactivate subscription'
    });
  }
});

// Stripe webhook
app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).json({ error: 'No signature found' });
    return;
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const { userId, planId, additionalTeamMembers } = session.metadata!;

        await admin.firestore().collection('users').doc(userId).update({
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
        await admin.firestore().collection('users').doc(subscription.metadata.userId).update({
          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
          'subscription.status': subscription.status,
          'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
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
        const invoice = stripeEvent.data.object as Stripe.Invoice;
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
        const invoice = stripeEvent.data.object as Stripe.Invoice;
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
    res.status(400).json({ 
      error: err instanceof Error ? err.message : 'Unknown Error'
    });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});