import { NextRequest, NextResponse } from 'next/server';
import { apiRouteRequiresAdmin, isAdminAuthenticated } from '@/lib/admin-auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (!apiRouteRequiresAdmin(pathname, method)) {
    return NextResponse.next();
  }

  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
