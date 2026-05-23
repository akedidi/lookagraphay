import { NextRequest } from 'next/server';
import { handleStripeWebhook } from '@/lib/stripe-webhook-handler';

export const runtime = 'nodejs';

/**
 * Endpoint Stripe configuré sur Hostinger :
 * https://blue-squirrel-716769.hostingersite.com/api/webhook
 * Événement : checkout.session.completed
 */
export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
