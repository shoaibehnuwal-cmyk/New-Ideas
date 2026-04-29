import Stripe from 'stripe';
import { env } from '../config/env';
import { UserModel } from '../models/User';

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    priceId: env.stripeStarterPriceId,
    features: ['1 business location', '100 AI replies/month', 'Basic analytics', 'Email review requests', 'Google & Yelp integration'],
  },
  pro: {
    name: 'Pro',
    price: 9900,
    priceId: env.stripeProPriceId,
    features: ['5 business locations', '500 AI replies/month', 'Full analytics & insights', 'Email + SMS review requests', 'All platform integrations', 'Priority support'],
  },
  agency: {
    name: 'Agency',
    price: 29900,
    priceId: env.stripeAgencyPriceId,
    features: ['Unlimited locations', 'Unlimited AI replies', 'Advanced analytics', 'White-label options', 'API access', 'Dedicated account manager', 'Custom integrations'],
  },
} as const;

export const StripeService = {
  async createCustomer(email: string, name: string): Promise<string | null> {
    if (!stripe) return null;
    const customer = await stripe.customers.create({ email, name });
    return customer.id;
  },

  async createCheckoutSession(
    userId: string,
    plan: keyof typeof PLANS,
    successUrl: string,
    cancelUrl: string
  ): Promise<string | null> {
    if (!stripe) return null;

    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      customerId = await this.createCustomer(user.email, `${user.first_name} ${user.last_name}`);
      if (customerId) {
        await UserModel.update(userId, { stripe_customer_id: customerId });
      }
    }

    const planDetails = PLANS[plan];
    if (!planDetails?.priceId) throw new Error('Invalid plan');

    const session = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      mode: 'subscription',
      line_items: [{ price: planDetails.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, plan },
    });

    return session.url;
  },

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as keyof typeof PLANS;
        if (userId && plan) {
          await UserModel.update(userId, {
            subscription_tier: plan,
            stripe_subscription_id: session.subscription as string,
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await findUserByStripeCustomerId(customerId);
        if (user) {
          await UserModel.update(user.id, {
            subscription_tier: 'free',
            stripe_subscription_id: null,
          });
        }
        break;
      }
    }
  },

  getPlans() {
    return Object.entries(PLANS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  },
};

async function findUserByStripeCustomerId(customerId: string) {
  const db = (await import('../config/database')).default;
  return db('users').where({ stripe_customer_id: customerId }).first();
}
