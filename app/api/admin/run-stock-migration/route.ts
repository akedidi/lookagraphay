import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Endpoint temporaire — sera supprimé après exécution
const MIGRATION_TOKEN = 'lookagraphy-stock-2026';

// Règles spécifiques par catégorie (écrasent les génériques)
const CATEGORY_OVERRIDES: Array<{ catPattern: string; titlePattern: string; or: boolean; argent: boolean }> = [
  { catPattern: 'bague',  titlePattern: 'salam',   or: false, argent: false },
  { catPattern: 'bague',  titlePattern: 'chawq',   or: false, argent: false },
  { catPattern: 'bague',  titlePattern: 'shawq',   or: false, argent: false },
  { catPattern: 'bague',  titlePattern: 'شوق',     or: false, argent: false },
  { catPattern: 'bague',  titlePattern: 'mahaba',  or: false, argent: false },
  { catPattern: 'bague',  titlePattern: 'mahabba', or: true,  argent: true  },
];

const STOCK_DATA: Array<{ pattern: string; or: boolean; argent: boolean }> = [
  { pattern: 'horria',   or: true,  argent: false },
  { pattern: 'horrya',   or: true,  argent: false },
  { pattern: 'حرية',    or: true,  argent: false },
  { pattern: 'liberté',  or: true,  argent: false },
  { pattern: 'mahabba',  or: true,  argent: true  },
  { pattern: 'ichiq',    or: true,  argent: false },
  { pattern: 'chawq',    or: false, argent: false },
  { pattern: 'شوق',     or: false, argent: false },
  { pattern: 'shawq',    or: false, argent: false },
  { pattern: 'salam',    or: true,  argent: false },
  { pattern: 'hob',      or: true,  argent: false },
  { pattern: 'holm',     or: false, argent: false },
];

function resolveStock(titre: string, categorie: string): { or: boolean; argent: boolean } | null {
  const lower = titre.toLowerCase();
  const lowerCat = categorie.toLowerCase();
  for (const rule of CATEGORY_OVERRIDES) {
    if (lowerCat.includes(rule.catPattern) && lower.includes(rule.titlePattern)) {
      return { or: rule.or, argent: rule.argent };
    }
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
      `SELECT id, titre, categorie FROM store_items WHERE categorie IN ('Bague', 'Pendentif', 'Boucles d''oreilles')`
    )) as [{ id: number; titre: string; categorie: string }[], unknown];

    const results = [];
    for (const row of rows) {
      const stock = resolveStock(row.titre, row.categorie);
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
