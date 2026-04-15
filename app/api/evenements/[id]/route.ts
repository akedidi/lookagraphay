import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { titre, date, heure, lieu, type, statut, description, images } = body;
    await pool.execute(
      'UPDATE evenements SET titre=?,date=?,heure=?,lieu=?,type=?,statut=?,description=?,images=? WHERE id=?',
      [titre, date || null, heure || null, lieu || null, type || 'Vernissage', statut || 'à venir', description || null, JSON.stringify(images || []), params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.execute('DELETE FROM evenements WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
