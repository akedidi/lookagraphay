import { randomBytes } from 'crypto';
import type { PoolConnection } from 'mysql2/promise';
import pool from '@/lib/db';
import { ensureNewsletterTables } from '@/lib/newsletter-schema';

export type NewsletterSubscriber = {
  id: number;
  email: string;
  prenom: string | null;
  nom: string | null;
  active: boolean;
  unsubscribe_token: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function newToken(): string {
  return randomBytes(32).toString('hex');
}

export async function upsertNewsletterSubscriber(
  conn: PoolConnection,
  input: {
    email: string;
    prenom?: string | null;
    nom?: string | null;
    source?: string;
    active?: boolean;
  }
): Promise<void> {
  await ensureNewsletterTables(conn);
  const email = normalizeEmail(input.email);
  if (!email || !email.includes('@')) return;

  const prenom = input.prenom?.trim() || null;
  const nom = input.nom?.trim() || null;
  const source = input.source ?? 'checkout';
  const wantActive = input.active !== false;

  const [rows] = await conn.execute(
    'SELECT id, active, unsubscribe_token FROM newsletter_subscribers WHERE email = ?',
    [email]
  ) as [{ id: number; active: number; unsubscribe_token: string }[], unknown];

  if (rows.length === 0) {
    await conn.execute(
      `INSERT INTO newsletter_subscribers (email, prenom, nom, active, unsubscribe_token, source)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, prenom, nom, wantActive ? 1 : 0, newToken(), source]
    );
    return;
  }

  const row = rows[0];
  if (wantActive) {
    await conn.execute(
      `UPDATE newsletter_subscribers SET
        prenom = COALESCE(?, prenom),
        nom = COALESCE(?, nom),
        active = 1,
        unsubscribed_at = NULL,
        source = ?
       WHERE id = ?`,
      [prenom, nom, source, row.id]
    );
  } else {
    await conn.execute(
      `UPDATE newsletter_subscribers SET
        prenom = COALESCE(?, prenom),
        nom = COALESCE(?, nom)
       WHERE id = ?`,
      [prenom, nom, row.id]
    );
  }
}

export async function listNewsletterSubscribers(conn: PoolConnection): Promise<NewsletterSubscriber[]> {
  await ensureNewsletterTables(conn);
  const [rows] = await conn.execute(
    'SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC'
  ) as [Record<string, unknown>[], unknown];

  return rows.map((r) => ({
    id: Number(r.id),
    email: String(r.email),
    prenom: r.prenom ? String(r.prenom) : null,
    nom: r.nom ? String(r.nom) : null,
    active: r.active === 1 || r.active === true,
    unsubscribe_token: String(r.unsubscribe_token),
    source: String(r.source ?? ''),
    subscribed_at: String(r.subscribed_at),
    unsubscribed_at: r.unsubscribed_at ? String(r.unsubscribed_at) : null,
  }));
}

export async function setSubscriberActive(
  conn: PoolConnection,
  id: number,
  active: boolean
): Promise<boolean> {
  await ensureNewsletterTables(conn);
  const [result] = await conn.execute(
    `UPDATE newsletter_subscribers SET
      active = ?,
      unsubscribed_at = IF(?, NULL, NOW())
     WHERE id = ?`,
    [active ? 1 : 0, active ? 1 : 0, id]
  ) as [{ affectedRows: number }, unknown];
  return result.affectedRows > 0;
}

export async function unsubscribeByToken(token: string): Promise<'ok' | 'not_found'> {
  const conn = await pool.getConnection();
  try {
    await ensureNewsletterTables(conn);
    const [result] = await conn.execute(
      `UPDATE newsletter_subscribers SET active = 0, unsubscribed_at = NOW() WHERE unsubscribe_token = ? AND active = 1`,
      [token.trim()]
    ) as [{ affectedRows: number }, unknown];
    if (result.affectedRows > 0) return 'ok';
    const [rows] = await conn.execute(
      'SELECT id FROM newsletter_subscribers WHERE unsubscribe_token = ?',
      [token.trim()]
    ) as [{ id: number }[], unknown];
    return rows.length > 0 ? 'ok' : 'not_found';
  } finally {
    conn.release();
  }
}

export async function getActiveSubscribers(conn: PoolConnection): Promise<NewsletterSubscriber[]> {
  const all = await listNewsletterSubscribers(conn);
  return all.filter((s) => s.active);
}
