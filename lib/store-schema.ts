import type { PoolConnection } from 'mysql2/promise';

async function addColumnIfMissing(
  conn: PoolConnection,
  existing: Set<string>,
  field: string,
  definition: string
): Promise<void> {
  if (!existing.has(field)) {
    await conn.execute(`ALTER TABLE store_items ADD COLUMN ${field} ${definition}`);
  }
}

/** Colonnes galerie (œuvres exposées = articles store avec in_galerie). */
export async function ensureStoreColumns(conn: PoolConnection): Promise<void> {
  const [cols] = (await conn.execute('SHOW COLUMNS FROM store_items')) as [
    { Field: string }[],
    unknown,
  ];
  const existing = new Set(cols.map((c) => c.Field));

  await addColumnIfMissing(conn, existing, 'style', "VARCHAR(120) DEFAULT 'Calligraphie contemporaine' AFTER citation");
  await addColumnIfMissing(conn, existing, 'extrait', 'VARCHAR(255) NULL AFTER style');
  await addColumnIfMissing(conn, existing, 'in_galerie', 'TINYINT(1) DEFAULT 0 AFTER extrait');
  await addColumnIfMissing(conn, existing, 'promo_enabled', 'TINYINT(1) DEFAULT 0 AFTER in_galerie');
  await addColumnIfMissing(
    conn,
    existing,
    'promo_type',
    "ENUM('percent','amount') NULL AFTER promo_enabled"
  );
  await addColumnIfMissing(conn, existing, 'promo_value', 'DECIMAL(10,2) NULL AFTER promo_type');
  await addColumnIfMissing(conn, existing, 'promo_start', 'DATETIME NULL AFTER promo_value');
  await addColumnIfMissing(conn, existing, 'promo_end', 'DATETIME NULL AFTER promo_start');
  await addColumnIfMissing(conn, existing, 'stock_options', 'JSON NULL AFTER promo_end');
}
