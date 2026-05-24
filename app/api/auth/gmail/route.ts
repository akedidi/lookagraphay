import { NextRequest, NextResponse } from 'next/server';
import { getGmailAuthUrl, isGmailConfigured, isContactGmailConfigured } from '@/lib/gmail';

/**
 * OAuth Gmail — 2 comptes, 2 clés setup distinctes :
 * - lookagraphy.order : /api/auth/gmail?key=GMAIL_OAUTH_SETUP_KEY
 * - contact.lookagraphy : /api/auth/gmail?key=CONTACT_GMAIL_OAUTH_SETUP_KEY&contact=1
 */
export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  const params = new URL(req.url).searchParams;
  const forContact = params.get('contact') === '1' || params.get('newsletter') === '1';

  const setupKey = (
    forContact ? process.env.CONTACT_GMAIL_OAUTH_SETUP_KEY : process.env.GMAIL_OAUTH_SETUP_KEY
  )?.trim();
  const providedKey = key?.trim();

  if (forContact && !setupKey) {
    return NextResponse.json(
      {
        error:
          'CONTACT_GMAIL_OAUTH_SETUP_KEY absente sur le serveur. Ajoutez-la dans Hostinger et redéployez (code récent requis).',
      },
      { status: 500 }
    );
  }

  if (setupKey && providedKey !== setupKey) {
    return NextResponse.json(
      {
        error: forContact
          ? 'Clé invalide : utilisez la valeur exacte de CONTACT_GMAIL_OAUTH_SETUP_KEY (pas GMAIL_OAUTH_SETUP_KEY).'
          : 'Clé invalide : utilisez la valeur exacte de GMAIL_OAUTH_SETUP_KEY.',
      },
      { status: 403 }
    );
  }

  if (forContact) {
    if (!process.env.CONTACT_GMAIL_CLIENT_ID || !process.env.CONTACT_GMAIL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'CONTACT_GMAIL_CLIENT_ID et CONTACT_GMAIL_CLIENT_SECRET requis' },
        { status: 500 }
      );
    }
    if (isContactGmailConfigured()) {
      return NextResponse.json({
        ok: true,
        message:
          'Contact/newsletter déjà configuré (CONTACT_GMAIL_REFRESH_TOKEN présent). Supprimez le token et réautorisez pour reconnecter.',
      });
    }
  } else {
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'GMAIL_CLIENT_ID et GMAIL_CLIENT_SECRET requis' },
        { status: 500 }
      );
    }
    if (isGmailConfigured()) {
      return NextResponse.json({
        ok: true,
        message:
          'Gmail commandes déjà configuré (GMAIL_REFRESH_TOKEN présent). Supprimez le refresh token et réautorisez pour reconnecter.',
      });
    }
  }

  return NextResponse.redirect(getGmailAuthUrl(forContact));
}
