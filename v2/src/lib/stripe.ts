import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as any,
});

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited designs',
      'Cloud save',
      'Gateway hosting (1 instance)',
      'Priority support',
    ],
  },
  team: {
    name: 'Team',
    price: 49,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Gateway hosting (3 instances)',
      'Shared designs',
      'Team management',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
