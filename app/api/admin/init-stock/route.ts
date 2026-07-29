import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Données de stock issues du document "collection_de_bijoux_stock".
 * Clé = fragment du titre (insensible à la casse), valeur = { or, argent }.
 * true = en stock, false = rupture momentanée.
 */
const STOCK_DATA: Array<{ pattern: string; or: boolean; argent: boolean }> = [
  { pattern: 'horria',          or: true,  argent: false }, // bague liberté horria
  { pattern: 'liberté',        or: true,  argent: false }, // bague liberté / boucle horria liberté
  { pattern: 'mahabba',        or: true,  argent: true  }, // bague mahabba (2 options dispo) — sera affiné ci-dessous
  { pattern: 'ichiq',          or: true,  argent: false }, // bague + boucles ichiq
  { pattern: 'chawq',          or: false, argent: false }, // bague chawq + boucle chawq
  { pattern: 'salam',          or: true,  argent: false }, // pendentif + boucle salam (bague salam → rupture totale, voir ci-dessous)
  { pattern: 'hob',            or: true,  argent: false }, // pendentif hob + boucle hob
  { pattern: 'holm',           or: false, argent: false }, // holm grand
];

// Règles spécifiques qui écrasent les règles génériques (matchées par titre complet)
const SPECIFIC_OVERRIDES: Array<{ pattern: string; or: boolean; argent: boolean }> = [
  { pattern: 'bague salam',    or: false, argent: false },
  { pattern: 'bague chawq',    or: false, argent: false },
  { pattern: 'bague mahaba',   or: false, argent: false },
  { pattern: 'bague mahabba',  or: true,  argent: true  },
];

function resolveStock(titre: string): { or: boolean; argent: boolean } | null {
  const lower = titre.toLowerCase();

  // Règles spécifiques en premier
  for (const rule of SPECIFIC_OVERRIDES) {
    if (lower.includes(rule.pattern)) {
      return { or: rule.or, argent: rule.argent };
    }
  }

  // Règles génériques
  for (const rule of STOCK_DATA) {
    if (lower.includes(rule.pattern)) {
      return { or: rule.or, argent: rule.argent };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const conn = await pool.getConnection();
  try {
    // Récupérer tous les bijoux (non-tableaux)
    const [rows] = (await conn.execute(
      `SELECT id, titre, categorie FROM store_items WHERE categorie IN ('Bague', 'Pendentif', 'Boucles d''oreilles')`
    )) as [{ id: number; titre: string; categorie: string }[], unknown];

    const results: { id: number; titre: string; stock: { or: boolean; argent: boolean } | null; updated: boolean }[] = [];

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
      message: `${results.filter(r => r.updated).length} bijoux mis à jour sur ${rows.length}`,
      results,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
