import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { ensureStoreColumns } from '@/lib/store-schema';
import { fromDatetimeLocalValue, mapStoreItemFromRow } from '@/lib/store-item';

function promoParams(body: Record<string, unknown>) {
  const enabled = Boolean(body.promo_enabled);
  const type =
    body.promo_type === 'percent' || body.promo_type === 'amount' ? body.promo_type : null;
  const raw =
    body.promo_value != null && String(body.promo_value).trim() !== ''
      ? Number(body.promo_value)
      : null;
  const value =
    raw != null && Number.isFinite(raw) && raw > 0 ? raw : null;
  return {
    enabled: enabled ? 1 : 0,
    type: enabled && type ? type : null,
    value: enabled && type && value != null ? value : null,
    start: enabled ? fromDatetimeLocalValue(body.promo_start as string) : null,
    end: enabled ? fromDatetimeLocalValue(body.promo_end as string) : null,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const conn = await pool.getConnection();
  try {
    await ensureStoreColumns(conn);
    const [rows] = (await conn.execute('SELECT * FROM store_items WHERE id = ?', [
      params.id,
    ])) as [Record<string, unknown>[], unknown];
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(mapStoreItemFromRow(rows[0]));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      stock_options,
    } = body;
    const promo = promoParams(body);
    const stockJson = stock_options ? JSON.stringify(stock_options) : null;

    const conn = await pool.getConnection();
    try {
      await ensureStoreColumns(conn);
      await conn.execute(
      `UPDATE store_items SET
        titre=?,sous_titre=?,categorie=?,description=?,citation=?,technique=?,dimensions=?,annee=?,prix=?,
        images=?,disponible=?,paypal_link=?,ordre=?,style=?,extrait=?,in_galerie=?,
        promo_enabled=?,promo_type=?,promo_value=?,promo_start=?,promo_end=?,stock_options=?
       WHERE id=?`,
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
        stockJson,
        params.id,
      ]
      );
    } finally {
      conn.release();
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    await pool.execute('DELETE FROM store_items WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
