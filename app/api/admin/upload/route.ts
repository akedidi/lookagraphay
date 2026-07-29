import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'articles';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non supporté (jpeg, png, webp uniquement)' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo)' }, { status: 400 });
    }

    const validFolders = ['articles', 'expos', 'events'];
    const safeFolder = validFolders.includes(folder) ? folder : 'articles';

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Si UPLOAD_DIR est configuré (dossier persistant hors git), on l'utilise.
    // Sinon on tombe sur public/images/ (dev local uniquement).
    const uploadDir = process.env.UPLOAD_DIR;

    let publicPath: string;
    if (uploadDir) {
      const dir = path.join(uploadDir, safeFolder);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, safeName), buffer);
      publicPath = `/api/uploads/${safeFolder}/${safeName}`;
    } else {
      const dir = path.join(process.cwd(), 'public', 'images', safeFolder);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, safeName), buffer);
      publicPath = `/images/${safeFolder}/${safeName}`;
    }

    return NextResponse.json({ path: publicPath });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
