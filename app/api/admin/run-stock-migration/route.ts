import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Endpoint temporaire — sera supprimé après exécution
const MIGRATION_TOKEN = 'lookagraphy-stock-2026';

const SPECIFIC_OVERRIDES: Array<{ pattern: string; or: boolean; argent: boolean }> = [
  { pattern: 'bague salam',   or: false, argent: false },
  { pattern: 'bague chawq',   or: false, argent: false },
  { pattern: 'bague mahaba',  or: false, argent: false },
  { pattern: 'bague mahabba', or: true,  argent: true  },
];

const STOCK_DATA: Array<{ pattern: string; or: boolean; argent: boolean }> = [
  { pattern: 'horria',   or: true,  argent: false },
  { pattern: 'horrya',   or: true,  argent: false },
  { pattern: 'liberté',  or: true,  argent: false },
  { pattern: 'mahabba',  or: true,  argent: true  },
  { pattern: 'ichiq',    or: true,  argent: false },
  { pattern: 'chawq',    or: false, argent: false },
  { pattern: 'shawq',    or: false, argent: false },
  { pattern: 'salam',    or: true,  argent: false },
  { pattern: 'hob',      or: true,  argent: false },
  { pattern: 'holm',     or: false, argent: false },
];

function resolveStock(titre: string): { or: boolean; argent: boolean } | null {
  const lower = titre.toLowerCase();
  for (const rule of SPECIFIC_OVERRIDES) {
    if (lower.includes(rule.pattern)) return { or: rule.or, argent: rule.argent };
  }
  for (const rule of STOCK_DATA) {
    if (lower.includes(rule.pattern)) return { or: rule.or, argent: rule.argent };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (token !== MIGRATION_TOKEN) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = (await conn.execute(
      `SELECT id, titre FROM store_items WHERE categorie IN ('Bague', 'Pendentif', 'Boucles d''oreilles')`
    )) as [{ id: number; titre: string }[], unknown];

    const results = [];
    for (const row of rows) {
      const stock = resolveStock(row.titre);
      if (stock) {
        await conn.execute(
          `UPDATE store_items SET stock_options = ? WHERE id = ?`,
          [JSON.stringify(stock), row.id]
        );
        results.push({ id: row.id, titre: row.titre, stock, updated: true });
      } else {
        results.push({ id: row.id, titre: row.titre, stock: null, updated: false });
      }
    }

    return NextResponse.json({
      ok: true,
      updated: results.filter(r => r.updated).length,
      total: rows.length,
      results,
    });
  } finally {
    conn.release();
  }
}
