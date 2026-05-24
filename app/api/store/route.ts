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

export async function GET() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS store_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(500) NOT NULL,
        sous_titre VARCHAR(500),
        categorie VARCHAR(100) DEFAULT 'Tableau',
        description TEXT,
        citation TEXT,
        technique VARCHAR(500),
        dimensions VARCHAR(200),
        annee VARCHAR(10),
        prix DECIMAL(10,2),
        images JSON,
        disponible TINYINT(1) DEFAULT 1,
        paypal_link VARCHAR(500),
        ordre INT DEFAULT 0,
        style VARCHAR(120) DEFAULT 'Calligraphie contemporaine',
        extrait VARCHAR(255),
        in_galerie TINYINT(1) DEFAULT 0,
        promo_enabled TINYINT(1) DEFAULT 0,
        promo_type ENUM('percent','amount') NULL,
        promo_value DECIMAL(10,2) NULL,
        promo_start DATETIME NULL,
        promo_end DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await ensureStoreColumns(conn);
    const [rows] = (await conn.execute(
      'SELECT * FROM store_items ORDER BY ordre ASC, id ASC'
    )) as [Record<string, unknown>[], unknown];
    return NextResponse.json(rows.map(mapStoreItemFromRow));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    const code =
      e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : null;
    console.error('[lookagraphy] GET /api/store |', message, code ?? '');
    return NextResponse.json({ error: message, code }, { status: 500 });
  } finally {
    conn?.release();
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

    const conn = await pool.getConnection();
    try {
      await ensureStoreColumns(conn);
      const [result] = await conn.execute(
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
    } finally {
      conn.release();
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
