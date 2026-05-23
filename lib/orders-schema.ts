import type { PoolConnection } from 'mysql2/promise';

export async function ensureStripeOrderColumns(conn: PoolConnection): Promise<void> {
  const [cols] = await conn.execute(
    `SHOW COLUMNS FROM orders WHERE Field IN ('stripe_session_id', 'stripe_payment_intent_id')`
  ) as [{ Field: string }[], unknown];

  const existing = new Set(cols.map((c) => c.Field));
  if (!existing.has('stripe_session_id')) {
    await conn.execute(
      'ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER notes'
    );
  }
  if (!existing.has('stripe_payment_intent_id')) {
    await conn.execute(
      'ALTER TABLE orders ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER stripe_session_id'
    );
  }
}
