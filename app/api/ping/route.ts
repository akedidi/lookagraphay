import { NextResponse } from 'next/server';

/** Santé légère (sans DB) — utile pour vérifier que Node répond derrière le proxy Hostinger. */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    ts: new Date().toISOString(),
  });
}

export const dynamic = 'force-dynamic';
