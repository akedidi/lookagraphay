import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const TOKEN = 'lookagraphy-patch-2026';

// Liste des mises à jour d'images à appliquer
const PATCHES: Array<{ id: number; images: string[] }> = [
  { id: 21, images: ['/images/articles/mahabba-amour-universel-bo.png'] },
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
      results.push({ id: p.id, images: p.images, updated: true });
    }
    return NextResponse.json({ ok: true, results });
  } finally {
    conn.release();
  }
}
