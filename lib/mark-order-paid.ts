import pool from '@/lib/db';

export async function markOrderPaid(
  orderNumber: string,
  opts?: { stripeSessionId?: string; stripePaymentIntentId?: string }
): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT status FROM orders WHERE order_number = ?',
      [orderNumber]
    ) as [{ status: string }[], unknown];

    if (rows.length === 0) return false;
    if (rows[0].status === 'paye') return true;

    await conn.execute(
      `UPDATE orders SET
        status = 'paye',
        stripe_session_id = COALESCE(?, stripe_session_id),
        stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id)
       WHERE order_number = ?`,
      [
        opts?.stripeSessionId ?? null,
        opts?.stripePaymentIntentId ?? null,
        orderNumber,
      ]
    );
    return true;
  } finally {
    conn.release();
  }
}
