import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { APPAREL_SEED_ITEMS, ensureApparelSeedItems } from '@/lib/apparel-seed';
import { ensureStoreColumns } from '@/lib/store-schema';

/** Importe la collection vêtements (idempotent : ignore les titres déjà présents). */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const conn = await pool.getConnection();
  try {
    await ensureStoreColumns(conn);
    const { inserted, updated, skipped } = await ensureApparelSeedItems(conn);
    return NextResponse.json({
      ok: true,
      inserted,
      updated,
      skipped,
      total: APPAREL_SEED_ITEMS.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
