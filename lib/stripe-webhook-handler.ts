import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { markOrderPaid } from '@/lib/mark-order-paid';

const HANDLED_EVENTS = new Set(['checkout.session.completed']);

export async function handleStripeWebhook(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET non configuré' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature invalide';
    console.error('[STRIPE WEBHOOK]', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (HANDLED_EVENTS.has(event.type) && event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderNumber = session.metadata?.order_number;
      if (orderNumber && session.payment_status === 'paid') {
        await markOrderPaid(orderNumber, {
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        });
        console.log('[STRIPE WEBHOOK] Commande payée:', orderNumber);
      }
    }
    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur webhook';
    console.error('[STRIPE WEBHOOK]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
