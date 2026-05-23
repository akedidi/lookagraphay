import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripePaymentProvider(): boolean {
  return (process.env.PAYMENT_PROVIDER ?? 'paypal') === 'stripe';
}
