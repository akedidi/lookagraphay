import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM store_items ORDER BY ordre ASC, id ASC') as any;
    const items = rows.map((r: any) => ({
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
      disponible: r.disponible === 1,
      in_galerie: r.in_galerie === 1,
    }));
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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
    const [result] = await pool.execute(
      'INSERT INTO store_items (titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,images,disponible,paypal_link,ordre,style,extrait,in_galerie) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
      ]
    ) as any;
    return NextResponse.json({ id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
