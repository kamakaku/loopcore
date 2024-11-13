import { stripe } from './stripe';
import { updateUserSubscription } from '../firebase';

export const handleStripeWebhook = async (event: any) => {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await updateUserSubscription(session.customer, {
        planId: session.metadata.planId,
        status: 'active',
        subscriptionId: session.subscription
      });
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateUserSubscription(subscription.customer, {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      });
      break;
  }
};
