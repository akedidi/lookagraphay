import { NextRequest } from 'next/server';
import { handleStripeWebhook } from '@/lib/stripe-webhook-handler';

export const runtime = 'nodejs';

/** Alias — même handler que /api/webhook */
export async function POST(req: NextRequest) {
  return handleStripeWebhook(req);
}
