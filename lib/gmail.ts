import { google } from 'googleapis';

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

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    getGmailRedirectUri()
  );
}

export function getGmailAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

export async function exchangeGmailCode(code: string): Promise<{ refresh_token?: string | null }> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return { refresh_token: tokens.refresh_token };
}

export async function sendGmailMessage(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!isGmailConfigured()) {
    throw new Error('Gmail API non configurée (variables GMAIL_* manquantes)');
  }

  const sender = (process.env.GMAIL_SENDER || process.env.GMAIL_USER)!;
  const siteName = process.env.GMAIL_FROM_NAME ?? 'LookaGraphy';
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth: client });
  const subjectEncoded = `=?UTF-8?B?${Buffer.from(options.subject, 'utf8').toString('base64')}?=`;

  const rawMessage = [
    `From: ${siteName} <${sender}>`,
    `To: ${options.to}`,
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

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });
}
