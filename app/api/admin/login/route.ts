import { NextRequest, NextResponse } from 'next/server';
import {
  setAdminSessionCookie,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    await setAdminSessionCookie(res);
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
