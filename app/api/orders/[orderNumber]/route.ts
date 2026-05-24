import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureOrderColumns } from '@/lib/orders-schema';
import { requireAdmin } from '@/lib/admin-auth';
import { detectOrderCustomerNotification, notifyOrderCustomerUpdate } from '@/lib/order-update-notify';

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM orders WHERE order_number = ?',
      [params.orderNumber]
    ) as [Record<string, unknown>[], unknown];
    conn.release();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const order = rows[0];

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email requis pour consulter cette commande' }, { status: 403 });
    }

    if (String(order.email).toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Email incorrect' }, { status: 403 });
    }

    return NextResponse.json({
      ...order,
      items: order.items ? JSON.parse(order.items as string) : [],
      relay_point: order.relay_point ? JSON.parse(order.relay_point as string) : null,
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address as string) : null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const {
      status,
      notes,
      customer_notes,
      admin_notes,
      nom,
      email,
      telephone,
      pays_residence,
      relay_point,
      shipping_address,
      shipping_cost,
      pays,
      carrier,
      tracking_number,
      tracking_url,
    } = body;

    const conn = await pool.getConnection();
    await ensureOrderColumns(conn);

    const [prev] = await conn.execute(
      `SELECT status, email, nom, admin_notes, carrier, tracking_number, tracking_url,
              relay_point, shipping_address, shipping_cost, pays, delivery_type
       FROM orders WHERE order_number = ?`,
      [params.orderNumber]
    ) as [Record<string, unknown>[], unknown];

    if (prev.length === 0) {
      conn.release();
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const prevOrder = prev[0] as {
      status: string;
      email: string;
      nom: string;
      admin_notes: string | null;
      carrier: string | null;
      tracking_number: string | null;
      tracking_url: string | null;
      relay_point: string | null;
      shipping_address: string | null;
      shipping_cost: number | null;
      pays: string | null;
      delivery_type: string | null;
    };

    const customerNotes =
      customer_notes !== undefined ? customer_notes : notes !== undefined ? notes : undefined;

    const markShipped =
      status === 'expedie' ||
      (tracking_number && String(tracking_number).trim() && !prevOrder.tracking_number);

    const markDelivered = status === 'livre';

    await conn.execute(
      `UPDATE orders SET
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        admin_notes = COALESCE(?, admin_notes),
        nom = COALESCE(?, nom),
        email = COALESCE(?, email),
        telephone = ?,
        pays_residence = COALESCE(?, pays_residence),
        relay_point = ?,
        shipping_address = ?,
        shipping_cost = COALESCE(?, shipping_cost),
        pays = COALESCE(?, pays),
        carrier = COALESCE(?, carrier),
        tracking_number = COALESCE(?, tracking_number),
        tracking_url = COALESCE(?, tracking_url),
        shipped_at = CASE
          WHEN ? AND shipped_at IS NULL THEN CURRENT_TIMESTAMP
          ELSE shipped_at
        END,
        delivered_at = CASE
          WHEN ? AND delivered_at IS NULL THEN CURRENT_TIMESTAMP
          ELSE delivered_at
        END
       WHERE order_number = ?`,
      [
        status ?? null,
        customerNotes ?? null,
        admin_notes ?? null,
        nom ?? null,
        email ?? null,
        telephone ?? null,
        pays_residence ?? null,
        relay_point !== undefined ? JSON.stringify(relay_point) : null,
        shipping_address !== undefined ? JSON.stringify(shipping_address) : null,
        shipping_cost ?? null,
        pays ?? null,
        carrier ?? null,
        tracking_number ?? null,
        tracking_url ?? null,
        markShipped ? 1 : 0,
        markDelivered ? 1 : 0,
        params.orderNumber,
      ]
    );

    conn.release();

    const emailPayload = detectOrderCustomerNotification(prevOrder, {
      status,
      admin_notes,
      nom,
      email,
      carrier,
      tracking_number,
      tracking_url,
      relay_point,
      shipping_address,
      shipping_cost,
      pays,
    });
    if (emailPayload) {
      notifyOrderCustomerUpdate(params.orderNumber, emailPayload);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
