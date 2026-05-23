import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripePaymentProvider } from '@/lib/stripe';
import { markOrderPaid } from '@/lib/mark-order-paid';

export async function GET(req: NextRequest) {
  if (!isStripePaymentProvider()) {
    return NextResponse.json({ error: 'Stripe non actif' }, { status: 400 });
  }

  const sessionId = new URL(req.url).searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id requis' }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const orderNumber = session.metadata?.order_number;
    if (!orderNumber) {
      return NextResponse.json({ error: 'Commande introuvable dans la session' }, { status: 404 });
    }

    const paid = session.payment_status === 'paid';
    if (paid) {
      await markOrderPaid(orderNumber, {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      });
    }

    return NextResponse.json({
      order_number: orderNumber,
      paid,
      payment_status: session.payment_status,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur vérification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
