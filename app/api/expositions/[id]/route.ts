import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    await pool.execute('DELETE FROM expositions WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
