import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { getActiveSubscribers } from '@/lib/newsletter';
import { ensureNewsletterTables } from '@/lib/newsletter-schema';
import { sendNewsletterCampaign, isNewsletterEmailConfigured } from '@/lib/newsletter-emails';

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const subject = String(body.subject ?? '').trim();
    const text = String(body.body ?? body.text ?? '').trim();
    const confirm = body.confirm === true;

    if (!subject || !text) {
      return NextResponse.json({ error: 'Objet et texte requis' }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      await ensureNewsletterTables(conn);
      const subscribers = await getActiveSubscribers(conn);

      if (subscribers.length === 0) {
        return NextResponse.json({ error: 'Aucun abonné actif' }, { status: 400 });
      }

      if (!confirm) {
        return NextResponse.json({
          preview: true,
          recipient_count: subscribers.length,
          configured: isNewsletterEmailConfigured(),
        });
      }

      const { sent, failed } = await sendNewsletterCampaign(subscribers, subject, text);

      await conn.execute(
        'INSERT INTO newsletter_campaigns (subject, body_html, sent_count, failed_count) VALUES (?, ?, ?, ?)',
        [subject, text, sent, failed]
      );

      return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
    } finally {
      conn.release();
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
