import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { apparelSeedPayload, APPAREL_SEED_ITEMS } from '@/lib/apparel-seed';
import { ensureStoreColumns } from '@/lib/store-schema';

/** Importe la collection vêtements (idempotent : ignore les titres déjà présents). */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const conn = await pool.getConnection();
  try {
    await ensureStoreColumns(conn);

    let inserted = 0;
    let skipped = 0;

    for (const item of APPAREL_SEED_ITEMS) {
      const [existing] = (await conn.execute(
        'SELECT id FROM store_items WHERE titre = ? LIMIT 1',
        [item.titre]
      )) as [{ id: number }[], unknown];

      if (existing.length > 0) {
        skipped += 1;
        continue;
      }

      const p = apparelSeedPayload(item);
      await conn.execute(
        `INSERT INTO store_items (
          titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,
          images,disponible,paypal_link,ordre,style,extrait,in_galerie,
          promo_enabled,promo_type,promo_value,promo_start,promo_end,stock_options,apparel_options
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.titre,
          p.sous_titre,
          p.categorie,
          p.description,
          p.citation,
          p.technique,
          p.dimensions,
          p.annee,
          p.prix,
          JSON.stringify(p.images),
          1,
          p.paypal_link,
          p.ordre,
          p.style,
          p.extrait,
          0,
          0,
          null,
          null,
          null,
          null,
          null,
          JSON.stringify(p.apparel_options),
        ]
      );
      inserted += 1;
    }

    return NextResponse.json({
      ok: true,
      inserted,
      skipped,
      total: APPAREL_SEED_ITEMS.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}
