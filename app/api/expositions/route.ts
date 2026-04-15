import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM expositions ORDER BY id DESC') as any;
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
    const { titre, lieu, dates, statut, description, image, images } = body;
    const [result] = await pool.execute(
      'INSERT INTO expositions (titre,lieu,dates,statut,description,image,images) VALUES (?,?,?,?,?,?,?)',
      [titre, lieu || null, dates || null, statut || 'passé', description || null, image || null, JSON.stringify(images || [])]
    ) as any;
    return NextResponse.json({ id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
