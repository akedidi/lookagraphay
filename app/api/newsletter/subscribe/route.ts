import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { upsertNewsletterSubscriber } from '@/lib/newsletter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prenom = String(body.prenom ?? '').trim();
    const nom = String(body.nom ?? '').trim();
    const email = String(body.email ?? '').trim();

    if (!prenom || !nom || !email) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (prenom.length > 80 || nom.length > 80 || email.length > 254) {
      return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await upsertNewsletterSubscriber(conn, {
        email,
        prenom,
        nom,
        source: 'contact_sidebar',
        active: true,
      });
    } finally {
      conn.release();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[NEWSLETTER_SUBSCRIBE]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
