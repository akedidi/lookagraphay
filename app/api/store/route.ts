import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { fromDatetimeLocalValue, mapStoreItemFromRow } from '@/lib/store-item';

function promoParams(body: Record<string, unknown>) {
  const enabled = Boolean(body.promo_enabled);
  const type =
    body.promo_type === 'percent' || body.promo_type === 'amount' ? body.promo_type : null;
  const value =
    body.promo_value != null && String(body.promo_value).trim() !== ''
      ? Number(body.promo_value)
      : null;
  return {
    enabled: enabled ? 1 : 0,
    type: enabled && type ? type : null,
    value: enabled && type && value != null && !Number.isNaN(value) ? value : null,
    start: enabled ? fromDatetimeLocalValue(body.promo_start as string) : null,
    end: enabled ? fromDatetimeLocalValue(body.promo_end as string) : null,
  };
}

export async function GET() {
  try {
    const [rows] = (await pool.execute(
      'SELECT * FROM store_items ORDER BY ordre ASC, id ASC'
    )) as [Record<string, unknown>[], unknown];
    return NextResponse.json(rows.map(mapStoreItemFromRow));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const {
      titre,
      sous_titre,
      categorie,
      description,
      citation,
      technique,
      dimensions,
      annee,
      prix,
      images,
      disponible,
      paypal_link,
      ordre,
      style,
      extrait,
      in_galerie,
    } = body;
    const promo = promoParams(body);

    const [result] = await pool.execute(
      `INSERT INTO store_items (
        titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,
        images,disponible,paypal_link,ordre,style,extrait,in_galerie,
        promo_enabled,promo_type,promo_value,promo_start,promo_end
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        titre,
        sous_titre || null,
        categorie || 'Tableau',
        description || null,
        citation || null,
        technique || null,
        dimensions || null,
        annee || null,
        prix || null,
        JSON.stringify(images || []),
        disponible ? 1 : 0,
        paypal_link || null,
        ordre || 0,
        style || 'Calligraphie contemporaine',
        extrait || null,
        in_galerie ? 1 : 0,
        promo.enabled,
        promo.type,
        promo.value,
        promo.start,
        promo.end,
      ]
    ) as [{ insertId: number }, unknown];

    return NextResponse.json({ id: result.insertId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
