import { Request, Response } from 'express';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth';
import { StripeService } from '../services/stripeService';
import { env } from '../config/env';

export const BillingController = {
  async getPlans(_req: Request, res: Response): Promise<void> {
    try {
      const plans = StripeService.getPlans();
      res.json(plans);
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  },

  async createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { plan } = req.body;

      if (!['starter', 'pro', 'agency'].includes(plan)) {
        res.status(400).json({ error: 'Invalid plan' });
        return;
      }

      const successUrl = `${env.frontendUrl}/settings?billing=success`;
      const cancelUrl = `${env.frontendUrl}/settings?billing=cancelled`;

      const sessionUrl = await StripeService.createCheckoutSession(
        req.userId!,
        plan as 'starter' | 'pro' | 'agency',
        successUrl,
        cancelUrl
      );

      if (!sessionUrl) {
        res.status(503).json({ error: 'Billing service unavailable. Please configure Stripe.' });
        return;
      }

      res.json({ url: sessionUrl });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  },

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;

      if (!env.stripeWebhookSecret || !env.stripeSecretKey) {
        res.status(503).json({ error: 'Stripe not configured' });
        return;
      }

      const stripe = new Stripe(env.stripeSecretKey);
      const event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);

      await StripeService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  },
};
