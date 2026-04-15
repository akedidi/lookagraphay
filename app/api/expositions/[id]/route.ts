import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { titre, lieu, dates, statut, description, image, images } = body;
    await pool.execute(
      'UPDATE expositions SET titre=?,lieu=?,dates=?,statut=?,description=?,image=?,images=? WHERE id=?',
      [titre, lieu || null, dates || null, statut || 'passé', description || null, image || null, JSON.stringify(images || []), params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.execute('DELETE FROM expositions WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
