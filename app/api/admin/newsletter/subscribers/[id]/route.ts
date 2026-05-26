import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { setSubscriberActive } from '@/lib/newsletter';
import { ensureNewsletterTables } from '@/lib/newsletter-schema';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    const body = await req.json();
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'active (boolean) requis' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      const ok = await setSubscriberActive(conn, id, body.active);
      if (!ok) {
        return NextResponse.json({ error: 'Abonné introuvable' }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureNewsletterTables(conn);
    const [result] = await conn.execute(
      'DELETE FROM newsletter_subscribers WHERE id = ?',
      [id]
    ) as [{ affectedRows: number }, unknown];

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Abonné introuvable' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
