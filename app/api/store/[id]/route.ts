import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.execute('SELECT * FROM store_items WHERE id = ?', [params.id]) as any;
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const r = rows[0];
    return NextResponse.json({ ...r, images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images, disponible: r.disponible === 1 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { titre, sous_titre, categorie, description, citation, technique, dimensions, annee, prix, images, disponible, paypal_link, ordre } = body;
    await pool.execute(
      'UPDATE store_items SET titre=?,sous_titre=?,categorie=?,description=?,citation=?,technique=?,dimensions=?,annee=?,prix=?,images=?,disponible=?,paypal_link=?,ordre=? WHERE id=?',
      [titre, sous_titre || null, categorie || 'Tableau', description || null, citation || null, technique || null, dimensions || null, annee || null, prix || null, JSON.stringify(images || []), disponible ? 1 : 0, paypal_link || null, ordre || 0, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.execute('DELETE FROM store_items WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
