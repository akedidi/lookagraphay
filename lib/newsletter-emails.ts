import { sendGmailMessage, isContactGmailConfigured } from '@/lib/gmail';
import type { NewsletterSubscriber } from '@/lib/newsletter';

const SITE_NAME = 'LookaGraphy';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lookagraphy.fr';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Texte brut → paragraphes HTML ; si balises déjà présentes, on conserve (admin). */
export function formatNewsletterBody(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n\n+/)
    .map((p) => `<p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1A1209;line-height:1.85;margin:0 0 1.25rem;">${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export function buildNewsletterHtml(input: {
  prenom?: string | null;
  bodyHtml: string;
  unsubscribeUrl: string;
}): string {
  const greeting = input.prenom?.trim()
    ? `Bonjour <strong>${esc(input.prenom.trim())}</strong>,`
    : 'Bonjour,';

  const content = `
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:rgba(61,43,31,0.75);line-height:1.7;margin:0 0 1.5rem;">
      ${greeting}
    </p>
    ${input.bodyHtml}
    <div style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(61,43,31,0.1);">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1A1209;line-height:1.7;margin:0 0 0.5rem;">
        À très bientôt,<br/>
        <em style="font-family:Georgia,serif;">Looka</em> — ${SITE_NAME}
      </p>
    </div>
    <div style="margin-top:2rem;padding:1rem 1.25rem;background:rgba(61,43,31,0.04);border:1px solid rgba(61,43,31,0.08);">
      <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(61,43,31,0.55);line-height:1.7;margin:0;">
        Vous recevez cet email car vous êtes inscrit·e à la lettre d'information LookaGraphy.
        <a href="${esc(input.unsubscribeUrl)}" style="color:#C9A84C;text-decoration:underline;">Se désabonner</a>
      </p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1A1209;padding:36px 40px;text-align:center;">
            <p style="font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#C9A84C;margin:0 0 10px;">Lettre d'information</p>
            <h1 style="font-weight:300;font-size:26px;color:#F5F0E8;margin:0;letter-spacing:4px;">${SITE_NAME}</h1>
            <div style="width:50px;height:1px;background:#C9A84C;margin:18px auto 0;"></div>
          </td>
        </tr>
        <tr><td style="background:#FAF7F2;padding:40px;">${content}</td></tr>
        <tr>
          <td style="background:#1A1209;padding:24px 40px;text-align:center;">
            <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(245,240,232,0.4);margin:0;">
              <a href="${SITE_URL}" style="color:#C9A84C;text-decoration:none;">${SITE_URL}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function unsubscribeUrl(token: string): string {
  return `${SITE_URL.replace(/\/$/, '')}/desabonnement?token=${encodeURIComponent(token)}`;
}

export async function sendNewsletterToSubscriber(
  subscriber: NewsletterSubscriber,
  subject: string,
  bodyHtml: string
): Promise<void> {
  const html = buildNewsletterHtml({
    prenom: subscriber.prenom,
    bodyHtml,
    unsubscribeUrl: unsubscribeUrl(subscriber.unsubscribe_token),
  });
  const url = unsubscribeUrl(subscriber.unsubscribe_token);

  await sendGmailMessage({
    to: subscriber.email,
    subject,
    html,
    listUnsubscribe: url,
    account: 'contact',
  });
}

export function isNewsletterEmailConfigured(): boolean {
  return isContactGmailConfigured();
}

export async function sendNewsletterCampaign(
  subscribers: NewsletterSubscriber[],
  subject: string,
  bodyText: string
): Promise<{ sent: number; failed: number }> {
  const bodyHtml = formatNewsletterBody(bodyText);
  let sent = 0;
  let failed = 0;

  if (!isNewsletterEmailConfigured()) {
    for (const s of subscribers) {
      console.log(`[NEWSLETTER PREVIEW] → ${s.email} | ${subject}`);
      sent++;
    }
    return { sent, failed };
  }

  for (const sub of subscribers) {
    try {
      await sendNewsletterToSubscriber(sub, subject, bodyHtml);
      sent++;
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      console.error('[NEWSLETTER] Erreur envoi', sub.email, err);
      failed++;
    }
  }

  return { sent, failed };
}
