import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    DB_HOST: process.env.DB_HOST || '(manquant)',
    DB_NAME: process.env.DB_NAME || '(manquant)',
    DB_USER: process.env.DB_USER || '(manquant)',
    DB_PASSWORD: process.env.DB_PASSWORD ? '(défini)' : '(manquant)',
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const pool = (await import('@/lib/db')).default;
    const [rows] = await pool.execute('SELECT 1 as ok') as any;
    return NextResponse.json({ status: 'ok', db: 'connectée', config, test: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ status: 'erreur', db: 'échec', config, error: e.message }, { status: 500 });
  }
}
