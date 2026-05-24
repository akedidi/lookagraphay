import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { listNewsletterSubscribers, upsertNewsletterSubscriber } from '@/lib/newsletter';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const conn = await pool.getConnection();
  try {
    const subscribers = await listNewsletterSubscribers(conn);
    return NextResponse.json(subscribers);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const email = String(body.email ?? '').trim();
    const prenom = body.prenom ? String(body.prenom).trim() : null;
    const nom = body.nom ? String(body.nom).trim() : null;
    const active = body.active !== false;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await upsertNewsletterSubscriber(conn, {
        email,
        prenom,
        nom,
        source: 'admin',
        active,
      });
      const subscribers = await listNewsletterSubscribers(conn);
      return NextResponse.json({ ok: true, subscribers });
    } finally {
      conn.release();
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
