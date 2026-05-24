import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

export function isGmailConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      (process.env.GMAIL_SENDER || process.env.GMAIL_USER)
  );
}

export function getGmailRedirectUri(): string {
  if (process.env.GMAIL_REDIRECT_URI) return process.env.GMAIL_REDIRECT_URI;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:5001';
  return `${base.replace(/\/$/, '')}/auth/google/callback`;
}

function getOAuth2Client(forContact = false) {
  const useContactClient =
    forContact &&
    process.env.CONTACT_GMAIL_CLIENT_ID &&
    process.env.CONTACT_GMAIL_CLIENT_SECRET;

  return new OAuth2Client(
    useContactClient ? process.env.CONTACT_GMAIL_CLIENT_ID : process.env.GMAIL_CLIENT_ID,
    useContactClient ? process.env.CONTACT_GMAIL_CLIENT_SECRET : process.env.GMAIL_CLIENT_SECRET,
    getGmailRedirectUri()
  );
}

export function getGmailAuthUrl(forContact = false): string {
  const client = getOAuth2Client(forContact);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    ...(forContact ? { state: 'contact' } : {}),
  });
}

export async function exchangeGmailCode(
  code: string,
  forContact = false
): Promise<{ refresh_token?: string | null }> {
  const client = getOAuth2Client(forContact);
  const { tokens } = await client.getToken(code);
  return { refresh_token: tokens.refresh_token };
}

/** Compte lookagraphy.order — commandes uniquement */
export type GmailOrdersAccount = 'orders';
/** Compte contact.lookagraphy — formulaire contact + newsletter */
export type GmailContactAccount = 'contact';

export type GmailSendOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  listUnsubscribe?: string;
  /** `orders` = GMAIL_* (lookagraphy.order) · `contact` = CONTACT_GMAIL_* (contact.lookagraphy) */
  account: GmailOrdersAccount | GmailContactAccount;
  fromSender?: string;
  fromName?: string;
  refreshToken?: string;
};

export function isContactGmailConfigured(): boolean {
  return Boolean(
    process.env.CONTACT_GMAIL_CLIENT_ID &&
      process.env.CONTACT_GMAIL_CLIENT_SECRET &&
      process.env.CONTACT_GMAIL_REFRESH_TOKEN &&
      process.env.CONTACT_GMAIL_SENDER
  );
}

export async function sendGmailMessage(options: GmailSendOptions): Promise<void> {
  const useContact = options.account === 'contact';

  const refreshToken =
    options.refreshToken ??
    (useContact ? process.env.CONTACT_GMAIL_REFRESH_TOKEN : process.env.GMAIL_REFRESH_TOKEN);
  const sender =
    options.fromSender ??
    (useContact ? process.env.CONTACT_GMAIL_SENDER : process.env.GMAIL_SENDER || process.env.GMAIL_USER);

  const clientId = useContact ? process.env.CONTACT_GMAIL_CLIENT_ID : process.env.GMAIL_CLIENT_ID;
  const clientSecret = useContact
    ? process.env.CONTACT_GMAIL_CLIENT_SECRET
    : process.env.GMAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret || !refreshToken || !sender) {
    const label = useContact ? 'CONTACT_GMAIL_* (contact.lookagraphy)' : 'GMAIL_* (lookagraphy.order)';
    throw new Error(`Gmail API non configurée — ${label}`);
  }

  const siteName = useContact
    ? (options.fromName ?? process.env.CONTACT_GMAIL_FROM_NAME ?? 'LookaGraphy')
    : (options.fromName ?? process.env.GMAIL_FROM_NAME ?? 'LookaGraphy');
  const client = getOAuth2Client(useContact);
  client.setCredentials({ refresh_token: refreshToken });

  const accessToken = await client.getAccessToken();
  const token = accessToken.token;
  if (!token) throw new Error('Impossible d\'obtenir un token Gmail');

  const subjectEncoded = `=?UTF-8?B?${Buffer.from(options.subject, 'utf8').toString('base64')}?=`;

  const rawMessage = [
    `From: ${siteName} <${sender}>`,
    `To: ${options.to}`,
    ...(options.replyTo ? [`Reply-To: ${options.replyTo}`] : []),
    ...(options.listUnsubscribe ? [`List-Unsubscribe: <${options.listUnsubscribe}>`] : []),
    `Subject: ${subjectEncoded}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(options.html, 'utf8').toString('base64'),
  ].join('\r\n');

  const encoded = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gmail API ${res.status}: ${detail}`);
  }
}
