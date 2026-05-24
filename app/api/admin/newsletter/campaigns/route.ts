import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureNewsletterTables } from '@/lib/newsletter-schema';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const conn = await pool.getConnection();
  try {
    await ensureNewsletterTables(conn);
    const [rows] = await conn.execute(
      'SELECT id, subject, sent_count, failed_count, created_at FROM newsletter_campaigns ORDER BY created_at DESC LIMIT 20'
    ) as [Record<string, unknown>[], unknown];
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
