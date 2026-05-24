import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { mapStoreRowToGalerieOeuvre } from '@/lib/galerie';
import { ensureStoreColumns } from '@/lib/store-schema';

export const dynamic = 'force-dynamic';

/**
 * Galerie = articles store avec in_galerie = 1 (gérés dans /admin → Store).
 * Source unique avec la boutique ; voir README « Données ».
 */
export async function GET() {
  const conn = await pool.getConnection();
  try {
    await ensureStoreColumns(conn);
    const [rows] = (await conn.execute(
      `SELECT * FROM store_items
       WHERE in_galerie = 1
       ORDER BY ordre ASC, id ASC`
    )) as [Record<string, unknown>[], unknown];

    const oeuvres = rows.map(mapStoreRowToGalerieOeuvre);
    return NextResponse.json(oeuvres);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
