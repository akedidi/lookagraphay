import { NextRequest, NextResponse } from 'next/server';
import { exchangeGmailCode } from '@/lib/gmail';

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code');
  const error = new URL(req.url).searchParams.get('error');

  if (error) {
    return htmlResponse(
      `<h1>Autorisation refusée</h1><p>${error}</p>`,
      400
    );
  }

  if (!code) {
    return htmlResponse('<h1>Code manquant</h1><p>Relancez la connexion Gmail.</p>', 400);
  }

  try {
    const { refresh_token } = await exchangeGmailCode(code);

    if (!refresh_token) {
      return htmlResponse(
        `<h1>Pas de refresh token</h1>
        <p>Révoquez l'accès dans <a href="https://myaccount.google.com/permissions">votre compte Google</a>, puis reconnectez-vous via <code>/api/auth/gmail</code> (consent forcé).</p>`,
        400
      );
    }

    return htmlResponse(
      `<h1>Gmail connecté</h1>
      <p>Copiez cette valeur dans <strong>GMAIL_REFRESH_TOKEN</strong> sur Hostinger (et <code>.env.local</code>) :</p>
      <pre style="background:#1A1209;color:#C9A84C;padding:1rem;overflow:auto;word-break:break-all;">${refresh_token}</pre>
      <p style="margin-top:1.5rem;font-size:0.9rem;color:#666;">Ne partagez pas ce token. Supprimez cette page de l'historique après copie.</p>`,
      200
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur OAuth';
    return htmlResponse(`<h1>Erreur</h1><pre>${message}</pre>`, 500);
  }
}

function htmlResponse(body: string, status: number) {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>LookaGraphy — Gmail</title></head>
<body style="font-family:Georgia,serif;max-width:640px;margin:3rem auto;padding:0 1rem;color:#1A1209;">${body}</body></html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
