import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureNewsletterTables } from '@/lib/newsletter-schema';

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const campaignId = Number(id);
  if (!Number.isFinite(campaignId) || campaignId <= 0) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureNewsletterTables(conn);
    const [result] = await conn.execute('DELETE FROM newsletter_campaigns WHERE id = ?', [campaignId]) as [
      { affectedRows: number },
      unknown,
    ];
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Newsletter introuvable' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}

