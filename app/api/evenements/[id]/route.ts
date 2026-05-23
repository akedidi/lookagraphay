import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    await pool.execute('DELETE FROM evenements WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
