import { NextRequest, NextResponse } from 'next/server';
import { getGmailAuthUrl, isGmailConfigured } from '@/lib/gmail';

/**
 * Démarre l'autorisation OAuth Gmail (une fois pour obtenir GMAIL_REFRESH_TOKEN).
 * En prod, définir GMAIL_OAUTH_SETUP_KEY et appeler :
 *   /api/auth/gmail?key=VOTRE_CLE_SECRETE
 */
export async function GET(req: NextRequest) {
  const setupKey = process.env.GMAIL_OAUTH_SETUP_KEY;
  const key = new URL(req.url).searchParams.get('key');

  if (setupKey && key !== setupKey) {
    return NextResponse.json({ error: 'Clé de configuration invalide' }, { status: 403 });
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'GMAIL_CLIENT_ID et GMAIL_CLIENT_SECRET requis' },
      { status: 500 }
    );
  }

  if (isGmailConfigured()) {
    return NextResponse.json({
      ok: true,
      message: 'Gmail déjà configuré (GMAIL_REFRESH_TOKEN présent). Pour reconnecter, supprimez le refresh token et réautorisez.',
    });
  }

  return NextResponse.redirect(getGmailAuthUrl());
}
