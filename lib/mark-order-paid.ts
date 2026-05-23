import pool from '@/lib/db';

export type MarkOrderPaidResult = 'not_found' | 'already_paid' | 'updated';

export async function markOrderPaid(
  orderNumber: string,
  opts?: { stripeSessionId?: string; stripePaymentIntentId?: string }
): Promise<MarkOrderPaidResult> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT status FROM orders WHERE order_number = ?',
      [orderNumber]
    ) as [{ status: string }[], unknown];

    if (rows.length === 0) return 'not_found';
    if (rows[0].status === 'paye') return 'already_paid';

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
    return 'updated';
  } finally {
    conn.release();
  }
}
