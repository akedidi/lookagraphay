import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendContactFormEmail } from '@/lib/emails';
import { getContactMotifLabel, isValidContactMotif } from '@/lib/contact-motifs';
import { upsertNewsletterSubscriber } from '@/lib/newsletter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prenom = String(body.prenom ?? '').trim();
    const nom = String(body.nom ?? '').trim();
    const email = String(body.email ?? '').trim();
    const motif = String(body.motif ?? '').trim();
    const message = String(body.message ?? '').trim();
    const newsletterOptIn = body.newsletter_opt_in === true;

    if (!prenom || !nom || !email || !motif || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (
      prenom.length > 80 ||
      nom.length > 80 ||
      email.length > 254 ||
      message.length > 5000
    ) {
      return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    if (!isValidContactMotif(motif)) {
      return NextResponse.json({ error: 'Motif invalide.' }, { status: 400 });
    }

    const motifLabel = getContactMotifLabel(motif)!;
    const sent = await sendContactFormEmail({
      prenom,
      nom,
      email,
      motif,
      motifLabel,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Impossible d'envoyer le message pour le moment. Réessayez plus tard." },
        { status: 503 }
      );
    }

    if (newsletterOptIn) {
      const conn = await pool.getConnection();
      try {
        await upsertNewsletterSubscriber(conn, {
          email,
          prenom,
          nom,
          source: 'contact',
          active: true,
        });
      } finally {
        conn.release();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
