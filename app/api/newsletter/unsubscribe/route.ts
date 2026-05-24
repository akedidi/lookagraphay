import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeByToken } from '@/lib/newsletter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token ?? '').trim();
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }
    const result = await unsubscribeByToken(token);
    if (result === 'not_found') {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
