import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM store_items ORDER BY ordre ASC, id ASC') as any;
    const items = rows.map((r: any) => ({
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images,
      disponible: r.disponible === 1,
    }));
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titre, sous_titre, categorie, description, citation, technique, dimensions, annee, prix, images, disponible, paypal_link, ordre } = body;
    const [result] = await pool.execute(
      'INSERT INTO store_items (titre,sous_titre,categorie,description,citation,technique,dimensions,annee,prix,images,disponible,paypal_link,ordre) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [titre, sous_titre || null, categorie || 'Tableau', description || null, citation || null, technique || null, dimensions || null, annee || null, prix || null, JSON.stringify(images || []), disponible ? 1 : 0, paypal_link || null, ordre || 0]
    ) as any;
    return NextResponse.json({ id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
