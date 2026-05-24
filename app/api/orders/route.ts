import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/emails';
import { generatePaymentLink } from '@/lib/payment';
import { isStripePaymentProvider } from '@/lib/stripe';
import { createStripeCheckoutSession } from '@/lib/stripe-checkout';
import { ensureOrderColumns } from '@/lib/orders-schema';
import { requireAdmin } from '@/lib/admin-auth';
import { validateOrderPricing } from '@/lib/order-pricing';

async function generateOrderNumber(conn: Awaited<ReturnType<typeof pool.getConnection>>): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await conn.execute(
    'SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?',
    [`LG-${dateStr}-%`]
  ) as [{ count: number }[], unknown];
  const num = String(rows[0].count + 1).padStart(4, '0');
  return `LG-${dateStr}-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, email, telephone, pays_residence, items, delivery_type, relay_point, shipping_address, pays, notes } = body;

    if (!nom || !email || !items || !delivery_type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    await ensureOrderColumns(conn);

    let priced;
    try {
      priced = await validateOrderPricing(conn, {
        items,
        delivery_type,
        pays: pays ?? 'FR',
      });
    } catch (err: unknown) {
      conn.release();
      const message = err instanceof Error ? err.message : 'Panier invalide';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { items: validatedItems, shippingCost, total } = priced;
    const order_number = await generateOrderNumber(conn);

    await conn.execute(
      `INSERT INTO orders (order_number, nom, email, telephone, pays_residence, items, delivery_type, relay_point, shipping_address, pays, shipping_cost, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number, nom, email, telephone ?? null, pays_residence ?? null,
        JSON.stringify(validatedItems), delivery_type,
        relay_point ? JSON.stringify(relay_point) : null,
        shipping_address ? JSON.stringify(shipping_address) : null,
        pays ?? 'FR', shippingCost, total, notes ?? null,
      ]
    );

    let payment_link = '';
    let payment_provider = process.env.PAYMENT_PROVIDER ?? 'paypal';

    if (isStripePaymentProvider()) {
      const session = await createStripeCheckoutSession({
        orderNumber: order_number,
        email,
        items: validatedItems,
        shippingCost,
      });
      payment_link = session.url ?? '';
      if (session.id) {
        await conn.execute(
          'UPDATE orders SET stripe_session_id = ? WHERE order_number = ?',
          [session.id, order_number]
        );
      }
      payment_provider = 'stripe';
    } else {
      payment_link = generatePaymentLink({ amount: total, orderNumber: order_number }).url;
    }

    conn.release();

    // Stripe : emails après paiement confirmé (webhook / verify-session). PayPal : à la création.
    if (!isStripePaymentProvider()) {
      const emailData = {
        orderNumber: order_number,
        customerName: nom,
        customerEmail: email,
        customerPhone: telephone ?? null,
        items: validatedItems,
        deliveryType: delivery_type as 'relay' | 'home' | 'international',
        relayPoint: relay_point ?? null,
        shippingAddress: shipping_address ?? null,
        pays: pays ?? 'FR',
        paysResidence: pays_residence ?? null,
        shippingCost,
        total,
        paymentLink: payment_link,
        notes: notes ?? null,
        paymentConfirmed: false,
      };

      Promise.all([
        sendOrderConfirmationEmail(emailData),
        sendAdminNewOrderEmail(emailData),
      ]).catch((err) => console.error('[EMAIL ERROR]', err));
    }

    return NextResponse.json({
      ok: true,
      order_number,
      payment_link,
      payment_provider,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 500'
    ) as [Record<string, unknown>[], unknown];
    conn.release();
    const parsed = rows.map((r) => ({
      ...r,
      items: r.items ? JSON.parse(r.items as string) : [],
      relay_point: r.relay_point ? JSON.parse(r.relay_point as string) : null,
      shipping_address: r.shipping_address ? JSON.parse(r.shipping_address as string) : null,
    }));
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
