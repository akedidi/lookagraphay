import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/emails';
import { getContactMotifLabel, isValidContactMotif } from '@/lib/contact-motifs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? '').trim();
    const email = String(body.email ?? '').trim();
    const motif = String(body.motif ?? '').trim();
    const message = String(body.message ?? '').trim();

    if (!nom || !email || !motif || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    if (nom.length > 120 || email.length > 254 || message.length > 5000) {
      return NextResponse.json({ error: 'Un ou plusieurs champs sont trop longs.' }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    if (!isValidContactMotif(motif)) {
      return NextResponse.json({ error: 'Motif invalide.' }, { status: 400 });
    }

    const motifLabel = getContactMotifLabel(motif)!;
    const sent = await sendContactFormEmail({ nom, email, motif, motifLabel, message });

    if (!sent) {
      return NextResponse.json(
        { error: "Impossible d'envoyer le message pour le moment. Réessayez plus tard." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
