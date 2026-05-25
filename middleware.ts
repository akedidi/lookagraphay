import { NextRequest, NextResponse } from 'next/server';
import { apiRouteRequiresAdmin, isAdminAuthenticated } from '@/lib/admin-auth';

/** Empêche le CDN Hostinger de garder un HTML obsolète (mauvais hashes CSS/JS sur la home). */
function withNoDocumentCache(res: NextResponse) {
  res.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  res.headers.set('Surrogate-Control', 'no-store');
  res.headers.set('X-LiteSpeed-Cache-Control', 'no-cache');
  res.headers.set('CDN-Cache-Control', 'no-store');
  return res;
}

function isHtmlDocumentRequest(pathname: string, method: string) {
  if (method !== 'GET' && method !== 'HEAD') return false;
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) return false;
  if (/\.(ico|png|jpe?g|gif|webp|svg|mp4|webm|woff2?|css|js)$/i.test(pathname)) return false;
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (apiRouteRequiresAdmin(pathname, method)) {
    if (!(await isAdminAuthenticated(req))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isHtmlDocumentRequest(pathname, method)) {
    return withNoDocumentCache(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/api/admin/:path*',
    '/api/orders',
    '/api/orders/:path*',
    '/api/store',
    '/api/store/:path*',
    '/api/expositions',
    '/api/expositions/:path*',
    '/api/evenements',
    '/api/evenements/:path*',
  ],
};
