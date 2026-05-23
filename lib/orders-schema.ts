import type { PoolConnection } from 'mysql2/promise';

async function addColumnIfMissing(
  conn: PoolConnection,
  existing: Set<string>,
  field: string,
  definition: string
): Promise<void> {
  if (!existing.has(field)) {
    await conn.execute(`ALTER TABLE orders ADD COLUMN ${field} ${definition}`);
  }
}

export async function ensureOrderColumns(conn: PoolConnection): Promise<void> {
  const [cols] = await conn.execute('SHOW COLUMNS FROM orders') as [{ Field: string }[], unknown];
  const existing = new Set(cols.map((c) => c.Field));

  await addColumnIfMissing(conn, existing, 'stripe_session_id', 'VARCHAR(255) NULL AFTER notes');
  await addColumnIfMissing(conn, existing, 'stripe_payment_intent_id', 'VARCHAR(255) NULL AFTER stripe_session_id');
  await addColumnIfMissing(conn, existing, 'carrier', 'VARCHAR(100) NULL AFTER stripe_payment_intent_id');
  await addColumnIfMissing(conn, existing, 'tracking_number', 'VARCHAR(100) NULL AFTER carrier');
  await addColumnIfMissing(conn, existing, 'tracking_url', 'VARCHAR(500) NULL AFTER tracking_number');
  await addColumnIfMissing(conn, existing, 'shipped_at', 'TIMESTAMP NULL AFTER tracking_url');
  await addColumnIfMissing(conn, existing, 'delivered_at', 'TIMESTAMP NULL AFTER shipped_at');
  await addColumnIfMissing(conn, existing, 'pays_residence', 'VARCHAR(100) NULL AFTER telephone');
  await addColumnIfMissing(conn, existing, 'admin_notes', 'TEXT NULL AFTER notes');
}

/** @deprecated use ensureOrderColumns */
export const ensureStripeOrderColumns = ensureOrderColumns;
