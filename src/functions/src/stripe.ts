import * as functions from 'firebase-functions';
import { stripe } from '../../lib/stripe';

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

const handleCheckoutComplete = async (session: any) => {
  const { customer, metadata } = session;
  await updateUserSubscription(customer, {
    planId: metadata.planId,
    status: 'active',
    subscriptionId: session.subscription
  });
};

const handleSubscriptionUpdate = async (subscription: any) => {
  await updateUserSubscription(subscription.customer, {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  });
};
