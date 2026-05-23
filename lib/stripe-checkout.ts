import { getStripe } from '@/lib/stripe';

export type CheckoutOrderItem = {
  titre: string;
  prix: number;
  qty: number;
  matiere?: string;
  quantite_label?: string;
};

export type CreateCheckoutSessionInput = {
  orderNumber: string;
  email: string;
  items: CheckoutOrderItem[];
  shippingCost: number;
};

export async function createStripeCheckoutSession(input: CreateCheckoutSessionInput) {
  const stripe = getStripe();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5001').replace(/\/$/, '');

  const lineItems = input.items.map((item) => {
    const description = [item.matiere, item.quantite_label].filter(Boolean).join(' · ');
    return {
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.titre,
          ...(description ? { description } : {}),
        },
        unit_amount: Math.round(Number(item.prix) * 100),
      },
      quantity: item.qty,
    };
  });

  const shipping = Number(input.shippingCost);
  if (shipping > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Frais de livraison' },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.email,
    line_items: lineItems,
    metadata: { order_number: input.orderNumber },
    success_url: `${siteUrl}/commande-confirmee?order=${encodeURIComponent(input.orderNumber)}&email=${encodeURIComponent(input.email)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout?cancelled=1`,
  });

  return session;
}
