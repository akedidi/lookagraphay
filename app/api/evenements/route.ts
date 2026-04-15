import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM evenements ORDER BY id DESC') as any;
    const items = rows.map((r: any) => ({
      ...r,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
    }));
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titre, date, heure, lieu, type, statut, description, images } = body;
    const [result] = await pool.execute(
      'INSERT INTO evenements (titre,date,heure,lieu,type,statut,description,images) VALUES (?,?,?,?,?,?,?,?)',
      [titre, date || null, heure || null, lieu || null, type || 'Vernissage', statut || 'à venir', description || null, JSON.stringify(images || [])]
    ) as any;
    return NextResponse.json({ id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
