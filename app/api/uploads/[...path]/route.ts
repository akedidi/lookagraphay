import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Sert les fichiers uploadés depuis UPLOAD_DIR (dossier persistant hors git).
 * URL format : /api/uploads/articles/filename.jpg
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const uploadDir = process.env.UPLOAD_DIR;
  if (!uploadDir) {
    return new NextResponse('UPLOAD_DIR non configuré', { status: 404 });
  }

  const filePath = params.path.join('/');
  // Sécurité : empêcher path traversal
  const resolved = path.resolve(uploadDir, filePath);
  if (!resolved.startsWith(path.resolve(uploadDir))) {
    return new NextResponse('Interdit', { status: 403 });
  }

  try {
    const buffer = await readFile(resolved);
    const ext = resolved.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME[ext] ?? 'application/octet-stream';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Fichier introuvable', { status: 404 });
  }
}
