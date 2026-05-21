import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM orders WHERE order_number = ?',
      [params.orderNumber]
    ) as any;
    conn.release();

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const order = rows[0];

    if (email && order.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email incorrect' }, { status: 403 });
    }

    return NextResponse.json({
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
      relay_point: order.relay_point ? JSON.parse(order.relay_point) : null,
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const { status, notes } = await req.json();
    const conn = await pool.getConnection();
    await conn.execute(
      'UPDATE orders SET status = ?, notes = ? WHERE order_number = ?',
      [status, notes ?? null, params.orderNumber]
    );
    conn.release();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
