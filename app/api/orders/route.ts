import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/emails';
import { generatePaymentLink } from '@/lib/payment';

async function generateOrderNumber(conn: any): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await conn.execute(
    'SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?',
    [`LG-${dateStr}-%`]
  ) as any;
  const num = String(rows[0].count + 1).padStart(4, '0');
  return `LG-${dateStr}-${num}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, email, telephone, items, delivery_type, relay_point, shipping_address, pays, shipping_cost, total, notes } = body;

    if (!nom || !email || !items || !delivery_type || total === undefined) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    const order_number = await generateOrderNumber(conn);

    await conn.execute(
      `INSERT INTO orders (order_number, nom, email, telephone, items, delivery_type, relay_point, shipping_address, pays, shipping_cost, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number, nom, email, telephone ?? null,
        JSON.stringify(items), delivery_type,
        relay_point ? JSON.stringify(relay_point) : null,
        shipping_address ? JSON.stringify(shipping_address) : null,
        pays ?? 'FR', shipping_cost ?? 0, total, notes ?? null,
      ]
    );

    conn.release();

    // ── Notifications email (asynchrone — ne bloque pas la réponse) ──
    const paymentLink = generatePaymentLink({ amount: total, orderNumber: order_number }).url;
    const emailData = {
      orderNumber: order_number,
      customerName: nom,
      customerEmail: email,
      items,
      deliveryType: delivery_type as 'relay' | 'home' | 'international',
      relayPoint: relay_point ?? null,
      shippingAddress: shipping_address ?? null,
      pays: pays ?? 'FR',
      shippingCost: Number(shipping_cost ?? 0),
      total: Number(total),
      paymentLink,
      notes: notes ?? null,
    };

    Promise.all([
      sendOrderConfirmationEmail(emailData),
      sendAdminNewOrderEmail(emailData),
    ]).catch(err => console.error('[EMAIL ERROR]', err));

    return NextResponse.json({ ok: true, order_number, payment_link: paymentLink });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 500'
    ) as any;
    conn.release();
    const parsed = rows.map((r: any) => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : [],
      relay_point: r.relay_point ? JSON.parse(r.relay_point) : null,
      shipping_address: r.shipping_address ? JSON.parse(r.shipping_address) : null,
    }));
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
