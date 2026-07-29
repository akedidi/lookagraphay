import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const TOKEN = 'lookagraphy-patch-2026';

const PATCHES: Array<{ id: number; images: string[] }> = [
  // Salam — سلام (grande taille 7.7cm) — Boucles d'oreilles
  { id: 20, images: [
    '/images/articles/salam-bo-3.png',
    '/images/articles/salam-bo-1.jpeg',
    '/images/articles/salam-bo-2.jpeg',
    '/images/articles/salam-bo-or.jpeg',
  ]},
  // Salam — سلام (taille moyenne 5.5cm) — Boucles d'oreilles
  { id: 24, images: [
    '/images/articles/salam-bo-3.png',
    '/images/articles/salam-bo-1.jpeg',
    '/images/articles/salam-bo-2.jpeg',
  ]},
  // Salam- paix — Pendentif
  { id: 23, images: [
    '/images/articles/salam-bo-3.png',
    '/images/articles/salam-bo-1.jpeg',
  ]},
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
  }
  const conn = await pool.getConnection();
  try {
    const results = [];
    for (const p of PATCHES) {
      await conn.execute(
        `UPDATE store_items SET images = ? WHERE id = ?`,
        [JSON.stringify(p.images), p.id]
      );
      results.push({ id: p.id, updated: true });
    }
    return NextResponse.json({ ok: true, results });
  } finally {
    conn.release();
  }
}
