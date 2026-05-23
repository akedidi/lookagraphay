import { NextRequest, NextResponse } from 'next/server';

/**
 * Santé DB — en production, nécessite HEALTH_CHECK_SECRET (header ou ?secret=).
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.HEALTH_CHECK_SECRET;
    const provided =
      req.headers.get('x-health-secret') ??
      new URL(req.url).searchParams.get('secret') ??
      '';
    if (!secret || provided !== secret) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  try {
    const pool = (await import('@/lib/db')).default;
    await pool.execute('SELECT 1 as ok');
    return NextResponse.json({
      status: 'ok',
      db: 'connectée',
      env: process.env.NODE_ENV,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return NextResponse.json({ status: 'erreur', db: 'échec', error: message }, { status: 500 });
  }
}
