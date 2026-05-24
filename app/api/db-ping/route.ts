import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { resolveMysqlHost } from '@/lib/db-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Diagnostic MySQL public (sans mot de passe). */
export async function GET() {
  const rawHost = (process.env.DB_HOST ?? '').trim() || '(vide)';
  const effectiveHost = resolveMysqlHost();
  const config = {
    host: effectiveHost,
    database: process.env.DB_NAME?.trim() || null,
    user_set: Boolean(process.env.DB_USER?.trim()),
    password_set: Boolean(process.env.DB_PASSWORD),
    host_note:
      rawHost !== effectiveHost
        ? `DB_HOST distant (${rawHost}) → connexion via ${effectiveHost} sur le serveur Hostinger`
        : null,
  };

  const missing: string[] = [];
  if (!process.env.DB_USER?.trim()) missing.push('DB_USER');
  if (!process.env.DB_NAME?.trim()) missing.push('DB_NAME');
  if (!process.env.DB_PASSWORD) missing.push('DB_PASSWORD');
  if (missing.length) {
    return NextResponse.json(
      { ok: false, error: 'Variables manquantes', missing, config },
      { status: 500 }
    );
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [dbRows] = (await conn.execute('SELECT DATABASE() AS db')) as [
      { db: string | null }[],
      unknown,
    ];
    const [countRows] = (await conn.execute('SELECT COUNT(*) AS c FROM store_items')) as [
      { c: number }[],
      unknown,
    ];
    const store_count = Number(countRows[0]?.c ?? 0);
    return NextResponse.json({
      ok: true,
      database: dbRows[0]?.db ?? null,
      store_count,
      config,
      hint:
        store_count === 0
          ? 'Connexion OK mais catalogue vide — importez vos articles ou utilisez Init DB si la table est neuve.'
          : null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur MySQL';
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : null;
    console.error('[lookagraphy] /api/db-ping |', message, code ?? '');
    return NextResponse.json({ ok: false, error: message, code, config }, { status: 500 });
  } finally {
    conn?.release();
  }
}
